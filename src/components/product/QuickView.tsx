"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/ui/Overlay";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { Quantity } from "@/components/ui/Quantity";
import { OptionPicker, VariantPicker } from "./OptionPicker";
import { WishButton } from "./WishButton";
import { useConfigurator } from "@/hooks/use-configurator";
import { finishFrame } from "@/lib/finish";
import { collectionName } from "@/data/collections";
import { designerById } from "@/data/brand";
import { variantPrice } from "@/data/products";
import { formatPrice, dimensionLine } from "@/lib/format";
import type { Product } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * Configure and add without leaving the catalogue. Everything that affects
 * price or specification is here; everything editorial stays on the product
 * page, which is where the link at the foot leads.
 */
export function QuickView({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const cfg = useConfigurator(product);
  const [frame, setFrame] = useState(0);
  const all = [...product.images];
  all[0] = finishFrame(product, cfg.options, all[0]);
  const gallery = all.filter((i) => i.kind !== "elevation");
  const image = gallery[frame] ?? gallery[0];

  return (
    <Modal open={open} onClose={onClose} title={`${product.name} — quick view`}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Frames */}
        <div className="bg-limestone">
          <Media
            key={image.src}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            aspect="aspect-[4/5]"
            sizes="(min-width:768px) 33vw, 100vw"
            curtain={false}
            quality={74}
          />
          <div className="flex gap-px p-px">
            {gallery.map((g, i) => (
              <button
                key={g.src}
                type="button"
                onClick={() => setFrame(i)}
                aria-label={`Show frame ${i + 1}`}
                aria-current={i === frame}
                className={cn(
                  "relative flex-1 overflow-hidden transition-opacity duration-500",
                  i === frame ? "opacity-100" : "opacity-45 hover:opacity-80",
                )}
              >
                <Media
                  src={g.src}
                  alt=""
                  width={g.width}
                  height={g.height}
                  aspect="aspect-square"
                  sizes="120px"
                  curtain={false}
                  grain={false}
                  quality={50}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="flex flex-col p-7 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label text-mist">
                {product.typology} · {collectionName(product.collection)}
              </p>
              <h2 className="mt-2.5 font-display text-title leading-none text-ink">
                {product.name}
              </h2>
            </div>
            <WishButton slug={product.slug} name={product.name} className="-mr-2 -mt-1 shrink-0" />
          </div>

          <p className="editorial mt-5 text-smoke">{product.summary}</p>

          <p className="mt-7 label-lg tabular-nums text-ink" data-numeric>
            {formatPrice(cfg.unitPrice)}
          </p>
          <p className="label mt-1.5 text-mist">{dimensionLine(cfg.variant)}</p>

          <div className="mt-8 space-y-8">
            {product.variants.length > 1 && (
              <VariantPicker
                variants={product.variants}
                value={cfg.variantId}
                onChange={cfg.setVariantId}
                priceFor={(id) => formatPrice(variantPrice(product, id))}
              />
            )}

            {product.options.map((g) => (
              <OptionPicker
                key={g.id}
                group={g}
                value={cfg.options[g.id]}
                onChange={(m) => cfg.setOption(g.id, m)}
                size="sm"
              />
            ))}
          </div>

          <div className="mt-9 flex items-center gap-3">
            <Quantity value={cfg.qty} onChange={cfg.setQty} />
            <Button
              onClick={() => {
                cfg.addToBag();
                onClose();
              }}
              className="flex-1"
            >
              Add to bag — {formatPrice(cfg.lineTotal)}
            </Button>
          </div>

          <dl className="mt-8 space-y-2.5 rule-t pt-6">
            <div className="flex justify-between gap-6">
              <dt className="label text-mist">Dispatch</dt>
              <dd className="label text-smoke">{product.leadTime}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="label text-mist">Designer</dt>
              <dd className="label text-smoke">{designerById(product.designer)?.name}</dd>
            </div>
          </dl>

          <Link
            href={`/furniture/${product.slug}`}
            onClick={onClose}
            className="link-draw label mt-7 self-start text-ink"
          >
            Full specification and drawings
          </Link>
        </div>
      </div>
    </Modal>
  );
}
