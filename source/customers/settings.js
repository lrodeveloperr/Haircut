// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): a concise text settings list in the menu. Every setting is the
// player's choice; the defaults keep the game exactly as it was. Android policy actions register into this list.
//
//   hand         left-handed layout: the guards and the clipper button move to the left, the tool button to the
//                right (mirrored with CSS; the 3D clipper and its placement under the finger are unchanged)
//   sound        on or off: the game's own switch, kept here so the play screen stays clear
// Saved with the barber's progress (meta.js).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#10223f';
  const M = () => HSC.meta;
  const DEF = { left: false };
  const get = () => Object.assign({}, DEF, (M() && M().data && M().data.settings) || {});
  function set(k, v) {
    const d = M() && M().data;
    if (!d) return;
    d.settings = Object.assign(get(), { [k]: v });
    M().save();
    apply();
  }

  // ---- what each setting does ----
  const soundBtn = () => document.querySelector('.ui .audio-toggle');
  function apply() {
    const s = get(), b = document.body;
    if (!b) return;
    b.classList.toggle('hsc-left', s.left);
    if (ui.el.panel) ui.render();
  }

  // ---- icons ----
  const CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const GEAR = `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M10.3 2.5h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9-2.6-.5v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8z" fill="#c9cfd6" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.6" fill="#fff6e6" stroke="${INK}" stroke-width="1.6"/></svg>`;
  // on and off differ in shape, not only colour: a tick or a cross in the knob, which also moves
  const TICK = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#10223f" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CROSS = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="#10223f" stroke-width="3.2" stroke-linecap="round"/></svg>';

  const CSS = `
#hsc-set-btn svg{width:40px;height:40px}
#hsc-set{position:fixed;inset:0;z-index:32;display:none;background:#0d3f86b8;font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};touch-action:manipulation;zoom:var(--hsc-s,1)}
#hsc-set.open{display:flex;align-items:flex-end;justify-content:center}
#hsc-set .sheet{position:relative;width:min(100%,520px);max-height:92%;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:#fff6e6;border:3px solid ${INK};border-bottom:0;border-radius:26px 26px 0 0;box-shadow:0 -4px 0 ${INK};padding:14px max(14px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}
@media (orientation:landscape){#hsc-set.open{align-items:center}#hsc-set .sheet{border-radius:26px;border-bottom:3px solid ${INK};box-shadow:0 5px 0 ${INK}}}
#hsc-set .head{display:flex;align-items:center;justify-content:space-between}
#hsc-set .head h2{margin:0 8px;font:900 26px/1.1 "Arial Rounded MT Bold","Nunito",system-ui,sans-serif}
#hsc-set .x{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer;color:${INK};padding:0}
#hsc-set .row{display:flex;align-items:center;gap:12px;min-height:60px;padding:8px 12px;border-radius:18px;border:3px solid ${INK};background:#fff}
/* the label keeps its words whole; the language list gives way on a narrow phone (it shows the language's name) */
#hsc-set .label{flex:1 0 auto;min-width:0;font:800 16px/1.2 "DM Sans",system-ui,sans-serif}
#hsc-set .hands{display:flex;gap:8px;flex:none}
#hsc-set .hand{min-width:76px;height:48px;border-radius:14px;border:3px solid ${INK};background:#f1e4cc;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0 12px;font:800 15px/1 system-ui,sans-serif;color:${INK}}
#hsc-set .hand[aria-pressed=true]{background:#ffe08a;box-shadow:0 0 0 3px #ffb627}
#hsc-set .slide{flex:0 1 240px;display:flex;align-items:center;gap:8px}
#hsc-set .slide output{min-width:54px;text-align:end;font:800 14px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums}
#hsc-set input[type=range]{flex:1;height:48px;margin:0;background:transparent;-webkit-appearance:none;appearance:none;touch-action:none}
#hsc-set input[type=range]::-webkit-slider-runnable-track{height:12px;border-radius:6px;background:#e9dcc4;border:2.5px solid ${INK}}
#hsc-set input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:40px;height:40px;margin-top:-16px;border-radius:50%;background:#ffb627;border:3px solid ${INK};box-shadow:0 3px 0 ${INK}}
#hsc-set select{flex:0 1 180px;min-width:0;max-width:58%;height:48px;border-radius:14px;border:3px solid ${INK};background:#fff;padding:0 10px;font:800 16px/1 system-ui,sans-serif;color:${INK}}
@keyframes hsc-shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
#hsc-set .sw{position:relative;width:88px;height:48px;border-radius:24px;border:3px solid ${INK};background:#e9dcc4;cursor:pointer;padding:0;flex:none}
#hsc-set .sw .k{position:absolute;top:3px;left:3px;width:36px;height:36px;border-radius:50%;background:#fff;border:2.5px solid ${INK};display:flex;align-items:center;justify-content:center;transition:left .15s}
#hsc-set .sw[aria-checked=true]{background:#8fd18f}
#hsc-set .sw[aria-checked=true] .k{left:41px}
#hsc-set .actions{display:flex;flex-direction:column;gap:10px}
#hsc-set .action{width:100%;justify-content:space-between;cursor:pointer;color:${INK};font:800 16px/1.2 "DM Sans",system-ui,sans-serif;text-align:start}
#hsc-set .action[hidden]{display:none}
#hsc-set .action::after{content:"›";font-size:30px;line-height:1}
#hsc-set .action:focus-visible,#hsc-set .hand:focus-visible,#hsc-set .sw:focus-visible{outline:4px solid #3aa2f2;outline-offset:2px}
/* a page of its own, in the home screen's colours */
#hsc-set{background:radial-gradient(120% 90% at 50% 0%,#38d1e8,#1679c9 55%,#0d3f86);font-family:"Arial Rounded MT Bold","Nunito","Baloo 2",system-ui,sans-serif}
#hsc-set.open{align-items:flex-start;justify-content:center}
/* the page is zoomed by the UI scale, and inside a zoom env() is zoomed too: each safe-area inset is divided back by
   the scale, so the rows keep clear of a notch at the side and of the gesture bar below */
#hsc-set .sheet{width:min(100%,600px);height:100%;max-height:none;background:none;border:0;box-shadow:none;border-radius:0;padding:max(12px,calc(env(safe-area-inset-top) / var(--hsc-s,1))) max(12px,calc(env(safe-area-inset-right) / var(--hsc-s,1))) max(14px,calc(env(safe-area-inset-bottom) / var(--hsc-s,1))) max(12px,calc(env(safe-area-inset-left) / var(--hsc-s,1)));gap:12px}
#hsc-set .head{justify-content:flex-start;gap:10px;height:48px;flex:none}
#hsc-set .head h2{margin:0;color:#fff;-webkit-text-stroke:3px ${INK};paint-order:stroke fill;text-shadow:0 3px 0 ${INK}}
#hsc-set .x{border-radius:16px;background:linear-gradient(#fff,#dfe8f2);box-shadow:inset 0 -5px 0 #0002,0 4px 0 ${INK}}
#hsc-set .row{min-height:72px;box-shadow:0 4px 0 ${INK}}
#hsc-set .action{font:900 19px/1.2 "Arial Rounded MT Bold","Nunito",system-ui,sans-serif!important}
#hsc-set .label{font:900 19px/1.2 "Arial Rounded MT Bold","Nunito",system-ui,sans-serif}
/* a phone on its side: the rows in two columns, so every one of them, Privacy and Ad choices included, is in view
   without scrolling (one column needs about 500 px of height) */
@media (orientation:landscape) and (max-height:500px){
  #hsc-set .sheet{width:min(100%,860px);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-content:start;gap:8px 10px}
  #hsc-set .head{grid-column:1/-1}
  #hsc-set .actions{display:contents}
  #hsc-set .row{min-height:64px}
}
/* the sound switch lives in Settings */
.ui .audio-toggle{display:none!important}
/* left-handed: the guards and the clipper button on the left, the tool button on the right */
body.hsc-left .ui .guard-arc{right:auto;left:max(12px,env(safe-area-inset-left));transform:scaleX(-1)}
body.hsc-left .ui .guard-arc .rung{scale:-1 1}
body.hsc-left .ui .clip-toggle{right:auto;left:max(12px,env(safe-area-inset-left))}
/* item 33: touch targets of at least 48dp; the guards and the share button (46dp) get a 2dp invisible margin, so
   nothing changes in how they look */
.ui .guard-arc .rung::after,.hsc-native-share::after{content:"";position:absolute;inset:-2px;border-radius:50%}
`;

  const ui = {
    el: {}, built: false,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const p = document.createElement('div'); p.id = 'hsc-set';
      p.innerHTML = `<div class="sheet" role="dialog" aria-label="Settings">
        <div class="head"><button class="x" type="button" aria-label="Back">${HSC.icon ? HSC.icon('back', 26) : CLOSE}</button><h2 data-t="settings">Settings</h2></div>
        <div class="row"><label class="label" for="hsc-language" data-t="language">Language</label><select id="hsc-language" aria-label="Language"></select></div>
        <div class="row"><span class="label" data-t="hand">Hand</span><div class="hands">
          <button class="hand" type="button" data-left="1" aria-label="Left"><span data-t="left">Left</span></button>
          <button class="hand" type="button" data-left="0" aria-label="Right"><span data-t="right">Right</span></button></div></div>
        <div class="row"><span class="label" data-t="sound">Sound</span><button class="sw" type="button" role="switch" data-k="sound" aria-label="Sound"><span class="k"></span></button></div>
        <div class="actions"></div>
      </div>`;
      document.body.appendChild(p);
      this.el.panel = p;
      p.querySelector('.x').addEventListener('click', () => this.close());
      p.addEventListener('click', (e) => { if (e.target === p) this.close(); });
      p.querySelectorAll('.hand').forEach((b) => b.addEventListener('click', () => set('left', b.dataset.left === '1')));
      p.querySelector('.sw').addEventListener('click', () => { const b = soundBtn(); if (b) { b.click(); setTimeout(() => this.render(), 60); } });
      const language = p.querySelector('#hsc-language');
      for (const [value, name] of HSC.languageOptions || []) { const o = document.createElement('option'); o.value = value; o.textContent = name; language.appendChild(o); }
      language.addEventListener('change', () => { if (HSC.setLang) HSC.setLang(language.value); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && p.classList.contains('open')) this.close(); });
      setInterval(() => this.tick(), 120);
      apply();
    },
    actions: new Map(),
    addAction(action) {
      if (!action || !action.id || typeof action.run !== 'function' || this.actions.has(action.id)) return false;
      this.actions.set(action.id, Object.assign({}, action));
      if (this.el.panel) this.renderActions();
      return true;
    },
    renderActions() {
      const box = this.el.panel && this.el.panel.querySelector('.actions');
      if (!box) return;
      for (const action of this.actions.values()) {
        let b = box.querySelector(`[data-action="${action.id}"]`);
        if (!b) {
          b = document.createElement('button'); b.type = 'button'; b.dataset.action = action.id;
          b.className = 'row action' + (action.className ? ' ' + action.className : '');
          b.addEventListener('click', () => action.run()); box.appendChild(b);
        }
        const label = HSC.t ? HSC.t(action.label) : action.fallback || action.label;
        b.textContent = label; b.setAttribute('aria-label', label);
        b.hidden = typeof action.visible === 'function' ? !action.visible() : false;
      }
    },
    labels() {
      const p = this.el.panel;
      if (!p) return;
      p.setAttribute('dir', HSC.rtl && HSC.rtl() ? 'rtl' : 'ltr');
      p.querySelectorAll('[data-t]').forEach((el) => { el.textContent = HSC.t ? HSC.t(el.dataset.t) : el.dataset.t; });
      for (const [sel, key] of [['#hsc-language', 'language'], ['[data-left="1"]', 'left'], ['[data-left="0"]', 'right']]) {
        const el = p.querySelector(sel); if (el) el.setAttribute('aria-label', HSC.t ? HSC.t(key) : key);
      }
      this.renderActions();
    },
    render() {
      const s = get(), p = this.el.panel;
      p.querySelectorAll('.hand').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.left === '1') === s.left)));
      { const b = p.querySelector('.sw'), g = soundBtn(), on = !!g && g.getAttribute('aria-pressed') === 'true'; b.setAttribute('aria-checked', String(on)); b.querySelector('.k').innerHTML = on ? TICK : CROSS; }
      p.querySelector('#hsc-language').value = HSC.lang ? HSC.lang() : 'en';
      this.labels();
    },
    open() {
      this.render();
      this.el.panel.classList.add('open');
    },
    close() { this.el.panel.classList.remove('open'); },
    tick() {
      // the settings button goes in the HUD row; the menu (menu.js) takes it in as a tile
      const row = document.querySelector('#hsc-hud .hsc-row');
      if (row && !document.getElementById('hsc-set-btn')) {
        const b = document.createElement('button');
        b.className = 'hsc-btn'; b.id = 'hsc-set-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Settings');
        b.innerHTML = GEAR + '<span class="hsc-dot" hidden></span>';
        b.addEventListener('click', () => this.open());
        row.appendChild(b);
      }
    },
  };
  addEventListener('hsc-language', () => { if (ui.el.panel) { ui.labels(); ui.render(); } });
  const boot = () => { if (globalThis.skinFadeStudio && document.querySelector('#hsc-hud .hsc-row') && HSC.meta && HSC.meta.data) ui.build(); else setTimeout(boot, 300); };
  boot();
  HSC.settings = { get, set, open: () => ui.open(), addAction: (action) => ui.addAction(action), refresh: () => ui.renderActions() };
})(globalThis.HSC || (globalThis.HSC = {}));
