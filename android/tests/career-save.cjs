'use strict';
// Career save journal tests (docs/CAREER-SAVE-AND-QA-CONTRACT.md sections 6, 8, 10 and 13 "Recovery"):
// interrupt a commit at every write point and require that loading returns either the last complete career
// or the new one, never a mix; corrupt and future records must not be overwritten or loaded.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const ctx = { HSC: {}, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['career.js', 'director.js', 'career-save.js']) vm.runInContext(fs.readFileSync(path.join(root, 'source/customers', f), 'utf8'), ctx);
const { career: C, director: D, careerSave: J } = ctx.HSC;
C.setCities(['ist', 'lon', 'lag'].map((id) => ({ id, enabled: true })), 1);
const plain = (x) => JSON.parse(JSON.stringify(x));
let passed = 0;

// an in-memory host store that can be told to fail at its n-th write
function store(failAt = -1) {
  const data = new Map();
  let writes = 0;
  return {
    data,
    get: async (k) => (data.has(k) ? JSON.parse(data.get(k)) : null),
    set: async (k, v) => { writes++; if (writes === failAt) throw new Error('power cut'); data.set(k, JSON.stringify(v)); },
    writes: () => writes,
  };
}
const firstBody = () => ({ core: C.create('ist', 99), dir: D.fresh(), regs: {}, active: null });
const advance = (body) => { const id = C.contractId(body.core); body.core = C.complete(body.core, { id, stars: 2, valid: true, mode: 'requests', style: 'fade' }).state; return body; };

