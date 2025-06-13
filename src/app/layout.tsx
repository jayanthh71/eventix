import Header from "@/components/layout/Header";
import { ReactQueryProvider } from "@/lib/react-query";
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
      <body
        className={`${inter.variable} ${anek.variable} flex min-h-screen flex-col antialiased`}
      >
        <ReactQueryProvider>
          <Header />
          <main className="flex-1 pt-20">{children}</main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
