"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/hooks/use-hydrated";
import { productBySlug } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { ButtonLink } from "@/components/ui/Button";

export function WishlistView() {
  const hydrated = useHydrated();
  const wishlist = useStore((s) => s.wishlist);
  const clearWishlist = useStore((s) => s.clearWishlist);

  const items = useMemo(
    () => wishlist.map((s) => productBySlug(s)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [wishlist],
  );

  if (!hydrated) {
    return (
      <div className="gutter pb-24">
        <p className="label text-mist">Loading saved pieces…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="gutter pb-[clamp(4rem,10vw,8rem)]">
        <p className="editorial max-w-[30rem] text-smoke">
          You have not saved anything yet. The heart on any piece sets it aside here.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/furniture" variant="solid">
            Open the catalogue
          </ButtonLink>
          <ButtonLink href="/collections" variant="outline">
            Browse collections
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="gutter pb-[var(--spacing-section)]">
      <div className="rule-t rule-b flex items-center justify-between gap-6 py-4">
        <p className="label tabular-nums text-mist" data-numeric>
          {items.length} {items.length === 1 ? "piece" : "pieces"}
        </p>
        <button type="button" onClick={clearWishlist} className="link-draw label text-smoke">
          Clear all
        </button>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-7 lg:grid-cols-4 lg:gap-x-8">
        {items.map((p, i) => (
          <ProductCard
            key={p.slug}
            product={p}
            reveal={(i % 4) * 70}
            sizes="(min-width:1024px) 22vw, (min-width:768px) 30vw, 46vw"
          />
        ))}
      </div>
    </div>
  );
}
