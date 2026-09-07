import type { CurrencyCode } from "@/config/currencies";
import type { CabinClass } from "./search";

export type Airline = {
  code: string;
  name: string;
  logoUrl?: string;
};

/** One direction of travel, origin → destination, including any stops. */
export type FlightLeg = {
  origin: string;
  destination: string;
  /** ISO 8601 local departure time at the origin airport, e.g. 2026-10-18T05:30:00. */
  departureAt: string;
  /** Derived from departureAt + durationMinutes; local at the destination is not provided upstream. */
  arrivalAt: string;
  durationMinutes: number;
  stops: number;
};

/**
 * Provider-agnostic flight offer. Provider payloads are normalized into this
 * shape at the adapter boundary so no provider field names leak into the UI.
 */
export type FlightResult = {
  id: string;
  airline: Airline;
  flightNumber?: string;
  outbound: FlightLeg;
  inbound?: FlightLeg;
  /** Sum of leg durations; used for the "fastest" sort and duration filter. */
  totalDurationMinutes: number;
  /** Highest stop count across legs, used by the stops filter. */
  stops: number;
  cabin: CabinClass;
  price: number;
  currency: CurrencyCode;
  /** "provider" when the amount came back in this currency, "converted" when we converted it. */
  priceSource: "provider" | "converted";
  originalPrice?: { amount: number; currency: string };
  /** Baggage is only surfaced when the provider actually reports it. */
  baggageIncluded?: boolean;
  /** Relative or absolute deal URL; always routed through /go for click tracking. */
  bookingUrl: string;
  /** Set when the result came from the mock provider so the UI can label it. */
  isMock?: boolean;
};

export type FlightSearchResponse = {
  searchId: string;
  results: FlightResult[];
  currency: CurrencyCode;
  /** Airlines present in the result set, for the airline filter. */
  airlines: Airline[];
  priceRange: { min: number; max: number } | null;
  durationRange: { min: number; max: number } | null;
  isMock: boolean;
  /** Unix ms; results from cached fare data are not live availability. */
  retrievedAt: number;
};
