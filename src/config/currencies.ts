/**
 * Display currencies. Adding a currency means adding one entry here — the
 * formatter, the URL schema and the currency switcher all read from this list.
 */
export const SUPPORTED_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SGD",
  "AUD",
  "CAD",
  "JPY",
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = (() => {
  const fromEnv = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY?.toUpperCase();
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(fromEnv ?? "")
    ? (fromEnv as CurrencyCode)
    : "INR";
})();

export type CurrencyMeta = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  /** Locale used for Intl.NumberFormat grouping conventions. */
  locale: string;
  /** Most air/hotel fares are shown without minor units; JPY has none at all. */
  fractionDigits: 0 | 2;
};

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  INR: { code: "INR", label: "Indian Rupee", symbol: "₹", locale: "en-IN", fractionDigits: 0 },
  USD: { code: "USD", label: "US Dollar", symbol: "$", locale: "en-US", fractionDigits: 0 },
  EUR: { code: "EUR", label: "Euro", symbol: "€", locale: "en-IE", fractionDigits: 0 },
  GBP: { code: "GBP", label: "British Pound", symbol: "£", locale: "en-GB", fractionDigits: 0 },
  AED: { code: "AED", label: "UAE Dirham", symbol: "AED", locale: "en-AE", fractionDigits: 0 },
  SGD: { code: "SGD", label: "Singapore Dollar", symbol: "S$", locale: "en-SG", fractionDigits: 0 },
  AUD: {
    code: "AUD",
    label: "Australian Dollar",
    symbol: "A$",
    locale: "en-AU",
    fractionDigits: 0,
  },
  CAD: { code: "CAD", label: "Canadian Dollar", symbol: "C$", locale: "en-CA", fractionDigits: 0 },
  JPY: { code: "JPY", label: "Japanese Yen", symbol: "¥", locale: "ja-JP", fractionDigits: 0 },
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value.toUpperCase());
}
