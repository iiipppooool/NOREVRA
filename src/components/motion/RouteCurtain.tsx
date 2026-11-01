"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * Route transition.
 *
 * App Router renders the next page before the old one can animate out, so a
 * true cross-fade is not available. Instead the new page arrives already
 * covered and an ivory panel lifts off it — a cut on film rather than a fade,
 * and never a half-finished exit.
 *
 * The panel is keyed to a counter that advances when the path changes, so a
 * navigation remounts it and the CSS animation plays once. Nothing renders on
 * first paint, where there is nothing to transition from.
 */
export function RouteCurtain() {
  const pathname = usePathname();
  const [seen, setSeen] = useState(pathname);
  const [pass, setPass] = useState(0);

  if (seen !== pathname) {
    setSeen(pathname);
    setPass((n) => n + 1);
  }

  if (pass === 0) return null;

  return (
    <div
      key={pass}
      aria-hidden
      className="route-curtain pointer-events-none fixed inset-0 z-[118] bg-ivory"
      style={{ animation: "curtain-lift 760ms cubic-bezier(0.76, 0, 0.24, 1) forwards" }}
    />
  );
}
