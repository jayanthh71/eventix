import prisma from "@/lib/prisma";
import { deleteImageFromS3 } from "@/lib/s3";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    // Authenticate user
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

    // Delete from S3
    const deleted = await deleteImageFromS3(imageUrl);

    if (deleted) {
      // Remove imageUrl from user in DB
      await prisma.user.update({
        where: { id: userId },
        data: { imageUrl: null },
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to delete image from S3" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in delete profile image API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
