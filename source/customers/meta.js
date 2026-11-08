// ---------------------------------------------------------------------------------------------
// Progress between haircuts: barber level, the daily VIP, and the queue that decides
// who the next customer is (so the reveal screen can show them, and a video can swap in a VIP).
//
// Level gates which customer features appear, so the first session keeps showing something new:
//   1 scalp only (clean-shaven, full hair, young / middle-aged)   2 beards and moustaches, some hair loss
//   3 older customers and grey hair   4 advanced hair loss   5+ VIPs sometimes walk in on their own
// The four customer classes are never gated. Saved through the platform storage.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const KEY = 'skin-fade-studio-meta-v1';
  const LEVEL_AT = [0, 2, 4, 7, 10]; // haircuts needed for levels 1..5, then one level every 5
  const cutsFor = (level) => (level <= 5 ? LEVEL_AT[level - 1] : 10 + 5 * (level - 5));
  const levelOf = (cuts) => {
    if (cuts >= 10) return 5 + Math.floor((cuts - 10) / 5);
    let l = 1;
    while (l < 5 && cuts >= cutsFor(l + 1)) l++;
    return l;
  };

  // ---- the variety director ----------------------------------------------------------------------
  // Customers are dealt, not rolled: each trait comes from a shuffled deck that is used up before it is
  // refilled, and the same card never comes twice in a row. Every few customers therefore cover every
  // heritage, age, kind of hair loss, beard and haircut, and nothing repeats back to back.
  // Every deck holds its cards in real-life proportions (so a White customer is usually brown-haired, an
  // older man usually clean-shaven, a young man rarely very bald), but each common option still comes round
  // in every pass through the deck. Hair loss and beards have one deck per age group; heritage then applies
  // its own odds (pattern baldness is rarer in East Asian and Black men, East Asian men shave more often).
  const DECKS = {
    her: [0, 1, 2, 3], // white, Black, East Asian, South Asian
    age: ['young', 'young', 'young', 'middle', 'middle', 'middle', 'old', 'old'],
    // hair loss (Norwood studies: about 1 in 2 young men has none, 1 in 8 men over 55)
    lossyoung: ['none', 'none', 'none', 'none', 'none', 'light', 'light', 'light', 'heavy'],
    lossmiddle: ['none', 'none', 'none', 'light', 'light', 'light', 'heavy', 'heavy'],
    lossold: ['none', 'none', 'light', 'light', 'light', 'heavy', 'heavy', 'heavy', 'heavy'],
    // facial hair (UK YouGov by age: clean-shaven 33% young, 40% middle-aged, 60% over 60)
    beardyoung: ['clean', 'clean', 'clean', 'stubble', 'stubble', 'stubble', 'style', 'style', 'style', 'style'],
    beardmiddle: ['clean', 'clean', 'clean', 'clean', 'stubble', 'style', 'style', 'style', 'style', 'style'],
    beardold: ['clean', 'clean', 'clean', 'clean', 'clean', 'clean', 'stubble', 'style', 'style', 'style'],
    fam: ['long', 'long', 'crop', 'crop', 'buzz', 'tight', 'full', 'shaved'],
    beardRecent: [], // the last beard styles dealt (kept so the next style differs)
  };
  // a deck from weights: each option's share of `size` cards (rare ones that round to nothing are left out)
  const deckFrom = (w, size) => {
    const tot = Object.values(w).reduce((a, b) => a + b, 0), out = [];
    for (const [k, v] of Object.entries(w)) for (let n = Math.round((v / tot) * size); n > 0; n--) out.push(k);
    return out;
  };
  // hair texture and natural colour: one deck per heritage, in its real proportions (UK Biobank for White
  // hair colour: mostly browns, about 1 in 8 blond, 1 in 20 red; Black hair coily, sometimes tightly curly)
  const PH = HSC.PHENOTYPES;
  (HSC.HERITAGE || []).forEach((h, i) => {
    DECKS['tex' + i] = deckFrom(h.tex, PH ? 30 : 10);
    const pal = HSC.HAIR_BY_CLASS && HSC.HAIR_BY_CLASS[h.id];
    if (pal) DECKS['col' + i] = deckFrom(pal.base, 30);
  });
  // Android: 12 phenotype groups, one card each, coarse ages and facial hair in real shares
  if (PH) {
    // every group comes round in every pass: one card each, so nobody waits long to meet any of them
    DECKS.her = (HSC.HERITAGE || []).map((h, i) => i);
    Object.assign(DECKS, PH.decks);
  }
  // draw the first allowed card (on the variety decks, one that differs from the last); refill (shuffled) when
  // none is left. The realism decks (texture, colour, hair loss, beard) may repeat: two straight-haired East
  // Asian customers in a row is normal; every card still comes round in each pass through the deck.
  const NO_REPEAT = { her: 1, age: 1, fam: 1 };
  function deal(name, R, allowed = () => true) {
    const d = M.data;
    let deck = d.deck[name] || [];
    const last = NO_REPEAT[name] ? d.last[name] : undefined;
    const fresh = () => { const a = DECKS[name].slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    let i = deck.findIndex((t) => allowed(t) && t !== last);
    if (i < 0) { deck = deck.concat(fresh()); i = deck.findIndex((t) => allowed(t) && t !== last); }
    if (i < 0) i = deck.findIndex((t) => allowed(t));
    const card = i < 0 ? DECKS[name].find(allowed) : deck.splice(i, 1)[0];
    d.deck[name] = deck.slice(0, 60);
    d.last[name] = card;
    return card;
  }
  // a beard style with its real odds for this age, never the same style twice in a row (a style is a grooming
  // choice: it never depends on heritage)
  function beardStyle(age, R, big) {
    const base = Object.assign({}, (HSC.BEARD_BY_AGE || {})[age] || {});
    const recent = M.data.deck.beardRecent || [];
    const w = {};
    for (const [k, v] of Object.entries(base)) {
      if (k === 'clean' || k === 'stubble' || recent.includes(k)) continue;
      if (big && !['full', 'long', 'boxed', 'shenandoah', 'mutton', 'ducktail', 'garibaldi'].includes(k)) continue;
      w[k] = v;
    }
    const style = Object.keys(w).length ? R.pick(w) : 'boxed';
    M.data.deck.beardRecent = [style];
    return style;
  }
  // the dealt traits as customer options, within what the level allows
  function dealt(level, R) {
    const o = { heritage: deal('her', R) };
    const H = (HSC.HERITAGE || [])[o.heritage] || { id: 'white' };
    const cls = H.id, bc = (HSC.BALD_BY_CLASS || {})[cls] || { prevalence: 1, types: { norwood: 1 } };
    o.age = deal('age', R, (a) => level >= 3 || a !== 'old');
    if (DECKS['tex' + o.heritage]) o.texture = deal('tex' + o.heritage, R);
    if (DECKS['col' + o.heritage] && HSC.HAIR) o.hairColour = HSC.HAIR[deal('col' + o.heritage, R)];
    // hair loss: the age deck, then the heritage's odds (where loss is rarer it steps down a stage)
    let loss = level >= 2 ? deal('loss' + o.age, R) : 'none';
    if (loss !== 'none' && R.next() > bc.prevalence) loss = loss === 'heavy' ? 'light' : 'none';
    if (level >= 2 && streak('loss', loss !== 'none')) loss = loss === 'none' ? 'light' : 'none';
    const types = Object.assign({}, bc.types);
    if (loss === 'none') o.noLoss = true;
    else if (loss === 'light') { o.norwood = R.pick({ 2: 3, 3: 3, '3v': 2 }); delete types.diffuse; o.baldType = R.pick(types); }
    else {
      const stage = { young: { 4: 3, 5: 1 }, middle: { 4: 2, 5: 2, 6: 1 }, old: { 4: 2, 5: 2, 6: 2, 7: 2 } }[o.age];
      o.norwood = level >= 4 ? R.pick(stage) : '4';
      o.baldType = R.pick(types);
    }
    // facial hair: the age deck, East Asian men shave more often, then a style with its real odds
    let beard = level >= 2 ? deal('beard' + o.age, R) : 'clean';
    const shave = H.shave != null ? H.shave : cls === 'east-asian' ? 0.45 : 0;
    if (shave && beard === 'style' && R.next() < shave) beard = 'clean';
    if (level >= 2 && streak('beard', beard !== 'clean')) beard = beard === 'clean' ? (o.age === 'young' ? 'stubble' : 'style') : 'clean';
    o.beard = beard === 'style' ? beardStyle(o.age, R) : beard === 'stubble' && PH && PH.stubble ? R.pick(PH.stubble) : beard;
    return o;
  }
  // no more than three in a row of the same kind (bearded / clean-shaven, hair loss / none): `kind` says
  // whether this customer is of the first kind; returns true when the streak is too long and must flip
  function streak(name, kind) {
    const d = M.data, r = (d.runs && d.runs[name]) || [0, 0];
    const flip = kind ? r[0] >= 3 : r[1] >= 3;
    return flip;
  }
  function note(name, kind) {
    const d = M.data;
    d.runs = d.runs || {};
    const r = d.runs[name] || [0, 0];
    d.runs[name] = kind ? [Math.min(9, r[0] + 1), 0] : [0, Math.min(9, r[1] + 1)];
  }
  // the haircut family for a customer: dealt too, from what suits them (no long or full tops on a bald crown)
  function dealFamily(person, R) {
    const b = person.bald || {};
    const heavy = ['4', '5', '6', '7'].includes(b.norwood) || b.type === 'diffuse';
    if (person.vip || person.first) return person.first ? 'full' : deal('fam', R, (f) => f === 'long' || f === 'full' || f === 'tight');
    // Android families: a hard side part / crew needs straight or wavy hair, an undercut up to loose curls;
    // faux hawks and undercuts are young men's cuts
    const ty = (person.hair && person.hair.type) || '1b';
    // age leaning (barber trend estimates): fades and textured cuts skew young, the classic side part / crew older
    const keep = PH ? ({ young: { classic: 0.45, shaved: 0.6 }, middle: { hawk: 0.4, undercut: 0.6 }, old: { fade: 0.3, long: 0.6, tight: 0 } }[person.age] || {}) : {};
    const lean = (f) => keep[f] == null || ((Math.imul((person.seed >>> 0) ^ (f.charCodeAt(0) * 2654435761 + f.length), 0x9e3779b1) >>> 8) / 16777216) < keep[f];
    const suits = (f) => (f === 'classic' ? ty[0] <= '2' : f === 'undercut' ? ty <= '3a' : true) && !((f === 'hawk' || f === 'undercut') && person.age === 'old') && lean(f);
    return deal('fam', R, (f) => (!heavy || f === 'crop' || f === 'buzz' || f === 'shaved') && !(f === 'tight' && person.age === 'old') && suits(f));
  }

  const M = (HSC.meta = { data: null, client: null, levelOf, cutsFor });
  // real work (modes.js): hair or beard really changed from the start; builds without the modes keep the stroke count
  const worked = (s) => !!s && (HSC.modes && HSC.modes.worked ? HSC.modes.worked(s) : s.cutStrokeCount > 0);

  const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const hash = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

  // ---- the game's day, robust to a wrong clock in both directions --------------------------------------------
  // Every daily limit counts by one game day. The device's date is followed, with a book of the days already used:
  //   - a day already used comes back with what was used on it (its record), so it never gives its limits twice;
  //   - a date one or two days back (a time zone crossed westward) keeps the day;
  //   - a date further back is a clock put right (a phone that booted with a wrong date ahead, then synced): the day
  //     moves back to it, but only to a day after the last one played before the clock jumped ahead (`low`), so
  //     turning the clock back can never deal days from before then;
  //   - the book keeps the last 32 days used; a day older than those (`floor`) counts as used.
  // So each calendar day gives its limits once at most, however often the clock moves, and a corrected clock
  // gets its real day back at once. Shared with the wardrobe's daily picks (wardrobe.js), which keep their own book.
  const BOOK = 32;
  const dayNum = (k) => { const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(typeof k === 'string' ? k : ''); return m ? Math.round(Date.UTC(+m[1], m[2] - 1, +m[3]) / 864e5) : NaN; };
  const okNum = (v) => (Number.isSafeInteger(v) && v > 0 && v < 1e6 ? v : null);
  HSC.dayBook = {
    num: dayNum,
    fresh: () => ({ low: null, floor: null, log: [] }),
    // a saved book: `entry` cleans one record (null drops it); the current day is never in the book
    clean(o, entry, cur) {
      const b = { low: null, floor: null, log: [] };
      if (!o || typeof o !== 'object') return b;
      b.low = okNum(o.low); b.floor = okNum(o.floor);
      const seen = new Set([dayNum(cur)]);
      for (const e of Array.isArray(o.log) ? o.log.slice(-BOOK) : []) {
        const n = dayNum(e && e.day), c = Number.isFinite(n) && !seen.has(n) ? entry(e) : null;
        if (c) { seen.add(n); b.log.push(c); }
      }
      return b;
    },
    // may the day move from `cur` to the device's `now`? (records a clock jump ahead in the book)
    may(B, cur, now) {
      const c = dayNum(cur), n = dayNum(now);
      if (!Number.isFinite(c)) return true;
      if (!Number.isFinite(n) || n === c) return false;
      if (B.floor != null && n <= B.floor) return false; // its record is gone: counted as used
      if (n < c && c - n <= 2) return false; // a time zone or a small set-back: the day stays
      const days = B.log.map((e) => dayNum(e.day));
      if (days.includes(n)) return true; // a day used before: its record comes back
      const top = Math.max(c, ...days);
      if (n > top) { if (n - top > 2 && B.low == null) B.low = top; return true; }
      return B.low != null && n >= B.low; // a day never played, earlier than one played: only a clock put right
    },
    // a day's record out of the book (it becomes the current day), or null
    take(B, day) {
      const n = dayNum(day), i = B.log.findIndex((e) => dayNum(e.day) === n);
      return i < 0 ? null : B.log.splice(i, 1)[0];
    },
    // a day left: its record goes into the book; the oldest beyond 32 leave it and raise the floor
    put(B, e) {
      const n = dayNum(e.day);
      B.log = B.log.filter((x) => dayNum(x.day) !== n).concat([e]);
      if (B.log.length > BOOK) {
        B.log.sort((a, b) => dayNum(a.day) - dayNum(b.day));
        while (B.log.length > BOOK) B.floor = Math.max(B.floor || 0, dayNum(B.log.shift().day));
      }
    },
  };

  function fresh() {
    return { v: 1, cuts: 0, firstDay: dayKey(), dailyDay: null, queue: null, trial: null, declines: 0, pauseLeft: 0, offerTurn: 0, seen: {}, deck: {}, last: {}, regulars: [], sinceReg: 0, coins: 0, lastRound: null, settings: null, modes: null, gift: null, maxDay: null, days: HSC.dayBook.fresh(), jobSeq: 0, counted: null };
  }
  const okTok = (v) => (typeof v === 'string' && v.length < 16) || (Number.isInteger(v) && v >= 0 && v < 8);
  function cleanDecks(o) {
    const out = {};
    if (o && typeof o === 'object') for (const k of Object.keys(DECKS)) if (Array.isArray(o[k]) && o[k].length <= 64 && o[k].every(okTok)) out[k] = o[k].slice();
    return out;
  }
  function cleanLast(o) {
    const out = {};
    if (o && typeof o === 'object') for (const k of Object.keys(DECKS)) if (okTok(o[k])) out[k] = o[k];
    return out;
  }
  function cleanRuns(o) {
    const out = {};
    if (o && typeof o === 'object') for (const k of ['loss', 'beard']) if (Array.isArray(o[k]) && o[k].length === 2 && o[k].every((v) => Number.isInteger(v) && v >= 0 && v <= 9)) out[k] = o[k].slice();
    return out;
  }
  // ---- regulars (Android, extras.js) ----
  // Customers the player has really cut may become regulars (about 3 in 5): the last 6 are kept with the cut
  // they left with. From the next day, or 10 customers later, one may walk back in with that cut grown out
  // (1-2 weeks of growth) and his beard grown back toward his usual style. Never two regulars close together.
  const REG = !!(HSC.PHENOTYPES && HSC.gridPack);
  const MAX_REG = 6;
  const gridOk = (s, max) => !!HSC.gridUnpack && !!HSC.gridUnpack(s, max);
  const dayOk = (v) => typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v);
  function cleanRegulars(a) {
    if (!REG || !Array.isArray(a)) return [];
    const top = HSC.BEARD_MM.length - 1;
    return a.slice(-64).filter((r) => r && typeof r === 'object' && HSC.validPerson(r.p) && gridOk(r.h, 5) && gridOk(r.b, top) && gridOk(r.u, top) &&
      (r.pr === null || (typeof r.pr === 'string' && r.pr.length < 40)) && dayOk(r.day) && Number.isSafeInteger(r.cuts) && r.cuts >= 0 && Number.isSafeInteger(r.n) && r.n >= 1 && r.n < 1000)
      .slice(-MAX_REG).map((r) => ({ p: r.p, h: r.h, b: r.b, u: r.u, pr: r.pr, day: r.day, cuts: r.cuts, n: r.n }));
  }
  const keepsComing = (seed) => ((Math.imul((seed >>> 0) ^ 0x1b873593, 0x9e3779b1) >>> 0) % 5) < 3;
  // a finished customer joins the regulars (his record without the visit's own flags)
  function rememberRegular(state) {
    const d = M.data, p = state && state.look && state.look.person;
    if (!REG || !d || !p || !HSC.validPerson(p) || p.first || !worked(state) || !keepsComing(p.seed)) return;
    if (!Array.isArray(state.hair) || state.hair.length !== 8192 || !Array.isArray(state.beard) || !Array.isArray(state.startBeard)) return;
    // a returning regular keeps his usual beard (the queue still holds this visit's entry)
    const q = d.queue && d.queue.job === state.jobId && d.queue.person && d.queue.person.seed === p.seed ? d.queue.regular : null;
    const h = HSC.gridPack(state.hair), b = HSC.gridPack(state.beard), u = q && q.u ? q.u : HSC.gridPack(state.startBeard);
    if (h.length + b.length + u.length > 16000) return; // a very ragged cut is not kept (save size)
    const n = Math.min(999, (Number.isSafeInteger(p.regular) ? p.regular : 0) + 1);
    const rec = Object.assign({}, p);
    for (const k of ['job', 'vip', 'daily', 'first', 'regular']) delete rec[k];
    // the cut he asked for this time is his usual next time (requests.js)
    const asked = HSC.requestStyleFor ? HSC.requestStyleFor(state.jobId) : null;
    if (asked) rec.usual = asked; else if (typeof rec.usual !== 'string') delete rec.usual;
    const prof = state.look && typeof state.look.profile === 'string' ? state.look.profile : null;
    d.regulars = d.regulars.filter((r) => r.p.seed !== p.seed).concat([{ p: rec, h, b, u, pr: prof, day: dayKey(), cuts: d.cuts, n }]).slice(-MAX_REG);
  }
  // the regular who walks in next, or null
  function regularDue(level, seed) {
    const d = M.data;
    if (!REG || level < 2 || !d.regulars.length || (d.sinceReg || 0) < 3) return null;
    const today = dayKey(), R = HSC.rng(((seed >>> 0) ^ 0x68e31da4) >>> 0 || 1);
    const due = d.regulars.filter((r) => r.day < today || d.cuts - r.cuts >= 10);
    if (!due.length || R.next() >= 0.3) return null;
    const r = due[0], top = HSC.BEARD_MM.length - 1;
    const hair = HSC.gridUnpack(r.h, 5), beard = HSC.gridUnpack(r.b, top), usual = HSC.gridUnpack(r.u, top);
    if (!hair || !beard || !usual) return null;
    const g = HSC.regularGrow(hair, beard, usual, R.next() < 0.55 ? 1 : 2);
    d.regulars = d.regulars.filter((x) => x !== r);
    return { person: Object.assign({}, r.p, { regular: r.n }), profile: r.pr, regular: { h: HSC.gridPack(g.hair), b: HSC.gridPack(g.beard), u: r.u } };
  }
  // the last scored customer (requests.js): stars, tips paid and whether they were tripled
  // the game mode, its current job (a flawed start and its repair, packed) and the daily challenge (modes.js)
  function cleanModes(o) {
    if (!o || typeof o !== 'object') return null;
    const MODES = ['career', 'requests', 'free', 'fix', 'beard', 'rush'];
    const j = o.job, okJob = j && typeof j === 'object' && Number.isSafeInteger(j.n) && MODES.includes(j.m) &&
      (j.none === true || (typeof j.st === 'string' && j.st.length < 40 && (typeof j.t === 'string' ? j.t.length < 24000 : typeof j.b === 'string' && j.b.length < 24000)));
    const dl = o.daily, okDaily = dl && typeof dl === 'object' && typeof dl.day === 'string' && /^\d{4}-\d\d-\d\d$/.test(dl.day) && [0, 1, 2, 3].includes(dl.stars);
    return { taste: o.taste === true, qp: o.qp && typeof o.qp.day === 'string' && Number.isSafeInteger(o.qp.n) ? { day: o.qp.day, n: o.qp.n } : null, wait: Number.isSafeInteger(o.wait) && o.wait >= 0 && o.wait < 100 ? o.wait : undefined, pv: o.pv && typeof o.pv.day === 'string' && Number.isSafeInteger(o.pv.n) ? { day: o.pv.day, n: o.pv.n } : null, mode: MODES.includes(o.mode) ? o.mode : 'requests', job: okJob ? { n: j.n, m: j.m, st: j.st, t: j.t, b: j.b, none: j.none === true || undefined } : null,
      ask: Array.isArray(o.ask) ? o.ask.filter((x) => typeof x === 'string' && x.length < 48).slice(-14) : [], wv: o.wv && typeof o.wv.day === 'string' && Number.isSafeInteger(o.wv.n) ? { day: o.wv.day, n: o.wv.n, pend: typeof o.wv.pend === 'string' && o.wv.pend.length < 80 ? o.wv.pend : null } : null, daily: okDaily ? { day: dl.day, stars: dl.stars, paid: dl.paid === true } : null, beforeDaily: MODES.includes(o.beforeDaily) && o.beforeDaily !== 'daily' ? o.beforeDaily : null, tried: Array.isArray(o.tried) ? o.tried.filter((m) => MODES.includes(m)).slice(0, 10) : [], rush: Number.isSafeInteger(o.rush) && o.rush >= 0 ? Math.min(o.rush, 1e6) : 0,
      // the Rush clock's play time used on this job, so a restart cannot give the clock back (modes.js)
      clock: o.clock && Number.isSafeInteger(o.clock.n) && Number.isFinite(o.clock.ms) ? { n: o.clock.n, ms: Math.max(0, Math.min(o.clock.ms, 45000)) } : null,
      // a Career Rush contract's clock, kept by the contract's id (Career can seat the contract on a new job)
      cclock: o.cclock && typeof o.cclock.id === 'string' && o.cclock.id.length < 160 && Number.isFinite(o.cclock.ms) ? { id: o.cclock.id, ms: Math.max(0, Math.min(o.cclock.ms, 45000)) } : null,
      // the order an Orders customer was given (requests.js), so a reload shows and scores the same order
      ord: o.ord && Number.isSafeInteger(o.ord.n) && Number.isSafeInteger(o.ord.p) && typeof o.ord.st === 'string' && o.ord.st.length < 40 ? { n: o.ord.n, p: o.ord.p, st: o.ord.st, bs: typeof o.ord.bs === 'string' && o.ord.bs.length < 24 ? o.ord.bs : null } : null };
  }
  // the play-time gift: today's active play seconds and the gifts taken (session.js)
  function cleanGift(o) {
    if (!o || typeof o !== 'object' || typeof o.day !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(o.day)) return null;
    // dbl: the gift whose doubling video was watched but whose coins did not land yet (paid doubled, no new video)
    return Object.assign({ day: o.day, sec: Number.isFinite(o.sec) && o.sec >= 0 ? Math.min(o.sec, 86400) : 0, got: Number.isSafeInteger(o.got) && o.got >= 0 ? Math.min(o.got, 9) : 0 }, Number.isSafeInteger(o.dbl) && o.dbl >= 0 && o.dbl < 9 ? { dbl: o.dbl } : {});
  }
  // one used day in the day book: what each daily limit had used on it (only records of that same day)
  const XCAP = /^[a-z]{1,12}$/;
  function cleanDayEntry(e) {
    if (!e || typeof e !== 'object' || !dayOk(e.day)) return null;
    const own = (o) => (o && o.day === e.day ? o : null);
    const m = cleanModes({ wv: e.wv, qp: e.qp, pv: e.pv }) || {};
    const out = { day: e.day }, g = own(cleanGift(e.gift));
    if (g) out.gift = g;
    for (const k of ['wv', 'qp', 'pv']) if (own(m[k])) out[k] = m[k];
    if (e.vip === true) out.vip = true;
    // limits kept by other modules (M.dailyCap): small plain records of the same day, cleaned again by their owner
    if (e.x && typeof e.x === 'object') for (const k of Object.keys(e.x).slice(0, 4)) {
      const v = e.x[k];
      let s = '';
      try { s = JSON.stringify(v); } catch (err) { continue; }
      if (XCAP.test(k) && v && typeof v === 'object' && v.day === e.day && s.length <= 600) (out.x || (out.x = {}))[k] = JSON.parse(s);
    }
    return out;
  }
  // the player's settings (settings.js)
  function cleanSettings(o) {
    if (!o || typeof o !== 'object') return null;
    const b = (v, d) => (typeof v === 'boolean' ? v : d);
    const lang = typeof o.lang === 'string' && /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(o.lang) ? o.lang : null;
    return { left: b(o.left, false), lang };
  }
  function cleanRound(r) {
    if (!r || typeof r !== 'object' || !Number.isSafeInteger(r.job) || ![0, 1, 2, 3].includes(r.stars)) return null;
    const n = (v) => (Number.isSafeInteger(v) && v >= 0 && v < 1e6 ? v : 0);
    const key = typeof r.key === 'string' && r.key.length <= 160 ? r.key : null;
    const lines = Array.isArray(r.lines) ? r.lines.filter((x) => Array.isArray(x) && x.length === 2 && typeof x[0] === 'string' && x[0].length < 32 && Number.isSafeInteger(x[1]) && Math.abs(x[1]) < 1e6).slice(0, 24) : [];
    const bill = r.bill && typeof r.bill.key === 'string' && r.bill.key.length < 80 ? { key: r.bill.key, lines: Array.isArray(r.bill.lines) ? r.bill.lines.filter((x) => Array.isArray(x) && x.length === 2 && typeof x[0] === 'string' && Number.isSafeInteger(x[1])).slice(0, 8) : [] } : null;
    // what the economy has not committed yet (requests.js pays it at the next start): the job as the economy reads it
    const pj = r.pend && r.pend.job, okJob = pj && typeof pj === 'object' && typeof pj.kind === 'string' && pj.kind.length < 16 && [0, 1, 2, 3].includes(pj.stars) && pj.valid === true;
    const pq = r.pend && r.pend.quick, okQuick = Array.isArray(pq) && pq.length === 2 && typeof pq[0] === 'string' && pq[0].length < 80 && Number.isSafeInteger(pq[1]) && pq[1] > 0 && pq[1] < 1000;
    const pend = okJob || okQuick ? Object.assign({}, okJob ? { job: { kind: pj.kind, stars: pj.stars, judged: pj.judged === true, valid: true, regular: pj.regular === true, vip: pj.vip === true, early: pj.early === true, rushBonus: Number.isSafeInteger(pj.rushBonus) ? Math.max(0, Math.min(12, pj.rushBonus)) : 0, demandMatch: pj.demandMatch === true } } : {}, okQuick ? { quick: [pq[0], pq[1]] } : {}) : null;
    // who this round was (requests.js): a job number repeated after the game's session was replaced is not the same job
    const u32 = (v) => (Number.isSafeInteger(v) && v >= 0 && v <= 0xffffffff ? v : undefined);
    return Object.assign({ p: u32(r.p), sd: u32(r.sd), seq: Number.isSafeInteger(r.seq) && r.seq >= 0 ? r.seq : undefined }, { job: r.job, key, judged: r.judged === true, video: n(r.video), stars: r.stars, tips: n(r.tips), tip: n(r.tip), paid: n(r.paid), lines, bill, tripled: r.tripled === true, shownStars: [1, 2, 3].includes(r.shownStars) ? r.shownStars : r.stars, prev: Math.min(999, n(r.prev)), mult: [1, 1.2, 1.5, 2].includes(r.mult) ? r.mult : 1, free: r.free === true }, pend && key ? { pend } : {});
  }
  // the latest day this save has seen (a save from before the game's day kept one: the days its limits were counted on)
  function latestDay(d) {
    const days = [d.maxDay, d.dailyDay, d.gift && d.gift.day].concat(d.modes ? ['wv', 'qp', 'pv'].map((k) => d.modes[k] && d.modes[k].day) : []).filter(dayOk);
    return days.length ? days.reduce((a, b) => (b > a ? b : a)) : null;
  }
  function sanitize(d) {
    const f = fresh();
    if (!d || typeof d !== 'object' || d.v !== 1) return f;
    const int = (v, dflt) => (Number.isSafeInteger(v) && v >= 0 ? v : dflt);
    const str = (v) => (typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v) ? v : null);
    const q = d.queue && Number.isSafeInteger(d.queue.job) && HSC.validPerson(d.queue.person) ? { job: d.queue.job, person: d.queue.person, profile: typeof d.queue.profile === 'string' ? d.queue.profile : null } : null;
    // a regular in the queue keeps his grown-out hair and beard only when both unpack cleanly
    const qr = d.queue && d.queue.regular, top = HSC.BEARD_MM ? HSC.BEARD_MM.length - 1 : 0;
    if (q && REG && qr && gridOk(qr.h, 5) && gridOk(qr.b, top) && gridOk(qr.u, top)) q.regular = { h: qr.h, b: qr.b, u: qr.u };
    const t = d.trial && Number.isSafeInteger(d.trial.job) && typeof d.trial.key === 'string' ? d.trial : null;
    // a save with a day book keeps its own day (it can be earlier than a limit's day after a clock put right)
    const day = d.days && typeof d.days === 'object' && dayOk(d.maxDay) ? d.maxDay : latestDay(d);
    return {
      v: 1, cuts: int(d.cuts, 0), homeSeen: d.homeSeen === true || int(d.cuts, 0) > 1, firstDay: str(d.firstDay) || f.firstDay,
      dailyDay: str(d.dailyDay), queue: q, trial: t, declines: int(d.declines, 0), pauseLeft: int(d.pauseLeft, 0),
      offerTurn: int(d.offerTurn, 0), seen: d.seen && typeof d.seen === 'object' ? d.seen : {},
      deck: cleanDecks(d.deck), last: cleanLast(d.last), sinceVip: int(d.sinceVip, 9), runs: cleanRuns(d.runs), regulars: cleanRegulars(d.regulars), sinceReg: int(d.sinceReg, 0), coins: Math.min(99999999, int(d.coins, 0)), lastRound: cleanRound(d.lastRound), combo: Math.min(999, int(d.combo, 0)), settings: cleanSettings(d.settings), modes: cleanModes(d.modes), gift: cleanGift(d.gift),
      maxDay: day, days: HSC.dayBook.clean(d.days, cleanDayEntry, day), jobSeq: int(d.jobSeq, 0), counted: typeof d.counted === 'string' && d.counted.length <= 160 ? d.counted : null,
    };
  }
  M.save = function () {
    if (M.client && M.client.saveProgress && M.data) M.client.saveProgress(KEY, M.data).catch(() => {});
  };
  // loaded before the game controller starts, so the first customer already follows the level
  HSC.metaInit = async function (client) {
    M.client = client;
    const d = client && client.loadProgress ? await client.loadProgress(KEY, null) : null;
    M.data = sanitize(d);
    oneTab(client);
  };
  // one game at a time: a newer tab takes over and this one pauses and stops saving (two tabs writing
  // the same saves would lose unlocks and progress). The tab in front always plays: coming back to a paused
  // tab, or the other tab closing while this one is in view, reloads it with the latest saves.
  function oneTab(client) {
    let ch;
    try { ch = new BroadcastChannel('skin-fade-studio-tabs'); } catch (e) { return; }
    const me = Math.random().toString(36).slice(2);
    let by = null, reloading = false;
    const reload = () => { if (!reloading) { reloading = true; location.reload(); } };
    ch.onmessage = (e) => {
      const m = e.data || {};
      if (m.hi && m.me !== me) {
        by = m.me;
        HSC.otherTab = true;
        if (client && client.setPauseReason) client.setPauseReason('other-tab', true);
      } else if (m.bye && m.me === by && document.visibilityState === 'visible') reload();
    };
    ch.postMessage({ hi: 1, me });
    addEventListener('pagehide', () => { try { ch.postMessage({ bye: 1, me }); } catch (e) {} });
    document.addEventListener('visibilitychange', () => { if (HSC.otherTab && document.visibilityState === 'visible') reload(); });
  }

  M.level = () => levelOf(M.data ? M.data.cuts : 0);
  // how far the barber is through the current level, 0..1 (the home screen's XP bar)
  M.levelProgress = () => { const c = M.data ? M.data.cuts : 0, l = levelOf(c), a = cutsFor(l), b = cutsFor(l + 1); return b > a ? Math.max(0, Math.min(1, (c - a) / (b - a))) : 0; };
  // the game's day for every daily limit (gifts, videos, Quick Play pay, tasks, the daily VIP): the device's date,
  // kept by the day book (above). Moving to another day files the day left with what its limits used and brings
  // back the new day's own record, if it was used before; a limit with no record that day starts afresh.
  const caps = {}; // limits other modules keep in their own saves: name -> [get, set]
  M.dailyCap = (name, get, set) => { if (XCAP.test(name) && typeof get === 'function' && typeof set === 'function') caps[name] = [get, set]; };
  function leaveDay(d, day) {
    const e = { day }, md = d.modes;
    let used = false;
    if (d.gift && d.gift.day === day) { e.gift = d.gift; used = true; }
    if (md) for (const k of ['wv', 'qp', 'pv']) if (md[k] && md[k].day === day) { e[k] = md[k]; used = true; }
    if (d.dailyDay === day) { e.vip = true; used = true; }
    for (const [k, [get]] of Object.entries(caps)) {
      let v = null;
      try { v = get(); } catch (err) {}
      if (v && v.day === day) { (e.x || (e.x = {}))[k] = v; used = true; }
    }
    // the same objects, not copies: a claim still finishing for the day left (a video across midnight) lands in its record
    if (used) HSC.dayBook.put(d.days, e);
  }
  function enterDay(d, day, e) {
    const md = d.modes;
    d.gift = e.gift || null;
    if (md) for (const k of ['wv', 'qp', 'pv']) md[k] = e[k] || null;
    d.dailyDay = e.vip ? day : null;
    for (const [k, [, set]] of Object.entries(caps)) { try { set((e.x && e.x[k]) || null); } catch (err) {} }
  }
  M.today = () => {
    const now = dayKey(), d = M.data;
    if (!d) return now;
    if (!d.days) d.days = HSC.dayBook.fresh();
    if (!dayOk(d.maxDay)) { d.maxDay = now; M.save(); return now; }
    if (now === d.maxDay || !HSC.dayBook.may(d.days, d.maxDay, now)) return d.maxDay;
    // the new day's record is taken out first, so filing the day left can never push it out of the book
    const e = HSC.dayBook.take(d.days, now) || { day: now };
    leaveDay(d, d.maxDay);
    d.maxDay = now;
    enterDay(d, now, e);
    M.save();
    return now;
  };

  // ---- customers ----
  // what a customer may have at this level; `extra` forces a showcase feature or a VIP
  function generate(seed, level, extra = {}) {
    const R = HSC.rng((seed ^ 0x2c1b3c6d) >>> 0 || 1);
    const opts = extra.first ? {} : dealt(level, R);
    if (level < 3) { if (!opts.age || opts.age === 'old') opts.age = R.next() < 0.55 ? 'young' : 'middle'; opts.grey = 0; opts.beardGrey = 0; }
    if (level < 2) { opts.noLoss = true; delete opts.norwood; delete opts.baldType; }
    if (extra.feature === 'old') { opts.age = 'old'; delete opts.grey; delete opts.beardGrey; }
    if (extra.feature === 'loss') { delete opts.noLoss; delete opts.baldType; opts.norwood = ['3', '3v', '4', '5'][Math.floor(R.next() * 4)]; }
    // the very first customer is the tutorial's full head of hair; a VIP is context, never a physical upgrade
    if (extra.first) { opts.noLoss = true; delete opts.norwood; delete opts.baldType; opts.age = R.next() < 0.6 ? 'young' : 'middle'; opts.grey = 0; opts.beardGrey = 0; }
    // what this level or feature needs is selected from naturally generated customers, never written onto one
    const shaved = extra.first || level < 2, wantBeard = extra.feature === 'beard';
    if (shaved || wantBeard) delete opts.beard; // the dealt style gives way: selection decides
    // before level 4, hair loss stops at a Norwood 4 (the very bald crowns come later): selected too, never rewritten
    const crownOk = (x) => level >= 4 || !!extra.feature || !['5', '6', '7'].includes(x.bald.norwood);
    const fits = (x) => crownOk(x) && (shaved ? x.beard.style === 'clean' : !wantBeard || !['clean', 'stubble'].includes(x.beard.style.replace(/\d+$/, '')));
    // the fallback (an impossible run of seeds) asks the generator for what the level allows instead
    const cap = level < 4 && !extra.feature && !opts.noLoss && (opts.norwood == null || ['5', '6', '7'].includes(String(opts.norwood))) ? { norwood: '4' } : {};
    const p = HSC.selectPerson(seed >>> 0 || 1, opts, fits) || HSC.makePerson(seed >>> 0 || 1, Object.assign({}, opts, shaved ? { beard: 'clean' } : {}, cap));
    // the runs count the customer as finally made (after the VIP and showcase rules)
    if (M.data && !extra.first && level >= 2) { note('loss', p.bald.norwood !== '1' || p.bald.type !== 'none'); note('beard', p.beard.style !== 'clean'); }
    if (extra.vip) p.vip = true;
    if (extra.first) p.first = true;
    if (extra.daily) p.daily = extra.daily;
    return p;
  }
  M.makeVip = (seed) => generate(seed, M.level(), { vip: true });
  // the walk-in hair is decided with the customer, so the reveal hub can show them exactly
  M.profileFor = function (person, recent) {
    const W = HSC.walkIns;
    if (!W) return null;
    const fam = M.data ? dealFamily(person, HSC.rng(((person.seed >>> 0) ^ 0x7f4a7c15) >>> 0 || 1)) : null;
    const p = HSC.pickWalkIn(person, Array.isArray(recent) ? recent : [], fam);
    return p ? p.id : null;
  };

  // the customer for a job; `seed` is the game's own per-job seed
  HSC.personForJob = function (s, seed) {
    const d = M.data;
    if (d && d.queue && d.queue.job === s.jobId && HSC.validPerson(d.queue.person)) return Object.assign({}, d.queue.person, { job: s.jobId });
    const first = !!d && d.cuts === 0 && s.jobId === 1;
    // Quick Play is the open game: any customer can walk in at any level
    const level = HSC.modes && HSC.modes.current() === 'free' ? 99 : M.level();
    return Object.assign(generate(seed, level, first ? { first: true } : {}), { job: s.jobId });
  };

  // a haircut was finished: progress, and who comes in next
  M.onFinish = function (state) {
    const d = M.data;
    if (!d) return null;
    const before = levelOf(d.cuts);
    // level comes from paid work only: not a customer finished with no cut, Quick Play, an empty chair or a job seen twice
    const noWork = d.lastRound && d.lastRound.job === state.jobId && d.lastRound.judged && !d.lastRound.stars; // Rescue or Beards with no real work
    const paid = worked(state) && !noWork && !(HSC.modes && HSC.modes.econJob(state).kind === 'free') && !(HSC.repeatJob && HSC.repeatJob(state.jobId));
    // counted once per job (its pay key), so a reveal finished again after a reload never counts the cut twice
    const ck = d.lastRound && d.lastRound.job === state.jobId && d.lastRound.key ? d.lastRound.key : 'job' + state.jobId;
    if (paid && d.counted !== ck) { d.cuts += 1; d.counted = ck; rememberRegular(state); }
    const level = levelOf(d.cuts);
    const today = M.today();
    // next customer: the new level's feature > daily VIP (from the second day on; once per game day, so never twice
    // for one day whatever the clock does: the day book brings back a day's VIP with the day) > VIP walk-in > anyone
    const job = state.jobId + 1;
    // Career picks its own next customer (career-run.js): the daily VIP and due regulars wait for the other modes
    if (HSC.modes && HSC.modes.current() === 'career') { M.save(); return { levelUp: level > before, level, before, job }; }
    // the next customer was already chosen and shown: they stay (a daily VIP too)
    if (d.queue && d.queue.job === job && HSC.validPerson(d.queue.person)) {
      M.save();
      return { levelUp: level > before, level, before, job };
    }
    const seed = (((state.seed >>> 0) ^ Math.imul(job + 1, 0x9e3779b1)) >>> 0) || 1;
    let person, reg = null;
    // Quick Play is the open game: its next customer can be anyone, at any level
    const open = HSC.modes && HSC.modes.current() === 'free', gl = open ? 99 : level;
    const FEATURE = { 2: 'beard', 3: 'old', 4: 'loss' };
    // a VIP (full hair, a big beard) waits a customer when it would make a fourth of a kind in a row
    const vipFits = !streak('loss', false) && (level < 2 || !streak('beard', true));
    if (level > before && FEATURE[level]) {
      person = generate(seed, level, { feature: FEATURE[level] });
    } else if (d.dailyDay !== today && d.firstDay !== today && vipFits) {
      person = generate(hash('daily-' + today), gl, { vip: true, daily: today });
      d.dailyDay = today;
    } else if (level > before && level === 5 && vipFits) {
      person = generate(seed, level, { vip: true });
    } else if (!open && (reg = regularDue(level, seed))) {
      // a regular comes back with his last cut grown out
      person = reg.person;
      note('loss', person.bald.norwood !== '1' || person.bald.type !== 'none');
      note('beard', person.beard.style !== 'clean');
    } else {
      // VIPs walk in now and then, never two close together
      person = generate(seed, gl, level >= 5 && vipFits && (d.sinceVip || 0) >= 4 && HSC.rng(seed).next() < 0.18 ? { vip: true } : {});
    }
    d.sinceVip = person.vip ? 0 : (d.sinceVip || 0) + 1;
    if (REG) d.sinceReg = reg ? 0 : (d.sinceReg || 0) + 1;
    d.queue = reg ? { job, person, profile: reg.profile, regular: reg.regular } : { job, person, profile: M.profileFor(person, state.recentLooks) };
    M.save();
    return { levelUp: level > before, level, before, job };
  };
})(globalThis.HSC || (globalThis.HSC = {}));
