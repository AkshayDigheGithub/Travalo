import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/components/common/section";
import { HeroSearch } from "@/features/search/hero-search";
import { POPULAR_ROUTES } from "@/config/destinations";
import { siteConfig } from "@/config/site";
import { addDays, todayIso } from "@/lib/utils/date";
import {
  defaultFlightState,
  defaultHotelState,
  flightResultsHref,
} from "@/lib/utils/search-params";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Flight search",
  description:
    "Search and compare flights worldwide. Filter by stops, airline, departure time and price, then book directly with the provider.",
  alternates: { canonical: "/flights" },
  openGraph: {
    title: `Flight search · ${siteConfig.name}`,
    description: "Search and compare flights worldwide, then book directly with the provider.",
    url: `${siteConfig.url}/flights`,
  },
};

export default function FlightsPage() {
  const departure = addDays(todayIso(), 21);
  const flightState = defaultFlightState();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Compare flights worldwide
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              One search across our travel partners. Filter by stops, airline, departure window and
              price — then finish the booking on the provider&apos;s own site.
            </p>
          </div>
          <div className="mt-8">
            <HeroSearch
              defaultTab="flights"
              flightState={flightState}
              hotelState={defaultHotelState()}
            />
          </div>
        </div>
      </section>

      <Section title="Popular routes" description="Jump straight into a prefilled search.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_ROUTES.map((route) => (
            <li key={`${route.from}-${route.to}`}>
              <Link
                href={flightResultsHref({
                  ...flightState,
                  from: route.from,
                  to: route.to,
                  departure,
                  return: addDays(departure, 7),
                })}
                className="group flex items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
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

      <Section title="How flight search works" className="pt-0">
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Search",
              body: "Enter your route, dates and travellers. We query our travel partners for the fares available on those dates.",
            },
            {
              step: "2",
              title: "Compare",
              body: "Filter by stops, airline, departure time and duration. Sort by cheapest, fastest or our recommended balance of the two.",
            },
            {
              step: "3",
              title: "Book with the provider",
              body: "Choose a deal and continue to the provider's site to complete the booking. We never take payment or issue tickets.",
            },
          ].map((item) => (
            <li key={item.step} className="rounded-card border border-line bg-surface p-6">
              <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {item.step}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
