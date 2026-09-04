import Link from "next/link";
import Image from "next/image";
import { Vehicle } from "@/lib/types";
import {
  getTypeBadgeClass,
  getTypeIcon,
  getVehiclePricingDisplay,
} from "@/lib/utils";
import { Clock, Calendar, Users, Hash } from "lucide-react";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const pricing = getVehiclePricingDisplay(vehicle);

  return (
    <div className="card group">
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        {vehicle.image_url ? (
          <Image
            src={vehicle.image_url}
            alt={vehicle.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            {getTypeIcon(vehicle.type)}
          </div>
        )}
        <span className={`absolute left-3 top-3 ${getTypeBadgeClass(vehicle.type)}`}>
          {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-navy-700">{vehicle.name}</h3>

        <div className="mt-3 space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gold-400 shrink-0" />
            <span>{pricing.primary}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gold-400 shrink-0" />
            <span>{pricing.secondary}</span>
          </div>
          {vehicle.vehicle_number && (
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-gold-400 shrink-0" />
              <span>{vehicle.vehicle_number}</span>
            </div>
          )}
          {vehicle.seats_or_capacity && (
            <div className="flex items-center gap-2">
              <Users size={14} className="text-gold-400 shrink-0" />
              <span>{vehicle.seats_or_capacity}</span>
            </div>
          )}
        </div>

        <Link
          href={`/booking/${vehicle.id}`}
          className="btn-gold mt-5 w-full text-center min-h-[44px]"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
