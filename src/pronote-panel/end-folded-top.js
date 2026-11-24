// ── End of the folded top bar ──
import { PANEL_STYLE, PANEL_TABS, STUDENT_KEY } from "./sidebar-panel.js";
import { pronotePanelFold } from "./core.js";
import { pronoteBadge } from "./sidebar-badge.js";

export class PronotePanel extends PronoteCard {
  // Home Assistant gives a panel its `panel` (with the YAML `config`), `route` and `narrow`.
  set panel(panel) {
    this._panel = panel;
    const c = panel?.config || {};
    if (this._config && JSON.stringify(c) === JSON.stringify(this._panelConfig)) return;
    this._panelConfig = c;
    this.setConfig({ max_grades: 10, ...c });
  }

  get panel() {
    return this._panel;
  }

  set route(route) {
    this._route = route;
    const tab = String(route?.path || "").split("/")[1];
    if (PANEL_TABS.includes(tab) && tab !== this._tab) {
      this._tab = tab;
      this._update();
    }
  }

  get route() {
    return this._route;
  }

  set narrow(narrow) {
    this._narrow = !!narrow;
    this._syncMenu();
  }

  get narrow() {
    return this._narrow;
  }

  set hass(hass) {
    super.hass = hass;
    this._syncMenu();
    pronoteBadge.set(hass);
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (this._student === undefined) {
      try {
        this._student = localStorage.getItem(STUDENT_KEY) || null;
      } catch (_err) {
        this._student = null;
      }
    }
    super.setConfig(config || {});
  }

  // The sidebar button (narrow screens) needs hass and narrow as properties.
  _syncMenu() {
    const btn = this.shadowRoot.querySelector("ha-menu-button");
    if (!btn) return;
    btn.hass = this._hass;
    btn.narrow = this._narrow;
  }

  _update() {
    if (!this._hass || !this._config) return;
    // A press in progress: drawn once released, as on the cards (a rewrite under the pointer would lose the click).
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    this.toggleAttribute?.("dark", !!this._hass.themes?.darkMode);
    let html = this._render();
    const popup = this._popup ? this._popupHtml() : "";
    if (this._popup && !popup) this._popup = null;
    if (popup) html = html.replace(/<\/div>\s*$/, `${popup}</div>`);
    if (html === this._html) return;
    const kept = this._popup ? null : this._focusedSpot();
    const folded = Boolean(this.hasAttribute?.("pf-folded"));
    this._html = html;
    this.shadowRoot.innerHTML = html;
    this._attachFold(folded);
    this._syncMenu();
    if (kept) this._restoreFocus(kept);
    if (this._popup) this.shadowRoot.querySelector('.modal [data-action="popup_close"]')?.focus?.({ preventScroll: true });
  }

  connectedCallback() {
    super.connectedCallback?.();
    if (!this._fold && this.shadowRoot.querySelector(".pbar")) this._attachFold();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    this._fold?.detach();
    this._fold = null;
  }

  /** The top bar folds on scroll into one bar with the tabs as icon pills (see pronotePanelFold). */
  _attachFold(folded = false) {
    this._fold?.detach();
    this._fold = pronotePanelFold(this, {
      top: ".pbar",
      tabs: ".tabs.sections",
      tab: ".tab",
      key: (b) => b.dataset.tab,
      icons: {
        today: "mdi:calendar-today",
        timetable: "mdi:timetable",
        homework: "mdi:book-open-variant",
        grades: "mdi:chart-box-outline",
        school_life: "mdi:account-school-outline",
      },
      badge: ".badge",
      name: ".pbar .name",
      sub: ".pbar .sub",
      icon: ".pbar .type-icon",
      status: ".pbar .chip",
      acts: ".pbar .rbtns > *",
      side: ".pbar .seg",
      accent: "#2e7d32",
      css: `.pf-end .seg { margin-top:0; background:var(--secondary-background-color, rgba(127,127,127,.12)); }
        .pf-end .seg button[aria-pressed="true"] { background:var(--card-background-color, #fff); }`,
      folded,
      menu: () => ({ hass: this._hass, narrow: this._narrow, show: Boolean(this._narrow) }),
    });
  }

