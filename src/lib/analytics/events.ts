/**
 * Anonymous product analytics.
 *
 * No account exists in this product, so nothing here identifies a person: the
 * anonymous id is a random per-session value and payloads carry only search
 * intent (route, dates, filters), never free text a user typed about themselves.
 */
export const ANALYTICS_EVENTS = [
  "flight_search",
  "hotel_search",
  "flight_result_view",
  "hotel_result_view",
  "affiliate_click",
  "destination_view",
  "filter_used",
  "sort_used",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  properties?: AnalyticsProperties;
  anonymousId?: string;
};

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}
