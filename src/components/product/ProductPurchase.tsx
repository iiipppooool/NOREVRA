"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Quantity } from "@/components/ui/Quantity";
import { Accordion } from "@/components/ui/Accordion";
import { OptionPicker, VariantPicker } from "./OptionPicker";
import { WishButton } from "./WishButton";
import type { useConfigurator } from "@/hooks/use-configurator";
import { useStore } from "@/lib/store";
import { variantPrice } from "@/data/products";
import { materialMap, familyLabels, swatchSrc } from "@/data/materials";
import { brand, designerById } from "@/data/brand";
import { collectionName } from "@/data/collections";
import { formatPrice, dimensionRows, dimensionLine } from "@/lib/format";
import { availabilityLabel, availabilityNote, depositOf, isReserved } from "@/lib/preorder";
import type { Product } from "@/data/types";

/**
 * Everything on the product page that changes what is bought. Deliberately a
 * single client island: the editorial half of the page stays a server
 * component and ships no JavaScript.
 */
export function ProductPurchase({
  product,
  cfg,
}: {
  product: Product;
  cfg: ReturnType<typeof useConfigurator>;
}) {
  const openBag = useStore((s) => s.openBag);
  const reserved = isReserved(product);
  const designer = designerById(product.designer);

  const specs = [
    {
      id: "description",
      title: "Description",
      content: (
        <div className="space-y-4">
          {product.description.map((p, i) => (
            <p key={i} className="text-body text-smoke">
              {p}
            </p>
          ))}
          {designer && (
            <p className="label pt-2 text-mist">
              Designed by {designer.name}, {product.year}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "dimensions",
      title: "Dimensions",
      content: (
        <div>
          <dl className="divide-y divide-hairline">
            {dimensionRows(cfg.variant).map((r) => (
              <div key={r.label} className="flex justify-between gap-6 py-2.5">
                <dt className="label text-mist">{r.label}</dt>
                <dd className="label tabular-nums text-ink" data-numeric>
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
          {product.dimensionNote && (
            <p className="mt-5 text-small text-smoke">{product.dimensionNote}</p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <figure>
              <Image
                src={`/media/elevation/${product.slug}.svg`}
                alt={`Front elevation of the ${product.name}, dimensioned in millimetres.`}
                width={1200}
                height={1200}
                className="w-full border border-hairline bg-ivory"
              />
              <figcaption className="label mt-2 text-mist">Elevation</figcaption>
            </figure>
            <figure>
              <Image
                src={`/media/plan/${product.slug}.svg`}
                alt={`Plan view of the ${product.name}, dimensioned in millimetres.`}
                width={1200}
                height={1200}
                className="w-full border border-hairline bg-ivory"
              />
              <figcaption className="label mt-2 text-mist">Plan</figcaption>
            </figure>
          </div>
          <p className="label mt-4 text-mist">
            Drawings are to the published dimensions of the selected size.
          </p>
        </div>
      ),
    },
    {
      id: "materials",
      title: "Materials and finishes",
      content: (
        <div className="space-y-7">
          {product.options.map((g) => (
            <div key={g.id}>
              <p className="label text-mist">{g.label}</p>
              <ul className="mt-3 space-y-3">
                {g.materialIds.map((id) => {
                  const m = materialMap[id];
                  if (!m) return null;
                  return (
                    <li key={id} className="flex gap-4">
                      <span className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden ring-1 ring-hairline">
                        <Image src={swatchSrc(id)} alt="" fill sizes="40px" quality={60} className="object-cover" />
                      </span>
                      <span>
                        <span className="label-lg block text-ink">{m.name}</span>
                        <span className="label block text-mist">
                          {familyLabels[m.family]} · {m.origin}
                        </span>
                        <span className="mt-1 block text-small text-smoke">{m.note}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "construction",
      title: "Construction",
      content: (
        <dl className="divide-y divide-hairline">
          {product.construction.map((c) => (
            <div key={c.label} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-8">
              <dt className="label shrink-0 text-mist sm:w-36">{c.label}</dt>
              <dd className="text-small text-ink sm:text-right">{c.value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    ...(reserved
      ? [
          {
            id: "preorder",
            title: "What reserving means",
            content: (
              <div className="space-y-4">
                <p className="text-body text-smoke">{brand.commerce.preOrder.summary}</p>
                <p className="text-small text-smoke">{brand.commerce.preOrder.protection}</p>
                <dl className="divide-y divide-hairline pt-1">
                  <div className="flex justify-between gap-6 py-2.5">
                    <dt className="label text-mist">Deposit now</dt>
                    <dd className="label tabular-nums text-ink" data-numeric>
                      {formatPrice(depositOf(cfg.unitPrice))}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-6 py-2.5">
                    <dt className="label text-mist">Balance before despatch</dt>
                    <dd className="label tabular-nums text-ink" data-numeric>
                      {formatPrice(cfg.unitPrice - depositOf(cfg.unitPrice))}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-6 py-2.5">
                    <dt className="label text-mist">Dispatch from</dt>
                    <dd className="label text-ink">{brand.commerce.preOrder.dispatchFrom}</dd>
                  </div>
                </dl>
              </div>
            ),
          },
        ]
      : []),
    {
      id: "delivery",
      title: "Delivery and installation",
      content: (
        <div className="space-y-5">
          <p className="text-body text-smoke">{brand.commerce.deliverySummary}</p>
          <dl className="divide-y divide-hairline">
            {brand.commerce.deliveryTiers.map((t) => (
              <div key={t.region} className="flex justify-between gap-6 py-2.5">
                <dt className="label text-mist">{t.region}</dt>
                <dd className="label text-ink">
                  {t.lead} · {t.cost}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-small text-smoke">{brand.commerce.returns}</p>
        </div>
      ),
    },
    {
      id: "care",
      title: "Care and guarantee",
      content: (
        <div className="space-y-4">
          <p className="text-body text-smoke">{product.care}</p>
          <p className="text-small text-smoke">{brand.commerce.warranty}</p>
          <p className="label pt-1 text-mist">
            Questions about a specification?{" "}
            <a href={`mailto:${brand.email.care}`} className="link-draw text-ink">
              {brand.email.care}
            </a>
          </p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <p className="label text-mist">
        {product.typology} ·{" "}
        <Link href={`/collections/${product.collection}`} className="link-draw text-smoke">
          {collectionName(product.collection)}
        </Link>
      </p>

      <div className="mt-3 flex items-start justify-between gap-5">
        <h1 className="font-display text-title leading-none text-ink">{product.name}</h1>
        <WishButton slug={product.slug} name={product.name} className="-mr-2 shrink-0" />
      </div>

      <p className="editorial mt-6 max-w-[34rem] text-smoke">{product.summary}</p>

      <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <p className="label-lg tabular-nums text-ink" data-numeric>
          {formatPrice(cfg.unitPrice)}
        </p>
        <p className="label text-mist">{brand.commerce.taxLabel} included</p>
      </div>
      {/* The dimensions of what is currently selected. A piece offered in one
          size has no size picker, and was left with nowhere to state them. */}
      <p className="label mt-2.5 tabular-nums text-smoke" data-numeric>
        {product.variants.length === 1 && `${product.variants[0].label} — `}
        {dimensionLine(cfg.variant)}
      </p>

      <div className="mt-9 space-y-9">
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
          />
        ))}
      </div>

      {/* Availability, stated before the button rather than after it. A piece
          that has not been made yet is reserved, not bought, and the page
          should say which it is before anyone commits. */}
      <div className="mt-9 rule-t pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="label-lg text-ink">{availabilityLabel[product.availability]}</p>
          {reserved && (
            <p className="label tabular-nums text-smoke" data-numeric>
              Dispatch from {brand.commerce.preOrder.dispatchFrom}
            </p>
          )}
        </div>
        <p className="mt-3 max-w-[32rem] text-small text-smoke">
          {availabilityNote[product.availability]}
        </p>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Quantity value={cfg.qty} onChange={cfg.setQty} />
          <Button onClick={cfg.addToBag} size="lg" className="min-w-[14rem] flex-1">
            {reserved
              ? `Reserve — ${formatPrice(depositOf(cfg.lineTotal))} deposit`
              : `Add to bag — ${formatPrice(cfg.lineTotal)}`}
          </Button>
        </div>
        {reserved ? (
          <p className="label mt-4 text-mist">
            {formatPrice(depositOf(cfg.lineTotal))} now, {formatPrice(cfg.lineTotal - depositOf(cfg.lineTotal))}{" "}
            before despatch. Built in {product.leadTime} once the run begins. {cfg.finishSummary}.
          </p>
        ) : (
          <p className="label mt-4 text-mist">
            Made to order in {product.leadTime}. {cfg.finishSummary}.
          </p>
        )}
        <button
          type="button"
          onClick={openBag}
          data-touch-target
          className="link-draw label mt-4 text-smoke"
        >
          Review bag
        </button>
      </div>

      <section aria-labelledby="spec-heading" className="mt-12">
        <h2 id="spec-heading" className="sr-only">
          Specification
        </h2>
        <Accordion items={specs} defaultOpen="description" />
      </section>
    </div>
  );
}
