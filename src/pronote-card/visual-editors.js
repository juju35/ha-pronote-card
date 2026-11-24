// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { DEFAULT_COLLAPSED, DEFAULT_MAX_GRADES, SECTIONS, TABS, lang, t } from "./core.js";
import { listStudents } from "./registries.js";

export const EDITOR_LANGS = [
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

export class PronoteEditorBase extends HTMLElement {
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

export class PronoteCardEditor extends PronoteEditorBase {
  static get toggles() {
    return [
      ["illustration", true],
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
    return { illustration_theme: "auto", tabs: TABS, default_tab: "timetable", collapsed: DEFAULT_COLLAPSED, max_grades: DEFAULT_MAX_GRADES };
  }

  static fields(tr, students) {
    return [
      { name: "devices", selector: { select: { multiple: true, mode: "dropdown", options: students } } },
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } } },
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
export class PronoteMiniCardEditor extends PronoteCardEditor {
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
