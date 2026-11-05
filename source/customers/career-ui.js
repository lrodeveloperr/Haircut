// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the career on the home screen (docs/CAREER-MAP-LOGIC.md sections 3,
// 7 and 13; CAREER-MODE-ARCHITECTURE.md "Map principles"; owner-approved 5 November 2026).
//
//   strip   under the top bar: the barber's rank (one word, a number for Legend), the current chapter as five
//           role dots (local order, specialist, regular, surprise, showcase; done, current, to come), and a
//           Map button
//   map     every city as an equal tile: this tour's visit (done, in progress, to visit), its best showcase
//           stars, an established branch and the regulars kept there; no city is ranked or shows a reward
//           multiplier. Tapping a city the tour still needs chooses the next chapter there.
// Text is one word per label (labels.js); state is shown by shape and icon as well as colour.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const K = '#10223f';
  const t = (k) => (HSC.t ? HSC.t(k) : k);
  const I = (n, s) => (HSC.icon ? HSC.icon(n, s) : '');
  const CR = () => (HSC.careerRun && HSC.careerRun.ready() ? HSC.careerRun : null);
  const ROLE_ICON = ['orders', 'modes', 'regulars', 'gift', 'medal'];
  const STAR = (on) => `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc21a' : 'none'}" stroke="${on ? K : '#9fb0c4'}" stroke-width="2.4" stroke-linejoin="round"${on ? '' : ' stroke-dasharray="2.6 2.2"'}/></svg>`;
  const TICK = `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CSS = `
