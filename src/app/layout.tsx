import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoClean - Aplikasi Pengelolaan Sampah",
  description: "Aplikasi untuk memudahkan penjemputan dan penjualan sampah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-green-50`}
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-green-50">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
