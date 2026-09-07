import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { isAllowedPartnerHost } from "@/lib/travelpayouts/links";
import { logger } from "@/lib/logger";

/**
 * Signed outbound links.
 *
 * The browser never hands us a URL to redirect to. Instead, the server signs
 * the partner URL it generated and the `/go` handler only redirects to a URL
 * whose signature verifies AND whose host is on the partner allowlist. That
 * closes the open-redirect hole an "?url=" style redirector would open.
 */

export type OutboundPayload = {
  /** Absolute partner URL, already carrying our marker/sub-id. */
  u: string;
  /** Vertical: flight or hotel. */
  k: "flight" | "hotel";
  /** Partner/provider label used for reporting. */
  p: string;
  /** Result identifier within the search. */
  r?: string;
  /** Search id the click belongs to. */
  s?: string;
  /** Destination code or slug. */
  d?: string;
  /** Sub-id sent to the affiliate program. */
  sub?: string;
  cur?: string;
  price?: number;
  /** Issued-at, seconds. Links are short-lived so stale offers aren't shareable. */
  iat: number;
};

const MAX_AGE_SECONDS = 60 * 60 * 12;

let cachedSecret: string | undefined;

function getSecret(): string {
  if (cachedSecret) return cachedSecret;

  const configured = process.env.AFFILIATE_LINK_SECRET?.trim();
  if (configured && configured.length >= 16) {
    cachedSecret = configured;
    return cachedSecret;
  }

  // Derive from the API token so a single-variable deployment still gets a
  // stable secret across instances; fall back to an ephemeral one in dev.
  const derived = process.env.TRAVELPAYOUTS_API_TOKEN?.trim();
  if (derived) {
    cachedSecret = createHmac("sha256", derived).update("tripora:outbound").digest("hex");
    return cachedSecret;
  }

  logger.warn("affiliate_secret_missing", {
    hint: "Set AFFILIATE_LINK_SECRET so outbound links stay valid across instances.",
  });
  cachedSecret = randomBytes(32).toString("hex");
  return cachedSecret;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

/** Returns an app-relative `/go?...` URL for a validated partner destination. */
export function signOutboundUrl(payload: Omit<OutboundPayload, "iat">): string {
  if (!isAllowedPartnerHost(payload.u)) {
    // Refusing here means a misconfigured link builder fails loudly in logs
    // rather than shipping an unvalidated redirect to users.
    logger.error("affiliate_link_rejected", { host: safeHost(payload.u) });
    return "/deals";
  }

  const data = base64UrlEncode(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  return `/go?d=${data}&s=${sign(data)}`;
}

export function verifyOutboundToken(data: string, signature: string): OutboundPayload | null {
  try {
    const expected = Buffer.from(sign(data));
    const provided = Buffer.from(signature);
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(data)) as OutboundPayload;
    if (!payload?.u || !payload.iat) return null;
    if (Math.floor(Date.now() / 1000) - payload.iat > MAX_AGE_SECONDS) return null;
    // Belt and braces: re-check the host at redirect time too.
    if (!isAllowedPartnerHost(payload.u)) return null;

    return payload;
  } catch {
    return null;
  }
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "invalid";
  }
}
