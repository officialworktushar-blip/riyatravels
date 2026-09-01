"use client";

import { CalendarCheck, FileCheck, IndianRupee, MailCheck } from "lucide-react";

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Choose Your Ride",
    description: "Pick your vehicle and select a convenient time slot",
  },
  {
    icon: FileCheck,
    title: "Upload Documents",
    description: "Upload your driving license for quick verification",
  },
  {
    icon: IndianRupee,
    title: "Pay via UPI",
    description: "Simple UPI payment — no card needed",
  },
  {
    icon: MailCheck,
    title: "Get Confirmed",
    description: "Receive instant email confirmation and you're all set",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">
        How It Works
      </h2>
      <p className="mt-2 text-gray-500">
        Getting on the road is as easy as one, two, three, four.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div key={step.title} className="card flex flex-col items-center p-6 text-center">
            <div className="relative mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-400 text-navy-700">
                <step.icon size={28} />
              </div>
              <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-navy-700 text-xs font-bold text-white">
                {i + 1}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-navy-700">{step.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
