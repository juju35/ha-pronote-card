// Bundles src/i18n.js (the translations) and src/pronote-card.js (the cards) into the single file dist/pronote-card.js.
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { splitDist } from "./i18n-split.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));

// Both sources are classic scripts sharing one scope: the translations come first, the cards read STRINGS.
export const SOURCES = ["src/i18n.js", "src/pronote-card.js"];
export const bundle = () => SOURCES.map((f) => readFileSync(`${root}${f}`, "utf8")).join("\n");

const out = bundle().replace("__VERSION__", pkg.version);
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(`${root}dist`, { recursive: true });
  writeFileSync(`${root}dist/pronote-card.js`, out);
  console.log(`Built dist/pronote-card.js (${(out.length / 1024).toFixed(1)} KB)`);
  // Translations: English stays in the bundle, each other language goes to dist/pronote-card.i18n.<lang>.js,
  // fetched when a card needs it (scripts/i18n-split.mjs).
  splitDist(`${root}dist`, "pronote-card.js", { version: pkg.version });
}
