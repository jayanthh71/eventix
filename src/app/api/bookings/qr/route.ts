import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      data[key] = value;
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error processing QR data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
