/**
 * The shape of a catalogue query, and the fixed facet vocabulary.
 *
 * Deliberately free of any data import. src/lib/catalogue.ts builds a search
 * index at module scope, so a client component that needed only the sort
 * options was pulling the entire catalogue — and that index — into the
 * browser bundle. The filter UI imports this file instead.
 */
import type { Category } from "@/data/types";
import type { MaterialFamily } from "@/data/materials";

export const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "newest", label: "Most recent" },
  { id: "name", label: "Alphabetical" },
] as const;

export type SortId = (typeof SORTS)[number]["id"];

export const PRICE_BANDS = [
  { id: "under-3000", label: "Under €3,000", min: 0, max: 300000 },
  { id: "3000-8000", label: "€3,000 – €8,000", min: 300000, max: 800000 },
  { id: "8000-15000", label: "€8,000 – €15,000", min: 800000, max: 1500000 },
  { id: "over-15000", label: "Over €15,000", min: 1500000, max: Infinity },
] as const;

export type Query = {
  category: Category[];
  collection: string[];
  family: MaterialFamily[];
  band: string[];
  sort: SortId;
  q: string;
};

export type FacetKey = "category" | "collection" | "family" | "band";

/** A facet group, resolved on the server and handed to the filter UI. */
export type FacetGroup = {
  key: FacetKey;
  label: string;
  items: { id: string; label: string; n: number }[];
};
