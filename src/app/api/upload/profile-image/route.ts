import prisma from "@/lib/prisma";
import { deleteImageFromS3, uploadImageToS3, validateS3Config } from "@/lib/s3";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const s3Config = validateS3Config();
    if (!s3Config.valid) {
      return NextResponse.json(
        {
          error: `AWS S3 configuration incomplete. Missing: ${s3Config.missing.join(", ")}`,
        },
        { status: 500 },
      );
    }

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

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
        },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { imageUrl: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const imageUrl = await uploadImageToS3(file, userId);

    if (currentUser.imageUrl) {
      try {
        await deleteImageFromS3(currentUser.imageUrl);
      } catch (error) {
        console.error("Failed to delete old profile image:", error);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { imageUrl },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
