import { ImageResponse } from "next/og";

import { FLIGHT_ROUTES, getRoute, routeSlug } from "@/config/routes";
import { siteConfig } from "@/config/site";

export const alt = "Flight route";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return FLIGHT_ROUTES.map((route) => ({ route: routeSlug(route) }));
}

/**
 * Per-route social card. A shared link that names the actual route earns far
 * more clicks than a generic brand image, and these are prerendered alongside
 * the pages so there is no request-time cost.
 */
export default async function RouteOpengraphImage({
  params,
}: {
  params: Promise<{ route: string }>;
}) {
  const route = getRoute((await params).route);

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
          b
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, color: "#1a2126" }}>{siteConfig.name}</div>
      </div>

      <div style={{ marginTop: 44, fontSize: 30, color: "#0f6f74", fontWeight: 600 }}>
        {route ? `${route.from} → ${route.to}` : "Flight routes"}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 70,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#1a2126",
          lineHeight: 1.05,
        }}
      >
        {route ? `Flights from ${route.fromCity} to ${route.toCity}` : "Compare flights worldwide"}
      </div>
      <div style={{ marginTop: 24, fontSize: 32, color: "#5d6a72" }}>
        {route?.nonstopDuration
          ? `Nonstop in ${route.nonstopDuration.split("–")[0].trim()} · ${route.airlines.length} airlines`
          : siteConfig.tagline}
      </div>
    </div>,
    size,
  );
}
