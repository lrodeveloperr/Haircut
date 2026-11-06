// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved items M1-M7, 5 November 2026): game modes, picked on the
// home screen (menu.js). Every mode keeps the interstitial after every cut, the undo videos and x3 tips.
//
//   requests  (M1) the career: a customer asks for a cut, 1-3 stars, tips, combo, regulars, VIPs
//   free      (M2) Quick Play (the former freestyle; `free` stays the saved id): no request and no stars, no
//             progression; a button seats a new customer. It is a Home action, not a Modes tile.
//   fix       (M3) hair disasters: a botched cut walks in (a gouge, one side done, a step, a bowl, chunks, a crooked
//             line-up). The bubble shows the repaired cut. Every flaw is hair already cut to the repaired cut's own
//             length, so the repair never needs hair that is not there. Tips x1.5. Level 2.
//   daily     (M4) one customer and one request a day, the same for every player (seeded by the date). The best
//             stars are kept; tips x2 the first time. After it, the career carries on.
//   beard     (M5) beard studio: bearded customers ask for a beard style (boxed, goatee, Van Dyke, chinstrap, balbo,
//             anchor, circle, stubble, a moustache, mutton chops or a clean shave). Scored on the beard. Level 2.
//   rush      (M7) quick tidy-ups: a finished cut with a little regrowth, against a 45 s clock. Never fails: the time
//             left adds coins, and every three tidy-ups pay a round bonus. Level 4.
// The mode, its current job (the flawed start and its repair) and the daily result are saved with the progress.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#10223f';
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio;
  const LIST = ['requests', 'free', 'fix', 'daily', 'beard', 'rush'];
  const LEVEL = { career: 1, requests: 1, free: 1, fix: 2, daily: 2, beard: 2, rush: 4 };
  const data = () => {
    const d = M() && M().data;
    if (!d) return null;
    if (!d.modes || typeof d.modes !== 'object') d.modes = { mode: 'requests', job: null, daily: null, beforeDaily: null, rush: 0 };
    return d.modes;
  };
  const level = () => (M() && M().data ? M().level() : 1);
  const unlocked = (m) => level() >= LEVEL[m];
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
      const w = K().suit(st, person);
      if (!w) continue;
      const t = K().targetFor(st, start);
      if (K().worthCutting(start, t)) out.push([w, st, t]);
    }
    return out;
  }
  function choose(R, opts) {
    let r = R.next() * opts.reduce((a, o) => a + o[0], 0);
    for (const o of opts) if ((r -= o[0]) <= 0) return o;
    return opts[opts.length - 1];
  }
  const U = (i) => (i % 128) / 128, V = (i) => Math.floor(i / 128) / 64;
  const du = (a, b) => { const d = Math.abs(a - b); return Math.min(d, 1 - d); };

  // ---- M3: a hair disaster from the hair he walked in with ----
  // every flaw only lowers hair to the repair's own length there, so the repair is always possible
  function disaster(person, start, R, force) {
    const opts = options(person, start);
    if (!opts.length) return null;
    const [, style, target] = choose(R, opts);
    const bad = start.slice(), cut = [];
    for (let i = 0; i < 8192; i++) if (start[i] - target[i] >= 2) cut.push(i);
    if (cut.length < 300) return null;
    const lower = (i) => { bad[i] = Math.min(bad[i], target[i]); };
    const at = () => cut[Math.floor(R.next() * cut.length)];
    const KINDS = {
      // a clipper slipped: a deep oval hole
      gouge() { const c = at(), u0 = U(c), v0 = V(c), ru = R.range(0.035, 0.06), rv = R.range(0.08, 0.13); for (const i of cut) { const a = du(U(i), u0) / ru, b = (V(i) - v0) / rv; if (a * a + b * b < 1) lower(i); } },
      // one side done, the other not
      side() { const u0 = R.next(), w = R.range(0.22, 0.32); for (const i of cut) if (du(U(i), u0) < w) lower(i); },
      // a ring cut at the wrong height: a step
      step() { const v0 = R.range(0.2, 0.55), h = R.range(0.04, 0.07); for (const i of cut) if (Math.abs(V(i) - v0) < h) lower(i); },
      // a home bowl cut: everything below a line taken off unevenly
      bowl() { const v0 = R.range(0.3, 0.5), tilt = R.range(-0.12, 0.12), ph = R.next(); for (const i of cut) if (V(i) < v0 + tilt * Math.sin((U(i) + ph) * Math.PI * 2)) lower(i); },
      // bites taken out here and there
      chunks() { const n = R.int(5, 8); for (let k = 0; k < n; k++) { const c = at(), u0 = U(c), v0 = V(c), r = R.range(0.02, 0.035); for (const i of cut) { const a = du(U(i), u0) / r, b = (V(i) - v0) / (r * 2.2); if (a * a + b * b < 1) lower(i); } } },
      // a crooked line-up: the low edge cut up at a slant on one side
      lineup() { const u0 = R.next(), w = R.range(0.18, 0.3), top = R.range(0.12, 0.22); for (const i of cut) { const d = du(U(i), u0); if (d < w && V(i) < top * (1 - d / w)) lower(i); } },
    };
    const names = force || Object.keys(KINDS).sort(() => R.next() - 0.5).slice(0, R.next() < 0.45 ? 2 : 1);
    for (const n of names) KINDS[n]();
    let changed = 0;
    for (let i = 0; i < 8192; i++) if (bad[i] !== start[i]) changed++;
    if (changed < 120) KINDS.chunks();
    return { start: bad, target, style, flaws: names };
  }

  // ---- M7: a tidy-up: a finished cut with a little regrowth in one or two places ----
  function tidy(person, start, R) {
    const opts = options(person, start);
    if (!opts.length) return null;
    const [, style, target] = choose(R, opts);
    const s = target.slice();
    const grow = (i) => { s[i] = Math.min(start[i], Math.max(s[i], target[i] + 1)); };
    const ZONES = {
      nape() { for (let i = 0; i < 8192; i++) if (V(i) < 0.16) grow(i); },
      side() { const u0 = R.next(); for (let i = 0; i < 8192; i++) if (du(U(i), u0) < 0.14 && V(i) < 0.45) grow(i); },
      ring() { const v0 = R.range(0.25, 0.45); for (let i = 0; i < 8192; i++) if (Math.abs(V(i) - v0) < 0.06) grow(i); },
    };
    for (const z of Object.keys(ZONES).sort(() => R.next() - 0.5).slice(0, R.next() < 0.5 ? 2 : 1)) ZONES[z]();
    return { start: s, target, style };
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
  // stars for a beard request: the share of his beard within one length of the asked beard, counted from where he
  // started (as requests.js does for hair): 60% for 2 stars, 85% for 3
  function beardStars(s, r) {
    const st = s.startBeard, now = s.beard, t = r.beard;
    if (!Array.isArray(st) || !Array.isArray(now) || !t) return 1;
    let n = 0, a = 0, b = 0;
    for (let i = 0; i < 8192; i++) {
      if (!(st[i] > 0)) continue;
      n++;
      if (Math.abs(st[i] - t[i]) <= 1) a++;
      if (Math.abs(now[i] - t[i]) <= 1) b++;
    }
    if (!n) return 1;
    const ma = a / n, mb = b / n, k = ma >= 0.999 ? mb : Math.max(0, Math.min(1, (mb - ma) / (1 - ma)));
    return k >= 0.85 ? 3 : k >= 0.6 ? 2 : 1;
  }

  // ---- who comes in ----
  function modePerson(mode, job, seed) {
    const R = HSC.rng((seed ^ 0x6a09e667) >>> 0 || 1);
    if (mode === 'beard') {
      // the beard studio selects a customer who already has a beard (never rewrites one); the fallback is only for an
      // impossible run of seeds, so the mode can never stall
      // every style has an even turn here, so a player meets the whole catalogue
      const want = BEARDED[hash('beard-' + seed) % BEARDED.length];
      const p = HSC.selectPerson(seed >>> 0 || 1, {}, (x) => x.beard.style === want, 600) || HSC.makePerson(seed >>> 0 || 1, { beard: want });
      return Object.assign(p, { job });
    }
    if (mode === 'daily') {
      const day = today();
      const p = HSC.makePerson(hash('challenge-' + day), { noLoss: true });
      return Object.assign(p, { job, challenge: day });
    }
    return null;
  }
  const wantsPerson = (m) => m === 'beard' || m === 'daily';
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
    if (p.challenge) {
      // the daily challenge: everyone gets the same walk-in hair (the walk-in picked with no history)
      const w = HSC.pickWalkIn(p, []);
      md.job = { n: s.jobId, m: 'daily' };
      M().save();
      if (!w) return null;
      const h = HSC.walkIns.build(w);
      return Object.assign({}, s, { hair: h.slice(), startHair: h, look: Object.assign({}, s.look, { profile: w.id }) });
    }
    if (m !== 'fix' && m !== 'rush' && m !== 'beard') return null;
    const R = HSC.rng(((p.seed >>> 0) ^ Math.imul((s.jobId | 0) + 11, 0x5851f42d)) >>> 0 || 1);
    if (m === 'beard') {
      if (!Array.isArray(s.startBeard)) return null;
      const b = beardJob(p, s.startBeard, R);
      md.job = b ? { n: s.jobId, m, st: b.style, b: pack(b.target) } : { n: s.jobId, m, none: true };
      M().save();
      return null;
    }
    const j = m === 'fix' ? disaster(p, s.startHair, R) : tidy(p, s.startHair, R);
    if (!j) { md.job = { n: s.jobId, m, none: true }; M().save(); return null; }
    md.job = { n: s.jobId, m, st: j.style.id, t: pack(j.target) };
    M().save();
    return Object.assign({}, s, { hair: j.start.slice(), startHair: j.start });
  }

  // ---- what each mode asks for (requests.js) ----
  const reqCache = { key: null, val: undefined };
  function request(s) {
    const m = current(), md = data(), p = s.look && s.look.person;
    // a career chair without its contract (between chapters) asks for nothing
    if (m === 'career') { const r = CR().request(s); return r !== undefined ? r : null; }
    if (m === 'free') return null;
    if (p && p.challenge) {
      // the daily challenge: the same cut for everyone today
      const R = HSC.rng(hash('challenge-cut-' + p.challenge)), opts = options(p, s.startHair);
      if (!opts.length) return undefined;
      const [, style, target] = choose(R, opts);
      return { style, target };
    }
    const j = md && md.job && md.job.n === s.jobId ? md.job : null;
    if (!j || j.none) return m === 'beard' || m === 'fix' || m === 'rush' ? null : undefined;
    const key = s.jobId + ':' + j.m + ':' + j.st;
    if (reqCache.key === key) return reqCache.val;
    let val;
    if (j.m === 'beard') { const b = unpack(j.b, BTOP()); val = b ? { style: { id: 'beard:' + j.st, fam: 'beard' }, beard: b } : null; }
    else { const t = unpack(j.t, 5); val = t ? { style: K().byId.get(j.st) || { id: j.st, fam: 'fix' }, target: t } : null; }
    reqCache.key = key; reqCache.val = val;
    return val;
  }

  // ---- tips and results ----
  const rush = { job: null, t0: 0, LIMIT: 45000 };
  const timeLeft = () => (rush.job == null ? 0 : Math.max(0, rush.LIMIT - (performance.now() - rush.t0)));
  // the economy (economy.js) prices every mode by its fee: no mode multiplies tips any more
  function tips(base) { return base; }
  // what the economy needs to know about this job's mode: the kind, a Rush time bonus (0-12), a first Daily
  function econJob(s) {
    const m = current(), p = s.look && s.look.person, md = data();
    const out = { kind: m === 'daily' || m === 'requests' || m === 'career' ? 'requests' : m };
    if (m === 'career' && CR() && CR().unscored()) out.kind = 'free'; // no contract in the chair: practice, no pay
    if (p && p.challenge) { out.kind = 'requests'; out.dailyFirst = !(md && md.daily && md.daily.day === p.challenge && md.daily.paid); }
    if (m === 'rush' && rush.job === s.jobId) out.rushBonus = Math.round(12 * timeLeft() / rush.LIMIT);
    return out;
  }
  function done(s, stars) {
    const md = data(), p = s.look && s.look.person;
    if (!md) return;
    if (current() === 'career') CR().done(s, stars);
    if (p && p.challenge) {
      // the Daily also counts toward career mastery (its style, the tools that cut and the services done)
      if (CR() && CR().side && s.cutStrokeCount > 0) {
        const rq = request(s);
        CR().side({ valid: true, stars: Math.max(1, stars | 0), mode: 'daily', style: rq && rq.style ? rq.style.id : null, tools: ['clipper'] });
      }
      const was = md.daily && md.daily.day === p.challenge ? md.daily : null;
      md.daily = { day: p.challenge, stars: Math.max(was ? was.stars : 0, stars), paid: true };
      md.mode = md.beforeDaily && md.beforeDaily !== 'daily' ? md.beforeDaily : 'requests';
      md.beforeDaily = null;
    }
    if (current() === 'rush' && rush.job === s.jobId) {
      rush.job = null;
      md.rush = (md.rush || 0) + 1; // (the economy pays Rush by its fee and time bonus; no round bonus)
    }
  }

  // ---- switching ----
  async function setMode(m) {
    const md = data(), g = G();
    if (m === 'career') { if (!CR()) return false; await CR().ensure(); }
    else if (!md || !LIST.includes(m) || !unlocked(m)) return false;
    const was = current();
    // leaving the career chair: its contract keeps the work done so far and waits for the barber (suspended)
    if (was === 'career' && m !== 'career' && g) await CR().suspend(g.getState());
    if (m === 'daily' && was !== 'daily') md.beforeDaily = was;
    md.mode = m;
    md.tried = Array.isArray(md.tried) ? md.tried : [];
    if (!md.tried.includes(m)) md.tried.push(m); // a mode is no longer new once played
    if (m === 'daily') md.mode = 'daily';
    M().save();
    if (CR() && CR().syncLook) CR().syncLook(); // the salon behind the chair follows the mode (a branch in Career)
    if (!g) return true;
    const s = g.getState();
    // a new customer for the new mode (the one in the chair keeps his cut in freestyle and the career)
    const keep = s.status === 'cutting' && was === m && m !== 'daily' && (m !== 'career' || !!(CR().active() && CR().active().job === s.jobId));
    if (!keep && s.status === 'cutting' && g.skip) { md.job = null; if (M().data.queue && M().data.queue.job === s.jobId + 1) M().data.queue = null; await g.skip(); }
    else if (!keep && s.status === 'reveal' && g.next) { if (M().data.queue && M().data.queue.job === s.jobId + 1) M().data.queue = null; await g.next(); }
    return true;
  }
  async function newCustomer() {
    const g = G(), d = M() && M().data;
    if (!g || !g.skip) return;
    const s = g.getState();
    if (s.status !== 'cutting') return;
    if (d && d.queue && d.queue.job === s.jobId + 1) d.queue = null;
    await g.skip();
  }

  // ---- UI: the mode badge on the menu button, the rush clock, the freestyle new-customer button ----
  const ICON = {
    requests: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="20" cy="27" r="11" fill="#e9c9a8" stroke="${INK}" stroke-width="2.4"/><path d="M9.5 25c0-7 4.5-11 10.5-11s10.5 4 10.5 11c-3-3-7-4.5-10.5-4.5S12.5 22 9.5 25z" fill="#5a3b1f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M28 6h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-4 4v-4h-3a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" fill="#fff" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M31.5 14.5c0-3 1.6-4.6 3.5-4.6s3.5 1.6 3.5 4.6" fill="#5a3b1f"/></svg>`,
    free: `<svg viewBox="0 0 48 48" width="56" height="56"><rect x="16" y="16" width="16" height="26" rx="5" fill="#ffb627" stroke="${INK}" stroke-width="2.4"/><path d="M15 17v-6h18v6" fill="#c9cfd6" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 8l2 4M40 8l-2 4M6 20h4M42 20h-4M24 2v4" stroke="#ffb627" stroke-width="3" stroke-linecap="round"/></svg>`,
    fix: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="28" r="13" fill="#e9c9a8" stroke="${INK}" stroke-width="2.4"/><path d="M11.5 26c0-8 5.5-12.5 12.5-12.5S36.5 18 36.5 26l-4-3-2.5 4-3-5-3 6-3-6-2.5 3.5-3-3z" fill="#5a3b1f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><g transform="rotate(-35 34 12)"><rect x="25" y="8" width="18" height="8" rx="4" fill="#ffd9a8" stroke="${INK}" stroke-width="2.2"/><rect x="31" y="8" width="6" height="8" fill="#f2b880" stroke="${INK}" stroke-width="1.6"/></g></svg>`,
    daily: `<svg viewBox="0 0 48 48" width="56" height="56"><rect x="7" y="10" width="34" height="32" rx="5" fill="#fff" stroke="${INK}" stroke-width="2.4"/><path d="M7 19h34" stroke="${INK}" stroke-width="2.4"/><path d="M7 15a5 5 0 0 1 5-5h24a5 5 0 0 1 5 5v4H7z" fill="#ff5d73" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 6v8M32 6v8" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M24 23.5l2.4 4.8 5.3.7-3.9 3.7 1 5.2-4.8-2.6-4.8 2.6 1-5.2-3.9-3.7 5.3-.7z" fill="#ffc83d" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    beard: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="20" r="13" fill="#e9c9a8" stroke="${INK}" stroke-width="2.4"/><path d="M11 18c0 15 6 25 13 25s13-10 13-25c-3 5-7 7-13 7s-10-2-13-7z" fill="#5a3b1f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M18 28c2 1.6 4 2 6 2s4-.4 6-2" stroke="#e9c9a8" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
    rush: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="26" r="16" fill="#fff" stroke="${INK}" stroke-width="2.4"/><path d="M20 4h8M24 4v6M38 12l3-3" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M26 14l-6 13h6l-3 11 9-15h-6l3-9z" fill="#ffc83d" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  };
  const NAME = { requests: 'Customer requests', free: 'Quick Play', fix: 'Hair disasters', daily: 'Daily challenge', beard: 'Beard studio', rush: 'Rush hour' };
  const LOCK = `<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="10.5" width="14" height="10" rx="2.4" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="${INK}" stroke-width="2"/></svg>`;
  const STAR = (on) => `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc83d' : 'none'}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"${on ? '' : ' stroke-dasharray="2.6 2.2" opacity=".55"'}/></svg>`;
  const TICK = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#10223f" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const NEWC = `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="9" cy="8" r="3.6" fill="#e9c9a8" stroke="${INK}" stroke-width="1.8"/><path d="M2.5 20.5c0-4.2 3-6.4 6.5-6.4s6.5 2.2 6.5 6.4z" fill="#4a90d9" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M15.5 6.5a4.5 4.5 0 0 1 6 3.8M21.8 13a4.5 4.5 0 0 1-6 3" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M21.8 7.4v3.1h-3.1" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CSS = `
#hsc-rush{position:fixed;z-index:21;left:50%;top:calc(env(safe-area-inset-top) + 12px);transform:translateX(-50%);display:none;align-items:center;gap:6px;height:48px;padding:0 14px 0 6px;border-radius:24px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};font:900 22px "DM Sans",system-ui,sans-serif;color:${INK};font-variant-numeric:tabular-nums;zoom:var(--hsc-s,1);pointer-events:none}
#hsc-rush.on{display:flex}
#hsc-rush svg{width:36px;height:36px}
#hsc-rush.low{animation:hsc-rushb .6s ease-in-out infinite}
@keyframes hsc-rushb{50%{transform:translateX(-50%) scale(1.08)}}
#hsc-newc{position:fixed;z-index:20;right:max(12px,env(safe-area-inset-right));top:calc(env(safe-area-inset-top) + 76px);width:56px;height:56px;border-radius:50%;padding:0;display:none;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer;zoom:var(--hsc-s,1)}
#hsc-newc.on{display:flex}
#hsc-newc:active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
body.hsc-reveal #hsc-rush,body.hsc-reveal #hsc-newc,body.hsc-spin #hsc-newc{display:none}
.hsc-toast{position:fixed;z-index:41;left:50%;top:40%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:26px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 4px 0 ${INK};font:900 24px "DM Sans",system-ui,sans-serif;color:${INK};animation:hsc-toast 1.8s ease-out forwards;pointer-events:none}
@keyframes hsc-toast{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-70%)}}
@media (prefers-reduced-motion:reduce){#hsc-rush.low{animation:none}}
`;
  const COIN = HSC.icon ? HSC.icon('coin', 30) : `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="9.5" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a12" stroke-width="1.8"/></svg>`; // the theme's one coin (icons.js)
  const ui = {
    el: {}, built: false,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const r = document.createElement('div'); r.id = 'hsc-rush'; r.setAttribute('aria-hidden', 'true'); r.innerHTML = ICON.rush + '<span></span>';
      const n = document.createElement('button'); n.id = 'hsc-newc'; n.type = 'button'; n.setAttribute('aria-label', 'New customer'); n.innerHTML = HSC.icon ? HSC.icon('newc', 32) : NEWC;
      n.addEventListener('click', newCustomer);
      document.body.append(r, n);
      Object.assign(this.el, { rush: r, newc: n });
      setInterval(() => this.tick(), 200);
    },
    toast(kind) {
      const t = document.createElement('div'); t.className = 'hsc-toast';
      t.innerHTML = kind === 'round' ? `${ICON.rush.replace(/56/g, '40')}${COIN}<span>+50</span>` : '';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 1900);
    },
    // the mode tiles on the home screen (menu.js calls this when it opens)
    tick() {
      const g = G();
      if (!g || !M() || !M().data) return;
      const s = g.getState(), m = current();
      // the rush clock starts when a tidy-up customer sits down
      const rushing = m === 'rush' && s.status === 'cutting' && data().job && data().job.n === s.jobId && !data().job.none;
      if (rushing && rush.job !== s.jobId) { rush.job = s.jobId; rush.t0 = performance.now(); }
      if (!rushing && s.status === 'cutting') rush.job = null;
      const left = Math.ceil(timeLeft() / 1000);
      this.el.rush.classList.toggle('on', rushing);
      this.el.rush.classList.toggle('low', rushing && left <= 10);
      if (rushing) this.el.rush.querySelector('span').textContent = left;
      this.el.newc.classList.toggle('on', m === 'free' && s.status === 'cutting');
    },
  };

  const boot = () => {
    if (globalThis.skinFadeStudio && HSC.meta && HSC.meta.data && HSC.requestKit && document.body && HSC.ensure && HSC.personForJob) { hook(); ui.build(); }
    else setTimeout(boot, 200);
  };
  boot();
  HSC.modes = {
    current, unlocked, list: LIST, level: LEVEL, set: setMode, newCustomer,
    request: (s) => request(s), tips, done, beardStars, beardJob, econJob,
    unscored: () => { const m = current(); return m === 'free' || (m === 'career' && CR().unscored()); },
    icon: (m) => ICON[m],
    // the job builders, for the career catalog (career-catalog.js)
    build: { options, disaster, tidy, beardJob, beardGrid },
    // today's daily challenge: done (and its best stars) or not
    // a mode just unlocked and not played yet
    isNew: (m) => { const md = data(); return m !== 'requests' && unlocked(m) && !(md && Array.isArray(md.tried) && md.tried.includes(m)); },
    daily: () => { const md = data(), d = md && md.daily; return d && d.day === today() ? { done: true, stars: d.stars } : { done: false, stars: 0 }; },
  };
})(globalThis.HSC || (globalThis.HSC = {}));
