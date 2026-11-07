// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved 5 November 2026): the core loop around each haircut.
//
//   request   each customer (after the first) asks for a cut: a thought bubble shows it from the side and the
//             back. The cut suits his age, hair type and hair loss, and is always shorter than what he walked
//             in with. A regular asks for his usual.
//   stars     the finished cut is scored with the engine's own match (patch18): 1 star for any cut, 2 from a
//             60% match, 3 from 85%. Never a fail.
//   tips      coins at the reveal: 10 + 5 per star, +5 for a regular, x2 for a VIP.
//   video     a rewarded video on the result, in every mode, after a hidden random wait, so it can never be predicted (the first
//             result always has it): two more tips, at least the floor. Quick Play pays nothing else, so its video needs
//             real work and stops after a few a day. Next without a video watched: interstitial.
//   undo      a permanent button: each undo of the last stroke is a rewarded video (up to 20 strokes back).
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
  add('buzz', 0, 0, 0, 'even'); // shaved right down: what many men with hair loss ask for
  for (const t of [3, 4]) add('caesar', 2, 2, t, 'low'); // short, even and neat all round
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
    if (f === 'buzz' && style.top === 0 && !heavy && age < 30) return 0.15; // shaved right down is rarer on a full young head
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
  // what a man asks for follows the hair he walks in with: a full head usually wants shape, not a shave; a fade comes back
  // to be refreshed; a short even cut stays short. Read from the hair itself (side and top lengths). See docs/STYLE-MATRIX.md
  const startKinds = new WeakMap();
  function startKind(start) {
    if (startKinds.has(start)) return startKinds.get(start);
    let top = 0, nt = 0, side = 0, ns = 0;
    for (let i = 0; i < start.length; i++) { const v = (i >> 7) / 64; if (v > 0.7) { top += start[i]; nt++; } else if (v < 0.3) { side += start[i]; ns++; } }
    top /= nt || 1; side /= ns || 1;
    const k = top - side > 1.2 ? (side <= 1.6 ? 'faded' : 'shaped') : top >= 3.5 ? 'full' : top >= 2 ? 'even' : 'short';
    startKinds.set(start, k);
    return k;
  }
  const FROM = {
    full: { taper: 1.5, classic: 1.5, fade: 1.2, crew: 1.2, caesar: 1.1, undercut: 1.2, skin: 0.8, buzz: 0.6 },
    shaped: { taper: 1.4, classic: 1.4, fade: 1.3, undercut: 1.2, skin: 1, caesar: 1, buzz: 0.7 },
    faded: { skin: 1.6, fade: 1.6, temple: 1.4, hawk: 1.1, taper: 0.8, classic: 0.5, buzz: 0.6 },
    even: { crew: 1.5, caesar: 1.5, buzz: 1.3, fade: 1.2, taper: 1.1, skin: 1 },
    short: { buzz: 2, skin: 1.1, fade: 1 },
  };
  // and his hair type: what actually sits well on it
  const TYPE = {
    1: { classic: 1.3, crew: 1.3, undercut: 1.2, taper: 1.1, caesar: 1.1 }, 2: { taper: 1.2, fade: 1.2, undercut: 1.2, caesar: 1.1 },
    3: { fade: 1.3, taper: 1.3, skin: 1.1, temple: 1.2, caesar: 1.1 }, 4: { buzz: 1.2, caesar: 1.3 },
  };
  // a family with many variants (15 fades) must not crowd out one with two (tapers): each family gets a fair share
  const famSize = {}; for (const st of STYLES) famSize[st.fam] = (famSize[st.fam] || 0) + 1;
  const askFor = (style, p, start) => suit(style, p) * ((FROM[startKind(start)] || {})[style.fam] || 1) * ((TYPE[((p.hair && p.hair.type) || '1b')[0]] || {})[style.fam] || 1) / Math.sqrt(famSize[style.fam] || 1);
  // enough to cut: at least about a fifth of the head shorter, and a real change on the sides or top
  // a customer asks for a style his hair can really make: at most a fifth of his head may already be shorter than it wants
  function fits(style, start) {
    if (style.fam === 'trim') return true;
    const g = gridOf(style);
    let hair = 0, short = 0;
    for (let i = 0; i < start.length; i++) if (start[i] > 0) { hair++; if (g[i] > start[i]) short++; }
    return !hair || short / hair <= 0.2;
  }
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
    Object.assign(req, { job: s.jobId, start: s.startHair, style: null, target: null, beard: null });
    if (p.first || !HSC.walkIns) return null;
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
        const w = askFor(st, p, s.startHair);
        if (!w) continue;
        const t = targetFor(st, s.startHair);
        if (worthCutting(s.startHair, t)) opts.push([w, st, t]);
      }
      // only styles his hair can really make; if none fully fits, the closest list stays, so he always has a request
      const honest = opts.filter((o) => fits(o[1], s.startHair));
      if (honest.length) opts.splice(0, opts.length, ...honest);
      // what was asked for lately is far less likely to come up again
      if (HSC.modes && HSC.modes.recently) for (const o of opts) if (HSC.modes.recently(o[1])) o[0] *= 0.1;
      let r = R.next() * opts.reduce((a, o) => a + o[0], 0);
      for (const o of opts) if ((r -= o[0]) <= 0) { pick = { style: o[1], target: o[2] }; break; }
      if (!pick && opts.length) pick = { style: opts[opts.length - 1][1], target: opts[opts.length - 1][2] };
    }
    if (!pick) return null;
    req.style = pick.style; req.target = pick.target;
    // about half of the men with a beard want it done too: the order is for the hair and the beard together
    if (HSC.modes && HSC.modes.beardJob && Array.isArray(s.startBeard) && R.next() < 0.5) {
      const j = HSC.modes.beardJob(p, s.startBeard, R);
      if (j) req.beard = j.target;
    }
    return req;
  };
  // the style a customer asked for on a job (meta.js keeps it as a regular's usual)
  HSC.requestStyleFor = (job) => (req.job === job && req.style && byId.has(req.style.id) ? req.style.id : null);
  // for modes.js: the cut catalogue and its rules
  HSC.requestKit = { STYLES, byId, targetFor, suit, askFor, startKind, worthCutting, fits };

  // ---- scoring (the engine's own match, patch18) ----
  function starsFor(s) {
    if (!s || !(s.cutStrokeCount > 0)) return 0;
    const r = HSC.requestFor(s);
    const bs = r && r.beard && HSC.modes ? HSC.modes.beardStars(s, r) : null;
    if (bs != null && !r.target) return bs;
    if (!r || !HSC.requests || !HSC.requests.match) return 3; // free style (the first customer): always a great cut
    let w;
    try { w = G().getView().surface.weights; } catch (e) {}
    const i = HSC.requests.match(s.hair, r.target, w), a = HSC.requests.match(s.startHair, r.target, w);
    const n = a >= 0.999 ? i : Math.max(0, Math.min(1, (i - a) / (1 - a)));
    const hs = n >= 0.85 ? 3 : n >= 0.6 ? 2 : 1;
    return bs == null ? hs : Math.min(hs, bs); // hair and beard: the job is as good as its weaker half
  }
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
    if (EC()) return EC().earn(key || 'misc:' + Date.now().toString(36) + ':' + (miscKey++), cat || 'misc', Math.round(n)).then(() => ui.coinPill(true));
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

  // a finished haircut: score it and pay, once per customer
  const done = HSC.onHaircutDone;
  HSC.onHaircutDone = function (state) {
    try { scoreRound(state); } catch (e) { console.error('customers: scoring failed', e); }
    return done ? done.apply(this, arguments) : undefined;
  };
  // a job seen a second time (a reveal restored after a reload) pays nothing and is not a second customer
  let repeat = null;
  HSC.repeatJob = (job) => repeat === job;
  function scoreRound(s) {
    const d = M() && M().data;
    if (!d || !s) return;
    // freestyle (modes.js) has no request: no stars, a flat tip
    const free = !!(HSC.modes && HSC.modes.unscored());
    const last = d.lastRound && d.lastRound.job === s.jobId ? d.lastRound : null;
    if (last) { repeat = s.jobId; return finishRound(s, d, last.stars, free); }
    // no order (Rescue, Beards): nothing is scored, and the set pay needs real work. The 2 is only a neutral record for Career
    const judged = !free && !!(HSC.modes && HSC.modes.judged && HSC.modes.judged(s));
    const stars = free ? (s.cutStrokeCount > 0 ? 1 : 0) : judged ? (HSC.modes.worked(s) ? 2 : 0) : starsFor(s), p = s.look && s.look.person;
    // the economy pays the job (economy.js): fee - cost + tip (stars, regular, VIP; capped)
    if (EC() && HSC.economy) { econRound(s, d, stars, free, p, judged); return finishRound(s, d, stars, free); }
    let base = free ? (stars ? 10 : 0) : tipsFor(p, stars);
    if (HSC.modes && stars) base = HSC.modes.tips(base, stars, s);
    d.lastRound = { job: s.jobId, stars, tips: base, paid: base, tripled: false, free };
    addCoins(base);
    return finishRound(s, d, stars, free);
  }
  // the economy's round: one idempotent transaction per job (career jobs pay inside the career's own commit)
  function econRound(s, d, stars, free, p, judged) {
    // only the Career chair holds a contract: another mode's job may carry the same number
    const careerJob = HSC.modes && HSC.modes.current() === 'career' && HSC.careerRun && HSC.careerRun.active() && HSC.careerRun.active().job === s.jobId ? HSC.careerRun.active() : null;
    const mj = HSC.modes ? HSC.modes.econJob(s) : { kind: 'requests' };
    const kind = careerJob ? (careerJob.role === 'showcase' ? 'showcase' : careerJob.mode) : HSC.modes && HSC.modes.current() === 'free' ? 'free' : mj.kind;
    const valid = judged ? stars > 0 : s.cutStrokeCount > 0;
    const job = { kind, stars, judged, valid, regular: !!(p && p.regular) || !!(careerJob && careerJob.regular), vip: !!(p && p.vip), rushBonus: mj.rushBonus || 0 };
    // a demand shift's highlighted mode pays its bonus (never Quick Play)
    if (valid && EC() && EC().demandMatch) job.demandMatch = EC().demandMatch(careerJob ? careerJob.mode : kind);
    // Quick Play: a little for real work, up to a daily limit; keyed, so a reload cannot pay twice
    const quick = HSC.modes && HSC.modes.current() === 'free' && valid && EC() && HSC.modes.worked(s) && quickDay().n < HSC.economy.CONFIG.quickPlay.perDay ? HSC.economy.CONFIG.quickPlay.pay : 0;
    if (quick) { const q = quickDay(); q.n++; EC().earn('quick:' + q.day + ':' + q.n, 'job', quick).then(() => ui.coinPill(true)); }
    const key = careerJob ? careerJob.id : 'job:' + (d.firstDay || '') + ':' + s.jobId;
    const pay = HSC.economy.payout(job);
    const practice = kind === 'free', earned = !valid ? 0 : !practice ? HSC.economy.videoPay(pay.tip) : HSC.modes.worked(s) && practiceDay().n < HSC.economy.CONFIG.video.practicePerDay ? HSC.economy.videoPay(0) : 0;
    // the roll is made once and saved with the result, so a reload cannot change it
    const md = d.modes, wait = md && Number.isSafeInteger(md.wait) ? md.wait : 0;
    // a level-up is a moment of joy: the video is always there for it
    const levelUp = !practice && HSC.meta && HSC.meta.levelOf(d.cuts + 1) > HSC.meta.levelOf(d.cuts);
    const video = earned > 0 && (wait <= 0 || levelUp) ? earned : 0;
    if (md && earned > 0) md.wait = video ? HSC.economy.videoWait(Math.random()) : wait - 1;
    // the result router (ad-router.js): a newly completed customer opens one commercial break; a customer finished
    // with no change from his start (incomplete) opens none
    if (HSC.adRouter) HSC.adRouter.completed(s.jobId, s.cutStrokeCount > 0 || (Array.isArray(s.hair) && Array.isArray(s.startHair) && s.hair.some((v, i) => v !== s.startHair[i])));
    d.lastRound = { job: s.jobId, key, stars, tips: pay.tip, tip: pay.tip, paid: pay.total + quick, lines: pay.lines, tripled: false, free: free || kind === 'free', judged, video };
    HSC.lastJob = { key, job, s };
    if (!careerJob && valid && pay.total) EC().payJob(key, job).then((paid) => {
      if (paid && paid.bill && d.lastRound && d.lastRound.key === key && !d.lastRound.bill) {
        d.lastRound.bill = paid.bill; d.lastRound.lines = (d.lastRound.lines || []).concat(paid.bill.lines || []); M().save();
      }
      ui.coinPill(true);
    });
  }
  function finishRound(s, d, stars, free) {
    d.lastRound.shownStars = stars;
    const r = HSC.requestFor(s);
    if (!free && r && r.style && HSC.modes && HSC.modes.noteAsk && !(HSC.modes.recently(r.style))) HSC.modes.noteAsk(r.style);
    ui.round = { job: s.jobId, stars };
    if (HSC.modes) HSC.modes.done(s, stars);
    M().save();
  }

  // keep frames coming while coins fly (the game draws only when something changes)
  const clipActive = HSC.clippingsActive;
  HSC.clippingsActive = () => ui.flying > 0 || (clipActive ? clipActive() : false);

  // ---- undo: one rewarded video per stroke undone ----
  // the undo button is permanent while there is a stroke to take back: the player watches a video whenever it is
  // worth it to them (owner decision 5 November 2026, replacing the one-per-customer rule of plan 3.3)
  const undo = { job: null, stack: [], snap: null, busy: false };
  function onDown(e) {
    const g = G();
    if (!g || e.button > 0) return;
    const s = g.getState();
    if (s.status !== 'cutting') return;
    undo.snap = { job: s.jobId, hair: s.hair, beard: s.beard, brow: s.brow };
  }
  function onUp() {
    const g = G(), snap = undo.snap;
    undo.snap = null;
    if (!g || !snap) return;
    const s = g.getState();
    if (s.status !== 'cutting' || s.jobId !== snap.job) return;
    if (s.hair !== snap.hair || s.beard !== snap.beard || s.brow !== snap.brow) {
      if (undo.job !== s.jobId) { undo.job = s.jobId; undo.stack = []; }
      undo.stack.push({ hair: snap.hair, beard: snap.beard, brow: snap.brow });
      if (undo.stack.length > 20) undo.stack.shift();
      ui.undoButton();
    }
  }
  // a video toward the wishlist: a few coins at the moment the player wants them, a few times a day
  const wishDay = () => { const md = M().data.modes, day = M().today(); if (!md.wv || md.wv.day !== day) md.wv = { day, n: 0 }; return md.wv; };
  const canWishVideo = () => { const c = HSC.economy && HSC.economy.CONFIG.wishVideo; return !!(c && M() && M().data && M().data.modes && HSC.canVideo && HSC.canVideo() && wishDay().n < c.perDay); };
  HSC.wishVideo = { state: () => { const c = HSC.economy && HSC.economy.CONFIG.wishVideo; return canWishVideo() ? { coins: c.coins, left: c.perDay - wishDay().n } : null; }, run: () => wishVideo() };
  async function wishVideo() {
    if (!canWishVideo()) return;
    const ok = HSC.watchVideo ? await HSC.watchVideo('wish-coins') : false;
    if (!ok) return; // only a really earned video pays
    const w = wishDay(), c = HSC.economy.CONFIG.wishVideo;
    w.n++;
    await addCoins(c.coins, 'rewarded', 'wish:' + w.day + ':' + w.n);
    M().save();
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
      } else if (!ok) HSC.nope && HSC.nope(ui.el.undo);
    } finally {
      undo.busy = false;
      ui.el.undo.disabled = false;
      ui.undoButton();
    }
  }

  // ---- the result video ----
  const quickDay = () => { const md = M().data.modes, day = M().today(); if (!md.qp || md.qp.day !== day) md.qp = { day, n: 0 }; return md.qp; };
  const practiceDay = () => { const md = M().data.modes, day = M().today(); if (!md.pv || md.pv.day !== day) md.pv = { day, n: 0 }; return md.pv; };
  async function triple() {
    const d = M() && M().data, b = ui.el.x3;
    const last = d && d.lastRound;
    if (!last || last.tripled || !(last.key ? last.video : last.paid) || b.disabled) return;
    b.disabled = true;
    const ok = HSC.watchVideo ? await HSC.watchVideo('triple-tips') : false;
    if (ok && d.lastRound === last && !last.tripled) {
      last.tripled = true;
      // the economy triples the disclosed tip only (two more tips; keyed so a repeated callback pays once)
      const add = EC() && last.key ? last.video : last.paid * 2;
      if (last.free) practiceDay().n++;
      if (EC() && last.key) EC().triple(last.key, last.tip || 0).then(() => ui.coinPill(true)); else addCoins(add);
      if (last.key) last.paid += add; // the economy's round shows the running total; the old round multiplies on show
    } else if (!ok) { HSC.nope && HSC.nope(b); b.disabled = false; }
    ui.scoreView();
  }

  // ---- UI ----
  const STAR = (on) => `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc83d' : 'none'}" stroke="${INK}"${on ? '' : ' stroke-dasharray="2.6 2.2" opacity=".55"'} stroke-width="2" stroke-linejoin="round"/></svg>`;
  const COIN_OLD = (s = 26) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><circle cx="12" cy="12" r="9.5" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a12" stroke-width="1.8"/><path d="M10.6 8.6h2.8v6.8" fill="none" stroke="#c98a12" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const COIN = (s = 26) => (HSC.icon ? HSC.icon('coin', s) : COIN_OLD(s)); // the theme's one coin (icons.js)
  const UNDO = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7H15a5 5 0 0 1 0 10H8"/><path d="M11.5 3.5L7.5 7l4 3.5"/></svg>';
  const CSS = `
#hsc-req,#hsc-undo,#hsc-score{zoom:var(--hsc-s,1);font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};-webkit-user-select:none;user-select:none}
#hsc-req{position:fixed;z-index:20;top:calc(env(safe-area-inset-top) + 72px);left:50%;transform:translateX(-50%);pointer-events:auto;cursor:pointer;
  display:flex;gap:4px;padding:6px;border-radius:22px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};transition:transform .25s}
#hsc-req img{width:88px;height:88px;border-radius:15px;display:block;background:radial-gradient(circle at 50% 35%,#fff,#e4d2b4)}
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
.hsc-coins svg{flex:none}
.hsc-coins.bump{animation:hsc-pop .45s ease-out}
#hsc-score{position:fixed;z-index:21;left:50%;top:calc(env(safe-area-inset-top) + 14px);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
#hsc-score .stars{display:flex;gap:6px;height:46px}
#hsc-score .stars svg{width:46px;height:46px;transform:scale(0);animation:hsc-starin .45s cubic-bezier(.3,1.6,.6,1) forwards}
#hsc-score .stars svg:nth-child(2){animation-delay:.25s}
#hsc-score .stars svg:nth-child(3){animation-delay:.5s}
@keyframes hsc-starin{to{transform:scale(1)}}
#hsc-score .tip{position:relative}
#hsc-score .line{position:absolute;left:calc(100% + 8px);top:6px;white-space:nowrap;display:flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:15px;background:#10223fcc;color:#fff;font-weight:900;font-size:16px;font-variant-numeric:tabular-nums;direction:ltr}
#hsc-score .line[hidden]{display:none}
#hsc-score .line .hsc-ic{width:22px;height:22px}
#hsc-score .line span{display:flex;align-items:center;gap:3px}
#hsc-hud .hsc-gap{font-style:normal;font-size:13px;font-weight:800;opacity:.9;margin-inline-start:4px;white-space:nowrap}
@keyframes hsc-rcpt{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
#hsc-score .tip{display:flex;gap:6px;align-items:center;height:48px;padding:0 14px 0 10px;border-radius:24px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};font-weight:900;font-size:22px;font-variant-numeric:tabular-nums}
#hsc-score .x3{pointer-events:auto;position:relative;display:flex;gap:4px;align-items:center;height:52px;padding:0 16px 0 10px;border-radius:26px;background:linear-gradient(#a8e4ff,#3aa2f2);border:3px solid ${INK};box-shadow:0 4px 0 ${INK};font-weight:900;font-size:24px;color:${INK};cursor:pointer;animation:hsc-rbreathe 1.3s ease-in-out infinite}
#hsc-score .x3:disabled{animation:none;opacity:.55;cursor:default}
#hsc-score .x3:not(:disabled):active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
.hsc-fly{position:fixed;z-index:40;pointer-events:none;transition:transform .7s cubic-bezier(.5,-0.2,.7,1),opacity .7s}
@media (prefers-reduced-motion:reduce){#hsc-score .stars svg{animation-duration:.01s}#hsc-score .x3{animation:none}}
`;
  const TURN = 15, TURNS = 24; // the order's head turns with the customer in steps this small, in degrees
  const LEVEL = 0; // and it always looks straight ahead, so a beard or a jawline can be read from the front
  const ui = {
    el: {}, built: false, ring: new Map(), touching: false, round: null, flying: 0, shownJob: null,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
      const reqEl = document.createElement('div'); reqEl.id = 'hsc-req'; reqEl.hidden = true; reqEl.setAttribute('aria-hidden', 'true');
      reqEl.innerHTML = '<img alt="">';
      reqEl.addEventListener('click', () => { reqEl.classList.toggle('big'); clearTimeout(this.bigT); if (reqEl.classList.contains('big')) this.bigT = setTimeout(() => reqEl.classList.remove('big'), 2600); });
      const undoEl = document.createElement('button'); undoEl.id = 'hsc-undo'; undoEl.type = 'button'; undoEl.hidden = true;
      undoEl.setAttribute('aria-label', 'Watch a video to undo the last stroke');
      undoEl.innerHTML = `${HSC.icon ? HSC.icon('undo', 32) : UNDO}<span class="hsc-ad">${HSC.AD_ICON ? HSC.AD_ICON(18) : ''}</span>`;
      undoEl.addEventListener('click', doUndo);
      const score = document.createElement('div'); score.id = 'hsc-score'; score.hidden = true;
      score.innerHTML = `<div class="stars"></div><div class="tip">${COIN(30)}<span></span><div class="line" hidden></div></div>
        <button class="x3" type="button" aria-label="Watch a video to triple the tips">${HSC.icon ? HSC.icon('video', 26) : ''}<span></span>${COIN(24)}</button>`;
      score.querySelector('.x3').addEventListener('click', triple);
      document.body.append(reqEl, undoEl, score);
      Object.assign(this.el, { line: score.querySelector('.line'), req: reqEl, undo: undoEl, score, stars: score.querySelector('.stars'), tip: score.querySelector('.tip span'), x3: score.querySelector('.x3') });
      const scene = document.getElementById('scene') || document;
      scene.addEventListener('pointerdown', onDown, true);
      addEventListener('pointerup', onUp, true);
      addEventListener('pointercancel', onUp, true);
      setInterval(() => this.tick(), 60);
      addEventListener('pointerdown', () => { this.touching = true; }, true);
      for (const e of ['pointerup', 'pointercancel']) addEventListener(e, () => { this.touching = false; }, true);
    },
    coinPill() {},
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
    // the order's head at one angle, drawn once per customer
    reqPic(s, r, yaw) {
      const v = HSC.view;
      if (this.ring.has(yaw)) return this.ring.get(yaw);
      let url = null;
      try {
        if (r.beard) v.setBeard(r.beard);
        url = v.thumbnail(r.target || s.startHair, yaw * TURN, LEVEL, { size: 160, headOnly: true });
      } catch (e) { console.error('customers: request picture failed', e); }
      finally { if (r.beard) v.setBeard(s.beard); }
      if (url) this.ring.set(yaw, url);
      return url;
    },
    request(s) {
      const r = HSC.requestFor(s), el = this.el.req;
      if (!r) { el.hidden = true; return; }
      // one head with the cut he wants, always at the angle the barber is looking from
      const yaw = ((Math.round(s.cameraYawDeg / TURN) % TURNS) + TURNS) % TURNS, fresh = this.reqKey !== r.job + ':' + r.style.id;
      if (fresh) { this.reqKey = r.job + ':' + r.style.id; this.ring = new Map(); this.reqAt = null; }
      if (this.reqAt !== yaw) {
        const url = this.reqPic(s, r, yaw);
        if (!url) { el.hidden = true; this.reqKey = null; return; }
        el.querySelector('img').src = url;
        this.reqAt = yaw;
      }
      el.hidden = false;
      if (fresh) {
        el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
        el.classList.add('big'); clearTimeout(this.bigT); this.bigT = setTimeout(() => el.classList.remove('big'), 2600);
      }
      // the other angles fill in quietly, nearest first, never under a finger, so turning the customer stays smooth
      const now = performance.now();
      if (!this.touching && now - (this.reqFill || 0) > 220) {
        for (let d = 1; d <= TURNS / 2; d++) {
          const near = [(yaw + d) % TURNS, (yaw - d + TURNS) % TURNS].find((n) => !this.ring.has(n));
          if (near != null) { this.reqFill = now; this.reqPic(s, r, near); break; }
        }
      }
      // just below the top buttons (the coins and streak sit in that row)
      const row = document.querySelector('#hsc-hud .hsc-row'), top = document.querySelector('.ui .top'), S = HSC.S || 1;
      const b = Math.max(row ? row.getBoundingClientRect().bottom : 0, top ? top.getBoundingClientRect().bottom : 0);
      if (b > 0) el.style.top = (b + (document.querySelector('#hsc-rush.on') ? 22 : 10)) / S + 'px'; // clear of the Rush clock
    },
    scoreView() {
      const d = M() && M().data, last = d && d.lastRound, s = G() && G().getState();
      const show = !!(last && s && s.status === 'reveal' && last.job === s.jobId && document.body.classList.contains('hsc-reveal'));
      this.el.score.hidden = !show;
      if (!show) return;
      const stars = last.shownStars || last.stars;
      const key = last.job + ':' + stars;
      const plain = !!(last.free || last.judged); // no order to score: no stars, the coins and video stay in their place
      if (this.starKey !== key + ':' + plain) {
        this.starKey = key + ':' + plain;
        this.el.stars.innerHTML = plain ? '' : [1, 2, 3].map((n) => STAR(n <= stars)).join('');
      }
      this.el.tip.textContent = '+' + ((last.key ? last.paid : last.paid * (last.tripled ? 3 : 1)) + (last.mile || 0));
      // one coin number: the job, plus any milestone or level coins it brought
      const mile = EC() && EC().takeMilestones ? EC().takeMilestones() : 0;
      if (mile) last.mile = (last.mile || 0) + mile;
      // the shop bill, only on the job that charges it
      const lk = String(last.bill ? last.bill.amount : 0);
      if (this.el.line.dataset.k !== lk) {
        this.el.line.dataset.k = lk;
        this.el.line.innerHTML = last.bill ? `${HSC.icon ? HSC.icon('salon', 22) : ''}<span>−${last.bill.amount}</span>` : '';
        this.el.line.hidden = !last.bill;
      }
      const canX = !last.tripled && (last.key ? last.video > 0 : last.paid > 0) && !!(HSC.canVideo && HSC.canVideo());
      // nothing moves between modes: what does not apply keeps its place empty
      this.el.tip.parentNode.style.visibility = last.paid || last.mile ? '' : 'hidden';
      this.el.x3.style.visibility = canX ? '' : 'hidden';
      this.el.x3.hidden = false;
      if (canX) this.el.x3.querySelector('span').textContent = '+' + (last.key ? last.video : 2 * last.paid);
    },
    tick() {
      const g = G();
      if (!g || !M() || !M().data) return;
      const s = g.getState();
      this.coinPill(false);
      if (s.status === 'cutting') {
        this.request(s);
        if (undo.job !== s.jobId) { undo.job = s.jobId; undo.stack = []; }
        this.shownJob = null;
      } else this.el.req.hidden = true;
      this.undoButton();
      this.scoreView();
      this.lastStatus = s.status;
    },
  };
  const boot = () => { if (G() && document.body) ui.build(); else setTimeout(boot, 300); };
  boot();
})(globalThis.HSC || (globalThis.HSC = {}));
