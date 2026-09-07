import "server-only";

import type { CurrencyCode } from "@/config/currencies";
import { AppError } from "@/lib/errors";
import { signOutboundUrl } from "@/lib/affiliate/link";
import { convert } from "@/lib/currency/rates";
import { addMinutesToLocalIso } from "@/lib/utils/date";
import type { FlightSearchInput } from "@/lib/validation/flights";
import type { FlightLeg, FlightResult, FlightSearchResponse } from "@/types/flight";
import type { SearchContext } from "@/lib/providers/types";
import { resolveAirlines } from "./airlines";
import { TP_HOSTS, tpFetch } from "./client";
import { buildFlightDeepLink, buildFlightSearchLink, buildSubId } from "./links";
import type { TpFlightPrice, TpFlightPricesResponse } from "./types";

/**
 * Flight fares via the Travelpayouts "prices for dates" endpoint
 * (GET /aviasales/v3/prices_for_dates).
 *
 * This is cached fare data rather than a live availability search, so results
 * are presented as indicative prices and the partner page is the source of
 * truth. The endpoint has no cabin-class parameter: the traveller's cabin
 * choice is carried into the partner link and surfaced in the UI instead of
 * being silently applied to prices it doesn't apply to.
 */

const RESULT_LIMIT = 60;
/** Cached fares change slowly; a short TTL keeps the quota and the page fast. */
const CACHE_TTL_SECONDS = 60 * 15;

export async function searchFlights(
  input: FlightSearchInput,
  ctx: SearchContext,
): Promise<FlightSearchResponse> {
  const payload = await tpFetch<TpFlightPricesResponse>(
    TP_HOSTS.api,
    "/aviasales/v3/prices_for_dates",
    {
      withToken: true,
      revalidate: CACHE_TTL_SECONDS,
      params: {
        origin: input.from,
        destination: input.to,
        departure_at: input.departure,
        return_at: input.return,
        one_way: input.return ? "false" : "true",
        direct: input.directOnly ? "true" : "false",
        currency: input.currency.toLowerCase(),
        sorting: "price",
        unique: "false",
        limit: RESULT_LIMIT,
        market: process.env.TRAVELPAYOUTS_MARKET ?? undefined,
      },
    },
  );

  if (payload.success === false) {
    throw new AppError("provider_malformed", payload.error ?? "provider reported failure");
  }

  const records = Array.isArray(payload.data) ? payload.data : [];
  const providerCurrency = (payload.currency ?? input.currency).toUpperCase();
  const airlines = await resolveAirlines([
    ...new Set(records.map((record) => record.airline).filter(Boolean)),
  ]);

  const passengers = input.adults + input.children;
  const results: FlightResult[] = [];

  for (const [index, record] of records.entries()) {
    const normalized = await normalizeFlight({
      record,
      index,
      input,
      ctx,
      providerCurrency,
      passengers,
      airline: airlines.get(record.airline?.toUpperCase() ?? "") ?? {
        code: record.airline ?? "",
        name: record.airline ?? "Airline",
      },
    });
    if (normalized) results.push(normalized);
  }

  return buildResponse(results, input.currency, ctx.searchId, false);
}

type NormalizeArgs = {
  record: TpFlightPrice;
  index: number;
  input: FlightSearchInput;
  ctx: SearchContext;
  providerCurrency: string;
  passengers: number;
  airline: { code: string; name: string; logoUrl?: string };
};

async function normalizeFlight(args: NormalizeArgs): Promise<FlightResult | null> {
  const { record, index, input, ctx, providerCurrency, passengers, airline } = args;

  if (!record.departure_at || typeof record.price !== "number") return null;

  const outboundDuration = record.duration_to ?? record.duration ?? 0;
  const outbound: FlightLeg = {
    origin: record.origin_airport ?? record.origin ?? input.from,
    destination: record.destination_airport ?? record.destination ?? input.to,
    departureAt: stripZone(record.departure_at),
    arrivalAt: addMinutesToLocalIso(stripZone(record.departure_at), outboundDuration),
    durationMinutes: outboundDuration,
    stops: record.transfers ?? 0,
  };

  const inboundDuration = record.duration_back ?? 0;
  const inbound: FlightLeg | undefined = record.return_at
    ? {
        origin: outbound.destination,
        destination: outbound.origin,
        departureAt: stripZone(record.return_at),
        arrivalAt: addMinutesToLocalIso(stripZone(record.return_at), inboundDuration),
        durationMinutes: inboundDuration,
        stops: record.return_transfers ?? 0,
      }
    : undefined;

  const price = await priceInRequestedCurrency(record.price, providerCurrency, input.currency);
  if (!price) return null;

  const subId = buildSubId(["flight", input.from, input.to, input.departure.replace(/-/g, "")]);

  const partnerUrl = record.link
    ? buildFlightDeepLink(record.link, subId)
    : buildFlightSearchLink({
        from: input.from,
        to: input.to,
        departure: input.departure,
        return: input.return,
        passengers,
        subId,
      });

  const id = `${record.airline ?? "XX"}-${record.flight_number ?? index}-${record.departure_at}`;

  return {
    id,
    airline,
    flightNumber: record.flight_number ? String(record.flight_number) : undefined,
    outbound,
    inbound,
    totalDurationMinutes: record.duration ?? outboundDuration + inboundDuration,
    stops: Math.max(outbound.stops, inbound?.stops ?? 0),
    cabin: input.cabin,
    price: price.amount,
    currency: price.currency,
    priceSource: price.source,
    originalPrice: price.original,
    bookingUrl: signOutboundUrl({
      u: partnerUrl,
      k: "flight",
      p: "travelpayouts",
      r: id,
      s: ctx.searchId,
      d: input.to,
      sub: subId,
      cur: price.currency,
      price: price.amount,
    }),
  };
}

type NormalizedPrice = {
  amount: number;
  currency: CurrencyCode;
  source: "provider" | "converted";
  original?: { amount: number; currency: string };
};

/**
 * The provider normally answers in the currency we asked for. If it doesn't, we
 * convert using a real rate source and label the result as an estimate — we
 * never present a converted number as the supplier's own price.
 */
async function priceInRequestedCurrency(
  amount: number,
  providerCurrency: string,
  requested: CurrencyCode,
): Promise<NormalizedPrice | null> {
  if (providerCurrency.toUpperCase() === requested) {
    return { amount, currency: requested, source: "provider" };
  }

  const converted = await convert(
    amount,
    providerCurrency.toUpperCase() as CurrencyCode,
    requested,
  );
  if (converted === null) return null;

  return {
    amount: converted,
    currency: requested,
    source: "converted",
    original: { amount, currency: providerCurrency.toUpperCase() },
  };
}

/** Provider timestamps carry an offset; we keep the local wall-clock time. */
function stripZone(value: string): string {
  return value.replace(/(Z|[+-]\d{2}:?\d{2})$/, "").slice(0, 19);
}

export function buildResponse(
  results: FlightResult[],
  currency: CurrencyCode,
  searchId: string,
  isMock: boolean,
): FlightSearchResponse {
  const prices = results.map((result) => result.price);
  const durations = results
    .map((result) => result.totalDurationMinutes)
    .filter((value) => value > 0);

  const airlines = [
    ...new Map(results.map((result) => [result.airline.code, result.airline])).values(),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return {
    searchId,
    results,
    currency,
    airlines,
    priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
    durationRange: durations.length
      ? { min: Math.min(...durations), max: Math.max(...durations) }
      : null,
    isMock,
    retrievedAt: Date.now(),
  };
}
