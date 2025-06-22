import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.DAUTH_ID) {
      return NextResponse.json(
        { error: "DAuth client ID is not set in environment variables" },
        { status: 500 },
      );
    }

    const params = new URLSearchParams({
      client_id: process.env.DAUTH_ID,
      redirect_uri: `${process.env.FRONTEND_URL || "http://localhost:3000"}/api/auth/dauth/callback`,
      response_type: "code",
      scope: "user",
    });

    const authUrl = `https://auth.delta.nitt.edu/authorize?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("DAuth error:", error);
    return NextResponse.json(
      { error: "Failed to initiate DAuth authentication" },
      { status: 500 },
    );
  }
}
