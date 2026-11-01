"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery, useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * A cursor companion, not a cursor replacement.
 *
 * The real pointer is never hidden. A small disc with a word in it trails the
 * pointer only while it is over something that declares an action — a
 * full-bleed plate, the large gallery frame — and disappears otherwise. Any
 * element can opt in with data-cursor="View".
 *
 * Fine pointers only, and nothing at all under prefers-reduced-motion.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  // Read as external state rather than detected in an effect, so there is no
  // render where the component thinks it is enabled and is not.
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;

    let x = -200;
    let y = -200;
    let cx = -200;
    let cy = -200;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      const next = target?.getAttribute("data-cursor") ?? null;
      setLabel((prev) => (prev === next ? prev : next));
    };

    const loop = () => {
      // Trails rather than tracks: a tenth of the distance each frame.
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(loop);
    };

    const onLeave = () => setLabel(null);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dot}
      aria-hidden
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[115] grid place-items-center rounded-full",
        "bg-alabaster/92 text-ink backdrop-blur-sm will-change-transform",
        "transition-[width,height,opacity] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        label ? "h-20 w-20 opacity-100" : "h-0 w-0 opacity-0",
      )}
    >
      <span
        className={cn(
          "label select-none whitespace-nowrap transition-opacity duration-300",
          label ? "opacity-100 delay-150" : "opacity-0",
        )}
      >
        {label}
      </span>
    </div>
  );
}
