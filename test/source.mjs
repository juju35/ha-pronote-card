// The card source the tests evaluate: src/ assembled into one classic script as scripts/build.mjs does
// (scripts/bundle.mjs), placeholders (__VERSION__ and the like) left as they are.
import { readFileSync } from "node:fs";
import { bundle } from "../scripts/bundle.mjs";

export const i18nSource = bundle("src/i18n/index.js");
export const pronoteCardSource = bundle("src/pronote-card/index.js");
export const pronotePanelSource = bundle("src/pronote-panel/index.js");
// by former file name, for loaders that took one
export const sources = { "i18n.js": i18nSource, "pronote-card.js": pronoteCardSource, "pronote-panel.js": pronotePanelSource };
// a file of src/ by its former URL or path: the bundle for a split file, the file itself otherwise
export const readSrc = (file) => sources[String(file).split("/").pop()] ?? readFileSync(file, "utf8");
