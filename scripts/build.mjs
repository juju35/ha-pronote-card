// Bundles the ES modules of src/i18n/ (the translations), src/pronote-card/ (the cards) and src/pronote-panel/ (the optional sidebar
// panel) into the single file dist/pronote-card.js.
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { splitDist } from "./i18n-split.mjs";
import { bundle } from "./bundle.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));

// The sources are classic scripts sharing one scope: the translations come first, the cards read STRINGS.
const concat = () => [bundle("src/i18n/index.js"), bundle("src/pronote-card/index.js"), bundle("src/pronote-panel/index.js")].join("\n");

const out = concat().replace("__VERSION__", pkg.version);
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  mkdirSync(`${root}dist`, { recursive: true });
  writeFileSync(`${root}dist/pronote-card.js`, out);
  console.log(`Built dist/pronote-card.js (${(out.length / 1024).toFixed(1)} KB)`);
  // Translations: English stays in the bundle, each other language goes to dist/pronote-card.i18n.<lang>.js,
  // fetched when a card needs it (scripts/i18n-split.mjs).
  splitDist(`${root}dist`, "pronote-card.js", { version: pkg.version });
}
