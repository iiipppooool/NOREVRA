"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Page entrance, played under the route curtain.
 *
 * The curtain does the covering; this only settles the content as it is
 * uncovered, so the two read as one movement rather than two. Deliberately
 * an entrance only — App Router renders the next route before the previous
 * one can animate out, and a half-finished exit looks worse than none.
 */
export function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
