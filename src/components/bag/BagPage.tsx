"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Media } from "@/components/ui/Media";
import { Quantity } from "@/components/ui/Quantity";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/hooks/use-hydrated";
import { resolveLines, bagTotals, bagLeadTime } from "@/lib/bag";
import { formatPrice, dimensionLine } from "@/lib/format";
import { brand } from "@/data/brand";

type CheckoutState =
  | { kind: "idle" }
  | { kind: "opening" }
  | { kind: "unconfigured"; requires: string[]; total: number }
  | { kind: "error"; message: string };

export function BagPage() {
  const hydrated = useHydrated();
  const lines = useStore((s) => s.lines);
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.remove);
  const clear = useStore((s) => s.clear);
  const params = useSearchParams();
  const [state, setState] = useState<CheckoutState>({ kind: "idle" });

  const resolved = useMemo(() => resolveLines(lines), [lines]);
  const totals = bagTotals(resolved);
  const lead = bagLeadTime(resolved);
  const cancelled = params.get("checkout") === "cancelled";

  async function checkout() {
    setState({ kind: "opening" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: resolved.map((r) => ({
            slug: r.product.slug,
            variantId: r.variant.id,
            options: r.line.options,
            qty: r.line.qty,
          })),
        }),
      });
      const body = await res.json();

      if (res.ok && body.ok && body.url) {
        window.location.href = body.url as string;
        return;
      }
      if (res.status === 501 && body.reason === "not_configured") {
        setState({
          kind: "unconfigured",
          requires: body.requires ?? [],
          total: body.quote?.total ?? totals.total,
        });
        return;
      }
      setState({ kind: "error", message: body.error ?? "Checkout could not be opened." });
    } catch {
      setState({ kind: "error", message: "We could not reach the server. Please try again." });
    }
  }

  if (!hydrated) {
    return (
      <div className="gutter py-20">
        <p className="label text-mist">Loading your bag…</p>
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="gutter py-[clamp(4rem,10vw,8rem)]">
        <p className="editorial max-w-[30rem] text-smoke">
          Your bag is empty. Nothing is reserved until you order, and nothing is made until we have
          confirmed your finishes.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/furniture" variant="solid">
            Open the catalogue
          </ButtonLink>
          <ButtonLink href="/wishlist" variant="outline">
            Saved pieces
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="gutter pb-[var(--spacing-section)]">
      {cancelled && state.kind === "idle" && (
        <p role="status" className="rule-t rule-b mb-10 py-4 label text-smoke">
          Checkout was cancelled. Your bag is unchanged.
        </p>
      )}

      <div className="grid grid-cols-1 gap-x-[clamp(2rem,5vw,5rem)] gap-y-14 lg:grid-cols-12">
        {/* Lines */}
        <div className="lg:col-span-7">
          <ul className="rule-t">
            {resolved.map(({ line, product, variant, unitPrice, total, finishes }) => (
              <li key={line.id} className="rule-b py-7">
                <div className="flex gap-5 sm:gap-7">
                  <Link href={`/furniture/${product.slug}`} className="group shrink-0">
                    <Media
                      src={product.images[0].src}
                      alt={product.images[0].alt}
                      width={product.images[0].width}
                      height={product.images[0].height}
                      aspect="aspect-[4/5]"
                      className="w-24 sm:w-32"
                      sizes="128px"
                      curtain={false}
                      hoverZoom
                      quality={60}
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <p className="label text-mist">{product.typology}</p>
                      <p className="label-lg shrink-0 tabular-nums text-ink" data-numeric>
                        {formatPrice(total)}
                      </p>
                    </div>

                    <h2 className="mt-1.5">
                      <Link
                        href={`/furniture/${product.slug}`}
                        className="font-display text-heading text-ink"
                      >
                        {product.name}
                      </Link>
                    </h2>

                    <dl className="mt-3 space-y-1">
                      <div className="flex gap-2">
                        <dt className="label text-mist">Size</dt>
                        <dd className="label text-smoke">{variant.label}</dd>
                      </div>
                      {finishes && (
                        <div className="flex gap-2">
                          <dt className="label text-mist">Finish</dt>
                          <dd className="label text-smoke">{finishes}</dd>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <dt className="label text-mist">Dimensions</dt>
                        <dd className="label tabular-nums text-smoke" data-numeric>
                          {dimensionLine(variant)}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="label text-mist">Dispatch</dt>
                        <dd className="label text-smoke">{product.leadTime}</dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                      <Quantity
                        value={line.qty}
                        onChange={(n) => setQty(line.id, n)}
                        label={`Quantity of ${product.name}`}
                      />
                      <div className="flex items-center gap-5">
                        {line.qty > 1 && (
                          <span className="label tabular-nums text-mist" data-numeric>
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
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-5 pt-7">
            <Link href="/furniture" className="link-draw label-lg text-ink">
              Continue looking
            </Link>
            <button type="button" onClick={clear} className="link-draw label text-smoke">
              Empty bag
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[8rem]">
            <div className="bg-limestone/55 p-7 sm:p-9">
              <h2 className="label-lg text-ink">Order summary</h2>

              <dl className="mt-7 space-y-3">
                <Row label="Goods" value={formatPrice(totals.net)} />
                <Row
                  label={`${brand.commerce.taxLabel} at ${Math.round(brand.commerce.taxRate * 100)}%`}
                  value={formatPrice(totals.tax)}
                />
                <Row
                  label="Delivery"
                  value={totals.deliveryIncluded ? "Included in Italy" : "Quoted on order"}
                  muted
                />
                {lead && <Row label="Estimated dispatch" value={lead} muted />}
                <div className="flex items-baseline justify-between gap-6 rule-t pt-4">
                  <dt className="label-lg text-ink">Total</dt>
                  <dd className="font-display text-heading tabular-nums text-ink" data-numeric>
                    {formatPrice(totals.total)}
                  </dd>
                </div>
              </dl>

              <div className="mt-8">
                <Button
                  onClick={checkout}
                  size="lg"
                  full
                  disabled={state.kind === "opening"}
                >
                  {state.kind === "opening" ? "Opening checkout…" : "Proceed to checkout"}
                </Button>
                <p className="label mt-4 text-mist">
                  {brand.commerce.taxNote}
                </p>
              </div>

              {state.kind === "error" && (
                <p role="alert" className="mt-5 text-small text-clay">
                  {state.message}{" "}
                  <a href={`mailto:${brand.email.general}`} className="link-draw text-ink">
                    {brand.email.general}
                  </a>
                </p>
              )}

              {state.kind === "unconfigured" && (
                <UnconfiguredNotice requires={state.requires} total={state.total} />
              )}
            </div>

            <dl className="mt-9 rule-t">
              {brand.commerce.deliveryTiers.map((t) => (
                <div key={t.region} className="flex justify-between gap-6 rule-b py-3">
                  <dt className="label text-mist">{t.region}</dt>
                  <dd className="label text-ink">
                    {t.lead} · {t.cost}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-small text-smoke">{brand.commerce.deliverySummary}</p>
            <p className="mt-4 text-small text-smoke">{brand.commerce.returns}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className={muted ? "label text-mist" : "label text-smoke"}>{label}</dt>
      <dd
        className={muted ? "label text-mist" : "label-lg tabular-nums text-ink"}
        data-numeric
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Shown when the deployment has no payment provider. The order has still been
 * priced correctly on the server — what is missing is only the card step, and
 * we say exactly what would connect it rather than faking a confirmation.
 */
function UnconfiguredNotice({ requires, total }: { requires: string[]; total: number }) {
  return (
    <div role="alert" className="mt-7 border-t border-ink/15 pt-6">
      <p className="label-lg text-ink">Card payment is not connected</p>
      <p className="mt-3 text-small text-smoke">
        Your order was priced on the server at{" "}
        <span className="tabular-nums text-ink" data-numeric>
          {formatPrice(total)}
        </span>
        , but this deployment has no payment provider, so no payment has been taken and no order has
        been placed. To order now, email the studio and we will invoice directly.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink href={`mailto:${brand.email.general}?subject=Order%20enquiry`} variant="solid" size="sm">
          Email the studio
        </ButtonLink>
        <ButtonLink href="/contact" variant="outline" size="sm">
          Use the contact form
        </ButtonLink>
      </div>
      {requires.length > 0 && (
        <details className="mt-6">
          <summary className="label cursor-pointer text-mist">
            Configuration required to enable checkout
          </summary>
          <ul className="mt-3 space-y-2">
            {requires.map((r) => (
              <li key={r} className="text-small text-smoke">
                {r}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
