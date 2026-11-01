/** Measures mean/stddev/edge-energy of generated images so a flat or broken
 *  frame is caught without having to look at it. */
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
let chromium;
for (const c of ["playwright", "/opt/node-tools/node_modules/playwright"]) {
  try { ({ chromium } = req(c)); break; } catch {}
}
const ROOT = path.resolve(import.meta.dirname, "..");
const targets = process.argv.slice(2);
const files = [];
async function walk(d) {
  for (const e of await fs.readdir(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) await walk(f);
    else if (/\.(jpg|png)$/.test(f) && (targets.length === 0 || targets.some((t) => f.includes(t)))) files.push(f);
  }
}
await walk(path.join(ROOT, "public/media"));
files.sort();
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.goto("about:blank");
console.log("file".padEnd(50), "mean", "  sd", " edge", "  cx", "  cy", " cov", " bbox(x0 y0 x1 y1)");
for (const f of files) {
  const data = "data:image/" + (f.endsWith("png") ? "png" : "jpeg") + ";base64," + (await fs.readFile(f)).toString("base64");
  const r = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const N = 220;
    const c = document.createElement("canvas");
    c.width = N; c.height = N;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, N, N);
    const d = g.getImageData(0, 0, N, N).data;
    let sum = 0, sum2 = 0, edge = 0;
    const lum = new Float64Array(N * N);
    const seen = new Set();
    for (let i = 0; i < N * N; i++) {
      const L = 0.2126 * d[i*4] + 0.7152 * d[i*4+1] + 0.0722 * d[i*4+2];
      lum[i] = L; sum += L; sum2 += L * L;
      if (seen.size < 5000) seen.add((d[i*4]>>3)<<10 | (d[i*4+1]>>3)<<5 | (d[i*4+2]>>3));
    }
    const n = N * N, mean = sum / n;
    for (let y = 1; y < N; y++) for (let x = 1; x < N; x++) {
      edge += Math.abs(lum[y*N+x] - lum[y*N+x-1]) + Math.abs(lum[y*N+x] - lum[(y-1)*N+x]);
    }
    const sd = Math.sqrt(sum2 / n - mean * mean);
    // locate the subject: pixels meaningfully darker than the field
    let cx = 0, cy = 0, cnt = 0, minx = N, maxx = 0, miny = N, maxy = 0;
    const thr = mean - sd * 0.85;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (lum[y * N + x] < thr) {
        cx += x; cy += y; cnt++;
        if (x < minx) minx = x; if (x > maxx) maxx = x;
        if (y < miny) miny = y; if (y > maxy) maxy = y;
      }
    }
    return { mean, sd, edge: edge / (n * 2), uniq: seen.size, w: img.naturalWidth, h: img.naturalHeight,
      cx: cnt ? cx / cnt / N : -1, cy: cnt ? cy / cnt / N : -1, cov: cnt / n,
      bbox: cnt ? [minx / N, miny / N, maxx / N, maxy / N] : null };
  }, data);
  const bb = r.bbox ? r.bbox.map((v) => v.toFixed(2)).join(" ") : "none";
  const flags = [];
  if (r.sd < 3) flags.push("FLAT");
  if (r.cov < 0.012) flags.push("NO-SUBJECT");
  if (r.bbox && (r.bbox[0] < 0.005 || r.bbox[2] > 0.995)) flags.push("CLIPPED-X");
  if (r.bbox && r.bbox[1] < 0.005) flags.push("CLIPPED-TOP");
  console.log(
    path.relative(ROOT + "/public/media", f).padEnd(50),
    r.mean.toFixed(0).padStart(4), r.sd.toFixed(1).padStart(5), r.edge.toFixed(2).padStart(5),
    r.cx.toFixed(2).padStart(5), r.cy.toFixed(2).padStart(5), r.cov.toFixed(3).padStart(5),
    bb.padEnd(20), flags.length ? "<< " + flags.join(" ") : "",
  );
}
await b.close();
