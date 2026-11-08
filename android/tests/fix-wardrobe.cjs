'use strict';
// Fixes F3 (pure node, the real source files in a sandbox):
//   - the daily picks: the pick day never moves backwards, so turning the device date back and forth deals no new
//     items; each calendar day gives its two picks once at most, each for one completed rewarded video
//   - the result router: a rewarded video that never came on screen (no fill, no consent) leaves the result's break
//     to the interstitial; one that opened (watched or closed early) or paid out wins it; the earned value is unchanged
//   - a brow: a guard leaves the hair at its own length (guard 0 shaves, 1 trims, 2-4 leave a brow alone), and a
//     brow stroke is not the haircut (cutStrokeCount stays)
//   - the gown's redraw after a refit waits for the last finger on the game to lift (turn releases the pointer)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const src = (f) => fs.readFileSync(path.join(root, 'source/customers', f), 'utf8');
const tick = () => new Promise(setImmediate);

// ---------------- the daily picks under a changed clock ----------------
async function wardrobeCase() {
  let off = 0;
  const RD = Date;
  const FakeDate = class extends RD { constructor(...a) { if (!a.length) super(RD.now() + off); else super(...a); } static now() { return RD.now() + off; } };
  const doc = { documentElement: { style: { setProperty() {} } }, createElement: () => ({ getContext: () => null }), querySelector: () => null };
  const ctx = vm.createContext({ console: { log() {}, error() {}, warn() {} }, Date: FakeDate, innerWidth: 400, innerHeight: 800, document: doc, setTimeout, clearTimeout, addEventListener() {}, matchMedia: () => ({ matches: false }) });
  ctx.globalThis = ctx;
  vm.runInContext(src('catalog.js'), ctx);
  vm.runInContext(src('wardrobe.js'), ctx);
  let videos = 0, saved = null;
  const client = { rewardedSupported: true, async showRewarded() { videos++; return true; }, saveProgress: async (k, d) => { saved = JSON.parse(JSON.stringify(d)); }, sendAnalytics() {} };
  await ctx.HSC.wardrobeInit({ client, game: null, savedData: null });
  const A = ctx.HSC.wardrobeApi, DAY = 864e5;
  const got = new Set();
  const takeAll = async () => { for (const k of A.todays()) if (await A.take(k)) got.add(k); };
  // the auditor's sequence: today, tomorrow, back, tomorrow, the day after, back again
  for (const d of [0, 1, 0, 1, 2, 0]) { off = d * DAY; await takeAll(); }
  assert.equal(got.size, 6, 'three calendar days reached: two picks each, no more (was 12)');
  assert.equal(videos, 6, 'one completed video per item');
  off = 0;
  assert.deepEqual([...A.todays()].map((k) => A.owns(k)), [true, true], 'back on the real day the newest picks stay, already taken: nothing new');
  assert.equal(await A.take(A.todays()[0]), false, 'and nothing to take');
  // a restart with the clock still set back keeps the newest pick day
  const ctx2 = vm.createContext({ console: { log() {}, error() {}, warn() {} }, Date: FakeDate, innerWidth: 400, innerHeight: 800, document: doc, setTimeout, clearTimeout, addEventListener() {}, matchMedia: () => ({ matches: false }) });
  ctx2.globalThis = ctx2;
  vm.runInContext(src('catalog.js'), ctx2);
  vm.runInContext(src('wardrobe.js'), ctx2);
  await ctx2.HSC.wardrobeInit({ client, game: null, savedData: saved });
  const B = ctx2.HSC.wardrobeApi;
  assert.equal(await B.take(B.todays()[0]), false, 'after a restart: still nothing new on the turned-back date');
  // a real new day (after the furthest day seen) brings two new picks
  off = 3 * DAY;
  const fresh = B.todays();
  assert.deepEqual([...fresh].map((k) => B.owns(k)), [false, false], 'a later day deals two new picks');
  assert.equal(await B.take(fresh[0]), true); assert.equal(await B.take(fresh[1]), true);
  // without a video nothing is granted (earned-reward only)
  off = 4 * DAY;
  client.showRewarded = async () => false;
  const next = B.todays();
  assert.equal(await B.take(next[0]), false, 'a video that did not pay out grants nothing');
  assert.equal(B.owns(next[0]), false);
  // a malformed saved day is replaced
  await ctx2.HSC.wardrobeInit({ client, game: null, savedData: Object.assign({}, saved, { pick: Object.assign({}, saved.pick, { day: 'nonsense' }) }) });
  ctx2.HSC.wardrobeApi.todays();
  assert.notEqual(ctx2.HSC.wardrobe.data.pick.day, 'nonsense', 'a malformed pick day is dealt afresh');
  console.log('PASS: daily picks: turning the clock back and forth gives two items per calendar day at most; restarts keep the newest day; one paid-out video per item.');
}