(async () => {
  // 1. a commit round-trips and the revision rises
  let s = store(), j = J.journal(s);
  assert.equal((await j.load()).body, null);
  await j.commit(() => firstBody());
  await j.commit(advance);
  let j2 = J.journal(s), loaded = await j2.load();
  assert.equal(loaded.rev, 2);
  assert.equal(loaded.body.core.licence.next, 1);
  passed++;

  // 2. interrupt the next commit at each of its writes: the career is always the old or the new one, never a mix
  const perCommit = 3; // pending record, committed record, pointer
  for (let cut = 1; cut <= perCommit; cut++) {
    const s2 = store();
    const ja = J.journal(s2);
    await ja.commit(() => firstBody());
    await ja.commit(advance); // rev 2, licence 1
    const before = s2.writes();
    const failing = { get: s2.get, set: async (k, v) => { if (s2.writes() - before + 1 === cut) { s2.set(k, v).catch(() => {}); throw new Error('power cut'); } return s2.set(k, v); }, writes: s2.writes };
    // a cut on write `cut` means that write did not happen
    const real = { get: s2.get, set: async (k, v) => { const n = s2.writes() - before + 1; if (n === cut) { throw new Error('power cut'); } return s2.set(k, v); } };
    const jb = J.journal(real);
    await jb.load();
    await jb.commit(advance).catch(() => {});
    const after = await J.journal(s2).load();
    const n = after.body.core.licence.next;
    assert.ok(n === 1 || n === 2, 'cut at write ' + cut + ' loads a complete revision (licence ' + n + ')');
    assert.deepEqual(plain(C.validate(after.body.core)), []);
  }
  passed++;

  // 3. a corrupted newest record is skipped in favour of the previous committed one
  s = store(); j = J.journal(s);
  await j.commit(() => firstBody());
  await j.commit(advance);
  await j.commit(advance); // rev 3 sits in slot 0
  const newest = JSON.parse(s.data.get(J.KEYS[0]));
  newest.body = newest.body.replace('"next":2', '"next":9');
  s.data.set(J.KEYS[0], JSON.stringify(newest));
  loaded = await J.journal(s).load();
  assert.equal(loaded.rev, 2, 'checksum failure falls back to the previous revision');
  passed++;

  // 4. prototype keys and invariant breaks are refused
  const evil = J.open({ schema: 1, rev: 5, committed: true, body: '{"core":{"__proto__":{"x":1}}}', sum: J.checksum('{"core":{"__proto__":{"x":1}}}') });
  assert.equal(evil.bad, 'prototype');
  s = store(); j = J.journal(s);
  await j.commit(() => firstBody());
  await assert.rejects(j.commit((b) => { b.core.licence.next = 99; return b; }), /invariant/);
  passed++;

  // 5. a record from a newer game version is never loaded or overwritten
  s = store();
  s.data.set(J.KEYS[0], JSON.stringify({ schema: 99, rev: 50, committed: true, body: '{}', sum: 'x' }));
  loaded = await J.journal(s).load();
  assert.equal(loaded.tooNew, true);
  passed++;

  // 6. a lost lease stops writing (another surface took over)
  s = store(); j = J.journal(s);
  await j.commit(() => firstBody());
  const p = j.commit(advance); j.release();
  await assert.rejects(p, /lease/);
  passed++;

  // 7. the economy and the population counters ride in the same record; a damaged economy is dropped, not loaded
  s = store(); j = J.journal(s);
  const eco = { balance: -40, paid: 7, ledger: [{ key: 'k', amount: 3 }], keys: ['k'], sources: { job: 3 }, sinks: {} };
  await j.commit(() => Object.assign(firstBody(), { eco, ecoLegacy: true, pop: { ist: { 3: 0.5 } } }));
  loaded = await J.journal(s).load();
  assert.deepEqual(plain(loaded.body.eco), eco, 'the coin ledger survives a reload');
  assert.equal(loaded.body.ecoLegacy, true);
  assert.deepEqual(plain(loaded.body.pop), { ist: { 3: 0.5 } });
  assert.equal(J.sanitize(Object.assign(firstBody(), { eco: { balance: 'lots' } })).eco, undefined, 'a damaged economy is dropped');
  passed++;

  // 8. golden fixture: a real record from the schema-1 game (startup career on the placeholder city) migrates,
  //    loads identically twice (idempotent) and can then choose its founding city
  {
    const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/career-schema1-startup.json'), 'utf8'));
    C.setCities(['ist', 'lon', 'lag'].map((id) => ({ id, enabled: true })), 2);
    const seal1 = (body, rev) => { const json = JSON.stringify(body); return { schema: 1, rev, committed: true, sum: J.checksum(json), body: json }; };
    const st = store();
    await st.set(J.KEYS[0], seal1(fixture, 7));
    const a = await J.journal(st).load(), b = await J.journal(st).load();
    assert.equal(a.rev, 7);
    assert.deepEqual(plain(a.body), plain(b.body), 'loading twice gives the same career');
    assert.deepEqual(plain(J.migrate(J.migrate(fixture, 1), 2)), plain(J.migrate(fixture, 1)), 'the migration is idempotent');
    assert.equal(a.body.core.founding, C.UNSET);
    assert.equal(a.body.active.id, fixture.active.id, 'the offered contract survives the migration');
    assert.equal(a.body.eco.balance, fixture.eco.balance, 'coins survive the migration');
    assert.deepEqual(plain(a.body.ent), []);
    const f = C.found(a.body.core, 'lag');
    assert.equal(f.error, undefined);
    // the first commit after loading writes schema 2 and keeps everything
    const j = J.journal(st); await j.load();
    await j.commit((body) => Object.assign(body, { core: f.state }));
    const raw = JSON.parse(st.data.get(J.KEYS[1]));
    assert.equal(raw.schema, J.SCHEMA);
    assert.equal((await J.journal(st).load()).body.core.founding, 'lag');
    passed++;
  }

  // 9. size budget: a record above 3 MB is refused before anything is written
  {
    const st = store(), j = J.journal(st);
    await j.commit(() => firstBody());
    const w0 = st.writes();
    await assert.rejects(j.commit((b) => Object.assign(b, { port: { pad: 'x'.repeat(1.6 * 1024 * 1024) } })), /too large/);
    assert.equal(st.writes(), w0, 'nothing is written');
    assert.equal((await J.journal(st).load()).rev, 1);
    passed++;
  }

  // 10. a stale surface cannot overwrite a newer revision; a released lease writes nothing until it reloads
  {
    const st = store(), j1 = J.journal(st);
    await j1.commit(() => firstBody());
    const j2 = J.journal(st); await j2.load();
    await j1.commit(advance);
    await assert.rejects(j2.commit(advance), /stale/);
    assert.equal((await J.journal(st).load()).rev, 2);
    // j1 is hidden (released); another surface writes; j1's next write reloads first and builds on it
    j1.release();
    const j3 = J.journal(st); await j3.load();
    await j3.commit((b) => Object.assign(b, { regs: { lon: [{ key: 'k', seed: 1, person: { seed: 1 }, visits: 1 }] } }));
    await j1.commit(advance);
    const last = await J.journal(st).load();
    assert.equal(last.rev, 4);
    assert.equal(last.body.regs.lon.length, 1, 'the other surface\'s write is kept');
    passed++;
  }

  // 11. per-field sanitizing: malformed regulars, populations and contracts are dropped, good ones kept
  {
    const good = { key: 'g1', seed: 5, person: { seed: 5 }, visits: 2, h: 'abc' };
    const out = J.sanitize(Object.assign(firstBody(), {
      regs: { ist: [good, { key: 7 }, null], 'BAD ID!': [good] },
      pop: { ist: { 3: 9, x: 1, 4: 'a' }, lon: 'no' },
      active: { id: 'x', state: 'weird', person: {}, start: { h: 'a' }, request: {} },
      dir: { sig: 'not-a-list' },
    }));
    assert.deepEqual(plain(out.regs), { ist: [good] });
    assert.deepEqual(plain(out.pop), { ist: { 3: 4 } });
    assert.equal(out.active, null);
    assert.deepEqual(plain(out.dir), plain(D.fresh()));
    passed++;
  }

  console.log('PASS: ' + passed + ' career save-journal cases (round trip, interrupted commits, corruption, prototype keys, newer versions, lease, economy record, schema-1 fixture, size budget, stale writes, field sanitizing).');
})().catch((e) => { console.error(e); process.exitCode = 1; });
