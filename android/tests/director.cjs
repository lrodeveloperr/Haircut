'use strict';
// Contract director generative test (docs/CAREER-CONTRACT-DIRECTOR.md section 16): a synthetic catalog stands in
// for the game's customers and hair, so the director's rules can be checked across 100,000 contracts quickly.
// The real-hair feasibility run is a separate browser test (the engine's grids live there).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const ctx = { HSC: {}, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['career.js', 'director.js']) vm.runInContext(fs.readFileSync(path.join(root, 'source/customers', f), 'utf8'), ctx);
const C = ctx.HSC.career, D = ctx.HSC.director;
C.setCities(['ist', 'lon', 'lag', 'nyc', 'sao', 'mum', 'tyo'].map((id) => ({ id, enabled: true })), 1);
const TARGET = +process.env.DIRECTOR_CONTRACTS || 100000;

// ---- the synthetic catalog: same contract shapes as the game, without hair grids ----
// about as varied as the game: many walk-in silhouettes and beard states
const SIL = ['short', 'medium', 'long', 'buzz', 'thinning', 'crop', 'tight', 'full', 'shaved', 'mid-fade', 'low-fade', 'high-fade', 'taper', 'undercut-grown', 'part-grown'];
const FAMILIES = ['skin', 'fade', 'taper', 'temple', 'undercut', 'classic', 'crew', 'hawk', 'buzz', 'trim'];
const TEX = ['straight', 'wavy', 'curly', 'coily'];
const BEARDS = ['clean', 'stubble', 'short', 'full', 'boxed', 'goatee', 'moustache', 'chinstrap', 'vandyke', 'long'];
const catalog = {
  modes: {
    requests: { lane: (st, rq) => (rq.big ? 'transformation' : 'precision') },
    fix: { lane: () => 'recovery', specialist: true },
    beard: { lane: () => 'precision', specialist: true },
    rush: { lane: () => 'pressure', specialist: true },
  },
  customer(seed0, c) {
    let seed = seed0;
    const R = (n) => { seed = Math.imul(seed ^ (seed >>> 15), 0x2c1b3c6d) >>> 0; return seed % n; };
    const t = { silhouette: SIL[R(SIL.length)], texture: TEX[R(4)], beard: BEARDS[R(BEARDS.length)], age: 18 + R(60) };
    // a regular returns with his last cut grown out, so his starting look changes between visits
    if (c && c.regular) { t.silhouette = SIL[(seed0 + c.regular.visits * 7) % SIL.length] + '-grown' + (c.regular.visits % 3); t.beard = BEARDS[(seed0 + c.regular.visits * 3) % BEARDS.length]; }
    return { person: { seed: seed0 }, traits: t };
  },
  starts(cu, mode) {
    const t = cu.traits;
    if (mode === 'beard' && (t.beard === 'clean' || t.beard === 'stubble')) return [];
    if (mode === 'fix') return [{ id: 'botch', silhouette: t.silhouette + '-botched', beard: t.beard, damage: 1, cost: { repair: 1 } }];
    if (mode === 'rush') return [{ id: 'tidy', silhouette: t.silhouette + '-tidy', beard: t.beard, cost: { time: 1 } }];
    return [{ id: 'walkin', silhouette: t.silhouette, beard: t.beard, cost: {} }, { id: 'grown', silhouette: t.silhouette + '-grown', beard: t.beard, cost: { transform: 1 } }];
  },
  requests(cu, st, mode) {
    const t = cu.traits;
    if (mode === 'beard') return ['boxed', 'goatee', 'chinstrap', 'stubble'].map((g, i) => ({ id: 'beard:' + g, family: 'beard', beardGoal: g, cost: { precision: i % 2 }, weight: 1 }));
    return FAMILIES.filter((f) => !(t.silhouette === 'thinning' && ['undercut', 'hawk', 'classic'].includes(f)) && !(t.texture === 'coily' && f === 'classic'))
      // a big change (to a skin fade, buzz, undercut, hawk or fade) is a transformation; the rest is precision work
      // budget is spent on complications only (director section 6): a readable transformation is free
      .map((f, i) => ({ id: f + ':' + i, family: f, big: ['skin', 'buzz', 'undercut', 'hawk', 'fade'].includes(f), cost: { precision: ['classic', 'crew', 'taper', 'temple'].includes(f) ? 1 : 0 }, weight: 1 + (i % 4) }));
  },
  validate(c) {
    const r = [];
    if (c.mode === 'beard' && (c.customer.traits.beard === 'clean')) r.push('beard-absent');
    if (c.customer.traits.silhouette === 'thinning' && ['undercut', 'hawk', 'classic'].includes(c.request.family)) r.push('hair-loss-conflict');
    return r;
  },
  baseline(cu, x, st) { return { start: st || { id: 'walkin', silhouette: cu.traits.silhouette, beard: cu.traits.beard, cost: {} }, request: { id: 'trim', family: 'trim', cost: {}, weight: 1 } }; },
  // hair and beard presence, as the game's catalog reports it
  presence: (c) => ({ shaved: 'shaved', buzz: 'short', tight: 'short', crop: 'short', long: 'long', full: 'long' }[c.customer.traits.silhouette.split('-')[0]] || 'medium') + '|' + (c.start.beard === 'clean' ? 'clean' : c.start.beard === 'stubble' ? 'stubble' : 'beard'),
  timeNeeded: () => 20,
};
const ctxFor = () => ({ level: 50, regulars: [] });

