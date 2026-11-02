import finishViews from "@/data/finish-views.json";
import type { Product, ProductImage } from "@/data/types";

type View = { src: string; width: number; height: number };
type Entry = { groups: string[]; views: Record<string, View> };

const MAP = finishViews as Record<string, Entry>;

/**
 * The frame that shows a piece in exactly the finishes the customer has
 * chosen.
 *
 * The asset pipeline renders every offered combination — not one group at a
 * time — so selecting a graphite cloth and a natural oak plinth shows that
 * piece, rather than the cloth change alone. Falls back to the catalogue
 * frame if a combination is ever missing, so the gallery cannot break.
 */
export function finishFrame(
  product: Product,
  options: Record<string, string>,
  fallback: ProductImage,
): ProductImage {
  const entry = MAP[product.slug];
  if (!entry) return fallback;

  const key = entry.groups
    .map((g, i) => options[g] ?? product.options[i]?.materialIds[0])
    .join("|");

  const view = entry.views[key];
  if (!view) return fallback;
  return { ...fallback, src: view.src, width: view.width, height: view.height };
}

/** Which option groups drive the photography. */
export function finishGroups(product: Product): string[] {
  return MAP[product.slug]?.groups ?? [];
}