  _onClick(ev) {
    const el = ev.composedPath().find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    const d = el?.dataset;
    if (!this._popup && d?.action === "tab") {
      ev.stopPropagation();
      return this._goTab(d.tab);
    }
    if (!this._popup && d?.action === "refresh") {
      ev.stopPropagation();
      return this._refresh();
    }
    if (!this._popup && d?.action === "student") {
      try {
        localStorage.setItem(STUDENT_KEY, d.id);
      } catch (_err) {
        // Private browsing: the choice lasts until the page is reloaded.
      }
    }
    return super._onClick(ev);
  }

  _goTab(tab) {
    if (!PANEL_TABS.includes(tab)) return;
    this._tab = tab;
    const prefix = this._route?.prefix;
    if (prefix && globalThis.history?.replaceState) history.replaceState(history.state, "", `${prefix}/${tab}`);
    this._update();
    globalThis.scrollTo?.(0, 0);
  }

  // Sections are always open on the panel: plain titles, no chevron.
  _isCollapsed() {
    return false;
  }

  _sectionTitle(_key, icon, label, count = "") {
    return `<div class="section-title static">${svgIcon(icon)}<span>${esc(label)}</span>${count !== "" ? `<span class="count">· ${esc(count)}</span>` : ""}</div>`;
  }

  _pane(title, icon, body, { cls = "", aside = "" } = {}) {
    const head = title
      ? `<div class="pane-title">${svgIcon(icon)}<span>${esc(title)}</span>${aside ? `<span class="aside">${esc(aside)}</span>` : ""}</div>`
      : "";
    return `<ha-card class="pane"${cls ? ` data-pane="${cls}"` : ""}>${head}<div class="content${cls === "cols" ? " cols" : ""}">${body}</div></ha-card>`;
  }

  // Asks the integration for fresh data of the student shown (all its entities share one update).
  _refresh() {
    const ctx = this._context();
    const ids = ctx.error ? [] : Object.values(ctx.s.entities).filter(Boolean);
    if (ids.length) this._hass.callService("homeassistant", "update_entity", { entity_id: ids });
  }

  // The top bar (charter: illustrated, full width): the student shown as the title, so that switching student
  // changes it, the class under it, the students as a segmented choice (first names), a round refresh button.
  _bar(s, students, days) {
    const c = this._config;
    const night = isNight(this._hass, c) ? " night" : "";
    const menu = "<ha-menu-button></ha-menu-button>";
    if (!days) {
      return `<div class="pbar banner${night}">${deskSvg("none", this._uid)}<div class="htext">${menu}<div class="type-icon idle">${svgIcon(
        "school",
      )}</div><div class="titles"><div class="trow"><div class="name">${esc(c.title || "Pronote")}</div></div></div></div></div>`;
    }
    const b = this._bannerState(s, days);
    const alert = b.icon === "crit" || b.icon === "warn";
    const todo = this._homework(s).filter((h) => !h.done).length;
    const state = alert ? b.icon : s.entities.homework ? (todo ? "active" : "ok") : b.icon;
    const chip = alert ? this._chip(s, days, b.icon) : this._chip(s);
    const title = (students.length === 1 && c.title) || studentName(this._hass, s);
    const sub = this._subtitle(s);
    const seg =
      students.length > 1
        ? `<div class="seg" role="group" aria-label="${esc(this._t("students"))}">${students
            .map((x) => {
              const name = studentName(this._hass, x);
              return `<button data-action="student" data-id="${esc(x.id)}" aria-pressed="${x === s}" title="${esc(name)}">${esc(name.split(/\s+/)[0] || name)}</button>`;
            })
            .join("")}</div>`
        : "";
    const refresh = esc(this._t("refresh"));
    return `<div class="pbar banner${night}">${deskSvg(b.scene, this._uid, b.stamp, b.count)}
      <div class="htext">${menu}<div class="type-icon${state ? ` ${state}` : ""}">${svgIcon("school")}</div><div class="titles">
        <div class="trow"><div class="name">${esc(title)}</div>${chip}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}${seg}</div></div>
      <div class="rbtns"><button class="rbtn" data-action="refresh" title="${refresh}" aria-label="${refresh}">${svgIcon("refresh")}</button></div></div>`;
  }

