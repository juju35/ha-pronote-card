// Mock Home Assistant registries and states shaped like the Pronote integration (delphiki/hass-pronote), used by the
// tests and the screenshots. Two fictional students of fictional schools; every name, teacher and text is made up.
// The screenshots freeze the clock at NOW (Tuesday 17 November 2026, 10:20 in Paris): a lesson is going on, one is
// canceled later in the morning and one has changed rooms in the afternoon.
export const NOW = "2026-11-17T10:20:00+01:00";
export const TODAY = "2026-11-17";
export const NEXT_DAY = "2026-11-18";

export const states = {};
export const entities = {};
export const devices = {};

const device = (id, name) => (devices[id] = { id, name: `Pronote - ${name}`, model: name, manufacturer: "Pronote", identifiers: [["pronote", name]], name_by_user: null });
const entity = (entity_id, device_id, translation_key, state, attributes = {}) => {
  entities[entity_id] = { entity_id, device_id, platform: "pronote", translation_key };
  states[entity_id] = { entity_id, state: String(state), attributes };
};

const COLORS = {
  Mathematics: "#4f8fd6",
  French: "#d36b5e",
  "History-Geography": "#e0a64a",
  English: "#7a73d0",
  "Physics-Chemistry": "#3fae8c",
  "Physical Education": "#c46a9a",
  "Life and Earth Sciences": "#5fb88f",
  Technology: "#8a96a8",
  Music: "#e58b3a",
  Spanish: "#c9a227",
  Philosophy: "#6d8fa8",
};

const lesson = (day, start, end, subject, room, teacher, extra = {}) => ({
  start_at: `${day}T${start}:00+01:00`,
  end_at: `${day}T${end}:00+01:00`,
  start_time: start,
  end_time: end,
  lesson: subject,
  classroom: room,
  canceled: false,
  status: null,
  background_color: COLORS[subject] || "#888888",
  teacher_name: teacher,
  teacher_names: [teacher],
  classrooms: [room],
  outing: false,
  memo: null,
  group_name: null,
  group_names: [],
  exempted: false,
  virtual_classrooms: [],
  num: 0,
  detention: false,
  test: false,
  is_morning: start < "13:00",
  is_afternoon: start >= "13:00",
  ...extra,
});

const timetable = (lessons) => ({ lessons, canceled_lessons_counter: lessons.filter((l) => l.canceled).length });

const homework = (date, subject, description, done, files = []) => ({
  date,
  subject,
  short_description: description.slice(0, 125),
  description,
  done,
  background_color: COLORS[subject] || "#888888",
  files,
});

const grade = (date, subject, value, outOf, avg, comment = "") => ({
  date,
  subject,
  comment,
  grade: value,
  out_of: outOf,
  default_out_of: "20",
  grade_out_of: `${value}/${outOf}`,
  coefficient: "1",
  class_average: avg,
  max: "19",
  min: "6",
  is_bonus: false,
  is_optionnal: false,
  is_out_of_20: outOf === "20",
});

const average = (subject, value, cls) => ({ average: value, class: cls, max: "18,5", min: "7", out_of: "20", default_out_of: "20", subject, background_color: COLORS[subject] });

const common = (name) => ({ full_name: name, nickname: null, via_parent_account: true, updated_at: "2026-11-17T10:05:00+01:00" });