#hsc-menu .career{display:flex;align-items:center;gap:8px;min-width:0;height:56px}
#hsc-menu .career:empty{display:none}
#hsc-menu .career .rank{box-sizing:border-box;display:flex;align-items:center;gap:6px;height:48px;padding:0 14px 0 6px;border-radius:24px;background:#10223fcc;border:2px solid #ffffff30;color:#fff;font-weight:900;flex:0 1 auto;min-width:0;max-width:36%}
#hsc-menu .career .rank .hsc-lbl{flex:1;min-width:0}
#hsc-menu .career .rank .hsc-ic{width:36px;height:36px}
#hsc-menu .career .rank .hsc-lbl{font-size:17px}
#hsc-menu .career .dots{flex:1 1 0;display:flex;align-items:center;justify-content:center;gap:4px;min-width:0}
#hsc-menu .career .dot{position:relative;flex:0 1 44px;aspect-ratio:1;max-width:44px;min-width:22px;border-radius:50%;background:#ffffffd0;border:3px solid ${K};display:flex;align-items:center;justify-content:center;box-sizing:border-box}
#hsc-menu .career .dot .hsc-ic{width:70%;height:70%}
#hsc-menu .career .dot.done{background:linear-gradient(#9cf06c,#36b83a)}
#hsc-menu .career .dot.done .hsc-ic{opacity:.35}
#hsc-menu .career .dot .ok{position:absolute;right:-5px;bottom:-5px;width:20px;height:20px;border-radius:50%;background:#36b83a;border:2px solid ${K};display:flex;align-items:center;justify-content:center;font-size:12px}
#hsc-menu .career .dot.now{background:linear-gradient(#ffe682,#ffb21a);box-shadow:0 0 0 3px #fff;animation:hsc-dotnow 1.4s ease-in-out infinite}
@keyframes hsc-dotnow{50%{transform:scale(1.1)}}
#hsc-menu .career .mapb{flex:none;display:flex;align-items:center;justify-content:center;gap:6px;height:48px;min-width:48px;padding:0 14px 0 8px;border-radius:24px;max-width:30%}
/* a narrow phone: the map button keeps its icon only (the word shows wherever there is room) */
@media (max-width:519px){#hsc-menu .career .mapb{padding:0;width:52px}#hsc-menu .career .mapb .hsc-lbl{display:none}}
#hsc-menu .career .mapb .hsc-ic{width:32px;height:32px}
#hsc-menu .career .mapb .hsc-lbl{font-size:16px}
#hsc-menu .map{grid-template-rows:48px minmax(0,1fr)}
#hsc-menu .map .tourb{margin-inline-start:auto;display:flex;align-items:center;gap:6px;height:44px;padding:0 14px;border-radius:22px;background:#10223fcc;border:2px solid #ffffff30;color:#fff;font-weight:900;font-size:18px;white-space:nowrap}
#hsc-menu .cities{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));grid-auto-rows:minmax(150px,auto);gap:12px;min-height:0;overflow-y:auto;padding:4px 2px 10px;align-content:start}
#hsc-menu .city{display:grid;grid-template-rows:auto minmax(0,1fr) auto auto;justify-items:center;align-items:center;row-gap:6px;padding:12px 10px 14px}
#hsc-menu .city .hsc-lbl{font-size:18px;width:100%}
#hsc-menu .city .state{width:64px;height:64px;border-radius:50%;border:3px solid ${K};display:flex;align-items:center;justify-content:center;background:#fff}
#hsc-menu .city .state .hsc-ic{width:44px;height:44px}
#hsc-menu .city.done .state{background:linear-gradient(#9cf06c,#36b83a);font-size:34px}
#hsc-menu .city.now .state{background:linear-gradient(#ffe682,#ffb21a)}
#hsc-menu .city .cstars{display:flex;gap:2px;font-size:20px}
#hsc-menu .city .facts{display:flex;align-items:center;gap:10px;font-weight:900;font-size:16px;font-variant-numeric:tabular-nums}
#hsc-menu .city .facts .hsc-ic{width:26px;height:26px}
#hsc-menu .city .facts span{display:flex;align-items:center;gap:3px}
@media (prefers-reduced-motion:reduce){#hsc-menu .career .dot.now{animation:none}}
body.hsc-calm #hsc-menu .career .dot.now{animation:none}
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
      return true;
    },
    render(v) {
      if (!this.build()) return;
      const cr = CR(), m = document.getElementById('hsc-menu'), strip = m.querySelector('.career');
      if (!cr || !strip) { if (strip) strip.innerHTML = ''; return; }
      const body = cr.body();
      // the strip: rank, the five chapter roles, the map
      const rk = cr.rank() || { id: 'apprentice' };
      const pos = body ? HSC.career.position(body.core) : null;
      const slot = pos ? pos.slot : 0;
      strip.innerHTML = `<div class="rank">${I('medal')}<span class="hsc-lbl">${t('r_' + rk.id)}${rk.legend ? ' ' + rk.legend : ''}</span></div>
        <div class="dots" aria-hidden="true">${ROLE_ICON.map((ic, i) => `<span class="dot${i < slot ? ' done' : i === slot && pos ? ' now' : ''}">${I(ic)}${i < slot ? `<span class="ok">${TICK}</span>` : ''}</span>`).join('')}</div>
        <button class="j c-blue mapb" type="button" aria-label="Map">${I('map')}<span class="hsc-lbl" data-k="map">${t('map')}</span></button>`;
      strip.querySelector('.mapb').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('swish'); HSC.menu.view('map'); });
      if (v === 'map') this.map(m.querySelector('.page.map'), body);
    },
    map(page, body) {
      const C = HSC.career, grid = page.querySelector('.cities');
      const tour = body && body.core.tour;
      page.querySelector('.tourb').innerHTML = tour ? `${I('rush', 26)}<bdi>${t('tour')} ${tour.n}</bdi>` : `${I('medal', 26)}<bdi>${t('r_apprentice')}</bdi>`;
      const ids = C.enabledIds(), cur = body && body.core.current && body.core.current.city;
      grid.innerHTML = ids.map((id) => {
        const c = (body && body.core.cities[id]) || {}, rec = C.city(id) || {};
        const done = !!(tour && tour.done.includes(id)), now = cur === id;
        const regs = ((body && body.regs[id]) || []).length;
        const name = rec.name || (id === 'home' ? t('home') : id);
        return `<button class="j city c-white${done ? ' done' : ''}${now ? ' now' : ''}" type="button" data-c="${id}">
          <span class="hsc-lbl">${name}</span>
          <span class="state">${done ? TICK : now ? I('play') : I('home')}</span>
          <span class="cstars">${[1, 2, 3].map((x) => STAR(x <= (c.showcaseBest || 0))).join('')}</span>
          <span class="facts"><span>${I('salon')}${c.established ? '1' : '0'}</span><span>${I('regulars')}${regs}</span></span>
        </button>`;
      }).join('');
      grid.querySelectorAll('.city').forEach((b) => b.addEventListener('click', async () => {
        const body2 = CR() && CR().body();
        if (!body2 || HSC.career.phase(body2.core) !== 'map') { if (HSC.nope) HSC.nope(b); return; }
        CR().chooseCity(b.dataset.c);
        HSC.menu.close();
        await HSC.modes.set('career');
      }));
    },
  };
  HSC.careerUI = { render: (v) => ui.render(v) };
})(globalThis.HSC || (globalThis.HSC = {}));
