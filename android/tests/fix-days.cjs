'use strict';
// Fixes G1b (pure node, the real source files in a sandbox): the game's day under a wrong clock, both directions.
//   - a clock set forward once (a wrong boot date, a trip) no longer locks the daily limits: once the clock is put
//     right the real day comes back at once, and the days used while the clock was ahead stay used when real time
//     reaches them (gifts, wish / practice videos, Quick Play pay, the daily VIP)
//   - a date one or two days back keeps the day; setting the clock back with no jump before deals no old days
//   - however the clock is moved back and forth (and the game restarted), no calendar day gives its limits twice
//   - the day book stays bounded and is sanitized in the save
//   - the daily VIP follows the game's day, not the device's date
//   - the gift counts as taken only once its coins landed; a doubling video already watched is not lost
//   - the wardrobe's two daily picks: the same robust day; a corrected clock gets its picks back, no day deals twice
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const src = (f) => fs.readFileSync(path.join(root, 'source/customers', f), 'utf8');
let passed = 0;

const DAY = 86400000, T0 = Date.UTC(2026, 10, 7, 12); // noon, 7 November 2026
const key = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function sandbox(now, files = ['economy.js', 'meta.js', 'session.js']) {
  const RD = Date;
  const clock = { at: now };
  const FakeDate = class extends RD { constructor(...a) { if (!a.length) super(clock.at); else super(...a); } static now() { return clock.at; } };
  const un = (t) => { if (t && t.unref) t.unref(); return t; };
  const el = () => ({ style: { setProperty() {} }, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, append() {}, appendChild() {}, addEventListener() {}, querySelector: () => el(), querySelectorAll: () => [], setAttribute() {}, getBoundingClientRect: () => ({}), getContext: () => null });
  const doc = { body: null, head: el(), hidden: false, visibilityState: 'visible', documentElement: el(), createElement: el, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
  const ctx = vm.createContext({ console: { log() {}, error() {}, warn() {} }, Date: FakeDate, document: doc, innerWidth: 400, innerHeight: 800, matchMedia: () => ({ matches: false }), setTimeout: (f, ms) => un(setTimeout(f, ms)), clearTimeout, setInterval: (f, ms) => un(setInterval(f, ms)), clearInterval, addEventListener() {}, performance: { now: () => 0 } });
  ctx.globalThis = ctx;
  ctx.HSC = { PHENOTYPES: { decks: {} } };
  for (const f of files) vm.runInContext(src(f), ctx);
  return { ctx, HSC: ctx.HSC, clock };
}
// a meta save loaded through the real sanitizer (a restart)
async function boot(HSC, saved) {
  let last = null;
  const client = { loadProgress: async () => (saved ? JSON.parse(JSON.stringify(saved)) : null), saveProgress: async (k, d) => { last = JSON.parse(JSON.stringify(d)); } };
  await HSC.metaInit(client);
  return { saved: () => last || JSON.parse(JSON.stringify(HSC.meta.data)) };
}
// use every daily limit the way requests.js / session.js / meta.js do, and count what each calendar day gave
function useAll(HSC, tally) {
  const M = HSC.meta, d = M.data, day = M.today();
  d.modes = d.modes || { mode: 'requests' };
  if (!d.gift || d.gift.day !== day) d.gift = { day, sec: 0, got: 0 };
  const t = tally[day] || (tally[day] = { gift: 0, wv: 0, qp: 0, pv: 0, vip: 0 });
  if (d.gift.got < 3) { t.gift += 3 - d.gift.got; d.gift.got = 3; d.gift.sec = 1800; }
  for (const [k, cap] of [['wv', 3], ['qp', 5], ['pv', 2]]) {
    if (!d.modes[k] || d.modes[k].day !== day) d.modes[k] = { day, n: 0 };
    if (d.modes[k].n < cap) { t[k] += cap - d.modes[k].n; d.modes[k].n = cap; }
  }
  if (d.dailyDay !== day && d.firstDay !== day) { t.vip++; d.dailyDay = day; }
  M.save();
  return day;
}
const once = (tally) => { for (const [day, t] of Object.entries(tally)) assert.ok(t.gift <= 3 && t.wv <= 3 && t.qp <= 5 && t.pv <= 2 && t.vip <= 1, 'one day of limits at most for ' + day + ': ' + JSON.stringify(t)); };

(async () => {
  // ---------------- a wrong boot date ahead, put right by the network ----------------
  {
    const { HSC, clock } = sandbox(T0 - 5 * DAY);
    await boot(HSC, { v: 1, cuts: 4, firstDay: '2026-10-20' });
    const tally = {};
    for (let i = 5; i >= 1; i--) { clock.at = T0 - i * DAY; useAll(HSC, tally); } // played every day up to yesterday
    clock.at = T0; useAll(HSC, tally); // the real today, used up
    clock.at = T0 + 30 * DAY; // the phone boots with a date a month ahead and the player plays
    assert.equal(HSC.meta.today(), key(T0 + 30 * DAY));
    useAll(HSC, tally);
    clock.at = T0 + 2 * 3600e3; // the clock is put right two hours later
    assert.equal(HSC.meta.today(), key(T0), 'the real day comes back at once (was locked for a month)');
    assert.equal(HSC.gift && HSC.gift.state().done, true, 'and today stays used up: its gifts were already taken');
    useAll(HSC, tally);
    assert.equal(tally[key(T0)].gift, 3, 'today gave its gifts once');
    clock.at = T0 + DAY;
    assert.equal(HSC.meta.today(), key(T0 + DAY), 'the next real day');
    assert.equal(HSC.gift.state().done, false, 'opens every limit again');
    useAll(HSC, tally);
    for (let i = 2; i <= 31; i++) { clock.at = T0 + i * DAY; useAll(HSC, tally); }
    assert.deepEqual(tally[key(T0 + 30 * DAY)], { gift: 3, wv: 3, qp: 5, pv: 2, vip: 1 }, 'the day used while the clock was ahead gave nothing more when real time reached it');
    clock.at = T0 + 30 * DAY;
    assert.equal(HSC.meta.today(), key(T0 + 31 * DAY), 'a day back keeps the day');
    once(tally);
    passed++;
  }

  // ---------------- small set-backs, set-backs with no jump, and a time zone ----------------
  {
    const { HSC, clock } = sandbox(T0);
    await boot(HSC, { v: 1, cuts: 4, firstDay: '2026-10-01' });
    const tally = {};
    for (let i = -10; i <= 0; i++) { clock.at = T0 + i * DAY; useAll(HSC, tally); }
    for (const back of [1, 2]) { clock.at = T0 - back * DAY; assert.equal(HSC.meta.today(), key(T0), 'one or two days back (a time zone): the day stays'); }
    clock.at = T0 - 4 * DAY;
    assert.equal(HSC.meta.today(), key(T0 - 4 * DAY), 'a played day further back may come back...');
    assert.equal(HSC.gift.state().done, true, '...with what was used on it');
    clock.at = T0 - 40 * DAY;
    assert.equal(HSC.meta.today(), key(T0 - 4 * DAY), 'a day before anything played (no jump ahead first) is not dealt');
    clock.at = T0 + 3600e3;
    assert.equal(HSC.meta.today(), key(T0), 'back to the real day: still used up');
    useAll(HSC, tally);
    once(tally);
    passed++;
  }

  // ---------------- the clock moved back and forth at random, with restarts: never two days' limits ----------------
  {
    let seed = 12345;
    const rnd = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296);
    for (let run = 0; run < 40; run++) {
      let { HSC, clock } = sandbox(T0);
      let b = await boot(HSC, { v: 1, cuts: 4, firstDay: '2026-09-01' });
      const tally = {};
      let real = T0;
      for (let step = 0; step < 300; step++) {
        const r = rnd();
        if (r < 0.15) real += DAY; // real time goes on
        const off = r < 0.55 ? 0 : Math.round((rnd() - 0.4) * 80) * DAY; // the clock right, or wrong by up to +-40 days
        clock.at = real + off + Math.round(rnd() * 20) * 3600e3;
        useAll(HSC, tally);
        if (rnd() < 0.05) { const s = b.saved(); ({ HSC, clock } = sandbox(clock.at)); b = await boot(HSC, s); }
      }
      once(tally);
      const d = HSC.meta.data;
      assert.ok(d.days.log.length <= 32, 'the day book stays bounded');
      assert.ok(JSON.stringify(d.days).length < 32 * 400, 'and small');
      // with the clock right, the real day is in use within a day of a correction (never locked for weeks)
      clock.at = real + 4 * DAY;
      const day = HSC.meta.today();
      assert.ok(HSC.dayBook.num(key(real + 4 * DAY)) - HSC.dayBook.num(day) <= 2 || HSC.dayBook.num(day) > HSC.dayBook.num(key(real + 4 * DAY)), 'not stuck in the past');
    }
    passed++;
  }

  // ---------------- the day book in the save is sanitized ----------------
  {
    const { HSC } = sandbox(T0);
    const junkLog = [{ day: '2026-11-01', gift: { day: '2026-11-01', sec: 99, got: 2 }, wv: { day: '2026-10-01', n: 3 }, vip: 'yes', x: { tasks: { day: '2026-11-01', list: [] }, BAD: { day: '2026-11-01' }, big: { day: '2026-11-01', s: 'x'.repeat(900) } } },
      { day: '2026-11-01', gift: { day: '2026-11-01', got: 0 } }, { day: 'nonsense' }, null, 7, { day: '2026-11-07' }].concat(Array.from({ length: 60 }, (_, i) => ({ day: key(T0 - (i + 20) * DAY) })));
    await boot(HSC, { v: 1, cuts: 4, maxDay: '2026-11-07', days: { low: 'x', floor: -3, log: junkLog } });
    const B = HSC.meta.data.days;
    assert.equal(B.low, null); assert.equal(B.floor, null);
    assert.ok(B.log.length <= 32, 'at most 32 records');
    assert.ok(B.log.every((e) => /^\d{4}-\d\d-\d\d$/.test(e.day)), 'only real days');
    assert.equal(B.log.filter((e) => e.day === '2026-11-07').length, 0, 'never the current day');
    assert.equal(new Set(B.log.map((e) => e.day)).size, B.log.length, 'one record a day');
    await boot(HSC, { v: 1, cuts: 4, maxDay: '2026-11-07', days: { low: null, floor: null, log: junkLog.slice(0, 3) } });
    const e = HSC.meta.data.days.log.find((x) => x.day === '2026-11-01');
    assert.deepEqual(JSON.parse(JSON.stringify(e)), { day: '2026-11-01', gift: { day: '2026-11-01', sec: 99, got: 2 }, x: { tasks: { day: '2026-11-01', list: [] } } }, 'a record keeps only its own day\'s limits, small and well formed');
    // an old save (no book) still starts from the latest day its limits were counted on, and keeps it on a set-back
    await boot(HSC, { v: 1, cuts: 4, gift: { day: '2026-11-09', sec: 1800, got: 3 } });
    assert.equal(HSC.meta.data.maxDay, '2026-11-09');
    passed++;
  }

  // ---------------- the daily VIP follows the game's day (not the device's date) ----------------
  {
    const { HSC, clock } = sandbox(T0);
    HSC.rng = () => ({ next: () => 0.5, pick: (a) => a[0], int: (a) => a });
    HSC.validPerson = () => false;
    HSC.selectPerson = (s) => ({ seed: s, bald: { norwood: '1', type: 'none' }, beard: { style: 'clean' } });
    HSC.makePerson = HSC.selectPerson;
    await boot(HSC, { v: 1, cuts: 4, firstDay: '2026-10-01' });
    const fin = (job) => (HSC.meta.data.runs = {}, HSC.meta.onFinish)({ jobId: job, seed: 99 + job, cutStrokeCount: 0 });
    clock.at = T0; HSC.meta.today();
    fin(1);
    assert.equal(HSC.meta.data.queue.person.daily, key(T0), 'the day\'s VIP');
    HSC.meta.data.queue = null;
    clock.at = T0 - DAY; // a time zone west: the game's day stays
    fin(2);
    assert.notEqual(HSC.meta.data.queue.person.daily, key(T0 - DAY), 'no VIP for the device\'s earlier date');
    assert.equal(HSC.meta.data.queue.person.vip, undefined, 'and no second VIP on the same game day');
    HSC.meta.data.queue = null;
    clock.at = T0 + 20 * DAY; fin(3); HSC.meta.data.queue = null; // ahead: that day's VIP
    clock.at = T0 + 3600e3; fin(4); // put right: today's VIP was already given
    assert.equal(HSC.meta.data.queue.person.vip, undefined, 'a corrected clock does not give today\'s VIP again');
    HSC.meta.data.queue = null;
    clock.at = T0 + DAY; fin(5);
    assert.equal(HSC.meta.data.queue.person.daily, key(T0 + DAY), 'the next real day has its VIP at once (was locked for 20 days)');
    passed++;
  }

  // ---------------- the gift counts only when its coins landed ----------------
  {
    const { HSC } = sandbox(T0);
    await boot(HSC, { v: 1, cuts: 4, gift: { day: '2026-11-07', sec: 1300, got: 0 } });
    const adds = [];
    let result = null;
    HSC.coins = { add: async (n, cat, k) => { adds.push([n, k]); if (result instanceof Error) throw result; return result; } };
    let videos = 0;
    HSC.watchVideo = async () => { videos++; return true; };
    assert.equal(await HSC.gift.claim(true), false, 'the coin commit failed (null): not taken');
    assert.equal(HSC.meta.data.gift.got, 0, 'the gift stays to take');
    assert.equal(HSC.meta.data.gift.dbl, 0, 'with its doubling video remembered');
    result = { error: 'busy' };
    assert.equal(await HSC.gift.claim(false), false, 'a refused credit: not taken either');
    result = new Error('io');
    assert.equal(await HSC.gift.claim(true), false, 'a thrown credit: not taken');
    assert.equal(videos, 1, 'the retries asked for no new video');
    result = { eco: {}, txn: {} };
    assert.equal(await HSC.gift.claim(false), 40, 'the retry pays the doubled gift once the credit lands');
    assert.ok(adds.every(([n, k]) => n === 40 && k === 'gift:2026-11-07:0'), 'always the same key, so it is paid once');
    assert.equal(HSC.meta.data.gift.got, 1); assert.equal(HSC.meta.data.gift.dbl, undefined);
    result = { eco: {}, duplicate: true };
    assert.equal(await HSC.gift.claim(false), 40, 'a credit already in the ledger (duplicate) counts as landed');
    HSC.coins = { add: () => undefined }; // the local purse: credited at once, nothing returned
    HSC.meta.data.gift.sec = 1800;
    assert.equal(await HSC.gift.claim(false), 60, 'the local purse counts it at once');
    assert.equal(HSC.gift.state().done, true);
    passed++;
  }

  // ---------------- the wardrobe's daily picks ----------------
  {
    const { HSC, clock } = sandbox(T0, ['catalog.js', 'economy.js', 'meta.js', 'wardrobe.js']);
    let saved = null;
    const client = { rewardedSupported: true, async showRewarded() { return true; }, saveProgress: async (k, d) => { if (k !== 'skin-fade-studio-meta-v1') saved = JSON.parse(JSON.stringify(d)); }, sendAnalytics() {} };
    await HSC.wardrobeInit({ client, game: null, savedData: null });
    let A = HSC.wardrobeApi;
    const dealt = {}; // calendar day -> designs granted
    const take = async () => { for (const k of A.todays()) if (await A.take(k)) { const day = HSC.wardrobe.data.pick.day; (dealt[day] || (dealt[day] = [])).push(k); } };
    clock.at = T0; await take();
    clock.at = T0 + 30 * DAY; await take(); // a wrong boot date a month ahead
    clock.at = T0 + 3600e3; // put right
    assert.equal(A.todays().every((k) => A.owns(k)), true, 'the real day\'s picks come back, already taken');
    clock.at = T0 + DAY;
    assert.deepEqual([...A.todays()].map((k) => A.owns(k)), [false, false], 'the next real day deals two new picks at once (was locked for a month)');
    await take();
    // random toggling with restarts
    let seed = 99, real = T0 + DAY;
    const rnd = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296);
    for (let step = 0; step < 400; step++) {
      if (rnd() < 0.12) real += DAY;
      clock.at = real + (rnd() < 0.5 ? 0 : Math.round((rnd() - 0.4) * 60) * DAY);
      await take();
      if (rnd() < 0.05) { await HSC.wardrobeInit({ client, game: null, savedData: JSON.parse(JSON.stringify(saved)) }); A = HSC.wardrobeApi; }
    }
    for (const [day, ks] of Object.entries(dealt)) assert.ok(ks.length <= 2, 'two picks a calendar day at most: ' + day + ' ' + ks);
    assert.ok(HSC.wardrobe.data.days.log.length <= 32, 'bounded');
    // the saved book is sanitized
    await HSC.wardrobeInit({ client, game: null, savedData: Object.assign({}, saved, { days: { low: 3.5, floor: 'x', log: [{ day: '2026-1-1', clipper: 'nope', gown: 'nope' }, 5].concat(saved.days.log) } }) });
    const B = HSC.wardrobe.data.days;
    assert.equal(B.low, null); assert.equal(B.floor, null);
    assert.ok(B.log.every((e) => HSC.catalog.byKey.has(e.clipper) && HSC.catalog.byKey.has(e.gown)), 'only real designs');
    passed++;
  }

  console.log(`PASS: fix-days ${passed}/7: a wrong clock in either direction never locks the daily limits for long and never gives a calendar day twice (gifts, videos, Quick Play, the daily VIP, the two daily picks); the gift counts only once its coins landed.`);
})().catch((e) => { console.error(e); process.exit(1); });
