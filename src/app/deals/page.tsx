import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";

import { Section } from "@/components/common/section";
import { TravelImage } from "@/components/common/travel-image";
import { JsonLd } from "@/components/common/json-ld";
import { DESTINATIONS, POPULAR_ROUTES } from "@/config/destinations";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { addDays, formatShortDate, todayIso } from "@/lib/utils/date";
import {
  defaultFlightState,
  defaultHotelState,
  flightResultsHref,
  hotelResultsHref,
} from "@/lib/utils/search-params";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/deals",
  title: "Travel deals",
  description:
    "Popular routes and destinations to search right now. Every link runs a live search — prices are whatever our travel partners are showing today.",
});

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const expired = params.deal === "expired";

  const departure = addDays(todayIso(), 21);
  const returnDate = addDays(departure, 7);
  const flightState = defaultFlightState();
  const hotelState = defaultHotelState();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-12 sm:py-16">
          {expired ? (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-xl border border-accent-500/30 bg-accent-50 px-4 py-3 text-sm text-ink"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden="true" />
              <p>
                That deal link has expired. Prices move quickly — run the search again below to see
                what&apos;s available now.
              </p>
            </div>
          ) : null}

          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Deals worth a search
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              We don&apos;t hold a list of discounts — fares and rates change by the hour. What we
              can do is point you at the routes and destinations people search most, with the search
              already filled in. Prices shown after you click are whatever our travel partners have
              at that moment.
            </p>
          </div>
        </div>
      </section>

      <Section
        title="Flight routes to search"
        description={`Prefilled for ${formatShortDate(departure)} – ${formatShortDate(returnDate)}. Change the dates on the results page.`}
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_ROUTES.map((route) => (
            <li key={`${route.from}-${route.to}`}>
              <Link
                href={flightResultsHref({
                  ...flightState,
                  from: route.from,
                  to: route.to,
                  departure,
                  return: returnDate,
                })}
                className="group flex items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {route.fromCity} to {route.toCity}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-subtle">
                    {route.from} → {route.to}
                  </span>
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Stays to compare" className="pt-0">
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
                <p className="text-sm font-medium text-ink">Stays in {destination.name}</p>
                <p className="text-xs text-ink-subtle">{destination.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <JsonLd
        schema={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Deals", path: "/deals" },
          ]),
        ]}
      />
    </>
  );
}
