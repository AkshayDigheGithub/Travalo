import type { Metadata } from "next";

import { LegalPage } from "@/components/common/legal-page";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  title: "Terms",
  description: `Terms of use for ${siteConfig.name}. Placeholder content pending legal review.`,
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="September 2026">
      <section>
        <h2>Using this site</h2>
        <p>
          {siteConfig.name} is a search and comparison service for flights and accommodation. We
          display prices and availability reported to us by travel partners and link you to those
          partners to book.
        </p>
      </section>

      <section>
        <h2>We are not the travel provider</h2>
        <p>
          We do not sell flights or accommodation, take payment, issue tickets or hold bookings. Any
          contract you enter is with the airline, hotel or booking provider you are sent to. Their
          terms, fare rules, baggage policies and cancellation conditions apply to your booking.
        </p>
      </section>

      <section>
        <h2>Prices and availability</h2>
        <p>
          Prices shown here come from our travel partners and can change between the moment we
          receive them and the moment you book. Where we convert a price into another currency for
          display, the converted figure is labelled as an estimate. The price you pay is the one
          confirmed by the provider at checkout.
        </p>
      </section>

      <section>
        <h2>How we make money</h2>
        <p>
          We may receive a commission when you book through a link on this site. This does not
          change what you pay, and it does not decide the order in which results are shown — sorting
          follows the option you select.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Don&apos;t scrape, mirror or resell the data on this site.</li>
          <li>Don&apos;t attempt to interfere with the service or the systems behind it.</li>
          <li>Don&apos;t use automated tooling to generate searches at volume.</li>
        </ul>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          These terms are placeholder wording and will be replaced with a reviewed version before
          launch. Questions can go to {siteConfig.contactEmail}.
        </p>
      </section>
    </LegalPage>
  );
}
