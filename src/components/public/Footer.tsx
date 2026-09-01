import { Facebook, Instagram, Twitter, Phone, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-700 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="overflow-hidden rounded-xl bg-white p-1.5 shadow-sm">
                <Image
                  src="/rt_logo.jpeg"
                  alt="Riya Travels"
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-lg"
                />
              </div>
              <span className="text-2xl font-bold text-white">
                Riya<span className="text-gold-400">Travels</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm">
              Your trusted partner for affordable vehicle rentals
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-gold-400">
                  Home
                </Link>
              </li>
              <li>
                <a href="#vehicles" className="transition-colors hover:text-gold-400">
                  Vehicles
                </a>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-gold-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-gold-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gold-400" />
                <a
                  href="https://wa.me/91XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold-400"
                >
                  +91 XXXXX XXXXX
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-gold-400" />
                <a
                  href="mailto:scooty.riyatravels@gmail.com"
                  className="transition-colors hover:text-gold-400"
                >
                  scooty.riyatravels@gmail.com
                </a>
              </li>
              <li className="pt-2">
                <ul className="flex items-center gap-3">
                  <li>
                    <a
                      href="#"
                      aria-label="Facebook"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-600 text-white transition-colors hover:bg-gold-400 hover:text-navy-700"
                    >
                      <Facebook size={16} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      aria-label="Instagram"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-600 text-white transition-colors hover:bg-gold-400 hover:text-navy-700"
                    >
                      <Instagram size={16} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      aria-label="Twitter"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-600 text-white transition-colors hover:bg-gold-400 hover:text-navy-700"
                    >
                      <Twitter size={16} />
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-600">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-gray-400">
          © {year} Riya Travels. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
