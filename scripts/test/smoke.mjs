/**
 * End-to-end smoke test against the production build.
 *
 * Checks every route for console errors, failed requests and broken images;
 * then exercises the bag, filters, search, wishlist, quick view and mobile
 * navigation. Run with the server already listening on PORT.
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
const SHOTS = path.resolve(import.meta.dirname, "../../.test-shots");
await fs.mkdir(SHOTS, { recursive: true });

const ROUTES = [
  "/",
  "/collections",
  "/collections/sestri",
  "/collections/alvara",
  "/collections/oriel",
  "/furniture",
  "/furniture?category=seating&sort=price-desc",
  "/furniture?q=travertine",
  "/furniture?collection=noctis&family=textile",
  "/furniture?q=zzzznothing",
  "/furniture/sestri-sofa",
  "/furniture/alvara-dining-table",
  "/furniture/kelvara-shelving",
  "/furniture/oriel-pendant",
  "/our-story",
  "/journal",
  "/journal/a-week-at-rapolano",
  "/journal/a-room-in-trieste",
  "/contact",
  "/bag",
  "/wishlist",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
  "/legal/accessibility",
  "/checkout/success",
  "/account/sign-in",
  "/journal/the-cost-of-ten-years",
  "/journal/sixty-fabrics",
  "/this-route-does-not-exist",
];

const browser = await chromium.launch();
const problems = [];
const REPORT = path.resolve(import.meta.dirname, "../../.test-report.txt");
await fs.writeFile(REPORT, "");
const note = (route, kind, detail) => {
  problems.push({ route, kind, detail });
  fs.appendFile(REPORT, `[${kind}] ${route}\n    ${detail}\n\n`).catch(() => {});
};
process.on("uncaughtException", async (e) => {
  await fs.appendFile(REPORT, `[CRASH]\n    ${e.message}\n`);
  console.error("CRASH:", e.message.split("\n")[0]);
  await browser.close().catch(() => {});
  process.exit(1);
});

/* ---------------------------------------------------------- route sweep -- */

