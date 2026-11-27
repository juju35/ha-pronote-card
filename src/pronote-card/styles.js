// ── Styles ──
import { ACCENTS } from "./core.js";

export const BASE_STYLE = `
  :host { --pc-accent: ${ACCENTS[0]}; --pc-ok: var(--success-color, #43a047); --pc-warn: var(--warning-color, #ffa600);
          --pc-crit: var(--error-color, #db4437); --pc-idle: var(--secondary-text-color, #9e9e9e); --pc-active: var(--info-color, #039be5);
          /* Text in a state or accent color is mixed with the text color so that it stays readable (4.5:1). */
          --pc-accent-text: color-mix(in srgb, var(--pc-accent) 55%, var(--primary-text-color)); }
  :host([dark]) { --pc-accent: ${ACCENTS[1]}; }
  ha-card { overflow: hidden; container-type: inline-size; }
  /* Natural width in a parent that sizes to its content (inline-block, grid "auto" column), without a minimum. */
  :host { display: block; min-width: 0; --pc-natural-width: 400px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--pc-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible, button:focus-visible, a:focus-visible { outline: 2px solid var(--primary-color, var(--pc-accent)); outline-offset: 2px; border-radius: 6px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  .accent { --c: var(--pc-accent); } .ok { --c: var(--pc-ok); } .warn { --c: var(--pc-warn); } .crit { --c: var(--pc-crit); } .idle { --c: var(--pc-idle); } .active { --c: var(--pc-active); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--pc-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--pc-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--pc-ok)) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; box-sizing: border-box; }
  .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .type-icon { position: relative; display: flex; width: 40px; height: 40px; border-radius: 50%; align-items: center; justify-content: center; flex: none;
               --pc-tint: var(--c, var(--pc-accent)); background: color-mix(in srgb, var(--pc-tint) 16%, transparent); transition: background-color .3s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: var(--pc-accent); transition: fill .3s ease; }
  .type-icon:is(.ok, .warn, .crit, .idle, .active) .icon { fill: color-mix(in srgb, var(--pc-tint) 60%, var(--primary-text-color)); }
  .titles { flex: 1 1 0; min-width: 5ch; }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  /* Title row (both headers): the name, then the status pill right after it, only when the whole name and the whole
     label fit there (measured by the card, see _fitPill); else the pill takes a line of its own under the subtitle
     (the subtitle kept to one line), and when even that does not fit, only its dot stays (its label in its title). */
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow > .name { flex: 0 1 auto; min-width: 4ch; }
  .trow > .chip { flex: none; max-width: none; }
  .titles.below { display: flex; flex-direction: column; }
  .titles.below .trow { display: contents; }
  .titles.below .trow > .chip { order: 9; align-self: flex-start; max-width: 100%; margin-top: 2px; }
  .titles.dot-only .trow > .chip { padding: 4px; }
  .titles.dot-only .trow > .chip .chip-text { display: none; }
  @container (max-width: 200px) { .trow > .chip { padding: 4px; } .trow > .chip .chip-text { display: none; } }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--pc-warn) 50%, var(--primary-text-color)); }
  /* Buttons: never filled, smoked glass with an outline; the active one has its icon and text in the accent color. */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 500;
         padding: 5px 12px; border-radius: 18px; color: var(--primary-text-color); min-width: 0;
         background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); border: 1px solid var(--divider-color, rgba(127,127,127,.3)); }
  .btn:hover { background: color-mix(in srgb, var(--pc-accent) 10%, transparent); }
  .btn .icon { width: 16px; height: 16px; color: var(--pc-accent); }
  /* Text tabs (students, sections): the active one underlined in the accent color. */
  .tabs { display: flex; gap: 2px; padding: 8px 12px 0; overflow-x: auto; scrollbar-width: none; border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.2)); }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { all: unset; box-sizing: border-box; display: inline-flex; align-items: center; gap: 6px; padding: 6px 8px 7px; cursor: pointer; font-size: 13px;
         font-weight: 500; color: var(--secondary-text-color); border-bottom: 2px solid transparent; white-space: nowrap; flex: none; }
  .tab .icon { width: 16px; height: 16px; }
  .tab:hover { color: var(--primary-text-color); }
  .tab[aria-selected="true"] { color: var(--pc-accent-text); border-bottom-color: var(--pc-accent); }
  .tab[aria-selected="true"] .icon { color: var(--pc-accent); }
  .tab .badge { font-size: 11px; min-width: 16px; padding: 0 5px; border-radius: 8px; box-sizing: border-box; text-align: center; line-height: 16px;
                background: color-mix(in srgb, var(--pc-active) 18%, transparent); color: color-mix(in srgb, var(--pc-active) 55%, var(--primary-text-color)); }
  .students .tab { font-size: 14px; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--pc-idle) 16%, transparent); color: var(--primary-text-color); }
  .content { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .content.hero-wrap { padding-bottom: 4px; }
  .empty { font-size: 13px; color: var(--secondary-text-color); padding: 4px 0; }
  .label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em;
           color: var(--secondary-text-color); margin-bottom: 6px; }
  .label .icon { width: 16px; height: 16px; }
  .label span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .label .aside { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 400; flex: none; }
  /* Lessons: a colored bar per subject (Pronote's color), the canceled ones struck through in red, the changed ones in orange. */
  .lessons { display: flex; flex-direction: column; gap: 4px; }
  .lesson { display: grid; grid-template-columns: 44px 4px minmax(0, 1fr) auto; align-items: center; gap: 0 8px; padding: 6px 8px 6px 4px; border-radius: 10px;
            background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .lesson .time { display: flex; flex-direction: column; align-items: flex-end; font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; line-height: 1.25; }
  .lesson .time .end { font-size: 11px; font-weight: 400; color: var(--secondary-text-color); }
  .lesson .stripe { align-self: stretch; border-radius: 2px; background: var(--sc, var(--pc-accent)); }
  .lesson .body { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .lesson .subj { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lesson .meta { display: flex; gap: 10px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .lesson .meta span { display: inline-flex; align-items: center; gap: 3px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lesson .meta .icon { width: 13px; height: 13px; }
  .lesson .chip { max-width: 120px; }
  .lesson.past { opacity: .55; }
  .lesson.canceled { background: color-mix(in srgb, var(--pc-crit) 9%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pc-crit) 35%, transparent); }
  .lesson.canceled .subj { text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--pc-crit) 70%, transparent); }
  .lesson.canceled .stripe { background: var(--pc-crit); }
  .lesson.changed { background: color-mix(in srgb, var(--pc-warn) 10%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pc-warn) 40%, transparent); }
  .lesson.now { box-shadow: inset 0 0 0 1.5px var(--pc-accent); background: color-mix(in srgb, var(--pc-accent) 9%, transparent); }
  .progress { height: 3px; border-radius: 2px; margin-top: 4px; background: color-mix(in srgb, var(--pc-accent) 18%, transparent); overflow: hidden; }
  .progress > div { height: 100%; background: var(--pc-accent); border-radius: 2px; }
  /* The lesson going on: a dot that pulses beside its start time. */
  .pulse { position: relative; width: 8px; height: 8px; border-radius: 50%; background: var(--pc-accent); display: inline-block; flex: none; }
  .pulse::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--pc-accent); animation: pc-pulse 1.6s ease-out infinite; }
  @keyframes pc-pulse { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(2.8); opacity: 0; } }
  .lesson .time .pulse { margin-top: 3px; }
  .break { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--secondary-text-color); padding: 2px 4px; }
  .break::before, .break::after { content: ""; flex: 1; border-top: 1px dashed var(--divider-color, rgba(127,127,127,.35)); }
  .break .icon { width: 14px; height: 14px; }
  .alert-line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: color-mix(in srgb, var(--c, var(--pc-crit)) 55%, var(--primary-text-color)); min-width: 0; }
  .alert-line .icon { width: 15px; height: 15px; color: var(--c, var(--pc-crit)); }
  .alert-line span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  /* Homework: a check circle (done) or an empty one (to do), the subject in its color. */
  .hw-list { display: flex; flex-direction: column; gap: 4px; }
  .hw { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; align-items: start; gap: 0 8px; padding: 7px 8px; border-radius: 10px;
        background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .hw > .icon { width: 20px; height: 20px; color: var(--pc-idle); margin-top: 1px; }
  .hw.done > .icon { color: var(--pc-ok); }
  .hw .subj { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; min-width: 0; }
  .hw .subj span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hw .subj .sdot { width: 8px; height: 8px; border-radius: 50%; background: var(--sc, var(--pc-accent)); flex: none; }
  .hw .desc { font-size: 12px; color: var(--secondary-text-color); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
              overflow-wrap: anywhere; margin-top: 1px; }
  .hw.done .subj span, .hw.done .desc { text-decoration: line-through; color: var(--secondary-text-color); }
  .hw .clip { width: 15px; height: 15px; color: var(--secondary-text-color); margin-top: 2px; }
  .hw-day + .hw-day { margin-top: 8px; }
  .narrow-hide { display: inline; }
  @container (max-width: 300px) {
    .lesson { grid-template-columns: 40px 4px minmax(0, 1fr); }
    .lesson .chip { grid-column: 3; justify-self: start; margin-top: 3px; max-width: 100%; }
    .narrow-hide { display: none; }
  }
  @container (max-width: 230px) {
    .lesson .meta { flex-direction: column; gap: 0; }
  }
`;

