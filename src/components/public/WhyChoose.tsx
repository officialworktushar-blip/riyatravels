"use client";

import { Car, Smartphone, ShieldCheck, MessageCircle } from "lucide-react";

const FEATURES = [
  {
    icon: Car,
    title: "Wide Fleet",
    description: "Scooters, bikes, and cars — find the perfect ride for every occasion",
  },
  {
    icon: Smartphone,
    title: "Easy UPI Payment",
    description: "Pay directly via UPI. No cards, no hassle",
  },
  {
    icon: ShieldCheck,
    title: "Quick Verification",
    description: "Fast document verification so you can get on the road sooner",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Support",
    description: "Real human support whenever you need it, right on WhatsApp",
  },
];

export default function WhyChoose() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">
        Why Choose Riya Travels
      </h2>
      <p className="mt-2 text-gray-500">
        Everything you need for a smooth, stress-free rental experience.
      </p>

      <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gold-50 text-gold-500">
              <feature.icon size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-navy-700">{feature.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
