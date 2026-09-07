import "server-only";

import type { CurrencyCode } from "@/config/currencies";
import { signOutboundUrl } from "@/lib/affiliate/link";
import { daysBetween } from "@/lib/utils/date";
import { hotelIdFromSlug, hotelSlug } from "@/lib/utils/slug";
import type { HotelDetailsInput, SearchContext } from "@/lib/providers/types";
import type { HotelSearchInput } from "@/lib/validation/hotels";
import type { HotelDetails, HotelPrice, HotelResult, HotelSearchResponse } from "@/types/hotel";
import { TP_HOSTS, tpFetch } from "./client";
import { buildHotelDeepLink, buildSubId, hotelPhotoUrl } from "./links";
import type { TpHotelPrice, TpLookupResponse } from "./types";

/**
 * Hotels via Hotellook (the Travelpayouts hotel engine).
 *
 * - GET /api/v2/cache.json  — cached nightly prices for a destination
 * - GET /api/v2/lookup.json — destination and hotel name lookup
 *
 * The cache endpoint returns price, stars and location only. Fields it does not
 * publish (guest score, amenities, cancellation policy) are left undefined
 * rather than invented, and the UI hides the filters those fields would drive.
 */

const RESULT_LIMIT = 60;
const CACHE_TTL_SECONDS = 60 * 30;

export async function searchHotels(
  input: HotelSearchInput,
  ctx: SearchContext,
): Promise<HotelSearchResponse> {
  const nights = Math.max(1, daysBetween(input.checkin, input.checkout));

  const records = await tpFetch<TpHotelPrice[]>(TP_HOSTS.hotellook, "/api/v2/cache.json", {
    withToken: true,
    revalidate: CACHE_TTL_SECONDS,
    params: {
      location: input.destination,
      checkIn: input.checkin,
      checkOut: input.checkout,
      currency: input.currency.toLowerCase(),
      limit: RESULT_LIMIT,
      adults: input.guests,
    },
  });

  const list = Array.isArray(records) ? records : [];
  const results: HotelResult[] = [];

  for (const record of list) {
    const normalized = await normalizeHotel(record, input, ctx, nights);
    if (normalized) results.push(normalized);
  }

  return buildHotelResponse({
    results,
    destinationLabel: input.destination,
    currency: input.currency,
    nights,
    searchId: ctx.searchId,
    isMock: false,
  });
}

async function normalizeHotel(
  record: TpHotelPrice,
  input: HotelSearchInput,
  ctx: SearchContext,
  nights: number,
): Promise<HotelResult | null> {
  if (!record.hotelId || !record.hotelName) return null;

  const price = await normalizePrice(record, input.currency, nights);
  const subId = buildSubId(["hotel", input.destination, input.checkin.replace(/-/g, "")]);

  const partnerUrl = buildHotelDeepLink({
    hotelId: record.hotelId,
    destination: input.destination,
    checkIn: input.checkin,
    checkOut: input.checkout,
    adults: input.guests,
    currency: input.currency,
    subId,
  });

  const id = String(record.hotelId);

  return {
    id,
    slug: hotelSlug(record.hotelName, id),
    name: record.hotelName,
    image: hotelPhotoUrl(id, 1),
    images: [1, 2, 3, 4].map((index) => hotelPhotoUrl(id, index)),
    location: {
      city: record.location?.name ?? input.destination,
      country: record.location?.country ?? "",
    },
    stars: record.stars && record.stars > 0 ? record.stars : undefined,
    propertyType: "hotel",
    // cache.json does not publish amenities; an empty list is honest here.
    amenities: [],
    price,
    bookingUrl: signOutboundUrl({
      u: partnerUrl,
      k: "hotel",
      p: "hotellook",
      r: id,
      s: ctx.searchId,
      d: input.destination,
      sub: subId,
      cur: price?.currency,
      price: price?.perNight,
    }),
  };
}

/**
 * `priceAvg`/`priceFrom` are stay totals in the requested currency; the
 * per-night figure is derived from the stay length so both can be shown.
 */
