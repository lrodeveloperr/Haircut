// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved items M1-M7, 5 November 2026): game modes, picked on the
// home screen (menu.js). Every mode keeps the interstitial after every cut, the undo videos and x3 tips.
//
//   requests  (M1) the career: a customer asks for a cut, 1-3 stars, tips, regulars, VIPs
//   free      (M2) Quick Play (the former freestyle; `free` stays the saved id): no request and no stars, no
//             progression; Finish brings the next customer. It is a Home action, not a Modes tile.
//   fix       (M3) Rescue: a clipper job gone wrong walks in, hair and sometimes beard (a gouge, tracks, a step, a crooked
//             line-up). There is no order and no stars: the barber rescues it on their own judgment, for a set pay once real
//             work is done (owner decision, 6 November 2026). Level 2.
//   beard     (M5) Beards: bearded customers, and the barber decides what to do. No order, no stars, a set pay. Level 2.
//   rush      (M7) Orders against a 45 s clock that ticks down: order, stars and the best pay of the modes, and the time left
//             adds coins. Never fails. The third customer in Orders is a one-off taste of it at its full pay; the mode itself
//             opens at level 6 (15 customers), free, with nothing that skips the wait. Career keeps these jobs from level 4.
// Inside Career the same rules hold, except that a showcase keeps its order and stars: a city's mastery is earned there.
// The mode, its current job (the flawed start and its repair) are saved with the progress.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#10223f';
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio;
  const LIST = ['requests', 'free', 'fix', 'beard', 'rush'];
  const LEVEL = { career: 1, requests: 1, free: 1, fix: 2, beard: 2, rush: 6 };
  const CAREER_LEVEL = { fix: 2, beard: 2, rush: 4 }; // when Career may seat these jobs: the mode's own lock does not change Career
  const data = () => {
    const d = M() && M().data;
    if (!d) return null;
    if (!d.modes || typeof d.modes !== 'object') d.modes = { mode: 'requests', job: null };
    return d.modes;
  };
  const level = () => (M() && M().data ? M().level() : 1);
  // a mode the player has already played stays open
  const unlocked = (m) => level() >= LEVEL[m] || !!(data() && Array.isArray(data().tried) && data().tried.includes(m));
  const inCareer = (m) => level() >= (CAREER_LEVEL[m] || 1);
  // 'career' (career-run.js) is the main game; the listed modes are also playable on their own
  const CR = () => HSC.careerRun && HSC.careerRun.ready() ? HSC.careerRun : null;
  const current = () => { const md = data(); if (md && md.mode === 'career' && CR()) return 'career'; const m = md && LIST.includes(md.mode) ? md.mode : 'requests'; return unlocked(m) ? m : 'requests'; };
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0 || 1; };
  const today = () => (M() && M().today ? M().today() : new Date().toISOString().slice(0, 10));
  const K = () => HSC.requestKit;
  const pack = (a) => HSC.gridPack(a), unpack = (s, max) => (typeof s === 'string' ? HSC.gridUnpack(s, max) : null);
  const BTOP = () => (HSC.BEARD_MM ? HSC.BEARD_MM.length - 1 : 16);

  // ---- cuts that suit him and are worth cutting from this start, weighted (requests.js rules) ----
  function options(person, start) {
    const out = [];
    for (const st of K().STYLES) {
      if (st.fam === 'trim') continue;
      const w = K().askFor(st, person, start);
      if (!w) continue;
      const t = K().targetFor(st, start);
      if (K().worthCutting(start, t)) out.push([w, st, t]);
    }
    // only styles his hair can really make; if none fully fits, the closest list stays
    const honest = out.filter((o) => K().fits(o[1], start));
    return honest.length ? honest : out;
  }
  // the game avoids repeating itself: what was asked for or botched lately is far less likely to come up again. The list
  // is saved, and it only changes when a job is set or finished, so a request is the same after a reload. Career has its
  // own repetition rules (director.js), so its contracts stay purely seeded.
  const askId = (x) => (x && x.id) || x;
  const asked = () => { const md = data(); if (!md || current() === 'career') return []; return Array.isArray(md.ask) ? md.ask : (md.ask = []); };
  const recently = (x) => asked().includes(askId(x));
  const noteAsk = (x) => { const a = asked(); if (!data() || current() === 'career') return; a.push(askId(x)); if (a.length > 14) a.splice(0, a.length - 14); };
  function choose(R, opts) {
    const w = opts.map((o) => o[0] * (recently(o[1]) ? 0.1 : 1));
    let r = R.next() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < opts.length; i++) if ((r -= w[i]) <= 0) return opts[i];
    return opts[opts.length - 1];
  }
  const U = (i) => (i % 128) / 128, V = (i) => Math.floor(i / 128) / 64;
  const du = (a, b) => { const d = Math.abs(a - b); return Math.min(d, 1 - d); };

  // ---- M3: a hair disaster from the hair he walked in with ----
  // every flaw only lowers hair to the repair's own length there, so the repair is always possible
  const REPAIR_MIN = 120; // cells still longer than the repair: twice what counts as real work (MIN_WORK)
  function disaster(person, start, R, force, beard) {
    // a repair needs room to show a mistake: only styles that take a real amount off, the biggest change if none does
    const room = (t) => { let n = 0; for (let i = 0; i < 8192; i++) if (start[i] - t[i] >= 2) n++; return n; };
    const all = options(person, start).map((o) => [o, room(o[2])]);
    if (!all.length) return null;
    const big = all.filter((o) => o[1] >= 700), opts = big.length ? big.map((o) => o[0]) : [all.reduce((a, b) => (b[1] > a[1] ? b : a))[0]];
    const [, style, target] = choose(R, opts);
    // mistakes land where a lot comes off, so they read clearly; a head with little to take works with what it has
    const bad = start.slice();
    let cut = [];
    for (let i = 0; i < 8192; i++) if (start[i] - target[i] >= 2) cut.push(i);
    if (cut.length < 300) { cut = []; for (let i = 0; i < 8192; i++) if (start[i] > target[i]) cut.push(i); }
    if (cut.length < 120) return null;
    const lower = (i) => { bad[i] = Math.min(bad[i], target[i]); };
    const at = () => cut[Math.floor(R.next() * cut.length)];
    const KINDS = {
      // a clipper slipped: a deep oval hole
      gouge() { const c = at(), u0 = U(c), v0 = V(c), ru = R.range(0.05, 0.08), rv = R.range(0.11, 0.17); for (const i of cut) { const a = du(U(i), u0) / ru, b = (V(i) - v0) / rv; if (a * a + b * b < 1) lower(i); } },
      // one side done, the other not
      side() { const u0 = R.next(), w = R.range(0.22, 0.32); for (const i of cut) if (du(U(i), u0) < w) lower(i); },
      // a ring cut at the wrong height: a step
      step() { const v0 = R.range(0.2, 0.55), h = R.range(0.04, 0.07); for (const i of cut) if (Math.abs(V(i) - v0) < h) lower(i); },
      // a home bowl cut: everything below a line taken off unevenly
      bowl() { const v0 = R.range(0.3, 0.5), tilt = R.range(-0.12, 0.12), ph = R.next(); for (const i of cut) if (V(i) < v0 + tilt * Math.sin((U(i) + ph) * Math.PI * 2)) lower(i); },
      // bites taken out here and there
      chunks() { const n = R.int(5, 8); for (let k = 0; k < n; k++) { const c = at(), u0 = U(c), v0 = V(c), r = R.range(0.02, 0.035); for (const i of cut) { const a = du(U(i), u0) / r, b = (V(i) - v0) / (r * 2.2); if (a * a + b * b < 1) lower(i); } } },
      // parallel clipper tracks: guard lines left down the head
      tracks() { const u0 = R.next(), n = R.int(3, 5), gap = R.range(0.05, 0.075), w = R.range(0.012, 0.02); for (const i of cut) for (let k = 0; k < n; k++) if (du(U(i), (u0 + k * gap) % 1) < w) lower(i); },
      // the job left unfinished: done everywhere except a few missed patches
      missed() { const ps = Array.from({ length: R.int(3, 5) }, () => { const c = at(); return [U(c), V(c), R.range(0.03, 0.05)]; }); for (const i of cut) if (!ps.some(([u0, v0, r]) => { const a = du(U(i), u0) / r, b = (V(i) - v0) / (r * 2); return a * a + b * b < 1; })) lower(i); },
      // a crooked neckline: the nape taken up unevenly
      nape() { const w = R.range(0.1, 0.18), top = R.range(0.14, 0.24), lean = R.range(-0.5, 0.5); for (const i of cut) { const d = du(U(i), 0.5); if (d < w && V(i) < top * (1 + lean * (U(i) - 0.5) / w)) lower(i); } },
      // one sideburn taken higher than the other
      sideburn() { const u0 = R.next() < 0.5 ? 0.25 : 0.75, w = R.range(0.04, 0.07), top = R.range(0.3, 0.42); for (const i of cut) if (du(U(i), u0) < w && V(i) < top) lower(i); },
      // a crooked line-up: the low edge cut up at a slant on one side
      lineup() { const u0 = R.next(), w = R.range(0.18, 0.3), top = R.range(0.12, 0.22); for (const i of cut) { const d = du(U(i), u0); if (d < w && V(i) < top * (1 - d / w)) lower(i); } },
    };
    // what really goes wrong depends on the hair: clipper tracks show in straight hair, a line-up is where tight curls go wrong
    const ty = (person.hair && person.hair.type) || '1b', coily = /^(3c|4)/.test(ty), straight = /^[12]/.test(ty);
    const odds = { gouge: 2, side: 2, step: 2, missed: 2, nape: 1.5, sideburn: 1.2, chunks: 0.6, bowl: 0.4, tracks: straight ? 2.2 : 0.5, lineup: coily ? 3 : 0.8 };
    const names = force || [];
    if (!force) for (let n = R.next() < 0.45 ? 2 : 1; n > 0; n--) { const left = Object.entries(odds).filter(([k]) => !names.includes(k)); names.push(choose(R, left.map(([k, w]) => [w, k]))[1]); }
    for (const n of names) KINDS[n]();
    let changed = 0;
    for (let i = 0; i < 8192; i++) if (bad[i] !== start[i]) changed++;
    for (let k = 0; k < 4 && changed < 120; k++) { KINDS.chunks(); changed = 0; for (let i = 0; i < 8192; i++) if (bad[i] !== start[i]) changed++; }
    // a rescue always leaves a real repair to do: 'missed' (done everywhere but a few patches) with a second flaw over
    // those patches can leave nothing longer than the repair (about 1 job in 330), so a perfect repair could never count
    // as work. Such a job is made again with the other flaw alone, or none is made
    const left = () => { let n = 0; for (let i = 0; i < 8192; i++) if (bad[i] > target[i]) n++; return n; };
    if (!force && left() < REPAIR_MIN) {
      const rest = names.filter((n) => n !== 'missed');
      for (let i = 0; i < 8192; i++) bad[i] = start[i];
      names.splice(0, names.length, ...(rest.length ? rest : ['gouge']));
      for (const n of names) KINDS[n]();
      if (left() < REPAIR_MIN) return null;
    }
    // a man with a beard may have had that botched too
    const fixBeard = Array.isArray(beard) && !force && R.next() < 0.45 ? beardDisaster(person, beard, R) : null;
    return { start: bad, target, style, flaws: names, beard: fixBeard };
  }
  // the same rule for a beard: a mistake only takes hair down to the beard he asks for, so the clipper can always even it out
  function beardDisaster(person, start, R) {
    const j = beardJob(person, start, R);
    if (!j) return null;
    const cut = [];
    for (let i = 0; i < 8192; i++) if (start[i] - j.target[i] >= 2) cut.push(i);
    if (cut.length < 150) return null;
    const bad = start.slice(), lower = (i) => { bad[i] = Math.min(bad[i], j.target[i]); }, BU = (i) => ((i & 127) + 0.5) / 128, BV = (i) => ((i >> 7) + 0.5) / 64;
    const vs = cut.map(BV), lo = Math.min(...vs), hi = Math.max(...vs), left = R.next() < 0.5, half = (i) => (BU(i) < 0.5) === left;
    const KINDS = {
      // one side taken down, the other not
      lopsided() { for (const i of cut) if (half(i)) lower(i); },
      // the cheek line pushed up on one side
      cheek() { const top = hi - (hi - lo) * R.range(0.2, 0.34); for (const i of cut) if (half(i) && BV(i) > top) lower(i); },
      // the neckline pushed too high
      neck() { const low = lo + (hi - lo) * R.range(0.16, 0.3); for (const i of cut) if (BV(i) < low) lower(i); },
      // the clipper slipped: a bald bite out of the beard
      gouge() { const c = cut[Math.floor(R.next() * cut.length)], u0 = BU(c), v0 = BV(c), ru = R.range(0.03, 0.05), rv = R.range(0.05, 0.09); for (const i of cut) { const a = (BU(i) - u0) / ru, b = (BV(i) - v0) / rv; if (a * a + b * b < 1) lower(i); } },
    };
    const flaw = choose(R, [[2, 'lopsided'], [2, 'cheek'], [1.5, 'neck'], [2, 'gouge']])[1];
    KINDS[flaw]();
    return { start: bad, target: j.target, style: j.style, flaw };
  }

  // ---- M7: a tidy-up: a finished cut with a little regrowth in one or two places ----
  // a tidy-up is never already finished: regrowth only shows where the style takes hair off, so a style that cuts little
  // in the grown zones could leave nothing to do. Too little grown back: every zone grows; still too little: another style
  const TIDY_MIN = 300; // cells grown back, so the job is real work (MIN_WORK below is what counts as worked)
  function tidy(person, start, R) {
    let opts = options(person, start);
    while (opts.length) {
      const pick = choose(R, opts), [, style, target] = pick;
      const s = target.slice();
      const grow = (i) => { s[i] = Math.min(start[i], Math.max(s[i], target[i] + 1)); };
      const ZONES = {
        nape() { for (let i = 0; i < 8192; i++) if (V(i) < 0.16) grow(i); },
        side() { const u0 = R.next(); for (let i = 0; i < 8192; i++) if (du(U(i), u0) < 0.14 && V(i) < 0.45) grow(i); },
        ring() { const v0 = R.range(0.25, 0.45); for (let i = 0; i < 8192; i++) if (Math.abs(V(i) - v0) < 0.06) grow(i); },
      };
      const grown = () => { let n = 0; for (let i = 0; i < 8192; i++) if (s[i] > target[i]) n++; return n; };
      for (const z of Object.keys(ZONES).sort(() => R.next() - 0.5).slice(0, R.next() < 0.5 ? 2 : 1)) ZONES[z]();
      // (the usual case draws nothing more, so tidy-ups that already had enough to do are unchanged)
      if (grown() < TIDY_MIN) for (const z of Object.keys(ZONES)) ZONES[z]();
      if (grown() >= TIDY_MIN) return { start: s, target, style };
      opts = opts.filter((o) => o !== pick);
    }
    return null;
  }

  // ---- M5: the beard he asks for, from the beard he walked in with ----
  // what a customer can ask for (docs/BEARD-MATRIX.md). Sparse growth asks for what it can really hold: a patchy beard
  // rarely asks for a full cheek line. Growth comes from the person's own density, never directly from his group.
  const BEARD_TO = ['corporate', 'boxed', 'rounded', 'hollywood', 'chincurtain', 'extended', 'goatee', 'vandyke', 'chinstrap', 'balbo', 'anchor', 'circle', 'stubble5', 'stubble1', 'soulpatch', 'moustache', 'mutton', 'friendly', 'sideburns', 'clean'];
  const FULL_LINE = ['corporate', 'boxed', 'rounded', 'friendly', 'mutton'];
  // every style with something to work on comes through the door
  const BEARDED = HSC.BEARD_ARRIVALS = Object.keys(HSC.BEARD_STYLES || {}).filter((k) => k !== 'clean' && k !== 'stubble1' && k !== 'stubble');
  function beardGrid(person, style) {
    const S = HSC.BEARD_STYLES[style] || {}, mm = {};
    for (const k of ['moustache', 'chin', 'cheeks', 'jaw', 'neck']) mm[k] = S[k] ? Math.min(person.beard.mm[k] || 99, (S[k][0] + S[k][1]) / 2) : 0;
    return HSC.beardStartFor(Object.assign({}, person, { beard: Object.assign({}, person.beard, { style, mm }) }));
  }
  function beardJob(person, start, R) {
    const opts = [];
    for (const st of BEARD_TO) {
      if (st === person.beard.style) continue;
      const g = beardGrid(person, st), t = start.map((v, i) => Math.min(v, g[i]));
      let n = 0;
      for (let i = 0; i < 8192; i++) if (start[i] - t[i] >= 2) n++;
      if (n >= 120) opts.push([(st === 'clean' ? 1.6 : 1) * (FULL_LINE.includes(st) ? Math.max(0.1, 1 - 1.4 * (person.beard.patchy || 0)) : 1), st, t]);
    }
    if (!opts.length) return null;
    const [, style, target] = choose(R, opts);
    return { style, target };
  }
  // the beard a known style asks for from this start (a saved order is rebuilt exactly, requests.js)
  const beardTarget = (person, start, style) => { const g = beardGrid(person, style); return start.map((v, i) => Math.min(v, g[i])); };
  // stars for a beard request: the share of his beard within one length of the asked beard, counted from where he
  // started (as requests.js does for hair): 60% for 2 stars, 85% for 3
  // The job (cells that need work) and a slip (cells that were right and are now wrong) are counted apart: the job
  // done is its share of the job, and a slip is weighed against the job's size but never against less than SLIP_FLOOR of
  // the beard, so a small job is not lost to one slip. A perfect beard is 3 stars, an untouched one none of the job.
  // (requests.js does the same for the hair)
  const SLIP_FLOOR = 0.2;
  function beardStars(s, r) {
    const st = s.startBeard, now = s.beard, t = r.beard;
    if (!Array.isArray(st) || !Array.isArray(now) || !t) return 1;
    let n = 0, job = 0, done = 0, slip = 0;
    for (let i = 0; i < 8192; i++) {
      if (!(st[i] > 0)) continue;
      n++;
      const ok = Math.abs(now[i] - t[i]) <= 1;
      if (Math.abs(st[i] - t[i]) > 1) { job++; if (ok) done++; } else if (!ok) slip++;
    }
    if (!n) return 1;
    const k = Math.max(0, Math.min(1, (job ? done / job : 1) - slip / Math.max(job, SLIP_FLOOR * n)));
    return k >= 0.85 ? 3 : k >= 0.6 ? 2 : 1;
  }

  // ---- who comes in ----
  // the last customer's group and age, so the next one is someone visibly different
  const lastSeat = { her: null, age: null };
  function modePerson(mode, job, seed) {
    const R = HSC.rng((seed ^ 0x6a09e667) >>> 0 || 1), d = M() && M().data;
    // Quick Play is the open game: besides the ordinary walk-ins, the whole beard catalogue comes through the door
    const walkIn = d && d.queue && d.queue.person, twin = !!walkIn && walkIn.heritage === lastSeat.her;
    if (mode === 'free' && (!d || !d.cuts || (R.next() >= 0.4 && !twin))) return null;
    // the beard studio selects a customer who already has a beard (never rewrites one); the fallback is only for an
    // impossible run of seeds, so the mode can never stall
    // every style has an even turn here, so a player meets the whole catalogue
    const want = BEARDED[hash('beard-' + seed) % BEARDED.length], s0 = seed >>> 0 || 1;
    const p = HSC.selectPerson(s0, {}, (x) => x.beard.style === want && x.heritage !== lastSeat.her && x.age !== lastSeat.age, 600) ||
      HSC.selectPerson(s0, {}, (x) => x.beard.style === want, 600) || HSC.makePerson(s0, { beard: want });
    return Object.assign(p, { job });
  }
  const wantsPerson = (m) => m === 'beard' || m === 'free';
  function hook() {
    // the customer for a new job (no queued customer) in a mode with its own customers
    const pfj = HSC.personForJob;
    HSC.personForJob = function (s, seed) {
      const d = M() && M().data, m = current();
      if (m === 'career') {
        const p = CR().person(s.jobId);
        if (p) return p;
        // the chapter is over (or the founding city is not chosen): the world map asks where to go next
        if (CR().needsChoice() && HSC.menu && HSC.menu.career) setTimeout(() => HSC.menu.career(), 0);
      }
      if (wantsPerson(m) && !(d && d.queue && d.queue.job === s.jobId)) { const p = modePerson(m, s.jobId, seed); if (p) return p; }
      return pfj.apply(this, arguments);
    };
    // after a finished cut the career picks who comes next; a mode with its own customers puts its own in the queue
    const of = M().onFinish;
    M().onFinish = function (state) {
      const r = of.apply(this, arguments), d = M().data, m = current();
      if (r && d && wantsPerson(m)) {
        const job = state.jobId + 1, seed = (((state.seed >>> 0) ^ Math.imul(job + 1, 0x9e3779b1)) >>> 0) || 1;
        const p = modePerson(m, job, seed);
        if (p) { d.queue = { job, person: p, profile: M().profileFor(p, state.recentLooks) }; M().save(); }
        if (d.queue && d.queue.person) { lastSeat.her = d.queue.person.heritage; lastSeat.age = d.queue.person.age; }
      }
      return r;
    };
    // a new job in a mode that brings its own start (a disaster, a tidy-up, a beard to shape)
    const ens = HSC.ensure;
    HSC.ensure = function (s) {
      const out = ens.apply(this, arguments);
      try { return start(out) || out; } catch (e) { console.error('customers: mode start failed', e); return out; }
    };
  }
  function start(s) {
    const m = current(), md = data();
    if (m === 'career') return CR().start(s);
    if (!md || !s || s.status !== 'cutting' || s.cutStrokeCount || !s.look || !s.look.person || s.look.person.first) return null;
    if (md.job && md.job.n === s.jobId) return null; // this job's start is already made (also after a reload)
    const p = s.look.person;
    // the taste of Rush: once, in Orders, from the third customer, while the mode is still locked
    const taste = m === 'requests' && !md.taste && M().data.cuts >= 2 && !unlocked('rush');
    if (m !== 'fix' && m !== 'rush' && m !== 'beard' && !taste) return null;
    const R = HSC.rng(((p.seed >>> 0) ^ Math.imul((s.jobId | 0) + 11, 0x5851f42d)) >>> 0 || 1);
    if (m === 'beard') {
      if (!Array.isArray(s.startBeard)) return null;
      const b = beardJob(p, s.startBeard, R);
      md.job = b ? { n: s.jobId, m, st: b.style, b: pack(b.target) } : { n: s.jobId, m, none: true };
      if (b) noteAsk(b.style);
      M().save();
      return null;
    }
    const kind = taste ? 'rush' : m;
    const j = kind === 'fix' ? disaster(p, s.startHair, R, null, s.startBeard) : tidy(p, s.startHair, R);
    if (!j) { md.job = { n: s.jobId, m: kind, none: true }; M().save(); return null; }
    md.job = { n: s.jobId, m: kind, st: j.style.id, t: pack(j.target) };
    if (j.beard) md.job.b = pack(j.beard.target);
    noteAsk(j.style); for (const f of j.flaws || []) noteAsk(f);
    if (j.beard) { noteAsk(j.beard.style); noteAsk(j.beard.flaw); }
    M().save();
    const out = Object.assign({}, s, { hair: j.start.slice(), startHair: j.start });
    if (j.beard) Object.assign(out, { beard: j.beard.start.slice(), startBeard: j.beard.start });
    return out;
  }

  // ---- jobs with no order: the barber's judgment decides, so nothing is scored, and a set pay needs real work ----
  const judged = (s) => {
    const m = current();
    if (m === 'fix' || m === 'beard') return true;
    const a = m === 'career' && CR() ? CR().active() : null;
    return !!(a && s && a.job === s.jobId && a.role !== 'showcase' && (a.mode === 'fix' || a.mode === 'beard'));
  };
  // The one test of real work, everywhere work decides something (pay, stars, level, videos, tasks, the Rush bonus and
  // taste, regulars, Career contracts): hair or beard really changed from where he sat down. The stroke counter is not
  // used: it counts pointer samples, stays raised after an undo and counts a brushed brow.
  const MIN_WORK = 60; // cells of hair or beard really changed: a stroke or two
  // a scored job (an order: Orders, Rush, a Career order) also needs this share of the order's own work done: one dab on
  // a big order is not a job (the median order has over a thousand cells to cut, a Rush tidy-up at least 300)
  const ORDER_SHARE = 0.2;
  const changedCells = (s, stop = Infinity) => {
    let n = 0;
    if (!s) return 0;
    for (const [a, b] of [[s.hair, s.startHair], [s.beard, s.startBeard]]) {
      if (!Array.isArray(a) || !Array.isArray(b)) continue;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && ++n >= stop) return n;
    }
    return n;
  };
  // the order's own work: cells longer than the order at the start (a beard within one length of its order already
  // scores, as beardStars counts it), and how many of them have been cut at all
  function orderWork(s, target, beard) {
    let need = 0, done = 0;
    for (const [now, st, t, tol] of [[s.hair, s.startHair, target, 0], [s.beard, s.startBeard, beard, 1]]) {
      if (!Array.isArray(now) || !Array.isArray(st) || !Array.isArray(t)) continue;
      for (let i = 0; i < t.length; i++) if (st[i] - t[i] > tol) { need++; if (now[i] < st[i]) done++; }
    }
    return { need, done };
  }
  // a job with no order still has a repair or a beard it was built for (Rescue, Beards; standalone or a Career contract)
  function repairOf(s) {
    const md = data(), j = md && md.job;
    if (current() !== 'career') return j && j.n === s.jobId && !j.none ? { t: j.m === 'beard' ? null : unpack(j.t, 5), b: j.b ? unpack(j.b, BTOP()) : null } : null;
    const a = CR() && CR().active();
    return a && a.job === s.jobId && a.request ? { t: a.request.t ? unpack(a.request.t, 5) : null, b: a.request.bt ? unpack(a.request.bt, BTOP()) : null } : null;
  }
  // real work. A scored job: MIN_WORK cells (all of the order's work when it has less) and ORDER_SHARE of the order
  // cut. A job without an order (Rescue, Beards, Quick Play, the tutorial): MIN_WORK cells, or the whole of a smaller
  // repair, so a perfect small rescue always counts
  function worked(s) {
    if (!s) return false;
    const r = HSC.requestFor ? HSC.requestFor(s) : null;
    if (r && (r.target || r.beard)) {
      const w = orderWork(s, r.target, r.beard);
      const need = w.need ? Math.min(MIN_WORK, w.need) : MIN_WORK;
      return changedCells(s, need) >= need && (!w.need || w.done >= ORDER_SHARE * w.need);
    }
    const rp = judged(s) ? repairOf(s) : null, w = rp ? orderWork(s, rp.t, rp.b) : null;
    const need = w && w.need ? Math.min(MIN_WORK, w.need) : MIN_WORK;
    return changedCells(s, need) >= need;
  }

  // ---- what each mode asks for (requests.js) ----
  const reqCache = { key: null, val: undefined };
  function request(s) {
    const m = current(), md = data(), p = s.look && s.look.person;
    if (judged(s)) return null;
    // a career chair without its contract (between chapters) asks for nothing
    if (m === 'career') { const r = CR().request(s); return r !== undefined ? r : null; }
    if (m === 'free') return null;
    const j = md && md.job && md.job.n === s.jobId ? md.job : null;
    // no tidy-up could be made for him: a Rush customer asks for an ordinary cut instead (still on the clock), so he is
    // never scored without an order
    if (!j || j.none) return m === 'beard' || m === 'fix' ? null : undefined;
    const key = s.jobId + ':' + j.m + ':' + j.st;
    if (reqCache.key === key) return reqCache.val;
    let val;
    if (j.m === 'beard') { const b = unpack(j.b, BTOP()); val = b ? { style: { id: 'beard:' + j.st, fam: 'beard' }, beard: b } : null; }
    else { const t = unpack(j.t, 5), b = j.b ? unpack(j.b, BTOP()) : null; val = t ? { style: K().byId.get(j.st) || { id: j.st, fam: 'fix' }, target: t, beard: b } : null; }
    reqCache.key = key; reqCache.val = val;
    return val;
  }

  // ---- tips and results ----
  // the clock counts play time only (not an ad, the app in the background, a menu or the Open splash) and the time
  // used is saved with the job, so a restart or a mode switch cannot give it back
  // A Career contract keeps its clock by the contract's id (Career seats a suspended contract on a new job number), any
  // other job by its job number; `ads` counts videos in progress, which always hold the clock
  const rush = { job: null, key: null, used: 0, last: 0, saved: -1, held: true, ads: 0, LIMIT: 45000 };
  for (const e of ['visibilitychange', 'pagehide', 'freeze']) addEventListener(e, () => { rush.held = true; }, true);
  document.addEventListener('visibilitychange', () => { rush.held = true; }, true);
  addEventListener('blur', (e) => { if (e.target === window) rush.held = true; }); // the window, not a button losing focus
  // a host pause or an ad freezes this tick entirely, so watch the pause flag the client sets on <html> (client.js)
  try { new MutationObserver(() => { rush.held = true; }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}
  const timeLeft = () => (rush.job == null ? 0 : Math.max(0, rush.LIMIT - rush.used));
  // the economy (economy.js) prices every mode by its fee: no mode multiplies tips any more
  function tips(base) { return base; }
  // what the economy needs to know about this job's mode: the kind, a Rush time bonus (0-12). The bonus is for a job
  // done well and fast: only real work of 2 stars or more earns it (`stars`, from requests.js), so a dab and Finish
  // at once earns nothing from the clock
  function econJob(s, stars) {
    const m = current();
    const md = data(), taste = m === 'requests' && md && md.job && md.job.n === s.jobId && md.job.m === 'rush' && !md.job.none;
    const out = { kind: taste ? 'rush' : m === 'requests' || m === 'career' ? 'requests' : m };
    if (m === 'career' && CR() && CR().unscored()) out.kind = 'free'; // no contract in the chair: practice, no pay
    if (rush.job === s.jobId && stars >= 2 && worked(s)) out.rushBonus = Math.round(HSC.economy.CONFIG.rushMax * timeLeft() / rush.LIMIT);
    return out;
  }
  function done(s, stars) {
    const md = data();
    if (!md) return;
    const ca = current() === 'career' && CR() ? CR().active() : null, cid = ca && ca.job === s.jobId ? String(ca.id) : null;
    if (current() === 'career') CR().done(s, stars);
    // the taste is spent only once it has been finished with real work, so a customer skipped by changing mode, or
    // finished (or timed out) untouched, does not use it up
    if (current() === 'requests' && md.job && md.job.n === s.jobId && md.job.m === 'rush' && !md.job.none && stars > 0 && worked(s)) { md.taste = true; M().save(); }
    if (rush.job === s.jobId) { rush.job = null; rush.key = null; }
    if (md.clock && md.clock.n === s.jobId) { md.clock = null; M().save(); }
    if (cid && md.cclock && md.cclock.id === cid) { md.cclock = null; M().save(); }
  }

  // ---- switching ----
  // one switch at a time: a second tap while the first is still saving would skip a second customer
  let switching = false;
  async function setMode(m) {
    if (switching) return false;
    switching = true;
    try { return await switchTo(m); } finally { switching = false; }
  }
  async function switchTo(m) {
    const md = data(), g = G();
    const was = current(); // read before any wait, so it is the mode the player is really leaving
    if (m === 'career') { if (!CR()) return false; await CR().ensure(); }
    else if (!md || !LIST.includes(m) || !unlocked(m)) return false;
    // leaving the career chair: its contract keeps the work done so far and waits for the barber (suspended)
    if (was === 'career' && m !== 'career' && g) await CR().suspend(g.getState());
    md.mode = m;
    md.tried = Array.isArray(md.tried) ? md.tried : [];
    if (!md.tried.includes(m)) md.tried.push(m); // a mode is no longer new once played
    M().save();
    if (!g) return true;
    const s = g.getState();
    // a new customer for the new mode (the one in the chair keeps his cut in freestyle and the career)
    const keep = s.status === 'cutting' && was === m && (m !== 'career' || !!(CR().active() && CR().active().job === s.jobId));
    if (!keep && s.status === 'cutting' && g.skip) { md.job = null; if (M().data.queue && M().data.queue.job === s.jobId + 1) M().data.queue = null; await g.skip(); }
    else if (!keep && s.status === 'reveal' && g.next) { if (M().data.queue && M().data.queue.job === s.jobId + 1) M().data.queue = null; await g.next(); }
    return true;
  }
  // ---- UI: the mode badge on the menu button, the rush clock ----
  const ICON = {
    requests: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="20" cy="27" r="11" fill="#e9c9a8" stroke="${INK}" stroke-width="2.4"/><path d="M9.5 25c0-7 4.5-11 10.5-11s10.5 4 10.5 11c-3-3-7-4.5-10.5-4.5S12.5 22 9.5 25z" fill="#5a3b1f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M28 6h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-4 4v-4h-3a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" fill="#fff" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M31.5 14.5c0-3 1.6-4.6 3.5-4.6s3.5 1.6 3.5 4.6" fill="#5a3b1f"/></svg>`,
    free: `<svg viewBox="0 0 48 48" width="56" height="56"><rect x="16" y="16" width="16" height="26" rx="5" fill="#ffb627" stroke="${INK}" stroke-width="2.4"/><path d="M15 17v-6h18v6" fill="#c9cfd6" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 8l2 4M40 8l-2 4M6 20h4M42 20h-4M24 2v4" stroke="#ffb627" stroke-width="3" stroke-linecap="round"/></svg>`,
    fix: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="28" r="13" fill="#e9c9a8" stroke="${INK}" stroke-width="2.4"/><path d="M11.5 26c0-8 5.5-12.5 12.5-12.5S36.5 18 36.5 26l-4-3-2.5 4-3-5-3 6-3-6-2.5 3.5-3-3z" fill="#5a3b1f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><g transform="rotate(-35 34 12)"><rect x="25" y="8" width="18" height="8" rx="4" fill="#ffd9a8" stroke="${INK}" stroke-width="2.2"/><rect x="31" y="8" width="6" height="8" fill="#f2b880" stroke="${INK}" stroke-width="1.6"/></g></svg>`,
    beard: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="20" r="13" fill="#e9c9a8" stroke="${INK}" stroke-width="2.4"/><path d="M11 18c0 15 6 25 13 25s13-10 13-25c-3 5-7 7-13 7s-10-2-13-7z" fill="#5a3b1f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M18 28c2 1.6 4 2 6 2s4-.4 6-2" stroke="#e9c9a8" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
    rush: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="26" r="16" fill="#fff" stroke="${INK}" stroke-width="2.4"/><path d="M20 4h8M24 4v6M38 12l3-3" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M26 14l-6 13h6l-3 11 9-15h-6l3-9z" fill="#ffc83d" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  };
  const NAME = { requests: 'Customer requests', free: 'Quick Play', fix: 'Hair disasters', beard: 'Beard studio', rush: 'Rush hour' };
  const LOCK = `<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="10.5" width="14" height="10" rx="2.4" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="${INK}" stroke-width="2"/></svg>`;
  const STAR = (on) => `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc83d' : 'none'}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"${on ? '' : ' stroke-dasharray="2.6 2.2" opacity=".55"'}/></svg>`;
  const TICK = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#10223f" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CSS = `
#hsc-rush{--c:#46c43a;--p:1;position:fixed;z-index:21;left:50%;pointer-events:none;top:calc(env(safe-area-inset-top) / var(--hsc-s,1) + 8px);transform:translateX(-50%);display:none;width:60px;height:60px;box-sizing:border-box;border-radius:50%;border:3px solid ${INK};background:conic-gradient(var(--c) calc(var(--p) * 1turn),#c9d6e4 0);box-shadow:inset 0 2px 0 #fff9,0 4px 0 ${INK},0 6px 8px #0004;zoom:var(--hsc-s,1)}
#hsc-rush.on{display:block}
#hsc-rush span{position:absolute;inset:5px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:linear-gradient(#fff,#e4f3ff);box-shadow:inset 0 0 0 2px #10223f22;color:${INK};font:900 1em "Arial Rounded MT Bold","Nunito",system-ui,sans-serif;font-variant-numeric:tabular-nums}
#hsc-rush.mid{--c:#ffb21a}
#hsc-rush.low{--c:#f04436;animation:hsc-rushb .5s ease-in-out infinite}
#hsc-rush.low span{color:#d11f14}
#hsc-rush.end{animation-duration:.25s}
@keyframes hsc-rushb{50%{transform:translateX(-50%) scale(1.14)}}
body.hsc-reveal #hsc-rush{display:none}
.hsc-toast{position:fixed;z-index:41;left:0;top:0;zoom:var(--hsc-s,1);transform-origin:50% 50%;display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:26px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 4px 0 ${INK};font:900 24px "DM Sans",system-ui,sans-serif;color:${INK};animation:hsc-toast 1.8s ease-out forwards;pointer-events:none}
@keyframes hsc-toast{0%{opacity:0;transform:translateY(20%) scale(.6)}15%{opacity:1;transform:scale(1.05)}25%{transform:none}80%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-20%)}}
@media (prefers-reduced-motion:reduce){#hsc-rush.low{animation:none}}
`;
  const COIN = HSC.icon ? HSC.icon('coin', 30) : `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="9.5" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a12" stroke-width="1.8"/></svg>`; // the theme's one coin (icons.js)
  const ui = {
    el: {}, built: false,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const r = document.createElement('div'); r.id = 'hsc-rush'; r.setAttribute('aria-hidden', 'true'); r.innerHTML = '<span></span>';
      document.body.append(r);
      Object.assign(this.el, { rush: r });
      setInterval(() => this.tick(), 100);
    },
    toast(kind) {
      const t = document.createElement('div'); t.className = 'hsc-toast';
      t.innerHTML = kind === 'round' ? `${ICON.rush.replace(/56/g, '40')}${COIN}<span>+50</span>` : '';
      // drawn at the UI scale like every layer, and placed in a free spot off the customer's head (requests.js)
      t.style.cssText = 'visibility:hidden;animation:none';
      document.body.appendChild(t);
      const S = HSC.S || 1, r = t.getBoundingClientRect();
      const p = HSC.uiPlace ? HSC.uiPlace.spot(r.width, r.height) : { x: (innerWidth - r.width) / 2, y: innerHeight * 0.12, k: 1 };
      const z = S * p.k;
      t.style.cssText = `zoom:${z};left:${p.x / z}px;top:${p.y / z}px`;
      setTimeout(() => t.remove(), 1900);
    },
    // the clock's centre on the top row, in screen px: the middle of the screen, unless the customer's head reaches
    // up there (a landscape phone, the head tilted): then the nearest free spot on the row beside his head, clear of
    // the top buttons. It never takes a touch, so if no spot is free it stays in the middle over the hair
    clockX(home) {
      const W = innerWidth, size = home.height, half = size / 2, S = HSC.S || 1, gap = 6 * S;
      const mid = W / 2, row = { t: home.top, b: home.bottom };
      const hd = HSC.uiPlace && HSC.uiPlace.head ? HSC.uiPlace.head() : null;
      const at = (x) => ({ l: x - half, r: x + half, ...row });
      const hit = (a, b) => a.l < b.r + gap && a.r > b.l - gap && a.t < b.b + gap && a.b > b.t - gap;
      if (!hd || !hit(at(mid), hd)) return mid;
      const btns = [...document.querySelectorAll('#hsc-menu-btn,.ui .top button,#hsc-hud .hsc-row button')].map((e) => e.getBoundingClientRect()).filter((b) => b.width > 1).map((b) => ({ l: b.left, r: b.right, t: b.top, b: b.bottom }));
      const xs = [hd.l - gap - half - 0.5, hd.r + gap + half + 0.5];
      for (const b of btns) xs.push(b.r + gap + half + 0.5, b.l - gap - half - 0.5);
      let best = null;
      for (const x of xs) {
        const a = at(x);
        if (a.l < 8 * S || a.r > W - 8 * S || hit(a, hd) || btns.some((b) => hit(a, b))) continue;
        if (best == null || Math.abs(x - mid) < Math.abs(best - mid)) best = x;
      }
      return best == null ? mid : best;
    },
    // the mode tiles on the home screen (menu.js calls this when it opens)
    tick() {
      const g = G();
      if (!g || !M() || !M().data) return;
      const s = g.getState(), m = current();
      // the rush clock starts when a tidy-up customer sits down
      const ca = m === 'career' && CR() ? CR().active() : null;
      const jb = data().job, ownJob = jb && jb.n === s.jobId && !jb.none;
      // a Rush customer with no tidy-up asks for an ordinary cut (request above), still against the clock
      const cr = ca && ca.mode === 'rush' && ca.job === s.jobId ? ca : null;
      const rushing = s.status === 'cutting' && (m === 'rush' ? !!(jb && jb.n === s.jobId) : m === 'requests' ? !!(ownJob && jb.m === 'rush') : !!cr);
      const now = performance.now(), md = data(), key = cr ? 'c:' + cr.id : 'j:' + s.jobId;
      if (rushing && (rush.job !== s.jobId || rush.key !== key)) {
        const c = cr ? (md.cclock && md.cclock.id === String(cr.id) ? md.cclock.ms : 0) : md.clock && md.clock.n === s.jobId ? md.clock.ms : 0;
        Object.assign(rush, { job: s.jobId, key, used: c, last: now, held: true, saved: Math.floor(c / 5000) });
      }
      if (!rushing && s.status === 'cutting') { rush.job = null; rush.key = null; }
      if (rushing) {
        const v = g.getView ? g.getView() : null;
        // a video in progress (an undo, a wish) always holds the clock, whether or not the host has paused the game yet
        const hold = rush.ads > 0 || document.hidden || (v && v.paused) || document.querySelector('#hsc-menu.open, #hsc-reveal.on');
        // real play time counts in full, even on a busy device; the step after any hold (an ad, a menu, the splash,
        // the app in the background, see the visibility listener) never counts, so a pause is never charged
        const dt = Math.min(5000, Math.max(0, now - rush.last)), wasHeld = rush.held;
        rush.last = now; rush.held = !!hold;
        if (!hold && !wasHeld) rush.used = Math.min(rush.LIMIT, rush.used + dt);
        // saved every 5 s of play and whenever the clock is held (a pause, a menu, the app leaving), not every second:
        // each save writes the whole save file
        const step = Math.floor(rush.used / 5000);
        if (md && (step !== rush.saved || (hold && !wasHeld))) {
          rush.saved = step;
          if (cr) md.cclock = { id: String(cr.id), ms: Math.round(rush.used) }; else md.clock = { n: s.jobId, ms: Math.round(rush.used) };
          M().save();
        }
        // time is up: the haircut ends exactly as if Finish were pressed (the engine refuses while paused; the next tick retries)
        if (rush.used >= rush.LIMIT && !hold) g.finish();
      }
      const ms = timeLeft(), left = Math.ceil(ms / 1000), el = this.el.rush;
      el.classList.toggle('on', rushing);
      el.classList.toggle('mid', rushing && left <= 20 && left > 10);
      el.classList.toggle('low', rushing && left <= 10);
      el.classList.toggle('end', rushing && left <= 5);
      if (!rushing) { this.beat = null; return; }
      // on the same line as the Home and Finish buttons, at their scale
      const home = document.querySelector('#hsc-menu-btn'), r = home && home.getBoundingClientRect(), S = HSC.S || 1;
      if (r && r.height) { const size = r.height / S; Object.assign(el.style, { width: size + 'px', height: size + 'px', top: r.top / S + 'px', fontSize: size * 0.4 + 'px', left: this.clockX(r) / S + 'px' }); }
      el.style.setProperty('--p', (ms / rush.LIMIT).toFixed(3));
      el.querySelector('span').textContent = left;
      // tick, tock, each second; twice as fast in the last ten; a bell at zero
      const beat = ms <= 0 ? 'end' : left <= 10 ? 'h' + Math.ceil(ms / 500) : 's' + left;
      if (beat !== this.beat) {
        const first = this.beat == null;
        this.beat = beat; this.flip = !this.flip;
        if (!first && HSC.fx) HSC.fx.play(beat === 'end' ? 'bell' : this.flip ? 'tick' : 'tock');
      }
    },
  };

  // every rewarded video goes through HSC.watchVideo (the wardrobe owns it and its earned callback): this only counts
  // the videos in progress for the Rush clock, then hands over unchanged, with the same result
  function holdForVideos() {
    const wv = HSC.watchVideo;
    if (typeof wv !== 'function' || wv.__rushHeld) return;
    const held = async function () { rush.ads++; rush.held = true; try { return await wv.apply(this, arguments); } finally { rush.ads = Math.max(0, rush.ads - 1); rush.held = true; } };
    held.__rushHeld = true; held.__routed = wv.__routed;
    HSC.watchVideo = held;
  }
  const boot = () => {
    if (globalThis.skinFadeStudio && HSC.meta && HSC.meta.data && HSC.requestKit && document.body && HSC.ensure && HSC.personForJob) { hook(); holdForVideos(); ui.build(); }
    else setTimeout(boot, 200);
  };
  boot();
  HSC.modes = {
    current, unlocked, inCareer, list: LIST, level: LEVEL, set: setMode,
    request: (s) => request(s), judged, worked, changedCells, MIN_WORK, tips, done, beardStars, beardJob, beardTarget, econJob, recently, noteAsk,
    unscored: () => { const m = current(); return m === 'free' || (m === 'career' && CR().unscored()); },
    icon: (m) => ICON[m],
    // the job builders, for the career catalog (career-catalog.js)
    build: { options, disaster, beardDisaster, tidy, beardJob, beardGrid },
    // a mode just unlocked and not played yet
    isNew: (m) => { const md = data(); return m !== 'requests' && unlocked(m) && !(md && Array.isArray(md.tried) && md.tried.includes(m)); },
  };
})(globalThis.HSC || (globalThis.HSC = {}));
