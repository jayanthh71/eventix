import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventix",
  description: "One place for all your events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
