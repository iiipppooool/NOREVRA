"use client";

import { useEffect, useState } from "react";

/**
 * True once the client has mounted. Cart counts and wishlist state come from
 * localStorage, so they must not be rendered during SSR.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
