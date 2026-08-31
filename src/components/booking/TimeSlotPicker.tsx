"use client";

import { useState, useMemo } from "react";
import { Vehicle, OccupiedSlot, DURATION_OPTIONS } from "@/lib/types";
import { BookingData } from "@/app/booking/[vehicleId]/page";
import {
  formatCurrency,
  generateTimeOptions,
  calculateAmount,
  addHours,
  toISOString,
} from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface Props {
  vehicle: Vehicle;
  occupiedSlots: OccupiedSlot[];
  data: BookingData;
  updateData: (partial: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function TimeSlotPicker({
  vehicle,
  occupiedSlots,
  data,
  updateData,
  onNext,
}: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(data.startTime ? data.startTime.split("T")[0] : today);
  const [startTime, setStartTime] = useState(
    data.startTime ? data.startTime.split("T")[1]?.slice(0, 5) : "10:00"
  );
  const [durationHours, setDurationHours] = useState<number | null>(null);

  const timeOptions = generateTimeOptions();

  const occupiedForDate = useMemo(() => {
    return occupiedSlots.filter((slot) => {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);
      const dayStart = new Date(`${date}T00:00:00`);
      const dayEnd = new Date(`${date}T23:59:59`);
      return slotStart < dayEnd && slotEnd > dayStart;
    });
  }, [occupiedSlots, date]);

  const isSlotOccupied = (hour: number, minute: number) => {
    const slotStart = new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
    return occupiedForDate.some((occ) => {
      const oStart = new Date(occ.start_time);
      const oEnd = new Date(occ.end_time);
      return slotStart < oEnd && oStart < slotEnd;
    });
  };

  const handleDurationSelect = (hours: number) => {
    setDurationHours(hours);
    const start = new Date(`${date}T${startTime}:00`);
    const end = addHours(start, hours);
    const amount = calculateAmount(vehicle.rate_per_hour, vehicle.rate_per_day, start.toISOString(), end.toISOString());
    updateData({
      startTime: toISOString(start),
      endTime: toISOString(end),
      amount,
    });
  };

  const canProceed = data.startTime && data.endTime && data.amount > 0;

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold text-navy-700">Pick Your Time Slot</h2>

      {/* Date */}
      <div className="mb-4">
        <label className="label-text">Date</label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => {
            setDate(e.target.value);
            setDurationHours(null);
            updateData({ startTime: "", endTime: "", amount: 0 });
          }}
          className="input-field"
        />
      </div>

      {/* Start time */}
      <div className="mb-4">
        <label className="label-text">Start Time</label>
        <select
          value={startTime}
          onChange={(e) => {
            setStartTime(e.target.value);
            setDurationHours(null);
            updateData({ startTime: "", endTime: "", amount: 0 });
          }}
          className="input-field"
        >
          {timeOptions.map((t) => {
            const [h, m] = t.split(":").map(Number);
            const occupied = isSlotOccupied(h, m);
            return (
              <option key={t} value={t} disabled={occupied}>
                {t} {occupied ? "(Occupied)" : ""}
              </option>
            );
          })}
        </select>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="label-text">Duration</label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.hours}
              onClick={() => handleDurationSelect(opt.hours)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                durationHours === opt.hours
                  ? "border-gold-400 bg-gold-50 text-gold-600"
                  : "border-gray-200 text-navy-600 hover:border-gold-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Occupied legend */}
      {occupiedForDate.length > 0 && (
        <div className="mb-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <span className="mr-3 inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" /> Occupied
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold-400" /> Selected
          </span>
        </div>
      )}

      {/* Live total */}
      {canProceed && (
        <div className="mb-6 rounded-lg border border-gold-200 bg-gold-50 p-4">
          <p className="text-sm text-gray-600">
            {durationHours !== null && durationHours >= 24
              ? `${Math.ceil(durationHours / 24)} day(s) × ${formatCurrency(vehicle.rate_per_day)}`
              : `${durationHours}h × ${formatCurrency(vehicle.rate_per_hour)}/hr`}
          </p>
          <p className="mt-1 text-xl font-bold text-navy-700">
            Total: {formatCurrency(data.amount)}
          </p>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="btn-gold w-full"
      >
        Continue <ChevronRight size={16} className="ml-1" />
      </button>
    </div>
  );
}