  _tabBar(tab, s) {
    const todo = this._homework(s).filter((h) => !h.done).length;
    return `<div class="tabs sections" role="tablist" aria-label="${esc(this._t("sections"))}">${PANEL_TABS.map(
      (x) =>
        `<button class="tab" role="tab" data-action="tab" data-tab="${x}" aria-selected="${x === tab}"><span>${esc(this._t(x))}</span>${
          x === "homework" && todo ? `<span class="badge">${todo}</span>` : ""
        }</button>`,
    ).join("")}</div>`;
  }

  // Today: the lesson going on or the next one, the timetable, the homework for the next school day, the latest
  // grades, the school life counters and the menu.
  _today(s, days) {
    const e = s.entities;
    const tr = (k) => this._t(k);
    const day = dayLabel(tr, this._locale(), days.nextKey);
    const panes = [this._pane("", "", this._hero(s, days), { cls: "hero" }), this._pane(this._t("timetable"), "calendar", this._timetable(s, days))];
    if (e.homework) {
      const hw = this._homework(s)
        .map((h, i) => [h, i])
        .filter(([h]) => keyOf(h.date) === days.nextKey);
      const left = hw.filter(([h]) => !h.done).length;
      const body = hw.length
        ? `<div class="hw-list">${hw.map(([h, i]) => this._hwItem(h, i, e.homework)).join("")}</div>`
        : `<div class="empty">${esc(this._t("no_homework"))}</div>`;
      panes.push(this._pane(this._t("homework_for", { day }), "homework", body, { aside: left ? this._t("to_do", { n: left }) : "" }));
    }
    if (e.grades || e.overall_average) {
      const only = { overall_average: e.overall_average, current_period: e.current_period, grades: e.grades };
      panes.push(this._pane(this._t("grades"), "grades", this._grades({ ...s, entities: only, periods: {} })));
    }
    if (e.absences || e.delays || e.punishments || e.information) panes.push(this._pane(this._t("school_life"), "life", this._schoolLife(s, { tilesOnly: true })));
    if (e.menus) panes.push(this._pane(this._t("menus"), "food", this._menu(e.menus)));
    return `<div class="grid">${panes.join("")}</div>`;
  }

  // Timetable: today and the next school day side by side.
  _week(s, days) {
    const e = s.entities;
    const tr = (k) => this._t(k);
    const locale = this._locale();
    const hours = (ls) => {
      const real = ls.filter((l) => !l.canceled);
      return real.length ? `${real[0].start_time || timeOf(real[0].start_at)} – ${real.at(-1).end_time || timeOf(real.at(-1).end_at)}` : "";
    };
    const next = e.lessons_next_day || e.lessons_tomorrow;
    return `<div class="grid">${this._pane(tr("today"), "calendar", this._lessonList(days.todays, e.lessons_today), { aside: hours(days.todays) })}${this._pane(
      dayLabel(tr, locale, days.nextKey),
      "calendar",
      this._lessonList(days.next, next),
      { aside: hours(days.next) },
    )}</div>`;
  }

  _render() {
    const ctx = this._context();
    if (ctx.error) return `<style>${BASE_STYLE}${SCENE_STYLE}${BANNER_STYLE}${PANEL_STYLE}</style><div class="page">${this._bar({}, [])}<main>${ctx.error}</main></div>`;
    const { students, s, days } = ctx;
    const tab = PANEL_TABS.includes(this._tab) ? this._tab : PANEL_TABS.includes(this._config.default_tab) ? this._config.default_tab : "today";
    const body = {
      today: () => this._today(s, days),
      timetable: () => this._week(s, days),
      homework: () => this._pane("", "", this._homeworkTab(s), { cls: "cols" }),
      grades: () => this._pane("", "", this._grades(s), { cls: "cols" }),
      school_life: () => this._pane("", "", this._schoolLife(s), { cls: "cols" }),
    }[tab]();
    return `<style>${BASE_STYLE}${SCENE_STYLE}${FULL_STYLE}${DIALOG_STYLE}${BANNER_STYLE}${PANEL_STYLE}</style>
      <div class="page">${this._bar(s, students, days)}${this._tabBar(tab, s)}<main>${body}</main></div>`;
  }
}

define("pronote-panel", PronotePanel);
