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
      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:pt-16 pb-4">
        <h1 className="text-3xl font-bold text-navy-700 sm:text-4xl">
          Get in <span className="text-gold-400">Touch</span>
        </h1>
        <p className="mt-3 max-w-2xl text-gray-500">
          Questions about a booking, a vehicle, or your ride? We&apos;re one message
          away — reach us on WhatsApp or email.
        </p>
      </section>

      {/* Contact details */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
          {/* WhatsApp */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6 text-center shadow-sm transition-all hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <MessageCircle size={24} />
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
          <div className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6 text-center shadow-sm transition-all hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gold-50 text-gold-500">
              <Mail size={24} />
            </div>
            <h2 className="text-lg font-semibold text-navy-700">Email</h2>
            <p className="mt-2 text-sm text-gray-500">For bookings &amp; enquiries</p>
            <a
              href="mailto:scooty.riyatravels@gmail.com"
              className="mt-5 inline-block font-medium text-gold-500 hover:underline break-all text-sm"
            >
              scooty.riyatravels@gmail.com
            </a>
          </div>

          {/* Address */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6 text-center shadow-sm transition-all hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-navy-100 text-navy-700">
              <MapPin size={24} />
            </div>
            <h2 className="text-lg font-semibold text-navy-700">Location</h2>
            <address className="mt-2 text-sm leading-relaxed not-italic text-gray-500">
              21, Nr. Pratapnagar Bridge,<br />
              Lalbaug Road, Pratapnagar,<br />
              Vadodara, Gujarat, India
            </address>
            <a
              href="https://www.google.com/maps?q=22.2820,73.2066"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-5 w-full"
            >
              <MapPin size={16} className="mr-1" /> Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:pb-16">
        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <iframe
            title="Riya Travels location map"
            src="https://www.google.com/maps?q=22.2820,73.2066&z=17&output=embed"
            className="h-64 w-full sm:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      {/* Business hours */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy-700 sm:text-3xl">
            Business Hours
          </h2>
          <p className="mt-2 text-center text-gray-500">
            When you can reach us or swing by to pick up your ride.
          </p>

          <div className="mt-8 sm:mt-10 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-[#F7F7F5] px-4 sm:px-6 py-4">
              <Clock size={18} className="text-gold-500 shrink-0" />
              <span className="font-semibold text-navy-700">Weekly Schedule</span>
            </div>
            <ul className="divide-y divide-gray-50">
              {HOURS.map((h) => (
                <li
                  key={h.day}
                  className="flex items-center justify-between px-4 sm:px-6 py-3.5 text-sm"
                >
                  <span className="font-medium text-navy-600">{h.day}</span>
                  <span className="text-gray-500 text-right ml-4">{h.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Questions prompt */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-center">
        <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">
          Have questions before booking?
        </h2>
        <p className="mt-3 text-gray-500">
          Check out our FAQ for quick answers about licences, payments, deposits,
          and cancellations.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
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
