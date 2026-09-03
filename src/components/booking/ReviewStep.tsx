"use client";

import { Vehicle } from "@/lib/types";
import { BookingData } from "@/app/booking/[vehicleId]/page";
import {
  formatCurrency,
  formatDateTime,
  getTypeBadgeClass,
  getTypeIcon,
} from "@/lib/utils";
import { ChevronLeft, Send } from "lucide-react";

interface Props {
  vehicle: Vehicle;
  data: BookingData;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function ReviewStep({
  vehicle,
  data,
  onBack,
  onSubmit,
  submitting,
}: Props) {
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold text-navy-700">Review & Submit</h2>

      <div className="space-y-4">
        {/* Vehicle */}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Vehicle</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xl">{getTypeIcon(vehicle.type)}</span>
            <span className="font-semibold text-navy-700">{vehicle.name}</span>
            <span className={getTypeBadgeClass(vehicle.type)}>
              {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
            </span>
            {vehicle.vehicle_number && (
              <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-navy-600">
                {vehicle.vehicle_number}
              </span>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Time Slot</p>
          <p className="mt-1 font-semibold text-navy-700">
            {formatDateTime(data.startTime)}
          </p>
          <p className="text-sm text-gray-500">to</p>
          <p className="font-semibold text-navy-700">{formatDateTime(data.endTime)}</p>
        </div>

        {/* Customer */}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Customer</p>
          <p className="mt-1 font-semibold text-navy-700">{data.customerName}</p>
          {data.customerEmail && <p className="text-sm text-gray-500">{data.customerEmail}</p>}
          <p className="text-sm text-gray-500">{data.customerWhatsApp}</p>
        </div>

        {/* Documents */}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Documents</p>
          <div className="mt-1 flex gap-4 text-sm">
            <span className={data.licenseFront ? "text-green-600" : "text-red-500"}>
              DL Front: {data.licenseFront ? "Uploaded" : "Missing"}
            </span>
            <span className={data.licenseBack ? "text-green-600" : "text-red-500"}>
              DL Back: {data.licenseBack ? "Uploaded" : "Missing"}
            </span>
            <span className={data.paymentScreenshot ? "text-green-600" : "text-red-500"}>
              Payment: {data.paymentScreenshot ? "Uploaded" : "Missing"}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="rounded-lg border border-gold-200 bg-gold-50 p-4 text-center">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="mt-1 text-2xl font-bold text-navy-700">
            {formatCurrency(data.amount)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={onBack} disabled={submitting} className="btn-outline flex-1">
          <ChevronLeft size={16} className="mr-1" /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="btn-primary flex-1"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </span>
          ) : (
            <>
              <Send size={16} className="mr-1" /> Submit Booking
            </>
          )}
        </button>
      </div>
    </div>
  );
}
