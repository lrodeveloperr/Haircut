'use strict';
// Career state machine unit tests (docs/CAREER-SAVE-AND-QA-CONTRACT.md section 12, unit layer).
// Runs the pure career logic in Node with a test city registry; no browser needed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const ctx = { HSC: {}, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'source/customers/career.js'), 'utf8'), ctx);
const C = ctx.HSC.career;
const CITIES = ['ist', 'lon', 'lag', 'nyc', 'sao'].map((id) => ({ id, enabled: true }));
C.setCities(CITIES, 1);
let passed = 0;
// values from the sandbox are compared as plain JSON (a sandbox array is not this realm's Array)
const plain = (x) => JSON.parse(JSON.stringify(x));
const ok = (name) => { passed++; };
const SPEC = ['fix', 'beard', 'rush'];
// complete the currently offered contract
const finish = (s, stars = 1, extra = {}) => {
  const id = C.contractId(s), pos = C.position(s);
  const r = C.complete(s, Object.assign({ id, stars, valid: true, mode: pos.role === 'specialist' ? SPEC[pos.visit % 4] : 'requests', style: 'style-' + (pos.visit * 5 + pos.slot) % 20 }, extra));
  assert.equal(r.error, undefined, 'completion error ' + r.error + ' at ' + id);
  return r;
};

// 1. new career: licence phase, home city, first contract id stable
let s = C.create('ist', 12345);
assert.equal(C.phase(s), 'licence');
assert.equal(C.rank(s, SPEC).id, 'apprentice');
assert.equal(C.contractId(s), C.contractId(C.clone(s)), 'contract id is a pure function of state');
assert.deepEqual(plain(C.validate(s)), []);
ok('create');

// 2. one-star work advances; no-action does not
const id0 = C.contractId(s);
let r = C.complete(s, { id: id0, stars: 3, valid: false });
assert.equal(r.result.incomplete, true);
assert.equal(r.state.licence.next, 0, 'no meaningful work: no progress');
r = finish(s, 1); s = r.state;
assert.equal(s.licence.next, 1, 'one-star valid work progresses');
ok('one-star');

// 3. duplicate completion is idempotent
const again = C.complete(s, { id: id0, stars: 1, valid: true, mode: 'requests', style: 'x' });
assert.equal(again.duplicate, true);
assert.equal(again.state.licence.next, 1, 'a repeated event cannot advance twice');
const replay = C.complete(s, { id: id0, stars: 3, valid: true, mode: 'requests', style: 'style-0' });
assert.equal(replay.state.licence.next, 1);
assert.equal(replay.state.mastery.style['style-0'], 3, 'a replay may raise mastery');
ok('idempotency');

// 4. a wrong (future) contract id is refused
const bogus = C.complete(s, { id: 'zz:L:ist:v3:s2', stars: 1, valid: true });
assert.equal(bogus.error, 'not-current');
ok('ordering');

// 5. licence: 30 contracts, six chapters, then the map and Tour 1 with home done
for (let i = 1; i < 30; i++) { s = finish(s, 1).state; assert.deepEqual(plain(C.validate(s)), [], 'invariants at licence ' + i); }
assert.equal(C.phase(s), 'map');
assert.equal(C.rank(s, SPEC).id, 'licensed');
assert.equal(s.tour.n, 1);
assert.deepEqual(plain([...s.tour.done]), ['ist']);
assert.equal(s.cities.ist.chapters, 6);
assert.equal(s.cities.ist.established, true, 'home branch established by its first showcase');
ok('licence');

// 6. visit cities in any order; each visit is five contracts; tour closes atomically
const order = ['sao', 'lag', 'nyc', 'lon'];
for (const city of order) {
  const sel = C.selectCity(s, city); assert.equal(sel.error, undefined); s = sel.state;
  assert.equal(C.phase(s), 'chapter');
  for (let k = 0; k < 5; k++) s = finish(s, 3).state;
}
assert.equal(s.tour.n, 2, 'tour 1 complete -> tour 2');
assert.equal(C.rank(s, SPEC).id, 'world');
assert.equal(C.remaining(s).length, 5, 'tour 2 includes the home city');
ok('tour1');

