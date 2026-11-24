// ── Numbers ──
// Pronote writes decimals with a comma ("13,45") and marks grades it did not count as text ("Abs", "Disp").
import { ICONS } from "./core.js";

export const parseNum = (v) => {
  if (v === null || v === undefined || typeof v === "boolean") return null;
  const n = Number.parseFloat(String(v).replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
};
export const fmtNum = (n, locale, digits = 2) => (n === null ? "—" : n.toLocaleString(locale, { maximumFractionDigits: digits }));
export const UNIT_FMT = {};
export const fmtUnit = (v, unit, locale) =>
  (UNIT_FMT[`${locale}|${unit}`] ??= new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "short" })).format(v);
// Grade or average out of `outOf`, brought back to /20: very good, good, fragile, low.
export const gradeClass = (v, outOf = 20) => {
  if (v === null || !outOf) return "idle";
  const r = (v / outOf) * 20;
  return r >= 14 ? "ok" : r >= 10 ? "active" : r >= 8 ? "warn" : "crit";
};
// Acquisition levels of the evaluations (Pronote's wording, French or English school settings). The level's text
// decides first, the negative wordings before the positive ones ("Non acquis" and "En cours d'acquisition" contain
// "acquis"); the abbreviation only when the text says nothing known.
export const levelClass = (a) => {
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
export const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : "");
export const COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
export const colorOf = (c) => (COLOR_RE.test(String(c || "")) ? c : "var(--pc-accent)");

export const svgIcon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
