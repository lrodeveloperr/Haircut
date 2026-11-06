'use strict';
// Customer generation audit (docs/CUSTOMER-GENERATION-INVARIANTS-AND-QA.md section 13; plan 5.5). Runs the game's own
// generator in Node: adults only, valid, deterministic; beard style independent of heritage; selection never
// rewrites a customer; every city's neutral population is fair. CUSTOMERS=10000 for the full per-city run.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const ctx = { HSC: {}, console, performance }; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['phenotypes.js', 'people.js', 'extras.js', 'cities.js', 'career.js']) vm.runInContext(fs.readFileSync(path.join(root, 'source/customers', f), 'utf8'), ctx);
const H = ctx.HSC, N = +process.env.CUSTOMERS || 1500;
vm.runInContext(fs.readFileSync(path.join(root, 'source/customers/career-catalog.js'), 'utf8'), ctx);
H.career.setCities(H.CITIES, H.CITIES_VERSION);
const R0 = (s) => (Math.imul(s + 1, 2654435761) >>> 0) || 1;
let passed = 0;

// 1. adults only, valid and deterministic, across every city's neutral draw
{
  let made = 0;
  for (const city of H.CITIES) {
    const pop = {}, per = process.env.CUSTOMERS ? N : N / 10, seen = {};
    for (let i = 0; i < per; i++) {
      const seed = R0(made + i * 7), R = H.rng(seed), g = H.careerCatalog.drawGroup(pop, city.id, R);
      H.careerCatalog.commitGroup(pop, city.id, g);
      const p = H.makePerson(seed, { heritage: g });
      assert.ok(p.years >= 18, 'adults only: ' + p.years);
      assert.ok(H.validPerson(p), 'valid person');
      if (i % 50 === 0) assert.equal(JSON.stringify(H.makePerson(seed, { heritage: g })), JSON.stringify(p), 'the same seed makes the same person');
      seen[g] = (seen[g] || 0) + 1;
      made++;
    }
    // the audit is per city: each city's own run keeps every group's share, led by its main group, never uniform
    const t = H.careerCatalog.tableFor(city.id).groups, tot = Object.values(t).reduce((a, b) => a + b, 0);
    for (const [g, w] of Object.entries(t)) assert.ok(Math.abs((seen[g] || 0) / per - w / tot) < 0.02, city.id + ' keeps group ' + g + ' at its share');
    const main = H.HERITAGE.findIndex((h) => h.id === city.people[0]);
    assert.ok(seen[main] / per > 0.6 && seen[main] / per < 0.8, city.id + ' is led by its main group');
    assert.ok(Object.keys(seen).length >= 6, city.id + ' is never uniform');
  }
  passed++;
}
// 2. the population scheduler gives each group its share, in every city, within a small bound
{
  const pop = {}, n = {}, t = H.careerCatalog.tableFor('lagos').groups, tot = Object.values(t).reduce((a, b) => a + b, 0);
  for (let i = 0; i < 2000; i++) { const g = H.careerCatalog.drawGroup(pop, 'lagos', H.rng(R0(i))); H.careerCatalog.commitGroup(pop, 'lagos', g); n[g] = (n[g] || 0) + 1; }
  for (const [g, w] of Object.entries(t)) assert.ok(Math.abs((n[g] || 0) / 2000 - w / tot) < 0.01, 'group ' + g + ' keeps its share');
  passed++;
}
// 3. beard style is a grooming choice: its distribution does not depend on heritage (age fixed)
{
  const groups = H.HERITAGE.map((h, i) => i), dist = groups.map(() => ({}));
  for (const g of groups) for (let i = 0; i < N; i++) { const p = H.makePerson(R0(i * 13 + g), { heritage: g, age: 'middle' }); dist[g][p.beard.style] = (dist[g][p.beard.style] || 0) + 1; }
  const keys = [...new Set(dist.flatMap((d) => Object.keys(d)))];
  let worst = 0;
  for (const a of groups) for (const b of groups) { let tv = 0; for (const k of keys) tv += Math.abs((dist[a][k] || 0) - (dist[b][k] || 0)) / N; worst = Math.max(worst, tv / 2); }
  assert.ok(worst < 0.12, 'beard style independent of heritage (worst distance ' + worst.toFixed(3) + ')');
  passed++;
}
// 4. selection never rewrites: a selected customer equals what his own seed makes
{
  const big = (x) => ['full', 'boxed', 'long'].includes(x.beard.style);
  for (let i = 0; i < 200; i++) {
    const p = H.selectPerson(R0(i), {}, big);
    assert.ok(p, 'an eligible customer is found');
    assert.equal(JSON.stringify(H.makePerson(p.seed, {})), JSON.stringify(p), 'selected, not rewritten');
    assert.equal(JSON.stringify(H.selectPerson(R0(i), {}, big)), JSON.stringify(p), 'the same seed selects the same customer');
  }
  assert.ok(!H.TATTOOS.includes('tribal'));
  passed++;
}
// 5. streams are independent: a different beard leaves skin, hair colour, hair loss and face untouched
{
  for (let i = 0; i < 300; i++) {
    const s = R0(i * 3), a = H.makePerson(s, { beard: 'clean' }), b = H.makePerson(s, { beard: 'full' });
    for (const k of ['skin', 'hair', 'bald', 'years', 'heritage', 'face']) assert.equal(JSON.stringify(a[k]), JSON.stringify(b[k]), k + ' does not depend on the beard roll');
    assert.ok(/^p[0-9a-z]+$/.test(a.id), 'a stable person id');
  }
  // a saved version-1 customer stays valid (the real schema-1 fixture), so a saved regular is never regenerated
  const old = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/career-schema1-startup.json'), 'utf8')).active.person;
  assert.equal(old.v, 1);
  assert.ok(H.validPerson(old), 'a saved version-1 person still loads');
  passed++;
}
// 6. head form: from the seed, varied, and the eyes and face stay put while the skull and neck change
{
  vm.runInContext(fs.readFileSync(path.join(root, 'source/customers/headshapes.js'), 'utf8'), ctx);
  const seen = new Set(), around = (p, f) => { const q = p.slice(); H.headWarp(q, 0, f); return Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]); };
  let far = 0;
  for (let i = 0; i < N; i++) {
    const p = H.makePerson(R0(i)), f = H.headFormOf(p);
    assert.equal(JSON.stringify(H.headFormOf(H.makePerson(R0(i)))), JSON.stringify(f), 'the same customer has the same head');
    for (const k of ['w', 'h', 'd', 'back', 'top', 'neck']) assert.ok(Math.abs(f[k]) <= 1, 'bounded ' + k);
    assert.ok(around([0.628, 1.624, 1.627], f) < 0.001, 'the eyes do not move');
    assert.ok(around([0, 0.7, 2.6], f) < 0.001, 'the nose does not move');
    far = Math.max(far, around([0, 2.1, -1.7], f));
    seen.add([f.w, f.d, f.back].map((v) => Math.round(v * 2)).join());
  }
  assert.ok(far > 0.2 && far < 0.6, 'the back of the head really moves, within reason: ' + far);
  assert.ok(seen.size > 40, 'heads differ: ' + seen.size + ' kinds');
  const ids = H.HERITAGE.map((h) => h.id);
  const lid = (g) => H.headFormOf(H.makePerson(R0(9), { heritage: ids.indexOf(g) })).fold;
  assert.ok(lid('east-asian') > 1 && lid('north-european') < 0.4, 'eye shape follows the group');
  passed++;
}
console.log('PASS: ' + passed + ' customer audits (' + N + ' per group; adults, determinism, population, style independent of heritage, selection, head form).');
