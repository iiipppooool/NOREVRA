/**
 * Functional audit against the production build.
 *
 * Everything here drives a real browser against `next start`. Nothing is
 * asserted from reading the source. Where a check cannot be performed in this
 * environment it is reported as untested rather than passed.
 *
 *   node scripts/test/audit.mjs
 */
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";

const req = createRequire(import.meta.url);
let chromium;
for (const c of ["playwright", "/opt/node-tools/node_modules/playwright"]) {
  try { ({ chromium } = req(c)); break; } catch {}
}
const BASE = process.env.BASE ?? "http://127.0.0.1:3100";
const ROOT = path.resolve(import.meta.dirname, "../..");

const fail = [];
const warn = [];
const pass = [];
const untested = [];
const ok = (area, name, good, detail = "") =>
  (good ? pass : fail).push({ area, name, detail });
const soft = (area, name, good, detail = "") => {
  if (good) pass.push({ area, name, detail });
  else warn.push({ area, name, detail });
};

const { products } = await import("../../src/data/products.ts").catch(() => ({ products: null }));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

/* ========================================================== 1. LINK CRAWL */

console.log("\n1. Link crawl");
const seeds = [
  "/", "/collections", "/furniture", "/our-story", "/journal", "/contact",
  "/bag", "/wishlist", "/legal/terms", "/legal/privacy", "/legal/cookies",
  "/legal/accessibility", "/checkout/success",
];
const found = new Set();
for (const s of seeds) {
  await page.goto(BASE + s, { waitUntil: "load" });
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
  );
  for (const h of hrefs) {
    if (!h) continue;
    if (h.startsWith("http") || h.startsWith("mailto:") || h.startsWith("tel:") || h.startsWith("#")) continue;
    found.add(h.split("#")[0]);
  }
}
const broken = [];
for (const href of [...found].sort()) {
  const res = await page.request.get(BASE + href, { maxRedirects: 3 });
  if (res.status() >= 400) broken.push(`${href} → ${res.status()}`);
}
ok("links", `${found.size} distinct internal links resolve`, broken.length === 0, broken.join(", "));
console.log(`   ${found.size} links checked, ${broken.length} broken`);

/* ================================================ 2. PRODUCT DATA ACCURACY */

console.log("\n2. Product data");
if (!products) {
  untested.push({ area: "product", name: "catalogue cross-check", detail: "could not import catalogue" });
} else {
  const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  let bad = 0;
  for (const p of products) {
    await page.goto(`${BASE}/furniture/${p.slug}`, { waitUntil: "load" });
    await page.waitForTimeout(260);
    // innerText reflects text-transform, so labels come back uppercased.
    // Compare case-insensitively and normalise non-breaking spaces.
    const norm = (t) => t.replace(/\u00a0/g, " ").replace(/\s+/g, " ").toLowerCase();
    const text = norm(await page.evaluate(() => document.body.innerText));
    const has = (needle) => text.includes(norm(needle));
    const problems = [];

    if (!has(p.name)) problems.push("name missing");
    if (!has(p.typology)) problems.push("typology missing");
    if (!has(p.leadTime)) problems.push("lead time missing");

    // Base price of the default variant must appear.
    const base = money.format((p.price + p.variants[0].priceDelta) / 100);
    if (!has(base)) problems.push(`price ${base} missing`);

    // Every size and its price.
    for (const v of p.variants) {
      if (!has(v.label)) problems.push(`variant "${v.label}" missing`);
      const vp = money.format((p.price + v.priceDelta) / 100);
      if (p.variants.length > 1 && !has(vp)) problems.push(`variant price ${vp} missing`);
    }

    // Dimensions of the default variant, in millimetres.
    const mm = (cm) => `${Math.round(cm * 10)} mm`;
    await page.getByRole("button", { name: "Dimensions" }).click();
    await page.waitForTimeout(420);
    const dimText = norm(await page.evaluate(() => document.body.innerText));
    for (const d of [p.variants[0].dim.w, p.variants[0].dim.d, p.variants[0].dim.h]) {
      if (!dimText.includes(norm(mm(d)))) problems.push(`dimension ${mm(d)} missing`);
    }

    if (problems.length) {
      bad++;
      fail.push({ area: "product", name: p.slug, detail: problems.join("; ") });
    }
  }
  ok("product", `all ${products.length} products show correct name, typology, prices, sizes, dimensions and lead time`, bad === 0, `${bad} with problems`);
  console.log(`   ${products.length} products checked, ${bad} with problems`);
}

