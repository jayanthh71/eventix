import prisma from "@/lib/prisma";
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

    const topEventsByRevenue = await prisma.event.findMany({
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bookings: {
          where: {
            status: "CONFIRMED",
          },
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: "CONFIRMED",
              },
            },
          },
        },
      },
    });

    const eventsWithStats = topEventsByRevenue
      .map((event) => {
        const totalRevenue = event.bookings.reduce(
          (sum, booking) => sum + booking.totalPrice,
          0,
        );
        const totalBookings = event._count.bookings;

        return {
          ...event,
          totalRevenue,
          totalBookings,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    const totalUsers = await prisma.user.count({
      where: {
        role: {
          in: ["CUSTOMER", "VENDOR"],
        },
      },
    });

    const totalEvents = await prisma.event.count();

    const totalBookings = await prisma.booking.count({
      where: {
        status: "CONFIRMED",
      },
    });

    const totalRevenue = await prisma.booking.aggregate({
      where: {
        status: "CONFIRMED",
      },
      _sum: {
        totalPrice: true,
      },
    });

    const recentBookings = await prisma.booking.findMany({
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        train: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const vendorStats = await prisma.user.findMany({
      where: {
        role: "VENDOR",
      },
      include: {
        vendorEvents: {
          include: {
            bookings: {
              where: {
                status: "CONFIRMED",
              },
            },
            _count: {
              select: {
                bookings: {
                  where: {
                    status: "CONFIRMED",
                  },
                },
              },
            },
          },
        },
      },
    });

    const vendorPerformance = vendorStats
      .map((vendor) => {
        const totalRevenue = vendor.vendorEvents.reduce((vendorSum, event) => {
          return (
            vendorSum +
            event.bookings.reduce((eventSum, booking) => {
              return eventSum + booking.totalPrice;
            }, 0)
          );
        }, 0);

        const totalBookings = vendor.vendorEvents.reduce((sum, event) => {
          return sum + event._count.bookings;
        }, 0);

        const totalEvents = vendor.vendorEvents.length;

        return {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          totalRevenue,
          totalBookings,
          totalEvents,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return NextResponse.json({
      topEvents: eventsWithStats,
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
      },
      recentBookings,
      vendorPerformance,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
