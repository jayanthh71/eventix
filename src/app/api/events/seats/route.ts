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
  let combinedShowtimeISO = showtime;
  if (date && showtime) {
    const dateObj = new Date(date);
    const timeObj = new Date(showtime);
    dateObj.setHours(timeObj.getHours(), timeObj.getMinutes(), 0, 0);
    combinedShowtimeISO = dateObj.toISOString();
  }
  try {
    const seats = await prisma.seat.findMany({
      where: {
        eventId,
        location,
        showtime: new Date(combinedShowtimeISO),
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
