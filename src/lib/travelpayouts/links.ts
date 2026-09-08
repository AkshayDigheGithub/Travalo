import "server-only";

import { serverEnv } from "@/config/env";
import { logger } from "@/lib/logger";
import { getMarker } from "./client";

/**
 * Partner deep-link construction.
 *
 * Two different things have to be true for a link to earn and to be visible:
 *
 * - **Attribution** comes from the `marker` parameter. A sub-id is appended as
 *   `marker=<marker>.<sub_id>`, which is the format the program supports for
 *   campaign-level reporting.
 * - **The click statistic** comes from Travelpayouts' own redirector at
 *   `tp.media/r`. A link that carries a correct marker but goes straight to the
 *   brand site can still be credited for a booking, yet it never appears in the
 *   Clicks column of the dashboard, because nothing ever told Travelpayouts the
 *   click happened. So every partner URL is wrapped before it is handed out.
 */

export const AVIASALES_HOST = "https://www.aviasales.com";
export const HOTELLOOK_SEARCH_HOST = "https://search.hotellook.com";

/** Travelpayouts' click redirector. Hitting it is what records a click. */
export const TP_REDIRECTOR = "https://tp.media/r";

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

/** `marker`, with the sub-id appended in the form the program reports on. */
function markerWithSubId(subId?: string): string {
  const marker = getMarker();
  return subId ? `${marker}.${subId}` : marker;
}

function withMarker(url: URL, subId?: string): URL {
  url.searchParams.set("marker", markerWithSubId(subId));
  return url;
}

export type PartnerProgram = "flights" | "hotels";

/**
 * Ids the redirector needs, or undefined when the program is not configured.
 *
 * `trs` is account-specific and `p`/`campaign_id` identify the program; all
 * three are readable from any link the Travelpayouts dashboard generates.
 */
function trackingIds(program: PartnerProgram) {
  if (!serverEnv.travelpayoutsClickTracking) return undefined;

  const trs = serverEnv.travelpayoutsTrs;
  if (!trs) return undefined;

  const ids =
    program === "flights"
      ? serverEnv.travelpayoutsFlightsProgram
      : serverEnv.travelpayoutsHotelsProgram;

  return ids ? { trs, ...ids } : undefined;
}

const warnedPrograms = new Set<PartnerProgram>();

/**
 * Wraps a partner URL in the redirector so the click lands in Travelpayouts.
 *
 * When the program is not configured we deliberately return the direct link
 * rather than emitting a half-built redirector URL: the traveller still reaches
 * the partner and the marker still attributes a booking. Only the click
 * statistic is lost, and the warning below says exactly why.
 */
export function withClickTracking(
  partnerUrl: string,
  program: PartnerProgram,
  subId?: string,
): string {
  const ids = trackingIds(program);

  if (!ids) {
    if (serverEnv.travelpayoutsClickTracking && !warnedPrograms.has(program)) {
      warnedPrograms.add(program);
      logger.warn("travelpayouts_click_tracking_disabled", {
        program,
        hint: serverEnv.travelpayoutsTrs
          ? `Set TRAVELPAYOUTS_${program.toUpperCase()}_P and TRAVELPAYOUTS_${program.toUpperCase()}_CAMPAIGN_ID so clicks are recorded.`
          : "Set TRAVELPAYOUTS_TRS so clicks are recorded in the Travelpayouts dashboard.",
      });
    }
    return partnerUrl;
  }

  const url = new URL(TP_REDIRECTOR);
  url.searchParams.set("marker", markerWithSubId(subId));
  url.searchParams.set("trs", ids.trs);
  url.searchParams.set("p", ids.p);
  url.searchParams.set("campaign_id", ids.campaignId);
  // Encoded by URLSearchParams, so the destination's own query survives intact.
  url.searchParams.set("u", partnerUrl);
  return url.toString();
}

/**
 * Carries the currency the traveller is being shown onto the partner page.
 *
 * Without it the partner picks its own default and a fare quoted here in
 * rupees opens in dollars, which reads as a different price for the same seat.
 */
function withCurrency(url: URL, currency?: string): URL {
  if (currency) url.searchParams.set("currency", currency.toLowerCase());
  return url;
}

/**
 * Turns the relative `link` returned by the flight price API into an absolute
 * Aviasales URL carrying our marker.
 */
export function buildFlightDeepLink(
  providerLink: string | undefined,
  subId?: string,
  currency?: string,
): string {
  const base = providerLink?.startsWith("http")
    ? providerLink
    : `${AVIASALES_HOST}${providerLink ?? ""}`;

  const url = new URL(providerLink ? base : AVIASALES_HOST);
  const partnerUrl = withCurrency(withMarker(url, subId), currency).toString();
  return withClickTracking(partnerUrl, "flights", subId);
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
  currency?: string;
  subId?: string;
}): string {
  const segment = (date: string) => `${date.slice(8, 10)}${date.slice(5, 7)}`;
  const path =
    `/search/${input.from}${segment(input.departure)}${input.to}` +
    `${input.return ? segment(input.return) : ""}${Math.min(Math.max(input.passengers, 1), 9)}`;

  const url = new URL(`${AVIASALES_HOST}${path}`);
  const partnerUrl = withCurrency(withMarker(url, input.subId), input.currency).toString();
  return withClickTracking(partnerUrl, "flights", input.subId);
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
  url.searchParams.set("language", "en");

  const partnerUrl = withCurrency(withMarker(url, input.subId), input.currency).toString();
  return withClickTracking(partnerUrl, "hotels", input.subId);
}

/** Airline logo CDN operated by Travelpayouts/Aviasales. */
export function airlineLogoUrl(iataCode: string, size = 80): string {
  return `https://pics.avs.io/${size}/${Math.round(size / 2)}/${iataCode.toUpperCase()}.png`;
}

/** Hotel photo CDN operated by Hotellook. */
export function hotelPhotoUrl(hotelId: string | number, index = 1, width = 840, height = 560) {
  return `https://photo.hotellook.com/image_v2/limit/h${hotelId}_${index}/${width}/${height}.auto`;
}
