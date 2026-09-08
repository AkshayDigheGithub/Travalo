import type { Metadata } from "next";

import { Section } from "@/components/common/section";
import { DestinationCard } from "@/features/destinations/destination-card";
import { JsonLd } from "@/components/common/json-ld";
import { DESTINATIONS } from "@/config/destinations";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  path: "/destinations",
  title: "Destinations",
  description:
    "Practical city guides for the destinations travellers ask about most — when to go, where to stay and how to get there.",
});

export default function DestinationsPage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Destinations
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              A small, hand-written set of guides rather than a directory of thin pages. Each one
              covers when to go, which airport to use and where to base yourself — with live flight
              and hotel search alongside.
            </p>
          </div>
        </div>
      </section>

      <Section title={`${DESTINATIONS.length} destination guides`}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {DESTINATIONS.map((destination, index) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              priority={index < 4}
            />
          ))}
        </div>
      </Section>

      <JsonLd
        schema={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
          ]),
        ]}
      />
    </>
  );
}
