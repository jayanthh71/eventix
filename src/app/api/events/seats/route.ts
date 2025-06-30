import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const date = searchParams.get("date");
  const location = searchParams.get("location");
  const showtime = searchParams.get("showtime");
  if (!eventId || !date || !location || !showtime) {
    return NextResponse.json(
      { error: "Missing eventId, date, location, or showtime" },
      { status: 400 },
    );
  }
  try {
    const seats = await prisma.seat.findMany({
      where: {
        eventId,
        date,
        location,
        showtime: new Date(showtime),
      },
      select: {
        row: true,
        number: true,
      },
    });
    return NextResponse.json({ seats });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch seats" },
      { status: 500 },
    );
  }
}
