// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved mockups, 6 November 2026): the Shop, one screen with a slider
// of five tabs and no pop-ups.
//
//   Free      the play-time Gift, the wishlist video and the three daily tasks
//   Coins     what real money buys: the Starter Pack, the coin packs and the Supporter Bundle. Each button only says Buy:
//             prices differ by country, so the player first sees the price on Google Play's own purchase sheet
//             (owner, 6 November 2026). HSC.billing is wired at packaging; until then nothing can be charged
//   Shops     whole shop looks and the salon name (salon.js shows these over its own 3D picture)
//   Parts     the shop's parts (salon.js)
//   Clippers  every design with its coin price; the one in focus leads the page. Today's pick can also be had for
//   Gowns     one video, which goes through the wardrobe's own earned-reward callback
// Coins buy everything here: nothing is given away. Short of coins, Buy leads to the Coins tab: if one video closes the gap
// it leads the tab and then returns to the item; otherwise the smallest offer that covers the gap is marked.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const K = '#10223f', STEP = 24;
  const t = (k) => (HSC.t ? HSC.t(k) : k);
  const I = (n, s) => (HSC.icon ? HSC.icon(n, s) : '');
  const fmt = (n) => (HSC.num ? HSC.num(n) : n);
  const A = () => HSC.wardrobeApi, C = () => HSC.catalog, W = () => HSC.wardrobeShop;
  // the 3D product shot; the flat drawing only if 3D is unavailable on this device
  const art = (d, size) => { try { if (HSC.shop3d && HSC.shop3d.item) return HSC.shop3d.item(d, size); } catch (e) { console.warn('shop: 3D item unavailable', e); } return A().picture(d, size); };
  const TABS = [['free', 'free'], ['coins', 'coins'], ['shops', 'shops'], ['parts', 'parts'], ['clipper', 'clippers'], ['gown', 'gowns']];
  const HEART = (on) => `<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 20.5S3 15 3 8.8A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 9 2.2C21 15 12 20.5 12 20.5z" fill="${on ? '#ff5c98' : 'none'}" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
  const TICK = `<svg viewBox="0 0 24 24" width="26" height="26"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="${K}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CSS = `
