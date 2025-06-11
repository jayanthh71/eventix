import prisma from "@/lib/prisma";
import { EventCategory } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

  try {
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        imageUrl,
        date: new Date(date),
        location,
        price,
        category:
          categoryUpper === "MOVIE"
            ? EventCategory.MOVIE
            : EventCategory.CONCERT,
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
  const category = request.nextUrl.searchParams.get("category")?.toUpperCase();

  if (!category || (category !== "MOVIE" && category !== "CONCERT")) {
    return NextResponse.json(
      { error: "Invalid or missing category" },
      { status: 400 },
    );
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        category:
          category === "MOVIE" ? EventCategory.MOVIE : EventCategory.CONCERT,
      },
      orderBy: { date: "asc" },
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

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Event ID is required" },
      { status: 400 },
    );
  }

  try {
    const deletedEvent = await prisma.event.delete({
      where: { id },
    });

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(deletedEvent, { status: 200 });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
