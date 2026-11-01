import finishViews from "@/data/finish-views.json";
import type { Product, ProductImage } from "@/data/types";

type View = { src: string; width: number; height: number };
type Entry = { group: string; views: Record<string, View> };

const MAP = finishViews as Record<string, Entry>;

/**
 * The frame that shows a piece in the finish the customer has chosen.
 *
 * The asset pipeline renders every piece in every finish its primary option
 * group offers; this resolves the selection to one of those frames. Falls back
 * to the catalogue frame, so a piece with no finish views still works.
 */
export function finishFrame(
  product: Product,
  options: Record<string, string>,
  fallback: ProductImage,
): ProductImage {
  const entry = MAP[product.slug];
  if (!entry) return fallback;
  const chosen = options[entry.group];
  const view = chosen ? entry.views[chosen] : undefined;
  if (!view) return fallback;
  return { ...fallback, src: view.src, width: view.width, height: view.height };
}

/** Which option group drives the photography, for labelling. */
export function finishGroupId(product: Product): string | null {
  return MAP[product.slug]?.group ?? null;
}
