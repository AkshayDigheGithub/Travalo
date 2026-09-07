import "server-only";

import { randomUUID } from "node:crypto";

import { serverEnv } from "@/config/env";
import { query } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { AnalyticsEventName, AnalyticsProperties } from "./events";

export type SearchRecord = {
  id: string;
  kind: "flight" | "hotel";
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  travellers?: number;
  currency?: string;
  resultCount: number;
  isMock: boolean;
};

export type AffiliateClickRecord = {
  kind: "flight" | "hotel";
  provider: string;
  destination?: string;
  searchId?: string;
  resultId?: string;
  subId?: string;
  currency?: string;
  price?: number;
};

/**
 * All analytics writes are best-effort: a failure is logged and swallowed so a
 * missing or slow database never affects a search or a redirect.
 */
export async function recordEvent(
  name: AnalyticsEventName,
  properties: AnalyticsProperties,
  anonymousId?: string,
): Promise<void> {
  if (!serverEnv.analyticsEnabled) return;
  await query(
    `insert into analytics_events (name, anonymous_id, properties) values ($1, $2, $3::jsonb)`,
    [name, anonymousId ?? null, JSON.stringify(properties ?? {})],
  ).catch((error) => {
    logger.warn("analytics_event_failed", { name, error: String(error) });
    return null;
  });
}

export async function recordSearch(record: SearchRecord): Promise<void> {
  if (!serverEnv.analyticsEnabled) return;
  await query(
    `insert into searches (id, kind, origin, destination, depart_date, return_date, travellers, currency, result_count, is_mock)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     on conflict (id) do nothing`,
    [
      record.id,
      record.kind,
      record.origin ?? null,
      record.destination ?? null,
      record.departDate ?? null,
      record.returnDate ?? null,
      record.travellers ?? null,
      record.currency ?? null,
      record.resultCount,
      record.isMock,
    ],
  );
}

export async function recordAffiliateClick(record: AffiliateClickRecord): Promise<string> {
  const id = randomUUID();
  if (!serverEnv.analyticsEnabled) return id;

  await query(
    `insert into affiliate_clicks (id, kind, provider, destination, search_id, result_id, sub_id, currency, price)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      record.kind,
      record.provider,
      record.destination ?? null,
      record.searchId ?? null,
      record.resultId ?? null,
      record.subId ?? null,
      record.currency ?? null,
      record.price ?? null,
    ],
  );

  return id;
}

export function newSearchId(): string {
  return randomUUID();
}
