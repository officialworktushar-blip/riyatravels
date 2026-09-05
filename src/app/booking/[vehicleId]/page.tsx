"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Vehicle, OccupiedSlot, AppSettings } from "@/lib/types";
import { getTypeBadgeClass, getTypeIcon } from "@/lib/utils";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import CustomerForm from "@/components/booking/CustomerForm";
import LicenseUpload from "@/components/booking/LicenseUpload";
import PaymentStep from "@/components/booking/PaymentStep";
import ReviewStep from "@/components/booking/ReviewStep";

export interface BookingData {
  startTime: string;
  endTime: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  licenseFront: File | null;
  licenseBack: File | null;
  paymentScreenshot: File | null;
  paymentConfirmationMethod: "screenshot" | "whatsapp";
  honeypot: string;
}

const STEPS = ["Time Slot", "Details", "License", "Payment", "Review"];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [data, setData] = useState<BookingData>({
    startTime: "",
    endTime: "",
    amount: 0,
    customerName: "",
    customerEmail: "",
    customerWhatsApp: "",
    licenseFront: null,
    licenseBack: null,
    paymentScreenshot: null,
    paymentConfirmationMethod: "screenshot",
    honeypot: "",
  });

  const supabase = createClient();

  const fetchOccupied = useCallback(async () => {
    const { data: slots } = await supabase
      .from("occupied_slots" as any)
      .select("*")
      .eq("vehicle_id", vehicleId);
    setOccupiedSlots((slots as OccupiedSlot[]) ?? []);
  }, [supabase, vehicleId]);

  useEffect(() => {
    async function load() {
      const [vehicleRes, settingsRes] = await Promise.all([
        supabase.from("vehicles").select("*").eq("id", vehicleId).single(),
        supabase.from("app_settings").select("upi_id, scanner_image_url").eq("id", 1).single(),
      ]);
      setVehicle(vehicleRes.data as Vehicle);
      setSettings(settingsRes.data as AppSettings);
      await fetchOccupied();
      setLoading(false);
    }
    load();
  }, [vehicleId, supabase, fetchOccupied]);

  const updateData = (partial: Partial<BookingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const handleSubmit = async () => {
    // Honeypot check
    if (data.honeypot) return;

    setSubmitting(true);
    setError(null);

    try {
      let licenseFrontUrl = "";
      let licenseBackUrl = "";
      let paymentUrl = "";

      // Upload license front
      if (data.licenseFront) {
        const ext = data.licenseFront.name.split(".").pop();
        const path = `licenses/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("licenses")
          .upload(path, data.licenseFront);
        if (uploadErr) {
          console.error("License front upload failed:", uploadErr);
          throw new Error(
            `Failed to upload license front: ${uploadErr.message ?? "unknown error"}`
          );
        }
        licenseFrontUrl = path;
      }

      // Upload license back
      if (data.licenseBack) {
        const ext = data.licenseBack.name.split(".").pop();
        const path = `licenses/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("licenses")
          .upload(path, data.licenseBack);
        if (uploadErr) {
          console.error("License back upload failed:", uploadErr);
          throw new Error(
            `Failed to upload license back: ${uploadErr.message ?? "unknown error"}`
          );
        }
        licenseBackUrl = path;
      }

      // Upload payment screenshot (only when the customer chose the upload option)
      if (
        data.paymentConfirmationMethod === "screenshot" &&
        data.paymentScreenshot
      ) {
        const ext = data.paymentScreenshot.name.split(".").pop();
        const path = `payment-proofs/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("payment-proofs")
          .upload(path, data.paymentScreenshot);
        if (uploadErr) {
          console.error("Payment screenshot upload failed:", uploadErr);
          throw new Error(
            `Failed to upload payment screenshot: ${uploadErr.message ?? "unknown error"}`
          );
        }
        paymentUrl = path;
      }

      // Insert booking
      const { data: inserted, error: insertErr } = await supabase
        .from("bookings")
        .insert({
          customer_name: data.customerName,
          customer_email: data.customerEmail || null,
          customer_whatsapp: data.customerWhatsApp,
          vehicle_id: vehicleId,
          start_time: data.startTime,
          end_time: data.endTime,
          license_front_url: licenseFrontUrl || null,
          license_back_url: licenseBackUrl || null,
          payment_screenshot_url: paymentUrl || null,
          payment_confirmation_method: data.paymentConfirmationMethod,
          amount: data.amount,
          status: "pending_review",
        })
        .select("id")
        .single();

      if (insertErr) {
        // Handle overlap constraint violation
        if (insertErr.code === "23P01") {
          setError(
            "Sorry, that time slot was just booked. Please choose another time."
          );
          await fetchOccupied();
          setStep(0);
          return;
        }
        throw new Error(insertErr.message);
      }

      setSuccess(true);

      // Fire-and-forget admin notification (email + WhatsApp). Never blocks
      // the customer's success screen if this request fails.
      if (inserted?.id) {
        fetch("/api/notify-admin-new-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: inserted.id }),
        }).catch((err: any) => {
          console.error("Failed to notify admin of new booking:", err);
        });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-gray-500">Vehicle not found.</p>
        <Link href="/" className="btn-primary mt-4 inline-flex">
          Back to Home
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-navy-700">Booking Request Received!</h2>
        <p className="mt-3 text-gray-500">
          Your request has been received. We will verify your documents and payment, and email you a
          confirmation shortly.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-flex">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      {/* Back + Vehicle info */}
      <Link
        href="/"
        className="mb-4 sm:mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-600 hover:text-gold-400 transition-colors min-h-[44px]"
      >
        <ArrowLeft size={16} /> Back to vehicles
      </Link>

      <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4 rounded-xl bg-white p-3 sm:p-4 shadow-sm border border-gray-100">
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gray-100 text-2xl shrink-0">
          {getTypeIcon(vehicle.type)}
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-navy-700 truncate">{vehicle.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className={getTypeBadgeClass(vehicle.type)}>
              {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
            </span>
            {vehicle.vehicle_number && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-navy-600">
                {vehicle.vehicle_number}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-6 sm:mb-8">
        {/* Mobile: compact step indicator */}
        <div className="sm:hidden">
          <div className="flex items-center gap-1.5">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center flex-1">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                        ? "bg-gold-400 text-navy-700"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 rounded ${
                      i < step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-medium text-navy-700">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </div>

        {/* Desktop: full step indicator */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                        ? "bg-gold-400 text-navy-700"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-8 ${
                      i < step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={`text-xs ${i === step ? "font-semibold text-navy-700" : "text-gray-400"}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Steps */}
      {step === 0 && (
        <TimeSlotPicker
          vehicle={vehicle}
          occupiedSlots={occupiedSlots}
          data={data}
          updateData={updateData}
          onNext={() => { setError(null); setStep(1); }}
        />
      )}
      {step === 1 && (
        <CustomerForm
          data={data}
          updateData={updateData}
          onBack={() => setStep(0)}
          onNext={() => { setError(null); setStep(2); }}
        />
      )}
      {step === 2 && (
        <LicenseUpload
          data={data}
          updateData={updateData}
          onBack={() => setStep(1)}
          onNext={() => { setError(null); setStep(3); }}
        />
      )}
      {step === 3 && (
        <PaymentStep
          settings={settings}
          amount={data.amount}
          data={data}
          updateData={updateData}
          onBack={() => setStep(2)}
          onNext={() => { setError(null); setStep(4); }}
        />
      )}
      {step === 4 && (
        <ReviewStep
          vehicle={vehicle}
          data={data}
          onBack={() => setStep(3)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
