/**
 * Procedural material textures, drawn as vectors.
 *
 * Deliberately deterministic: travertine is a field of elongated pores over
 * horizontal bedding, oak is 200 tapered grain lines with cathedral figure,
 * bouclé is a jittered field of loops. Nothing here depends on tuning an
 * feTurbulence by eye — the same seed always produces the same surface, and
 * the result reads as the material it claims to be.
 */
import { rng, hashSeed, mk } from "./rng.mjs";
import { shade, mix, rgba } from "./color.mjs";

const PLASTER = "#efe9dd";

function head(w, h, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="geometricPrecision"><rect width="${w}" height="${h}" fill="${bg}"/>`;
}

/** A gentle organic noise layer, used sparingly over every surface. */
function noiseLayer(w, h, seed, opacity, freq = 0.7, octaves = 4) {
  return `<filter id="nz${seed}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed % 9999}" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="${w}" height="${h}" filter="url(#nz${seed})" opacity="${opacity}" style="mix-blend-mode:overlay"/>`;
}

/* ---------------------------------------------------------------- stone --- */

function travertine(w, h, m, R, scale = 1) {
  const { f, i } = mk(R);
  let s = "";
  // bedding: long horizontal bands
  for (let k = 0; k < 46; k++) {
    const y = f(0, h);
    const bh = f(2, 22) * scale;
    s += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="${bh.toFixed(1)}" fill="${f(0, 1) < 0.5 ? m.veinHex : shade(m.hex, 1.06)}" opacity="${f(0.025, 0.07).toFixed(3)}"/>`;
  }
  // pores, elongated with the bed
  const pores = Math.round(1700 * scale);
  for (let k = 0; k < pores; k++) {
    const rx = f(1.2, 8.5) * scale;
    const ry = rx * f(0.18, 0.46);
    s += `<ellipse cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${m.veinHex}" opacity="${f(0.06, 0.26).toFixed(3)}"/>`;
  }
  // a few open voids, which we do not fill
  for (let k = 0; k < i(10, 20); k++) {
    const rx = f(4, 13) * scale;
    s += `<ellipse cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * f(0.3, 0.55)).toFixed(1)}" fill="${shade(m.veinHex, 0.72)}" opacity="${f(0.28, 0.46).toFixed(3)}"/>`;
  }
  return s;
}

function marble(w, h, m, R) {
  const { f, i } = mk(R);
  let s = "";
  // soft cloud fields
  for (let k = 0; k < 90; k++) {
    s += `<ellipse cx="${f(-0.1 * w, 1.1 * w).toFixed(1)}" cy="${f(-0.1 * h, 1.1 * h).toFixed(1)}" rx="${f(40, 220).toFixed(1)}" ry="${f(20, 120).toFixed(1)}" fill="${shade(m.hex, f(0.86, 1.2))}" opacity="${f(0.05, 0.14).toFixed(3)}" transform="rotate(${f(-30, 30).toFixed(1)} ${(w / 2).toFixed(0)} ${(h / 2).toFixed(0)})"/>`;
  }
  // primary veins, sweeping
  for (let k = 0; k < i(9, 14); k++) {
    const y0 = f(-0.2 * h, 1.2 * h);
    let d = `M ${-20} ${y0.toFixed(1)}`;
    let y = y0;
    const segs = i(5, 9);
    for (let j = 0; j < segs; j++) {
      const x1 = ((j + 0.5) / segs) * (w + 40) - 20;
      const x2 = ((j + 1) / segs) * (w + 40) - 20;
      const cy = y + f(-70, 70);
      y = y0 + f(-0.25 * h, 0.25 * h) * ((j + 1) / segs) + f(-24, 24);
      d += ` Q ${x1.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y.toFixed(1)}`;
    }
    s += `<path d="${d}" fill="none" stroke="${m.veinHex}" stroke-width="${f(0.8, 4.2).toFixed(2)}" opacity="${f(0.3, 0.72).toFixed(3)}" stroke-linecap="round"/>`;
    // hairline branches shadowing the main vein
    for (let b = 0; b < i(3, 7); b++) {
      s += `<path d="${d}" fill="none" stroke="${m.veinHex}" stroke-width="${f(0.3, 0.9).toFixed(2)}" opacity="${f(0.1, 0.3).toFixed(3)}" transform="translate(${f(-16, 16).toFixed(1)} ${f(-22, 22).toFixed(1)})"/>`;
    }
  }
  return s;
}

