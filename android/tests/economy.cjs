'use strict';
// Economy unit tests (docs/ECONOMY-IMPLEMENTATION-AND-QA.md section 12) and the balance model's worked examples
// (docs/ECONOMY-BALANCE-MODEL.md section 8).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const ctx = { HSC: {}, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'source/customers/economy.js'), 'utf8'), ctx);
const E = ctx.HSC.economy;
let passed = 0;
const plain = (x) => JSON.parse(JSON.stringify(x));

// 1. the balance model's worked examples
assert.equal(E.payout({ kind: 'requests', stars: 3, valid: true }).total, 36, 'ordinary 3-star order pays 36');
assert.equal(E.payout({ kind: 'requests', stars: 3, valid: true }).tip, 12);
let p = E.payout({ kind: 'requests', stars: 3, valid: true, combo: 2 });
assert.equal(p.total, 38, '3-star order, second combo result, pays 38');
assert.equal(p.total + 2 * p.tip, 66, 'and 66 with the rewarded triple');
p = E.payout({ kind: 'fix', stars: 3, valid: true, combo: 4, vip: true });
assert.equal(p.tip, 34, 'the tip is capped at the net fee');
assert.equal(p.total, 68, '3-star VIP rescue at maximum combo pays 68');
assert.equal(p.total + 2 * p.tip, 136);
passed++;

// 2. stars move the tip only; incomplete and freestyle pay nothing
assert.equal(E.payout({ kind: 'requests', stars: 1, valid: true }).total, 24, 'one star still earns the net fee');
assert.equal(E.payout({ kind: 'requests', stars: 2, valid: true }).total, 30);
assert.equal(E.payout({ kind: 'requests', stars: 3, valid: false }).total, 0, 'no meaningful work pays nothing');
assert.equal(E.payout({ kind: 'free', stars: 3, valid: true }).total, 0, 'freestyle cannot be farmed');
passed++;

// 3. a haircut is the whole job: there is no service line and no Relax fee
assert.ok(!('service' in E.CONFIG) && !('relax' in E.CONFIG.fee), 'no services and no Relax in the economy');
passed++;

// 4. transactions are idempotent: a duplicate reveal or ad callback pays once
let eco = E.fresh();
let r = E.payJob(eco, 'job:A', { kind: 'requests', stars: 3, valid: true });
eco = r.eco;
const again = E.payJob(eco, 'job:A', { kind: 'requests', stars: 3, valid: true });
assert.equal(again.duplicate, true);
assert.equal(again.eco.balance, 36);
const t1 = E.tripleTip(eco, 'job:A', 12); eco = t1.eco;
assert.equal(eco.balance, 60);
assert.equal(E.tripleTip(eco, 'job:A', 12).duplicate, true, 'a duplicate rewarded callback pays once');
passed++;

// 5. the operating bill: the first cycle is sponsored; the 50-coin next-cycle bill is disclosed at the preceding
// result boundary (after jobs 5/10/15), before jobs 6/11/16 can begin, and posts once even into debt
eco = E.fresh();
for (let i = 0; i < 4; i++) eco = E.payJob(eco, 'j' + i, { kind: 'requests', stars: 1, valid: true }).eco;
assert.equal(eco.balance, 4 * 24, 'the sponsored opening cycle has no bill');
let fifth = E.payJob(eco, 'j4', { kind: 'requests', stars: 1, valid: true }); eco = fifth.eco;
assert.equal(eco.balance, 5 * 24 - 50, 'the next-cycle bill is visible before job six');
assert.equal(fifth.bill.key, 'bill:1');
for (let i = 5; i < 10; i++) eco = E.payJob(eco, 'j' + i, { kind: 'requests', stars: 1, valid: true }).eco;
assert.equal(eco.balance, 10 * 24 - 100, 'one 50-coin bill posts at each five-job boundary');
assert.equal(eco.sinks.bill, 100);
// into debt: a player who spent everything still gets billed, and can always work back
eco = E.apply(eco, { key: 'force-debt', type: 'cost', cat: 'test', amount: -eco.balance - 50 }).eco;
for (let i = 10; i < 15; i++) eco = E.payJob(eco, 'j' + i, { kind: 'requests', stars: 1, valid: true }).eco;
assert.equal(eco.balance, -50 + 5 * 24 - 50, 'bills post below zero; earnings reduce the debt first');
passed++;

