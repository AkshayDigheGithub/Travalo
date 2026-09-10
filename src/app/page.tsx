import Link from "next/link";
import { ArrowRight, BedDouble, Globe2, Plane, Scale } from "lucide-react";

import { Section } from "@/components/common/section";
import { TravelImage } from "@/components/common/travel-image";
import { DestinationCard } from "@/features/destinations/destination-card";
import { HeroSearch } from "@/features/search/hero-search";
import { FEATURED_DESTINATIONS, HOTEL_DESTINATIONS, getDestination } from "@/config/destinations";
import { FEATURED_ROUTES, routeHref, routeSlug } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { defaultFlightState, defaultHotelState, hotelResultsHref } from "@/lib/utils/search-params";

export const revalidate = 3600;

const BENEFITS = [
  {
    icon: Scale,
    title: "Compare options",
    body: "One search, results from across our travel partners, sorted the way you want — price, duration or departure time.",
  },
  {
    icon: Globe2,
    title: "Global destinations",
    body: "Airports and cities worldwide, with prices shown in the currency you actually think in.",
  },
  {
    icon: Plane,
    title: "Simple booking",
    body: "No account, no booking fee from us. Pick a deal and finish the booking directly with the provider.",
  },
];

export default function HomePage() {
  const flightState = defaultFlightState();
  const hotelState = defaultHotelState();

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        {/* Soft brand wash rather than a heavy gradient. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80rem_40rem_at_75%_-15%,var(--color-brand-100),transparent_60%)]"
        />
        <div className="container-page relative py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink-muted">
              <span className="size-1.5 rounded-full bg-brand-600" aria-hidden="true" />
              Flights and hotels, one search
            </p>
            {/* The H1 states what the page does in the words the copy beneath it
                uses, so heading and body back each other up instead of the
                heading introducing vocabulary that appears nowhere else. */}
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Compare flights and hotels worldwide
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Compare flights and hotels worldwide and find great travel deals — then book straight
              with the provider.
            </p>
          </div>

          <div className="mt-9">
            <HeroSearch flightState={flightState} hotelState={hotelState} />
          </div>
        </div>
      </section>

      <Section
        title="Popular destinations"
        description="Curated city guides with the practical details, plus live flight and hotel search for each."
        action={{ href: "/destinations", label: "All destinations" }}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FEATURED_DESTINATIONS.map((destination, index) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              priority={index < 4}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Popular flight routes"
        description="Journey times, the airlines that fly each route and when fares are usually cheapest — then search your own dates."
        action={{ href: "/flights", label: "All routes" }}
        className="pt-0"
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_ROUTES.map((route) => (
            <li key={routeSlug(route)}>
              <Link
                href={routeHref(route)}
                className="group flex items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    <span className="truncate">{route.fromCity}</span>
                    <ArrowRight className="size-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
                    <span className="truncate">{route.toCity}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-subtle">
                    {route.from} → {route.to}
                  </span>
                </span>
                <Plane
                  className="size-4 shrink-0 text-ink-subtle transition-colors group-hover:text-brand-600"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Where to stay"
        description="Hotel search for the destinations travellers ask about most."
        action={{ href: "/hotels", label: "Search hotels" }}
        className="pt-0"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {HOTEL_DESTINATIONS.map((slug) => {
            const destination = getDestination(slug);
            if (!destination) return null;
            return (
              <Link
                key={slug}
                href={hotelResultsHref({ ...hotelState, destination: destination.name })}
                className="group relative overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-lift"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <TravelImage
                    src={destination.heroImage}
                    alt={destination.name}
                    sizes="(max-width: 640px) 100vw, 20vw"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {destination.name}
                    </span>
                    <span className="block truncate text-xs text-ink-subtle">
                      {destination.country}
                    </span>
                  </span>
                  <BedDouble
                    className="size-4 shrink-0 text-ink-subtle transition-colors group-hover:text-brand-600"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <section className="border-t border-line bg-surface">
        <div className="container-page py-14 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Why search with {siteConfig.name}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="rounded-card border border-line bg-canvas p-6">
                  <span className="mb-4 grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-semibold text-ink">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{benefit.body}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-ink-subtle">
            {siteConfig.name} shows prices from our travel partners and links you to their sites to
            book. We don&apos;t take payment or issue tickets, and prices are confirmed by the
            provider before you pay.
          </p>
        </div>
      </section>
    </>
  );
}
