// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the career contract director (docs/CAREER-CONTRACT-DIRECTOR.md,
// CAREER-MAP-LOGIC.md sections 6, 8-11; CITY-CUSTOMER-VARIABILITY.md section 4; owner-approved 5 November 2026).
//
// It builds each career job from validated parts, in the spec's order:
//   seed -> role grammar -> customer source -> customer -> starting condition -> achievable requests ->
//   difficulty limits -> hard anti-repeat -> weights (city tendency, novelty, lane rotation) -> pick -> re-validate
// and relaxes only soft rules when nothing survives, ending at a guaranteed standard Orders job.
//
// Pure logic. It talks to the game through a catalog (career-catalog.js builds it from the real customers, hair
// grids and modes; the tests use a synthetic one):
//   catalog.modes                       { id: { lane(start, request), specialist, eligible(ctx) } }
//   catalog.customer(seed, ctx)          -> { person, traits: { silhouette, texture, beard, age } }
//   catalog.starts(customer, mode, ctx)  -> [ { id, silhouette, beard, damage, cost: {...}, build } ]
//   catalog.requests(customer, start, mode, ctx) -> [ { id, family, beardGoal, services, cost: {...}, weight } ]
//   catalog.validate(contract, ctx)      -> [] or [reason codes]
//   catalog.baseline(customer, ctx)      -> a standard Orders { start, request } that always exists
//   catalog.presence(contract)           -> optional 'hair|beard' broad state, e.g. 'short|stubble' (map logic §9)
//   catalog.timeNeeded(contract)         -> optional seconds a timed job needs (checked against its timer)
// Every random choice is drawn from streams seeded by purpose, so adding a roll in one place cannot change
// another (save contract section 5).
// Fairness (director section 9): fair decks for style families, service sets and regulars give a capped underuse
// bonus to what has not been offered since the deck last refilled; a fourth customer in a row with the same broad
// hair presence, or the same facial-hair state, is refused while another customer can be drawn (map logic §9); required progression stays within two bands of
// the player's recent comfort band (map logic section 8); a timed job must fit its timer with safety margins.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const REVISION = 1; // contract-generation revision: part of every contract seed
  const RING = 200; // effective-duplicate exclusion window
  const LANE_WINDOW = 8, LANE_MAX = 3;
  const BUDGET = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 6]; // band -> complexity budget (director section 6)
  const SPECIALIST = ['fix', 'beard', 'rush'];
  const SURPRISE = ['rescue', 'rush', 'visitor', 'vip'];
  const VIP_GAP = 8, REGULAR_GAP = 3;
  const ATTEMPTS = 6; // per relaxation stage: generation never loops indefinitely
  const PRESENCE_TRIES = 24; // customer draws the normal stage may spend avoiding a fourth same-state customer
  const UNDERUSE = 2.5; // the capped bonus for a deck card not offered since the deck refilled
  const DECK_MAX = 48; // bounded deck memory per deck (save contract section 4)
  const RUSH_LIMIT = 45; // seconds on the Rush clock (modes.js)

  // ---- deterministic streams ----
  function rng(seed) {
    let a = seed >>> 0 || 1;
    const next = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    return { next, int: (n) => Math.floor(next() * n), pick: (arr) => arr[Math.floor(next() * arr.length)] };
  }
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0 || 1; };
  const stream = (seed, purpose) => rng(hash(seed + '/' + purpose));
  function weighted(R, items, w) {
    const total = items.reduce((a, it) => a + Math.max(0, w(it)), 0);
    if (!(total > 0)) return items.length ? items[0] : null;
    let x = R.next() * total;
    for (const it of items) { x -= Math.max(0, w(it)); if (x <= 0) return it; }
    return items[items.length - 1];
  }

  // ---- director memory (bounded; save contract section 4) ----
  function fresh() {
    return { turn: 0, sig: [], lanes: [], last: null, decks: {}, cool: { vip: -99, surprise: [], disasterChapter: -99, chapter: 0 }, regs: {}, band: { adj: 0, recent: [], ok: [] }, chapterLog: [], presence: [], used: {} };
  }
  // an open deck of what has been offered since it last refilled (style families, service sets, regulars): a card
  // still in the deck gets the underuse bonus; once every candidate's card is used, the deck refills
  function usedOf(dir, name) { dir.used = dir.used || {}; return (dir.used[name] = Array.isArray(dir.used[name]) ? dir.used[name] : []); }
  function underuse(dir, name, card, all) {
    const u = usedOf(dir, name);
    if (all.every((c) => u.includes(c))) return 1; // the deck is spent for these candidates: no one is favoured
    return u.includes(card) ? 1 : UNDERUSE;
  }
  function useCard(dir, name, card, all) {
    const u = usedOf(dir, name);
    if (all.length && all.every((c) => u.includes(c))) u.length = 0; // refill
    if (!u.includes(card)) u.push(card);
    if (u.length > DECK_MAX) u.splice(0, u.length - DECK_MAX);
  }
  // would this broad state make a fourth in a row (hair presence or facial-hair state, each on its own)?
  function presenceRepeat(dir, p) {
    const last = Array.isArray(dir.presence) ? dir.presence.slice(-3) : [];
    if (!p || last.length < 3 || last.some((x) => !x)) return false;
    const [h, b] = p.split('|');
    return last.every((x) => x.split('|')[0] === h) || last.every((x) => x.split('|')[1] === b);
  }
  const svcKey = (c) => (c.request.services && c.request.services.length ? c.request.services.slice().sort().join('+') : null);
  // a fair deck: cards are consumed before it refills; an invalid card stays for a later compatible contract
  function deckDraw(dir, name, cards, R, ok) {
    const d = dir.decks[name] && dir.decks[name].left ? dir.decks[name] : (dir.decks[name] = { left: [] });
    if (!d.left.length || !d.left.some((c) => cards.includes(c))) d.left = cards.slice().sort(() => R.next() - 0.5);
    const valid = d.left.filter((c) => cards.includes(c) && ok(c));
    if (!valid.length) return null;
    const c = valid[0];
    d.left = d.left.filter((x) => x !== c);
    return c;
  }

  // ---- difficulty bands (map logic section 8) ----
  function band(core, dir, pos) {
    let lo, hi;
    if (pos.licence) { const ch = pos.chapter; lo = 0; hi = Math.min(3, Math.floor((ch - 1) / 2) + 1); }
    else if (core.tour.n === 1) { lo = 2; hi = 5; }
    else { lo = Math.min(9, 3 + Math.floor((core.tour.n - 2) / 2)); hi = 10; }
    // the preferred band moves with demonstrated mastery, never more than two above the comfort band: the highest
    // band of the player's recent good (2-3 star) results, or the tier's floor before there are any
    const base = Math.min(hi, lo + Math.max(0, dir.band.adj));
    const ok = Array.isArray(dir.band.ok) ? dir.band.ok : [], comfort = ok.length ? Math.max(...ok) : lo;
    return Math.max(lo, Math.min(hi, base, comfort + 2));
  }
  function noteResult(dir, stars, valid, atBand) {
    const r = dir.band.recent;
    if (!Array.isArray(dir.band.ok)) dir.band.ok = [];
    if (valid && stars >= 2 && Number.isSafeInteger(atBand)) { dir.band.ok.push(atBand); if (dir.band.ok.length > 4) dir.band.ok.shift(); }
    r.push(valid ? stars : 0); if (r.length > 4) r.shift();
    const last2 = r.slice(-2);
    if (last2.length === 2 && last2.every((x) => x >= 3)) { dir.band.adj = Math.min(dir.band.adj + 1, 6); r.length = 0; }
    else if (last2.length === 2 && last2.every((x) => x <= 1)) { dir.band.adj = Math.max(dir.band.adj - 1, -2); r.length = 0; }
  }

  // ---- the role grammar (map logic section 6; director section 10) ----
  // the licence teaches in order: chapter themes decide which specialist and surprise jobs are allowed
  // home chapter 3 teaches repairs with a first beard as its surprise; chapter 4 makes beards the specialist job
  const LICENCE_SPEC = { 1: [], 2: [], 3: ['fix'], 4: ['beard'], 5: ['rush'], 6: SPECIALIST };
  const LICENCE_SURPRISE = { 1: [], 2: ['visitor'], 3: ['beard'], 4: ['rescue', 'visitor'], 5: ['rush', 'visitor', 'vip'], 6: SURPRISE };
  function roleMode(pos, dir, catalog, R, ctx, chapterModes, chapterLanes) {
    const eligible = (m) => catalog.modes[m] && (!catalog.modes[m].eligible || catalog.modes[m].eligible(ctx));
    if (pos.role === 'local') return { mode: 'requests' };
    if (pos.role === 'relationship') return { mode: 'requests', regular: true };
    if (pos.role === 'specialist') {
      let cards = (pos.licence ? LICENCE_SPEC[pos.chapter] : SPECIALIST).filter(eligible);
      // not the previous chapter's specialist when another is eligible
      const prev = dir.cool.lastSpecialist;
      if (cards.length > 1) cards = cards.filter((m) => m !== prev);
      // plan the chapter's three lanes: if no lane-bringing surprise (rescue, rush) will be free this chapter,
      // the specialist brings the new lane itself (beards share the precision lane with ordinary cuts)
      const surpriseFree = ['rescue', 'rush'].filter((c) => !dir.cool.surprise.includes(c) && !(c === 'rescue' && dir.cool.chapter - dir.cool.disasterChapter <= 1));
      if (!surpriseFree.length && cards.length > 1) { const own = cards.filter((m) => m !== 'beard'); if (own.length) cards = own; }
      const m = cards.length ? deckDraw(dir, 'spec', cards, R, () => true) : null;
      return { mode: m || 'requests' };
    }
    if (pos.role === 'surprise') {
      let cards = (pos.licence ? LICENCE_SURPRISE[pos.chapter] : SURPRISE).slice();
      cards = cards.filter((c) => !dir.cool.surprise.includes(c));
      if (dir.cool.chapter - dir.cool.disasterChapter <= 1) cards = cards.filter((c) => c !== 'rescue');
      if (dir.turn - dir.cool.vip < VIP_GAP) cards = cards.filter((c) => c !== 'vip');
      cards = cards.filter((c) => (c === 'rescue' ? eligible('fix') : c === 'rush' ? eligible('rush') : c === 'beard' ? eligible('beard') : true));
      // a chapter needs three lanes: when it still lacks one, the surprise brings recovery or pressure
      // (a visitor or VIP order can bring transformation or precision, whichever the chapter lacks)
      const LANE_OF = { rescue: ['recovery'], rush: ['pressure'], visitor: ['transformation', 'precision'], vip: ['transformation', 'precision'], beard: ['precision'] };
      if (chapterLanes && chapterLanes.size < 3) { const fresh = cards.filter((c) => LANE_OF[c].some((l) => !chapterLanes.has(l))); if (fresh.length) cards = fresh; }
      const c = cards.length ? deckDraw(dir, 'surprise', cards, R, () => true) : null;
      if (c === 'rescue') return { mode: 'fix', surprise: c };
      if (c === 'rush') return { mode: 'rush', surprise: c };
      if (c === 'visitor') return { mode: 'requests', surprise: c, source: 'visitor' };
      if (c === 'vip') return { mode: 'requests', surprise: c, source: 'vip' };
      if (c === 'beard') return { mode: 'beard', surprise: null };
      return { mode: 'requests', surprise: null };
    }
    // showcase: at most two skills already practised in this chapter, never a new one
    const practised = [...new Set(chapterModes)].filter(eligible);
    const pick = practised.length ? R.pick(practised) : 'requests';
    return { mode: pick, showcase: true, skills: practised.slice(0, 2) };
  }

  // ---- novelty (director sections 7-8) ----
  const signature = (c) => [c.mode, c.start.silhouette, c.request.family, c.start.beard + '>' + (c.request.beardGoal || '-'), c.modifier || '-'].join('|');
  const axes = (c) => ({ silhouette: c.start.silhouette, family: c.request.family, lane: c.lane, beard: c.request.beardGoal || c.start.beard, services: (c.request.services || []).join(','), pressure: c.modifier || '-' });
  function hardRepeat(dir, c) {
    if (dir.sig.includes(signature(c))) return 'repeat-signature';
    if (dir.last && dir.last.family === c.request.family && dir.last.altFamilies > 1) return 'repeat-style';
    return null;
  }
  function changedAxes(dir, c) {
    if (!dir.last) return 6;
    const a = axes(c), b = dir.last.axes;
    return Object.keys(a).filter((k) => a[k] !== b[k]).length;
  }
  function laneOverused(dir, lane, alternatives) {
    const recent = dir.lanes.slice(-LANE_WINDOW);
    return recent.filter((l) => l === lane).length >= LANE_MAX && alternatives > 1;
  }

  // ---- the generation transaction (map logic section 10) ----
  // core: career state (career.js); dir: director memory (mutated copy returned); ctx: { city, regulars, level, ... }
  function generate(core, dir0, catalog, ctx) {
    const C = HSC.career, pos = C.position(core);
    if (!pos) return { error: 'no-position' };
    const dir = JSON.parse(JSON.stringify(dir0 || fresh()));
    // a replaced offer (career-run.js replace) draws again with its replacement count in the seed: same id and slot
    const reroll = (ctx && ctx.reroll) | 0;
    const id = C.contractId(core, pos), seed = C.contractSeed(reroll ? id + '~r' + reroll : id, REVISION) + '';
    const R = stream(seed, 'role');
    const chapterModes = dir.chapterLog.filter((e) => e.city === pos.city && e.visit === pos.visit).map((e) => e.mode);
    const chapterLanes = new Set(dir.chapterLog.filter((e) => e.city === pos.city && e.visit === pos.visit).map((e) => e.lane));
    const role = roleMode(pos, dir, catalog, R, ctx, chapterModes, chapterLanes);
    const prefBand = band(core, dir, pos);
    const reasons = {};
    const tally = (codes) => { for (const c of codes) reasons[c] = (reasons[c] || 0) + 1; };

    // customer source: a scheduled regular, a visitor, a VIP or a resident
    let source = role.source || 'resident', regular = null;
    if (role.regular) {
      const regs = (ctx.regulars || []).filter((g) => dir.turn - (dir.regs[g.key] == null ? -99 : dir.regs[g.key]) >= REGULAR_GAP && g.lastChapter !== dir.cool.chapter - 1);
      // the regulars' fair deck: one not seen since the deck refilled comes first
      if (regs.length) {
        const keys = regs.map((g) => g.key), fresh = regs.filter((g) => underuse(dir, 'regular', g.key, keys) > 1);
        regular = stream(seed, 'regular').pick(fresh.length ? fresh : regs); source = 'regular';
        useCard(dir, 'regular', regular.key, keys);
      }
    }

    // a Trusted regular (four visits) may come for a specialist or service job, a Signature regular (seven) for the
    // chapter's showcase (director section 12); stages unlock variety only, never reward or easier scoring
    if (!regular && (pos.role === 'specialist' || pos.role === 'showcase') && ctx.regulars && ctx.regulars.length) {
      const need = pos.role === 'showcase' ? 7 : 4, fitsMode = (g) => role.mode !== 'beard' || !!(g.person && g.person.beard && g.person.beard.style !== 'clean' && !/^stubble/.test(g.person.beard.style));
      const pool = ctx.regulars.filter((g) => (g.visits | 0) >= need && fitsMode(g) && dir.turn - (dir.regs[g.key] == null ? -99 : dir.regs[g.key]) >= REGULAR_GAP);
      const Ro = stream(seed, 'regular-overlay');
      if (pool.length && Ro.next() < 0.3) { regular = Ro.pick(pool); source = 'regular'; useCard(dir, 'regular', regular.key, pool.map((g) => g.key)); }
    }

    // a city's bounded visitor share (CITY-CUSTOMER-VARIABILITY.md, residents and visitors): an ordinary resident slot
    // may bring a visitor instead. Never in the licence's first chapter, and never in place of a regular or a VIP.
    if (source === 'resident' && !regular && catalog.visitorShare && !(pos.licence && pos.chapter < 2) && stream(seed, 'visitor-share').next() < catalog.visitorShare(ctx.city)) source = 'visitor';

    // stages relax only soft rules; physical feasibility, tools, cultural rules and timers are never relaxed
    const STAGES = [
      { name: 'normal' },
      { name: 'reroll' },
      { name: 'no-context', noContext: true },
      { name: 'no-modifier', noContext: true, noModifier: true },
      { name: 'lower-band', noContext: true, noModifier: true, bandDrop: 1 },
      { name: 'broad-style', noContext: true, noModifier: true, bandDrop: 1, broad: true },
      { name: 'baseline-request', noContext: true, noModifier: true, bandDrop: 2, broad: true, baselineRequest: true },
      { name: 'next-specialist', noContext: true, noModifier: true, bandDrop: 2, broad: true, baselineRequest: true, swapMode: true },
    ];
    let chosen = null, stageUsed = null;
    for (let si = 0; si < STAGES.length && !chosen; si++) {
      const st = STAGES[si];
      let mode = role.mode;
      if (st.swapMode && mode !== 'requests') mode = SPECIALIST.find((m) => m !== mode && catalog.modes[m] && (!catalog.modes[m].eligible || catalog.modes[m].eligible(ctx))) || 'requests';
      const b = Math.max(0, prefBand - (st.bandDrop || 0)), budget = BUDGET[b];
      // the normal stage may draw more customers, only to avoid a fourth same-state customer in a row
      const tries = si === 0 ? PRESENCE_TRIES : ATTEMPTS;
      for (let a = 0; a < tries && !chosen; a++) {
        if (a >= ATTEMPTS && !(reasons['presence-repeat'] > 0)) break;
        const S = stream(seed, 'stage' + si + 'a' + a);
        const cust = regular ? catalog.customer(regular.seed, Object.assign({}, ctx, { source: 'regular', regular, mode })) : catalog.customer(hash(seed + 'c' + si + a), Object.assign({}, ctx, { source, R: S, mode }));
        if (!cust) { tally(['no-customer']); continue; }
        const starts = catalog.starts(cust, mode, ctx) || [];
        if (!starts.length) { tally(['no-start']); continue; }
        const cands = [];
        for (const start of starts) {
          let reqs = st.baselineRequest ? [(catalog.baseline(cust, ctx, start) || {}).request].filter(Boolean) : catalog.requests(cust, start, mode, Object.assign({}, ctx, { broad: !!st.broad })) || [];
          for (const request of reqs) {
            const cost = Object.assign({}, start.cost || {}, request.cost || {});
            const spend = (cost.precision || 0) + (cost.transform || 0) + (cost.repair || 0) + (cost.services || 0) + (cost.time || 0);
            if (spend > budget && !st.baselineRequest) { tally(['over-budget']); continue; }
            if ((cost.time || 0) >= 2 && (cost.precision || 0) >= 2) { tally(['timer-with-precision']); continue; }
            const modifier = st.noModifier ? null : role.surprise && role.surprise !== 'visitor' && role.surprise !== 'vip' ? role.surprise : null;
            const lane = catalog.modes[mode].lane(start, request);
            const c = { mode, start, request, modifier, lane, customer: cust, source, context: st.noContext ? null : regular ? 'regular' : source === 'vip' ? 'vip' : source === 'visitor' ? 'visitor' : null };
            const hard = hardRepeat(dir, c);
            if (hard && !st.baselineRequest) { tally([hard]); continue; }
            const v = catalog.validate(c, ctx);
            if (v.length) { tally(v); continue; }
            // a timed job must fit its clock with animation, tool-switch and accessibility margins (never relaxed)
            if (mode === 'rush' && catalog.timeNeeded && catalog.timeNeeded(c) > RUSH_LIMIT) { tally(['timer-too-short']); continue; }
            c.presence = catalog.presence ? catalog.presence(c) : null;
            cands.push(c);
          }
        }
        if (!cands.length) continue;
        // this customer would be the fourth in a row with the same broad hair presence or facial-hair state: draw
        // another customer first (the last attempt of a stage accepts him; a regular is who he is)
        if (!regular && a < tries - 1 && cands.every((c) => presenceRepeat(dir, c.presence))) { tally(['presence-repeat']); continue; }
        // soft weights: city tendency and suitability (from the catalog), underuse, lane rotation, axis change
        const laneAlts = new Set(cands.map((c) => c.lane)).size;
        for (const c of cands) if (dir.last) c.request.altFamilies = new Set(cands.map((x) => x.request.family)).size;
        // a chapter covers at least three lanes and three starting silhouettes: favour what it has not had yet
        const chLog = dir.chapterLog.filter((e) => e.city === pos.city && e.visit === pos.visit);
        const chLanes = new Set(chLog.map((e) => e.lane)), chSil = new Set(chLog.map((e) => e.silhouette));
        // from the third job on, a chapter still short of three lanes takes a lane it has not had when it can
        let pool = cands;
        if (pos.slot >= 2 && chLanes.size < 3) { const fresh = cands.filter((c) => !chLanes.has(c.lane)); if (fresh.length) pool = fresh; }
        if (!regular) { const other = pool.filter((c) => !presenceRepeat(dir, c.presence)); if (other.length) pool = other; }
        const fams = [...new Set(pool.map((c) => c.request.family))], svcs = [...new Set(pool.map(svcKey).filter(Boolean))];
        const pick = weighted(S, pool, (c) => {
          let w = c.request.weight == null ? 1 : c.request.weight;
          if (laneOverused(dir, c.lane, laneAlts)) w *= 0.15;
          if (pos.slot >= 1 && !chLanes.has(c.lane)) w *= chLanes.size < 3 ? 12 : 2.5;
          if (!chSil.has(c.start.silhouette)) w *= chSil.size < 3 && pos.slot >= 3 ? 8 : 2;
          const ch = changedAxes(dir, c);
          if (ch < 2) w *= 0.2;
          // underuse (capped): a style family or service set not offered since its deck refilled
          w *= underuse(dir, 'family', c.request.family, fams);
          if (svcKey(c)) w *= underuse(dir, 'services', svcKey(c), svcs);
          return w;
        });
        if (pick && !regular && presenceRepeat(dir, pick.presence)) tally(['presence-forced']);
        if (pick) { chosen = pick; stageUsed = st.name; useCard(dir, 'family', pick.request.family, fams); if (svcKey(pick)) useCard(dir, 'services', svcKey(pick), svcs); }
      }
    }
    if (!chosen) {
      // the standard Orders builder always exists (director section 13); it seats a resident, so no regular
      regular = null;
      const cust = catalog.customer(hash(seed + 'base'), Object.assign({}, ctx, { source: 'resident', R: stream(seed, 'base') }));
      const b = catalog.baseline(cust, ctx);
      chosen = { mode: 'requests', start: b.start, request: b.request, modifier: null, lane: catalog.modes.requests.lane(b.start, b.request), customer: cust, source: 'resident', context: null };
      stageUsed = 'standard-orders';
      chosen.presence = catalog.presence ? catalog.presence(chosen) : null;
      if (!regular && presenceRepeat(dir, chosen.presence)) tally(['presence-forced']);
    }

    // second validation, then record the job in the director's bounded memory
    const recheck = stageUsed === 'standard-orders' ? [] : catalog.validate(chosen, ctx);
    const contract = {
      id, seed: +seed, revision: REVISION, reroll, tour: pos.tour, city: pos.city, visit: pos.visit, slot: pos.slot, role: pos.role,
      licence: !!pos.licence, practice: !!pos.practice, mode: chosen.mode, lane: chosen.lane, source: chosen.source,
      regular: regular ? regular.key : null, context: chosen.context, modifier: chosen.modifier,
      customer: chosen.customer, start: chosen.start, request: chosen.request,
      band: prefBand, stage: stageUsed, validated: recheck.length === 0, reasons,
      presence: chosen.presence || (catalog.presence ? catalog.presence(chosen) : null),
    };
    commitMemory(dir, contract, pos);
    return { contract, dir, reasons };
  }
  function commitMemory(dir, c, pos) {
    dir.turn++;
    dir.sig.push(signature(c)); if (dir.sig.length > RING) dir.sig.splice(0, dir.sig.length - RING);
    dir.lanes.push(c.lane); if (dir.lanes.length > LANE_WINDOW) dir.lanes.shift();
    dir.last = { family: c.request.family, axes: axes(c), altFamilies: c.request.altFamilies || 1 };
    dir.chapterLog.push({ city: pos.city, visit: pos.visit, mode: c.mode, lane: c.lane, silhouette: c.start.silhouette });
    dir.presence = (Array.isArray(dir.presence) ? dir.presence : []).concat([c.customer && c.presence ? c.presence : null]).slice(-4);
    if (dir.chapterLog.length > 10) dir.chapterLog.splice(0, dir.chapterLog.length - 10);
    if (c.source === 'vip') dir.cool.vip = dir.turn;
    if (c.regular) dir.regs[c.regular] = dir.turn;
    if (pos.role === 'specialist') dir.cool.lastSpecialist = c.mode;
    if (pos.role === 'surprise') {
      const cat = c.modifier || (c.source === 'vip' ? 'vip' : c.source === 'visitor' ? 'visitor' : null);
      if (cat) { dir.cool.surprise.push(cat); if (dir.cool.surprise.length > 2) dir.cool.surprise.shift(); }
      if (c.mode === 'fix') dir.cool.disasterChapter = dir.cool.chapter;
    }
    if (pos.role === 'showcase') dir.cool.chapter++;
    // keep the regular map bounded to the cities' regular slots
    const keys = Object.keys(dir.regs);
    if (keys.length > 64) for (const k of keys.sort((a, b) => dir.regs[a] - dir.regs[b]).slice(0, keys.length - 64)) delete dir.regs[k];
  }

  HSC.director = { REVISION, RING, BUDGET, SPECIALIST, SURPRISE, RUSH_LIMIT, fresh, generate, noteResult, signature, band };
})(globalThis.HSC || (globalThis.HSC = {}));