/* ========================================================== 3. QUANTITY */

console.log("\n3. Quantity selector");
await page.goto(`${BASE}/furniture/sestri-sofa`, { waitUntil: "load" });
await page.waitForTimeout(400);
const dec = page.getByRole("button", { name: /Decrease quantity/ }).first();
const inc = page.getByRole("button", { name: /Increase quantity/ }).first();
ok("quantity", "decrease is disabled at the minimum", await dec.isDisabled());
for (let i = 0; i < 25 && !(await inc.isDisabled()); i++) await inc.click();
await page.waitForTimeout(200);
const qtyText = await page.locator('[role="group"][aria-label*="Quantity"] span').first().innerText();
ok("quantity", "clamps at 20", qtyText.trim() === "20", `reached ${qtyText.trim()}`);
ok("quantity", "increase is disabled at the maximum", await inc.isDisabled());

/* ========================================================== 4. CHECKOUT */

console.log("\n4. Checkout");
const priced = await page.request.post(`${BASE}/api/checkout`, {
  data: { lines: [{ slug: "sestri-sofa", variantId: "3s", options: {}, qty: 2 }] },
});
const body = await priced.json();
ok("checkout", "returns 501 and names what it needs when unconfigured", priced.status() === 501 && Array.isArray(body.requires) && body.requires.length > 0);
ok("checkout", "prices from the catalogue, not the request", body.quote?.total === 1440000 * 2, `got ${body.quote?.total}`);

const tampered = await page.request.post(`${BASE}/api/checkout`, {
  data: { lines: [{ slug: "sestri-sofa", variantId: "3s", options: {}, qty: 1, price: 1, unitAmount: 1 }] },
});
const tb = await tampered.json();
ok("checkout", "ignores a price supplied by the client", tb.quote?.total === 1440000, `got ${tb.quote?.total}`);

const unknown = await page.request.post(`${BASE}/api/checkout`, {
  data: { lines: [{ slug: "not-a-product", variantId: "x", options: {}, qty: 1 }] },
});
ok("checkout", "rejects an unknown product with 409", unknown.status() === 409);

const badQty = await page.request.post(`${BASE}/api/checkout`, {
  data: { lines: [{ slug: "sestri-sofa", variantId: "3s", options: {}, qty: 9999 }] },
});
ok("checkout", "rejects an out-of-range quantity with 422", badQty.status() === 422);

const empty = await page.request.post(`${BASE}/api/checkout`, { data: { lines: [] } });
ok("checkout", "rejects an empty bag with 422", empty.status() === 422);

const malformed = await page.request.post(`${BASE}/api/checkout`, {
  headers: { "Content-Type": "application/json" },
  data: "{not json",
});
ok("checkout", "rejects an unparseable body without a server error", malformed.status() >= 400 && malformed.status() < 500, `got ${malformed.status()}`);

/* ============================================================= 5. FORMS */

console.log("\n5. Forms");
for (const [name, payload, expect] of [
  ["newsletter rejects a malformed address", { email: "nope" }, 422],
  ["newsletter accepts a valid address", { email: "a@b.co" }, 200],
  ["newsletter rejects a filled honeypot", { email: "a@b.co", company: "spam" }, 422],
]) {
  const r = await page.request.post(`${BASE}/api/newsletter`, { data: payload });
  ok("forms", name, r.status() === expect, `got ${r.status()}`);
}
for (const [name, payload, expect] of [
  ["contact rejects a short message", { name: "A B", email: "a@b.co", topic: "General enquiry", subject: "Hi", message: "too short" }, 422],
  ["contact rejects an unknown topic", { name: "A B", email: "a@b.co", topic: "Nonsense", subject: "Hello", message: "A message long enough to pass validation." }, 422],
  ["contact accepts a complete enquiry", { name: "A B", email: "a@b.co", topic: "General enquiry", subject: "Hello", message: "A message long enough to pass validation." }, 200],
]) {
  const r = await page.request.post(`${BASE}/api/contact`, { data: payload });
  ok("forms", name, r.status() === expect, `got ${r.status()}`);
}

