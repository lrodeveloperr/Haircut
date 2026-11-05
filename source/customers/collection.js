// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved items 14 and 15, 5 November 2026): two collections in
// the menu.
//
//   lookbook  every cut customers ask for (requests.js), drawn on one model head. A cut you have not done yet is a
//             faded grey picture; it colours in once you have done it, with its best stars under it and a gold frame
//             for 3 stars. Tapping a cut practises it: the customer in the chair asks for it if it suits him and
//             he has not been cut yet, otherwise the next customer it suits does.
//   album     your regulars, each with his last cut, a heart and his visit count.
// No text: pictures, stars, hearts and numbers only.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#10223f';
  const M = () => HSC.meta;
  const CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  // an open book of cuts, and a photo album with a heart
  const BOOK = `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M2.5 5.5c3-1.4 6.3-1.3 9.5.8v13.4c-3.2-2-6.5-2.2-9.5-.8z" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M21.5 5.5c-3-1.4-6.3-1.3-9.5.8v13.4c3.2-2 6.5-2.2 9.5-.8z" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 12.6c0-3 1.1-4.6 2.6-4.6s2.6 1.6 2.6 4.6" fill="#5a3b1f"/><path d="M5 12.8h5.2" stroke="#c3a789" stroke-width="1.4"/><path d="M14 12.6c0-3 1.1-4.6 2.6-4.6s2.6 1.6 2.6 4.6" fill="#5a3b1f" opacity=".25"/><path d="M14 12.8h5.2" stroke="#c3a789" stroke-width="1.4" opacity=".4"/></svg>`;
  const ALBUM = `<svg viewBox="0 0 24 24" width="40" height="40"><rect x="3.5" y="2.8" width="17" height="18.4" rx="2.4" fill="#4a90d9" stroke="${INK}" stroke-width="1.8"/><rect x="6.5" y="5.6" width="11" height="9" rx="1.6" fill="#fff6e6" stroke="${INK}" stroke-width="1.5"/><circle cx="12" cy="9" r="1.9" fill="#c99a76"/><path d="M8.6 14.6c.5-2 1.8-3 3.4-3s2.9 1 3.4 3z" fill="#c99a76"/><path d="M12 19.6s-3.2-1.9-3.2-3.9a1.6 1.6 0 0 1 3.2-.6 1.6 1.6 0 0 1 3.2.6c0 2-3.2 3.9-3.2 3.9z" fill="#ff5d73" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
  const STAR = (on, s = 16) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc83d' : 'none'}" stroke="${INK}"${on ? '' : ' stroke-dasharray="2.6 2.2" opacity=".55"'} stroke-width="2.2" stroke-linejoin="round"/></svg>`;
  const HEART = (s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M12 20.5S3 15 3 8.8A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 9 2.2C21 15 12 20.5 12 20.5z" fill="#ff5d73" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg>`;
  // "the next customer": a person with an arrow, shown on a cut waiting to be practised
  const NEXT = `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="9" cy="8" r="3.4" fill="#e9c9a8" stroke="${INK}" stroke-width="1.7"/><path d="M2.8 20c0-4 2.8-6 6.2-6s6.2 2 6.2 6z" fill="#4a90d9" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/><path d="M15.5 9.5h5.5m-2.3-2.6l2.6 2.6-2.6 2.6" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const CSS = `
#hsc-book-btn svg,#hsc-album-btn svg{width:40px;height:40px}
.hsc-coll-panel{position:fixed;inset:0;z-index:30;display:none;background:#0d3f86b8;font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};touch-action:manipulation;zoom:var(--hsc-s,1)}
.hsc-coll-panel.open{display:flex;align-items:flex-end;justify-content:center}
.hsc-coll-panel .sheet{position:relative;width:min(100%,600px);max-height:92%;display:flex;flex-direction:column;gap:12px;background:#fff6e6;border:3px solid ${INK};border-bottom:0;border-radius:26px 26px 0 0;box-shadow:0 -4px 0 ${INK};padding:14px max(14px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}
@media (orientation:landscape){.hsc-coll-panel.open{align-items:center}.hsc-coll-panel .sheet{border-radius:26px;border-bottom:3px solid ${INK};box-shadow:0 5px 0 ${INK}}}
.hsc-coll-panel .head{display:flex;align-items:center;gap:10px;font-weight:900;font-size:20px;font-variant-numeric:tabular-nums}
.hsc-coll-panel .head .ic{display:flex}
.hsc-coll-panel .head .sp{flex:1}
.hsc-coll-panel .swap{display:flex;align-items:center;gap:6px;height:48px;padding:0 12px 0 8px;border-radius:16px;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};background:#fff;cursor:pointer;color:${INK};font:900 15px "DM Sans",system-ui,sans-serif;max-width:46%;min-width:0}
.hsc-coll-panel .swap svg{width:30px;height:30px;flex:none}
.hsc-coll-panel .swap .hsc-lbl{display:block;min-width:0;white-space:nowrap;overflow:hidden}
.hsc-coll-panel .x{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer;color:${INK};padding:0}
.hsc-coll-panel .grid{flex:1;min-height:0;display:grid;gap:12px 10px;overflow-y:auto;padding:8px 8px 6px;grid-template-columns:repeat(auto-fill,minmax(98px,1fr));grid-auto-rows:max-content;justify-items:center}
.hsc-coll-panel .cut{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 4px 5px;border-radius:18px;border:3px solid ${INK};background:#f1e4cc;cursor:pointer;color:${INK};min-height:48px}
.hsc-coll-panel .cut .pic{width:86px;height:86px;border-radius:13px;background:radial-gradient(circle at 50% 35%,#fff,#e4d2b4);display:block;overflow:hidden}
.hsc-coll-panel .cut img{width:86px;height:86px;display:block}
.hsc-coll-panel .cut:not(.done) img{filter:grayscale(1) opacity(.42)}
.hsc-coll-panel .cut.done{background:#fff}
.hsc-coll-panel .cut.gold{border-color:#c98a12;box-shadow:0 0 0 3px #ffc83d,0 3px 0 ${INK};background:radial-gradient(circle at 50% 30%,#fff,#ffe9b0)}
.hsc-coll-panel .cut .st{display:flex;gap:1px;height:16px}
.hsc-coll-panel .cut .nx{position:absolute;right:-8px;top:-8px;width:32px;height:32px;border-radius:50%;background:#ffe08a;border:2.5px solid ${INK};display:flex;align-items:center;justify-content:center;animation:hsc-collp 1s ease-in-out infinite}
.hsc-coll-panel .cut.pend{border-style:dashed}
.hsc-coll-panel .cut:active{transform:translateY(2px)}
@keyframes hsc-collp{50%{transform:scale(1.12)}}
.hsc-coll-panel .face{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 4px 6px;border-radius:18px;border:3px solid ${INK};background:#fff}
.hsc-coll-panel .face img{width:86px;height:86px;border-radius:13px;background:radial-gradient(circle at 50% 35%,#fff,#e4d2b4);display:block}
.hsc-coll-panel .face .n{display:flex;align-items:center;gap:3px;font-weight:900;font-size:18px;font-variant-numeric:tabular-nums}
.hsc-coll-panel .face .stg{display:flex;gap:3px}
.hsc-coll-panel .face .stg i{width:10px;height:10px;border-radius:50%;border:2px solid ${INK};background:#fff}
.hsc-coll-panel .face .stg i.on{background:#ff5c98}
.hsc-coll-panel .face .city{max-width:92px;font-size:12px;font-weight:900;line-height:1.1;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hsc-coll-panel .empty{display:flex;justify-content:center;padding:24px;opacity:.35}
.hsc-coll-panel [hidden]{display:none}
@media (prefers-reduced-motion:reduce){.hsc-coll-panel .cut .nx{animation:none}}
`;

  // ---- the lookbook ----
  const styles = () => (HSC.REQUEST_STYLES || []).filter((s) => s.fam !== 'trim');
  const book = () => (M() && M().data && M().data.book) || {};
  // one model for every picture: a clean-shaven man of about 30 with straight hair and no hair loss
  let model = null;
  function modelPerson() {
    if (model) return model;
    for (let seed = 11; seed < 900 && !model; seed++) {
      const p = HSC.makePerson(seed, {});
      if (p.beard.style === 'clean' && /^[12]/.test(p.hair.type) && p.years >= 24 && p.years <= 38 && (p.bald.type !== 'norwood' || +p.bald.norwood <= 1) && p.hair.grey < 0.1) model = p;
    }
    return model || (model = HSC.makePerson(11, {}));
  }
  const pics = new Map();
  function cutPicture(st) {
    if (!pics.has(st.id)) {
      const p = modelPerson();
      let url = null;
      try { url = HSC.portrait(p, HSC.walkIns.build(st), null, 110, 180); } catch (e) { console.error('customers: lookbook picture failed', e); }
      if (url) pics.set(st.id, url);
    }
    return pics.get(st.id) || null;
  }

  // ---- the album ----
  const facePics = new Map();
  function facePicture(r) {
    const key = r.p.seed + ':' + r.n;
    if (!facePics.has(key)) {
      const top = HSC.BEARD_MM ? HSC.BEARD_MM.length - 1 : 16;
      const hair = HSC.gridUnpack(r.h, 5), beard = HSC.gridUnpack(r.b, top);
      if (!hair || !beard) return null;
      let url = null;
      try { url = HSC.portrait(r.p, hair, beard, 160, 200); } catch (e) { console.error('customers: album picture failed', e); }
      if (url) facePics.set(key, url);
    }
    return facePics.get(key) || null;
  }

  // one list of regulars: the career's own (career-run.js, kept per city in the career journal) first, then the
  // regulars met in the other modes (meta.js); a customer who is both appears once, as the career's
  function regulars() {
    const body = HSC.careerRun && HSC.careerRun.body ? HSC.careerRun.body() : null, out = [], seen = new Set();
    for (const [city, list] of Object.entries((body && body.regs) || {})) {
      for (const g of list || []) {
        if (!g || !g.person || typeof g.h !== 'string' || typeof g.b !== 'string' || seen.has(g.person.seed)) continue;
        seen.add(g.person.seed);
        out.push({ p: g.person, h: g.h, b: g.b, n: Math.max(1, g.visits | 0), city });
      }
    }
    for (const r of (M() && M().data && M().data.regulars) || []) if (r && r.p && !seen.has(r.p.seed)) { seen.add(r.p.seed); out.push(r); }
    return out.sort((a, b) => b.n - a.n);
  }

  const ui = {
    el: {}, built: false, job: 0,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      // each panel has a button to the other one (the lookbook and the regulars album sit side by side)
      const mk = (id, icon, label, other, otherIcon, otherWord) => {
        const p = document.createElement('div'); p.id = id; p.className = 'hsc-coll-panel';
        p.innerHTML = `<div class="sheet" role="dialog" aria-label="${label}"><div class="head"><span class="ic">${icon}</span><span class="cnt"></span><span class="sp"></span><button class="swap" type="button" data-to="${other}">${otherIcon}<span class="hsc-lbl" data-k="${otherWord}">${HSC.t ? HSC.t(otherWord) : ''}</span></button><button class="x" type="button" aria-label="Close">${CLOSE}</button></div><div class="grid"></div></div>`;
        p.querySelector('.swap').addEventListener('click', () => { this.close(p); if (other === 'album') this.openAlbum(); else this.openBook(); });
        p.querySelector('.x').addEventListener('click', () => this.close(p));
        p.addEventListener('click', (e) => { if (e.target === p) this.close(p); });
        document.body.appendChild(p);
        return p;
      };
      this.el.book = mk('hsc-book', BOOK, 'Lookbook', 'album', ALBUM, 'regulars');
      this.el.album = mk('hsc-album', ALBUM, 'Regulars', 'book', BOOK, 'styles');
      this.el.book.querySelector('.grid').addEventListener('click', (e) => { const c = e.target.closest('.cut'); if (c) this.practise(c); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape') for (const p of [this.el.book, this.el.album]) if (p.classList.contains('open')) { e.preventDefault(); this.close(p); } });
      setInterval(() => this.buttons(), 300);
      this.buttons();
    },
    // the two buttons go in the HUD row; the menu (menu.js) takes them in as tiles
    buttons() {
      const row = document.querySelector('#hsc-hud .hsc-row');
      if (!row) return;
      for (const [id, icon, label, open] of [['hsc-book-btn', BOOK, 'Lookbook', () => this.openBook()], ['hsc-album-btn', ALBUM, 'Regulars', () => this.openAlbum()]]) {
        if (document.getElementById(id)) continue;
        const b = document.createElement('button');
        b.className = 'hsc-btn'; b.id = id; b.type = 'button'; b.setAttribute('aria-label', label);
        b.innerHTML = icon + '<span class="hsc-dot" hidden></span>';
        b.addEventListener('click', open);
        row.appendChild(b);
      }
    },
    close(p) { p.classList.remove('open'); this.job++; },
    // pictures render one per frame so the panel opens at once
    fill(list, picture, job) {
      let i = 0;
      const step = () => {
        if (job !== this.job) return;
        const t0 = performance.now();
        while (i < list.length && performance.now() - t0 < 24) {
          const [el, item] = list[i++];
          const url = picture(item);
          if (url) el.src = url;
        }
        if (i < list.length) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    openBook() {
      const p = this.el.book, grid = p.querySelector('.grid'), b = book(), list = [], pend = HSC.practising ? HSC.practising() : null;
      const all = styles();
      grid.innerHTML = all.map((s) => {
        const n = b[s.id] || 0;
        return `<button class="cut${n ? ' done' : ''}${n === 3 ? ' gold' : ''}${pend === s.id ? ' pend' : ''}" type="button" data-id="${s.id}" aria-label="Practise this cut"><span class="pic"><img alt=""></span><span class="st">${n ? [1, 2, 3].map((k) => STAR(k <= n)).join('') : ''}</span>${pend === s.id ? `<span class="nx">${NEXT}</span>` : ''}</button>`;
      }).join('');
      const done = all.filter((s) => b[s.id]).length;
      p.querySelector('.cnt').textContent = done + ' / ' + all.length;
      grid.querySelectorAll('.cut').forEach((el, k) => list.push([el.querySelector('img'), all[k]]));
      p.classList.add('open');
      requestAnimationFrame(() => HSC.fitLabels && HSC.fitLabels(p));
      this.fill(list, cutPicture, ++this.job);
    },
    practise(el) {
      const r = HSC.practise ? HSC.practise(el.dataset.id) : null;
      if (r === 'now') { this.close(this.el.book); if (HSC.menu) HSC.menu.close(); return; }
      if (r === 'next') {
        this.el.book.querySelectorAll('.cut.pend').forEach((c) => { c.classList.remove('pend'); const x = c.querySelector('.nx'); if (x) x.remove(); });
        el.classList.add('pend');
        el.insertAdjacentHTML('beforeend', `<span class="nx">${NEXT}</span>`);
      } else if (HSC.nope) HSC.nope(el);
    },
    openAlbum() {
      const p = this.el.album, grid = p.querySelector('.grid');
      const regs = regulars();
      p.querySelector('.cnt').textContent = regs.length ? String(regs.length) : '';
      grid.innerHTML = regs.length
        ? regs.map((r) => {
          // the relationship stage as four dots (Recognized, Familiar, Trusted, Signature) and the city he lives in
          const stage = HSC.career && HSC.career.regularStage ? HSC.career.regularStage(r.n) : null, at = ['recognized', 'familiar', 'trusted', 'signature'].indexOf(stage);
          const city = r.city && r.city !== (HSC.career && HSC.career.UNSET) && HSC.cityName ? HSC.cityName(r.city) : '';
          const said = (stage ? HSC.t('s_' + stage) : '') + (city ? ', ' + city : '');
          return `<div class="face" role="img" aria-label="${said.replace(/"/g, '')}"><img alt=""><span class="n">${HEART(20)}${HSC.num ? HSC.num(r.n) : r.n}</span>${stage ? `<span class="stg" aria-hidden="true">${[0, 1, 2, 3].map((k) => `<i class="${k <= at ? 'on' : ''}"></i>`).join('')}</span>` : ''}${city ? `<span class="city" aria-hidden="true"><bdi>${city}</bdi></span>` : ''}</div>`;
        }).join('')
        : `<div class="empty" style="grid-column:1/-1">${HEART(64)}</div>`;
      const list = [];
      grid.querySelectorAll('.face').forEach((el, k) => list.push([el.querySelector('img'), regs[k]]));
      p.classList.add('open');
      requestAnimationFrame(() => HSC.fitLabels && HSC.fitLabels(p));
      this.fill(list, facePicture, ++this.job);
    },
  };
  const boot = () => { if (globalThis.skinFadeStudio && document.querySelector('#hsc-hud .hsc-row') && HSC.meta && HSC.meta.data) ui.build(); else setTimeout(boot, 300); };
  boot();
  HSC.collection = { openBook: () => ui.openBook(), openAlbum: () => ui.openAlbum() };
})(globalThis.HSC || (globalThis.HSC = {}));
