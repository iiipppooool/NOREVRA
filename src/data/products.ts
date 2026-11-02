import type { Product, ProductImage } from "./types";

/* ---------------------------------------------------------------------------
   Image set builder.

   Every piece is photographed to the same four-frame grammar:
     1. setting   — the piece in a room, three-quarter, natural light
     2. detail    — a material close-up at arm's length
     3. context   — a wide architectural frame, piece off-centre
     4. elevation — the drawing, straight on, from the workshop file

   Assets under /media are generated locally (npm run assets). The `brief`
   on each frame is the shot that should replace it. See PHOTOGRAPHY.md.
--------------------------------------------------------------------------- */

function frames(slug: string, name: string, notes: {
  setting: string;
  detail: string;
  context: string;
}): ProductImage[] {
  return [
    {
      src: `/media/product/${slug}-setting.jpg`,
      width: 1400,
      height: 1750,
      alt: `${name} in a daylit interior, seen three-quarter on.`,
      brief: notes.setting,
      kind: "setting",
    },
    {
      src: `/media/product/${slug}-detail.jpg`,
      width: 1200,
      height: 1200,
      alt: `Material detail of the ${name}.`,
      brief: notes.detail,
      kind: "detail",
    },
    {
      src: `/media/product/${slug}-context.jpg`,
      width: 2000,
      height: 1250,
      alt: `${name} within a wider architectural interior.`,
      brief: notes.context,
      kind: "context",
    },
    {
      src: `/media/elevation/${slug}.svg`,
      width: 1200,
      height: 1200,
      alt: `Scale elevation drawing of the ${name}.`,
      brief: "No photograph required — this is the workshop drawing, redrawn to the production dimensions.",
      kind: "elevation",
    },
  ];
}

const CARE_UPHOLSTERY =
  "Vacuum on a low setting with a brush head. Rotate and plump cushions weekly so the fill settles evenly. Spot-clean with distilled water; send anything beyond that to a specialist and tell them it is wool.";
const CARE_STONE =
  "Wipe with a damp cloth and nothing else. Stone is porous and will mark from oil, wine and citrus — use coasters and seal annually with the wax we supply.";
const CARE_TIMBER =
  "Dust along the grain. Re-oil once a year, or sooner where sunlight falls directly. Never use a silicone polish.";
const CARE_METAL =
  "Unlacquered brass is intended to darken. If you would rather it did not, wax it twice a year with the cloth supplied.";