/* ======================================================== 6. RESPONSIVE */

console.log("\n6. Responsive");
const routes = ["/", "/furniture", "/furniture/sestri-sofa", "/collections/sestri", "/our-story", "/contact", "/bag", "/journal/a-week-at-rapolano"];
for (const width of [320, 360, 390, 768, 1024, 1440, 1920, 2560]) {
  const c = await browser.newContext({ viewport: { width, height: 900 } });
  const p2 = await c.newPage();
  const over = [];
  for (const r of routes) {
    await p2.goto(BASE + r, { waitUntil: "load" });
    await p2.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p2.waitForTimeout(700);
    const o = await p2.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (o > 2) over.push(`${r} +${o}px`);
  }
  ok("responsive", `no horizontal overflow at ${width}px`, over.length === 0, over.join(", "));
  console.log(`   ${width}px — ${over.length === 0 ? "clean" : over.join(", ")}`);
  await c.close();
}

/* ===================================================== 7. ACCESSIBILITY */

console.log("\n7. Accessibility");
const A11Y_ROUTES = ["/", "/furniture", "/furniture/sestri-sofa", "/contact", "/bag", "/legal/terms"];
for (const r of A11Y_ROUTES) {
  await page.goto(BASE + r, { waitUntil: "load" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  const res = await page.evaluate(() => {
    // Tailwind v4 emits oklab() for any colour with an opacity modifier, so
    // a regex over the computed string reads the wrong numbers entirely.
    // A 1x1 canvas makes the browser do the conversion for us.
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    const rgbaCache = new Map();
    const toRgba = (css) => {
      if (rgbaCache.has(css)) return rgbaCache.get(css);
      pctx.clearRect(0, 0, 1, 1);
      pctx.fillStyle = "#000";
      pctx.fillStyle = css;
      pctx.fillRect(0, 0, 1, 1);
      const d = pctx.getImageData(0, 0, 1, 1).data;
      const out = [d[0], d[1], d[2], d[3] / 255];
      rgbaCache.set(css, out);
      return out;
    };
    const lum = (c) => {
      const [r, g, b] = c.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const parse = (s) => toRgba(s);
    const bgOf = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage !== "none") return null;
        const c = parse(cs.backgroundColor);
        if (c[3] > 0.85) return c.slice(0, 3);
        n = n.parentElement;
      }
      return [242, 238, 230];
    };
    const overImagery = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        if (n.dataset && n.dataset.overImage !== undefined) return true;
        n = n.parentElement;
      }
      return false;
    };
    const blend = (fg, bg) => fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
    const low = [];
    for (const el of document.querySelectorAll("p,span,a,li,h1,h2,h3,h4,dt,dd,button,label,figcaption,legend,address,cite,em,strong")) {
      const t = el.textContent?.trim();
      if (!t || el.children.length > 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) < 0.3) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      if (overImagery(el)) continue;
      const bg = bgOf(el);
      if (!bg) continue;
      const fg = blend(parse(cs.color), bg);
      const L1 = lum(fg);
      const L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const px = parseFloat(cs.fontSize);
      const bold = Number(cs.fontWeight) >= 700;
      const large = px >= 24 || (px >= 18.66 && bold);
      const need = large ? 3 : 4.5;
      if (ratio < need) low.push(`${t.slice(0, 34)} ${ratio.toFixed(2)}:1 (${px}px needs ${need})`);
    }
    const noLabel = [...document.querySelectorAll("input,select,textarea")].filter((i) => {
      if (i.type === "hidden") return false;
      const id = i.getAttribute("id");
      return !(
        (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
        i.closest("label") ||
        i.getAttribute("aria-label") ||
        i.getAttribute("aria-labelledby")
      );
    }).length;
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]);
    let skips = 0;
    for (let i = 1; i < headings.length; i++) if (headings[i] - headings[i - 1] > 1) skips++;
    return {
      low: [...new Set(low)].slice(0, 6),
      lowCount: new Set(low).size,
      noLabel,
      h1: document.querySelectorAll("h1").length,
      skips,
      main: document.querySelectorAll("main").length,
      nav: document.querySelectorAll("nav").length,
      footerEl: [...document.querySelectorAll("footer")].filter(
        (f) => !f.closest("article, aside, main, nav, section, blockquote, td"),
      ).length,
    };
  });
  soft("a11y", `${r} — text contrast meets AA`, res.lowCount === 0, res.low.join(" | "));
  ok("a11y", `${r} — every form control is labelled`, res.noLabel === 0, `${res.noLabel} unlabelled`);
  ok("a11y", `${r} — exactly one h1`, res.h1 === 1, `${res.h1}`);
  soft("a11y", `${r} — no skipped heading levels`, res.skips === 0, `${res.skips} skips`);
  ok("a11y", `${r} — main, nav and footer landmarks present`, res.main === 1 && res.nav >= 1 && res.footerEl === 1);
}

