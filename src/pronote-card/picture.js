// ── Picture ──
// The school drawn inline (its CSS animations run in the card's shadow root), animated by what the student's day is
// at: "class" (a lesson going on: the clock hand turns, the flag waves, the windows glow), "canceled" (a lesson of the
// day still to come is canceled: a red badge pops and shakes), "homework" (homework still to do for the next school
// day: the pencil writes on the open book), "done" (all that homework done: a green check is drawn, sparkles
// twinkle), "idle" (still).
export const sceneSvg = (state) => {
  const book =
    state === "homework" || state === "done"
      ? `<g class="book"><path d="M50 78q10-4 21 0v19q-11-4-21 0z" fill="var(--pc-page)" stroke="var(--pc-ink)" stroke-width="1"/>
         <path d="M71 78q11-4 21 0v19q-10-4-21 0z" fill="var(--pc-page)" stroke="var(--pc-ink)" stroke-width="1"/>
         <path d="M54 83h13M54 87h13M54 91h9" stroke="var(--pc-line)" stroke-width="1.4" stroke-linecap="round"/>
         <path class="write w1" d="M75 83h13" stroke="var(--pc-accent)" stroke-width="1.4" stroke-linecap="round" pathLength="10"/>
         <path class="write w2" d="M75 87h13" stroke="var(--pc-accent)" stroke-width="1.4" stroke-linecap="round" pathLength="10"/>
         <path class="write w3" d="M75 91h9" stroke="var(--pc-accent)" stroke-width="1.4" stroke-linecap="round" pathLength="10"/>
         ${
           state === "homework"
             ? `<g class="pencil"><path d="M86 68l5 5-11 11-6 1 1-6z" fill="#f5b83d" stroke="var(--pc-ink)" stroke-width=".8"/><path d="M75 79l5 5-6 1z" fill="#3c3c3c"/><path d="M86 68l5 5 2-2-5-5z" fill="#e58b9a"/></g>`
             : ""
         }</g>`
      : "";
  const badge =
    state === "done"
      ? `<g class="badge"><circle cx="78" cy="30" r="10" fill="var(--pc-ok)"/><path class="check" d="M73 30.5l3.5 3.5 6.5-7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" pathLength="20"/></g>
         <g class="sparkles" fill="#f6c343"><path class="s1" d="M90 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/><path class="s2" d="M64 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/><path class="s3" d="M92 42l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></g>`
      : state === "canceled"
        ? `<g class="badge"><g class="shake"><circle cx="78" cy="30" r="10" fill="var(--pc-crit)"/><path d="M74 26l8 8M82 26l-8 8" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></g></g>`
        : "";
  const lit = state === "class";
  return `<svg viewBox="0 0 96 104" role="img" aria-hidden="true" class="scene ${state}">
    <ellipse cx="48" cy="98" rx="40" ry="4" fill="rgba(0,0,0,.14)"/>
    <path d="M48 20V6" stroke="var(--pc-ink)" stroke-width="1.6" stroke-linecap="round"/>
    <path class="flag" d="M48 6h14l-3.5 4 3.5 4H48z" fill="var(--pc-accent)"/>
    <rect x="16" y="46" width="64" height="50" rx="2" fill="var(--pc-wall)"/>
    <rect x="16" y="46" width="64" height="4" fill="var(--pc-trim)"/>
    <path d="M9 48L48 21l39 27z" fill="var(--pc-roof)" stroke="var(--pc-roof-edge)" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="48" cy="37" r="7.5" fill="#fff" stroke="var(--pc-ink)" stroke-width="1.4"/>
    <path d="M48 37h3" stroke="var(--pc-ink)" stroke-width="1.5" stroke-linecap="round"/>
    <path class="hand" d="M48 37v-5" stroke="var(--pc-ink)" stroke-width="1.3" stroke-linecap="round"/>
    <g class="windows${lit ? " lit" : ""}">
      <rect x="22" y="55" width="12" height="10" rx="1.5"/><rect x="62" y="55" width="12" height="10" rx="1.5"/>
      <rect x="22" y="73" width="12" height="10" rx="1.5"/><rect x="62" y="73" width="12" height="10" rx="1.5"/>
    </g>
    <path d="M40 96V76a8 8 0 0 1 16 0v20z" fill="var(--pc-door)"/>
    <rect x="36" y="94" width="24" height="3" rx="1" fill="var(--pc-trim)"/>
    ${book}${badge}
  </svg>`;
};

