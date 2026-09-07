import "server-only";

import { findAirport, searchAirportSeed } from "@/config/airports";
import { airlineName } from "@/config/airlines";
import { serverEnv } from "@/config/env";
import type { CurrencyCode } from "@/config/currencies";
import { signOutboundUrl } from "@/lib/affiliate/link";
import { AppError } from "@/lib/errors";
import { buildResponse } from "@/lib/travelpayouts/flights";
import { buildHotelResponse } from "@/lib/travelpayouts/hotels";
import {
  airlineLogoUrl,
  buildFlightSearchLink,
  buildHotelDeepLink,
  buildSubId,
} from "@/lib/travelpayouts/links";
import { addMinutesToLocalIso, daysBetween } from "@/lib/utils/date";
import { slugify } from "@/lib/utils/slug";
import type { HotelDetailsInput, SearchContext, TravelProvider } from "@/lib/providers/types";
import type { FlightSearchInput } from "@/lib/validation/flights";
import type { HotelSearchInput } from "@/lib/validation/hotels";
import type { FlightLeg, FlightResult } from "@/types/flight";
import type { HotelDetails, HotelResult } from "@/types/hotel";
import type { Place } from "@/types/search";
import { AMENITY_LIBRARY, MOCK_CITY_ALIASES, MOCK_HOTELS, type MockHotel } from "./catalogue";
import { mockAmount } from "./pricing";
import { createRandom, intBetween, pick } from "./random";
import { airlinePool, baseDurationMinutes, regionFor } from "./regions";

/**
 * Development provider.
 *
 * Produces realistic — but explicitly sample — results so the whole product can
 * be built, demoed and tested before Travelpayouts credentials exist. Every
 * result it returns is flagged `isMock`, and the UI labels those results as
 * sample data. It also simulates latency, empty results and provider failures
 * so the loading, empty and error states are exercised for real.
 */

type Scenario = "normal" | "empty" | "error" | "slow";

function scenario(): Scenario {
  const value = serverEnv.mockScenario;
  return value === "empty" || value === "error" || value === "slow" ? value : "normal";
}

