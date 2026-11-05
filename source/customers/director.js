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
// Every random choice is drawn from streams seeded by purpose, so adding a roll in one place cannot change
// another (save contract section 5).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const REVISION = 1; // contract-generation revision: part of every contract seed
  const RING = 200; // effective-duplicate exclusion window
  const LANE_WINDOW = 8, LANE_MAX = 3;
  const BUDGET = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 6]; // band -> complexity budget (director section 6)
  const SPECIALIST = ['fix', 'beard', 'relax', 'rush'];
  const SURPRISE = ['rescue', 'rush', 'visitor', 'vip'];
  const VIP_GAP = 8, REGULAR_GAP = 3;
  const ATTEMPTS = 6; // per relaxation stage: generation never loops indefinitely

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
    return { turn: 0, sig: [], lanes: [], last: null, decks: {}, cool: { vip: -99, surprise: [], disasterChapter: -99, chapter: 0 }, regs: {}, band: { adj: 0, recent: [] }, chapterLog: [] };
  }
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
    // the preferred band moves with demonstrated mastery, never more than two above the comfort band
    const base = Math.min(hi, lo + Math.max(0, dir.band.adj));
    return Math.max(lo, Math.min(hi, base));
  }
  function noteResult(dir, stars, valid) {
    const r = dir.band.recent;
    r.push(valid ? stars : 0); if (r.length > 4) r.shift();
    const last2 = r.slice(-2);
    if (last2.length === 2 && last2.every((x) => x >= 3)) { dir.band.adj = Math.min(dir.band.adj + 1, 6); r.length = 0; }
    else if (last2.length === 2 && last2.every((x) => x <= 1)) { dir.band.adj = Math.max(dir.band.adj - 1, -2); r.length = 0; }
  }

  // ---- the role grammar (map logic section 6; director section 10) ----
  // the licence teaches in order: chapter themes decide which specialist and surprise jobs are allowed
  // home chapter 3 teaches services and facial hair: the ritual is its specialist job, a beard its surprise
  const LICENCE_SPEC = { 1: [], 2: [], 3: ['relax'], 4: ['fix'], 5: ['rush'], 6: SPECIALIST };
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
    const id = C.contractId(core, pos), seed = C.contractSeed(id, REVISION) + '';
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
      if (regs.length) { regular = stream(seed, 'regular').pick(regs); source = 'regular'; }
    }

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
      for (let a = 0; a < ATTEMPTS && !chosen; a++) {
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
            cands.push(c);
          }
        }
        if (!cands.length) continue;
        // soft weights: city tendency and suitability (from the catalog), underuse, lane rotation, axis change
        const laneAlts = new Set(cands.map((c) => c.lane)).size;
        for (const c of cands) if (dir.last) c.request.altFamilies = new Set(cands.map((x) => x.request.family)).size;
        // a chapter covers at least three lanes and three starting silhouettes: favour what it has not had yet
        const chLog = dir.chapterLog.filter((e) => e.city === pos.city && e.visit === pos.visit);
        const chLanes = new Set(chLog.map((e) => e.lane)), chSil = new Set(chLog.map((e) => e.silhouette));
        // from the third job on, a chapter still short of three lanes takes a lane it has not had when it can
        let pool = cands;
        if (pos.slot >= 2 && chLanes.size < 3) { const fresh = cands.filter((c) => !chLanes.has(c.lane)); if (fresh.length) pool = fresh; }
        const pick = weighted(S, pool, (c) => {
          let w = c.request.weight == null ? 1 : c.request.weight;
          if (laneOverused(dir, c.lane, laneAlts)) w *= 0.15;
          if (pos.slot >= 1 && !chLanes.has(c.lane)) w *= chLanes.size < 3 ? 12 : 2.5;
          if (!chSil.has(c.start.silhouette)) w *= chSil.size < 3 && pos.slot >= 3 ? 8 : 2;
          const ch = changedAxes(dir, c);
          if (ch < 2) w *= 0.2;
          return w;
        });
        if (pick) { chosen = pick; stageUsed = st.name; }
      }
    }
    if (!chosen) {
      // the standard Orders builder always exists (director section 13)
      const cust = catalog.customer(hash(seed + 'base'), Object.assign({}, ctx, { source: 'resident', R: stream(seed, 'base') }));
      const b = catalog.baseline(cust, ctx);
      chosen = { mode: 'requests', start: b.start, request: b.request, modifier: null, lane: catalog.modes.requests.lane(b.start, b.request), customer: cust, source: 'resident', context: null };
      stageUsed = 'standard-orders';
    }

    // second validation, then record the job in the director's bounded memory
    const recheck = stageUsed === 'standard-orders' ? [] : catalog.validate(chosen, ctx);
    const contract = {
      id, seed: +seed, revision: REVISION, tour: pos.tour, city: pos.city, visit: pos.visit, slot: pos.slot, role: pos.role,
      licence: !!pos.licence, practice: !!pos.practice, mode: chosen.mode, lane: chosen.lane, source: chosen.source,
      regular: regular ? regular.key : null, context: chosen.context, modifier: chosen.modifier,
      customer: chosen.customer, start: chosen.start, request: chosen.request,
      band: prefBand, stage: stageUsed, validated: recheck.length === 0, reasons,
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

  HSC.director = { REVISION, RING, BUDGET, SPECIALIST, SURPRISE, fresh, generate, noteResult, signature, band };
})(globalThis.HSC || (globalThis.HSC = {}));
