/**
 * Minimal ESM resolve hook so build scripts can import the app's TypeScript
 * data files directly — no bundler, no duplicated catalogue. Handles the "@/"
 * alias and extensionless relative specifiers. Node strips the types itself.
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

if (!process.env.__NOREVRA_LOADER__) {
  process.env.__NOREVRA_LOADER__ = "1";
  register(new URL("./ts-loader-hooks.mjs", import.meta.url), pathToFileURL("./"));
}