async function normalizePrice(
  record: TpHotelPrice,
  requested: CurrencyCode,
  nights: number,
): Promise<HotelPrice | undefined> {
  const total = record.priceFrom ?? record.priceAvg;
  if (typeof total !== "number" || total <= 0) return undefined;

  return {
    total: Math.round(total),
    perNight: Math.round(total / nights),
    currency: requested,
    priceSource: "provider",
  };
}

export async function getHotelDetails(
  input: HotelDetailsInput,
  ctx: SearchContext,
): Promise<HotelDetails | null> {
  const checkin = input.checkin;
  const checkout = input.checkout;
  // Detail URLs carry a readable slug; the provider only knows the numeric id.
  const hotelId = hotelIdFromSlug(input.id) ?? input.id;

  const records = await tpFetch<TpHotelPrice[]>(TP_HOSTS.hotellook, "/api/v2/cache.json", {
    withToken: true,
    revalidate: CACHE_TTL_SECONDS,
    params: {
      hotelId,
      checkIn: checkin,
      checkOut: checkout,
      currency: input.currency.toLowerCase(),
      limit: 1,
      adults: input.guests,
    },
  });

  const record = Array.isArray(records) ? records[0] : undefined;
  if (!record) return null;

  const nights = checkin && checkout ? Math.max(1, daysBetween(checkin, checkout)) : 1;
  const price = await normalizePrice(record, input.currency, nights);
  const subId = buildSubId(["hoteldetail", hotelId]);
  const id = String(record.hotelId);

  const partnerUrl = buildHotelDeepLink({
    hotelId: id,
    checkIn: checkin ?? "",
    checkOut: checkout ?? "",
    adults: input.guests,
    currency: input.currency,
    subId,
  });

  const bookingUrl = signOutboundUrl({
    u: partnerUrl,
    k: "hotel",
    p: "hotellook",
    r: id,
    s: ctx.searchId,
    sub: subId,
    cur: price?.currency,
    price: price?.perNight,
  });

  return {
    id,
    slug: hotelSlug(record.hotelName, id),
    name: record.hotelName,
    image: hotelPhotoUrl(id, 1),
    images: [1, 2, 3, 4, 5].map((index) => hotelPhotoUrl(id, index)),
    location: {
      city: record.location?.name ?? "",
      country: record.location?.country ?? "",
    },
    stars: record.stars && record.stars > 0 ? record.stars : undefined,
    propertyType: "hotel",
    amenities: [],
    price,
    bookingUrl,
    // Room-level inventory is not part of the cached price feed; the partner
    // page is where live rooms and rates are shown.
    rooms: [],
    importantInformation: [
      "Prices are indicative and confirmed by the booking provider at checkout.",
      "Room availability, taxes and cancellation terms are shown by the provider before you pay.",
    ],
  };
}

export async function searchHotelDestinations(query: string) {
  const payload = await tpFetch<TpLookupResponse>(TP_HOSTS.hotellook, "/api/v2/lookup.json", {
    withToken: true,
    revalidate: 60 * 60,
    params: { query, lang: "en", lookFor: "both", limit: 8 },
  });

  const locations = payload.results?.locations ?? [];
  return locations.map((location) => ({
    code: location.id,
    type: "city" as const,
    name: location.cityName ?? location.fullName ?? query,
    cityName: location.cityName ?? location.fullName ?? query,
    countryName: location.countryName ?? "",
    countryCode: location.countryCode ?? "",
    airportCount: undefined,
  }));
}

export function buildHotelResponse(args: {
  results: HotelResult[];
  destinationLabel: string;
  currency: CurrencyCode;
  nights: number;
  searchId: string;
  isMock: boolean;
}): HotelSearchResponse {
  const prices = args.results
    .map((result) => result.price?.perNight)
    .filter((value): value is number => typeof value === "number");

  const amenities = [...new Set(args.results.flatMap((result) => result.amenities))].sort();

  return {
    searchId: args.searchId,
    destinationLabel: args.destinationLabel,
    results: args.results,
    currency: args.currency,
    nights: args.nights,
    priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
    amenities,
    isMock: args.isMock,
    retrievedAt: Date.now(),
  };
}