// ---------------- the result router: only a video that showed wins the break ----------------
async function routerCase() {
  const make = () => {
    const ctx = vm.createContext({ console, setTimeout });
    ctx.globalThis = ctx;
    vm.runInContext(`
      var HSC = globalThis.HSC = { PHENOTYPES: {} };
      var st = { status: 'reveal', jobId: 1 };
      globalThis.skinFadeStudio = { getState: () => st };
      // the native transport's event entry, as android/native-transport.js defines it
      var events = [];
      globalThis.__androidHost = { ad(kind, state) { events.push(kind + ':' + state); } };
      var plan = 'nofill', earned = 0;
      HSC.watchVideo = async function () {
        if (plan === 'nofill') { __androidHost.ad('rewarded', 'failed'); return false; }
        __androidHost.ad('rewarded', 'opened');
        if (plan === 'watch') { __androidHost.ad('rewarded', 'rewarded'); earned++; }
        __androidHost.ad('rewarded', 'closed');
        return plan === 'watch';
      };
    `, ctx);
    vm.runInContext(src('ad-router.js'), ctx);
    return ctx;
  };
  {
    const c = make(), R = c.HSC.adRouter;
    R.completed(1, true);
    assert.equal(await c.HSC.watchVideo('triple-tips'), false);
    assert.equal(R.outcome(1), 'pending', 'no fill: the break stays for the interstitial');
    assert.equal(R.route(1), 'interstitial', 'Continue still attempts the interstitial');
    assert.deepEqual([...c.events], ['rewarded:failed'], 'the native events still reach the transport');
  }
  {
    const c = make(), R = c.HSC.adRouter;
    vm.runInContext("plan = 'close'", c);
    R.completed(1, true);
    assert.equal(await c.HSC.watchVideo('triple-tips'), false, 'closed early: no reward');
    assert.equal(R.outcome(1), 'rewarded', 'a video that opened wins the break');
    assert.equal(R.route(1), null);
  }
  {
    const c = make(), R = c.HSC.adRouter;
    vm.runInContext("plan = 'watch'", c);
    R.completed(1, true);
    assert.equal(await c.HSC.watchVideo('triple-tips'), true, 'the earned value is handed back unchanged');
    assert.equal(c.earned, 1, 'one earned callback');
    assert.equal(R.outcome(1), 'rewarded');
    assert.equal(R.route(1), null);
  }
  {
    // a video asked for off the result (the wardrobe mid-cut) never touches a break
    const c = make(), R = c.HSC.adRouter;
    vm.runInContext("plan = 'watch'; st = { status: 'cutting', jobId: 2 }", c);
    R.completed(1, true);
    await c.HSC.watchVideo('unlock-item');
    assert.equal(R.outcome(1), 'pending');
    // and an 'opened' with no video asked for through the game is ignored
    vm.runInContext("st = { status: 'reveal', jobId: 1 }", c);
    c.__androidHost.ad('rewarded', 'opened');
    assert.equal(R.outcome(1), 'pending');
  }
  console.log('PASS: result router: a rewarded video that never showed keeps the interstitial; one that opened or paid out wins the break; earned callbacks unchanged.');
}