// 7. practice in a completed city does not advance the tour
s = C.selectCity(s, 'ist').state;
for (let k = 0; k < 5; k++) s = finish(s, 2).state;
assert.ok(s.tour.done.includes('ist'));
const t2before = s.tour.n;
for (const city of ['lon', 'lag', 'nyc', 'sao']) { s = C.selectCity(s, city).state; for (let k = 0; k < 5; k++) s = finish(s, 3).state; }
assert.equal(s.tour.n, t2before + 1);
assert.deepEqual(plain(C.rank(s, SPEC)), { id: 'legend', legend: 1 }, 'tour 2 complete -> Barber Legend 1');
ok('tour2-legend');

// 8. a showcase completes once: one branch per city
const branches = Object.values(s.cities).filter((c) => c.established).length;
assert.equal(branches, 5);
ok('branches');

// 9. roster changes: a city disabled during a tour becomes not-applicable and the tour can still close
C.setCities(CITIES.map((c) => (c.id === 'lag' ? { id: 'lag', enabled: false } : c)), 2);
s = C.reconcile(s);
assert.ok(s.tour.na.includes('lag'));
for (const city of ['ist', 'lon', 'nyc', 'sao']) { s = C.selectCity(s, city).state; for (let k = 0; k < 5; k++) s = finish(s, 1).state; }
assert.equal(s.tour.n, 4, 'the tour closes without the disabled city');
assert.ok(!s.tour.roster.includes('lag'), 'the next roster omits the disabled city');
// a newly added city joins the next tour, not the active one
C.setCities(CITIES.concat([{ id: 'mum', enabled: true }]), 3);
s = C.reconcile(s);
assert.ok(!s.tour.roster.includes('mum'), 'new city does not enter the frozen roster');
ok('roster');

// 10. base change only after Tour 1 and only to an established branch
assert.equal(C.setBase(C.create('ist', 1), 'lon').error, 'base-locked');
assert.equal(C.setBase(s, 'mum').error, 'not-established');
assert.equal(C.setBase(s, 'lon').state.base, 'lon');
ok('base');

// 11. endless tours: the state does not grow with tour count
C.setCities(CITIES, 4);
s = C.reconcile(s);
const size0 = JSON.stringify(s).length;
for (let t = 0; t < 40; t++) for (const city of C.remaining(s)) { s = C.selectCity(s, city).state; for (let k = 0; k < 5; k++) s = finish(s, 2).state; }
const size1 = JSON.stringify(s).length;
assert.ok(size1 - size0 < 200, 'save size stays bounded across tours (' + size0 + ' -> ' + size1 + ')');
assert.equal(C.rank(s, SPEC).id, 'legend');
ok('bounded');

// 12. inputs are never mutated by events
const frozen = JSON.stringify(s);
C.selectCity(s, 'lon'); C.complete(s, { id: 'x', stars: 1, valid: true });
assert.equal(JSON.stringify(s), frozen);
ok('pure');

// 13. Shop Owner is reached apart from Master: the home salon is not a branch, three branches beyond it are
{
  C.setCities(CITIES, 5);
  const base = C.create('ist', 99);
  const mk = (over) => Object.assign(C.clone(base), over);
  const city = (est) => ({ visits: 3, chapters: 3, showcaseBest: 3, established: est, estTour: 1, awards: [], styles: ['a', 'b', 'c', 'd'], regVisits: 2, gold: 1 });
  const styles = Object.fromEntries(Array.from({ length: 12 }, (_, i) => ['s' + i, 3]));
  const common = { licence: { next: 30 }, current: null, tour: { n: 1, roster: ['ist', 'lon', 'lag', 'nyc', 'sao'], rosterVersion: 5, done: ['ist'], na: [] }, completedModes: SPEC.slice(), mastery: { style: styles, mode: {}, tool: {}, service: {}, city: {} } };
  const master = mk(Object.assign({}, common, { cities: { ist: city(true), lon: city(true), lag: city(true) } }));
  assert.equal(C.rank(master, SPEC).id, 'master', 'three mastered cities incl. home, two branches -> Master, not Owner');
  const owner = mk(Object.assign({}, common, { cities: { ist: city(true), lon: city(true), lag: city(true), nyc: city(true) } }));
  assert.equal(C.rank(owner, SPEC).id, 'owner', 'three branches beyond the home salon -> Shop Owner');
  ok('owner');
}

