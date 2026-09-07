import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `How to reach ${siteConfig.name}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="container-page max-w-3xl py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Contact</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-ink-muted">
        <p>
          For questions about the site, partnerships or a problem with search results, email{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="font-medium text-brand-700 hover:underline"
          >
            {siteConfig.contactEmail}
          </a>
          .
        </p>

        <div className="rounded-panel border border-line bg-surface p-5">
          <h2 className="text-base font-semibold text-ink">About an existing booking</h2>
          <p className="mt-2 text-sm">
            We can&apos;t help with a booking you&apos;ve already made. {siteConfig.name} is a
            search service — bookings are made with, held by and changed by the airline, hotel or
            booking provider you were sent to. Their confirmation email is the place to start.
          </p>
        </div>

        <p className="text-sm text-ink-subtle">
          Contact details on this page are placeholders for the MVP and should be replaced with
          monitored addresses before launch.
        </p>
      </div>
    </article>
  );
}
