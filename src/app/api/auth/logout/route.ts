import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  (await cookies()).set("token", "", {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 },
  );
}
