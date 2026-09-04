"use client";

import { useRef, useState } from "react";
import { BookingData } from "@/app/booking/[vehicleId]/page";
import { AppSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Copy, Check, Image as ImageIcon, X, MessageCircle, Upload, Camera } from "lucide-react";

const MANAGER_WHATSAPP = "918490048239";

interface Props {
  settings: AppSettings | null;
  amount: number;
  data: BookingData;
  updateData: (partial: Partial<BookingData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function PaymentStep({
  settings,
  amount,
  data,
  updateData,
  onBack,
  onNext,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upload" | "whatsapp">("upload");

  const copyUPI = async () => {
    if (settings?.upi_id) {
      await navigator.clipboard.writeText(settings.upi_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    updateData({ paymentScreenshot: file });
  };

  const getManagerWhatsappUrl = () => {
    const msg = encodeURIComponent(
      `Payment Receipt for Booking%0A%0AAmount: ₹${amount}%0APlease find the payment screenshot attached.`
    );
    return `https://wa.me/${MANAGER_WHATSAPP}?text=${msg}`;
  };

  const canProceed = paymentMethod === "whatsapp" || data.paymentScreenshot;

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="mb-2 text-lg font-semibold text-navy-700">Payment</h2>
      <p className="mb-6 text-sm text-gray-500">
        Please make the payment using UPI, then choose how to share your receipt.
      </p>

      {/* Amount */}
      <div className="mb-6 rounded-lg border border-gold-200 bg-gold-50 p-4 text-center">
        <p className="text-sm text-gray-600">Amount to Pay</p>
        <p className="mt-1 text-3xl font-bold text-navy-700">{formatCurrency(amount)}</p>
      </div>

      {/* UPI ID */}
      {settings?.upi_id && (
        <div className="mb-4">
          <label className="label-text">UPI ID</label>
          <div className="flex items-stretch gap-2">
            <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm break-all flex items-center">
              {settings.upi_id}
            </div>
            <button
              onClick={copyUPI}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-navy-600 hover:bg-gray-50 active:bg-gray-100 transition-colors shrink-0 min-h-[44px]"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Code */}
      {settings?.scanner_image_url && (
        <div className="mb-6 flex justify-center">
          <div className="rounded-lg border border-gray-200 p-3">
            <img
              src={settings.scanner_image_url}
              alt="UPI QR Code"
              className="h-48 w-48 sm:h-56 sm:w-56 object-contain"
            />
          </div>
        </div>
      )}

      {/* Payment method choice */}
      <div className="mb-6">
        <label className="label-text">How would you like to share your receipt?</label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod("upload")}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors min-h-[80px] ${
              paymentMethod === "upload"
                ? "border-gold-400 bg-gold-50 text-navy-700"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 active:bg-gray-50"
            }`}
          >
            <Upload size={20} />
            <span className="text-sm font-medium">Upload Screenshot</span>
          </button>
          <button
            onClick={() => setPaymentMethod("whatsapp")}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors min-h-[80px] ${
              paymentMethod === "whatsapp"
                ? "border-green-400 bg-green-50 text-navy-700"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 active:bg-gray-50"
            }`}
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">Send to Manager</span>
          </button>
        </div>
      </div>

      {/* Upload screenshot section */}
      {paymentMethod === "upload" && (
        <div className="mb-6">
          <label className="label-text">Payment Screenshot *</label>
          {preview ? (
            <div className="relative overflow-hidden rounded-lg border border-gray-200">
              <img src={preview} alt="Payment screenshot" className="h-48 w-full object-contain bg-gray-50" />
              <button
                onClick={() => {
                  setPreview(null);
                  updateData({ paymentScreenshot: null });
                }}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-36 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-gold-400 hover:text-gold-500 active:bg-gray-100"
            >
              <Camera size={28} className="mb-1" />
              <span className="text-xs font-medium">Upload Payment Screenshot</span>
              <span className="mt-1 text-[11px] text-gray-300">Tap to choose photo</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Send to Manager section */}
      {paymentMethod === "whatsapp" && (
        <div className="mb-6">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="mb-3 text-sm text-green-800">
              Send your payment screenshot directly to our manager on WhatsApp. After sending, click Continue to proceed.
            </p>
            <a
              href={getManagerWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors min-h-[44px]"
            >
              <MessageCircle size={16} /> Send to +91 84900 48239
            </a>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline flex-1">
          <ChevronLeft size={16} className="mr-1" /> Back
        </button>
        <button onClick={onNext} disabled={!canProceed} className="btn-gold flex-1">
          Continue <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
}
