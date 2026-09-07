import type { CurrencyCode } from "@/config/currencies";

/**
 * Illustrative scale factors used only by the mock provider.
 *
 * These are NOT exchange rates and are never applied to live provider prices —
 * they exist so sample data reads plausibly in each display currency. Real
 * conversion goes through lib/currency/rates.ts against a real rate source.
 */
const MOCK_SCALE: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 1 / 88,
  EUR: 1 / 95,
  GBP: 1 / 111,
  AED: 1 / 24,
  SGD: 1 / 65,
  AUD: 1 / 57,
  CAD: 1 / 63,
  JPY: 1 / 0.58,
};

export function mockAmount(baseInr: number, currency: CurrencyCode): number {
  const scaled = baseInr * MOCK_SCALE[currency];
  if (scaled >= 1000) return Math.round(scaled / 10) * 10;
  if (scaled >= 100) return Math.round(scaled);
  return Math.max(1, Math.round(scaled * 10) / 10);
}
