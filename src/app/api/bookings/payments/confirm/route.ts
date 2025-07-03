import prisma from "@/lib/prisma";
import { BookingStatus, PaymentMethod } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "JWT secret is not configured" },
        { status: 500 },
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reqBody = await request.json();
    const { paymentIntentId, time, location, seatIds, date } = reqBody;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 },
      );
    }

    if (paymentIntent.metadata.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized payment" },
        { status: 403 },
      );
    }

    if (!time) {
      return NextResponse.json(
        { error: "Time parameter is required" },
        { status: 400 },
      );
    }

    const bookingData: {
      userId: string;
      quantity: number;
      totalPrice: number;
      time: Date;
      status: BookingStatus;
      paymentMethod: PaymentMethod;
      paymentIntentId: string;
      eventId?: string;
      trainId?: string;
      location?: string;
      seatIds?: string[];
    } = {
      userId: userId,
      quantity: parseInt(paymentIntent.metadata.quantity),
      totalPrice: paymentIntent.amount / 100,
      time: new Date(time),
      status: BookingStatus.CONFIRMED,
      paymentMethod: PaymentMethod.STRIPE,
      paymentIntentId: paymentIntent.id,
    };

    if (paymentIntent.metadata.eventId) {
      bookingData.eventId = paymentIntent.metadata.eventId;
    }
    if (paymentIntent.metadata.trainId) {
      bookingData.trainId = paymentIntent.metadata.trainId;
    }
    if (location) {
      bookingData.location = location;
    } else if (paymentIntent.metadata.location) {
      bookingData.location = paymentIntent.metadata.location;
    }

    let finalSeatIds: string[] | undefined = undefined;
    if (seatIds && Array.isArray(seatIds)) {
      finalSeatIds = seatIds;
    } else if (paymentIntent.metadata.seatIds) {
      finalSeatIds = paymentIntent.metadata.seatIds.split(",");
    }

    const eventId = bookingData.eventId || paymentIntent.metadata.eventId;
    const bookingDate = date || undefined;
    const bookingLocation =
      location || paymentIntent.metadata.location || undefined;

    if (
      eventId &&
      finalSeatIds &&
      Array.isArray(finalSeatIds) &&
      finalSeatIds.length > 0
    ) {
      if (finalSeatIds.length !== bookingData.quantity) {
        return NextResponse.json(
          { error: "Number of selected seats does not match quantity" },
          { status: 400 },
        );
      }
      const seats = await prisma.seat.findMany({
        where: {
          row: {
            in: finalSeatIds.map((seatId) => seatId.split("-")[0]),
          },
          number: {
            in: finalSeatIds.map((seatId) => Number(seatId.split("-")[1])),
          },
          eventId,
          date: bookingDate ? new Date(bookingDate) : undefined,
          location: bookingLocation,
        },
      });
      if (seats.length > 0) {
        return NextResponse.json(
          { error: "One or more selected seats are already booked" },
          { status: 400 },
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: bookingData,
        include: {
          event: true,
          train: true,
          user: true,
        },
      });

      if (
        eventId &&
        finalSeatIds &&
        Array.isArray(finalSeatIds) &&
        finalSeatIds.length > 0
      ) {
        const seatCreates = finalSeatIds.map((seatId) => {
          const [row, number] = seatId.split("-");
          // Ensure row is always a letter
          const rowLetter = /^[A-Z]$/.test(row)
            ? row
            : String.fromCharCode(64 + Number(row));
          const seatData: {
            eventId: string;
            location: string;
            date: Date;
            showtime: Date;
            row: string;
            number: number;
            bookingId: string;
          } = {
            eventId,
            location: bookingLocation,
            date: new Date(time),
            showtime: new Date(time),
            row: rowLetter,
            number: Number(number),
            bookingId: booking.id,
          };

          return tx.seat.create({
            data: seatData,
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
            room: `${eventId}_${time}_${location}`,
            seatIds,
          }),
        },
      );

      return booking;
    });

    return NextResponse.json({
      success: true,
      booking: result,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 },
    );
  }
}
