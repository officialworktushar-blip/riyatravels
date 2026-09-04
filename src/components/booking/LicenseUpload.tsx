"use client";

import { useRef, useState } from "react";
import { BookingData } from "@/app/booking/[vehicleId]/page";
import { compressImage } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Upload, X, Image as ImageIcon, Camera } from "lucide-react";

interface Props {
  data: BookingData;
  updateData: (partial: Partial<BookingData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function LicenseUpload({ data, updateData, onBack, onNext }: Props) {
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file: File, side: "front" | "back") => {
    if (!file.type.startsWith("image/")) return;
    setProcessing(true);
    const compressed = await compressImage(file);
    const url = URL.createObjectURL(compressed);
    if (side === "front") {
      setFrontPreview(url);
      updateData({ licenseFront: compressed });
    } else {
      setBackPreview(url);
      updateData({ licenseBack: compressed });
    }
    setProcessing(false);
  };

  const removeFile = (side: "front" | "back") => {
    if (side === "front") {
      setFrontPreview(null);
      updateData({ licenseFront: null });
    } else {
      setBackPreview(null);
      updateData({ licenseBack: null });
    }
  };

  const canProceed = data.licenseFront && data.licenseBack;

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="mb-2 text-lg font-semibold text-navy-700">Driving License</h2>
      <p className="mb-6 text-sm text-gray-500">Upload clear photos of the front and back of your driving license.</p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {/* Front */}
        <div>
          <label className="label-text">License Front *</label>
          {frontPreview ? (
            <div className="relative overflow-hidden rounded-lg border border-gray-200">
              <img src={frontPreview} alt="License front" className="h-44 w-full object-cover" />
              <button
                onClick={() => removeFile("front")}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => frontRef.current?.click()}
              className="flex h-44 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-gold-400 hover:text-gold-500 active:bg-gray-100"
            >
              <Camera size={28} className="mb-1" />
              <span className="text-xs font-medium">Upload Front</span>
              <span className="mt-1 text-[11px] text-gray-300">Tap to choose photo</span>
            </button>
          )}
          <input
            ref={frontRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], "front")}
          />
        </div>

        {/* Back */}
        <div>
          <label className="label-text">License Back *</label>
          {backPreview ? (
            <div className="relative overflow-hidden rounded-lg border border-gray-200">
              <img src={backPreview} alt="License back" className="h-44 w-full object-cover" />
              <button
                onClick={() => removeFile("back")}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => backRef.current?.click()}
              className="flex h-44 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-gold-400 hover:text-gold-500 active:bg-gray-100"
            >
              <Camera size={28} className="mb-1" />
              <span className="text-xs font-medium">Upload Back</span>
              <span className="mt-1 text-[11px] text-gray-300">Tap to choose photo</span>
            </button>
          )}
          <input
            ref={backRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], "back")}
          />
        </div>
      </div>

      {processing && (
        <p className="mt-3 text-center text-sm text-gold-500">Processing image...</p>
      )}

      <div className="mt-6 flex gap-3">
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
