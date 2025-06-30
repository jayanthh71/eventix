import prisma from "@/lib/prisma";
import { deleteImageFromS3 } from "@/lib/s3";
import { EventCategory } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    let userId: string | null = null;

    if (cookieHeader) {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          cookie: cookieHeader,
        },
      });

      if (response.ok) {
        const user = await response.json();
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      date,
      showtimes,
      location,
      price,
      category,
      dateArr,
      locationArr,
    } = body;

    if (
      !title ||
      !description ||
      !(location || locationArr) ||
      !price ||
      !category
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const categoryUpper = category.toUpperCase();
    if (categoryUpper !== "MOVIE" && categoryUpper !== "CONCERT") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Validate date and showtimes based on category
    if (categoryUpper === "MOVIE") {
      if (
        !dateArr ||
        !Array.isArray(dateArr) ||
        dateArr.length === 0 ||
        !locationArr ||
        !Array.isArray(locationArr) ||
        locationArr.length === 0
      ) {
        return NextResponse.json(
          { error: "Dates and locations are required for movies" },
          { status: 400 },
        );
      }

      // Validate each date
      for (const d of dateArr) {
        if (isNaN(Date.parse(d)) || new Date(d) <= new Date()) {
          return NextResponse.json(
            { error: "Invalid date in dateArr - must be in the future" },
            { status: 400 },
          );
        }
      }
    } else if (categoryUpper === "CONCERT") {
      if (!date || isNaN(Date.parse(date)) || new Date(date) <= new Date()) {
        return NextResponse.json(
          { error: "Valid future date is required for concerts" },
          { status: 400 },
        );
      }

      if (!location) {
        return NextResponse.json(
          { error: "Location is required for concerts" },
          { status: 400 },
        );
      }
    }

    if (price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // Prepare event data based on category
    let eventData;

    if (categoryUpper === "MOVIE") {
      eventData = {
        title,
        description,
        imageUrl,
        date: new Date(dateArr[0]), // Set the main date to the first date
        dateArr: dateArr.map((d: string) => new Date(d)),
        locationArr: locationArr,
        location: locationArr[0], // Set main location to the first location
        price: parseFloat(price),
        category: EventCategory.MOVIE,
        vendorId: userId,
        showtimes: showtimes ? showtimes.map((s: string) => new Date(s)) : [],
      };
    } else {
      eventData = {
        title,
        description,
        imageUrl,
        date: new Date(date),
        location, // Ensure location is set for concerts
        price: parseFloat(price),
        category: EventCategory.CONCERT,
        vendorId: userId,
        showtimes: showtimes ? showtimes.map((s: string) => new Date(s)) : [],
        dateArr: [], // Empty array for concerts
        locationArr: [], // Empty array for concerts
      };
    }

    const newEvent = await prisma.event.create({
      data: eventData,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!newEvent) {
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 },
      );
    }

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const category = searchParams.get("category")?.toUpperCase() || "BOTH";
  const sortBy = searchParams.get("sortBy") || "date";
  const take = parseInt(searchParams.get("take") || "50");
  const vendor = searchParams.get("vendor") === "true";

  if (id) {
    try {
      const cookieHeader = request.headers.get("cookie");
      let userId: string | null = null;
      let userRole: string | null = null;

      if (cookieHeader) {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
          headers: {
            cookie: cookieHeader,
          },
        });

        if (response.ok) {
          const user = await response.json();
          userId = user.id;
          userRole = user.role;
        }
      }

      if (!userId) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }

      // For admin users, allow access to any event
      const whereClause =
        userRole === "ADMIN" ? { id: id } : { id: id, vendorId: userId };

      const event = await prisma.event.findUnique({
        where: whereClause,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        event,
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }

  if (vendor) {
    try {
      const cookieHeader = request.headers.get("cookie");
      let userId: string | null = null;

      if (cookieHeader) {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
          headers: {
            cookie: cookieHeader,
          },
        });

        if (response.ok) {
          const user = await response.json();
          userId = user.id;
        }
      }

      if (!userId) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }

      const events = await prisma.event.findMany({
        where: {
          vendorId: userId,
        },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortBy === "createdAt" ? "desc" : "asc",
        },
      });

      return NextResponse.json(events, { status: 200 });
    } catch (error) {
      console.error("Error fetching vendor events:", error);
      return NextResponse.json(
        { error: "Failed to fetch vendor events" },
        { status: 500 },
      );
    }
  }

  if (id) {
    try {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      return NextResponse.json([event], { status: 200 });
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      return NextResponse.json(
        { error: "Failed to fetch event" },
        { status: 500 },
      );
    }
  }

  if (sortBy !== "date" && sortBy !== "createdAt") {
    return NextResponse.json(
      { error: "sortBy must be 'date' or 'createdAt'" },
      { status: 400 },
    );
  }

  if (category !== "BOTH" && category !== "MOVIE" && category !== "CONCERT") {
    return NextResponse.json(
      { error: "category must be 'BOTH', 'MOVIE', or 'CONCERT'" },
      { status: 400 },
    );
  }

  try {
    const whereClause =
      category === "BOTH"
        ? {}
        : {
            category:
              category === "MOVIE"
                ? EventCategory.MOVIE
                : EventCategory.CONCERT,
          };

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortBy === "createdAt" ? "desc" : "asc",
      },
      take: Math.min(take, 100),
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    let userId: string | null = null;

    if (cookieHeader) {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          cookie: cookieHeader,
        },
      });

      if (response.ok) {
        const user = await response.json();
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { title, description, imageUrl, date, location, price, category } =
      body;

    if (!title || !description || !date || !location || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const existingEvent = await prisma.event.findUnique({
      where: {
        id: eventId,
        vendorId: userId,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const oldImageUrl = existingEvent.imageUrl;
    const newImageUrl = imageUrl || null;

    if (oldImageUrl && oldImageUrl !== newImageUrl) {
      try {
        await deleteImageFromS3(oldImageUrl);
        console.log(
          "Successfully deleted old event image from S3:",
          oldImageUrl,
        );
      } catch (error) {
        console.error("Failed to delete old event image from S3:", error);
      }
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        title,
        description,
        imageUrl: newImageUrl,
        date: eventDate,
        location,
        price: numericPrice,
        category: category || "CONCERT",
      },
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    let userId: string | null = null;
    let userRole: string | null = null;

    if (cookieHeader) {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          cookie: cookieHeader,
        },
      });

      if (response.ok) {
        const user = await response.json();
        userId = user.id;
        userRole = user.role;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    // For admin users, allow access to any event
    const whereClause =
      userRole === "ADMIN"
        ? { id: eventId }
        : { id: eventId, vendorId: userId };

    const existingEvent = await prisma.event.findUnique({
      where: whereClause,
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    if (existingEvent.imageUrl) {
      try {
        await deleteImageFromS3(existingEvent.imageUrl);
        console.log(
          "Successfully deleted event image from S3:",
          existingEvent.imageUrl,
        );
      } catch (error) {
        console.error("Failed to delete event image from S3:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID not provided" },
        { status: 400 },
      );
    }

    const cookieHeader = request.headers.get("cookie");
    let userId: string | null = null;
    let userRole: string | null = null;

    if (cookieHeader) {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          cookie: cookieHeader,
        },
      });

      if (response.ok) {
        const user = await response.json();
        userId = user.id;
        userRole = user.role;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (userRole !== "ADMIN" && existingEvent.vendorId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to edit this event" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      date,
      location,
      price,
      category,
      dates,
      locations,
      showtimes,
    } = body;

    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    let eventData;
    const categoryUpper = category.toUpperCase();

    if (categoryUpper === "MOVIE") {
      // Check if dates and locations arrays exist
      if (!dates || !Array.isArray(dates) || dates.length === 0) {
        return NextResponse.json(
          { error: "At least one date is required for movies" },
          { status: 400 },
        );
      }

      if (!locations || !Array.isArray(locations) || locations.length === 0) {
        return NextResponse.json(
          { error: "At least one location is required for movies" },
          { status: 400 },
        );
      }

      // Validate dates
      for (const d of dates) {
        if (isNaN(Date.parse(d))) {
          return NextResponse.json(
            { error: "Invalid date format in dates array" },
            { status: 400 },
          );
        }
      }

      // Process showtimes
      let processedShowtimes: Date[] = [];
      if (Array.isArray(showtimes) && showtimes.length > 0) {
        processedShowtimes = showtimes.map((s: string) => new Date(s));
      }

      eventData = {
        title,
        description,
        imageUrl,
        date: new Date(dates[0]), // Set the main date to the first date
        dateArr: dates.map((d: string) => new Date(d)),
        locationArr: locations,
        location: locations[0], // Set main location to the first location
        price: parseFloat(price),
        category: EventCategory.MOVIE,
        showtimes: processedShowtimes,
      };
    } else {
      // For concert
      if (!date || isNaN(Date.parse(date))) {
        return NextResponse.json(
          { error: "Valid date is required for concerts" },
          { status: 400 },
        );
      }

      if (!location) {
        return NextResponse.json(
          { error: "Location is required for concerts" },
          { status: 400 },
        );
      }

      eventData = {
        title,
        description,
        imageUrl,
        date: new Date(date),
        location,
        price: parseFloat(price),
        category: EventCategory.CONCERT,
        showtimes: [], // Concerts don't use showtimes
        dateArr: [], // Empty array for concerts
        locationArr: [], // Empty array for concerts
      };
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: eventData,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
