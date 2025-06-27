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

    const { paymentIntentId, time } = await request.json();

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

    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        event: true,
        train: true,
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 },
    );
  }
}
