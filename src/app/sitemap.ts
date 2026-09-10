import type { MetadataRoute } from "next";

import { DESTINATIONS, DESTINATIONS_UPDATED_AT } from "@/config/destinations";
import { FLIGHT_ROUTES, routeSlug } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { languageAlternates } from "@/lib/seo/metadata";

/**
 * Only stable, indexable pages. Search results and the affiliate exit are
 * deliberately absent — they are `noindex` and belong nowhere near a sitemap.
 *
 * Every entry carries its language alternates so the XML states the same
 * international targeting the pages themselves declare in `<head>`; a crawler
 * that reads only the sitemap still learns that these URLs serve every region.
 */
type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified: string | Date;
  images?: string[];
};

/**
 * Next.js builds the sitemap document by concatenating our values straight into
 * XML — see `resolve-route-data.js` in the installed `next` package, which
 * escapes nothing, in `<loc>`, `<image:loc>` or the `hreflang` hrefs alike. So a
 * single raw `&` makes the file unparseable from that line onwards, and every
 * Unsplash hero URL carries three of them.
 *
 * These are exactly the five entities the sitemap protocol requires URLs to be
 * escaped with, and we apply them on the way in because Next will not.
 */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Hubs and search pages have no editorial content of their own, so the build date is the honest lastmod. */
const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [
    { path: "/", changeFrequency: "daily", priority: 1, lastModified: BUILD_DATE },
    { path: "/flights", changeFrequency: "daily", priority: 0.9, lastModified: BUILD_DATE },
    { path: "/hotels", changeFrequency: "daily", priority: 0.9, lastModified: BUILD_DATE },
    {
      path: "/destinations",
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: DESTINATIONS_UPDATED_AT,
    },
    { path: "/deals", changeFrequency: "daily", priority: 0.7, lastModified: BUILD_DATE },
    { path: "/about", changeFrequency: "monthly", priority: 0.4, lastModified: BUILD_DATE },
    { path: "/contact", changeFrequency: "monthly", priority: 0.3, lastModified: BUILD_DATE },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2, lastModified: BUILD_DATE },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2, lastModified: BUILD_DATE },

    // Route pages are the highest-intent editorial content on the site: someone
    // searching "flights from X to Y" is one click from a real search.
    ...FLIGHT_ROUTES.map((route): Entry => ({
      path: `/flights/${routeSlug(route)}`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: route.updatedAt,
    })),

    // The hero image is listed so the guides are eligible for Google Images,
    // which is a meaningful share of travel discovery.
    ...DESTINATIONS.map((destination): Entry => ({
      path: `/destinations/${destination.slug}`,
      changeFrequency: "weekly",
      priority: 0.75,
      lastModified: DESTINATIONS_UPDATED_AT,
      images: [destination.heroImage],
    })),
  ];

  return entries.map((entry) => {
    const languages = languageAlternates(entry.path);

    return {
      url: xmlEscape(entry.path === "/" ? siteConfig.url : `${siteConfig.url}${entry.path}`),
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languages).map(([language, url]) => [language, xmlEscape(url)]),
        ),
      },
      ...(entry.images ? { images: entry.images.map(xmlEscape) } : {}),
    };
  });
}
