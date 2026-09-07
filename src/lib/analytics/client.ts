"use client";

import { getAnonymousId } from "./anonymous-id";
import type { AnalyticsEventName, AnalyticsProperties } from "./events";

/**
 * Fire-and-forget client tracking. Uses sendBeacon so navigating away (which is
 * exactly what happens on an affiliate click) does not cancel the request.
 */
export function track(name: AnalyticsEventName, properties: AnalyticsProperties = {}): void {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({ name, properties, anonymousId: getAnonymousId() });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch("/api/analytics", {
      method: "POST",
      body: payload,
      headers: { "content-type": "application/json" },
      keepalive: true,
    });
  } catch {
    // Analytics must never interrupt the user's journey.
  }
}
