"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { observe } from "@/lib/observe";
import { cn } from "@/lib/utils";

type Variant = "rise" | "copy" | "settle" | "rule";

type Props = {
  children?: ReactNode;
  /** Milliseconds. Used to stagger siblings. */
  delay?: number;
  /** "rise" translates up; "curtain" wipes a clip-path — for photography. */
  mode?: "rise" | "curtain";
  /**
   * How it enters. Copy is short and quick, settle adds a little scale for
   * cards and plates, rule draws a hairline from the left.
   */
  variant?: Variant;
  as?: ElementType;
  className?: string;
  /** Reveal once and stay revealed. Always true in practice; here for intent. */
  once?: boolean;
};

export function Reveal({
  children,
  delay = 0,
  mode = "rise",
  variant = "rise",
  as: Tag = "div",
  className,
  once = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const attr = mode === "curtain" ? "data-curtain" : "data-reveal";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Anything already on screen at mount reveals immediately, so a reload
    // part-way down the page never shows an empty section.
    const show = () => el.setAttribute(attr, "in");
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      requestAnimationFrame(show);
      if (once) return;
    }
    return observe(el, (entry) => {
      if (entry.isIntersecting) {
        show();
      } else if (!once) {
        el.setAttribute(attr, "out");
      }
    });
  }, [attr, once]);

  const props = {
    ref,
    className: cn(className),
    style: delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined,
    [attr]: "out",
    ...(mode === "rise" && variant !== "rise" ? { "data-variant": variant } : {}),
  };

  return <Tag {...props}>{children}</Tag>;
}
