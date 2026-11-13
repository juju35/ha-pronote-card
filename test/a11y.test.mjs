// Keyboard access: every clickable element of the cards is a button or has the button role and a tab stop.
import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const pc = load();
const hass = { entities, devices, states, language: "en", callService() {} };
const clickables = (html) => html.match(/<[a-z-]+\b[^>]*\bdata-(?:entity|action)="[^"]*"[^>]*>/g) || [];

for (const tab of ["timetable", "homework", "grades", "school_life"]) {
  test(`every clickable element of the ${tab} tab can be reached from the keyboard`, () => {
    const card = new pc.PronoteCard();
    card.setConfig({ default_tab: tab, collapsed: [] });
    card.hass = hass;
    const tags = clickables(card.shadowRoot.innerHTML);
    assert.ok(tags.length > 5);
    for (const t of tags) {
      if (t.startsWith("<button")) continue;
      assert.match(t, /\brole="button"/, t);
      assert.match(t, /\btabindex="0"/, t);
    }
  });
}

test("Enter and Space activate an element with the button role", () => {
  const card = new pc.PronoteMiniCard();
  card.setConfig({});
  card.hass = hass;
  let clicks = 0;
  let prevented = 0;
  const target = { getAttribute: (a) => (a === "role" ? "button" : null), click: () => clicks++ };
  for (const key of ["Enter", " ", "a"]) card.shadowRoot.listeners.keydown({ key, target, preventDefault: () => prevented++ });
  assert.equal(clicks, 2);
  assert.equal(prevented, 2);
});

test("the tabs are tabs, and tell which one is selected", () => {
  const card = new pc.PronoteCard();
  card.setConfig({});
  card.hass = hass;
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /role="tablist"/);
  assert.equal((html.match(/role="tab"[^>]*aria-selected="true"/g) || []).length, 2, "one student, one section");
});

test("animations stop with the reduced-motion setting", () => {
  const card = new pc.PronoteCard();
  card.setConfig({});
  card.hass = hass;
  assert.match(card.shadowRoot.innerHTML, /@media \(prefers-reduced-motion: reduce\) \{ \*, \*::before, \*::after \{ transition: none !important; animation: none !important; \} \}/);
});