async function simulateLatency(): Promise<void> {
  const current = scenario();
  if (current === "error") {
    throw new AppError("provider_unavailable", "mock scenario: forced provider failure");
  }
  const ms = current === "slow" ? 3200 : 350 + Math.random() * 500;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/* -------------------------------------------------------------------------- */
/* Flights                                                                    */
/* -------------------------------------------------------------------------- */

const DEPARTURE_SLOTS = [
  "00:45",
  "02:20",
  "05:30",
  "06:15",
  "07:40",
  "08:55",
  "10:20",
  "11:45",
  "13:10",
  "14:35",
  "16:00",
  "17:25",
  "18:50",
  "20:05",
  "21:30",
  "23:15",
];

async function mockSearchFlights(input: FlightSearchInput, ctx: SearchContext) {
  await simulateLatency();

  if (scenario() === "empty") {
    return buildResponse([], input.currency, ctx.searchId, true);
  }

  const random = createRandom(`${input.from}${input.to}${input.departure}${input.return ?? ""}`);
  const origin = findAirport(input.from);
  const destination = findAirport(input.to);
  const fromRegion = regionFor(origin?.countryCode ?? "IN");
  const toRegion = regionFor(destination?.countryCode ?? "AE");
  const sameCountry = Boolean(
    origin && destination && origin.countryCode === destination.countryCode,
  );

  const baseMinutes = baseDurationMinutes(fromRegion, toRegion, sameCountry);
  const carriers = airlinePool(fromRegion, toRegion);
  // Longer routes cost more; the cabin multiplier reflects the traveller's choice.
  const baseFareInr = Math.round((2600 + baseMinutes * 26) * cabinMultiplier(input.cabin));

  const offerCount = intBetween(random, 16, 26);
  const results: FlightResult[] = [];

  for (let index = 0; index < offerCount; index += 1) {
    const carrier = pick(random, carriers);
    const stops = input.directOnly ? 0 : weightedStops(random, baseMinutes);
    const outboundMinutes = Math.round(
      baseMinutes * (0.94 + random() * 0.16) + stops * (75 + random() * 90),
    );
    const departureSlot = pick(random, DEPARTURE_SLOTS);
    const departureAt = `${input.departure}T${departureSlot}:00`;

    const outbound: FlightLeg = {
      origin: input.from,
      destination: input.to,
      departureAt,
      arrivalAt: addMinutesToLocalIso(departureAt, outboundMinutes),
      durationMinutes: outboundMinutes,
      stops,
    };

    let inbound: FlightLeg | undefined;
    if (input.return) {
      const inboundStops = input.directOnly ? 0 : weightedStops(random, baseMinutes);
      const inboundMinutes = Math.round(
        baseMinutes * (0.94 + random() * 0.16) + inboundStops * (75 + random() * 90),
      );
      const returnDeparture = `${input.return}T${pick(random, DEPARTURE_SLOTS)}:00`;
      inbound = {
        origin: input.to,
        destination: input.from,
        departureAt: returnDeparture,
        arrivalAt: addMinutesToLocalIso(returnDeparture, inboundMinutes),
        durationMinutes: inboundMinutes,
        stops: inboundStops,
      };
    }

    // Non-stops and convenient departures carry the usual premium.
    const stopDiscount = 1 - stops * 0.11;
    const spread = 0.82 + random() * 0.55;
    const roundTripFactor = input.return ? 1.78 : 1;
    const priceInr = Math.round((baseFareInr / stopDiscount) * spread * roundTripFactor);

    const subId = buildSubId(["flight", input.from, input.to, input.departure.replace(/-/g, "")]);
    const partnerUrl = buildFlightSearchLink({
      from: input.from,
      to: input.to,
      departure: input.departure,
      return: input.return,
      passengers: input.adults + input.children,
      subId,
    });

    const id = `mock-${carrier}-${index}-${departureSlot.replace(":", "")}`;

    results.push({
      id,
      airline: { code: carrier, name: airlineName(carrier), logoUrl: airlineLogoUrl(carrier) },
      flightNumber: `${carrier}${intBetween(random, 100, 989)}`,
      outbound,
      inbound,
      totalDurationMinutes: outboundMinutes + (inbound?.durationMinutes ?? 0),
      stops: Math.max(stops, inbound?.stops ?? 0),
      cabin: input.cabin,
      price: mockAmount(priceInr, input.currency),
      currency: input.currency,
      priceSource: "provider",
      baggageIncluded: random() > 0.45,
      bookingUrl: signOutboundUrl({
        u: partnerUrl,
        k: "flight",
        p: "mock",
        r: id,
        s: ctx.searchId,
        d: input.to,
        sub: subId,
        cur: input.currency,
        price: mockAmount(priceInr, input.currency),
      }),
      isMock: true,
    });
  }

  results.sort((a, b) => a.price - b.price);
  return buildResponse(results, input.currency, ctx.searchId, true);
}

function cabinMultiplier(cabin: FlightSearchInput["cabin"]): number {
  switch (cabin) {
    case "premium_economy":
      return 1.7;
    case "business":
      return 3.4;
    case "first":
      return 5.6;
    default:
      return 1;
  }
}

function weightedStops(random: () => number, baseMinutes: number): number {
  const roll = random();
  if (baseMinutes <= 240) return roll < 0.72 ? 0 : 1;
  if (baseMinutes <= 480) return roll < 0.45 ? 0 : roll < 0.9 ? 1 : 2;
  return roll < 0.28 ? 0 : roll < 0.85 ? 1 : 2;
}

/* -------------------------------------------------------------------------- */
/* Hotels                                                                     */
/* -------------------------------------------------------------------------- */

function catalogueFor(destination: string): MockHotel[] {
  const normalized = destination.trim().toLowerCase();
  const key = MOCK_CITY_ALIASES[normalized] ?? slugify(normalized);
  if (MOCK_HOTELS[key]) return MOCK_HOTELS[key];

  // Any destination should return something sensible, so unknown cities reuse a
  // catalogue deterministically chosen from the destination name.
  const keys = Object.keys(MOCK_HOTELS);
  const index = Math.floor(createRandom(key)() * keys.length) % keys.length;
  return MOCK_HOTELS[keys[index]];
}

function toHotelResult(args: {
  entry: MockHotel;
  input: HotelSearchInput;
  ctx: SearchContext;
  nights: number;
  currency: CurrencyCode;
  destinationLabel: string;
}): HotelResult {
  const { entry, input, ctx, nights, currency, destinationLabel } = args;
  const random = createRandom(`${entry.name}${input.checkin}${input.guests}`);

  // Rooms scale the nightly rate; weekends and larger parties cost more.
  const occupancyFactor = 1 + Math.max(0, input.guests - 2) * 0.12 + (input.rooms - 1) * 0.85;
  const seasonality = 0.92 + random() * 0.24;
  const perNightInr = Math.round(entry.baseNightlyInr * occupancyFactor * seasonality);
  const perNight = mockAmount(perNightInr, currency);

  // The slug is the public identifier and the id the provider-facing one.
  const slug = slugify(entry.name);
  const id = `mock-${slug}`;
  const subId = buildSubId(["hotel", destinationLabel, input.checkin.replace(/-/g, "")]);

  const partnerUrl = buildHotelDeepLink({
    destination: destinationLabel,
    checkIn: input.checkin,
    checkOut: input.checkout,
    adults: input.guests,
    currency,
    subId,
  });

  return {
    id,
    slug,
    name: entry.name,
    image: entry.image,
    images: [entry.image],
    location: {
      city: destinationLabel,
      country: "",
      address: entry.area,
      distanceToCenterKm: entry.distanceToCenterKm,
    },
    stars: entry.stars,
    rating: entry.rating,
    reviewCount: entry.reviewCount,
    propertyType: entry.propertyType,
    amenities: entry.amenities,
    breakfastIncluded: entry.breakfastIncluded,
    freeCancellation: entry.freeCancellation,
    price: {
      perNight,
      total: mockAmount(perNightInr * nights, currency),
      currency,
      priceSource: "provider",
    },
    bookingUrl: signOutboundUrl({
      u: partnerUrl,
      k: "hotel",
      p: "mock",
      r: id,
      s: ctx.searchId,
      d: destinationLabel,
      sub: subId,
      cur: currency,
      price: perNight,
    }),
    isMock: true,
  };
}

async function mockSearchHotels(input: HotelSearchInput, ctx: SearchContext) {
  await simulateLatency();

  const nights = Math.max(1, daysBetween(input.checkin, input.checkout));
  const destinationLabel = titleCase(input.destination);

  if (scenario() === "empty") {
    return buildHotelResponse({
      results: [],
      destinationLabel,
      currency: input.currency,
      nights,
      searchId: ctx.searchId,
      isMock: true,
    });
  }

  const results = catalogueFor(input.destination).map((entry) =>
    toHotelResult({
      entry,
      input,
      ctx,
      nights,
      currency: input.currency,
      destinationLabel,
    }),
  );

  return buildHotelResponse({
    results,
    destinationLabel,
    currency: input.currency,
    nights,
    searchId: ctx.searchId,
    isMock: true,
  });
}

async function mockHotelDetails(
  input: HotelDetailsInput,
  ctx: SearchContext,
): Promise<HotelDetails | null> {
  await simulateLatency();

  const entry = Object.values(MOCK_HOTELS)
    .flat()
    .find(
      (candidate) =>
        slugify(candidate.name) === input.id || `mock-${slugify(candidate.name)}` === input.id,
    );

  if (!entry) return null;

  const nights =
    input.checkin && input.checkout ? Math.max(1, daysBetween(input.checkin, input.checkout)) : 1;
  const currency = input.currency;
  const perNight = mockAmount(entry.baseNightlyInr, currency);
  const subId = buildSubId(["hoteldetail", slugify(entry.name)]);

  const partnerUrl = buildHotelDeepLink({
    destination: entry.area,
    checkIn: input.checkin ?? "",
    checkOut: input.checkout ?? "",
    adults: input.guests,
    currency,
    subId,
  });

  const bookingUrl = signOutboundUrl({
    u: partnerUrl,
    k: "hotel",
    p: "mock",
    r: input.id,
    s: ctx.searchId,
    sub: subId,
    cur: currency,
    price: perNight,
  });

  const rooms = [
    {
      name: "Standard Double",
      multiplier: 1,
      board: "Room only",
      cancellable: entry.freeCancellation,
    },
    {
      name: "Deluxe with view",
      multiplier: 1.28,
      board: entry.breakfastIncluded ? "Breakfast included" : "Room only",
      cancellable: entry.freeCancellation,
    },
    { name: "Suite", multiplier: 1.85, board: "Breakfast included", cancellable: true },
  ].map((room, index) => ({
    id: `${input.id}-room-${index}`,
    name: room.name,
    boardType: room.board,
    freeCancellation: room.cancellable,
    price: {
      perNight: mockAmount(Math.round(entry.baseNightlyInr * room.multiplier), currency),
      total: mockAmount(Math.round(entry.baseNightlyInr * room.multiplier * nights), currency),
      currency,
      priceSource: "provider" as const,
    },
    bookingUrl,
  }));

  return {
    id: input.id,
    slug: slugify(entry.name),
    name: entry.name,
    image: entry.image,
    images: [entry.image],
    location: {
      city: entry.area,
      country: "",
      address: entry.area,
      distanceToCenterKm: entry.distanceToCenterKm,
    },
    stars: entry.stars,
    rating: entry.rating,
    reviewCount: entry.reviewCount,
    propertyType: entry.propertyType,
    amenities: entry.amenities.length ? entry.amenities : [...AMENITY_LIBRARY].slice(0, 5),
    breakfastIncluded: entry.breakfastIncluded,
    freeCancellation: entry.freeCancellation,
    description: entry.description,
    price: {
      perNight,
      total: mockAmount(entry.baseNightlyInr * nights, currency),
      currency,
      priceSource: "provider",
    },
    rooms,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    importantInformation: [
      "Sample property used for development. Prices and availability are illustrative.",
      "Final price, taxes and cancellation terms are confirmed by the booking provider.",
    ],
    bookingUrl,
    isMock: true,
  };
}

/* -------------------------------------------------------------------------- */

async function mockSearchAirports(query: string): Promise<Place[]> {
  return searchAirportSeed(query);
}

async function mockSearchHotelDestinations(query: string): Promise<Place[]> {
  const seed = searchAirportSeed(query, 6);
  const seen = new Set<string>();

  return seed
    .filter((place) => {
      if (seen.has(place.cityName)) return false;
      seen.add(place.cityName);
      return true;
    })
    .map((place) => ({
      code: slugify(place.cityName),
      type: "city" as const,
      name: place.cityName,
      cityName: place.cityName,
      countryName: place.countryName,
      countryCode: place.countryCode,
    }));
}

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const mockProvider: TravelProvider = {
  id: "mock",
  isMock: true,
  searchFlights: mockSearchFlights,
  searchHotels: mockSearchHotels,
  getHotelDetails: mockHotelDetails,
  searchAirports: mockSearchAirports,
  searchHotelDestinations: mockSearchHotelDestinations,
};
