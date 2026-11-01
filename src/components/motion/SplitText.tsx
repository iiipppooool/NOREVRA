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
 * A headline that rises out of itself, word by word.
 *
 * Each word sits in its own clipped box and starts fully below it, so the
 * letters appear to be uncovered rather than faded in. The text remains one
 * accessible string — real spaces between words, no aria gymnastics — so
 * selection, search and screen readers are unaffected.
 */
export function SplitText({ children, as: Tag = "span", className, step = 42, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observe(el, () => el.setAttribute("data-stagger", "in"));
  }, []);

  const words = children.split(" ");

  return (
    <Tag ref={ref} data-stagger="out" className={cn(className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="w"
          style={{ "--word-delay": `${delay + i * step}ms` } as React.CSSProperties}
        >
          <span>{word}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
