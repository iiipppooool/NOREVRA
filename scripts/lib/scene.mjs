/**
 * Scene composer.
 *
 * Builds an HTML document that Chromium renders and we screenshot: a plaster
 * wall, a stone floor, one hard window light, and the piece drawn in shallow
 * axonometric with lit/shaded faces, contact shadow and a faint floor
 * reflection. Composition follows a preset, so a 32cm table light and a 300cm
 * dining table are both framed deliberately.
 */
import { shade, rgba, mix } from "./color.mjs";
import { rng, hashSeed, mk } from "./rng.mjs";

/* Shallow axonometric. Depth recedes up and to the right, so the camera is
   front-left and the right-hand face of every piece falls into shadow. */
const KX = 0.46;
const KY = 0.265;

export const PRESETS = {
  setting: { horizon: 0.648, baseline: 0.808, frac: 0.60, anchor: 0.45, headroom: 0.1 },
  context: { horizon: 0.558, baseline: 0.786, frac: 0.33, anchor: 0.665, headroom: 0.16 },
  hero: { horizon: 0.598, baseline: 0.822, frac: 0.40, anchor: 0.35, headroom: 0.14 },
  plate: { horizon: 0.70, baseline: 0.845, frac: 0.55, anchor: 0.5, headroom: 0.09 },
  wide: { horizon: 0.572, baseline: 0.80, frac: 0.44, anchor: 0.5, headroom: 0.13 },
};

const LIGHTS = {
  north: { warm: "#f6f1e6", wallA: 0.12, floorA: 0.14, blur: 26, tilt: 0.1, amb: -0.03, vign: 0.4 },
  west: { warm: "#ffeccd", wallA: 0.22, floorA: 0.36, blur: 4, tilt: 0.34, amb: 0.0, vign: 0.42 },
  low: { warm: "#ffdfae", wallA: 0.14, floorA: 0.2, blur: 7, tilt: 0.52, amb: -0.14, vign: 0.52 },
  overcast: { warm: "#f2f0ea", wallA: 0.07, floorA: 0.08, blur: 40, tilt: 0.06, amb: -0.05, vign: 0.34 },
};

/* ------------------------------------------------------------------ parts -- */

function faces(p, P, px) {
  const x0 = p.x, x1 = p.x + p.w;
  const z0 = p.z, z1 = p.z + p.d;
  const y0 = p.y, y1 = p.y + p.h;
  const v = (x, y, z) => P(x, y, z);
  return {
    front: [v(x0, y0, z0), v(x1, y0, z0), v(x1, y1, z0), v(x0, y1, z0)],
    right: [v(x1, y0, z0), v(x1, y0, z1), v(x1, y1, z1), v(x1, y1, z0)],
    top: [v(x0, y1, z0), v(x1, y1, z0), v(x1, y1, z1), v(x0, y1, z1)],
    base: [v(x0, y0, z0), v(x1, y0, z0), v(x1, y0, z1), v(x0, y0, z1)],
  };
}

