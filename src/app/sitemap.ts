import type { MetadataRoute } from "next";

import { DESTINATIONS } from "@/config/destinations";
import { siteConfig } from "@/config/site";

/** Only stable, indexable pages. Search results are deliberately absent. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
      { url: `${siteConfig.url}/flights`, changeFrequency: "daily", priority: 0.9 },
      { url: `${siteConfig.url}/hotels`, changeFrequency: "daily", priority: 0.9 },
      { url: `${siteConfig.url}/destinations`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${siteConfig.url}/deals`, changeFrequency: "daily", priority: 0.7 },
      { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.4 },
      { url: `${siteConfig.url}/contact`, changeFrequency: "monthly", priority: 0.3 },
      { url: `${siteConfig.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
      { url: `${siteConfig.url}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ] satisfies MetadataRoute.Sitemap
  ).map((entry) => ({ ...entry, lastModified }));

  const destinationRoutes: MetadataRoute.Sitemap = DESTINATIONS.map((destination) => ({
    url: `${siteConfig.url}/destinations/${destination.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...destinationRoutes];
}
