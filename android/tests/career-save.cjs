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
  await j.commit(() => Object.assign(firstBody(), { eco, ecoLegacy: true, pop: { a: 2 } }));
  loaded = await J.journal(s).load();
  assert.deepEqual(plain(loaded.body.eco), eco, 'the coin ledger survives a reload');
  assert.equal(loaded.body.ecoLegacy, true);
  assert.deepEqual(plain(loaded.body.pop), { a: 2 });
  assert.equal(J.sanitize(Object.assign(firstBody(), { eco: { balance: 'lots' } })).eco, undefined, 'a damaged economy is dropped');
  passed++;

  console.log('PASS: ' + passed + ' career save-journal cases (round trip, interrupted commits, corruption, prototype keys, newer versions, lease, economy record).');
})().catch((e) => { console.error(e); process.exitCode = 1; });
