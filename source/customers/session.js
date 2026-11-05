// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved item T3, 5 November 2026): the play-time gift.
// Gifts open after 10, 20 and 30 minutes of play in a day: 50, 100 and 200 coins, and a video doubles one.
// Only real play counts: the app in front, a customer in the chair, and a touch within the last minute, so leaving
// the phone untouched earns nothing (AdMob treats unattended screens as invalid traffic).
// The home screen's Gift block (menu.js) shows the time left or a red dot; the gift itself opens here.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#10223f';
  const AT = [600, 1200, 1800], PAY = [50, 100, 200];
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
    g.got++;
    if (HSC.coins) HSC.coins.add(n);
    M().save();
    return n;
  }

  // ---- the gift opening ----
  const CSS = `
#hsc-gift{position:fixed;inset:0;z-index:32;display:none;align-items:center;justify-content:center;background:#0d3f86b8;zoom:var(--hsc-s,1);font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK}}
#hsc-gift.open{display:flex}
#hsc-gift{font-family:"Arial Rounded MT Bold","Nunito",system-ui,sans-serif;color:#10223f;background:#0d3f86b8}
#hsc-gift .card{position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:22px 26px;border-radius:30px;background:linear-gradient(#fff,#dff3ff);border:4px solid #10223f;box-shadow:inset 0 -8px 0 #0001,0 10px 0 #10223f,0 16px 24px #0006;animation:hsc-giftin .5s cubic-bezier(.2,1.6,.4,1)}
#hsc-gift .rays{position:absolute;left:50%;top:38%;width:340px;height:340px;margin:-170px 0 0 -170px;background:repeating-conic-gradient(#ffe68266 0 10deg,#0000 10deg 20deg);border-radius:50%;animation:hsc-rays 8s linear infinite;z-index:-1;-webkit-mask:radial-gradient(#000 30%,#0000 70%);mask:radial-gradient(#000 30%,#0000 70%)}
@keyframes hsc-rays{to{transform:rotate(360deg)}}
.hsc-confetti{position:fixed;z-index:33;width:10px;height:16px;border-radius:2px;pointer-events:none;animation:hsc-fall 1.6s cubic-bezier(.2,.6,.4,1) forwards}
@keyframes hsc-fall{to{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
@keyframes hsc-giftin{from{transform:scale(.6);opacity:0}}
#hsc-gift .box{width:120px;height:120px;animation:hsc-giftw 1s ease-in-out infinite}
#hsc-gift .box .hsc-ic{width:100%;height:100%;filter:drop-shadow(0 6px 0 #10223f33)}
@keyframes hsc-giftw{25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}
#hsc-gift .amt{display:flex;align-items:center;gap:6px;font-weight:900;font-size:34px;font-variant-numeric:tabular-nums}
#hsc-gift .row{display:flex;gap:12px}
#hsc-gift button{position:relative;min-width:104px;height:62px;border-radius:22px;border:3px solid #10223f;box-shadow:inset 0 -6px 0 #0003,inset 0 3px 0 #fff6,0 6px 0 #10223f,0 9px 12px #0005;transition:transform .3s cubic-bezier(.3,1.8,.5,1);display:flex;align-items:center;justify-content:center;gap:4px;font:900 24px "DM Sans",system-ui,sans-serif;color:${INK};cursor:pointer;padding:0 14px}
#hsc-gift button:active{transform:translateY(5px) scale(1.03,.95);box-shadow:inset 0 -4px 0 #0003,0 1px 0 #10223f;transition:transform .06s}
#hsc-gift .take{background:linear-gradient(#9cf06c,#36b83a);color:#fff}
#hsc-gift .dbl{background:linear-gradient(#ffe682,#ffb21a);color:#10223f}
#hsc-gift .dbl:disabled{opacity:.5}
#hsc-gift .dbl .hsc-ad{position:absolute;right:-8px;bottom:-6px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:2.5px solid ${INK}}
@media (prefers-reduced-motion:reduce){#hsc-gift .card,#hsc-gift .box{animation:none}}
body.hsc-calm #hsc-gift .box{animation:none}
`;
  const COIN = HSC.icon ? HSC.icon('coin', 36) : `<svg viewBox="0 0 24 24" width="36" height="36"><circle cx="12" cy="12" r="9.5" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a12" stroke-width="1.8"/></svg>`; // the theme's one coin (icons.js)
  const TICK = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ui = {
    el: null,
    build() {
      if (this.el) return;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const el = document.createElement('div'); el.id = 'hsc-gift';
      el.innerHTML = `<div class="card" role="dialog" aria-label="Gift"><span class="rays"></span><div class="box">${HSC.icon ? HSC.icon('gift') : '🎁'}</div><div class="amt">${HSC.icon ? HSC.icon('coin', 40) : COIN}<span></span></div>
        <div class="row"><button class="take" type="button" aria-label="Take">${TICK}</button><button class="dbl" type="button" aria-label="Watch a video to double it">×2<span class="hsc-ad">${HSC.AD_ICON ? HSC.AD_ICON(18) : ''}</span></button></div></div>`;
      document.body.appendChild(el);
      el.addEventListener('click', (e) => { if (e.target === el) this.close(); });
      el.querySelector('.take').addEventListener('click', () => this.take(false));
      el.querySelector('.dbl').addEventListener('click', () => this.take(true));
      this.el = el;
    },
    open() {
      this.build();
      const st = state();
      if (!st.ready) return false;
      this.el.querySelector('.amt span').textContent = '+' + st.pay;
      this.el.querySelector('.dbl').disabled = !(HSC.canVideo && HSC.canVideo());
      this.el.classList.add('open');
      if (HSC.fx) HSC.fx.play('reward');
      this.confetti();
      return true;
    },
    close() { if (this.el) this.el.classList.remove('open'); },
    confetti() {
      if (document.body.classList.contains('hsc-calm') || (globalThis.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
      const cols = ['#ffd23f', '#ff5c98', '#3aa2f2', '#36b83a', '#ff7d2e', '#fff'], x = innerWidth / 2, y = innerHeight * 0.42;
      for (let i = 0; i < 60; i++) {
        const c = document.createElement('i'); c.className = 'hsc-confetti';
        Object.assign(c.style, { left: x + 'px', top: y + 'px', background: cols[i % cols.length] });
        c.style.setProperty('--dx', (Math.random() * 2 - 1) * innerWidth * 0.6 + 'px');
        c.style.setProperty('--dy', (Math.random() * 1.3 - 0.3) * innerHeight * 0.6 + 'px');
        c.style.setProperty('--r', Math.random() * 900 + 'deg');
        document.body.appendChild(c); setTimeout(() => c.remove(), 1700);
      }
    },
    async take(double) {
      const btn = this.el.querySelector(double ? '.dbl' : '.take');
      btn.disabled = true;
      const n = await claim(double);
      btn.disabled = false;
      if (n === false && double) { if (HSC.nope) HSC.nope(btn); return; }
      if (HSC.fx) HSC.fx.play('coin');
      this.close();
    },
  };
  HSC.gift = { state, open: () => ui.open(), claim };
})(globalThis.HSC || (globalThis.HSC = {}));