export const SCENE_STYLE = `
  :host { --pc-wall: #f2e6cc; --pc-trim: #d9c7a3; --pc-roof: #c8584a; --pc-roof-edge: #a8463a; --pc-door: #7a5236; --pc-ink: #4a5260;
          --pc-glass: #a9c8e0; --pc-glass-lit: #ffd36b; --pc-page: #ffffff; --pc-line: #c3cad3; }
  :host([dark]) { --pc-wall: #d8c9a8; --pc-trim: #b7a37e; --pc-roof: #b24c40; --pc-roof-edge: #8f3a30; --pc-door: #6a462d; --pc-ink: #3d434d;
                  --pc-glass: #7f9db6; --pc-page: #eef1f4; --pc-line: #a9b1bb; }
  .picture { flex: none; display: flex; align-items: center; justify-content: center; }
  .picture svg { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 4px 8px rgba(0,0,0,.18)); }
  /* On a dark card the soft shadow only shows as a faint rectangle around the picture: the ground ellipse is enough. */
  :host([dark]) .picture svg { filter: none; }
  .scene .windows rect { fill: var(--pc-glass); }
  .scene .windows.lit rect { fill: var(--pc-glass-lit); animation: pc-glow 1.6s ease-in-out infinite alternate; }
  .scene .windows.lit rect:nth-child(2n) { animation-delay: .8s; }
  .scene .hand { transform-box: view-box; transform-origin: 48px 37px; }
  .scene.class .hand { animation: pc-spin 4s linear infinite; }
  .scene .flag { transform-box: view-box; transform-origin: 48px 10px; }
  .scene.class .flag { animation: pc-wave 1s ease-in-out infinite alternate; }
  .scene.canceled .windows rect { fill: color-mix(in srgb, var(--pc-glass) 55%, #555); }
  .scene .badge { transform-box: view-box; transform-origin: 78px 30px; animation: pc-pop .35s cubic-bezier(.3,1.6,.6,1) both; }
  .scene .shake { transform-box: view-box; transform-origin: 78px 30px; animation: pc-shake .5s ease-in-out .4s infinite; }
  .scene .check { stroke-dasharray: 20; animation: pc-draw .5s ease-out .25s both; }
  .scene .sparkles path { transform-box: fill-box; transform-origin: center; animation: pc-twinkle 1.8s ease-in-out infinite; }
  .scene .sparkles .s2 { animation-delay: .6s; } .scene .sparkles .s3 { animation-delay: 1.2s; }
  .scene .write { stroke-dasharray: 10; stroke-dashoffset: 0; }
  .scene.homework .write { animation: pc-write 3s linear infinite; }
  .scene.homework .w2 { animation-name: pc-write2; } .scene.homework .w3 { animation-name: pc-write3; }
  .scene .pencil { transform-box: view-box; }
  .scene.homework .pencil { animation: pc-pencil 3s linear infinite; }
  @keyframes pc-spin { to { transform: rotate(360deg); } }
  @keyframes pc-wave { from { transform: skewY(0deg) scaleX(1); } to { transform: skewY(-8deg) scaleX(.9); } }
  @keyframes pc-glow { from { opacity: .65; } to { opacity: 1; } }
  @keyframes pc-pop { from { transform: scale(0); } to { transform: scale(1); } }
  @keyframes pc-shake { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-9deg); } 75% { transform: rotate(9deg); } }
  @keyframes pc-draw { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
  @keyframes pc-twinkle { 0%, 100% { opacity: 0; transform: scale(.4) rotate(0); } 50% { opacity: 1; transform: scale(1) rotate(45deg); } }
  /* The three lines are written one after the other, the pencil following its tip along them. */
  @keyframes pc-write { 0% { stroke-dashoffset: 10; } 25%, 92% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 10; } }
  @keyframes pc-write2 { 0%, 30% { stroke-dashoffset: 10; } 55%, 92% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 10; } }
  @keyframes pc-write3 { 0%, 60% { stroke-dashoffset: 10; } 78%, 92% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 10; } }
  @keyframes pc-pencil {
    0% { transform: translate(0, 0); } 25% { transform: translate(13px, 0); } 30% { transform: translate(0, 4px); }
    55% { transform: translate(13px, 4px); } 60% { transform: translate(0, 8px); } 78% { transform: translate(9px, 8px); }
    92% { transform: translate(9px, 8px); } 100% { transform: translate(0, 0); }
  }
  .hero { display: flex; gap: 12px; align-items: center; }
  .hero .picture { width: 96px; height: 104px; }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .info .big { font-size: 20px; font-weight: 500; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .info .big.canceled { text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--pc-crit) 70%, transparent); }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 15px; height: 15px; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .line.accent { color: var(--pc-accent-text); }
  .line.accent .icon { color: var(--pc-accent); }
  @container (max-width: 300px) {
    .hero .picture { width: 72px; height: 80px; }
    .hero { gap: 10px; }
  }
  @container (max-width: 200px) {
    .hero .picture { display: none; }
  }
`;
