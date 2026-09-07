import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Search-result pages and the affiliate exit are excluded from crawling: they
 * are per-user, change constantly, and partner programs generally expect
 * dynamic result pages to stay out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/go", "/flights/results", "/hotels/results", "/hotels/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
