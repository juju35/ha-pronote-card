// Evaluates the translations, the cards and the panel (test/source.mjs: classic scripts, bundled by scripts/build.mjs) in a
// sandbox with minimal DOM stand-ins and a clock frozen at `now`, and returns the names the tests need.
// No dependency, no browser.
import vm from "node:vm";
import { NOW } from "../scripts/mock-states.mjs";
import { sources as bundles } from "./source.mjs";

// One script per source file, run in order in the same context (their const/class share its global lexical scope, as in
// the bundle): each keeps its file name, so that `node --test --experimental-test-coverage` reports the sources.
const sources = ["i18n.js", "pronote-card.js", "pronote-panel.js"].map((f) => {
  const url = new URL(`../src/${f.slice(0, -3)}/index.js`, import.meta.url);
  return { code: bundles[f], filename: url.pathname };
});

const fakeRoot = () => ({
  innerHTML: "",
  listeners: {},
  addEventListener(type, fn) {
    this.listeners[type] = fn;
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
});

// A Date whose "now" is frozen (and can be moved with setNow).
const frozenDate = (iso) => {
  let t = Date.parse(iso);
  class FrozenDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [t]));
    }
    static now() {
      return t;
    }
  }
  FrozenDate.setNow = (v) => {
    t = Date.parse(v);
  };
  return FrozenDate;
};

export const load = ({ now = NOW } = {}) => {
  const registry = new Map();
  class HTMLElement {
    attachShadow() {
      this.shadowRoot = fakeRoot();
      return this.shadowRoot;
    }
    dispatchEvent(ev) {
      (this.events ||= []).push(ev);
    }
    appendChild() {}
    toggleAttribute(name, on) {
      (this.attrs ||= new Set())[on ? "add" : "delete"](name);
    }
  }
  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }
  const FrozenDate = frozenDate(now);
  const sandbox = {
    HTMLElement,
    CustomEvent,
    Intl,
    Date: FrozenDate,
    console: { info() {}, warn() {} },
    customElements: { get: (t) => registry.get(t), define: (t, c) => registry.set(t, c) },
    document: {
      createElement: (t) => (registry.has(t) ? new (registry.get(t))() : { tagName: t, appendChild() {}, addEventListener() {} }),
      addEventListener() {},
      removeEventListener() {},
    },
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval() {},
  };
  sandbox.addEventListener = () => {};
  sandbox.removeEventListener = () => {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const { code, filename } of sources) vm.runInContext(code, sandbox, { filename });
  return { ...exportsOf(sandbox), setNow: FrozenDate.setNow };
};

// The script declares its names with const/class in the context's global lexical scope: read them back.
const exportsOf = (sandbox) =>
  vm.runInContext(
    `({ STRINGS, esc, lang, intlLocale, parseNum, gradeClass, levelClass, roleOf, resolve, findStudents, studentName, keyOf, addDays, dayLabel, lessonState, sceneSvg,
       periodOf, PronoteCard: customElements.get("pronote-card"), PronoteMiniCard: customElements.get("pronote-mini-card"),
       PronoteCardEditor: customElements.get("pronote-card-editor"), PronoteMiniCardEditor: customElements.get("pronote-mini-card-editor"),
       PronotePanel: customElements.get("pronote-panel"), pronoteBadgeCount, pronotePanelOf, window })`,
    sandbox,
  );
