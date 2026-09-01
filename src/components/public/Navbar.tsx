"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-navy-700">
            Riya<span className="text-gold-400">Travels</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-navy-600 hover:text-gold-400 transition-colors">
            Home
          </Link>
          <a href="#vehicles" className="text-sm font-medium text-navy-600 hover:text-gold-400 transition-colors">
            Vehicles
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-navy-600"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <Link
            href="/"
            className="block py-2 text-sm font-medium text-navy-600"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <a
            href="#vehicles"
            className="block py-2 text-sm font-medium text-navy-600"
            onClick={() => setMobileOpen(false)}
          >
            Vehicles
          </a>
        </div>
      )}
    </nav>
  );
}
