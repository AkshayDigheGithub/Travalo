import type { CurrencyCode } from "@/config/currencies";

export type TripType = "round-trip" | "one-way" | "multi-city";
export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export type PlaceType = "airport" | "city";

/** A normalized location suggestion used by both autocompletes. */
export type Place = {
  /** IATA airport or city code, uppercase. */
  code: string;
  type: PlaceType;
  /** Airport name for airports, city name for cities. */
  name: string;
  cityName: string;
  countryName: string;
  countryCode: string;
  /** Present for city suggestions that aggregate several airports. */
  airportCount?: number;
};

export type FlightSearchParams = {
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
  directOnly?: boolean;
};

export type HotelSearchParams = {
  destination: string;
  checkin: string;
  checkout: string;
  guests: number;
  rooms: number;
  currency: CurrencyCode;
};
