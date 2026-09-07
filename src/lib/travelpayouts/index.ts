import "server-only";

import type { HotelDetailsInput, SearchContext, TravelProvider } from "@/lib/providers/types";
import type { FlightSearchInput } from "@/lib/validation/flights";
import type { HotelSearchInput } from "@/lib/validation/hotels";
import { searchAirports } from "./airports";
import { searchFlights } from "./flights";
import { getHotelDetails, searchHotelDestinations, searchHotels } from "./hotels";

/** The live Travelpayouts-backed implementation of the provider seam. */
export const travelpayoutsProvider: TravelProvider = {
  id: "travelpayouts",
  isMock: false,
  searchFlights: (input: FlightSearchInput, ctx: SearchContext) => searchFlights(input, ctx),
  searchHotels: (input: HotelSearchInput, ctx: SearchContext) => searchHotels(input, ctx),
  getHotelDetails: (input: HotelDetailsInput, ctx: SearchContext) => getHotelDetails(input, ctx),
  searchAirports: (query: string) => searchAirports(query),
  searchHotelDestinations: (query: string) => searchHotelDestinations(query),
};
