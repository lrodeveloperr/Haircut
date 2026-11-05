'use strict';
// Economy balance simulator (docs/ECONOMY-IMPLEMENTATION-AND-QA.md section 11; ECONOMY-BALANCE-MODEL.md sections 19
// and 23; implementation plan 3.1). Deterministic and headless: every job, bill and milestone goes through the
// game's own economy.js; salon prices are read from salon.js, so the report always matches the shipped values.
//
// Player model (stated, so it can be argued with): about 3 minutes per contract; a career chapter every five
// contracts (licence first, then one new city per chapter until all 36, then revisits); levels 2-12 at
// n^2 - 1 contracts; the play-time Gift by minutes played; calendar, daily goals, weekly chest and the Daily
// challenge on active days. Spending: buy the cheapest unowned salon part when affordable (with a buffer of one
// operating bill), except the saver. Rewarded: the high-ad viewer triples tips and doubles the calendar and Gift.
//
// Usage: node android/tests/economy-sim.cjs [--json] [--prices=current|proposed]
// Hard invariants are asserted (no required content behind coins, no inflation by tour number, debt recovery);
// the balance targets are reported as PASS/MISS for the owner's pricing decision (plan 3.7), not asserted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const ctx = { HSC: {}, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'source/customers/economy.js'), 'utf8'), ctx);
const E = ctx.HSC.economy, CFG = E.CONFIG;
const args = process.argv.slice(2), JSON_OUT = args.includes('--json');
const PRICES = (args.find((a) => a.startsWith('--prices=')) || '--prices=current').split('=')[1];
// the Gift's three amounts, as the game pays them
const session = JSON.parse(fs.readFileSync(path.join(root, 'source/customers/session.js'), 'utf8').match(/PAY = (\[[^\]]*\])/)[1]);
// what-if levers for the owner's decision (never change the game): --chapter=N (city chapter milestone),
// --showcase=N (first showcase in a city), --gift=a,b,c (the three play-time gifts)
const opt = (k) => { const a = args.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : null; };
if (opt('chapter')) CFG.milestones.cityChapter = +opt('chapter');
if (opt('showcase')) CFG.milestones.cityShowcase = +opt('showcase');
const GIFTS = (opt('gift') || session.join(',')).split(',').map(Number);

// ---- the salon catalogue, as the game sells it ----
const salonSrc = fs.readFileSync(path.join(root, 'source/customers/salon.js'), 'utf8');
const OPTIONS = vm.runInNewContext('(' + salonSrc.match(/const OPTIONS = (\{[\s\S]*?\n  \});/)[1] + ')');
const REGIONS = vm.runInNewContext(salonSrc.match(/const REGION_IDS = (\[[^\]]*\])/)[1]).filter((r) => r !== 'classic');
// a proposal (plan 3.7) can be simulated side by side without touching the game: --prices=proposed
const PROPOSED = { tiers: [100, 250, 450, 700], extra: 900, region: null };
function partPrice(i) {
  if (i <= 0) return 0;
  if (PRICES === 'proposed') return i - 1 < PROPOSED.tiers.length ? PROPOSED.tiers[i - 1] : PROPOSED.extra;
  return CFG.salon[Math.min(i - 1, CFG.salon.length - 1)];
}
function catalogue() {
  const items = [];
  for (const [slot, opts] of Object.entries(OPTIONS)) opts.forEach((o, i) => { if (i > 0) items.push({ id: 'part:' + slot + ':' + o, price: partPrice(i), kind: 'salon' }); });
  // a regional shop is a bundle of its parts at their own prices (owner decision 5 November 2026), so it adds no
  // separate sink: its parts are already in the list above
  // the wardrobe's real catalogue at its tier prices (wardrobe-shop.js), for the collector archetypes
  for (const key of WARDROBE.keys()) items.push({ id: key, price: WARDROBE.get(key), kind: 'wardrobe' });
  return items;
}