// ── Alex Moreau, 4e B ──
const A = "pronote_alex";
device(A, "Alex Moreau");
const a = (key, state, attrs = {}) => entity(`sensor.pronote_alex_moreau_${key}`, A, key, state, { ...common("Alex Moreau"), ...attrs });
a("class", "4e B", { class_name: "4e B", establishment: "Collège des Tilleuls" });
const alexToday = [
  lesson(TODAY, "08:00", "09:00", "Mathematics", "B12", "Mr Garnier"),
  lesson(TODAY, "09:00", "10:00", "French", "A04", "Ms Lambert"),
  lesson(TODAY, "10:15", "11:15", "History-Geography", "B07", "Mr Roussel"),
  lesson(TODAY, "11:15", "12:15", "English", "A11", "Ms Perrin", { canceled: true, status: "Teacher absent" }),
  lesson(TODAY, "13:30", "14:30", "Physics-Chemistry", "Lab 2", "Ms Faure", { status: "Room changed", classroom: "Lab 2", classrooms: ["Lab 2"] }),
  lesson(TODAY, "14:30", "16:30", "Physical Education", "Gym", "Mr Caron"),
];
const alexNext = [
  lesson(NEXT_DAY, "08:00", "09:00", "Music", "C02", "Ms Renaud"),
  lesson(NEXT_DAY, "09:00", "10:00", "Technology", "C10", "Mr Picard"),
  lesson(NEXT_DAY, "10:15", "11:15", "Mathematics", "B12", "Mr Garnier", { test: true }),
  lesson(NEXT_DAY, "11:15", "12:15", "Life and Earth Sciences", "Lab 1", "Ms Brunet"),
];
a("lessons_today", alexToday.length, timetable(alexToday));
a("lessons_tomorrow", alexNext.length, timetable(alexNext));
a("lessons_next_day", alexNext.length, timetable(alexNext));
const alexHomework = [
  homework(NEXT_DAY, "Mathematics", "Revise chapter 4 (linear equations) for the test, exercises 12 to 15 page 86.", false),
  homework(NEXT_DAY, "Technology", "Finish the sketch of the bridge model and bring cardboard.", true),
  homework(NEXT_DAY, "Music", "Learn the first verse of the song.", false, [{ name: "lyrics.pdf", url: "https://example.com/lyrics.pdf", type: 1 }]),
  homework("2026-11-19", "French", "Read chapters 3 and 4 of the novel and note three questions.", false),
  homework("2026-11-20", "English", "Write ten lines about your favourite place.", true),
];
a("homework", alexHomework.length, { homework: alexHomework, todo_counter: alexHomework.filter((h) => !h.done).length });
a("grades", 6, {
  grades: [
    grade("2026-11-14", "Mathematics", "16", "20", "12,4", "Fractions"),
    grade("2026-11-13", "English", "14,5", "20", "13,1", "Oral presentation"),
    grade("2026-11-12", "History-Geography", "11", "20", "11,8", "Map test"),
    grade("2026-11-10", "Physics-Chemistry", "7", "10", "6,2"),
    grade("2026-11-07", "French", "9", "20", "10,6", "Dictation"),
    grade("2026-11-05", "Technology", "Abs", "20", "12"),
  ],
});
a("averages", 7, {
  averages: [
    average("English", "14,20", "12,90"),
    average("French", "11,40", "11,10"),
    average("History-Geography", "12,75", "12,00"),
    average("Mathematics", "15,60", "11,80"),
    average("Physical Education", "16,00", "14,30"),
    average("Physics-Chemistry", "13,50", "12,20"),
    average("Technology", "9,20", "12,60"),
  ],
});
a("overall_average", "13,52");
a("current_period", "Term 1", { id: "term_1", name: "Term 1", start: "2026-09-01T00:00:00", end: "2026-11-28T00:00:00", is_current_period: true });
a("evaluations", 3, {
  evaluations: [
    {
      name: "Experimental approach",
      domain: null,
      date: "2026-11-10",
      subject: "Physics-Chemistry",
      description: "",
      coefficient: 1,
      paliers: [],
      teacher: "Ms Faure",
      acquisitions: [
        { order: 1, name: "Formulate a hypothesis", abbreviation: "A+", level: "Très bonne maîtrise", domain: "", coefficient: 1, pillar: "", pillar_prefix: "" },
        { order: 2, name: "Use a measuring tool", abbreviation: "A", level: "Maîtrise satisfaisante", domain: "", coefficient: 1, pillar: "", pillar_prefix: "" },
      ],
    },
    {
      name: "Reading aloud",
      domain: null,
      date: "2026-11-06",
      subject: "French",
      description: "",
      coefficient: 1,
      paliers: [],
      teacher: "Ms Lambert",
      acquisitions: [{ order: 1, name: "Read fluently", abbreviation: "B", level: "Maîtrise fragile", domain: "", coefficient: 1, pillar: "", pillar_prefix: "" }],
    },
  ],
});
a("absences", 2, {
  absences: [
    { from: "2026-11-03T08:00:00+01:00", to: "2026-11-03T12:15:00+01:00", justified: true, hours: "4h15", days: 0, reason: "Medical appointment" },
    { from: "2026-10-14T13:30:00+02:00", to: "2026-10-14T14:30:00+02:00", justified: false, hours: "1h00", days: 0, reason: "" },
  ],
});
a("delays", 1, { delays: [{ date: "2026-11-12T08:00:00+01:00", minutes: 10, justified: true, justification: "Late bus", reasons: "" }] });
a("punishments", 0, { punishments: [] });
a("menus", 2, {
  menus: [
    {
      name: "Lunch",
      date: TODAY,
      is_lunch: true,
      is_dinner: false,
      first_meal: [{ name: "Grated carrots", labels: [] }],
      main_meal: [{ name: "Vegetable lasagna", labels: [] }],
      side_meal: [{ name: "Green salad", labels: [] }],
      other_meal: [],
      cheese: [{ name: "Yogurt", labels: [] }],
      dessert: [{ name: "Apple", labels: [] }],
    },
  ],
});
a("information_and_surveys", 2, {
  unread_count: 1,
  information_and_surveys: [
    { author: "Head teacher", title: "Parent-teacher meeting on 2 December", read: false, creation_date: "2026-11-15T09:00:00+01:00", start_date: "2026-11-15", category: "Information" },
    { author: "School office", title: "Photo day", read: true, creation_date: "2026-11-04T09:00:00+01:00", start_date: "2026-11-04", category: "Information" },
  ],
});

