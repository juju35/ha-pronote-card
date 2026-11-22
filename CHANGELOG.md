# Changelog

## 1.5.2 - 2026-11-22

### Performance
- Card picker: the previews are back (`preview: true`), and light. Each card's preview is drawn only once it scrolls into view of Home Assistant's card picker, which otherwise builds the preview of every card at once: until then it holds Home Assistant's state (no render, no history request, no animation). On a dashboard or in the card editor the card is drawn as before.

## 1.5.1 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.5.0 - 2026-11-21

### Features
- Panel: past 24 px of scroll the top bar folds into one sticky bar, as on the dashboards' illustrated headers (ha-dashboard-header) — the icon, title and line, the tabs as round icon pills with their counts, the status pill and the round buttons; back at the top it unfolds. The content does not move. On a narrow panel the pills get a row of their own under the bar, the status turns to a dot and only the first round button is kept. The students' choice goes into the folded bar too.

## 1.4.0 - 2026-11-20

### Features
- Sidebar panel: **illustrated top bar** (charter of the ha-* panels) in place of Home Assistant's toolbar and the welcome line — the cards' 90 px banner across the page (wall, desk following the student's day, parquet strip; night picture with a dark theme only, `illustration_theme` forces it), the **student shown as the title** (switching student changes it) with the status pill, the class and the school, the students as a segmented choice, a round refresh button (`homeassistant.update_entity` on the student's entities), the text tabs under it on the card background.
- Sidebar panel: **sidebar badge** with the number of homework still to do of the panel's students, drawn whenever the bundle is loaded (`frontend: extra_module_url` to have it on every page).

### Fixes
- Integration 1.x: the class sensor is no longer missed when its state arrives after the entity registry (the student list is not cached while a Pronote state is missing).
- Sidebar panel: no rewrite of the page while it is pressed (the update waits for the release, as on the cards), so that a tap on a tab, a student or a homework is never lost to a state change arriving at the same moment.

### Maintenance
- Tests: each source file runs as its own script in the test sandbox, so the coverage report measures `src/pronote-card.js`, `src/pronote-panel.js` and `src/i18n.js`.

## 1.3.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.3.0 - 2026-11-17

### Features
- **Illustrated header** on the full and the mini card (90 px): the title on a warm wall at the left, a desk at the right with the school bag and a pile of exercise books, and a 10 px parquet strip under the whole banner. The desk follows the student's day: homework to do for the next school day (the pen writes on the sheet), a grade of the last three days (the teacher's stamp lands on the test paper, with the grade), unread school information (an envelope with its count), homework done (a green check is drawn, sparkles twinkle) or no homework (books closed, the pencil at rest). The status line under the title says it and opens the matching sensor.
- The header icon always takes the colour of the status: red when a lesson of the day is canceled, orange when one has changed, the accent while there is something to do or a lesson is going on, green when the homework is done, grey when there is none.
- **Night version** of the illustration, after sunset (`sun.sun`) or with the dark theme; `illustration_theme: day | night` forces one. `illustration: false` keeps the classic header with its status chip. Both options are in the visual editors, translated into the 22 languages. Animations stop under `prefers-reduced-motion`.
- The **status pill** is back in the illustrated header, in the colour of the header icon (canceled lesson, changed lesson, homework to do, all done, unavailable), right after the title only when the whole title and its whole label fit there (the title is never cut for it), else on a line of its own under the subtitle (kept to one line); when even that does not fit in the header, and on cards 200 px wide or less, only its dot stays. Measured on the rendered header, so it holds in every language, in both headers. The mini card's detail button sits in the top-right corner of the banner in the frosted round style of the other cards.
- Night picture with the dark theme even while the sun is up (it used to wait for sunset when `sun.sun` exists).

### Documentation
- README: screenshots of the mini card expanded to the full card, light and dark.

## 1.2.1 - 2026-11-14

