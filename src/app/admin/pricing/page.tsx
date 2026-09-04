"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Vehicle } from "@/lib/types";
import {
  getTypeBadgeClass,
  getTypeIcon,
  getVehiclePricingDisplay,
} from "@/lib/utils";
import { Loader2, Save, Check, Info, IndianRupee } from "lucide-react";

interface Draft {
  min_hours: string;
  min_amount: string;
  extra_rate_per_hour: string;
  rate_per_day: string;
}

const toDraft = (v: Vehicle): Draft => ({
  min_hours: String(v.min_hours ?? 2),
  min_amount: v.min_amount > 0 ? String(v.min_amount) : "",
  extra_rate_per_hour:
    v.extra_rate_per_hour && v.extra_rate_per_hour > 0
      ? String(v.extra_rate_per_hour)
      : "",
  rate_per_day: String(v.rate_per_day),
});

const parseDraft = (v: Vehicle, d: Draft): Vehicle => ({
  ...v,
  min_hours: parseInt(d.min_hours, 10) || 0,
  min_amount: parseFloat(d.min_amount) || 0,
  extra_rate_per_hour:
    d.extra_rate_per_hour.trim() === ""
      ? null
      : parseFloat(d.extra_rate_per_hour) || 0,
  rate_per_day: parseFloat(d.rate_per_day) || 0,
});

export default function PricingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    const list = (data as Vehicle[]) ?? [];
    setVehicles(list);
    setDrafts(Object.fromEntries(list.map((v) => [v.id, toDraft(v)])));
    setLoading(false);
  };

  const updateDraft = (id: string, field: keyof Draft, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    setError(null);
  };

  const handleSave = async (v: Vehicle) => {
    const d = drafts[v.id];
    if (!d) return;

    const preview = parseDraft(v, d);
    if (preview.min_hours < 1) {
      setError("Minimum hours must be 1 or more.");
      return;
    }
    if (preview.min_amount < 0) {
      setError("Minimum amount must be 0 or more.");
      return;
    }
    if (
      preview.extra_rate_per_hour !== null &&
      preview.extra_rate_per_hour <= 0
    ) {
      setError("Extra rate per hour must be a positive number or empty.");
      return;
    }
    if (preview.rate_per_day <= 0) {
      setError("Full day rate must be a positive number.");
      return;
    }

    setSavingId(v.id);
    setError(null);

    const { error: updateErr } = await supabase
      .from("vehicles")
      .update({
        min_hours: preview.min_hours,
        min_amount: preview.min_amount,
        extra_rate_per_hour: preview.extra_rate_per_hour,
        rate_per_day: preview.rate_per_day,
      })
      .eq("id", v.id);

    if (updateErr) {
      setError(updateErr.message);
      setSavingId(null);
      return;
    }

    setSavingId(null);
    setSavedId(v.id);
    await loadVehicles();
    setTimeout(() => setSavedId(null), 2500);
  };

  const getDraft = (v: Vehicle): Draft =>
    drafts[v.id] ?? {
      min_hours: "2",
      min_amount: "",
      extra_rate_per_hour: "",
      rate_per_day: String(v.rate_per_day),
    };

  return (
    <div className="max-w-6xl">
      <div className="mb-2 flex items-center gap-2">
        <IndianRupee size={20} className="text-gold-400" />
        <h2 className="text-xl font-bold text-navy-700">Pricing Rules</h2>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-gold-200 bg-gold-50 p-4 text-sm text-navy-600">
        <Info size={16} className="mt-0.5 shrink-0 text-gold-500" />
        <p>
          Set the minimum order terms per vehicle. The minimum amount is prepaid online for the
          minimum hours; extra hours are charged at the extra rate and collected manually by admin
          after the trip. Leave Extra Rate empty to use standard hourly / full-day pricing.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center text-gray-400">
          No vehicles yet. Add one from the Vehicles section.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {vehicles.map((v) => {
            const d = getDraft(v);
            const preview = parseDraft(v, d);
            const previewPricing = getVehiclePricingDisplay(preview);
            return (
              <div key={v.id} className="card p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  {v.image_url ? (
                    <img
                      src={v.image_url}
                      alt={v.name}
                      className="h-11 w-11 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xl shrink-0">
                      {getTypeIcon(v.type)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-navy-700 text-sm sm:text-base">
                      {v.name}
                    </p>
                    <span className={getTypeBadgeClass(v.type)}>
                      {v.type.charAt(0).toUpperCase() + v.type.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div>
                    <label className="label-text">Min Hours *</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      className="input-field"
                      value={d.min_hours}
                      onChange={(e) =>
                        updateDraft(v.id, "min_hours", e.target.value)
                      }
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
                      value={d.min_amount}
                      onChange={(e) =>
                        updateDraft(v.id, "min_amount", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="label-text">Extra / Hr After Min (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-field"
                      placeholder="optional"
                      value={d.extra_rate_per_hour}
                      onChange={(e) =>
                        updateDraft(v.id, "extra_rate_per_hour", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="label-text">Full Day Rate (Rs.) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-field"
                      value={d.rate_per_day}
                      onChange={(e) =>
                        updateDraft(v.id, "rate_per_day", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  <span className="font-semibold text-navy-700">Shown to customers:</span>
                  <p className="mt-1">{previewPricing.primary}</p>
                  <p>{previewPricing.secondary}</p>
                </div>

                <button
                  onClick={() => handleSave(v)}
                  disabled={savingId === v.id}
                  className={`mt-4 w-full btn-primary justify-center ${
                    savedId === v.id ? "!bg-green-600" : ""
                  }`}
                >
                  {savingId === v.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : savedId === v.id ? (
                    <Check size={16} className="mr-1" />
                  ) : (
                    <Save size={16} className="mr-1" />
                  )}
                  {savedId === v.id ? "Saved" : "Save Pricing"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}