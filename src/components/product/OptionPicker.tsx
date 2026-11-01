"use client";

import Image from "next/image";
import { materialMap, familyLabels, swatchSrc } from "@/data/materials";
import type { OptionGroup } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * Finish selection by swatch. The swatch image is the same rendered surface
 * used on the piece itself, so what is chosen is what is seen.
 */
export function OptionPicker({
  group,
  value,
  onChange,
  size = "md",
}: {
  group: OptionGroup;
  value: string;
  onChange: (materialId: string) => void;
  size?: "sm" | "md";
}) {
  const selected = materialMap[value];
  const dim = size === "sm" ? "h-9 w-9" : "h-12 w-12";

  return (
    <fieldset>
      <legend className="label text-mist">
        {group.label}
        {selected && <span className="text-smoke"> — {selected.name}</span>}
      </legend>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {group.materialIds.map((id) => {
          const m = materialMap[id];
          if (!m) return null;
          const active = id === value;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={active}
              title={`${m.name} — ${familyLabels[m.family]}`}
              className={cn(
                "group relative shrink-0 p-[3px] transition-colors duration-500",
                active ? "ring-1 ring-ink" : "ring-1 ring-hairline hover:ring-smoke",
              )}
            >
              <span className={cn("relative block overflow-hidden", dim)}>
                <Image
                  src={swatchSrc(id)}
                  alt=""
                  fill
                  sizes="48px"
                  quality={70}
                  className="object-cover"
                />
              </span>
              <span className="sr-only">{m.name}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <p className="mt-3.5 max-w-[32rem] text-small text-smoke">
          <span className="text-mist">{familyLabels[selected.family]} · {selected.origin}. </span>
          {selected.note}
        </p>
      )}
    </fieldset>
  );
}

export function VariantPicker({
  variants,
  value,
  onChange,
  priceFor,
}: {
  variants: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  priceFor?: (id: string) => string;
}) {
  return (
    <fieldset>
      <legend className="label text-mist">Size</legend>
      <div className="mt-4 flex flex-col gap-px">
        {variants.map((v) => {
          const active = v.id === value;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onChange(v.id)}
              aria-pressed={active}
              className={cn(
                "flex items-baseline justify-between gap-6 border px-4 py-3.5 text-left transition-colors duration-500",
                active
                  ? "border-ink bg-ink text-alabaster"
                  : "border-hairline text-ink hover:border-smoke",
              )}
            >
              <span className="label-lg">{v.label}</span>
              {priceFor && (
                <span className={cn("label tabular-nums", active ? "text-alabaster/70" : "text-mist")} data-numeric>
                  {priceFor(v.id)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