export const FULL_STYLE = `
  .daybar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .daybar .btn[aria-pressed="true"] { color: var(--pc-accent-text); border-color: color-mix(in srgb, var(--pc-accent) 55%, transparent);
                                      background: color-mix(in srgb, var(--pc-accent) 10%, transparent); }
  .daybar .hours { margin-left: auto; font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; }
  .summary { display: flex; flex-wrap: wrap; gap: 6px; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(88px, 1fr)); gap: 6px; }
  .tile { display: flex; flex-direction: column; gap: 2px; padding: 6px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .tile .k { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--secondary-text-color); min-width: 0; }
  .tile .k span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tile .k .icon { width: 14px; height: 14px; color: var(--c, var(--secondary-text-color)); }
  .tile .v { font-size: 18px; font-weight: 500; line-height: 1.3; }
  .tile .v small { font-size: 12px; font-weight: 400; color: var(--secondary-text-color); margin-left: 3px; }
  .tile:is(.warn, .crit) .v { color: color-mix(in srgb, var(--c) 55%, var(--primary-text-color)); }
  .overall { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px;
             background: color-mix(in srgb, var(--c, var(--pc-accent)) 10%, transparent); }
  .overall .big { font-size: 30px; font-weight: 400; line-height: 1; color: color-mix(in srgb, var(--c, var(--pc-accent)) 55%, var(--primary-text-color)); }
  .overall .big small { font-size: 14px; color: var(--secondary-text-color); margin-left: 2px; }
  .overall .what { display: flex; flex-direction: column; min-width: 0; font-size: 12px; color: var(--secondary-text-color); }
  .overall .what b { font-size: 14px; font-weight: 500; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em;
                   color: var(--secondary-text-color); margin-bottom: 6px; cursor: pointer; user-select: none; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .section-title .count { text-transform: none; letter-spacing: 0; font-weight: 400; }
  /* Chevron to the right when folded, down when unfolded. */
  .section-title .chevron { margin-left: auto; transition: transform .2s ease; }
  .section-title[aria-expanded="false"] { margin-bottom: 0; }
  .section-title[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .rows { display: flex; flex-direction: column; gap: 4px; }
  .row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 2px 10px; padding: 6px 10px; border-radius: 10px;
         background: var(--secondary-background-color, rgba(127,127,127,.08)); font-size: 13px; }
  .row .main { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .row .t1 { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
  .row .t1 span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .row .t2 { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .end { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; white-space: nowrap; }
  .row .end small { font-size: 11px; color: var(--secondary-text-color); }
  .row .chip { max-width: none; }
  .row .sdot { width: 8px; height: 8px; border-radius: 50%; background: var(--sc, var(--pc-accent)); flex: none; }
  .grade { font-size: 14px; font-weight: 600; padding: 1px 8px; border-radius: 10px; font-variant-numeric: tabular-nums;
           background: color-mix(in srgb, var(--c) 15%, transparent); color: color-mix(in srgb, var(--c) 55%, var(--primary-text-color)); }
  .grade small { font-size: 11px; font-weight: 400; color: var(--secondary-text-color); margin-left: 1px; }
  .avg { display: grid; grid-template-columns: minmax(0, 1fr) minmax(60px, 34%) 44px; align-items: center; gap: 4px 10px; font-size: 13px; padding: 4px 2px; }
  .avg .s { display: flex; align-items: center; gap: 6px; min-width: 0; }
  .avg .s span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .avg .track { position: relative; height: 6px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); }
  .avg .track > .fill { height: 100%; border-radius: 3px; background: var(--c, var(--pc-ok)); }
  .avg .track > .class { position: absolute; top: -3px; width: 2px; height: 12px; margin-left: -1px; border-radius: 1px; background: var(--primary-text-color); opacity: .55; }
  .avg .v { text-align: right; font-weight: 500; font-variant-numeric: tabular-nums; }
  /* Class min and max of a subject, under its name. */
  .avg .mm { grid-column: 1 / -1; margin-top: -4px; padding-left: 14px; font-size: 11px; color: var(--secondary-text-color); font-variant-numeric: tabular-nums;
             white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .end small.mm { font-variant-numeric: tabular-nums; }
  .legend { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--secondary-text-color); margin-top: 2px; }
  .legend i { width: 2px; height: 10px; background: var(--primary-text-color); opacity: .55; border-radius: 1px; }
  .acq { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end; }
  .acq .chip { max-width: none; }
  .menu { display: flex; flex-direction: column; gap: 4px; font-size: 13px; padding: 8px 10px; border-radius: 10px;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .menu .course { display: grid; grid-template-columns: minmax(70px, 30%) minmax(0, 1fr); gap: 8px; }
  .menu .course .k { color: var(--secondary-text-color); font-size: 12px; }
  .unread { width: 8px; height: 8px; border-radius: 50%; background: var(--pc-active); flex: none; }
  @container (max-width: 300px) {
    .avg { grid-template-columns: minmax(0, 1fr) 44px; }
    .avg .track { grid-column: 1 / -1; grid-row: 2; }
    .menu .course { grid-template-columns: minmax(0, 1fr); gap: 0; }
    .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;

// In-card popup at the top of the card (not centered), so that it stays in view when the card is long.
export const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 220px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 380px); max-height: calc(100% - 24px); overflow: auto;
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 10px; }
  .modal .m-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; }
  .modal .m-title .sdot { width: 10px; height: 10px; border-radius: 50%; background: var(--sc, var(--pc-accent)); flex: none; }
  .modal .m-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .modal .m-sub { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--secondary-text-color); }
  .modal .m-sub .chip { max-width: none; }
  .modal .msg { font-size: 14px; line-height: 1.45; white-space: pre-line; overflow-wrap: anywhere; }
  .modal .files { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
  .modal .files a { display: inline-flex; align-items: center; gap: 6px; color: var(--pc-accent-text); text-decoration: none; min-width: 0; }
  .modal .files a span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .modal .files .icon { width: 16px; height: 16px; color: var(--pc-accent); }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
`;

export const MINI_STYLE = `
  :host { --pc-natural-width: 320px; }
  .content { gap: 10px; }
  .hero .picture { width: 64px; height: 72px; }
  .hero .picture svg { filter: drop-shadow(0 2px 4px rgba(0,0,0,.18)); }
  .info .big { font-size: 16px; }
  .hw .desc { -webkit-line-clamp: 1; }
`;

// Home Assistant dialogs (the more-info opened from the card): a click inside them is not a click elsewhere.
export const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
export const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. The handler runs when the press and the release are both outside the card (a slider dragged out of the
// card does not count), and a scroll does not count (the browser cancels the pointer); keyboard clicks still go
// through the click event. The handler keeps its own checks (outside of the card, not in a dialog).
export const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = !ev.composedPath().includes(card);
  };
  const onUp = (ev) => {
    if (downOutside) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
    // A tap (press and release at the same spot), for the tests.
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
  };
};
// After the popup closes, clicks are ignored for this long: the second click of a double click on Close would
// otherwise land on what lies under it.
export const CLOSE_GUARD_MS = 400;
