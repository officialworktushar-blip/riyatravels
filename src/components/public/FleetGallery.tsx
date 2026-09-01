import Image from "next/image";
import { Vehicle } from "@/lib/types";

const ASPECT_RATIOS = [
  "aspect-[4/5]",
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-video",
];

export default function FleetGallery({ vehicles }: { vehicles: Vehicle[] }) {
  const gallery = vehicles.slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">
        Our Fleet Gallery
      </h2>
      <p className="mt-2 text-gray-500">
        A glimpse of the vehicles waiting to take you places.
      </p>

      {gallery.length === 0 ? (
        <p className="py-12 text-center text-gray-400">
          Gallery coming soon.
        </p>
      ) : (
        <div className="mt-10 grid items-start gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((vehicle, i) => (
            <div
              key={vehicle.id}
              className={`relative overflow-hidden rounded-xl ${ASPECT_RATIOS[i % ASPECT_RATIOS.length]}`}
            >
              <Image
                src={vehicle.image_url}
                alt={vehicle.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent p-4 pt-10">
                <h3 className="text-sm font-semibold text-white">{vehicle.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
