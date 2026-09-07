import "server-only";

import type { CurrencyCode } from "@/config/currencies";
import { AppError } from "@/lib/errors";
import { signOutboundUrl } from "@/lib/affiliate/link";
import { convert } from "@/lib/currency/rates";
import { addMinutesToLocalIso, daysBetween, todayIso } from "@/lib/utils/date";
import type { FlightSearchInput } from "@/lib/validation/flights";
import type {
  DateFlexibility,
  FlightLeg,
  FlightResult,
  FlightSearchResponse,
} from "@/types/flight";
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
 *
 * Because the fare cache is keyed on exact dates, a perfectly ordinary route
 * can have nothing priced for one particular date pair — asking only for the
 * exact dates is how a real route ends up showing zero results. So a search
 * that comes back empty is retried with the dates progressively relaxed, and
 * the response records which attempt answered so the UI can say so.
 */

const RESULT_LIMIT = 60;
/** Cached fares change slowly; a short TTL keeps the quota and the page fast. */
const CACHE_TTL_SECONDS = 60 * 15;
/** How far from the requested dates a relaxed retry is allowed to wander. */
const FLEX_WINDOW_DAYS = 7;

type DateAttempt = {
  flexibility: DateFlexibility;
  /** `YYYY-MM-DD` for a fixed day, `YYYY-MM` to let the provider pick the day. */
  departureAt: string;
  /** Omitted to accept any return date the provider has priced. */
  returnAt?: string;
};

/**
 * The searches we are willing to make, narrowest first. Each step gives up one
 * more constraint on the dates; nothing else about the search is relaxed.
 */
function dateAttempts(input: FlightSearchInput): DateAttempt[] {
  const month = (date: string) => date.slice(0, 7);

  if (!input.return) {
    return [
      { flexibility: "exact", departureAt: input.departure },
      { flexibility: "flexible-dates", departureAt: month(input.departure) },
    ];
  }

  return [
    { flexibility: "exact", departureAt: input.departure, returnAt: input.return },
    // Same outbound day, whichever return dates the provider has priced.
    { flexibility: "flexible-return", departureAt: input.departure },
    { flexibility: "flexible-dates", departureAt: month(input.departure) },
  ];
}

async function fetchPrices(
  input: FlightSearchInput,
  attempt: DateAttempt,
): Promise<TpFlightPricesResponse> {
  const payload = await tpFetch<TpFlightPricesResponse>(
    TP_HOSTS.api,
    "/aviasales/v3/prices_for_dates",
    {
      withToken: true,
      revalidate: CACHE_TTL_SECONDS,
      params: {
        origin: input.from,
        destination: input.to,
        departure_at: attempt.departureAt,
        return_at: attempt.returnAt,
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

  return payload;
}

/**
 * Drops fares a relaxed retry should not have brought back: departures in the
 * past, dates too far from the ones asked for, and one-way fares answering a
 * round-trip search.
 */
function usableRecords(
  records: TpFlightPrice[],
  input: FlightSearchInput,
  attempt: DateAttempt,
): TpFlightPrice[] {
  if (attempt.flexibility === "exact") return records;

  const today = todayIso();

  return records.filter((record) => {
    const departure = record.departure_at?.slice(0, 10);
    if (!departure || departure < today) return false;
    if (Math.abs(daysBetween(input.departure, departure)) > FLEX_WINDOW_DAYS) return false;

    if (!input.return) return true;

    const back = record.return_at?.slice(0, 10);
    if (!back || back < departure) return false;
    return Math.abs(daysBetween(input.return, back)) <= FLEX_WINDOW_DAYS;
  });
}

async function normalizeRecords(args: {
  records: TpFlightPrice[];
  input: FlightSearchInput;
  ctx: SearchContext;
  providerCurrency: string;
}): Promise<FlightResult[]> {
  const { records, input, ctx, providerCurrency } = args;

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

  return results;
}

export async function searchFlights(
  input: FlightSearchInput,
  ctx: SearchContext,
): Promise<FlightSearchResponse> {
  const attempts = dateAttempts(input);

  for (const [index, attempt] of attempts.entries()) {
    let payload: TpFlightPricesResponse;
    try {
      payload = await fetchPrices(input, attempt);
    } catch (error) {
      // The first attempt is the search the traveller asked for, so its failure
      // is the search's failure. A relaxed retry is a bonus on top: if the
      // provider stumbles there, stop rather than turn a wider net into an error.
      if (index === 0) throw error;
      break;
    }

    const records = usableRecords(Array.isArray(payload.data) ? payload.data : [], input, attempt);
    if (records.length === 0) continue;

    const results = await normalizeRecords({
      records,
      input,
      ctx,
      providerCurrency: (payload.currency ?? input.currency).toUpperCase(),
    });
    if (results.length === 0) continue;

    return buildResponse(results, input.currency, ctx.searchId, false, attempt.flexibility);
  }

  return buildResponse([], input.currency, ctx.searchId, false, "exact");
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
  dateFlexibility: DateFlexibility = "exact",
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
    dateFlexibility,
    retrievedAt: Date.now(),
  };
}