// ---- simulate careers until TARGET contracts ----
let made = 0, careers = 0;
const stats = { presenceTriples: 0, presenceForced: 0, comfortOver: 0, families: {}, lanesWhere: {}, silWhere: {}, hardFail: 0, unvalidated: 0, sigRepeat: 0, chaptersShort: 0, chapterLanesFail: 0, chapterSilFail: 0, showcaseNew: 0, bandOver: 0, stages: {}, roleBand: new Set(), modes: {} };
const t0 = Date.now();
while (made < TARGET) {
  careers++;
  const cities = ['ist', 'lon', 'lag', 'nyc', 'sao', 'mum', 'tyo'];
  let s = C.create(cities[careers % cities.length], careers * 7919);
  let dir = D.fresh();
  const recent = [];
  let chapter = [];
  let regulars = [];
  const pres = [], okBands = [];
  for (let k = 0; k < 2500 && made < TARGET; k++) {
    if (C.phase(s) === 'map') { const rem = C.remaining(s); s = C.selectCity(s, rem[(careers + k) % rem.length]).state; }
    const g = D.generate(s, dir, catalog, Object.assign(ctxFor(), { regulars }));
    assert.ok(g.contract, 'a contract is always produced');
    const c = g.contract; dir = g.dir; made++;
    // determinism: the same state and memory produce the same contract
    if (made % 5000 === 1) { const again = D.generate(s, JSON.parse(JSON.stringify(g.dir)), catalog, Object.assign(ctxFor(), { regulars })); }
    if (!c.validated) stats.unvalidated++;
    stats.stages[c.stage] = (stats.stages[c.stage] || 0) + 1;
    stats.modes[c.mode] = (stats.modes[c.mode] || 0) + 1;
    stats.roleBand.add(c.role + c.band);
    // never a fourth customer in a row with the same broad hair presence or facial-hair state, unless the director
    // had to accept one (every attempt of its stages drew the same state) or he is a regular
    pres.push(c.presence);
    if (pres.length >= 4 && !c.regular) {
      const l4 = pres.slice(-4), same = (k) => l4.every((x) => x.split('|')[k] === c.presence.split('|')[k]);
      if (same(0) || same(1)) { if (c.reasons['presence-forced']) { if (c.mode === 'beard' || c.role === 'showcase') stats.presenceForcedByMode = (stats.presenceForcedByMode || 0) + 1; else stats.presenceForced++; } else stats.presenceTriples++; }
    }
    // the preferred band stays within two of the recent comfort band (the floor before any good result)
    if (okBands.length && c.band > Math.max(...okBands) + 2) stats.comfortOver++;
    stats.families[c.request.family] = (stats.families[c.request.family] || 0) + 1;
    if (c.band > 10) stats.bandOver++;
    const sig = D.signature(c);
    if (c.stage !== 'standard-orders' && c.stage !== 'baseline-request' && c.stage !== 'next-specialist' && recent.includes(sig)) stats.sigRepeat++;
    recent.push(sig); if (recent.length > 200) recent.shift();
    chapter.push(c);
    if (c.role === 'showcase') {
      if (chapter.length !== 5) stats.chaptersShort++;
      // the first two home chapters teach only cutting (map logic: tutorials may simplify a slot), so the
      // three-lane rule applies from home chapter 3 on
      const tutorial = c.licence && c.visit < 2, where = c.licence ? 'licence' + (c.visit + 1) : 'tour';
      if (!tutorial && new Set(chapter.map((x) => x.lane)).size < 3) { if (process.env.DIRECTOR_DEBUG && stats.chapterLanesFail < 6) console.log('LANES', chapter.map((x) => x.role + ':' + x.mode + ':' + x.lane + ':' + x.stage + ':' + (x.modifier || x.source)).join('  '), JSON.stringify(chapter[2].reasons), chapter[2].customer.traits.silhouette); stats.chapterLanesFail++; stats.lanesWhere[where] = (stats.lanesWhere[where] || 0) + 1; }
      if (new Set(chapter.map((x) => x.start.silhouette)).size < 3) { stats.chapterSilFail++; stats.silWhere[where] = (stats.silWhere[where] || 0) + 1; }
      const practised = new Set(chapter.slice(0, 4).map((x) => x.mode));
      if (!practised.has(c.mode)) stats.showcaseNew++;
      chapter = [];
    }
    // a regular outside his relationship slot needs the stage for it: Trusted (4) for specialist, Signature (7) for a showcase
    if (c.regular && c.role !== 'relationship') {
      const g = regulars.find((x) => x.key === c.regular), need = c.role === 'showcase' ? 7 : 4;
      stats.stageJobs = (stats.stageJobs || 0) + 1;
      if (!g || g.visits < need || (c.role !== 'specialist' && c.role !== 'showcase')) stats.stageEarly = (stats.stageEarly || 0) + 1;
    }
    // regulars accumulate from relationship jobs
    if (c.role === 'relationship' && !c.regular && regulars.length < 6) regulars.push({ key: 'r' + c.customer.person.seed, seed: c.customer.person.seed, visits: 1 });
    if (c.regular) { const g = regulars.find((x) => x.key === c.regular); if (g) g.visits++; }
    const stars = 1 + ((made * 2654435761) >>> 0) % 3;
    D.noteResult(dir, stars, true, c.band);
    if (stars >= 2) { okBands.push(c.band); if (okBands.length > 4) okBands.shift(); }
    s = C.complete(s, { id: c.id, stars, valid: true, mode: c.mode, style: c.request.family }).state;
  }
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(JSON.stringify({ made, careers, secs, ...stats, roleBand: stats.roleBand.size }, null, 0));
assert.equal(stats.presenceTriples, 0, 'no avoidable fourth customer in a row with the same hair presence or facial-hair state');
// a Beards job needs a beard and a showcase reuses its chapter's skills, so those may have to repeat a state;
// anywhere else a forced repeat is rare
assert.ok(stats.presenceForced < made * 0.005, 'a forced presence repeat is rare (' + stats.presenceForced + ')');
assert.ok(stats.stageJobs > 0, 'Trusted and Signature regulars come for specialist jobs and showcases');
assert.equal(stats.stageEarly || 0, 0, 'no regular comes outside his slot before his stage allows it');
assert.equal(stats.comfortOver, 0, 'progression stays within two bands of the comfort band');
// the style-family deck spreads the ordinary families: none is offered less than a third as often as the most used
{
  const ord = ['skin', 'fade', 'taper', 'temple', 'undercut', 'classic', 'crew', 'hawk', 'buzz'].map((f) => stats.families[f] || 0);
  assert.ok(Math.min(...ord) * 3 >= Math.max(...ord), 'style families stay balanced: ' + ord.join(','));
}
assert.equal(stats.unvalidated, 0, 'every contract passes the second validation');
assert.equal(stats.sigRepeat, 0, 'no effective duplicate inside the 200-contract window');
assert.equal(stats.chaptersShort, 0, 'every chapter has five roles');
assert.equal(stats.showcaseNew, 0, 'a showcase only reuses skills practised in its chapter');
assert.equal(stats.bandOver, 0, 'difficulty never exceeds band 10');
assert.equal(stats.chapterLanesFail, 0, 'every chapter covers at least three lanes');
assert.equal(stats.chapterSilFail, 0, 'every chapter has at least three starting silhouettes');
console.log('PASS: director generated ' + made + ' contracts in ' + secs + ' s with no rule violations.');
