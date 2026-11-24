// ── Dates ──
// A day is a "YYYY-MM-DD" key: the school's local date, read from the start of the ISO strings Pronote gives
// (lessons `2026-11-17T08:00:00+01:00`, homework `2026-11-18`), and the local date for today.
export const pad2 = (n) => String(n).padStart(2, "0");
export const now = () => Date.now();
export const dayKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const todayKey = () => dayKey(new Date(now()));
export const keyOf = (iso) => (typeof iso === "string" && /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : "");
export const dateOf = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};
export const addDays = (key, n) => {
  const d = dateOf(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
};
export const DATE_FMT = {};
export const fmtDate = (key, locale, opts) => {
  const id = `${locale}|${JSON.stringify(opts)}`;
  try {
    DATE_FMT[id] ??= new Intl.DateTimeFormat(locale, opts);
  } catch (_err) {
    DATE_FMT[id] ??= new Intl.DateTimeFormat("en", opts);
  }
  return DATE_FMT[id].format(dateOf(key));
};
export const upperFirst = (s) => (s ? s[0].toLocaleUpperCase() + s.slice(1) : s);
// "Today", "Tomorrow", else "Thursday 19 November" in the card's language.
export const dayLabel = (tr, locale, key) => {
  const today = todayKey();
  if (key === today) return tr("today");
  if (key === addDays(today, 1)) return tr("tomorrow");
  return upperFirst(fmtDate(key, locale, { weekday: "long", day: "numeric", month: "long" }));
};
export const shortDay = (key, locale) => fmtDate(key, locale, { day: "numeric", month: "short" });
export const timeOf = (iso) => (typeof iso === "string" && /T\d{2}:\d{2}/.test(iso) ? iso.slice(11, 16) : "");
