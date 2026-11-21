// ---------------------------------------------------------------------------
// Sidebar panel (optional): the same data on a full page, opened from the sidebar
// ---------------------------------------------------------------------------
// Declared in YAML with `panel_custom` (see the README), loading this same file: the cards never need the panel,
// and the panel draws its own page (it does not embed the cards). The tab is in the address
// (`/pronote/homework`), the student shown is remembered in the browser.

const PANEL_TABS = ["today", ...TABS];
const STUDENT_KEY = "pronote-panel-student";

const PANEL_STYLE = `
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

// ── Folded top bar ──
// As on the dashboards' illustrated headers (ha-dashboard-header): past 24 px of scroll the 90 px top bar and the
// text tabs fold into one 64 px bar — the panel's icon, title and line, the tabs as round icon pills, the status pill
// and the round buttons — sticky at the top; back under 8 px they unfold. The content does not move: the folded bar
// keeps the room of the top bar and tabs under it. On a narrow panel the pills get a row of their own under the bar,
// the status pill turns to a dot and only the first round button is kept. The folded bar mirrors the top bar and the
// tabs (their text, counts, active tab and buttons): a click on a pill or a button clicks the original.
const pronotePanel_FOLD_CSS = `
  .pf-sense { position:relative; height:0; }
  .pf-sense, .pf-fold, .pf-top, .pf-tabs { overflow-anchor:none; }
  .pf-sense > i { position:absolute; left:0; width:1px; height:1px; pointer-events:none; visibility:hidden; }
  .pf-sense > .pf-s1 { top:24px; } .pf-sense > .pf-s2 { top:8px; }
  .pf-fold { display:none; position:sticky; top:0; z-index:6; container-type:inline-size; color:var(--primary-text-color);
             background:var(--card-background-color, #fff); border-bottom:1px solid var(--divider-color, rgba(0,0,0,.12));
             box-shadow:0 2px 8px rgba(0,0,0,.08); }
  :host([pf-folded]) .pf-fold { display:block; }
  .pf-fold.pf-measure { display:block; position:absolute; visibility:hidden; }
  :host([pf-folded]) .pf-top, :host([pf-folded]) .pf-tabs { display:none !important; }
  .pf-bar { display:flex; flex-wrap:wrap; align-items:center; column-gap:12px; min-height:64px; padding:0 16px; box-sizing:border-box; }
  .pf-menu { flex:none; margin-inline:-8px -4px; color:var(--primary-text-color); }
  .pf-menu[hidden] { display:none; }
  .pf-ic { flex:none; width:40px; height:40px; border-radius:50%; display:grid; place-items:center; color:var(--pf-accent);
           background:color-mix(in srgb, currentColor 14%, transparent); }
  .pf-ic svg, .pf-ic img { width:22px; height:22px; fill:currentColor; }
  .pf-ic ha-icon, .pf-ic ha-svg-icon { --mdc-icon-size:22px; }
  .pf-names { display:flex; flex-direction:column; flex:0 1 auto; min-width:0; max-width:260px; }
  .pf-t { font-size:17px; font-weight:700; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pf-s { font-size:12.5px; line-height:1.3; color:var(--secondary-text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pf-s:empty { display:none; }
  .pf-pills { display:flex; gap:6px; flex:1 1 0; min-width:0; overflow-x:auto; scrollbar-width:none; padding:8px 6px 6px 2px; }
  .pf-pills::-webkit-scrollbar { display:none; }
  .pf-pill { all:unset; position:relative; flex:none; width:48px; height:40px; box-sizing:border-box; border-radius:999px; cursor:pointer;
             display:grid; place-items:center; color:var(--primary-text-color); border:1px solid var(--divider-color, rgba(0,0,0,.12)); }
  .pf-pill:hover { background:color-mix(in srgb, currentColor 6%, transparent); }
  .pf-pill[aria-selected="true"] { color:var(--pf-accent); border:1.5px solid var(--pf-accent); background:color-mix(in srgb, var(--pf-accent) 14%, transparent); }
  .pf-pill:focus-visible { outline:2px solid var(--pf-accent); outline-offset:2px; }
  .pf-pill svg { width:20px; height:20px; fill:currentColor; }
  .pf-pill ha-icon { --mdc-icon-size:20px; display:flex; }
  .pf-pill .pf-l { font-size:14px; font-weight:700; }
  .pf-pill b { position:absolute; top:-5px; right:-5px; min-width:18px; height:18px; padding:0 4px; box-sizing:border-box; border-radius:999px;
               font-size:11px; font-weight:700; line-height:14px; text-align:center; color:#fff; background:var(--pf-accent);
               border:2px solid var(--card-background-color, #fff); }
  .pf-end { display:flex; align-items:center; gap:8px; flex:0 1 auto; min-width:0; margin-inline-start:auto; }
  .pf-end > :not(.pf-stat):not(.pf-acts) { min-width:0; max-width:220px; }
  .pf-stat { display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px; font-size:12px; font-weight:600;
             white-space:nowrap; color:var(--pf-c); background:color-mix(in srgb, var(--pf-c) 14%, transparent); }
  .pf-stat > i { width:8px; height:8px; border-radius:50%; background:currentColor; flex:none; }
  .pf-stat:empty, .pf-stat[hidden] { display:none; }
  .pf-acts { display:flex; gap:8px; }
  .pf-acts > * { all:unset; box-sizing:border-box; cursor:pointer; width:40px; height:40px; border-radius:50%; display:grid; place-items:center;
                 color:var(--primary-text-color); border:1px solid var(--divider-color, rgba(0,0,0,.12)); }
  .pf-acts > *:hover { background:color-mix(in srgb, currentColor 6%, transparent); }
  .pf-acts > *:focus-visible { outline:2px solid var(--pf-accent); outline-offset:2px; }
  .pf-acts > *[disabled] { opacity:.6; cursor:default; }
  .pf-acts svg { width:20px; height:20px; fill:currentColor; }
  .pf-acts ha-icon { --mdc-icon-size:20px; display:flex; }
  .pf-acts .spin svg, .pf-acts .spinning svg { animation:pf-spin 1s linear infinite; }
  @keyframes pf-spin { to { transform:rotate(360deg); } }
  .pf-extra:empty { display:none; }
  .pf-subs { position:absolute; left:0; right:0; top:100%; display:flex; gap:4px; padding:0 12px; overflow-x:auto; scrollbar-width:none;
             background:var(--card-background-color, #fff); border-bottom:1px solid var(--divider-color, rgba(0,0,0,.12));
             box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .pf-subs[hidden] { display:none; }
  .pf-subs::-webkit-scrollbar { display:none; }
  .pf-sub { all:unset; flex:none; display:inline-flex; align-items:center; gap:6px; padding:9px 10px 7px; cursor:pointer; font-size:13px;
            font-weight:500; color:var(--secondary-text-color); border-bottom:2px solid transparent; white-space:nowrap; --mdc-icon-size:18px; }
  .pf-sub:hover { color:var(--primary-text-color); }
  .pf-sub[aria-selected="true"] { color:var(--primary-text-color); border-bottom-color:var(--pf-accent); }
  .pf-sub[aria-selected="true"] ha-icon { color:var(--pf-accent); }
  .pf-sub:focus-visible { outline:2px solid var(--pf-accent); outline-offset:-2px; }
  @container (max-width: 600px) {
    .pf-bar { min-height:0; padding:12px 12px 0 16px; column-gap:10px; row-gap:2px; }
    .pf-names { flex:1 1 0; max-width:none; }
    .pf-t { font-size:17px; }
    .pf-pills { order:9; flex:1 0 100%; margin:0 -12px 0 -16px; padding:6px 12px 10px; }
    .pf-stat { width:26px; height:26px; padding:0; justify-content:center; }
    .pf-stat > span { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
    .pf-acts > *:not(:first-child) { display:none; }
    .pf-end > :not(.pf-stat):not(.pf-acts) { max-width:120px; }
  }
`;

/**
 * Folds the panel's top bar on scroll. `o`: `top` and `tabs` (the top bar and the tab row), `tab` (a tab, in the
 * row), `key` (a tab's id, from the button), `icons` (id → SVG path), `badge` (a tab's count, in it), `name`, `sub`,
 * `icon`, `status` (in the top bar), `acts` (its round buttons), `accent` (CSS colour), `extra` (an element shown
 * under the bar when folded, such as a sub-tab row: moved there while folded), `side` (an element moved before the
 * status pill while folded, such as an account picker), `subtab` (the sub-tabs of the tab shown, in the page:
 * mirrored in a row under the folded bar), `mount` (the node the folded bar goes before, when not the top bar), `menu` (() => ({ hass, narrow,
 * show })) for Home Assistant's menu button, `css` (the panel's own rules while folded; the folded bar's height is
 * `--pf-h` on the panel), `folded` (start folded: the page was drawn again while folded), `badgeColors` (the counts take the colours of the tabs' own badges), `skip` (() => true while the top bar must not fold). Returns { sync, detach }, or null when the panel has no top bar.
 */
function pronotePanelFold(host, o) {
  const root = host.shadowRoot;
  const q = (sel) => (sel ? root?.querySelector?.(sel) : null);
  const top = q(o.top);
  const tabs = q(o.tabs);
  host.removeAttribute?.("pf-folded");
  if (!root || !top || !tabs || typeof root.querySelector !== "function") return null;
  if (!root.getElementById?.("pf-style")) {
    const style = document.createElement("style");
    style.id = "pf-style";
    style.textContent = pronotePanel_FOLD_CSS + (o.css || "");
    root.appendChild(style);
  }
  top.classList.add("pf-top");
  tabs.classList.add("pf-tabs");
  const sense = document.createElement("div");
  sense.className = "pf-sense";
  sense.setAttribute("aria-hidden", "true");
  sense.innerHTML = '<i class="pf-s1"></i><i class="pf-s2"></i>';
  const fold = document.createElement("div");
  fold.className = "pf-fold";
  fold.style.setProperty("--pf-accent", o.accent);
  fold.innerHTML = `<div class="pf-bar"><ha-menu-button class="pf-menu" hidden></ha-menu-button><span class="pf-ic" aria-hidden="true"></span>
    <div class="pf-names"><span class="pf-t"></span><span class="pf-s"></span></div>
    <div class="pf-pills" role="tablist"></div>
    <div class="pf-end"><span class="pf-stat" role="status"></span><div class="pf-acts"></div></div></div><div class="pf-extra"></div><div class="pf-subs" role="tablist" hidden></div>`;
  const at = o.mount || top;
  at.parentNode.insertBefore(sense, at);
  at.parentNode.insertBefore(fold, at);
  const el = (c) => fold.querySelector(c);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  let folded = false;
  let queued = false;
  let extraHome = null;
  let sideHome = null;

  const tabButtons = () => [...tabs.querySelectorAll(o.tab)];
  const tabLabel = (b) => {
    const clone = b.cloneNode(true);
    for (const n of clone.querySelectorAll?.(`${o.badge || ".badge"}, ha-menu-button, svg`) || []) n.remove();
    return (b.getAttribute("aria-label") || clone.textContent || "").trim();
  };
  const isActive = (b) => b.classList.contains("active") || b.getAttribute("aria-selected") === "true";

  const sync = () => {
    queued = false;
    if (!folded) return;
    const iconBox = q(o.icon);
    const icon = iconBox?.querySelector("svg, ha-icon, ha-svg-icon, img");
    el(".pf-ic").replaceChildren(...(icon ? [icon.cloneNode(true)] : []));
    // The icon keeps the colour of its state, as in the top bar
    el(".pf-ic").style.color = iconBox && !o.iconAccent ? getComputedStyle(iconBox).color : "";
    el(".pf-t").textContent = (q(o.name)?.textContent || "").trim();
    el(".pf-s").textContent = (q(o.sub)?.textContent || "").trim();
    const st = q(o.status);
    const stat = el(".pf-stat");
    const text = (st?.textContent || "").trim();
    stat.hidden = !text;
    if (text) {
      stat.style.setProperty("--pf-c", getComputedStyle(st).color || "var(--pf-accent)");
      stat.setAttribute("aria-label", text);
      stat.innerHTML = `<i></i><span>${esc(text)}</span>`;
    }
    const focused = root.activeElement?.closest?.(".pf-pill")?.dataset.i;
    const shown = tabs.hidden ? [] : tabButtons();
    el(".pf-pills").innerHTML = (shown.length > 1 ? shown : [])
      .map((b, i) => {
        const id = o.key(b);
        const label = tabLabel(b);
        const badgeEl = b.querySelector(o.badge || ".badge");
        const count = (badgeEl?.textContent || "").trim();
        // The count in the colour of its tab's own badge (its tone), where the panel colours them
        let tone = "";
        if (count && o.badgeColors) {
          const cs = getComputedStyle(badgeEl);
          tone = ` style="background:${cs.backgroundColor};color:${cs.color}"`;
        }
        const path = o.icons[id];
        const glyph = !path
          ? `<span class="pf-l" aria-hidden="true">${esc(label.slice(0, 1))}</span>`
          : path.startsWith("mdi:")
            ? `<ha-icon icon="${esc(path)}" aria-hidden="true"></ha-icon>`
            : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
        const on = isActive(b);
        return `<button class="pf-pill" role="tab" data-i="${i}" aria-selected="${on}" tabindex="${on ? 0 : -1}" title="${esc(label)}" aria-label="${esc(count ? `${label} (${count})` : label)}">${glyph}${count ? `<b aria-hidden="true"${tone}>${esc(count)}</b>` : ""}</button>`;
      })
      .join("");
    if (focused !== undefined) el(`.pf-pill[data-i="${focused}"]`)?.focus({ preventScroll: true });
    // The active pill in sight in a scrolling row, without scrolling the page
    const row = el(".pf-pills");
    const act = el(".pf-pill[aria-selected=true]");
    if (act && (act.offsetLeft < row.scrollLeft || act.offsetLeft + act.offsetWidth > row.scrollLeft + row.clientWidth)) {
      row.scrollLeft = Math.max(0, act.offsetLeft - 16);
    }
    // The sub-tabs of the tab shown (in the page, under the top bar), mirrored in a row under the folded bar
    const subs = o.subtab ? [...root.querySelectorAll(o.subtab)].filter((b) => !fold.contains(b)) : [];
    const subRow = el(".pf-subs");
    subRow.hidden = subs.length < 2;
    subRow.innerHTML = subs.length < 2 ? "" : subs
      .map((b, i) => {
        const on = isActive(b);
        const ic = b.querySelector("ha-icon")?.getAttribute("icon");
        return `<button class="pf-sub" role="tab" data-s="${i}" aria-selected="${on}" tabindex="${on ? 0 : -1}">${ic ? `<ha-icon icon="${esc(ic)}" aria-hidden="true"></ha-icon>` : ""}${esc(tabLabel(b))}</button>`;
      })
      .join("");
    subRow.onclick = (ev) => {
      const sb = ev.target.closest?.(".pf-sub");
      if (sb) subs[Number(sb.dataset.s)]?.click();
    };
    const acts = el(".pf-acts");
    acts.textContent = "";
    for (const a of o.acts ? root.querySelectorAll(o.acts) : []) {
      if (a.offsetParent === null && !top.contains(a)) continue;
      const c = a.cloneNode(true);
      c.removeAttribute("id");
      if (c.tagName !== "A") {
        // The panel's own click handlers see the original only (its data-* stay off the copy)
        for (const n of [c, ...c.querySelectorAll("*")]) for (const at of [...n.attributes]) if (at.name.startsWith("data-")) n.removeAttribute(at.name);
        c.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          a.click();
        });
      }
      acts.appendChild(c);
    }
    const m = o.menu?.();
    const menu = el(".pf-menu");
    menu.hidden = !m?.show;
    if (m) {
      menu.hass = m.hass;
      menu.narrow = m.narrow;
    }
  };
  const queue = () => {
    if (queued || !folded) return;
    queued = true;
    requestAnimationFrame(sync);
  };

  const setFolded = (v) => {
    if (v === folded) return;
    if (v) {
      const t = top.getBoundingClientRect();
      const b = tabs.getBoundingClientRect();
      if (!t.height || o.skip?.()) return; // top bar hidden (Settings): the tabs alone stay sticky
      const extra = q(o.extra);
      const room = (extra?.getBoundingClientRect().bottom || (b.height ? b.bottom : t.bottom)) - t.top;
      folded = true;
      sync();
      if (extra) {
        extraHome = [extra.parentNode, extra.nextSibling];
        el(".pf-extra").appendChild(extra);
      }
      const side = q(o.side);
      if (side) {
        sideHome = [side.parentNode, side.nextSibling];
        el(".pf-end").prepend(side);
      }
      // Measured out of the flow first, so that the content never moves (nor the browser's scroll anchoring with it)
      fold.style.width = `${t.width}px`;
      fold.classList.add("pf-measure");
      const h = fold.offsetHeight;
      fold.classList.remove("pf-measure");
      fold.style.width = "";
      fold.style.marginBottom = `${Math.round(room - h)}px`;
      host.style.setProperty("--pf-h", `${h}px`);
      host.setAttribute("pf-folded", "");
    } else {
      folded = false;
      const extra = el(".pf-extra").firstElementChild;
      if (extra && extraHome) extraHome[0].insertBefore(extra, extraHome[1] && extraHome[1].parentNode === extraHome[0] ? extraHome[1] : null);
      extraHome = null;
      const side = sideHome && el(".pf-end").firstElementChild;
      if (side && !side.matches(".pf-stat")) sideHome[0].insertBefore(side, sideHome[1] && sideHome[1].parentNode === sideHome[0] ? sideHome[1] : null);
      sideHome = null;
      host.removeAttribute("pf-folded");
      fold.style.marginBottom = "";
    }
  };

  el(".pf-pills").addEventListener("click", (ev) => {
    const p = ev.target.closest?.(".pf-pill");
    if (p) tabButtons()[Number(p.dataset.i)]?.click();
  });
  el(".pf-pills").addEventListener("keydown", (ev) => {
    const step = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
    const p = ev.target.closest?.(".pf-pill");
    if (!step || !p) return;
    ev.preventDefault();
    const all = [...el(".pf-pills").children];
    all[(Number(p.dataset.i) + step + all.length) % all.length]?.focus();
  });

  let io = null;
  if (typeof IntersectionObserver === "function") {
    const [s1, s2] = sense.children;
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const above = !e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 0);
        if (e.target === s1 && above) setFolded(true);
        if (e.target === s2 && e.isIntersecting) setFolded(false);
      }
    });
    io.observe(s1);
    io.observe(s2);
  }
  const mo = typeof MutationObserver === "function" ? new MutationObserver(queue) : null;
  mo?.observe(top, { subtree: true, childList: true, characterData: true, attributes: true });
  mo?.observe(tabs, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "aria-selected", "hidden"] });
  // Drawn again while folded (a panel that rewrites its page): folded straight away, without a frame unfolded
  if (o.folded) setFolded(true);
  return {
    sync: queue,
    detach() {
      io?.disconnect();
      mo?.disconnect();
      setFolded(false);
      sense.remove();
      fold.remove();
      host.removeAttribute("pf-folded");
    },
  };
}
// ── End of the folded top bar ──

class PronotePanel extends PronoteCard {
  // Home Assistant gives a panel its `panel` (with the YAML `config`), `route` and `narrow`.
  set panel(panel) {
    this._panel = panel;
    const c = panel?.config || {};
    if (this._config && JSON.stringify(c) === JSON.stringify(this._panelConfig)) return;
    this._panelConfig = c;
    this.setConfig({ max_grades: 10, ...c });
  }

  get panel() {
    return this._panel;
  }

  set route(route) {
    this._route = route;
    const tab = String(route?.path || "").split("/")[1];
    if (PANEL_TABS.includes(tab) && tab !== this._tab) {
      this._tab = tab;
      this._update();
    }
  }

  get route() {
    return this._route;
  }

  set narrow(narrow) {
    this._narrow = !!narrow;
    this._syncMenu();
  }

  get narrow() {
    return this._narrow;
  }

  set hass(hass) {
    super.hass = hass;
    this._syncMenu();
    pronoteBadge.set(hass);
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (this._student === undefined) {
      try {
        this._student = localStorage.getItem(STUDENT_KEY) || null;
      } catch (_err) {
        this._student = null;
      }
    }
    super.setConfig(config || {});
  }

  // The sidebar button (narrow screens) needs hass and narrow as properties.
  _syncMenu() {
    const btn = this.shadowRoot.querySelector("ha-menu-button");
    if (!btn) return;
    btn.hass = this._hass;
    btn.narrow = this._narrow;
  }

  _update() {
    if (!this._hass || !this._config) return;
    // A press in progress: drawn once released, as on the cards (a rewrite under the pointer would lose the click).
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    this.toggleAttribute?.("dark", !!this._hass.themes?.darkMode);
    let html = this._render();
    const popup = this._popup ? this._popupHtml() : "";
    if (this._popup && !popup) this._popup = null;
    if (popup) html = html.replace(/<\/div>\s*$/, `${popup}</div>`);
    if (html === this._html) return;
    const kept = this._popup ? null : this._focusedSpot();
    const folded = Boolean(this.hasAttribute?.("pf-folded"));
    this._html = html;
    this.shadowRoot.innerHTML = html;
    this._attachFold(folded);
    this._syncMenu();
    if (kept) this._restoreFocus(kept);
    if (this._popup) this.shadowRoot.querySelector('.modal [data-action="popup_close"]')?.focus?.({ preventScroll: true });
  }

  connectedCallback() {
    super.connectedCallback?.();
    if (!this._fold && this.shadowRoot.querySelector(".pbar")) this._attachFold();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    this._fold?.detach();
    this._fold = null;
  }

  /** The top bar folds on scroll into one bar with the tabs as icon pills (see pronotePanelFold). */
  _attachFold(folded = false) {
    this._fold?.detach();
    this._fold = pronotePanelFold(this, {
      top: ".pbar",
      tabs: ".tabs.sections",
      tab: ".tab",
      key: (b) => b.dataset.tab,
      icons: {
        today: "mdi:calendar-today",
        timetable: "mdi:timetable",
        homework: "mdi:book-open-variant",
        grades: "mdi:chart-box-outline",
        school_life: "mdi:account-school-outline",
      },
      badge: ".badge",
      name: ".pbar .name",
      sub: ".pbar .sub",
      icon: ".pbar .type-icon",
      status: ".pbar .chip",
      acts: ".pbar .rbtns > *",
      side: ".pbar .seg",
      accent: "#2e7d32",
      css: `.pf-end .seg { margin-top:0; background:var(--secondary-background-color, rgba(127,127,127,.12)); }
        .pf-end .seg button[aria-pressed="true"] { background:var(--card-background-color, #fff); }`,
      folded,
      menu: () => ({ hass: this._hass, narrow: this._narrow, show: Boolean(this._narrow) }),
    });
  }

  _onClick(ev) {
    const el = ev.composedPath().find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    const d = el?.dataset;
    if (!this._popup && d?.action === "tab") {
      ev.stopPropagation();
      return this._goTab(d.tab);
    }
    if (!this._popup && d?.action === "refresh") {
      ev.stopPropagation();
      return this._refresh();
    }
    if (!this._popup && d?.action === "student") {
      try {
        localStorage.setItem(STUDENT_KEY, d.id);
      } catch (_err) {
        // Private browsing: the choice lasts until the page is reloaded.
      }
    }
    return super._onClick(ev);
  }

  _goTab(tab) {
    if (!PANEL_TABS.includes(tab)) return;
    this._tab = tab;
    const prefix = this._route?.prefix;
    if (prefix && globalThis.history?.replaceState) history.replaceState(history.state, "", `${prefix}/${tab}`);
    this._update();
    globalThis.scrollTo?.(0, 0);
  }

  // Sections are always open on the panel: plain titles, no chevron.
  _isCollapsed() {
    return false;
  }

  _sectionTitle(_key, icon, label, count = "") {
    return `<div class="section-title static">${svgIcon(icon)}<span>${esc(label)}</span>${count !== "" ? `<span class="count">· ${esc(count)}</span>` : ""}</div>`;
  }

  _pane(title, icon, body, { cls = "", aside = "" } = {}) {
    const head = title
      ? `<div class="pane-title">${svgIcon(icon)}<span>${esc(title)}</span>${aside ? `<span class="aside">${esc(aside)}</span>` : ""}</div>`
      : "";
    return `<ha-card class="pane"${cls ? ` data-pane="${cls}"` : ""}>${head}<div class="content${cls === "cols" ? " cols" : ""}">${body}</div></ha-card>`;
  }

  // Asks the integration for fresh data of the student shown (all its entities share one update).
  _refresh() {
    const ctx = this._context();
    const ids = ctx.error ? [] : Object.values(ctx.s.entities).filter(Boolean);
    if (ids.length) this._hass.callService("homeassistant", "update_entity", { entity_id: ids });
  }

  // The top bar (charter: illustrated, full width): the student shown as the title, so that switching student
  // changes it, the class under it, the students as a segmented choice (first names), a round refresh button.
  _bar(s, students, days) {
    const c = this._config;
    const night = isNight(this._hass, c) ? " night" : "";
    const menu = "<ha-menu-button></ha-menu-button>";
    if (!days) {
      return `<div class="pbar banner${night}">${deskSvg("none", this._uid)}<div class="htext">${menu}<div class="type-icon idle">${svgIcon(
        "school",
      )}</div><div class="titles"><div class="trow"><div class="name">${esc(c.title || "Pronote")}</div></div></div></div></div>`;
    }
    const b = this._bannerState(s, days);
    const alert = b.icon === "crit" || b.icon === "warn";
    const todo = this._homework(s).filter((h) => !h.done).length;
    const state = alert ? b.icon : s.entities.homework ? (todo ? "active" : "ok") : b.icon;
    const chip = alert ? this._chip(s, days, b.icon) : this._chip(s);
    const title = (students.length === 1 && c.title) || studentName(this._hass, s);
    const sub = this._subtitle(s);
    const seg =
      students.length > 1
        ? `<div class="seg" role="group" aria-label="${esc(this._t("students"))}">${students
            .map((x) => {
              const name = studentName(this._hass, x);
              return `<button data-action="student" data-id="${esc(x.id)}" aria-pressed="${x === s}" title="${esc(name)}">${esc(name.split(/\s+/)[0] || name)}</button>`;
            })
            .join("")}</div>`
        : "";
    const refresh = esc(this._t("refresh"));
    return `<div class="pbar banner${night}">${deskSvg(b.scene, this._uid, b.stamp, b.count)}
      <div class="htext">${menu}<div class="type-icon${state ? ` ${state}` : ""}">${svgIcon("school")}</div><div class="titles">
        <div class="trow"><div class="name">${esc(title)}</div>${chip}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}${seg}</div></div>
      <div class="rbtns"><button class="rbtn" data-action="refresh" title="${refresh}" aria-label="${refresh}">${svgIcon("refresh")}</button></div></div>`;
  }

  _tabBar(tab, s) {
    const todo = this._homework(s).filter((h) => !h.done).length;
    return `<div class="tabs sections" role="tablist" aria-label="${esc(this._t("sections"))}">${PANEL_TABS.map(
      (x) =>
        `<button class="tab" role="tab" data-action="tab" data-tab="${x}" aria-selected="${x === tab}"><span>${esc(this._t(x))}</span>${
          x === "homework" && todo ? `<span class="badge">${todo}</span>` : ""
        }</button>`,
    ).join("")}</div>`;
  }

  // Today: the lesson going on or the next one, the timetable, the homework for the next school day, the latest
  // grades, the school life counters and the menu.
  _today(s, days) {
    const e = s.entities;
    const tr = (k) => this._t(k);
    const day = dayLabel(tr, this._locale(), days.nextKey);
    const panes = [this._pane("", "", this._hero(s, days), { cls: "hero" }), this._pane(this._t("timetable"), "calendar", this._timetable(s, days))];
    if (e.homework) {
      const hw = this._homework(s)
        .map((h, i) => [h, i])
        .filter(([h]) => keyOf(h.date) === days.nextKey);
      const left = hw.filter(([h]) => !h.done).length;
      const body = hw.length
        ? `<div class="hw-list">${hw.map(([h, i]) => this._hwItem(h, i, e.homework)).join("")}</div>`
        : `<div class="empty">${esc(this._t("no_homework"))}</div>`;
      panes.push(this._pane(this._t("homework_for", { day }), "homework", body, { aside: left ? this._t("to_do", { n: left }) : "" }));
    }
    if (e.grades || e.overall_average) {
      const only = { overall_average: e.overall_average, current_period: e.current_period, grades: e.grades };
      panes.push(this._pane(this._t("grades"), "grades", this._grades({ ...s, entities: only, periods: {} })));
    }
    if (e.absences || e.delays || e.punishments || e.information) panes.push(this._pane(this._t("school_life"), "life", this._schoolLife(s, { tilesOnly: true })));
    if (e.menus) panes.push(this._pane(this._t("menus"), "food", this._menu(e.menus)));
    return `<div class="grid">${panes.join("")}</div>`;
  }

  // Timetable: today and the next school day side by side.
  _week(s, days) {
    const e = s.entities;
    const tr = (k) => this._t(k);
    const locale = this._locale();
    const hours = (ls) => {
      const real = ls.filter((l) => !l.canceled);
      return real.length ? `${real[0].start_time || timeOf(real[0].start_at)} – ${real.at(-1).end_time || timeOf(real.at(-1).end_at)}` : "";
    };
    const next = e.lessons_next_day || e.lessons_tomorrow;
    return `<div class="grid">${this._pane(tr("today"), "calendar", this._lessonList(days.todays, e.lessons_today), { aside: hours(days.todays) })}${this._pane(
      dayLabel(tr, locale, days.nextKey),
      "calendar",
      this._lessonList(days.next, next),
      { aside: hours(days.next) },
    )}</div>`;
  }

  _render() {
    const ctx = this._context();
    if (ctx.error) return `<style>${BASE_STYLE}${SCENE_STYLE}${BANNER_STYLE}${PANEL_STYLE}</style><div class="page">${this._bar({}, [])}<main>${ctx.error}</main></div>`;
    const { students, s, days } = ctx;
    const tab = PANEL_TABS.includes(this._tab) ? this._tab : PANEL_TABS.includes(this._config.default_tab) ? this._config.default_tab : "today";
    const body = {
      today: () => this._today(s, days),
      timetable: () => this._week(s, days),
      homework: () => this._pane("", "", this._homeworkTab(s), { cls: "cols" }),
      grades: () => this._pane("", "", this._grades(s), { cls: "cols" }),
      school_life: () => this._pane("", "", this._schoolLife(s), { cls: "cols" }),
    }[tab]();
    return `<style>${BASE_STYLE}${SCENE_STYLE}${FULL_STYLE}${DIALOG_STYLE}${BANNER_STYLE}${PANEL_STYLE}</style>
      <div class="page">${this._bar(s, students, days)}${this._tabBar(tab, s)}<main>${body}</main></div>`;
  }
}

define("pronote-panel", PronotePanel);

// ---------------------------------------------------------------------------
// Sidebar badge: the homework still to do on the Pronote panel's sidebar item
// ---------------------------------------------------------------------------
// Drawn whenever this bundle is loaded (a dashboard with a Pronote card, the panel itself, or on every page with
// `frontend: extra_module_url`, see the README), like Home Assistant's own notifications count. The panel is found in
// `hass.panels` by its element name, so its `url_path` and its `devices` are the ones of the YAML; the count is the
// homework not done of its students, the same as the panel's Homework tab badge. The last value is kept by the browser.
const BADGE_KEY = "pronote-panel-count";
const BADGE_EVERY_MS = 15000;

const pronotePanelOf = (hass) =>
  Object.entries(hass?.panels || {}).find(([, p]) => p?.component_name === "custom" && p.config?._panel_custom?.name === "pronote-panel");

// The homework not done of the panel's students (all the students when its config names none), or 0.
const pronoteBadgeCount = (hass, config = {}) => {
  const found = findStudents(hass, config || {});
  if (found.error) return 0;
  let n = 0;
  for (const s of found.students) {
    n += list(hass.states?.[s.entities.homework], "homework").filter((h) => h && typeof h === "object" && !h.done).length;
  }
  return n;
};

const badgeSpan = (text, slot) => {
  const el = document.createElement("span");
  el.className = "badge pronote-badge";
  el.slot = slot;
  el.dataset.key = text;
  el.textContent = text;
  // The start badge sits over the icon (a custom panel's icon is an <ha-icon>, which Home Assistant's own rule misses).
  const place = slot === "start" ? "position:absolute; top:var(--ha-space-1, 4px); left:26px; z-index:1; pointer-events:none; " : "";
  el.style.cssText = `${place}display:inline-flex; justify-content:center; align-items:center; min-width:18px; height:18px; box-sizing:border-box; padding:0 5px; border-radius:9px; font-size:11px; font-weight:500; line-height:1; color:#fff; background:var(--primary-color, ${ACCENTS[0]});`;
  return el;
};

const pronoteBadge = {
  count: 0,
  path: "",
  sidebar() {
    const main = document.querySelector?.("home-assistant")?.shadowRoot?.querySelector("home-assistant-main");
    return main?.shadowRoot?.querySelector("ha-sidebar")?.shadowRoot || null;
  },
  item() {
    const sb = this.sidebar();
    if (!sb || !this.path) return null;
    return sb.querySelector(`#sidebar-panel-${CSS.escape(this.path)}`) || sb.querySelector(`[href="/${CSS.escape(this.path)}"]`) || sb.querySelector(`[data-panel="${CSS.escape(this.path)}"]`);
  },
  // Mirrors Home Assistant's badge: a span in the start slot (collapsed sidebar) and one in the end slot (expanded);
  // on an older sidebar (an <a>), a single span at the right. Unchanged, it writes nothing (no observer loop).
  redraw() {
    const item = this.item();
    if (!item) return false;
    const spans = item.querySelectorAll(":scope > .pronote-badge");
    if (!this.count) {
      for (const b of spans) b.remove();
      return true;
    }
    const text = this.count > 99 ? "99+" : String(this.count);
    if (item.localName === "a") {
      if (spans[0]?.dataset.key === text) return true;
      for (const b of spans) b.remove();
      const b = badgeSpan(text, "end");
      b.style.cssText += "position:absolute; right:12px; top:50%; transform:translateY(-50%); pointer-events:none;";
      item.style.position = "relative";
      item.appendChild(b);
      return true;
    }
    if (spans.length === 2 && spans[0].dataset.key === text) return true;
    for (const b of spans) b.remove();
    const icon = item.querySelector(':scope > ha-icon[slot="start"], :scope > ha-svg-icon[slot="start"]');
    const start = badgeSpan(text, "start");
    if (icon) item.insertBefore(start, icon.nextSibling);
    else item.appendChild(start);
    item.appendChild(badgeSpan(text, "end"));
    return true;
  },
  observe() {
    const sb = this.sidebar();
    if (!sb) return setTimeout(() => this.observe(), 500);
    if (sb.__pronoteBadge) return;
    sb.__pronoteBadge = true;
    let raf = 0;
    new MutationObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        this.redraw();
      });
    }).observe(sb, { childList: true, subtree: true });
  },
  set(hass) {
    const panel = pronotePanelOf(hass);
    if (!panel) return;
    const [path, p] = panel;
    const count = pronoteBadgeCount(hass, p.config);
    if (count === this.count && path === this.path) return;
    this.count = count;
    this.path = path;
    try {
      localStorage.setItem(BADGE_KEY, String(count));
    } catch (_err) {
      // Drawn anyway, not kept.
    }
    this.redraw();
  },
  follow() {
    const hass = document.querySelector?.("home-assistant")?.hass;
    if (hass && !document.hidden) this.set(hass);
  },
  start() {
    try {
      this.count = Math.max(0, Number.parseInt(localStorage.getItem(BADGE_KEY), 10) || 0);
    } catch (_err) {
      this.count = 0;
    }
    this.observe();
    setTimeout(() => this.follow(), 3000);
    setInterval(() => this.follow(), BADGE_EVERY_MS);
  },
};

if (typeof document.querySelector === "function" && !window.__pronoteBadge) {
  window.__pronoteBadge = true;
  pronoteBadge.start();
}
