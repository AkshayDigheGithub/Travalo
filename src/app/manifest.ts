import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Web manifest. Beyond installability, it is what lets a mobile browser treat
 * the site as an app-like destination — the same signal Google's mobile results
 * read when deciding how to present it.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbfaf8",
    theme_color: "#ffffff",
    lang: siteConfig.locale,
    dir: "ltr",
    categories: ["travel", "navigation", "shopping"],
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
