"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Booking, BookingStatus, VehicleType } from "@/lib/types";
import {
  getTypeBadgeClass,
  formatDateTime,
  formatCurrency,
} from "@/lib/utils";

const STATUS_FILTERS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "Pending", value: "pending_review" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const TYPE_FILTERS: { label: string; value: VehicleType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Scooty", value: "scooty" },
  { label: "Bike", value: "bike" },
  { label: "Car", value: "car" },
];

function StatusBadge({ status }: { status: BookingStatus }) {
  switch (status) {
    case "pending_review":
      return <span className="badge-pending">Pending</span>;
    case "approved":
      return <span className="badge-approved">Approved</span>;
    case "rejected":
      return <span className="badge-rejected">Rejected</span>;
    case "cancelled":
      return <span className="badge-cancelled">Cancelled</span>;
  }
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<VehicleType | "all">("all");

  const supabase = createClient();

  useEffect(() => {
    loadBookings();
  }, [supabase]);

  const loadBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*, vehicle:vehicles(*)")
      .order("created_at", { ascending: false });
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (typeFilter !== "all" && b.vehicle?.type !== typeFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-navy-700">Bookings</h2>
        <button onClick={loadBookings} className="btn-ghost">
          Refresh
        </button>
      </div>

      {/* Status filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            statusFilter === "all"
              ? "bg-navy-700 text-white"
              : "bg-white text-navy-600 border border-gray-200"
          }`}
        >
          All
        </button>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              statusFilter === f.value
                ? "bg-navy-700 text-white"
                : "bg-white text-navy-600 border border-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
              typeFilter === f.value
                ? "border-gold-400 bg-gold-50 text-gold-600"
                : "border-gray-200 text-navy-600 hover:border-gold-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-gray-400">No bookings found.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 font-medium text-gray-500">Vehicle</th>
                <th className="hidden px-4 py-3 font-medium text-gray-500 md:table-cell">Time Slot</th>
                <th className="px-4 py-3 font-medium text-gray-500">Amount</th>
                <th className="hidden px-4 py-3 font-medium text-gray-500 md:table-cell">Submitted</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-navy-700">{b.customer_name}</span>
                    <span className="block text-xs text-gray-400 md:hidden">
                      {formatDateTime(b.start_time)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="hover:underline">
                      <span className="font-medium text-navy-600">{b.vehicle?.name}</span>
                    </Link>
                    {b.vehicle?.type && (
                      <span className={`mt-0.5 block w-fit ${getTypeBadgeClass(b.vehicle.type)}`}>
                        {b.vehicle.type.charAt(0).toUpperCase() + b.vehicle.type.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                    {formatDateTime(b.start_time)} — {formatDateTime(b.end_time)}
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-700">
                    {formatCurrency(b.amount)}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                    {formatDateTime(b.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={b.status} />
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="text-xs text-gold-500 hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
