"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppSettings } from "@/lib/types";
import { compressImage } from "@/lib/utils";
import { Loader2, Upload, X, Save, Image as ImageIcon } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [upiId, setUpiId] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    loadSettings();
  }, [supabase]);

  const loadSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (data) {
      const s = data as AppSettings;
      setSettings(s);
      setUpiId(s.upi_id || "");
      setQrPreview(s.scanner_image_url);
      setHeroPreview(s.hero_image_url);
    }
    setLoading(false);
  };

  const handleQr = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleHeroImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const compressed = await compressImage(file, 1600, 0.82);
    setHeroFile(compressed);
    setHeroPreview(URL.createObjectURL(compressed));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    let scannerUrl = settings?.scanner_image_url || "";
    if (qrFile) {
      const ext = qrFile.name.split(".").pop() || "jpg";
      const path = `qr/${crypto.randomUUID()}.${ext}`;
      const { data: qrData, error: uploadErr } = await supabase.storage
        .from("scanner-qr")
        .upload(path, qrFile);
      if (uploadErr) {
        console.error("QR image upload failed:", uploadErr);
        setError(
          `QR image upload failed: ${uploadErr.message ?? "unknown error"}`
        );
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("scanner-qr")
        .getPublicUrl(qrData.path);
      scannerUrl = urlData.publicUrl;
    }

    let heroUrl = settings?.hero_image_url || "";
    if (heroFile) {
      const path = `hero/${crypto.randomUUID()}.webp`;
      const { data: heroData, error: uploadErr } = await supabase.storage
        .from("site-content")
        .upload(path, heroFile, { contentType: "image/webp" });
      if (uploadErr) {
        console.error("Hero image upload failed:", uploadErr);
        setError(
          `Hero image upload failed: ${uploadErr.message ?? "unknown error"}`
        );
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("site-content")
        .getPublicUrl(heroData.path);
      heroUrl = urlData.publicUrl;
    }

    const { error: updateErr } = await supabase
      .from("app_settings")
      .update({
        upi_id: upiId.trim() || null,
        scanner_image_url: scannerUrl || null,
        hero_image_url: heroUrl || null,
      })
      .eq("id", 1);

    if (updateErr) {
      setError(updateErr.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    await loadSettings();
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-xl font-bold text-navy-700">Settings</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
        {/* Homepage Hero */}
        <div className="card p-4 sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-navy-700">Homepage Hero</h3>
          <div className="space-y-4">
            <div>
              <label className="label-text">Hero Image</label>
              {heroPreview ? (
                <div className="relative inline-block w-full">
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={heroPreview}
                      alt="Hero"
                      className="h-40 sm:h-48 w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroPreview(null);
                      setHeroFile(null);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => heroRef.current?.click()}
                  className="flex h-36 sm:h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-gold-400 hover:text-gold-500 active:bg-gray-100"
                >
                  <ImageIcon size={24} />
                  <span className="mt-2 text-xs font-medium">Upload Hero Image</span>
                </button>
              )}
              <input
                ref={heroRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleHeroImage(e.target.files[0])}
              />
              <p className="mt-1 text-xs text-gray-400">
                Recommended: 1600x800px, webp format for best performance.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="card p-4 sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-navy-700">Payment Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="label-text">UPI ID</label>
              <input
                type="text"
                className="input-field"
                placeholder="riyatravels@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-400">
                Shown on the payment page for public bookings.
              </p>
            </div>
            <div>
              <label className="label-text">UPI QR Code</label>
              {qrPreview ? (
                <div className="relative inline-block">
                  <div className="rounded-lg border border-gray-200 p-2">
                    <img src={qrPreview} alt="QR Code" className="h-36 w-36 sm:h-40 sm:w-40 object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQrPreview(null);
                      setQrFile(null);
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 min-h-[32px] min-w-[32px] flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => qrRef.current?.click()}
                  className="flex h-32 w-full sm:w-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-gold-400 hover:text-gold-500 active:bg-gray-100"
                >
                  <Upload size={24} />
                  <span className="mt-2 text-xs font-medium">Upload QR</span>
                </button>
              )}
              <input
                ref={qrRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleQr(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} className="mr-1" />
          )}
          Save Settings
        </button>
      </form>
    </div>
  );
}
