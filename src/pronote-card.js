/*
 * Pronote Card for Home Assistant
 * https://github.com/juju35/ha-pronote-card
 *
 * Lovelace cards for the community Pronote integration (https://github.com/delphiki/hass-pronote): timetable of the
 * day and of the next school day (canceled and changed lessons stand out), homework (done or to do), latest grades
 * and averages, evaluations and school life (absences, late arrivals, punishments, menus, information), for one or
 * several students. Entities are resolved through the entity and device registries (platform `pronote`,
 * translation_key and device), so they work whatever the Home Assistant language or entity ids.
 */

const VERSION = "__VERSION__";

// Accent of the cards, light and dark theme (readable on a white and on a dark card).
const ACCENTS = ["#17795d", "#3cbf93"];

const ICONS = {
  school: "M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z",
  calendar: "M15,13H16.5V15.82L18.94,17.23L18.19,18.53L15,16.69V13M19,8H5V19H9.67C9.24,18.09 9,17.07 9,16A7,7 0 0,1 16,9C17.07,9 18.09,9.24 19,9.67V8M5,21C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H6V1H8V3H16V1H18V3H19A2,2 0 0,1 21,5V11.1C22.24,12.36 23,14.09 23,16A7,7 0 0,1 16,23C14.09,23 12.36,22.24 11.1,21H5M16,11.15A4.85,4.85 0 0,0 11.15,16C11.15,18.68 13.32,20.85 16,20.85A4.85,4.85 0 0,0 20.85,16C20.85,13.32 18.68,11.15 16,11.15Z",
  homework: "M19 2L14 6.5V17.5L19 13V2M6.5 5C4.55 5 2.45 5.4 1 6.5V21.16C1 21.41 1.25 21.66 1.5 21.66C1.6 21.66 1.65 21.59 1.75 21.59C3.1 20.94 5.05 20.5 6.5 20.5C8.45 20.5 10.55 20.9 12 22C13.35 21.15 15.8 20.5 17.5 20.5C19.15 20.5 20.85 20.81 22.25 21.56C22.35 21.61 22.4 21.59 22.5 21.59C22.75 21.59 23 21.34 23 21.09V6.5C22.4 6.05 21.75 5.75 21 5.5V19C19.9 18.65 18.7 18.5 17.5 18.5C15.8 18.5 13.35 19.15 12 20V6.5C10.55 5.4 8.45 5 6.5 5Z",
  grades: "M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z",
  life: "M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M10,17L13,20H3V18C3,15.79 6.58,14 11,14L12.89,14.11L10,17M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4Z",
  check: "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z",
  circle: "M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
  chevron_down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  clock: "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",
  food: "M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z",
  info: "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",
  alert: "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z",
  room: "M12,3C10.89,3 10,3.89 10,5H3V19H2V21H22V19H21V5C21,3.89 20.11,3 19,3H12M12,5H19V19H12V5M5,11H7V13H5V11Z",
  teacher: "M12 3C14.21 3 16 4.79 16 7S14.21 11 12 11 8 9.21 8 7 9.79 3 12 3M16 13.54C16 14.6 15.72 17.07 13.81 19.83L13 15L13.94 13.12C13.32 13.05 12.67 13 12 13S10.68 13.05 10.06 13.12L11 15L10.19 19.83C8.28 17.07 8 14.6 8 13.54C5.61 14.24 4 15.5 4 17V21H20V17C20 15.5 18.4 14.24 16 13.54Z",
  cancel: "M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z",
  swap: "M21,9L17,5V8H10V10H17V13M7,11L3,15L7,19V16H14V14H7V11Z",
  gavel: "M2.3,20.28L11.9,10.68L10.5,9.26L9.78,9.97C9.39,10.36 8.76,10.36 8.37,9.97L7.66,9.26C7.27,8.87 7.27,8.24 7.66,7.85L13.32,2.19C13.71,1.8 14.34,1.8 14.73,2.19L15.44,2.9C15.83,3.29 15.83,3.92 15.44,4.31L14.73,5L16.15,6.43C16.54,6.04 17.17,6.04 17.56,6.43C17.95,6.82 17.95,7.46 17.56,7.85L18.97,9.26L19.68,8.55C20.07,8.16 20.71,8.16 21.1,8.55L21.8,9.26C22.19,9.65 22.19,10.29 21.8,10.68L16.15,16.33C15.76,16.72 15.12,16.72 14.73,16.33L14.03,15.63C13.63,15.24 13.63,14.6 14.03,14.21L14.73,13.5L13.32,12.09L3.71,21.7C3.32,22.09 2.69,22.09 2.3,21.7C1.91,21.31 1.91,20.67 2.3,20.28M20,19A2,2 0 0,1 22,21V22H12V21A2,2 0 0,1 14,19H20Z",
  delay: "M18 22H6V16L10 12L6 8V2H18V8L14 12L18 16M8 7.5L12 11.5L16 7.5V4H8M12 12.5L8 16.5V20H16V16.5M14 18H10V17.2L12 15.2L14 17.2Z",
  absence: "M12,4A4,4 0 0,1 16,8C16,9.95 14.6,11.58 12.75,11.93L8.07,7.25C8.42,5.4 10.05,4 12,4M12.28,14L18.28,20L20,21.72L18.73,23L15.73,20H4V18C4,16.16 6.5,14.61 9.87,14.14L2.78,7.05L4.05,5.78L12.28,14M20,18V19.18L15.14,14.32C18,14.93 20,16.35 20,18Z",
  paperclip: "M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z",
  star: "M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z",
  average: "M18,6H8.83L14.83,12L8.83,18H18V20H6V18L12,12L6,6V4H18V6Z",
  eval: "M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z",
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
  test: "M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H10V20.09L12.09,18H6V16H14.09L16.09,14H6V12H18.09L20,10.09V8L14,2H6M13,3.5L18.5,9H13V3.5M20.15,13C20,13 19.86,13.05 19.75,13.16L18.73,14.18L20.82,16.26L21.84,15.25C22.05,15.03 22.05,14.67 21.84,14.46L20.54,13.16C20.43,13.05 20.29,13 20.15,13M18.14,14.77L12,20.92V23H14.08L20.23,16.85L18.14,14.77Z",
  coffee: "M20,10C22,13 17,22 15,22C13,22 13,21 12,21C11,21 11,22 9,22C7,22 2,13 4,10C6,7 9,7 11,8V5C5.38,8.07 4.11,3.78 4.11,3.78C4.11,3.78 6.77,0.19 11,5V3H13V8C15,7 18,7 20,10Z",
};

const PLATFORM = "pronote";
const TABS = ["timetable", "homework", "grades", "school_life"];
const TAB_ICONS = { timetable: "calendar", homework: "homework", grades: "grades", school_life: "life" };
// Sections of the grades and school life tabs that fold (chevron), and those folded by default.
const SECTIONS = ["grades", "averages", "evaluations", "absences", "delays", "punishments", "menus", "information"];
const DEFAULT_COLLAPSED = ["evaluations", "information"];
const DEFAULT_MAX_GRADES = 5;

// Entity role per translation_key of the Pronote integration (sensor.py). The period variants (`grades_period`…)
// are the past periods of the grades tab (see PERIOD_ROLES).
const ROLES = {
  class: "class",
  lessons_today: "lessons_today",
  lessons_tomorrow: "lessons_tomorrow",
  lessons_next_day: "lessons_next_day",
  homework: "homework",
  grades: "grades",
  averages: "averages",
  overall_average: "overall_average",
  evaluations: "evaluations",
  absences: "absences",
  delays: "delays",
  punishments: "punishments",
  menus: "menus",
  information_and_surveys: "information",
  current_period: "current_period",
  periods: "periods",
};

// Past periods (the integration creates them for the terms and semesters before the current one): the role of their
// sensors per translation_key, and in the entity id for the versions without translation keys
// (`sensor.pronote_<student>_averages_trimestre_1`).
const PERIOD_ROLES = { grades_period: "grades", averages_period: "averages", overall_average_period: "overall_average", evaluations_period: "evaluations" };
const PERIOD_ID_RE = { grades: /_grades_(\w+)$/, averages: /_averages_(\w+)$/, overall_average: /_overall_average_(\w+)$/, evaluations: /_evaluations_(\w+)$/ };
const LEGACY_PERIOD_RE = /_(grades|averages|overall_average|evaluations)_((?:trimestre|semestre)_\w+)$/;

// Versions of the integration older than its translation keys: the role comes from the end of the entity id
// (English names, `sensor.pronote_<student>_timetable_today` or `…_today_s_timetable`).
const LEGACY = [
  ["lessons_today", /_(?:timetable_today|today_s_timetable)$/],
  ["lessons_tomorrow", /_(?:timetable_tomorrow|tomorrow_s_timetable)$/],
  ["lessons_next_day", /_(?:timetable_next_day|next_day_s_timetable)$/],
  ["homework", /_homework$/, /_(?:period_s_homework|homework_period)$/],
  ["grades", /_grades$/],
  ["averages", /_averages$/],
  ["overall_average", /_overall_average$/],
  ["evaluations", /_evaluations$/],
  ["absences", /_absences$/],
  ["delays", /_delays$/],
  ["punishments", /_punishments$/],
  ["menus", /_menus$/],
  ["information", /_information_and_surveys$/],
  ["class", /_class$/],
  ["current_period", /_current_period$/],
  ["periods", /_periods$/, /_(?:previous|active)_periods$/],
];

const roleOf = (e) => {
  if (e.translation_key) return ROLES[e.translation_key];
  const id = String(e.entity_id || "");
  if (!id.startsWith("sensor.")) return undefined;
  for (const [role, re, not] of LEGACY) if (re.test(id) && !not?.test(id)) return role;
  return undefined;
};

// The past period of a sensor and its role there ({ role, key }), else undefined. The key is the integration's
// `period_key` attribute, else the end of the entity id.
const periodOf = (e, state) => {
  const id = String(e.entity_id || "");
  let role = e.translation_key ? PERIOD_ROLES[e.translation_key] : undefined;
  let key = state?.attributes?.period_key;
  if (role) key ||= id.match(PERIOD_ID_RE[role])?.[1];
  else if (!e.translation_key) {
    const m = id.match(LEGACY_PERIOD_RE);
    if (!m) return undefined;
    role = m[1];
    key ||= m[2];
  }
  return role && key ? { role, key: String(key) } : undefined;
};

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, else HA's full locale when its base matches (keeps its region). A bare
// "pt" (HA's code for European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const valid = (s) => s && !["unknown", "unavailable", ""].includes(s.state);
const list = (s, attr) => (valid(s) && Array.isArray(s.attributes?.[attr]) ? s.attributes[attr] : []);

