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

/** Where the visitor's currency preference is stored, once they have one. */
export const CURRENCY_COOKIE = "bookmyflight.currency";

/**
 * The currency a country spends in, for the currencies we support. A visitor
 * from Singapore should not have to switch from rupees before searching, and
 * the currency they see is the one the partner site is asked to show.
 *
 * Euro-area countries are listed individually rather than inferred: membership
 * is a fact about each country, not something to guess from the region.
 */
const CURRENCY_BY_COUNTRY: Record<string, CurrencyCode> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  AE: "AED",
  SG: "SGD",
  AU: "AUD",
  CA: "CAD",
  JP: "JPY",
  AT: "EUR",
  BE: "EUR",
  CY: "EUR",
  DE: "EUR",
  EE: "EUR",
  ES: "EUR",
  FI: "EUR",
  FR: "EUR",
  GR: "EUR",
  HR: "EUR",
  IE: "EUR",
  IT: "EUR",
  LT: "EUR",
  LU: "EUR",
  LV: "EUR",
  MT: "EUR",
  NL: "EUR",
  PT: "EUR",
  SI: "EUR",
  SK: "EUR",
};

/**
 * Currency for an ISO 3166-1 alpha-2 country code. Countries we have no
 * currency for fall back to the default rather than to a wrong one.
 */
export function currencyForCountry(country: string | null | undefined): CurrencyCode {
  if (!country) return DEFAULT_CURRENCY;
  return CURRENCY_BY_COUNTRY[country.toUpperCase()] ?? DEFAULT_CURRENCY;
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value.toUpperCase());
}