async function sweep(viewport, label) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  for (const route of ROUTES) {
    const consoleErrors = [];
    const failed = [];
    const expect404 = route === "/this-route-does-not-exist";
    const onConsole = (m) => {
      if (m.type() !== "error") return;
      // A 404 route is *supposed* to log a 404.
      if (expect404 && /status of 404/.test(m.text())) return;
      consoleErrors.push(m.text().slice(0, 200));
    };
    const onFailed = (r) => {
      // Next cancels in-flight prefetches on navigation; that is not a fault.
      if (/[?&]_rsc=/.test(r.url()) && r.failure()?.errorText === "net::ERR_ABORTED") return;
      failed.push(`${r.url().replace(BASE, "")} ${r.failure()?.errorText ?? ""}`);
    };
    const onResponse = (r) => {
      const u = r.url();
      if (!u.startsWith(BASE)) return;
      if (r.status() >= 400 && !(expect404 && r.status() === 404)) {
        failed.push(`${u.replace(BASE, "")} → ${r.status()}`);
      }
    };
    page.on("console", onConsole);
    page.on("requestfailed", onFailed);
    page.on("response", onResponse);

    const res = await page.goto(BASE + route, { waitUntil: "load", timeout: 45000 });
    if (!expect404 && res && res.status() >= 400) note(route, "status", String(res.status()));

    // Let reveals settle and lazy images start.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
    await page.waitForTimeout(650);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);

    const audit = await page.evaluate(() => {
      const imgs = [...document.images];
      const broken = imgs
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.currentSrc || i.src);
      const noAlt = imgs.filter((i) => !i.hasAttribute("alt")).map((i) => i.src);
      const h1 = [...document.querySelectorAll("h1")].map((h) => h.textContent.trim().slice(0, 60));
      const emptyButtons = [...document.querySelectorAll("button")]
        .filter((b) => !b.textContent.trim() && !b.getAttribute("aria-label") && !b.querySelector("[class*=sr-only]"))
        .map((b) => b.outerHTML.slice(0, 90));
      const emptyLinks = [...document.querySelectorAll("a")]
        .filter((a) => !a.textContent.trim() && !a.getAttribute("aria-label"))
        .map((a) => a.getAttribute("href"));
      const badHref = [...document.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href"))
        .filter((h) => h === "#" || h === "" || h === "javascript:void(0)");
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      return {
        imgs: imgs.length,
        broken,
        noAlt,
        h1,
        emptyButtons,
        emptyLinks,
        badHref,
        overflow,
        title: document.title,
        desc: document.querySelector('meta[name="description"]')?.content ?? "",
        og: document.querySelector('meta[property="og:image"]')?.content ?? "",
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].length,
      };
    });

    page.off("console", onConsole);
    page.off("requestfailed", onFailed);
    page.off("response", onResponse);

    if (consoleErrors.length) note(route, `console(${label})`, consoleErrors.join(" | "));
    if (failed.length) note(route, `network(${label})`, [...new Set(failed)].join(" | "));
    if (audit.broken.length) note(route, `broken-img(${label})`, audit.broken.join(" | "));
    if (audit.noAlt.length) note(route, `missing-alt(${label})`, audit.noAlt.join(" | "));
    if (audit.h1.length !== 1) note(route, `h1-count(${label})`, `${audit.h1.length}: ${audit.h1.join(" / ")}`);
    if (audit.emptyButtons.length) note(route, `unlabelled-button(${label})`, audit.emptyButtons.join(" | "));
    if (audit.emptyLinks.length) note(route, `unlabelled-link(${label})`, audit.emptyLinks.join(" | "));
    if (audit.badHref.length) note(route, `dead-href(${label})`, audit.badHref.join(" | "));
    if (audit.overflow > 2) note(route, `h-overflow(${label})`, `${audit.overflow}px`);
    if (!expect404) {
      if (!audit.title) note(route, "meta", "no title");
      if (!audit.desc) note(route, "meta", "no description");
      if (!audit.canonical) note(route, "meta", "no canonical");
      if (!audit.og) note(route, "meta", "no og:image");
    }

    console.log(
      `  ${label.padEnd(7)} ${route.padEnd(44)} imgs:${String(audit.imgs).padStart(3)} ld:${audit.ld} ${
        consoleErrors.length || failed.length || audit.broken.length ? "✗" : "·"
      }`,
    );

    if (["/", "/furniture", "/furniture/sestri-sofa", "/collections/sestri", "/our-story", "/journal/a-week-at-rapolano", "/contact"].includes(route)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SHOTS, `${label}${route.replace(/[^a-z0-9]/gi, "_") || "_home"}.jpg`),
        type: "jpeg",
        quality: 68,
        fullPage: false,
      });
    }
  }

  await ctx.close();
}

console.log("\nRoute sweep");
await sweep({ width: 1440, height: 900 }, "desktop");
await sweep({ width: 390, height: 844 }, "mobile");

/* ------------------------------------------------------- interactions -- */

console.log("\nInteractions");
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => {
  if (m.type() !== "error") return;
  // /api/checkout answers 501 by design when no payment provider is set, and
  // the browser logs it. That is the behaviour under test, not a fault.
  if (/status of 501/.test(m.text())) return;
  errs.push(m.text().slice(0, 200));
});
const ok = (name, pass, extra = "") => {
  console.log(`  ${pass ? "·" : "✗"} ${name}${extra ? ` — ${extra}` : ""}`);
  if (!pass) note("interaction", name, extra || "failed");
};

// --- add to bag -------------------------------------------------------------
await page.goto(`${BASE}/furniture/sestri-sofa`, { waitUntil: "load" });
await page.getByRole("button", { name: /^Add to bag/ }).first().click();
await page.waitForTimeout(900);
const drawerOpen = await page.getByRole("dialog", { name: /Shopping bag/ }).isVisible();
ok("add to bag opens the drawer", drawerOpen);

const bagLabel = await page.getByRole("button", { name: /Shopping bag, \d+/ }).getAttribute("aria-label");
ok("header bag count updates", /Shopping bag, 1 item/.test(bagLabel ?? ""), bagLabel ?? "");

