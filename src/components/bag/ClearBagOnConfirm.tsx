"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/**
 * Empties the bag once, and only after the server has verified that the
 * payment completed. Rendered by the confirmation page.
 */
export function ClearBagOnConfirm() {
  const clear = useStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