.hsc-stabs{display:flex;gap:5px;flex:none}
.hsc-stabs button{position:relative;flex:1 1 auto;min-width:0;height:44px;padding:0 1px;border-radius:14px;border:3px solid ${K};background:#fff;color:${K};font:900 12.5px "Arial Rounded MT Bold","Nunito",system-ui,sans-serif;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hsc-stabs button.on{background:linear-gradient(#ffe682,#ffb21a)}
.hsc-stabs .dot{position:absolute;right:3px;top:3px;width:11px;height:11px;border-radius:50%;background:#f04436}
#hsc-menu .shop{grid-template-rows:48px auto minmax(0,1fr)}
#hsc-menu .sbody{min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:2px 2px 12px}
#hsc-menu .sbody[hidden]{display:none}
#hsc-menu .hc{box-sizing:border-box;border:3px solid ${K};border-radius:22px;padding:12px;box-shadow:0 5px 0 ${K};color:${K};font-weight:900;flex:none}
#hsc-menu .hc.gift{display:grid;grid-template-columns:auto 1fr;gap:8px 12px;align-items:center;background:linear-gradient(#ffd6e6,#ff8db8)}
#hsc-menu .hc.gift.done{opacity:.6}
#hsc-menu .hc.gift .hsc-ic{width:72px;height:72px}
#hsc-menu .hc.gift .tm{font-size:26px;font-variant-numeric:tabular-nums}
#hsc-menu .btns{grid-column:1/-1;display:flex;gap:10px}
#hsc-menu .sb{position:relative;flex:1;min-width:0;height:50px;border-radius:16px;border:3px solid ${K};display:flex;align-items:center;justify-content:center;gap:6px;font:900 19px "Arial Rounded MT Bold","Nunito",system-ui,sans-serif;color:${K};box-shadow:0 4px 0 ${K};cursor:pointer;background:linear-gradient(#fff,#dfe8f2);font-variant-numeric:tabular-nums}
#hsc-menu .sb:active{transform:translateY(3px);box-shadow:0 1px 0 ${K}}
#hsc-menu .sb:disabled{opacity:.5;cursor:default}
#hsc-menu .sb.gold{background:linear-gradient(#ffe682,#ffb21a)}
#hsc-menu .sb.vid{background:linear-gradient(#a8e4ff,#3aa2f2)}
#hsc-menu .sb .hsc-ic{width:26px;height:26px}
#hsc-menu .sb.wish{flex:none;width:56px}
#hsc-menu .vr{flex:none;width:100%;height:60px;justify-content:space-between;padding:0 14px}
#hsc-menu .vr em{font-style:normal;font-size:15px}
#hsc-menu .hh{margin:4px 0 0;color:#fff;font-size:17px;font-weight:900}
#hsc-menu .tk{flex:none;display:grid;grid-template-columns:minmax(0,1fr) minmax(84px,28%) 84px;align-items:center;gap:12px;height:60px;box-sizing:border-box;padding:0 8px 0 14px;border-radius:16px;border:3px solid ${K};background:#fff;color:${K};font-weight:900;font-size:15px}
#hsc-menu .tk .pgb{display:block;height:12px;border-radius:6px;background:#dbe5ef;overflow:hidden}
#hsc-menu .tk .pgb i{display:block;height:100%;background:linear-gradient(#b5ff7a,#46c43a)}
#hsc-menu .tk .sb{width:84px;height:42px;font-size:16px;border-width:2px;box-shadow:none}
#hsc-menu .tk > span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.2}
#hsc-menu .tk .sb .hsc-ic{width:22px;height:22px}
#hsc-menu .cg2{flex:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
#hsc-menu .cp{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 10px;border-radius:18px;border:3px solid ${K};background:#fff;color:${K};font-weight:900;font-size:22px;font-variant-numeric:tabular-nums;box-shadow:0 4px 0 ${K}}
#hsc-menu .cp .pile{display:flex;align-items:center;justify-content:center;width:100%;height:104px;background:radial-gradient(closest-side,#ffe9a066,#ffe9a000)}
#hsc-menu .cp .pile>span{position:relative;display:block}
#hsc-menu .cp .pile .hsc-ic{position:absolute;filter:drop-shadow(0 2px 1px #7a4a0066)}
#hsc-menu .cp .sb{width:100%;height:48px}
#hsc-menu .cp.hot{box-shadow:0 0 0 4px #5cff7a,0 4px 0 ${K};animation:hsc-hot 1.1s ease-in-out infinite}
@keyframes hsc-hot{50%{box-shadow:0 0 0 7px #5cff7a,0 4px 0 ${K}}}
@media (prefers-reduced-motion:reduce){#hsc-menu .cp.hot{animation:none}}
#hsc-menu .cp.big{flex:none;flex-direction:row;justify-content:space-between;gap:12px;padding:10px 12px;font-size:20px;background:linear-gradient(#fff6d8,#ffe08a)}
#hsc-menu .cp.big .sb{flex:none;width:88px}
#hsc-menu .cp.big .inc{flex:1;display:flex;align-items:center;gap:6px;min-width:0}
#hsc-menu .cp.big .inc img{width:42px;height:42px;object-fit:cover;border-radius:10px;border:2px solid ${K}}
#hsc-menu .cp.big .inc .hsc-ic{width:26px;height:26px;flex:none}
#hsc-menu .hc.pick{display:grid;grid-template-columns:42% minmax(0,1fr);gap:12px;align-items:center;background:linear-gradient(#fff6d8,#ffe08a)}
#hsc-menu .hc.pick img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:16px;border:3px solid ${K};box-sizing:border-box}
#hsc-menu .hc.pick .tx{display:flex;flex-direction:column;gap:8px;min-width:0}
#hsc-menu .hc.pick .btns{flex-wrap:wrap;gap:8px}
#hsc-menu .hc.pick .sb{height:50px;font-size:20px;flex:1 1 100%}
#hsc-menu .hc.pick .sb.wish{flex:1 1 100%;width:auto}
#hsc-menu .goal{flex:none;display:flex;align-items:center;gap:6px;color:#fff;font-weight:900;font-size:15px;font-variant-numeric:tabular-nums}
#hsc-menu .goal .pgb{display:block;flex:1;height:12px;border-radius:6px;background:#ffffff40;overflow:hidden}
#hsc-menu .goal .pgb i{display:block;height:100%;background:linear-gradient(#b5ff7a,#46c43a)}
#hsc-menu .goal .hsc-ic{width:20px;height:20px}
#hsc-menu .wg{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px;flex:none}
#hsc-menu .wi{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;border-radius:16px;border:3px solid ${K};background:#fff;color:${K};font:900 15px "Arial Rounded MT Bold","Nunito",system-ui,sans-serif;font-variant-numeric:tabular-nums;cursor:pointer;min-height:48px}
#hsc-menu .wi img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:11px}
#hsc-menu .wi span{display:flex;align-items:center;gap:2px;height:22px}
#hsc-menu .wi .hsc-ic{width:18px;height:18px}
@media (orientation:landscape){#hsc-menu .hc.pick{grid-template-columns:130px minmax(0,1fr)}#hsc-menu .hc.pick .btns{flex-wrap:nowrap}#hsc-menu .hc.pick .sb,#hsc-menu .hc.pick .sb.wish{flex:1 1 0}}
`;
  const ui = {
    tab: 'free', need: 0, back: null, pick: { clipper: null, gown: null }, shown: STEP, job: 0, built: false,
    page: () => document.querySelector('#hsc-menu .page.shop'),
    tabs(on, dot) { return TABS.map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" class="${k === on ? 'on' : ''}" aria-selected="${k === on}">${t(l)}${k === 'free' && dot ? '<span class="dot"></span>' : ''}</button>`).join(''); },
    wire(box) { box.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { if (HSC.fx) HSC.fx.play('tap'); this.go(b.dataset.tab); })); },
    ready() { const g = HSC.gift ? HSC.gift.state() : null; return !!((g && g.ready) || (HSC.tasks && HSC.tasks.ready())); },
    // the wishlisted item, when it can be had now or with one video: the moment the player most wants to spend
    near() {
      const w = HSC.econ && HSC.econ.wishTarget ? HSC.econ.wishTarget() : null;
      if (!w || !HSC.coins) return null;
      const gap = w.price - HSC.coins.get(), v = HSC.wishVideo ? HSC.wishVideo.state() : null;
      return gap <= 0 || (v && gap <= v.coins) ? w : null;
    },
    // the Shop button: straight to that item when it is close, otherwise the Free tab
    enter() {
      const w = this.near(), k = w ? w.key.split(':') : [];
      if (k[0] === 'wardrobe') { const key = w.key.slice(9), d = C().byKey.get(key); if (d) { this.pick[d.tool] = key; this.go(d.tool); return; } }
      this.go(k[0] !== 'salon' ? 'free' : k[1] === 'shop' ? 'shops' : 'parts');
    },
    // Shops and Parts live over the 3D picture; the other tabs on this page
    go(tab, need = 0, back = null) {
      this.tab = tab; this.need = need; this.back = back;
      if (tab === 'shops' || tab === 'parts') { if (HSC.salon) HSC.salon.open(tab); return; }
      if (HSC.salon && HSC.salon.hide) HSC.salon.hide();
      this.shown = STEP;
      HSC.menu.view('shop');
      this.render();
    },
    render() {
      const pg = this.page();
      if (!pg) return;
      if (!this.built) { this.built = true; const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); }
      const bar = pg.querySelector('.hsc-stabs');
      bar.innerHTML = this.tabs(this.tab, this.ready());
      this.wire(bar);
      if (this.tab === 'free') this.free(); else if (this.tab === 'coins') this.coins(); else if (this.tab === 'clipper' || this.tab === 'gown') this.wear(this.tab);
    },
    free() {
      const box = this.page().querySelector('.sbody'), g = HSC.gift.state(), v = HSC.wishVideo ? HSC.wishVideo.state() : null, list = HSC.tasks ? HSC.tasks.list() : [], can = !!(HSC.canVideo && HSC.canVideo());
      const gift = g.done ? `<div class="hc gift done">${I('gift')}<span>${TICK}</span></div>`
        : g.ready ? `<div class="hc gift">${I('gift')}<span class="tm">${I('coin', 30)} +${fmt(g.pay)}</span><div class="btns"><button class="sb gold" type="button" data-g="1">${I('coin')}+${fmt(g.pay)}</button>${can ? `<button class="sb vid" type="button" data-g="2">${I('video')}+${fmt(g.pay * 2)}</button>` : ''}</div></div>`
          : `<div class="hc gift">${I('gift')}<span class="tm">${this.clock(g.left)}</span></div>`;
      const vid = v && v.left > 0 ? `<button class="sb vid vr" type="button" data-v="1"><span style="display:flex;align-items:center;gap:6px">${I('video')}${I('coin')}+${fmt(v.coins)}</span><em>${fmt(v.left)}</em></button>` : '';
      box.innerHTML = gift + vid + list.map((x, i) => `<div class="tk"><span>${x.text}</span><span class="pgb"><i style="width:${Math.round(100 * x.n / x.goal)}%"></i></span><button class="sb ${x.done && !x.claimed ? 'gold' : ''}" type="button" data-t="${i}" ${x.done && !x.claimed ? '' : 'disabled'}>${x.claimed ? TICK : I('coin') + fmt(x.pay)}</button></div>`).join('');
      box.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', async () => { b.disabled = true; const n = await HSC.gift.claim(b.dataset.g === '2'); if (n === false) { b.disabled = false; if (HSC.nope) HSC.nope(b); return; } if (HSC.fx) HSC.fx.play('coin'); this.render(); }));
      const vb = box.querySelector('[data-v]');
      if (vb) vb.addEventListener('click', async () => { vb.disabled = true; await HSC.wishVideo.run(); this.render(); });
      box.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => { if (HSC.tasks.claim(+b.dataset.t)) { if (HSC.fx) HSC.fx.play('coin'); this.render(); } }));
    },
    // the game's own coin, stacked in a tidy pyramid that grows with the pack: rows from the back, the front row on top
    pile(tier) {
      const rows = [[1], [2, 1], [3, 2, 1], [4, 3, 2, 1]][tier].slice().reverse(), size = [68, 54, 46, 40][tier], dx = size * 0.76, dy = size * 0.5;
      const W = (rows[rows.length - 1] - 1) * dx + size, H = (rows.length - 1) * dy + size;
      const coins = rows.map((n, r) => Array.from({ length: n }, (_, i) => I('coin').replace('<svg ', `<svg style="left:${(W - ((n - 1) * dx + size)) / 2 + i * dx}px;top:${r * dy}px;width:${size}px;height:${size}px" `)).join('')).join('');
      return `<span class="pile"><span style="width:${W}px;height:${H}px">${coins}</span></span>`;
    },
    // what a pack shows: the Starter Pack a rare item, the Supporter Bundle a premium one
    prize(tool, price) { return C().designs[tool].find((d) => W().price(d) === price && !A().owns(d.key)); },
    coins() {
      const box = this.page().querySelector('.sbody'), cfg = HSC.economy.CONFIG, B = HSC.billing, d = HSC.meta.data;
      box.onscroll = null;
      const buy = (id) => `<button class="sb gold" type="button" data-p="${id}">${t('buy')}</button>`;
      const owned = (id) => !!(B && B.owned && B.owned(id));
      const pic = (dz) => (dz ? `<img alt="" src="${art(dz, 128)}">` : '');
      const starter = d.cuts >= cfg.starterPack.afterCustomers && !owned('starter_pack') ? `<div class="cp big"><div class="inc">${I('coin')}${fmt(cfg.starterPack.coins)}${pic(this.prize('clipper', cfg.wardrobe.rare))}${pic(this.prize('gown', cfg.wardrobe.rare))}</div>${buy('starter_pack')}</div>` : '';
      const bundle = !owned('supporter_bundle') ? `<div class="cp big"><div class="inc">${I('coin')}${fmt(cfg.supporterBundle.coins)}${pic(this.prize('clipper', cfg.wardrobe.premium))}${pic(this.prize('gown', cfg.wardrobe.premium))}</div>${buy('supporter_bundle')}</div>` : '';
      // short of coins: one video if it closes the gap, otherwise the smallest offer that covers it (the Starter Pack's value beats the mid packs)
      const need = this.need, v = need && HSC.wishVideo ? HSC.wishVideo.state() : null, closes = !!(v && need <= v.coins);
      const hot = !need || closes ? null : starter && need > cfg.packs[0].coins ? 'starter_pack' : (cfg.packs.find((x) => x.coins >= need) || cfg.packs[cfg.packs.length - 1]).id;
      const row = closes ? `<button class="sb vid vr" type="button" data-need="1"><span style="display:flex;align-items:center;gap:6px">${I('video')}${I('coin')}+${fmt(v.coins)}</span><em>${fmt(v.left)}</em></button>` : '';
      box.innerHTML = `${row}${starter}<div class="cg2">${cfg.packs.map((x, i) => `<div class="cp">${this.pile(i)}<span>${fmt(x.coins)}</span>${buy(x.id)}</div>`).join('')}</div>${bundle}`;
      const mark = hot && box.querySelector(`[data-p="${hot}"]`);
      if (mark) { const card = mark.closest('.cp'); card.classList.add('hot'); box.scrollTop = Math.max(0, card.offsetTop - box.offsetTop - 12); }
      const nb = box.querySelector('[data-need]');
      if (nb) nb.addEventListener('click', async () => { nb.disabled = true; const before = HSC.coins.get(); await HSC.wishVideo.run(); if (HSC.coins.get() > before) { if (HSC.fx) HSC.fx.play('coin'); this.go(this.back || 'free'); } else this.render(); });
      box.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', async () => { if (!B || !B.buy) { if (HSC.nope) HSC.nope(b); return; } b.disabled = true; const ok = await B.buy(b.dataset.p); if (ok && HSC.fx) HSC.fx.play('coin'); this.render(); }));
    },
    clock(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
    tick() {
      const pg = this.page();
      if (!pg || pg.hidden || this.tab !== 'free' || !HSC.gift) return;
      const g = HSC.gift.state(), el = pg.querySelector('.hc.gift .tm');
      if (g.ready !== this.wasReady) { this.wasReady = g.ready; this.render(); } else if (el && !g.ready && !g.done) el.textContent = this.clock(g.left);
    },
    // what the player sees first: worn, then owned, then today's pick and the rest by price
    list(tool) {
      const a = A(), today = new Set(a.todays()), worn = a.worn(tool), price = (d) => W().price(d);
      const rank = (d) => (d.id === worn ? 0 : a.owns(d.key) ? 1 : today.has(d.key) ? 2 : 3);
      return C().designs[tool].slice().sort((x, y) => (rank(x) - rank(y)) || (price(x) - price(y)) || (x.i - y.i));
    },
    focus(tool) {
      const a = A(), key = this.pick[tool] || a.todays()[tool === 'clipper' ? 0 : 1];
      let d = C().byKey.get(key);
      if (!d || d.tool !== tool) d = C().designs[tool].find((x) => x.id === a.worn(tool)) || C().designs[tool][0];
      return d;
    },
    wear(tool) {
      const box = this.page().querySelector('.sbody'), a = A(), d = this.focus(tool), own = a.owns(d.key), worn = d.id === a.worn(tool), pr = W().price(d);
      const today = a.todays().includes(d.key), can = !!(HSC.canVideo && HSC.canVideo()), coins = HSC.coins.get(), key = 'wardrobe:' + d.key;
      const wishes = HSC.econ && HSC.econ.wishes ? HSC.econ.wishes() : {}, wished = !!(wishes.cosmetic && wishes.cosmetic.key === key), target = HSC.econ && HSC.econ.wishTarget ? HSC.econ.wishTarget() : null;
      const btns = own ? `<button class="sb gold" type="button" data-a="wear" ${worn ? 'disabled' : ''}>${worn ? TICK : I('wardrobe')}</button>`
        : `<button class="sb gold" type="button" data-a="buy">${I('coin')}${fmt(pr)}</button>${today && can ? `<button class="sb vid" type="button" data-a="video">${I('video')}${t('free')}</button>` : ''}<button class="sb wish" type="button" data-a="wish" aria-pressed="${wished}" aria-label="${t('a_wish')}">${HEART(wished)}</button>`;
      const gap = target ? Math.max(0, target.price - coins) : 0;
      const goal = target ? `<div class="goal">${HEART(true)}${I('coin')}${fmt(target.price)}<span class="pgb"><i style="width:${Math.round(100 * Math.min(1, coins / Math.max(1, target.price)))}%"></i></span>${gap ? '−' + fmt(gap) : TICK}</div>` : '';
      box.innerHTML = `<div class="hc pick"><img alt="" src="${art(d, 300)}"><div class="tx"><div class="btns">${btns}</div></div></div>${goal}<div class="wg"></div>`;
      box.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => this.act(b, d)));
      this.all = this.list(tool).filter((x) => x.key !== d.key);
      this.tool = tool;
      this.more(++this.job, 0);
      box.onscroll = () => { if (box.scrollTop + box.clientHeight > box.scrollHeight - 300 && this.shown < this.all.length) { const from = this.shown; this.shown += STEP; this.more(this.job, from); } };
    },
    // the grid fills in steps, a few pictures a frame, so the tab opens at once
    more(job, from) {
      const grid = this.page().querySelector('.wg'), a = A(), rows = this.all.slice(from, this.shown), todo = [];
      if (!grid) return; // another tab took the page
      for (const d of rows) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'wi'; b.dataset.k = d.key;
        b.innerHTML = `<img alt=""><span>${a.owns(d.key) ? (d.id === a.worn(d.tool) ? TICK : I('wardrobe')) : I('coin') + fmt(W().price(d))}</span>`;
        b.addEventListener('click', () => { this.pick[d.tool] = d.key; this.render(); this.page().querySelector('.sbody').scrollTop = 0; });
        grid.appendChild(b);
        todo.push([b.querySelector('img'), d]);
      }
      const step = () => {
        if (job !== this.job) return;
        const t0 = performance.now();
        while (todo.length && performance.now() - t0 < 20) { const [img, d] = todo.shift(); img.src = art(d, 192); }
        if (todo.length) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    async act(b, d) {
      const kind = b.dataset.a, a = A();
      if (kind === 'wear') { a.wear(d.key); if (HSC.wardrobeApply) HSC.wardrobeApply(); this.render(); return; }
      if (kind === 'wish') { const w = HSC.econ.wishes().cosmetic, key = 'wardrobe:' + d.key; await HSC.econ.wish('cosmetic', w && w.key === key ? null : { key, price: W().price(d) }); this.render(); return; }
      if (kind === 'buy' && HSC.coins.get() < W().price(d)) { this.go('coins', W().price(d) - HSC.coins.get(), d.tool); return; } // short of coins: the way to more
      b.disabled = true;
      const ok = kind === 'buy' ? await W().buy(d.key) : await a.take(d.key);
      if (ok) { if (HSC.fx) HSC.fx.play('coin'); if (HSC.wardrobeApply) HSC.wardrobeApply(); } else { b.disabled = false; if (HSC.nope) HSC.nope(b); }
      this.render();
    },
  };
  HSC.shop = { go: (tab, need, back) => ui.go(tab, need, back), enter: () => ui.enter(), dot: () => ui.ready() || !!ui.near(), render: () => ui.render(), tick: () => ui.tick(), ready: () => ui.ready(), tabs: (on) => ui.tabs(on, ui.ready()), wire: (el) => ui.wire(el) };
})(globalThis.HSC || (globalThis.HSC = {}));
