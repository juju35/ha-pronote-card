// ---------------------------------------------------------------------------
// Mini card: next lesson and homework of the next school day
// ---------------------------------------------------------------------------
import { esc } from "./core.js";
import { dayLabel, keyOf } from "./dates.js";
import { svgIcon } from "./numbers.js";
import { BASE_STYLE, DIALOG_STYLE, MINI_STYLE, isOutside, watchOutside } from "./styles.js";
import { SCENE_STYLE } from "./picture.js";
import { PronoteCard } from "./full-card.js";

// The mini card is a full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
export class PronoteMiniCard extends PronoteCard {
  constructor() {
    super();
    this._onUnzoom = (ev) => {
      if (this._zoomed && isOutside(this, ev)) this._setZoom(false);
    };
  }

  static getConfigElement() {
    return document.createElement("pronote-mini-card-editor");
  }

  connectedCallback() {
    this._unzoom ??= watchOutside(this, this._onUnzoom);
    this._unzoom.on();
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom?.off();
    // Back to the compact view once off the screen.
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 4;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? "collapse" : "expand")}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    this._update();
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
  }

  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev?.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus?.({ preventScroll: true });
  }

  _render() {
    if (this._zoomed) return super._render();
    const ctx = this._context();
    if (ctx.error) return ctx.error;
    const { students, s, days } = ctx;
    const tr = (k) => this._t(k);
    const hwEntity = s.entities.homework;
    const hw = this._homework(s)
      .map((h, i) => [h, i])
      .filter(([h]) => keyOf(h.date) === days.nextKey);
    const left = hw.filter(([h]) => !h.done).length;
    const hwBlock = hw.length
      ? `<div class="block"><div class="label">${svgIcon("homework")}<span>${esc(this._t("homework_for", { day: dayLabel(tr, this._locale(), days.nextKey) }))}</span>${
          left ? `<span class="aside">${esc(this._t("to_do", { n: left }))}</span>` : ""
        }</div><div class="hw-list">${hw.map(([h, i]) => this._hwItem(h, i, hwEntity, { compact: true })).join("")}</div></div>`
      : "";
    return `<style>${BASE_STYLE}${SCENE_STYLE}${MINI_STYLE}${DIALOG_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._header(s, students, days)}
        ${this._studentTabs(s, students)}
        <div class="content">${this._hero(s, days)}${hwBlock}</div>
      </ha-card>`;
  }
}