function limestone(w, h, m, R) {
  const { f } = mk(R);
  let s = "";
  for (let k = 0; k < 70; k++) {
    s += `<ellipse cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" rx="${f(50, 190).toFixed(1)}" ry="${f(40, 150).toFixed(1)}" fill="${shade(m.hex, f(0.93, 1.08))}" opacity="0.1"/>`;
  }
  for (let k = 0; k < 5200; k++) {
    s += `<circle cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" r="${f(0.4, 1.9).toFixed(2)}" fill="${f(0, 1) < 0.55 ? m.veinHex : "#ffffff"}" opacity="${f(0.05, 0.2).toFixed(3)}"/>`;
  }
  return s;
}

/* --------------------------------------------------------------- timber --- */

function timber(w, h, m, R) {
  const { f, i } = mk(R);
  let s = "";
  // broad tonal bands following the board
  for (let k = 0; k < 26; k++) {
    s += `<rect x="0" y="${f(0, h).toFixed(1)}" width="${w}" height="${f(6, 46).toFixed(1)}" fill="${shade(m.hex, f(0.9, 1.1))}" opacity="0.2"/>`;
  }
  // grain lines, horizontal, gently wandering
  const lines = 230;
  for (let k = 0; k < lines; k++) {
    const y0 = f(-6, h + 6);
    const amp = f(1.5, 9);
    const ph = f(0, Math.PI * 2);
    const wav = f(0.004, 0.013);
    let d = `M 0 ${y0.toFixed(1)}`;
    for (let x = 24; x <= w; x += 24) {
      d += ` L ${x} ${(y0 + Math.sin(x * wav + ph) * amp).toFixed(1)}`;
    }
    const dark = f(0, 1) < 0.62;
    s += `<path d="${d}" fill="none" stroke="${dark ? m.veinHex : shade(m.hex, 1.16)}" stroke-width="${f(0.4, 2.6).toFixed(2)}" opacity="${f(0.07, 0.3).toFixed(3)}"/>`;
  }
  // cathedral figure — a few nested arcs
  for (let k = 0; k < i(2, 4); k++) {
    const cx = f(0.1 * w, 0.9 * w);
    const cy = f(0, h);
    for (let j = 0; j < i(5, 10); j++) {
      const rx = 14 + j * f(7, 15);
      s += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(rx * 0.26).toFixed(1)}" ry="${rx.toFixed(1)}" fill="none" stroke="${m.veinHex}" stroke-width="${f(0.5, 1.8).toFixed(2)}" opacity="${f(0.08, 0.2).toFixed(3)}"/>`;
    }
  }
  // open pores
  for (let k = 0; k < 900; k++) {
    s += `<ellipse cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" rx="${f(1.2, 4.5).toFixed(1)}" ry="${f(0.25, 0.7).toFixed(2)}" fill="${shade(m.veinHex, 0.8)}" opacity="${f(0.1, 0.32).toFixed(3)}"/>`;
  }
  return s;
}

/* -------------------------------------------------------------- textile --- */

function boucle(w, h, m, R) {
  const { f } = mk(R);
  const p = 11;
  let s = `<rect width="${w}" height="${h}" fill="${shade(m.hex, 0.94)}"/>`;
  for (let y = -p; y < h + p; y += p * 0.62) {
    for (let x = -p; x < w + p; x += p * 0.62) {
      const cx = x + f(-3.6, 3.6);
      const cy = y + f(-3.6, 3.6);
      const r = f(3.2, 6.4);
      const lift = f(0, 1);
      s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${lift > 0.45 ? shade(m.hex, f(1.02, 1.14)) : shade(m.veinHex, f(0.95, 1.1))}" opacity="${f(0.5, 0.92).toFixed(2)}"/>`;
      if (lift > 0.62) {
        s += `<circle cx="${(cx - r * 0.3).toFixed(1)}" cy="${(cy - r * 0.34).toFixed(1)}" r="${(r * 0.42).toFixed(1)}" fill="#ffffff" opacity="${f(0.1, 0.26).toFixed(2)}"/>`;
      }
      s += `<path d="M ${(cx - r).toFixed(1)} ${(cy + r * 0.72).toFixed(1)} A ${r} ${r} 0 0 0 ${(cx + r).toFixed(1)} ${(cy + r * 0.72).toFixed(1)}" fill="none" stroke="${shade(m.veinHex, 0.76)}" stroke-width="0.9" opacity="${f(0.12, 0.3).toFixed(2)}"/>`;
    }
  }
  return s;
}

