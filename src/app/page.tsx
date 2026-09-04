import { createClient } from "@/lib/supabase/server";
import { Vehicle, Testimonial } from "@/lib/types";
import VehicleGrid from "@/components/public/VehicleGrid";
import HowItWorks from "@/components/public/HowItWorks";
import WhyChoose from "@/components/public/WhyChoose";
import TestimonialsSection from "@/components/public/Testimonials";
import FAQ from "@/components/public/FAQ";
import Image from "next/image";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [vehiclesRes, settingsRes, testimonialsRes] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .eq("is_active", true)
      .order("type")
      .order("name"),
    supabase.from("app_settings").select("hero_image_url").eq("id", 1).single(),
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const vehicles = (vehiclesRes.data as Vehicle[]) ?? [];
  const settings = settingsRes.data as { hero_image_url: string | null } | null;
  const testimonials = (testimonialsRes.data as Testimonial[]) ?? [];

  const heroImageUrl = settings?.hero_image_url ?? null;

  return (
    <div>
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-navy-700">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt="Riya Travels"
              fill
              className="object-contain sm:object-cover sm:object-center"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5" />
          )}
        </div>
      </section>

      {/* Vehicles */}
      <section id="vehicles" className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <h2 className="mb-2 text-2xl font-bold text-navy-700">Our Fleet</h2>
        <p className="mb-8 text-gray-500">Browse and book from our available vehicles</p>
        <VehicleGrid vehicles={vehicles} />
      </section>

      {/* How It Works */}
      <div className="bg-white">
        <HowItWorks />
      </div>

      {/* Why Choose */}
      <WhyChoose />

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="bg-white">
          <TestimonialsSection testimonials={testimonials} />
        </div>
      )}

      {/* FAQ */}
      <FAQ />
    </div>
  );
}
