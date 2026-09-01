"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#C99A4A]/40 bg-gradient-to-r from-[#16233F] via-[#1E2C4F] to-[#16233F]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center" aria-label="Riya Travels home">
          <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-white/20">
            <Image
              src="/rt_logo.webp"
              alt="Riya Travels"
              width={40}
              height={40}
              className="h-10 w-10 sm:h-11 sm:w-11"
              priority
            />
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-100 transition-colors hover:text-gold-400">
            Home
          </Link>
          <a href="#vehicles" className="text-sm font-medium text-gray-100 transition-colors hover:text-gold-400">
            Vehicles
          </a>
          <Link href="/about" className="text-sm font-medium text-gray-100 transition-colors hover:text-gold-400">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium text-gray-100 transition-colors hover:text-gold-400">
            Contact
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#C99A4A]/30 bg-gradient-to-r from-[#16233F] via-[#1E2C4F] to-[#16233F] px-4 pb-4 pt-2 md:hidden">
          <Link
            href="/"
            className="block py-2 text-sm font-medium text-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <a
            href="#vehicles"
            className="block py-2 text-sm font-medium text-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Vehicles
          </a>
          <Link
            href="/about"
            className="block py-2 text-sm font-medium text-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block py-2 text-sm font-medium text-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}