"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppSettings } from "@/lib/types";
import { Loader2, Upload, X, Save } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [upiId, setUpiId] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      setSettings(data as AppSettings);
      setUpiId((data as AppSettings).upi_id || "");
      setQrPreview((data as AppSettings).scanner_image_url);
    }
    setLoading(false);
  };

  const handleQr = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
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
      const { error: uploadErr } = await supabase.storage
        .from("scanner-qr")
        .upload(path, qrFile);
      if (uploadErr) {
        setError("Failed to upload QR image.");
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("scanner-qr")
        .getPublicUrl(path);
      scannerUrl = urlData.publicUrl;
    }

    const { error: updateErr } = await supabase
      .from("app_settings")
      .update({
        upi_id: upiId.trim() || null,
        scanner_image_url: scannerUrl || null,
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
    <div className="max-w-lg">
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

      <div className="card p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* UPI ID */}
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

          {/* QR Scanner */}
          <div>
            <label className="label-text">UPI QR Code</label>
            {qrPreview ? (
              <div className="relative inline-block">
                <div className="rounded-lg border border-gray-200 p-2">
                  <img src={qrPreview} alt="QR Code" className="h-40 w-40 object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQrPreview(null);
                    setQrFile(null);
                  }}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-32 w-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-gold-400 hover:text-gold-500"
              >
                <Upload size={24} />
                <span className="mt-2 text-xs">Upload QR</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleQr(e.target.files[0])}
            />
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
    </div>
  );
}
