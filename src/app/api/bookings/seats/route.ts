import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }
  try {
    const seats = await prisma.seat.findMany({
      where: { bookingId },
      select: { row: true, number: true },
      orderBy: [{ row: "asc" }, { number: "asc" }],
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
