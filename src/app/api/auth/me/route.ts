import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Database error details:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const body = await request.json();
    const { email, name, password, currentPassword, imageUrl } = body;

    if (!email && !name && !password && !imageUrl) {
      return NextResponse.json(
        {
          error:
            "At least one field (email, name, password, imageUrl) must be provided",
        },
        { status: 400 },
      );
    }

    if (password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 },
        );
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.password,
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 },
        );
      }
    }

    const updateData: {
      email?: string;
      name?: string;
      password?: string;
      imageUrl?: string;
    } = {};

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 409 },
        );
      }

      updateData.email = email.toLowerCase();
    }

    if (name) {
      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: "Name must be at least 2 characters long" },
          { status: 400 },
        );
      }
      updateData.name = name.trim();
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 },
        );
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
