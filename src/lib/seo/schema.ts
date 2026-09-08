import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * Structured data helpers.
 *
 * Everything shares one `@id` per entity so the graph across pages resolves to
 * a single organisation and a single website rather than a new, unconnected
 * copy on every page — that is what lets a search engine treat the brand as one
 * entity instead of many.
 */
export const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

export type JsonLdValue = Record<string, unknown>;

export function organizationSchema(): JsonLdValue {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.contactEmail,
    foundingDate: String(siteConfig.founded),
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/icon.svg`,
    },
    // The service is a metasearch, not a seller, and it is available everywhere.
    areaServed: "Worldwide",
  };
}

export function websiteSchema(): JsonLdValue {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Breadcrumbs are one of the few rich results Google still renders for pages
 * like these, and they replace the bare URL in the result. Positions are
 * 1-based and every item points at a real, indexable page.
 */
export function breadcrumbSchema(trail: { name: string; path: string }[]): JsonLdValue {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): JsonLdValue {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** Wraps entities in a single `@graph` so one script tag carries the whole page. */
export function graph(...entities: JsonLdValue[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": entities });
}
