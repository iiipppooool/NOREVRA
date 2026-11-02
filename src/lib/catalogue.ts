import { products, priceRange } from "@/data/products";
import { collections } from "@/data/collections";
import { materialMap, familyLabels, type MaterialFamily } from "@/data/materials";
import { categories, type Category, type Product } from "@/data/types";
import { designerById } from "@/data/brand";
import { SORTS, PRICE_BANDS, type Query, type SortId, type FacetGroup } from "./facets";

export { SORTS, PRICE_BANDS };
export type { Query, SortId, FacetGroup };

const list = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v.join(",") : (v ?? ""))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Parses and sanitises URL search params. Unknown values are dropped. */
export function parseQuery(
  sp: Record<string, string | string[] | undefined>,
): Query {
  const validCategories = new Set(categories.map((c) => c.id));
  const validCollections = new Set(collections.map((c) => c.id));
  const validFamilies = new Set(Object.keys(familyLabels));
  const validBands = new Set<string>(PRICE_BANDS.map((b) => b.id));
  const sort = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;

  return {
    category: list(sp.category).filter((c): c is Category => validCategories.has(c as Category)),
    collection: list(sp.collection).filter((c) => validCollections.has(c)),
    family: list(sp.family).filter((f): f is MaterialFamily => validFamilies.has(f)),
    band: list(sp.band).filter((b) => validBands.has(b)),
    sort: (SORTS.some((s) => s.id === sort) ? sort : "featured") as SortId,
    q: (Array.isArray(sp.q) ? sp.q[0] : (sp.q ?? "")).slice(0, 80).trim(),
  };
}

/** Everything a product can be found by. Built once per product. */
function haystack(p: Product): string {
  const materials = p.options
    .flatMap((g) => g.materialIds)
    .map((id) => materialMap[id]?.name ?? "")
    .join(" ");
  return [
    p.name,
    p.typology,
    p.category,
    p.collection,
    p.summary,
    designerById(p.designer)?.name ?? "",
    materials,
    p.construction.map((c) => `${c.label} ${c.value}`).join(" "),
    p.variants.map((v) => v.label).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

const HAYSTACKS = new Map(products.map((p) => [p.slug, haystack(p)]));

function families(p: Product): Set<MaterialFamily> {
  const out = new Set<MaterialFamily>();
  for (const g of p.options) {
    for (const id of g.materialIds) {
      const m = materialMap[id];
      if (m) out.add(m.family);
    }
  }
  return out;
}

export function queryProducts(q: Query): Product[] {
  const terms = q.q.toLowerCase().split(/\s+/).filter(Boolean);

  let out = products.filter((p) => {
    if (q.category.length && !q.category.includes(p.category)) return false;
    if (q.collection.length && !q.collection.includes(p.collection)) return false;
    if (q.family.length) {
      const fam = families(p);
      if (!q.family.some((f) => fam.has(f))) return false;
    }
    if (q.band.length) {
      const { min } = priceRange(p);
      const inBand = q.band.some((id) => {
        const b = PRICE_BANDS.find((x) => x.id === id);
        return b ? min >= b.min && min < b.max : false;
      });
      if (!inBand) return false;
    }
    if (terms.length) {
      const hay = HAYSTACKS.get(p.slug) ?? "";
      // Every term must appear somewhere — an AND search, which for a
      // twenty-piece catalogue is more useful than fuzzy ranking.
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });

  out = [...out].sort((a, b) => {
    switch (q.sort) {
      case "price-asc":
        return priceRange(a).min - priceRange(b).min;
      case "price-desc":
        return priceRange(b).min - priceRange(a).min;
      case "newest":
        return b.year - a.year || a.name.localeCompare(b.name);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return (
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          a.name.localeCompare(b.name)
        );
    }
  });

  return out;
}

/** Counts for each facet, given the rest of the query — so no dead filters. */
export function facetCounts(q: Query) {
  const count = (patch: Partial<Query>) => queryProducts({ ...q, ...patch }).length;
  return {
    category: Object.fromEntries(
      categories.map((c) => [c.id, count({ category: [c.id] })]),
    ) as Record<Category, number>,
    collection: Object.fromEntries(
      collections.map((c) => [c.id, count({ collection: [c.id] })]),
    ) as Record<string, number>,
    family: Object.fromEntries(
      (Object.keys(familyLabels) as MaterialFamily[]).map((f) => [f, count({ family: [f] })]),
    ) as Record<MaterialFamily, number>,
    band: Object.fromEntries(
      PRICE_BANDS.map((b) => [b.id, count({ band: [b.id] })]),
    ) as Record<string, number>,
  };
}

/** Facet groups with their counts, resolved for the filter UI. */
export function facetGroups(q: Query): FacetGroup[] {
  const counts = facetCounts(q);
  return [
    {
      key: "category",
      label: "Typology",
      items: categories.map((c) => ({ id: c.id, label: c.plural, n: counts.category[c.id] ?? 0 })),
    },
    {
      key: "collection",
      label: "Collection",
      items: collections.map((c) => ({ id: c.id, label: c.name, n: counts.collection[c.id] ?? 0 })),
    },
    {
      key: "family",
      label: "Material",
      items: (Object.keys(familyLabels) as MaterialFamily[]).map((f) => ({
        id: f,
        label: familyLabels[f],
        n: counts.family[f] ?? 0,
      })),
    },
    {
      key: "band",
      label: "Price",
      items: PRICE_BANDS.map((b) => ({ id: b.id, label: b.label, n: counts.band[b.id] ?? 0 })),
    },
  ];
}

export function activeFilterCount(q: Query): number {
  return q.category.length + q.collection.length + q.family.length + q.band.length + (q.q ? 1 : 0);
}

/** A readable description of the current query, used in the page heading. */
export function queryDescription(q: Query): string | null {
  const bits: string[] = [];
  if (q.category.length)
    bits.push(
      q.category
        .map((c) => categories.find((x) => x.id === c)?.plural ?? c)
        .join(" and "),
    );
  if (q.collection.length)
    bits.push(
      `from ${q.collection.map((c) => collections.find((x) => x.id === c)?.name ?? c).join(" and ")}`,
    );
  if (q.family.length) bits.push(`in ${q.family.map((f) => familyLabels[f].toLowerCase()).join(" or ")}`);
  if (q.band.length)
    bits.push(
      `priced ${q.band.map((b) => PRICE_BANDS.find((x) => x.id === b)?.label.toLowerCase() ?? b).join(" or ")}`,
    );
  if (q.q) bits.push(`matching “${q.q}”`);
  return bits.length ? bits.join(" ") : null;
}
