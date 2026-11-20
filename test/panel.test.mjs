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
  assert.match(out, /class="pbar banner"/);
  assert.doesNotMatch(out, /class="welcome"|class="toolbar"/, "the illustrated bar replaces the toolbar and the welcome line");
  assert.match(out, /Alex Moreau/);
  assert.match(out, /aria-selected="true"><span>Today</);
  assert.match(out, /class="hero"/);
  assert.match(out, /Latest grades/);
  assert.match(out, /class="tiles"/);
  assert.doesNotMatch(out, /data-action="toggle_section"/, "sections do not fold on the panel");
  assert.doesNotMatch(out, /class="daybar periodbar"/, "the period buttons are on the Grades tab only");
});

test("the tab comes from the address and goes back to it", () => {
  const p = open({}, "/grades");
  assert.match(html(p), /data-tab="grades" aria-selected="true"/);
  assert.match(html(p), /Averages/);
  assert.match(html(p), /class="daybar periodbar"/);
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

test("the top bar is the illustrated banner, the student shown as its title", () => {
  const p = open();
  const bar = html(p).match(/<div class="pbar[\s\S]*?<div class="tabs sections"/)[0];
  assert.match(bar, /<ha-menu-button>/);
  assert.match(bar, /class="pc-ground"/);
  assert.match(bar, /class="pc-desk homework"/, "the desk follows the student's day, as on the cards");
  // The pill and the icon in the cards' colours: red for the canceled lesson of the mock day, else the homework left.
  assert.match(bar, /<div class="type-icon crit">/);
  assert.match(bar, /<div class="name">Alex Moreau<\/div><span class="chip clickable crit"[^>]*>.*?Canceled/);
  assert.match(bar, /<div class="sub">[^<]*·[^<]*<\/div>/, "the class and the school under the name");
  assert.match(bar, /<div class="seg" role="group" aria-label="Students"><button data-action="student" data-id="pronote_alex" aria-pressed="true" title="Alex Moreau">Alex<\/button><button data-action="student" data-id="pronote_sam" aria-pressed="false" title="Sam Moreau">Sam<\/button><\/div>/);
  assert.match(bar, /class="rbtn" data-action="refresh" title="Refresh"/);
  click(p, { action: "student", id: "pronote_sam" });
  assert.match(html(p), /<div class="name">Sam Moreau<\/div>/, "switching student changes the title");
  assert.match(html(p), /data-id="pronote_sam" aria-pressed="true"/);
  const one = html(open({ device: "Alex Moreau", title: "School" }));
  assert.match(one, /<div class="name">School<\/div>/, "one student: the YAML title, when set");
  assert.doesNotMatch(one, /class="seg"/);
});

test("the top bar is the night picture with Home Assistant's dark theme only, or when forced", () => {
  const dark = new pc.PronotePanel();
  dark.hass = { ...hass, themes: { darkMode: true } };
  dark.route = { prefix: "/pronote", path: "" };
  dark.panel = { config: {} };
  assert.match(html(dark), /class="pbar banner night"/);
  assert.match(html(open()), /class="pbar banner"/);
  assert.match(html(open({ illustration_theme: "night" })), /class="pbar banner night"/);
});

test("the refresh button asks for fresh data of the student shown", () => {
  const calls = [];
  const p = new pc.PronotePanel();
  p.hass = { ...hass, callService: (...a) => calls.push(a) };
  p.route = { prefix: "/pronote", path: "" };
  p.panel = { config: { device: "Sam Moreau" } };
  click(p, { action: "refresh" });
  assert.equal(calls.length, 1);
  const [domain, service, data] = calls[0];
  assert.equal(`${domain}.${service}`, "homeassistant.update_entity");
  assert.ok(data.entity_id.length > 3 && data.entity_id.every((id) => id.includes("sam")));
});

test("the panel is not rewritten under a press: the update waits for the release", () => {
  const p = open();
  const before = html(p);
  p._pressing = true;
  p._goTab("grades");
  assert.equal(html(p), before, "held while pressed");
  assert.equal(p._dirty, true);
  p._pressing = false;
  p._update();
  assert.match(html(p), /aria-selected="true"><span>Grades</);
});
