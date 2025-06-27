import generateResetToken from "@/lib/auth/generateResetToken";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";

export default async function handleForgot(email: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetToken = await generateResetToken(email);
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset?token=${resetToken}`;

  const htmlContent = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @font-face {
            font-family: "Anek Latin";
            src: url("https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;600;700&display=swap");
          }
          body {
            font-family: "Anek Latin", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }
          .header {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }
          .logo {
            width: 48px;
            height: 48px;
            margin-right: 15px;
          }
          .brand-name {
            font-family: "Anek Latin", sans-serif;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            font-family: "Anek Latin", sans-serif;
            letter-spacing: -0.3px;
          }
          .header p {
            margin: 15px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
            font-family: "Anek Latin", sans-serif;
            font-weight: 400;
          }
          .content {
            padding: 40px;
            font-family: "Anek Latin", sans-serif;
          }
          .content p {
            font-size: 16px;
            color: #374151;
            margin: 16px 0;
            line-height: 1.6;
          }
          .reset-section {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            font-family: "Anek Latin", sans-serif;
            letter-spacing: 0.3px;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }
          .reset-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
          }
          .footer p {
            font-size: 14px;
            color: #9ca3af;
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-section">
              <img src="cid:logo" alt="Eventix Logo" class="logo" />
              <h2 class="brand-name">Eventix</h2>
            </div>
            <h1>Password Reset Request</h1>
            <p>Secure your account with a new password</p>
          </div>

          <div class="content">
            <p>Hi there,</p>
            <p>
              We received a request to reset your password for your Eventix account.
              If you didn't request this, you can safely ignore this email.
            </p>

            <div class="reset-section">
              <p style="margin-bottom: 24px; font-weight: 500;">
                Click the button below to reset your password:
              </p>
              <a href="${resetUrl}" class="reset-button">
                Reset My Password
              </a>
            </div>

            <div class="footer">
              <p>
                If you're having trouble clicking the button, use the following link in your browser:
              </p>
              <a style="word-break: break-all; color: #6366f1; font-size: 12px;" href="${resetUrl}">
                ${resetUrl}
              </a>
            </div>
          </div> 
        </div>
      </body>
    </html>
  `;

  try {
    const mailOptions = {
      from: `"Eventix" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Eventix Password Reset Request",
      html: htmlContent,
      attachments: [] as Array<{
        filename: string;
        path?: string;
        content?: Buffer;
        contentType?: string;
        cid?: string;
      }>,
    };

    try {
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        mailOptions.attachments.push({
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        });
      }
    } catch (logoError) {
      console.error("Failed to attach logo:", logoError);
    }

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`Failed to send password reset email to ${email}:`, err);
  }
}
