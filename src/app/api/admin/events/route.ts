import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const events = await prisma.event.findMany({
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    let userRole: string | null = null;

    if (cookieHeader) {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          cookie: cookieHeader,
        },
      });

      if (response.ok) {
        const user = await response.json();
        userRole = user.role;
      }
    }

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
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
      dateArr,
      locationArr,
      showtimes,
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
        category: categoryUpper,
        vendorId: null, // Admin-created events have no vendor
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
        category: categoryUpper,
        vendorId: null, // Admin-created events have no vendor
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

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
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
    let userRole: string | null = null;

    if (cookieHeader) {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          cookie: cookieHeader,
        },
      });

      if (response.ok) {
        const user = await response.json();
        userRole = user.role;
      }
    }

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
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

    const categoryUpper = category.toUpperCase();
    if (categoryUpper !== "MOVIE" && categoryUpper !== "CONCERT") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    let eventData;
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
        category: categoryUpper,
        showtimes: processedShowtimes,
      };
    } else {
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
        category: categoryUpper,
        showtimes: [],
        dateArr: [],
        locationArr: [],
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
