/** Contact sheet of generated frames, for reviewing art direction at a glance. */
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
const req = createRequire(import.meta.url);
let chromium;
for (const c of ["playwright", "/opt/node-tools/node_modules/playwright"]) {
  try { ({ chromium } = req(c)); break; } catch {}
}
const ROOT = path.resolve(import.meta.dirname, "..");
const files = process.argv.slice(2);
const cols = Number(process.env.COLS ?? 3);
const html = `<!doctype html><html><body style="margin:0;background:#1b1917;display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px">
${files.map((f) => `<figure style="margin:0;position:relative"><img src="file://${path.join(ROOT, "public", f)}" style="width:100%;display:block"><figcaption style="position:absolute;left:0;bottom:0;background:#000a;color:#fff;font:10px monospace;padding:3px 6px">${f}</figcaption></figure>`).join("")}
</body></html>`;
await fs.writeFile("/tmp/sheet.html", html);
const b = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const p = await b.newPage();
await p.setViewportSize({ width: Number(process.env.W ?? 1500), height: 900 });
await p.goto("file:///tmp/sheet.html", { waitUntil: "load" });
await p.waitForTimeout(900);
await p.screenshot({ path: "/tmp/sheet.jpg", type: "jpeg", quality: 82, fullPage: true });
await b.close();
console.log("written /tmp/sheet.jpg");
