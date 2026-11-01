/**
 * Parametric furniture forms, defined in centimetres.
 *
 * Each form is a function of the piece's real dimensions and returns a list of
 * parts. The same part list drives both the axonometric scene render and the
 * orthographic elevation drawing, so a drawing can never disagree with a photo.
 *
 * Coordinate space, all centimetres:
 *   x  left  → right   (across the width)
 *   z  front → back     (across the depth)
 *   y  floor → up       (height)
 *
 * role    which material the part takes from the product's option groups
 * shape   box (default) | cyl (vertical cylinder) | disc (horizontal disc)
 * r       corner radius, cm — soft parts only
 * tint    multiplier on lightness, for bed linen and interiors
 */

const box = (x, z, y, w, d, h, role, extra = {}) => ({ x, z, y, w, d, h, role, ...extra });

/* -- Seating ------------------------------------------------------------- */

function sofa({ W, D, H, SH = 38 }) {
  const plinth = 9;
  const arm = Math.min(20, W * 0.09);
  const backD = Math.max(20, D * 0.22);
  const seatW = W - arm * 2;
  const n = W > 230 ? 3 : W > 170 ? 2 : 1;
  const cw = seatW / n;
  const parts = [box(0, 0, 0, W, D, plinth, "plinth", { ao: true })];
  // back cushions first — they sit furthest from the camera
  for (let i = 0; i < n; i++) {
    parts.push(box(arm + i * cw + 0.6, D - backD, SH - 4, cw - 1.2, backD - 4, H - SH + 2, "uph", { r: 8 }));
  }
  for (let i = 0; i < n; i++) {
    parts.push(box(arm + i * cw + 0.6, 5, plinth, cw - 1.2, D - backD - 5, SH - plinth, "uph", { r: 5 }));
  }
  // arms last — front-most and outermost
  parts.push(box(0, 0, plinth, arm, D, H - plinth - 18, "uph", { r: 7 }));
  parts.push(box(W - arm, 0, plinth, arm, D, H - plinth - 18, "uph", { r: 7 }));
  return parts;
}

function loungeChair({ W, D, H, SH = 38 }) {
  const plinth = 9;
  const arm = 13;
  const backD = Math.max(20, D * 0.22);
  return [
    box(0, 0, 0, W, D, plinth, "plinth", { ao: true }),
    box(arm, D - backD, SH - 4, W - arm * 2, backD - 4, H - SH + 2, "uph", { r: 9 }),
    box(arm, 5, plinth, W - arm * 2, D - backD - 5, SH - plinth, "uph", { r: 5 }),
    box(0, 0, plinth, arm, D, H - plinth - 22, "uph", { r: 7 }),
    box(W - arm, 0, plinth, arm, D, H - plinth - 22, "uph", { r: 7 }),
  ];
}

function ottoman({ W, D, H }) {
  const plinth = 9;
  return [
    box(0, 0, 0, W, D, plinth, "plinth", { ao: true }),
    box(0.5, 0.5, plinth, W - 1, D - 1, H - plinth, "uph", { r: 5 }),
  ];
}

function bench({ W, D, H }) {
  const blade = 6;
  const seat = 5;
  const inset = Math.min(22, W * 0.1);
  return [
    box(inset, 2, 0, blade, D - 4, H - seat, "blades", { ao: true }),
    box(W - inset - blade, 2, 0, blade, D - 4, H - seat, "blades", { ao: true }),
    box(0, 0, H - seat, W, D, seat, "seat"),
    box(3, 2, H, W - 6, D - 4, 4, "cushion", { r: 2 }),
  ];
}

function daybed({ W, D, H, SH = 40 }) {
  const leg = 3;
  const mat = 14;
  return [
    box(2, D - 2 - leg, 0, leg, leg, SH - mat, "frame"),
    box(W - 2 - leg, D - 2 - leg, 0, leg, leg, SH - mat, "frame"),
    box(2, 2, 0, leg, leg, SH - mat, "frame", { ao: true }),
    box(W - 2 - leg, 2, 0, leg, leg, SH - mat, "frame", { ao: true }),
    box(2, 2, SH - mat - leg, W - 4, D - 4, leg, "frame"),
    box(1, 1, SH - mat, W - 2, D - 2, mat, "uph", { r: 3 }),
    { x: 4, z: D / 2 - 10, y: SH, w: 20, d: 20, h: W * 0.42, role: "uph", shape: "bolster", r: 10 },
  ];
}

