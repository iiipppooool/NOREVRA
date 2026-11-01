import { productBySlug, variantPrice } from "@/data/products";
import { materialMap } from "@/data/materials";
import { brand } from "@/data/brand";
import type { CartLine } from "@/lib/store";
import type { Product, Variant } from "@/data/types";

export type ResolvedLine = {
  line: CartLine;
  product: Product;
  variant: Variant;
  unitPrice: number;
  total: number;
  /** "Chalk Bouclé · Smoked Oak" */
  finishes: string;
};

/**
 * Resolves stored cart lines against the live catalogue. Prices are never read
 * from storage — a line that no longer exists is dropped, and a price change
 * is picked up immediately.
 */
export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const line of lines) {
    const product = productBySlug(line.slug);
    if (!product) continue;
    const variant = product.variants.find((v) => v.id === line.variantId);
    if (!variant) continue;
    const unitPrice = variantPrice(product, variant.id);
    const finishes = product.options
      .map((g) => materialMap[line.options[g.id]]?.name)
      .filter(Boolean)
      .join(" · ");
    out.push({ line, product, variant, unitPrice, total: unitPrice * line.qty, finishes });
  }
  return out;
}

export function bagTotals(resolved: ResolvedLine[]) {
  const subtotal = resolved.reduce((n, r) => n + r.total, 0);
  const items = resolved.reduce((n, r) => n + r.line.qty, 0);
  const { taxRate, freeDeliveryThreshold } = brand.commerce;
  // Catalogue prices are tax inclusive, so tax is extracted, not added.
  const tax = Math.round(subtotal - subtotal / (1 + taxRate));
  return {
    items,
    subtotal,
    tax,
    net: subtotal - tax,
    deliveryIncluded: subtotal >= freeDeliveryThreshold,
    total: subtotal,
  };
}

/** The longest lead time in the bag — what the customer actually waits. */
export function bagLeadTime(resolved: ResolvedLine[]): string | null {
  const weeks = resolved
    .map((r) => parseInt(r.product.leadTime, 10))
    .filter((n) => Number.isFinite(n));
  if (weeks.length === 0) return null;
  return `${Math.max(...weeks)} weeks`;
}
