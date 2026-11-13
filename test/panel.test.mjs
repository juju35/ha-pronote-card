// The optional sidebar panel, from the mock Pronote states (clock frozen on Tuesday 17 November 2026, 10:20).
import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const pc = load();
const hass = { entities, devices, states, language: "en", callService() {} };

const open = (config = {}, path = "") => {
  const panel = new pc.PronotePanel();
  panel.hass = hass;
  panel.route = { prefix: "/pronote", path };
  panel.panel = { config };
  return panel;
};
const html = (p) => p.shadowRoot.innerHTML;
const click = (p, dataset) => p.shadowRoot.listeners.click({ composedPath: () => [{ dataset }], stopPropagation() {} });

test("the panel is defined by the same bundle, the cards do not need it", () => {
  assert.ok(pc.PronotePanel);
  assert.ok(pc.PronoteCard);
  assert.ok(!pc.window.customCards.some((c) => c.type === "pronote-panel"), "the panel is not offered as a card");
});

test("the Today tab shows the student, the next lesson, the homework, the grades and the school life", () => {
  const out = html(open());
  assert.match(out, /<ha-menu-button>/);
  assert.match(out, /class="welcome"/);
  assert.match(out, /Alex Moreau/);
  assert.match(out, /aria-selected="true"><span>Today</);
  assert.match(out, /class="hero"/);
  assert.match(out, /Latest grades/);
  assert.match(out, /class="tiles"/);
  assert.doesNotMatch(out, /data-action="toggle_section"/, "sections do not fold on the panel");
});

test("the tab comes from the address and goes back to it", () => {
  const p = open({}, "/grades");
  assert.match(html(p), /data-tab="grades" aria-selected="true"/);
  assert.match(html(p), /Averages/);
  click(p, { action: "tab", tab: "school_life" });
  assert.match(html(p), /data-tab="school_life" aria-selected="true"/);
  assert.match(html(p), /class="content cols"/);
  click(p, { action: "tab", tab: "nope" });
  assert.match(html(p), /data-tab="school_life" aria-selected="true"/);
});

test("the timetable shows today and the next school day side by side", () => {
  const out = html(open({}, "/timetable"));
  assert.equal((out.match(/class="lessons"/g) || []).length, 2);
});

test("several students: one button each in the toolbar, the YAML config picks them", () => {
  const p = open();
  assert.match(html(p), /data-action="student" data-id="pronote_sam"/);
  click(p, { action: "student", id: "pronote_sam" });
  assert.match(html(p), /<div class="name">Sam Moreau</);
  assert.doesNotMatch(html(open({ device: "Sam Moreau" })), /data-action="student"/);
});

test("the homework popup opens inside the page", () => {
  const p = open({ device: "Alex Moreau" }, "/homework");
  click(p, { action: "homework", entity: "sensor.pronote_alex_moreau_homework", index: "0" });
  assert.match(html(p), /class="backdrop"[\s\S]*<\/div>\s*$/);
});

test("the panel's logo is the one of brand/icon.svg, in the cards' accent", async () => {
  const { readFileSync } = await import("node:fs");
  const svg = readFileSync(new URL("../brand/icon.svg", import.meta.url), "utf8");
  const src = readFileSync(new URL("../src/pronote-panel.js", import.meta.url), "utf8");
  for (const [, d] of svg.matchAll(/ d="([^"]+)"/g)) assert.ok(src.includes(`d="${d}"`), `path ${d} missing from PANEL_LOGO`);
  assert.match(svg, /fill="#17795d"/);
  assert.match(readFileSync(new URL("../src/pronote-card.js", import.meta.url), "utf8"), /const ACCENTS = \["#17795d"/);
});
