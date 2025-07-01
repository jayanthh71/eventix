import prisma from "@/lib/prisma";
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

    const {
      amount,
      eventId,
      trainId,
      quantity,
      time,
      location,
      seatIds,
      date,
      showtime,
    } = await request.json();

    if (!time) {
      return NextResponse.json(
        { error: "Time parameter is required" },
        { status: 400 },
      );
    }

    if (!eventId && !trainId) {
      return NextResponse.json(
        { error: "Either eventId or trainId is required" },
        { status: 400 },
      );
    }

    const amountInPaise = Math.round(amount * 100);

    const metadata: {
      quantity: string;
      userId: string;
      time: string;
      eventId?: string;
      trainId?: string;
      location?: string;
      seatIds?: string;
      date?: string;
      showtime?: string;
    } = {
      quantity: quantity.toString(),
      userId: user.id,
      time: time,
    };

    if (eventId) {
      metadata.eventId = eventId;
    }
    if (trainId) {
      metadata.trainId = trainId;
    }
    if (location) {
      metadata.location = location;
    }
    if (seatIds && Array.isArray(seatIds)) {
      metadata.seatIds = seatIds.join(",");
    }
    if (date) {
      metadata.date = date;
    }
    if (showtime) {
      metadata.showtime = showtime;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: "inr",
      metadata,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 },
    );
  }
}