/* -- Tables -------------------------------------------------------------- */

function lowTable({ W, D, H }) {
  const top = 3;
  const blade = 3.4;
  const inset = Math.min(26, W * 0.14);
  return [
    box(inset, 8, 0, blade, D - 16, H - top, "base", { ao: true }),
    box(W - inset - blade, 8, 0, blade, D - 16, H - top, "base", { ao: true }),
    box(0, 0, H - top, W, D, top, "top"),
  ];
}

function diningTable({ W, D, H }) {
  const top = 4;
  const plinth = 12;
  const inset = Math.min(34, W * 0.14);
  return [
    box(inset, D * 0.12, 0, plinth, D * 0.76, H - top, "stone", { ao: true }),
    box(W - inset - plinth, D * 0.12, 0, plinth, D * 0.76, H - top, "stone", { ao: true }),
    box(0, 0, H - top, W, D, top, "stone"),
  ];
}

function consoleTable({ W, D, H }) {
  const top = 3;
  const blade = 7;
  const inset = Math.min(20, W * 0.1);
  return [
    box(inset, 2, 0, blade, D - 4, H - top, "stone", { ao: true }),
    box(W - inset - blade, 2, 0, blade, D - 4, H - top, "stone", { ao: true }),
    box(0, 0, H - top, W, D, top, "stone"),
  ];
}

function sideTable({ W, D, H }) {
  return [{ x: 0, z: 0, y: 0, w: W, d: D, h: H, role: "stone", shape: "cyl", ao: true }];
}

function desk({ W, D, H }) {
  const top = 4;
  const leg = 6;
  const inset = 6;
  return [
    box(inset, D - inset - leg, 0, leg, leg, H - top, "carcass"),
    box(W - inset - leg, D - inset - leg, 0, leg, leg, H - top, "carcass"),
    box(inset, inset, 0, leg, leg, H - top, "carcass", { ao: true }),
    box(W - inset - leg, inset, 0, leg, leg, H - top, "carcass", { ao: true }),
    box(W * 0.1, D - 14, H - top - 14, W * 0.44, 10, 14, "carcass"),
    box(0, 0, H - top, W, D, top, "carcass"),
    box(W * 0.1, D * 0.16, H - 0.6, W * 0.8, D * 0.58, 0.6, "writing", { topOnly: true }),
    box(W * 0.06, D - 8, H, W * 0.88, 5, 1.2, "metal"),
  ];
}

/* -- Storage ------------------------------------------------------------- */

function sideboard({ W, D, H }) {
  const plinth = 9;
  const body = H - plinth;
  const doors = W > 270 ? 4 : W > 220 ? 3 : 2;
  const parts = [
    box(5, 3, 0, W - 10, D - 6, plinth, "plinth", { ao: true }),
    box(0, 0, plinth, W, D, body, "carcass"),
    // the 14mm finger rebate, read as a shadow line
    box(0.8, -0.4, plinth + 2.8, W - 1.6, 0.5, 1.4, "reveal", { flat: true }),
  ];
  for (let i = 1; i < doors; i++) {
    parts.push(box((W / doors) * i - 0.25, -0.4, plinth + 2, 0.5, 0.5, body - 4, "reveal", { flat: true }));
  }
  parts.push(box(0.8, -0.4, H - 22, W - 1.6, 0.5, 0.5, "reveal", { flat: true }));
  return parts;
}

