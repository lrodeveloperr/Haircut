// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): a concise text settings list in the menu. Every setting is the
// player's choice; the defaults keep the game exactly as it was. Android policy actions register into this list.
//
//   hand         left-handed layout: the guards and the clipper button move to the left, the tool button to the
//                right (mirrored with CSS; the 3D clipper and its placement under the finger are unchanged)
//   (size and strength were removed 5 November 2026: a setting may not change a tool's physical result or its
//    effect footprint, TOOL-PHYSICS-AND-EFFECT-CONTRACT.md 7.3 items 5 and 6; saved values are ignored)
//   vibration    on (default) or off: every navigator.vibrate call is dropped when off
//   calm         reduce motion: interface animations and transitions stop (the reveal spin is the engine's own)
//   pulses       a sound cue on screen: waves pulse at the bottom while any game sound plays (for players who
//                cannot hear it)
// Saved with the barber's progress (meta.js).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#10223f';
  const M = () => HSC.meta;
  const DEF = { left: false, size: 2, sens: 2, vib: true, calm: false, pulses: false };
  const get = () => Object.assign({}, DEF, (M() && M().data && M().data.settings) || {});
  function set(k, v) {
    const d = M() && M().data;
    if (!d) return;
    d.settings = Object.assign(get(), { [k]: v });
    M().save();
    apply();
  }

  // ---- what each setting does ----
  // vibration
  const vib = navigator.vibrate ? navigator.vibrate.bind(navigator) : null;
  if (vib) try { navigator.vibrate = (p) => (get().vib ? vib(p) : false); } catch (e) {}
  // sound pulses: count the game's playing sound sources (all its sounds are Web Audio sources)
  const live = { n: 0 };
  const SN = globalThis.AudioScheduledSourceNode;
  if (SN && SN.prototype.start) {
    const start = SN.prototype.start;
    SN.prototype.start = function () {
      if (!this.__hscLive) { this.__hscLive = true; live.n++; this.addEventListener('ended', () => { if (this.__hscLive) { this.__hscLive = false; live.n--; } }, { once: true }); }
      return start.apply(this, arguments);
    };
  }
  const audible = () => { try { const v = globalThis.skinFadeStudio.getView(); return !!(v && v.audio && !v.paused); } catch (e) { return false; } };

  function apply() {
    const s = get(), b = document.body;
    if (!b) return;
    b.classList.toggle('hsc-left', s.left);
    b.classList.toggle('hsc-calm', s.calm);
    if (ui.el.panel) ui.render();
  }

  // ---- icons ----
  const CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const GEAR = `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M10.3 2.5h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9-2.6-.5v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8z" fill="#c9cfd6" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.6" fill="#fff6e6" stroke="${INK}" stroke-width="1.6"/></svg>`;
  const WAVES = (s = 34) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z" fill="#fff6e6" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path class="w1" d="M15.5 9.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path class="w2" d="M18 7a7 7 0 0 1 0 10" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path class="w3" d="M20.5 4.6a10.5 10.5 0 0 1 0 14.8" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/></svg>`;
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
#hsc-set .label{flex:1;min-width:0;font:800 16px/1.2 "DM Sans",system-ui,sans-serif}
#hsc-set .hands{display:flex;gap:8px;flex:none}
#hsc-set .hand{min-width:76px;height:48px;border-radius:14px;border:3px solid ${INK};background:#f1e4cc;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0 12px;font:800 15px/1 system-ui,sans-serif;color:${INK}}
#hsc-set .hand[aria-pressed=true]{background:#ffe08a;box-shadow:0 0 0 3px #ffb627}
#hsc-set .slide{flex:0 1 240px;display:flex;align-items:center;gap:8px}
#hsc-set .slide output{min-width:54px;text-align:end;font:800 14px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums}
#hsc-set input[type=range]{flex:1;height:48px;margin:0;background:transparent;-webkit-appearance:none;appearance:none;touch-action:none}
#hsc-set input[type=range]::-webkit-slider-runnable-track{height:12px;border-radius:6px;background:#e9dcc4;border:2.5px solid ${INK}}
#hsc-set input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:40px;height:40px;margin-top:-16px;border-radius:50%;background:#ffb627;border:3px solid ${INK};box-shadow:0 3px 0 ${INK}}
#hsc-set .row.nm{flex-wrap:wrap}
#hsc-set .row.nm .label{flex:1 0 100%}
#hsc-set .row.nm input{flex:1 1 220px;min-width:0;height:48px;box-sizing:border-box;border-radius:14px;border:3px solid ${INK};background:#fff;padding:0 12px;font:900 20px "Arial Rounded MT Bold","Nunito",system-ui,sans-serif;color:${INK};letter-spacing:.5px;unicode-bidi:plaintext}
#hsc-set .row.nm input:focus{outline:none;border-color:#3aa2f2;box-shadow:0 0 0 4px #3aa2f233}
#hsc-set .row.nm .cnt{flex:none;min-width:44px;text-align:end;font:700 14px system-ui,sans-serif;opacity:.55;font-variant-numeric:tabular-nums}
#hsc-set .row.nm.bad input{border-color:#f04436;animation:hsc-shake .3s}
#hsc-set select{min-width:180px;max-width:58%;height:48px;border-radius:14px;border:3px solid ${INK};background:#fff;padding:0 10px;font:800 16px/1 system-ui,sans-serif;color:${INK}}
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
#hsc-pulse{position:fixed;z-index:25;left:50%;bottom:calc(env(safe-area-inset-bottom) + 10px);transform:translateX(-50%);width:56px;height:56px;border-radius:50%;background:#fff6e6;border:3px solid ${INK};display:none;align-items:center;justify-content:center;pointer-events:none;zoom:var(--hsc-s,1)}
#hsc-pulse.on{display:flex}
#hsc-pulse.on .w1{animation:hsc-wave 0.9s ease-in-out infinite}
#hsc-pulse.on .w2{animation:hsc-wave 0.9s ease-in-out .15s infinite}
#hsc-pulse.on .w3{animation:hsc-wave 0.9s ease-in-out .3s infinite}
@keyframes hsc-wave{0%,100%{opacity:.15}50%{opacity:1}}
/* left-handed: the guards and the clipper button on the left, the tool button on the right */
body.hsc-left .ui .guard-arc{right:auto;left:max(12px,env(safe-area-inset-left));transform:scaleX(-1)}
body.hsc-left .ui .guard-arc .rung{scale:-1 1}
body.hsc-left .ui .clip-toggle{right:auto;left:max(12px,env(safe-area-inset-left))}
/* item 33: touch targets of at least 48dp; the guards and the share button (46dp) get a 2dp invisible margin, so
   nothing changes in how they look */
