// Evaluates src/i18n.js and src/pronote-card.js (classic scripts, bundled as they are by scripts/build.mjs) in a
// sandbox with minimal DOM stand-ins and a clock frozen at `now`, and returns the names the tests need.
// No dependency, no browser.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { NOW } from "../scripts/mock-states.mjs";

const source = ["i18n.js", "pronote-card.js"].map((f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8")).join("\n");

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
  vm.runInContext(source, sandbox);
  return { ...exportsOf(sandbox), setNow: FrozenDate.setNow };
};

// The script declares its names with const/class in the context's global lexical scope: read them back.
const exportsOf = (sandbox) =>
  vm.runInContext(
    `({ STRINGS, esc, lang, intlLocale, parseNum, gradeClass, levelClass, roleOf, resolve, findStudents, studentName, keyOf, addDays, dayLabel, lessonState, sceneSvg,
       PronoteCard: customElements.get("pronote-card"), PronoteMiniCard: customElements.get("pronote-mini-card"),
       PronoteCardEditor: customElements.get("pronote-card-editor"), PronoteMiniCardEditor: customElements.get("pronote-mini-card-editor"), window })`,
    sandbox,
  );
