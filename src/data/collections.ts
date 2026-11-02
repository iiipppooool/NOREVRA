import { products } from "./products";
import type { Product } from "./types";

export type Collection = {
  id: string;
  name: string;
  /** Roman-numeral index, used in the editorial layouts. */
  index: string;
  year: number;
  designer: string;
  /** Three or four words. Appears over the photography. */
  strapline: string;
  summary: string;
  description: string[];
  /** Dominant materials, for the collection page's material strip. */
  materialIds: string[];
  images: {
    hero: { src: string; width: number; height: number; alt: string; brief: string };
    plate: { src: string; width: number; height: number; alt: string; brief: string };
    detail: { src: string; width: number; height: number; alt: string; brief: string };
  };
  /** Layout variant for the homepage collection sequence. */
  layout: "full" | "offset-left" | "offset-right" | "pair";
};

function imgs(id: string, name: string, briefs: [string, string, string]) {
  return {
    hero: {
      src: `/media/collection/${id}-hero.jpg`,
      width: 2000,
      height: 1250,
      alt: `${name} collection in an architectural interior.`,
      brief: briefs[0],
    },
    plate: {
      src: `/media/collection/${id}-plate.jpg`,
      width: 1400,
      height: 1750,
      alt: `${name} collection, portrait plate.`,
      brief: briefs[1],
    },
    detail: {
      src: `/media/collection/${id}-detail.jpg`,
      width: 1400,
      height: 1050,
      alt: `${name} material detail.`,
      brief: briefs[2],
    },
  };
}

