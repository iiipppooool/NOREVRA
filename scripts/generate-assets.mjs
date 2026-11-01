/**
 * NOREVRA asset pipeline.
 *
 * Renders every image on the site from the catalogue data. Nothing is fetched
 * from the network: materials, rooms, light and drawings are all generated
 * here, deterministically, so the art direction is consistent across 100+
 * frames and can be regenerated after a catalogue change.
 *
 *   npm run assets            everything
 *   npm run assets -- hero    only groups whose name matches
 *
 * Output: public/media/**  (committed, so a Vercel build never runs this)
 * Replacement: see PHOTOGRAPHY.md, written by this script.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { materialTile, plasterPlate, floorPlate, grainTile } from "./lib/textures.mjs";
import { sceneHtml, detailHtml, frameBounds, PRESETS } from "./lib/scene.mjs";
import { elevationSvg, planSvg } from "./lib/elevation.mjs";
import { partsFor, resolveRoleMaterials } from "./lib/forms.mjs";
import { hashSeed, rng, mk } from "./lib/rng.mjs";
import { shade } from "./lib/color.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUB = path.join(ROOT, "public", "media");
const WORK = path.join(ROOT, ".asset-cache");
const filter = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const only = (group) => filter.length === 0 || filter.some((f) => group.includes(f));

const log = (...a) => console.log("  ", ...a);
const t0 = Date.now();
let written = 0;
const report = [];

async function ensure(...dirs) {
  for (const d of dirs) await fs.mkdir(d, { recursive: true });
}

/* ------------------------------------------------------------------ data -- */

const { products } = await import("@/data/products");
const { materials, materialMap } = await import("@/data/materials");
const { collections } = await import("@/data/collections");
const { journal } = await import("@/data/journal");
const { heroSlides, siteAssets } = await import("@/data/assets");
const { brand } = await import("@/data/brand");

/* ---------------------------------------------------------------- browser -- */

/**
 * Playwright is a tooling dependency, not a dependency of the site: the media
 * it produces is committed, so `npm ci && npm run build` never needs it. We
 * therefore resolve it from wherever it happens to be installed rather than
 * pinning it into package.json and making every production install pay for a
 * browser download.
 */
async function loadPlaywright() {
  const { createRequire } = await import("node:module");
  const req = createRequire(import.meta.url);
  const candidates = [
    "playwright",
    "playwright-core",
    "/opt/node-tools/node_modules/playwright",
    path.join(ROOT, "node_modules/playwright"),
  ];
  for (const c of candidates) {
    try {
      return req(c);
    } catch {
      /* try the next one */
    }
  }
  throw new Error(
    "Playwright not found. The generated media is committed, so this is only\n" +
      "needed to regenerate it:  npm i -D playwright && npx playwright install chromium",
  );
}
const { chromium } = await loadPlaywright();

const browser = await chromium.launch({
  args: ["--allow-file-access-from-files", "--force-color-profile=srgb", "--font-render-hinting=none"],
});
const ctx = await browser.newContext({ deviceScaleFactor: 1 });

/** Render an HTML string at an exact size and write a JPEG or PNG. */
async function shoot(html, w, h, out, { quality = 84, type = "jpeg" } = {}) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: w, height: h });
  const tmp = path.join(WORK, "page.html");
  await fs.writeFile(tmp, html);
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts?.ready);
  await ensure(path.dirname(out));
  await page.screenshot({
    path: out,
    type,
    ...(type === "jpeg" ? { quality } : {}),
    clip: { x: 0, y: 0, width: w, height: h },
  });
  await page.close();
  written++;
}

async function writeSvg(svg, out) {
  await ensure(path.dirname(out));
  await fs.writeFile(out, svg);
  written++;
}

