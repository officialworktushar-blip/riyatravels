import { createClient } from "@/lib/supabase/server";
import { Vehicle } from "@/lib/types";
import VehicleGrid from "@/components/public/VehicleGrid";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("is_active", true)
    .order("type")
    .order("name");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-700">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ride with <span className="text-gold-400">Freedom</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Affordable scooters, bikes &amp; cars on rent. Pick your ride, choose your time, and go.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
      </section>

      {/* Vehicles */}
      <section id="vehicles" className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-2 text-2xl font-bold text-navy-700">Our Fleet</h2>
        <p className="mb-8 text-gray-500">Browse and book from our available vehicles</p>
        <VehicleGrid vehicles={(vehicles as Vehicle[]) ?? []} />
      </section>
    </div>
  );
}
