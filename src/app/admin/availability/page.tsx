"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Vehicle, VehicleType, Booking, BlockedSlot } from "@/lib/types";
import {
  getTypeBadgeClass,
  formatDateTime,
  getTypeIcon,
} from "@/lib/utils";
import { Plus, Trash2, Loader2, Search } from "lucide-react";

interface AvailItem {
  id: string;
  vehicle_id: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  source: "booking" | "blocked";
  status?: string;
}

const TYPE_FILTERS: { label: string; value: VehicleType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Scooty", value: "scooty" },
  { label: "Bike", value: "bike" },
  { label: "Car", value: "car" },
];

export default function AvailabilityPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [occupied, setOccupied] = useState<AvailItem[]>([]);
  const [blocked, setBlocked] = useState<BlockedSlot[]>([]);
  const [typeFilter, setTypeFilter] = useState<VehicleType | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState({ start: "", end: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadVehicles();
  }, [supabase]);

  const loadVehicles = async () => {
    setLoading(true);
    const { data } = await supabase.from("vehicles").select("*").order("type").order("name");
    setVehicles((data as Vehicle[]) ?? []);
    setLoading(false);
  };

  const loadAvailability = async (vehicleId: string) => {
    const [occupiedRes, blockedRes] = await Promise.all([
      supabase.from("occupied_slots" as any).select("*").eq("vehicle_id", vehicleId),
      supabase.from("blocked_slots").select("*").eq("vehicle_id", vehicleId).order("start_time"),
    ]);

    const occData = (occupiedRes.data as any[]) ?? [];
    const blockedData = (blockedRes.data as BlockedSlot[]) ?? [];

    // Fetch bookings for status display (admin can query bookings directly)
    const { data: bookingData } = await supabase
      .from("bookings")
      .select("id, start_time, end_time, status")
      .eq("vehicle_id", vehicleId);

    const occItems: AvailItem[] = [];
    for (const o of occData) {
      const matching = (bookingData as any[])?.find(
        (b) => new Date(b.start_time).getTime() === new Date(o.start_time).getTime() &&
              new Date(b.end_time).getTime() === new Date(o.end_time).getTime()
      );
      occItems.push({
        id: matching?.id || `blocked-${randomStr()}`,
        vehicle_id: vehicleId,
        start_time: o.start_time,
        end_time: o.end_time,
        reason: o.source === "blocked" ? "Manual Block" : null,
        source: o.source,
        status: matching?.status,
      });
    }

    // Sort by start time
    occItems.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    setOccupied(occItems);
    setBlocked(blockedData);
  };

  const randomStr = () => Math.random().toString(36).slice(2, 8);

  const selectVehicle = async (v: Vehicle) => {
    setSelected(v);
    setShowBlockForm(false);
    setError(null);
    await loadAvailability(v.id);
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (typeFilter !== "all" && v.type !== typeFilter) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error: insertErr } = await supabase.from("blocked_slots").insert({
      vehicle_id: selected!.id,
      start_time: new Date(blockForm.start).toISOString(),
      end_time: new Date(blockForm.end).toISOString(),
      reason: blockForm.reason.trim() || null,
    });

    if (insertErr) {
      if (insertErr.code === "23P01") {
        setError("Slot overlaps with an existing booking or block. Choose a different time.");
      } else {
        setError(insertErr.message);
      }
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowBlockForm(false);
    setBlockForm({ start: "", end: "", reason: "" });
    await loadAvailability(selected!.id);
  };

  const handleDeleteBlock = async (id: string) => {
    const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
    if (!error && selected) {
      await loadAvailability(selected.id);
    }
  };

  const statusColor = (item: AvailItem) => {
    if (item.source === "blocked") return "bg-gray-200 border-l-gray-400";
    switch (item.status) {
      case "approved":
        return "bg-green-50 border-l-green-500";
      case "pending_review":
        return "bg-yellow-50 border-l-yellow-400";
      case "rejected":
        return "bg-red-50 border-l-red-500";
      case "cancelled":
        return "bg-gray-50 border-l-gray-400";
      default:
        return "bg-blue-50 border-l-blue-400";
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-navy-700">Availability</h2>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Vehicle selector */}
        <div>
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-navy-700">Select Vehicle</h3>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-9"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Type filter */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    typeFilter === f.value
                      ? "bg-navy-700 text-white"
                      : "bg-white text-navy-600 border border-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="max-h-[60vh] space-y-1 overflow-y-auto">
              {loading ? (
                <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
              ) : filteredVehicles.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">No vehicles.</p>
              ) : (
                filteredVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => selectVehicle(v)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      selected?.id === v.id
                        ? "bg-gold-50 text-gold-600 font-medium"
                        : "text-navy-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{getTypeIcon(v.type)}</span>
                    <span className="flex-1 truncate text-left">{v.name}</span>
                    <span className={getTypeBadgeClass(v.type)}>
                      {v.type.charAt(0).toUpperCase() + v.type.slice(1)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          {!selected ? (
            <div className="card flex items-center justify-center py-20 text-gray-400">
              Select a vehicle to view its availability
            </div>
          ) : (
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTypeIcon(selected.type)}</span>
                  <h3 className="font-semibold text-navy-700">{selected.name}</h3>
                  <span className={getTypeBadgeClass(selected.type)}>
                    {selected.type.charAt(0).toUpperCase() + selected.type.slice(1)}
                  </span>
                </div>
                <button onClick={() => setShowBlockForm(true)} className="btn-gold px-4 py-2">
                  <Plus size={16} className="mr-1" /> Add Block
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Legend */}
              <div className="mb-4 flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-50 border border-l-4 border-l-green-500" /> Approved</span>
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-yellow-50 border border-l-4 border-l-yellow-400" /> Pending</span>
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-red-50 border border-l-4 border-l-red-500" /> Rejected</span>
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-gray-200 border border-l-4 border-l-gray-400" /> Blocked</span>
              </div>

              {/* Add block form */}
              {showBlockForm && (
                <form onSubmit={handleBlock} className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-navy-700">Add Blocked Slot</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label-text">Start *</label>
                      <input
                        type="datetime-local"
                        className="input-field"
                        value={blockForm.start}
                        onChange={(e) => setBlockForm({ ...blockForm, start: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label-text">End *</label>
                      <input
                        type="datetime-local"
                        className="input-field"
                        value={blockForm.end}
                        onChange={(e) => setBlockForm({ ...blockForm, end: e.target.value })}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label-text">Reason (optional)</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Maintenance"
                        value={blockForm.reason}
                        onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowBlockForm(false); setError(null); }}
                      className="btn-outline flex-1"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="btn-primary flex-1">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : "Add Block"}
                    </button>
                  </div>
                </form>
              )}

              {/* Timeline items */}
              {occupied.length === 0 ? (
                <p className="py-10 text-center text-gray-400">
                  No bookings or blocks for this vehicle.
                </p>
              ) : (
                <div className="space-y-2">
                  {occupied.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between rounded-lg border border-l-4 p-3 ${statusColor(item)}`}>
                      <div>
                        <p className="text-sm font-medium text-navy-700">
                          {formatDateTime(item.start_time)} — {formatDateTime(item.end_time)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.source === "blocked"
                            ? `Blocked${item.reason ? `: ${item.reason}` : ""}`
                            : `Booking (${item.status?.replace("_", " ") || "unknown"})`}
                        </p>
                      </div>
                      {item.source === "blocked" && (
                        <button
                          onClick={() => {
                            const blockedId = blocked.find(
                              (b) => new Date(b.start_time).getTime() === new Date(item.start_time).getTime()
                            )?.id;
                            if (blockedId) handleDeleteBlock(blockedId);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
