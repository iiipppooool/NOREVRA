import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = path.resolve(fileURLToPath(new URL("../", import.meta.url)));

export async function resolve(specifier, context, nextResolve) {
  let spec = specifier;
  if (spec.startsWith("@/")) {
    spec = pathToFileURL(path.join(ROOT, "src", spec.slice(2))).href;
  }
  const isRelative = spec.startsWith("./") || spec.startsWith("../");
  const isFileUrl = spec.startsWith("file:");
  if ((isRelative || isFileUrl) && !/\.[a-z]+$/i.test(spec)) {
    const base = isFileUrl
      ? fileURLToPath(spec)
      : path.resolve(path.dirname(fileURLToPath(context.parentURL)), spec);
    for (const ext of [".ts", ".tsx", ".mts", ".js", ".mjs"]) {
      if (existsSync(base + ext)) return nextResolve(pathToFileURL(base + ext).href, context);
    }
    const idx = path.join(base, "index.ts");
    if (existsSync(idx)) return nextResolve(pathToFileURL(idx).href, context);
  }
  return nextResolve(spec, context);
}