// --- quantity in drawer -----------------------------------------------------
await page.getByRole("dialog", { name: /Shopping bag/ }).getByRole("button", { name: /Increase quantity/ }).first().click();
await page.waitForTimeout(400);
const bagLabel2 = await page.getByRole("button", { name: /Shopping bag, \d+/ }).getAttribute("aria-label");
ok("quantity increase persists", /2 items/.test(bagLabel2 ?? ""), bagLabel2 ?? "");

// --- variant changes price --------------------------------------------------
await page.keyboard.press("Escape");
await page.waitForTimeout(600);
const priceBefore = await page.getByRole("button", { name: /^Add to bag/ }).first().innerText();
await page.getByRole("button", { name: /Three seat with chaise/ }).click();
await page.waitForTimeout(400);
const priceAfter = await page.getByRole("button", { name: /^Add to bag/ }).first().innerText();
ok("variant changes the price", priceBefore !== priceAfter, `${priceBefore.replace(/\n/g, " ")} → ${priceAfter.replace(/\n/g, " ")}`);

// --- a different configuration is a separate line ---------------------------
await page.getByRole("button", { name: /^Add to bag/ }).first().click();
await page.waitForTimeout(900);
const lineCount = await page.getByRole("dialog", { name: /Shopping bag/ }).locator("li").count();
ok("a different configuration is a new line", lineCount === 2, `${lineCount} lines`);

// --- remove -----------------------------------------------------------------
await page.getByRole("dialog").getByRole("button", { name: "Remove" }).first().click();
await page.waitForTimeout(500);
const lineCount2 = await page.getByRole("dialog", { name: /Shopping bag/ }).locator("li").count();
ok("remove deletes a line", lineCount2 === 1, `${lineCount2} lines`);

// --- persistence across navigation -----------------------------------------
await page.keyboard.press("Escape");
await page.waitForTimeout(500);
await page.goto(`${BASE}/bag`, { waitUntil: "load" });
await page.waitForTimeout(900);
const bagPageLines = await page.locator("main ul > li").first().isVisible();
ok("bag survives a page load", bagPageLines);

// --- checkout reports its configuration state -------------------------------
await page.getByRole("button", { name: /Proceed to checkout/ }).click();
await page.waitForTimeout(2000);
const notice = await page.getByRole("alert").filter({ hasText: /not connected/ }).count();
ok("checkout states that payment is not configured", notice > 0);

// --- wishlist ---------------------------------------------------------------
await page.goto(`${BASE}/furniture/alvara-console`, { waitUntil: "load" });
await page.getByRole("button", { name: /^Save / }).first().click();
await page.waitForTimeout(400);
await page.goto(`${BASE}/wishlist`, { waitUntil: "load" });
await page.waitForTimeout(800);
const saved = await page.getByRole("heading", { level: 3, name: "Alvara Console" }).count();
ok("wishlist persists the saved piece", saved > 0);

// --- filters --------------------------------------------------------------
await page.goto(`${BASE}/furniture`, { waitUntil: "load" });
await page.waitForTimeout(500);
const allCount = (await page.locator("main article").count());
await page.getByRole("checkbox", { name: /Lighting/ }).check();
await page.waitForTimeout(1200);
const url = page.url();
const lightCount = await page.locator("main article").count();
ok("filter writes the URL", url.includes("category=lighting"), url.replace(BASE, ""));
ok("filter narrows the grid", lightCount === 3 && lightCount < allCount, `${allCount} → ${lightCount}`);

// --- chip removal ---------------------------------------------------------
await page.getByRole("button", { name: /Remove filter/ }).first().click();
await page.waitForTimeout(1200);
ok("removing a chip restores the grid", (await page.locator("main article").count()) === allCount);

// --- sort ------------------------------------------------------------------
await page.getByLabel("Sort").selectOption("price-desc");
await page.waitForTimeout(1200);
const firstSorted = await page.locator("main article h3").first().innerText();
ok("sort by price reorders", firstSorted.trim() === "Alvara", firstSorted.trim());

