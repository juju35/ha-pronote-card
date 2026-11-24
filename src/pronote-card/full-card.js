// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------
import { DEFAULT_COLLAPSED, DEFAULT_MAX_GRADES, TABS, TAB_ICONS, esc, list, valid } from "./core.js";
import { dayLabel, keyOf, shortDay, timeOf, todayKey, upperFirst } from "./dates.js";
import { colorOf, fmtNum, fmtUnit, gradeClass, levelClass, parseNum, svgIcon } from "./numbers.js";
import { BASE_STYLE, DIALOG_STYLE, FULL_STYLE } from "./styles.js";
import { SCENE_STYLE } from "./picture.js";
import { PronoteBase } from "./lessons.js";

export class PronoteCard extends PronoteBase {
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
    return `<style>${BASE_STYLE}${SCENE_STYLE}${FULL_STYLE}${DIALOG_STYLE}${this._bannerStyle()}</style>
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