// ── Dates ──
// A day is a "YYYY-MM-DD" key: the school's local date, read from the start of the ISO strings Pronote gives
// (lessons `2026-11-17T08:00:00+01:00`, homework `2026-11-18`), and the local date for today.
const pad2 = (n) => String(n).padStart(2, "0");
const now = () => Date.now();
const dayKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayKey = () => dayKey(new Date(now()));
const keyOf = (iso) => (typeof iso === "string" && /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : "");
const dateOf = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};
const addDays = (key, n) => {
  const d = dateOf(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
};
const DATE_FMT = {};
const fmtDate = (key, locale, opts) => {
  const id = `${locale}|${JSON.stringify(opts)}`;
  try {
    DATE_FMT[id] ??= new Intl.DateTimeFormat(locale, opts);
  } catch (_err) {
    DATE_FMT[id] ??= new Intl.DateTimeFormat("en", opts);
  }
  return DATE_FMT[id].format(dateOf(key));
};
const upperFirst = (s) => (s ? s[0].toLocaleUpperCase() + s.slice(1) : s);
// "Today", "Tomorrow", else "Thursday 19 November" in the card's language.
const dayLabel = (tr, locale, key) => {
  const today = todayKey();
  if (key === today) return tr("today");
  if (key === addDays(today, 1)) return tr("tomorrow");
  return upperFirst(fmtDate(key, locale, { weekday: "long", day: "numeric", month: "long" }));
};
const shortDay = (key, locale) => fmtDate(key, locale, { day: "numeric", month: "short" });
const timeOf = (iso) => (typeof iso === "string" && /T\d{2}:\d{2}/.test(iso) ? iso.slice(11, 16) : "");

// ── Numbers ──
// Pronote writes decimals with a comma ("13,45") and marks grades it did not count as text ("Abs", "Disp").
const parseNum = (v) => {
  if (v === null || v === undefined || typeof v === "boolean") return null;
  const n = Number.parseFloat(String(v).replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
};
const fmtNum = (n, locale, digits = 2) => (n === null ? "—" : n.toLocaleString(locale, { maximumFractionDigits: digits }));
const UNIT_FMT = {};
const fmtUnit = (v, unit, locale) =>
  (UNIT_FMT[`${locale}|${unit}`] ??= new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "short" })).format(v);
// Grade or average out of `outOf`, brought back to /20: very good, good, fragile, low.
const gradeClass = (v, outOf = 20) => {
  if (v === null || !outOf) return "idle";
  const r = (v / outOf) * 20;
  return r >= 14 ? "ok" : r >= 10 ? "active" : r >= 8 ? "warn" : "crit";
};
// Acquisition levels of the evaluations (Pronote's wording, French or English school settings). The level's text
// decides first, the negative wordings before the positive ones ("Non acquis" and "En cours d'acquisition" contain
// "acquis"); the abbreviation only when the text says nothing known.
const levelClass = (a) => {
  const level = String(a?.level ?? "").toLowerCase();
  const abbr = String(a?.abbreviation ?? "")
    .trim()
    .toLowerCase();
  if (/très bonne|very good|excellent/.test(level)) return "ok";
  if (/insuffisant|insufficient|non acquis|not acquired|not achieved/.test(level)) return "crit";
  if (/fragile|en cours|partial|in progress/.test(level)) return "warn";
  if (/satisfaisant|satisfactory|good|acquis|acquired|achieved/.test(level)) return "ok";
  if (abbr.includes("+") || abbr === "a" || abbr === "v") return "ok";
  if (abbr === "b" || abbr === "j") return "warn";
  if (abbr === "c" || abbr === "d" || abbr === "r") return "crit";
  return "idle";
};
// Links of the attachments: http(s) only (a link attachment is free text typed in Pronote).
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : "");
const COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const colorOf = (c) => (COLOR_RE.test(String(c || "")) ? c : "var(--pc-accent)");

const svgIcon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

// ── Registries ──
// Every device with Pronote entities is a student. Resolved once per registry objects (HA replaces them when they change).
const _cache = new WeakMap();
const resolve = (hass) => {
  const ents = hass?.entities || {};
  const hit = _cache.get(ents);
  if (hit && hit.devices === hass.devices) return hit.students;
  const byDevice = new Map();
  for (const e of Object.values(ents)) {
    if (e.platform !== PLATFORM || !e.device_id) continue;
    const state = hass.states?.[e.entity_id];
    // Integration 1.x: the student's own sensor (`sensor.pronote_<student>`) carries the class and the school.
    const role = roleOf(e) ?? (state?.attributes?.class_name !== undefined ? "class" : undefined);
    const period = role ? undefined : periodOf(e, state);
    if (!role && !period) continue;
    let s = byDevice.get(e.device_id);
    if (!s) {
      const d = hass.devices?.[e.device_id] || {};
      s = { id: e.device_id, deviceName: d.name_by_user || d.name || "", entities: {}, periods: {} };
      byDevice.set(e.device_id, s);
    }
    if (role) s.entities[role] ??= e.entity_id;
    else (s.periods[period.key] ??= {})[period.role] ??= e.entity_id;
  }
  const students = [...byDevice.values()].sort((a, b) => a.deviceName.localeCompare(b.deviceName));
  _cache.set(ents, { devices: hass.devices, students });
  return students;
};

// The student's name: the nickname set in the integration, else the full name, else the device name without its
// "Pronote - " prefix.
const studentName = (hass, s) => {
  const d = hass.devices?.[s.id];
  if (d?.name_by_user) return d.name_by_user;
  for (const id of Object.values(s.entities)) {
    const a = hass.states[id]?.attributes;
    if (a?.nickname) return a.nickname;
    if (a?.full_name) return a.full_name;
  }
  return s.deviceName.replace(/^Pronote\s*-\s*/i, "") || s.id;
};

const matches = (hass, s, ref) => {
  const r = String(ref).toLowerCase();
  return s.id === ref || s.deviceName.toLowerCase() === r || studentName(hass, s).toLowerCase() === r;
};

// The students a card shows: `device` (one) or `devices` (a list, in its order), else all of them.
const findStudents = (hass, config) => {
  const all = resolve(hass);
  if (!all.length) return { error: "no_student" };
  const refs = config.devices ? [].concat(config.devices) : config.device ? [config.device] : [];
  if (!refs.length) return { students: all };
  const students = [];
  for (const ref of refs) {
    const s = all.find((x) => matches(hass, x, ref));
    if (!s) return { error: "unknown_device", ref };
    if (!students.includes(s)) students.push(s);
  }
  return { students };
};

const listStudents = (hass) => resolve(hass).map((s) => ({ value: s.id, label: studentName(hass, s) }));

