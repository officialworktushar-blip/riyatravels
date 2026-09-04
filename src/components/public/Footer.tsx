import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from "lucide-react";
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
                  src="/rt.webp"
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
            <ul className="mt-4 space-y-1 text-sm">
              <li>
                <Link href="/" className="block rounded-lg px-2 py-2 transition-colors hover:text-gold-400 min-h-[44px] flex items-center">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#vehicles" className="block rounded-lg px-2 py-2 transition-colors hover:text-gold-400 min-h-[44px] flex items-center">
                  Vehicles
                </Link>
              </li>
              <li>
                <Link href="/about" className="block rounded-lg px-2 py-2 transition-colors hover:text-gold-400 min-h-[44px] flex items-center">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="block rounded-lg px-2 py-2 transition-colors hover:text-gold-400 min-h-[44px] flex items-center">
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
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="https://wa.me/918490048239"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:text-gold-400 min-h-[44px]"
                >
                  <Phone size={16} className="text-gold-400 shrink-0" />
                  <span>+91 84900 48239</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:scooty.riyatravels@gmail.com"
                  className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:text-gold-400 min-h-[44px]"
                >
                  <Mail size={16} className="text-gold-400 shrink-0" />
                  <span className="break-all">scooty.riyatravels@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps?q=21,+Nr.+Pratapnagar+Bridge,+Lalbaug+Road,+Pratapnagar,+Vadodara,+Gujarat,+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:text-gold-400 min-h-[44px]"
                >
                  <MapPin size={16} className="text-gold-400 shrink-0" />
                  <span>21, Nr. Pratapnagar Bridge, Vadodara</span>
                </a>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-3">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-600 text-white transition-colors hover:bg-gold-400 hover:text-navy-700"
                  >
                    <Facebook size={16} />
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-600 text-white transition-colors hover:bg-gold-400 hover:text-navy-700"
                  >
                    <Instagram size={16} />
                  </a>
                  <a
                    href="#"
                    aria-label="Twitter"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-600 text-white transition-colors hover:bg-gold-400 hover:text-navy-700"
                  >
                    <Twitter size={16} />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-600">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-gray-400">
          &copy; {year} Riya Travels. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
