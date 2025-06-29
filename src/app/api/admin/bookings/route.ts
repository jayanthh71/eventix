import prisma from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

async function getCurrentUser(request: NextRequest) {
  try {
    const authResponse = await fetch(new URL("/api/auth/me", request.url), {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!authResponse.ok) {
      return null;
    }

    const user = await authResponse.json();
    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    const where: {
      eventId?: string;
      userId?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
      status?: BookingStatus;
    } = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (status) {
      where.status = status as BookingStatus;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        event: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        train: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