function cabinet({ W, D, H }) {
  const plinth = 9;
  const body = H - plinth;
  const doors = W > 130 ? 3 : 2;
  const parts = [
    box(5, 3, 0, W - 10, D - 6, plinth, "plinth", { ao: true }),
    box(0, 0, plinth, W, D, body, "carcass"),
  ];
  // one bay standing open on the brass lining
  const bw = W / doors;
  parts.push(box(0.6, -0.3, plinth + 2, bw - 1.2, 0.3, body - 4, "dark", { flat: true }));
  parts.push(box(1.6, -0.2, plinth + 3.2, bw - 3.2, 0.2, body - 6.4, "lining", { flat: true }));
  for (let i = 1; i <= 2; i++) {
    parts.push(box(1.6, -0.1, plinth + (body / 3) * i, bw - 3.2, 2.4, 1.6, "carcass"));
  }
  for (let i = 1; i < doors; i++) {
    parts.push(box(bw * i - 0.25, -0.4, plinth + 2, 0.5, 0.5, body - 4, "reveal", { flat: true }));
  }
  parts.push(box(bw + 0.8, -0.4, plinth + 2.8, W - bw - 1.6, 0.5, 1.4, "reveal", { flat: true }));
  return parts;
}

function shelving({ W, D, H }) {
  const up = 3;
  const sh = 3.2;
  const bays = Math.max(2, Math.round(W / 93));
  const parts = [];
  const levels = Math.max(4, Math.round(H / 44));
  for (let j = 0; j < levels; j++) {
    const y = (H - sh) * (j / (levels - 1));
    parts.push(box(0, 0, y, W, D, sh, "shelves", { ao: j === 0 }));
  }
  // two sparse stacks, for scale
  const lv = (H - sh) / (levels - 1);
  parts.push(box(W * 0.08, D * 0.3, lv + sh, 22, D * 0.5, 24, "dark"));
  parts.push(box(W * 0.56, D * 0.3, lv * 3 + sh, 16, D * 0.45, 18, "dark"));
  // uprights last — they read as continuous verticals across the shelves
  for (let i = 0; i <= bays; i++) {
    const x = Math.min(W - up, (W / bays) * i - (i === 0 ? 0 : up / 2));
    parts.push(box(x, 1, 0, up, D - 2, H, "uprights"));
  }
  return parts;
}

function nightstand({ W, D, H }) {
  const foot = 6;
  const top = 2.5;
  const body = H - foot - top;
  return [
    box(3, D - 6, 0, 3, 3, foot, "feet"),
    box(W - 6, D - 6, 0, 3, 3, foot, "feet"),
    box(3, 3, 0, 3, 3, foot, "feet", { ao: true }),
    box(W - 6, 3, 0, 3, 3, foot, "feet", { ao: true }),
    box(0, 0, foot, W, D, body, "carcass"),
    box(1.2, -0.3, foot + 1.2, W - 2.4, 0.4, body * 0.42, "dark", { flat: true }),
    box(1.2, -0.4, foot + body * 0.62, W - 2.4, 0.5, 0.5, "reveal", { flat: true }),
    box(0, 0, foot + body, W, D, top, "top"),
  ];
}

/* -- Beds ---------------------------------------------------------------- */

function bed({ W, D, H }) {
  const baseH = 28;
  const hbT = 14;
  const foot = 7;
  const matH = 24;
  return [
    // headboard first — it is the furthest plane from the camera
    box(0, D - hbT, 0, W, hbT, H, "uph", { r: 5 }),
    box(5, 5, 0, 5, 5, foot, "feet", { ao: true }),
    box(W - 10, 5, 0, 5, 5, foot, "feet", { ao: true }),
    box(4, 4, foot, W - 8, D - 8, baseH, "uph"),
    box(9, 9, foot + baseH, W - 18, D - hbT - 14, matH, "uph", { r: 2, tint: 1.05 }),
    // flat linen, turned back
    box(8, 7, foot + baseH + matH - 1, W - 16, D - hbT - 50, 3, "uph", { r: 1, tint: 1.1 }),
    // pillows
    box(W * 0.1, D - hbT - 24, foot + baseH + matH, W * 0.36, 20, 11, "uph", { r: 6, tint: 1.14 }),
    box(W * 0.54, D - hbT - 24, foot + baseH + matH, W * 0.36, 20, 11, "uph", { r: 6, tint: 1.14 }),
  ];
}

