"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Vehicle, VehicleType } from "@/lib/types";
import {
  getTypeBadgeClass,
  formatCurrency,
  getTypeIcon,
  compressImage,
} from "@/lib/utils";
import { Plus, Pencil, Trash2, X, Loader2, Upload, Check } from "lucide-react";

const TYPE_FILTERS: { label: string; value: VehicleType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Scooty", value: "scooty" },
  { label: "Bike", value: "bike" },
  { label: "Car", value: "car" },
];

const EMPTY_FORM = {
  type: "scooty" as VehicleType,
  name: "",
  vehicle_number: "",
  rate_per_hour: "",
  rate_per_day: "",
  min_hours: "2",
  min_amount: "",
  extra_rate_per_hour: "",
  seats_or_capacity: "",
  is_active: true,
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<VehicleType | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    loadVehicles();
  }, [supabase]);

  const loadVehicles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .order("type")
      .order("name");
    setVehicles((data as Vehicle[]) ?? []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setSaved(false);
    setShowForm(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      type: v.type,
      name: v.name,
      vehicle_number: v.vehicle_number || "",
      rate_per_hour: String(v.rate_per_hour),
      rate_per_day: String(v.rate_per_day),
      min_hours: String(v.min_hours ?? 2),
      min_amount: v.min_amount > 0 ? String(v.min_amount) : "",
      extra_rate_per_hour:
        v.extra_rate_per_hour && v.extra_rate_per_hour > 0
          ? String(v.extra_rate_per_hour)
          : "",
      seats_or_capacity: v.seats_or_capacity || "",
      is_active: v.is_active,
    });
    setImagePreview(v.image_url);
    setImageFile(null);
    setError(null);
    setSaved(false);
    setShowForm(true);
  };

  const handleImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const compressed = await compressImage(file, 1200, 0.8);
    setImageFile(compressed);
    setImagePreview(URL.createObjectURL(compressed));
  };

  const handleDelete = async (v: Vehicle) => {
    if (!confirm(`Delete vehicle "${v.name}"?`)) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", v.id);
    if (error) {
      setError(`Failed to delete vehicle: ${error.message}`);
    } else {
      loadVehicles();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const ratePerHour = parseFloat(form.rate_per_hour);
    const ratePerDay = parseFloat(form.rate_per_day);
    const minHours = parseInt(form.min_hours, 10);
    const minAmount =
      form.min_amount.trim() === "" ? 0 : parseFloat(form.min_amount);
    const extraRate =
      form.extra_rate_per_hour.trim() === ""
        ? null
        : parseFloat(form.extra_rate_per_hour);

    if (isNaN(ratePerHour) || ratePerHour <= 0) {
      setError("Rate per hour must be a positive number.");
      setSaving(false);
      return;
    }
    if (isNaN(ratePerDay) || ratePerDay <= 0) {
      setError("Rate per day must be a positive number.");
      setSaving(false);
      return;
    }
    if (isNaN(minHours) || minHours < 1) {
      setError("Minimum hours must be 1 or more.");
      setSaving(false);
      return;
    }
    if (isNaN(minAmount) || minAmount < 0) {
      setError("Minimum amount must be 0 or more.");
      setSaving(false);
      return;
    }
    if (extraRate !== null && (isNaN(extraRate) || extraRate <= 0)) {
      setError("Extra rate per hour must be a positive number.");
      setSaving(false);
      return;
    }
    if (!form.name.trim()) {
      setError("Name is required.");
      setSaving(false);
      return;
    }

    let imageUrl = editing?.image_url || "";
    if (imageFile) {
      const path = `vehicles/${crypto.randomUUID()}.webp`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("vehicle-images")
        .upload(path, imageFile, { contentType: "image/webp" });
      if (uploadErr) {
        console.error("Vehicle image upload failed:", uploadErr);
        setError(
          `Image upload failed: ${uploadErr.message ?? "unknown error"}`
        );
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
    }

    const payload = {
      type: form.type,
      name: form.name.trim(),
      vehicle_number: form.vehicle_number.trim() || null,
      rate_per_hour: ratePerHour,
      rate_per_day: ratePerDay,
      min_hours: minHours,
      min_amount: minAmount,
      extra_rate_per_hour: extraRate,
      seats_or_capacity: form.seats_or_capacity.trim() || null,
      is_active: form.is_active,
      image_url: imageUrl,
    };

    if (editing) {
      const { error: updateErr } = await supabase
        .from("vehicles")
        .update(payload)
        .eq("id", editing.id);
      if (updateErr) {
        setError(updateErr.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertErr } = await supabase.from("vehicles").insert(payload);
      if (insertErr) {
        setError(insertErr.message);
        setSaving(false);
        return;
      }
    }

    setSaved(true);
    setSaving(false);
    await loadVehicles();
    setTimeout(() => {
      setShowForm(false);
      setSaved(false);
    }, 1200);
  };

  const toggleActive = async (v: Vehicle) => {
    await supabase
      .from("vehicles")
      .update({ is_active: !v.is_active })
      .eq("id", v.id);
    loadVehicles();
  };

  const filtered =
    filter === "all" ? vehicles : vehicles.filter((v) => v.type === filter);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-navy-700">Vehicles</h2>
        <button onClick={openAdd} className="btn-gold self-start">
          <Plus size={16} className="mr-1" /> Add Vehicle
        </button>
      </div>

      {/* Type filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all min-h-[40px] ${
              filter === f.value
                ? "bg-navy-700 text-white"
                : "bg-white text-navy-600 border border-gray-200 active:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && !showForm && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <div key={v.id} className="card p-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {v.image_url ? (
                  <img src={v.image_url} alt={v.name} className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-lg bg-gray-100 text-2xl shrink-0">
                    {getTypeIcon(v.type)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy-700 text-sm sm:text-base">{v.name}</p>
                  <span className={getTypeBadgeClass(v.type)}>
                    {v.type.charAt(0).toUpperCase() + v.type.slice(1)}
                  </span>
                </div>
                <button
                  onClick={() => toggleActive(v)}
                  className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
                    v.is_active ? "bg-green-500" : "bg-gray-300"
                  }`}
                  title={v.is_active ? "Active" : "Inactive"}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      v.is_active ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Per Hour</p>
                  <p className="font-medium text-navy-700">{formatCurrency(v.rate_per_hour)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Per Day</p>
                  <p className="font-medium text-navy-700">{formatCurrency(v.rate_per_day)}</p>
                </div>
              </div>
              {v.min_hours > 0 && v.min_amount > 0 && (
                <p className="mt-1.5 text-xs font-medium text-gold-500">
                  Min {v.min_hours} hrs · {formatCurrency(v.min_amount)} prepaid
                  {v.extra_rate_per_hour && v.extra_rate_per_hour > 0
                    ? ` · ${formatCurrency(v.extra_rate_per_hour)}/hr after`
                    : ""}
                </p>
              )}
              {v.vehicle_number && (
                <p className="mt-1 text-xs text-gray-400">{v.vehicle_number}</p>
              )}
              {v.seats_or_capacity && (
                <p className="mt-1 text-xs text-gray-400">{v.seats_or_capacity}</p>
              )}

              <div className="mt-4 flex gap-2 border-t border-gray-50 pt-3">
                <button
                  onClick={() => openEdit(v)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md border border-gray-200 py-2.5 text-sm font-medium text-navy-600 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[40px]"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(v)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors min-h-[40px]"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative z-10 w-full sm:max-w-lg sm:rounded-xl bg-white rounded-t-xl p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-700">
                {editing ? "Edit Vehicle" : "Add Vehicle"}
              </h3>
              <button onClick={() => setShowForm(false)} className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="label-text">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as VehicleType })}
                    className="input-field"
                  >
                    <option value="scooty">Scooty</option>
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Honda Activa"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="label-text">Vehicle Image</label>
                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-lg border border-gray-200">
                    <img src={imagePreview} alt="Vehicle" className="h-40 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-gold-400 hover:text-gold-500 active:bg-gray-100"
                  >
                    <Upload size={24} />
                    <span className="mt-2 text-xs font-medium">Upload Image</span>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="label-text">Rate Per Hour (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    placeholder="50"
                    value={form.rate_per_hour}
                    onChange={(e) => setForm({ ...form, rate_per_hour: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-text">Rate Per Day (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    placeholder="500"
                    value={form.rate_per_day}
                    onChange={(e) => setForm({ ...form, rate_per_day: e.target.value })}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-gold-50 border border-gold-200 p-4">
                <p className="mb-3 text-sm font-semibold text-navy-700">Minimum Order Pricing</p>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div>
                    <label className="label-text">Min Hours *</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      className="input-field"
                      placeholder="2"
                      value={form.min_hours}
                      onChange={(e) => setForm({ ...form, min_hours: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-text">Min Amount / Prepaid (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-field"
                      placeholder="e.g. 200"
                      value={form.min_amount}
                      onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-text">Extra Rate / Hr After Min (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-field"
                      placeholder="e.g. 60 (optional)"
                      value={form.extra_rate_per_hour}
                      onChange={(e) => setForm({ ...form, extra_rate_per_hour: e.target.value })}
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Leave Min Amount as 0 to keep standard hourly/day pricing. When set, this amount is
                  prepaid for the minimum hours and extra hours are charged at the extra rate (collected
                  manually by admin after the trip).
                </p>
              </div>

              <div>
                <label className="label-text">Vehicle Number (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. MH 12 AB 1234"
                  value={form.vehicle_number}
                  onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
                />
              </div>

              <div>
                <label className="label-text">Capacity / Seats (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 2 Seats, 150cc"
                  value={form.seats_or_capacity}
                  onChange={(e) => setForm({ ...form, seats_or_capacity: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-navy-600">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="h-4 w-4 rounded accent-gold-400"
                  />
                  Active (visible on public site)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || saved}
                  className={`flex-1 ${saved ? "bg-green-600 text-white hover:bg-green-600" : "btn-primary"}`}
                >
                  {saved ? (
                    <>
                      <Check size={16} className="mr-1" /> Saved
                    </>
                  ) : saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editing ? (
                    "Save Changes"
                  ) : (
                    "Add Vehicle"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saved popup */}
      {saved && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-xl">
            <Check size={18} className="shrink-0" />
            Saved
          </div>
        </div>
      )}
    </div>
  );
}
