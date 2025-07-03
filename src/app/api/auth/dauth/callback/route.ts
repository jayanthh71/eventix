import prisma from "@/lib/prisma";
import { AuthMethod, Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    if (!process.env.DAUTH_ID || !process.env.DAUTH_SECRET) {
      return NextResponse.json(
        { error: "DAuth credentials are not set" },
        { status: 500 },
      );
    }

    const response = await fetch(
      "https://auth.delta.nitt.edu/api/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.DAUTH_ID,
          client_secret: process.env.DAUTH_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}/api/auth/dauth/callback`,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to exchange code for token" },
        { status: response.status },
      );
    }

    const data = await response.json();
    const token = data.access_token;

    const userResponse = await fetch(
      "https://auth.delta.nitt.edu/api/resources/user",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!userResponse.ok) {
      const userError = await userResponse.json();
      return NextResponse.json(
        { error: userError.error || "Failed to fetch user data" },
        { status: userResponse.status },
      );
    }

    const user = await userResponse.json();
    const { id, name, email } = user;

    try {
      const userExists = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!userExists) {
        const newUser = await prisma.user.create({
          data: {
            name,
            email: email.toLowerCase(),
            role: Role.CUSTOMER,
            DAuthId: id.toString(),
            authMethod: AuthMethod.DAUTH,
          },
        });

        if (!newUser) {
          return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 },
          );
        }
      }

      const DAuthUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      });

      if (!DAuthUser) {
        return NextResponse.json(
          { error: "Failed to retrieve user data" },
          { status: 500 },
        );
      }

      if (!process.env.JWT_SECRET) {
        return NextResponse.json(
          { error: "JWT secret is not configured" },
          { status: 500 },
        );
      }

      const token = jwt.sign(
        { id: DAuthUser.id, email: DAuthUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      (await cookies()).set("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.redirect(
        process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
      );
    } catch (error) {
      console.error("Database error details:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } catch (error) {
    console.error("DAuth error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate user" },
      { status: 500 },
    );
  }
}
