"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Drawer } from "@/components/ui/Overlay";
import { Media } from "@/components/ui/Media";
import { Quantity } from "@/components/ui/Quantity";
import { ButtonLink } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/hooks/use-hydrated";
import { resolveLines, bagTotals, bagLeadTime } from "@/lib/bag";
import { formatPrice } from "@/lib/format";
import { brand } from "@/data/brand";

export function BagDrawer() {
  const open = useStore((s) => s.bagOpen);
  const close = useStore((s) => s.closeBag);
  const lines = useStore((s) => s.lines);
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.remove);
  const hydrated = useHydrated();

  const resolved = useMemo(() => resolveLines(lines), [lines]);
  const totals = bagTotals(resolved);
  const lead = bagLeadTime(resolved);

  return (
    <Drawer open={open && hydrated} onClose={close} title={`Shopping bag (${totals.items})`}>
      {resolved.length === 0 ? (
        <div className="flex h-full flex-col justify-center py-16">
          <p className="editorial text-smoke">Your bag is empty.</p>
          <p className="mt-4 text-small text-mist">
            Pieces you save or add will be held here. Nothing is ordered until you confirm at
            checkout.
          </p>
          <div className="mt-9">
            <ButtonLink href="/furniture" variant="outline" onClick={close}>
              View the catalogue
            </ButtonLink>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-hairline">
          {resolved.map(({ line, product, variant, unitPrice, total, finishes }) => (
            <li key={line.id} className="flex gap-5 py-7">
              <Link href={`/furniture/${product.slug}`} onClick={close} className="group shrink-0">
                <Media
                  src={product.images[0].src}
                  alt={product.images[0].alt}
                  width={product.images[0].width}
                  height={product.images[0].height}
                  aspect="aspect-[4/5]"
                  className="w-[5.5rem]"
                  sizes="88px"
                  curtain={false}
                  hoverZoom
                  quality={55}
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <Link
                    href={`/furniture/${product.slug}`}
                    onClick={close}
                    className="font-display text-[1.25rem] leading-tight text-ink"
                  >
                    {product.name}
                  </Link>
                  <span className="label-lg shrink-0 tabular-nums text-ink" data-numeric>
                    {formatPrice(total)}
                  </span>
                </div>

                <p className="label mt-2 text-mist">{variant.label}</p>
                {finishes && <p className="mt-1.5 text-small text-smoke">{finishes}</p>}
                <p className="label mt-2 text-mist">Ships in {product.leadTime}</p>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <Quantity
                    value={line.qty}
                    onChange={(n) => setQty(line.id, n)}
                    compact
                    label={`Quantity of ${product.name}`}
                  />
                  <div className="flex items-center gap-4">
                    {line.qty > 1 && (
                      <span className="label text-mist" data-numeric>
                        {formatPrice(unitPrice)} each
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      className="link-draw label text-smoke"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {resolved.length > 0 && (
        <BagFooter
          subtotal={totals.subtotal}
          tax={totals.tax}
          deliveryIncluded={totals.deliveryIncluded}
          lead={lead}
          onNavigate={close}
        />
      )}
    </Drawer>
  );
}

function BagFooter({
  subtotal,
  tax,
  deliveryIncluded,
  lead,
  onNavigate,
}: {
  subtotal: number;
  tax: number;
  deliveryIncluded: boolean;
  lead: string | null;
  onNavigate: () => void;
}) {
  return (
    <div className="-mx-7 -mb-6 mt-auto border-t border-hairline bg-ivory px-7 py-6">
      <dl className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <dt className="label text-smoke">Subtotal</dt>
          <dd className="label-lg tabular-nums text-ink" data-numeric>
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="label text-mist">
            Includes {brand.commerce.taxLabel} ({Math.round(brand.commerce.taxRate * 100)}%)
          </dt>
          <dd className="label tabular-nums text-mist" data-numeric>
            {formatPrice(tax)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="label text-mist">Delivery</dt>
          <dd className="label text-mist">
            {deliveryIncluded ? "Included in Italy" : "Quoted on order"}
          </dd>
        </div>
        {lead && (
          <div className="flex items-baseline justify-between">
            <dt className="label text-mist">Estimated dispatch</dt>
            <dd className="label text-mist">{lead}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 space-y-2.5">
        <ButtonLink href="/bag" variant="solid" full onClick={onNavigate}>
          Review and check out
        </ButtonLink>
        <ButtonLink href="/furniture" variant="ghost" full onClick={onNavigate} className="h-10">
          Continue looking
        </ButtonLink>
      </div>
    </div>
  );
}