// the wardrobe catalogue and its prices, computed by the game's own modules
const WARDROBE = (() => {
  const c = { HSC: { PHENOTYPES: {}, economy: E, coins: {} }, console }; c.globalThis = c; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(root, 'source/customers/catalog.js'), 'utf8'), c);
  vm.runInContext(fs.readFileSync(path.join(root, 'source/customers/wardrobe-shop.js'), 'utf8').replace("if (typeof setInterval === 'function') {", 'if (false) {'), c);
  const m = new Map();
  for (const tool of ['clipper', 'gown']) for (const d of c.HSC.catalog.designs[tool]) { const p = c.HSC.wardrobeShop.price(d); if (p) m.set(d.key, p); }
  return m;
})();
// ---- deterministic randomness ----
function rng(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---- archetypes (balance model section 23) ----
const ARCH = {
  casual: { perDay: 2, active: 0.7, stars: [0.3, 0.5, 0.2], ads: 0, spend: 'cheapest' },
  normal: { perDay: 4, active: 0.85, stars: [0.15, 0.45, 0.4], ads: 0, spend: 'cheapest' },
  'normal-ads': { perDay: 4, active: 0.85, stars: [0.15, 0.45, 0.4], ads: 0.7, spend: 'cheapest' },
  heavy: { perDay: 10, active: 0.95, stars: [0.1, 0.4, 0.5], ads: 0.3, spend: 'cheapest' },
  saver: { perDay: 4, active: 0.85, stars: [0.15, 0.45, 0.4], ads: 0, spend: 'never' },
  optimizer: { perDay: 6, active: 0.9, stars: [0.1, 0.4, 0.5], ads: 0.3, spend: 'regions-first' },
  weak: { perDay: 4, active: 0.85, stars: [0.7, 0.3, 0], ads: 0, spend: 'cheapest' },
};
const KINDS = ['requests', 'requests', 'fix', 'beard', 'relax', 'rush'];
const MIN_PER_JOB = 3, LEVEL_AT = (n) => n * n - 1;

function simulate(name, days, seed = 7) {
  const A = ARCH[name], R = rng(seed + name.length * 131);
  let eco = E.fresh();
  const owned = new Set(), shop = catalogue(), buys = [], wallet = [], debt = [];
  const src = {}, sink = {}, add = (book, k, v) => { book[k] = (book[k] || 0) + v; };
  let jobs = 0, combo = 0, chapters = 0, citiesDone = 0, tour = 1, level = 1, goalsWeek = 0, calDay = 0, inDebtSince = null;
  const credit = (key, cat, n) => { if (!n) return; const r = E.apply(eco, { key, type: 'earn', cat, amount: Math.round(n) }); if (!r.error && !r.duplicate) { eco = r.eco; add(src, cat, Math.round(n)); } };
  const milestone = (id, n) => { const m = E.payMilestones(eco, [[id, n]]); if (m.paid.length) add(src, 'milestone', n); eco = m.eco; };
  const daySeries = [];
  for (let day = 1; day <= days; day++) {
    const before = { src: Object.values(src).reduce((a, b) => a + b, 0), sink: Object.values(sink).reduce((a, b) => a + b, 0) };
    if (R() < A.active) {
      // daily sources on an active day
      const cal = CFG.calendar[calDay % 7]; calDay++;
      credit('cal:' + day, 'calendar', cal * (A.ads && R() < A.ads ? 2 : 1));
      if (calDay % 7 === 0) credit('cal-item:' + day, 'calendar', 0);
      const goals = A.perDay >= 4 ? 2 : 1; goalsWeek += goals;
      credit('goals:' + day, 'goals', goals * CFG.goal);
      if (day % 7 === 0) { if (goalsWeek >= CFG.weeklyGoal) credit('weekly:' + day, 'weekly', CFG.weekly); goalsWeek = 0; }
      // the play-time Gift: 50 / 100 / 200 at 10 / 20 / 30 minutes; a video doubles one
      const minutes = A.perDay * MIN_PER_JOB, gifts = [[10, GIFTS[0]], [20, GIFTS[1]], [30, GIFTS[2]]].filter(([m]) => minutes >= m);
      gifts.forEach(([, n], i) => credit('gift:' + day + ':' + i, 'gift', n * (A.ads && i === gifts.length - 1 && R() < A.ads ? 2 : 1)));
      for (let k = 0; k < A.perDay; k++) {
        jobs++;
        const u = R(), stars = u < A.stars[0] ? 1 : u < A.stars[0] + A.stars[1] ? 2 : 3;
        combo = stars === 3 ? combo + 1 : 0;
        const slot = (jobs - 1) % 5, kind = slot === 4 ? 'showcase' : KINDS[Math.floor(R() * KINDS.length)];
        const svcReq = kind === 'relax' ? ['towel', 'massage'] : R() < 0.3 ? ['aftershave'] : [];
        const job = { kind, stars, valid: true, regular: slot === 2 && jobs > 5, vip: R() < 0.05, combo, servicesRequested: svcReq, servicesDone: R() < 0.85 ? svcReq : [], relaxShare: kind === 'relax' ? (R() < 0.8 ? 1 : 0.5) : 0, rushBonus: kind === 'rush' ? Math.floor(R() * 12) : 0, dailyFirst: k === 0 && R() < 0.6 };
        job.demandMatch = E.demandMatch(eco, kind === 'showcase' ? 'requests' : kind);
        const p = E.payJob(eco, 'job:' + jobs, job);
        eco = p.eco;
        add(src, 'job', p.payout.total);
        if (p.bill) add(sink, 'bill', -p.bill.amount);
        if (A.ads && R() < A.ads * 0.5 && p.payout.tip) { const t = E.tripleTip(eco, 'job:' + jobs, p.payout.tip); if (!t.error && !t.duplicate) { eco = t.eco; add(src, 'rewarded', 2 * p.payout.tip); } }
        if (jobs === 1) milestone('first-haircut', CFG.milestones.firstHaircut);
        if (slot === 4) {
          chapters++;
          if (chapters <= 6) milestone('home-chapter:' + chapters, CFG.milestones.homeChapter);
          if (chapters === 6) milestone('licence', CFG.milestones.licence);
          if (chapters > 6) {
            const c = (chapters - 7) % 36, t = Math.floor((chapters - 7) / 36) + 1;
            milestone('chapter:' + c + ':' + t, CFG.milestones.cityChapter);
            if (t === 1) { milestone('showcase:' + c, CFG.milestones.cityShowcase); citiesDone++; }
            if (t === 3) milestone('mastery:' + c, CFG.milestones.cityMastery); // three chapters in a city: tour 3
            if (c === 35) { milestone('tour:' + t, CFG.milestones.tour); tour = t + 1; }
          }
        }
        while (level < 12 && jobs >= LEVEL_AT(level + 1)) { level++; const e2 = E.payLevels(eco, level); add(src, 'level', e2.balance - eco.balance); eco = e2; }
        // spending: the next target, bought once affordable with one operating bill in reserve
        if (A.spend !== 'never') {
          const open = shop.filter((it) => !owned.has(it.id)).sort((a, b) => (A.spend === 'regions-first' ? (a.kind === 'region' ? -1 : 1) - (b.kind === 'region' ? -1 : 1) : 0) || a.price - b.price);
          const next = open[0];
          if (next && eco.balance - next.price >= CFG.bill.amount) {
            const r = E.buy(eco, 'buy:' + next.id, 'salon', next.price);
            if (!r.error) { eco = r.eco; owned.add(next.id); add(sink, next.kind, next.price); buys.push({ id: next.id, price: next.price, job: jobs, day }); }
          }
        }
        // debt: jobs from going below zero back to zero or above
        if (eco.balance < 0 && inDebtSince == null) inDebtSince = jobs;
        if (eco.balance >= 0 && inDebtSince != null) { debt.push(jobs - inDebtSince); inDebtSince = null; }
      }
    }
    const after = { src: Object.values(src).reduce((a, b) => a + b, 0), sink: Object.values(sink).reduce((a, b) => a + b, 0) };
    daySeries.push({ src: after.src - before.src, sink: after.sink - before.sink });
    wallet.push(eco.balance);
  }
  // rolling seven-day sink/source ratio (median over the run, after the first week)
  const ratios = [];
  for (let d = 7; d <= daySeries.length; d++) { const w = daySeries.slice(d - 7, d), s = w.reduce((a, x) => a + x.src, 0), k = w.reduce((a, x) => a + x.sink, 0); if (s) ratios.push(k / s); }
  ratios.sort((a, b) => a - b);
  const totalSrc = Object.values(src).reduce((a, b) => a + b, 0);
  // job distance: contracts of ordinary work (job income minus the bill) to the cheapest unowned item from 0 coins
  const perJob = ((src.job || 0) - (sink.bill || 0)) / Math.max(1, jobs);
  const left = shop.filter((it) => !owned.has(it.id) && it.kind !== 'wardrobe').map((it) => it.price).sort((a, b) => a - b);
  const stageMax = Math.max(...shop.filter((it) => it.kind !== 'wardrobe').map((it) => it.price)) / Math.max(1, perJob);
  return {
    name, days, jobs, wallet: eco.balance, walletPeak: Math.max(...wallet),
    src, sink, coreShare: (src.job || 0) / totalSrc, rewardedShare: (src.rewarded || 0) / totalSrc, giftShare: (src.gift || 0) / totalSrc,
    billShareOfWork: (sink.bill || 0) / Math.max(1, src.job || 0),
    sinkRatio7: ratios.length ? ratios[Math.floor(ratios.length / 2)] : 0,
    perJobNet: +perJob.toFixed(1), boughtCount: buys.length, salonSpent: (sink.salon || 0) + (sink.region || 0), wardrobeSpent: sink.wardrobe || 0,
    firstBuyJob: buys[0] ? buys[0].job : null, nextTargetJobs: left.length ? +(Math.max(0, left[0] - eco.balance) / perJob).toFixed(1) : 0,
    longestStageJobs: +stageMax.toFixed(1), salonComplete: left.length === 0,
    debtEpisodes: debt.length, debtMedian: debt.length ? debt.sort((a, b) => a - b)[Math.floor(debt.length / 2)] : 0, debtP90: debt.length ? debt[Math.floor(debt.length * 0.9)] : 0,
    tour, citiesDone,
  };
}

// ---- the 1,000-tour check: per-tour sources stay flat (no inflation by tour number) ----
function tourSources() {
  const per = [];
  for (const t of [2, 10, 100, 1000]) {
    let eco = E.fresh(), coins = 0;
    for (let c = 0; c < 36; c++) { const m = E.payMilestones(eco, [['chapter:' + c + ':' + t, CFG.milestones.cityChapter]].concat(c === 35 ? [['tour:' + t, CFG.milestones.tour]] : [])); eco = m.eco; coins += m.paid.reduce((a, x) => a + x[1], 0); }
    per.push(coins);
  }
  return per;
}

// ---- debt recovery from zero (balance model section 24): one bill into debt, ordinary one-star Orders back ----
function debtFromZero() {
  const out = [];
  for (let stars = 1; stars <= 3; stars++) {
    let bal = -CFG.bill.amount, n = 0;
    while (bal < 0 && n < 50) { n++; bal += E.payout({ kind: 'requests', stars, valid: true }).total; }
    out.push(n);
  }
  return out;
}

const report = { prices: PRICES, catalogue: { items: catalogue().length, total: catalogue().reduce((a, x) => a + x.price, 0), maxPart: Math.max(...catalogue().filter((x) => x.kind === 'salon').map((x) => x.price)) }, runs: [] };
for (const name of Object.keys(ARCH)) for (const days of [30, 90, 365]) report.runs.push(simulate(name, days));
report.tourSources = tourSources();
report.debtFromZero = debtFromZero();

// hard invariants
assert.ok(report.tourSources.every((x) => x === report.tourSources[0]), 'no inflation by tour number');
assert.ok(report.debtFromZero[0] <= 3, 'one bill of debt is repaid by three one-star Orders');
for (const r of report.runs) assert.ok(r.jobs > 0);

// targets (balance model section 19), reported, not asserted
const T = (ok) => (ok ? 'PASS' : 'MISS');
const lines = [];
const nm = report.runs.filter((r) => r.name === 'normal');
for (const r of nm) lines.push(`normal ${r.days}d: sink/source 7-day ${r.sinkRatio7.toFixed(2)} [0.65-0.80 ${T(r.sinkRatio7 >= 0.65 && r.sinkRatio7 <= 0.8)}], core share ${(r.coreShare * 100).toFixed(0)}% [55-65% ${T(r.coreShare >= 0.55 && r.coreShare <= 0.65)}], gift share ${(r.giftShare * 100).toFixed(0)}%, bill ${(r.billShareOfWork * 100).toFixed(0)}% of work [25-35% ${T(r.billShareOfWork >= 0.25 && r.billShareOfWork <= 0.35)}], wallet ${r.wallet}, bought ${r.boughtCount}, salon complete ${r.salonComplete}`);
const n90 = nm.find((r) => r.days === 90);
lines.push(`job distance: ordinary work nets ${n90.perJobNet}/contract; longest single stage ${n90.longestStageJobs} contracts [<=60 ${T(n90.longestStageJobs <= 60)}]; first purchase at contract ${n90.firstBuyJob} [<=3 ${T(n90.firstBuyJob != null && n90.firstBuyJob <= 3)}]`);
lines.push(`debt from zero (1/2/3-star Orders): ${report.debtFromZero.join('/')} contracts [median 1-3 ${T(report.debtFromZero[1] <= 3)}]`);
for (const r of report.runs.filter((x) => x.days === 90)) lines.push(`${r.name.padEnd(11)} 90d: jobs ${r.jobs}, wallet ${r.wallet}, peak ${r.walletPeak}, bought ${r.boughtCount} (salon ${r.salonSpent}, wardrobe ${r.wardrobeSpent}), sink/source ${r.sinkRatio7.toFixed(2)}, gift ${(r.giftShare * 100).toFixed(0)}%, rewarded ${(r.rewardedShare * 100).toFixed(0)}%, debt median/p90 ${r.debtMedian}/${r.debtP90}`);
if (JSON_OUT) console.log(JSON.stringify(report, null, 1));
else { console.log('Economy simulation, prices: ' + PRICES + ' (salon catalogue ' + report.catalogue.items + ' items, ' + report.catalogue.total + ' coins)'); for (const l of lines) console.log('  ' + l); }
console.log('PASS: economy simulator (' + report.runs.length + ' runs; no inflation by tour number; debt recovery within the locked band).');
