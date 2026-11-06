// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the career on the home screen (docs/CAREER-MAP-LOGIC.md sections 3,
// 7 and 13; CAREER-MODE-ARCHITECTURE.md "Map principles"; owner-approved 5 November 2026).
//
//   card    on the Career card: the city and the chapter step, a replace button and the map
//   map     every city as an equal tile, in alphabetical order of its name in the player's language: this tour's
//           visit (done, in progress, to visit), its best showcase stars, an established branch and the regulars
//           kept there; no city is ranked or shows income, difficulty or a reward multiplier.
//           Choosing: a new career (or one from the one-city build) first picks its founding city here; after the
//           licence and after every chapter the player picks the next city (a city already done this tour is a
//           practice visit). The first customer loads at once after a choice.
// Text is one word per label (labels.js); state is shown by shape and icon as well as colour.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const K = '#10223f';
  const t = (k) => (HSC.t ? HSC.t(k) : k);
  const I = (n, s) => (HSC.icon ? HSC.icon(n, s) : '');
  const CR = () => (HSC.careerRun && HSC.careerRun.ready() ? HSC.careerRun : null);
    const STAR = (on) => `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc21a' : 'none'}" stroke="${on ? K : '#9fb0c4'}" stroke-width="2.4" stroke-linejoin="round"${on ? '' : ' stroke-dasharray="2.6 2.2"'}/></svg>`;
  const TICK = `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CSS = `
