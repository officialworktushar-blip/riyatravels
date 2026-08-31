"use client";

import { useRef, useState } from "react";
import { BookingData } from "@/app/booking/[vehicleId]/page";
import { AppSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Copy, Check, Image as ImageIcon, X } from "lucide-react";

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

  const canProceed = data.paymentScreenshot;

  return (
    <div className="card p-6">
      <h2 className="mb-2 text-lg font-semibold text-navy-700">Payment</h2>
      <p className="mb-6 text-sm text-gray-500">
        Please make the payment using UPI and upload the screenshot below.
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
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm">
              {settings.upi_id}
            </div>
            <button
              onClick={copyUPI}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-3 text-sm font-medium text-navy-600 hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
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
              className="h-48 w-48 object-contain"
            />
          </div>
        </div>
      )}

      {/* Upload screenshot */}
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
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-gold-400 hover:text-gold-500"
          >
            <ImageIcon size={24} />
            <span className="mt-2 text-xs">Upload Payment Screenshot</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

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
