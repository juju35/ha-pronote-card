// ---------------------------------------------------------------------------
// Sidebar panel (optional): the same data on a full page, opened from the sidebar
// ---------------------------------------------------------------------------
// Declared in YAML with `panel_custom` (see the README), loading this same file: the cards never need the panel,
// and the panel draws its own page (it does not embed the cards). The tab is in the address
// (`/pronote/homework`), the student shown is remembered in the browser.

const PANEL_TABS = ["today", ...TABS];
const STUDENT_KEY = "pronote-panel-student";

const PANEL_STYLE = `
  :host { display: block; min-height: 100%; background: var(--primary-background-color); color: var(--primary-text-color); --pc-natural-width: auto; }
  :host::before { display: none; }
  /* The top bar: the cards' illustrated banner across the page (wall, desk, parquet), the student shown as its title,
     the students as a segmented choice under the subtitle, round glass buttons at the right; the text tabs under it. */
  .pbar { container-type: inline-size; flex: none; }
  .pbar ha-menu-button { flex: none; margin: 0 -6px 0 -4px; color: inherit; }
  .pbar .pc-desk { right: 44px; width: min(200px, calc(62% - 44px)); }
  .pbar .htext { left: 4px; right: calc(min(200px, calc(62% - 44px)) * .52 + 44px); }
  @container (max-width: 340px) { .pbar .pc-desk { display: none; } .pbar .htext { right: 48px; } }
  .pbar .rbtns { position: absolute; z-index: 2; right: 8px; top: 8px; display: flex; gap: 6px; }
  .rbtn { all: unset; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; flex: none;
          color: #33506b; background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .rbtn:hover { background: rgba(255,255,255,.75); }
  .rbtn .icon { width: 18px; height: 18px; }
  .night .rbtn { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .night .rbtn:hover { background: rgba(255,255,255,.22); }
  .seg { display: inline-flex; gap: 2px; margin-top: 3px; padding: 2px; border-radius: 12px; background: rgba(255,255,255,.5); align-self: flex-start;
         max-width: 100%; overflow-x: auto; scrollbar-width: none; box-sizing: border-box; }
  .seg::-webkit-scrollbar { display: none; }
  .night .seg { background: rgba(255,255,255,.1); }
  .seg button { all: unset; font-size: 11px; line-height: 16px; padding: 1px 9px; border-radius: 10px; cursor: pointer; white-space: nowrap; flex: none; }
  .seg button[aria-pressed="true"] { background: rgba(255,255,255,.85); color: ${ACCENTS[0]}; font-weight: 600; }
  .night .seg button[aria-pressed="true"] { background: rgba(255,255,255,.2); color: #fff; }
  .tabs.sections { padding: 0 12px; background: var(--card-background-color); }
  .tabs.sections .tab { font-size: 14px; padding: 10px 10px 9px; }
  main { padding: 16px; max-width: 1400px; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; align-items: start; }
  .pane { overflow: visible; }
  .pane-title { display: flex; align-items: center; gap: 8px; padding: 12px 12px 0; font-size: 15px; font-weight: 500; }
  .pane-title .icon { width: 20px; height: 20px; color: var(--pc-accent); }
  .pane-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pane-title .aside { margin-left: auto; font-size: 12px; font-weight: 400; color: var(--secondary-text-color); }
  /* One wide pane per tab: its blocks laid out in columns, the summaries across the whole width. */
  .content.cols { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; align-items: start; }
  .content.cols > :is(.summary, .tiles, .overall, .empty, .periodbar) { grid-column: 1 / -1; }
  .section-title.static { cursor: default; }
  .page > .backdrop { position: fixed; padding-top: 106px; }
  .page > .backdrop .modal { max-height: calc(100% - 122px); }
  @media (max-width: 600px) {
    main { padding: 8px; gap: 8px; }
    .grid { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .content.cols { grid-template-columns: minmax(0, 1fr); }
  }
`;

class PronotePanel extends PronoteCard {
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
    this._html = html;
    this.shadowRoot.innerHTML = html;
    this._syncMenu();
    if (kept) this._restoreFocus(kept);
    if (this._popup) this.shadowRoot.querySelector('.modal [data-action="popup_close"]')?.focus?.({ preventScroll: true });
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

