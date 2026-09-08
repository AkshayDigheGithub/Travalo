import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BedDouble, CalendarClock, Plane, Ruler, Timer, Wallet } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/common/json-ld";
import { getDestination } from "@/config/destinations";
import {
  FLIGHT_ROUTES,
  getRoute,
  relatedRoutes,
  reverseRoute,
  routeHref,
  routeSlug,
  type FlightRoute,
} from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import { addDays, todayIso } from "@/lib/utils/date";
import {
  defaultFlightState,
  defaultHotelState,
  flightResultsHref,
  hotelResultsHref,
} from "@/lib/utils/search-params";

// The copy is static; only the prefilled example dates need refreshing.
export const revalidate = 86400;

/**
 * Curated routes only. Without this, any `city-to-city` string would render a
 * page, which is exactly the thin, auto-generated surface these pages exist to
 * avoid — anything not in FLIGHT_ROUTES is a 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return FLIGHT_ROUTES.map((route) => ({ route: routeSlug(route) }));
}

function title(route: FlightRoute): string {
  return `Flights from ${route.fromCity} to ${route.toCity}`;
}

function description(route: FlightRoute): string {
  const duration = route.nonstopDuration
    ? `Nonstop flights take ${route.nonstopDuration.split(",")[0].trim()}.`
    : "";
  return `Compare ${route.fromCity} (${route.from}) to ${route.toCity} (${route.to}) flights. ${duration} Airlines, journey time, when fares are cheapest and how far ahead to book.`.replace(
    /\s+/g,
    " ",
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ route: string }>;
}): Promise<Metadata> {
  const route = getRoute((await params).route);
  if (!route) return { title: "Route not found" };

  return pageMetadata({
    path: routeHref(route),
    title: title(route),
    description: description(route),
    type: "article",
    // `null` hands the card to the colocated opengraph-image route, which draws
    // this specific route rather than the generic site image.
    image: null,
  });
}

export default async function FlightRoutePage({ params }: { params: Promise<{ route: string }> }) {
  const route = getRoute((await params).route);
  if (!route) notFound();

  const departure = addDays(todayIso(), 21);
  const returnDate = addDays(departure, 7);
  const searchHref = flightResultsHref({
    ...defaultFlightState(),
    from: route.from,
    to: route.to,
    departure,
    return: returnDate,
  });
  const hotelHref = hotelResultsHref({
    ...defaultHotelState(),
    destination: route.toCity,
  });

  const guide = route.destinationSlug ? getDestination(route.destinationSlug) : undefined;
  const reverse = reverseRoute(route);
  const related = relatedRoutes(route);

  const facts = [
    { icon: Timer, label: "Nonstop time", value: route.nonstopDuration ?? "No nonstop service" },
    { icon: Ruler, label: "Distance", value: `${route.distanceKm.toLocaleString("en")} km` },
    { icon: Wallet, label: "Cheapest months", value: route.cheapestTime },
    { icon: CalendarClock, label: "When to book", value: route.whenToBook },
  ];

  return (
    <article>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-ink-subtle">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="transition-colors hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/flights" className="transition-colors hover:text-ink">
                  Flights
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink">
                {route.fromCity} to {route.toCity}
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {route.from} → {route.to}
              </Badge>
              {route.nonstopDuration ? <Badge variant="brand">Nonstop available</Badge> : null}
              <Badge variant="neutral">
                {route.fromCountry} → {route.toCountry}
              </Badge>
            </div>

            <h1 className="text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Flights from {route.fromCity} to {route.toCity}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
              {route.intro}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={searchHref}>
                  <Plane className="size-4" aria-hidden="true" />
                  Search this route
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={hotelHref}>
                  <BedDouble className="size-4" aria-hidden="true" />
                  Hotels in {route.toCity}
                </Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-ink-subtle">
              Opens a live search for example dates. Change them on the results page.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_18rem] lg:gap-12">
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {route.fromCity} to {route.toCity} at a glance
            </h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {facts.map((fact) => {
                const Icon = fact.icon;
                return (
                  <div key={fact.label} className="rounded-card border border-line bg-surface p-4">
                    <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-ink-subtle uppercase">
                      <Icon className="size-3.5 text-brand-600" aria-hidden="true" />
                      {fact.label}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-ink">{fact.value}</dd>
                  </div>
                );
              })}
            </dl>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Airlines flying {route.fromCity} to {route.toCity}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              {route.nonstopDuration
                ? `These carriers operate the route nonstop. Availability varies by day, and connecting itineraries on other airlines often price below the nonstop fare.`
                : `There is no scheduled nonstop service, so every itinerary connects. These are the carriers that most often appear on this route.`}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {route.airlines.map((airline) => (
                <li key={airline}>
                  <span className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink">
                    {airline}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Airports and practical detail
            </h2>
            <dl className="mt-4 divide-y divide-line rounded-card border border-line bg-surface">
              {route.airportTips.map((tip) => (
                <div key={tip.label} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="text-sm font-medium text-ink">{tip.label}</dt>
                  <dd className="text-sm leading-relaxed text-ink-muted">{tip.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              When to book {route.fromCity} to {route.toCity}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">{route.whenToBook}</p>
            <p className="mt-3 leading-relaxed text-ink-muted">{route.cheapestTime}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-subtle">
              Fares move daily and none of this is a guarantee. Run the search for your own dates to
              see what our travel partners are actually showing today.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="mt-3">
              {route.faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-panel border border-line bg-brand-50 p-5">
            <h2 className="text-sm font-semibold text-brand-900">
              Search {route.from} → {route.to}
            </h2>
            <p className="mt-1.5 text-sm text-brand-800">
              Live fares from our travel partners for your dates.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild size="sm">
                <Link href={searchHref}>Compare flights</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/flights">Change the route</Link>
              </Button>
            </div>
          </div>

          {guide ? (
            <div className="rounded-panel border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">Going to {guide.name}?</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{guide.tagline}.</p>
              <Link
                href={`/destinations/${guide.slug}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                Read the {guide.name} guide
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : null}

          {reverse ? (
            <div className="rounded-panel border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">Flying back?</h2>
              <Link
                href={routeHref(reverse)}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                {reverse.fromCity} to {reverse.toCity}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </aside>
      </div>

      <section className="border-t border-line bg-surface">
        <div className="container-page py-12">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Other popular routes</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <li key={routeSlug(entry)}>
                <Link
                  href={routeHref(entry)}
                  className="group flex items-center justify-between gap-3 rounded-card border border-line bg-canvas px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {entry.fromCity} to {entry.toCity}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-subtle">
                      {entry.from} → {entry.to}
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
        </div>
      </section>

      <JsonLd
        schema={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Flights", path: "/flights" },
            { name: `${route.fromCity} to ${route.toCity}`, path: routeHref(route) },
          ]),
          faqSchema(route.faqs),
        ]}
      />
    </article>
  );
}
