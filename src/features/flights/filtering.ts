import { hourOfDay } from "@/lib/utils/date";
import type { FlightResult } from "@/types/flight";

/**
 * Pure filter/sort logic for flight results.
 *
 * Filtering happens on the client over the already-fetched result set: changing
 * a checkbox is instant and costs no provider quota. Only a new search (new
 * route, dates or travellers) goes back to the API.
 */

export const DEPARTURE_WINDOWS = [
  { id: "morning", label: "Morning", hint: "05:00 – 11:59", from: 5, to: 11 },
  { id: "afternoon", label: "Afternoon", hint: "12:00 – 17:59", from: 12, to: 17 },
  { id: "evening", label: "Evening", hint: "18:00 – 23:59", from: 18, to: 23 },
  { id: "night", label: "Night", hint: "00:00 – 04:59", from: 0, to: 4 },
] as const;

export type DepartureWindowId = (typeof DEPARTURE_WINDOWS)[number]["id"];

export type FlightSortId = "recommended" | "cheapest" | "fastest" | "departure";

export const FLIGHT_SORT_OPTIONS: { id: FlightSortId; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "cheapest", label: "Cheapest" },
  { id: "fastest", label: "Fastest" },
  { id: "departure", label: "Departure time" },
];

export type FlightFilters = {
  /** 0, 1 or 2 where 2 means "2 or more". Empty means no stop filter. */
  stops: number[];
  airlines: string[];
  departureWindows: DepartureWindowId[];
  maxPrice: number | null;
  maxDurationMinutes: number | null;
};

export const EMPTY_FLIGHT_FILTERS: FlightFilters = {
  stops: [],
  airlines: [],
  departureWindows: [],
  maxPrice: null,
  maxDurationMinutes: null,
};

export function countActiveFlightFilters(filters: FlightFilters): number {
  return (
    filters.stops.length +
    filters.airlines.length +
    filters.departureWindows.length +
    (filters.maxPrice === null ? 0 : 1) +
    (filters.maxDurationMinutes === null ? 0 : 1)
  );
}

function matchesDepartureWindow(result: FlightResult, windows: DepartureWindowId[]): boolean {
  if (windows.length === 0) return true;
  const hour = hourOfDay(result.outbound.departureAt);
  return windows.some((id) => {
    const window = DEPARTURE_WINDOWS.find((entry) => entry.id === id);
    return window ? hour >= window.from && hour <= window.to : false;
  });
}

export function applyFlightFilters(
  results: FlightResult[],
  filters: FlightFilters,
): FlightResult[] {
  return results.filter((result) => {
    if (filters.stops.length > 0) {
      const bucket = Math.min(result.stops, 2);
      if (!filters.stops.includes(bucket)) return false;
    }
    if (filters.airlines.length > 0 && !filters.airlines.includes(result.airline.code))
      return false;
    if (filters.maxPrice !== null && result.price > filters.maxPrice) return false;
    if (
      filters.maxDurationMinutes !== null &&
      result.totalDurationMinutes > filters.maxDurationMinutes
    ) {
      return false;
    }
    return matchesDepartureWindow(result, filters.departureWindows);
  });
}

/**
 * "Recommended" balances price against total travel time and penalises stops,
 * so the top result is rarely the cheapest red-eye with two connections.
 */
function recommendationScore(
  result: FlightResult,
  price: { min: number; max: number },
  duration: { min: number; max: number },
): number {
  const priceSpan = Math.max(1, price.max - price.min);
  const durationSpan = Math.max(1, duration.max - duration.min);
  const priceScore = (result.price - price.min) / priceSpan;
  const durationScore = (result.totalDurationMinutes - duration.min) / durationSpan;
  return priceScore * 0.62 + durationScore * 0.28 + Math.min(result.stops, 2) * 0.05;
}

export function sortFlights(results: FlightResult[], sort: FlightSortId): FlightResult[] {
  const sorted = [...results];

  if (sort === "cheapest") return sorted.sort((a, b) => a.price - b.price);
  if (sort === "fastest") {
    return sorted.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
  }
  if (sort === "departure") {
    return sorted.sort((a, b) => a.outbound.departureAt.localeCompare(b.outbound.departureAt));
  }

  if (sorted.length === 0) return sorted;
  const prices = sorted.map((result) => result.price);
  const durations = sorted.map((result) => result.totalDurationMinutes);
  const priceRange = { min: Math.min(...prices), max: Math.max(...prices) };
  const durationRange = { min: Math.min(...durations), max: Math.max(...durations) };

  return sorted.sort(
    (a, b) =>
      recommendationScore(a, priceRange, durationRange) -
      recommendationScore(b, priceRange, durationRange),
  );
}

export function stopsLabel(stops: number): string {
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}
