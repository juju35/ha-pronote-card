// ---------------------------------------------------------------------------
// Sidebar panel (optional): the same data on a full page, opened from the sidebar
// ---------------------------------------------------------------------------
// Declared in YAML with `panel_custom` (see the README), loading this same file: the cards never need the panel,
// and the panel draws its own page (it does not embed the cards). The tab is in the address
// (`/pronote/homework`), the student shown is remembered in the browser.

// The logo: the cards' school glyph, white on a tile in the accent color, with an "A+" badge (also brand/icon.svg).
const PANEL_LOGO = `<svg viewBox="0 0 256 256" aria-hidden="true">
  <rect x="8" y="8" width="240" height="240" rx="56" fill="${ACCENTS[0]}"/>
  <path d="M128 64L40 106l88 42 88-42z" fill="#fff"/>
  <path d="M80 126v34c0 16 22 28 48 28s48-12 48-28v-34l-48 23z" fill="#fff"/>
  <path d="M206 110v44" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
  <circle cx="192" cy="192" r="40" fill="#EF9F27" stroke="${ACCENTS[0]}" stroke-width="8"/>
  <path d="M168 210l12-34 12 34M173 198h14M206 184v24M194 196h24" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const PANEL_TABS = ["today", ...TABS];
const STUDENT_KEY = "pronote-panel-student";

const PANEL_STYLE = `
  :host { display: block; min-height: 100%; background: var(--primary-background-color); color: var(--primary-text-color); --pc-natural-width: auto; }
  :host::before { display: none; }
  .toolbar { display: flex; align-items: center; gap: 8px; height: var(--header-height, 56px); padding: 0 12px; box-sizing: border-box;
             background: var(--app-header-background-color, var(--primary-background-color));
             color: var(--app-header-text-color, var(--primary-text-color)); }
  .toolbar .ptitle { font-size: 20px; font-weight: 400; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .toolbar .who { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
  .toolbar .who .btn[aria-pressed="true"] { color: var(--pc-accent-text); border-color: color-mix(in srgb, var(--pc-accent) 55%, transparent);
                                            background: color-mix(in srgb, var(--pc-accent) 10%, transparent); }
  .tabs.sections { padding: 0 12px; background: var(--app-header-background-color, var(--primary-background-color)); }
  .tabs.sections .tab { font-size: 14px; padding: 10px 10px 9px; }
  main { padding: 16px; max-width: 1400px; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px; }
  .welcome { display: flex; align-items: center; gap: 14px; }
  .welcome .logo { width: 56px; height: 56px; flex: none; }
  .welcome .logo svg { width: 100%; height: 100%; display: block; }
  .welcome .titles .name { font-size: 22px; }
  .welcome .titles .sub { font-size: 13px; white-space: normal; }
  .welcome .chip { max-width: 40%; }
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
  .page > .backdrop { position: fixed; padding-top: calc(var(--header-height, 56px) + 16px); }
  .page > .backdrop .modal { max-height: calc(100% - var(--header-height, 56px) - 32px); }
  @media (max-width: 600px) {
    main { padding: 8px; gap: 8px; }
    .grid { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .content.cols { grid-template-columns: minmax(0, 1fr); }
    .welcome .logo { width: 44px; height: 44px; }
    .welcome .titles .name { font-size: 18px; }
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

  _toolbar(s, students) {
    const who =
      students.length > 1
        ? `<div class="who" role="group" aria-label="${esc(this._t("students"))}">${students
            .map(
              (x) =>
                `<button class="btn" data-action="student" data-id="${esc(x.id)}" aria-pressed="${x === s}">${esc(studentName(this._hass, x))}</button>`,
            )
            .join("")}</div>`
        : "";
    return `<div class="toolbar"><ha-menu-button></ha-menu-button><div class="ptitle">${esc(this._config.title || "Pronote")}</div>${who}</div>`;
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

  // The student, the class and the date, with the cards' status chip.
  _welcome(s) {
    const date = upperFirst(fmtDate(todayKey(), this._locale(), { weekday: "long", day: "numeric", month: "long" }));
    const sub = [date, this._subtitle(s)].filter(Boolean).join(" · ");
    return `<div class="welcome"><div class="logo">${PANEL_LOGO}</div><div class="titles"><div class="name">${esc(studentName(this._hass, s))}</div><div class="sub">${esc(
      sub,
    )}</div></div>${this._chip(s)}</div>`;
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
    return `${this._welcome(s)}<div class="grid">${panes.join("")}</div>`;
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
    if (ctx.error) return `<style>${BASE_STYLE}${PANEL_STYLE}</style><div class="page">${this._toolbar({}, [])}<main>${ctx.error}</main></div>`;
    const { students, s, days } = ctx;
    const tab = PANEL_TABS.includes(this._tab) ? this._tab : PANEL_TABS.includes(this._config.default_tab) ? this._config.default_tab : "today";
    const body = {
      today: () => this._today(s, days),
      timetable: () => this._week(s, days),
      homework: () => this._pane("", "", this._homeworkTab(s), { cls: "cols" }),
      grades: () => this._pane("", "", this._grades(s), { cls: "cols" }),
      school_life: () => this._pane("", "", this._schoolLife(s), { cls: "cols" }),
    }[tab]();
    return `<style>${BASE_STYLE}${SCENE_STYLE}${FULL_STYLE}${DIALOG_STYLE}${PANEL_STYLE}</style>
      <div class="page">${this._toolbar(s, students)}${this._tabBar(tab, s)}<main>${body}</main></div>`;
  }
}

define("pronote-panel", PronotePanel);
