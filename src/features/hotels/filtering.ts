import type { HotelPropertyType, HotelResult } from "@/types/hotel";

/**
 * Pure filter/sort logic for hotel results.
 *
 * Some providers don't publish guest scores or amenities. Rather than showing a
 * filter that silently matches nothing, the UI asks these helpers which facets
 * the current result set can actually support.
 */

export type HotelSortId = "recommended" | "cheapest" | "rating" | "popular";

export const HOTEL_SORT_OPTIONS: { id: HotelSortId; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "cheapest", label: "Cheapest" },
  { id: "rating", label: "Highest rated" },
  { id: "popular", label: "Most popular" },
];

export const PROPERTY_TYPE_LABELS: Record<HotelPropertyType, string> = {
  hotel: "Hotel",
  apartment: "Apartment",
  resort: "Resort",
  villa: "Villa",
  hostel: "Hostel",
  guesthouse: "Guesthouse",
};

export type HotelFilters = {
  maxPricePerNight: number | null;
  stars: number[];
  minRating: number | null;
  propertyTypes: HotelPropertyType[];
  amenities: string[];
  breakfastOnly: boolean;
  freeCancellationOnly: boolean;
};

export const EMPTY_HOTEL_FILTERS: HotelFilters = {
  maxPricePerNight: null,
  stars: [],
  minRating: null,
  propertyTypes: [],
  amenities: [],
  breakfastOnly: false,
  freeCancellationOnly: false,
};

export function countActiveHotelFilters(filters: HotelFilters): number {
  return (
    (filters.maxPricePerNight === null ? 0 : 1) +
    filters.stars.length +
    (filters.minRating === null ? 0 : 1) +
    filters.propertyTypes.length +
    filters.amenities.length +
    (filters.breakfastOnly ? 1 : 0) +
    (filters.freeCancellationOnly ? 1 : 0)
  );
}

/** Which facets the current results carry enough data to filter on. */
export type HotelFacets = {
  hasStars: boolean;
  hasRatings: boolean;
  hasAmenities: boolean;
  hasBreakfastData: boolean;
  hasCancellationData: boolean;
  propertyTypes: HotelPropertyType[];
  amenities: string[];
  priceRange: { min: number; max: number } | null;
};

export function deriveHotelFacets(results: HotelResult[]): HotelFacets {
  const prices = results
    .map((result) => result.price?.perNight)
    .filter((value): value is number => typeof value === "number");

  return {
    hasStars: results.some((result) => typeof result.stars === "number"),
    hasRatings: results.some((result) => typeof result.rating === "number"),
    hasAmenities: results.some((result) => result.amenities.length > 0),
    hasBreakfastData: results.some((result) => typeof result.breakfastIncluded === "boolean"),
    hasCancellationData: results.some((result) => typeof result.freeCancellation === "boolean"),
    propertyTypes: [...new Set(results.map((result) => result.propertyType))].sort(),
    amenities: [...new Set(results.flatMap((result) => result.amenities))].sort(),
    priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
  };
}

export function applyHotelFilters(results: HotelResult[], filters: HotelFilters): HotelResult[] {
  return results.filter((result) => {
    const perNight = result.price?.perNight;
    if (
      filters.maxPricePerNight !== null &&
      perNight !== undefined &&
      perNight > filters.maxPricePerNight
    ) {
      return false;
    }
    if (filters.stars.length > 0 && !filters.stars.includes(Math.round(result.stars ?? 0))) {
      return false;
    }
    if (filters.minRating !== null && (result.rating ?? 0) < filters.minRating) return false;
    if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(result.propertyType)) {
      return false;
    }
    if (
      filters.amenities.length > 0 &&
      !filters.amenities.every((amenity) => result.amenities.includes(amenity))
    ) {
      return false;
    }
    if (filters.breakfastOnly && !result.breakfastIncluded) return false;
    if (filters.freeCancellationOnly && !result.freeCancellation) return false;
    return true;
  });
}

export function sortHotels(results: HotelResult[], sort: HotelSortId): HotelResult[] {
  const sorted = [...results];

  if (sort === "cheapest") {
    return sorted.sort((a, b) => (a.price?.perNight ?? Infinity) - (b.price?.perNight ?? Infinity));
  }
  if (sort === "rating") {
    return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
  if (sort === "popular") {
    return sorted.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
  }

  // Recommended: quality first, but not at any price.
  return sorted.sort((a, b) => recommendationScore(b) - recommendationScore(a));
}

function recommendationScore(hotel: HotelResult): number {
  // Guest score is the better signal; fall back to stars on a comparable scale.
  const quality = hotel.rating ?? (hotel.stars ?? 0) * 2;
  const pricePenalty = (hotel.price?.perNight ?? 0) / 20_000;
  return quality - pricePenalty;
}
