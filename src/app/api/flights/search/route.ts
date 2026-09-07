import { getProvider } from "@/lib/providers";
import { newSearchId, recordEvent, recordSearch } from "@/lib/analytics/server";
import {
  enforceRateLimit,
  jsonError,
  jsonOk,
  paramsToObject,
  validationError,
} from "@/lib/api/respond";
import { flightSearchSchema } from "@/lib/validation/flights";

// Fare data is per-request and short-lived; never statically rendered.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, "flights-search", 30, 60);

    const parsed = flightSearchSchema.safeParse(paramsToObject(new URL(request.url)));
    if (!parsed.success) return validationError(parsed.error);

    const input = parsed.data;
    const searchId = newSearchId();
    const response = await getProvider().searchFlights(input, { searchId });

    // Analytics is fire-and-forget: a slow database must not slow a search.
    void recordSearch({
      id: searchId,
      kind: "flight",
      origin: input.from,
      destination: input.to,
      departDate: input.departure,
      returnDate: input.return,
      travellers: input.adults + input.children + input.infants,
      currency: input.currency,
      resultCount: response.results.length,
      isMock: response.isMock,
    });
    void recordEvent("flight_search", {
      from: input.from,
      to: input.to,
      cabin: input.cabin,
      tripType: input.tripType,
      results: response.results.length,
    });

    return jsonOk(response);
  } catch (error) {
    return jsonError(error, { route: "flights/search" });
  }
}