// Tab order, on a page nothing has touched yet.
await page.goto(`${BASE}/furniture/sestri-sofa`, { waitUntil: "load" });
await page.waitForTimeout(600);
await page.keyboard.press("Tab");
const firstStop = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 30));
ok("a11y", "skip link is the first tab stop", firstStop === "Skip to content", firstStop ?? "");

const focusInfo = await page.evaluate(() => {
  const el = document.querySelector("a[href], button");
  el.focus();
  const cs = getComputedStyle(el, ":focus-visible");
  return { outline: cs.outlineStyle, width: cs.outlineWidth };
});
ok("a11y", "focus ring is drawn", focusInfo.outline !== "none", JSON.stringify(focusInfo));

// Touch target sizes on a phone.
{
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p3 = await c.newPage();
  await p3.goto(`${BASE}/furniture/sestri-sofa`, { waitUntil: "load" });
  await p3.waitForTimeout(700);
  // WCAG 2.5.8 asks for 24x24 and exempts a link whose target is inline in a
  // sentence, where enlarging it would break the line. Visually hidden
  // controls are exempt too — they have no rendered size until focused.
  const small = await p3.evaluate(() => {
    const inlineExempt = (el) => {
      const block = el.closest("p, li, dd, address, blockquote, figcaption");
      if (!block) return false;
      // Inline only if there is real text beside the link in the same block.
      const other = block.textContent.replace(el.textContent, "").trim();
      return other.length > 12;
    };
    const hidden = (el) => {
      const r = el.getBoundingClientRect();
      return r.width <= 2 || r.height <= 2;
    };
    return [...document.querySelectorAll("button, a[href]")]
      .filter((el) => {
        if (hidden(el) || inlineExempt(el)) return false;
        const r = el.getBoundingClientRect();
        return r.height < 24 || r.width < 24;
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return `${el.tagName}:${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 26)} ${Math.round(r.width)}x${Math.round(r.height)}`;
      })
      .slice(0, 10);
  });
  ok("a11y", "standalone touch targets meet 24x24 (WCAG 2.5.8)", small.length === 0, small.join(" | "));
  await c.close();
}

/* ========================================================= 8. REPORT */

await browser.close();

const lines = [];
const section = (title, rows) => {
  if (!rows.length) return;
  lines.push(`\n${title}`);
  for (const r of rows) lines.push(`  ${r.area.padEnd(11)} ${r.name}${r.detail ? `\n              ${r.detail}` : ""}`);
};
console.log(`\n${"=".repeat(72)}`);
console.log(`PASS ${pass.length}   WARN ${warn.length}   FAIL ${fail.length}   UNTESTED ${untested.length}`);
section("FAILURES", fail);
section("WARNINGS", warn);
section("UNTESTED", untested);
console.log(lines.join("\n"));
await fs.writeFile(
  path.join(ROOT, ".audit-report.txt"),
  `PASS ${pass.length} WARN ${warn.length} FAIL ${fail.length}\n\n` +
    [...fail.map((r) => `FAIL ${r.area} ${r.name} ${r.detail}`),
     ...warn.map((r) => `WARN ${r.area} ${r.name} ${r.detail}`),
     ...pass.map((r) => `pass ${r.area} ${r.name}`)].join("\n"),
);
process.exitCode = fail.length ? 1 : 0;