function linen(w, h, m, R) {
  const { f } = mk(R);
  const p = 5.4;
  let s = "";
  for (let y = 0; y < h + p; y += p) {
    const slub = f(0, 1) < 0.1;
    s += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="${(slub ? f(2.4, 4.2) : f(1.1, 2.2)).toFixed(2)}" fill="${f(0, 1) < 0.5 ? m.veinHex : shade(m.hex, 1.1)}" opacity="${(slub ? f(0.2, 0.36) : f(0.07, 0.19)).toFixed(3)}"/>`;
  }
  for (let x = 0; x < w + p; x += p) {
    const slub = f(0, 1) < 0.1;
    s += `<rect x="${x.toFixed(1)}" y="0" width="${(slub ? f(2.4, 4.2) : f(1.1, 2.2)).toFixed(2)}" height="${h}" fill="${f(0, 1) < 0.5 ? m.veinHex : shade(m.hex, 1.1)}" opacity="${(slub ? f(0.18, 0.32) : f(0.06, 0.17)).toFixed(3)}"/>`;
  }
  // irregular thick threads, which is what makes it linen
  for (let k = 0; k < 40; k++) {
    const horiz = f(0, 1) < 0.5;
    const pos = f(0, horiz ? h : w);
    s += horiz
      ? `<rect x="0" y="${pos.toFixed(1)}" width="${w}" height="${f(2.6, 4.6).toFixed(1)}" fill="${m.veinHex}" opacity="${f(0.1, 0.22).toFixed(3)}"/>`
      : `<rect x="${pos.toFixed(1)}" y="0" width="${f(2.6, 4.6).toFixed(1)}" height="${h}" fill="${m.veinHex}" opacity="${f(0.1, 0.22).toFixed(3)}"/>`;
  }
  return s;
}

function wool(w, h, m, R) {
  const { f } = mk(R);
  const p = 4.2;
  let s = "";
  for (let y = -p; y < h + p; y += p) {
    for (let x = -p; x < w + p; x += p) {
      const o = ((y / p) % 2 === 0 ? 0 : p / 2) + f(-0.7, 0.7);
      s += `<path d="M ${(x + o).toFixed(1)} ${(y + p).toFixed(1)} l ${(p * 0.78).toFixed(1)} ${(-p * 0.78).toFixed(1)}" stroke="${f(0, 1) < 0.5 ? m.veinHex : shade(m.hex, 1.14)}" stroke-width="${f(0.8, 1.7).toFixed(2)}" opacity="${f(0.1, 0.3).toFixed(3)}" stroke-linecap="round"/>`;
    }
  }
  for (let k = 0; k < 2200; k++) {
    s += `<circle cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" r="${f(0.4, 1.5).toFixed(2)}" fill="#ffffff" opacity="${f(0.03, 0.12).toFixed(3)}"/>`;
  }
  return s;
}

function mohair(w, h, m, R) {
  const { f } = mk(R);
  let s = "";
  for (let k = 0; k < 14000; k++) {
    const x = f(0, w);
    const y = f(0, h);
    const len = f(2.4, 7);
    const lean = f(-1.6, 1.6);
    const up = f(0, 1) < 0.5;
    s += `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} l ${lean.toFixed(1)} ${(-len).toFixed(1)}" stroke="${up ? shade(m.hex, f(1.05, 1.3)) : shade(m.veinHex, f(0.88, 1.05))}" stroke-width="${f(0.5, 1.3).toFixed(2)}" opacity="${f(0.1, 0.38).toFixed(3)}" stroke-linecap="round"/>`;
  }
  return s;
}

