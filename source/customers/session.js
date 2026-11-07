// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved item T3, 5 November 2026): the play-time gift.
// Gifts open after 10, 20 and 30 minutes of play in a day: 20, 40 and 60 coins (owner decision 6 November 2026; was
// 25 / 50 / 75), and a video doubles a gift.
// Only real play counts: the app in front, a customer in the chair, and a touch within the last minute, so leaving
// the phone untouched earns nothing (AdMob treats unattended screens as invalid traffic).
// The Shop's Free tab (shop.js) shows the time left, or the gift to take.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const AT = HSC.economy.CONFIG.gift.at, PAY = HSC.economy.CONFIG.gift.pay;
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio;
  let lastTouch = 0, dirty = 0;
  addEventListener('pointerdown', () => { lastTouch = Date.now(); }, true);
  function data() {
    const d = M() && M().data;
    if (!d) return null;
    const day = M().today();
    if (!d.gift || d.gift.day !== day) d.gift = { day, sec: 0, got: 0 };
    return d.gift;
  }
  function state() {
    const g = data();
    if (!g) return { ready: false, done: false, left: 0, pay: 0, frac: 0 };
    const done = g.got >= AT.length, from = g.got ? AT[g.got - 1] : 0, to = done ? 0 : AT[g.got];
    return { done, ready: !done && g.sec >= to, left: done ? 0 : Math.max(0, Math.ceil(to - g.sec)), pay: done ? 0 : PAY[g.got], frac: done ? 1 : Math.min(1, (g.sec - from) / (to - from)) };
  }
  // one second of play
  setInterval(() => {
    const g = data(), game = G();
    if (!g || !game || document.visibilityState !== 'visible' || Date.now() - lastTouch > 60000) return;
    const s = game.getState();
    if (s.status !== 'cutting' && s.status !== 'reveal') return;
    if (document.querySelector('#hsc-menu.open')) return;
    g.sec = Math.min(86400, g.sec + 1);
    if (++dirty >= 15) { dirty = 0; M().save(); }
  }, 1000);

  async function claim(double) {
    const g = data(), st = state();
    if (!g || !st.ready) return false;
    let n = st.pay;
    if (double) {
      const ok = HSC.watchVideo ? await HSC.watchVideo('gift-double') : false;
      if (!ok) return false;
      n *= 2;
    }
    if (HSC.coins) HSC.coins.add(n, 'gift', 'gift:' + g.day + ':' + g.got); // keyed: a repeated claim pays once
    g.got++;
    M().save();
    return n;
  }

  HSC.gift = { state, claim };
})(globalThis.HSC || (globalThis.HSC = {}));
