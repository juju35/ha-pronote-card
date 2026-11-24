// ── Illustrated header ──
// The banner: the title on the left over a warm wall, and at the right a desk with the school bag, a pile of
// exercise books and what the student's day is at: "homework" (homework to do for the next school day: the pen
// writes on the sheet), "grade" (a grade of the last days: the teacher's stamp lands on the test paper),
// "message" (unread school information: the envelope bobs, its badge counts them), "done" (that homework all done:
// a green check is drawn on the sheet, sparkles twinkle), "none" (no homework: the books stay closed, the pencil
// rests). A 10 px parquet strip runs under the whole banner; the desk's feet stand on it. Drawn in a 200 × 80
// picture anchored bottom right; `uid` keeps each card's ids apart on a page with several cards.
import { esc } from "./core.js";

export const deskSvg = (state, uid, stamp = "", count = 0) => {
  const sheet = (body) =>
    `<g class="sheet" transform="translate(170 26)"><rect x="-13" y="-11" width="26" height="22" rx="2" fill="#fff" stroke="#c9ced6"/>${body}</g>`;
  const lines = `<path d="M-8 -5h16M-8 0h12M-8 5h14" stroke="#c3cad3" stroke-width="1.2" stroke-linecap="round"/>`;
  const writing = `<path class="write w1" d="M-8 -5h16" stroke="var(--pc-accent)" stroke-width="1.2" stroke-linecap="round" pathLength="10"/>
      <path class="write w2" d="M-8 0h12" stroke="var(--pc-accent)" stroke-width="1.2" stroke-linecap="round" pathLength="10"/>
      <path class="write w3" d="M-8 5h14" stroke="var(--pc-accent)" stroke-width="1.2" stroke-linecap="round" pathLength="10"/>`;
  const pen = `<g class="pen" transform="translate(-8 -5)"><g><path d="M0 0l1.6-4.4 7.6-11 2.8 2-7.6 11z" fill="#f5b400" stroke="#9a7000" stroke-width=".5"/><path d="M0 0l1.6-4.4 2.8 2z" fill="#3c3c3c"/></g></g>`;
  const fs = stamp.length > 3 ? 4.6 : stamp.length > 2 ? 5.4 : 6.4;
  const top = {
    homework: sheet(`${writing}${pen}`),
    done: `${sheet(`${lines}<g class="tick"><circle cx="7" cy="6" r="6" fill="var(--pc-ok)"/><path class="check" d="M4 6.3l2 2 4-4.3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" pathLength="20"/></g>`)}
      <g class="sparkles" fill="#f6c343"><path class="s1" d="M190 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/><path class="s2" d="M150 12l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/><path class="s3" d="M192 36l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></g>`,
    grade: sheet(
      `<path d="M-9 -6h14M-9 -1h10" stroke="#c3cad3" stroke-width="1.2" stroke-linecap="round"/><g transform="rotate(-12 4 4)"><g class="stamp"><circle cx="4" cy="4" r="8" fill="rgba(229,72,77,.08)" stroke="#e5484d" stroke-width="1.4"/><text x="4" y="${4 + fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="700" font-family="sans-serif" fill="#e5484d">${esc(stamp)}</text></g></g>`,
    ),
    message: `<g class="bubble"><rect x="152" y="12" width="36" height="22" rx="4" fill="#fff" stroke="#c9ced6"/><path d="M156 16l14 8 14-8" stroke="#2f80ed" stroke-width="1.2" fill="none" stroke-linejoin="round"/>${
      count ? `<g class="count"><circle cx="188" cy="12" r="5" fill="#e5484d"/><text x="188" y="14.3" text-anchor="middle" font-size="6.4" font-weight="700" fill="#fff" font-family="sans-serif">${count > 9 ? "9+" : count}</text></g>` : ""
    }</g>`,
    none: `<g class="rest"><path d="M146 47.6l26-3.2" stroke="#f5b400" stroke-width="2.2" stroke-linecap="round"/><path d="M146 47.6l-2.6.3" stroke="#3c3c3c" stroke-width="2.2" stroke-linecap="round"/></g>`,
  }[state];
  return `<div class="pc-ground" aria-hidden="true"></div><svg class="pc-desk ${state}" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
    <defs><linearGradient id="pc-bag-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ee5a5f"/><stop offset="1" stop-color="#d63c42"/></linearGradient></defs>
    <rect class="desk-leg" x="100" y="65" width="3" height="15"/><rect class="desk-leg" x="193" y="65" width="3" height="15"/>
    <rect class="desk-top" x="96" y="62" width="104" height="3" rx=".6"/>
    <g transform="translate(120 62)"><path d="M-8 -30q0-8 8-8t8 8" stroke="#c43a3a" stroke-width="2.4" fill="none"/><rect x="-16" y="-30" width="32" height="30" rx="5" fill="url(#pc-bag-${uid})"/>
      <rect x="-10" y="-22" width="20" height="10" rx="2" fill="#c43a3a"/><rect x="-2" y="-14" width="4" height="4" rx="1" fill="#f5c84a"/></g>
    <g transform="translate(160 62)"><rect x="-16" y="-4" width="32" height="4" rx=".6" fill="#2f80ed"/><rect x="-14" y="-8" width="28" height="4" rx=".6" fill="#f5b400"/><rect x="-15" y="-12" width="30" height="4" rx=".6" fill="#43a047"/>
      ${state === "none" ? "" : `<rect x="-13" y="-16" width="26" height="4" rx=".6" fill="#8e5bd6"/>`}</g>
    ${top}
  </svg>`;
};

