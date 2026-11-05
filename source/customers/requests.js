// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved 5 November 2026): the core loop around each haircut.
//
//   request   each customer (after the first) asks for a cut: a thought bubble shows it from the side and the
//             back. The cut suits his age, hair type and hair loss, and is always shorter than what he walked
//             in with. A regular asks for his usual.
//   stars     the finished cut is scored with the engine's own match (patch18): 1 star for any cut, 2 from a
//             60% match, 3 from 85%. Never a fail.
//   tips      coins at the reveal: 10 + 5 per star, +5 for a regular, x2 for a VIP. A replay that earns more
//             stars pays the difference. Coins show in the top bar.
//   x3 tips   a rewarded video on the reveal triples that customer's tips (once per customer).
//   undo      every undo of the last stroke is a rewarded video (up to 20 strokes back).
//   smile     at the reveal the customer smiles in his own ancestry mix of MakeHuman's expression units
//             (render.js): a polite smile for 1 star, a warm one for 2, a big real smile for 3.
// No text: icons, stars and numbers only. Every video is optional.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#2a1d15';
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio;

  // ---- the cuts customers ask for (shapes the walk-in builder draws: side / blend / top hair levels, 1 = 3 mm) ----
  const STYLES = [];
  const add = (fam, side, blend, top, contour) => STYLES.push({ id: `${fam}:${side}${blend}${top}:${contour}`, fam, side, blend, top, contour, variant: 0 });
  for (const c of ['low', 'mid', 'high', 'drop', 'burst']) for (const t of [3, 4, 5]) add('skin', 0, 2, t, c);
  for (const c of ['low', 'mid', 'high', 'drop', 'taper']) for (const t of [3, 4, 5]) add('fade', 1, t === 5 ? 3 : 2, t, c);
  for (const t of [4, 5]) add('taper', 2, 3, t, 'taper');
  for (const t of [3, 4]) add('temple', 1, 2, t, 'temple');
  for (const sd of [1, 2]) add('undercut', sd, sd, 5, 'undercut');
  for (const t of [4, 5]) add('classic', 2, 3, t, 'part');
  add('crew', 2, 3, 4, 'crew');
  add('hawk', 1, 3, 5, 'hawk');
  for (const t of [1, 2, 3]) add('buzz', t, t, t, 'even');
  STYLES.push({ id: 'trim', fam: 'trim' });
  const byId = new Map(STYLES.map((s) => [s.id, s]));
  HSC.REQUEST_STYLES = STYLES;

  const grids = new Map();
  const gridOf = (style) => {
    if (!grids.has(style.id)) grids.set(style.id, HSC.walkIns.build(style));
    return grids.get(style.id);
  };
  // the target: the style, never longer than the hair he walked in with (a trim: one level shorter everywhere)
  function targetFor(style, start) {
    if (style.fam === 'trim') return start.map((v) => Math.max(1, v - 1));
    const g = gridOf(style);
    return start.map((v, i) => Math.min(v, g[i]));
  }
  // how a style suits a customer (0 = never asked for)
  function suit(style, p) {
    const age = p.years || 30, ty = (p.hair && p.hair.type) || '1b', b = p.bald || {};
    const stage = { 1: 0, 2: 1, 3: 2, '3v': 2.5, 4: 3, 5: 4, 6: 5, 7: 6 }[b.norwood] || 0;
    const heavy = stage >= 3 || b.type === 'diffuse', coily = /^(3c|4)/.test(ty), straight = /^[12]/.test(ty);
    const f = style.fam;
    if (heavy && !(f === 'buzz' || f === 'trim' || (f === 'skin' && style.top <= 3) || (f === 'fade' && style.top <= 3))) return 0;
    if ((f === 'classic' || f === 'crew') && !straight) return 0;
    if (f === 'undercut' && ty > '3a') return 0;
    if (age >= 56 && (f === 'hawk' || f === 'undercut' || (f === 'skin' && style.contour !== 'low') || style.contour === 'high')) return 0;
    let w = 1;
    if (age < 30) w *= { skin: 1.6, fade: 1.4, hawk: 1.2, undercut: 1.1, taper: 0.7, classic: 0.6, trim: 0.4 }[f] || 1;
    else if (age < 56) w *= { fade: 1.3, taper: 1.3, classic: 1.2, crew: 1.2, skin: 0.9, hawk: 0.4 }[f] || 1;
    else w *= { taper: 2, classic: 1.6, buzz: 1.5, trim: 2.2, fade: 0.8 }[f] || 1;
    if (coily) w *= { skin: 1.5, temple: 2.2, fade: 1.2, buzz: 1.2 }[f] || (f === 'temple' ? 1 : 0.9);
    else if (f === 'temple') w *= 0.15;
    if (heavy) w *= f === 'buzz' ? 3 : 1;
    if (style.contour === 'burst' && !coily) w *= 0.5;
    return w;
  }
  // enough to cut: at least about a fifth of the head shorter, and a real change on the sides or top
  function worthCutting(start, target) {
    let cells = 0, drop = 0;
    for (let i = 0; i < start.length; i++) if (target[i] < start[i]) { cells++; drop += start[i] - target[i]; }
    return cells >= 1500 && drop >= 2200;
  }

  // the request for this job: {job, style, target}; the very first customer cuts freely (the tutorial)
  const req = { job: null, style: null, target: null };
  HSC.requestFor = function (s) {
    if (!s || !s.look || !s.look.person || !Array.isArray(s.startHair)) return null;
    if (req.job === s.jobId && req.start === s.startHair) return req.style ? req : null;
    const p = s.look.person;
    Object.assign(req, { job: s.jobId, start: s.startHair, style: null, target: null });
    if (p.first || !HSC.walkIns) return null;
    const R = HSC.rng(((p.seed >>> 0) ^ Math.imul((s.jobId | 0) + 7, 0x27d4eb2d)) >>> 0 || 1);
    const usual = p.usual && byId.get(p.usual);
    let pick = null;
    if (usual && suit(usual, p) > 0 && R.next() < 0.75) { const t = targetFor(usual, s.startHair); if (worthCutting(s.startHair, t)) pick = { style: usual, target: t }; }
    if (!pick) {
      const opts = [];
      for (const st of STYLES) {
        const w = suit(st, p);
        if (!w) continue;
        const t = targetFor(st, s.startHair);
        if (worthCutting(s.startHair, t)) opts.push([w, st, t]);
      }
      let r = R.next() * opts.reduce((a, o) => a + o[0], 0);
      for (const o of opts) if ((r -= o[0]) <= 0) { pick = { style: o[1], target: o[2] }; break; }
      if (!pick && opts.length) pick = { style: opts[opts.length - 1][1], target: opts[opts.length - 1][2] };
    }
    if (!pick) return null;
    req.style = pick.style; req.target = pick.target;
    return req;
  };
  // the style a customer asked for on a job (meta.js keeps it as a regular's usual)
  HSC.requestStyleFor = (job) => (req.job === job && req.style ? req.style.id : null);

  // ---- scoring (the engine's own match, patch18) ----
  function starsFor(s) {
    if (!s || !(s.cutStrokeCount > 0)) return 0;
    const r = HSC.requestFor(s);
    if (!r || !HSC.requests || !HSC.requests.match) return 3; // free style (the first customer): always a great cut
    let w;
    try { w = G().getView().surface.weights; } catch (e) {}
    const i = HSC.requests.match(s.hair, r.target, w), a = HSC.requests.match(s.startHair, r.target, w);
    const n = a >= 0.999 ? i : Math.max(0, Math.min(1, (i - a) / (1 - a)));
    return n >= 0.85 ? 3 : n >= 0.6 ? 2 : 1;
  }
  const tipsFor = (p, stars) => (stars ? (10 + 5 * stars + (p && p.regular ? 5 : 0)) * (p && p.vip ? 2 : 1) : 0);

  // ---- coins ----
  const coins = () => (M() && M().data ? M().data.coins || 0 : 0);
  function addCoins(n) {
    const d = M() && M().data;
    if (!d || !(n > 0)) return;
    d.coins = Math.min(99999999, (d.coins || 0) + Math.round(n));
    M().save();
    ui.coinPill(true);
  }
  HSC.coins = { get: coins, add: addCoins };

  // a finished haircut: score it and pay (once per customer; a replay with more stars pays the extra stars)
  const done = HSC.onHaircutDone;
  HSC.onHaircutDone = function (state) {
    try { scoreRound(state); } catch (e) { console.error('customers: scoring failed', e); }
    return done ? done.apply(this, arguments) : undefined;
  };
  function scoreRound(s) {
    const d = M() && M().data;
    if (!d || !s) return;
    const stars = starsFor(s), p = s.look && s.look.person;
    const last = d.lastRound && d.lastRound.job === s.jobId ? d.lastRound : null;
    const tips = tipsFor(p, stars);
    if (!last) {
      d.lastRound = { job: s.jobId, stars, tips, paid: tips, tripled: false };
      addCoins(tips);
    } else if (stars > last.stars) {
      const extra = tips - last.paid;
      Object.assign(last, { stars, tips, paid: last.paid + Math.max(0, extra) });
      addCoins(Math.max(0, extra) * (last.tripled ? 3 : 1));
    }
    d.lastRound.shownStars = stars;
    ui.round = { job: s.jobId, stars };
    M().save();
  }

  // ---- the smile at the reveal ----
  // compared with photos of smiling men of each phenotype: a polite closed smile, a warm smile, a real (Duchenne)
  // smile with round cheeks, narrowed eyes, deep folds and slightly lowered brows
  const SMILE = {
    1: { smile: 0.42, widen: 0.12, cheekUp: 0.3, cheekFull: 0.05, squint: 0.15, folds: 0.3, lipsThin: 0.2 },
    2: { smile: 0.72, widen: 0.24, cheekUp: 0.65, cheekFull: 0.15, squint: 0.45, lift: 0.05, folds: 0.6, browsDown: 0.1, lipsThin: 0.45 },
    3: { smile: 1.0, widen: 0.34, cheekUp: 1.0, cheekFull: 0.25, squint: 0.75, lift: 0.08, folds: 1.0, browsDown: 0.2, lipsThin: 0.7 },
  };
  // (clearTimeout also clears intervals; the Android build maps it to its lifecycle scheduler, clearInterval it leaves alone)
  const face = { anim: null, on: false };
  function smile(p, stars) {
    if (!HSC.setExpression || !p || !SMILE[stars]) return;
    const R = HSC.rng(((p.seed >>> 0) ^ 0x51a11e) >>> 0 || 1), k = 0.85 + 0.3 * R.next();
    const amounts = {};
    for (const [u, v] of Object.entries(SMILE[stars])) amounts[u] = v * k;
    clearTimeout(face.anim);
    const t0 = performance.now();
    face.on = true;
    face.anim = setInterval(() => {
      const t = Math.min(1, (performance.now() - t0) / 650), e = t * t * (3 - 2 * t);
      HSC.setExpression(p, amounts, e);
      if (t >= 1) { clearTimeout(face.anim); face.anim = null; }
    }, 40);
  }
  function rest(p) {
    clearTimeout(face.anim); face.anim = null;
    if (face.on && p && HSC.setExpression) HSC.setExpression(p, {}, 0);
    face.on = false;
  }
  // keep frames coming while the face moves (the game draws only when something changes)
  const clipActive = HSC.clippingsActive;
  HSC.clippingsActive = () => !!face.anim || ui.flying > 0 || (clipActive ? clipActive() : false);

  // ---- undo: one rewarded video per stroke undone ----
  const undo = { job: null, stack: [], snap: null, busy: false };
  function onDown(e) {
    const g = G();
    if (!g || e.button > 0) return;
    const s = g.getState();
    if (s.status !== 'cutting') return;
    undo.snap = { job: s.jobId, hair: s.hair, beard: s.beard };
  }
  function onUp() {
    const g = G(), snap = undo.snap;
    undo.snap = null;
    if (!g || !snap) return;
    const s = g.getState();
    if (s.status !== 'cutting' || s.jobId !== snap.job) return;
    if (s.hair !== snap.hair || s.beard !== snap.beard) {
      if (undo.job !== s.jobId) { undo.job = s.jobId; undo.stack = []; }
      undo.stack.push({ hair: snap.hair, beard: snap.beard });
      if (undo.stack.length > 20) undo.stack.shift();
      ui.undoButton();
    }
  }
  async function doUndo() {
    const g = G();
    if (!g || undo.busy || !undo.stack.length) return;
    const job = g.getState().jobId;
    undo.busy = true;
    ui.el.undo.disabled = true;
    try {
      const ok = HSC.watchVideo ? await HSC.watchVideo('undo') : false;
      const s = g.getState();
      if (ok && s.status === 'cutting' && s.jobId === job && undo.job === job && undo.stack.length) {
        const prev = undo.stack.pop();
        // the game can stay paused for a moment after the video: retry until it takes the restore
        let back = false;
        for (let k = 0; k < 40 && !back; k++) { back = g.restore ? await g.restore(prev.hair, prev.beard) : false; if (!back) await new Promise((r) => setTimeout(r, 150)); }
        if (!back) undo.stack.push(prev);
      } else if (!ok) HSC.nope && HSC.nope(ui.el.undo);
    } finally {
      undo.busy = false;
      ui.el.undo.disabled = false;
      ui.undoButton();
    }
  }

  // ---- x3 tips ----
  async function triple() {
    const d = M() && M().data, b = ui.el.x3;
    const last = d && d.lastRound;
    if (!last || last.tripled || !last.paid || b.disabled) return;
    b.disabled = true;
    const ok = HSC.watchVideo ? await HSC.watchVideo('triple-tips') : false;
    if (ok && d.lastRound === last && !last.tripled) {
      last.tripled = true;
      addCoins(last.paid * 2);
      ui.coinBurst(last.paid * 2, b);
    } else if (!ok) { HSC.nope && HSC.nope(b); b.disabled = false; }
    ui.scoreView();
  }

  // ---- UI ----
  const STAR = (on) => `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc83d' : '#e9dcc4'}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg>`;
  const COIN = (s = 26) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><circle cx="12" cy="12" r="9.5" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a12" stroke-width="1.8"/><path d="M10.6 8.6h2.8v6.8" fill="none" stroke="#c98a12" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const UNDO = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7H15a5 5 0 0 1 0 10H8"/><path d="M11.5 3.5L7.5 7l4 3.5"/></svg>';
  const CSS = `
#hsc-req,#hsc-undo,#hsc-score{zoom:var(--hsc-s,1);font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};-webkit-user-select:none;user-select:none}
#hsc-req{position:fixed;z-index:20;top:calc(env(safe-area-inset-top) + 72px);left:50%;transform:translateX(-50%);pointer-events:auto;cursor:pointer;
  display:flex;gap:4px;padding:6px;border-radius:22px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};transition:transform .25s}
#hsc-req img{width:66px;height:66px;border-radius:15px;display:block;background:radial-gradient(circle at 50% 35%,#fff,#e4d2b4)}
#hsc-req::after,#hsc-req::before{content:"";position:absolute;border-radius:50%;background:#fff6e6;border:3px solid ${INK}}
#hsc-req::after{width:14px;height:14px;left:calc(50% - 6px);bottom:-24px}
#hsc-req::before{width:8px;height:8px;left:calc(50% + 8px);bottom:-38px}
#hsc-req.big{transform:translateX(-50%) scale(1.8);transform-origin:50% 0}
#hsc-req.pop{animation:hsc-reqpop .6s ease-out}
@keyframes hsc-reqpop{0%{transform:translateX(-50%) scale(.4);opacity:0}70%{transform:translateX(-50%) scale(1.1);opacity:1}100%{transform:translateX(-50%) scale(1)}}
#hsc-req[hidden],#hsc-undo[hidden],#hsc-score[hidden],#hsc-score [hidden]{display:none}
body.hsc-reveal #hsc-req,body.hsc-spin #hsc-req,body.hsc-reveal #hsc-undo,body.hsc-spin #hsc-undo{display:none}
#hsc-undo{position:fixed;z-index:20;width:56px;height:56px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;background:#fff6e6;color:${INK};border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer}
#hsc-undo:active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
#hsc-undo:disabled{opacity:.6}
#hsc-undo .hsc-ad,#hsc-score .hsc-ad{position:absolute;right:-8px;bottom:-6px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#ffb627;color:${INK};border:2.5px solid ${INK}}
.hsc-coins{pointer-events:auto}
.hsc-coins svg{flex:none}
.hsc-coins.bump{animation:hsc-pop .45s ease-out}
#hsc-score{position:fixed;z-index:21;left:50%;top:calc(env(safe-area-inset-top) + 14px);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
#hsc-score .stars{display:flex;gap:6px}
#hsc-score .stars svg{width:54px;height:54px;transform:scale(0);animation:hsc-starin .45s cubic-bezier(.3,1.6,.6,1) forwards}
#hsc-score .stars svg:nth-child(2){width:66px;height:66px;margin-top:-10px;animation-delay:.25s}
#hsc-score .stars svg:nth-child(3){animation-delay:.5s}
@keyframes hsc-starin{to{transform:scale(1)}}
#hsc-score .row{display:flex;gap:10px;align-items:center}
#hsc-score .tip{display:flex;gap:6px;align-items:center;height:48px;padding:0 14px 0 10px;border-radius:24px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};font-weight:900;font-size:22px;font-variant-numeric:tabular-nums}
#hsc-score .x3{pointer-events:auto;position:relative;display:flex;gap:4px;align-items:center;height:52px;padding:0 16px 0 10px;border-radius:26px;background:#ffb627;border:3px solid ${INK};box-shadow:0 4px 0 ${INK};font-weight:900;font-size:24px;color:${INK};cursor:pointer;animation:hsc-rbreathe 1.3s ease-in-out infinite}
#hsc-score .x3:disabled{animation:none;opacity:.55;cursor:default}
#hsc-score .x3:not(:disabled):active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
.hsc-fly{position:fixed;z-index:40;pointer-events:none;transition:transform .7s cubic-bezier(.5,-0.2,.7,1),opacity .7s}
@media (prefers-reduced-motion:reduce){#hsc-score .stars svg{animation-duration:.01s}#hsc-score .x3{animation:none}}
`;
  const ui = {
    el: {}, built: false, round: null, flying: 0, shownJob: null,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
      const reqEl = document.createElement('div'); reqEl.id = 'hsc-req'; reqEl.hidden = true; reqEl.setAttribute('aria-hidden', 'true');
      reqEl.innerHTML = '<img alt=""><img alt="">';
      reqEl.addEventListener('click', () => { reqEl.classList.toggle('big'); clearTimeout(this.bigT); if (reqEl.classList.contains('big')) this.bigT = setTimeout(() => reqEl.classList.remove('big'), 2600); });
      const undoEl = document.createElement('button'); undoEl.id = 'hsc-undo'; undoEl.type = 'button'; undoEl.hidden = true;
      undoEl.setAttribute('aria-label', 'Watch a video to undo the last stroke');
      undoEl.innerHTML = `${UNDO}<span class="hsc-ad">${HSC.AD_ICON ? HSC.AD_ICON(18) : ''}</span>`;
      undoEl.addEventListener('click', doUndo);
      const score = document.createElement('div'); score.id = 'hsc-score'; score.hidden = true;
      score.innerHTML = `<div class="stars"></div><div class="row"><div class="tip">${COIN(28)}<span></span></div>
        <button class="x3" type="button" aria-label="Watch a video to triple the tips">${COIN(30)}<span>×3</span><span class="hsc-ad">${HSC.AD_ICON ? HSC.AD_ICON(18) : ''}</span></button></div>`;
      score.querySelector('.x3').addEventListener('click', triple);
      document.body.append(reqEl, undoEl, score);
      Object.assign(this.el, { req: reqEl, undo: undoEl, score, stars: score.querySelector('.stars'), tip: score.querySelector('.tip span'), x3: score.querySelector('.x3') });
      const scene = document.getElementById('scene') || document;
      scene.addEventListener('pointerdown', onDown, true);
      addEventListener('pointerup', onUp, true);
      addEventListener('pointercancel', onUp, true);
      setInterval(() => this.tick(), 60);
    },
    coinPill(bump) {
      const row = document.querySelector('#hsc-hud .hsc-row');
      if (!row) return;
      if (!this.el.coins || !this.el.coins.isConnected) {
        const c = document.createElement('div');
        c.className = 'hsc-pill hsc-coins';
        c.setAttribute('aria-label', 'Coins');
        c.innerHTML = `${COIN(26)}<span></span>`;
        row.appendChild(c);
        this.el.coins = c;
      }
      this.el.coins.querySelector('span').textContent = coins();
      if (bump) { this.el.coins.classList.remove('bump'); void this.el.coins.offsetWidth; this.el.coins.classList.add('bump'); }
    },
    coinBurst(n, from) {
      // coins fly from the button to the coin counter
      const to = this.el.coins && this.el.coins.getBoundingClientRect(), fr = from.getBoundingClientRect();
      if (!to || !to.width) return;
      const k = Math.min(10, 3 + Math.floor(n / 20));
      for (let i = 0; i < k; i++) {
        const c = document.createElement('div');
        c.className = 'hsc-fly';
        c.innerHTML = COIN(26);
        c.style.left = fr.left + fr.width / 2 - 13 + (i % 3 - 1) * 10 + 'px';
        c.style.top = fr.top + fr.height / 2 - 13 + 'px';
        document.body.appendChild(c);
        this.flying++;
        setTimeout(() => { c.style.transform = `translate(${to.left + to.width / 2 - (fr.left + fr.width / 2)}px,${to.top + to.height / 2 - (fr.top + fr.height / 2)}px) scale(.7)`; c.style.opacity = '.2'; }, 40 + i * 60);
        setTimeout(() => { c.remove(); this.flying--; }, 900 + i * 60);
      }
    },
    undoButton() {
      const g = G(), b = this.el.undo;
      if (!g || !b) return;
      const s = g.getState();
      const show = s.status === 'cutting' && undo.job === s.jobId && undo.stack.length > 0 && !!(HSC.canVideo && HSC.canVideo());
      b.hidden = !show;
      if (!show) return;
      // under the top-left buttons
      const row = document.querySelector('#hsc-hud .hsc-row'), S = HSC.S || 1;
      const r = row && row.getBoundingClientRect();
      const left = document.querySelector('.ui .top button');
      const lr = left && left.getBoundingClientRect();
      const x = lr && lr.width ? lr.left : r ? r.left : 12, y = Math.max(r ? r.bottom : 0, lr ? lr.bottom : 0) + 14;
      Object.assign(b.style, { left: x / S + 'px', top: y / S + 'px' });
    },
    request(s) {
      const r = HSC.requestFor(s), el = this.el.req;
      if (!r) { el.hidden = true; return; }
      const v = HSC.view;
      if (this.reqKey !== r.job + ':' + r.style.id) {
        this.reqKey = r.job + ':' + r.style.id;
        let a = null, b = null;
        try {
          // his own head with the cut he wants: from the side and from the back
          a = v.thumbnail(r.target, 110, 4, { size: 160, headOnly: true });
          b = v.thumbnail(r.target, 10, 6, { size: 160, headOnly: true });
        } catch (e) { console.error('customers: request picture failed', e); }
        if (!a || !b) { el.hidden = true; this.reqKey = null; return; }
        const imgs = el.querySelectorAll('img');
        imgs[0].src = a; imgs[1].src = b;
        el.hidden = false;
        el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
        el.classList.add('big'); clearTimeout(this.bigT); this.bigT = setTimeout(() => el.classList.remove('big'), 2600);
      } else el.hidden = false;
      // just below the top buttons (the coins and streak sit in that row)
      const row = document.querySelector('#hsc-hud .hsc-row'), top = document.querySelector('.ui .top'), S = HSC.S || 1;
      const b = Math.max(row ? row.getBoundingClientRect().bottom : 0, top ? top.getBoundingClientRect().bottom : 0);
      if (b > 0) el.style.top = (b + 10) / S + 'px';
    },
    scoreView() {
      const d = M() && M().data, last = d && d.lastRound, s = G() && G().getState();
      const show = !!(last && s && s.status === 'reveal' && last.job === s.jobId && document.body.classList.contains('hsc-reveal'));
      this.el.score.hidden = !show;
      if (!show) return;
      const stars = last.shownStars || last.stars;
      const key = last.job + ':' + stars;
      if (this.starKey !== key) {
        this.starKey = key;
        this.el.stars.innerHTML = [1, 2, 3].map((n) => STAR(n <= stars)).join('');
      }
      this.el.tip.textContent = '+' + last.paid * (last.tripled ? 3 : 1);
      const canX = !last.tripled && last.paid > 0 && !!(HSC.canVideo && HSC.canVideo());
      this.el.x3.hidden = !canX && !last.tripled;
      this.el.x3.disabled = !canX;
    },
    tick() {
      const g = G();
      if (!g || !M() || !M().data) return;
      const s = g.getState();
      this.coinPill(false);
      if (s.status === 'cutting') {
        if (face.on) rest(s.look && s.look.person);
        this.request(s);
        if (undo.job !== s.jobId) { undo.job = s.jobId; undo.stack = []; }
        if (this.lastStatus === 'reveal') undo.stack = []; // a replay starts the haircut again
        this.shownJob = null;
      } else this.el.req.hidden = true;
      this.undoButton();
      // the smile starts with the reveal spin: the camera passes his face half-way round (it ends behind him)
      const revealing = s.status === 'reveal';
      if (revealing && this.shownJob !== s.jobId + ':' + s.cutStrokeCount) {
        this.shownJob = s.jobId + ':' + s.cutStrokeCount;
        const last = M().data.lastRound;
        if (last && last.job === s.jobId) smile(s.look && s.look.person, last.shownStars || last.stars);
      }
      this.scoreView();
      this.lastStatus = s.status;
    },
  };
  const boot = () => { if (G() && document.body) ui.build(); else setTimeout(boot, 300); };
  boot();
})(globalThis.HSC || (globalThis.HSC = {}));
