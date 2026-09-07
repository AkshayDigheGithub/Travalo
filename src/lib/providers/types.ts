import type { FlightSearchInput } from "@/lib/validation/flights";
import type { HotelSearchInput } from "@/lib/validation/hotels";
import type { CurrencyCode } from "@/config/currencies";
import type { FlightSearchResponse } from "@/types/flight";
import type { HotelDetails, HotelSearchResponse } from "@/types/hotel";
import type { Place } from "@/types/search";

export type SearchContext = {
  /** Correlates a search with the affiliate clicks that follow it. */
  searchId: string;
};

export type HotelDetailsInput = {
  id: string;
  checkin?: string;
  checkout?: string;
  guests: number;
  currency: CurrencyCode;
};

/**
 * The seam between the app and whoever supplies travel data. The mock provider
 * and the Travelpayouts provider both satisfy it, so nothing above this line
 * knows which one is answering.
 */
export interface TravelProvider {
  readonly id: string;
  readonly isMock: boolean;
  searchFlights(input: FlightSearchInput, ctx: SearchContext): Promise<FlightSearchResponse>;
  searchHotels(input: HotelSearchInput, ctx: SearchContext): Promise<HotelSearchResponse>;
  getHotelDetails(input: HotelDetailsInput, ctx: SearchContext): Promise<HotelDetails | null>;
  searchAirports(query: string): Promise<Place[]>;
  searchHotelDestinations(query: string): Promise<Place[]>;
}
