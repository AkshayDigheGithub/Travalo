/**
 * Single source of truth for brand-level strings and navigation.
 * Change the values here to rebrand the product; nothing else hardcodes the name.
 */
export const siteConfig = {
  name: "Tripora",
  tagline: "Compare flights and hotels worldwide.",
  description:
    "Tripora is a global flight and hotel metasearch. Compare fares and stays across hundreds of travel sites, then book directly with the provider.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  contactEmail: "hello@tripora.example",
  legalEntity: "Tripora",
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
