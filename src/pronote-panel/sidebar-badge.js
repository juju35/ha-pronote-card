// ---------------------------------------------------------------------------
// Sidebar badge: the homework still to do on the Pronote panel's sidebar item
// ---------------------------------------------------------------------------
// Drawn whenever this bundle is loaded (a dashboard with a Pronote card, the panel itself, or on every page with
// `frontend: extra_module_url`, see the README), like Home Assistant's own notifications count. The panel is found in
// `hass.panels` by its element name, so its `url_path` and its `devices` are the ones of the YAML; the count is the
// homework not done of its students, the same as the panel's Homework tab badge. The last value is kept by the browser.
export const BADGE_KEY = "pronote-panel-count";
export const BADGE_EVERY_MS = 15000;

export const pronotePanelOf = (hass) =>
  Object.entries(hass?.panels || {}).find(([, p]) => p?.component_name === "custom" && p.config?._panel_custom?.name === "pronote-panel");

// The homework not done of the panel's students (all the students when its config names none), or 0.
export const pronoteBadgeCount = (hass, config = {}) => {
  const found = findStudents(hass, config || {});
  if (found.error) return 0;
  let n = 0;
  for (const s of found.students) {
    n += list(hass.states?.[s.entities.homework], "homework").filter((h) => h && typeof h === "object" && !h.done).length;
  }
  return n;
};

export const badgeSpan = (text, slot) => {
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

export const pronoteBadge = {
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
