# Changelog

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
