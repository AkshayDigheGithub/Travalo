"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  isCurrencyCode,
  type CurrencyCode,
} from "@/config/currencies";

export { CURRENCY_COOKIE };

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (next: CurrencyCode) => void;
};

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

/**
 * The cookie is the store; React subscribes to it.
 *
 * Treating it as an external store (rather than copying it into state inside an
 * effect) keeps every page statically renderable — the server renders the
 * default and the client reads the real preference on its first render.
 */
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function readCurrencyCookie(): CurrencyCode {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return value && isCurrencyCode(value) ? (value.toUpperCase() as CurrencyCode) : DEFAULT_CURRENCY;
}

export function CurrencyProvider({
  initialCurrency = DEFAULT_CURRENCY,
  children,
}: {
  initialCurrency?: CurrencyCode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const currency = React.useSyncExternalStore(subscribe, readCurrencyCookie, () => initialCurrency);

  const setCurrency = React.useCallback(
    (next: CurrencyCode) => {
      document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      for (const listener of listeners) listener();

      // Results pages carry the currency in the URL so a shared link reproduces
      // exactly what the sender saw; keep the two in step.
      //
      // The query comes from the live URL rather than `useSearchParams()` on
      // purpose. That hook opts its whole Suspense subtree out of static
      // rendering, and since this provider wraps the entire app, using it here
      // left every page's server-rendered HTML empty — a crawler that does not
      // execute JavaScript saw nothing at all. This callback only ever runs from
      // a click in the browser, where `location` is exact and always available.
      const params = new URLSearchParams(window.location.search);
      if (params.has("currency")) {
        params.set("currency", next);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [pathname, router],
  );

  const value = React.useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = React.useContext(CurrencyContext);
  if (!context) {
    return { currency: DEFAULT_CURRENCY, setCurrency: () => {} };
  }
  return context;
}

/** Reads a currency from an untrusted string, falling back to the default. */
export function coerceCurrency(value: string | undefined | null): CurrencyCode {
  return value && isCurrencyCode(value) ? (value.toUpperCase() as CurrencyCode) : DEFAULT_CURRENCY;
}