const poly = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
/** CSS clip-path polygon() from a list of pixel points. */
const clip = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`;

function roundedFrontPath(p, P, px) {
  const r = Math.min((p.r ?? 0) * px, (p.w * px) / 2.2, (p.h * px) / 2.2);
  const a = P(p.x, p.y, p.z);
  const b = P(p.x + p.w, p.y, p.z);
  const c = P(p.x + p.w, p.y + p.h, p.z);
  const d = P(p.x, p.y + p.h, p.z);
  if (r <= 0.6) {
    return `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} L ${b[0].toFixed(1)} ${b[1].toFixed(1)} L ${c[0].toFixed(1)} ${c[1].toFixed(1)} L ${d[0].toFixed(1)} ${d[1].toFixed(1)} Z`;
  }
  // front faces are axis-aligned, so a plain rounded rect is exact
  const left = Math.min(a[0], d[0]);
  const top = Math.min(c[1], d[1]);
  const w = Math.abs(b[0] - a[0]);
  const h = Math.abs(a[1] - d[1]);
  return `M ${(left + r).toFixed(1)} ${top.toFixed(1)} h ${(w - 2 * r).toFixed(1)} a ${r} ${r} 0 0 1 ${r} ${r} v ${(h - 2 * r).toFixed(1)} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(w - 2 * r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(h - 2 * r)} a ${r} ${r} 0 0 1 ${r} ${-r} z`;
}

/** One part: shaded faces, pattern-filled, with a soft falloff on the front. */
function renderPart(p, P, px, fillOf, gradId) {
  const f = faces(p, P, px);
  const fill = fillOf(p.role);
  const tint = p.tint ?? 1;
  const soft = p.r > 0;
  let s = "";

  const face = (pts, k, extra = "") =>
    `<polygon points="${poly(pts)}" fill="${fill}"${extra}/>` +
    `<polygon points="${poly(pts)}" fill="${k < 1 ? "#0d0b08" : "#fff7e8"}" opacity="${Math.abs(1 - k).toFixed(3)}"/>`;

  if (p.shape === "cyl") return renderCyl(p, P, px, fill, tint);
  if (p.shape === "disc") return renderDisc(p, P, px, fill, tint);
  if (p.shape === "bolster") return renderBolster(p, P, px, fill, tint);

  if (!p.flat && !p.topOnly) {
    s += face(f.right, 0.74 * tint);
    s += face(f.top, 1.12 * tint);
  }
  if (p.topOnly) {
    s += face(f.top, 1.04 * tint);
    return s;
  }

  // front face
  if (soft) {
    const d = roundedFrontPath(p, P, px);
    s += `<path d="${d}" fill="${fill}"/>`;
    s += `<path d="${d}" fill="url(#${gradId})" opacity="${(0.95 * (2 - tint)).toFixed(3)}"/>`;
    if (tint > 1) s += `<path d="${d}" fill="#fff7e8" opacity="${((tint - 1) * 0.9).toFixed(3)}"/>`;
    // seam along the lower edge, which is what makes a cushion read as sewn
    const a = P(p.x, p.y, p.z);
    const b = P(p.x + p.w, p.y, p.z);
    s += `<line x1="${(a[0] + 4).toFixed(1)}" y1="${(a[1] - 2.5).toFixed(1)}" x2="${(b[0] - 4).toFixed(1)}" y2="${(b[1] - 2.5).toFixed(1)}" stroke="#000" stroke-opacity="0.16" stroke-width="1.1"/>`;
  } else {
    s += `<polygon points="${poly(f.front)}" fill="${fill}"/>`;
    s += `<polygon points="${poly(f.front)}" fill="url(#${gradId})" opacity="${(0.8 * (2 - tint)).toFixed(3)}"/>`;
  }
  // the edge where front meets top, a single hairline — reads as a real arris
  s += `<line x1="${f.top[0][0].toFixed(1)}" y1="${f.top[0][1].toFixed(1)}" x2="${f.top[1][0].toFixed(1)}" y2="${f.top[1][1].toFixed(1)}" stroke="#fff3df" stroke-opacity="0.3" stroke-width="1"/>`;
  return s;
}

