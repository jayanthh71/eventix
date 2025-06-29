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
