import { NextResponse } from "next/server";

import { recordAffiliateClick, recordEvent } from "@/lib/analytics/server";
import { verifyOutboundToken } from "@/lib/affiliate/link";
import { enforceRateLimit, jsonError } from "@/lib/api/respond";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Affiliate exit point.
 *
 * The destination is never taken from user input: `d` is a payload this server
 * signed and `s` is its HMAC. Anything that fails verification — a forged link,
 * a tampered payload, an expired offer, a host outside the partner allowlist —
 * is sent back into the app instead of being followed. That is what keeps this
 * from being an open redirect.
 */
export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, "affiliate-redirect", 90, 60);

    const url = new URL(request.url);
    const data = url.searchParams.get("d");
    const signature = url.searchParams.get("s");

    if (!data || !signature) return expired(request);

    const payload = verifyOutboundToken(data, signature);
    if (!payload) {
      logger.warn("affiliate_redirect_rejected");
      return expired(request);
    }

    // Tracking happens before the redirect so the click is never lost.
    await recordAffiliateClick({
      kind: payload.k,
      provider: payload.p,
      destination: payload.d,
      searchId: payload.s,
      resultId: payload.r,
      subId: payload.sub,
      currency: payload.cur,
      price: payload.price,
    });

    void recordEvent("affiliate_click", {
      kind: payload.k,
      provider: payload.p,
      destination: payload.d ?? null,
      resultId: payload.r ?? null,
    });

    const response = NextResponse.redirect(payload.u, 302);
    response.headers.set("cache-control", "no-store");
    return response;
  } catch (error) {
    return jsonError(error, { route: "go" });
  }
}

function expired(request: Request) {
  return NextResponse.redirect(new URL("/deals?deal=expired", request.url), 302);
}
