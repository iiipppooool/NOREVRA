"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media queries as an external store. matchMedia *is* an external system, so
 * this is what useSyncExternalStore is for — and it means the first client
 * render already has the right answer rather than correcting itself.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  // On the server we assume the query does not match: for reduced motion that
  // means markup is authored as if animation is on, and the CSS media query
  // suppresses it regardless.
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
