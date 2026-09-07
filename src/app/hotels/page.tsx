import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/common/section";
import { TravelImage } from "@/components/common/travel-image";
import { HeroSearch } from "@/features/search/hero-search";
import { DESTINATIONS } from "@/config/destinations";
import { siteConfig } from "@/config/site";
import { defaultFlightState, defaultHotelState, hotelResultsHref } from "@/lib/utils/search-params";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Hotel search",
  description:
    "Search hotels, apartments and resorts worldwide. Compare nightly rates, filter by star rating, guest score and amenities, then book with the provider.",
  alternates: { canonical: "/hotels" },
  openGraph: {
    title: `Hotel search · ${siteConfig.name}`,
    description: "Compare hotels worldwide and book directly with the provider.",
    url: `${siteConfig.url}/hotels`,
  },
};

export default function HotelsPage() {
  const hotelState = defaultHotelState();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Find somewhere to stay
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Hotels, apartments and resorts worldwide. Compare nightly rates for your dates, then
              book directly with the provider.
            </p>
          </div>
          <div className="mt-8">
            <HeroSearch
              defaultTab="hotels"
              flightState={defaultFlightState()}
              hotelState={hotelState}
            />
          </div>
        </div>
      </section>

      <Section
        title="Hotel destinations"
        description="Popular cities with a wide choice of stays."
        action={{ href: "/destinations", label: "All destinations" }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map((destination) => (
            <Link
              key={destination.slug}
              href={hotelResultsHref({ ...hotelState, destination: destination.name })}
              className="group overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-lift"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <TravelImage
                  src={destination.heroImage}
                  alt={destination.name}
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-ink">Hotels in {destination.name}</p>
                <p className="text-xs text-ink-subtle">{destination.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