export const BANNER_STYLE = `
  .banner { position: relative; overflow: hidden; height: 90px; --g: 10px; color: #2b2118; background: #fdf3e7; }
  .banner.night { color: #fff; background: #2a2a36; }
  .pc-desk { position: absolute; right: 0; bottom: 10px; height: 80px; width: min(200px, 62%); overflow: visible; }
  .pc-ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px;
               background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow: inset 0 2px 0 #a97c50; }
  .night .pc-ground { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #5c4836; }
  .desk-top { fill: #c9b79c; } .desk-leg { fill: #b5a184; }
  .night .desk-top { fill: #3c4558; } .night .desk-leg { fill: #333b4c; }
  .night .pc-desk > g, .night .pc-desk .sheet { filter: brightness(.9); }
  /* The mini card's detail button sits top right: the desk moves aside so that it never hides the sheet. */
  .zoomable .pc-desk { right: 28px; width: min(200px, calc(62% - 28px)); }
  .zoomable .htext { right: calc(min(200px, calc(62% - 28px)) * .52 + 28px); }
  .htext { position: absolute; z-index: 1; left: 12px; top: 0; bottom: 10px; right: calc(min(200px, 62%) * .52);
           display: flex; align-items: center; gap: 10px; min-width: 0; }
  .htext .titles { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .htext .name { font-size: 16px; font-weight: 500; }
  .banner .sub { color: #6b5a48; }
  .banner .status { font-size: 12px; line-height: 16px; color: #3f3226; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .banner.night .sub { color: rgba(255,255,255,.66); }
  .banner.night .status { color: rgba(255,255,255,.86); }
  /* The round icon on the wall: white glass, the icon in the colour of the status. */
  .banner .type-icon { background: rgba(255,255,255,.66); box-shadow: inset 0 0 0 1px rgba(120,90,60,.16); }
  .banner .type-icon .icon, .banner .type-icon:is(.ok, .warn, .crit, .idle, .active) .icon { fill: color-mix(in srgb, var(--pc-tint) 82%, #000); }
  .banner.night .type-icon { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner.night .type-icon .icon, .banner.night .type-icon:is(.ok, .warn, .crit, .idle, .active) .icon { fill: color-mix(in srgb, var(--pc-tint) 72%, #fff); }
  .banner .chip { line-height: 16px; background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .chip { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; display: grid; place-items: center; color: #33506b;
                  background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
  .pc-desk .write { stroke-dasharray: 10; stroke-dashoffset: 0; }
  .pc-desk.homework .write { animation: pc-write 3s linear infinite; }
  .pc-desk.homework .w2 { animation-name: pc-write2; } .pc-desk.homework .w3 { animation-name: pc-write3; }
  .pc-desk.homework .pen { animation: pc-pen 3s linear infinite; }
  .pc-desk .tick { transform-box: fill-box; transform-origin: center; animation: pc-pop .35s cubic-bezier(.3,1.6,.6,1) both; }
  .pc-desk .check { stroke-dasharray: 20; animation: pc-draw .5s ease-out .25s both; }
  .pc-desk .sparkles path { transform-box: fill-box; transform-origin: center; animation: pc-twinkle 1.8s ease-in-out infinite; }
  .pc-desk .sparkles .s2 { animation-delay: .6s; } .pc-desk .sparkles .s3 { animation-delay: 1.2s; }
  .pc-desk .stamp { transform-box: fill-box; transform-origin: center; animation: pc-stamp 3.2s cubic-bezier(.3,1.4,.6,1) infinite; }
  .pc-desk .bubble { animation: pc-bob 2.4s ease-in-out infinite alternate; }
  .pc-desk .count { transform-box: fill-box; transform-origin: center; animation: pc-pulse 1.2s ease-in-out infinite alternate; }
  /* The pen's tip follows the three lines as they are written (pc-write in SCENE_STYLE). */
  @keyframes pc-pen {
    0% { transform: translate(-8px, -5px); } 25% { transform: translate(8px, -5px); } 30% { transform: translate(-8px, 0); }
    55% { transform: translate(4px, 0); } 60% { transform: translate(-8px, 5px); } 78%, 92% { transform: translate(6px, 5px); }
    100% { transform: translate(-8px, -5px); }
  }
  @keyframes pc-stamp { 0% { transform: scale(1.8); opacity: 0; } 12%, 88% { transform: scale(1); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
  @keyframes pc-bob { from { transform: translateY(0); } to { transform: translateY(-3px); } }
  @keyframes pc-pulse { from { transform: scale(1); } to { transform: scale(1.18); } }
  /* Narrow card: no room for the desk beside the text, the wall alone stays. */
  @container (max-width: 260px) { .pc-desk { display: none; } .htext, .zoomable .htext { right: 40px; } }
`;

// Night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the day
// picture after sunset).
export const isNight = (hass, config) => {
  if (config.illustration_theme === "night") return true;
  if (config.illustration_theme === "day") return false;
  return !!hass?.themes?.darkMode;
};
