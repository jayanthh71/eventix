import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    const totalEvents = await prisma.event.count({
      where: {
        vendorId: userId,
      },
    });

    const bookingStats = await prisma.booking.aggregate({
      where: {
        event: {
          vendorId: userId,
        },
        status: "CONFIRMED",
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
    });

    const totalAttendees = bookingStats._sum.quantity || 0;
    const totalRevenue = bookingStats._sum.totalPrice || 0;

    return NextResponse.json(
      {
        totalEvents,
        totalAttendees,
        totalRevenue,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor stats" },
      { status: 500 },
    );
  }
}