/** Wrap a bare SVG document in a page so Chromium rasterises it at size. */
const svgPage = (svg, w, h) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden}svg{display:block}</style></head><body>${svg}</body></html>`;

/* --------------------------------------------------- 1. tiles and plates -- */

await ensure(WORK, PUB);
const TILE = 768;
const tiles = {};
const FLOOR_STONES = ["travertine-ivory", "limestone-pale", "travertine-smoke"];

if (only("tiles")) {
  log("grain");
  await shoot(svgPage(grainTile(180), 180, 180), 180, 180, path.join(PUB, "system/grain.png"), {
    type: "png",
  });

  log(`material tiles (${materials.length})`);
  for (const m of materials) {
    const out = path.join(WORK, `tile-${m.id}.png`);
    await shoot(svgPage(materialTile(m, TILE), TILE, TILE), TILE, TILE, out, { type: "png" });
    // the selectable swatch, same surface, cropped square
    await shoot(
      svgPage(materialTile(m, TILE), TILE, TILE),
      TILE,
      TILE,
      path.join(PUB, `swatch/${m.id}.jpg`),
      { quality: 86 },
    );
  }

  log("plaster plate");
  await shoot(
    svgPage(plasterPlate(2400, 1600), 2400, 1600),
    2400,
    1600,
    path.join(WORK, "plate-wall.png"),
    { type: "png" },
  );

  log(`floor plates (${FLOOR_STONES.length})`);
  for (const id of FLOOR_STONES) {
    await shoot(
      svgPage(floorPlate(materialMap[id], 2400, 1100), 2400, 1100),
      2400,
      1100,
      path.join(WORK, `plate-floor-${id}.png`),
      { type: "png" },
    );
  }
}

for (const m of materials) {
  tiles[m.id] = { src: pathToFileURL(path.join(WORK, `tile-${m.id}.png`)).href };
}
const WALL_SRC = pathToFileURL(path.join(WORK, "plate-wall.png")).href;
const GRAIN_SRC = pathToFileURL(path.join(PUB, "system/grain.png")).href;
const floorSrcFor = (id) => pathToFileURL(path.join(WORK, `plate-floor-${id}.png`)).href;

/* ------------------------------------------------------------ 2. scenes -- */

/** Which floor stone suits a piece — warm pieces on warm floors. */
function floorFor(product) {
  const r = rng(hashSeed(product.slug + "floor"));
  return FLOOR_STONES[Math.floor(r() * FLOOR_STONES.length)];
}

const framing = [];
/** slug → { group, views: { materialId → {src,width,height} } } */
const finishViews = {};
/**
 * Where the subject sits in each generated frame, 0..1. Written to
 * src/data/focus.json and used as the object-position for every crop, so a
 * wide plate squeezed into a tall box keeps the furniture rather than the
 * wall. The generator is the only thing that knows this, so it records it.
 */
const focus = {};

function sceneFor(product, variant, preset, o) {
  const { w, h, seed, mirror, light, wall, floor, anchor, frac, selection } = o;
  const parts = partsFor(product, variant);
  const roleMaterial = resolveRoleMaterials(product, selection);
  const used = {};
  for (const role of new Set(parts.map((p) => p.role))) {
    const id = roleMaterial[role];
    if (tiles[id]) used[id] = tiles[id];
  }
  const opts = {
    w,
    h,
    preset,
    parts,
    piece: {
      W: variant.dim.w,
      D: variant.dim.d,
      H: variant.dim.h,
      mount: product.render.form === "pendant" ? "hang" : "floor",
    },
    light: light ?? product.render.light,
    wall: wall ?? product.render.wall,
    anchor,
    frac,
    wallSrc: WALL_SRC,
    floorSrc: floorSrcFor(floor ?? floorFor(product)),
    grainSrc: GRAIN_SRC,
    tiles: used,
    roleMaterial,
    mirror,
    seed,
  };
  // The piece must sit inside the frame with real margins, or the composition
  // is wrong however good the lighting is.
  const b = frameBounds(opts);
  const hang = opts.piece.mount === "hang";
  const bad = b.x0 < 0.015 || b.x1 > 0.985 || b.y1 > 0.995 || (!hang && b.y0 < 0.02);
  framing.push({
    id: `${product.slug} ${preset}`,
    box: [b.x0, b.y0, b.x1, b.y1].map((v) => v.toFixed(3)).join(" "),
    bad,
  });
  const clamp = (v) => Math.round(Math.min(0.82, Math.max(0.18, v)) * 1000) / 10;
  let cx = (b.x0 + b.x1) / 2;
  if (mirror) cx = 1 - cx;
  lastFocus = `${clamp(cx)}% ${clamp((b.y0 + b.y1) / 2 + 0.06)}%`;
  return sceneHtml(opts);
}

let lastFocus = null;
/** Records the focal point of the frame just composed, against its path. */
function recordFocus(src) {
  if (lastFocus) focus[src] = lastFocus;
  lastFocus = null;
}

/** Three materials for the macro frame, drawn from the piece's own options. */
function detailStack(product) {
  const roles = resolveRoleMaterials(product);
  const order = [];
  for (const key of ["uph", "cushion", "top", "stone", "blades", "carcass", "plinth", "seat", "shelves", "writing", "metal", "lining", "frame", "uprights"]) {
    const id = roles[key];
    if (id && tiles[id] && !order.includes(id)) order.push(id);
  }
  while (order.length < 3) order.push(order.length % 2 ? "oak-smoked" : "travertine-ivory");
  return order.slice(0, 3);
}

if (only("product")) {
  log(`product frames (${products.length} × 3) and drawings (× 2)`);
  for (const p of products) {
    const v = p.variants[Math.min(1, p.variants.length - 1)];
    const seed = hashSeed(p.slug);
    const mirror = (seed & 1) === 1;
    const [setting, detail, context, elevation] = p.images;

    await shoot(
      sceneFor(p, v, "setting", { w: setting.width, h: setting.height, seed, mirror }),
      setting.width,
      setting.height,
      path.join(ROOT, "public", setting.src),
      { quality: 82 },
    );
    recordFocus(setting.src);
    await shoot(
      detailHtml({
        w: detail.width,
        h: detail.height,
        tiles,
        order: detailStack(p),
        grainSrc: GRAIN_SRC,
        seed: seed + 11,
        light: p.render.light,
      }),
      detail.width,
      detail.height,
      path.join(ROOT, "public", detail.src),
      { quality: 84 },
    );
    await shoot(
      sceneFor(p, v, "context", { w: context.width, h: context.height, seed: seed + 3, mirror: !mirror }),
      context.width,
      context.height,
      path.join(ROOT, "public", context.src),
      { quality: 80 },
    );
    recordFocus(context.src);

    // One frame per offered finish, so choosing a cloth on the product page
    // changes the photograph rather than only the swatch. The first material
    // in the group is the default and is already the setting frame above.
    const group = p.options[0];
    if (group) {
      finishViews[p.slug] = { group: group.id, views: {} };
      for (const mid of group.materialIds) {
        if (mid === group.materialIds[0]) {
          finishViews[p.slug].views[mid] = {
            src: setting.src,
            width: setting.width,
            height: setting.height,
          };
          continue;
        }
        const src = `/media/finish/${p.slug}--${mid}.jpg`;
        await shoot(
          sceneFor(p, v, "setting", {
            w: 1120,
            h: 1400,
            seed,
            mirror,
            selection: { [group.id]: mid },
          }),
          1120,
          1400,
          path.join(ROOT, "public", src),
          { quality: 78 },
        );
        finishViews[p.slug].views[mid] = { src, width: 1120, height: 1400 };
      }
    }

    const parts = partsFor(p, v);
    await writeSvg(elevationSvg(p, v, parts), path.join(ROOT, "public", elevation.src));
    await writeSvg(planSvg(p, v, parts), path.join(ROOT, "public", `/media/plan/${p.slug}.svg`));
    report.push({ group: "product", slug: p.slug });
  }
}

/* ------------------------------------------------------- 3. collections -- */

/**
 * Art direction per collection. Deliberately distinct from the hero and story
 * frames so no two pictures of the same piece look like the same picture.
 */
const COLLECTION_DIRECTION = {
  sestri: { light: "north", plateLight: "west", wall: "#e9e4d9", floor: "limestone-pale", anchor: 0.62, mirror: true },
  alvara: { light: "overcast", plateLight: "west", wall: "#dfd8ca", floor: "travertine-smoke", anchor: 0.38, mirror: false },
  kelvara: { light: "west", plateLight: "north", wall: "#eae4d7", floor: "travertine-ivory", anchor: 0.3, mirror: false },
  noctis: { light: "low", plateLight: "north", wall: "#e1dbcd", floor: "limestone-pale", anchor: 0.68, mirror: true },
  oriel: { light: "low", plateLight: "low", wall: "#d6cfbf", floor: "travertine-smoke", anchor: 0.42, mirror: false },
};

if (only("collection")) {
  log(`collection plates (${collections.length} × 3)`);
  for (const c of collections) {
    const pool = products.filter((x) => x.collection === c.id);
    const lead = pool.find((x) => x.featured) ?? pool[0];
    const alt = pool.find((x) => x !== lead) ?? lead;
    const seed = hashSeed(c.id);

    const { hero, plate, detail } = c.images;
    const dir = COLLECTION_DIRECTION[c.id];
    await shoot(
      sceneFor(lead, lead.variants[lead.variants.length - 1], "context", {
        w: hero.width, h: hero.height, seed, mirror: dir.mirror,
        light: dir.light, wall: dir.wall, floor: dir.floor, anchor: dir.anchor,
      }),
      hero.width,
      hero.height,
      path.join(ROOT, "public", hero.src),
      { quality: 82 },
    );
    recordFocus(hero.src);
    await shoot(
      sceneFor(alt, alt.variants[0], "plate", {
        w: plate.width, h: plate.height, seed: seed + 7, mirror: !dir.mirror,
        light: dir.plateLight, floor: dir.floor,
      }),
      plate.width,
      plate.height,
      path.join(ROOT, "public", plate.src),
      { quality: 82 },
    );
    recordFocus(plate.src);
    await shoot(
      detailHtml({
        w: detail.width,
        h: detail.height,
        tiles,
        order: c.materialIds.filter((m) => tiles[m]).slice(0, 3),
        grainSrc: GRAIN_SRC,
        seed: seed + 23,
        light: lead.render.light,
      }),
      detail.width,
      detail.height,
      path.join(ROOT, "public", detail.src),
      { quality: 84 },
    );
    report.push({ group: "collection", slug: c.id });
  }
}

/* ------------------------------------------------------------- 4. hero -- */

if (only("hero")) {
  log(`hero frames (${heroSlides.length})`);
  const leads = [
    { slug: "sestri-sofa", light: "west", floor: "travertine-ivory", wall: "#ece6da", anchor: 0.33, mirror: false, variant: 3 },
    { slug: "alvara-dining-table", light: "west", floor: "travertine-smoke", wall: "#e4ddcf", anchor: 0.52, mirror: true, variant: 2 },
    { slug: "oriel-floor-light", light: "low", floor: "marble-grigio", wall: "#d2cabb", anchor: 0.7, mirror: false, variant: 1 },
  ];
  for (let i = 0; i < heroSlides.length; i++) {
    const s = heroSlides[i];
    const d = leads[i];
    const p = products.find((x) => x.slug === d.slug);
    await shoot(
      sceneFor(p, p.variants[Math.min(d.variant, p.variants.length - 1)], "hero", {
        w: s.width, h: s.height, seed: 100 + i * 17, mirror: d.mirror,
        light: d.light, wall: d.wall, floor: d.floor, anchor: d.anchor,
      }),
      s.width,
      s.height,
      path.join(ROOT, "public", s.src),
      { quality: 84 },
    );
    recordFocus(s.src);
  }
}

/* ------------------------------------------- 5. editorial, story, journal -- */

/** The material sample grid on Our Story — a real layout, not a flat lay. */
function swatchGridHtml({ w, h, ids }) {
  const cols = 3;
  const cells = ids
    .map(
      (id, i) =>
        `<figure style="--i:${i}"><img src="${tiles[id].src}" alt=""><figcaption>${materialMap[id].name}</figcaption></figure>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;overflow:hidden;background:#cdc0a7}
  .bg{position:absolute;inset:0}
  .bg img{width:100%;height:100%;object-fit:cover;opacity:.95}
  .grid{position:absolute;inset:${(h * 0.055).toFixed(0)}px ${(w * 0.07).toFixed(0)}px;display:grid;grid-template-columns:repeat(${cols},1fr);gap:${(w * 0.045).toFixed(0)}px ${(w * 0.05).toFixed(0)}px;align-content:start}
  figure{position:relative}
  figure img{width:100%;aspect-ratio:1/1.08;object-fit:cover;box-shadow:${(w * 0.012).toFixed(0)}px ${(w * 0.016).toFixed(0)}px ${(w * 0.03).toFixed(0)}px rgba(26,21,14,.42)}
  figcaption{font-family:'Helvetica Neue',Arial,sans-serif;font-size:${(w * 0.0128).toFixed(1)}px;letter-spacing:.2em;text-transform:uppercase;color:#2a241c;padding-top:${(w * 0.012).toFixed(0)}px;opacity:.72}
  .light{position:absolute;inset:0;background:linear-gradient(104deg, rgba(255,247,232,.26), rgba(0,0,0,0) 44%, rgba(18,14,9,.3));mix-blend-mode:soft-light}
  .vig{position:absolute;inset:0;background:radial-gradient(106% 104% at 44% 38%, rgba(0,0,0,0) 44%, rgba(12,9,6,.4) 100%)}
  .grain{position:absolute;inset:0;background-image:url('${GRAIN_SRC}');background-size:180px 180px;opacity:.18;mix-blend-mode:overlay}
  </style></head><body>
  <div class="bg"><img src="${floorSrcFor("travertine-ivory")}" alt=""></div>
  <div class="grid">${cells}</div>
  <div class="light"></div><div class="vig"></div><div class="grain"></div>
  </body></html>`;
}

const bySlug = (s) => products.find((p) => p.slug === s);

if (only("editorial")) {
  log("editorial and story plates");
  const jobs = [
    { a: siteAssets.philosophy, kind: "detail", mats: ["travertine-ivory", "oak-smoked", "brass-patinated"], seed: 41, light: "west" },
    { a: siteAssets.editorialTall, kind: "scene", slug: "sestri-lounge-chair", preset: "plate", seed: 47, mirror: false, light: "west", floor: "travertine-ivory", wall: "#f0ebe0", anchor: 0.58, frac: 0.44 },
    { a: siteAssets.editorialWide, kind: "detail", mats: ["travertine-ivory", "travertine-smoke", "limestone-pale"], seed: 53, light: "west" },
    { a: siteAssets.storyHero, kind: "scene", slug: "kelvara-sideboard", preset: "context", seed: 59, mirror: true, light: "overcast", floor: "limestone-pale", wall: "#ebe6da", anchor: 0.3 },
    { a: siteAssets.storyWorkshop, kind: "detail", mats: ["boucle-chalk", "linen-oat", "oak-smoked"], seed: 61, light: "north" },
    { a: siteAssets.storyMaterials, kind: "grid" },
    { a: siteAssets.contact, kind: "scene", slug: "sestri-sofa", preset: "context", seed: 67, mirror: true, light: "overcast", floor: "limestone-pale", wall: "#efeae0", anchor: 0.4, frac: 0.4 },
  ];

  for (const j of jobs) {
    const { a } = j;
    const out = path.join(ROOT, "public", a.src);
    if (j.kind === "detail") {
      await shoot(
        detailHtml({ w: a.width, h: a.height, tiles, order: j.mats, grainSrc: GRAIN_SRC, seed: j.seed, light: j.light }),
        a.width,
        a.height,
        out,
        { quality: 85 },
      );
    } else if (j.kind === "grid") {
      await shoot(
        swatchGridHtml({
          w: a.width,
          h: a.height,
          ids: ["travertine-ivory", "marble-grigio", "limestone-pale", "oak-natural", "oak-smoked", "walnut-european", "boucle-chalk", "linen-oat", "wool-sage", "mohair-clay", "leather-cognac", "brass-patinated"],
        }),
        a.width,
        a.height,
        out,
        { quality: 86 },
      );
    } else {
      const p = bySlug(j.slug);
      await shoot(
        sceneFor(p, p.variants[0], j.preset, {
          w: a.width, h: a.height, seed: j.seed, mirror: j.mirror,
          light: j.light, wall: j.wall, floor: j.floor, anchor: j.anchor, frac: j.frac,
        }),
        a.width,
        a.height,
        out,
        { quality: 83 },
      );
      recordFocus(a.src);
    }
  }
}

if (only("journal")) {
  log("journal plates");
  const recipe = {
    "a-week-at-rapolano": [
      { kind: "detail", mats: ["travertine-ivory", "travertine-smoke", "limestone-pale"], light: "west" },
      { kind: "detail", mats: ["marble-grigio", "travertine-ivory", "travertine-smoke"], light: "north" },
    ],
    "thirty-eight-centimetres": [
      { kind: "scene", slug: "sestri-sofa", preset: "context", mirror: false, light: "north", floor: "travertine-smoke", wall: "#e7e1d4", anchor: 0.55, frac: 0.46 },
      { kind: "detail", mats: ["boucle-chalk", "oak-smoked", "travertine-ivory"], light: "west" },
    ],
    "the-case-against-handles": [
      { kind: "detail", mats: ["oak-natural", "ash-blackened", "brass-patinated"], light: "north" },
    ],
    "a-room-in-trieste": [
      { kind: "scene", slug: "sestri-sofa", preset: "hero", mirror: true, light: "low", floor: "marble-grigio", wall: "#ded7c8", anchor: 0.63, frac: 0.34 },
      { kind: "scene", slug: "alvara-dining-table", preset: "context", mirror: true, light: "west", floor: "limestone-pale", wall: "#eae4d7", anchor: 0.3 },
    ],
  };
  for (const post of journal) {
    const rs = recipe[post.slug] ?? [];
    for (let i = 0; i < post.images.length; i++) {
      const img = post.images[i];
      const r = rs[i] ?? { kind: "detail", mats: ["oak-smoked", "travertine-ivory", "brass-patinated"], light: "north" };
      const out = path.join(ROOT, "public", img.src);
      if (r.kind === "detail") {
        await shoot(
          detailHtml({ w: img.width, h: img.height, tiles, order: r.mats, grainSrc: GRAIN_SRC, seed: hashSeed(img.src), light: r.light }),
          img.width,
          img.height,
          out,
          { quality: 84 },
        );
      } else {
        const p = bySlug(r.slug);
        await shoot(
          sceneFor(p, p.variants[0], r.preset, {
            w: img.width, h: img.height, seed: hashSeed(img.src), mirror: r.mirror,
            light: r.light, wall: r.wall, floor: r.floor, anchor: r.anchor, frac: r.frac,
          }),
          img.width,
          img.height,
          out,
          { quality: 82 },
        );
        recordFocus(img.src);
      }
    }
  }
}

/* --------------------------------------------------------------- 6. og -- */

if (only("og")) {
  log("open graph plate");
  const p = bySlug("sestri-sofa");
  const base = sceneFor(p, p.variants[3] ?? p.variants[0], "hero", {
    w: 1200, h: 630, seed: 211, mirror: true,
    light: "west", floor: "travertine-smoke", wall: "#e2dbcd", anchor: 0.66, frac: 0.36,
  });
  const stamped = base.replace(
    "</div></body>",
    `<div style="position:absolute;inset:0;display:flex;align-items:flex-end;padding:56px 64px">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#f6f2e9;text-shadow:0 2px 28px rgba(0,0,0,.6)">
        <div style="font-size:44px;letter-spacing:.42em;text-transform:uppercase;text-indent:.42em">${brand.wordmark}</div>
        <div style="font-size:17px;letter-spacing:.2em;text-transform:uppercase;opacity:.82;margin-top:14px">${brand.descriptor}</div>
      </div>
    </div></div></body>`,
  );
  await shoot(stamped, 1200, 630, path.join(ROOT, "public", siteAssets.ogDefault.src), { quality: 86 });
}

/* ------------------------------------------------ 6a. finish view map -- */

if (Object.keys(finishViews).length) {
  const out = path.join(ROOT, "src", "data", "finish-views.json");
  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(out, "utf8"));
  } catch {
    /* first run */
  }
  const merged = Object.fromEntries(
    Object.entries({ ...existing, ...finishViews }).sort(([a], [b]) => a.localeCompare(b)),
  );
  await fs.writeFile(out, `${JSON.stringify(merged, null, 2)}\n`);
  log(`finish views: ${Object.values(merged).reduce((n, v) => n + Object.keys(v.views).length, 0)}`);
  written++;
}

/* ------------------------------------------------- 6b. focal point map -- */

{
  const focusPath = path.join(ROOT, "src", "data", "focus.json");
  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(focusPath, "utf8"));
  } catch {
    /* first run */
  }
  const merged = Object.fromEntries(
    Object.entries({ ...existing, ...focus }).sort(([a], [b]) => a.localeCompare(b)),
  );
  await fs.writeFile(focusPath, `${JSON.stringify(merged, null, 2)}\n`);
  log(`focal points: ${Object.keys(merged).length}`);
  written++;
}

/* ------------------------------------------------------- 7. shot list -- */

if (only("docs")) {
  log("PHOTOGRAPHY.md");
  const rows = [];
  rows.push(`# Photography — shot list\n`);
  rows.push(
    `Every image in this repository under \`public/media\` is **generated art direction**, produced by\n` +
      `\`npm run assets\` from the catalogue in \`src/data\`. It is internally consistent and safe to ship,\n` +
      `but it is a stand-in: these are rendered compositions, not photographs of real furniture.\n`,
  );
  rows.push(
    `## How to replace it\n\n` +
      `1. Shoot the frames below. Keep the aspect ratio given — layouts are built to it.\n` +
      `2. Save each file at the exact path given, as JPEG, long edge at least the stated width.\n` +
      `3. Delete nothing else: every path is referenced through \`src/data\`, so no component changes.\n` +
      `4. Run \`npm run build\`. Next.js re-optimises on first request; no other step is needed.\n\n` +
      `House rules for every frame: natural light only, no people, no styling props beyond what the\n` +
      `brief names, at least a third of the frame given to empty wall, floor or light.\n`,
  );

  const add = (group, items) => {
    rows.push(`\n## ${group}\n`);
    for (const it of items) {
      rows.push(
        `### \`${it.src}\`\n\n` +
          `- **Size** ${it.width} × ${it.height} (${(it.width / it.height).toFixed(2)}:1)\n` +
          `- **Alt text** ${it.alt}\n` +
          `- **Brief** ${it.brief}\n`,
      );
    }
  };

  add("Homepage hero", heroSlides);
  add(
    "Editorial and brand",
    Object.values(siteAssets),
  );
  for (const c of collections) {
    add(`Collection — ${c.name}`, [c.images.hero, c.images.plate, c.images.detail].map((i) => ({ ...i, alt: i.alt })));
  }
  for (const p of products) {
    add(
      `Product — ${p.name} (${p.typology})`,
      p.images.filter((i) => i.kind !== "elevation"),
    );
  }
  for (const post of journal) {
    add(`Journal — ${post.title}`, post.images);
  }
  rows.push(
    `\n## Drawings\n\nThe elevation and plan drawings under \`public/media/elevation\` and \`public/media/plan\`\n` +
      `are generated from the dimensions in \`src/data/products.ts\` and are **not** placeholders —\n` +
      `they are correct to the published dimensions and should be regenerated rather than replaced.\n`,
  );
  await fs.writeFile(path.join(ROOT, "PHOTOGRAPHY.md"), rows.join("\n"));
  written++;
}