// --- search ----------------------------------------------------------------
const search = page.getByRole("searchbox", { name: /Search the catalogue/ });
await search.fill("bouclé");
await search.press("Enter");
await page.waitForTimeout(1300);
const searchCount = await page.locator("main article").count();
ok("search narrows results", searchCount > 0 && searchCount < allCount, `${searchCount} results`);

await search.fill("zzzznothing");
await search.press("Enter");
await page.waitForTimeout(1300);
ok("empty search shows the recovery state", (await page.getByText(/Nothing in the catalogue matches/).count()) > 0);

// --- quick view ------------------------------------------------------------
await page.goto(`${BASE}/furniture`, { waitUntil: "load" });
await page.waitForTimeout(600);
await page.locator("main article").first().hover();
await page.waitForTimeout(400);
await page.locator("main article").first().getByRole("button", { name: "Quick view" }).click();
await page.waitForTimeout(900);
ok("quick view opens", await page.getByRole("dialog", { name: /quick view/ }).isVisible());
await page.getByRole("dialog").getByRole("button", { name: /^Add to bag/ }).click();
await page.waitForTimeout(900);
ok("quick view adds to the bag", await page.getByRole("dialog", { name: /Shopping bag/ }).isVisible());
await page.keyboard.press("Escape");

// --- gallery ---------------------------------------------------------------
await page.goto(`${BASE}/furniture/kelvara-sideboard`, { waitUntil: "load" });
await page.waitForTimeout(800);
// Scope to the desktop gallery: the mobile rail is in the DOM at every width.
const desktopGallery = page.locator("div.hidden.lg\\:block").first();
const firstFrame = await desktopGallery.locator("img").first().getAttribute("src");
await page.getByRole("button", { name: /Show detail frame/ }).click();
await page.waitForTimeout(1000);
const secondFrame = await desktopGallery.locator("img").first().getAttribute("src");
ok("gallery thumbnail changes the frame", firstFrame !== secondFrame);

await page.keyboard.press("ArrowRight");
await page.waitForTimeout(900);
ok(
  "arrow keys move through the gallery",
  (await desktopGallery.locator("img").first().getAttribute("src")) !== secondFrame,
);

await page.getByRole("button", { name: /Show elevation frame/ }).click();
await page.waitForTimeout(900);
ok(
  "the elevation drawing is a gallery frame",
  (await desktopGallery.locator('img[src*="media%2Felevation"], img[src*="/media/elevation/"]').count()) > 0,
);

await desktopGallery.locator(".group").first().hover();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "View image full size" }).click();
await page.waitForTimeout(900);
ok("lightbox opens", await page.getByRole("dialog", { name: /Kelvara/ }).isVisible());
await page.keyboard.press("Escape");
await page.waitForTimeout(700);
ok("lightbox closes on Escape", (await page.getByRole("dialog", { name: /Kelvara/ }).count()) === 0);

// --- accordion -------------------------------------------------------------
await page.getByRole("button", { name: "Dimensions" }).click();
await page.waitForTimeout(900);
ok("specification accordion opens", await page.getByText("Width", { exact: true }).first().isVisible());
ok(
  "the generated drawings are on the page",
  (await page.locator('img[alt*="Front elevation"]').first().isVisible()) &&
    (await page.locator('img[alt*="Plan view"]').first().isVisible()),
);

// --- newsletter validation -------------------------------------------------
await page.goto(`${BASE}/`, { waitUntil: "load" });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.getByLabel("Email address").fill("not-an-email");
await page.getByRole("button", { name: "Subscribe" }).click();
await page.waitForTimeout(500);
ok("newsletter rejects a bad address", (await page.getByRole("alert").count()) > 0);
await page.getByLabel("Email address").fill("someone@studio.example");
await page.getByRole("button", { name: "Subscribe" }).click();
await page.waitForTimeout(1500);
ok("newsletter accepts a good address", (await page.getByText(/on the list|received/).count()) > 0);