// 14. an earned rank is kept: a new specialist mode or a lost fact never demotes the player
{
  const st = C.create('ist', 7);
  const spec = Object.assign(C.clone(st), { licence: { next: 30 }, current: null, tour: { n: 1, roster: ['ist'], rosterVersion: 5, done: ['ist'], na: [] }, completedModes: SPEC.slice(), cities: { ist: { visits: 6, chapters: 6, showcaseBest: 3, established: true, estTour: 0, awards: [] }, lon: { visits: 1, chapters: 1, showcaseBest: 1, established: true, estTour: 1, awards: [] }, lag: { visits: 1, chapters: 1, showcaseBest: 1, established: true, estTour: 1, awards: [] } } });
  assert.equal(C.rank(spec, SPEC).id, 'specialist');
  spec.rankBest = C.rankIndex(spec, SPEC);
  assert.deepEqual(plain(C.validate(spec)), []);
  assert.equal(C.rank(spec, SPEC.concat(['newmode'])).id, 'specialist', 'a later mode does not demote a Specialist');
  const fresh = C.clone(spec); delete fresh.rankBest;
  assert.equal(C.rank(fresh, SPEC.concat(['newmode'])).id, 'professional', 'without the saved rank the new mode would apply');
  ok('sticky');
}

// 15. founding city: a career made at startup sits on the placeholder until the player chooses; the choice is final
{
  C.setCities(CITIES, 6);
  let st = C.create(C.UNSET, 4242);
  assert.equal(C.needsFounding(st), true);
  assert.deepEqual(plain(C.validate(st)), []);
  assert.equal(C.found(st, 'nowhere').error, 'city-unavailable');
  st = finish(st, 2).state; // a contract already played on the placeholder (a career from the one-city build)
  const f = C.found(st, 'lag');
  assert.equal(f.error, undefined);
  assert.equal(f.state.founding, 'lag');
  assert.equal(f.state.current.city, 'lag');
  assert.equal(f.state.licence.next, 1, 'progress is kept');
  assert.equal(C.contractId(f.state).split(':')[2], 'lag');
  assert.ok(!f.state.cities[C.UNSET], 'the placeholder record is merged into the chosen city');
  assert.equal(C.found(f.state, 'lon').error, 'already-founded', 'the founding city is chosen once');
  assert.deepEqual(plain(C.validate(f.state)), []);
  ok('founding');
}

// 16. a one-city-build career past its licence: the open tour gets the full roster, its number (rank, Legend) is kept
{
  C.setCities([{ id: C.UNSET, enabled: true }], 1);
  let st = C.create(C.UNSET, 77);
  for (let i = 0; i < 30; i++) st = finish(st, 3).state;
  // the old one-city registry closed a tour with every chapter
  for (let k = 0; k < 4; k++) { st = C.selectCity(st, C.UNSET).state; for (let i = 0; i < 5; i++) st = finish(st, 3).state; }
  const legendBefore = C.rank(st, SPEC);
  assert.equal(legendBefore.id, 'legend');
  st.rankBest = C.rankIndex(st, SPEC);
  C.setCities(CITIES, 6);
  assert.equal(C.needsFounding(st), true);
  assert.deepEqual(plain(C.selectable(st)), [], 'no map choice before the founding city');
  assert.equal(C.reconcile(st).tour.n, st.tour.n, 'reconcile waits for the founding choice');
  const f = C.found(st, 'nyc').state;
  assert.equal(f.tour.n, st.tour.n, 'the tour number is kept');
  assert.deepEqual(plain(f.tour.roster).sort(), CITIES.map((c) => c.id).sort(), 'the open tour has the full roster');
  assert.equal(C.rank(f, SPEC).legend, legendBefore.legend, 'the Legend number is kept');
  assert.equal(C.phase(f), 'map');
  // a chapter no longer closes a tour: four cities are still needed
  let g = C.selectCity(f, 'lon').state;
  for (let i = 0; i < 5; i++) g = finish(g, 1).state;
  assert.equal(g.tour.n, f.tour.n, 'one chapter does not close a five-city tour');
  assert.equal(C.phase(g), 'map', 'after a chapter the map asks for the next city');
  assert.deepEqual(plain(C.validate(g)), []);
  ok('one-city migration');
}

