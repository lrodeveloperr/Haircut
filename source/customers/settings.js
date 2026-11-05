// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved item 32, 5 November 2026): a settings panel in the menu,
// icons only. Every setting is the player's choice; the defaults keep the game exactly as it was.
//
//   hand         left-handed layout: the guards and the clipper button move to the left, the tool button to the
//                right (mirrored with CSS; the 3D clipper and its placement under the finger are unchanged)
//   size         the blade's cutting width, 80%..125% (default 100%)
//   strength     how much one pass takes off: one level, two levels, or all the way to the guard (default)
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
  const SIZES = [0.8, 0.9, 1, 1.12, 1.25];
  const get = () => Object.assign({}, DEF, (M() && M().data && M().data.settings) || {});
  function set(k, v) {
    const d = M() && M().data;
    if (!d) return;
    d.settings = Object.assign(get(), { [k]: v });
    M().save();
    apply();
  }

  // ---- what each setting does ----
  // blade width (patch19 asks HSC.bladeWidth for every tool)
  const bw = HSC.bladeWidth;
  if (bw) HSC.bladeWidth = () => bw() * SIZES[get().size];
  // strength: a cell drops at most 1 or 2 levels per stroke below where it was when the stroke reached it
  const tl = HSC.toolLevel, seen = new Map();
  addEventListener('pointerdown', () => seen.clear(), true);
  if (tl) HSC.toolLevel = (u, g, c) => {
    const r = tl(u, g, c), sens = get().sens;
    if (sens >= 2 || c == null || !(r < u)) return r;
    if (!seen.has(c)) seen.set(c, u);
    return Math.max(r, seen.get(c) - (sens + 1));
  };
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
  const HAND = (flip) => `<svg viewBox="0 0 24 24" width="40" height="40"${flip ? ' style="transform:scaleX(-1)"' : ''}><path d="M8.6 12V4.6a1.5 1.5 0 0 1 3 0V11V3.6a1.5 1.5 0 0 1 3 0V11V5a1.5 1.5 0 0 1 3 0v6.5V8a1.5 1.5 0 0 1 3 0v7.3c0 4-2.7 6.7-6.6 6.7h-1.2c-2.3 0-3.9-.9-5.2-2.7l-3.4-4.8a1.6 1.6 0 0 1 2.5-2z" fill="#e9c9a8" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const CLIPPER = (s) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><rect x="7" y="7" width="10" height="15" rx="3" fill="#ffb627" stroke="${INK}" stroke-width="1.8"/><path d="M6.5 7.5V4h11v3.5" fill="#c9cfd6" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 4V2.5M10 4V2.5M12 4V2.5M14 4V2.5M16 4V2.5" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  // strength: one strand falls, or many
  const FALL = (n) => `<svg viewBox="0 0 24 24" width="30" height="30">${[[12, 0], [7, 1], [17, 1], [9.5, 2], [14.5, 2]].slice(0, n).map(([x, k]) => `<path d="M${x} ${3 + k * 2}c1.4 3 -1.4 6 0 9s-1.4 6 0 8" fill="none" stroke="#5a3b1f" stroke-width="2" stroke-linecap="round"/>`).join('')}</svg>`;
  const PHONE = `<svg viewBox="0 0 24 24" width="34" height="34"><rect x="7.5" y="3" width="9" height="18" rx="2.2" fill="#fff" stroke="${INK}" stroke-width="1.8"/><path d="M4 8.5l-1.5 1.7L4 12l-1.5 1.8L4 15.5M20 8.5l1.5 1.7L20 12l1.5 1.8L20 15.5" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CALM = `<svg viewBox="0 0 24 24" width="34" height="34"><path d="M20 12a8 8 0 1 1-2.3-5.7" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M18.4 2.8v3.8h-3.8" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="9" y="9" width="2.3" height="6" rx=".8" fill="${INK}"/><rect x="12.7" y="9" width="2.3" height="6" rx=".8" fill="${INK}"/></svg>`;
  const WAVES = (s = 34) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z" fill="#fff6e6" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path class="w1" d="M15.5 9.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path class="w2" d="M18 7a7 7 0 0 1 0 10" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path class="w3" d="M20.5 4.6a10.5 10.5 0 0 1 0 14.8" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/></svg>`;
  // on and off differ in shape, not only colour: a tick or a cross in the knob, which also moves
  const TICK = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#10223f" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CROSS = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="#10223f" stroke-width="3.2" stroke-linecap="round"/></svg>';

  const CSS = `
#hsc-set-btn svg{width:40px;height:40px}
#hsc-set{position:fixed;inset:0;z-index:30;display:none;background:#0d3f86b8;font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};touch-action:manipulation;zoom:var(--hsc-s,1)}
#hsc-set.open{display:flex;align-items:flex-end;justify-content:center}
#hsc-set .sheet{position:relative;width:min(100%,520px);max-height:92%;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:#fff6e6;border:3px solid ${INK};border-bottom:0;border-radius:26px 26px 0 0;box-shadow:0 -4px 0 ${INK};padding:14px max(14px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}
@media (orientation:landscape){#hsc-set.open{align-items:center}#hsc-set .sheet{border-radius:26px;border-bottom:3px solid ${INK};box-shadow:0 5px 0 ${INK}}}
#hsc-set .head{display:flex;align-items:center;justify-content:space-between}
#hsc-set .x{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer;color:${INK};padding:0}
#hsc-set .row{display:flex;align-items:center;gap:10px;min-height:60px;padding:6px 10px;border-radius:18px;border:3px solid ${INK};background:#fff}
#hsc-set .row .ic{flex:none;display:flex;width:40px;justify-content:center}
#hsc-set .row .sp{flex:1}
#hsc-set .hands{display:flex;gap:10px;flex:1;justify-content:center}
#hsc-set .hand{position:relative;width:64px;height:56px;border-radius:16px;border:3px solid ${INK};background:#f1e4cc;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
#hsc-set .hand[aria-pressed=true]{background:#ffe08a;box-shadow:0 0 0 3px #ffb627}
#hsc-set .hand .ok{position:absolute;right:-9px;top:-9px;width:26px;height:26px;border-radius:50%;background:#fff;border:2.5px solid ${INK};display:none;align-items:center;justify-content:center}
#hsc-set .hand[aria-pressed=true] .ok{display:flex}
#hsc-set .slide{flex:1;display:flex;align-items:center;gap:6px}
#hsc-set input[type=range]{flex:1;height:48px;margin:0;background:transparent;-webkit-appearance:none;appearance:none;touch-action:none}
#hsc-set input[type=range]::-webkit-slider-runnable-track{height:12px;border-radius:6px;background:#e9dcc4;border:2.5px solid ${INK}}
#hsc-set input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:40px;height:40px;margin-top:-16px;border-radius:50%;background:#ffb627;border:3px solid ${INK};box-shadow:0 3px 0 ${INK}}
#hsc-set .sw{position:relative;width:88px;height:48px;border-radius:24px;border:3px solid ${INK};background:#e9dcc4;cursor:pointer;padding:0;flex:none}
#hsc-set .sw .k{position:absolute;top:3px;left:3px;width:36px;height:36px;border-radius:50%;background:#fff;border:2.5px solid ${INK};display:flex;align-items:center;justify-content:center;transition:left .15s}
#hsc-set .sw[aria-checked=true]{background:#8fd18f}
#hsc-set .sw[aria-checked=true] .k{left:41px}
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
body.hsc-left #hsc-tools{left:auto;right:max(14px,env(safe-area-inset-right))}
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
        <div class="head"><span class="ic">${GEAR}</span><button class="x" type="button" aria-label="Close">${CLOSE}</button></div>
        <div class="row"><div class="hands">
          <button class="hand" type="button" data-left="1" aria-label="Left-handed">${HAND(true)}<span class="ok">${TICK}</span></button>
          <button class="hand" type="button" data-left="0" aria-label="Right-handed">${HAND(false)}<span class="ok">${TICK}</span></button></div></div>
        <div class="row"><span class="ic">${CLIPPER(24)}</span><div class="slide"><input type="range" min="0" max="4" step="1" data-k="size" aria-label="Clipper size"><span class="ic">${CLIPPER(38)}</span></div></div>
        <div class="row"><span class="ic">${FALL(1)}</span><div class="slide"><input type="range" min="0" max="2" step="1" data-k="sens" aria-label="Cutting strength"><span class="ic">${FALL(5)}</span></div></div>
        <div class="row"><span class="ic">${PHONE}</span><span class="sp"></span><button class="sw" type="button" role="switch" data-k="vib" aria-label="Vibration"><span class="k"></span></button></div>
        <div class="row"><span class="ic">${CALM}</span><span class="sp"></span><button class="sw" type="button" role="switch" data-k="calm" aria-label="Reduce motion"><span class="k"></span></button></div>
        <div class="row"><span class="ic">${WAVES()}</span><span class="sp"></span><button class="sw" type="button" role="switch" data-k="pulses" aria-label="Show sounds on screen"><span class="k"></span></button></div>
      </div>`;
      document.body.appendChild(p);
      this.el.panel = p;
      p.querySelector('.x').addEventListener('click', () => this.close());
      p.addEventListener('click', (e) => { if (e.target === p) this.close(); });
      p.querySelectorAll('.hand').forEach((b) => b.addEventListener('click', () => set('left', b.dataset.left === '1')));
      p.querySelectorAll('input[type=range]').forEach((r) => r.addEventListener('input', () => set(r.dataset.k, +r.value)));
      p.querySelectorAll('.sw').forEach((b) => b.addEventListener('click', () => set(b.dataset.k, !get()[b.dataset.k])));
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && p.classList.contains('open')) { e.preventDefault(); this.close(); } });
      const pulse = document.createElement('div'); pulse.id = 'hsc-pulse'; pulse.setAttribute('aria-hidden', 'true'); pulse.innerHTML = WAVES(36);
      document.body.appendChild(pulse);
      this.el.pulse = pulse;
      setInterval(() => this.tick(), 120);
      apply();
    },
    render() {
      const s = get(), p = this.el.panel;
      p.querySelectorAll('.hand').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.left === '1') === s.left)));
      p.querySelectorAll('input[type=range]').forEach((r) => { if (+r.value !== s[r.dataset.k]) r.value = s[r.dataset.k]; });
      p.querySelectorAll('.sw').forEach((b) => { const on = !!s[b.dataset.k]; b.setAttribute('aria-checked', String(on)); b.querySelector('.k').innerHTML = on ? TICK : CROSS; });
    },
    open() { this.render(); this.el.panel.classList.add('open'); },
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
  const boot = () => { if (globalThis.skinFadeStudio && document.querySelector('#hsc-hud .hsc-row') && HSC.meta && HSC.meta.data) ui.build(); else setTimeout(boot, 300); };
  boot();
  HSC.settings = { get, set, open: () => ui.open() };
})(globalThis.HSC || (globalThis.HSC = {}));
