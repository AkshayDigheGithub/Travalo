import { getProvider } from "@/lib/providers";
import { enforceRateLimit, jsonError, jsonOk, paramsToObject } from "@/lib/api/respond";
import { hotelLocationQuerySchema } from "@/lib/validation/hotels";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, "hotel-locations", 120, 60);

    const parsed = hotelLocationQuerySchema.safeParse(paramsToObject(new URL(request.url)));
    if (!parsed.success) return jsonOk({ results: [] });

    const results = await getProvider().searchHotelDestinations(parsed.data.q);
    return jsonOk({ results }, { headers: { "cache-control": "private, max-age=300" } });
  } catch (error) {
    return jsonError(error, { route: "hotels/locations" });
  }
}
