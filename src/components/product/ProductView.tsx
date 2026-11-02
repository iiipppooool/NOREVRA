"use client";

import Link from "next/link";
import { brand } from "@/data/brand";
import { useConfigurator } from "@/hooks/use-configurator";
import { finishFrame } from "@/lib/finish";
import type { Product } from "@/data/types";
import { Gallery } from "./Gallery";
import { ProductPurchase } from "./ProductPurchase";

/**
 * Holds one configurator for the whole product page, so the gallery and the
 * purchase panel cannot disagree: choosing a cloth changes the photograph,
 * not only the swatch.
 */
export function ProductView({ product }: { product: Product }) {
  const cfg = useConfigurator(product);
  const images = [...product.images];
  images[0] = finishFrame(product, cfg.options, images[0]);

  return (
    <div className="grid grid-cols-1 gap-x-[clamp(2rem,5vw,5rem)] gap-y-12 lg:grid-cols-12">
      <div className="-mx-[var(--spacing-gutter)] lg:col-span-7 lg:mx-0">
        <Gallery images={images} name={product.name} finishKey={cfg.finishSummary} />
        {/* The house position, stated once where it is relevant — beside the
            imagery it explains, not buried on an about page. */}
        <p className="gutter mt-6 max-w-[34rem] text-small text-smoke lg:px-0">
          <span className="text-ink">{brand.drawing.title}.</span>{" "}
          Drawn to the production dimensions, in the finishes you have selected.{" "}
          <Link href="/our-story#drawn" className="link-draw text-ink">
            Why we do not photograph
          </Link>
          {" · "}
          <Link
            href={`/contact?topic=Photographs+of+a+piece&piece=${product.slug}#enquiry`}
            className="link-draw text-ink"
          >
            Ask for photographs
          </Link>
        </p>
      </div>
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-[7.5rem]">
          <ProductPurchase product={product} cfg={cfg} />
        </div>
      </div>
    </div>
  );
}