// --- contact validation ----------------------------------------------------
await page.goto(`${BASE}/contact`, { waitUntil: "load" });
await page.waitForTimeout(500);
await page.getByRole("button", { name: "Send enquiry" }).click();
await page.waitForTimeout(500);
const fieldErrors = await page.getByRole("alert").count();
ok("contact form validates empty fields", fieldErrors >= 3, `${fieldErrors} alerts`);
await page.getByLabel("Name").fill("A Architect");
await page.getByLabel("Email", { exact: true }).fill("a@practice.example");
await page.getByLabel("Subject", { exact: true }).fill("Sestri in a Trieste apartment");
await page.getByLabel("Message").fill("We are specifying a four metre Sestri and would like to discuss the plinth joint and lead time.");
await page.getByRole("button", { name: "Send enquiry" }).click();
await page.waitForTimeout(2000);
ok("contact form submits", (await page.getByText(/your message is with us/i).count()) > 0);

// --- mobile navigation -----------------------------------------------------
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const mpage = await mctx.newPage();
mpage.on("console", (m) => m.type() === "error" && errs.push(`[mobile] ${m.text().slice(0, 160)}`));
await mpage.goto(`${BASE}/`, { waitUntil: "load" });
await mpage.getByRole("button", { name: "Open menu" }).click();
await mpage.waitForTimeout(1000);
ok("mobile menu opens", await mpage.getByRole("dialog", { name: "Menu" }).isVisible());
await mpage.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Furniture" }).click();
await mpage.waitForTimeout(1600);
ok("mobile menu navigates and closes", mpage.url().endsWith("/furniture") && (await mpage.getByRole("dialog", { name: "Menu" }).count()) === 0);
await mpage.getByRole("button", { name: /^Filter/ }).click();
await mpage.waitForTimeout(900);
ok("mobile filter sheet opens", await mpage.getByRole("dialog", { name: "Filter" }).isVisible());
await mctx.close();

// --- keyboard --------------------------------------------------------------
await page.goto(`${BASE}/`, { waitUntil: "load" });
await page.waitForTimeout(400);
await page.keyboard.press("Tab");
const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 40));
ok("first tab stop is the skip link", firstFocus === "Skip to content", firstFocus ?? "");

// --- reduced motion --------------------------------------------------------
const rctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const rpage = await rctx.newPage();
await rpage.goto(`${BASE}/`, { waitUntil: "load" });
await rpage.waitForTimeout(1400);
const reduced = await rpage.evaluate(() => {
  const hidden = [...document.querySelectorAll("[data-reveal], [data-stagger] > *")].filter(
    (el) => Number(getComputedStyle(el).opacity) < 0.95,
  ).length;
  const clipped = [...document.querySelectorAll("[data-curtain]")].filter(
    (el) => getComputedStyle(el).clipPath !== "none",
  ).length;
  return { hidden, clipped, lenis: Boolean(window.__lenis) };
});
ok("reduced motion: nothing is left hidden by a reveal", reduced.hidden === 0, `${reduced.hidden} hidden`);
ok("reduced motion: no clip-path curtains remain", reduced.clipped === 0, `${reduced.clipped} clipped`);
ok("reduced motion: smooth scrolling is not loaded", reduced.lenis === false);

const heroFrame = await rpage.locator("section[aria-label='Introduction'] img").first().getAttribute("src");
await rpage.waitForTimeout(9000);
ok(
  "reduced motion: the hero does not advance on its own",
  (await rpage.locator("section[aria-label='Introduction'] img").first().getAttribute("src")) === heroFrame,
);
await rctx.close();

if (errs.length) note("interaction", "console", [...new Set(errs)].join(" | "));

await ctx.close();
await browser.close();

/* ---------------------------------------------------------------- report -- */

console.log("");
if (problems.length === 0) {
  console.log("  No problems found.\n");
} else {
  console.log(`  ${problems.length} PROBLEM(S):\n`);
  for (const p of problems) {
    console.log(`  • [${p.kind}] ${p.route}\n      ${p.detail}\n`);
  }
  process.exitCode = 1;
}
