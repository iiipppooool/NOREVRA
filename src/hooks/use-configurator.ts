"use client";

import { useCallback, useMemo, useState } from "react";
import type { Product } from "@/data/types";
import { variantPrice } from "@/data/products";
import { materialMap } from "@/data/materials";
import { useStore } from "@/lib/store";

/**
 * One source of configuration state for a piece — variant plus one material
 * per option group — shared by the product page and the quick view so the two
 * can never behave differently.
 */
export function useConfigurator(product: Product, initialVariantId?: string) {
  const add = useStore((s) => s.add);

  const [variantId, setVariantId] = useState(
    () => initialVariantId ?? product.variants[0].id,
  );
  const [options, setOptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((g) => [g.id, g.materialIds[0]])),
  );
  const [qty, setQty] = useState(1);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? product.variants[0],
    [product, variantId],
  );

  const unitPrice = variantPrice(product, variant.id);

  const setOption = useCallback((groupId: string, materialId: string) => {
    setOptions((prev) => ({ ...prev, [groupId]: materialId }));
  }, []);

  /** "Chalk Bouclé · Smoked Oak" */
  const finishSummary = useMemo(
    () =>
      product.options
        .map((g) => materialMap[options[g.id]]?.name)
        .filter(Boolean)
        .join(" · "),
    [product.options, options],
  );

  const addToBag = useCallback(() => {
    add({ slug: product.slug, variantId: variant.id, options, qty });
  }, [add, product.slug, variant.id, options, qty]);

  return {
    variant,
    variantId,
    setVariantId,
    options,
    setOption,
    qty,
    setQty,
    unitPrice,
    lineTotal: unitPrice * qty,
    finishSummary,
    addToBag,
  };
}
