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
    const { eventId, trainId, quantity, totalPrice, time } = body;

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
        select: { price: true },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      itemPrice = event.price;
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

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          eventId: eventId || null,
          trainId: trainId || null,
          quantity,
          totalPrice,
          time: new Date(time),
          status: "CONFIRMED",
          paymentMethod: "WALLET",
        },
        include: {
          event: true,
          train: true,
        },
      });

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
