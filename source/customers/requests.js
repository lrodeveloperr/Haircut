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
//   combo     consecutive 3-star cuts raise that customer's tips: x1.2 for the 2nd in a row, x1.5 for the 3rd,
//             x2 from the 4th (owner-approved item 18). A cut under 3 stars ends the run. A flame tag on the coin
//             counter shows what the next 3-star cut pays.
//   x3 tips   a rewarded video on the reveal triples that customer's tips (once per customer).
//   undo      one rewarded video per customer, offered after a measurable mistake, restores that stroke.
//   smile     at the reveal the customer smiles in his own ancestry mix of MakeHuman's expression units
//             (render.js): a polite smile for 1 star, a warm one for 2, a big real smile for 3.
// No text: icons, stars and numbers only. Every video is optional.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#10223f';
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
    // one practice customer: the next job is ordinary Quick Play again
    if (practice.job != null && practice.job !== s.jobId) { practice.id = null; practice.job = null; }
    Object.assign(req, { job: s.jobId, start: s.startHair, style: null, target: null, beard: null });
    if (p.first || !HSC.walkIns) return null;
    // Practice from the lookbook (portfolio contract section 5): Quick Play with the chosen cut as the target;
    // the first customer it suits asks for it. Practice has no fee, payout, stars, mastery or unlock.
    if (practice.id && HSC.modes && HSC.modes.current() === 'free') {
      const want = byId.get(practice.id);
      if (want && suit(want, p) > 0) { const t = targetFor(want, s.startHair); if (worthCutting(s.startHair, t)) { practice.job = s.jobId; Object.assign(req, { style: want, target: t }); return req; } }
    }
    // a game mode (modes.js) may decide the request: null for none, or {style, target} / {style, beard}
    const mr = HSC.modes ? HSC.modes.request(s) : undefined;
    if (mr !== undefined) { if (!mr) return null; Object.assign(req, { style: mr.style, target: mr.target || null, beard: mr.beard || null }); return req; }
    const R = HSC.rng(((p.seed >>> 0) ^ Math.imul((s.jobId | 0) + 7, 0x27d4eb2d)) >>> 0 || 1);
    const usual = p.usual && byId.get(p.usual);
    let pick = null;
    if (!pick && usual && suit(usual, p) > 0 && R.next() < 0.75) { const t = targetFor(usual, s.startHair); if (worthCutting(s.startHair, t)) pick = { style: usual, target: t }; }
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
  // practise a cut from the lookbook (collection.js): switches to Quick Play; the customer in the chair practises
  // it if it suits him and he has not been cut yet, otherwise the next customer it suits does. Returns 'now',
  // 'next' or null. Nothing a practice job does is paid, scored or recorded (portfolio contract 4.1 and 5).
  const practice = { id: null, job: null };
  HSC.practise = function (id) {
    const st = byId.get(id), g = G();
    if (!st || st.fam === 'trim' || !g || !HSC.modes) return null;
    practice.id = id; practice.job = null; req.job = null;
    const s = g.getState(), p = s.look && s.look.person;
    const now = s.status === 'cutting' && !(s.cutStrokeCount > 0) && p && !p.first && Array.isArray(s.startHair) && suit(st, p) > 0 && worthCutting(s.startHair, targetFor(st, s.startHair));
    if (HSC.modes.current() !== 'free') HSC.modes.set('free').then(() => { req.job = null; });
    return now ? 'now' : 'next';
  };
  HSC.practising = () => practice.id;
  HSC.practiceJob = (job) => practice.job != null && practice.job === job;
  // the style a customer asked for on a job (meta.js keeps it as a regular's usual)
  HSC.requestStyleFor = (job) => (req.job === job && req.style && byId.has(req.style.id) ? req.style.id : null);
  // for modes.js: the cut catalogue and its rules
  HSC.requestKit = { STYLES, byId, targetFor, suit, worthCutting };

  // ---- scoring (the engine's own match, patch18) ----
  function starsFor(s) {
    if (!s || !(s.cutStrokeCount > 0)) return 0;
    const r = HSC.requestFor(s);
    if (r && r.beard && HSC.modes) return HSC.modes.beardStars(s, r);
    if (!r || !HSC.requests || !HSC.requests.match) return 3; // free style (the first customer): always a great cut
    let w;
    try { w = G().getView().surface.weights; } catch (e) {}
    const i = HSC.requests.match(s.hair, r.target, w), a = HSC.requests.match(s.startHair, r.target, w);
    const n = a >= 0.999 ? i : Math.max(0, Math.min(1, (i - a) / (1 - a)));
    return n >= 0.85 ? 3 : n >= 0.6 ? 2 : 1;
  }
  // the services a customer asks for on a job (services.js), kept for the job
  const wantCache = { job: null, list: [] };
  function wanted(s) { if (wantCache.job !== s.jobId) { wantCache.job = s.jobId; wantCache.list = HSC.servicesWanted && s.look && s.look.person && !s.look.person.first ? HSC.servicesWanted(s.look.person, s.jobId) : []; } return wantCache.list; }
  const comboMult = (n) => (n >= 4 ? 2 : n === 3 ? 1.5 : n === 2 ? 1.2 : 1);
  HSC.combo = { now: () => (M() && M().data ? M().data.combo || 0 : 0), mult: comboMult };
  const tipsFor = (p, stars) => (stars ? (10 + 5 * stars + (p && p.regular ? 5 : 0)) * (p && p.vip ? 2 : 1) : 0);

  // ---- coins ----
  // the balance lives in the economy (economy.js, kept in the career journal) once it is up; until then (and in
  // other builds) the progress save holds it
  const EC = () => (HSC.econ && HSC.econ.ready() ? HSC.econ : null);
  const t2 = (k) => (HSC.t ? HSC.t(k) : k);
  const coins = () => (EC() ? EC().balance() : M() && M().data ? M().data.coins || 0 : 0);
  let miscKey = 0;
  // credits that arrive while the career journal is still loading wait for it (or for its failure), so the
  // ledger's first mirror cannot overwrite them
  const waiting = [];
  function drain() {
    if (HSC.econ && HSC.econ.starting && HSC.econ.starting()) return setTimeout(drain, 200);
    for (const w of waiting.splice(0)) addCoins(w[0], w[1], w[2]);
  }
  function addCoins(n, cat, key) {
    if (!(n > 0)) return;
    if (!EC() && HSC.econ && HSC.econ.starting && HSC.econ.starting()) {
      if (!waiting.length) setTimeout(drain, 200);
      waiting.push([n, cat, key || 'misc:' + Date.now().toString(36) + ':' + (miscKey++)]);
      return;
    }
    if (EC()) { EC().earn(key || 'misc:' + Date.now().toString(36) + ':' + (miscKey++), cat || 'misc', Math.round(n)).then(() => ui.coinPill(true)); return; }
    const d = M() && M().data;
    if (!d) return;
    d.coins = Math.min(99999999, (d.coins || 0) + Math.round(n));
    M().save();
    ui.coinPill(true);
  }
  function spendCoins(price, cat, key) { if (EC()) return EC().spend(key, cat, price).then((ok) => { ui.coinPill(true); return ok; }); const d = M().data; d.coins -= price; M().save(); return Promise.resolve(true); }
  // a purchase that grants an item: atomic in the career journal when it is up (career-run.js buyItem)
  function buyItem(price, cat, key) { if (EC() && EC().buyItem) return EC().buyItem(key, cat, price).then((ok) => { ui.coinPill(true); return ok; }); return spendCoins(price, cat, key); }
  HSC.coins = { get: coins, add: addCoins, spend: spendCoins, buyItem };

  // a finished haircut: score it and pay (once per customer; a replay with more stars pays the extra stars)
  const done = HSC.onHaircutDone;
  HSC.onHaircutDone = function (state) {
    try { scoreRound(state); } catch (e) { console.error('customers: scoring failed', e); }
    return done ? done.apply(this, arguments) : undefined;
  };
  function scoreRound(s) {
    const d = M() && M().data;
    if (!d || !s) return;
    // freestyle and relax (modes.js) have no request: no stars, a flat tip plus the services, and the combo waits
    const free = !!(HSC.modes && HSC.modes.unscored());
    const stars = free ? (s.cutStrokeCount > 0 ? 1 : 0) : starsFor(s), p = s.look && s.look.person;
    const last = d.lastRound && d.lastRound.job === s.jobId ? d.lastRound : null;
    const svc = HSC.serviceTips ? HSC.serviceTips(s.jobId, wanted(s)) : { coins: 0, done: [] };
    // the economy pays the job (economy.js): fee - cost + services + tip (stars, regular, VIP, combo; capped)
    if (EC() && HSC.economy) { econRound(s, d, stars, free, p, last, svc); return finishRound(s, d, stars, free, svc); }
    let base = free ? (stars ? 10 + svc.coins : 0) : tipsFor(p, stars) + (stars ? svc.coins : 0);
    if (HSC.modes && stars) base = HSC.modes.tips(base, stars, s);
    if (!last) {
      // the combo: this cut extends the run of 3-star cuts or ends it
      const prev = d.combo || 0;
      if (!free) d.combo = stars === 3 ? prev + 1 : 0;
      const mult = !free && stars === 3 ? comboMult(d.combo) : 1, tips = Math.round(base * mult);
      d.lastRound = { job: s.jobId, stars, tips, paid: tips, tripled: false, prev, mult, free };
      addCoins(tips);
    } else if (stars > last.stars) {
      // a replay that reaches 3 stars carries on the run he had before this customer
      let mult = last.mult || 1;
      if (stars === 3 && !free) { d.combo = (last.prev || 0) + 1; mult = comboMult(d.combo); }
      const tips = Math.round(base * mult), extra = tips - last.paid;
      Object.assign(last, { stars, tips, mult, paid: last.paid + Math.max(0, extra) });
      addCoins(Math.max(0, extra) * (last.tripled ? 3 : 1));
    }
    return finishRound(s, d, stars, free, svc);
  }
  // the economy's round: one idempotent transaction per job (career jobs pay inside the career's own commit)
  function econRound(s, d, stars, free, p, last, svc) {
    const careerJob = HSC.careerRun && HSC.careerRun.active() && HSC.careerRun.active().job === s.jobId ? HSC.careerRun.active() : null;
    const mj = HSC.modes ? HSC.modes.econJob(s) : { kind: 'requests' };
    const kind = careerJob ? (careerJob.role === 'showcase' ? 'showcase' : careerJob.mode) : HSC.modes && HSC.modes.current() === 'free' ? 'free' : mj.kind;
    const valid = kind === 'relax' ? svc.done.length > 0 : s.cutStrokeCount > 0;
    const asked = wanted(s), doneAsked = svc.done.filter((k) => asked.includes(k)).length;
    const prev = d.combo || 0;
    const combo = free || kind === 'relax' ? 0 : stars === 3 ? prev + 1 : 0;
    const job = { kind, stars, valid, regular: !!(p && p.regular) || !!(careerJob && careerJob.regular), vip: !!(p && p.vip), combo, servicesRequested: asked, servicesDone: svc.done, relaxShare: asked.length ? doneAsked / asked.length : svc.done.length ? 1 : 0, rushBonus: mj.rushBonus || 0, dailyFirst: !!mj.dailyFirst };
    // a demand shift's highlighted mode pays its bonus (never Quick Play, never a replay)
    if (!last && valid && EC() && EC().demandMatch) job.demandMatch = EC().demandMatch(careerJob ? careerJob.mode : kind);
    // Quick Play: one thank-you for the first meaningful practice, then nothing (balance model section 3); keyed once
    if (!last && kind === 'free' && valid && !(HSC.practiceJob && HSC.practiceJob(s.jobId)) && EC()) EC().earn('quick-play-first', 'job', HSC.economy.CONFIG.freestyleOnce).then(() => ui.coinPill(true));
    const key = careerJob ? careerJob.id : 'job:' + (d.firstDay || '') + ':' + s.jobId;
    const pay = HSC.economy.payout(job);
    // the result router (ad-router.js): a newly completed customer opens one commercial break; a customer finished
    // with no change from his start (incomplete) opens none
    if (!last && HSC.adRouter) HSC.adRouter.completed(s.jobId, s.cutStrokeCount > 0 || (Array.isArray(s.hair) && Array.isArray(s.startHair) && s.hair.some((v, i) => v !== s.startHair[i])));
    if (!last) {
      if (!free && kind !== 'relax') d.combo = combo; // Relax and Freestyle pause the combo
      d.lastRound = { job: s.jobId, key, stars, tips: pay.tip, tip: pay.tip, paid: pay.total, lines: pay.lines, tripled: false, prev, mult: HSC.economy.CONFIG.combo[Math.min(combo, 4)] || 1, free: free || kind === 'free' };
      HSC.lastJob = { key, job, s };
      if (!careerJob && valid && pay.total) EC().payJob(key, job).then((paid) => {
        if (paid && paid.bill && d.lastRound && d.lastRound.key === key && !d.lastRound.bill) {
          d.lastRound.bill = paid.bill; d.lastRound.lines = (d.lastRound.lines || []).concat(paid.bill.lines || []); M().save();
        }
        ui.coinPill(true);
      });
    } else if (stars > last.stars && valid) {
      // a replay pays only the positive tip difference, never a second fee
      const extra = pay.tip - (last.tip || 0);
      if (extra > 0) { EC().earn(last.key + ':replay:' + stars, 'job', extra).then(() => ui.coinPill(true)); last.paid += extra; last.tip = pay.tip; last.tips = pay.tip; last.lines = pay.lines; }
      last.stars = stars;
      if (stars === 3 && !free) d.combo = (last.prev || 0) + 1;
    }
  }
  function finishRound(s, d, stars, free, svc) {
    d.lastRound.shownStars = stars;
    // the lookbook keeps the best stars for each cut asked for
    const r = HSC.requestFor(s);
    if (!free && r && r.style && byId.has(r.style.id) && r.style.fam !== 'trim' && stars) { d.book = d.book || {}; d.book[r.style.id] = Math.max(d.book[r.style.id] || 0, stars); }
    ui.svcDone = svc.done;
    ui.round = { job: s.jobId, stars };
    if (HSC.modes) HSC.modes.done(s, stars);
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
  // one contextual offer per contract (friction contract section 6; plan 3.3): the undo appears only after a measurable
  // mistake, a stroke that took hair below what was asked (with no request, any stroke), and once used it is gone
  const undo = { job: null, stack: [], snap: null, busy: false, used: null };
  const OVERCUT = 40; // cells newly below the target that make a stroke a measurable mistake
  function mistake(s, snap) {
    const rq = HSC.requestFor ? HSC.requestFor(s) : null;
    if (!rq) return true;
    const count = (now, was, t) => { let n = 0; if (!Array.isArray(now) || !Array.isArray(was) || !t) return 0; for (let i = 0; i < 8192; i++) if (now[i] < t[i] && was[i] >= t[i]) n++; return n; };
    return count(s.hair, snap.hair, rq.target) + count(s.beard, snap.beard, rq.beard) >= OVERCUT;
  }
  function onDown(e) {
    const g = G();
    if (!g || e.button > 0) return;
    const s = g.getState();
    if (s.status !== 'cutting') return;
    undo.snap = { job: s.jobId, hair: s.hair, beard: s.beard, brow: s.brow, svc: HSC.servicesSnapshot ? HSC.servicesSnapshot() : null };
  }
  function onUp() {
    const g = G(), snap = undo.snap;
    undo.snap = null;
    if (!g || !snap) return;
    const s = g.getState();
    if (s.status !== 'cutting' || s.jobId !== snap.job) return;
    if (s.hair !== snap.hair || s.beard !== snap.beard || s.brow !== snap.brow) {
      if (undo.job !== s.jobId) { undo.job = s.jobId; undo.stack = []; }
      undo.stack.push({ hair: snap.hair, beard: snap.beard, brow: snap.brow, svc: snap.svc, mistake: mistake(s, snap) });
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
        for (let k = 0; k < 40 && !back; k++) { back = g.restore ? await g.restore(prev.hair, prev.beard, prev.brow) : false; if (!back) await new Promise((r) => setTimeout(r, 150)); }
        if (!back) undo.stack.push(prev);
        else { undo.used = job; if (HSC.servicesRestore) HSC.servicesRestore(prev.svc); } // a threaded line put back is no longer threaded
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
    if (!last || last.tripled || !(last.key ? last.tip : last.paid) || b.disabled) return;
    b.disabled = true;
    const ok = HSC.watchVideo ? await HSC.watchVideo('triple-tips') : false;
    if (ok && d.lastRound === last && !last.tripled) {
      last.tripled = true;
      // the economy triples the disclosed tip only (two more tips; keyed so a repeated callback pays once)
      const add = EC() && last.key ? 2 * (last.tip || 0) : last.paid * 2;
      if (EC() && last.key) EC().triple(last.key, last.tip || 0).then(() => ui.coinPill(true)); else addCoins(add);
      if (last.key) last.paid += add; // the economy's round shows the running total; the old round multiplies on show
      ui.coinBurst(add, b);
    } else if (!ok) { HSC.nope && HSC.nope(b); b.disabled = false; }
    ui.scoreView();
  }

  // ---- UI ----
  const STAR = (on) => `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc83d' : 'none'}" stroke="${INK}"${on ? '' : ' stroke-dasharray="2.6 2.2" opacity=".55"'} stroke-width="2" stroke-linejoin="round"/></svg>`;
  const COIN_OLD = (s = 26) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><circle cx="12" cy="12" r="9.5" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a12" stroke-width="1.8"/><path d="M10.6 8.6h2.8v6.8" fill="none" stroke="#c98a12" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const COIN = (s = 26) => (HSC.icon ? HSC.icon('coin', s) : COIN_OLD(s)); // the theme's one coin (icons.js)
  // the combo: a flame with a star in it (the daily streak is a plain flame)
  const FLAME = (sz = 20) => `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}"><path d="M12 2.2c.6 3.2 3.4 4.6 4.9 7.3 1.6 2.9 1.4 6.6-1 8.9A6.8 6.8 0 0 1 5.4 16c-.9-2.7.1-5.2 1.9-7 .2 1.6.9 2.7 2 3.3-.5-3.8.7-7.4 2.7-10.1z" fill="#ff7a2f" stroke="${INK}" stroke-width="1.9" stroke-linejoin="round"/><path d="M12 11.4l1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z" fill="#ffe14d" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
  const UNDO = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7H15a5 5 0 0 1 0 10H8"/><path d="M11.5 3.5L7.5 7l4 3.5"/></svg>';
  const CSS = `
#hsc-req,#hsc-undo,#hsc-score{zoom:var(--hsc-s,1);font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};-webkit-user-select:none;user-select:none}
#hsc-req{position:fixed;z-index:20;top:calc(env(safe-area-inset-top) + 72px);left:50%;transform:translateX(-50%);pointer-events:auto;cursor:pointer;
  display:flex;gap:4px;padding:6px;border-radius:22px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};transition:transform .25s}
