'use strict';
// Fixes F1a (pure node, the real source files in a sandbox):
//   - one test of real work (HSC.modes.worked): hair or beard cells changed from the start; the stroke counter, an undo
//     of every stroke and a brushed brow are not work; the Orders result pays, levels and offers nothing without it
//   - a beard order is scored fairly: a slip costs its share of the whole beard, a perfect beard is 3 stars
//   - the saved progress keeps what the fixes save: the Career Rush clock (by contract), an Orders customer's order,
//     a result's pay not yet committed, a wish video's pending coins, the game's day and the job counter
//   - the game's day never moves backwards: turning the clock back keeps every daily limit; a real new day opens them
//   - the play-time gift: a second tap during the double video claims nothing, and the gift keeps its day and number
//   - daily tasks: claimed under the tasks' own day; only paid real work counts
//   - the job pay key is per install: an engine session that starts its job numbers again still pays
// Round 2 (G1a):
//   - R1-4 a job is a repeat only when its number, customer and engine session all match the saved result
//   - R1-1 the Rush time bonus needs 2 stars; R1-2 a scored job needs 20% of its order's own work; a small perfect
//     repair still counts
//   - R1-5 / R2-1 an earned video's coins are kept owed until they really land (journal loading, a failed commit),
//     then paid by the retry; a tripled tip the same
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const src = (f) => fs.readFileSync(path.join(root, 'source/customers', f), 'utf8');
const tick = () => new Promise(setImmediate);
let passed = 0, done = false;
process.on('exit', (c) => { if (!c && !done) { console.error('fix-modes: stopped before the end (a promise never settled)'); process.exitCode = 1; } });