export const products: Product[] = [
  /* =========================================================================
     SESTRI — low, horizontal seating.
     ====================================================================== */
  {
    slug: "sestri-sofa",
    name: "Sestri",
    collection: "sestri",
    category: "seating",
    designer: "studio",
    year: 2026,
    typology: "Modular sofa",
    price: 1440000,
    summary:
      "A seat height of 38 centimetres and a back you fall into rather than sit against.",
    description: [
      "Sestri begins with an argument about how low a sofa can be before it stops being useful. Our answer is thirty-eight centimetres: low enough to change how a room is occupied, high enough to stand up from without ceremony.",
      "The frame is kiln-dried beech, mortised and glued rather than stapled, carried on a shallow plinth that lifts the mass just clear of the floor. Seat cushions are a goose-down and polyester-fibre blend over a high-resilience core, so they recover their shape but keep the give. Back cushions are down alone.",
      "Modules combine without a visible join: the plinths bolt together beneath, and the upholstery is cut so the seam falls where two arms meet. Any length can be specified.",
    ],
    variants: [
      { id: "2s", label: "Two seat · 198 cm", priceDelta: -380000, dim: { w: 198, d: 104, h: 64, sh: 38 } },
      { id: "3s", label: "Three seat · 264 cm", priceDelta: 0, dim: { w: 264, d: 104, h: 64, sh: 38 } },
      { id: "3s-deep", label: "Three seat, deep · 264 cm", priceDelta: 165000, dim: { w: 264, d: 122, h: 64, sh: 38 } },
      { id: "chaise", label: "Three seat with chaise · 312 cm", priceDelta: 420000, dim: { w: 312, d: 172, h: 64, sh: 38 } },
    ],
    options: [
      {
        id: "upholstery",
        label: "Upholstery",
        materialIds: ["boucle-chalk", "boucle-ash", "linen-oat", "wool-graphite", "wool-sage", "mohair-clay"],
      },
      { id: "plinth", label: "Plinth", materialIds: ["oak-smoked", "oak-natural", "ash-blackened"] },
    ],
    construction: [
      { label: "Frame", value: "Kiln-dried beech, mortise and tenon" },
      { label: "Suspension", value: "Elasticated webbing, 12 bands" },
      { label: "Seat fill", value: "Goose down and fibre over HR foam core" },
      { label: "Back fill", value: "Goose down, channelled" },
      { label: "Plinth", value: "Solid oak, 40 mm, soap finished" },
      { label: "Covers", value: "Removable, zipped, dry-clean only" },
    ],
    dimensionNote: "Modules combine in 66 cm increments. Bespoke lengths quoted on request.",
    care: CARE_UPHOLSTERY,
    leadTime: "9 weeks",
    images: frames("sestri-sofa", "Sestri sofa", {
      setting: "Three-quarter view, 35mm, camera at 90cm. Afternoon light raking across a plaster wall from frame left. Sofa occupies left two-thirds; keep at least a third of the frame as empty wall. Nothing styled on the sofa except one linen cushion.",
      detail: "Macro of the arm seam where the bouclé meets the oak plinth. 100mm, f/5.6. Shallow but not soft — the loop of the cloth must be legible.",
      context: "Wide 24mm frame of the whole room. Sofa small in frame, placed on the right third. Travertine floor, tall window out of shot casting a hard rectangle of light across the floor toward the sofa.",
    }),
    related: ["sestri-lounge-chair", "sestri-low-table", "alvara-bench"],
    availability: "first-run",
    featured: true,
    render: { form: "sofa", light: "west", wall: "#e8e2d6", floor: "#cfc4ad" },
  },
  {
    slug: "sestri-lounge-chair",
    name: "Sestri Lounge",
    collection: "sestri",
    category: "seating",
    designer: "studio",
    year: 2026,
    typology: "Lounge chair",
    price: 528000,
    summary: "The sofa's geometry reduced to one seat, and a back that cradles rather than supports.",
    description: [
      "Taking a sofa down to a single seat usually produces something apologetic. This keeps the full depth — 104 centimetres — and lets the arms fall away almost entirely, so the chair reads as a cushion resting on a plinth.",
      "It is a chair for reading in, and it has been built accordingly: the back is slightly softer than the sofa's, and the seat slopes two degrees to the rear.",
    ],
    variants: [
      { id: "std", label: "Standard · 96 cm", priceDelta: 0, dim: { w: 96, d: 104, h: 64, sh: 38 } },
      { id: "swivel", label: "On swivel base · 96 cm", priceDelta: 72000, dim: { w: 96, d: 104, h: 66, sh: 40 } },
    ],
    options: [
      {
        id: "upholstery",
        label: "Upholstery",
        materialIds: ["boucle-chalk", "boucle-ash", "wool-sage", "mohair-clay", "leather-cognac", "linen-oat"],
      },
      { id: "plinth", label: "Plinth", materialIds: ["oak-smoked", "oak-natural", "bronze-dark"] },
    ],
    construction: [
      { label: "Frame", value: "Kiln-dried beech" },
      { label: "Seat fill", value: "Goose down and fibre over HR foam" },
      { label: "Back fill", value: "Goose down, soft channel" },
      { label: "Base", value: "Solid oak plinth or bronze swivel" },
      { label: "Covers", value: "Removable, zipped" },
    ],
    care: CARE_UPHOLSTERY,
    leadTime: "8 weeks",
    images: frames("sestri-lounge-chair", "Sestri Lounge chair", {
      setting: "Chair alone against a limestone wall, 50mm, slightly above seat height. One hard shadow from a window frame falling across the seat. Generous space above the chair.",
      detail: "The junction of back cushion, arm and plinth from above at 45°. Show the stitch and the 2mm shadow gap between cushion and oak.",
      context: "Corner of a large room, 28mm. Chair in the far third beside a tall window. Floor dominates the lower half of the frame.",
    }),
    related: ["sestri-sofa", "sestri-ottoman", "oriel-floor-light"],
    availability: "first-run",
    featured: true,
    render: { form: "lounge-chair", light: "north", wall: "#ddd6c7", floor: "#c7bca6" },
  },
  {
    slug: "sestri-ottoman",
    name: "Sestri Ottoman",
    collection: "sestri",
    category: "seating",
    designer: "studio",
    year: 2026,
    typology: "Ottoman",
    price: 236000,
    summary: "A single cushion on a plinth. It works as a footstool, a seat, or a surface.",
    description: [
      "Square in plan, deliberately, so it does not read as an accessory to anything in particular.",
      "The top is firmer than the sofa seat — it has to take a tray.",
    ],
    variants: [
      { id: "sq", label: "Square · 76 × 76 cm", priceDelta: 0, dim: { w: 76, d: 76, h: 38 } },
      { id: "lg", label: "Large · 120 × 76 cm", priceDelta: 84000, dim: { w: 120, d: 76, h: 38 } },
    ],
    options: [
      {
        id: "upholstery",
        label: "Upholstery",
        materialIds: ["boucle-chalk", "boucle-ash", "linen-oat", "wool-graphite", "mohair-clay", "leather-espresso"],
      },
      { id: "plinth", label: "Plinth", materialIds: ["oak-smoked", "oak-natural"] },
    ],
    construction: [
      { label: "Frame", value: "Kiln-dried beech" },
      { label: "Fill", value: "HR foam with fibre wrap" },
      { label: "Plinth", value: "Solid oak, 40 mm" },
      { label: "Covers", value: "Removable, zipped" },
    ],
    care: CARE_UPHOLSTERY,
    leadTime: "7 weeks",
    images: frames("sestri-ottoman", "Sestri ottoman", {
      setting: "Ottoman centred low in frame against a plain wall, 50mm at 60cm height. Soft north light, almost no shadow. Very quiet.",
      detail: "Top corner at 1:1. The piped edge, the stitch, the gap to the oak.",
      context: "Ottoman at the foot of the Sestri Lounge, wide 24mm, both small in a large empty room.",
    }),
    related: ["sestri-lounge-chair", "sestri-sofa", "alvara-side-table"],
    availability: "first-run",
    render: { form: "ottoman", light: "north", wall: "#e4ded1", floor: "#cabfa9" },
  },
  {
    slug: "sestri-low-table",
    name: "Sestri Low Table",
    collection: "sestri",
    category: "tables",
    designer: "studio",
    year: 2026,
    typology: "Low table",
    price: 490000,
    summary: "A stone slab carried on two oak blades, 29 centimetres from the floor.",
    description: [
      "Drawn to sit alongside the sofa at a height that makes a cup reachable from a reclined position. The top is a single piece of travertine, honed, with a 6mm arris on the upper edge so it does not look thick.",
      "The two supports are solid oak, 34mm, set well in from the ends. The overhang is the point: it makes 80 kilograms of stone look as though it is hovering.",
    ],
    variants: [
      { id: "s", label: "Small · 120 × 70 cm", priceDelta: -96000, dim: { w: 120, d: 70, h: 29 } },
      { id: "m", label: "Medium · 160 × 80 cm", priceDelta: 0, dim: { w: 160, d: 80, h: 29 } },
      { id: "l", label: "Large · 200 × 90 cm", priceDelta: 148000, dim: { w: 200, d: 90, h: 29 } },
    ],
    options: [
      { id: "top", label: "Top", materialIds: ["travertine-ivory", "travertine-smoke", "marble-grigio", "limestone-pale"] },
      { id: "base", label: "Supports", materialIds: ["oak-smoked", "oak-natural", "walnut-european"] },
    ],
    construction: [
      { label: "Top", value: "30 mm stone, honed, arrised" },
      { label: "Supports", value: "Solid oak, 34 mm, through-tenoned" },
      { label: "Fixing", value: "Concealed steel plate, no visible hardware" },
      { label: "Weight", value: "78 kg (medium)" },
    ],
    dimensionNote: "Stone is natural; vein and pore pattern vary between pieces and we do not correct for it.",
    care: CARE_STONE,
    leadTime: "10 weeks",
    images: frames("sestri-low-table", "Sestri low table", {
      setting: "Table alone on a pale floor, 50mm, camera at 70cm. Light from the left so the stone edge catches and the underside falls into shadow. Nothing on the table.",
      detail: "Macro of the travertine surface and the arrised edge, raking light to bring up the pores. 100mm.",
      context: "Table in front of the Sestri sofa in a wide 24mm room shot. Table in the lower third.",
    }),
    related: ["sestri-sofa", "alvara-side-table", "alvara-console"],
    availability: "first-run",
    render: { form: "low-table", light: "west", wall: "#e9e3d7", floor: "#d2c7b1" },
  },

  /* =========================================================================
     ALVARA — monolithic stone.
     ====================================================================== */
  {
    slug: "alvara-dining-table",
    name: "Alvara",
    collection: "alvara",
    category: "tables",
    designer: "studio",
    year: 2026,
    typology: "Dining table",
    price: 1860000,
    summary: "Two solid stone plinths, one slab. No fixings visible anywhere on the piece.",
    description: [
      "The least compromising object in the catalogue: three pieces of stone, cut from the same block, assembled dry. The slab sits on the plinths under its own weight — just over four hundred kilograms of it — located by stainless dowels you will never see.",
      "The plinths are positioned so the grain runs continuously from one, up through the top, and down the other. Book-matching a table this size takes a particular block, which is why each one is quoted against the stone available rather than from a list.",
      "It is not a table you move. It is installed.",
    ],
    variants: [
      { id: "220", label: "220 × 100 cm · seats 8", priceDelta: 0, dim: { w: 220, d: 100, h: 74 } },
      { id: "260", label: "260 × 105 cm · seats 10", priceDelta: 310000, dim: { w: 260, d: 105, h: 74 } },
      { id: "300", label: "300 × 110 cm · seats 12", priceDelta: 640000, dim: { w: 300, d: 110, h: 74 } },
    ],
    options: [
      { id: "stone", label: "Stone", materialIds: ["travertine-ivory", "travertine-smoke", "marble-grigio", "limestone-pale"] },
    ],
    construction: [
      { label: "Top", value: "40 mm stone, honed, 10 mm arris" },
      { label: "Plinths", value: "Solid stone, 120 mm, from the same block" },
      { label: "Assembly", value: "Dry-set on stainless dowels" },
      { label: "Weight", value: "415 kg (220 cm)" },
      { label: "Installation", value: "Included. Four-person team." },
    ],
    dimensionNote:
      "Requires a floor rated for point loads. We will ask for a structural note before accepting an order above the second storey.",
    care: CARE_STONE,
    leadTime: "14 weeks",
    images: frames("alvara-dining-table", "Alvara dining table", {
      setting: "Straight-on three-quarter, 50mm at 120cm. One window out of frame left throwing a hard-edged light across the top. Bare table. Deep shadow under the slab.",
      detail: "The joint where plinth meets slab, 1:1. The dry seam must read as a single dark line.",
      context: "Full dining room, 24mm, ceiling included. Table centred but low in frame; most of the picture is wall and light.",
    }),
    related: ["alvara-bench", "alvara-console", "kelvara-sideboard"],
    availability: "first-run",
    featured: true,
    render: { form: "dining-table", light: "west", wall: "#e6dfd2", floor: "#cdc2ab" },
  },
  {
    slug: "alvara-console",
    name: "Alvara Console",
    collection: "alvara",
    category: "tables",
    designer: "studio",
    year: 2026,
    typology: "Console",
    price: 740000,
    summary: "A narrow slab on two blades of stone, for a hall or behind a sofa.",
    description: [
      "The dining table's logic at 36 centimetres deep. At this width the plinths become blades, 70mm thick, and the overhang reaches almost half a metre at each end.",
      "Drawn for a hall, and deep enough for nothing in particular, which is the point of a console.",
    ],
    variants: [
      { id: "160", label: "160 × 36 cm", priceDelta: 0, dim: { w: 160, d: 36, h: 82 } },
      { id: "200", label: "200 × 36 cm", priceDelta: 118000, dim: { w: 200, d: 36, h: 82 } },
    ],
    options: [
      { id: "stone", label: "Stone", materialIds: ["travertine-ivory", "marble-grigio", "travertine-smoke", "limestone-pale"] },
    ],
    construction: [
      { label: "Top", value: "30 mm stone, honed" },
      { label: "Blades", value: "Solid stone, 70 mm" },
      { label: "Assembly", value: "Dry-set on stainless dowels" },
      { label: "Weight", value: "126 kg (160 cm)" },
    ],
    care: CARE_STONE,
    leadTime: "12 weeks",
    images: frames("alvara-console", "Alvara console", {
      setting: "Elevation-adjacent, 85mm, flat on to a plaster wall. Console centred, lit from high left. Shadow of the blades on the floor is half the picture.",
      detail: "End grain of the stone blade at 1:1, raking light.",
      context: "A long empty hallway, 35mm, console on the right wall two-thirds down the corridor.",
    }),
    related: ["alvara-dining-table", "alvara-side-table", "oriel-mirror"],
    availability: "first-run",
    render: { form: "console", light: "north", wall: "#e2dbcd", floor: "#c9bea8" },
  },
  {
    slug: "alvara-side-table",
    name: "Alvara Side",
    collection: "alvara",
    category: "tables",
    designer: "studio",
    year: 2026,
    typology: "Side table",
    price: 298000,
    summary: "One cylinder, turned from a single block. Nothing is joined.",
    description: [
      "Turned rather than cut, from one piece, which is why there is a size limit and why the price is what it is: a 50-centimetre cylinder consumes a block three times its finished volume.",
      "The top is very slightly dished — one millimetre over the diameter — so a glass finds the centre.",
    ],
    variants: [
      { id: "40", label: "Ø 40 × 48 cm", priceDelta: 0, dim: { w: 40, d: 40, h: 48 } },
      { id: "50", label: "Ø 50 × 42 cm", priceDelta: 46000, dim: { w: 50, d: 50, h: 42 } },
    ],
    options: [
      { id: "stone", label: "Stone", materialIds: ["travertine-ivory", "travertine-smoke", "marble-grigio", "limestone-pale"] },
    ],
    construction: [
      { label: "Body", value: "Turned from a single block" },
      { label: "Top", value: "Dished 1 mm, honed" },
      { label: "Base", value: "Felted" },
      { label: "Weight", value: "54 kg (Ø 40)" },
    ],
    care: CARE_STONE,
    leadTime: "11 weeks",
    images: frames("alvara-side-table", "Alvara side table", {
      setting: "Single object, 85mm, centred, lit from one side at 30° so the cylinder renders as a gradient. Mid-grey plaster behind.",
      detail: "The dished top from directly above, filling the frame.",
      context: "Beside the Sestri Lounge in a corner, 35mm, late light.",
    }),
    related: ["alvara-console", "sestri-low-table", "sestri-lounge-chair"],
    availability: "first-run",
    render: { form: "side-table", light: "west", wall: "#ddd5c6", floor: "#c4b9a3" },
  },
  {
    slug: "alvara-bench",
    name: "Alvara Bench",
    collection: "alvara",
    category: "seating",
    designer: "studio",
    year: 2026,
    typology: "Bench",
    price: 560000,
    summary: "Stone blades, a solid oak seat, and a cushion only if you want one.",
    description: [
      "Drawn for the dining table, and the one piece in Alvara that admits a second material. The seat is a single oak board, 50 mm, left thick so it reads as a slab rather than a plank.",
      "An optional loose cushion in any upholstery from our range sits in a 20mm rebate, so it does not slide and does not look added on.",
    ],
    variants: [
      { id: "180", label: "180 cm", priceDelta: 0, dim: { w: 180, d: 38, h: 45 } },
      { id: "220", label: "220 cm", priceDelta: 92000, dim: { w: 220, d: 38, h: 45 } },
    ],
    options: [
      { id: "seat", label: "Seat", materialIds: ["oak-smoked", "oak-natural", "walnut-european"] },
      { id: "blades", label: "Blades", materialIds: ["travertine-ivory", "marble-grigio", "travertine-smoke"] },
      { id: "cushion", label: "Cushion", materialIds: ["linen-oat", "boucle-chalk", "wool-graphite", "leather-cognac"] },
    ],
    construction: [
      { label: "Seat", value: "Solid oak, 50 mm, rebated" },
      { label: "Blades", value: "Solid stone, 60 mm" },
      { label: "Cushion", value: "Loose, 20 mm wool felt core" },
      { label: "Weight", value: "68 kg (180 cm)" },
    ],
    care: CARE_TIMBER,
    leadTime: "11 weeks",
    images: frames("alvara-bench", "Alvara bench", {
      setting: "Flat elevation-like view, 85mm, against plaster. Hard light from above left putting the blade shadows on the floor.",
      detail: "Where the oak seat meets the stone blade — the 20mm rebate and the shadow line.",
      context: "Pushed under the Alvara table, 28mm, whole dining setting, table bare.",
    }),
    related: ["alvara-dining-table", "sestri-ottoman", "kelvara-sideboard"],
    availability: "first-run",
    render: { form: "bench", light: "north", wall: "#e5dfd1", floor: "#cbc0a9" },
  },

  /* =========================================================================
     KELVARA — casegoods in oak and brass.
     ====================================================================== */
  {
    slug: "kelvara-sideboard",
    name: "Kelvara",
    collection: "kelvara",
    category: "storage",
    designer: "studio",
    year: 2026,
    typology: "Sideboard",
    price: 1220000,
    summary: "Solid oak, no handles, and a brass plinth that lifts it 90 millimetres off the floor.",
    description: [
      "The piece that sets out how we build cabinets: solid timber throughout, no veneer on any visible face, drawers on wooden runners, and a carcass housed and glued rather than screwed.",
      "There are no handles. Doors are opened by a finger in a 14 mm rebate along the lower edge, undercut three degrees so a fingertip is drawn in rather than skidding off. It is also why the shadow line under each door is exactly as deep as it is.",
      "Interiors are ash, waxed, with adjustable shelves and a cable route through the back panel.",
    ],
    variants: [
      { id: "180", label: "180 cm · two doors, two drawers", priceDelta: 0, dim: { w: 180, d: 48, h: 72 } },
      { id: "240", label: "240 cm · three doors, two drawers", priceDelta: 290000, dim: { w: 240, d: 48, h: 72 } },
      { id: "300", label: "300 cm · four doors, four drawers", priceDelta: 620000, dim: { w: 300, d: 48, h: 72 } },
    ],
    options: [
      { id: "carcass", label: "Carcass", materialIds: ["oak-natural", "oak-smoked", "walnut-european", "ash-blackened"] },
      { id: "plinth", label: "Plinth", materialIds: ["brass-patinated", "bronze-dark"] },
    ],
    construction: [
      { label: "Carcass", value: "Solid timber, housed and glued, 22 mm" },
      { label: "Doors", value: "Framed and panelled, 20 mm, soft-close" },
      { label: "Drawers", value: "Hand-cut dovetails, oak runners" },
      { label: "Interior", value: "Waxed ash, adjustable shelves" },
      { label: "Plinth", value: "Patinated brass, 90 mm, levelling feet" },
      { label: "Back", value: "Solid, cable aperture" },
    ],
    care: CARE_TIMBER,
    leadTime: "12 weeks",
    images: frames("kelvara-sideboard", "Kelvara sideboard", {
      setting: "Flat on, 85mm, centred on a plaster wall, camera at 90cm. Light from high left so the under-door shadow line and the brass plinth both read. Doors closed. Nothing on top.",
      detail: "The 14mm finger rebate along a door's lower edge, 1:1, raking light. The brass plinth just in frame below.",
      context: "A long wall in a large room, 28mm. Sideboard on the left third, the rest of the frame empty wall and floor.",
    }),
    related: ["kelvara-tall-cabinet", "kelvara-shelving", "alvara-dining-table"],
    availability: "first-run",
    featured: true,
    render: { form: "sideboard", light: "north", wall: "#e7e1d4", floor: "#c9bda6" },
  },
  {
    slug: "kelvara-tall-cabinet",
    name: "Kelvara Tall",
    collection: "kelvara",
    category: "storage",
    designer: "studio",
    year: 2026,
    typology: "Cabinet",
    price: 1380000,
    summary: "Two metres of solid oak with a brass interior you are meant to leave open.",
    description: [
      "A cabinet drawn to be used as a room divider as often as against a wall, which is why the back is finished to the same standard as the front.",
      "The upper section is lined in patinated brass sheet. It changes what the shelves do: glass and ceramics sitting in front of it pick up the metal and go warm. Lit from within, as an optional specification, it stops being storage.",
    ],
    variants: [
      { id: "100", label: "100 cm · two doors", priceDelta: 0, dim: { w: 100, d: 46, h: 200 } },
      { id: "150", label: "150 cm · three doors", priceDelta: 340000, dim: { w: 150, d: 46, h: 200 } },
    ],
    options: [
      { id: "carcass", label: "Carcass", materialIds: ["oak-smoked", "oak-natural", "walnut-european", "ash-blackened"] },
      { id: "lining", label: "Lining", materialIds: ["brass-patinated", "bronze-dark"] },
    ],
    construction: [
      { label: "Carcass", value: "Solid timber, housed and glued, 25 mm" },
      { label: "Doors", value: "Framed and panelled, soft-close, 180° hinge" },
      { label: "Upper interior", value: "Patinated brass sheet, waxed" },
      { label: "Lower interior", value: "Waxed ash, two drawers" },
      { label: "Lighting", value: "Optional. Dimmable 2700 K, wired to a floor outlet." },
      { label: "Back", value: "Fully finished — suitable free-standing" },
    ],
    care: CARE_TIMBER,
    leadTime: "13 weeks",
    images: frames("kelvara-tall-cabinet", "Kelvara tall cabinet", {
      setting: "Flat on, 85mm. One door open to show the brass lining catching light. Tall format — include ceiling cornice or the top of the wall.",
      detail: "Brass lining and a shelf edge, 1:1, with one ceramic object just out of focus.",
      context: "Free-standing as a divider in an open plan room, 24mm, seen from the un-opened side.",
    }),
    related: ["kelvara-sideboard", "kelvara-shelving", "oriel-table-light"],
    availability: "first-run",
    render: { form: "cabinet", light: "west", wall: "#e3dccd", floor: "#c6bba4" },
  },
  {
    slug: "kelvara-shelving",
    name: "Kelvara Shelving",
    collection: "kelvara",
    category: "storage",
    designer: "studio",
    year: 2026,
    typology: "Shelving system",
    price: 1650000,
    summary: "Bronze uprights, oak shelves, and a span that holds without a visible bracket.",
    description: [
      "Four bronze uprights, floor to ceiling or free-standing, carrying solid oak shelves housed into a rebate on each side. The shelf does the structural work; the upright only locates it.",
      "Configurable in 90-centimetre bays to any length and any height up to three metres. Closed boxes, drawers and a drop-front desk module can be specified in any bay.",
    ],
    variants: [
      { id: "2bay", label: "Two bays · 186 cm", priceDelta: 0, dim: { w: 186, d: 36, h: 220 } },
      { id: "3bay", label: "Three bays · 278 cm", priceDelta: 490000, dim: { w: 278, d: 36, h: 220 } },
      { id: "4bay", label: "Four bays · 370 cm", priceDelta: 980000, dim: { w: 370, d: 36, h: 220 } },
    ],
    options: [
      { id: "shelves", label: "Shelves", materialIds: ["oak-natural", "oak-smoked", "walnut-european", "ash-blackened"] },
      { id: "uprights", label: "Uprights", materialIds: ["bronze-dark", "brass-patinated"] },
    ],
    construction: [
      { label: "Uprights", value: "Dark bronze, 30 × 30 mm, adjustable feet" },
      { label: "Shelves", value: "Solid timber, 32 mm, rebated both ends" },
      { label: "Span", value: "900 mm clear, rated 60 kg per shelf" },
      { label: "Modules", value: "Closed box, two-drawer, drop-front desk" },
      { label: "Fixing", value: "Free-standing, or wall-restrained above 2.2 m" },
    ],
    dimensionNote: "Heights above 2.4 m require a wall restraint at the top of each upright.",
    care: CARE_TIMBER,
    leadTime: "13 weeks",
    images: frames("kelvara-shelving", "Kelvara shelving", {
      setting: "Flat on, 50mm, filling the frame. Sparsely filled — books on two shelves only, one ceramic, nothing else. Side light picks up the bronze edge.",
      detail: "The rebate where a shelf enters an upright, 1:1. Show the 1mm reveal.",
      context: "Across a whole wall in a tall room, 24mm, with a chair in the foreground out of focus.",
    }),
    related: ["kelvara-sideboard", "kelvara-desk", "kelvara-tall-cabinet"],
    availability: "first-run",
    render: { form: "shelving", light: "north", wall: "#e5dfd2", floor: "#c8bda6" },
  },
  {
    slug: "kelvara-desk",
    name: "Kelvara Desk",
    collection: "kelvara",
    category: "tables",
    designer: "studio",
    year: 2026,
    typology: "Desk",
    price: 890000,
    summary: "A leather writing surface, a brass cable channel, and two drawers that close without a sound.",
    description: [
      "The most particular piece in Kelvara. The top is oak with a recessed panel of saddle leather, 3.2 mm, let in flush. Behind it a brass channel runs the full width and takes cable away to a single exit at one leg.",
      "Drawers are hand-dovetailed and run on oak, which means they get better rather than worse. There is no lock, deliberately.",
    ],
    variants: [
      { id: "160", label: "160 × 72 cm", priceDelta: 0, dim: { w: 160, d: 72, h: 74 } },
      { id: "190", label: "190 × 80 cm", priceDelta: 136000, dim: { w: 190, d: 80, h: 74 } },
    ],
    options: [
      { id: "carcass", label: "Frame", materialIds: ["oak-smoked", "oak-natural", "walnut-european"] },
      { id: "writing", label: "Writing surface", materialIds: ["leather-cognac", "leather-espresso", "wool-graphite"] },
      { id: "metal", label: "Channel", materialIds: ["brass-patinated", "bronze-dark"] },
    ],
    construction: [
      { label: "Frame", value: "Solid timber, 28 mm, draw-bored" },
      { label: "Top", value: "Oak with flush-let leather panel" },
      { label: "Cable channel", value: "Patinated brass, full width, single exit" },
      { label: "Drawers", value: "Two, hand dovetailed, oak runners" },
      { label: "Levelling", value: "Concealed, ±8 mm" },
    ],
    care: "Oil the timber annually. Feed the leather with the balm supplied every six months; it will darken where you rest your arm, which is the intention.",
    leadTime: "12 weeks",
    images: frames("kelvara-desk", "Kelvara desk", {
      setting: "Three-quarter, 50mm, at 110cm. Window light from the left across the leather. One notebook and nothing else. Chair out of frame.",
      detail: "The flush join between oak and leather and the brass channel behind, 1:1, raking light.",
      context: "Desk facing a window in a quiet room, 28mm, seen from behind at an angle. Mostly wall and light.",
    }),
    related: ["kelvara-shelving", "sestri-lounge-chair", "oriel-table-light"],
    availability: "first-run",
    render: { form: "desk", light: "west", wall: "#e8e2d5", floor: "#cbc0a9" },
  },

  /* =========================================================================
     NOCTIS — the bedroom.
     ====================================================================== */
  {
    slug: "noctis-bed",
    name: "Noctis",
    collection: "noctis",
    category: "beds",
    designer: "studio",
    year: 2026,
    typology: "Bed",
    price: 1170000,
    summary: "A headboard you can lean against for an hour, on a base that disappears.",
    description: [
      "The brief was a headboard that works without a pillow behind it. The answer is 14 centimetres of layered fill over a sprung plywood panel, raked back four degrees, with a soft roll at the top edge.",
      "The base is deliberately recessive: upholstered in the same cloth, set back 40mm on all sides, carried on low bronze feet so there is a shadow under the whole piece. From across a room the bed reads as a headboard and a mattress, which is the point.",
      "Covers are fully removable, including the headboard, which is unusual at this scale and the reason for the concealed zip along the lower rail.",
    ],
    variants: [
      { id: "160", label: "Double · 160 × 200 cm", priceDelta: 0, dim: { w: 178, d: 218, h: 108 } },
      { id: "180", label: "King · 180 × 200 cm", priceDelta: 94000, dim: { w: 198, d: 218, h: 108 } },
      { id: "200", label: "Super king · 200 × 200 cm", priceDelta: 186000, dim: { w: 218, d: 218, h: 108 } },
    ],
    options: [
      {
        id: "upholstery",
        label: "Upholstery",
        materialIds: ["linen-oat", "boucle-chalk", "boucle-ash", "wool-sage", "wool-graphite", "mohair-clay"],
      },
      { id: "feet", label: "Feet", materialIds: ["bronze-dark", "brass-patinated"] },
      { id: "storage", label: "Base", materialIds: ["oak-natural", "oak-smoked"] },
    ],
    construction: [
      { label: "Headboard", value: "Sprung plywood panel, 140 mm layered fill, 4° rake" },
      { label: "Base", value: "Beech frame, upholstered, recessed 40 mm" },
      { label: "Slats", value: "Sprung beech, 28 slats, centre rail" },
      { label: "Feet", value: "Dark bronze, 70 mm" },
      { label: "Covers", value: "Fully removable including headboard" },
      { label: "Mattress", value: "Not included. 180 – 240 mm depth suits the proportion." },
    ],
    dimensionNote: "Overall width is mattress width plus 18 cm. Headboard height is 108 cm from floor.",
    care: CARE_UPHOLSTERY,
    leadTime: "10 weeks",
    images: frames("noctis-bed", "Noctis bed", {
      setting: "Three-quarter from the foot, 35mm at 120cm. Early light from the left. Bed made plainly — flat linen, no decorative cushions. Headboard must read as thick and soft.",
      detail: "The soft roll at the top edge of the headboard, 1:1, with the stitch line and the cloth's weave.",
      context: "Whole bedroom, 24mm, bed on the right, most of the frame empty wall with one hard rectangle of window light.",
    }),
    related: ["noctis-nightstand", "noctis-daybed", "noctis-dressing-bench"],
    availability: "first-run",
    featured: true,
    render: { form: "bed", light: "low", wall: "#e4ded0", floor: "#c7bca5" },
  },
  {
    slug: "noctis-nightstand",
    name: "Noctis Nightstand",
    collection: "noctis",
    category: "storage",
    designer: "studio",
    year: 2026,
    typology: "Nightstand",
    price: 324000,
    summary: "One drawer, an open shelf, and a stone top that stays cool.",
    description: [
      "Sized to the bed rather than to a convention: 52 centimetres wide, 46 deep, and 56 high — a little above mattress level, so the top is reachable without sitting up.",
      "The top is stone because a glass of water should not leave a ring. Below it, one dovetailed drawer, and beneath that an open bay deep enough for a book you are halfway through.",
    ],
    variants: [
      { id: "std", label: "52 × 46 cm", priceDelta: 0, dim: { w: 52, d: 46, h: 56 } },
      { id: "wide", label: "72 × 46 cm", priceDelta: 58000, dim: { w: 72, d: 46, h: 56 } },
    ],
    options: [
      { id: "carcass", label: "Carcass", materialIds: ["oak-natural", "oak-smoked", "walnut-european", "ash-blackened"] },
      { id: "top", label: "Top", materialIds: ["travertine-ivory", "marble-grigio", "limestone-pale"] },
    ],
    construction: [
      { label: "Carcass", value: "Solid timber, housed, 20 mm" },
      { label: "Top", value: "20 mm stone, honed, flush-set" },
      { label: "Drawer", value: "Hand dovetailed, oak runners, push-open" },
      { label: "Feet", value: "Dark bronze, 60 mm" },
    ],
    care: CARE_STONE,
    leadTime: "9 weeks",
    images: frames("noctis-nightstand", "Noctis nightstand", {
      setting: "Flat on, 85mm, at 70cm. Low warm light from the right. One book on the shelf, nothing on the top.",
      detail: "Where the stone top meets the timber carcass, 1:1 — the flush set and the 0.5mm reveal.",
      context: "Beside the Noctis bed, 35mm, early light, bed partly in frame and out of focus.",
    }),
    related: ["noctis-bed", "oriel-table-light", "noctis-dressing-bench"],
    availability: "first-run",
    render: { form: "nightstand", light: "low", wall: "#e0dacc", floor: "#c4b9a2" },
  },
  {
    slug: "noctis-daybed",
    name: "Noctis Daybed",
    collection: "noctis",
    category: "beds",
    designer: "studio",
    year: 2026,
    typology: "Daybed",
    price: 940000,
    summary: "A single bolster, a flat mattress, and a frame that stops at the edge of the cloth.",
    description: [
      "Drawn for a dressing room, and equally at home in a study. One bolster, held by nothing at all — the mattress is firm enough and cut deep enough that it simply stays where it is put.",
      "The frame is 30mm bronze, which is slender for the span. It is also the reason the daybed can be lifted by two people.",
    ],
    variants: [
      { id: "190", label: "190 × 86 cm", priceDelta: 0, dim: { w: 190, d: 86, h: 62, sh: 40 } },
      { id: "210", label: "210 × 96 cm", priceDelta: 112000, dim: { w: 210, d: 96, h: 62, sh: 40 } },
    ],
    options: [
      {
        id: "upholstery",
        label: "Upholstery",
        materialIds: ["linen-oat", "boucle-chalk", "wool-sage", "mohair-clay", "wool-graphite", "leather-cognac"],
      },
      { id: "frame", label: "Frame", materialIds: ["bronze-dark", "brass-patinated"] },
    ],
    construction: [
      { label: "Frame", value: "Dark bronze, 30 mm section, welded and dressed" },
      { label: "Mattress", value: "HR foam with wool wrap, 140 mm" },
      { label: "Bolster", value: "One, 200 mm diameter, loose" },
      { label: "Covers", value: "Removable, zipped" },
      { label: "Weight", value: "38 kg" },
    ],
    care: CARE_UPHOLSTERY,
    leadTime: "9 weeks",
    images: frames("noctis-daybed", "Noctis daybed", {
      setting: "Flat on, 50mm, at 70cm, against a plaster wall. One bolster at the left end. Afternoon light from high right.",
      detail: "The bolster end and its seam against the mattress edge, 1:1.",
      context: "In a bay window, 28mm, three-quarter, strong backlight — the daybed near-silhouette.",
    }),
    related: ["noctis-bed", "sestri-ottoman", "oriel-floor-light"],
    availability: "first-run",
    render: { form: "daybed", light: "west", wall: "#e6e0d2", floor: "#cac0a8" },
  },
  {
    slug: "noctis-dressing-bench",
    name: "Noctis Bench",
    collection: "noctis",
    category: "seating",
    designer: "studio",
    year: 2026,
    typology: "Dressing bench",
    price: 285000,
    summary: "For the end of a bed. Low, long, and soft enough to sit on while you do something else.",
    description: [
      "Forty-two centimetres high so it clears a mattress and does not obstruct a drawer. The top is a single cushion, piped, on a bronze frame with a webbed deck.",
      "The least complicated thing in the catalogue, and the proportions took the longest.",
    ],
    variants: [
      { id: "140", label: "140 cm", priceDelta: 0, dim: { w: 140, d: 42, h: 42 } },
      { id: "170", label: "170 cm", priceDelta: 48000, dim: { w: 170, d: 42, h: 42 } },
    ],
    options: [
      {
        id: "upholstery",
        label: "Upholstery",
        materialIds: ["boucle-chalk", "linen-oat", "wool-sage", "mohair-clay", "leather-cognac", "wool-graphite"],
      },
      { id: "frame", label: "Frame", materialIds: ["bronze-dark", "brass-patinated"] },
    ],
    construction: [
      { label: "Frame", value: "Dark bronze, 25 mm section" },
      { label: "Deck", value: "Elasticated webbing" },
      { label: "Cushion", value: "HR foam with fibre wrap, piped" },
      { label: "Covers", value: "Removable, zipped" },
    ],
    care: CARE_UPHOLSTERY,
    leadTime: "8 weeks",
    images: frames("noctis-dressing-bench", "Noctis dressing bench", {
      setting: "Flat on, 85mm, at 60cm. Plain wall. Light from above left so the pipe detail catches along the top edge.",
      detail: "Piped corner where two seams meet, 1:1.",
      context: "At the foot of the Noctis bed, 35mm, whole room, morning.",
    }),
    related: ["noctis-bed", "sestri-ottoman", "alvara-bench"],
    availability: "first-run",
    render: { form: "bench", light: "north", wall: "#e2dccf", floor: "#c6bba4" },
  },

  /* =========================================================================
     ORIEL — light and objects.
     ====================================================================== */
  {
    slug: "oriel-floor-light",
    name: "Oriel Floor",
    collection: "oriel",
    category: "lighting",
    designer: "studio",
    year: 2026,
    typology: "Floor light",
    price: 368000,
    summary: "A brass disc on a slender stem. It lights the ceiling, and the room gets the rest.",
    description: [
      "Drawn to produce no visible source from a seated position. The shade is a shallow brass dish, 42 centimetres across, facing up; the LED sits in the base of the dish behind a baffle.",
      "The result is a room lit indirectly, with the warm cast of brass in it. At full output it will light a four-metre room on its own. At ten per cent it does something quite different.",
      "Dimming is by a brass dial on the stem at hand height, not a foot switch.",
    ],
    variants: [
      { id: "180", label: "180 cm", priceDelta: 0, dim: { w: 42, d: 42, h: 180 } },
      { id: "210", label: "210 cm", priceDelta: 42000, dim: { w: 42, d: 42, h: 210 } },
    ],
    options: [
      { id: "metal", label: "Metal", materialIds: ["brass-patinated", "bronze-dark"] },
      { id: "base", label: "Base", materialIds: ["marble-grigio", "travertine-ivory", "limestone-pale"] },
    ],
    construction: [
      { label: "Shade", value: "Spun brass dish, Ø 420 mm, baffled" },
      { label: "Stem", value: "Ø 18 mm, patinated brass" },
      { label: "Base", value: "Solid stone, Ø 260 mm, 9 kg" },
      { label: "Light source", value: "Integrated LED, 2700 K, CRI 97, 2,100 lm" },
      { label: "Control", value: "Brass dial on stem, 1 – 100%" },
      { label: "Cable", value: "3 m braided, in body colour" },
    ],
    care: CARE_METAL,
    leadTime: "8 weeks",
    images: frames("oriel-floor-light", "Oriel floor light", {
      setting: "Full height portrait, 50mm, against plaster, lit on. Room otherwise dim so the ceiling wash is visible. The source itself must not be visible.",
      detail: "The brass dial on the stem at 1:1, with the patina legible.",
      context: "Beside the Sestri Lounge at dusk, 35mm, the light the only source in frame.",
    }),
    related: ["oriel-pendant", "oriel-table-light", "sestri-lounge-chair"],
    availability: "first-run",
    featured: true,
    render: { form: "floor-light", light: "low", wall: "#ddd6c6", floor: "#c0b59f" },
  },
  {
    slug: "oriel-pendant",
    name: "Oriel Pendant",
    collection: "oriel",
    category: "lighting",
    designer: "studio",
    year: 2026,
    typology: "Pendant",
    price: 274000,
    summary: "The same dish, inverted, hung low over a table.",
    description: [
      "Over a dining table the dish turns over and becomes a direct light with a very soft edge, because the inside of the shade is brushed rather than polished.",
      "A line of three over the 260-centimetre Alvara is the arrangement it was drawn for.",
    ],
    variants: [
      { id: "42", label: "Ø 42 cm", priceDelta: 0, dim: { w: 42, d: 42, h: 16 } },
      { id: "60", label: "Ø 60 cm", priceDelta: 68000, dim: { w: 60, d: 60, h: 20 } },
    ],
    options: [{ id: "metal", label: "Metal", materialIds: ["brass-patinated", "bronze-dark"] }],
    construction: [
      { label: "Shade", value: "Spun brass dish, brushed interior" },
      { label: "Suspension", value: "Braided cable, 3 m, field-shortened" },
      { label: "Light source", value: "Integrated LED, 2700 K, CRI 97, 1,450 lm" },
      { label: "Control", value: "Dimmable, TRIAC or DALI" },
      { label: "Canopy", value: "Ø 90 mm, matching finish" },
    ],
    dimensionNote: "Hang at 70 – 80 cm above a table top. We will set the drop on installation.",
    care: CARE_METAL,
    leadTime: "7 weeks",
    images: frames("oriel-pendant", "Oriel pendant", {
      setting: "Single pendant against plaster, 85mm, lit, hung at frame centre with a lot of empty space above and below.",
      detail: "The brushed interior of the shade from below at 1:1, light on.",
      context: "Three in a line over the Alvara table, 35mm, evening, the only light in the room.",
    }),
    related: ["oriel-floor-light", "alvara-dining-table", "oriel-table-light"],
    availability: "first-run",
    render: { form: "pendant", light: "low", wall: "#d9d2c2", floor: "#bdb29c" },
  },
  {
    slug: "oriel-table-light",
    name: "Oriel Table",
    collection: "oriel",
    category: "lighting",
    designer: "studio",
    year: 2026,
    typology: "Table light",
    price: 196000,
    summary: "A stone cylinder, a brass sleeve, and a pool of light about a metre across.",
    description: [
      "The smallest Oriel, and the only one with no visible stem. A turned stone cylinder holds the LED; a brass sleeve slides over it, and how far you slide it decides how wide the pool of light is.",
      "There is no switch. Rotating the sleeve dims it.",
    ],
    variants: [{ id: "std", label: "Ø 14 × 32 cm", priceDelta: 0, dim: { w: 14, d: 14, h: 32 } }],
    options: [
      { id: "stone", label: "Body", materialIds: ["travertine-ivory", "marble-grigio", "limestone-pale"] },
      { id: "metal", label: "Sleeve", materialIds: ["brass-patinated", "bronze-dark"] },
    ],
    construction: [
      { label: "Body", value: "Turned solid stone, Ø 140 mm" },
      { label: "Sleeve", value: "Patinated brass, sliding and rotating" },
      { label: "Light source", value: "Integrated LED, 2700 K, CRI 97, 480 lm" },
      { label: "Control", value: "Rotate sleeve to dim. No switch." },
      { label: "Cable", value: "2 m braided" },
    ],
    care: CARE_METAL,
    leadTime: "7 weeks",
    images: frames("oriel-table-light", "Oriel table light", {
      setting: "Single object, 100mm, on a stone surface against a dark plaster wall, lit. The pool of light on the surface is the subject.",
      detail: "The gap between brass sleeve and stone body at 1:1, light escaping through it.",
      context: "On the Noctis nightstand at night, 35mm, bed out of focus behind.",
    }),
    related: ["oriel-floor-light", "noctis-nightstand", "oriel-pendant"],
    availability: "first-run",
    render: { form: "table-light", light: "low", wall: "#d4cdbd", floor: "#b8ad97" },
  },
  {
    slug: "oriel-mirror",
    name: "Oriel Mirror",
    collection: "oriel",
    category: "objects",
    designer: "studio",
    year: 2026,
    typology: "Mirror",
    price: 432000,
    summary: "Bronze mirror glass in a brass reveal, leaning or fixed.",
    description: [
      "The glass is bronze-tinted, which means a room reflected in it is warmer and about a stop darker than the room you are standing in. It flatters a north-facing wall.",
      "A 20-millimetre brass reveal runs the full perimeter and stands proud of the glass, so the mirror holds a shadow at its edge. Supplied with both a leaning foot and a concealed wall cleat.",
    ],
    variants: [
      { id: "90", label: "90 × 180 cm", priceDelta: 0, dim: { w: 90, d: 4, h: 180 } },
      { id: "120", label: "120 × 200 cm", priceDelta: 124000, dim: { w: 120, d: 4, h: 200 } },
    ],
    options: [{ id: "metal", label: "Reveal", materialIds: ["brass-patinated", "bronze-dark"] }],
    construction: [
      { label: "Glass", value: "6 mm bronze-tinted, copper-free silvered" },
      { label: "Reveal", value: "Patinated brass, 20 mm, proud of glass" },
      { label: "Back", value: "Oak-faced, finished" },
      { label: "Mounting", value: "Leaning foot and concealed cleat both supplied" },
      { label: "Weight", value: "31 kg (90 cm)" },
    ],
    care: "Clean with a dry microfibre only. Bronze glass marks with ammonia, so no glass cleaner.",
    leadTime: "9 weeks",
    images: frames("oriel-mirror", "Oriel mirror", {
      setting: "Leaning against a plaster wall, 50mm, shot from a slight angle so the reflection is wall and light rather than the camera. Brass reveal catching light along one edge.",
      detail: "The brass reveal standing proud of the glass, 1:1, with the shadow it throws.",
      context: "In a hall above the Alvara console, 35mm, reflecting a lit doorway.",
    }),
    related: ["oriel-floor-light", "alvara-console", "kelvara-tall-cabinet"],
    availability: "first-run",
    render: { form: "mirror", light: "north", wall: "#dfd8c9", floor: "#c3b8a2" },
  },
];

/* ---------------------------------------------------------------------------
   Accessors
--------------------------------------------------------------------------- */

export const productMap: Record<string, Product> = Object.fromEntries(
  products.map((p) => [p.slug, p]),
);

export function productBySlug(slug: string): Product | undefined {
  return productMap[slug];
}

export function productsByCollection(collectionId: string): Product[] {
  return products.filter((p) => p.collection === collectionId);
}

export function featuredProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function relatedProducts(slug: string): Product[] {
  const p = productBySlug(slug);
  if (!p) return [];
  return p.related.map((s) => productMap[s]).filter((x): x is Product => Boolean(x));
}

/** Lowest and highest price across every variant of a product. */
export function priceRange(p: Product): { min: number; max: number } {
  const prices = p.variants.map((v) => p.price + v.priceDelta);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function variantPrice(p: Product, variantId: string): number {
  const v = p.variants.find((x) => x.id === variantId) ?? p.variants[0];
  return p.price + v.priceDelta;
}

/** Every material id referenced by any product option, de-duplicated. */
export function referencedMaterialIds(): string[] {
  const set = new Set<string>();
  for (const p of products) for (const g of p.options) for (const m of g.materialIds) set.add(m);
  return [...set];
}