// 6. a discretionary purchase needs the price in hand; debt never buys
assert.equal(E.buy(eco, 'buy:x', 'salon', 100).error, 'insufficient');
eco = E.grant(eco, 'grant:x', 'test', 500).eco;
const b = E.buy(eco, 'buy:x', 'salon', 100);
assert.equal(b.error, undefined);
assert.equal(b.eco.balance, eco.balance - 100);
passed++;

// 7. career milestones pay once; new tours do not pay more
eco = E.fresh();
let ms = E.milestonesFor(['licence-complete', 'branch-established:lon', 'tour-complete:1'], { city: 'lon', visit: 0, tour: 1 }, true);
let m = E.payMilestones(eco, ms); eco = m.eco;
assert.equal(eco.balance, 40 + 300 + 75 + 400); // first showcase 75 (owner decision 5 November 2026)
m = E.payMilestones(eco, ms);
assert.equal(m.paid.length, 0, 'replays cannot pay a milestone again');
const tour9 = E.milestonesFor(['tour-complete:9'], null, false);
assert.equal(tour9[0][1], 400, 'a later tour pays the same as the first');
passed++;

// 8. level rewards: capped table, once per level, nothing after 12, history not repaid after migration
eco = E.payLevels(E.fresh(), 14);
assert.equal(eco.balance, 4 * 50 + 4 * 75 + 3 * 100, 'levels 2-12 pay once; 13+ pay nothing');
let mig = E.migrate(E.fresh(), { coins: 777, level: 9 });
assert.equal(mig.balance, 777, 'migration keeps every coin');
mig = E.payLevels(mig, 11);
assert.equal(mig.balance, 777 + 100 + 100, 'only levels reached after migration pay');
assert.equal(E.migrate(mig, { coins: 1 }).balance, mig.balance, 'migration runs once');
passed++;

// 9. signed balance stays bounded; the ledger and key ring stay bounded
eco = E.fresh();
for (let i = 0; i < 1000; i++) eco = E.grant(eco, 'g' + i, 'test', 1).eco;
assert.ok(eco.ledger.length <= E.CONFIG.ledgerSize && eco.keys.length <= E.CONFIG.keyRing, 'bounded ledger');
assert.equal(eco.balance, 1000);
assert.equal(E.apply(eco, { key: 'huge', type: 'cost', cat: 't', amount: -9e15 }).error, 'bad-transaction', 'unsafe amounts are refused');
passed++;

// 10. inputs are never mutated
const frozen = JSON.stringify(eco);
E.payJob(eco, 'z', { kind: 'requests', stars: 3, valid: true }); E.buy(eco, 'zz', 'salon', 10);
assert.equal(JSON.stringify(eco), frozen);
passed++;

// demand shifts: two highlighted modes per five paid contracts, three bonuses at most, every mode before a repeat
{
  const job = { kind: 'requests', stars: 2, valid: true };
  const seen = new Set();
  for (let s = 0; s < 3; s++) for (const m of E.demandModes(s * 5, null)) seen.add(m);
  assert.equal(seen.size, 4, 'every mode appears before the deck repeats');
  assert.equal(JSON.stringify(plain(E.demandModes(7, null))), JSON.stringify(plain(E.demandModes(9, null))), 'a shift keeps its modes');
  assert.equal(E.demandModes(0, ['requests']).length, 1, 'only unlocked modes');
  assert.ok(!E.demandModes(0, null).includes('free'), 'Quick Play is never a target');
  const bonus = E.payout(Object.assign({ demandMatch: true }, job)).total - E.payout(job).total;
  assert.equal(bonus, Math.min(12, Math.round(24 * 0.2)), '+20% of the net fee, at most 12');
  let d = E.fresh();
  const mode = E.demandModes(0, null)[0];
  let hits = 0;
  for (let i = 0; i < 4; i++) { const m = E.demandMatch(d, mode); if (m) hits++; d = E.payJob(d, 'd' + i, Object.assign({ demandMatch: m }, job)).eco; }
  assert.equal(hits, 3, 'at most three demand bonuses per shift');
  passed++;
}
console.log('PASS: ' + passed + ' economy cases (worked examples, tips, haircut-only pay, idempotency, operating bill, debt, milestones, levels, migration).');
