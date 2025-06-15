import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, number, from, to, arrival, departure, price, imageUrl } = body;

  if (!name || !number || !from || !to || !arrival || !departure || !price) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  if (isNaN(Date.parse(arrival)) || new Date(arrival) <= new Date()) {
    return NextResponse.json(
      { error: "Invalid arrival date" },
      { status: 400 },
    );
  }

  if (isNaN(Date.parse(departure)) || new Date(departure) <= new Date()) {
    return NextResponse.json(
      { error: "Invalid departure date" },
      { status: 400 },
    );
  }

  if (price <= 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  try {
    const newTrain = await prisma.train.create({
      data: {
        name,
        number,
        from,
        to,
        arrival: new Date(arrival),
        departure: new Date(departure),
        price,
        imageUrl,
      },
    });

    if (!newTrain) {
      return NextResponse.json(
        { error: "Failed to create train" },
        { status: 500 },
      );
    }

    return NextResponse.json(newTrain, { status: 201 });
  } catch (error) {
    console.error("Error creating train:", error);
    return NextResponse.json(
      { error: "Failed to create train" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Train ID is required" },
      { status: 400 },
    );
  }

  try {
    const deletedTrain = await prisma.train.delete({
      where: { id },
    });

    if (!deletedTrain) {
      return NextResponse.json({ error: "Train not found" }, { status: 404 });
    }

    return NextResponse.json(deletedTrain, { status: 200 });
  } catch (error) {
    console.error("Error deleting train:", error);
    return NextResponse.json(
      { error: "Failed to delete train" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const take = parseInt(searchParams.get("take") || "50");

  if (id) {
    try {
      const train = await prisma.train.findUnique({
        where: { id },
      });

      if (!train) {
        return NextResponse.json({ error: "Train not found" }, { status: 404 });
      }

      return NextResponse.json([train], { status: 200 });
    } catch (error) {
      console.error("Error fetching train by ID:", error);
      return NextResponse.json(
        { error: "Failed to fetch train" },
        { status: 500 },
      );
    }
  }

  try {
    const trains = await prisma.train.findMany({
      orderBy: { departure: "asc" },
      take: Math.min(take, 100),
    });

    return NextResponse.json(trains, { status: 200 });
  } catch (error) {
    console.error("Error fetching trains:", error);
    return NextResponse.json(
      { error: "Failed to fetch trains" },
      { status: 500 },
    );
  }
}
