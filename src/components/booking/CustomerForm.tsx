"use client";

import { useState } from "react";
import { BookingData } from "@/app/booking/[vehicleId]/page";
import { isValidEmail, isValidPhone } from "@/lib/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Props {
  data: BookingData;
  updateData: (partial: Partial<BookingData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function CustomerForm({ data, updateData, onBack, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!data.customerName.trim()) errs.customerName = "Name is required";
    if (data.customerEmail.trim() && !isValidEmail(data.customerEmail)) errs.customerEmail = "Invalid email address";
    if (!data.customerWhatsApp.trim()) errs.customerWhatsApp = "WhatsApp number is required";
    else if (!isValidPhone(data.customerWhatsApp)) errs.customerWhatsApp = "Invalid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold text-navy-700">Your Details</h2>

      {/* Honeypot — hidden from humans */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={data.honeypot}
          onChange={(e) => updateData({ honeypot: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="label-text">Full Name *</label>
          <input
            type="text"
            className={`input-field ${errors.customerName ? "border-red-400" : ""}`}
            placeholder="John Doe"
            value={data.customerName}
            onChange={(e) => updateData({ customerName: e.target.value })}
          />
          {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>}
        </div>

        <div>
          <label className="label-text">Email Address (optional)</label>
          <input
            type="email"
            className={`input-field ${errors.customerEmail ? "border-red-400" : ""}`}
            placeholder="john@example.com"
            value={data.customerEmail}
            onChange={(e) => updateData({ customerEmail: e.target.value })}
          />
          {errors.customerEmail && <p className="mt-1 text-xs text-red-500">{errors.customerEmail}</p>}
        </div>

        <div>
          <label className="label-text">WhatsApp Number *</label>
          <input
            type="tel"
            className={`input-field ${errors.customerWhatsApp ? "border-red-400" : ""}`}
            placeholder="+91 98765 43210"
            value={data.customerWhatsApp}
            onChange={(e) => updateData({ customerWhatsApp: e.target.value })}
          />
          {errors.customerWhatsApp && <p className="mt-1 text-xs text-red-500">{errors.customerWhatsApp}</p>}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={onBack} className="btn-outline flex-1">
          <ChevronLeft size={16} className="mr-1" /> Back
        </button>
        <button onClick={handleNext} className="btn-gold flex-1">
          Continue <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
}
