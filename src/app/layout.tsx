import Header from "@/components/layout/Header";
import type { Metadata } from "next";
import { Anek_Latin, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const anek = Anek_Latin({
  subsets: ["latin"],
  variable: "--font-anek-latin",
});

export const metadata: Metadata = {
  title: "Eventix",
  description: "One place for all your tickets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${anek.variable} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