/* -------------------------------------------------------------- leather --- */

function leather(w, h, m, R) {
  const { f } = mk(R);
  let s = "";
  // grain cells
  const p = 13;
  for (let y = -p; y < h + p; y += p * 0.7) {
    for (let x = -p; x < w + p; x += p * 0.7) {
      const cx = x + f(-5, 5);
      const cy = y + f(-5, 5);
      const r = f(4.5, 9);
      s += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * f(0.7, 1)).toFixed(1)}" fill="none" stroke="${shade(m.veinHex, 0.85)}" stroke-width="${f(0.5, 1.5).toFixed(2)}" opacity="${f(0.1, 0.3).toFixed(3)}"/>`;
      s += `<ellipse cx="${(cx + f(-2, 2)).toFixed(1)}" cy="${(cy + f(-2, 2)).toFixed(1)}" rx="${(r * 0.55).toFixed(1)}" ry="${(r * 0.45).toFixed(1)}" fill="${shade(m.hex, f(1.02, 1.16))}" opacity="${f(0.06, 0.2).toFixed(3)}"/>`;
    }
  }
  for (let k = 0; k < 5000; k++) {
    s += `<circle cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" r="${f(0.4, 1.4).toFixed(2)}" fill="${f(0, 1) < 0.5 ? "#000000" : "#ffffff"}" opacity="${f(0.03, 0.1).toFixed(3)}"/>`;
  }
  // pull-up: patches that have lightened where the hide stretched
  for (let k = 0; k < 40; k++) {
    s += `<ellipse cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" rx="${f(30, 130).toFixed(1)}" ry="${f(20, 90).toFixed(1)}" fill="${shade(m.hex, 1.14)}" opacity="${f(0.04, 0.1).toFixed(3)}"/>`;
  }
  return s;
}

/* ---------------------------------------------------------------- metal --- */

function metal(w, h, m, R) {
  const { f } = mk(R);
  let s = "";
  // patina clouds
  for (let k = 0; k < 120; k++) {
    s += `<ellipse cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" rx="${f(30, 180).toFixed(1)}" ry="${f(24, 150).toFixed(1)}" fill="${f(0, 1) < 0.55 ? m.veinHex : shade(m.hex, 1.18)}" opacity="${f(0.05, 0.14).toFixed(3)}"/>`;
  }
  // drawn finish — fine lines along the length
  for (let k = 0; k < 1500; k++) {
    const y = f(0, h);
    s += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="${f(0.4, 1.6).toFixed(2)}" fill="${f(0, 1) < 0.5 ? "#000000" : "#ffffff"}" opacity="${f(0.015, 0.06).toFixed(3)}"/>`;
  }
  // specks of deeper oxidation
  for (let k = 0; k < 1400; k++) {
    s += `<circle cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" r="${f(0.5, 2.6).toFixed(2)}" fill="${shade(m.veinHex, 0.7)}" opacity="${f(0.05, 0.2).toFixed(3)}"/>`;
  }
  return s;
}

/* ------------------------------------------------------------- plaster --- */