/* -- Lighting & objects -------------------------------------------------- */

function floorLight({ W, H }) {
  return [
    { x: W / 2 - 13, z: W / 2 - 13, y: 0, w: 26, d: 26, h: 4, role: "base", shape: "cyl", ao: true },
    { x: W / 2 - 0.9, z: W / 2 - 0.9, y: 4, w: 1.8, d: 1.8, h: H - 9, role: "metal", shape: "cyl" },
    { x: 0, z: 0, y: H - 5, w: W, d: W, h: 5, role: "metal", shape: "disc", emit: "up" },
  ];
}

function pendant({ W, H }) {
  return [
    { x: W / 2 - 0.4, z: W / 2 - 0.4, y: H, w: 0.8, d: 0.8, h: 120, role: "metal", shape: "cyl" },
    { x: 0, z: 0, y: 0, w: W, d: W, h: H, role: "metal", shape: "disc", emit: "down" },
  ];
}

function tableLight({ W, H }) {
  return [
    { x: 0, z: 0, y: 0, w: W, d: W, h: H - 8, role: "stone", shape: "cyl", ao: true },
    { x: -0.6, z: -0.6, y: H - 14, w: W + 1.2, d: W + 1.2, h: 14, role: "metal", shape: "cyl", emit: "ring" },
  ];
}

function mirror({ W, D, H }) {
  return [
    box(0, 0, 0, W, D, H, "metal", { lean: 6 }),
    box(2, -0.6, 2, W - 4, 0.6, H - 4, "glass", { lean: 6, flat: true }),
  ];
}

/* ------------------------------------------------------------------------ */

export const FORMS = {
  sofa,
  "lounge-chair": loungeChair,
  ottoman,
  "low-table": lowTable,
  "dining-table": diningTable,
  console: consoleTable,
  "side-table": sideTable,
  bench,
  sideboard,
  cabinet,
  shelving,
  desk,
  bed,
  nightstand,
  daybed,
  "floor-light": floorLight,
  pendant,
  "table-light": tableLight,
  mirror,
};

/**
 * Maps a part role to a concrete material id, using the product's own option
 * groups first and falling back to a sensible default for the role.
 */
export function resolveRoleMaterials(product) {
  const pick = (...ids) => {
    for (const id of ids) {
      const g = product.options.find((o) => o.id === id);
      if (g) return g.materialIds[0];
    }
    return null;
  };
  const uph = pick("upholstery", "cushion", "writing", "seat");
  const wood = pick("plinth", "carcass", "base", "seat", "shelves", "storage");
  const stone = pick("stone", "top", "blades");
  const metal = pick("metal", "frame", "feet", "uprights", "lining", "plinth");

  return {
    uph: uph ?? "boucle-chalk",
    plinth: pick("plinth") ?? wood ?? "oak-smoked",
    carcass: pick("carcass") ?? wood ?? "oak-natural",
    base: pick("base", "stone") ?? "oak-smoked",
    seat: pick("seat") ?? wood ?? "oak-smoked",
    cushion: pick("cushion") ?? uph ?? "linen-oat",
    blades: pick("blades", "stone") ?? "travertine-ivory",
    stone: stone ?? "travertine-ivory",
    top: pick("top", "stone") ?? "travertine-ivory",
    shelves: pick("shelves") ?? wood ?? "oak-natural",
    uprights: pick("uprights", "metal") ?? "bronze-dark",
    frame: pick("frame", "metal") ?? "bronze-dark",
    feet: pick("feet", "metal") ?? "bronze-dark",
    lining: pick("lining", "metal") ?? "brass-patinated",
    metal: metal ?? "brass-patinated",
    writing: pick("writing") ?? "leather-cognac",
    glass: "__glass",
    dark: "__dark",
    reveal: "__reveal",
  };
}

export function partsFor(product, variant) {
  const fn = FORMS[product.render.form];
  if (!fn) throw new Error(`No form for ${product.render.form}`);
  const { w: W, d: D, h: H, sh: SH } = variant.dim;
  return fn({ W, D, H, SH });
}
