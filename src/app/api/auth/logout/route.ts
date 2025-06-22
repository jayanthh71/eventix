import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  (await cookies()).set("token", "", {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.redirect(
    process.env.FRONTEND_URL || "http://localhost:3000",
  );
}
