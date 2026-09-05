import { Vehicle, VehicleType } from "./types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getTypeBadgeClass(type: VehicleType): string {
  switch (type) {
    case "scooty":
      return "badge-scooty";
    case "bike":
      return "badge-bike";
    case "car":
      return "badge-car";
  }
}

export function getTypeIcon(type: VehicleType): string {
  switch (type) {
    case "scooty":
      return "🛵";
    case "bike":
      return "🏍️";
    case "car":
      return "🚗";
  }
}

export function calculateAmount(
  vehicle: Vehicle,
  startTime: string,
  endTime: string
): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Minimum-order packages (e.g. scooty): min amount prepaid + per-hour extra after the minimum
  if (
    vehicle.min_hours > 0 &&
    vehicle.min_amount > 0 &&
    vehicle.extra_rate_per_hour &&
    vehicle.extra_rate_per_hour > 0
  ) {
    if (diffHours <= vehicle.min_hours) return vehicle.min_amount;
    return (
      vehicle.min_amount +
      Math.ceil(diffHours - vehicle.min_hours) * vehicle.extra_rate_per_hour
    );
  }

  // Minimum-order packages without an extra per-hour rate (e.g. car: 12 hrs = Rs.1500, full day = day rate)
  if (vehicle.min_hours > 0 && vehicle.min_amount > 0) {
    if (diffHours >= 24) return Math.ceil(diffHours / 24) * vehicle.rate_per_day;
    if (diffHours <= vehicle.min_hours) return vehicle.min_amount;
    return Math.ceil(diffHours) * vehicle.rate_per_hour;
  }

  // Standard hourly / full-day pricing
  if (diffHours >= 24) {
    return Math.ceil(diffHours / 24) * vehicle.rate_per_day;
  }

  return Math.ceil(diffHours) * vehicle.rate_per_hour;
}

export function getPricingSummary(vehicle: Vehicle, hours: number): string {
  const hasMinPackage = vehicle.min_hours > 0 && vehicle.min_amount > 0;
  const extraRate = vehicle.extra_rate_per_hour;
  const hasExtraRate = extraRate !== null && extraRate > 0;

  if (hasMinPackage && hasExtraRate) {
    if (hours <= vehicle.min_hours) {
      return `${vehicle.min_hours} hrs min · ${formatCurrency(vehicle.min_amount)} prepaid`;
    }
    return `${vehicle.min_hours} hrs min (${formatCurrency(vehicle.min_amount)}) + ${hours - vehicle.min_hours}h × ${formatCurrency(extraRate)}/hr`;
  }

  if (hasMinPackage) {
    if (hours <= vehicle.min_hours) {
      return `${vehicle.min_hours} hrs min · ${formatCurrency(vehicle.min_amount)}`;
    }
    return `${Math.ceil(hours / 24)} day(s) × ${formatCurrency(vehicle.rate_per_day)}`;
  }

  if (hours >= 24) {
    return `${Math.ceil(hours / 24)} day(s) × ${formatCurrency(vehicle.rate_per_day)}`;
  }

  return `${hours}h × ${formatCurrency(vehicle.rate_per_hour)}/hr`;
}

export interface VehiclePricingDisplay {
  primary: string;
  secondary: string;
}

export function getVehiclePricingDisplay(
  vehicle: Vehicle
): VehiclePricingDisplay {
  const hasMinPackage = vehicle.min_hours > 0 && vehicle.min_amount > 0;
  const extraRate = vehicle.extra_rate_per_hour;
  const hasExtraRate = extraRate !== null && extraRate > 0;

  if (hasMinPackage && hasExtraRate) {
    return {
      primary: `Min ${vehicle.min_hours} hrs · ${formatCurrency(vehicle.min_amount)} prepaid`,
      secondary: `${formatCurrency(vehicle.rate_per_day)} / full day · ${formatCurrency(extraRate)} / hr after ${vehicle.min_hours} hrs`,
    };
  }

  if (hasMinPackage) {
    return {
      primary: `Min ${vehicle.min_hours} hrs · ${formatCurrency(vehicle.min_amount)}`,
      secondary: `${formatCurrency(vehicle.rate_per_day)} / full day`,
    };
  }

  return {
    primary: `${formatCurrency(vehicle.rate_per_hour)} / hour`,
    secondary: `${formatCurrency(vehicle.rate_per_day)} / day`,
  };
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setTime(result.getTime() + hours * 60 * 60 * 1000);
  return result;
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

export function isOverlapping(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  return s1 < e2 && s2 < e1;
}

export function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressed = new File([blob!], file.name.replace(/\.[^.]+$/, ".webp"), {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          "image/webp",
          quality
        );
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 6; h <= 22; h++) {
    options.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 22) options.push(`${String(h).padStart(2, "0")}:30`);
  }
  return options;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[+]?[\d\s-]{8,15}$/.test(phone);
}

export function getMinDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return now.toISOString().slice(0, 16);
}