#hsc-menu .career{position:absolute;inset-inline-end:6px;top:6px;bottom:12px;display:flex;flex-direction:column;justify-content:center;gap:6px}
#hsc-menu .hero{padding-inline-end:46px}
#hsc-menu .career:empty{display:none}
#hsc-menu .career button{width:36px;height:36px;border:0;border-radius:12px;background:#ffffffd9;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer}
#hsc-menu .career button .hsc-ic{width:26px;height:26px}
#hsc-menu .map{grid-template-rows:48px minmax(0,1fr)}
#hsc-menu .map .tourb{margin-inline-start:auto;display:flex;align-items:center;gap:6px;height:44px;padding:0 14px;border-radius:22px;background:#10223fcc;border:2px solid #ffffff30;color:#fff;font-weight:900;font-size:18px;white-space:nowrap}
#hsc-menu .cities{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));grid-auto-rows:auto;gap:12px;min-height:0;overflow-y:auto;padding:4px 2px 10px;align-content:start}
#hsc-menu .city{display:grid;grid-template-rows:auto auto auto auto;justify-items:center;align-items:center;row-gap:6px;padding:12px 8px 14px}
#hsc-menu .city .hsc-lbl{font-size:18px;width:100%;white-space:normal;line-height:1.1;min-height:2.2em;display:flex;align-items:center;justify-content:center;overflow-wrap:anywhere}
#hsc-menu .map .tourb[hidden]{display:none}
#hsc-menu .branch{grid-template-rows:48px minmax(0,1fr)}
#hsc-menu .branch .bbody{min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:4px 2px 12px}
#hsc-menu .branch .bcard{box-sizing:border-box;border-radius:22px;border:3px solid ${K};background:linear-gradient(#fff,#e4f3ff);padding:12px 14px;color:${K};font-weight:900}
#hsc-menu .branch .top2{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
#hsc-menu .branch .badge2{padding:4px 12px;border-radius:14px;background:${K};color:#ffe682;font-size:16px}
#hsc-menu .branch .cstars{display:flex;gap:2px;font-size:24px}
#hsc-menu .branch .fact{display:flex;align-items:center;gap:4px;font-size:18px;font-variant-numeric:tabular-nums}
#hsc-menu .branch .fact .hsc-ic{width:30px;height:30px}
#hsc-menu .branch .mrow{display:grid;grid-template-columns:34px minmax(0,1fr) minmax(0,1.2fr);align-items:center;gap:8px;font-size:16px;margin:4px 0}
#hsc-menu .branch .mrow .hsc-ic{width:32px;height:32px}
#hsc-menu .branch .mrow .w{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#hsc-menu .branch .bm{display:block;box-sizing:border-box;width:100%;height:16px;border-radius:8px;background:#10223f22;overflow:hidden;border:2px solid ${K}}
#hsc-menu .branch .bm i{display:block;height:100%;background:linear-gradient(#b5ff7a,#46c43a)}
#hsc-menu .branch .faces{display:flex;flex-wrap:wrap;gap:10px}
#hsc-menu .branch .face{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:16px}
#hsc-menu .branch .face img{width:72px;height:72px;border-radius:14px;border:3px solid ${K};background:radial-gradient(circle at 50% 35%,#fff,#e4d2b4)}
#hsc-menu .branch .acts{display:flex;gap:12px;flex-wrap:wrap}
#hsc-menu .branch .acts .j{display:flex;align-items:center;gap:8px;height:56px;padding:0 18px 0 10px;font-size:18px;font-weight:900}
#hsc-menu .branch .acts .hsc-ic{width:36px;height:36px}
#hsc-menu .branch .by{font-size:13px;font-weight:800;color:#fff;text-align:center}
#hsc-menu .branch .pips{display:flex;gap:3px}
#hsc-menu .branch .pips i{width:11px;height:11px;border-radius:50%;border:2px solid ${K};background:#fff}
#hsc-menu .branch .pips i.on{background:#36b83a}
#hsc-menu .upd{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:14px;padding:28px 18px;border-radius:22px;background:linear-gradient(#fff,#e4f3ff);border:3px solid ${K};color:${K};font-weight:900;font-size:20px;text-align:center}
#hsc-menu .upd p{margin:0;max-width:30ch;line-height:1.3}
#hsc-menu .city.pick .state{background:linear-gradient(#a8e4ff,#3aa2f2)}
#hsc-menu .city.off{opacity:.55}
#hsc-menu .city .base{position:absolute;left:8px;top:8px;width:30px;height:30px}
#hsc-menu .city .state{width:56px;height:56px;border-radius:50%;border:3px solid ${K};display:flex;align-items:center;justify-content:center;background:#fff}
#hsc-menu .city .state .hsc-ic{width:38px;height:38px}
#hsc-menu .city.done .state{background:linear-gradient(#9cf06c,#36b83a);font-size:34px}
#hsc-menu .city.now .state{background:linear-gradient(#ffe682,#ffb21a)}
#hsc-menu .city .cstars{display:flex;gap:2px;font-size:20px}
#hsc-menu .city .facts{display:flex;align-items:center;gap:10px;font-weight:900;font-size:16px;font-variant-numeric:tabular-nums}
#hsc-menu .city .facts .hsc-ic{width:26px;height:26px}
#hsc-menu .city .facts span{display:flex;align-items:center;gap:3px}
`;
  const ui = {
    built: false,
    build() {
      const m = document.getElementById('hsc-menu');
      if (this.built || !m) return !!this.built;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const page = document.createElement('div');
      page.className = 'page map'; page.hidden = true; page.setAttribute('role', 'dialog'); page.setAttribute('aria-label', 'Map');
      page.innerHTML = `<div class="mhead"><button class="j c-white back" type="button" aria-label="Back">${I('back')}</button><div class="title">${I('map')}<span class="hsc-lbl" data-k="map"></span></div><div class="tourb"></div></div><div class="cities hsc-same"></div>`;
      m.appendChild(page);
      page.querySelector('.back').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('back'); HSC.menu.view('home', true); });
      // one branch: its state, showcase record, four-part mastery, regulars, and its salon and base actions
      const br = document.createElement('div');
      br.className = 'page branch'; br.hidden = true; br.setAttribute('role', 'dialog');
      br.innerHTML = `<div class="mhead"><button class="j c-white back" type="button" aria-label="Back">${I('back')}</button><div class="title">${I('salon')}<span class="hsc-lbl"></span></div></div><div class="bbody"></div>`;
      m.appendChild(br);
      if (HSC.portfolio && HSC.portfolio.build) HSC.portfolio.build();
      br.querySelector('.back').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('back'); HSC.menu.view('map', true); });
      return true;
    },
    render(v) {
      if (!this.build()) return;
      const cr = CR(), m = document.getElementById('hsc-menu'), strip = m.querySelector('.career');
      if (v === 'map' && HSC.careerRun && HSC.careerRun.tooNew()) { this.update(m.querySelector('.page.map')); return; }
      if (!cr || !strip) { if (strip) strip.innerHTML = ''; return; }
      const body = cr.body();
      const pos = body && !cr.needsChoice() ? HSC.career.position(body.core) : null;
      const slot = pos ? pos.slot : 0;
      // the Career card carries where the career stands, and two small controls: replace an untouched offer, the map
      const need = cr.needsChoice(), sub = m.querySelector('.hero .sub');
      if (sub) sub.textContent = pos && !need && pos.city !== HSC.career.UNSET ? (HSC.cityName ? HSC.cityName(pos.city) : pos.city) + ' · ' + (slot + 1) + '/5' : '';
      strip.innerHTML = `${cr.canReplace() && !need ? `<button class="repl" type="button" aria-label="${t('a_replace')}">${I('swap')}</button>` : ''}<button class="mapb" type="button" aria-label="${t('map')}">${I('map')}</button>`;
      strip.querySelector('.mapb').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('swish'); HSC.menu.view('map'); });
      // replace the offered contract (no work on it yet): another customer for the same slot, no penalty
      const rb = strip.querySelector('.repl');
      if (rb) rb.addEventListener('click', async () => {
        rb.disabled = true;
        const g = globalThis.skinFadeStudio, s = g && g.getState(), a = cr.active(), inChair = !!(a && s && a.job === s.jobId && HSC.modes.current() === 'career');
        const ok = await cr.replace();
        if (!ok) { rb.disabled = false; if (HSC.nope) HSC.nope(rb); return; }
        if (HSC.fx) HSC.fx.play('swish');
        if (inChair && HSC.modes.newCustomer) await HSC.modes.newCustomer();
        this.render(v);
      });
      if (v === 'map') this.map(m.querySelector('.page.map'), body);
      if (v === 'branch') this.branch(m.querySelector('.page.branch'), body);
      if (v === 'port' && HSC.portfolio) HSC.portfolio.render();
    },
    branch(page, body) {
      const C = HSC.career, id = this.city, cr = CR();
      if (!body || !id || !body.core.cities[id]) { HSC.menu.view('map', true); return; }
      const core = body.core, c = core.cities[id], name = HSC.cityName ? HSC.cityName(id) : id;
      const state = C.branchState(core, id), m = C.cityMastery(core, id);
      page.setAttribute('aria-label', name);
      page.querySelector('.title .hsc-lbl').innerHTML = `<bdi>${name}</bdi>`;
      const n = (x) => (HSC.num ? HSC.num(x) : x);
      const row = (ic, key, v) => `<div class="mrow" role="img" aria-label="${t(key)} ${Math.round(v * 100)}%">${I(ic)}<span class="w">${t(key)}</span><span class="bm"><i style="width:${Math.round(v * 100)}%"></i></span></div>`;
      const regs = (body.regs[id] || []).slice().sort((a, b) => (b.visits | 0) - (a.visits | 0));
      const canBase = !C.setBase(core, id).error && core.base !== id;
      // fit-outs: four equal stages in every branch; the founding salon is the shop itself
      const brec = (body.branches || {})[id], curve = HSC.economy.CONFIG.salon, fit = brec ? brec.fit | 0 : 0, fitNext = brec && id !== core.founding && fit < curve.length ? curve[fit] : null;
      const by = HSC.sponsor && HSC.sponsor.line(id);
      page.querySelector('.bbody').innerHTML = `
        <div class="bcard top2"><span class="badge2">${t('st_' + (state === 'visiting' || state === 'unvisited' ? 'established' : state))}</span>
          <span class="cstars" aria-hidden="true">${[1, 2, 3].map((x) => STAR(x <= (c.showcaseBest || 0))).join('')}</span>
          <span class="fact">${I('orders')}${n(c.chapters | 0)}</span>${core.base === id ? `<span class="fact">${I('home')}</span>` : ''}</div>
        ${by ? `<div class="by">${t('presented_by')} <bdi>${by}</bdi></div>` : ''}
        <div class="bcard">${row('medal', 'm_completion', m.completion)}${row('styles', 'm_style', m.style)}${row('modes', 'm_service', m.service)}${row('regulars', 'm_relation', m.relationship)}</div>
        ${regs.length ? `<div class="bcard faces">${regs.map((g, k) => `<span class="face"><img alt="" data-r="${k}"><span>${n(g.visits | 0)}</span></span>`).join('')}</div>` : ''}
        <div class="acts"><button class="j c-orange sal" type="button">${I('salon')}<span class="hsc-lbl" data-k="salon">${t('salon')}</span></button>${fitNext != null ? `<button class="j c-yellow fit" type="button" aria-label="${t('a_fit')}">${I('coin')}<span class="num">${n(fitNext)}</span><span class="pips" aria-hidden="true">${curve.map((_, k) => `<i class="${k < fit ? 'on' : ''}"></i>`).join('')}</span></button>` : ''}${canBase ? `<button class="j c-blue bas" type="button">${I('home')}<span class="hsc-lbl" data-k="make_base">${t('make_base')}</span></button>` : ''}</div>`;
      // regulars' faces as they last left the chair
      page.querySelectorAll('.face img').forEach((img) => {
        const g = regs[+img.dataset.r], h = g && HSC.gridUnpack(g.h, 5), b = g && HSC.gridUnpack(g.b, HSC.BEARD_MM.length - 1);
        if (g && h && HSC.portrait) requestAnimationFrame(() => { const u = HSC.portrait(g.person, h, b, 96, 96); if (u) img.src = u; });
      });
      // this branch's salon: its look opens in the shop (the founding city's is the shop's own)
      page.querySelector('.sal').addEventListener('click', () => {
        if (!HSC.salon) return;
        const look = id === core.founding ? null : cr.branchLook(id);
        if (HSC.salon.setContext) HSC.salon.setContext(look);
        HSC.salon.open();
        // back on the chair, the salon on show follows the job again
        const back = () => (document.querySelector('#hsc-salon.open') ? setTimeout(back, 400) : cr.syncLook());
        setTimeout(back, 600);
      });
      const fb = page.querySelector('.fit');
      if (fb) fb.addEventListener('click', async () => {
        fb.disabled = true;
        const ok = await HSC.econ.buyFit(id);
        if (ok && HSC.fx) HSC.fx.play('coin'); else if (!ok && HSC.nope) HSC.nope(fb);
        this.render('branch');
      });
      const bb = page.querySelector('.bas');
      if (bb) bb.addEventListener('click', async () => {
        bb.disabled = true;
        const r = await cr.setBase(id);
        if (!r) { bb.disabled = false; if (HSC.nope) HSC.nope(bb); return; }
        if (HSC.fx) HSC.fx.play('swish');
        this.render('branch');
      });
    },
    // a career saved by a newer version: nothing is shown or written, only the way forward
    update(page) {
      page.querySelector('.title').innerHTML = `${I('map')}<span class="hsc-lbl" data-k="career">${t('career')}</span>`;
      page.querySelector('.tourb').hidden = true;
      page.querySelector('.cities').innerHTML = `<div class="upd" role="status">${I('lock', 72)}<p data-k="update_needed">${t('update_needed')}</p></div>`;
    },
    map(page, body) {
      const C = HSC.career, grid = page.querySelector('.cities'), cr = CR();
      const need = cr ? cr.needsChoice() : null, core = body && body.core, tour = core && core.tour;
      // the title: choosing the founding city shows Home; otherwise the map and the tour number
      page.querySelector('.title').innerHTML = need === 'found' ? `${I('home')}<span class="hsc-lbl" data-k="home">${t('home')}</span>` : `${I('map')}<span class="hsc-lbl" data-k="map">${t('map')}</span>`;
      page.querySelector('.tourb').innerHTML = tour && need !== 'found' ? `${I('rush', 26)}<bdi>${t('tour')} ${HSC.num ? HSC.num(tour.n) : tour.n}</bdi>` : '';
      page.querySelector('.tourb').hidden = !(tour && need !== 'found');
      const name = (id) => (HSC.cityName ? HSC.cityName(id) : id);
      let coll;
      try { coll = new Intl.Collator(HSC.langTag ? HSC.langTag() : 'en'); } catch (e) { coll = new Intl.Collator('en'); }
      const ids = C.enabledIds().sort((a, b) => coll.compare(name(a), name(b)));
      const cur = core && core.current && core.current.city, sel = need === 'map' ? new Set(C.selectable(core)) : null;
      grid.innerHTML = ids.map((id) => {
        const c = (core && core.cities[id]) || {};
        const done = !!(tour && tour.done.includes(id)), now = !need && cur === id;
        const pick = need === 'found' || (need === 'map' && sel.has(id) && !done);
        const off = !need && !now;
        const regs = ((body && body.regs[id]) || []).length;
        const home = need !== 'found' && core && core.base === id;
        return `<button class="j city c-white${done ? ' done' : ''}${now ? ' now' : ''}${pick ? ' pick' : ''}${off ? ' off' : ''}" type="button" data-c="${id}">
          ${home ? `<span class="base">${I('home')}</span>` : ''}
          <span class="hsc-lbl"><bdi>${name(id)}</bdi></span>
          <span class="state">${done ? TICK : now ? I('play') : I('salon')}</span>
          <span class="cstars">${[1, 2, 3].map((x) => STAR(x <= (c.showcaseBest || 0))).join('')}</span>
          <span class="facts"><span>${I('salon')}${c.established ? '1' : '0'}</span><span>${I('regulars')}${regs}</span></span>
        </button>`;
      }).join('');
      // the map opens on the active base (or the city being played)
      const focus = grid.querySelector(`.city[data-c="${(cur && !need) ? cur : core && core.base}"]`);
      if (focus) requestAnimationFrame(() => { try { focus.scrollIntoView({ block: 'center' }); } catch (e) {} });
      grid.querySelectorAll('.city').forEach((b) => b.addEventListener('click', async () => {
        const r = CR(), id = b.dataset.c, want = r && r.needsChoice();
        // no choice to make: an established city (or the founding salon) opens its branch screen
        if (!want) {
          const c2 = r && r.body() && r.body().core.cities[id];
          if (c2 && (c2.established || id === r.body().core.founding)) { this.city = id; if (HSC.fx) HSC.fx.play('swish'); HSC.menu.view('branch'); return; }
          if (HSC.nope) HSC.nope(b); return;
        }
        b.disabled = true;
        const ok = want === 'found' ? await r.found(id) : await r.chooseCity(id);
        b.disabled = false;
        if (!ok) { if (HSC.nope) HSC.nope(b); return; }
        if (HSC.fx) HSC.fx.play('swish');
        // a founded career on the map phase (one from the one-city build) chooses its next city at once
        if (r.needsChoice()) { this.render('map'); return; }
        if (HSC.menu.play) await HSC.menu.play('career'); else { HSC.menu.close(); await HSC.modes.set('career'); }
      }));
    },
  };
  HSC.careerUI = { render: (v) => ui.render(v) };
})(globalThis.HSC || (globalThis.HSC = {}));
