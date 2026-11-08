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
  // a beard order only when the clipper's guards can really reach it: 85% of the beard it changes within one length of
  // the target, the 3-star line (the same test as Career's catalog)
  function beardReachable(start, t) {
    if (!HSC.beardReach) return true;
    const reach = HSC.beardReach();
    let need = 0, ok = 0;
    for (let i = 0; i < t.length; i++) {
      if (!(t[i] < start[i])) continue;
      need++;
      if (reach.some((l) => l <= start[i] && Math.abs(l - t[i]) <= 1)) ok++;
    }
    return !need || ok / need >= 0.85;
  }
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
    // the order once chosen is saved with the job, so a reload (the result screen too, after the order was noted as
    // recently asked) shows the same order and scores the same cut
    const md = M() && M().data && M().data.modes;
    const kept = md && md.ord && md.ord.n === s.jobId && md.ord.p === (p.seed >>> 0) && byId.get(md.ord.st);
    if (kept) {
      req.style = kept; req.target = targetFor(kept, s.startHair);
      if (md.ord.bs && Array.isArray(s.startBeard) && HSC.modes && HSC.modes.beardTarget) req.beard = HSC.modes.beardTarget(p, s.startBeard, md.ord.bs);
      return req;
    }
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
    let bs = null;
    if (HSC.modes && HSC.modes.beardJob && Array.isArray(s.startBeard) && R.next() < 0.5) {
      const j = HSC.modes.beardJob(p, s.startBeard, R);
      if (j && beardReachable(s.startBeard, j.target)) { req.beard = j.target; bs = j.style; }
    }
    if (md && byId.has(pick.style.id)) { md.ord = { n: s.jobId, p: p.seed >>> 0, st: pick.style.id, bs }; M().save(); }
    return req;
  };
  // the style a customer asked for on a job (meta.js keeps it as a regular's usual)
  HSC.requestStyleFor = (job) => (req.job === job && req.style && byId.has(req.style.id) ? req.style.id : null);
  // for modes.js: the cut catalogue and its rules
  HSC.requestKit = { STYLES, byId, targetFor, suit, askFor, startKind, worthCutting, fits };

  // ---- scoring (the engine's own match, patch18) ----
  // real work (modes.js): hair or beard really changed from the start; builds without the modes keep the stroke count
  const worked = (s) => !!s && (HSC.modes && HSC.modes.worked ? HSC.modes.worked(s) : s.cutStrokeCount > 0);
  // A cut is scored as two things measured apart, so the score is fair whatever the size of the order: the job done
  // (what was too long and now is not, as a share of what was too long at the start) and a slip (what is now shorter
  // than the order, weighed against the order's size but never against less than SLIP_FLOOR of the head). A small order
  // (most Rush tidy-ups, a few Orders) is no longer lost to one slip: it costs what it costs on a typical order (the
  // median Orders job changes about a fifth of the head, which scores exactly as before). A perfect cut is 3 stars, an
  // untouched head none of the job.
  const SLIP_FLOOR = 0.2;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  function cutScore(hair, start, target, w) {
    const match = HSC.requests.match, a = match(start, target, w);
    const longer = hair.map((v, i) => Math.max(v, target[i])), shorter = hair.map((v, i) => Math.min(v, target[i]));
    const job = a >= 0.999 ? 1 : clamp01((match(longer, target, w) - a) / (1 - a)), slip = 1 - match(shorter, target, w);
    return clamp01(job - slip / Math.max(1 - a, SLIP_FLOOR));
  }
  function starsFor(s) {
    if (!worked(s)) return 0;
    const r = HSC.requestFor(s);
    // no order: only the very first customer (the tutorial, a free cut) is a great cut by design; anyone else without
    // an order (none could be made for him) is never given stars he did not earn: the plain one star of any real cut
    if (!r) return s.look && s.look.person && s.look.person.first ? 3 : 1;
    const bs = r.beard && HSC.modes ? HSC.modes.beardStars(s, r) : null;
    if (bs != null && !r.target) return bs;
    if (!r.target || !HSC.requests || !HSC.requests.match) return 1;
    let w;
    try { w = G().getView().surface.weights; } catch (e) {}
    const n = cutScore(s.hair, s.startHair, r.target, w);
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
    for (const w of waiting.splice(0)) Promise.resolve(addCoins(w[0], w[1], w[2])).then(w[3], () => w[3](null));
  }
  // The result says whether the coins really landed: the economy's transaction (a repeated key is a duplicate, also
  // landed), true for the progress save, null when nothing was credited (a journal commit that failed). A caller
  // that owes coins for an earned video keeps what it owes until the result is truthy without .error. A credit made
  // while the journal is loading resolves once it has really been made.
  function addCoins(n, cat, key) {
    if (!(n > 0)) return Promise.resolve(null);
    if (!EC() && HSC.econ && HSC.econ.starting && HSC.econ.starting()) {
      if (!waiting.length) setTimeout(drain, 200);
      return new Promise((done) => waiting.push([n, cat, key || 'misc:' + Date.now().toString(36) + ':' + (miscKey++), done]));
    }
    if (EC()) return EC().earn(key || 'misc:' + Date.now().toString(36) + ':' + (miscKey++), cat || 'misc', Math.round(n)).then((r) => { ui.coinPill(true); return r || null; }, () => null);
    const d = M() && M().data;
    if (!d) return Promise.resolve(null);
    d.coins = Math.min(99999999, (d.coins || 0) + Math.round(n));
    M().save();
    ui.coinPill(true);
    return Promise.resolve(true);
  }
  const landed = (r) => !!r && !r.error;
  function spendCoins(price, cat, key) { if (EC()) return EC().spend(key, cat, price).then((ok) => { ui.coinPill(true); return ok; }); const d = M().data; d.coins -= price; M().save(); return Promise.resolve(true); }
  // a purchase that grants an item: atomic in the career journal when it is up (career-run.js buyItem)
  function buyItem(price, cat, key) { if (EC() && EC().buyItem) return EC().buyItem(key, cat, price).then((ok) => { ui.coinPill(true); return ok; }); return spendCoins(price, cat, key); }
  HSC.coins = { get: coins, add: addCoins, spend: spendCoins, buyItem };

  // a finished haircut: score it and pay, once per customer
  const done = HSC.onHaircutDone;
  // a result scored while the career journal is still loading (a reload at the reveal) would not know a Career
  // contract from an Orders job: the whole finish waits for the journal (or its failure), once per job
  let deferred = null;
  HSC.onHaircutDone = function (state) {
    if (HSC.econ && HSC.econ.starting && HSC.econ.starting()) {
      if (state && deferred !== state.jobId) {
        deferred = state.jobId;
        const retry = () => { if (HSC.econ.starting()) return setTimeout(retry, 200); deferred = null; HSC.onHaircutDone(state); };
        setTimeout(retry, 200);
      }
      return undefined;
    }
    try { scoreRound(state); } catch (e) { console.error('customers: scoring failed', e); }
    return done ? done.apply(this, arguments) : undefined;
  };
  // a job seen a second time (a reveal restored after a reload) pays nothing and is not a second customer
  let repeat = null;
  HSC.repeatJob = (job) => repeat === job;
  // who a job was: its number, the customer's seed and the engine session's seed. The engine's job numbers start again
  // at 1 if its session is ever replaced, so a number alone is not the same job: the seeds must match too (a saved
  // round from before they were kept has only its number)
  const u32 = (v) => (Number.isFinite(v) ? v >>> 0 : null);
  const whoOf = (s) => ({ job: s.jobId, p: u32(s.look && s.look.person && s.look.person.seed), sd: u32(s.seed) });
  const sameJob = (last, s) => {
    if (!last || last.job !== s.jobId) return false;
    const w = whoOf(s);
    return (last.p == null || w.p == null || last.p === w.p) && (last.sd == null || w.sd == null || last.sd === w.sd);
  };
  HSC.sameRound = sameJob; // the saved result belongs to this job (meta.js, progress.js may use it)
  function scoreRound(s) {
    const d = M() && M().data;
    if (!d || !s) return;
    // freestyle (modes.js) has no request: no stars, a flat tip
    const free = !!(HSC.modes && HSC.modes.unscored());
    const last = sameJob(d.lastRound, s) ? d.lastRound : null;
    repeat = last ? s.jobId : null;
    if (last) return finishRound(s, d, last.stars, free);
    // no order (Rescue, Beards): nothing is scored, and the set pay needs real work. The 2 is only a neutral record for Career
    const judged = !free && !!(HSC.modes && HSC.modes.judged && HSC.modes.judged(s));
    const stars = free ? (worked(s) ? 1 : 0) : judged ? (worked(s) ? 2 : 0) : starsFor(s), p = s.look && s.look.person;
    // the economy pays the job (economy.js): fee - cost + tip (stars, regular, VIP; capped)
    if (EC() && HSC.economy) { econRound(s, d, stars, free, p, judged); return finishRound(s, d, stars, free); }
    let base = free ? (stars ? 10 : 0) : tipsFor(p, stars);
    if (HSC.modes && stars) base = HSC.modes.tips(base, stars, s);
    d.lastRound = { ...whoOf(s), stars, tips: base, paid: base, tripled: false, free };
    addCoins(base);
    return finishRound(s, d, stars, free);
  }
  // the economy's round: one idempotent transaction per job (career jobs pay inside the career's own commit)
  function econRound(s, d, stars, free, p, judged) {
    // only the Career chair holds a contract: another mode's job may carry the same number
    const careerJob = HSC.modes && HSC.modes.current() === 'career' && HSC.careerRun && HSC.careerRun.active() && HSC.careerRun.active().job === s.jobId ? HSC.careerRun.active() : null;
    // (the Rush time bonus is for a job done well: 2 stars or more, modes.js)
    const mj = HSC.modes ? HSC.modes.econJob(s, stars) : { kind: 'requests' };
    const kind = careerJob ? (careerJob.role === 'showcase' ? 'showcase' : careerJob.mode) : HSC.modes && HSC.modes.current() === 'free' ? 'free' : mj.kind;
    // real work, never the stroke counter (an undo of every stroke leaves nothing done)
    const valid = stars > 0 && worked(s);
    const job = { kind, stars, judged, valid, regular: !!(p && p.regular) || !!(careerJob && careerJob.regular), vip: !!(p && p.vip), rushBonus: valid && stars >= 2 ? mj.rushBonus || 0 : 0,
      // the first paid jobs forgive a weak cut (economy CONFIG.early): counted by paid real work, so practice never uses them up
      early: valid && (d.cuts | 0) < HSC.economy.CONFIG.early.jobs };
    // a demand shift's highlighted mode pays its bonus (never Quick Play)
    if (valid && EC() && EC().demandMatch) job.demandMatch = EC().demandMatch(careerJob ? careerJob.mode : kind);
    // Quick Play: a little for real work, up to a daily limit; keyed, so a reload cannot pay twice
    const quick = HSC.modes && HSC.modes.current() === 'free' && valid && EC() && quickDay().n < HSC.economy.CONFIG.quickPlay.perDay ? HSC.economy.CONFIG.quickPlay.pay : 0;
    const qkey = quick ? 'quick:' + quickDay().day + ':' + (quickDay().n + 1) : null;
    if (quick) quickDay().n++;
    // every job the economy pays has its own number in this install: the engine's job number starts again at 1 if its
    // session is ever replaced, and a reused key would pay nothing
    if (!careerJob) d.jobSeq = (Number.isSafeInteger(d.jobSeq) ? d.jobSeq : 0) + 1;
    const key = careerJob ? careerJob.id : 'job:' + (d.firstDay || '') + ':n' + d.jobSeq;
    const pay = HSC.economy.payout(job);
    const practice = kind === 'free', earned = !valid ? 0 : !practice ? HSC.economy.videoPay(pay.tip) : practiceDay().n < HSC.economy.CONFIG.video.practicePerDay ? HSC.economy.videoPay(0) : 0;
    // the roll is made once and saved with the result, so a reload cannot change it
    const md = d.modes, wait = md && Number.isSafeInteger(md.wait) ? md.wait : 0;
    // a level-up is a moment of joy: the video is always there for it
    const levelUp = !practice && HSC.meta && HSC.meta.levelOf(d.cuts + 1) > HSC.meta.levelOf(d.cuts);
    const video = earned > 0 && (wait <= 0 || levelUp) ? earned : 0;
    if (md && earned > 0) md.wait = video ? HSC.economy.videoWait(Math.random()) : wait - 1;
    // the result router (ad-router.js): a newly completed customer opens one commercial break; a customer finished
    // with no change from his start (incomplete) opens none
    if (HSC.adRouter) HSC.adRouter.completed(s.jobId, s.cutStrokeCount > 0 || (Array.isArray(s.hair) && Array.isArray(s.startHair) && s.hair.some((v, i) => v !== s.startHair[i])));
    d.lastRound = { ...whoOf(s), seq: careerJob ? undefined : d.jobSeq, key, stars, tips: pay.tip, tip: pay.tip, paid: pay.total + quick, lines: pay.lines, tripled: false, free: free || kind === 'free', judged, video };
    HSC.lastJob = { key, job, s };
    // the pay waits in the saved result until the economy has committed it: an app killed in between pays it at the
    // next start (the same keys, so it can never pay twice). Career jobs pay inside the career's own commit.
    const pend = {};
    if (!careerJob && valid && pay.total) pend.job = job;
    if (qkey) pend.quick = [qkey, quick];
    if (pend.job || pend.quick) d.lastRound.pend = pend;
    settle(d.lastRound);
  }
  // commit what a result still owes (also on the next start, recover below); each part clears once committed
  function settle(last) {
    const pend = last && last.pend, E = EC();
    if (!pend || !E) return;
    const clear = (part) => { if (last.pend) { delete last.pend[part]; if (!last.pend.job && !last.pend.quick) delete last.pend; } M().save(); };
    if (pend.quick) E.earn(pend.quick[0], 'job', pend.quick[1]).then((r) => { if (landed(r)) clear('quick'); else later(); ui.coinPill(true); }).catch(later);
    if (pend.job) E.payJob(last.key, pend.job).then((paid) => {
      if (paid && paid.bill && !last.bill) { last.bill = paid.bill; last.lines = (last.lines || []).concat(paid.bill.lines || []); }
      if (landed(paid)) clear('job'); else later();
      ui.coinPill(true);
    }).catch(later);
  }
  // A result left owing by an app killed before the economy committed it, a wish video's coins and a tripled tip:
  // paid at the next start, and again a few seconds after a commit that failed in this session (a full disk, a slow
  // bridge). Every credit is keyed, so a retry can never pay twice.
  let recovered = false, retryAt = 0;
  function later() { if (!retryAt) retryAt = performance.now() + 4000; }
  function recover() {
    if (!HSC.econ || (HSC.econ.starting && HSC.econ.starting())) return;
    if (recovered && !(retryAt && performance.now() >= retryAt)) return;
    recovered = true; retryAt = 0;
    if (!EC()) return;
    const d = M() && M().data;
    if (d && d.lastRound && d.lastRound.pend && d.lastRound.key) settle(d.lastRound);
    const wv = d && d.modes && d.modes.wv, c = HSC.economy && HSC.economy.CONFIG.wishVideo;
    if (wv && wv.pend && c) { const k = wv.pend; addCoins(c.coins, 'rewarded', k).then((r) => { if (!landed(r)) return later(); if (wv.pend === k) wv.pend = null; M().save(); }); }
    if (d && d.lastRound && owesTriple(d.lastRound)) payTriple(d.lastRound);
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
  // one stroke is everything from the first finger down to that finger up: a second finger (a turn, a pinch) neither
  // starts a new snapshot mid-stroke nor ends the stroke. A primary pointer going down means no other finger is
  // down, so it always starts afresh (an up that never arrived cannot block undo)
  function onDown(e) {
    const g = G();
    if (!g || e.button > 0) return;
    if (undo.snap && e.isPrimary === false) return;
    const s = g.getState();
    if (s.status !== 'cutting') return;
    undo.snap = { job: s.jobId, hair: s.hair, beard: s.beard, brow: s.brow, pid: e.pointerId };
  }
  function onUp(e) {
    const g = G(), snap = undo.snap;
    if (snap && e && e.pointerId != null && snap.pid != null && e.pointerId !== snap.pid) return;
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
  // (coins still owed from an earlier wish video stay owed across midnight, and a new one waits until they land: the
  // save holds one owed wish video)
  const wishDay = () => { const md = M().data.modes, day = M().today(); if (!md.wv || md.wv.day !== day) md.wv = { day, n: 0, pend: (md.wv && md.wv.pend) || null }; return md.wv; };
  const canWishVideo = () => { const c = HSC.economy && HSC.economy.CONFIG.wishVideo; return !!(c && M() && M().data && M().data.modes && HSC.canVideo && HSC.canVideo() && wishDay().n < c.perDay && !wishDay().pend); };
  HSC.wishVideo = { state: () => { const c = HSC.economy && HSC.economy.CONFIG.wishVideo; return canWishVideo() ? { coins: c.coins, left: c.perDay - wishDay().n } : null; }, run: () => wishVideo() };
  async function wishVideo() {
    if (!canWishVideo()) return;
    const ok = HSC.watchVideo ? await HSC.watchVideo('wish-coins') : false;
    if (!ok) return; // only a really earned video pays
    const w = wishDay(), c = HSC.economy.CONFIG.wishVideo;
    w.n++;
    // the coins wait in the save until the economy has them (also while the journal is still loading): an app killed
    // in between, or a commit that failed, pays them later (recover)
    const key = 'wish:' + w.day + ':' + w.n;
    w.pend = key; M().save();
    const r = await addCoins(c.coins, 'rewarded', key);
    if (!landed(r)) return later();
    if (w.pend === key) w.pend = null;
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
      // the video is earned: `tripled` is saved at once and means the two more tips are owed. The economy's round counts
      // them in its total only once its keyed commit has landed (payTriple); until then recover() commits it again
      last.tripled = true;
      if (last.free) practiceDay().n++;
      M().save();
      if (EC() && last.key) payTriple(last);
      else addCoins(last.paid * 2); // the old round (no economy) multiplies on show
    } else if (!ok) { HSC.nope && HSC.nope(b); b.disabled = false; }
    ui.scoreView();
  }
  // a tripled tip the economy has not got yet: the round's own key is still in the economy's key ring (so the check is
  // exact) and its triple key is not; it is committed this session only once (`x3in`), retried after a failure
  const x3Key = (last) => last.key + ':triple';
  function owesTriple(last) {
    const st = EC() && EC().state && EC().state();
    if (!last.tripled || !last.key || last.x3in || last.x3busy || !st || !Array.isArray(st.keys)) return false;
    return st.keys.includes(last.key) && !st.keys.includes(x3Key(last));
  }
  function payTriple(last) {
    if (last.x3busy || last.x3in) return;
    last.x3busy = true;
    EC().triple(last.key, last.tip || 0).then((r) => {
      last.x3busy = false;
      if (!landed(r)) return later();
      // (a duplicate: an earlier commit landed, shown once)
      last.x3in = true; last.paid += last.video; M().save();
      ui.coinPill(true); ui.scoreView();
    }, () => { last.x3busy = false; later(); });
  }

  // ---- UI ----
  const STAR = (on) => `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc83d' : 'none'}" stroke="${INK}"${on ? '' : ' stroke-dasharray="2.6 2.2" opacity=".55"'} stroke-width="2" stroke-linejoin="round"/></svg>`;
  const COIN_OLD = (s = 26) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><circle cx="12" cy="12" r="9.5" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a12" stroke-width="1.8"/><path d="M10.6 8.6h2.8v6.8" fill="none" stroke="#c98a12" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const COIN = (s = 26) => (HSC.icon ? HSC.icon('coin', s) : COIN_OLD(s)); // the theme's one coin (icons.js)
  const UNDO = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7H15a5 5 0 0 1 0 10H8"/><path d="M11.5 3.5L7.5 7l4 3.5"/></svg>';
  const CSS = `
#hsc-req,#hsc-undo,#hsc-score{zoom:var(--hsc-s,1);font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};-webkit-user-select:none;user-select:none}
#hsc-req{--k:1;position:fixed;z-index:20;left:calc(50% - 53px);top:calc(env(safe-area-inset-top) / var(--hsc-s,1) + 72px);transform:scale(var(--k));transform-origin:50% 100%;pointer-events:auto;cursor:pointer;
  display:flex;gap:4px;padding:6px;border-radius:22px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};transition:transform .25s,left .25s,top .25s}
#hsc-req img{width:88px;height:88px;border-radius:15px;display:block;background:radial-gradient(circle at 50% 35%,#fff,#e4d2b4)}
#hsc-req::after,#hsc-req::before{content:"";position:absolute;border-radius:50%;background:#fff6e6;border:3px solid ${INK}}
#hsc-req::after{width:14px;height:14px;left:calc(50% - 6px);bottom:-24px}
#hsc-req::before{width:8px;height:8px;left:calc(50% + 8px);bottom:-38px}
#hsc-req.flip::after{left:calc(50% - 14px)}
#hsc-req.flip::before{left:calc(50% - 22px)}
#hsc-req[data-tail=r]::after,#hsc-req[data-tail=l]::after{bottom:auto;top:calc(72% - 10px)}
#hsc-req[data-tail=r]::before,#hsc-req[data-tail=l]::before{bottom:auto;top:calc(72% + 8px)}
#hsc-req[data-tail=r]::after{left:auto;right:-24px}
#hsc-req[data-tail=r]::before{left:auto;right:-38px}
#hsc-req[data-tail=l]::after{left:-24px}
#hsc-req[data-tail=l]::before{left:-38px}
#hsc-req.pop{animation:hsc-reqpop .6s ease-out}
#hsc-req.thru,#hsc-req.clash{pointer-events:none}
@keyframes hsc-reqpop{0%{transform:scale(calc(var(--k) * .4));opacity:0}70%{transform:scale(calc(var(--k) * 1.1));opacity:1}100%{transform:scale(var(--k))}}
#hsc-req[hidden],#hsc-undo[hidden],#hsc-score[hidden],#hsc-score [hidden]{display:none}
body.hsc-reveal #hsc-req,body.hsc-spin #hsc-req,body.hsc-reveal #hsc-undo,body.hsc-spin #hsc-undo{display:none}
#hsc-undo{position:fixed;z-index:20;width:56px;height:56px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;background:#fff6e6;color:${INK};border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer}
#hsc-undo:active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
#hsc-undo:disabled{opacity:.6}
#hsc-undo .hsc-ad,#hsc-score .hsc-ad{position:absolute;right:-8px;bottom:-6px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#ffb627;color:${INK};border:2.5px solid ${INK}}
.hsc-coins{pointer-events:auto;position:relative}
.hsc-coins svg{flex:none}
.hsc-coins.bump{animation:hsc-pop .45s ease-out}
#hsc-score{--k:1;position:fixed;z-index:21;left:calc(50% - 75px);top:calc(env(safe-area-inset-top) / var(--hsc-s,1) + 14px);transform:scale(var(--k));transform-origin:0 0;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
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
  // ---- where the order and the result sit: never on the customer's head ----
  // The camera is the owner's and stays put, so these move instead. Each is placed against the head's box on
  // screen (the engine's headScreen), the controls, the safe-area cut-outs and the screen edges: above the head
  // when it fits, otherwise beside it on the free side, shrinking (never below `kMin`) only when it must. Worked
  // out in screen pixels; the layers are drawn at the UI scale S, so a position is divided by S when it is set.
  // Kinds: 'above' (over the head, tail down), 'left' / 'right' (beside it, tail toward him), 'downL' / 'downR' (beside
  // his head under the top buttons, tail down: narrower than a side bubble, for a head that fills the screen's width).
  const place = {
    probe: null,
    // the safe-area insets in screen pixels (env() inside a zoomed layer would be multiplied by S)
    insets() {
      let p = this.probe;
      if (!p || !p.isConnected) {
        p = this.probe = document.createElement('div');
        p.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
        document.body.appendChild(p);
      }
      const c = getComputedStyle(p), n = (v) => parseFloat(v) || 0;
      return { t: n(c.paddingTop), r: n(c.paddingRight), b: n(c.paddingBottom), l: n(c.paddingLeft) };
    },
    // The head's box costs the engine a pass over the head mesh (2 ms, over 10 on a slow phone), so it is kept while
    // the camera, the customer and the canvas are unchanged. Right after any change it is measured again every call
    // (at most once a tick), in case the engine settles a frame later; `moved` is when the camera last moved.
    hc: { key: null, box: null, at: -1e9, moved: -1e9 },
    headKey() {
      try {
        const g = G(), s = g && g.getState(), c = document.querySelector('#scene canvas') || document.querySelector('canvas'), r = c && c.getBoundingClientRect();
        return s && r ? [s.jobId, s.status, s.cameraYawDeg, s.cameraElevation, r.left, r.top, r.width, r.height, innerWidth, innerHeight].join() : null;
      } catch (e) { return null; }
    },
    head() {
      const now = performance.now(), c = this.hc, key = this.headKey();
      if (key !== c.key) { c.key = key; c.moved = now; c.at = -1e9; }
      if (key && c.box && (now - c.at < 50 || (now - c.moved > 600 && now - c.at < 2000))) return c.box;
      let h = null, box;
      try { const g = G(); h = g && g.headScreen ? g.headScreen() : HSC.view && HSC.view.headScreen ? HSC.view.headScreen() : null; } catch (e) { h = null; }
      if (h && [h.left, h.top, h.right, h.bottom].every(Number.isFinite) && h.right > h.left && h.bottom > h.top) box = { l: h.left, t: h.top, r: h.right, b: h.bottom };
      // no box yet: keep clear of the middle of the screen, where the head always is (not kept)
      else return { l: innerWidth * 0.3, t: innerHeight * 0.2, r: innerWidth * 0.7, b: innerHeight * 0.6 };
      c.box = box; c.at = now;
      return box;
    },
    // the camera (or the screen) changed within the last `ms`: placements check every tick while it moves
    moving(ms = 400) { this.headKey() !== this.hc.key && this.head(); return performance.now() - this.hc.moved < ms; },
    // the boxes of what is on screen and must stay uncovered
    rects(sel, skip) {
      const out = [];
      for (const e of document.querySelectorAll(sel)) {
        if (skip && skip.contains(e)) continue;
        if (e.checkVisibility ? !e.checkVisibility({ visibilityProperty: true }) : !e.offsetParent && getComputedStyle(e).position !== 'fixed') continue;
        const r = e.getBoundingClientRect();
        if (r.width > 1 && r.height > 1) out.push({ l: r.left, t: r.top, r: r.right, b: r.bottom });
      }
      return out;
    },
    hit: (a, b, m = 0) => a.l < b.r + m && a.r > b.l - m && a.t < b.b + m && a.b > b.t - m,
    // the whole space a placement takes: the box (w x h at scale k) and its tail toward the head
    down: (kind) => kind === 'above' || kind === 'downL' || kind === 'downR' || kind === 'cornerL' || kind === 'cornerR',
    corner: (kind) => kind === 'cornerL' || kind === 'cornerR',
    // The head itself in its box: the engine's box is the scalp's, so it is square at the corners where a round head
    // is not, and the hair stands out past it (about a tenth of the head's height on top). A corner spot is tested
    // against this oval: the box's own oval grown by the gap and that hair. A rectangle clears it when its point
    // nearest the oval's centre lies outside it.
    oval(h, gap) { const hh = h.b - h.t, m = gap + 0.12 * hh; return { x: (h.l + h.r) / 2, y: (h.t + h.b) / 2, a: (h.r - h.l) / 2 + m, b: hh / 2 + m }; },
    offOval(r, e) { const qx = Math.max(r.l, Math.min(e.x, r.r)), qy = Math.max(r.t, Math.min(e.y, r.b)), dx = (qx - e.x) / e.a, dy = (qy - e.y) / e.b; return dx * dx + dy * dy > 1; },
    span(kind, x, y, k, o) {
      const dn = this.down(kind);
      return { l: x, t: y, r: x + (o.w + (dn ? 0 : o.tail)) * k, b: y + (o.h + (dn ? o.tail : 0)) * k };
    },
    ok(kind, x, y, k, o) {
      const a = this.span(kind, x, y, k, o), B = o.bounds, h = o.head;
      if (a.l < B.l - 0.5 || a.t < B.t - 0.5 || a.r > B.r + 0.5 || a.b > B.b + 0.5) return false;
      if (!this.corner(kind) && this.hit(a, h, o.gap)) return false;
      for (const r of o.avoid) if (this.hit(a, r, o.pad)) return false;
      // in a top corner beside the top buttons, the tail down toward his head (a head that fills a tablet leaves no
      // room above it): the box and the tail's dots (the middle of its width) clear his head's oval, and the tail ends
      // level with his head's upper half, on his side of it
      if (this.corner(kind)) {
        const e = this.oval(h, o.gap), bw = o.w * k, cx = x + bw / 2;
        if (!this.offOval({ l: x, t: y, r: x + bw, b: y + o.h * k }, e) || !this.offOval({ l: cx - bw * 0.2, t: y + o.h * k, r: cx + bw * 0.2, b: a.b }, e)) return false;
        if (y + o.h * k > h.t || a.b < h.t || a.b > e.y) return false; // the box over the top of his head, the tail beside it
        return kind === 'cornerL' ? cx <= e.x - (h.r - h.l) * 0.15 : cx >= e.x + (h.r - h.l) * 0.15;
      }
      // the box belongs to the customer: above him it is over his head, beside him it is level with it
      if (kind === 'above') { const cx = (a.l + a.r) / 2; return a.b <= h.t && cx >= h.l && cx <= h.r; }
      if ((kind === 'left' || kind === 'downL') && a.r > h.l) return false;
      if ((kind === 'right' || kind === 'downR') && a.l < h.r) return false;
      // a tail down beside him ends level with the top of his head
      if (kind === 'downL' || kind === 'downR') return a.b >= h.t && a.b <= h.t + (h.b - h.t) * 0.6;
      if (o.tail) { const ty = y + o.h * k * 0.72; return ty >= h.t && ty <= h.b; }
      return true;
    },
    // the nearest free spot for one kind at scale k, or null
    at(kind, k, o) {
      const dn = this.down(kind), p = o.pref(kind, k), W = (o.w + (dn ? 0 : o.tail)) * k, H = (o.h + (dn ? o.tail : 0)) * k;
      const hd = o.head, ty = o.h * k * 0.72; // the side tail's height on the box
      const xs = [p.x, o.bounds.l, o.bounds.r - W, hd.l - o.gap - W, hd.r + o.gap, hd.l - W / 2 + 1, hd.r - W / 2 - 1, hd.l, hd.r - W];
      const ys = [p.y, o.bounds.t, o.bounds.b - H, hd.t - o.gap - H, hd.t, hd.t - ty + 1, hd.b - ty - 1, hd.t - H + 1, hd.t + (hd.b - hd.t) * 0.6 - H - 1];
      for (const r of o.avoid) xs.push(r.r + o.pad + 0.5, r.l - o.pad - W - 0.5), ys.push(r.b + o.pad + 0.5, r.t - o.pad - H - 0.5);
      let best = null;
      for (const x of xs) for (const y of ys) {
        const cost = Math.abs(x - p.x) + Math.abs(y - p.y);
        if ((!best || cost < best.cost) && this.ok(kind, x, y, k, o)) best = { kind, x, y, k, cost };
      }
      return best;
    },
    // the biggest scale (up to kMax) at which each kind fits, then the best kind; null when nothing fits at kMin. The
    // first kind has a `bonus`, the kind it already shows (`prev`) a `keep` bonus, so it does not hop sides as he turns
    best(o) {
      let win = null;
      for (const kind of o.kinds) {
        const bonus = (kind === o.kinds[0] ? o.bonus || 0 : 0) + (kind === o.prev ? o.keep || 0 : 0);
        if (win && win.score >= o.kMax + bonus) continue; // already the full size: nothing can beat it
        let got = this.at(kind, o.kMin, o);
        if (!got) continue;
        const top = this.at(kind, o.kMax, o);
        if (top) got = top;
        else {
          let a = o.kMin, b = o.kMax;
          for (let i = 0; i < 6; i++) { const m = (a + b) / 2, r = this.at(kind, m, o); if (r) { a = m; got = r; } else b = m; }
        }
        // (the first kind's bonus holds only at `firm` size or more: below it, any spot clearly bigger wins)
        const score = got.k + (got.k >= (o.firm || 0) || kind !== o.kinds[0] ? bonus : bonus - (o.bonus || 0));
        if (!win || score > win.score + 1e-6) win = { ...got, score };
      }
      // a little smaller is better than far from its own place (a corner of the screen): `slack` of the scale is traded
      if (win && o.slack) { const near = this.at(win.kind, Math.max(o.kMin, win.k - o.slack), o); if (near && near.cost < win.cost - (o.W + o.H) * 0.1) win = { ...near, score: win.score }; }
      return win;
    },
    // The order bubble: N px square at scale 1 with a tail of T px, first choice just below the top buttons (`below`)
    // over his head; then beside him; then beside his head (or in a top corner beside the top buttons) with the tail
    // down, which wins whenever it is clearly bigger than a small bubble over his head (a tablet's head fills its
    // width and comes up near the top). While it is
    // enlarged (`big`) it grows only where it still clears everything, on the side it already sits if it can. Null
    // when nothing fits even at half size.
    order(f, avoid, below) {
      const { N, T, head: hd } = f;
      const pref = (kind, k) => kind === 'above' ? { x: (hd.l + hd.r - N * k) / 2, y: below }
        : kind === 'left' ? { x: hd.l - f.gap - (N + T) * k, y: hd.t - 0.2 * N * k } : kind === 'right' ? { x: hd.r + f.gap, y: hd.t - 0.2 * N * k }
        : kind === 'downL' ? { x: hd.l - f.gap - N * k, y: below } : kind === 'downR' ? { x: hd.r + f.gap, y: below }
        : kind === 'cornerL' ? { x: hd.l, y: f.bounds.t } : { x: hd.r - N * k, y: f.bounds.t };
      return { ...f, w: N, h: N, tail: T, avoid, pref, kMin: 0.5, kMax: 1, bonus: 0.15, firm: 0.75, keep: 0.1, kinds: ['above', 'left', 'right', 'downL', 'downR', 'cornerL', 'cornerR'] };
    },
    orderSpot(o, big, prev) {
      const normal = this.best({ ...o, prev });
      if (!big || !normal) return normal;
      const grow = { ...o, kMin: Math.min(1.8, normal.k + 0.15), kMax: 1.8 };
      return (prev && this.best({ ...grow, kinds: [prev] })) || this.best(grow) || normal;
    },
    // the result column: cw px wide (w with the bill that hangs off it) by h; over the head, or centred in the free side.
    // `x3`: the video button's own size at scale 1 ({w, h} screen px) while it is offered
    result(f, avoid, cw, w, h, x3) {
      const hd = f.head, top = f.ins.t + 14 * f.S;
      const pref = (kind, k) => kind === 'above' ? { x: (hd.l + hd.r - cw * k) / 2, y: top }
        : kind === 'left' ? { x: (f.bounds.l + hd.l - f.gap - cw * k) / 2, y: top } : { x: (hd.r + f.gap + f.bounds.r - cw * k) / 2, y: top };
      // the video button is never a touch under 44 px: the column takes the free side before it shrinks under that
      return { ...f, w, h, cw, x3, tail: 0, avoid, pref, kMin: x3 ? Math.max(0.5, Math.min(1, 44 / x3.h)) : 0.5, kMax: 1, bonus: 0.05, slack: 0.1, kinds: ['above', 'left', 'right'] };
    },
    // the result's spot. Where even that does not fit (a small phone's head fills the screen) the column shrinks on
    // to half size but its video button does not: it is drawn `x3z` times its scale (44 px tall), and the column's
    // larger box (w2 x h2 at scale 1) is what must clear the head
    resultSpot(o) {
      const spot = this.best(o);
      if (spot || !o.x3) return spot && { ...spot, x3z: 1, w2: o.w, h2: o.h };
      for (let k = o.kMin - 0.02; k >= 0.5 - 1e-9; k -= 0.02) {
        const z = 44 / (o.x3.h * k), w2 = o.w + Math.max(0, o.x3.w * z - o.cw), h2 = o.h + o.x3.h * (z - 1);
        const got = this.best({ ...o, w: w2, h: h2, kMin: k, kMax: k, slack: 0 });
        if (got) return { ...got, x3z: z, w2, h2 };
      }
      return null;
    },
    // everything a placement needs from the screen right now
    frame(extra) { return this.frameOf(innerWidth, innerHeight, HSC.S || 1, this.insets(), this.head(), extra); },
    // a screen W x H at UI scale S: 6 px (at S) clear of the head and of each control, 8 px inside the safe area
    frameOf(W, H, S, ins, head, extra) {
      const m = 8 * S;
      return { S, W, H, ins, head, gap: 6 * S, pad: 6 * S, bounds: { l: ins.l + m, t: ins.t + m, r: W - ins.r - m, b: H - ins.b - m }, ...extra };
    },
  };
  // other layers (the mode toast) ask for a free spot the same way
  HSC.uiPlace = {
    // a box of w x h screen px: the free spot nearest the top of the screen, off the head; {x, y, k}
    spot(w, h, avoid = []) {
      const f = place.frame({ w, h, tail: 0, kMax: 1, kMin: 0.5, bonus: 0.05, kinds: ['above', 'left', 'right'] });
      const ctl = place.rects('.ui button,#hsc-hud button,#hsc-rush.on,#hsc-dock,#hsc-score:not([hidden]),#hsc-req:not([hidden])');
      const o = { ...f, avoid: ctl.concat(avoid) };
      o.pref = (kind, k) => kind === 'above' ? { x: (f.head.l + f.head.r - w * k) / 2, y: f.bounds.t } : kind === 'left' ? { x: (f.bounds.l + f.head.l - f.gap - w * k) / 2, y: f.bounds.t } : { x: (f.head.r + f.gap + f.bounds.r - w * k) / 2, y: f.bounds.t };
      return place.best(o) || { x: (f.W - w * 0.5) / 2, y: f.bounds.t, k: 0.5 };
    },
    head: () => place.head(),
    place, // the placement rules themselves, for android/tests/fix-scale-game.cjs
  };
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
      reqEl.addEventListener('click', () => this.big(!reqEl.classList.contains('big')));
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
      for (const e of ['pointerup', 'pointercancel']) addEventListener(e, () => { this.touching = false; reqEl.classList.remove('thru'); }, true);
      // a stroke that starts on the customer never ends on the bubble: it lets every touch through until the finger lifts
      scene.addEventListener('pointerdown', () => reqEl.classList.add('thru'), true);
    },
    coinPill() {},
    undoButton() {
      const g = G(), b = this.el.undo;
      if (!g || !b) return;
      const s = g.getState();
      const show = s.status === 'cutting' && undo.job === s.jobId && undo.stack.length > 0 && !!(HSC.canVideo && HSC.canVideo());
      b.hidden = !show;
      if (!show) return;
      const u = this.undoSpot(), S = HSC.S || 1;
      Object.assign(b.style, { left: u.l / S + 'px', top: u.t / S + 'px' });
    },
    // under the top-left buttons; the order keeps clear of this spot even before the button appears
    undoSpot() {
      const row = document.querySelector('#hsc-hud .hsc-row'), S = HSC.S || 1;
      const r = row && row.getBoundingClientRect();
      const left = document.querySelector('.ui .top button');
      const lr = left && left.getBoundingClientRect();
      const x = lr && lr.width ? lr.left : r ? r.left : 12, y = Math.max(r ? r.bottom : 0, lr ? lr.bottom : 0) + 14;
      return { l: x, t: y, r: x + 56 * S, b: y + 56 * S };
    },
    // the order grows for a closer look (a tap, or a new customer for 2.6 s) only where it still clears the head
    big(on, fresh) {
      const el = this.el.req;
      clearTimeout(this.bigT);
      el.classList.toggle('big', on);
      if (on) this.bigT = setTimeout(() => this.big(false), 2600);
      if (!fresh) this.placeReq(true);
    },
    // the order: above the head when it fits with its tail, otherwise beside it with the tail toward him
    placeReq(force, appear) {
      const el = this.el.req, now = performance.now();
      // checked every 200 ms, and every tick while the camera moves (his head can turn or tilt under it)
      if (!el || el.hidden || (!force && now - (this.reqT || 0) < 200 && !place.moving())) return;
      this.reqT = now;
      const S = HSC.S || 1, N = 106 * S, T = 40 * S, big = el.classList.contains('big'); // 88 px picture + padding + border; tail dots
      const rush = document.querySelector('#hsc-rush.on');
      const f = place.frame({ N, T }), hd = f.head;
      const avoid = place.rects('.ui button,#hsc-hud button,#hsc-rush.on', el);
      if (HSC.canVideo && HSC.canVideo()) avoid.push(this.undoSpot());
      // first choice as before: just below the top buttons (and clear of the Rush clock), over his head
      const row = document.querySelector('#hsc-hud .hsc-row'), bar = document.querySelector('.ui .top');
      const below = Math.max(f.bounds.t, row ? row.getBoundingClientRect().bottom : 0, bar ? bar.getBoundingClientRect().bottom : 0, rush ? rush.getBoundingClientRect().bottom : 0) + (rush ? 12 : 10) * S;
      const key = [f.W, f.H, S, f.ins.t, f.ins.r, f.ins.b, f.ins.l, !!rush, big].join();
      const cur = this.reqSpot;
      const o = place.order(f, avoid, below);
      const clear = cur && cur.key === key && !cur.clash && place.ok(cur.kind, cur.x, cur.y, cur.k, o), still = !force && clear;
      // it stays where it is while that is still clear; it only moves for a clearly bigger spot, never under a finger
      if (still && (now - cur.at < 1500 || this.touching)) return;
      let spot = place.orderSpot(o, big, cur && !appear ? cur.kind : null); // a new customer starts afresh
      if (still && (!spot || spot.k < cur.k + 0.1)) { cur.at = now; return; }
      if (!spot) {
        // nowhere clear even at half size (not seen on any screen): the smallest bubble, and touches go through it
        const k = 0.5;
        spot = { kind: 'above', x: Math.max(f.bounds.l, Math.min(f.bounds.r - N * k, (hd.l + hd.r - N * k) / 2)), y: below, k, clash: true };
      }
      const k = spot.k, tail = place.down(spot.kind) ? 'b' : spot.kind === 'left' ? 'r' : 'l';
      const bx = spot.kind === 'right' ? spot.x + T * k : spot.x, by = spot.y;
      const ox = tail === 'b' ? 0.5 : tail === 'r' ? 1 : 0, oy = tail === 'b' ? 1 : 0.72;
      // a new customer's bubble appears in place, a move to another side jumps, and so does a bubble his head has turned
      // or tilted into: it never slides across his head
      if (appear || !clear || (cur && cur.kind !== spot.kind)) el.style.transition = 'none';
      el.dataset.tail = tail;
      // the second dot leans toward his head
      el.classList.toggle('flip', tail === 'b' && (hd.l + hd.r) / 2 < bx + N * k / 2);
      el.classList.toggle('clash', !!spot.clash);
      el.style.transformOrigin = `${ox * 100}% ${oy * 100}%`;
      el.style.setProperty('--k', k.toFixed(3));
      el.style.left = (bx - ox * N * (1 - k)) / S + 'px';
      el.style.top = (by - oy * N * (1 - k)) / S + 'px';
      if (el.style.transition) { void el.offsetWidth; el.style.transition = ''; }
      this.reqSpot = { ...spot, key, at: now };
    },
    // the result (stars, coins, the video): over the head in portrait, in the free half beside it in landscape
    placeScore(force) {
      const el = this.el.score, now = performance.now();
      if (!force && now - (this.scoreT || 0) < 200) return;
      this.scoreT = now;
      const S = HSC.S || 1, k0 = this.scoreK || 1, x3 = this.el.x3, z0 = x3.style.zoom;
      // its own size (the video button measured at its own scale), with the bill that hangs off the coins to the right
      if (z0) x3.style.zoom = '';
      const r = el.getBoundingClientRect(), xr = x3.getBoundingClientRect(), ln = this.el.line, lr = !ln.hidden && ln.getBoundingClientRect();
      if (z0) x3.style.zoom = z0;
      if (!r.width) return;
      const cw = r.width / k0, w = (Math.max(r.right, lr && lr.width ? lr.right : 0) - r.left) / k0, h = r.height / k0;
      const offer = x3.style.visibility !== 'hidden' && !x3.hidden && xr.height > 0 ? { w: xr.width / k0, h: xr.height / k0 } : null;
      const f = place.frame({});
      const avoid = place.rects('.ui button,#hsc-hud button,#hsc-hub button,.hsc-next,#hsc-dock,.training-continue', el);
      const key = [f.W, f.H, S, f.ins.t, f.ins.r, f.ins.b, f.ins.l, Math.round(w / 4), Math.round(h / 4), !!offer].join(); // a pixel of rounding is no change
      const o = place.result(f, avoid, cw, w, h, offer);
      const cur = this.scoreSpot, still = !force && cur && cur.key === key && place.ok(cur.kind, cur.x, cur.y, cur.k, { ...o, w: cur.w2, h: cur.h2 });
      // it stays put while it is clear (the video button must not move under a finger), unless a clearly bigger spot opens
      if (still && (now - cur.at < 1500 || this.touching)) return;
      let spot = place.resultSpot(o);
      if (still && (!spot || spot.k < cur.k + 0.1)) { cur.at = now; return; }
      if (!spot) spot = { kind: 'above', x: Math.max(f.bounds.l, (f.W - cw * o.kMin) / 2), y: f.ins.t + 14 * S, k: o.kMin, x3z: 1, w2: w, h2: h };
      this.scoreK = +spot.k.toFixed(3);
      el.style.setProperty('--k', String(this.scoreK));
      el.style.left = spot.x / S + 'px';
      el.style.top = spot.y / S + 'px';
      x3.style.zoom = spot.x3z > 1.001 ? spot.x3z.toFixed(3) : '';
      this.scoreSpot = { ...spot, key, at: now };
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
      const appear = el.hidden || fresh;
      el.hidden = false;
      if (fresh) {
        el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
        this.big(true, true);
      }
      // the other angles fill in quietly, nearest first, never under a finger, so turning the customer stays smooth
      const now = performance.now();
      if (!this.touching && now - (this.reqFill || 0) > 220) {
        for (let d = 1; d <= TURNS / 2; d++) {
          const near = [(yaw + d) % TURNS, (yaw - d + TURNS) % TURNS].find((n) => !this.ring.has(n));
          if (near != null) { this.reqFill = now; this.reqPic(s, r, near); break; }
        }
      }
      // off his head, wherever the screen, the clock or the turn of his head leaves room
      this.placeReq(appear, appear);
    },
    scoreView() {
      const d = M() && M().data, last = d && d.lastRound, s = G() && G().getState();
      const show = !!(last && s && s.status === 'reveal' && last.job === s.jobId && document.body.classList.contains('hsc-reveal'));
      const appear = show && this.el.score.hidden;
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
      this.placeScore(appear);
    },
    tick() {
      const g = G();
      if (!g || !M() || !M().data) return;
      const s = g.getState();
      this.coinPill(false);
      recover();
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
