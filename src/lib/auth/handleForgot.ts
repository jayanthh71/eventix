import generateResetToken from "@/lib/auth/generateResetToken";
import nodemailer from "nodemailer";

export default async function handleForgot(email: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Eventix" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Eventix Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password for your Eventix account.</p
        <p>If you did not request this, please ignore this email.</p>
        <p>To reset your password, please click the link below:</p>
        <p><a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/reset?token=${await generateResetToken(email)}">Reset Password</a></p>
      `,
    });
  } catch (err) {
    console.error(`Failed to send email to ${email}:`, err);
  }
}
