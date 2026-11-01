"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_LINE_QTY } from "@/lib/store";

export function Quantity({
  value,
  onChange,
  min = 1,
  max = MAX_LINE_QTY,
  label = "Quantity",
  compact = false,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  const step = (d: number) => onChange(Math.min(max, Math.max(min, value + d)));
  const btn = cn(
    "grid place-items-center text-ink transition-opacity duration-300",
    "hover:opacity-100 disabled:opacity-25 disabled:cursor-not-allowed opacity-60",
    compact ? "h-8 w-8" : "h-12 w-12",
  );

  return (
    <div
      className={cn(
        "inline-flex items-center border border-hairline",
        compact ? "h-8" : "h-12",
        className,
      )}
      role="group"
      aria-label={label}
    >
      <button type="button" className={btn} onClick={() => step(-1)} disabled={value <= min} aria-label={`Decrease ${label.toLowerCase()}`}>
        <Minus size={compact ? 11 : 13} strokeWidth={1.4} />
      </button>
      <span
        className={cn("label-lg min-w-7 text-center tabular-nums", compact && "text-micro")}
        data-numeric
        aria-live="polite"
      >
        {value}
      </span>
      <button type="button" className={btn} onClick={() => step(1)} disabled={value >= max} aria-label={`Increase ${label.toLowerCase()}`}>
        <Plus size={compact ? 11 : 13} strokeWidth={1.4} />
      </button>
    </div>
  );
}