function sandbox(now) {
  const RD = Date;
  const clock = { at: now };
  const FakeDate = class extends RD { constructor(...a) { if (!a.length) super(clock.at); else super(...a); } static now() { return clock.at; } };
  const un = (t) => { if (t && t.unref) t.unref(); return t; };
  const el = () => ({ style: { setProperty() {} }, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, append() {}, appendChild() {}, addEventListener() {}, querySelector: () => el(), querySelectorAll: () => [], setAttribute() {}, getBoundingClientRect: () => ({}) });
  const doc = { body: null, head: el(), hidden: false, visibilityState: 'visible', documentElement: el(), createElement: el, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
  const perf = { t: 0 };
  const ctx = vm.createContext({ console: { log() {}, error() {}, warn() {} }, Date: FakeDate, document: doc, setTimeout: (f, ms) => un(setTimeout(f, ms)), clearTimeout, setInterval: (f, ms) => un(setInterval(f, ms)), clearInterval, addEventListener() {}, performance: { now: () => perf.t } });
  ctx.globalThis = ctx;
  ctx.HSC = { PHENOTYPES: { decks: {} } };
  for (const f of ['economy.js', 'meta.js', 'requests.js', 'progress.js', 'modes.js', 'session.js']) vm.runInContext(src(f), ctx);
  return { ctx, HSC: ctx.HSC, clock, perf };
}
const DAY = 86400000, T0 = Date.UTC(2026, 10, 7, 12);
const grid = (v = 3) => new Array(8192).fill(v);
const job = (o) => Object.assign({ jobId: 5, status: 'reveal', seed: 77, look: { person: { seed: 9, first: false } }, startHair: grid(), hair: grid(), startBeard: grid(0), beard: grid(0), brow: grid(2), cutStrokeCount: 0 }, o);
const cut = (n, v = 1) => { const h = grid(); for (let i = 0; i < n; i++) h[i] = v; return h; };

// ---------------- one definition of real work ----------------
{
  const { HSC } = sandbox(T0);
  const W = HSC.modes.worked;
  assert.equal(HSC.modes.MIN_WORK, 60);
  assert.equal(W(job({ cutStrokeCount: 400 })), false, 'many pointer samples with every stroke undone are no work');
  assert.equal(W(job({ hair: cut(59), cutStrokeCount: 3 })), false, 'a touch under a stroke is no work');
  assert.equal(W(job({ hair: cut(60) })), true, '60 hair cells changed is real work, whatever the stroke counter says');
  const b = grid(0); for (let i = 0; i < 60; i++) b[i] = 1;
  assert.equal(W(job({ startBeard: grid(2), beard: b.map((v) => v) })), true, 'beard cells count');
  const brow = grid(0);
  assert.equal(W(job({ brow, cutStrokeCount: 30 })), false, 'a brow brushed (even shaved) is not the haircut');
  assert.equal(HSC.modes.changedCells(job({ hair: cut(250) })), 250);
  passed++;
}

// ---------------- an Orders customer with every stroke undone: no pay, no level, no video ----------------
{
  const { HSC } = sandbox(T0);
  const M = HSC.meta;
  M.data = JSON.parse(JSON.stringify({ v: 1, cuts: 3, firstDay: '2026-11-01', modes: { mode: 'requests', job: null }, regulars: [], deck: {}, last: {} }));
  // the legacy round (no economy journal): stars from real work only
  HSC.onHaircutDone(job({ cutStrokeCount: 250 }));
  assert.equal(M.data.lastRound.stars, 0, 'every stroke undone: no stars');
  assert.equal(M.data.lastRound.paid, 0, 'and no coins');
  HSC.validPerson = () => true; M.data.queue = { job: 6, person: { seed: 1 } }; // the next customer is already chosen
  M.onFinish(job({ cutStrokeCount: 250 }));
  assert.equal(M.data.cuts, 3, 'and no level progress');
  passed++;
}

// ---------------- the economy round: real work, a per-install key, the pay kept until committed ----------------
(async () => {
  {
    const { HSC } = sandbox(T0);
    const M = HSC.meta, pays = [];
    let resolve = null;
    HSC.econ = { ready: () => true, starting: () => false, balance: () => 0, demandMatch: () => false, earn: async () => ({}), payJob: (k, j) => { pays.push([k, j]); return new Promise((r) => { resolve = r; }); } };
    M.data = { v: 1, cuts: 3, firstDay: '2026-11-01', modes: { mode: 'requests', job: null }, regulars: [], deck: {}, last: {} };
    // an untouched (all undone) Orders customer: valid false, nothing paid, no video
    HSC.onHaircutDone(job({ jobId: 7, cutStrokeCount: 120 }));
    assert.equal(pays.length, 0, 'no pay without real work');
    assert.equal(M.data.lastRound.video, 0, 'no result video without real work');
    assert.ok(!M.data.lastRound.pend, 'nothing owed');
    // real work (no order can be built in the sandbox: one plain star, never three)
    HSC.onHaircutDone(job({ jobId: 8, hair: cut(400), cutStrokeCount: 2 }));
    assert.equal(M.data.lastRound.stars, 1, 'a scored customer without an order is never given unearned stars');
    assert.equal(pays.length, 1);
    const k1 = pays[0][0];
    assert.match(k1, /^job:2026-11-01:n\d+$/);
    assert.ok(M.data.lastRound.pend && M.data.lastRound.pend.job, 'the pay waits in the saved result until committed');
    // a save taken now keeps it (the app killed before the economy committed)
    const saved = JSON.parse(JSON.stringify(M.data));
    resolve({ eco: {}, txn: {} }); await tick(); await tick();
    assert.ok(!M.data.lastRound.pend, 'committed: nothing owed');
    // the same job again (a reveal restored after a reload): nothing more
    HSC.onHaircutDone(job({ jobId: 8, hair: cut(400), cutStrokeCount: 2 }));
    assert.equal(pays.length, 1, 'a job seen twice pays nothing');
    assert.equal(HSC.repeatJob(8), true);
    // the engine session replaced: its job 8 is another session (and another customer) and is paid with its own key
    HSC.onHaircutDone(job({ jobId: 8, hair: cut(400), cutStrokeCount: 2, seed: 1, look: { person: { seed: 10, first: false } } }));
    assert.equal(pays.length, 2, 'a new session job with the last result number is a new job');
    assert.equal(HSC.repeatJob(8), false, 'and not a repeat for the level count');
    // a saved round from before the seeds were kept still recognises its own job by its number
    M.data.lastRound = { job: 9, key: 'job:x:n99', stars: 1, paid: 30 };
    HSC.onHaircutDone(job({ jobId: 9, hair: cut(400), cutStrokeCount: 2 }));
    assert.equal(pays.length, 2, 'an old saved round: its own job is a repeat');
    HSC.onHaircutDone(job({ jobId: 1, hair: cut(400), cutStrokeCount: 2 }));
    HSC.onHaircutDone(job({ jobId: 8, hair: cut(400), cutStrokeCount: 2 }));
    const keys = pays.map((p) => p[0]);
    assert.equal(new Set(keys).size, keys.length, 'job numbers that start again never reuse a pay key: ' + keys.join(' '));
    // the saved progress keeps what was owed
    const { HSC: H2 } = sandbox(T0);
    let loaded = null;
    await H2.metaInit({ loadProgress: async () => saved, saveProgress: async () => {} });
    loaded = H2.meta.data.lastRound;
    assert.deepEqual(JSON.parse(JSON.stringify(loaded.pend.job)), JSON.parse(JSON.stringify(Object.assign({ demandMatch: false }, pays[0][1], { demandMatch: false }))), 'the owed job survives a restart exactly');
    assert.equal(H2.meta.data.jobSeq, saved.jobSeq, 'and the job counter');
    passed++;
  }

  // ---------------- a reveal finished again (a reload) counts the cut once; scoring waits for the journal ----------------
  {
    const { HSC } = sandbox(T0);
    const M = HSC.meta;
    HSC.validPerson = () => true;
    let starting = true;
    const pays = [];
    HSC.econ = { ready: () => !starting, starting: () => starting, balance: () => 0, demandMatch: () => false, earn: async () => ({}), payJob: async (k) => { pays.push(k); return { eco: {} }; } };
    M.data = { v: 1, cuts: 3, firstDay: '2026-11-01', modes: { mode: 'requests', job: null }, regulars: [], deck: {}, last: {}, queue: { job: 13, person: { seed: 1 } } };
    const s = job({ jobId: 12, hair: cut(400), cutStrokeCount: 2 });
    HSC.onHaircutDone(s);
    assert.equal(M.data.lastRound, undefined, 'not scored while the career journal is loading');
    starting = false;
    await new Promise((r) => setTimeout(r, 500));
    assert.equal(M.data.lastRound && M.data.lastRound.job, 12, 'scored once the journal is up');
    M.onFinish(s); M.onFinish(s);
    assert.equal(M.data.cuts, 4, 'the cut is counted once, however often the reveal is finished');
    assert.equal(pays.length, 1);
    passed++;
  }

  // ---------------- beard stars: fair for a small job, perfect is 3, untouched is none of the job ----------------
  {
    const { HSC } = sandbox(T0);
    const st = grid(0), t = grid(0);
    for (let i = 0; i < 2000; i++) { st[i] = 6; t[i] = i < 150 ? 1 : 6; } // a beard of 2000 cells; the order takes 150 down
    const s = (now) => ({ startBeard: st, beard: now });
    const perfect = t.slice(), untouched = st.slice(), slip = t.slice();
    for (let i = 150; i < 200; i++) slip[i] = 2; // one slip: 50 cells that were right cut down
    assert.equal(HSC.modes.beardStars(s(perfect), { beard: t }), 3, 'a perfect beard is 3 stars');
    assert.equal(HSC.modes.beardStars(s(untouched), { beard: t }), 1, 'an untouched beard does none of the job');
    assert.equal(HSC.modes.beardStars(s(slip), { beard: t }), 3, 'one small slip on a small job is not a lost job');
    const big = t.slice(); for (let i = 150; i < 900; i++) big[i] = 2;
    assert.equal(HSC.modes.beardStars(s(big), { beard: t }), 1, 'a ruined beard is still 1 star');
    passed++;
  }

  // ---------------- saved fields: Career clock by contract, the order, a wish video's coins ----------------
  {
    const { HSC } = sandbox(T0);
    await HSC.metaInit({ loadProgress: async () => ({ v: 1, cuts: 4, modes: { mode: 'career', cclock: { id: 'c-12', ms: 31000 }, clock: { n: 3, ms: 9000 }, ord: { n: 5, p: 9, st: 'fade:124:low', bs: 'goatee' }, wv: { day: '2026-11-07', n: 1, pend: 'wish:2026-11-07:1' } } }), saveProgress: async () => {} });
    const md = HSC.meta.data.modes;
    assert.deepEqual(JSON.parse(JSON.stringify(md.cclock)), { id: 'c-12', ms: 31000 }, 'the Career Rush clock is kept by the contract');
    assert.deepEqual(JSON.parse(JSON.stringify(md.ord)), { n: 5, p: 9, st: 'fade:124:low', bs: 'goatee' }, 'the order is kept');
    assert.equal(md.wv.pend, 'wish:2026-11-07:1', 'a wish video not yet paid is kept');
    await HSC.metaInit({ loadProgress: async () => ({ v: 1, modes: { cclock: { id: 5, ms: 1 }, ord: { n: 'x' } } }), saveProgress: async () => {} });
    assert.equal(HSC.meta.data.modes.cclock, null); assert.equal(HSC.meta.data.modes.ord, null);
    passed++;
  }

  // ---------------- the game's day never moves backwards ----------------
  {
    const { HSC, clock } = sandbox(T0);
    await HSC.metaInit({ loadProgress: async () => ({ v: 1, cuts: 4, gift: { day: '2026-11-07', sec: 1800, got: 3 }, modes: { mode: 'requests', wv: { day: '2026-11-07', n: 3 } } }), saveProgress: async () => {} });
    assert.equal(HSC.meta.data.maxDay, '2026-11-07', 'an old save starts from the latest day its limits were counted on');
    clock.at = T0 - 3 * DAY;
    assert.equal(HSC.meta.today(), '2026-11-07', 'the clock turned back: still the same game day');
    assert.equal(HSC.gift.state().done, true, 'so the gifts taken stay taken');
    clock.at = T0 + DAY;
    assert.equal(HSC.meta.today(), '2026-11-08', 'a real new day');
    assert.equal(HSC.gift.state().done, false, 'opens the gifts again');
    passed++;
  }

  // ---------------- the gift: one claim per gift, even with taps during the video ----------------
  {
    const { HSC } = sandbox(T0);
    await HSC.metaInit({ loadProgress: async () => ({ v: 1, cuts: 4, gift: { day: '2026-11-07', sec: 1300, got: 0 } }), saveProgress: async () => {} });
    const adds = [];
    HSC.coins = { add: (n, cat, key) => adds.push([n, key]) };
    let end;
    HSC.watchVideo = () => new Promise((r) => { end = r; });
    const a = HSC.gift.claim(true), b = HSC.gift.claim(true), c = HSC.gift.claim(false);
    assert.equal(await b, false, 'a second tap during the video claims nothing');
    assert.equal(await c, false, 'nor a plain claim');
    end(true);
    assert.equal(await a, 40, 'the first gift doubled');
    assert.deepEqual(adds, [[40, 'gift:2026-11-07:0']]);
    assert.equal(await HSC.gift.claim(false), 40, 'the second gift (1200 s) is then its own claim');
    assert.deepEqual(adds[1], [40, 'gift:2026-11-07:1']);
    passed++;
  }

  // ---------------- daily tasks: the tasks' own day; paid real work only ----------------
  {
    const { ctx, HSC, clock } = sandbox(T0);
    const client = { loadProgress: async (k) => (k === 'skin-fade-studio-progress-v1' ? { v: 1, tasks: { day: '2026-11-07', list: [{ k: 'customers', n: 4, claimed: false }, { k: 'tips', n: 0, claimed: false }, { k: 'fade', n: 0, claimed: false }] }, level: 2, lastJob: null } : { v: 1, cuts: 4, modes: { mode: 'requests' } }), saveProgress: async () => {} };
    await HSC.metaInit(client);
    const keys = [];
    HSC.coins = { add: (n, cat, key) => keys.push(key) };
    ctx.skinFadeStudio = { getState: () => ({ status: 'menu', jobId: 1 }), getView: () => ({}) };
    ctx.document.body = ctx.document.createElement();
    await new Promise((r) => setTimeout(r, 700)); // progress.js boots
    const d = HSC.meta.data;
    // an untouched customer (every stroke undone) does not count toward "customers"
    d.lastRound = { job: 3, key: 'job:x:n1', stars: 0, paid: 0 };
    HSC.onHaircutDone(job({ jobId: 3, cutStrokeCount: 99 }));
    d.lastRound = { job: 3, key: 'job:x:n1', stars: 0, paid: 0 }; // (the round itself re-scored it)
    assert.equal(HSC.tasks.list()[0].n, 4, 'an unpaid customer is not a customer done');
    HSC.onHaircutDone(job({ jobId: 4, hair: cut(300), cutStrokeCount: 2 }));
    assert.equal(HSC.tasks.list()[0].n, 5, 'a paid customer with real work is');
    // claimed after midnight: still the 7 November task, and the clock turned back brings no new tasks
    clock.at = T0 + DAY;
    assert.equal(HSC.tasks.claim(0), true);
    assert.equal(keys[keys.length - 1], 'goal:2026-11-07:customers', 'the claim is keyed by the tasks own day');
    clock.at = T0 - 2 * DAY;
    assert.equal(HSC.tasks.list()[0].claimed, true, 'turning the clock back does not deal the day again');
    passed++;
  }

  // ---------------- R1-1: the Rush time bonus is for 2 stars or more ----------------
  {
    const { HSC } = sandbox(T0);
    const M = HSC.meta, pays = [];
    HSC.econ = { ready: () => true, starting: () => false, balance: () => 0, demandMatch: () => false, earn: async () => ({}), payJob: async (k, j) => { pays.push(j); return { eco: {} }; } };
    M.data = { v: 1, cuts: 30, firstDay: '2026-11-01', modes: { mode: 'requests', job: null }, regulars: [], deck: {}, last: {} };
    const seen = [];
    HSC.modes.econJob = (s, stars) => { seen.push(stars); return { kind: 'rush', rushBonus: 12 }; }; // the clock full
    HSC.onHaircutDone(job({ jobId: 20, hair: cut(400) })); // no order in the sandbox: a plain 1 star
    assert.equal(seen[0], 1, 'the mode is told the stars');
    assert.equal(pays[0].stars, 1);
    assert.equal(pays[0].rushBonus, 0, 'a 1-star dab and Finish earns nothing from the clock');
    const src = fs.readFileSync(path.join(root, 'source/customers/modes.js'), 'utf8');
    assert.match(src, /if \(rush\.job === s\.jobId && stars >= 2 && worked\(s\)\) out\.rushBonus/, 'modes.js pays the bonus only from 2 stars');
    passed++;
  }

  // ---------------- R1-2: a scored job needs 20% of its own order; a small real job still counts ----------------
  {
    const { HSC } = sandbox(T0);
    HSC.meta.data = { v: 1, cuts: 30, modes: { mode: 'requests', job: null } };
    const target = grid(3); for (let i = 0; i < 1000; i++) target[i] = 1; // an order that takes 1000 cells down
    HSC.requestFor = () => ({ style: { id: 'x' }, target });
    const W = HSC.modes.worked;
    assert.equal(W(job({ hair: cut(60) })), false, 'one 60-cell dab on a 1000-cell order is not a job');
    assert.equal(W(job({ hair: cut(199) })), false, 'under a fifth of the order');
    assert.equal(W(job({ hair: cut(200) })), true, 'a fifth of the order is a job');
    const off = grid(); for (let i = 5000; i < 5400; i++) off[i] = 1;
    assert.equal(W(job({ hair: off })), false, 'cutting where the order does not ask is not the order');
    // a tiny order (40 cells): all of it done is a job, though under MIN_WORK
    const tiny = grid(3); for (let i = 0; i < 40; i++) tiny[i] = 1;
    HSC.requestFor = () => ({ style: { id: 'x' }, target: tiny });
    assert.equal(W(job({ hair: cut(40) })), true, 'a small order done in full counts');
    assert.equal(W(job({ hair: cut(7) })), false, 'a small order barely touched does not');
    // a Rescue (no order, the barber's judgment): MIN_WORK, or the whole of a smaller repair
    HSC.requestFor = () => null;
    HSC.gridUnpack = (str) => (str === 'T' ? (() => { const t = grid(3); for (let i = 0; i < 30; i++) t[i] = 1; return t; })() : null);
    HSC.meta.data.modes = { mode: 'fix', job: { n: 5, m: 'fix', st: 'fade', t: 'T' } };
    HSC.meta.data.cuts = 30;
    assert.equal(HSC.modes.current(), 'fix');
    assert.equal(W(job({ hair: cut(30) })), true, 'a perfect 30-cell rescue counts');
    assert.equal(W(job({ hair: cut(29) })), false);
    HSC.meta.data.modes = { mode: 'fix', job: null };
    assert.equal(W(job({ hair: cut(59) })), false, 'without a known repair: MIN_WORK');
    assert.equal(W(job({ hair: cut(60) })), true);
    passed++;
  }

  // ---------------- R1-5 / R2-1: an earned video's coins stay owed until they land ----------------
  {
    const { ctx, HSC, perf } = sandbox(T0);
    const M = HSC.meta;
    await HSC.metaInit({ loadProgress: async () => ({ v: 1, cuts: 4, modes: { mode: 'requests' } }), saveProgress: async () => {} });
    let starting = true, fail = false;
    const earned = [];
    HSC.econ = { ready: () => !starting, starting: () => starting, balance: () => 0, demandMatch: () => false, state: () => ({ keys: earned.slice() }),
      earn: async (k, c, n) => { if (fail) return null; if (earned.includes(k)) return { duplicate: true }; earned.push(k); return { eco: {}, txn: {} }; },
      triple: async (k) => { if (fail) return null; const t = k + ':triple'; if (!earned.includes(t)) earned.push(t); return { eco: {} }; },
      payJob: async (k) => { if (!earned.includes(k)) earned.push(k); return { eco: {} }; } };
    HSC.canVideo = () => true; HSC.watchVideo = async () => true;
    // (R1-5) during the journal load: the coins wait, and so does the debt
    const run = HSC.wishVideo.run();
    await new Promise((r) => setTimeout(r, 50));
    assert.ok(M.data.modes.wv.pend, 'still owed while the journal loads');
    assert.equal(HSC.wishVideo.state(), null, 'no second wish video while one is owed');
    starting = false;
    await new Promise((r) => setTimeout(r, 500)); // (the sandbox's timers do not hold the process open)
    await run;
    assert.equal(M.data.modes.wv.pend, null, 'paid once the journal is up');
    assert.deepEqual(earned, ['wish:2026-11-07:1']);
    // (R2-1) a failed commit keeps the debt; the retry pays it
    fail = true;
    await HSC.wishVideo.run();
    assert.equal(M.data.modes.wv.pend, 'wish:2026-11-07:2', 'a failed commit keeps the coins owed');
    fail = false;
    ctx.skinFadeStudio = { getState: () => ({ status: 'menu', jobId: 1 }), getView: () => ({}) };
    ctx.document.body = ctx.document.createElement();
    perf.t = 5000; // the retry is due
    await new Promise((r) => setTimeout(r, 900));
    assert.equal(M.data.modes.wv.pend, null, 'the retry paid them');
    assert.ok(earned.includes('wish:2026-11-07:2'));
    // (R2-1) a tripled tip whose commit failed: owed, paid by the retry, counted once
    M.data.lastRound = { job: 3, key: 'job:x:n5', stars: 2, tip: 10, video: 20, paid: 40, tripled: true };
    earned.push('job:x:n5');
    perf.t = 20000; await new Promise((r) => setTimeout(r, 300)); // (the retry runs only when due)
    assert.ok(!earned.includes('job:x:n5:triple'), 'nothing is retried before it is due');
    // a restart (recover at start) pays it
    const { ctx: c2, HSC: H2 } = sandbox(T0);
    const e2 = ['job:x:n5'];
    await H2.metaInit({ loadProgress: async () => ({ v: 1, cuts: 4, modes: { mode: 'requests' }, lastRound: { job: 3, key: 'job:x:n5', stars: 2, tip: 10, video: 20, paid: 40, tripled: true } }), saveProgress: async () => {} });
    H2.econ = { ready: () => true, starting: () => false, balance: () => 0, state: () => ({ keys: e2.slice() }), triple: async (k) => { e2.push(k + ':triple'); return { eco: {} }; }, earn: async () => ({}) };
    c2.skinFadeStudio = { getState: () => ({ status: 'menu', jobId: 1 }), getView: () => ({}) };
    c2.document.body = c2.document.createElement();
    await new Promise((r) => setTimeout(r, 900));
    assert.deepEqual(e2, ['job:x:n5', 'job:x:n5:triple'], 'the owed triple is committed at the next start');
    assert.equal(H2.meta.data.lastRound.paid, 60, 'and shown once');
    await new Promise((r) => setTimeout(r, 300));
    assert.equal(e2.length, 2, 'once only');
    passed++;
  }

  console.log('fix-modes: ' + passed + ' groups passed');
  done = true;
})().catch((e) => { console.error(e); process.exit(1); });
