// ---------------------------------------------------------------------------
// Sidebar panel (optional): the same data on a full page, opened from the sidebar
// ---------------------------------------------------------------------------
// Declared in YAML with `panel_custom` (see the README), loading this same file: the cards never need the panel,
// and the panel draws its own page (it does not embed the cards). The tab is in the address
// (`/pronote/homework`), the student shown is remembered in the browser.

export const PANEL_TABS = ["today", ...TABS];
export const STUDENT_KEY = "pronote-panel-student";

export const PANEL_STYLE = `
  :host { display: block; min-height: 100%; background: var(--primary-background-color); color: var(--primary-text-color); --pc-natural-width: auto; }
  :host::before { display: none; }
  /* The top bar: the cards' illustrated banner across the page (wall, desk, parquet), the student shown as its title,
     the students as a segmented choice under the subtitle, round glass buttons at the right; the text tabs under it. */
  .pbar { container-type: inline-size; flex: none; }
  .pbar ha-menu-button { flex: none; margin: 0 -6px 0 -4px; color: inherit; }
  .pbar .pc-desk { right: 44px; width: min(200px, calc(62% - 44px)); }
  .pbar .htext { left: 4px; right: calc(min(200px, calc(62% - 44px)) * .52 + 44px); }
  @container (max-width: 340px) { .pbar .pc-desk { display: none; } .pbar .htext { right: 48px; } }
  .pbar .rbtns { position: absolute; z-index: 2; right: 8px; top: 8px; display: flex; gap: 6px; }
  .rbtn { all: unset; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; flex: none;
          color: #33506b; background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .rbtn:hover { background: rgba(255,255,255,.75); }
  .rbtn .icon { width: 18px; height: 18px; }
  .night .rbtn { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .night .rbtn:hover { background: rgba(255,255,255,.22); }
  .seg { display: inline-flex; gap: 2px; margin-top: 3px; padding: 2px; border-radius: 12px; background: rgba(255,255,255,.5); align-self: flex-start;
         max-width: 100%; overflow-x: auto; scrollbar-width: none; box-sizing: border-box; }
  .seg::-webkit-scrollbar { display: none; }
  .night .seg { background: rgba(255,255,255,.1); }
  .seg button { all: unset; font-size: 11px; line-height: 16px; padding: 1px 9px; border-radius: 10px; cursor: pointer; white-space: nowrap; flex: none; }
  .seg button[aria-pressed="true"] { background: rgba(255,255,255,.85); color: ${ACCENTS[0]}; font-weight: 600; }
  .night .seg button[aria-pressed="true"] { background: rgba(255,255,255,.2); color: #fff; }
  .tabs.sections { padding: 0 12px; background: var(--card-background-color); }
  .tabs.sections .tab { font-size: 14px; padding: 10px 10px 9px; }
  main { padding: 16px; max-width: 1400px; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; align-items: start; }
  .pane { overflow: visible; }
  .pane-title { display: flex; align-items: center; gap: 8px; padding: 12px 12px 0; font-size: 15px; font-weight: 500; }
  .pane-title .icon { width: 20px; height: 20px; color: var(--pc-accent); }
  .pane-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pane-title .aside { margin-left: auto; font-size: 12px; font-weight: 400; color: var(--secondary-text-color); }
  /* One wide pane per tab: its blocks laid out in columns, the summaries across the whole width. */
  .content.cols { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; align-items: start; }
  .content.cols > :is(.summary, .tiles, .overall, .empty, .periodbar) { grid-column: 1 / -1; }
  .section-title.static { cursor: default; }
  .page > .backdrop { position: fixed; padding-top: 106px; }
  .page > .backdrop .modal { max-height: calc(100% - 122px); }
  @media (max-width: 600px) {
    main { padding: 8px; gap: 8px; }
    .grid { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .content.cols { grid-template-columns: minmax(0, 1fr); }
  }
`;
