"use client";

import { Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export function WishButton({
  slug,
  name,
  tone = "ink",
  className,
}: {
  slug: string;
  name: string;
  tone?: "ink" | "light";
  className?: string;
}) {
  const hydrated = useHydrated();
  const wishlist = useStore((s) => s.wishlist);
  const toggle = useStore((s) => s.toggleWish);
  const saved = hydrated && wishlist.includes(slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved pieces` : `Save ${name}`}
      className={cn(
        "grid h-10 w-10 place-items-center transition-colors duration-500",
        tone === "light" ? "text-alabaster/70 hover:text-alabaster" : "text-smoke hover:text-ink",
        className,
      )}
    >
      <Heart
        size={16}
        strokeWidth={1.4}
        className={cn("transition-all duration-500", saved && "fill-current text-clay")}
      />
    </button>
  );
}
