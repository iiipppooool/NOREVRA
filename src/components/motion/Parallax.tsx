"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Travel as a fraction of the element's height. 0.12 is already a lot. */
  amount?: number;
  className?: string;
  /** Scale slightly as well, so edges never show. */
  zoom?: boolean;
};

export function Parallax({ children, amount = 0.1, className, zoom = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const pct = `${amount * 100}%`;
  const y = useTransform(scrollYProgress, [0, 1], [`-${pct}`, pct]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.12, 1.08]);

  if (reduced) {
    return (
      <div ref={ref} className={cn("relative overflow-hidden", className)}>
        <div className="absolute inset-0">{children}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="parallax-layer absolute inset-0 will-change-transform"
        style={{ y, scale: zoom ? scale : 1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