export const collections: Collection[] = [
  {
    id: "sestri",
    name: "Sestri",
    index: "I",
    year: 2026,
    designer: "studio",
    strapline: "Low horizons",
    summary:
      "Seating drawn at thirty-eight centimetres, which changes how a room is occupied.",
    description: [
      "The collection that makes the position legible: a seat height low enough to change how a room is occupied, and everything else following from it.",
      "Everything in it is low and broad. The plinth detail — a 40-millimetre oak base that lifts the upholstery just clear of the floor — runs through the sofa, the lounge chair, the ottoman and the low table, so a Sestri room reads as one gesture rather than a set of objects.",
      "Nothing in it is adjustable for its own sake. The only variables are length, depth and what it is covered in.",
    ],
    materialIds: ["boucle-chalk", "oak-smoked", "travertine-ivory", "mohair-clay"],
    images: imgs("sestri", "Sestri", [
      "Wide 24mm interior, Sestri sofa and low table in a tall plaster room, late afternoon, hard window light across the floor. Camera low, 80cm. At least half the frame must be empty.",
      "Portrait 4:5, 50mm, the lounge chair alone with a window out of frame left. Vertical format emphasising the height of the room above the chair.",
      "Landscape 4:3 macro, the bouclé arm meeting the oak plinth, raking light.",
    ]),
    layout: "full",
  },
  {
    id: "alvara",
    name: "Alvara",
    index: "II",
    year: 2026,
    designer: "studio",
    strapline: "One block",
    summary:
      "Tables cut from a single quarry block and assembled without a fixing.",
    description: [
      "Alvara begins with a rule: nothing in it may be joined by anything other than gravity and a dowel. Everything else in the collection is a consequence of holding to that.",
      "Working this way means buying stone one block at a time, and designing around what the block will give. A 300-centimetre Alvara table and its two plinths come from the same piece, so the bed of the stone runs continuously through the finished object. That is not an aesthetic preference; it is the only way to get the colour to match.",
      "Every Alvara is therefore slightly different, which is the reason the drawing shows the piece and the stone is quoted against the block.",
    ],
    materialIds: ["travertine-ivory", "marble-grigio", "travertine-smoke", "oak-smoked"],
    images: imgs("alvara", "Alvara", [
      "Wide 24mm dining room with the Alvara table centred and low in frame, ceiling visible, one wall entirely bare. Bare table top. Hard light.",
      "Portrait 4:5, 85mm, the stone plinth of the dining table from close range, floor to top edge, nothing else.",
      "Landscape 4:3, 100mm macro of honed travertine, raking light, the pores reading as a horizontal grain.",
    ]),
    layout: "offset-right",
  },
  {
    id: "kelvara",
    name: "Kelvara",
    index: "III",
    year: 2026,
    designer: "studio",
    strapline: "No handles",
    summary:
      "Solid timber casegoods opened by a rebate, lifted on patinated brass.",
    description: [
      "The slowest of the five to make. Solid timber throughout — not a veneered face anywhere you can see — housed and glued, with drawers cut by hand.",
      "The absence of handles is the collection's whole argument. A 14-millimetre rebate along the lower edge of each door gives you something to pull, and gives the piece a shadow line that does the work a handle would otherwise do. It means the fronts can be read as a single plane.",
      "It is also the collection that sets the standard for the rest: if a carcass cannot be built this way, it does not go in the catalogue.",
    ],
    materialIds: ["oak-natural", "oak-smoked", "brass-patinated", "walnut-european"],
    images: imgs("kelvara", "Kelvara", [
      "Wide 28mm long wall, sideboard on the left third, rest of the frame empty plaster and floor. Side light so the under-door shadow line reads.",
      "Portrait 4:5, 50mm, the tall cabinet with one door open on the brass lining, ceiling visible.",
      "Landscape 4:3, 1:1 macro of the finger rebate and brass plinth, raking light.",
    ]),
    layout: "offset-left",
  },
  {
    id: "noctis",
    name: "Noctis",
    index: "IV",
    year: 2026,
    designer: "studio",
    strapline: "Quiet first",
    summary:
      "A bedroom drawn around a headboard you can lean against for an hour.",
    description: [
      "Noctis starts from a complaint: that bedrooms are usually furnished rather than designed, and that the one piece you spend a third of your life on is the one given least thought.",
      "So the headboard is 140 millimetres thick and raked four degrees. The base is recessed and upholstered so it disappears. Every cover in the collection, headboard included, comes off.",
      "It is also the quietest collection in the catalogue: no metal you can see except the feet, no stone except the nightstand top, and a palette that stops at oat, chalk and sage.",
    ],
    materialIds: ["linen-oat", "boucle-chalk", "wool-sage", "bronze-dark"],
    images: imgs("noctis", "Noctis", [
      "Wide 24mm bedroom, bed on the right, one hard rectangle of early light on an otherwise bare wall. Bed made plainly.",
      "Portrait 4:5, 50mm, headboard close from the side, showing the rake and the roll at the top edge, ceiling above.",
      "Landscape 4:3 macro of oat linen with a crease in it, raking light.",
    ]),
    layout: "pair",
  },
  {
    id: "oriel",
    name: "Oriel",
    index: "V",
    year: 2026,
    designer: "studio",
    strapline: "The shadow, not the light",
    summary: "Brass, stone and an interest in what a light does to a wall.",
    description: [
      "The brief for Oriel was that none of the four pieces should show you its light source from a seated position.",
      "The floor light faces up and washes a ceiling. The pendant turns the same dish over and softens its edge with a brushed interior. The table light has no switch — you rotate a brass sleeve. The mirror is not a light at all, but it is in the collection because it does the same job: it changes what a wall is doing.",
      "It is the smallest collection, and the one that does the most to a room.",
    ],
    materialIds: ["brass-patinated", "marble-grigio", "bronze-dark", "travertine-ivory"],
    images: imgs("oriel", "Oriel", [
      "Wide 28mm dim room at dusk, floor light on, the ceiling wash the brightest thing in frame. No other light source.",
      "Portrait 4:5, 50mm, full height of the floor light against plaster, lit, source not visible.",
      "Landscape 4:3, 1:1 macro of patinated brass, raking light, the patina reading as cloud rather than scratch.",
    ]),
    layout: "offset-right",
  },
];

export const collectionMap: Record<string, Collection> = Object.fromEntries(
  collections.map((c) => [c.id, c]),
);

export function collectionById(id: string): Collection | undefined {
  return collectionMap[id];
}

export function collectionProducts(id: string): Product[] {
  return products.filter((p) => p.collection === id);
}

export function collectionName(id: string): string {
  return collectionMap[id]?.name ?? id;
}
