/**
 * Material library.
 *
 * Each entry is both (a) a selectable product finish and (b) the recipe the
 * asset generator uses to render its swatch and surface texture, so a finish
 * and its image can never drift apart. See scripts/generate-assets.mts.
 */

export type MaterialFamily = "stone" | "timber" | "textile" | "leather" | "metal";

export type Material = {
  id: string;
  name: string;
  family: MaterialFamily;
  /** Base tone. Also the fallback colour before the swatch image loads. */
  hex: string;
  /** Secondary tone used for veining / grain / weave. */
  veinHex: string;
  origin: string;
  note: string;
  /** Surface recipe consumed by the generator. */
  render: {
    /** feTurbulence base frequency, x and y. Anisotropy makes grain. */
    freq: [number, number];
    octaves: number;
    /** Displacement/relief strength. */
    relief: number;
    /** Specular highlight intensity, 0–1. Stone and metal catch light. */
    sheen: number;
    /** Weave overlay for textiles. */
    weave?: "boucle" | "linen" | "wool" | "mohair";
  };
};

export const materials: Material[] = [
  // --- Stone ---------------------------------------------------------------
  {
    id: "travertine-ivory",
    name: "Ivory Travertine",
    family: "stone",
    hex: "#cfc2a9",
    veinHex: "#a8977c",
    origin: "Rapolano Terme, Tuscany",
    note: "Cut against the bed so the pores read as horizontal lines. Honed, never polished.",
    render: { freq: [0.004, 0.038], octaves: 4, relief: 2.4, sheen: 0.26 },
  },
  {
    id: "travertine-smoke",
    name: "Smoke Travertine",
    family: "stone",
    hex: "#8e8578",
    veinHex: "#6b6359",
    origin: "Rapolano Terme, Tuscany",
    note: "The darker bed of the same quarry. Greyer, denser, slightly fewer voids.",
    render: { freq: [0.004, 0.034], octaves: 4, relief: 2.2, sheen: 0.24 },
  },
  {
    id: "marble-grigio",
    name: "Grigio Carnico Marble",
    family: "stone",
    hex: "#4a4843",
    veinHex: "#b9b2a4",
    origin: "Carnic Alps, Friuli",
    note: "Near-black with a chalk vein. We book-match tops over 2 metres.",
    render: { freq: [0.0022, 0.012], octaves: 5, relief: 1.6, sheen: 0.52 },
  },
  {
    id: "limestone-pale",
    name: "Pale Limestone",
    family: "stone",
    hex: "#ddd5c4",
    veinHex: "#bdb3a0",
    origin: "Vicenza",
    note: "A matte, almost powdery surface. Takes a hand-worn patina within a year.",
    render: { freq: [0.012, 0.016], octaves: 3, relief: 1.1, sheen: 0.12 },
  },

  // --- Timber --------------------------------------------------------------
  {
    id: "oak-natural",
    name: "Natural Oak",
    family: "timber",
    hex: "#bda079",
    veinHex: "#8a6c47",
    origin: "Slavonian oak, Croatia",
    note: "Quarter-sawn, soap-finished. Pale to begin with; warms considerably.",
    render: { freq: [0.0025, 0.09], octaves: 5, relief: 1.5, sheen: 0.16 },
  },
  {
    id: "oak-smoked",
    name: "Smoked Oak",
    family: "timber",
    hex: "#6d543c",
    veinHex: "#4a3728",
    origin: "Slavonian oak, Croatia",
    note: "Fumed with ammonia rather than stained, so the colour runs through the board.",
    render: { freq: [0.0025, 0.085], octaves: 5, relief: 1.5, sheen: 0.18 },
  },
  {
    id: "walnut-european",
    name: "European Walnut",
    family: "timber",
    hex: "#5e4530",
    veinHex: "#3b2a1c",
    origin: "Loire Valley, France",
    note: "Selected for figure. Oiled by hand, five coats, a week apart.",
    render: { freq: [0.003, 0.07], octaves: 5, relief: 1.7, sheen: 0.22 },
  },
  {
    id: "ash-blackened",
    name: "Blackened Ash",
    family: "timber",
    hex: "#2a2724",
    veinHex: "#181614",
    origin: "Carpathian ash",
    note: "Open-grain black. The grain stays legible under the pigment.",
    render: { freq: [0.003, 0.08], octaves: 4, relief: 1.4, sheen: 0.2 },
  },

  // --- Textile -------------------------------------------------------------
  {
    id: "boucle-chalk",
    name: "Chalk Bouclé",
    family: "textile",
    hex: "#e6e0d3",
    veinHex: "#cac2b1",
    origin: "Woven in Biella, Italy",
    note: "Wool and cotton loop on a cotton ground. 78,000 Martindale.",
    render: { freq: [0.09, 0.09], octaves: 3, relief: 2.8, sheen: 0.06, weave: "boucle" },
  },
  {
    id: "boucle-ash",
    name: "Ash Bouclé",
    family: "textile",
    hex: "#9a958b",
    veinHex: "#7d786f",
    origin: "Woven in Biella, Italy",
    note: "The same cloth in a cool grey. Reads darker in north light.",
    render: { freq: [0.09, 0.09], octaves: 3, relief: 2.8, sheen: 0.06, weave: "boucle" },
  },
  {
    id: "linen-oat",
    name: "Oat Linen",
    family: "textile",
    hex: "#cfc3ac",
    veinHex: "#b0a28a",
    origin: "Flax grown and woven in Normandy",
    note: "Heavy upholstery weight. Creases, and is meant to.",
    render: { freq: [0.055, 0.055], octaves: 2, relief: 1.6, sheen: 0.1, weave: "linen" },
  },
  {
    id: "wool-graphite",
    name: "Graphite Wool",
    family: "textile",
    hex: "#403e3a",
    veinHex: "#2b2926",
    origin: "Woven in Yorkshire, England",
    note: "A dense twill. Flat, architectural, holds a sharp seam.",
    render: { freq: [0.07, 0.07], octaves: 2, relief: 1.3, sheen: 0.08, weave: "wool" },
  },
  {
    id: "mohair-clay",
    name: "Clay Mohair",
    family: "textile",
    hex: "#a1705a",
    veinHex: "#7e5341",
    origin: "Woven in Kortrijk, Belgium",
    note: "A short pile with real depth. The colour shifts as you move past it.",
    render: { freq: [0.11, 0.08], octaves: 3, relief: 2.2, sheen: 0.3, weave: "mohair" },
  },
  {
    id: "wool-sage",
    name: "Sage Wool",
    family: "textile",
    hex: "#6f7362",
    veinHex: "#565a4b",
    origin: "Woven in Yorkshire, England",
    note: "A muted green that behaves like a neutral in most rooms.",
    render: { freq: [0.07, 0.07], octaves: 2, relief: 1.3, sheen: 0.08, weave: "wool" },
  },

  // --- Leather -------------------------------------------------------------
  {
    id: "leather-cognac",
    name: "Cognac Saddle Leather",
    family: "leather",
    hex: "#8a5b3a",
    veinHex: "#5f3c24",
    origin: "Tanned in Santa Croce sull'Arno, Tuscany",
    note: "Vegetable-tanned, 3.2mm, aniline. Scratches become patina.",
    render: { freq: [0.14, 0.14], octaves: 4, relief: 1.9, sheen: 0.34 },
  },
  {
    id: "leather-espresso",
    name: "Espresso Leather",
    family: "leather",
    hex: "#3a2b22",
    veinHex: "#241a14",
    origin: "Tanned in Santa Croce sull'Arno, Tuscany",
    note: "The darkest of the three. Almost no visible grain at a distance.",
    render: { freq: [0.14, 0.14], octaves: 4, relief: 1.9, sheen: 0.38 },
  },

  // --- Metal ---------------------------------------------------------------
  {
    id: "brass-patinated",
    name: "Patinated Brass",
    family: "metal",
    hex: "#a98b57",
    veinHex: "#7a6038",
    origin: "Drawn and finished in Lecco",
    note: "Chemically aged, then waxed. Left unlacquered so it continues to move.",
    render: { freq: [0.006, 0.05], octaves: 3, relief: 0.9, sheen: 0.72 },
  },
  {
    id: "bronze-dark",
    name: "Dark Bronze",
    family: "metal",
    hex: "#4b4139",
    veinHex: "#2e2721",
    origin: "Cast and finished in Lecco",
    note: "A deep, low-reflection bronze used for frames and feet.",
    render: { freq: [0.008, 0.04], octaves: 3, relief: 0.8, sheen: 0.55 },
  },
];

export const materialMap: Record<string, Material> = Object.fromEntries(
  materials.map((m) => [m.id, m]),
);

export function material(id: string): Material {
  const found = materialMap[id];
  if (!found) throw new Error(`Unknown material: ${id}`);
  return found;
}

export const familyLabels: Record<MaterialFamily, string> = {
  stone: "Stone",
  timber: "Timber",
  textile: "Cloth",
  leather: "Leather",
  metal: "Metal",
};

/** Swatch image path for a material. Generated, never remote. */
export function swatchSrc(id: string): string {
  return `/media/swatch/${id}.jpg`;
}