### Fixes
- **Mini card visual editor**: it now offers every option of the full card that its detailed view uses (`tabs`, `default_tab`, `max_grades`, `collapsed`, `show_teacher`, `show_canceled`, `show_done_homework`, `show_class_average`, `show_min_max`, `show_coefficient`, `show_periods`), beside `device` and `zoom`; the README lists them for both cards.

## 1.2.0 - 2026-11-13

### Features
- **Class min and max** on the Grades tab: under each grade (beside the class average) and under each subject average, as the Pronote integration gives them; `show_min_max: false` hides them (#7, suggested by @mielikki33).
- **Coefficient of each grade**, beside its date; `show_coefficient: false` hides it (#7, suggested by @mielikki33).
- **Period buttons** on the Grades tab: one per past term or semester, then the current period, to compare the overall average, the grades and the averages of the periods. They read the sensors the integration creates for the past periods (`averages_period`, `overall_average_period`, `grades_period`, `evaluations_period`), named after its "Periods" sensor; shown only when such sensors exist (none during the first term), `show_periods: false` hides them (#7, suggested by @mielikki33).

## 1.1.1 - 2026-11-13

### Fixes
- Folding back on a tap elsewhere now works on iOS (Safari and the companion app): a tap on something that is not clickable sent no click to the page, so what a click elsewhere folds (unfolded sections, the detailed view of the mini card, popups) stayed open. The press and the release are caught instead; a slider dragged out of the card and a scroll do not fold anything.
- Leaving the card (another dashboard view, a conditional card hidden) brings it back in its default state.
- A click could do nothing: Home Assistant updates the card several times a second, and a rewrite of the card between the press and the release replaced the element pressed, so that the click was lost. The card is no longer rewritten while a press is in progress; the pending update is drawn right after the click.
- No focus ring after a mouse click or a tap: the focus is kept across updates only for the keyboard.

## 1.1.0 - 2026-11-13

### Features
- **Sidebar panel** (`pronote-panel`, optional, declared with `panel_custom`): a full-page Pronote view with text tabs (Today, Timetable, Homework, Grades, School life), the tab in the address, one button per student in the header, laid out in columns on wide screens. The cards stay independent of it.
- Icon of the project (`brand/icon.svg`, `icon.png`, `icon@2x.png`): the cards' school glyph on a tile in their accent color, with an "A+" badge; shown at the top of the README and on the panel's Today tab.

## 1.0.0 - 2026-11-13

### Features
- **Pronote Card** (`custom:pronote-card`): header with the student, class and school, and a status chip (homework still to do); an animated picture of the school with the lesson going on or the next one, the canceled and changed lessons still to come and the homework for the next school day; then four text tabs:
  - **Timetable**: today or the next school day (Pronote's "next day" sensor), with the lesson going on (pulsing dot and progress bar), past lessons dimmed, **canceled lessons struck through in red and changed lessons in orange** with Pronote's status ("Teacher absent", "Room changed"…), tests, outings, detentions and the lunch break.
  - **Homework**: grouped by due day, done (checked) or to do, with the full text and the attachments in a popup at the top of the card.
  - **Grades**: overall average of the period, latest grades on their own scale with the class average, averages per subject with the class marker, evaluations with their acquisition levels.
  - **School life**: absences (justified or not), late arrivals, punishments, today's menu and the school's information (unread ones marked).
- **Pronote Mini Card** (`custom:pronote-mini-card`): next lesson (or the one going on), the changes still to come and the homework for the next school day; detail button at the top right to switch to the full card.
- Several students (several Pronote accounts): one text tab per student, or `device` / `devices` to pick them.
- Picture animated by the state of the day: lesson going on, lesson canceled, homework to do, homework done; still otherwise and with the reduced-motion setting.
- Collapsible sections folded back by a click elsewhere, visual editor for both cards, light and dark themes, 22 languages (English in the bundle, the others loaded on demand).
