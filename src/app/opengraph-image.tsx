import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social preview card, rendered to PNG by Next's OG image runtime so it works
 * everywhere (SVG previews are ignored by most platforms).
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "88px",
        background: "#fbfaf8",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -330,
          right: -230,
          width: 840,
          height: 840,
          borderRadius: 420,
          background: "#e4f2f2",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "#0f6f74",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          T
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, color: "#1a2126" }}>{siteConfig.name}</div>
      </div>

      <div
        style={{
          marginTop: 48,
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#1a2126",
          lineHeight: 1.05,
        }}
      >
        Discover your next journey
      </div>
      <div style={{ marginTop: 24, fontSize: 34, color: "#5d6a72" }}>{siteConfig.tagline}</div>
    </div>,
    size,
  );
}
