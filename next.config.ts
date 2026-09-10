import type { NextConfig } from "next";

/**
 * Security headers applied to every response. `frame-ancestors 'none'` and
 * `X-Frame-Options` keep the site out of other people's frames, and
 * strict-origin-when-cross-origin means a partner site receives our origin at
 * most — never the search URL a visitor came from.
 */
/**
 * In production the Vercel Analytics script is served from this origin under
 * /_vercel/insights. In development it comes from Vercel's debug host instead,
 * so that one host is allowed there and nowhere else.
 */
const analyticsScriptHost =
  process.env.NODE_ENV === "production" ? "" : " https://va.vercel-scripts.com";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js injects inline bootstrap scripts and inline styles.
      `script-src 'self' 'unsafe-inline' 'unsafe-eval'${analyticsScriptHost}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://pics.avs.io https://photo.hotellook.com https://images.unsplash.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

/**
 * The host this site calls canonical, taken from the same variables that build
 * every canonical URL, so the redirect below can never disagree with them.
 */
function canonicalHost(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (!raw?.trim()) return undefined;

  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`).hostname;
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Only these hosts may be optimised — no arbitrary remote hotlinking.
    remotePatterns: [
      { protocol: "https", hostname: "pics.avs.io" },
      { protocol: "https", hostname: "photo.hotellook.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
  },
  /**
   * www and the apex both serve the whole site, so search engines see two
   * copies of every page and split the ranking signals between them.
   *
   * The direction follows whichever host is canonical rather than being
   * hardcoded, so this cannot end up pointing away from the host the sitemap,
   * hreflang and metadataBase all name — and cannot loop if that host is
   * itself the www one. 301 rather than `permanent: true`, which sends a 308:
   * both are permanent to Google, but 301 is what older clients expect.
   */
  async redirects() {
    const canonical = canonicalHost();
    // Nothing to deduplicate on localhost or before the domain is configured.
    if (!canonical || canonical === "localhost") return [];

    const duplicate = canonical.startsWith("www.") ? canonical.slice(4) : `www.${canonical}`;

    return [
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: duplicate }],
        destination: `https://${canonical}/:path*`,
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The affiliate exit is never indexed. Its referrer is already covered by
      // the site-wide strict-origin-when-cross-origin policy plus
      // referrerPolicy="origin" on every outbound link — both send the origin
      // and never the search URL — so there is no per-route referrer rule here.
      {
        source: "/go",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Hotel detail and search-result pages already declare `noindex, follow`
      // in their metadata. Repeating it as a header means the directive still
      // arrives for a crawler that fetches the URL without parsing the HTML,
      // and it is what lets robots.txt allow the fetch — a URL blocked there is
      // a URL whose noindex is never seen.
      {
        source: "/hotels/:slug",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
      {
        source: "/flights/results",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
    ];
  },
};

export default nextConfig;
