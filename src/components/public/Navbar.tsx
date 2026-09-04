"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) close();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [close]);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#C99A4A]/40 bg-gradient-to-r from-[#16233F] via-[#1E2C4F] to-[#16233F]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center" aria-label="Riya Travels home">
          <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-white/20">
            <Image
              src="/rt.webp"
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
          <Link href="/" className="py-2 text-sm font-medium text-gray-100 transition-colors hover:text-gold-400">
            Home
          </Link>
          <Link href="/#vehicles" className="py-2 text-sm font-medium text-gray-100 transition-colors hover:text-gold-400">
            Vehicles
          </Link>
          <Link href="/about" className="py-2 text-sm font-medium text-gray-100 transition-colors hover:text-gold-400">
            About
          </Link>
          <Link href="/contact" className="py-2 text-sm font-medium text-gray-100 transition-colors hover:text-gold-400">
            Contact
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-lg text-white active:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 top-16 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      {/* Mobile menu panel */}
      <div
        className={`fixed top-16 right-0 z-50 w-72 max-w-[85vw] border-t border-[#C99A4A]/30 bg-gradient-to-b from-[#16233F] via-[#1E2C4F] to-[#16233F] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 space-y-1">
          {[
            { href: "/", label: "Home" },
            { href: "/#vehicles", label: "Vehicles" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-100 hover:bg-white/10 active:bg-white/15 transition-colors min-h-[44px] flex items-center"
              onClick={close}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
