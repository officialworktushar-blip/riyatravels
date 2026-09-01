import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
} from "lucide-react";

export const metadata = {
  title: "Contact Us — Riya Travels",
  description:
    "Get in touch with Riya Travels. Chat with us on WhatsApp, drop us an email, or find our location and business hours.",
};

const HOURS = [
  { day: "Monday", hours: "8:00 AM – 8:00 PM" },
  { day: "Tuesday", hours: "8:00 AM – 8:00 PM" },
  { day: "Wednesday", hours: "8:00 AM – 8:00 PM" },
  { day: "Thursday", hours: "8:00 AM – 8:00 PM" },
  { day: "Friday", hours: "8:00 AM – 8:00 PM" },
  { day: "Saturday", hours: "9:00 AM – 6:00 PM" },
  { day: "Sunday", hours: "9:00 AM – 6:00 PM" },
];

const WA_NUMBER = "91XXXXXXXXXX";

export default function ContactPage() {
  return (
    <div>
      {/* Hero banner */}
      <section className="relative aspect-[4/3] w-full overflow-hidden bg-navy-700 sm:aspect-[16/9]">
        <Image
          src="/contact-hero.webp"
          alt="Contact Riya Travels"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="relative flex h-full w-full items-center justify-center px-4 text-center">
          <div className="max-w-3xl rounded-2xl bg-[#16233F]/60 px-6 py-6 shadow-lg backdrop-blur-sm sm:px-10 sm:py-8">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Get in <span className="text-gold-400">Touch</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-100 sm:text-xl">
              Questions about a booking, a vehicle, or your ride? We're one message
              away — reach us on WhatsApp or email.
            </p>
          </div>
        </div>
      </section>

      {/* Contact details */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {/* WhatsApp */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <MessageCircle size={26} />
            </div>
            <h2 className="text-lg font-semibold text-navy-700">WhatsApp</h2>
            <p className="mt-2 text-sm text-gray-500">Fastest way to reach us</p>
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-5 w-full"
            >
              <Phone size={16} className="mr-1" /> Chat on WhatsApp
            </a>
          </div>

          {/* Email */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-500">
              <Mail size={26} />
            </div>
            <h2 className="text-lg font-semibold text-navy-700">Email</h2>
            <p className="mt-2 text-sm text-gray-500">For bookings &amp; enquiries</p>
            <a
              href="mailto:scooty.riyatravels@gmail.com"
              className="mt-5 inline-block font-medium text-gold-500 hover:underline"
            >
              scooty.riyatravels@gmail.com
            </a>
          </div>

          {/* Address */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-100 text-navy-700">
              <MapPin size={26} />
            </div>
            <h2 className="text-lg font-semibold text-navy-700">Location</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Your town, your street —<br />
              <span className="text-gray-400">(exact address coming soon)</span>
            </p>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex h-72 items-center justify-center bg-[#E8EBF0] sm:h-96">
            <div className="px-6 text-center">
              <MapPin size={40} className="mx-auto text-gold-500" />
              <p className="mt-4 font-semibold text-navy-700">Our Location</p>
              <p className="mt-1 text-sm text-gray-500">
                Interactive map coming soon — you'll find us right in town, easy to
                reach and easy to park.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business hours */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy-700 sm:text-3xl">
            Business Hours
          </h2>
          <p className="mt-2 text-center text-gray-500">
            When you can reach us or swing by to pick up your ride.
          </p>

          <div className="mt-10 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-[#F7F7F5] px-6 py-4">
              <Clock size={18} className="text-gold-500" />
              <span className="font-semibold text-navy-700">Weekly Schedule</span>
            </div>
            <ul className="divide-y divide-gray-50">
              {HOURS.map((h) => (
                <li
                  key={h.day}
                  className="flex items-center justify-between px-6 py-3.5 text-sm"
                >
                  <span className="font-medium text-navy-600">{h.day}</span>
                  <span className="text-gray-500">{h.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Questions prompt */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">
          Have questions before booking?
        </h2>
        <p className="mt-3 text-gray-500">
          Check out our FAQ for quick answers about licences, payments, deposits,
          and cancellations.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/#faq" className="btn-gold">
            <ChevronDown size={16} className="mr-1" /> Read the FAQ
          </Link>
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <MessageCircle size={16} className="mr-1" /> Ask on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}