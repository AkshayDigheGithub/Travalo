"use client";

import * as React from "react";

/**
 * SSR-safe media query hook.
 *
 * Implemented with useSyncExternalStore rather than an effect: matchMedia is an
 * external store, so React can read it during render on the client and fall
 * back to `false` on the server without an extra render pass.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
