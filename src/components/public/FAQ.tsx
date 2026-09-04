"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Do I need to submit my driving license?",
    answer:
      "Yes, a valid Indian driving license is mandatory. You'll upload photos of the front and back during booking.",
  },
  {
    question: "What if I return the vehicle late?",
    answer:
      "Late returns are charged at the standard hourly rate. Please contact us on WhatsApp if you need to extend your booking.",
  },
  {
    question: "Is there a security deposit?",
    answer: "No security deposit is required. You only pay the rental amount via UPI.",
  },
  {
    question: "How do I pay?",
    answer:
      "We accept UPI payments. After booking, you'll see the UPI ID and QR code to complete the payment.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, you can cancel before the booking starts. Approved bookings can be cancelled from the admin panel.",
  },
  {
    question: "What documents do I need?",
    answer:
      "A valid driving license and a payment screenshot. That's it — quick and simple.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">
        Frequently Asked Questions
      </h2>
      <p className="mt-2 text-gray-500">
        Quick answers to the questions we hear most often.
      </p>

      <div className="mt-8 sm:mt-10 space-y-4">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <button
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left min-h-[52px] active:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-navy-700 sm:text-base pr-2">
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-gold-400 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 sm:px-5 pb-5 text-sm leading-relaxed text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