// ── Styles ──
const BASE_STYLE = `
  :host { --pc-accent: ${ACCENTS[0]}; --pc-ok: var(--success-color, #43a047); --pc-warn: var(--warning-color, #ffa600);
          --pc-crit: var(--error-color, #db4437); --pc-idle: var(--disabled-text-color, #9e9e9e); --pc-active: var(--info-color, #039be5);
          /* Text in a state or accent color is mixed with the text color so that it stays readable (4.5:1). */
          --pc-accent-text: color-mix(in srgb, var(--pc-accent) 55%, var(--primary-text-color)); }
  :host([dark]) { --pc-accent: ${ACCENTS[1]}; }
  ha-card { overflow: hidden; container-type: inline-size; }
  /* Natural width in a parent that sizes to its content (inline-block, grid "auto" column), without a minimum. */
  :host { display: block; min-width: 0; --pc-natural-width: 400px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--pc-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible, button:focus-visible, a:focus-visible { outline: 2px solid var(--primary-color, var(--pc-accent)); outline-offset: 2px; border-radius: 6px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  .ok { --c: var(--pc-ok); } .warn { --c: var(--pc-warn); } .crit { --c: var(--pc-crit); } .idle { --c: var(--pc-idle); } .active { --c: var(--pc-active); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--pc-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--pc-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--pc-ok)) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; box-sizing: border-box; }
  .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .type-icon { position: relative; display: flex; width: 40px; height: 40px; border-radius: 50%; align-items: center; justify-content: center; flex: none;
               --pc-tint: var(--c, var(--pc-accent)); background: color-mix(in srgb, var(--pc-tint) 16%, transparent); transition: background-color .3s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: var(--pc-accent); transition: fill .3s ease; }
  .type-icon:is(.ok, .warn, .crit, .idle, .active) .icon { fill: color-mix(in srgb, var(--pc-tint) 60%, var(--primary-text-color)); }
  .titles { flex: 1 1 0; min-width: 5ch; }
  :host([hide-title]) .titles > .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--pc-warn) 50%, var(--primary-text-color)); }
  /* Buttons: never filled, smoked glass with an outline; the active one has its icon and text in the accent color. */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 500;
         padding: 5px 12px; border-radius: 18px; color: var(--primary-text-color); min-width: 0;
         background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); border: 1px solid var(--divider-color, rgba(127,127,127,.3)); }
  .btn:hover { background: color-mix(in srgb, var(--pc-accent) 10%, transparent); }
  .btn .icon { width: 16px; height: 16px; color: var(--pc-accent); }
  /* Text tabs (students, sections): the active one underlined in the accent color. */
  .tabs { display: flex; gap: 2px; padding: 8px 12px 0; overflow-x: auto; scrollbar-width: none; border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.2)); }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { all: unset; box-sizing: border-box; display: inline-flex; align-items: center; gap: 6px; padding: 6px 8px 7px; cursor: pointer; font-size: 13px;
         font-weight: 500; color: var(--secondary-text-color); border-bottom: 2px solid transparent; white-space: nowrap; flex: none; }
  .tab .icon { width: 16px; height: 16px; }
  .tab:hover { color: var(--primary-text-color); }
  .tab[aria-selected="true"] { color: var(--pc-accent-text); border-bottom-color: var(--pc-accent); }
  .tab[aria-selected="true"] .icon { color: var(--pc-accent); }
  .tab .badge { font-size: 11px; min-width: 16px; padding: 0 5px; border-radius: 8px; box-sizing: border-box; text-align: center; line-height: 16px;
                background: color-mix(in srgb, var(--pc-active) 18%, transparent); color: color-mix(in srgb, var(--pc-active) 55%, var(--primary-text-color)); }
  .students .tab { font-size: 14px; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--pc-idle) 16%, transparent); color: var(--primary-text-color); }
  .content { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .content.hero-wrap { padding-bottom: 4px; }
  .empty { font-size: 13px; color: var(--secondary-text-color); padding: 4px 0; }
  .label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em;
           color: var(--secondary-text-color); margin-bottom: 6px; }
  .label .icon { width: 16px; height: 16px; }
  .label span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .label .aside { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 400; flex: none; }
  /* Lessons: a colored bar per subject (Pronote's color), the canceled ones struck through in red, the changed ones in orange. */
  .lessons { display: flex; flex-direction: column; gap: 4px; }
  .lesson { display: grid; grid-template-columns: 44px 4px minmax(0, 1fr) auto; align-items: center; gap: 0 8px; padding: 6px 8px 6px 4px; border-radius: 10px;
            background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .lesson .time { display: flex; flex-direction: column; align-items: flex-end; font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; line-height: 1.25; }
  .lesson .time .end { font-size: 11px; font-weight: 400; color: var(--secondary-text-color); }
  .lesson .stripe { align-self: stretch; border-radius: 2px; background: var(--sc, var(--pc-accent)); }
  .lesson .body { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .lesson .subj { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lesson .meta { display: flex; gap: 10px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .lesson .meta span { display: inline-flex; align-items: center; gap: 3px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lesson .meta .icon { width: 13px; height: 13px; }
  .lesson .chip { max-width: 120px; }
  .lesson.past { opacity: .55; }
  .lesson.canceled { background: color-mix(in srgb, var(--pc-crit) 9%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pc-crit) 35%, transparent); }
  .lesson.canceled .subj { text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--pc-crit) 70%, transparent); }
  .lesson.canceled .stripe { background: var(--pc-crit); }
  .lesson.changed { background: color-mix(in srgb, var(--pc-warn) 10%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pc-warn) 40%, transparent); }
  .lesson.now { box-shadow: inset 0 0 0 1.5px var(--pc-accent); background: color-mix(in srgb, var(--pc-accent) 9%, transparent); }
  .progress { height: 3px; border-radius: 2px; margin-top: 4px; background: color-mix(in srgb, var(--pc-accent) 18%, transparent); overflow: hidden; }
  .progress > div { height: 100%; background: var(--pc-accent); border-radius: 2px; }
  /* The lesson going on: a dot that pulses beside its start time. */
  .pulse { position: relative; width: 8px; height: 8px; border-radius: 50%; background: var(--pc-accent); display: inline-block; flex: none; }
  .pulse::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--pc-accent); animation: pc-pulse 1.6s ease-out infinite; }
  @keyframes pc-pulse { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(2.8); opacity: 0; } }
  .lesson .time .pulse { margin-top: 3px; }
  .break { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--secondary-text-color); padding: 2px 4px; }
  .break::before, .break::after { content: ""; flex: 1; border-top: 1px dashed var(--divider-color, rgba(127,127,127,.35)); }
  .break .icon { width: 14px; height: 14px; }
  .alert-line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: color-mix(in srgb, var(--c, var(--pc-crit)) 55%, var(--primary-text-color)); min-width: 0; }
  .alert-line .icon { width: 15px; height: 15px; color: var(--c, var(--pc-crit)); }
  .alert-line span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  /* Homework: a check circle (done) or an empty one (to do), the subject in its color. */
  .hw-list { display: flex; flex-direction: column; gap: 4px; }
  .hw { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; align-items: start; gap: 0 8px; padding: 7px 8px; border-radius: 10px;
        background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .hw > .icon { width: 20px; height: 20px; color: var(--pc-idle); margin-top: 1px; }
  .hw.done > .icon { color: var(--pc-ok); }
  .hw .subj { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; min-width: 0; }
  .hw .subj span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hw .subj .sdot { width: 8px; height: 8px; border-radius: 50%; background: var(--sc, var(--pc-accent)); flex: none; }
  .hw .desc { font-size: 12px; color: var(--secondary-text-color); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
              overflow-wrap: anywhere; margin-top: 1px; }
  .hw.done .subj span, .hw.done .desc { text-decoration: line-through; color: var(--secondary-text-color); }
  .hw .clip { width: 15px; height: 15px; color: var(--secondary-text-color); margin-top: 2px; }
  .hw-day + .hw-day { margin-top: 8px; }
  .narrow-hide { display: inline; }
  @container (max-width: 300px) {
    .lesson { grid-template-columns: 40px 4px minmax(0, 1fr); }
    .lesson .chip { grid-column: 3; justify-self: start; margin-top: 3px; max-width: 100%; }
    .narrow-hide { display: none; }
  }
  @container (max-width: 230px) {
    .header .chip { padding: 4px; flex: none; }
    .header .chip-text { display: none; }
    .lesson .meta { flex-direction: column; gap: 0; }
  }
`;

const FULL_STYLE = `
  .daybar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .daybar .btn[aria-pressed="true"] { color: var(--pc-accent-text); border-color: color-mix(in srgb, var(--pc-accent) 55%, transparent);
                                      background: color-mix(in srgb, var(--pc-accent) 10%, transparent); }
  .daybar .hours { margin-left: auto; font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; }
  .summary { display: flex; flex-wrap: wrap; gap: 6px; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(88px, 1fr)); gap: 6px; }
  .tile { display: flex; flex-direction: column; gap: 2px; padding: 6px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .tile .k { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--secondary-text-color); min-width: 0; }
  .tile .k span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tile .k .icon { width: 14px; height: 14px; color: var(--c, var(--secondary-text-color)); }
  .tile .v { font-size: 18px; font-weight: 500; line-height: 1.3; }
  .tile .v small { font-size: 12px; font-weight: 400; color: var(--secondary-text-color); margin-left: 3px; }
  .tile:is(.warn, .crit) .v { color: color-mix(in srgb, var(--c) 55%, var(--primary-text-color)); }
  .overall { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px;
             background: color-mix(in srgb, var(--c, var(--pc-accent)) 10%, transparent); }
  .overall .big { font-size: 30px; font-weight: 400; line-height: 1; color: color-mix(in srgb, var(--c, var(--pc-accent)) 55%, var(--primary-text-color)); }
  .overall .big small { font-size: 14px; color: var(--secondary-text-color); margin-left: 2px; }
  .overall .what { display: flex; flex-direction: column; min-width: 0; font-size: 12px; color: var(--secondary-text-color); }
  .overall .what b { font-size: 14px; font-weight: 500; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em;
                   color: var(--secondary-text-color); margin-bottom: 6px; cursor: pointer; user-select: none; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .section-title .count { text-transform: none; letter-spacing: 0; font-weight: 400; }
  /* Chevron to the right when folded, down when unfolded. */
  .section-title .chevron { margin-left: auto; transition: transform .2s ease; }
  .section-title[aria-expanded="false"] { margin-bottom: 0; }
  .section-title[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .rows { display: flex; flex-direction: column; gap: 4px; }
  .row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 2px 10px; padding: 6px 10px; border-radius: 10px;
         background: var(--secondary-background-color, rgba(127,127,127,.08)); font-size: 13px; }
  .row .main { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .row .t1 { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
  .row .t1 span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .row .t2 { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .end { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; white-space: nowrap; }
  .row .end small { font-size: 11px; color: var(--secondary-text-color); }
  .row .chip { max-width: none; }
  .row .sdot { width: 8px; height: 8px; border-radius: 50%; background: var(--sc, var(--pc-accent)); flex: none; }
  .grade { font-size: 14px; font-weight: 600; padding: 1px 8px; border-radius: 10px; font-variant-numeric: tabular-nums;
           background: color-mix(in srgb, var(--c) 15%, transparent); color: color-mix(in srgb, var(--c) 55%, var(--primary-text-color)); }
  .grade small { font-size: 11px; font-weight: 400; color: var(--secondary-text-color); margin-left: 1px; }
  .avg { display: grid; grid-template-columns: minmax(0, 1fr) minmax(60px, 34%) 44px; align-items: center; gap: 4px 10px; font-size: 13px; padding: 4px 2px; }
  .avg .s { display: flex; align-items: center; gap: 6px; min-width: 0; }
  .avg .s span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .avg .track { position: relative; height: 6px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); }
  .avg .track > .fill { height: 100%; border-radius: 3px; background: var(--c, var(--pc-ok)); }
  .avg .track > .class { position: absolute; top: -3px; width: 2px; height: 12px; margin-left: -1px; border-radius: 1px; background: var(--primary-text-color); opacity: .55; }
  .avg .v { text-align: right; font-weight: 500; font-variant-numeric: tabular-nums; }
  /* Class min and max of a subject, under its name. */
  .avg .mm { grid-column: 1 / -1; margin-top: -4px; padding-left: 14px; font-size: 11px; color: var(--secondary-text-color); font-variant-numeric: tabular-nums;
             white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .end small.mm { font-variant-numeric: tabular-nums; }
  .legend { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--secondary-text-color); margin-top: 2px; }
  .legend i { width: 2px; height: 10px; background: var(--primary-text-color); opacity: .55; border-radius: 1px; }
  .acq { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end; }
  .acq .chip { max-width: none; }
  .menu { display: flex; flex-direction: column; gap: 4px; font-size: 13px; padding: 8px 10px; border-radius: 10px;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .menu .course { display: grid; grid-template-columns: minmax(70px, 30%) minmax(0, 1fr); gap: 8px; }
  .menu .course .k { color: var(--secondary-text-color); font-size: 12px; }
  .unread { width: 8px; height: 8px; border-radius: 50%; background: var(--pc-active); flex: none; }
  @container (max-width: 300px) {
    .avg { grid-template-columns: minmax(0, 1fr) 44px; }
    .avg .track { grid-column: 1 / -1; grid-row: 2; }
    .menu .course { grid-template-columns: minmax(0, 1fr); gap: 0; }
    .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;

// In-card popup at the top of the card (not centered), so that it stays in view when the card is long.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 220px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 380px); max-height: calc(100% - 24px); overflow: auto;
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 10px; }
  .modal .m-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; }
  .modal .m-title .sdot { width: 10px; height: 10px; border-radius: 50%; background: var(--sc, var(--pc-accent)); flex: none; }
  .modal .m-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .modal .m-sub { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--secondary-text-color); }
  .modal .m-sub .chip { max-width: none; }
  .modal .msg { font-size: 14px; line-height: 1.45; white-space: pre-line; overflow-wrap: anywhere; }
  .modal .files { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
  .modal .files a { display: inline-flex; align-items: center; gap: 6px; color: var(--pc-accent-text); text-decoration: none; min-width: 0; }
  .modal .files a span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .modal .files .icon { width: 16px; height: 16px; color: var(--pc-accent); }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
`;

const MINI_STYLE = `
  :host { --pc-natural-width: 320px; }
  .content { gap: 10px; }
  .hero .picture { width: 64px; height: 72px; }
  .hero .picture svg { filter: drop-shadow(0 2px 4px rgba(0,0,0,.18)); }
  .info .big { font-size: 16px; }
  .hw .desc { -webkit-line-clamp: 1; }
`;

