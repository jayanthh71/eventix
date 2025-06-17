import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handleReset(token: string, newPassword: string) {
  try {
    const tokenRecord = await prisma?.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new Error("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma?.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    });

    await prisma?.passwordResetToken.delete({
      where: { token },
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    throw new Error("Failed to reset password");
  }
}
