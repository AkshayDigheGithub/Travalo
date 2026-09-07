import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `What ${siteConfig.name} is, how it makes money, and what it doesn't do.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="container-page max-w-3xl py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        About {siteConfig.name}
      </h1>

      <div className="mt-8 space-y-6 leading-relaxed text-ink-muted">
        <p>
          {siteConfig.name} is a metasearch for flights and hotels. You tell us where you want to go
          and when; we search our travel partners and show you what&apos;s available, sorted and
          filtered the way you want it.
        </p>
        <p>
          We deliberately don&apos;t do some things. There&apos;s no account to create and no
          newsletter to dodge. We don&apos;t take payment or issue tickets — when you find something
          you like, you finish the booking on the provider&apos;s own site, where the price, the
          fare rules and the cancellation terms are theirs to state and honour.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-ink">How we make money</h2>
        <p>
          When you book through a link here, the travel partner may pay us a commission. It
          doesn&apos;t change your price, and it doesn&apos;t reorder your results — sorting does
          exactly what the control says it does.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-ink">Where prices come from</h2>
        <p>
          Fares and rates are reported by our travel partners. Cached fare data is indicative: it
          tells you what a route has been selling for, and the provider confirms the live price when
          you continue. Where we convert a price into a different display currency, we label it as
          an estimate rather than presenting it as the provider&apos;s own figure.
        </p>
        <p>
          Start with{" "}
          <Link href="/flights" className="font-medium text-brand-700 hover:underline">
            flight search
          </Link>{" "}
          or{" "}
          <Link href="/destinations" className="font-medium text-brand-700 hover:underline">
            a destination guide
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
