import "server-only";

import { getMarker } from "./client";

/**
 * Partner deep-link construction.
 *
 * Travelpayouts attributes a click through the `marker` parameter. A sub-id is
 * appended to the marker as `marker=<marker>.<sub_id>`, which is the format the
 * program supports for campaign-level reporting.
 */

export const AVIASALES_HOST = "https://www.aviasales.com";
export const HOTELLOOK_SEARCH_HOST = "https://search.hotellook.com";

/** Hosts we are ever willing to redirect a user to. */
export const PARTNER_HOST_ALLOWLIST = [
  "aviasales.com",
  "www.aviasales.com",
  "search.hotellook.com",
  "hotellook.com",
  "www.hotellook.com",
  "tp.media",
  "trs.aviasales.com",
] as const;

export function isAllowedPartnerHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return (PARTNER_HOST_ALLOWLIST as readonly string[]).includes(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Builds a sub-id from search intent, e.g. `flight_BOM_DXB_20261018`.
 * Only characters the program accepts are kept.
 */
export function buildSubId(parts: (string | number | undefined)[]): string {
  return parts
    .filter((part) => part !== undefined && part !== "")
    .join("_")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 60);
}

function withMarker(url: URL, subId?: string): URL {
  const marker = getMarker();
  url.searchParams.set("marker", subId ? `${marker}.${subId}` : marker);
  return url;
}

/**
 * Turns the relative `link` returned by the flight price API into an absolute
 * Aviasales URL carrying our marker.
 */
export function buildFlightDeepLink(providerLink: string | undefined, subId?: string): string {
  const base = providerLink?.startsWith("http")
    ? providerLink
    : `${AVIASALES_HOST}${providerLink ?? ""}`;

  const url = new URL(providerLink ? base : AVIASALES_HOST);
  return withMarker(url, subId).toString();
}

/**
 * Fallback flight link built from search intent, used when a fare record has no
 * deep link of its own. Aviasales encodes a search as
 * `/search/<ORIGIN><DDMM><DEST><DDMM><passengers>`.
 */
export function buildFlightSearchLink(input: {
  from: string;
  to: string;
  departure: string;
  return?: string;
  passengers: number;
  subId?: string;
}): string {
  const segment = (date: string) => `${date.slice(8, 10)}${date.slice(5, 7)}`;
  const path =
    `/search/${input.from}${segment(input.departure)}${input.to}` +
    `${input.return ? segment(input.return) : ""}${Math.min(Math.max(input.passengers, 1), 9)}`;

  const url = new URL(`${AVIASALES_HOST}${path}`);
  return withMarker(url, input.subId).toString();
}

export function buildHotelDeepLink(input: {
  hotelId?: string | number;
  destination?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  currency: string;
  subId?: string;
}): string {
  const url = new URL(
    input.hotelId ? `${HOTELLOOK_SEARCH_HOST}/hotels` : `${HOTELLOOK_SEARCH_HOST}/`,
  );

  if (input.hotelId) url.searchParams.set("hotelId", String(input.hotelId));
  if (input.destination) url.searchParams.set("destination", input.destination);
  url.searchParams.set("checkIn", input.checkIn);
  url.searchParams.set("checkOut", input.checkOut);
  url.searchParams.set("adults", String(input.adults));
  url.searchParams.set("currency", input.currency.toLowerCase());
  url.searchParams.set("language", "en");

  return withMarker(url, input.subId).toString();
}

/** Airline logo CDN operated by Travelpayouts/Aviasales. */
export function airlineLogoUrl(iataCode: string, size = 80): string {
  return `https://pics.avs.io/${size}/${Math.round(size / 2)}/${iataCode.toUpperCase()}.png`;
}

/** Hotel photo CDN operated by Hotellook. */
export function hotelPhotoUrl(hotelId: string | number, index = 1, width = 840, height = 560) {
  return `https://photo.hotellook.com/image_v2/limit/h${hotelId}_${index}/${width}/${height}.auto`;
}
