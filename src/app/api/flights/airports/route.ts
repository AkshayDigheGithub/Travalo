import { getProvider } from "@/lib/providers";
import { enforceRateLimit, jsonError, jsonOk, paramsToObject } from "@/lib/api/respond";
import { airportQuerySchema } from "@/lib/validation/flights";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, "airports", 120, 60);

    const parsed = airportQuerySchema.safeParse(paramsToObject(new URL(request.url)));
    if (!parsed.success) return jsonOk({ results: [] });

    const results = await getProvider().searchAirports(parsed.data.q);
    return jsonOk(
      { results },
      // Place data barely changes; let the browser reuse it while typing.
      { headers: { "cache-control": "private, max-age=300" } },
    );
  } catch (error) {
    return jsonError(error, { route: "flights/airports" });
  }
}