// ---------------- the brow ----------------
function browCase() {
  const ctx = vm.createContext({ console });
  ctx.globalThis = ctx;
  vm.runInContext(`var HSC = globalThis.HSC = { BEARD_MM: [0, 1], GUARD_MM: { 0: 0.5, 1: 3, 2: 6, 3: 10, 4: 13 }, BROW_N: 4096 };`, ctx);
  vm.runInContext(src('state.js'), ctx);
  const H = ctx.HSC;
  H.browCells = () => true;
  let shown = null;
  H.setBrow = (b) => { shown = b; };
  const L = H.browByGuard;
  assert.deepEqual([0, 1, 2, 3, 4].map((g) => L(2, g)), [0, 1, 2, 2, 2], 'a full brow: guard 0 shaves, 1 trims, 2-4 leave it');
  assert.deepEqual([0, 1, 2, 3, 4].map((g) => L(1, g)), [0, 1, 1, 1, 1], 'a trimmed brow only goes shorter with guard 0');
  assert.deepEqual([0, 1, 2, 3, 4].map((g) => L(0, g)), [0, 0, 0, 0, 0], 'a shaved brow stays shaved');
  const s = (g) => ({ status: 'cutting', interactionMode: 'cut', selectedGuard: g, brow: new Array(4096).fill(2), cutStrokeCount: 0, jobId: 1 });
  const stroke = [{ u: 0.3, v: 0.5 }, { u: 0.2, v: 0.5 }];
  for (const g of [2, 3, 4]) {
    const r = H.cutBrow(s(g), stroke);
    assert.equal(r.changed, false, 'guard ' + g + ' on a brow changes nothing');
    assert.equal(r.state.cutStrokeCount, 0);
  }
  for (const [g, lvl] of [[0, 0], [1, 1]]) {
    const r = H.cutBrow(s(g), stroke);
    assert.equal(r.changed, true, 'guard ' + g + ' reaches the brow');
    assert(r.state.brow.some((v) => v === lvl) && r.state.brow.every((v) => v === lvl || v === 2));
    assert.equal(r.state.cutStrokeCount, 0, 'a brow stroke is not the haircut');
    assert.equal(shown, r.state.brow, 'the brow is drawn as cut');
  }
  console.log('PASS: brows: guard 0 shaves, guard 1 trims, guards 2-4 leave a brow alone; brow strokes do not count as the haircut.');
}

// ---------------- the gown's redraw never ends a drag ----------------
async function gownCase() {
  const listeners = {};
  let frame = null;
  const ctx = vm.createContext({ console: { log() {}, error() {}, warn() {} }, setTimeout, addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); }, requestAnimationFrame: (f) => { frame = f; } });
  ctx.globalThis = ctx;
  // only the redraw path is exercised: the fit itself needs three.js and is stubbed out by an early failure
  vm.runInContext(`var HSC = globalThis.HSC = { PHENOTYPES: {}, view: { clipperScreen: () => ({ visible: false }) } };`, ctx);
  try { vm.runInContext(src('gown.js'), ctx); } catch (e) { /* needs the engine's three.js; the morph hook is set first if at all */ }
  if (typeof ctx.HSC.onMorph !== 'function') { console.log('SKIP: gown.js needs the engine to load in node'); return; }
  let turns = 0;
  ctx.skinFadeStudio = { turn: () => { turns++; }, getState: () => ({ status: 'cutting' }) };
  const fire = (t, e) => (listeners[t] || []).forEach((f) => f(e));
  const scene = { closest: (q) => (q === '#scene' ? scene : null) };
  fire('pointerdown', { pointerId: 7, target: scene }); // a rotate drag: the clipper is not shown
  ctx.HSC.onMorph(null, null, null);
  frame();
  assert.equal(turns, 0, 'no redraw while a finger is on the game (a rotate drag)');
  fire('pointerup', { pointerId: 7 });
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(turns, 1, 'the frame is asked for once the finger lifts');
  ctx.HSC.onMorph(null, null, null); frame();
  assert.equal(turns, 2, 'with no finger down it redraws at once');
  console.log('PASS: gown redraw: never during a drag; once the last finger lifts.');
}

(async () => {
  await wardrobeCase();
  await routerCase();
  browCase();
  await gownCase();
})().catch((error) => { console.error(error); process.exitCode = 1; });
