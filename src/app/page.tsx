import { createClient } from "@/lib/supabase/server";
import { Vehicle, Testimonial } from "@/lib/types";
import VehicleGrid from "@/components/public/VehicleGrid";
import HowItWorks from "@/components/public/HowItWorks";
import WhyChoose from "@/components/public/WhyChoose";
import TestimonialsSection from "@/components/public/Testimonials";
import FAQ from "@/components/public/FAQ";
import Image from "next/image";

export const revalidate = 60;

const DEFAULT_HERO_HEADING = "Ride with Freedom";
const DEFAULT_HERO_SUBHEADING =
  "Affordable scooters, bikes & cars on rent. Pick your ride, choose your time, and go.";

export default async function HomePage() {
  const supabase = await createClient();

  const [vehiclesRes, settingsRes, testimonialsRes] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .eq("is_active", true)
      .order("type")
      .order("name"),
    supabase.from("app_settings").select("*").eq("id", 1).single(),
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const vehicles = (vehiclesRes.data as Vehicle[]) ?? [];
  const settings = settingsRes.data as Record<string, unknown> | null;
  const testimonials = (testimonialsRes.data as Testimonial[]) ?? [];

  const heroHeading = (settings?.hero_heading as string) || DEFAULT_HERO_HEADING;
  const heroSubheading = (settings?.hero_subheading as string) || DEFAULT_HERO_SUBHEADING;
  const heroImageUrl = settings?.hero_image_url as string | null;

  return (
    <div>
      {/* Hero */}
      <section className="relative aspect-[4/3] w-full overflow-hidden bg-navy-700 sm:aspect-[16/9]">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={heroHeading}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5" />
        )}

        {/* Content with contrast card */}
        <div className="relative flex h-full w-full items-center justify-center px-4 text-center">
          <div className="max-w-3xl rounded-2xl bg-[#16233F]/60 px-6 py-6 shadow-lg backdrop-blur-sm sm:px-10 sm:py-8">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {heroHeading.split(" ").map((word, i) => {
                const isGold =
                  word.toLowerCase() === "freedom" ||
                  i === heroHeading.split(" ").length - 1;
                return isGold ? (
                  <span key={i} className="text-gold-400">
                    {word}{" "}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                );
              })}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-100 sm:text-xl">
              {heroSubheading}
            </p>
          </div>
        </div>
      </section>

      {/* Vehicles */}
      <section id="vehicles" className="mx-auto max-w-7xl px-4 py-16">
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
