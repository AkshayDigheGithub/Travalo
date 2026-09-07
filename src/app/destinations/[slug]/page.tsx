import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BedDouble, CalendarClock, Plane } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { TravelImage } from "@/components/common/travel-image";
import { DestinationCard } from "@/features/destinations/destination-card";
import { DESTINATIONS, POPULAR_ROUTES, getDestination } from "@/config/destinations";
import { siteConfig } from "@/config/site";
import { addDays, todayIso } from "@/lib/utils/date";
import {
  defaultFlightState,
  defaultHotelState,
  flightResultsHref,
  hotelResultsHref,
} from "@/lib/utils/search-params";

// Editorial content changes rarely; the embedded example dates refresh daily.
export const revalidate = 86400;

export function generateStaticParams() {
  return DESTINATIONS.map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) return { title: "Destination not found" };

  const title = `${destination.name} travel guide`;
  const description = `${destination.tagline}. When to go, where to stay and how to find flights to ${destination.name}, ${destination.country}.`;

  return {
    title,
    description,
    alternates: { canonical: `/destinations/${destination.slug}` },
    openGraph: {
      type: "article",
      title: `${title} · ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/destinations/${destination.slug}`,
      images: [{ url: destination.heroImage, alt: destination.name }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) notFound();

  const departure = addDays(todayIso(), 21);
  const returnDate = addDays(departure, 7);
  const flightState = defaultFlightState();
  const hotelState = defaultHotelState();

  const routesHere = POPULAR_ROUTES.filter((route) => route.to === destination.airportCode);
  const relatedRoutes = routesHere.length > 0 ? routesHere : POPULAR_ROUTES.slice(0, 3);
  const related = DESTINATIONS.filter((entry) => entry.slug !== destination.slug).slice(0, 4);

  const hotelHref = hotelResultsHref({ ...hotelState, destination: destination.name });

  return (
    <article>
      <header className="relative">
        <div className="relative h-[46vh] min-h-72 w-full overflow-hidden bg-ink">
          <TravelImage
            src={destination.heroImage}
            alt={`${destination.name}, ${destination.country}`}
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" />
        </div>

        <div className="container-page relative -mt-32 pb-4">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/80">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/destinations" className="transition-colors hover:text-white">
                  Destinations
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white">{destination.name}</li>
            </ol>
          </nav>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {destination.name}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-white/85">{destination.tagline}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link
                href={flightResultsHref({
                  ...flightState,
                  from: "BOM",
                  to: destination.airportCode,
                  departure,
                  return: returnDate,
                })}
              >
                <Plane className="size-4" aria-hidden="true" />
                Find flights
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={hotelHref}>
                <BedDouble className="size-4" aria-hidden="true" />
                Find hotels
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_18rem] lg:gap-12">
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              About {destination.name}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">{destination.intro}</p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
              <CalendarClock className="size-5 text-brand-600" aria-hidden="true" />
              Best time to visit
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">{destination.bestTimeToVisit}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Popular flights to {destination.name}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedRoutes.map((route) => (
                <li key={`${route.from}-${route.to}`}>
                  <Link
                    href={flightResultsHref({
                      ...flightState,
                      from: route.from,
                      to: destination.airportCode,
                      departure,
                      return: returnDate,
                    })}
                    className="group flex items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <span className="text-sm font-medium text-ink">
                      {route.fromCity} to {destination.name}
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Where to stay in {destination.name}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              The areas travellers usually choose, and what each one is good for.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {destination.areas.map((area) => (
                <li key={area.name}>
                  <Link
                    href={hotelResultsHref({
                      ...hotelState,
                      destination: `${area.name}, ${destination.name}`,
                    })}
                    className="group block h-full rounded-card border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-medium text-ink">{area.name}</span>
                      <BedDouble
                        className="size-4 shrink-0 text-ink-subtle transition-colors group-hover:text-brand-600"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                      {area.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="mt-3">
              {destination.faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-panel border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink">Travel information</h2>
            <dl className="mt-4 space-y-3.5">
              {destination.travelInfo.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 text-sm text-ink">{item.value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
                  Local currency
                </dt>
                <dd className="mt-0.5 text-sm text-ink">{destination.currency}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-panel border border-line bg-brand-50 p-5">
            <h2 className="text-sm font-semibold text-brand-900">
              Ready to plan {destination.name}?
            </h2>
            <p className="mt-1.5 text-sm text-brand-800">
              Compare flights and stays for your own dates.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild size="sm">
                <Link href="/flights">Search flights</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href={hotelHref}>Search hotels</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <section className="border-t border-line bg-surface">
        <div className="container-page py-12">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Other destinations</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((entry) => (
              <DestinationCard key={entry.slug} destination={entry} />
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "TouristDestination",
              name: destination.name,
              description: destination.intro,
              url: `${siteConfig.url}/destinations/${destination.slug}`,
              image: destination.heroImage,
              addressCountry: destination.country,
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: destination.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Destinations",
                  item: `${siteConfig.url}/destinations`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: destination.name,
                  item: `${siteConfig.url}/destinations/${destination.slug}`,
                },
              ],
            },
          ]),
        }}
      />
    </article>
  );
}
