import prisma from "@/lib/prisma";
import crypto from "crypto";

export default async function generateResetToken(email: string) {
  try {
    const user = await prisma?.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000);

    await prisma?.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });
    return token;
  } catch (error) {
    console.error("Error generating reset token:", error);
    throw new Error("Failed to generate reset token");
  }
}
