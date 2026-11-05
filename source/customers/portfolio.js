// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the permanent career portfolio (docs/PERMANENT-CAREER-PORTFOLIO-
// CONTRACT.md). A view of the career's own facts plus the one section the portfolio owns (`body.port`):
//
//   catalog   stable ids from the game's registries (styles, cities, tools, services, modes)
//   sets      each completion set is an explicit id list; its version is a hash of that list, so new content makes
//             a new set version and an earned seal is never taken back (section 3.1)
//   seals     a set completes once, inside the same journal commit as the job that completed it; its reward id is
//             `portfolio:setId:version` and pays once. Rewards are seals and branch display awards; set coin
//             amounts are an economy decision (implementation plan 3.7) and are 0 until the owner sets them.
//   cards     24 favourite before/after cards, each a recipe (packed grids, never an image), at most 12 KiB, all
//             of them at most 384 KiB; a full gallery asks which exact card to replace
//   goals     at most three achievable goals, never three of one kind when others exist (section 11)
// Quick Play and practice never reach any of this: only career commits call `settle`.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const K = '#10223f';
  const t = (k) => (HSC.t ? HSC.t(k) : k);
  const I = (n, s) => (HSC.icon ? HSC.icon(n, s) : '');
  const C = () => HSC.career, CR = () => (HSC.careerRun && HSC.careerRun.ready() ? HSC.careerRun : null);
  const EDITION = 'p1', CARD_V = 1, CARDS = 24, CARD_MAX = 12 * 1024, CARDS_MAX = 384 * 1024;
  const TOOLS = ['clipper', 'trimmer', 'scissors', 'razor', 'beard'];
  const SERVICES = ['aftershave', 'towel', 'massage', 'talc', 'pomade', 'threading', 'singe', 'lather'];
  const MODES = ['requests', 'fix', 'beard', 'relax', 'rush', 'daily'];
  const STAGES = ['recognized', 'familiar', 'trusted', 'signature'];
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0).toString(36); };

  // ---- the catalog and its frozen sets ----
  function styleIds() { return (HSC.REQUEST_STYLES || []).filter((s) => s.fam !== 'trim').map((s) => s.id); }
  function sets() {
    const out = [], add = (id, req) => out.push({ id, req, ver: hash(req.join(',')) });
    const fams = {};
    for (const s of HSC.REQUEST_STYLES || []) if (s.fam !== 'trim') (fams[s.fam] = fams[s.fam] || []).push(s.id);
    for (const f of Object.keys(fams).sort()) add('style:' + f, fams[f]);
    const cities = C() ? C().enabledIds() : [];
    for (const c of cities) add('city:' + c, ['visit:' + c, 'showcase:' + c, 'mastery:' + c]);
    add('passport', cities.map((c) => 'visit:' + c));
    add('tools', TOOLS.map((x) => 'tool:' + x));
    add('services', SERVICES.map((x) => 'service:' + x));
    add('relationship', STAGES.map((x) => 'stage:' + x));
    add('tour1', ['tour:1']);
    return out;
  }
  // every entry the career's facts have earned (derived, never stored)
  function earned(body) {
    const core = body.core, m = core.mastery, have = new Set();
    for (const [id, v] of Object.entries(m.style)) if (v >= 1) have.add(id);
    for (const [id, c] of Object.entries(core.cities)) {
      if (id === C().UNSET) continue;
      if (c.visits || c.chapters || (core.current && core.current.city === id && (core.current.slot || core.licence.next))) have.add('visit:' + id);
      if (c.established) have.add('showcase:' + id);
      if (C().cityMastery(core, id).all) have.add('mastery:' + id);
    }
    for (const [k, v] of Object.entries(m.tool)) if (v >= 1) have.add('tool:' + k);
    for (const [k, v] of Object.entries(m.service)) if (v >= 1) have.add('service:' + k);
    let best = 0;
    for (const list of Object.values(body.regs || {})) for (const g of list || []) best = Math.max(best, g.visits | 0);
    STAGES.forEach((s, i) => { if (best >= [1, 2, 4, 7][i]) have.add('stage:' + s); });
    if (core.tour && core.tour.n >= 2) have.add('tour:1');
    return have;
  }
  // the portfolio's own section, made valid
  function port(body) {
    const p = body.port && typeof body.port === 'object' ? body.port : {};
    return { v: 1, edition: EDITION, seals: p.seals && typeof p.seals === 'object' ? p.seals : {}, claimed: Array.isArray(p.claimed) ? p.claimed : [], cards: Array.isArray(p.cards) ? p.cards : [], migrated: !!p.migrated };
  }
  // newly complete sets get their seal and reward in the body being committed (pure on the given body copy)
  function settle(body, migration) {
    if (!body || !body.core || (C() && C().needsFounding(body.core))) return [];
    const p = port(body), have = earned(body), done = [];
    for (const s of sets()) {
      const key = s.id + '@' + s.ver;
      if (p.seals[key] || !s.req.length || !s.req.every((e) => have.has(e))) continue;
      p.seals[key] = 1;
      const rid = 'portfolio:' + s.id + ':' + s.ver;
      if (!p.claimed.includes(rid)) {
        p.claimed.push(rid);
        // a city set's award is its seal on the branch wall (branch plan section 6)
        if (s.id.startsWith('city:') && body.branches && body.branches[s.id.slice(5)]) {
          const objs = body.branches[s.id.slice(5)].objects = body.branches[s.id.slice(5)].objects || [];
          if (!objs.includes('seal')) objs.push('seal');
        }
      }
      done.push(s.id);
    }
    if (migration && !p.migrated) {
      p.migrated = true;
      // one idempotent zero-coin record of the migration (contract section 14)
      if (body.eco && HSC.economy) { const r = HSC.economy.apply(body.eco, { key: 'portfolio:migration', type: 'migration', cat: 'portfolio', amount: 0 }); if (!r.error) body.eco = r.eco; }
    }
    body.port = p;
    return done;
  }

  // ---- favourite cards ----
  // The card codec (version 1): each 128x64 grid is reduced to 64x32 cells (the mean of each 2x2 block), quantized to
  // 3 bits (scalp levels 0-5 as they are; beard levels 0-16 in eight bands) and packed as base64. Deterministic and
  // presentation-only: it can draw the before and after, never resume play or rescore (contract section 9.2).
  const CW = 64, CH = 32;
  function encode(grid, top) {
    if (!Array.isArray(grid) || grid.length !== 8192) return null;
    const bits = new Uint8Array(Math.ceil(CW * CH * 3 / 8));
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      const i = 2 * y * 128 + 2 * x, m = (grid[i] + grid[i + 1] + grid[i + 128] + grid[i + 129]) / 4;
      const q = Math.max(0, Math.min(7, Math.round(top > 7 ? m * 7 / top : m)));
      const b = (y * CW + x) * 3;
      for (let k = 0; k < 3; k++) if (q & (1 << k)) bits[(b + k) >> 3] |= 1 << ((b + k) & 7);
    }
    let bin = '';
    for (const v of bits) bin += String.fromCharCode(v);
    return 'q3:' + btoa(bin);
  }
  function decode(str, top) {
    if (typeof str !== 'string' || !str.startsWith('q3:')) return null;
    let bin;
    try { bin = atob(str.slice(3)); } catch (e) { return null; }
    if (bin.length !== Math.ceil(CW * CH * 3 / 8)) return null;
    const out = new Array(8192);
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      const b = (y * CW + x) * 3;
      let q = 0;
      for (let k = 0; k < 3; k++) if (bin.charCodeAt((b + k) >> 3) & (1 << ((b + k) & 7))) q |= 1 << k;
      const v = top > 7 ? Math.round(q * top / 7) : q, i = 2 * y * 128 + 2 * x;
      out[i] = out[i + 1] = out[i + 128] = out[i + 129] = v;
    }
    return out;
  }
  const BTOP = () => (HSC.BEARD_MM ? HSC.BEARD_MM.length - 1 : 16);
  // the recipe of a finished career job (career-run.js keeps the last one, packed, until the next job)
  function recipe(r) {
    const g = (x, top) => (typeof x === 'string' ? HSC.gridUnpack(x, top) : null);
    return { id: 'c' + hash(r.src + ':' + r.rev), cv: CARD_V, src: r.src, city: r.city || null, style: r.style || null, mode: r.mode, seed: r.person.seed, person: r.person,
      bh: encode(g(r.bh, 5), 5), ah: encode(g(r.ah, 5), 5), bb: encode(g(r.bb, BTOP()), BTOP()), ab: encode(g(r.ab, BTOP()), BTOP()), q: r.q | 0, rev: r.rev | 0 };
  }
  // the encoded size in bytes (the record is ASCII JSON)
  const size = (x) => JSON.stringify(x).length;
  function validCard(c) {
    return !!c && typeof c === 'object' && c.cv === CARD_V && typeof c.id === 'string' && typeof c.src === 'string' && c.person && typeof c.person === 'object' &&
      typeof c.bh === 'string' && typeof c.ah === 'string' && c.bh.startsWith('q3:') && c.ah.startsWith('q3:') && size(c) <= CARD_MAX;
  }
  // a card's before and after grids for drawing
  const cardGrids = (c, side) => ({ hair: decode(side === 'b' ? c.bh : c.ah, 5), beard: decode(side === 'b' ? c.bb : c.ab, BTOP()) });
  // add (or replace one exact card): null when it would not fit; the gallery is never changed by a refusal
  function withCard(cards, card, replaceId) {
    if (!validCard(card)) return null;
    let next = cards.filter((c) => c.id !== card.id);
    if (replaceId) { const i = next.findIndex((c) => c.id === replaceId); if (i < 0) return null; next[i] = card; }
    else { if (next.length >= CARDS) return null; next.push(card); }
    if (size(next) > CARDS_MAX) return null;
    return next;
  }

  // ---- goals (section 11): at most three, achievable, not all of one kind ----
  function goals(body) {
    const core = body.core, have = earned(body), out = [];
    const cur = core.current && core.current.city;
    if (cur && !C().needsFounding(core)) out.push({ kind: 'city', icon: 'map', key: 'map', city: cur, left: 5 - (core.current.slot | 0) });
    const p = port(body);
    const open = sets().filter((s) => !p.seals[s.id + '@' + s.ver]).map((s) => ({ s, left: s.req.filter((e) => !have.has(e)).length }))
      .filter((x) => x.left > 0 && !(x.s.id === 'tour1' && !core.tour)).sort((a, b) => a.left - b.left || (b.s.id.includes(cur || '~') ? 1 : 0) - (a.s.id.includes(cur || '~') ? 1 : 0));
    // the set goal names something other than the city already shown as the first goal
    if (cur && open[0] && open[0].s.id === 'city:' + cur && open[1]) open.push(open.shift());
    if (open[0]) out.push({ kind: 'set', icon: open[0].s.id.startsWith('style') ? 'styles' : open[0].s.id.startsWith('city') || open[0].s.id === 'passport' ? 'map' : 'medal', set: open[0].s.id, left: open[0].left });
    // one mastery or relationship step: a style not yet gold, else a regular one visit from his next stage
    const silver = Object.entries(core.mastery.style).filter(([, v]) => v > 0 && v < 3).map(([id]) => id)[0];
    if (silver) out.push({ kind: 'style', icon: 'styles', style: silver, left: 1 });
    else { const g = Object.values(body.regs || {}).flat().find((x) => x && x.visits < 7); if (g) out.push({ kind: 'regular', icon: 'regulars', left: [1, 2, 4, 7].find((n) => n > g.visits) - g.visits }); }
    if (out.length === 3 && out.every((g) => g.kind === out[0].kind) && open[1]) out[2] = { kind: 'set', icon: 'medal', set: open[1].s.id, left: open[1].left };
    return out.slice(0, 3);
  }

  // ---- the screen ----
  const CSS = `
#hsc-menu .port{grid-template-rows:48px 52px minmax(0,1fr)}
#hsc-menu .port .tabs{display:flex;gap:6px;overflow-x:auto;padding:2px}
#hsc-menu .port .tabs .j{flex:none;width:52px;height:46px;border-radius:16px;display:flex;align-items:center;justify-content:center}
#hsc-menu .port .tabs .j .hsc-ic{width:32px;height:32px}
#hsc-menu .port .tabs .j.on{background:linear-gradient(#ffe682,#ffb21a)}
#hsc-menu .port .pbody{min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:4px 2px 12px}
#hsc-menu .port .pc{box-sizing:border-box;border-radius:20px;border:3px solid ${K};background:linear-gradient(#fff,#e4f3ff);padding:10px 12px;color:${K};font-weight:900}
#hsc-menu .port .row{display:flex;align-items:center;gap:10px;font-size:18px;flex-wrap:wrap}
#hsc-menu .port .row .hsc-ic{width:32px;height:32px}
#hsc-menu .port .num{font-variant-numeric:tabular-nums}
#hsc-menu .port .grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
#hsc-menu .port .tile{position:relative;border-radius:16px;border:3px solid ${K};background:#fff;padding:6px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:13px;text-align:center;min-height:84px;box-sizing:border-box}
#hsc-menu .port .tile.off{opacity:.45}
#hsc-menu .port .tile .hsc-ic{width:36px;height:36px}
#hsc-menu .port .tile img{width:84px;height:84px;border-radius:12px;background:radial-gradient(circle at 50% 35%,#fff,#e4d2b4)}
#hsc-menu .port .med{display:flex;gap:2px;font-size:16px}
#hsc-menu .port .seal{position:absolute;right:4px;top:4px;width:22px;height:22px;border-radius:50%;background:#ffc21a;border:2px solid ${K}}
#hsc-menu .port .tile.pick{outline:4px solid #f04436}
#hsc-menu .port .acts{display:flex;gap:10px;flex-wrap:wrap}
#hsc-menu .port .acts .j{display:flex;align-items:center;gap:8px;height:52px;padding:0 16px 0 10px;font-size:17px;font-weight:900}
#hsc-menu .port .acts .hsc-ic{width:32px;height:32px}
#hsc-menu .port .favs{grid-template-columns:repeat(auto-fill,minmax(156px,1fr))}
#hsc-menu .port .pair{display:flex;gap:6px;justify-content:center}
#hsc-menu .port .pair img{width:68px;height:68px;border-radius:14px;border:3px solid ${K};background:radial-gradient(circle at 50% 35%,#fff,#e4d2b4)}
`;
  const STAR = (on) => `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc21a' : 'none'}" stroke="${on ? K : '#9fb0c4'}" stroke-width="2.4" stroke-linejoin="round"/></svg>`;
  const TABS = [['over', 'medal', 'p_overview'], ['styles', 'styles', 'styles'], ['pass', 'map', 'map'], ['regs', 'regulars', 'regulars'], ['cab', 'modes', 'p_cabinet'], ['fav', 'gift', 'p_favourites']];
  const ui = {
    built: false, tab: 'over', replacing: false,
    build() {
      const m = document.getElementById('hsc-menu');
      if (this.built || !m) return !!this.built;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const pg = document.createElement('div');
      pg.className = 'page port'; pg.hidden = true; pg.setAttribute('role', 'dialog');
      pg.innerHTML = `<div class="mhead"><button class="j c-white back" type="button" aria-label="Back">${I('back')}</button><div class="title">${I('medal')}<span class="hsc-lbl" data-k="p_portfolio"></span></div></div>
        <div class="tabs" role="tablist">${TABS.map(([k, ic, lbl]) => `<button class="j c-white" type="button" role="tab" data-t="${k}" data-l="${lbl}">${I(ic)}</button>`).join('')}</div><div class="pbody"></div>`;
      m.appendChild(pg);
      pg.querySelector('.back').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('back'); HSC.menu.view('home', true); });
      pg.querySelectorAll('.tabs .j').forEach((b) => b.addEventListener('click', () => { this.tab = b.dataset.t; this.replacing = false; if (HSC.fx) HSC.fx.play('tap'); this.render(); }));
      return true;
    },
    render() {
      if (!this.build()) return;
      const pg = document.querySelector('#hsc-menu .page.port'), cr = CR(), body = cr && cr.body();
      pg.setAttribute('aria-label', t('p_portfolio'));
      pg.querySelectorAll('.tabs .j').forEach((b) => { b.classList.toggle('on', b.dataset.t === this.tab); b.setAttribute('aria-selected', b.dataset.t === this.tab); b.setAttribute('aria-label', t(b.dataset.l)); });
      const box = pg.querySelector('.pbody');
      if (!body) { box.innerHTML = ''; return; }
      box.innerHTML = this[this.tab](body);
      this.wire(box, body);
    },
    over(body) {
      const core = body.core, rk = CR().rank() || { id: 'apprentice' }, n = (x) => (HSC.num ? HSC.num(x) : x);
      // customers served in the career: the licence's, every tour chapter's five, and the open chapter's so far
      const licChapters = Math.floor((core.licence.next | 0) / 5), allChapters = Object.values(core.cities).reduce((a, c) => a + (c.chapters | 0), 0);
      const served = (core.licence.next | 0) + Math.max(0, allChapters - licChapters) * 5 + (core.licence.next >= 30 && core.current ? core.current.slot | 0 : 0);
      const gl = goals(body);
      // three distances at once, none a blocker (friction contract section 5): the next bill, a near target within
      // 12 ordinary contracts and a long one 30-60 contracts away; the wishlist target leads when one is set
      const dist = [];
      if (HSC.econ && HSC.salon && HSC.salon.targets) {
        const per = HSC.econ.perJob(), bal = HSC.econ.balance(), jobs = (p) => Math.max(0, Math.ceil((p - bal) / per));
        const list = HSC.salon.targets().map((x) => Object.assign({ jobs: jobs(x.price) }, x)), w = HSC.econ.wishes().salon;
        const bl = HSC.econ.bill();
        if (bl) dist.push(['flame', bl.sponsored != null ? bl.sponsored : bl.inJobs]);
        const near = w ? { jobs: jobs(w.price), heart: true } : list.find((x) => x.jobs <= 12) || list[0], far = list.find((x) => x.jobs >= 30 && x.jobs <= 60) || list[list.length - 1];
        if (near) dist.push([near.heart ? 'regulars' : 'salon', near.jobs]);
        if (far && far !== near) dist.push(['salon', far.jobs]);
      }
      const p = port(body), total = sets().length, sealed = sets().filter((s) => p.seals[s.id + '@' + s.ver]).length;
      return `<div class="pc row">${I('medal')}<span>${t('r_' + rk.id)}${rk.legend ? ' ' + n(rk.legend) : ''}</span><span class="row">${I('rush', 28)}<span class="num">${n(core.tour ? core.tour.n : 0)}</span></span><span class="row">${I('orders', 28)}<span class="num">${n(served)}</span></span><span class="row">${I('medal', 28)}<span class="num">${n(sealed)} / ${n(total)}</span></span></div>
        ${dist.length ? `<div class="pc row" role="img" aria-label="${t('p_goal')}">${dist.map(([ic, v]) => `<span class="row">${I(ic, 28)}<span class="num">${n(v)}</span></span>`).join('')}${I('orders', 28)}</div>` : ''}
        ${gl.map((g) => `<div class="pc row" role="img" aria-label="${t('p_goal')}">${I(g.icon)}<span>${g.kind === 'city' ? (HSC.cityName ? HSC.cityName(g.city) : g.city) : g.kind === 'set' ? this.setName(g.set) : g.kind === 'style' ? t('styles') : t('regulars')}</span><span class="num">−${n(g.left)}</span></div>`).join('')}`;
    },
    setName(id) {
      const [kind, rest] = id.split(':');
      if (kind === 'city') return HSC.cityName ? HSC.cityName(rest) : rest;
      if (kind === 'style') return t('styles') + ' · ' + rest;
      return t({ passport: 'map', tools: 'p_cabinet', services: 'p_cabinet', relationship: 'regulars', tour1: 'tour' }[kind] || 'p_portfolio') + (kind === 'tour1' ? ' 1' : '');
    },
    styles(body) {
      const m = body.core.mastery.style;
      return `<div class="pc grid2">${styleIds().map((id) => { const v = m[id] | 0; return `<button class="tile${v ? '' : ' off'}" type="button" data-style="${id}" aria-label="${id}">${I('styles')}<span class="med">${[1, 2, 3].map((x) => STAR(x <= v)).join('')}</span></button>`; }).join('')}</div>
        <div class="acts"><button class="j c-mint book" type="button">${I('styles')}<span class="hsc-lbl" data-k="styles">${t('styles')}</span></button></div>`;
    },
    pass(body) {
      const core = body.core, have = earned(body), name = (id) => (HSC.cityName ? HSC.cityName(id) : id);
      let coll; try { coll = new Intl.Collator(HSC.langTag ? HSC.langTag() : 'en'); } catch (e) { coll = new Intl.Collator('en'); }
      const ids = C().enabledIds().sort((a, b) => coll.compare(name(a), name(b)));
      return `<div class="pc grid2">${ids.map((id) => { const c = core.cities[id] || {}; return `<div class="tile${have.has('visit:' + id) ? '' : ' off'}" role="img" aria-label="${name(id)}">${have.has('showcase:' + id) ? '<span class="seal"></span>' : ''}${I(have.has('mastery:' + id) ? 'medal' : 'salon')}<bdi>${name(id)}</bdi><span class="med">${[1, 2, 3].map((x) => STAR(x <= (c.showcaseBest | 0))).join('')}</span></div>`; }).join('')}</div>`;
    },
    regs(body) {
      const list = Object.entries(body.regs || {}).flatMap(([city, l]) => (l || []).map((g) => Object.assign({ city }, g)));
      return `<div class="pc grid2">${list.length ? list.map((g, k) => `<div class="tile" role="img" aria-label="${t('s_' + (C().regularStage(g.visits) || 'recognized'))}"><img alt="" data-reg="${k}"><span class="num">${HSC.num ? HSC.num(g.visits | 0) : g.visits}</span><bdi>${HSC.cityName ? HSC.cityName(g.city) : g.city}</bdi></div>`).join('') : `<div class="tile off">${I('regulars')}</div>`}</div>`;
    },
    cab(body) {
      const m = body.core.mastery, tile = (ic, key, v) => `<div class="tile${v ? '' : ' off'}" role="img" aria-label="${key}">${I(ic)}<span class="med">${[1, 2, 3].map((x) => STAR(x <= v)).join('')}</span></div>`;
      return `<div class="pc grid2">${MODES.map((k) => tile({ requests: 'orders', fix: 'rescue', beard: 'beards', relax: 'relax', rush: 'rush', daily: 'daily' }[k], t({ requests: 'orders', fix: 'rescue', beard: 'beards', relax: 'relax', rush: 'rush', daily: 'daily' }[k]), m.mode[k] | 0)).join('')}</div>
        <div class="pc grid2">${TOOLS.map((k) => tile('freestyle', k, m.tool[k] | 0)).join('')}</div>
        <div class="pc grid2">${SERVICES.map((k) => tile('relax', k, m.service[k] | 0)).join('')}</div>`;
    },
    fav(body) {
      const p = port(body), last = CR().lastCard && CR().lastCard();
      const saved = last && p.cards.some((c) => c.src === last.src);
      return `<div class="acts">${last && !saved ? `<button class="j c-pink save" type="button">${I('gift')}<span class="hsc-lbl" data-k="p_save">${t('p_save')}</span></button>` : ''}<span class="num" style="align-self:center;font-weight:900;color:#fff">${p.cards.length} / ${CARDS}</span></div>
        <div class="pc grid2 favs">${p.cards.length ? p.cards.map((c) => `<button class="tile card${this.replacing ? ' pick' : ''}" type="button" data-card="${c.id}" aria-label="${t('p_favourites')}"><div class="pair"><img alt="" data-side="b"><img alt="" data-side="a"></div><span class="med">${[1, 2, 3].map((x) => STAR(x <= c.q)).join('')}</span></button>`).join('') : `<div class="tile off">${I('gift')}</div>`}</div>`;
    },
    wire(box, body) {
      const cr = CR(), p = port(body);
      const book = box.querySelector('.book');
      if (book) book.addEventListener('click', () => { if (HSC.collection) HSC.collection.openBook(); });
      box.querySelectorAll('[data-style]').forEach((b) => b.addEventListener('click', () => { if (!(body.core.mastery.style[b.dataset.style] > 0)) { if (HSC.nope) HSC.nope(b); return; } const r = HSC.practise && HSC.practise(b.dataset.style); if (r === 'now' && HSC.menu) HSC.menu.close(); }));
      // portraits only for what is on screen
      const regs = Object.values(body.regs || {}).flat();
      box.querySelectorAll('img[data-reg]').forEach((img) => { const g = regs[+img.dataset.reg]; const h = g && HSC.gridUnpack(g.h, 5); if (h && HSC.portrait) requestAnimationFrame(() => { const u = HSC.portrait(g.person, h, HSC.gridUnpack(g.b, HSC.BEARD_MM.length - 1), 96, 96); if (u) img.src = u; }); });
      box.querySelectorAll('[data-card]').forEach((b) => {
        const c = p.cards.find((x) => x.id === b.dataset.card);
        b.querySelectorAll('img').forEach((img) => { const gr = cardGrids(c, img.dataset.side); if (gr.hair && HSC.portrait) requestAnimationFrame(() => { const u = HSC.portrait(c.person, gr.hair, gr.beard, 120, 120); if (u) img.src = u; }); });
        b.addEventListener('click', async () => {
          if (!this.replacing) return;
          const ok = await cr.saveCard(c.id);
          this.replacing = false;
          if (!ok && HSC.nope) HSC.nope(b);
          this.render();
        });
      });
      const sv = box.querySelector('.save');
      if (sv) sv.addEventListener('click', async () => {
        if (p.cards.length >= CARDS) { this.replacing = true; this.render(); return; } // choose the exact card to replace
        const ok = await cr.saveCard(null);
        if (!ok && HSC.nope) HSC.nope(sv); else if (HSC.fx) HSC.fx.play('coin');
        this.render();
      });
    },
  };
  HSC.portfolio = { EDITION, CARDS, CARD_MAX, CARDS_MAX, sets, earned, settle, goals, recipe, withCard, validCard, port, encode, decode, cardGrids, render: () => ui.render(), build: () => ui.build(), open: () => { ui.tab = 'over'; ui.build(); HSC.menu.view('port'); } };
})(globalThis.HSC || (globalThis.HSC = {}));
