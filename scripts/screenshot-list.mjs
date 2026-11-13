// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture, "-light" for a dark one)
// that shows exactly the same state: only the theme differs (checked by test/screenshots.test.mjs).
import { canceled, homeworkDone, homeworkToDo, inClass } from "./mock-states.mjs";

// The light capture and its dark twin.
const both = (file, type, width, config = {}, extra = {}) => [
  { file, type, theme: "light", width, config, ...extra },
  { file: `${file}-dark`, type, theme: "dark", width, config, ...extra },
];

const ALEX = { device: "Alex Moreau" };

export const shots = [
  ...both("card", "pronote-card", 460),
  ...both("card-next-day", "pronote-card", 460, ALEX, { clicks: ['[data-action="day"][data-day="next"]'] }),
  ...both("card-homework", "pronote-card", 460, ALEX, { clicks: ['[data-action="tab"][data-tab="homework"]'] }),
  ...both("card-homework-popup", "pronote-card", 460, ALEX, { clicks: ['[data-action="tab"][data-tab="homework"]', '[data-action="homework"][data-index="2"]'] }),
  ...both("card-grades", "pronote-card", 460, { ...ALEX, collapsed: [] }, { clicks: ['[data-action="tab"][data-tab="grades"]'] }),
  ...both("card-school-life", "pronote-card", 460, { ...ALEX, collapsed: [] }, { clicks: ['[data-action="tab"][data-tab="school_life"]'] }),
  ...both("mini-card", "pronote-mini-card", 380, ALEX),
  ...both("mini-card-students", "pronote-mini-card", 380, {}, { clicks: ['[data-action="student"][data-id="pronote_sam"]'] }),
  // The optional sidebar panel (its Today and Grades tabs), within the 1000 px viewport.
  ...both("panel", "pronote-panel", 960),
  ...both("panel-grades", "pronote-panel", 960, ALEX, { clicks: ['[data-action="tab"][data-tab="grades"]'] }),
];

// One GIF per animated state of the picture (see sceneSvg in src/pronote-card.js).
export const gifs = [
  ...both("anim-class", "pronote-mini-card", 380, ALEX, { overrides: inClass }),
  ...both("anim-canceled", "pronote-mini-card", 380, ALEX, { overrides: canceled }),
  ...both("anim-homework", "pronote-mini-card", 380, ALEX, { overrides: homeworkToDo }),
  ...both("anim-done", "pronote-mini-card", 380, ALEX, { overrides: homeworkDone }),
];