#hsc-req .svc{position:absolute;left:50%;bottom:-20px;transform:translateX(-50%);display:flex;gap:4px}
#hsc-req .svc span{width:34px;height:34px;border-radius:50%;background:#fff6e6;border:2.5px solid #10223f;display:flex;align-items:center;justify-content:center}
#hsc-req .svc span svg{width:24px;height:24px}
#hsc-req .svc span{position:relative}
#hsc-req .svc span.ok{background:#d8efd0}
#hsc-req .svc span.ok::after{content:"";position:absolute;right:-7px;top:-7px;width:18px;height:18px;border-radius:50%;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5' fill='none' stroke='%2310223f' stroke-width='3.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/14px no-repeat;border:2px solid #10223f}
#hsc-score .svc{display:flex;gap:6px}
#hsc-score .svc span{width:40px;height:40px;border-radius:50%;background:#fff6e6;border:3px solid #10223f;display:flex;align-items:center;justify-content:center}
#hsc-score .svc span svg{width:28px;height:28px}
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
.hsc-coins{pointer-events:auto;position:relative}
.hsc-combo{position:absolute;right:-10px;bottom:-20px;display:flex;align-items:center;gap:1px;height:28px;padding:0 7px 0 3px;border-radius:14px;background:#fff1d6;border:2.5px solid ${INK};font-weight:900;font-size:15px;color:${INK};white-space:nowrap;animation:hsc-combo 1.4s ease-in-out infinite}
.hsc-combo[hidden]{display:none}
@keyframes hsc-combo{50%{transform:scale(1.08)}}
#hsc-score .tip .hsc-combo{position:static;animation:none;margin-left:4px}
.hsc-coins svg{flex:none}
.hsc-coins.bump{animation:hsc-pop .45s ease-out}
#hsc-score{position:fixed;z-index:21;left:50%;top:calc(env(safe-area-inset-top) + 14px);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
#hsc-score .stars{display:flex;gap:6px}
#hsc-score .stars svg{width:54px;height:54px;transform:scale(0);animation:hsc-starin .45s cubic-bezier(.3,1.6,.6,1) forwards}
#hsc-score .stars svg:nth-child(2){width:66px;height:66px;margin-top:-10px;animation-delay:.25s}
#hsc-score .stars svg:nth-child(3){animation-delay:.5s}
@keyframes hsc-starin{to{transform:scale(1)}}
#hsc-score .row{display:flex;gap:10px;align-items:center}
#hsc-score .rcpt{display:flex;flex-wrap:wrap;justify-content:center;gap:5px;max-width:300px;direction:ltr}
#hsc-score .rcpt span{display:flex;align-items:center;gap:3px;height:28px;padding:0 9px 0 5px;border-radius:14px;background:#fff6e6;border:2px solid ${INK};font-weight:800;font-size:15px;font-variant-numeric:tabular-nums;opacity:0;animation:hsc-rcpt .3s ease-out forwards}
#hsc-score .rcpt span.neg{background:#e9eef6;color:#4a5872}
#hsc-score .rcpt svg{width:20px;height:20px}
#hsc-score .cyc{display:flex;align-items:center;justify-content:center;gap:6px;font-weight:800;font-size:15px;font-variant-numeric:tabular-nums;direction:ltr}
#hsc-score .cyc i{width:12px;height:12px;border-radius:50%;background:#fff6e6;border:2px solid ${INK};box-sizing:border-box}
#hsc-score .cyc i.on{background:#36b83a}
#hsc-score .cyc b{margin-inline-start:4px}
#hsc-hud .hsc-gap{font-style:normal;font-size:13px;font-weight:800;opacity:.9;margin-inline-start:4px;white-space:nowrap}
@keyframes hsc-rcpt{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
#hsc-score .tip{display:flex;gap:6px;align-items:center;height:48px;padding:0 14px 0 10px;border-radius:24px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};font-weight:900;font-size:22px;font-variant-numeric:tabular-nums}
#hsc-score .x3{pointer-events:auto;position:relative;display:flex;gap:4px;align-items:center;height:52px;padding:0 16px 0 10px;border-radius:26px;background:#ffb627;border:3px solid ${INK};box-shadow:0 4px 0 ${INK};font-weight:900;font-size:24px;color:${INK};cursor:pointer;animation:hsc-rbreathe 1.3s ease-in-out infinite}
#hsc-score .x3:disabled{animation:none;opacity:.55;cursor:default}
#hsc-score .x3:not(:disabled):active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
.hsc-fly{position:fixed;z-index:40;pointer-events:none;transition:transform .7s cubic-bezier(.5,-0.2,.7,1),opacity .7s}
@media (prefers-reduced-motion:reduce){#hsc-score .stars svg{animation-duration:.01s}#hsc-score .x3,.hsc-combo{animation:none}}
`;
  const ui = {
    el: {}, built: false, round: null, flying: 0, shownJob: null,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
      const reqEl = document.createElement('div'); reqEl.id = 'hsc-req'; reqEl.hidden = true; reqEl.setAttribute('aria-hidden', 'true');
      reqEl.innerHTML = '<img alt=""><img alt=""><div class="svc"></div>';
      reqEl.addEventListener('click', () => { reqEl.classList.toggle('big'); clearTimeout(this.bigT); if (reqEl.classList.contains('big')) this.bigT = setTimeout(() => reqEl.classList.remove('big'), 2600); });
      const undoEl = document.createElement('button'); undoEl.id = 'hsc-undo'; undoEl.type = 'button'; undoEl.hidden = true;
      undoEl.setAttribute('aria-label', 'Watch a video to undo the last stroke');
      undoEl.innerHTML = `${UNDO}<span class="hsc-ad">${HSC.AD_ICON ? HSC.AD_ICON(18) : ''}</span>`;
      undoEl.addEventListener('click', doUndo);
      const score = document.createElement('div'); score.id = 'hsc-score'; score.hidden = true;
      score.innerHTML = `<div class="stars"></div><div class="svc"></div><div class="row"><div class="tip">${COIN(28)}<span></span><div class="hsc-combo" hidden>${FLAME(20)}<b></b></div></div>
        <button class="x3" type="button" aria-label="Watch a video to triple the tips">${COIN(30)}<span>×3</span><span class="hsc-ad">${HSC.AD_ICON ? HSC.AD_ICON(18) : ''}</span></button></div><div class="rcpt"></div>`;
      score.querySelector('.x3').addEventListener('click', triple);
      document.body.append(reqEl, undoEl, score);
      Object.assign(this.el, { rcpt: score.querySelector('.rcpt'), req: reqEl, undo: undoEl, score, stars: score.querySelector('.stars'), tip: score.querySelector('.tip span'), tipCombo: score.querySelector('.tip .hsc-combo'), x3: score.querySelector('.x3') });
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
        c.innerHTML = `${COIN(26)}<span></span><div class="hsc-combo" hidden aria-hidden="true">${FLAME(20)}<b></b></div>`;
        row.appendChild(c);
        this.el.coins = c;
      }
      this.el.coins.querySelector('span').textContent = coins();
      // the wishlist target: how many coins are still missing, beside the balance
      const wishT = HSC.econ && HSC.econ.wishes ? HSC.econ.wishes().salon : null, gap = wishT ? wishT.price - coins() : 0;
      let gapEl = this.el.coins.querySelector('.hsc-gap');
      if (!gapEl) { gapEl = document.createElement('i'); gapEl.className = 'hsc-gap'; gapEl.setAttribute('aria-hidden', 'true'); this.el.coins.querySelector('span').after(gapEl); }
      gapEl.hidden = !(gap > 0);
      if (gap > 0) gapEl.textContent = '♥ −' + (HSC.num ? HSC.num(gap) : gap);
      // what the next 3-star cut pays while a run of 3-star cuts is going
      const run = HSC.combo.now(), tag = this.el.coins.querySelector('.hsc-combo');
      tag.hidden = run < 1;
      if (run >= 1) tag.querySelector('b').textContent = '×' + comboMult(run + 1);
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
      const top = undo.stack[undo.stack.length - 1];
      const show = s.status === 'cutting' && undo.job === s.jobId && !!top && top.mistake && undo.used !== s.jobId && !!(HSC.canVideo && HSC.canVideo());
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
          if (r.beard) {
            a = HSC.portrait(s.look.person, s.hair, r.beard, 160, 160);
            b = HSC.portrait(s.look.person, s.hair, r.beard, 105, 160);
          } else {
            a = v.thumbnail(r.target, 110, 4, { size: 160, headOnly: true });
            b = v.thumbnail(r.target, 10, 6, { size: 160, headOnly: true });
          }
        } catch (e) { console.error('customers: request picture failed', e); }
        if (!a || !b) { el.hidden = true; this.reqKey = null; return; }
        const imgs = el.querySelectorAll('img');
        imgs[0].src = a; imgs[1].src = b;
        // the services he asks for, under the cut
        const want = wanted(s);
        el.querySelector('.svc').innerHTML = want.map((k) => `<span data-k="${k}">${(HSC.SERVICE_ICON || {})[k] || ''}</span>`).join('');
        el.hidden = false;
        el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
        el.classList.add('big'); clearTimeout(this.bigT); this.bigT = setTimeout(() => el.classList.remove('big'), 2600);
      } else el.hidden = false;
      // services already done get a tick colour
      const done = HSC.servicesDone ? HSC.servicesDone(s.jobId) : [];
      el.querySelectorAll('.svc span').forEach((sp) => sp.classList.toggle('ok', done.includes(sp.dataset.k)));
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
      if (this.starKey !== key + ':' + !!last.free) {
        this.starKey = key + ':' + !!last.free;
        this.el.stars.innerHTML = last.free ? '' : [1, 2, 3].map((n) => STAR(n <= stars)).join('');
      }
      this.el.tip.textContent = '+' + (last.key ? last.paid : last.paid * (last.tripled ? 3 : 1));
      const ct = this.el.tipCombo, m = last.mult || 1;
      ct.hidden = !(m > 1);
      if (m > 1) ct.querySelector('b').textContent = '×' + m;
      const sv = this.el.score.querySelector('.svc'), key2 = (this.svcDone || []).join();
      if (sv.dataset.k !== key2) { sv.dataset.k = key2; sv.innerHTML = (this.svcDone || []).map((k) => `<span>${(HSC.SERVICE_ICON || {})[k] || ''}</span>`).join(''); }
      // the exact breakdown (economy): fee, costs, services, tip and bonuses, each with its sign
      const rk = last.key && last.lines ? last.job + ':' + last.paid + ':' + last.tripled + ':' + (last.bill ? last.bill.key : '') : '';
      if (this.el.rcpt.dataset.k !== rk) {
        this.el.rcpt.dataset.k = rk;
        const IC = { fee: 'salon', services: 'relax', rush: 'rush', demand: 'flame', daily: 'daily', triple: 'video' };
        const lines = rk ? last.lines.concat(last.tripled ? [['triple', 2 * (last.tip || 0)]] : []) : [];
        this.el.rcpt.innerHTML = lines.filter((l) => l[1]).map(([k, v], i) => `<span class="${v < 0 ? 'neg' : ''}" style="animation-delay:${0.6 + i * 0.08}s">${k === 'tip' ? STAR(true) : IC[k] && HSC.icon ? HSC.icon(IC[k], 20) : ''}${v > 0 ? '+' : '−'}${Math.abs(v)}</span>`).join('');
      }
      // the operating cycle: five dots to the next bill, and the wishlist gap (friction contract section 5)
      const bl = EC() && EC().bill ? EC().bill() : null;
      if (bl) {
        let cy = this.el.score.querySelector('.cyc');
        if (!cy) { cy = document.createElement('div'); cy.className = 'cyc'; this.el.rcpt.after(cy); }
        const doneN = bl.sponsored != null ? 5 - bl.sponsored : 5 - bl.inJobs, wish = EC().wishes ? EC().wishes().salon : null, gap = wish ? wish.price - coins() : 0;
        cy.setAttribute('role', 'img');
        cy.setAttribute('aria-label', t2('a_bill').replace('{n}', bl.sponsored != null ? bl.sponsored : bl.inJobs).replace('{c}', bl.amount));
        cy.innerHTML = [0, 1, 2, 3, 4].map((i) => `<i class="${i < doneN ? 'on' : ''}"></i>`).join('') + `<b>−${bl.amount}</b>` + (gap > 0 ? `<b>♥ −${HSC.num ? HSC.num(gap) : gap}</b>` : '');
      }
      const canX = !last.tripled && (last.key ? last.tip > 0 : last.paid > 0) && !!(HSC.canVideo && HSC.canVideo());
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
