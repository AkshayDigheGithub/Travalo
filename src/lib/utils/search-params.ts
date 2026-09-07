import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from "@/config/currencies";
import { addDays, isIsoDate, todayIso } from "@/lib/utils/date";
import type { CabinClass, TripType } from "@/types/search";

/**
 * URL is the source of truth for a search.
 *
 * Every result page can be refreshed, shared or reached with the back button
 * and reproduce exactly the same search, so these helpers are the only place
 * that knows the query-string contract.
 */

export type FlightSearchState = {
  tripType: TripType;
  from: string;
  to: string;
  departure: string;
  return?: string;
  adults: number;
  children: number;
  infants: number;
  cabin: CabinClass;
  currency: CurrencyCode;
  directOnly: boolean;
};

export type HotelSearchState = {
  destination: string;
  checkin: string;
  checkout: string;
  guests: number;
  rooms: number;
  currency: CurrencyCode;
};

export type RawParams = Record<string, string | string[] | undefined>;

function first(params: RawParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function int(params: RawParams, key: string, fallback: number, min: number, max: number): number {
  const parsed = Number(first(params, key));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

function currencyFrom(params: RawParams, fallback: CurrencyCode): CurrencyCode {
  const value = first(params, "currency");
  return value && isCurrencyCode(value) ? (value.toUpperCase() as CurrencyCode) : fallback;
}

const TRIP_TYPES: TripType[] = ["round-trip", "one-way", "multi-city"];
const CABINS: CabinClass[] = ["economy", "premium_economy", "business", "first"];

/** Sensible starting dates: a trip a fortnight out, returning a week later. */
export function defaultFlightState(currency: CurrencyCode = DEFAULT_CURRENCY): FlightSearchState {
  const departure = addDays(todayIso(), 14);
  return {
    tripType: "round-trip",
    from: "",
    to: "",
    departure,
    return: addDays(departure, 7),
    adults: 1,
    children: 0,
    infants: 0,
    cabin: "economy",
    currency,
    directOnly: false,
  };
}

export function defaultHotelState(currency: CurrencyCode = DEFAULT_CURRENCY): HotelSearchState {
  const checkin = addDays(todayIso(), 14);
  return {
    destination: "",
    checkin,
    checkout: addDays(checkin, 3),
    guests: 2,
    rooms: 1,
    currency,
  };
}

export function parseFlightState(
  params: RawParams,
  currencyFallback: CurrencyCode = DEFAULT_CURRENCY,
): FlightSearchState {
  const defaults = defaultFlightState(currencyFallback);

  const tripTypeParam = first(params, "tripType") as TripType | undefined;
  const tripType =
    tripTypeParam && TRIP_TYPES.includes(tripTypeParam) ? tripTypeParam : defaults.tripType;

  const cabinParam = first(params, "cabin") as CabinClass | undefined;
  const departure = validDate(first(params, "departure")) ?? defaults.departure;
  const returnDate = validDate(first(params, "return"));

  return {
    tripType,
    from: (first(params, "from") ?? "").toUpperCase().slice(0, 3),
    to: (first(params, "to") ?? "").toUpperCase().slice(0, 3),
    departure,
    return: tripType === "one-way" ? undefined : (returnDate ?? defaults.return),
    adults: int(params, "adults", defaults.adults, 1, 9),
    children: int(params, "children", defaults.children, 0, 8),
    infants: int(params, "infants", defaults.infants, 0, 9),
    cabin: cabinParam && CABINS.includes(cabinParam) ? cabinParam : defaults.cabin,
    currency: currencyFrom(params, currencyFallback),
    directOnly: first(params, "directOnly") === "true",
  };
}

export function parseHotelState(
  params: RawParams,
  currencyFallback: CurrencyCode = DEFAULT_CURRENCY,
): HotelSearchState {
  const defaults = defaultHotelState(currencyFallback);
  const checkin = validDate(first(params, "checkin")) ?? defaults.checkin;
  const checkout = validDate(first(params, "checkout")) ?? addDays(checkin, 3);

  return {
    destination: (first(params, "destination") ?? "").trim().slice(0, 80),
    checkin,
    checkout: checkout > checkin ? checkout : addDays(checkin, 1),
    guests: int(params, "guests", defaults.guests, 1, 16),
    rooms: int(params, "rooms", defaults.rooms, 1, 8),
    currency: currencyFrom(params, currencyFallback),
  };
}

export function flightSearchQuery(state: FlightSearchState): string {
  const params = new URLSearchParams({
    tripType: state.tripType,
    from: state.from,
    to: state.to,
    departure: state.departure,
    adults: String(state.adults),
    cabin: state.cabin,
    currency: state.currency,
  });

  if (state.tripType !== "one-way" && state.return) params.set("return", state.return);
  if (state.children > 0) params.set("children", String(state.children));
  if (state.infants > 0) params.set("infants", String(state.infants));
  if (state.directOnly) params.set("directOnly", "true");

  return params.toString();
}

export function hotelSearchQuery(state: HotelSearchState): string {
  const params = new URLSearchParams({
    destination: state.destination,
    checkin: state.checkin,
    checkout: state.checkout,
    guests: String(state.guests),
    currency: state.currency,
  });
  if (state.rooms > 1) params.set("rooms", String(state.rooms));
  return params.toString();
}

export function flightResultsHref(state: FlightSearchState): string {
  return `/flights/results?${flightSearchQuery(state)}`;
}

export function hotelResultsHref(state: HotelSearchState): string {
  return `/hotels/results?${hotelSearchQuery(state)}`;
}

/** True when the URL carries enough to actually run a search. */
export function hasFlightSearch(params: RawParams): boolean {
  return Boolean(first(params, "from") && first(params, "to") && first(params, "departure"));
}

export function hasHotelSearch(params: RawParams): boolean {
  return Boolean(first(params, "destination") && first(params, "checkin"));
}

function validDate(value: string | undefined): string | undefined {
  return value && isIsoDate(value) ? value : undefined;
}