/* ------------------------------------------------------------- verify -- */

await browser.close();

if (only("verify") || filter.length === 0) {
  // Walk the output and flag anything suspiciously small — a blank JPEG is
  // tiny, a real frame is not.
  const suspicious = [];
  async function walk(dir) {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else {
        const st = await fs.stat(full);
        const min = full.endsWith(".svg") ? 1200 : full.includes("grain") ? 2000 : 9000;
        if (st.size < min) suspicious.push(`${path.relative(ROOT, full)} (${st.size} B)`);
      }
    }
  }
  await walk(PUB);
  if (suspicious.length) {
    console.error("\n  SUSPICIOUSLY SMALL OUTPUT:\n   " + suspicious.join("\n   "));
    process.exitCode = 1;
  }
}

const badFraming = framing.filter((f) => f.bad);
if (badFraming.length) {
  console.error("\n   BADLY FRAMED:");
  for (const f of badFraming) console.error(`    ${f.id.padEnd(40)} ${f.box}`);
  process.exitCode = 1;
} else if (framing.length) {
  console.log(`\n   framing: ${framing.length} compositions, all inside the safe margin`);
}

const dirs = {};
async function tally(dir, base = dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await tally(full, base);
    else {
      const key = path.relative(PUB, path.dirname(full)) || ".";
      const st = await fs.stat(full);
      dirs[key] = dirs[key] ?? { n: 0, bytes: 0 };
      dirs[key].n++;
      dirs[key].bytes += st.size;
    }
  }
}
await tally(PUB);
console.log("");
let total = 0;
for (const [k, v] of Object.entries(dirs).sort()) {
  total += v.bytes;
  console.log(`   media/${k.padEnd(12)} ${String(v.n).padStart(4)} files  ${(v.bytes / 1e6).toFixed(2)} MB`);
}
console.log(`   ${"".padEnd(13)} ${String(Object.values(dirs).reduce((a, b) => a + b.n, 0)).padStart(4)} files  ${(total / 1e6).toFixed(2)} MB total`);
console.log(`\n   ${written} artefacts in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