function renderCyl(p, P, px, fill, tint) {
  const cxTop = P(p.x + p.w / 2, p.y + p.h, p.z + p.d / 2);
  const cxBot = P(p.x + p.w / 2, p.y, p.z + p.d / 2);
  const rx = (p.w * px) / 2;
  const ry = rx * KY * 1.06;
  const bodyTop = cxTop[1];
  const bodyBot = cxBot[1];
  let s = "";
  s += `<path d="M ${(cxTop[0] - rx).toFixed(1)} ${bodyTop.toFixed(1)} L ${(cxBot[0] - rx).toFixed(1)} ${bodyBot.toFixed(1)} A ${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(cxBot[0] + rx).toFixed(1)} ${bodyBot.toFixed(1)} L ${(cxTop[0] + rx).toFixed(1)} ${bodyTop.toFixed(1)} Z" fill="${fill}"/>`;
  s += `<path d="M ${(cxTop[0] - rx).toFixed(1)} ${bodyTop.toFixed(1)} L ${(cxBot[0] - rx).toFixed(1)} ${bodyBot.toFixed(1)} A ${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(cxBot[0] + rx).toFixed(1)} ${bodyBot.toFixed(1)} L ${(cxTop[0] + rx).toFixed(1)} ${bodyTop.toFixed(1)} Z" fill="url(#cylshade)"/>`;
  s += `<ellipse cx="${cxTop[0].toFixed(1)}" cy="${bodyTop.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${fill}"/>`;
  s += `<ellipse cx="${cxTop[0].toFixed(1)}" cy="${bodyTop.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#fff7e8" opacity="${(0.12 * tint).toFixed(3)}"/>`;
  return s;
}

function renderDisc(p, P, px, fill, tint) {
  const c = P(p.x + p.w / 2, p.y + p.h, p.z + p.d / 2);
  const rx = (p.w * px) / 2;
  const ry = rx * KY * 1.1;
  const t = Math.max(2, p.h * px * 0.5);
  let s = "";
  s += `<path d="M ${(c[0] - rx).toFixed(1)} ${c[1].toFixed(1)} a ${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(rx * 2).toFixed(1)} 0 l 0 ${t.toFixed(1)} a ${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${(-rx * 2).toFixed(1)} 0 z" fill="${shade(fill.startsWith("url") ? "#8a7042" : fill, 0.7)}"/>`;
  s += `<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${fill}"/>`;
  s += `<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="url(#discshade)"/>`;
  return s;
}

function renderBolster(p, P, px, fill, tint) {
  // a horizontal cylinder lying across the piece
  const a = P(p.x, p.y + p.w / 2, p.z + p.d / 2);
  const len = p.h * px;
  const r = (p.w * px) / 2;
  let s = `<rect x="${a[0].toFixed(1)}" y="${(a[1] - r).toFixed(1)}" width="${len.toFixed(1)}" height="${(r * 2).toFixed(1)}" rx="${(r * 0.5).toFixed(1)}" fill="${fill}"/>`;
  s += `<rect x="${a[0].toFixed(1)}" y="${(a[1] - r).toFixed(1)}" width="${len.toFixed(1)}" height="${(r * 2).toFixed(1)}" rx="${(r * 0.5).toFixed(1)}" fill="url(#bolstershade)"/>`;
  s += `<ellipse cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" rx="${(r * 0.34).toFixed(1)}" ry="${r.toFixed(1)}" fill="${fill}"/>`;
  s += `<ellipse cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" rx="${(r * 0.34).toFixed(1)}" ry="${r.toFixed(1)}" fill="#000" opacity="0.12"/>`;
  return s;
}

/* ----------------------------------------------------------------- scene -- */

/**
 * The projected bounding box of a part list, in 0..1 frame coordinates.
 * Used to assert that a piece is actually framed before the frame is written.
 */
export function frameBounds(opts) {
  const g = geometry(opts);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of opts.parts) {
    for (const x of [p.x, p.x + p.w]) {
      for (const y of [p.y, p.y + p.h]) {
        for (const z of [p.z, p.z + p.d]) {
          const [sx, sy] = g.P(x, y, z);
          minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
          minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
        }
      }
    }
  }
  return { x0: minX / opts.w, x1: maxX / opts.w, y0: minY / opts.h, y1: maxY / opts.h };
}

