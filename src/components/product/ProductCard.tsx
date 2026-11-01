"use client";

import Link from "next/link";
import { useState } from "react";
import { collectionName } from "@/data/collections";
import { materialMap } from "@/data/materials";
import { priceRange } from "@/data/products";
import type { Product } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { Media } from "@/components/ui/Media";
import { WishButton } from "./WishButton";
import { QuickView } from "./QuickView";

/**
 * The catalogue card. Two frames — the setting shot and the detail — crossfaded
 * on hover, so the hover state shows the material rather than just zooming.
 */
export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width:1280px) 24vw, (min-width:768px) 33vw, 50vw",
  reveal = 0,
  showCollection = true,
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
  reveal?: number;
  showCollection?: boolean;
}) {
  const [quick, setQuick] = useState(false);
  const { min, max } = priceRange(product);
  const [setting, detail] = product.images;
  const leadMaterial = materialMap[product.options[0]?.materialIds[0] ?? ""];

  return (
    <>
      <article className="group relative flex flex-col">
        <Link href={`/furniture/${product.slug}`} className="block" aria-label={`${product.name} — view piece`}>
          <div className="relative overflow-hidden bg-limestone">
            <Media
              src={setting.src}
              alt={setting.alt}
              width={setting.width}
              height={setting.height}
              aspect="aspect-[4/5]"
              sizes={sizes}
              priority={priority}
              delay={reveal}
              quality={74}
            />
            {/* The second frame. Present but inert until hover. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
            >
              <Media
                src={detail.src}
                alt=""
                width={detail.width}
                height={detail.height}
                aspect="aspect-[4/5]"
                sizes={sizes}
                curtain={false}
                quality={66}
              />
            </div>

            {product.isNew && (
              <span className="absolute left-4 top-4 bg-alabaster/92 px-2.5 py-1.5 label text-ink backdrop-blur">
                New
              </span>
            )}
          </div>
        </Link>

        {/* Actions sit outside the link so they are independently reachable. */}
        <div className="pointer-events-none absolute right-2 top-2 flex flex-col items-end gap-1 opacity-0 transition-opacity duration-500 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
          <WishButton slug={product.slug} name={product.name} className="bg-alabaster/90 backdrop-blur" />
          <button
            type="button"
            onClick={() => setQuick(true)}
            className="label bg-alabaster/90 px-3 py-2.5 text-ink backdrop-blur transition-colors duration-300 hover:bg-alabaster"
          >
            Quick view
          </button>
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="label min-w-0 flex-1 text-mist">
              {product.typology}
              {showCollection && <span> · {collectionName(product.collection)}</span>}
            </p>
            <p className="label-lg shrink-0 tabular-nums text-ink" data-numeric>
              {min === max ? formatPrice(min) : `From ${formatPrice(min)}`}
            </p>
          </div>

          <h3 className="mt-2">
            <Link
              href={`/furniture/${product.slug}`}
              className="font-display text-heading text-ink transition-colors duration-500 group-hover:text-graphite"
            >
              {product.name}
            </Link>
          </h3>

          {leadMaterial && (
            <p className="mt-2 text-small text-smoke">
              {leadMaterial.name}
              {product.options.length > 1 && (
                <span className="text-mist">
                  {" "}
                  · {product.options.flatMap((g) => g.materialIds).length} finishes
                </span>
              )}
            </p>
          )}

          <div className="mt-4 flex items-center gap-5">
            <Link href={`/furniture/${product.slug}`} className="link-draw label text-ink">
              View piece
            </Link>
            <span aria-hidden className="h-3 w-px bg-hairline" />
            <span className="label text-mist">{product.leadTime}</span>
          </div>
        </div>
      </article>

      <QuickView product={product} open={quick} onClose={() => setQuick(false)} />
    </>
  );
}
