export type VehicleType = "scooty" | "bike" | "car";
export type BookingStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "cancelled";

export interface Vehicle {
  id: string;
  type: VehicleType;
  name: string;
  image_url: string;
  rate_per_hour: number;
  rate_per_day: number;
  seats_or_capacity: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string;
  vehicle_id: string;
  start_time: string;
  end_time: string;
  license_front_url: string | null;
  license_back_url: string | null;
  payment_screenshot_url: string | null;
  amount: number;
  status: BookingStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  vehicle?: Vehicle;
}

export interface OccupiedSlot {
  vehicle_id: string;
  start_time: string;
  end_time: string;
  source: "booking" | "blocked";
}

export interface AppSettings {
  id: number;
  upi_id: string | null;
  scanner_image_url: string | null;
  hero_image_url: string | null;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_active: boolean;
  created_at: string;
}

export interface BlockedSlot {
  id: string;
  vehicle_id: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  created_at: string;
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  scooty: "Scooty",
  bike: "Bike",
  car: "Car",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending_review: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const DURATION_OPTIONS = [
  { label: "2 Hours", hours: 2 },
  { label: "4 Hours", hours: 4 },
  { label: "6 Hours", hours: 6 },
  { label: "12 Hours", hours: 12 },
  { label: "1 Day", hours: 24 },
] as const;
