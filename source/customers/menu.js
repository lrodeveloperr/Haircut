// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner request 5 November 2026): one menu instead of a row of buttons.
// The cutting screen keeps the game's own controls (sound, guards, clipper, finish) and shows only the menu button
// and the coins. The menu holds the wardrobe, the goals (level, calendar, tasks) and the salon as large picture
// tiles, each with its own red dot; the menu button shows a dot when any of them has one. The buttons are the
// features' own buttons, moved into the menu, so each feature keeps working exactly as before.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#2a1d15';
  const IDS = ['.hsc-rw', '#hsc-goals-btn', '#hsc-salon-btn'];
  const MENU = `<svg viewBox="0 0 24 24" width="26" height="26"><rect x="3.5" y="3.5" width="7" height="7" rx="2" fill="#ffb627" stroke="${INK}" stroke-width="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2" fill="#fff6e6" stroke="${INK}" stroke-width="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2" fill="#fff6e6" stroke="${INK}" stroke-width="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2" fill="#ffb627" stroke="${INK}" stroke-width="2"/></svg>`;
  const CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const CSS = `
#hsc-menu-btn{padding:0}
#hsc-menu{position:fixed;inset:0;z-index:29;display:none;background:#2a1d1580;pointer-events:auto;touch-action:manipulation}
#hsc-menu.open{display:flex;align-items:flex-start;justify-content:flex-start}
#hsc-menu .card{position:absolute;display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:26px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 5px 0 ${INK};animation:hsc-menuin .18s ease-out}
@keyframes hsc-menuin{from{opacity:0;transform:translateY(-8px) scale(.97)}}
#hsc-menu .top{display:flex;justify-content:flex-end}
#hsc-menu .x{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer;color:${INK};padding:0}
#hsc-menu .tiles{display:grid;grid-template-columns:repeat(3,96px);gap:12px}
#hsc-menu .tiles .hsc-btn{width:96px;height:96px;border-radius:24px;box-shadow:0 4px 0 ${INK};background:radial-gradient(circle at 50% 35%,#fff,#ffe9b8)}
#hsc-menu .tiles .hsc-btn svg{width:52px!important;height:52px!important}
#hsc-menu .tiles .hsc-btn .hsc-dot{right:-6px;top:-6px;width:20px;height:20px}
@media (prefers-reduced-motion:reduce){#hsc-menu .card{animation:none}}
body.hsc-reveal #hsc-menu-btn{visibility:hidden}
`;
  const ui = {
    el: {}, moved: new Set(),
    build(row) {
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const b = document.createElement('button');
      b.className = 'hsc-btn'; b.id = 'hsc-menu-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Menu');
      b.innerHTML = MENU + '<span class="hsc-dot" hidden></span>';
      b.addEventListener('click', () => this.open());
      row.insertBefore(b, row.firstChild);
      // the menu lives inside the HUD (the features look for their buttons there)
      const m = document.createElement('div'); m.id = 'hsc-menu';
      m.innerHTML = `<div class="card" role="dialog" aria-label="Menu"><div class="top"><button class="x" type="button" aria-label="Close">${CLOSE}</button></div><div class="tiles"></div></div>`;
      document.getElementById('hsc-hud').appendChild(m);
      m.querySelector('.x').addEventListener('click', () => this.close());
      m.addEventListener('click', (e) => { if (e.target === m) this.close(); else if (e.target.closest('.tiles .hsc-btn')) this.close(); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && m.classList.contains('open')) { e.preventDefault(); this.close(); } });
      Object.assign(this.el, { btn: b, menu: m, tiles: m.querySelector('.tiles'), card: m.querySelector('.card'), row });
      setInterval(() => this.tick(), 250);
    },
    open() {
      const r = this.el.btn.getBoundingClientRect(), S = HSC.S || 1;
      Object.assign(this.el.card.style, { left: Math.max(8, r.left) / S + 'px', top: (r.bottom + 10) / S + 'px' });
      this.el.menu.classList.add('open');
    },
    close() { this.el.menu.classList.remove('open'); },
    tick() {
      // move each feature button into the menu as it appears (in this order)
      for (const sel of IDS) {
        const b = document.querySelector('#hsc-hud .hsc-row ' + sel);
        if (b) { this.el.tiles.appendChild(b); this.moved.add(sel); }
      }
      const order = IDS.map((s) => this.el.tiles.querySelector(s)).filter(Boolean);
      order.forEach((b, i) => { if (this.el.tiles.children[i] !== b) this.el.tiles.insertBefore(b, this.el.tiles.children[i] || null); });
      const dot = [...this.el.tiles.querySelectorAll('.hsc-dot')].some((d) => !d.hidden);
      this.el.btn.querySelector('.hsc-dot').hidden = !dot;
    },
  };
  // the features put their buttons in the HUD row; once it exists the menu takes them in
  const boot = () => { const row = document.querySelector('#hsc-hud .hsc-row'); if (row && document.getElementById('hsc-hud')) ui.build(row); else setTimeout(boot, 200); };
  boot();
  HSC.menu = { open: () => ui.open(), close: () => ui.close() };
})(globalThis.HSC || (globalThis.HSC = {}));
