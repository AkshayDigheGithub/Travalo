import { z } from "zod";

import { recordEvent } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { enforceRateLimit, jsonError } from "@/lib/api/respond";

export const runtime = "nodejs";

/**
 * Anonymous event sink. The payload allowlists event names and only accepts
 * scalar properties, so nothing unexpected can be written through this route.
 */
const bodySchema = z.object({
  name: z.enum(ANALYTICS_EVENTS),
  anonymousId: z.string().max(64).optional(),
  properties: z
    .record(z.union([z.string().max(120), z.number(), z.boolean(), z.null()]))
    .optional()
    .default({}),
});

export async function POST(request: Request) {
  try {
    await enforceRateLimit(request, "analytics", 240, 60);

    const parsed = bodySchema.safeParse(await request.json());
    // A malformed analytics beacon is not worth an error surface.
    if (!parsed.success) return new Response(null, { status: 204 });

    await recordEvent(parsed.data.name, parsed.data.properties, parsed.data.anonymousId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonError(error, { route: "analytics" });
  }
}
