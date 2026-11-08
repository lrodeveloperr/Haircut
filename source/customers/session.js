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
    const day = M().today(); // the game's day (meta.js): a day's gifts come back with the day, so the clock cannot reopen them
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

  // one claim at a time, and the gift is fixed (its day and number) before the video: a second tap during the video
  // cannot claim the same gift again, nor a later one, and midnight during the video does not change which gift it is.
  // The gift counts as taken only once its coins have landed: a failed coin commit leaves it to take again (same key,
  // so it is paid once), and a doubling video already watched for it is remembered, so the retry pays double with no
  // new video
  let claiming = false;
  async function claim(double) {
    if (claiming) return false;
    const g = data(), st = state();
    if (!g || !st.ready || !HSC.coins) return false;
    const day = g.day, i = g.got;
    let n = st.pay;
    claiming = true;
    try {
      if (g.dbl === i) n *= 2;
      else if (double) {
        const ok = HSC.watchVideo ? await HSC.watchVideo('gift-double') : false;
        if (!ok) return false;
        n *= 2;
        g.dbl = i;
        M().save();
      }
      let r;
      try { r = await HSC.coins.add(n, 'gift', 'gift:' + day + ':' + i); } catch (e) { r = null; } // keyed: a repeated claim pays once
      // the economy's result when it reports one; nothing back is the local purse (credited at once) or a queued credit
      if (r !== undefined && !(r && !r.error)) return false;
      g.got = Math.max(g.got, i + 1);
      if (g.dbl != null && g.dbl < g.got) delete g.dbl;
      M().save();
      return n;
    } finally { claiming = false; }
  }

  HSC.gift = { state, claim };
})(globalThis.HSC || (globalThis.HSC = {}));
