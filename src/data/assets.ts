/**
 * Site-level imagery registry.
 *
 * Every image on the site resolves through this file or through a product /
 * collection / journal record. Nothing is referenced by a literal path inside
 * a component, so replacing the generated art direction with commissioned
 * photography is a change to data only.
 *
 * `brief` is the shot that should replace the asset. PHOTOGRAPHY.md is
 * generated from these briefs.
 */

export type Asset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  brief: string;
};

export type HeroSlide = Asset & {
  /** Two or three words, set over the image. */
  caption: string;
  /** Product or collection the frame belongs to, for the hero's deep link. */
  href: string;
  hrefLabel: string;
  /**
   * A separately composed portrait frame for phones. Cropping the landscape
   * one to 9:19 throws away the room and leaves the furniture behind the
   * headline, so the hero is art-directed twice rather than cropped.
   */
  portrait: Asset;
};

export const heroSlides: HeroSlide[] = [
  {
    src: "/media/hero/01.jpg",
    width: 2400,
    height: 1500,
    portrait: {
      src: "/media/hero/01-portrait.jpg",
      width: 1200,
      height: 1600,
      alt: "",
      brief: "The same set-up as the landscape frame above, recomposed for a vertical crop: camera a little closer, the piece low in frame, the upper half given to the room.",
    },
    alt: "A tall plaster room with a low sofa and a travertine table, late afternoon light crossing the floor.",
    brief:
      "THE OPENING FRAME. 24mm, camera at 90cm, a stripped-plaster room of at least four metres. Sestri sofa and low table left of centre, small in frame. A hard rectangle of afternoon light on the floor reaching toward them. Ceiling in frame. At least 55% of the picture must be empty wall, floor or light. Nothing styled. This is the single most important photograph in the project.",
    caption: "Sestri, in chalk bouclé",
    href: "/collections/sestri",
    hrefLabel: "Sestri",
  },
  {
    src: "/media/hero/02.jpg",
    width: 2400,
    height: 1500,
    portrait: {
      src: "/media/hero/02-portrait.jpg",
      width: 1200,
      height: 1600,
      alt: "",
      brief: "The same set-up as the landscape frame above, recomposed for a vertical crop: camera a little closer, the piece low in frame, the upper half given to the room.",
    },
    alt: "A stone dining table in a bare room, hard light raking across the slab.",
    brief:
      "28mm, camera at 120cm. Alvara dining table in travertine, centred but low in frame, entirely bare. One window out of frame left throwing a hard-edged light across the top and a deep shadow beneath the slab. Walls bare. Ceiling in frame.",
    caption: "Alvara, in ivory travertine",
    href: "/collections/alvara",
    hrefLabel: "Alvara",
  },
  {
    src: "/media/hero/03.jpg",
    width: 2400,
    height: 1500,
    portrait: {
      src: "/media/hero/03-portrait.jpg",
      width: 1200,
      height: 1600,
      alt: "",
      brief: "The same set-up as the landscape frame above, recomposed for a vertical crop: camera a little closer, the piece low in frame, the upper half given to the room.",
    },
    alt: "A dim room at dusk with a brass floor light washing the ceiling.",
    brief:
      "28mm, camera at 110cm. A dim room at dusk, Oriel floor light on and the ceiling wash the brightest thing in frame. Sestri Lounge beside it, barely lit. The light source itself must not be visible. Expose for the ceiling.",
    caption: "Oriel, in patinated brass",
    href: "/collections/oriel",
    hrefLabel: "Oriel",
  },
];

for (const slide of heroSlides) slide.portrait.alt = slide.alt;

export const siteAssets = {
  /** Homepage philosophy section. Full-bleed, parallaxed. */
  philosophy: {
    src: "/media/editorial/philosophy.jpg",
    width: 2400,
    height: 1500,
    alt: "Honed travertine meeting smoked oak and patinated brass under raking light.",
    brief:
      "100mm macro, three materials meeting in one frame: honed travertine, smoked oak end grain and patinated brass. Hard raking light from the left. Fills the frame — no object, no room. Shoot on the workshop bench.",
  } satisfies Asset,

  /** Homepage editorial diptych. */
  editorialTall: {
    src: "/media/editorial/tall.jpg",
    width: 1400,
    height: 1900,
    alt: "A tall window and the corner of an upholstered chair in raking light.",
    brief:
      "Portrait 1400×1900, 50mm. A tall window from inside, the corner of a Sestri Lounge entering the bottom right of frame. Mostly light and plaster. Vertical emphasis.",
  } satisfies Asset,

  editorialWide: {
    src: "/media/editorial/wide.jpg",
    width: 2000,
    height: 1250,
    alt: "Honed travertine under raking light, pores reading as horizontal grain.",
    brief:
      "100mm macro of vein-cut honed travertine filling the frame, hard raking light from the left so the pores read as horizontal grain. No object, no edge — surface only.",
  } satisfies Asset,

  /** Our Story. */
  storyHero: {
    src: "/media/story/hero.jpg",
    width: 2400,
    height: 1350,
    alt: "A long bare room with a solid oak sideboard on one wall.",
    brief:
      "28mm, a long bare room with the Kelvara sideboard on the left third, the rest empty plaster and floor. Flat overcast light so the timber reads true. Ceiling in frame.",
  } satisfies Asset,

  storyWorkshop: {
    src: "/media/story/workshop.jpg",
    width: 2000,
    height: 1250,
    alt: "Chalk bouclé, oat linen and smoked oak laid against one another.",
    brief:
      "100mm macro from the upholstery floor: chalk bouclé, oat linen and smoked oak laid against one another, raking north light so the loop and the slub both read. Fills the frame.",
  } satisfies Asset,

  storyMaterials: {
    src: "/media/story/materials.jpg",
    width: 1400,
    height: 1750,
    alt: "A grid of material samples — stone, timber, cloth, leather and brass — on a stone surface.",
    brief:
      "Portrait 4:5, 85mm from directly above. Material samples laid in a grid on a travertine surface: three stones, three timbers, four cloths, two metals. Soft directional light. This is a working layout, not a styled flat lay.",
  } satisfies Asset,

  /** Contact. */
  contact: {
    src: "/media/story/showroom.jpg",
    width: 2000,
    height: 1250,
    alt: "The Milan showroom: one room, a low sofa, a tall window.",
    brief:
      "28mm, the Via Cesare Correnti showroom. The Sestri sofa only, a tall window, terrazzo floor. Empty of people. Early morning.",
  } satisfies Asset,

  /** Open Graph fallback. Branded plate. */
  ogDefault: {
    src: "/media/og/default.jpg",
    width: 1200,
    height: 630,
    alt: "Norevra",
    brief:
      "1200×630 crop of the opening hero frame with room at the left third for the wordmark.",
  } satisfies Asset,
} as const;

/** Every brief in the project, for PHOTOGRAPHY.md generation. */
export type ShotBrief = { src: string; brief: string; group: string };
