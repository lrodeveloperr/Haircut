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
const SPEC = ['fix', 'beard', 'relax', 'rush'];
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

console.log('PASS: ' + passed + ' career state-machine cases (licence, tours, idempotency, roster changes, bounded save).');
