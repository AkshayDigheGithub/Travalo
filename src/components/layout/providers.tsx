"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CurrencyProvider } from "@/hooks/use-currency";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Fares are time-sensitive but re-fetching on every focus would burn
            // provider quota; a short stale window is the right trade-off.
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <React.Suspense fallback={null}>
        <CurrencyProvider>{children}</CurrencyProvider>
      </React.Suspense>
    </QueryClientProvider>
  );
}