export function plasterPlate(w, h, seed = 7) {
  const R = rng(seed);
  const { f } = mk(R);
  let s = head(w, h, PLASTER);
  // trowel passes
  for (let k = 0; k < 230; k++) {
    const cx = f(-0.1 * w, 1.1 * w);
    const cy = f(-0.1 * h, 1.1 * h);
    s += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${f(90, 460).toFixed(0)}" ry="${f(40, 200).toFixed(0)}" fill="${f(0, 1) < 0.5 ? "#ffffff" : "#c9bda8"}" opacity="${f(0.03, 0.085).toFixed(3)}" transform="rotate(${f(-26, 26).toFixed(1)} ${cx.toFixed(0)} ${cy.toFixed(0)})"/>`;
  }
  // very faint arcs where the float was drawn across
  for (let k = 0; k < 90; k++) {
    const cx = f(0, w);
    const cy = f(0, h);
    const r = f(120, 520);
    s += `<path d="M ${(cx - r).toFixed(0)} ${cy.toFixed(0)} A ${r.toFixed(0)} ${(r * f(0.5, 1)).toFixed(0)} 0 0 1 ${(cx + r).toFixed(0)} ${cy.toFixed(0)}" fill="none" stroke="${f(0, 1) < 0.5 ? "#ffffff" : "#bdb09a"}" stroke-width="${f(1, 5).toFixed(1)}" opacity="${f(0.015, 0.05).toFixed(3)}"/>`;
  }
  // fine aggregate
  for (let k = 0; k < 14000; k++) {
    s += `<circle cx="${f(0, w).toFixed(1)}" cy="${f(0, h).toFixed(1)}" r="${f(0.3, 1.5).toFixed(2)}" fill="${f(0, 1) < 0.5 ? "#9c9284" : "#ffffff"}" opacity="${f(0.03, 0.11).toFixed(3)}"/>`;
  }
  s += noiseLayer(w, h, seed + 31, 0.1, 0.9, 3);
  return s + "</svg>";
}

/* ------------------------------------------------------------------------ */

const RECIPES = {
  stone: (w, h, m, R) =>
    m.id.includes("marble") ? marble(w, h, m, R) : m.id.includes("limestone") ? limestone(w, h, m, R) : travertine(w, h, m, R),
  timber,
  textile: (w, h, m, R) => {
    switch (m.render.weave) {
      case "boucle":
        return boucle(w, h, m, R);
      case "linen":
        return linen(w, h, m, R);
      case "mohair":
        return mohair(w, h, m, R);
      default:
        return wool(w, h, m, R);
    }
  },
  leather,
  metal,
};

/** A square material tile, used as a pattern fill and as the swatch image. */
export function materialTile(m, size = 768, scale = 1) {
  const R = rng(hashSeed(m.id));
  let s = head(size, size, m.hex);
  s += RECIPES[m.family](size, size, m, R, scale);
  // directional light across the tile, so faces read as lit
  s += `<defs><linearGradient id="lt" x1="0" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="${(0.1 + m.render.sheen * 0.22).toFixed(3)}"/>
      <stop offset="0.52" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="${(0.07 + m.render.sheen * 0.1).toFixed(3)}"/>
    </linearGradient></defs>
    <rect width="${size}" height="${size}" fill="url(#lt)"/>`;
  s += noiseLayer(size, size, hashSeed(m.id) + 5, 0.07, 0.8, 3);
  return s + "</svg>";
}

/** A wide floor plate. Pores and bedding scaled up; this is a big surface. */
export function floorPlate(m, w = 2400, h = 1100) {
  const R = rng(hashSeed(m.id + "-floor"));
  let s = head(w, h, m.hex);
  s += RECIPES[m.family](w, h, m, R, 2.1);
  // slab joints, every 90 cm of apparent width
  const { f } = mk(rng(hashSeed(m.id + "-joint")));
  for (let k = 1; k < 7; k++) {
    const x = (w / 7) * k + f(-18, 18);
    s += `<rect x="${x.toFixed(0)}" y="0" width="2" height="${h}" fill="#8d8375" opacity="0.14"/>`;
    s += `<rect x="${(x + 2).toFixed(0)}" y="0" width="2" height="${h}" fill="#ffffff" opacity="0.1"/>`;
  }
  s += noiseLayer(w, h, 91, 0.08, 0.85, 3);
  return s + "</svg>";
}

/** Film grain, tiled over every scene at low opacity. */
export function grainTile(size = 180) {
  const R = rng(4242);
  const { f } = mk(R);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#808080"/>`;
  for (let k = 0; k < 26000; k++) {
    const v = f(0, 1);
    s += `<rect x="${f(0, size).toFixed(1)}" y="${f(0, size).toFixed(1)}" width="1" height="1" fill="${v < 0.5 ? "#000" : "#fff"}" opacity="${f(0.1, 0.65).toFixed(2)}"/>`;
  }
  return s + "</svg>";
}

export { PLASTER };
