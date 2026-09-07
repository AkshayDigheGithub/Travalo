import "server-only";

import { SUPPORTED_CURRENCIES, type CurrencyCode } from "@/config/currencies";
import { cacheGet, cacheSet } from "@/lib/cache";
import { logger } from "@/lib/logger";

/**
 * Exchange rates come from a real source (exchangerate.host by default, or any
 * endpoint returning `{ rates: { CODE: number } }`). We never invent a rate:
 * if the source is unavailable, conversion fails and callers keep showing the
 * supplier's own currency instead of a made-up number.
 */

const RATES_TTL_SECONDS = 60 * 60 * 6;
const CACHE_KEY = "fx:rates:v1";
const REQUEST_TIMEOUT_MS = 5_000;

export type RateTable = {
  base: CurrencyCode;
  rates: Partial<Record<CurrencyCode, number>>;
  fetchedAt: number;
};

type RatesApiResponse = { rates?: Record<string, number> };

function ratesEndpoint(base: CurrencyCode): string | null {
  const template = process.env.EXCHANGE_RATES_API_URL;
  if (!template) return null;
  const symbols = SUPPORTED_CURRENCIES.join(",");
  return template
    .replace("{base}", base)
    .replace("{symbols}", symbols)
    .replace("{apiKey}", process.env.EXCHANGE_RATES_API_KEY ?? "");
}

export async function getRateTable(base: CurrencyCode): Promise<RateTable | null> {
  const cacheKey = `${CACHE_KEY}:${base}`;
  const cached = await cacheGet<RateTable>(cacheKey);
  if (cached) return cached;

  const url = ratesEndpoint(base);
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timeout);

    if (!response.ok) {
      logger.warn("exchange_rates_http_error", { status: response.status });
      return null;
    }

    const payload = (await response.json()) as RatesApiResponse;
    if (!payload.rates || typeof payload.rates !== "object") {
      logger.warn("exchange_rates_malformed_response");
      return null;
    }

    const rates: Partial<Record<CurrencyCode, number>> = {};
    for (const code of SUPPORTED_CURRENCIES) {
      const value = payload.rates[code];
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        rates[code] = value;
      }
    }

    const table: RateTable = { base, rates, fetchedAt: Date.now() };
    await cacheSet(cacheKey, table, RATES_TTL_SECONDS);
    return table;
  } catch (error) {
    logger.warn("exchange_rates_unavailable", { error: String(error) });
    return null;
  }
}

/**
 * Converts an amount, returning null when no trustworthy rate is available.
 * Callers must fall back to the original currency rather than guessing.
 */
export async function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): Promise<number | null> {
  if (from === to) return amount;
  const table = await getRateTable(from);
  const rate = table?.rates[to];
  if (!rate) return null;
  return Math.round(amount * rate);
}
