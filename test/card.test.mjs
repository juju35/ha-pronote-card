// Rendering of the full and mini cards from the mock Pronote states (clock frozen on Tuesday 17 November 2026, 10:20).
import assert from "node:assert/strict";
import { test } from "node:test";
import { canceled, devices, entities, homeworkDone, homeworkToDo, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const pc = load();

const makeHass = (overrides = {}, extra = {}) => ({ entities, devices, states: { ...states, ...overrides }, language: "en", callService() {}, ...extra });

const render = (Card, config = {}, hass = makeHass()) => {
  const card = new Card();
  card.setConfig(config);
  card.hass = hass;
  return card;
};
const html = (card) => card.shadowRoot.innerHTML;
// Values of the sandbox (another realm) compared as plain data.
const plain = (v) => JSON.parse(JSON.stringify(v));
// A click on an element of the card, as the shadow root receives it.
const click = (card, dataset) => {
  const el = { dataset };
  let stopped = 0;
  card.shadowRoot.listeners.click({ composedPath: () => [el], stopPropagation: () => stopped++ });
  return stopped;
};

test("every Pronote device is a student, its entities found by translation_key", () => {
  const students = pc.resolve(makeHass());
  assert.deepEqual(plain(students.map((s) => s.id)), ["pronote_alex", "pronote_sam"]);
  assert.equal(students[0].entities.lessons_today, "sensor.pronote_alex_moreau_lessons_today");
  assert.equal(students[0].entities.information, "sensor.pronote_alex_moreau_information_and_surveys");
  assert.equal(pc.studentName(makeHass(), students[1]), "Sam Moreau");
});

test("older integration versions without translation keys are recognized from their entity ids", () => {
  const role = (entity_id) => pc.roleOf({ entity_id, translation_key: null });
  assert.equal(role("sensor.pronote_alex_timetable_today"), "lessons_today");
  assert.equal(role("sensor.pronote_alex_today_s_timetable"), "lessons_today");
  assert.equal(role("sensor.pronote_alex_timetable_next_day"), "lessons_next_day");
  assert.equal(role("sensor.pronote_alex_homework"), "homework");
  assert.equal(role("sensor.pronote_alex_period_s_homework"), undefined, "the period's homework is not the homework");
  assert.equal(role("sensor.pronote_alex_grades_trimestre_1"), undefined, "a past period is left out");
  assert.equal(pc.roleOf({ entity_id: "x", translation_key: "grades_period" }), undefined);
});

test("device and devices pick the students, by name or device id", () => {
  const hass = makeHass();
  assert.deepEqual(plain(pc.findStudents(hass, { device: "Sam Moreau" }).students.map((s) => s.id)), ["pronote_sam"]);
  assert.deepEqual(plain(pc.findStudents(hass, { devices: ["pronote_sam", "Pronote - Alex Moreau"] }).students.map((s) => s.id)), ["pronote_sam", "pronote_alex"]);
  assert.equal(pc.findStudents(hass, { device: "Nobody" }).error, "unknown_device");
  assert.equal(pc.findStudents({ entities: {}, devices: {}, states: {} }, {}).error, "no_student");
});

test("the card without a Pronote student says so", () => {
  const card = render(pc.PronoteCard, {}, { entities: {}, devices: {}, states: {}, language: "en" });
  assert.match(html(card), /No Pronote student found/);
  const unknown = render(pc.PronoteCard, { device: "Nobody" });
  assert.match(html(unknown), /Student not found: Nobody/);
});

test("several students get one tab each, the header naming the one shown", () => {
  const card = render(pc.PronoteCard);
  assert.match(html(card), /data-action="student" data-id="pronote_alex" aria-selected="true">Alex Moreau/);
  assert.match(html(card), /<div class="name">Alex Moreau<\/div>/);
  click(card, { action: "student", id: "pronote_sam" });
  assert.match(html(card), /<div class="name">Sam Moreau<\/div>/);
  assert.match(html(card), /1re 3 · Lycée du Parc/);
  const single = render(pc.PronoteCard, { device: "Alex Moreau", title: "Alex" });
  assert.doesNotMatch(html(single), /tabs students/);
  assert.match(html(single), /<div class="name">Alex<\/div>/);
});

test("today's timetable: the lesson going on, the canceled and the changed ones stand out", () => {
  const out = html(render(pc.PronoteCard, { device: "Alex Moreau" }));
  assert.match(out, /aria-pressed="true">Today/);
  assert.match(out, /<div class="lesson now"[^>]*aria-label="10:15, History-Geography"/);
  assert.match(out, /aria-valuenow="8"/, "10:20 in a 10:15-11:15 lesson");
  assert.match(out, /<div class="lesson canceled"[^>]*aria-label="11:15, English, Canceled"/);
  assert.match(out, /Teacher absent/);
  assert.match(out, /<div class="lesson changed"[^>]*aria-label="13:30, Physics-Chemistry, Room changed"/);
  assert.match(out, /<div class="lesson past"[^>]*aria-label="08:00, Mathematics"/);
  assert.match(out, /Lunch break/);
  assert.match(out, /08:00 – 16:30/);
  // The header icon turns red: a lesson of the day is canceled.
  assert.match(out, /<div class="type-icon crit">/);
});

test("the next school day, and show_canceled: false", () => {
  const card = render(pc.PronoteCard, { device: "Alex Moreau", show_canceled: false, show_teacher: false });
  assert.doesNotMatch(html(card), /aria-label="11:15, English/);
  assert.doesNotMatch(html(card), /Mr Garnier/);
  click(card, { action: "day", day: "next" });
  assert.match(html(card), /aria-pressed="true">Tomorrow/);
  assert.match(html(card), /Life and Earth Sciences/);
  assert.match(html(card), /Test<\/span>/, "the test of the next day is tagged");
});

test("once the day is over, the timetable opens on the next school day", () => {
  const card = render(pc.PronoteCard, { device: "Alex Moreau" }, makeHass(homeworkToDo));
  assert.match(html(card), /aria-pressed="true">Tomorrow/);
});

test("homework: grouped by day, done or to do, with the details in a popup at the top of the card", () => {
  const card = render(pc.PronoteCard, { device: "Alex Moreau", default_tab: "homework" });
  const out = html(card);
  assert.match(out, /3 to do/);
  assert.match(out, /2 done/);
  assert.match(out, /TOMORROW|Tomorrow/);
  assert.match(out, /Thursday, 19 November|Thursday 19 November|Thursday, November 19/);
  assert.match(out, /<div class="hw done"[^>]*aria-label="Technology, Done"/);
  assert.match(out, /<div class="hw"[^>]*aria-label="Mathematics, To do"/);
  click(card, { action: "homework", entity: "sensor.pronote_alex_moreau_homework", index: "2" });
  assert.match(html(card), /<ha-card class="dialog-open">/);
  assert.match(html(card), /role="dialog"[^>]*aria-label="Music"/);
  assert.match(html(card), /href="https:\/\/example.com\/lyrics.pdf"/);
  click(card, { action: "popup_close" });
  assert.doesNotMatch(html(card), /<ha-card class="dialog-open">/);
  const hidden = html(render(pc.PronoteCard, { device: "Alex Moreau", default_tab: "homework", show_done_homework: false }));
  assert.doesNotMatch(hidden, /Technology/);
});

test("grades: overall average, latest grades out of their scale, averages with the class marker, evaluations", () => {
  const out = html(render(pc.PronoteCard, { device: "Alex Moreau", default_tab: "grades", collapsed: [], max_grades: 3 }));
  assert.match(out, /13\.52<small>\/20/);
  assert.match(out, /Term 1/);
  assert.match(out, /grade ok">16<small>\/20/);
  assert.match(out, /grade ok">14\.5<small>\/20/);
  assert.doesNotMatch(out, /Dictation/, "max_grades: 3");
  assert.match(out, /Class 12\.4/);
  assert.match(out, /class="avg clickable warn"[\s\S]*?Technology/);
  assert.match(out, /class="class" style="left:59%"/, "class average 11.8/20");
  assert.match(out, /chip ok"[^>]*>A\+/);
  assert.match(out, /chip warn"[^>]*>B</);
});

test("a grade that is not a number (absent) is shown as given", () => {
  const out = html(render(pc.PronoteCard, { device: "Alex Moreau", default_tab: "grades", collapsed: [], max_grades: 11 }));
  assert.match(out, /grade idle">Abs<small>\/20/);
});

test("school life: counters and folding sections, folded back by a click elsewhere", () => {
  const card = render(pc.PronoteCard, { device: "Alex Moreau", default_tab: "school_life" });
  let out = html(card);
  assert.match(out, /Late arrivals/);
  assert.match(out, /Medical appointment/);
  assert.match(out, /1 unjustified/);
  assert.match(out, /data-section="information" aria-expanded="false"/, "folded by default");
  assert.doesNotMatch(out, /Parent-teacher meeting/);
  assert.match(out, /Vegetable lasagna/);
  click(card, { action: "toggle_section", section: "information" });
  out = html(card);
  assert.match(out, /data-section="information" aria-expanded="true"/);
  assert.match(out, /Parent-teacher meeting/);
  assert.match(out, /class="unread"/);
});

test("folding: a tap elsewhere (pointer), not a drag that ends outside; leaving the page folds back too", () => {
  const card = render(pc.PronoteCard, { device: "Alex Moreau", default_tab: "school_life" });
  card.connectedCallback();
  const open = () => /data-section="information" aria-expanded="true"/.test(html(card));
  click(card, { action: "toggle_section", section: "information" });
  assert.ok(open());
  // Pressed in the card and released outside of it (a slider dragged out): nothing folds.
  card._outside.tap({ composedPath: () => [card] });
  assert.ok(open());
  // A tap on a spot that sends no click (iOS): the pointer alone folds it.
  card._outside.tap({ composedPath: () => [] });
  assert.ok(!open());
  // Left unfolded and back on the page: folded.
  click(card, { action: "toggle_section", section: "information" });
  card.disconnectedCallback();
  card.connectedCallback();
  assert.ok(!open());
  card.disconnectedCallback();
  // The mini card goes back to its compact view, on a tap elsewhere and when it leaves the page.
  const mini = render(pc.PronoteMiniCard, { device: "Alex Moreau" });
  mini.connectedCallback();
  click(mini, { action: "zoom" });
  mini._unzoom.tap({ composedPath: () => [] });
  assert.doesNotMatch(html(mini), /tabs sections/);
  click(mini, { action: "zoom" });
  mini.disconnectedCallback();
  mini.connectedCallback();
  assert.doesNotMatch(html(mini), /tabs sections/);
  mini.disconnectedCallback();
});

test("tabs: the list and order of the tabs, and the default one", () => {
  const out = html(render(pc.PronoteCard, { device: "Alex Moreau", tabs: ["grades", "homework"] }));
  assert.match(out, /data-tab="grades" aria-selected="true"[\s\S]*data-tab="homework" aria-selected="false"/);
  assert.doesNotMatch(out, /data-tab="timetable"/);
  const one = html(render(pc.PronoteCard, { device: "Alex Moreau", tabs: ["homework"] }));
  assert.doesNotMatch(one, /tabs sections/);
});

test("the picture follows the day: class, canceled, homework, done", () => {
  const state = (overrides) => html(render(pc.PronoteMiniCard, { device: "Alex Moreau" }, makeHass(overrides))).match(/class="scene (\w+)"/)[1];
  assert.equal(state({}), "class");
  assert.equal(state(canceled), "canceled");
  assert.equal(state(homeworkToDo), "homework");
  assert.equal(state(homeworkDone), "done");
  const none = html(render(pc.PronoteMiniCard, { device: "Alex Moreau", show_picture: false }));
  assert.doesNotMatch(none, /class="scene/);
});

test("every animated state has its animation, the still one none", () => {
  for (const s of ["class", "canceled", "homework", "done"]) assert.match(pc.sceneSvg(s), new RegExp(`class="scene ${s}"`));
  assert.match(pc.sceneSvg("class"), /windows lit/);
  assert.match(pc.sceneSvg("homework"), /class="pencil"/);
  assert.match(pc.sceneSvg("done"), /class="check"/);
  assert.match(pc.sceneSvg("canceled"), /class="shake"/);
  assert.doesNotMatch(pc.sceneSvg("idle"), /pencil|check|shake|lit/);
});

test("mini card: next lesson, upcoming changes, homework of the next school day", () => {
  const card = render(pc.PronoteMiniCard, { device: "Alex Moreau" });
  const out = html(card);
  assert.match(out, /<div class="big">History-Geography<\/div>/);
  assert.match(out, /Now · until 11:15/);
  assert.match(out, /11:15 English — Teacher absent/);
  assert.match(out, /Homework · Tomorrow/);
  assert.match(out, /aria-label="Mathematics, To do"/);
  assert.doesNotMatch(out, /French/, "homework of another day");
  // On the canceled variant, the next lesson is the afternoon one.
  const later = html(render(pc.PronoteMiniCard, { device: "Alex Moreau" }, makeHass(canceled)));
  assert.match(later, /<div class="big">Physics-Chemistry<\/div>/);
  assert.match(later, /Next · 13:30 – 14:30/);
});

test("mini card: the detail button switches to the full card and back", () => {
  const card = render(pc.PronoteMiniCard, { device: "Alex Moreau" });
  assert.match(html(card), /class="zoom" data-action="zoom"/);
  click(card, { action: "zoom" });
  assert.match(html(card), /tabs sections/);
  assert.deepEqual(plain(card.getGridOptions()), { columns: 12, min_columns: 6, rows: "auto" });
  click(card, { action: "zoom" });
  assert.doesNotMatch(html(card), /tabs sections/);
  assert.doesNotMatch(html(render(pc.PronoteMiniCard, { zoom: false })), /data-action="zoom"/);
});

test("show_title and show_subtitle hide the header texts", () => {
  const card = render(pc.PronoteCard, { show_title: false, show_subtitle: false });
  assert.ok(card.attrs.has("hide-title") && card.attrs.has("hide-subtitle"));
});

test("dark theme switches the accent", () => {
  const card = render(pc.PronoteCard, {}, makeHass({}, { themes: { darkMode: true } }));
  assert.ok(card.attrs.has("dark"));
});

test("a value click opens Home Assistant's more-info", () => {
  const card = render(pc.PronoteCard, { device: "Alex Moreau" });
  click(card, { entity: "sensor.pronote_alex_moreau_grades" });
  assert.equal(card.events.at(-1).type, "hass-more-info");
  assert.equal(card.events.at(-1).detail.entityId, "sensor.pronote_alex_moreau_grades");
});

test("an unavailable homework sensor shows a grey chip", () => {
  const id = "sensor.pronote_alex_moreau_homework";
  const out = html(render(pc.PronoteCard, { device: "Alex Moreau" }, makeHass({ [id]: { entity_id: id, state: "unavailable", attributes: {} } })));
  assert.match(out, /chip clickable idle[^>]*title="Unavailable"/);
});

test("the card is translated, numbers and dates in the card's language", () => {
  const out = html(render(pc.PronoteCard, { device: "Alex Moreau", default_tab: "grades", language: "fr" }));
  assert.match(out, /Moyenne générale/);
  assert.match(out, /13,52/);
  assert.match(out, /Emploi du temps/);
});

test("numbers with a comma, and grade levels", () => {
  assert.equal(pc.parseNum("13,45"), 13.45);
  assert.equal(pc.parseNum("Abs"), null);
  assert.equal(pc.gradeClass(16), "ok");
  assert.equal(pc.gradeClass(11), "active");
  assert.equal(pc.gradeClass(9), "warn");
  assert.equal(pc.gradeClass(3, 10), "crit");
  assert.equal(pc.esc('<a href="x">'), "&lt;a href=&quot;x&quot;&gt;");
});

test("acquisition levels: the negative wordings are not taken for acquired", () => {
  assert.equal(pc.levelClass({ level: "Très bonne maîtrise", abbreviation: "A+" }), "ok");
  assert.equal(pc.levelClass({ level: "Maîtrise satisfaisante", abbreviation: "A" }), "ok");
  assert.equal(pc.levelClass({ level: "Acquis" }), "ok");
  assert.equal(pc.levelClass({ level: "En cours d'acquisition" }), "warn");
  assert.equal(pc.levelClass({ level: "Maîtrise fragile", abbreviation: "C" }), "warn", "the text decides over the abbreviation");
  assert.equal(pc.levelClass({ level: "Non acquis" }), "crit");
  assert.equal(pc.levelClass({ level: "Maîtrise insuffisante" }), "crit");
  assert.equal(pc.levelClass({ abbreviation: "R" }), "crit");
  assert.equal(pc.levelClass({ level: "?" }), "idle");
});

test("attachments link only to http(s) addresses", () => {
  const hw = states["sensor.pronote_alex_moreau_homework"];
  const items = hw.attributes.homework.map((h, i) => (i === 2 ? { ...h, files: [{ name: "evil", url: "javascript:alert(1)" }, ...h.files] } : h));
  const card = render(pc.PronoteCard, { device: "Alex Moreau", default_tab: "homework" }, makeHass({ [hw.entity_id]: { ...hw, attributes: { ...hw.attributes, homework: items } } }));
  click(card, { action: "homework", entity: hw.entity_id, index: "2" });
  assert.doesNotMatch(html(card), /javascript:/);
  assert.match(html(card), /href="https:\/\/example.com\/lyrics.pdf"/);
});

test("integration 1.x: the student's own sensor gives the class and the school", () => {
  const ents = {
    "sensor.pronote_kim": { entity_id: "sensor.pronote_kim", device_id: "d1", platform: "pronote", translation_key: null },
    "sensor.pronote_kim_timetable_today": { entity_id: "sensor.pronote_kim_timetable_today", device_id: "d1", platform: "pronote", translation_key: null },
  };
  const sts = {
    "sensor.pronote_kim": { entity_id: "sensor.pronote_kim", state: "Kim", attributes: { full_name: "Kim", class_name: "5e A", establishment: "Collège Test" } },
    "sensor.pronote_kim_timetable_today": { entity_id: "sensor.pronote_kim_timetable_today", state: "0", attributes: { lessons: [] } },
  };
  const hass = { entities: ents, devices: { d1: { id: "d1", name: "Pronote - Kim" } }, states: sts, language: "en" };
  assert.equal(pc.resolve(hass)[0].entities.class, "sensor.pronote_kim");
  assert.match(html(render(pc.PronoteCard, {}, hass)), /5e A · Collège Test/);
});

test("both cards and their editors are registered, with a stub config and the visual editor", () => {
  assert.deepEqual(plain(pc.PronoteCard.getStubConfig()), {});
  assert.deepEqual(plain(pc.window.customCards.map((c) => c.type)), ["pronote-card", "pronote-mini-card"]);
  assert.ok(pc.PronoteCardEditor && pc.PronoteMiniCardEditor);
});
