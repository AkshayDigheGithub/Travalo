import { getProvider } from "@/lib/providers";
import { newSearchId, recordEvent, recordSearch } from "@/lib/analytics/server";
import {
  enforceRateLimit,
  jsonError,
  jsonOk,
  paramsToObject,
  validationError,
} from "@/lib/api/respond";
import { hotelSearchSchema } from "@/lib/validation/hotels";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, "hotels-search", 30, 60);

    const parsed = hotelSearchSchema.safeParse(paramsToObject(new URL(request.url)));
    if (!parsed.success) return validationError(parsed.error);

    const input = parsed.data;
    const searchId = newSearchId();
    const response = await getProvider().searchHotels(input, { searchId });

    void recordSearch({
      id: searchId,
      kind: "hotel",
      destination: input.destination,
      departDate: input.checkin,
      returnDate: input.checkout,
      travellers: input.guests,
      currency: input.currency,
      resultCount: response.results.length,
      isMock: response.isMock,
    });
    void recordEvent("hotel_search", {
      destination: input.destination,
      guests: input.guests,
      rooms: input.rooms,
      results: response.results.length,
    });

    return jsonOk(response);
  } catch (error) {
    return jsonError(error, { route: "hotels/search" });
  }
}