/** Shared placement maths, so bounds and render can never disagree. */
function geometry({ w, h, preset = "setting", piece, anchor, frac }) {
  const base = PRESETS[preset];
  const pr = { ...base, ...(anchor !== undefined ? { anchor } : {}), ...(frac !== undefined ? { frac } : {}) };
  const hang = piece.mount === "hang";
  const horizonY = h * pr.horizon;
  const baseY = hang ? h * 0.46 : h * pr.baseline;
  // The piece occupies more of the frame than its width alone: in axonometric
  // the depth adds to both the apparent width and the apparent height.
  const projW = piece.W + piece.D * KX;
  const projH = piece.H + piece.D * KY;
  const pxFromW = (pr.frac * w) / projW;
  const available = baseY - h * pr.headroom;
  const pxFromH = hang ? pxFromW : available / Math.max(projH, 1);
  const px = Math.min(pxFromW, pxFromH);
  const pieceWpx = projW * px;
  const originX = w * pr.anchor - pieceWpx / 2;
  return {
    pr, px, baseY, horizonY, pieceWpx, originX,
    P: (x, y, z) => [originX + x * px + z * px * KX, baseY - y * px - z * px * KY],
  };
}

export function sceneHtml(opts) {
  const {
    w,
    h,
    preset = "setting",
    parts,
    piece,
    light = "north",
    wall = "#e6e0d3",
    floorSrc,
    wallSrc,
    grainSrc,
    tiles, // { materialId: { src, size } }
    roleMaterial, // { role: materialId }
    mirror = false,
    emit = null, // { type: 'up'|'down'|'ring', cx, cy } in cm, resolved below
    seed = 1,
  } = opts;

  const L = LIGHTS[light];
  const R = rng(seed);
  const { f } = mk(R);
  const { pr, px, baseY, horizonY, pieceWpx, originX, P } = geometry(opts);

  // --- fills -------------------------------------------------------------
  let defs = "";
  const patternFor = {};
  for (const [id, t] of Object.entries(tiles)) {
    const pid = `p-${id.replace(/[^a-z0-9]/gi, "")}`;
    const size = Math.max(140, Math.min(560, px * 62));
    defs += `<pattern id="${pid}" patternUnits="userSpaceOnUse" width="${size.toFixed(0)}" height="${size.toFixed(0)}" patternTransform="rotate(${f(-2, 2).toFixed(2)})"><image href="${t.src}" x="0" y="0" width="${size.toFixed(0)}" height="${size.toFixed(0)}" preserveAspectRatio="xMidYMid slice"/></pattern>`;
    patternFor[id] = `url(#${pid})`;
  }
  const fillOf = (role) => {
    const m = roleMaterial[role];
    if (m === "__glass") return "url(#glassfill)";
    if (m === "__dark") return "#1d1a16";
    if (m === "__reveal") return "#15120f";
    return patternFor[m] ?? "#b9ac97";
  };

  defs += `<linearGradient id="ffall" x1="0.1" y1="0" x2="0.72" y2="1">
      <stop offset="0" stop-color="#fff6e6" stop-opacity="0.16"/>
      <stop offset="0.45" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#0c0a07" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="cylshade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0c0a07" stop-opacity="0.3"/>
      <stop offset="0.3" stop-color="#fff6e6" stop-opacity="0.12"/>
      <stop offset="0.72" stop-color="#0c0a07" stop-opacity="0.1"/>
      <stop offset="1" stop-color="#0c0a07" stop-opacity="0.4"/>
    </linearGradient>
    <linearGradient id="discshade" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="#fff3d8" stop-opacity="0.28"/>
      <stop offset="0.6" stop-color="#000000" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.26"/>
    </linearGradient>
    <linearGradient id="bolstershade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff6e6" stop-opacity="0.18"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#0c0a07" stop-opacity="0.26"/>
    </linearGradient>
    <linearGradient id="glassfill" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#6d665b"/>
      <stop offset="0.38" stop-color="#4b453d"/>
      <stop offset="0.52" stop-color="#8d8579"/>
      <stop offset="1" stop-color="#36312b"/>
    </linearGradient>
    <linearGradient id="reflfade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.5"/>
      <stop offset="0.55" stop-color="#fff" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="reflmask"><rect x="0" y="${baseY.toFixed(0)}" width="${w}" height="${(h - baseY).toFixed(0)}" fill="url(#reflfade)"/></mask>
    <radialGradient id="glow"><stop offset="0" stop-color="#ffdca8" stop-opacity="0.85"/><stop offset="0.45" stop-color="#ffd9a2" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd9a2" stop-opacity="0"/></radialGradient>`;

  // --- contact shadows ---------------------------------------------------
  let shadows = "";
  for (const p of parts) {
    if (!p.ao) continue;
    const b = faces(p, P, px).base;
    const off = [px * 8, px * 3.2];
    const pts = b.map(([x, y]) => [x + off[0], y + off[1]]);
    shadows += `<polygon points="${poly(pts)}" fill="#2a241b" opacity="${(0.3 + L.tilt * 0.22).toFixed(3)}" filter="url(#softsh)"/>`;
  }
  // a broad occlusion pool under the whole piece
  {
    const bw = pieceWpx * 1.18;
    shadows += `<ellipse cx="${(originX + pieceWpx / 2 + px * 10).toFixed(1)}" cy="${(baseY + px * 2).toFixed(1)}" rx="${(bw / 2).toFixed(1)}" ry="${Math.max(10, px * 11).toFixed(1)}" fill="#241f18" opacity="0.26" filter="url(#softsh2)"/>`;
  }
  defs += `<filter id="softsh" x="-40%" y="-40%" width="180%" height="200%"><feGaussianBlur stdDeviation="${Math.max(5, px * 2.4).toFixed(1)}"/></filter>
    <filter id="softsh2" x="-40%" y="-60%" width="180%" height="240%"><feGaussianBlur stdDeviation="${Math.max(12, px * 7).toFixed(1)}"/></filter>`;

  // --- the piece ---------------------------------------------------------
  let body = "";
  for (const p of parts) {
    const g = p.lean
      ? `<g transform="skewX(${-p.lean}) translate(${((baseY * Math.tan((p.lean * Math.PI) / 180)) || 0).toFixed(1)} 0)">`
      : "";
    body += g + renderPart(p, P, px, fillOf, "ffall") + (g ? "</g>" : "");
  }

  // emissive parts
  let glow = "";
  for (const p of parts) {
    if (!p.emit) continue;
    const c = P(p.x + p.w / 2, p.y + p.h, p.z + p.d / 2);
    const r = Math.max(p.w * px * 2.2, 220);
    if (p.emit === "up") {
      glow += `<ellipse cx="${c[0].toFixed(0)}" cy="${(c[1] - r * 0.5).toFixed(0)}" rx="${(r * 1.5).toFixed(0)}" ry="${(r * 0.95).toFixed(0)}" fill="url(#glow)" style="mix-blend-mode:screen"/>`;
      glow += `<ellipse cx="${c[0].toFixed(0)}" cy="${c[1].toFixed(0)}" rx="${(p.w * px * 0.56).toFixed(0)}" ry="${(p.w * px * 0.17).toFixed(0)}" fill="#ffe6bd" opacity="0.5" style="mix-blend-mode:screen"/>`;
    } else if (p.emit === "down") {
      glow += `<ellipse cx="${c[0].toFixed(0)}" cy="${(c[1] + r * 0.5).toFixed(0)}" rx="${(r * 1.2).toFixed(0)}" ry="${(r * 0.8).toFixed(0)}" fill="url(#glow)" style="mix-blend-mode:screen"/>`;
    } else {
      glow += `<ellipse cx="${c[0].toFixed(0)}" cy="${c[1].toFixed(0)}" rx="${(r * 0.9).toFixed(0)}" ry="${(r * 0.62).toFixed(0)}" fill="url(#glow)" style="mix-blend-mode:screen"/>`;
    }
  }

  // --- window light geometry --------------------------------------------
  const lx = mirror ? w * 1.02 : -w * 0.02;
  const sgn = mirror ? -1 : 1;
  const floorLight = clip([
    [lx + sgn * w * 0.04, horizonY + 2],
    [lx + sgn * w * 0.44, horizonY + 2],
    [lx + sgn * w * (0.44 + L.tilt + 0.3), h],
    [lx + sgn * w * (L.tilt - 0.02), h],
  ]);
  const wallLight = clip([
    [lx + sgn * w * 0.02, h * 0.04],
    [lx + sgn * w * 0.3, h * 0.0],
    [lx + sgn * w * 0.36, horizonY],
    [lx + sgn * w * 0.06, horizonY],
  ]);

  const grade = `linear-gradient(${mirror ? 255 : 105}deg, ${rgba(L.warm, 0.1)} 0%, rgba(0,0,0,0) 46%, rgba(20,16,10,${(0.1 + L.vign * 0.1).toFixed(2)}) 100%)`;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;background:#000;overflow:hidden}
  .frame{position:relative;width:${w}px;height:${h}px;overflow:hidden;transform:${mirror ? "scaleX(-1)" : "none"};filter:contrast(1.09) saturate(1.04) brightness(0.945)}
  .wall{position:absolute;inset:0 0 ${(h - horizonY).toFixed(0)}px 0;overflow:hidden;background:${wall}}
  .wall img{width:100%;height:${(h * 1.02).toFixed(0)}px;object-fit:cover;opacity:.94;mix-blend-mode:luminosity}
  .wallTint{position:absolute;inset:0;background:${wall};mix-blend-mode:color}
  .wallFall{position:absolute;inset:0;background:linear-gradient(${mirror ? "270deg" : "90deg"}, rgba(255,250,240,.1), rgba(0,0,0,0) 38%, rgba(18,15,11,${(0.14 + L.vign * 0.14).toFixed(2)}))}
  .floor{position:absolute;left:0;right:0;top:${horizonY.toFixed(0)}px;bottom:0;overflow:hidden;background:${shade(wall, 0.86)}}
  .floor img{position:absolute;left:-6%;top:-10%;width:112%;height:130%;object-fit:cover}
  .floorFog{position:absolute;inset:0;background:linear-gradient(180deg, rgba(26,22,16,.52) 0%, rgba(26,22,16,.16) 15%, rgba(0,0,0,0) 44%, rgba(20,17,12,.26) 100%)}
  .cove{position:absolute;left:0;right:0;top:${(horizonY - 3).toFixed(0)}px;height:14px;background:linear-gradient(180deg, rgba(22,19,14,.4), rgba(0,0,0,0))}
  .lightFloor{position:absolute;inset:0;background:${L.warm};opacity:${L.floorA};clip-path:${floorLight};filter:blur(${L.blur}px);mix-blend-mode:screen}
  .lightWall{position:absolute;inset:0;background:${L.warm};opacity:${L.wallA};clip-path:${wallLight};filter:blur(${(L.blur * 1.6).toFixed(0)}px);mix-blend-mode:screen}
  .bloom{position:absolute;inset:0;background:radial-gradient(60% 70% at ${mirror ? 96 : 4}% ${(pr.horizon * 72).toFixed(0)}%, ${rgba(L.warm, 0.26)}, rgba(0,0,0,0) 70%);mix-blend-mode:screen}
  .stage{position:absolute;inset:0}
  .grade{position:absolute;inset:0;background:${grade}}
  .vignette{position:absolute;inset:0;background:radial-gradient(118% 112% at 50% 44%, rgba(0,0,0,0) 46%, rgba(10,8,5,${L.vign}) 100%)}
  .amb{position:absolute;inset:0;background:${L.amb < 0 ? `rgba(14,12,9,${Math.abs(L.amb) * 2})` : `rgba(255,245,228,${L.amb * 2})`}}
  .grain{position:absolute;inset:0;background-image:url('${grainSrc}');background-size:180px 180px;opacity:.17;mix-blend-mode:overlay}
  </style></head><body><div class="frame">
    <div class="wall"><img src="${wallSrc}" alt=""><div class="wallTint"></div><div class="wallFall"></div></div>
    <div class="floor"><img src="${floorSrc}" alt=""><div class="floorFog"></div></div>
    <div class="cove"></div>
    <div class="lightWall"></div>
    <div class="lightFloor"></div>
    <div class="bloom"></div>
    <svg class="stage" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>${defs}</defs>
      <g mask="url(#reflmask)" transform="translate(0 ${(baseY * 2).toFixed(1)}) scale(1 -1)" opacity="0.16" filter="url(#softsh)">${body}</g>
      ${shadows}
      ${body}
      ${glow}
    </svg>
    <div class="amb"></div>
    <div class="grade"></div>
    <div class="vignette"></div>
    <div class="grain"></div>
  </div></body></html>`;
}

/* ------------------------------------------------- material macro frame -- */

/**
 * The detail frame: two or three material planes meeting at a hard shadow
 * line, raking light. No room, no object — the surfaces themselves.
 */
export function detailHtml(opts) {
  const { w, h, tiles, order, grainSrc, seed = 3, light = "west" } = opts;
  const L = LIGHTS[light];
  const R = rng(seed);
  const { f } = mk(R);
  const rot = f(-7, 7);
  const bands = order.slice(0, 3);
  const cuts = bands.length === 3 ? [f(0.3, 0.42), f(0.62, 0.74)] : [f(0.42, 0.58)];
  const stops = [0, ...cuts, 1];

  let layers = "";
  bands.forEach((id, i) => {
    const t0 = stops[i];
    const t1 = stops[i + 1];
    layers += `<div class="band" style="top:${(t0 * 100).toFixed(2)}%;height:${((t1 - t0) * 100).toFixed(2)}%">
      <img src="${tiles[id].src}" alt="">
      <div class="bl" style="background:linear-gradient(${(100 + f(-14, 14)).toFixed(0)}deg, rgba(255,248,235,${(0.1 + i * 0.03).toFixed(2)}), rgba(0,0,0,0) 40%, rgba(16,13,9,${(0.16 + i * 0.07).toFixed(2)}))"></div>
      ${i > 0 ? `<div class="seam"></div>` : ""}
    </div>`;
  });

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;overflow:hidden;background:#17140f}
  .frame{position:relative;width:${w}px;height:${h}px;overflow:hidden;filter:contrast(1.07) saturate(1.03) brightness(0.96)}
  .inner{position:absolute;left:-18%;top:-18%;width:136%;height:136%;transform:rotate(${rot.toFixed(2)}deg)}
  .band{position:absolute;left:0;right:0;overflow:hidden}
  .band img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;transform:scale(1.9)}
  .bl{position:absolute;inset:0}
  .seam{position:absolute;left:0;right:0;top:0;height:26px;background:linear-gradient(180deg, rgba(10,8,5,.62), rgba(10,8,5,0));filter:blur(4px)}
  .seamline{position:absolute;left:0;right:0;height:1.5px;background:rgba(255,246,230,.26)}
  .rake{position:absolute;inset:0;background:linear-gradient(${(96 + f(-10, 10)).toFixed(0)}deg, ${rgba(L.warm, 0.3)} 0%, rgba(0,0,0,0) 34%, rgba(14,11,8,.3) 100%);mix-blend-mode:soft-light}
  .vignette{position:absolute;inset:0;background:radial-gradient(102% 104% at 42% 40%, rgba(0,0,0,0) 40%, rgba(10,8,5,.46) 100%)}
  .grain{position:absolute;inset:0;background-image:url('${grainSrc}');background-size:180px 180px;opacity:.2;mix-blend-mode:overlay}
  </style></head><body><div class="frame"><div class="inner">${layers}</div>
  <div class="rake"></div><div class="vignette"></div><div class="grain"></div></div></body></html>`;
}

export { KX, KY };
