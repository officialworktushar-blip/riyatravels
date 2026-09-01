import { Star, Quote } from "lucide-react";
import { Testimonial } from "@/lib/types";

export default function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const active = testimonials.filter((t) => t.is_active);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">
        What Our Customers Say
      </h2>
      <p className="mt-2 text-gray-500">
        Real experiences from people who chose to ride with us.
      </p>

      {active.length === 0 ? (
        <p className="py-12 text-center text-gray-400">
          No testimonials yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <Quote className="mb-4 text-gold-400" size={28} />
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={16}
                    className={
                      idx < t.rating
                        ? "fill-gold-400 text-gold-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-gray-600">
                “{t.comment}”
              </blockquote>
              <figcaption className="mt-5 text-sm font-semibold text-navy-700">
                — {t.customer_name}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
