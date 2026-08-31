import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/public/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Riya Travels — Scooters, Bikes & Cars on Rent",
  description:
    "Rent scooters, bikes, and cars at affordable hourly and daily rates. Quick booking, verified documents, instant confirmation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-gray-200 bg-white py-8 mt-12">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Riya Travels. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
