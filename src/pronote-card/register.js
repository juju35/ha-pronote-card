// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { ACCENTS, VERSION } from "./core.js";
import { PronoteCard } from "./full-card.js";
import { PronoteMiniCard } from "./mini-card.js";
import { PronoteCardEditor, PronoteMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
};
define("pronote-card", PronoteCard);
define("pronote-mini-card", PronoteMiniCard);
define("pronote-card-editor", PronoteCardEditor);
define("pronote-mini-card-editor", PronoteMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "pronote-card",
    name: "Pronote Card",
    description: "Timetable (canceled and changed lessons highlighted), homework, grades, averages and school life of the Pronote integration, for one or several students.",
  },
  {
    type: "pronote-mini-card",
    name: "Pronote Mini Card",
    description: "Next lesson and homework for the next school day of a Pronote student.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-pronote-card" });
}

console.info(`%c PRONOTE-CARD %c v${VERSION} `, `color: white; background: ${ACCENTS[0]}; font-weight: 700;`, `color: ${ACCENTS[0]}; background: white; font-weight: 700;`);
