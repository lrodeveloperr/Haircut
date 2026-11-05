// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): coin prices for the wardrobe (docs/ECONOMY-BALANCE-MODEL.md section 14;
// implementation plan 3.5). wardrobe.js is frozen, so this sits beside it: a shop panel opened from a button added to
// the wardrobe sheet, awarding through the wardrobe's own HSC.wardrobeApi.
//
//   tier     from the design's own data: flagged premium 2,400; a special colour or finish 900 (Rare), an uncommon
//            one 350, otherwise 120 (Common). The two free designs stay free. No price depends on the wallet.
//   buying   one journal commit holds the payment and the entitlement `wardrobe:<key>`; a design missing from the
//            wardrobe save is restored from the journal on boot
//   daily    today's two picks stay one video each in the wardrobe; here they lead the list at their normal price
// Cosmetic only: nothing here changes play, scoring or access.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const K = '#10223f', PER = 12;
  const t = (k) => (HSC.t ? HSC.t(k) : k);
  const I = (n, s) => (HSC.icon ? HSC.icon(n, s) : '');
  const C = () => HSC.catalog, W = () => HSC.wardrobeApi;
  const P = () => (HSC.economy ? HSC.economy.CONFIG.wardrobe : { common: 120, uncommon: 350, rare: 900, premium: 2400 });
  const fmt = (n) => (HSC.num ? HSC.num(n) : n);
  const tierOf = (name, list) => { const r = list.find((x) => x[0] === name); return r ? r[r.length - 1] : 0; };
  // the catalog tier of a design: 0 starter/common, 2 uncommon, 3 special, premium above them
  function price(d) {
    if (!d || C().FREE.has(d.key)) return 0;
    if (d.premium) return P().premium;
    const p = d.parts, cols = [p.body, p.accent, p.main, p.second, p.collar].filter(Boolean).map((c) => tierOf(c, C().COLOURS));
    const top = Math.max(0, ...cols, p.finish ? tierOf(p.finish, C().FINISHES) : 0);
    return top >= 3 ? P().rare : top >= 2 ? P().uncommon : P().common;
  }
  const entKey = (key) => 'wardrobe:' + key;
  async function buy(key) {
    const d = C().byKey.get(key), a = W();
    if (!d || !a || a.owns(key)) return false;
    const pr = price(d);
    if (HSC.coins.get() < pr) return false;
    const ok = await (HSC.coins.buyItem || HSC.coins.spend)(pr, 'wardrobe', entKey(key));
    if (!ok) return false;
    a.award(key, 'coins');
    a.wear(key);
    return true;
  }
  // anything paid for in the journal is owned, even if the wardrobe's own save was lost
  function reconcile() {
    if (!HSC.econ || !HSC.econ.ready() || !W()) return false;
    for (const k of HSC.econ.entitlements()) if (k.startsWith('wardrobe:')) W().award(k.slice(9), 'restore');
    return true;
  }

  const CSS = `
#hsc-wshop{position:fixed;inset:0;z-index:31;display:none;align-items:flex-end;justify-content:center;background:#0d3f86b8;zoom:var(--hsc-s,1);font-family:"Arial Rounded MT Bold","Nunito",system-ui,sans-serif;color:${K}}
#hsc-wshop.open{display:flex}
@media (orientation:landscape){#hsc-wshop.open{align-items:center}}
#hsc-wshop .sheet{box-sizing:border-box;width:min(100%,640px);max-height:94%;display:flex;flex-direction:column;gap:10px;padding:12px 14px max(14px,env(safe-area-inset-bottom));background:linear-gradient(#fff,#e4f3ff);border:3px solid ${K};border-radius:26px 26px 0 0;overflow:hidden}
@media (orientation:landscape){#hsc-wshop .sheet{border-radius:26px}}
#hsc-wshop .head{display:flex;align-items:center;gap:8px}
#hsc-wshop .head .tab{width:52px;height:48px;border-radius:14px;border:3px solid ${K};background:#fff;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center}
#hsc-wshop .head .tab[aria-selected=true]{background:linear-gradient(#ffe682,#ffb21a)}
#hsc-wshop .head .tab .hsc-ic{width:30px;height:30px}
#hsc-wshop .head .coin{margin-inline-start:auto;display:flex;align-items:center;gap:4px;font-weight:900;font-size:18px;font-variant-numeric:tabular-nums}
#hsc-wshop .x{width:48px;height:48px;border-radius:50%;border:3px solid ${K};background:#fff;cursor:pointer;font-size:22px;font-weight:900;color:${K};padding:0}
#hsc-wshop .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;overflow-y:auto;min-height:0}
@media (orientation:landscape){#hsc-wshop .grid{grid-template-columns:repeat(6,minmax(0,1fr))}}
#hsc-wshop .it{position:relative;border:3px solid ${K};border-radius:14px;background:#fff;padding:3px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;font:900 13px system-ui,sans-serif;color:${K};font-variant-numeric:tabular-nums}
#hsc-wshop .it img{width:100%;aspect-ratio:1;object-fit:contain}
#hsc-wshop .it[aria-pressed=true]{box-shadow:0 0 0 3px #ffc21a}
#hsc-wshop .it .pr{display:flex;align-items:center;gap:2px}
#hsc-wshop .it .hsc-ic{width:15px;height:15px}
#hsc-wshop .it .day{position:absolute;left:4px;top:4px;width:14px;height:14px;border-radius:50%;background:#ff5c98;border:2px solid ${K}}
#hsc-wshop .bar{display:flex;align-items:center;gap:10px}
#hsc-wshop .bar .pg{display:flex;align-items:center;gap:6px;font-weight:900;font-variant-numeric:tabular-nums}
#hsc-wshop .bar .pg button{width:48px;height:48px;border-radius:14px;border:3px solid ${K};background:#fff;padding:0;cursor:pointer;font-size:22px;font-weight:900;color:${K}}
#hsc-wshop .bar .go{margin-inline-start:auto;display:flex;align-items:center;gap:6px;min-width:112px;height:52px;justify-content:center;border-radius:18px;border:3px solid ${K};background:linear-gradient(#ffe682,#ffb21a);cursor:pointer;font-weight:900;font-size:18px;color:${K};font-variant-numeric:tabular-nums}
#hsc-wshop .bar [hidden]{display:none}
#hsc-wshop .bar .go:disabled{opacity:.5}
#hsc-wshop .bar .go .hsc-ic{width:24px;height:24px}
#hsc-wshop .bar .wish{width:52px;height:52px;border-radius:18px;border:3px solid ${K};background:#fff;cursor:pointer;padding:0;font-size:24px;color:#ff5c98}
#hsc-wshop .bar .wish[aria-pressed=true]{background:#ffd9e8}
.hsc-wshop-btn{position:absolute;right:66px;top:14px;height:48px;padding:0 12px 0 8px;display:flex;align-items:center;gap:4px;border-radius:16px;border:3px solid ${K};background:linear-gradient(#ffe682,#ffb21a);cursor:pointer;color:${K};z-index:3}
.hsc-wshop-btn .hsc-ic{width:28px;height:28px}
`;
  const ui = {
    el: null, tool: 'clipper', page: 0, pick: null,
    build() {
      if (this.el || !document.body) return;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const p = document.createElement('div'); p.id = 'hsc-wshop';
      p.innerHTML = `<div class="sheet" role="dialog"><div class="head"><button class="tab" type="button" data-t="clipper" role="tab">${I('freestyle')}</button><button class="tab" type="button" data-t="gown" role="tab">${I('wardrobe')}</button><span class="coin">${I('coin', 24)}<bdi></bdi></span><button class="x" type="button" aria-label="Close">✕</button></div><div class="grid"></div><div class="bar"><span class="pg"><button class="pv" type="button" aria-label="Back">‹</button><span class="n"></span><button class="nx" type="button" aria-label="Next customer">›</button></span><button class="wish" type="button">♥</button><button class="go" type="button"></button></div></div>`;
      document.body.appendChild(p);
      this.el = p;
      p.querySelector('.x').addEventListener('click', () => this.close());
      p.addEventListener('click', (e) => { if (e.target === p) this.close(); });
      p.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => { this.tool = b.dataset.t; this.page = 0; this.pick = null; this.render(); }));
      p.querySelector('.pv').addEventListener('click', () => { if (this.page > 0) { this.page--; this.render(); } });
      p.querySelector('.nx').addEventListener('click', () => { this.page++; this.render(); });
      p.querySelector('.go').addEventListener('click', async (e) => {
        const b = e.currentTarget;
        if (!this.pick) return;
        b.disabled = true;
        const ok = await buy(this.pick);
        if (ok) { if (HSC.fx) HSC.fx.play('coin'); this.pick = null; } else if (HSC.nope) HSC.nope(b);
        this.render();
      });
      p.querySelector('.wish').addEventListener('click', async () => {
        if (!this.pick || !HSC.econ || !HSC.econ.wish) return;
        const w = HSC.econ.wishes().cosmetic, key = entKey(this.pick);
        await HSC.econ.wish('cosmetic', w && w.key === key ? null : { key, price: price(C().byKey.get(this.pick)) });
        this.render();
      });
    },
    list() {
      const a = W(), today = new Set(a.todays());
      return C().designs[this.tool].filter((d) => !a.owns(d.key)).map((d) => ({ d, pr: price(d), day: today.has(d.key) })).sort((x, y) => (y.day - x.day) || (x.pr - y.pr) || (x.d.i - y.d.i));
    },
    render() {
      if (!this.el) return;
      const p = this.el, all = this.list(), pages = Math.max(1, Math.ceil(all.length / PER));
      this.page = Math.max(0, Math.min(pages - 1, this.page));
      p.querySelector('.sheet').setAttribute('aria-label', t('wardrobe'));
      p.querySelectorAll('.tab').forEach((b) => { b.setAttribute('aria-selected', b.dataset.t === this.tool); b.setAttribute('aria-label', t('wardrobe')); });
      p.querySelector('.coin bdi').textContent = fmt(HSC.coins.get());
      const grid = p.querySelector('.grid');
      grid.innerHTML = all.slice(this.page * PER, this.page * PER + PER).map(({ d, pr, day }) => `<button class="it" type="button" data-k="${d.key}" aria-pressed="${this.pick === d.key}" aria-label="${fmt(pr)}">${day ? '<span class="day"></span>' : ''}<img alt="" src="${W().picture(d, 120)}"><span class="pr">${I('coin', 15)}${fmt(pr)}</span></button>`).join('');
      grid.querySelectorAll('.it').forEach((b) => b.addEventListener('click', () => { this.pick = b.dataset.k; this.render(); }));
      p.querySelector('.n').textContent = fmt(this.page + 1) + ' / ' + fmt(pages);
      p.querySelector('.pv').disabled = this.page === 0;
      p.querySelector('.nx').disabled = this.page >= pages - 1;
      const go = p.querySelector('.go'), wb = p.querySelector('.wish'), d = this.pick && C().byKey.get(this.pick), pr = d ? price(d) : 0;
      go.hidden = wb.hidden = !d;
      if (d) {
        go.innerHTML = I('coin', 24) + fmt(pr); go.disabled = HSC.coins.get() < pr;
        const w = HSC.econ && HSC.econ.wishes ? HSC.econ.wishes().cosmetic : null;
        wb.setAttribute('aria-pressed', !!(w && w.key === entKey(this.pick))); wb.setAttribute('aria-label', t('a_wish'));
      }
    },
    open() { this.build(); reconcile(); this.page = 0; this.pick = null; this.el.classList.add('open'); this.render(); },
    close() { if (!this.el) return; this.el.classList.remove('open'); if (HSC.wardrobeApply) HSC.wardrobeApply(); },
    // the wardrobe's sheet is rebuilt by its own code: keep one button on it
    tick() {
      const sheet = document.querySelector('#hsc-panel .hsc-sheet');
      if (!sheet || sheet.querySelector('.hsc-wshop-btn') || !W() || !HSC.coins) return;
      this.build();
      const b = document.createElement('button');
      b.className = 'hsc-wshop-btn'; b.type = 'button'; b.setAttribute('aria-label', t('wardrobe'));
      b.innerHTML = I('coin');
      b.addEventListener('click', () => this.open());
      sheet.style.position = sheet.style.position || 'relative';
      sheet.appendChild(b);
    },
  };
  HSC.wardrobeShop = { price, buy, reconcile, open: () => ui.open() };
  if (typeof setInterval === 'function') {
    setInterval(() => ui.tick(), 700);
    const sync = (n) => (reconcile() || n > 100 ? null : setTimeout(() => sync(n + 1), 400));
    sync(0);
  }
})(globalThis.HSC || (globalThis.HSC = {}));
