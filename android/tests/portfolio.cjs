'use strict';
// Career portfolio unit tests (docs/PERMANENT-CAREER-PORTFOLIO-CONTRACT.md section 17): frozen set versions, seals
// committed once, migration from existing facts, favourite-card capacity and size budgets, and the card codec.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const ctx = { HSC: { PHENOTYPES: {} }, console, btoa, atob };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['career.js', 'economy.js', 'portfolio.js']) vm.runInContext(fs.readFileSync(path.join(root, 'source/customers', f), 'utf8'), ctx);
const { career: C, portfolio: P, economy: E } = ctx.HSC;
const plain = (x) => JSON.parse(JSON.stringify(x));
ctx.HSC.REQUEST_STYLES = [{ id: 'buzz:1', fam: 'buzz' }, { id: 'buzz:2', fam: 'buzz' }, { id: 'fade:1', fam: 'fade' }, { id: 'trim', fam: 'trim' }];
C.setCities(['ist', 'lon', 'lag'].map((id) => ({ id, enabled: true })), 2);
let passed = 0;

// 1. a set's version is the hash of its exact id list: new content makes a new version, the old seal stays
{
  const v1 = P.sets().find((s) => s.id === 'style:buzz');
  ctx.HSC.REQUEST_STYLES.push({ id: 'buzz:3', fam: 'buzz' });
  const v2 = P.sets().find((s) => s.id === 'style:buzz');
  assert.notEqual(v1.ver, v2.ver, 'added content is a new set version');
  assert.deepEqual(plain(v1.req), ['buzz:1', 'buzz:2'], 'the released list is unchanged');
  ctx.HSC.REQUEST_STYLES.pop();
  passed++;
}

// 2. settle seals a completed set once, in the body being committed; replaying changes nothing
{
  const core = C.create('ist', 7);
  core.mastery.style['buzz:1'] = 1; core.mastery.style['buzz:2'] = 3;
  const body = { core, regs: {}, eco: E.fresh() };
  const done = P.settle(body);
  assert.deepEqual(plain(done), ['style:buzz']);
  const sealed = Object.keys(body.port.seals);
  assert.equal(sealed.length, 1);
  assert.ok(body.port.claimed[0].startsWith('portfolio:style:buzz:'), 'reward id portfolio:setId:version');
  assert.deepEqual(plain(P.settle(body)), [], 'a sealed set never completes twice');
  assert.equal(body.port.claimed.length, 1);
  passed++;
}

// 3. a career on the placeholder city has no portfolio yet; migration infers from facts and records one zero-coin txn
{
  const pre = { core: C.create(C.UNSET, 8), regs: {}, eco: E.fresh() };
  assert.deepEqual(plain(P.settle(pre)), []);
  const core = C.found(C.create(C.UNSET, 9), 'lag').state;
  core.mastery.style['fade:1'] = 2;
  const body = { core, regs: {}, eco: E.fresh() };
  const bal = body.eco.balance;
  P.settle(body, true); P.settle(body, true);
  assert.equal(body.port.migrated, true);
  assert.ok(body.port.seals[Object.keys(body.port.seals).find((k) => k.startsWith('style:fade@'))], 'an earned set is sealed by the migration');
  assert.equal(body.eco.keys.filter((k) => k === 'portfolio:migration').length, 1, 'one migration record');
  assert.equal(body.eco.balance, bal, 'the migration pays nothing');
  passed++;
}

// 4. the card codec: 64x32 cells, 3 bits, deterministic; within 12 KiB per card and 384 KiB for 24
{
  const hair = Array.from({ length: 8192 }, (_, i) => (i * 7) % 6), beard = Array.from({ length: 8192 }, (_, i) => (i * 5) % 17);
  const eh = P.encode(hair, 5), eb = P.encode(beard, 16);
  assert.equal(eh, P.encode(hair.slice(), 5), 'deterministic');
  const dh = P.decode(eh, 5), db = P.decode(eb, 16);
  assert.equal(dh.length, 8192); assert.ok(dh.every((v) => v >= 0 && v <= 5));
  assert.ok(db.every((v) => v >= 0 && v <= 16));
  const uniform = Array(8192).fill(4);
  assert.ok(P.decode(P.encode(uniform, 5), 5).every((v) => v === 4), 'a uniform grid comes back exactly');
  // cards: 24 fit, the 25th is refused unless an exact card is replaced; a refusal changes nothing
  const person = { seed: 1, hair: { type: '1b', colour: 'brown' }, beard: { style: 'clean', mm: {} }, years: 30 };
  const card = (n) => ({ id: 'c' + n, cv: 1, src: 'x:' + n, city: 'ist', style: 'buzz:1', mode: 'requests', seed: n, person, bh: eh, ah: eh, bb: eb, ab: eb, q: 2, rev: n });
  let cards = [];
  for (let n = 0; n < P.CARDS; n++) cards = P.withCard(cards, card(n), null);
  assert.equal(cards.length, 24);
  assert.ok(JSON.stringify(cards).length <= P.CARDS_MAX, 'the gallery fits its budget');
  assert.ok(JSON.stringify(card(0)).length <= P.CARD_MAX, 'one card fits its budget');
  assert.equal(P.withCard(cards, card(99), null), null, 'the 25th card needs a replacement choice');
  const swapped = P.withCard(cards, card(99), 'c5');
  assert.equal(swapped.length, 24);
  assert.ok(!swapped.some((c) => c.id === 'c5') && swapped.some((c) => c.id === 'c99'), 'exactly the chosen card is replaced');
  assert.equal(P.withCard(cards, Object.assign(card(98), { bh: 'q3:' + 'A'.repeat(13000) }), 'c1'), null, 'an oversized card is refused');
  assert.equal(cards.length, 24);
  passed++;
}

console.log('PASS: ' + passed + ' portfolio cases (frozen set versions, seals once, migration, card codec and budgets).');