// ── Sam Moreau, 1re 3 ──
const S = "pronote_sam";
device(S, "Sam Moreau");
const s = (key, state, attrs = {}) => entity(`sensor.pronote_sam_moreau_${key}`, S, key, state, { ...common("Sam Moreau"), ...attrs });
s("class", "1re 3", { class_name: "1re 3", establishment: "Lycée du Parc" });
const samToday = [
  lesson(TODAY, "08:00", "10:00", "Philosophy", "D21", "Ms Vidal"),
  lesson(TODAY, "10:00", "11:00", "Spanish", "D14", "Mr Marchand"),
  lesson(TODAY, "11:00", "12:00", "Mathematics", "E03", "Ms Colin"),
  lesson(TODAY, "14:00", "16:00", "Physics-Chemistry", "Lab 4", "Mr Henry"),
];
const samNext = [lesson(NEXT_DAY, "08:00", "10:00", "History-Geography", "D08", "Mr Arnaud"), lesson(NEXT_DAY, "10:00", "12:00", "English", "D11", "Ms Royer")];
s("lessons_today", samToday.length, timetable(samToday));
s("lessons_tomorrow", samNext.length, timetable(samNext));
s("lessons_next_day", samNext.length, timetable(samNext));
const samHomework = [homework(NEXT_DAY, "English", "Prepare the debate arguments.", true), homework("2026-11-19", "Philosophy", "Essay plan: can we be free alone?", false)];
s("homework", samHomework.length, { homework: samHomework, todo_counter: 1 });
s("grades", 2, { grades: [grade("2026-11-13", "Spanish", "15", "20", "12,9"), grade("2026-11-09", "Mathematics", "12,5", "20", "10,4")] });
s("averages", 2, { averages: [average("Mathematics", "12,10", "10,90"), average("Spanish", "15,30", "13,20")] });
s("overall_average", "13,70");
s("absences", 0, { absences: [] });
s("delays", 0, { delays: [] });

// ── State variants of the screenshots and GIFs ──
const at = (id, attrs) => ({ [id]: { ...states[id], attributes: { ...states[id].attributes, ...attrs } } });
const AT = "sensor.pronote_alex_moreau_lessons_today";
const AH = "sensor.pronote_alex_moreau_homework";
// A lesson going on (the default states): "class".
export const inClass = {};
// Between lessons, with English canceled later in the morning: "canceled".
export const canceled = at(AT, { lessons: alexToday.map((l) => (l.start_time === "10:15" ? { ...l, canceled: true, status: "Trip postponed" } : l)) });
// School day over: homework still to do for the next day: "homework".
export const homeworkToDo = at(AT, { lessons: alexToday.map((l) => ({ ...l, canceled: false, status: null, start_at: l.start_at.replace(TODAY, "2026-11-16"), end_at: l.end_at.replace(TODAY, "2026-11-16") })) });
// School day over, all homework for the next day done: "done".
export const homeworkDone = {
  ...homeworkToDo,
  ...at(AH, { homework: alexHomework.map((h) => (h.date === NEXT_DAY ? { ...h, done: true } : h)), todo_counter: 2 }),
};
