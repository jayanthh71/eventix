import { deleteImageFromS3 } from "@/lib/s3";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    const deleted = await deleteImageFromS3(imageUrl);

    if (deleted) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to delete image from S3" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in delete event image API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
