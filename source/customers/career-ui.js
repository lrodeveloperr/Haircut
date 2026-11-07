// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the career's city choice (docs/CAREER-MAP-LOGIC.md).
//
//   card    the Career card says where the career stands, or that a city must be chosen
//   map     appears only when Career needs a city: the founding city, then the next city after the licence and after
//           every chapter (a city already done this tour is a practice visit). No city is ranked or shows income,
//           difficulty or a reward multiplier. The first customer loads at once after a choice.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const K = '#10223f';
  const t = (k) => (HSC.t ? HSC.t(k) : k);
  const I = (n, s) => (HSC.icon ? HSC.icon(n, s) : '');
  const CR = () => (HSC.careerRun && HSC.careerRun.ready() ? HSC.careerRun : null);
  const FLAG = { tokyo: '🇯🇵', seoul: '🇰🇷', jakarta: '🇮🇩', manila: '🇵🇭', mumbai: '🇮🇳', karachi: '🇵🇰', istanbul: '🇹🇷', cairo: '🇪🇬', lagos: '🇳🇬', kingston: '🇯🇲', nairobi: '🇰🇪', london: '🇬🇧', berlin: '🇩🇪', madrid: '🇪🇸', 'mexico-city': '🇲🇽', 'sao-paulo': '🇧🇷', 'new-york': '🇺🇸', auckland: '🇳🇿' };
  const CSS = `
#hsc-menu .map{grid-template-rows:48px minmax(0,1fr)}
#hsc-menu .cities{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:minmax(84px,1fr);gap:9px;min-height:0;overflow-y:auto;padding:4px 2px 12px}
#hsc-menu .city{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 4px;border-radius:16px}
#hsc-menu .city .fl{font-size:40px;line-height:1.1}
#hsc-menu .city.done{background:linear-gradient(#e6fbdf,#c9f0bd)}
#hsc-menu .city .tk{position:absolute;right:7px;top:5px;color:#2f9e44;font-size:20px}
#hsc-menu .city .hsc-lbl{font-size:14px;width:100%;white-space:normal;line-height:1.1}
#hsc-menu .upd{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:14px;padding:28px 18px;border-radius:22px;background:linear-gradient(#fff,#e4f3ff);border:3px solid ${K};color:${K};font-weight:900;font-size:20px;text-align:center}
#hsc-menu .upd p{margin:0;max-width:30ch;line-height:1.3}
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
      page.innerHTML = `<div class="mhead"><button class="j c-white back" type="button" aria-label="Back">${I('back')}</button><div class="title">${I('map')}<span class="hsc-lbl" data-k="map"></span></div></div><div class="cities hsc-same"></div>`;
      m.appendChild(page);
      page.querySelector('.back').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('back'); HSC.menu.view('home', true); });
      return true;
    },
    render(v) {
      if (!this.build()) return;
      const cr = CR(), m = document.getElementById('hsc-menu');
      if (v === 'map' && HSC.careerRun && HSC.careerRun.tooNew()) { this.update(m.querySelector('.page.map')); return; }
      if (!cr) return;
      const body = cr.body(), need = cr.needsChoice(), pos = body && !need ? HSC.career.position(body.core) : null;
      const sub = m.querySelector('.hero .sub');
      if (sub) sub.textContent = need ? t('choose_city') : pos ? (HSC.cityName ? HSC.cityName(pos.city) : pos.city) + ' · ' + (pos.slot + 1) + '/5' : '';
      if (v === 'map') this.map(m.querySelector('.page.map'), body);
    },
    // a career saved by a newer version: nothing is shown or written, only the way forward
    update(page) {
      page.querySelector('.title').innerHTML = `${I('map')}<span class="hsc-lbl" data-k="career">${t('career')}</span>`;
      page.querySelector('.cities').innerHTML = `<div class="upd" role="status">${I('lock', 72)}<p data-k="update_needed">${t('update_needed')}</p></div>`;
    },
    map(page, body) {
      const C = HSC.career, grid = page.querySelector('.cities'), cr = CR();
      const need = cr ? cr.needsChoice() : null, core = body && body.core, tour = core && core.tour;
      page.querySelector('.title').innerHTML = `${I('map')}<span class="hsc-lbl" data-k="${need === 'found' ? 'pick_city' : 'next_city'}">${t(need === 'found' ? 'pick_city' : 'next_city')}</span>`;
      const name = (id) => (HSC.cityName ? HSC.cityName(id) : id);
      let coll;
      try { coll = new Intl.Collator(HSC.langTag ? HSC.langTag() : 'en'); } catch (e) { coll = new Intl.Collator('en'); }
      const ids = C.enabledIds().sort((a, b) => coll.compare(name(a), name(b)));
      const sel = need === 'map' ? new Set(C.selectable(core)) : null;
      grid.innerHTML = ids.map((id) => {
        const done = !!(tour && tour.done.includes(id));
        const pick = need === 'found' || (need === 'map' && sel.has(id) && !done);
        return `<button class="j city c-white${done ? ' done' : ''}${pick ? ' pick' : ''}" type="button" data-c="${id}">
          <span class="fl" aria-hidden="true">${FLAG[id] || ''}</span><span class="hsc-lbl"><bdi>${name(id)}</bdi></span>${done ? '<b class="tk">✓</b>' : ''}
        </button>`;
      }).join('');
      grid.querySelectorAll('.city').forEach((b) => b.addEventListener('click', async () => {
        const r = CR(), id = b.dataset.c, want = r && r.needsChoice();
        if (!want) { if (HSC.nope) HSC.nope(b); return; }
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