// Home Assistant dialogs (the more-info opened from the card): a click inside them is not a click elsewhere.
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. The handler runs when the press and the release are both outside the card (a slider dragged out of the
// card does not count), and a scroll does not count (the browser cancels the pointer); keyboard clicks still go
// through the click event. The handler keeps its own checks (outside of the card, not in a dialog).
const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = !ev.composedPath().includes(card);
  };
  const onUp = (ev) => {
    if (downOutside) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
    // A tap (press and release at the same spot), for the tests.
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
  };
};
// After the popup closes, clicks are ignored for this long: the second click of a double click on Close would
// otherwise land on what lies under it.
const CLOSE_GUARD_MS = 400;

// ── Picture ──
// The school drawn inline (its CSS animations run in the card's shadow root), animated by what the student's day is
// at: "class" (a lesson going on: the clock hand turns, the flag waves, the windows glow), "canceled" (a lesson of the
// day still to come is canceled: a red badge pops and shakes), "homework" (homework still to do for the next school
// day: the pencil writes on the open book), "done" (all that homework done: a green check is drawn, sparkles
// twinkle), "idle" (still).
const sceneSvg = (state) => {
  const book =
    state === "homework" || state === "done"
      ? `<g class="book"><path d="M50 78q10-4 21 0v19q-11-4-21 0z" fill="var(--pc-page)" stroke="var(--pc-ink)" stroke-width="1"/>
         <path d="M71 78q11-4 21 0v19q-10-4-21 0z" fill="var(--pc-page)" stroke="var(--pc-ink)" stroke-width="1"/>
         <path d="M54 83h13M54 87h13M54 91h9" stroke="var(--pc-line)" stroke-width="1.4" stroke-linecap="round"/>
         <path class="write w1" d="M75 83h13" stroke="var(--pc-accent)" stroke-width="1.4" stroke-linecap="round" pathLength="10"/>
         <path class="write w2" d="M75 87h13" stroke="var(--pc-accent)" stroke-width="1.4" stroke-linecap="round" pathLength="10"/>
         <path class="write w3" d="M75 91h9" stroke="var(--pc-accent)" stroke-width="1.4" stroke-linecap="round" pathLength="10"/>
         ${
           state === "homework"
             ? `<g class="pencil"><path d="M86 68l5 5-11 11-6 1 1-6z" fill="#f5b83d" stroke="var(--pc-ink)" stroke-width=".8"/><path d="M75 79l5 5-6 1z" fill="#3c3c3c"/><path d="M86 68l5 5 2-2-5-5z" fill="#e58b9a"/></g>`
             : ""
         }</g>`
      : "";
  const badge =
    state === "done"
      ? `<g class="badge"><circle cx="78" cy="30" r="10" fill="var(--pc-ok)"/><path class="check" d="M73 30.5l3.5 3.5 6.5-7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" pathLength="20"/></g>
         <g class="sparkles" fill="#f6c343"><path class="s1" d="M90 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/><path class="s2" d="M64 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/><path class="s3" d="M92 42l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></g>`
      : state === "canceled"
        ? `<g class="badge"><g class="shake"><circle cx="78" cy="30" r="10" fill="var(--pc-crit)"/><path d="M74 26l8 8M82 26l-8 8" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></g></g>`
        : "";
  const lit = state === "class";
  return `<svg viewBox="0 0 96 104" role="img" aria-hidden="true" class="scene ${state}">
    <ellipse cx="48" cy="98" rx="40" ry="4" fill="rgba(0,0,0,.14)"/>
    <path d="M48 20V6" stroke="var(--pc-ink)" stroke-width="1.6" stroke-linecap="round"/>
    <path class="flag" d="M48 6h14l-3.5 4 3.5 4H48z" fill="var(--pc-accent)"/>
    <rect x="16" y="46" width="64" height="50" rx="2" fill="var(--pc-wall)"/>
    <rect x="16" y="46" width="64" height="4" fill="var(--pc-trim)"/>
    <path d="M9 48L48 21l39 27z" fill="var(--pc-roof)" stroke="var(--pc-roof-edge)" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="48" cy="37" r="7.5" fill="#fff" stroke="var(--pc-ink)" stroke-width="1.4"/>
    <path d="M48 37h3" stroke="var(--pc-ink)" stroke-width="1.5" stroke-linecap="round"/>
    <path class="hand" d="M48 37v-5" stroke="var(--pc-ink)" stroke-width="1.3" stroke-linecap="round"/>
    <g class="windows${lit ? " lit" : ""}">
      <rect x="22" y="55" width="12" height="10" rx="1.5"/><rect x="62" y="55" width="12" height="10" rx="1.5"/>
      <rect x="22" y="73" width="12" height="10" rx="1.5"/><rect x="62" y="73" width="12" height="10" rx="1.5"/>
    </g>
    <path d="M40 96V76a8 8 0 0 1 16 0v20z" fill="var(--pc-door)"/>
    <rect x="36" y="94" width="24" height="3" rx="1" fill="var(--pc-trim)"/>
    ${book}${badge}
  </svg>`;
};

const SCENE_STYLE = `
  :host { --pc-wall: #f2e6cc; --pc-trim: #d9c7a3; --pc-roof: #c8584a; --pc-roof-edge: #a8463a; --pc-door: #7a5236; --pc-ink: #4a5260;
          --pc-glass: #a9c8e0; --pc-glass-lit: #ffd36b; --pc-page: #ffffff; --pc-line: #c3cad3; }
  :host([dark]) { --pc-wall: #d8c9a8; --pc-trim: #b7a37e; --pc-roof: #b24c40; --pc-roof-edge: #8f3a30; --pc-door: #6a462d; --pc-ink: #3d434d;
                  --pc-glass: #7f9db6; --pc-page: #eef1f4; --pc-line: #a9b1bb; }
  .picture { flex: none; display: flex; align-items: center; justify-content: center; }
  .picture svg { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 4px 8px rgba(0,0,0,.18)); }
  /* On a dark card the soft shadow only shows as a faint rectangle around the picture: the ground ellipse is enough. */
  :host([dark]) .picture svg { filter: none; }
  .scene .windows rect { fill: var(--pc-glass); }
  .scene .windows.lit rect { fill: var(--pc-glass-lit); animation: pc-glow 1.6s ease-in-out infinite alternate; }
  .scene .windows.lit rect:nth-child(2n) { animation-delay: .8s; }
  .scene .hand { transform-box: view-box; transform-origin: 48px 37px; }
  .scene.class .hand { animation: pc-spin 4s linear infinite; }
  .scene .flag { transform-box: view-box; transform-origin: 48px 10px; }
  .scene.class .flag { animation: pc-wave 1s ease-in-out infinite alternate; }
  .scene.canceled .windows rect { fill: color-mix(in srgb, var(--pc-glass) 55%, #555); }
  .scene .badge { transform-box: view-box; transform-origin: 78px 30px; animation: pc-pop .35s cubic-bezier(.3,1.6,.6,1) both; }
  .scene .shake { transform-box: view-box; transform-origin: 78px 30px; animation: pc-shake .5s ease-in-out .4s infinite; }
  .scene .check { stroke-dasharray: 20; animation: pc-draw .5s ease-out .25s both; }
  .scene .sparkles path { transform-box: fill-box; transform-origin: center; animation: pc-twinkle 1.8s ease-in-out infinite; }
  .scene .sparkles .s2 { animation-delay: .6s; } .scene .sparkles .s3 { animation-delay: 1.2s; }
  .scene .write { stroke-dasharray: 10; stroke-dashoffset: 0; }
  .scene.homework .write { animation: pc-write 3s linear infinite; }
  .scene.homework .w2 { animation-name: pc-write2; } .scene.homework .w3 { animation-name: pc-write3; }
  .scene .pencil { transform-box: view-box; }
  .scene.homework .pencil { animation: pc-pencil 3s linear infinite; }
  @keyframes pc-spin { to { transform: rotate(360deg); } }
  @keyframes pc-wave { from { transform: skewY(0deg) scaleX(1); } to { transform: skewY(-8deg) scaleX(.9); } }
  @keyframes pc-glow { from { opacity: .65; } to { opacity: 1; } }
  @keyframes pc-pop { from { transform: scale(0); } to { transform: scale(1); } }
  @keyframes pc-shake { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-9deg); } 75% { transform: rotate(9deg); } }
  @keyframes pc-draw { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
  @keyframes pc-twinkle { 0%, 100% { opacity: 0; transform: scale(.4) rotate(0); } 50% { opacity: 1; transform: scale(1) rotate(45deg); } }
  /* The three lines are written one after the other, the pencil following its tip along them. */
  @keyframes pc-write { 0% { stroke-dashoffset: 10; } 25%, 92% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 10; } }
  @keyframes pc-write2 { 0%, 30% { stroke-dashoffset: 10; } 55%, 92% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 10; } }
  @keyframes pc-write3 { 0%, 60% { stroke-dashoffset: 10; } 78%, 92% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 10; } }
  @keyframes pc-pencil {
    0% { transform: translate(0, 0); } 25% { transform: translate(13px, 0); } 30% { transform: translate(0, 4px); }
    55% { transform: translate(13px, 4px); } 60% { transform: translate(0, 8px); } 78% { transform: translate(9px, 8px); }
    92% { transform: translate(9px, 8px); } 100% { transform: translate(0, 0); }
  }
  .hero { display: flex; gap: 12px; align-items: center; }
  .hero .picture { width: 96px; height: 104px; }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .info .big { font-size: 20px; font-weight: 500; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .info .big.canceled { text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--pc-crit) 70%, transparent); }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 15px; height: 15px; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .line.accent { color: var(--pc-accent-text); }
  .line.accent .icon { color: var(--pc-accent); }
  @container (max-width: 300px) {
    .hero .picture { width: 72px; height: 80px; }
    .hero { gap: 10px; }
  }
  @container (max-width: 200px) {
    .hero .picture { display: none; }
  }
`;

// ── Lessons ──
// A lesson of the day as the cards draw it, from the `lessons` attribute of a timetable sensor.
const lessonState = (l, nowMs) => {
  const start = Date.parse(l.start_at);
  const end = Date.parse(l.end_at);
  const running = !l.canceled && start <= nowMs && nowMs < end;
  return {
    canceled: l.canceled === true,
    changed: !l.canceled && !!l.status,
    running,
    past: Number.isFinite(end) && end <= nowMs,
    progress: running ? Math.round(((nowMs - start) / (end - start)) * 100) : 0,
  };
};

const lessonsOf = (s) =>
  list(s, "lessons")
    .filter((l) => l && typeof l === "object")
    .slice()
    .sort((a, b) => String(a.start_at).localeCompare(String(b.start_at)));

const FOCUS_SELECTOR = "[data-action], [data-entity]";
const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset });
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};

class PronoteBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._toggled = new Map();
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // No rewrite of the card between the press and the release: Home Assistant updates the card several times a
    // second, and a rewrite under the pointer replaces the element pressed, so that the click lands on the card
    // itself and does nothing. The pending render is done once released (after the click).
    this._onPressStart = () => {
      this._byPointer = true;
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    };
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        this._pressing = false;
        if (!this._dirty) return;
        this._dirty = false;
        this._update();
      }, 0);
    };
    this.shadowRoot.addEventListener("pointerdown", this._onPressStart);
    // Enter / Space on an element with the button role acts as a click, as on a <button>.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      // The focus is kept across rewrites for the keyboard only (no focus ring after a mouse click or a tap).
      this._byPointer = false;
      if ((ev.key !== "Enter" && ev.key !== " ") || ev.target?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      ev.target.click();
    });
    // Escape closes the popup, listened on the window while it is open.
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._popup) return;
      ev.stopPropagation();
      this._closePopup();
    };
  }

  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (deps && prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // What a render reads from hass: registries, language, theme, the students' states, and the minute (the lesson
  // going on and its progress move on their own).
  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const { students } = findStudents(h, this._config);
    if (!students) return null;
    const ids = students.flatMap((s) => [...Object.values(s.entities), ...Object.values(s.periods || {}).flatMap((p) => Object.values(p))]);
    return [h.entities, h.devices, h.language, h.locale, h.themes?.darkMode, Math.floor(now() / 60000), ...ids.map((id) => h.states[id])];
  }

  // A click elsewhere on the page folds the sections back to their defaults and closes the popup.
  connectedCallback() {
    this._onOutside ??= (ev) => {
      if ((!this._toggled.size && !this._popup) || !isOutside(this, ev)) return;
      this._toggled = new Map();
      if (this._popup) this._closePopup();
      else this._update();
    };
    this._outside ??= watchOutside(this, (ev) => this._onOutside(ev));
    this._outside.on();
    if (this._popup) window.addEventListener("keydown", this._onKey);
    // Back on the page after leaving it: rendered again in its default state.
    this._update();
    clearInterval(this._tick);
    this._tick = setInterval(() => {
      if (this._hass) this.hass = this._hass;
    }, 30000);
  }

  disconnectedCallback() {
    clearInterval(this._tick);
    this._tick = null;
    this._outside?.off();
    window.removeEventListener("keydown", this._onKey);
    this._pressing = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back unfolded or with its popup open.
    this._toggled = new Map();
    this._popup = null;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._lastDeps = null;
    this._update();
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _locale() {
    return intlLocale(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  _update() {
    if (!this._hass || !this._config) return;
    // A press in progress: drawn once released (see _onPressStart).
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this.toggleAttribute?.("dark", !!this._hass.themes?.darkMode);
    let html = this._render();
    if (this._popup) {
      const popup = this._popupHtml();
      if (popup) html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${popup}</ha-card>`);
      else this._popup = null;
    }
    if (html === this._html) return;
    const kept = this._popup || this._byPointer ? null : this._focusedSpot();
    this._html = html;
    this.shadowRoot.innerHTML = html;
    if (kept) this._restoreFocus(kept);
    if (this._popup) this.shadowRoot.querySelector('.modal [data-action="popup_close"]')?.focus?.({ preventScroll: true });
  }

  // The focused element, as what finds it again in the next render (its tag, data attributes and rank).
  _focusedSpot() {
    const el = this.shadowRoot.activeElement;
    if (!el?.dataset) return null;
    const key = focusKey(el);
    if (!key) return null;
    const index = this._focusables(key).indexOf(el);
    return index < 0 ? null : { key, index };
  }

  _focusables(key) {
    return [...this.shadowRoot.querySelectorAll(FOCUS_SELECTOR)].filter((n) => focusKey(n) === key);
  }

  _restoreFocus({ key, index }) {
    this._focusables(key)[index]?.focus?.({ preventScroll: true });
  }

  _onClick(ev) {
    // The click ends the press: what it changes is drawn at once.
    this._pressing = false;
    if (ev.detail === 0) this._byPointer = false;
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!this._popup && now() - (this._popupClosedAt ?? 0) < CLOSE_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    // Popup open: only its Close button, its links and the backdrop itself act.
    if (this._popup) {
      if (path.some((n) => n.tagName === "A")) return;
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "popup_close" || (action === "popup_backdrop" && path[0] === el)) this._closePopup();
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const d = el.dataset;
    switch (d.action) {
      case "zoom":
        return this._toggleZoom(ev);
      case "student":
        this._student = d.id;
        return this._update();
      case "tab":
        this._tab = d.tab;
        if (this._setZoom && !this._zoomed) return this._setZoom(true);
        return this._update();
      case "day":
        this._day = d.day;
        return this._update();
      case "period":
        this._period = d.period;
        return this._update();
      case "toggle_section":
        this._toggled = new Map(this._toggled).set(d.section, !this._isCollapsed(d.section));
        return this._update();
      case "homework":
        return this._openPopup({ entity: d.entity, index: Number(d.index) });
      default:
        if (d.entity) this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: d.entity }, bubbles: true, composed: true }));
    }
  }

  _openPopup(popup) {
    this._popup = popup;
    window.addEventListener("keydown", this._onKey);
    this._update();
  }

  _closePopup() {
    this._popup = null;
    this._popupClosedAt = now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  _toggleZoom() {}

  // ── Data of the student shown ──
  // The students of the card, the one shown and its days, or the error card.
  _context() {
    const found = findStudents(this._hass, this._config);
    if (found.error) return { error: this._errorCard(found.error, found.ref) };
    const s = this._current(found.students);
    return { students: found.students, s, days: this._days(s) };
  }

  _current(students) {
    return students.find((s) => s.id === this._student) || students[0];
  }

  // Today's lessons, and the next school day's (Pronote's "next day" sensor, else tomorrow's).
  _days(s) {
    const e = s.entities;
    const today = todayKey();
    const todays = lessonsOf(this._s(e.lessons_today)).filter((l) => !keyOf(l.start_at) || keyOf(l.start_at) === today);
    let next = lessonsOf(this._s(e.lessons_next_day));
    if (!next.length) next = lessonsOf(this._s(e.lessons_tomorrow));
    const nextKey = keyOf(next[0]?.start_at) || addDays(today, 1);
    return { today, todays, nextKey, next: nextKey === today ? [] : next };
  }

  // The day the timetable opens on: today while a lesson is still to come or going on, else the next school day.
  _autoDay(days) {
    const t0 = now();
    return days.todays.some((l) => !l.canceled && Date.parse(l.end_at) > t0) ? "today" : "next";
  }

  // The lesson going on or the next one (not canceled), today or else on the next school day, with the changes of
  // that day still to come.
  _nextLesson(s, days) {
    const t0 = now();
    const upcoming = (ls) => ls.filter((l) => Date.parse(l.end_at) > t0);
    let day = "today";
    let rest = upcoming(days.todays);
    if (!rest.some((l) => !l.canceled)) {
      day = "next";
      rest = days.next;
    }
    const lesson = rest.find((l) => !l.canceled);
    const changes = rest.filter((l) => l !== lesson && (l.canceled || l.status));
    const entity = day === "today" ? s.entities.lessons_today : s.entities.lessons_next_day || s.entities.lessons_tomorrow;
    return { day, lesson, changes, entity };
  }

  // What the picture shows (see sceneSvg).
  _sceneState(s, days, next) {
    if (next.lesson && lessonState(next.lesson, now()).running) return "class";
    if (next.changes.some((l) => l.canceled)) return "canceled";
    const hw = this._homework(s).filter((h) => keyOf(h.date) === days.nextKey);
    if (hw.some((h) => !h.done)) return "homework";
    if (hw.length) return "done";
    return "idle";
  }

  // Picture, current or next lesson, the changes of that day still to come and the homework for the next school day.
  _hero(s, days) {
    const locale = this._locale();
    const tr = (k) => this._t(k);
    const next = this._nextLesson(s, days);
    const l = next.lesson;
    const lines = [];
    if (l) {
      const st = lessonState(l, now());
      const start = l.start_time || timeOf(l.start_at);
      const end = l.end_time || timeOf(l.end_at);
      const when = st.running
        ? this._t("now_until", { end })
        : next.day === "next"
          ? `${dayLabel(tr, locale, days.nextKey)} · ${start} – ${end}`
          : this._t("next_at", { start, end });
      const room = this._config.show_room !== false ? l.classroom || "" : "";
      lines.push(`<div class="line${st.running ? " accent" : ""}">${svgIcon("clock")}<span>${esc(when)}</span></div>`);
      if (room) lines.push(`<div class="line">${svgIcon("room")}<span>${esc(room)}</span></div>`);
      if (l.status) lines.push(`<div class="alert-line warn">${svgIcon("swap")}<span>${esc(l.status)}</span></div>`);
    }
    for (const c of next.changes.slice(0, 2))
      lines.push(
        `<div class="alert-line ${c.canceled ? "crit" : "warn"}">${svgIcon(c.canceled ? "cancel" : "swap")}<span>${esc(
          `${c.start_time || timeOf(c.start_at)} ${c.lesson || "—"} — ${c.status || this._t("canceled")}`,
        )}</span></div>`,
      );
    if (s.entities.homework) {
      const hw = this._homework(s).filter((h) => keyOf(h.date) === days.nextKey);
      const left = hw.filter((h) => !h.done).length;
      const text = !hw.length
        ? this._t("no_homework_for", { day: dayLabel(tr, locale, days.nextKey) })
        : left
          ? this._t("homework_left", { n: left, day: dayLabel(tr, locale, days.nextKey) })
          : this._t("homework_done", { day: dayLabel(tr, locale, days.nextKey) });
      lines.push(`<div class="line clickable" role="button" tabindex="0" data-action="tab" data-tab="homework">${svgIcon(left ? "homework" : "check")}<span>${esc(text)}</span></div>`);
    }
    const state = this._sceneState(s, days, next);
    const picture =
      this._config.show_picture !== false
        ? `<div class="picture clickable" role="button" tabindex="0" aria-label="${esc(this._t(`scene_${state}`))}" data-entity="${esc(next.entity || s.entities.homework || "")}">${sceneSvg(state)}</div>`
        : "";
    const subject = l ? (l.detention && l.lesson === "RETENUE" ? this._t("detention") : l.lesson || "—") : this._t("no_more_lessons");
    return `<div class="hero">${picture}<div class="info"><div class="big">${esc(subject)}</div>${lines.join("")}</div></div>`;
  }

  _homework(s) {
    return list(this._s(s.entities.homework), "homework").filter((h) => h && typeof h === "object");
  }

  _iconState(days) {
    const ls = [...days.todays, ...days.next];
    if (ls.some((l) => l.canceled)) return "crit";
    if (ls.some((l) => !l.canceled && l.status)) return "warn";
    return "";
  }

  // Status chip at the right of the header: homework still to do.
  _chip(s) {
    const st = this._s(s.entities.homework);
    if (!st) return "";
    if (!valid(st)) return this._chipHtml("idle", this._t("unavailable"), st.entity_id);
    const todo = this._homework(s).filter((h) => !h.done).length;
    return this._chipHtml(todo ? "active" : "ok", todo ? this._t("to_do", { n: todo }) : this._t("all_done"), st.entity_id);
  }

  _chipHtml(cls, text, entity) {
    return `<span class="chip clickable ${cls}" role="button" tabindex="0" data-entity="${esc(entity)}" title="${esc(text)}" aria-label="${esc(text)}"><span class="dot"></span><span class="chip-text">${esc(text)}</span></span>`;
  }

  _subtitle(s) {
    const cls = this._s(s.entities.class);
    if (!valid(cls)) return "";
    return [cls.attributes?.class_name || cls.state, cls.attributes?.establishment].filter(Boolean).join(" · ");
  }

  _header(s, students, days) {
    const c = this._config;
    // The title is the student shown (the one of the selected tab when the card shows several).
    const title = (students.length === 1 && c.title) || studentName(this._hass, s);
    const sub = this._subtitle(s);
    const state = this._iconState(days);
    return `
      <div class="header">
        <div class="type-icon${state ? ` ${state}` : ""}">${svgIcon("school")}</div>
        <div class="titles">
          <div class="name">${esc(title)}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>
        ${this._chip(s)}
        ${this._zoomButton()}
      </div>`;
  }

  _zoomButton() {
    return "";
  }

  // One text tab per student when the card shows several.
  _studentTabs(s, students) {
    if (students.length < 2) return "";
    return `<div class="tabs students" role="tablist" aria-label="${esc(this._t("students"))}">${students
      .map(
        (x) =>
          `<button class="tab" role="tab" data-action="student" data-id="${esc(x.id)}" aria-selected="${x === s}">${esc(studentName(this._hass, x))}</button>`,
      )
      .join("")}</div>`;
  }

  _errorCard(key, ref) {
    const text = key === "unknown_device" ? `${this._t(key)}: ${ref}` : this._t(key);
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(text)}</div></ha-card>`;
  }

  // ── Lessons ──
  _lesson(l, entity, { compact = false } = {}) {
    const c = this._config;
    const st = lessonState(l, now());
    const cls = st.canceled ? "canceled" : st.changed ? "changed" : st.running ? "now" : "";
    const meta = [];
    const room = l.classroom || (Array.isArray(l.classrooms) ? l.classrooms.join(", ") : "");
    if (c.show_room !== false && room) meta.push(`<span>${svgIcon("room")}${esc(room)}</span>`);
    const teacher = l.teacher_name || (Array.isArray(l.teacher_names) ? l.teacher_names.join(", ") : "");
    if (c.show_teacher !== false && teacher && !compact) meta.push(`<span class="narrow-hide">${svgIcon("teacher")}${esc(teacher)}</span>`);
    let chip = "";
    if (st.canceled) chip = this._tag("crit", l.status || this._t("canceled"), "cancel");
    else if (st.changed) chip = this._tag("warn", l.status, "swap");
    else if (l.test) chip = this._tag("active", this._t("test"), "test");
    else if (l.detention) chip = this._tag("warn", this._t("detention"), "gavel");
    else if (l.outing) chip = this._tag("active", this._t("outing"));
    else if (l.exempted) chip = this._tag("idle", this._t("exempted"));
    const subject = l.detention && l.lesson === "RETENUE" ? this._t("detention") : l.lesson || "—";
    const label = [l.start_time, subject, st.canceled ? this._t("canceled") : st.changed ? l.status : ""].filter(Boolean).join(", ");
    const classes = ["lesson", cls || (st.past ? "past" : "")].filter(Boolean).join(" ");
    return `<div class="${classes}" style="--sc:${colorOf(l.background_color)}" role="button" tabindex="0" data-entity="${esc(entity)}" aria-label="${esc(label)}">
        <div class="time"><span>${esc(l.start_time || timeOf(l.start_at))}</span><span class="end">${esc(l.end_time || timeOf(l.end_at))}</span>${st.running ? '<span class="pulse"></span>' : ""}</div>
        <div class="stripe"></div>
        <div class="body"><div class="subj">${esc(subject)}</div>${meta.length ? `<div class="meta">${meta.join("")}</div>` : ""}${
          st.running ? `<div class="progress" role="progressbar" aria-valuenow="${st.progress}" aria-valuemin="0" aria-valuemax="100"><div style="width:${st.progress}%"></div></div>` : ""
        }</div>
        ${chip}
      </div>`;
  }

  _tag(cls, text, icon) {
    return `<span class="chip ${cls}" title="${esc(text)}">${icon ? svgIcon(icon) : '<span class="dot"></span>'}<span class="chip-text">${esc(text)}</span></span>`;
  }

  // The lessons of a day with the lunch break between the morning and the afternoon.
  _lessonList(lessons, entity) {
    const shown = this._config.show_canceled === false ? lessons.filter((l) => !l.canceled) : lessons;
    if (!shown.length) return `<div class="empty">${esc(this._t("no_lessons"))}</div>`;
    const out = [];
    shown.forEach((l, i) => {
      const prev = shown[i - 1];
      if (prev?.is_morning && l.is_afternoon) out.push(`<div class="break">${svgIcon("food")}<span>${esc(this._t("lunch_break"))}</span></div>`);
      out.push(this._lesson(l, entity));
    });
    return `<div class="lessons">${out.join("")}</div>`;
  }

  // ── Homework ──
  _hwItem(h, index, entity, { compact = false } = {}) {
    const files = Array.isArray(h.files) && h.files.length;
    const status = this._t(h.done ? "done" : "not_done");
    return `<div class="hw${h.done ? " done" : ""}" style="--sc:${colorOf(h.background_color)}" role="button" tabindex="0" data-action="homework" data-entity="${esc(entity)}" data-index="${index}" aria-label="${esc(`${h.subject || "—"}, ${status}`)}">
        ${svgIcon(h.done ? "check" : "circle")}
        <div class="main"><div class="subj"><span class="sdot"></span><span>${esc(h.subject || "—")}</span></div>${
          h.short_description || h.description ? `<div class="desc">${esc(h.short_description || h.description)}</div>` : ""
        }</div>
        ${files && !compact ? svgIcon("paperclip", "clip") : "<span></span>"}
      </div>`;
  }

  _popupHtml() {
    const { entity, index } = this._popup;
    const h = list(this._s(entity), "homework").filter((x) => x && typeof x === "object")[index];
    if (!h) return "";
    const locale = this._locale();
    const due = keyOf(h.date);
    const files = (Array.isArray(h.files) ? h.files : []).filter((f) => safeUrl(f?.url));
    return `<div class="backdrop" data-action="popup_backdrop">
        <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(h.subject || "—")}">
          <div class="m-title" style="--sc:${colorOf(h.background_color)}"><span class="sdot"></span><span>${esc(h.subject || "—")}</span></div>
          <div class="m-sub">${due ? `<span>${esc(this._t("due", { day: dayLabel((k) => this._t(k), locale, due) }))}</span>` : ""}${this._tag(
            h.done ? "ok" : "active",
            this._t(h.done ? "done" : "not_done"),
          )}</div>
          <div class="msg">${esc(h.description || h.short_description || "")}</div>
          ${
            files.length
              ? `<div class="files"><div class="label"><span>${esc(this._t("files"))}</span></div>${files
                  .map((f) => `<a href="${esc(safeUrl(f.url))}" target="_blank" rel="noopener noreferrer">${svgIcon("paperclip")}<span>${esc(f.name || f.url)}</span></a>`)
                  .join("")}</div>`
              : ""
          }
          <div class="modal-actions"><button class="btn" data-action="popup_close">${svgIcon("close")}<span>${esc(this._t("close"))}</span></button></div>
        </div>
      </div>`;
  }
}

// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------

class PronoteCard extends PronoteBase {
  static getConfigElement() {
    return document.createElement("pronote-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 9;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  _tabs() {
    const c = this._config.tabs;
    const tabs = (Array.isArray(c) ? c : c ? [c] : TABS).filter((x) => TABS.includes(x));
    return tabs.length ? tabs : TABS;
  }

  _isCollapsed(key) {
    if (this._toggled.has(key)) return this._toggled.get(key);
    const c = this._config.collapsed ?? DEFAULT_COLLAPSED;
    return (Array.isArray(c) ? c : [c]).includes(key);
  }

  _sectionTitle(key, icon, label, count = "") {
    const closed = this._isCollapsed(key);
    return `<div class="section-title" role="button" tabindex="0" data-action="toggle_section" data-section="${key}" aria-expanded="${!closed}">${svgIcon(icon)}<span>${esc(
      label,
    )}</span>${count !== "" ? `<span class="count">· ${esc(count)}</span>` : ""}${svgIcon("chevron_down", "chevron")}</div>`;
  }

  _section(key, icon, label, body, count = "") {
    return `<div class="section">${this._sectionTitle(key, icon, label, count)}${this._isCollapsed(key) ? "" : body}</div>`;
  }

  _render() {
    const ctx = this._context();
    if (ctx.error) return ctx.error;
    const { students, s, days } = ctx;
    const tabs = this._tabs();
    const tab = tabs.includes(this._tab) ? this._tab : tabs.includes(this._config.default_tab) ? this._config.default_tab : tabs[0];
    const todo = this._homework(s).filter((h) => !h.done).length;
    const tabBar =
      tabs.length > 1
        ? `<div class="tabs sections" role="tablist" aria-label="${esc(this._t("sections"))}">${tabs
            .map(
              (x) =>
                `<button class="tab" role="tab" data-action="tab" data-tab="${x}" aria-selected="${x === tab}">${svgIcon(TAB_ICONS[x])}<span>${esc(this._t(x))}</span>${
                  x === "homework" && todo ? `<span class="badge">${todo}</span>` : ""
                }</button>`,
            )
            .join("")}</div>`
        : "";
    const body = { timetable: () => this._timetable(s, days), homework: () => this._homeworkTab(s), grades: () => this._grades(s), school_life: () => this._schoolLife(s) }[tab]();
    return `<style>${BASE_STYLE}${SCENE_STYLE}${FULL_STYLE}${DIALOG_STYLE}</style>
      <ha-card>
        ${this._header(s, students, days)}
        ${this._studentTabs(s, students)}
        <div class="content hero-wrap">${this._hero(s, days)}</div>
        ${tabBar}
        <div class="content">${body}</div>
      </ha-card>`;
  }

  _timetable(s, days) {
    const e = s.entities;
    if (!e.lessons_today && !e.lessons_next_day && !e.lessons_tomorrow) return `<div class="empty">${esc(this._t("no_lessons"))}</div>`;
    const locale = this._locale();
    const day = this._day === "today" || this._day === "next" ? this._day : this._autoDay(days);
    const lessons = day === "today" ? days.todays : days.next;
    const entity = day === "today" ? e.lessons_today : e.lessons_next_day || e.lessons_tomorrow;
    const tr = (k) => this._t(k);
    const real = lessons.filter((l) => !l.canceled);
    const hours = real.length ? `${real[0].start_time || timeOf(real[0].start_at)} – ${real.at(-1).end_time || timeOf(real.at(-1).end_at)}` : "";
    const btn = (key, label) =>
      `<button class="btn" data-action="day" data-day="${key}" aria-pressed="${day === key}">${esc(label)}</button>`;
    return `<div class="daybar">${btn("today", tr("today"))}${btn("next", dayLabel(tr, locale, days.nextKey))}${hours ? `<span class="hours">${esc(hours)}</span>` : ""}</div>
      ${this._lessonList(lessons, entity)}`;
  }

  _homeworkTab(s) {
    const entity = s.entities.homework;
    if (!entity) return `<div class="empty">${esc(this._t("no_homework"))}</div>`;
    const all = this._homework(s);
    const shown = all.map((h, i) => [h, i]).filter(([h]) => this._config.show_done_homework !== false || !h.done);
    const todo = all.filter((h) => !h.done).length;
    const locale = this._locale();
    const tr = (k) => this._t(k);
    const summary = `<div class="summary">${this._tag(todo ? "active" : "ok", todo ? this._t("to_do", { n: todo }) : this._t("all_done"))}${
      all.length - todo ? this._tag("ok", this._t("done_count", { n: all.length - todo })) : ""
    }</div>`;
    if (!shown.length) return `${all.length ? summary : ""}<div class="empty">${esc(this._t("no_homework"))}</div>`;
    const groups = new Map();
    for (const item of shown) {
      const k = keyOf(item[0].date);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(item);
    }
    const html = [...groups]
      .map(([k, items]) => {
        const left = items.filter(([h]) => !h.done).length;
        return `<div class="hw-day"><div class="label">${svgIcon("calendar")}<span>${esc(k ? dayLabel(tr, locale, k) : "—")}</span>${
          left ? `<span class="aside">${esc(this._t("to_do", { n: left }))}</span>` : ""
        }</div><div class="hw-list">${items.map(([h, i]) => this._hwItem(h, i, entity)).join("")}</div></div>`;
      })
      .join("");
    return `${summary}${html}`;
  }

  // The past periods of the student (oldest first), with their name: from the integration's "Periods" sensor, else
  // from the key ("trimestre_1" → "Trimestre 1").
  _pastPeriods(s) {
    const keys = Object.keys(s.periods || {});
    if (!keys.length) return [];
    const known = list(this._s(s.entities.periods), "periods").filter((p) => p && typeof p === "object");
    const named = (key) => known.find((p) => p.id === key);
    const rank = (key) => {
      const p = named(key);
      return p ? `0${p.start || ""}${String(known.indexOf(p)).padStart(3, "0")}` : `1${key}`;
    };
    return keys
      .sort((a, b) => rank(a).localeCompare(rank(b), undefined, { numeric: true }))
      .map((key) => ({ key, name: named(key)?.name || upperFirst(key.replace(/_/g, " ")) }));
  }

  // Period buttons above the grades: the past periods, then the current one ("" for it).
  _periodBar(past, current, chosen) {
    const btn = (key, label) => `<button class="btn" data-action="period" data-period="${esc(key)}" aria-pressed="${chosen === key}">${esc(label)}</button>`;
    return `<div class="daybar periodbar" role="group" aria-label="${esc(this._t("period"))}">${past.map((p) => btn(p.key, p.name)).join("")}${btn("", current)}</div>`;
  }

  _grades(s) {
    const locale = this._locale();
    const c = this._config;
    const parts = [];
    // The period shown: the current one, or a past one picked with the period buttons (show_periods).
    const past = c.show_periods !== false ? this._pastPeriods(s) : [];
    const chosen = past.find((p) => p.key === this._period);
    const period = this._s(s.entities.current_period);
    const e = chosen ? { ...s.periods[chosen.key] } : s.entities;
    const currentName = valid(period) ? period.state : "";
    const periodName = chosen ? chosen.name : currentName;
    if (past.length) parts.push(this._periodBar(past, currentName || this._t("current_period"), chosen ? chosen.key : ""));
    const overall = this._s(e.overall_average);
    const ov = valid(overall) ? parseNum(overall.state) : null;
    if (ov !== null) {
      parts.push(`<div class="overall ${gradeClass(ov)} clickable" role="button" tabindex="0" data-entity="${esc(e.overall_average)}">
          <div class="big">${esc(fmtNum(ov, locale))}<small>/20</small></div>
          <div class="what"><b>${esc(this._t("overall_average"))}</b>${periodName ? `<span>${esc(periodName)}</span>` : ""}</div>
        </div>`);
    }
    const minMax = (lo, hi) =>
      c.show_min_max !== false && (lo !== null || hi !== null) ? this._t("class_min_max", { min: fmtNum(lo, locale), max: fmtNum(hi, locale) }) : "";
    if (e.grades) {
      const max = Number.isFinite(Number(c.max_grades)) && Number(c.max_grades) > 0 ? Number(c.max_grades) : DEFAULT_MAX_GRADES;
      const grades = list(this._s(e.grades), "grades").slice(0, max);
      const rows = grades.length
        ? `<div class="rows">${grades
            .map((g) => {
              const v = parseNum(g.grade);
              const out = parseNum(g.out_of) ?? 20;
              const avg = parseNum(g.class_average);
              const coef = c.show_coefficient !== false ? parseNum(g.coefficient) : null;
              const mm = minMax(parseNum(g.min), parseNum(g.max));
              const k = keyOf(g.date);
              const t2 = [k ? shortDay(k, locale) : "", coef !== null ? this._t("coef", { v: fmtNum(coef, locale) }) : "", g.comment].filter(Boolean).join(" · ");
              return `<div class="row clickable" role="button" tabindex="0" data-entity="${esc(e.grades)}">
                  <div class="main"><div class="t1"><span>${esc(g.subject || "—")}</span></div>${t2 ? `<div class="t2">${esc(t2)}</div>` : ""}</div>
                  <div class="end"><span class="grade ${gradeClass(v, out)}">${esc(v === null ? g.grade : fmtNum(v, locale))}<small>/${esc(fmtNum(out, locale))}</small></span>${
                    c.show_class_average !== false && avg !== null ? `<small>${esc(this._t("class_avg", { v: fmtNum(avg, locale) }))}</small>` : ""
                  }${mm ? `<small class="mm">${esc(mm)}</small>` : ""}</div>
                </div>`;
            })
            .join("")}</div>`
        : `<div class="empty">${esc(this._t("no_grades"))}</div>`;
      parts.push(this._section("grades", "star", this._t("latest_grades"), rows));
    }
    if (e.averages) {
      const avgs = list(this._s(e.averages), "averages");
      const rows = avgs.length
        ? `<div class="rows">${avgs
            .map((a) => {
              const v = parseNum(a.average);
              const out = parseNum(a.out_of) ?? 20;
              const cl = parseNum(a.class);
              const mm = minMax(parseNum(a.min), parseNum(a.max));
              const pct = (x) => Math.max(0, Math.min(100, Math.round((x / out) * 100)));
              return `<div class="avg clickable ${gradeClass(v, out)}" role="button" tabindex="0" data-entity="${esc(e.averages)}" style="--sc:${colorOf(a.background_color)}">
                  <div class="s"><span class="sdot row-dot" style="width:8px;height:8px;border-radius:50%;background:var(--sc);flex:none"></span><span>${esc(a.subject || "—")}</span></div>
                  <div class="track">${v !== null ? `<div class="fill" style="width:${pct(v)}%"></div>` : ""}${
                    c.show_class_average !== false && cl !== null ? `<div class="class" style="left:${pct(cl)}%" title="${esc(this._t("class_avg", { v: fmtNum(cl, locale) }))}"></div>` : ""
                  }</div>
                  <div class="v">${esc(v === null ? a.average || "—" : fmtNum(v, locale))}</div>${mm ? `<div class="mm">${esc(mm)}</div>` : ""}
                </div>`;
            })
            .join("")}</div>${c.show_class_average !== false ? `<div class="legend"><i></i><span>${esc(this._t("class_average"))}</span></div>` : ""}`
        : `<div class="empty">${esc(this._t("no_grades"))}</div>`;
      parts.push(this._section("averages", "average", this._t("averages"), rows));
    }
    if (e.evaluations) {
      const evals = list(this._s(e.evaluations), "evaluations");
      const rows = evals.length
        ? `<div class="rows">${evals
            .map((ev) => {
              const k = keyOf(ev.date);
              const acq = (Array.isArray(ev.acquisitions) ? ev.acquisitions : [])
                .map((a) => `<span class="chip ${levelClass(a)}" title="${esc([a.name, a.level].filter(Boolean).join(" — "))}">${esc(a.abbreviation || a.level || "?")}</span>`)
                .join("");
              return `<div class="row clickable" role="button" tabindex="0" data-entity="${esc(e.evaluations)}">
                  <div class="main"><div class="t1"><span>${esc(ev.subject || "—")}</span></div><div class="t2">${esc([ev.name, k ? shortDay(k, locale) : ""].filter(Boolean).join(" · "))}</div></div>
                  <div class="acq">${acq}</div>
                </div>`;
            })
            .join("")}</div>`
        : `<div class="empty">${esc(this._t("nothing"))}</div>`;
      parts.push(this._section("evaluations", "eval", this._t("evaluations"), rows));
    }
    return parts.join("") || `<div class="empty">${esc(this._t("no_grades"))}</div>`;
  }

  // `tilesOnly`: the counters alone (the panel's Today tab).
  _schoolLife(s, { tilesOnly = false } = {}) {
    const e = s.entities;
    const locale = this._locale();
    const absences = list(this._s(e.absences), "absences");
    const delays = list(this._s(e.delays), "delays");
    const punishments = list(this._s(e.punishments), "punishments");
    const infos = list(this._s(e.information), "information_and_surveys");
    const unread = infos.filter((i) => i && i.read === false).length;
    const unjustified = absences.filter((a) => a && !a.justified).length + delays.filter((d) => d && !d.justified).length;
    const tile = (id, icon, label, v, cls = "") =>
      id
        ? `<div class="tile clickable ${cls}" role="button" tabindex="0" data-entity="${esc(id)}"><div class="k">${svgIcon(icon)}<span>${esc(label)}</span></div><div class="v">${esc(v)}</div></div>`
        : "";
    const parts = [
      `<div class="tiles">${[
        tile(e.absences, "absence", this._t("absences"), absences.length, absences.some((a) => !a.justified) ? "warn" : ""),
        tile(e.delays, "delay", this._t("delays"), delays.length, delays.some((d) => !d.justified) ? "warn" : ""),
        tile(e.punishments, "gavel", this._t("punishments"), punishments.length, punishments.length ? "crit" : ""),
        tile(e.information, "info", this._t("information"), unread, unread ? "active" : ""),
      ].join("")}</div>`,
    ];
    if (tilesOnly) return parts[0];
    const justified = (j) => this._tag(j ? "ok" : "warn", this._t(j ? "justified" : "unjustified"));
    const empty = `<div class="empty">${esc(this._t("nothing"))}</div>`;
    const rows = (items, fn) => (items.length ? `<div class="rows">${items.map(fn).join("")}</div>` : empty);
    const when = (iso) => {
      const k = keyOf(iso);
      return k ? `${shortDay(k, locale)}${timeOf(iso) ? ` ${timeOf(iso)}` : ""}` : "";
    };
    if (e.absences) {
      const body = rows(absences, (a) => {
        const from = when(a.from);
        const to = keyOf(a.to) && keyOf(a.to) !== keyOf(a.from) ? when(a.to) : timeOf(a.to);
        return `<div class="row clickable" role="button" tabindex="0" data-entity="${esc(e.absences)}"><div class="main"><div class="t1"><span>${esc(
          [from, to].filter(Boolean).join(" – "),
        )}</span></div><div class="t2">${esc([a.hours, a.reason].filter(Boolean).join(" · "))}</div></div><div class="end">${justified(a.justified)}</div></div>`;
      });
      parts.push(this._section("absences", "absence", this._t("absences"), body, unjustified ? this._t("unjustified_count", { n: absences.filter((a) => !a.justified).length }) : ""));
    }
    if (e.delays) {
      const body = rows(delays, (d) => {
        const min = parseNum(d.minutes);
        return `<div class="row clickable" role="button" tabindex="0" data-entity="${esc(e.delays)}"><div class="main"><div class="t1"><span>${esc(when(d.date))}</span></div><div class="t2">${esc(
          [min !== null ? fmtUnit(min, "minute", locale) : "", d.justification || d.reasons].filter(Boolean).join(" · "),
        )}</div></div><div class="end">${justified(d.justified)}</div></div>`;
      });
      parts.push(this._section("delays", "delay", this._t("delays"), body));
    }
    if (e.punishments) {
      const body = rows(punishments, (p) => {
        const reasons = Array.isArray(p.reasons) ? p.reasons.join(", ") : p.reasons;
        return `<div class="row clickable" role="button" tabindex="0" data-entity="${esc(e.punishments)}"><div class="main"><div class="t1"><span>${esc(p.nature || "—")}</span></div><div class="t2">${esc(
          [keyOf(p.date) ? shortDay(keyOf(p.date), locale) : "", reasons, p.giver].filter(Boolean).join(" · "),
        )}</div></div></div>`;
      });
      parts.push(this._section("punishments", "gavel", this._t("punishments"), body));
    }
    if (e.menus) parts.push(this._section("menus", "food", this._t("menus"), this._menu(e.menus)));
    if (e.information) {
      const body = rows(infos.slice(0, 5), (i) => {
        const k = keyOf(i.creation_date || i.start_date);
        return `<div class="row clickable" role="button" tabindex="0" data-entity="${esc(e.information)}"><div class="main"><div class="t1">${
          i.read === false ? '<span class="unread"></span>' : ""
        }<span>${esc(i.title || "—")}</span></div><div class="t2">${esc([i.author, k ? shortDay(k, locale) : ""].filter(Boolean).join(" · "))}</div></div></div>`;
      });
      parts.push(this._section("information", "info", this._t("information"), body, unread ? this._t("unread", { n: unread }) : ""));
    }
    return parts.join("");
  }

  // Today's menu, else the next one.
  _menu(entity) {
    const today = todayKey();
    const menus = list(this._s(entity), "menus").filter((m) => m && keyOf(m.date) >= today);
    menus.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const m = menus.find((x) => x.is_lunch !== false) || menus[0];
    if (!m) return `<div class="empty">${esc(this._t("nothing"))}</div>`;
    const courses = [
      ["first_meal", "starter"],
      ["main_meal", "main"],
      ["side_meal", "side"],
      ["cheese", "cheese"],
      ["dessert", "dessert"],
      ["other_meal", "other"],
    ]
      .map(([k, label]) => [label, (Array.isArray(m[k]) ? m[k] : []).map((f) => f?.name).filter(Boolean)])
      .filter(([, foods]) => foods.length);
    const tr = (k) => this._t(k);
    return `<div class="menu clickable" role="button" tabindex="0" data-entity="${esc(entity)}"><div class="label"><span>${esc(dayLabel(tr, this._locale(), keyOf(m.date)))}</span></div>${courses
      .map(([label, foods]) => `<div class="course"><span class="k">${esc(this._t(label))}</span><span>${esc(foods.join(", "))}</span></div>`)
      .join("")}</div>`;
  }
}

// ---------------------------------------------------------------------------
// Mini card: next lesson and homework of the next school day
// ---------------------------------------------------------------------------

// The mini card is a full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
class PronoteMiniCard extends PronoteCard {
  constructor() {
    super();
    this._onUnzoom = (ev) => {
      if (this._zoomed && isOutside(this, ev)) this._setZoom(false);
    };
  }

  static getConfigElement() {
    return document.createElement("pronote-mini-card-editor");
  }

  connectedCallback() {
    this._unzoom ??= watchOutside(this, this._onUnzoom);
    this._unzoom.on();
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom?.off();
    // Back to the compact view once off the screen.
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 4;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? "collapse" : "expand")}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    this._update();
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
  }

  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev?.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus?.({ preventScroll: true });
  }

  _render() {
    if (this._zoomed) return super._render();
    const ctx = this._context();
    if (ctx.error) return ctx.error;
    const { students, s, days } = ctx;
    const tr = (k) => this._t(k);
    const hwEntity = s.entities.homework;
    const hw = this._homework(s)
      .map((h, i) => [h, i])
      .filter(([h]) => keyOf(h.date) === days.nextKey);
    const left = hw.filter(([h]) => !h.done).length;
    const hwBlock = hw.length
      ? `<div class="block"><div class="label">${svgIcon("homework")}<span>${esc(this._t("homework_for", { day: dayLabel(tr, this._locale(), days.nextKey) }))}</span>${
          left ? `<span class="aside">${esc(this._t("to_do", { n: left }))}</span>` : ""
        }</div><div class="hw-list">${hw.map(([h, i]) => this._hwItem(h, i, hwEntity, { compact: true })).join("")}</div></div>`
      : "";
    return `<style>${BASE_STYLE}${SCENE_STYLE}${MINI_STYLE}${DIALOG_STYLE}</style>
      <ha-card>
        ${this._header(s, students, days)}
        ${this._studentTabs(s, students)}
        <div class="content">${this._hero(s, days)}${hwBlock}</div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const EDITOR_LANGS = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

class PronoteEditorBase extends HTMLElement {
  // [name, default]
  static get toggles() {
    return [];
  }

  static get defaults() {
    return {};
  }

  static fields() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      ...this.constructor.fields(tr, listStudents(this._hass)),
      { name: "title", selector: { text: {} } },
      { type: "grid", name: "", schema: this.constructor.toggles.map(([name]) => ({ name, selector: { boolean: {} } })) },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...EDITOR_LANGS.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => (s.name === "zoom" ? t(this._hass, this._config, "zoom_helper") : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const defaults = { ...Object.fromEntries(toggles), ...this.constructor.defaults };
        // Keep the YAML minimal: drop empty values and options left at their default.
        for (const [k, v] of Object.entries(config)) {
          const empty = v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length && k === "devices");
          if (empty || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this.constructor.defaults, ...this._config };
    for (const [name, def] of toggles) if (data[name] === undefined) data[name] = def;
    if (typeof data.devices === "string") data.devices = [data.devices];
    this._form.hass = this._hass;
    const h = this._hass;
    if (this._dataFor !== this._config) {
      this._dataFor = this._config;
      this._form.data = data;
    }
    const deps = [lang(h, this._config), h.entities, h.devices];
    if (!this._schemaDeps || deps.some((d, i) => d !== this._schemaDeps[i])) {
      this._schemaDeps = deps;
      this._form.schema = this._schema();
    }
  }
}

class PronoteCardEditor extends PronoteEditorBase {
  static get toggles() {
    return [
      ["show_title", true],
      ["show_subtitle", true],
      ["show_picture", true],
      ["show_room", true],
      ["show_teacher", true],
      ["show_canceled", true],
      ["show_done_homework", true],
      ["show_class_average", true],
      ["show_min_max", true],
      ["show_coefficient", true],
      ["show_periods", true],
    ];
  }

  static get defaults() {
    return { tabs: TABS, default_tab: "timetable", collapsed: DEFAULT_COLLAPSED, max_grades: DEFAULT_MAX_GRADES };
  }

  static fields(tr, students) {
    return [
      { name: "devices", selector: { select: { multiple: true, mode: "dropdown", options: students } } },
      { name: "tabs", selector: { select: { multiple: true, mode: "list", options: TABS.map((v) => ({ value: v, label: tr(v) })) } } },
      { name: "default_tab", selector: { select: { mode: "dropdown", options: TABS.map((v) => ({ value: v, label: tr(v) })) } } },
      { name: "max_grades", selector: { number: { min: 1, max: 11, mode: "box" } } },
      {
        name: "collapsed",
        selector: {
          select: {
            multiple: true,
            mode: "list",
            options: SECTIONS.map((v) => ({ value: v, label: tr(v === "grades" ? "latest_grades" : v) })),
          },
        },
      },
    ];
  }
}

// The mini card's detailed view is the full card: its editor has every option of the full card (one student,
// `device`, instead of `devices`), plus `zoom`.
class PronoteMiniCardEditor extends PronoteCardEditor {
  static get toggles() {
    return [...PronoteCardEditor.toggles, ["zoom", true]];
  }

  static fields(tr, students) {
    return [
      { name: "device", selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("all_students") }, ...students] } } },
      ...PronoteCardEditor.fields(tr, students).filter((f) => f.name !== "devices"),
    ];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
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
