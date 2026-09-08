import "server-only";

import { airlineName } from "@/config/airlines";
import { cacheGet, cacheSet } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { TP_HOSTS, tpFetch } from "./client";
import { airlineLogoUrl } from "./links";
import type { TpAirlineRecord } from "./types";
import type { Airline } from "@/types/flight";

/**
 * Airline directory.
 *
 * Travelpayouts publishes a public reference file of airlines; we cache it for
 * a day and fall back to the bundled seed so a directory outage only costs us
 * a nicer display name, never a search.
 */

const CACHE_KEY = "tp:airlines:v1";
const CACHE_TTL_SECONDS = 60 * 60 * 24;
/**
 * A directory outage is remembered too, briefly: without this every search pays
 * for the same failing request before falling back to the bundled seed.
 */
const FAILURE_TTL_SECONDS = 60 * 15;

let inflight: Promise<Record<string, string>> | null = null;

async function loadDirectory(): Promise<Record<string, string>> {
  const cached = await cacheGet<Record<string, string>>(CACHE_KEY);
  if (cached) return cached;

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const records = await tpFetch<TpAirlineRecord[]>(TP_HOSTS.api, "/data/en-airlines.json", {
        revalidate: CACHE_TTL_SECONDS,
        timeoutMs: 6_000,
      });

      const directory: Record<string, string> = {};
      for (const record of records ?? []) {
        const code = record.code?.toUpperCase();
        const name = record.name ?? record.name_translations?.en;
        if (code && name) directory[code] = name;
      }

      await cacheSet(CACHE_KEY, directory, CACHE_TTL_SECONDS);
      return directory;
    } catch (error) {
      logger.warn("airline_directory_unavailable", { error: String(error) });
      await cacheSet(CACHE_KEY, {}, FAILURE_TTL_SECONDS);
      return {};
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function resolveAirlines(codes: string[]): Promise<Map<string, Airline>> {
  const directory = codes.length > 0 ? await loadDirectory() : {};

  return new Map(
    codes.map((rawCode) => {
      const code = rawCode.toUpperCase();
      return [
        code,
        {
          code,
          name: directory[code] ?? airlineName(code),
          logoUrl: airlineLogoUrl(code),
        },
      ];
    }),
  );
}