.ui .guard-arc .rung::after,.hsc-native-share::after{content:"";position:absolute;inset:-2px;border-radius:50%}
/* reduce motion */
body.hsc-calm *,body.hsc-calm *::before,body.hsc-calm *::after{animation-duration:.01s!important;animation-iteration-count:1!important;animation-delay:0s!important;transition-duration:.01s!important;transition-delay:0s!important}
body.hsc-calm #hsc-pulse.on path{animation:none!important;opacity:1}
`;

  const ui = {
    el: {}, built: false,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const p = document.createElement('div'); p.id = 'hsc-set';
      p.innerHTML = `<div class="sheet" role="dialog" aria-label="Settings">
        <div class="head"><h2 data-t="settings">Settings</h2><button class="x" type="button" aria-label="Close">${CLOSE}</button></div>
        <div class="row nm" hidden><label class="label" for="hsc-shop-name" data-t="shop_name">Salon name</label><input id="hsc-shop-name" type="text" maxlength="64" enterkeyhint="done" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Salon name"><span class="cnt"></span></div>
        <div class="row"><label class="label" for="hsc-language" data-t="language">Language</label><select id="hsc-language" aria-label="Language"></select></div>
        <div class="row"><span class="label" data-t="hand">Hand</span><div class="hands">
          <button class="hand" type="button" data-left="1" aria-label="Left"><span data-t="left">Left</span></button>
          <button class="hand" type="button" data-left="0" aria-label="Right"><span data-t="right">Right</span></button></div></div>
        <div class="row"><span class="label" data-t="vibration">Vibration</span><button class="sw" type="button" role="switch" data-k="vib" aria-label="Vibration"><span class="k"></span></button></div>
        <div class="row"><span class="label" data-t="reduce_motion">Reduce motion</span><button class="sw" type="button" role="switch" data-k="calm" aria-label="Reduce motion"><span class="k"></span></button></div>
        <div class="row"><span class="label" data-t="sound_cues">Sound cues</span><button class="sw" type="button" role="switch" data-k="pulses" aria-label="Sound cues"><span class="k"></span></button></div>
        <div class="actions"></div>
      </div>`;
      document.body.appendChild(p);
      this.el.panel = p;
      p.querySelector('.x').addEventListener('click', () => this.close());
      p.addEventListener('click', (e) => { if (e.target === p) this.close(); });
      p.querySelectorAll('.hand').forEach((b) => b.addEventListener('click', () => set('left', b.dataset.left === '1')));
      p.querySelectorAll('input[type=range]').forEach((r) => r.addEventListener('input', () => set(r.dataset.k, +r.value)));
      p.querySelectorAll('.sw').forEach((b) => b.addEventListener('click', () => set(b.dataset.k, !get()[b.dataset.k])));
      const language = p.querySelector('#hsc-language');
      for (const [value, name] of HSC.languageOptions || []) { const o = document.createElement('option'); o.value = value; o.textContent = name; language.appendChild(o); }
      language.addEventListener('change', () => { if (HSC.setLang) HSC.setLang(language.value); });
      // the shop's name (salon.js): shown on the TV and when a session opens; at most 16 letters in any script
      const nm = p.querySelector('.row.nm'), inp = nm.querySelector('input'), cnt = nm.querySelector('.cnt');
      let wait = 0;
      const count = () => { const S = HSC.salon; if (!S) return; let v = inp.value; const segs = typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(v)].map((x) => x.segment) : Array.from(v); if (segs.length > S.NAME_MAX) { v = segs.slice(0, S.NAME_MAX).join(''); inp.value = v; } cnt.textContent = Math.min(segs.length, S.NAME_MAX) + '/' + S.NAME_MAX; };
      const commit = () => { const S = HSC.salon; if (!S) return; const want = inp.value.trim(), got = S.setName(want); const def = HSC.t ? HSC.t('shopname') : ''; nm.classList.toggle('bad', !!want && !got && want !== def); if (want && !got && want !== def) { inp.value = S.shown(); count(); } };
      inp.addEventListener('input', () => { nm.classList.remove('bad'); count(); clearTimeout(wait); wait = setTimeout(commit, 700); });
      inp.addEventListener('change', () => { clearTimeout(wait); commit(); });
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { inp.blur(); } });
      inp.addEventListener('keyup', (e) => e.stopPropagation());
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && p.classList.contains('open')) this.close(); });
      const pulse = document.createElement('div'); pulse.id = 'hsc-pulse'; pulse.setAttribute('aria-hidden', 'true'); pulse.innerHTML = WAVES(36);
      document.body.appendChild(pulse);
      this.el.pulse = pulse;
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
      for (const [sel, key] of [['.row.nm input', 'shop_name'], ['#hsc-language', 'language'], ['[data-left="1"]', 'left'], ['[data-left="0"]', 'right'], ['[data-k="vib"]', 'vibration'], ['[data-k="calm"]', 'reduce_motion'], ['[data-k="pulses"]', 'sound_cues']]) {
        const el = p.querySelector(sel); if (el) el.setAttribute('aria-label', HSC.t ? HSC.t(key) : key);
      }
      this.renderActions();
    },
    render() {
      const s = get(), p = this.el.panel;
      p.querySelectorAll('.hand').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.left === '1') === s.left)));
      p.querySelectorAll('input[type=range]').forEach((r) => { if (+r.value !== s[r.dataset.k]) r.value = s[r.dataset.k]; });
      p.querySelectorAll('.sw').forEach((b) => { const on = !!s[b.dataset.k]; b.setAttribute('aria-checked', String(on)); b.querySelector('.k').innerHTML = on ? TICK : CROSS; });
      p.querySelector('#hsc-language').value = HSC.lang ? HSC.lang() : 'en';
      this.labels();
    },
    open() {
      this.render();
      const nm = this.el.panel.querySelector('.row.nm');
      if (HSC.salon) { nm.hidden = false; const inp = nm.querySelector('input'); if (document.activeElement !== inp) inp.value = HSC.salon.shown(); inp.placeholder = HSC.t ? HSC.t('shopname') : 'Barbershop'; nm.querySelector('.cnt').textContent = HSC.salon.graphemes(inp.value) + '/' + HSC.salon.NAME_MAX; }
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
      this.el.pulse.classList.toggle('on', get().pulses && live.n > 0 && audible());
    },
  };
  addEventListener('hsc-language', () => { if (ui.el.panel) { ui.labels(); ui.render(); } });
  const boot = () => { if (globalThis.skinFadeStudio && document.querySelector('#hsc-hud .hsc-row') && HSC.meta && HSC.meta.data) ui.build(); else setTimeout(boot, 300); };
  boot();
  HSC.settings = { get, set, open: () => ui.open(), addAction: (action) => ui.addAction(action), refresh: () => ui.renderActions() };
})(globalThis.HSC || (globalThis.HSC = {}));
