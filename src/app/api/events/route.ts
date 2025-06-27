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
    const { title, description, imageUrl, date, location, price, category } =
      body;

    if (!title || !description || !date || !location || !price || !category) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (isNaN(Date.parse(date)) || new Date(date) <= new Date()) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    if (price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const categoryUpper = category.toUpperCase();
    if (categoryUpper !== "MOVIE" && categoryUpper !== "CONCERT") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        imageUrl,
        date: new Date(date),
        location,
        price: parseFloat(price),
        category:
          categoryUpper === "MOVIE"
            ? EventCategory.MOVIE
            : EventCategory.CONCERT,
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

      const event = await prisma.event.findUnique({
        where: {
          id: id,
          vendorId: userId,
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

    const existingEvent = await prisma.event.findUnique({
      where: {
        id: eventId,
        vendorId: userId,
      },
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
