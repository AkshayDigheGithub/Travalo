import "server-only";

import { searchAirportSeed } from "@/config/airports";
import { logger } from "@/lib/logger";
import type { Place } from "@/types/search";
import { TP_HOSTS, tpFetch } from "./client";
import type { TpPlace } from "./types";

/**
 * Place autocomplete via the public Travelpayouts endpoint
 * (GET autocomplete.travelpayouts.com/places2). No token is required.
 *
 * If it is unreachable we fall back to the bundled airport seed so the search
 * form still works rather than leaving the user with a dead input.
 */

const CACHE_TTL_SECONDS = 60 * 60 * 24;

export async function searchAirports(query: string): Promise<Place[]> {
  try {
    const payload = await tpFetch<TpPlace[]>(TP_HOSTS.autocomplete, "/places2", {
      revalidate: CACHE_TTL_SECONDS,
      timeoutMs: 4_000,
      params: {
        term: query,
        locale: "en",
        "types[]": ["airport", "city"],
      },
    });

    const places = (Array.isArray(payload) ? payload : [])
      .filter((place) => place.type === "airport" || place.type === "city")
      .map(toPlace)
      .filter((place): place is Place => place !== null)
      .slice(0, 8);

    return places.length > 0 ? places : searchAirportSeed(query);
  } catch (error) {
    logger.warn("autocomplete_unavailable", { error: String(error) });
    return searchAirportSeed(query);
  }
}

function toPlace(place: TpPlace): Place | null {
  if (!place.code || !place.name) return null;

  return {
    code: place.code.toUpperCase(),
    type: place.type === "city" ? "city" : "airport",
    name: place.name,
    cityName: place.city_name ?? place.name,
    countryName: place.country_name ?? "",
    countryCode: place.country_code ?? "",
  };
}
