import type { CurrencyCode } from "@/config/currencies";

export type HotelPropertyType =
  "hotel" | "apartment" | "resort" | "villa" | "hostel" | "guesthouse";

export type HotelPrice = {
  /** Total for the whole stay when known, otherwise undefined. */
  total?: number;
  perNight: number;
  currency: CurrencyCode;
  priceSource: "provider" | "converted";
  originalPrice?: { amount: number; currency: string };
};

export type HotelRoomOption = {
  id: string;
  name: string;
  boardType?: string;
  freeCancellation: boolean;
  price: HotelPrice;
  bookingUrl: string;
};

export type HotelResult = {
  id: string;
  slug: string;
  name: string;
  image?: string;
  images?: string[];
  location: {
    city: string;
    country: string;
    address?: string;
    distanceToCenterKm?: number;
  };
  /** Official star rating, 1–5. */
  stars?: number;
  /** Guest score on a 0–10 scale. */
  rating?: number;
  reviewCount?: number;
  propertyType: HotelPropertyType;
  amenities: string[];
  breakfastIncluded?: boolean;
  freeCancellation?: boolean;
  price?: HotelPrice;
  bookingUrl: string;
  isMock?: boolean;
};

export type HotelDetails = HotelResult & {
  description?: string;
  rooms: HotelRoomOption[];
  checkInTime?: string;
  checkOutTime?: string;
  importantInformation: string[];
};

export type HotelSearchResponse = {
  searchId: string;
  destinationLabel: string;
  results: HotelResult[];
  currency: CurrencyCode;
  nights: number;
  priceRange: { min: number; max: number } | null;
  amenities: string[];
  isMock: boolean;
  retrievedAt: number;
};
