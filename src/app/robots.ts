import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Search-result pages and the affiliate exit stay out of crawling: they are
 * per-user, change constantly, and partner programs expect dynamic result pages
 * to stay out of the index.
 *
 * Hotel detail pages are a deliberate exception. They carry `noindex, follow`,
 * and a page blocked in robots.txt is a page whose `noindex` is never read —
 * Google's documented behaviour is that it may still index such a URL from
 * inbound links, showing it without a title or description. Letting the crawler
 * fetch them is what actually keeps them out of the index; `next.config.ts` adds
 * an `X-Robots-Tag` header so the directive arrives even for a crawler that
 * never parses the HTML.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/go", "/flights/results", "/hotels/results"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // Image crawlers reach the destination hero images through the pages that
      // use them, so they get the same rules rather than a blanket block.
      { userAgent: "Googlebot-Image", allow: "/", disallow },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
