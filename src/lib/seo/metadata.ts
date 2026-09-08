import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

/**
 * One place that builds page metadata, so every indexable page ships the same
 * complete set: a self-referencing canonical, hreflang, Open Graph and a
 * Twitter card. Pages differ in their copy, not in which tags they remember.
 */
export type PageSeoInput = {
  /** Site-relative path, always starting with "/" — "/flights/london-to-new-york". */
  path: string;
  title: string;
  description: string;
  /**
   * Absolute image URL. Defaults to the site-wide card. Pass `null` when the
   * segment has its own `opengraph-image` file — Next only applies that file
   * when the metadata leaves `openGraph.images` unset.
   */
  image?: string | null;
  imageAlt?: string;
  /** "website" for hubs and search pages, "article" for editorial content. */
  type?: "website" | "article";
  /** Set false for pages that exist but should stay out of the index. */
  index?: boolean;
};

export function absoluteUrl(path: string): string {
  return path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
}

/**
 * The site-wide social card. Next's `app/opengraph-image.tsx` only attaches
 * itself to the segment it sits in, so without this every interior page shares
 * with no preview image at all.
 */
export const DEFAULT_OG_IMAGE = `${siteConfig.url}/opengraph-image`;

/**
 * The content is written in English but the audience is global, so every page
 * declares itself as the English version *and* as `x-default` — the version
 * Google serves to a searcher whose language it has no better match for.
 * Adding a locale later means adding entries here, not touching pages.
 */
export function languageAlternates(path: string): Record<string, string> {
  const url = absoluteUrl(path);
  return { en: url, "x-default": url };
}

export function pageMetadata({
  path,
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  type = "website",
  index = true,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const images = image ? [{ url: image, alt: imageAlt ?? title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: path, languages: languageAlternates(path) },
    openGraph: {
      type,
      siteName: siteConfig.name,
      title: `${title} · ${siteConfig.name}`,
      description,
      url,
      locale: "en_US",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
