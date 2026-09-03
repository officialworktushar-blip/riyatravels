import Image from "next/image";
import Link from "next/link";
import {
  Zap,
  BadgeIndianRupee,
  Car,
  HeartHandshake,
  ShieldCheck,
  Clock,
  MessageCircle,
} from "lucide-react";
import HowItWorks from "@/components/public/HowItWorks";
import FAQ from "@/components/public/FAQ";

const VALUES = [
  {
    icon: Zap,
    title: "Convenience first",
    description:
      "Book in minutes from your phone — no paperwork, no waiting in queues, no rental-agency runaround.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Transparent pricing",
    description:
      "Clear hourly and daily rates with no hidden charges. What you see is exactly what you pay.",
  },
  {
    icon: Car,
    title: "Wide vehicle range",
    description:
      "Scooters for quick city hops, bikes for weekend rides, and cars for the whole family.",
  },
  {
    icon: HeartHandshake,
    title: "Trusted by locals",
    description:
      "A community business built on word of mouth, dependable vehicles, and honest service.",
  },
];

const PROMISES = [
  {
    icon: ShieldCheck,
    title: "Verified documents, verified rides",
    text: "Every vehicle is checked before it goes out. Your driving licence is verified quickly, so you're on the road in no time.",
  },
  {
    icon: Clock,
    title: "Rent by the hour or the day",
    text: "Need a scooty for 2 hours or a car for a weekend? Build your own slot and pay only for what you use.",
  },
  {
    icon: MessageCircle,
    title: "Real support when you need it",
    text: "Questions before booking or a hiccup mid-ride? Message us on WhatsApp and a real person will help you out.",
  },
];

export const metadata = {
  title: "About Us — Riya Travels",
  description:
    "Learn about Riya Travels — a trusted local vehicle rental business offering scooters, bikes, and cars with simple UPI payment and fast document verification.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Header */}
      <section className="mx-auto max-w-4xl px-4 pt-16 pb-4">
        <h1 className="text-3xl font-bold text-navy-700 sm:text-4xl">
          About <span className="text-gold-400">Riya Travels</span>
        </h1>
        <p className="mt-3 max-w-2xl text-gray-500">
          Your friendly neighbourhood ride rental — affordable wheels, simple
          UPI payments, and zero paperwork hassle.
        </p>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">Our Story</h2>
        <div className="mt-6 space-y-5 text-base leading-relaxed text-gray-600 sm:text-lg">
          <p>
            Riya Travels started with a simple frustration: renting a scooter, bike,
            or car was always a chore. Filling out endless forms, waiting for
            approvals, carrying around big cash deposits — it never felt like it should
            for something as simple as getting from A to B.
          </p>
          <p>
            So we built the experience we always wanted. Today Riya Travels is a
            trusted local vehicle rental business offering scooters, bikes, and cars at
            honest hourly and daily rates. Booking takes a few minutes from your phone:
            pick your vehicle, choose your time slot, upload your licence, and pay
            directly via UPI. No card, no paperwork-heavy contracts, no surprises.
          </p>
          <p>
            We're a small, local team that takes personal pride in every vehicle we
            send out. Our rides are maintained and ready, our verification is quick,
            and our support — over WhatsApp, of course — is real and human. Whether
            it's a trip to the market, a long weekend drive, or a daily commute, we're
            here to keep you moving.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl">
          <Image
            src="/about-fleet.webp"
            alt="A mix of scooters, bikes and cars from the Riya Travels fleet"
            width={1200}
            height={675}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 1024px"
          />
        </div>
      </section>

      {/* Mission / Values */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">
            What We Stand For
          </h2>
          <p className="mt-2 text-gray-500">
            The values that guide every booking, every ride, and every conversation.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-gray-100 bg-[#F7F7F5] p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 text-navy-700">
                  <value.icon size={26} />
                </div>
                <h3 className="text-lg font-semibold text-navy-700">{value.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Rent With Us */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">
          Why Rent With Us
        </h2>
        <p className="mt-2 max-w-2xl text-gray-500">
          We keep things refreshingly simple. Here's what you can expect every time
          you ride with Riya Travels.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PROMISES.map((promise) => (
            <div
              key={promise.title}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-500">
                <promise.icon size={26} />
              </div>
              <h3 className="text-lg font-semibold text-navy-700">{promise.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {promise.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <div className="bg-white">
        <HowItWorks />
      </div>

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="bg-navy-700 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to hit the road?
          </h2>
          <p className="mt-3 text-gray-300">
            Browse our fleet, pick your ride, and be on your way in minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/#vehicles" className="btn-gold">
              Browse Vehicles
            </Link>
            <Link href="/contact" className="btn-outline !border-gray-300 !text-white hover:!bg-white hover:!text-navy-700">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}