// 17. the shipped registry: 36 cities, coverage allocation, every name, neutral tables flagged for research
{
  const ctx2 = { HSC: {}, console }; ctx2.globalThis = ctx2; vm.createContext(ctx2);
  vm.runInContext(fs.readFileSync(path.join(root, 'source/customers/cities.js'), 'utf8'), ctx2);
  const R = ctx2.HSC.cityRegistry, list = ctx2.HSC.CITIES;
  assert.equal(list.length, 36);
  assert.deepEqual(plain(R.validateRegistry(list)), []);
  assert.ok(list.every((c) => c.population === null && c.confidence === 'low' && c.review === 'research'), 'neutral, low confidence, in research');
  const bad = Object.assign({}, list[0], { population: { groups: { 0: 0.5 }, confidence: 'high' } });
  assert.ok(plain(R.validateCity(bad)).includes('population-sum'));
  assert.ok(plain(R.validateCity(bad)).includes('unsourced-table'));
  assert.ok(plain(R.validateRegistry(list.slice(1))).includes('coverage:africa'));
  ok('registry');
}

// 18. a Daily result raises mastery only: no slot, no progress; the same result twice changes nothing
{
  C.setCities(CITIES, 6);
  const st = C.create('ist', 31);
  const r = C.side(st, { valid: true, stars: 3, mode: 'daily', style: 'crop', tools: ['clipper'] });
  assert.equal(r.state.licence.next, 0, 'no progress');
  assert.equal(C.contractId(r.state), C.contractId(st), 'the offered slot is unchanged');
  assert.equal(r.state.mastery.style.crop, 3);
  assert.equal(r.state.mastery.mode.daily, 3);
  assert.equal(C.side(r.state, { valid: true, stars: 2, mode: 'daily', style: 'crop', tools: ['clipper'] }).duplicate, true);
  assert.equal(C.side(st, { valid: false, mode: 'daily' }).error, 'not-valid');
  ok('daily mastery');
}

// 19. four-part city mastery and branch states: completion alone is not mastery; all four parts are
{
  C.setCities(CITIES, 6);
  let st = C.create('ist', 55);
  const kinds = ['requests', 'fix', 'beard', 'rush'];
  for (let i = 0; i < 30; i++) {
    const id = C.contractId(st), pos = C.position(st);
    st = C.complete(st, { id, stars: 3, valid: true, mode: kinds[i % 4], style: 'st' + (i % 6), tools: ['clipper'], regular: pos.role === 'relationship' && pos.visit > 0 }).state;
  }
  const m = C.cityMastery(st, 'ist');
  assert.equal(m.all, true, 'six 3-star chapters with varied work and returning regulars master the home city');
  assert.equal(C.branchState(st, 'ist'), 'mastered');
  const plainWork = C.create('lon', 56);
  let pw = plainWork;
  for (let i = 0; i < 30; i++) pw = C.complete(pw, { id: C.contractId(pw), stars: 3, valid: true, mode: 'requests', style: 'same', tools: ['clipper'] }).state;
  const pm = C.cityMastery(pw, 'lon');
  assert.equal(pm.completion, 1);
  assert.equal(pm.all, false, 'completion alone is not city mastery');
  assert.equal(C.branchState(pw, 'lon'), 'growing');
  assert.equal(C.branchState(pw, 'ist'), 'unvisited');
  ok('city mastery');
}

// 20. relocation: locked during World Tour 1; afterwards any established branch, never an unestablished city
{
  C.setCities(CITIES, 6);
  let st = C.create('ist', 61);
  for (let i = 0; i < 30; i++) st = finish(st).state;
  assert.equal(C.setBase(st, 'ist').error, 'base-locked', 'no relocation before World Tour 1 is complete');
  for (const id of ['lon', 'lag', 'nyc', 'sao']) { st = C.selectCity(st, id).state; for (let i = 0; i < 5; i++) st = finish(st).state; }
  assert.equal(st.tour.n, 2, 'World Tour 1 is complete');
  assert.equal(C.setBase(st, 'zzz').error, 'not-established');
  const moved = C.setBase(st, 'lag');
  assert.equal(moved.state.base, 'lag');
  assert.equal(moved.state.founding, 'ist', 'the founding city never changes');
  assert.equal(moved.state.tour.n, st.tour.n, 'relocating does not reset the tour');
  ok('relocation');
}

console.log('PASS: ' + passed + ' career state-machine cases (licence, tours, idempotency, roster changes, bounded save).');
