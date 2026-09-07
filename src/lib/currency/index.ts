import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/currencies";

export { CURRENCIES, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "@/config/currencies";
export type { CurrencyCode } from "@/config/currencies";

export type Money = {
  amount: number;
  currency: CurrencyCode;
  /**
   * "provider" means the amount is exactly what the supplier quoted.
   * "converted" means we converted it and it must be labelled as an estimate.
   */
  source: "provider" | "converted";
};

export function formatMoney(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
  options: { maximumFractionDigits?: number } = {},
): string {
  const meta = CURRENCIES[currency] ?? CURRENCIES[DEFAULT_CURRENCY];
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: meta.code,
    maximumFractionDigits: options.maximumFractionDigits ?? meta.fractionDigits,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a price and marks it as an estimate when we converted it ourselves,
 * so a converted number is never presented as the supplier's own price.
 */
export function formatPrice(money: Money): string {
  const formatted = formatMoney(money.amount, money.currency);
  return money.source === "converted" ? `Estimated ${formatted}` : formatted;
}
