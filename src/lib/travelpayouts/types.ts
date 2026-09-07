/**
 * Raw Travelpayouts payload shapes.
 *
 * These types exist only inside the adapter: everything crossing out of
 * lib/travelpayouts is already normalized to the app's own domain types.
 */

/** `GET /aviasales/v3/prices_for_dates` item. */
export type TpFlightPrice = {
  origin: string;
  destination: string;
  origin_airport?: string;
  destination_airport?: string;
  price: number;
  airline: string;
  flight_number?: string | number;
  departure_at: string;
  return_at?: string;
  transfers?: number;
  return_transfers?: number;
  duration?: number;
  duration_to?: number;
  duration_back?: number;
  link?: string;
};

export type TpFlightPricesResponse = {
  success?: boolean;
  data?: TpFlightPrice[];
  currency?: string;
  error?: string;
};

/** `GET autocomplete.travelpayouts.com/places2` item. */
export type TpPlace = {
  type: "airport" | "city" | "country";
  code: string;
  name: string;
  city_name?: string;
  country_name?: string;
  country_code?: string;
  index_strings?: string[];
};

/** `GET engine.hotellook.com/api/v2/cache.json` item. */
export type TpHotelPrice = {
  hotelId: number;
  hotelName: string;
  stars?: number;
  priceFrom?: number;
  priceAvg?: number;
  pricePercentile?: Record<string, number>;
  location?: {
    name?: string;
    country?: string;
    state?: string | null;
    geo?: { lat: number; lon: number };
  };
};

/** `GET engine.hotellook.com/api/v2/lookup.json` payload. */
export type TpLookupResponse = {
  results?: {
    locations?: {
      id: string;
      type?: string;
      cityName?: string;
      fullName?: string;
      countryName?: string;
      countryCode?: string;
      hotelsCount?: number | string;
      location?: { lat: string | number; lon: string | number };
    }[];
    hotels?: {
      id: string;
      label?: string;
      locationName?: string;
      locationId?: string;
      fullName?: string;
    }[];
  };
};

export type TpAirlineRecord = {
  code?: string;
  name?: string;
  name_translations?: Record<string, string>;
};
