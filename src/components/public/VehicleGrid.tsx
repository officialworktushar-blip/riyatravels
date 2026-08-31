"use client";

import { useState } from "react";
import { Vehicle, VehicleType } from "@/lib/types";
import VehicleCard from "./VehicleCard";

const FILTERS: { label: string; value: VehicleType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Scooty", value: "scooty" },
  { label: "Bike", value: "bike" },
  { label: "Car", value: "car" },
];

export default function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  const [filter, setFilter] = useState<VehicleType | "all">("all");

  const filtered =
    filter === "all"
      ? vehicles
      : vehicles.filter((v) => v.type === filter);

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-navy-700 text-white shadow-md"
                : "bg-white text-navy-600 border border-gray-200 hover:border-navy-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-gray-400">
          No vehicles found for this category.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
