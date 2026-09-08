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
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The affiliate exit is never indexed. Its referrer is already covered by
      // the site-wide strict-origin-when-cross-origin policy (which sends only
      // the origin, never the search URL) plus rel="noreferrer" on every
      // outbound link, so there is no per-route referrer rule here.
      {
        source: "/go",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
