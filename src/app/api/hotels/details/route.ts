import { getProvider } from "@/lib/providers";
import { newSearchId } from "@/lib/analytics/server";
import {
  enforceRateLimit,
  jsonError,
  jsonOk,
  paramsToObject,
  validationError,
} from "@/lib/api/respond";
import { AppError } from "@/lib/errors";
import { hotelDetailsSchema } from "@/lib/validation/hotels";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, "hotel-details", 60, 60);

    const parsed = hotelDetailsSchema.safeParse(paramsToObject(new URL(request.url)));
    if (!parsed.success) return validationError(parsed.error);

    const details = await getProvider().getHotelDetails(parsed.data, { searchId: newSearchId() });
    if (!details) throw new AppError("not_found", `hotel ${parsed.data.id}`);

    return jsonOk(details);
  } catch (error) {
    return jsonError(error, { route: "hotels/details" });
  }
}
