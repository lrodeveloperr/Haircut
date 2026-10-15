// ---------------------------------------------------------------------------------------------
// Progress between haircuts: barber level, daily streak, the daily VIP, and the queue that decides
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
  const VIP_BEARDS = ['full', 'long', 'boxed', 'mutton', 'full', 'long'];

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
  (HSC.HERITAGE || []).forEach((h, i) => {
    DECKS['tex' + i] = deckFrom(h.tex, 10);
    const pal = HSC.HAIR_BY_CLASS && HSC.HAIR_BY_CLASS[h.id];
    if (pal) DECKS['col' + i] = deckFrom(pal.base, 30);
  });
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
  // a beard style with its real odds for this age and heritage, never the same style twice in a row
  function beardStyle(age, cls, R, big) {
    const base = Object.assign({}, (HSC.BEARD_BY_AGE || {})[age] || {});
    const mult = (HSC.BEARD_CLASS_MULT || {})[cls] || {};
    const recent = M.data.deck.beardRecent || [];
    const w = {};
    for (const [k, v] of Object.entries(base)) {
      if (k === 'clean' || k === 'stubble' || recent.includes(k)) continue;
      if (big && !['full', 'long', 'boxed', 'shenandoah', 'mutton'].includes(k)) continue;
      w[k] = v * (mult[k] || 1);
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
    if (cls === 'east-asian' && beard === 'style' && R.next() < 0.45) beard = 'clean';
    if (level >= 2 && streak('beard', beard !== 'clean')) beard = beard === 'clean' ? (o.age === 'young' ? 'stubble' : 'style') : 'clean';
    o.beard = beard === 'style' ? beardStyle(o.age, cls, R) : beard;
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
  // a VIP's big beard, with the heritage's odds
  function vipBeard(age, cls, R) { return beardStyle(age === 'old' ? 'old' : age, cls, R, true); }
  // the haircut family for a customer: dealt too, from what suits them (no long or full tops on a bald crown)
  function dealFamily(person, R) {
    const b = person.bald || {};
    const heavy = ['4', '5', '6', '7'].includes(b.norwood) || b.type === 'diffuse';
    if (person.vip || person.first) return person.first ? 'full' : deal('fam', R, (f) => f === 'long' || f === 'full' || f === 'tight');
    return deal('fam', R, (f) => (!heavy || f === 'crop' || f === 'buzz' || f === 'shaved') && !(f === 'tight' && person.age === 'old'));
  }

  const M = (HSC.meta = { data: null, client: null, levelOf, cutsFor });

  const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };
  const hash = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

  function fresh() {
    return { v: 1, cuts: 0, streak: 0, lastDay: null, firstDay: dayKey(), dailyDay: null, queue: null, trial: null, declines: 0, pauseLeft: 0, offerTurn: 0, seen: {}, deck: {}, last: {} };
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
  function sanitize(d) {
    const f = fresh();
    if (!d || typeof d !== 'object' || d.v !== 1) return f;
    const int = (v, dflt) => (Number.isSafeInteger(v) && v >= 0 ? v : dflt);
    const str = (v) => (typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v) ? v : null);
    const q = d.queue && Number.isSafeInteger(d.queue.job) && HSC.validPerson(d.queue.person) ? { job: d.queue.job, person: d.queue.person, profile: typeof d.queue.profile === 'string' ? d.queue.profile : null } : null;
    const t = d.trial && Number.isSafeInteger(d.trial.job) && typeof d.trial.key === 'string' ? d.trial : null;
    return {
      v: 1, cuts: int(d.cuts, 0), streak: int(d.streak, 0), lastDay: str(d.lastDay), firstDay: str(d.firstDay) || f.firstDay,
      dailyDay: str(d.dailyDay), queue: q, trial: t, declines: int(d.declines, 0), pauseLeft: int(d.pauseLeft, 0),
      offerTurn: int(d.offerTurn, 0), seen: d.seen && typeof d.seen === 'object' ? d.seen : {},
      deck: cleanDecks(d.deck), last: cleanLast(d.last), sinceVip: int(d.sinceVip, 9), runs: cleanRuns(d.runs),
    };
  }
  M.save = function () {
    if (M.client && M.client.saveProgress && M.data) M.client.saveProgress(KEY, M.data).catch(() => {});
  };
  // loaded before the game controller starts, so the first customer already follows the level
  HSC.metaInit = async function (client) {
    M.client = client;
    let d = null;
    try { d = client && client.loadProgress ? await client.loadProgress(KEY, null) : null; } catch (e) {}
    M.data = sanitize(d);
    // a streak survives only if the last haircut was today or yesterday
    if (M.data.lastDay !== dayKey() && M.data.lastDay !== yesterday()) M.data.streak = 0;
    oneTab(client);
  };
  // the streak as it stands now (a tab left open past a missed day shows 0, not the old number)
  M.streakNow = () => (M.data && (M.data.lastDay === dayKey() || M.data.lastDay === yesterday()) ? M.data.streak : 0);

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
  M.today = dayKey;

  // ---- customers ----
  // what a customer may have at this level; `extra` forces a showcase feature or a VIP
  function generate(seed, level, extra = {}) {
    const R = HSC.rng((seed ^ 0x2c1b3c6d) >>> 0 || 1);
    const opts = extra.first ? {} : dealt(level, R);
    if (level < 2) opts.beard = 'clean';
    if (level < 3) { if (!opts.age || opts.age === 'old') opts.age = R.next() < 0.55 ? 'young' : 'middle'; opts.grey = 0; opts.beardGrey = 0; }
    if (level < 2) { opts.noLoss = true; delete opts.norwood; delete opts.baldType; }
    if (extra.feature === 'beard') opts.beard = ['full', 'boxed', 'goatee', 'moustache', 'vandyke', 'chinstrap'][Math.floor(R.next() * 6)];
    if (extra.feature === 'old') { opts.age = 'old'; delete opts.grey; delete opts.beardGrey; }
    if (extra.feature === 'loss') { delete opts.noLoss; delete opts.baldType; opts.norwood = ['3', '3v', '4', '5'][Math.floor(R.next() * 4)]; }
    if (extra.vip || extra.first) {
      // the most satisfying cut: a full, thick head of hair (and a big beard once beards are in)
      opts.noLoss = true;
      delete opts.norwood; delete opts.baldType;
      opts.age = R.next() < 0.6 ? 'young' : 'middle';
      opts.grey = 0; opts.beardGrey = 0;
      opts.beard = extra.first || level < 2 ? 'clean' : M.data ? vipBeard(opts.age, ((HSC.HERITAGE || [])[opts.heritage] || {}).id, R) : VIP_BEARDS[Math.floor(R.next() * VIP_BEARDS.length)];
    }
    const p = HSC.makePerson(seed >>> 0 || 1, opts);
    // the streaks count the customer as finally made (after the VIP and showcase rules)
    if (M.data && !extra.first && level >= 2) { note('loss', p.bald.norwood !== '1' || p.bald.type !== 'none'); note('beard', p.beard.style !== 'clean'); }
    // before level 4, hair loss stops at a Norwood 4 (the very bald crowns come later)
    if (level < 4 && !extra.feature && ['5', '6', '7'].includes(p.bald.norwood)) p.bald.norwood = '4';
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
    return Object.assign(generate(seed, M.level(), first ? { first: true } : {}), { job: s.jobId });
  };

  // a haircut was finished: progress, streak, and who comes in next
  M.onFinish = function (state) {
    const d = M.data;
    if (!d) return null;
    const before = levelOf(d.cuts);
    // finishing without a single cut is not a haircut: no level, no streak (the next customer still comes)
    const counted = state.cutStrokeCount > 0;
    if (counted) d.cuts += 1;
    const level = levelOf(d.cuts);
    const today = dayKey();
    if (counted && d.lastDay !== today) d.streak = d.lastDay === yesterday() ? d.streak + 1 : 1;
    if (counted) d.lastDay = today;
    // next customer: the new level's feature > daily VIP (from the second day on; never twice for one day,
    // even with the clock turned back) > VIP walk-in > anyone
    const job = state.jobId + 1;
    // a replayed haircut: the next customer was already chosen and shown, they stay (a daily VIP too)
    if (d.queue && d.queue.job === job && HSC.validPerson(d.queue.person)) {
      M.save();
      return { levelUp: level > before, level, before, job };
    }
    const seed = (((state.seed >>> 0) ^ Math.imul(job + 1, 0x9e3779b1)) >>> 0) || 1;
    let person;
    const FEATURE = { 2: 'beard', 3: 'old', 4: 'loss' };
    // a VIP (full hair, a big beard) waits a customer when it would make a fourth of a kind in a row
    const vipFits = !streak('loss', false) && (level < 2 || !streak('beard', true));
    if (level > before && FEATURE[level]) {
      person = generate(seed, level, { feature: FEATURE[level] });
    } else if ((!d.dailyDay || today > d.dailyDay) && d.firstDay !== today && vipFits) {
      person = generate(hash('daily-' + today), level, { vip: true, daily: today });
      d.dailyDay = today;
    } else if (level > before && level === 5 && vipFits) {
      person = generate(seed, level, { vip: true });
    } else {
      // VIPs walk in now and then, never two close together
      person = generate(seed, level, level >= 5 && vipFits && (d.sinceVip || 0) >= 4 && HSC.rng(seed).next() < 0.18 ? { vip: true } : {});
    }
    d.sinceVip = person.vip ? 0 : (d.sinceVip || 0) + 1;
    d.queue = { job, person, profile: M.profileFor(person, state.recentLooks) };
    M.save();
    return { levelUp: level > before, level, before, job };
  };
})(globalThis.HSC || (globalThis.HSC = {}));
