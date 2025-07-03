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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      eventId,
      trainId,
      quantity,
      totalPrice,
      time,
      date,
      location,
      showtime,
      seatIds,
    } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    if (!totalPrice || totalPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid total price" },
        { status: 400 },
      );
    }

    if (!eventId && !trainId) {
      return NextResponse.json(
        { error: "Either eventId or trainId is required" },
        { status: 400 },
      );
    }

    if (eventId && trainId) {
      return NextResponse.json(
        { error: "Cannot book both event and train simultaneously" },
        { status: 400 },
      );
    }

    let itemPrice: number;
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          price: true,
          category: true,
          dateArr: true,
          locationArr: true,
          showtimes: true,
        },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      itemPrice = event.price;

      // Validate location for movies (should be one of the locations in locationArr)
      if (event.category === "MOVIE" && location) {
        if (
          event.locationArr.length > 0 &&
          !event.locationArr.includes(location)
        ) {
          return NextResponse.json(
            { error: "Invalid location for this event" },
            { status: 400 },
          );
        }
      }

      if (event.category === "MOVIE" && time) {
        if (event.showtimes.length > 0) {
          const timeDate = new Date(time);
          const matchedShowtime = event.showtimes.find((showtime) => {
            const showtimeDate = new Date(showtime);
            return (
              showtimeDate.getHours() === timeDate.getHours() &&
              showtimeDate.getMinutes() === timeDate.getMinutes()
            );
          });

          if (!matchedShowtime) {
            return NextResponse.json(
              {
                error:
                  "Invalid time for this event, must match an available showtime",
              },
              { status: 400 },
            );
          }
        }
      } else if (event.category === "MOVIE" && !time) {
        return NextResponse.json(
          { error: "Time is required for movie bookings" },
          { status: 400 },
        );
      }

      // Validate seatIds for movies
      if (seatIds && Array.isArray(seatIds) && seatIds.length > 0) {
        if (seatIds.length !== quantity) {
          return NextResponse.json(
            { error: "Number of selected seats does not match quantity" },
            { status: 400 },
          );
        }
        const seats = await prisma.seat.findMany({
          where: {
            row: {
              in: seatIds.map((seatId: string) => seatId.split("-")[0]),
            },
            number: {
              in: seatIds.map((seatId: string) => Number(seatId.split("-")[1])),
            },
            eventId,
            date,
            location,
          },
        });
        if (seats.length > 0) {
          return NextResponse.json(
            { error: "One or more selected seats are already booked" },
            { status: 400 },
          );
        }
      }
    } else {
      const train = await prisma.train.findUnique({
        where: { id: trainId },
        select: { price: true },
      });

      if (!train) {
        return NextResponse.json({ error: "Train not found" }, { status: 404 });
      }

      itemPrice = train.price;
    }

    const expectedTotal = itemPrice * quantity;
    if (Math.abs(totalPrice - expectedTotal) > 0.01) {
      return NextResponse.json(
        { error: "Invalid total price calculation" },
        { status: 400 },
      );
    }

    if ((user.balance ?? 0) < totalPrice) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 },
      );
    }

    // Combine date and showtime into a single Date object
    let combinedDateTime: Date | null = null;
    if (date && showtime) {
      const dateObj = new Date(date);
      const showtimeObj = new Date(showtime);
      dateObj.setHours(
        showtimeObj.getHours(),
        showtimeObj.getMinutes(),
        showtimeObj.getSeconds(),
        showtimeObj.getMilliseconds(),
      );
      combinedDateTime = dateObj;
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          eventId: eventId || null,
          trainId: trainId || null,
          quantity,
          totalPrice,
          time: (combinedDateTime ?? (time ? new Date(time) : null)) as Date,
          location: location || null,
          status: "CONFIRMED",
          paymentMethod: "WALLET",
        },
        include: {
          event: true,
          train: true,
        },
      });

      if (eventId && seatIds && Array.isArray(seatIds) && seatIds.length > 0) {
        const seatCreates = seatIds.map((seatId: string) => {
          const [row, number] = seatId.split("-");
          // Ensure row is always a letter
          const rowLetter = /^[A-Z]$/.test(row)
            ? row
            : String.fromCharCode(64 + Number(row));
          return tx.seat.create({
            data: {
              eventId,
              date: (date ? new Date(date) : null) as Date,
              location,
              showtime: (combinedDateTime ??
                (showtime ? new Date(showtime) : null)) as Date,
              row: rowLetter,
              number: Number(number),
              bookingId: booking.id,
            },
          });
        });
        await Promise.all(seatCreates);
      }

      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000"}/api/notify-booking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: `${eventId}_${combinedDateTime?.toISOString()}_${location}`,
            seatIds,
          }),
        },
      );

      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: totalPrice,
          },
        },
      });

      return booking;
    });

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: {
          id: bookingId,
          userId: user.id,
        },
        include: {
          event: true,
          train: true,
        },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(booking);
    } else {
      const bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          event: true,
          train: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(bookings);
    }
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, action } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 },
      );
    }

    if (action !== "cancel") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        userId: user.id,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
        include: {
          event: true,
          train: true,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            increment: booking.totalPrice,
          },
        },
      });

      await tx.seat.deleteMany({
        where: {
          bookingId: bookingId,
        },
      });

      return updatedBooking;
    });

    return NextResponse.json({
      message: "Booking cancelled successfully and refund processed",
      booking: result,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 },
    );
  }
}
