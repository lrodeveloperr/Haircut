// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner request 5 November 2026): the feel of the menus.
//   sound   soft ASMR taps, synthesised (no audio files): a short wooden "tok" when a button goes down, a lighter
//           click when it comes up, a swish between screens, a sparkle and coin clinks for rewards. They follow the
//           game's own mute and volume.
//   touch   a small haptic tick on press (the settings' vibration switch applies, settings.js)
//   ripple  a liquid ring spreading from the finger on every menu button
// Any element inside the menus marked as a button gets all three; nothing in the cutting screen is touched.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const view = () => { try { return globalThis.skinFadeStudio.getView(); } catch (e) { return null; } };
  const S = { ctx: null, out: null, noise: null };
  function ac() {
    const v = view();
    if (!v || !v.audio) return null;
    if (!S.ctx) {
      const C = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!C) return null;
      S.ctx = new C();
      S.out = S.ctx.createGain();
      S.out.connect(S.ctx.destination);
      // a second of soft noise, reused for swishes and paper-like clicks
      const n = S.ctx.createBuffer(1, S.ctx.sampleRate, S.ctx.sampleRate), d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      S.noise = n;
    }
    if (S.ctx.state === 'suspended') S.ctx.resume().catch(() => {});
    S.out.gain.value = 0.5 * (typeof v.volume === 'number' ? v.volume : 1);
    return S.ctx;
  }
  // a damped sine "tok": wood block on press, a higher, quieter tick on release
  function tok(f, len, vol) {
    const c = ac();
    if (!c) return;
    const t = c.currentTime, o = c.createOscillator(), g = c.createGain(), bp = c.createBiquadFilter();
    o.type = 'sine';
    o.frequency.setValueAtTime(f * 1.6, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.012);
    bp.type = 'bandpass'; bp.frequency.value = f * 1.2; bp.Q.value = 1.4;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(bp).connect(g).connect(S.out);
    o.start(t); o.stop(t + len + 0.02);
  }
  // filtered noise: a swish (falling band) or a soft brush
  function swish(from, to, len, vol) {
    const c = ac();
    if (!c) return;
    const t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = S.noise;
    f.type = 'bandpass'; f.Q.value = 0.9;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + len);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + len * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    s.connect(f).connect(g).connect(S.out);
    s.start(t, Math.random() * 0.5, len + 0.05);
  }
  function chime(notes, gap, vol) {
    const c = ac();
    if (!c) return;
    notes.forEach((f, i) => {
      const t = c.currentTime + i * gap, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2.01;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(g); o2.connect(g); g.connect(S.out);
      o.start(t); o2.start(t); o.stop(t + 0.65); o2.stop(t + 0.65);
    });
  }
  const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  const SND = {
    down: () => { tok(420 + Math.random() * 40, 0.09, 0.32); buzz(8); },
    up: () => tok(980 + Math.random() * 60, 0.05, 0.12),
    swish: () => swish(2600, 700, 0.22, 0.16),
    back: () => swish(700, 2200, 0.2, 0.14),
    open: () => { swish(1800, 900, 0.18, 0.12); tok(620, 0.08, 0.18); },
    nope: () => { tok(240, 0.08, 0.3); setTimeout(() => tok(200, 0.09, 0.26), 90); buzz([10, 40, 10]); },
    reward: () => chime([1046.5, 1318.5, 1568, 2093], 0.07, 0.16),
    coin: () => { chime([2637, 3136], 0.05, 0.1); },
  };
  HSC.fx = { play: (k) => { try { SND[k] && SND[k](); } catch (e) {} } };

  // ---- every button in the menus: sound, haptic tick and a ripple ----
  const MENUS = '#hsc-menu,#hsc-gift,#hsc-goals,#hsc-salon,#hsc-panel,.hsc-coll-panel,#hsc-set,#hsc-score';
  const PRESSABLE = 'button,[role=button],.hsc-btn';
  const st = document.createElement('style');
  st.textContent = `
.hsc-rip{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none;z-index:3}
.hsc-ripple{position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#ffffffb0 0,#ffffff60 45%,#ffffff00 70%);transform:scale(0);animation:hsc-ripple .55s cubic-bezier(.2,.7,.3,1) forwards;z-index:3;mix-blend-mode:soft-light}
@keyframes hsc-ripple{to{transform:scale(1);opacity:0}}
@media (prefers-reduced-motion:reduce){.hsc-ripple{display:none}}
body.hsc-calm .hsc-ripple{display:none}`;
  (document.head || document.documentElement).appendChild(st);
  let pressed = null;
  addEventListener('pointerdown', (e) => {
    const b = e.target.closest && e.target.closest(PRESSABLE);
    if (!b || !b.closest(MENUS) || b.disabled) return;
    pressed = b;
    SND.down();
    // the ripple, from the finger, sized to cover the button
    const r = b.getBoundingClientRect(), z = parseFloat(getComputedStyle(b).zoom) || 1;
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
    // the ring is clipped to the button's own rounded shape (a wrapper), so nothing outside it is cut off
    const S2 = (HSC.S || 1) * z, size = Math.hypot(r.width, r.height) * 2 / S2;
    const w = document.createElement('span'); w.className = 'hsc-rip';
    const k = document.createElement('span'); k.className = 'hsc-ripple';
    Object.assign(k.style, { width: size + 'px', height: size + 'px', left: (e.clientX - r.left) / S2 - size / 2 + 'px', top: (e.clientY - r.top) / S2 - size / 2 + 'px' });
    w.appendChild(k); b.appendChild(w);
    setTimeout(() => w.remove(), 600);
  }, true);
  addEventListener('pointerup', () => { if (pressed) { SND.up(); pressed = null; } }, true);
  addEventListener('pointercancel', () => { pressed = null; }, true);
  // a refused tap (HSC.nope) sounds like one
  const nope = HSC.nope;
  const wrapNope = () => { if (HSC.nope && !HSC.nope.__fx) { const n = HSC.nope; HSC.nope = (el) => { SND.nope(); return n(el); }; HSC.nope.__fx = true; } };
  if (nope) wrapNope(); else setTimeout(wrapNope, 1500);
})(globalThis.HSC || (globalThis.HSC = {}));
