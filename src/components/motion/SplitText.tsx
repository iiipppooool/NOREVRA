"use client";

import { useEffect, useRef, type ElementType } from "react";
import { observe } from "@/lib/observe";
import { cn } from "@/lib/utils";

type Props = {
  children: string;
  as?: ElementType;
  className?: string;
  /** Per-word delay, ms. */
  step?: number;
  delay?: number;
};

/**
 * Word-by-word entrance. The text stays a single accessible string — words are
 * wrapped in spans with an explicit space between them, so screen readers and
 * text selection are unaffected.
 */
export function SplitText({ children, as: Tag = "span", className, step = 55, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.setAttribute("data-stagger", "in");
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
      requestAnimationFrame(show);
      return;
    }
    return observe(el, (e) => e.isIntersecting && show());
  }, []);

  const words = children.split(" ");

  return (
    <Tag ref={ref} data-stagger="out" className={cn(className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} style={{ transitionDelay: `${delay + i * step}ms` }}>
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
