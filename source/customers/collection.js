// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner decision 6 November 2026): the Collection.
//
// The customers the barber has really worked with, newest first, and nothing else: a customer appears only once he
// has been cut. There are no placeholders and no totals, because a list of what is still to come would make the game
// look scripted. Each entry keeps the before and after, the stars, the mode and the city; someone who comes back
// moves to the top with his visit count. Every mode counts. The latest 24 are kept, in their own save.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const KEY = 'skin-fade-studio-customers-v1', MAX = 24, W = 64, H = 32;
  const K = '#10223f';
  const M = () => HSC.meta;
  const t = (k) => (HSC.t ? HSC.t(k) : k);
  const I = (n, s) => (HSC.icon ? HSC.icon(n, s) : '');
  const BTOP = () => (HSC.BEARD_MM ? HSC.BEARD_MM.length - 1 : 16);
  const MODE_WORD = { career: 'career', requests: 'orders', free: 'quick_play', fix: 'rescue', beard: 'beards', rush: 'rush' };
  const STAR = (on) => `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc21a' : 'none'}" stroke="${on ? K : '#9fb0c4'}" stroke-width="2.4" stroke-linejoin="round"/></svg>`;

  // ---- a picture's worth of hair, small: each 128x64 grid as 64x32 cells of 3 bits ----
  function encode(grid, top) {
    if (!Array.isArray(grid) || grid.length !== 8192) return null;
    const bits = new Uint8Array(Math.ceil(W * H * 3 / 8));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = 2 * y * 128 + 2 * x, m = (grid[i] + grid[i + 1] + grid[i + 128] + grid[i + 129]) / 4;
      const q = Math.max(0, Math.min(7, Math.round(top > 7 ? m * 7 / top : m)));
      const b = (y * W + x) * 3;
      for (let k = 0; k < 3; k++) if (q & (1 << k)) bits[(b + k) >> 3] |= 1 << ((b + k) & 7);
    }
    let bin = '';
    for (const v of bits) bin += String.fromCharCode(v);
    return btoa(bin);
  }
  function decode(str, top) {
    if (typeof str !== 'string') return null;
    let bin;
    try { bin = atob(str); } catch (e) { return null; }
    if (bin.length !== Math.ceil(W * H * 3 / 8)) return null;
    const out = new Array(8192);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const b = (y * W + x) * 3;
      let q = 0;
      for (let k = 0; k < 3; k++) if (bin.charCodeAt((b + k) >> 3) & (1 << ((b + k) & 7))) q |= 1 << k;
      const v = top > 7 ? Math.round(q * top / 7) : q, i = 2 * y * 128 + 2 * x;
      out[i] = out[i + 1] = out[i + 128] = out[i + 129] = v;
    }
    return out;
  }

  // ---- the list ----
  let list = [], client = null;
  const valid = (c) => !!c && typeof c === 'object' && !!HSC.validPerson && HSC.validPerson(c.p) && Number.isSafeInteger(c.job) && typeof c.bh === 'string' && typeof c.ah === 'string' && Number.isSafeInteger(c.n) && c.n >= 1;
  const save = () => { if (client && client.saveProgress) client.saveProgress(KEY, { v: 1, list }).catch(() => {}); };
  // one finished customer: a retry updates his entry, someone coming back moves to the top with one more visit
  function record(s, city) {
    const p = s.look && s.look.person, d = M() && M().data, last = d && d.lastRound;
    if (!p || !(s.cutStrokeCount > 0) || !last || last.job !== s.jobId) return;
    const old = list.find((c) => c.p.seed === p.seed), again = !!(old && old.job === s.jobId);
    const req = HSC.requestFor ? HSC.requestFor(s) : null, top = BTOP();
    const rec = { job: s.jobId, p, n: old ? old.n + (again ? 0 : 1) : 1, stars: last.free || last.judged ? 0 : last.stars | 0, mode: HSC.modes ? HSC.modes.current() : 'requests',
      city: city || null, style: req && req.style ? req.style.id : null, bh: encode(s.startHair, 5), ah: encode(s.hair, 5), bb: encode(s.startBeard, top), ab: encode(s.beard, top) };
    if (!rec.bh || !rec.ah) return;
    list = [rec].concat(list.filter((c) => c !== old)).slice(0, MAX);
    save();
  }
  const done = HSC.onHaircutDone;
  HSC.onHaircutDone = function (state) {
    // the contract's city, before the career moves on to the next one
    const a = HSC.modes && HSC.modes.current() === 'career' && HSC.careerRun ? HSC.careerRun.active() : null, city = a && a.job === state.jobId ? a.city : null;
    const r = done ? done.apply(this, arguments) : undefined;
    try { record(state, city); } catch (e) { console.error('customers: collection failed', e); }
    return r;
  };

  // ---- the screen ----
  const CSS = `
#hsc-menu .port{grid-template-rows:48px minmax(0,1fr)}
#hsc-menu .port .plist{min-height:0;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));grid-auto-rows:max-content;gap:12px;padding:4px 2px 12px}
#hsc-menu .port .pc{box-sizing:border-box;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:6px;padding:6px;border-radius:20px;border:3px solid ${K};background:linear-gradient(#fff,#e4f3ff);color:${K};font-weight:900}
#hsc-menu .port .pc img{width:100%;aspect-ratio:1;border-radius:14px;background:radial-gradient(circle at 50% 35%,#fff,#e4d2b4)}
#hsc-menu .port .pc .to .hsc-ic{width:18px;height:18px}
#hsc-menu .port .pc .facts{grid-column:1/-1;display:flex;align-items:center;gap:5px;font-size:13px;min-width:0;min-height:26px}
#hsc-menu .port .pc .facts .hsc-ic{width:26px;height:26px}
#hsc-menu .port .pc .st{display:flex;font-size:18px}
#hsc-menu .port .pc .at{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#hsc-menu .port .pc .n{margin-inline-start:auto;display:flex;align-items:center;gap:3px}
#hsc-menu .port .none{grid-column:1/-1;align-self:center;margin:18vh auto 0;padding:18px 24px;border-radius:22px;border:3px solid ${K};background:linear-gradient(#fff,#e4f3ff);color:${K};font-weight:900;font-size:20px;text-align:center}
`;
  const ui = {
    built: false,
    build() {
      const m = document.getElementById('hsc-menu');
      if (this.built || !m) return !!this.built;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const pg = document.createElement('div');
      pg.className = 'page port'; pg.hidden = true; pg.setAttribute('role', 'dialog');
      pg.innerHTML = `<div class="mhead"><button class="j c-white back" type="button" aria-label="Back">${I('back')}</button><div class="title">${I('styles')}<span class="hsc-lbl" data-k="collection"></span></div></div><div class="plist"></div>`;
      m.appendChild(pg);
      pg.querySelector('.back').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('back'); HSC.menu.view('home', true); });
      return true;
    },
    render() {
      if (!this.build()) return;
      const pg = document.querySelector('#hsc-menu .page.port'), box = pg.querySelector('.plist');
      pg.setAttribute('aria-label', t('collection'));
      if (!list.length) { box.innerHTML = `<div class="none">${t('no_customers')}</div>`; return; }
      box.innerHTML = list.map((c, i) => `<div class="pc" data-i="${i}"><img alt="" data-s="b"><span class="to">${I('play')}</span><img alt="" data-s="a">
        <div class="facts">${c.stars ? `<span class="st">${[1, 2, 3].map((x) => STAR(x <= c.stars)).join('')}</span>` : ''}<span class="at"><bdi>${c.city && HSC.cityName ? HSC.cityName(c.city) : t(MODE_WORD[c.mode] || 'orders')}</bdi></span>${c.n > 1 ? `<span class="n">${I('regulars')}${HSC.num ? HSC.num(c.n) : c.n}</span>` : ''}</div></div>`).join('');
      const job = ++this.job, todo = [...box.querySelectorAll('img')];
      // pictures render a few per frame so the page opens at once
      const step = () => {
        if (job !== this.job) return;
        const t0 = performance.now();
        while (todo.length && performance.now() - t0 < 24) {
          const img = todo.shift(), c = list[+img.closest('.pc').dataset.i], b = img.dataset.s === 'b';
          try { const u = HSC.portrait(c.p, decode(b ? c.bh : c.ah, 5), decode(b ? c.bb : c.ab, BTOP()), 120, 160); if (u) img.src = u; } catch (e) { console.error('customers: collection picture failed', e); }
        }
        if (todo.length) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    job: 0,
  };
  async function boot() {
    if (!M() || !M().client || !HSC.validPerson) { setTimeout(boot, 300); return; }
    client = M().client;
    const d = client.loadProgress ? await client.loadProgress(KEY, null).catch(() => null) : null;
    list = d && Array.isArray(d.list) ? d.list.filter(valid).slice(0, MAX) : [];
  }
  boot();
  HSC.collection = { open: () => { ui.build(); HSC.menu.view('port'); ui.render(); }, list: () => list, encode, decode };
})(globalThis.HSC || (globalThis.HSC = {}));
