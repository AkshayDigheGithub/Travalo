/**
 * Resolves the public origin used for canonical URLs, Open Graph tags,
 * robots.txt and the sitemap.
 *
 * An explicit NEXT_PUBLIC_SITE_URL always wins. Without one we fall back to the
 * URL Vercel injects, so a deployment made before the variable is configured
 * still emits correct absolute URLs instead of pointing at localhost. The
 * production domain is preferred over the per-deployment URL so previews don't
 * advertise themselves as canonical.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    // Vercel's system variables carry a bare hostname, with no protocol.
    return value.startsWith("http") ? value.replace(/\/$/, "") : `https://${value}`;
  }

  return "http://localhost:3000";
}

/**
 * Single source of truth for brand-level strings and navigation.
 * Change the values here to rebrand the product; nothing else hardcodes the name.
 */
export const siteConfig = {
  name: "bookmyflight.lol",
  tagline: "Compare flights and hotels worldwide.",
  description:
    "bookmyflight.lol is a global flight and hotel metasearch. Compare fares and stays across hundreds of travel sites, then book directly with the provider.",
  url: resolveSiteUrl(),
  locale: "en",
  contactEmail: "hello@bookmyflight.lol",
  legalEntity: "bookmyflight.lol",
  founded: 2026,
} as const;

export type NavItem = {
  href: string;
  label: string;
};

export const mainNav: NavItem[] = [
  { href: "/flights", label: "Flights" },
  { href: "/hotels", label: "Hotels" },
  { href: "/destinations", label: "Destinations" },
  { href: "/deals", label: "Deals" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Explore",
    items: [
      { href: "/flights", label: "Flights" },
      { href: "/hotels", label: "Hotels" },
      { href: "/destinations", label: "Destinations" },
      { href: "/deals", label: "Deals" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];
