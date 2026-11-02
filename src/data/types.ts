export type Category = "seating" | "tables" | "storage" | "beds" | "lighting" | "objects";

export const categories: { id: Category; label: string; plural: string }[] = [
  { id: "seating", label: "Seating", plural: "Seating" },
  { id: "tables", label: "Table", plural: "Tables" },
  { id: "storage", label: "Storage", plural: "Storage" },
  { id: "beds", label: "Bed", plural: "Beds" },
  { id: "lighting", label: "Lighting", plural: "Lighting" },
  { id: "objects", label: "Object", plural: "Objects" },
];

export const categoryLabel = (id: Category): string =>
  categories.find((c) => c.id === id)?.label ?? id;

/** Silhouette the asset generator draws for this piece. */
export type Form =
  | "sofa"
  | "lounge-chair"
  | "ottoman"
  | "low-table"
  | "dining-table"
  | "console"
  | "side-table"
  | "bench"
  | "sideboard"
  | "cabinet"
  | "shelving"
  | "desk"
  | "bed"
  | "nightstand"
  | "daybed"
  | "floor-light"
  | "pendant"
  | "table-light"
  | "mirror";

export type Light = "north" | "west" | "low" | "overcast";

export type Variant = {
  id: string;
  label: string;
  /** Added to the product's base price, in minor units. May be 0. */
  priceDelta: number;
  /** Centimetres. sh = seat height where meaningful. */
  dim: { w: number; d: number; h: number; sh?: number };
};

export type OptionGroup = {
  id: string;
  label: string;
  /** Material ids from src/data/materials.ts. First is the default. */
  materialIds: string[];
};

export type ProductImage = {
  /** Path under /media. Generated locally — see PHOTOGRAPHY.md. */
  src: string;
  /** Intrinsic size of the generated asset. */
  width: number;
  height: number;
  alt: string;
  /** The photograph that should replace this asset in production. */
  brief: string;
  kind: "setting" | "detail" | "context" | "elevation";
};

/**
 * Where a piece is in production.
 *
 * Everything in the opening catalogue is "first-run": it has been drawn and
 * specified but not yet built, so it is reserved rather than ordered. As a
 * piece completes its first run it moves to "made-to-order" and the language
 * on the page changes with it. Nothing here should ever say "in stock",
 * because nothing is.
 */
export type Availability = "first-run" | "made-to-order" | "enquire";

export type Product = {
  slug: string;
  name: string;
  /** Collection id. */
  collection: string;
  category: Category;
  /** Designer id from brand.designers. */
  designer: string;
  year: number;
  /** "Modular sofa", "Dining table" — shown above the name. */
  typology: string;
  /** Base price in minor units (cents), tax inclusive. */
  price: number;
  /** One restrained sentence. Used on cards and in quick view. */
  summary: string;
  /** Body copy, one string per paragraph. */
  description: string[];
  variants: Variant[];
  options: OptionGroup[];
  /** Spec rows. Rendered as a definition list on the product page. */
  construction: { label: string; value: string }[];
  dimensionNote?: string;
  care: string;
  leadTime: string;
  images: ProductImage[];
  related: string[];
  availability: Availability;
  featured?: boolean;
  /** Generator instructions. */
  render: { form: Form; light: Light; wall: string; floor: string };
};
