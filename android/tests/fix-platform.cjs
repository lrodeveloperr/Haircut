'use strict';
// Platform fixes (F4), pure node: graphics recovery after a second context loss, a save that cannot stop all
// saving, a prompt answer to an ad tap while a save hangs, the web page lifecycle and one-tab guard of the
// standalone web target (absent from Android), and the privacy action on a host without AndroidHost.
// Round 2 (G3): the one-tab guard claims only in view and a paused tab is inert (R3-1); restore carries brows (R2-4).
// Run after the full build (source/build, source/build-youtube): node android/tests/fix-platform.cjs
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const results = [];
async function test(name, fn) {
  try { await fn(); results.push(name); console.log('PASS ' + name); }
  catch (e) { console.log('FAIL ' + name + '\n' + (e.stack || e)); process.exitCode = 1; }
}
const flushMicro = async () => { for (let i = 0; i < 50; i++) await Promise.resolve(); };

// A fake clock, document and window for the save clients.
function world() {
  let time = 0, seq = 0;
  const timers = new Map(), docListeners = {}, winListeners = {}, channels = [];
  const on = store => (type, fn) => { (store[type] ||= new Set()).add(fn); };
  const off = store => (type, fn) => store[type]?.delete(fn);
  const document = { visibilityState: 'visible', documentElement: { classList: { toggle() {}, remove() {} } }, body: { inert: false },
    addEventListener: on(docListeners), removeEventListener: off(docListeners) };
  const location = { reloads: 0, reload() { this.reloads++; } };
  const storage = new Map();
  class BroadcastChannel {
    constructor(name) { this.name = name; channels.push(this); }
    postMessage(data) { for (const c of channels) if (c !== this && c.name === this.name && !c.closed) Promise.resolve().then(() => c.onmessage?.({ data })); }
    close() { this.closed = true; }
  }
  const ctx = { console, TextEncoder, document, location, BroadcastChannel, Date: { now: () => 1e12 + time },
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
    HSC: {}, performance: { now: () => time },
    setTimeout(fn, ms) { const id = ++seq; timers.set(id, { fn, at: time + (ms || 0) }); return id; },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(fn) { return ctx.setTimeout(fn, 16); }, cancelAnimationFrame(id) { timers.delete(id); },
    addEventListener: on(winListeners), removeEventListener: off(winListeners) };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  return { ctx, document, location, storage, channels,
    fire(target, type, event = {}) { for (const fn of [...((target === 'doc' ? docListeners : winListeners)[type] || [])]) fn(event); },
    async advance(ms) { const end = time + ms; for (;;) { const due = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0]; if (!due) break; time = due[1].at; timers.delete(due[0]); due[1].fn(); await flushMicro(); } time = end; await flushMicro(); } };
}

// ---- C3 and L5 in the shared client (source/youtube/client.js, as the YouTube release uses it) ----
function youtube(options = {}) {
  const w = world(), calls = [];
  let raw = options.saved ?? '';
  w.ctx.ytgame = { IN_PLAYABLES_ENV: true,
    system: { isAudioEnabled: () => true, getLanguage: async () => 'en', onPause: () => () => {}, onResume: () => () => {}, onAudioEnabledChange: () => () => {} },
    game: { async loadData() { return raw; }, async saveData(v) { calls.push('write'); if (options.write) await options.write(v); raw = v; }, gameReady() {}, homeReady() {} },
    ads: { async requestRewardedAd() { calls.push('rewarded'); return true; }, async requestInterstitialAd() {} },
    health: { logWarning() {} } };
  vm.runInContext(read('source/youtube/client.js'), w.ctx);
  return Object.assign(w, { calls, raw: () => raw, create: () => w.ctx.HSC.createYouTubeClient() });
}
const LIMIT = 3 * 1024 * 1024;

(async () => {
await test('C3: an oversized slot is refused before it enters the save; every other slot keeps saving', async () => {
  const f = youtube(), c = await f.create();
  await c.loadProgress('a', null);
  await c.saveProgress('a', { v: 1 });
  await assert.rejects(c.saveProgress('big', 'x'.repeat(LIMIT)), e => e.code === 'SAVE_TOO_LARGE');
  await assert.rejects(c.saveProgress('a', 'x'.repeat(LIMIT)), e => e.code === 'SAVE_TOO_LARGE');
  await c.saveProgress('b', { v: 2 });
  await c.flushProgress();
  const saved = JSON.parse(f.raw()).slots;
  assert.deepEqual(saved, { a: { v: 1 }, b: { v: 2 } }, 'the refused slots keep their last value');
});
await test('C3: the size check is exact: one byte under the limit saves, the limit itself is refused', async () => {
  for (const extra of [{}, { other: { list: [1, 2, 3], s: 'é✂' } }]) {
    const f = youtube({ saved: JSON.stringify({ version: 1, slots: extra }) }), c = await f.create();
    await c.loadProgress('k', null);
    const plain = s => new TextEncoder().encode(JSON.stringify({ version: 1, slots: Object.assign({}, extra, { k: s }) })).byteLength;
    const fill = n => 'é'.repeat(Math.floor(n / 2)) + 'y'.repeat(n % 2);
    const fits = fill(LIMIT - 1 - plain(''));
    assert.equal(plain(fits), LIMIT - 1);
    await c.saveProgress('k', fits);
    const over = fill(LIMIT - plain(''));
    assert.equal(plain(over), LIMIT);
    await assert.rejects(c.saveProgress('k', over), e => e.code === 'SAVE_TOO_LARGE');
    assert.equal(JSON.parse(f.raw()).slots.k, fits, 'the slot keeps the last value that fitted');
    await c.saveProgress('k', 'small');
    await c.deleteProgress('k');
    await c.saveProgress('k2', fill(LIMIT - 1 - plain('') - 1)); // fits once k is gone (key k2 is one byte longer)
  }
});
await test('C3: saves queued behind a slow write cannot let the oversized slot block the others', async () => {
  let release;
  const f = youtube({ write: () => new Promise(r => { release = r; }) }), c = await f.create();
  await c.loadProgress('a', null);
  const first = c.saveProgress('a', 1);
  await flushMicro();
  const big = c.saveProgress('big', 'x'.repeat(LIMIT)).catch(e => e.code);
  const small = c.saveProgress('small', 2);
  release(); await first;     // the slow write ends
  await flushMicro(); release(); await small; // the next queued write
  assert.equal(await big, 'SAVE_TOO_LARGE');
  assert.deepEqual(JSON.parse(f.raw()).slots, { a: 1, small: 2 });
});
await test('C3: a failed write still keeps its slot for the next save (unchanged)', async () => {
  let fail = true;
  const f = youtube({ write: async () => { if (fail) throw Error('write'); } }), c = await f.create();
  await c.loadProgress('a', null);
  await assert.rejects(c.saveProgress('a', 8), /write/);
  fail = false; await c.saveProgress('b', 1);
  assert.equal(JSON.parse(f.raw()).slots.a, 8);
});
await test('L5: a pre-ad save that hangs refuses the ad after 5 s; the ad is never requested', async () => {
  let release = null;
  const f = youtube({ write: () => new Promise(r => { release = r; }) }), c = await f.create();
  await c.loadProgress('a', null);
  let result = 'pending';
  c.showRewarded('unlock-item').then(v => { result = v; });
  await f.advance(4900); assert.equal(result, 'pending');
  await f.advance(200); assert.equal(result, false);
  assert.equal(f.calls.filter(x => x === 'rewarded').length, 0);
  release(); await flushMicro();
  // the save itself carried on; the next tap with a working save plays the ad
  const g = youtube(), d = await g.create(); await d.loadProgress('a', null);
  assert.equal(await d.showRewarded('unlock-item'), true);
});

// ---- L4: the standalone web target, and the Android build without it ----
const youtubeBuild = path.join(root, 'source/build-youtube');
await test('L4: Android build has no web page lifecycle; the shared fixes are present', async () => {
  const android = read('source/build/runtime/android-client.js');
  assert(!/web-only|visibilitychange|BroadcastChannel|pagehide|otherTab/.test(android));
  assert(android.includes('await withinTime(flush(), AD_SAVE_MS);'));
  assert(android.includes("HSC.android.onPause(value => {"));
});
let web = null;
if (fs.existsSync(path.join(youtubeBuild, 'runtime/youtube-client.js'))) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-platform-'));
  execFileSync('python3', [path.join(root, 'source/youtube/sites-preview.py'), youtubeBuild, path.join(out, 'sites')], { stdio: 'pipe' });
  web = fs.readFileSync(path.join(out, 'sites/runtime/local-preview-client.js'), 'utf8');
  fs.rmSync(out, { recursive: true, force: true });
}
function webClient(w) {
  vm.runInContext(web, w.ctx);
  const game = { paused: null, flushed: 0, setPaused(v) { this.paused = v; }, setAudioEnabled() {}, flush() { this.flushed++; return Promise.resolve(); } };
  return { game, async create() { const c = await w.ctx.HSC.createLocalPreviewClient({ preload: true }); await c.loadProgress('a', null); c.bindGame(game); c.finishStartup(); return c; } };
}
await test('L4: web target pauses and saves on hide, freeze and pagehide; resumes when shown', async () => {
  assert(web, 'source/build-youtube is needed (run the full build first)');
  const w = world(), { game, create } = webClient(w), c = await create();
  await c.saveProgress('a', 1);
  const writes = () => w.storage.has('asmr-barber-youtube-save-v1');
  assert.equal(w.ctx.HSC.executionPaused, false);
  for (const [target, type] of [['doc', 'visibilitychange'], ['doc', 'freeze'], ['win', 'pagehide']]) {
    w.storage.clear(); const flushed = game.flushed;
    if (type === 'visibilitychange') w.document.visibilityState = 'hidden';
    w.fire(target, type, { persisted: false }); await flushMicro();
    assert.equal(w.ctx.HSC.executionPaused, true, type + ' pauses'); assert.equal(w.document.body.inert, true);
    assert.equal(game.flushed, flushed + 1, type + ' flushes'); assert(writes(), type + ' writes the save');
    w.document.visibilityState = 'visible';
    w.fire(type === 'freeze' ? 'doc' : target === 'win' ? 'win' : 'doc', type === 'freeze' ? 'resume' : type === 'pagehide' ? 'pageshow' : 'visibilitychange', { persisted: false });
    assert.equal(w.ctx.HSC.executionPaused, false, type + ' resumes'); assert.equal(game.paused, false);
  }
  w.fire('win', 'pageshow', { persisted: true });
  assert.equal(w.location.reloads, 1, 'a page restored from the back-forward cache reloads its saves');
  c.destroy();
});
await test('L4: a page that starts hidden waits; a resume while still hidden keeps it paused', async () => {
  const w = world(); w.document.visibilityState = 'hidden';
  const { create } = webClient(w);
  let c = null; const starting = create().then(v => { c = v; });
  await flushMicro();
  assert.equal(w.ctx.HSC.executionPaused, true); assert.equal(c, null, 'startup (and its save read) waits while hidden');
  w.fire('doc', 'resume'); await flushMicro(); assert.equal(w.ctx.HSC.executionPaused, true);
  w.document.visibilityState = 'visible'; w.fire('doc', 'visibilitychange');
  await starting; assert.equal(w.ctx.HSC.executionPaused, false);
  c.destroy();
});
await test('L4: one tab at a time: the older tab pauses and stops writing, reloads when shown or clicked', async () => {
  // both tabs share one BroadcastChannel world and one storage
  const w = world(), older = webClient(w), a = await older.create();
  const HSCa = w.ctx.HSC;
  const w2 = world(); w2.ctx.BroadcastChannel = w.ctx.BroadcastChannel; w2.ctx.localStorage = w.ctx.localStorage;
  w2.ctx.Date = { now: () => 2e12 }; // the newer tab claims later
  const newer = webClient(w2), b = await newer.create();
  await flushMicro();
  assert.equal(HSCa.otherTab, true); assert.equal(w2.ctx.HSC.otherTab, undefined, 'the newer tab plays');
  assert.equal(older.game.paused, true, 'the older tab pauses');
  w.storage.clear();
  await a.saveProgress('a', 'old'); await a.flushProgress();
  assert(!w.storage.has('asmr-barber-youtube-save-v1'), 'the older tab writes nothing');
  await b.saveProgress('a', 'new');
  assert(w.storage.has('asmr-barber-youtube-save-v1'));
  w.fire('win', 'focus'); assert.equal(w.location.reloads, 1, 'clicking the older tab reloads it with the latest saves');
  w.fire('doc', 'visibilitychange'); assert.equal(w.location.reloads, 1, 'reloads once');
  a.destroy(); b.destroy();
});
await test('L4: two tabs that claim at once settle on one player', async () => {
  const w = world(), w2 = world();
  w2.ctx.BroadcastChannel = w.ctx.BroadcastChannel;
  const one = webClient(w), two = webClient(w2);
  // the same Date.now(): the id decides, whichever of the two heard the other's claim
  const [a, b] = await Promise.all([one.create(), two.create()]);
  await flushMicro();
  assert.equal([w.ctx.HSC.otherTab === true, w2.ctx.HSC.otherTab === true].filter(Boolean).length, 1);
  a.destroy(); b.destroy();
  for (const order of [0, 1]) {
    const x = world(), y = world(); y.ctx.BroadcastChannel = x.ctx.BroadcastChannel;
    vm.runInContext('Math.random = () => ' + (order ? 0.9 : 0.1), x.ctx); vm.runInContext('Math.random = () => ' + (order ? 0.1 : 0.9), y.ctx);
    const p = webClient(x), q = webClient(y), c1 = await p.create(), c2 = await q.create();
    await flushMicro();
    assert.equal([x.ctx.HSC.otherTab === true, y.ctx.HSC.otherTab === true].filter(Boolean).length, 1, 'order ' + order);
    c1.destroy(); c2.destroy();
  }
});

// R3-1: a tab claims the game only once it is in view; a paused older tab is fully inert and wakes on input
const inputEvent = () => ({ prevented: 0, stopped: 0, preventDefault() { this.prevented++; }, stopImmediatePropagation() { this.stopped++; } });
function sharedTab(w, now) { const t = world(); t.ctx.BroadcastChannel = w.ctx.BroadcastChannel; t.ctx.localStorage = w.ctx.localStorage; if (now) t.ctx.Date = { now: () => now }; return t; }
await test('R3-1: a tab opened in the background neither claims nor freezes the tab in use; shown, it takes over', async () => {
  const w = world(), playing = webClient(w), a = await playing.create();
  const w2 = sharedTab(w, 2e12); w2.document.visibilityState = 'hidden';
  const bg = webClient(w2); let b = null; const starting = bg.create().then(v => { b = v; });
  await flushMicro(); await w.advance(5000);
  assert.equal(w.ctx.HSC.otherTab, undefined, 'the tab in use keeps playing');
  assert.equal(w.ctx.HSC.executionPaused, false); assert.equal(playing.game.paused, false); assert.equal(w.document.body.inert, false);
  assert.equal(b, null, 'the background tab waits unstarted (its saves unread)');
  w.storage.clear(); await a.saveProgress('a', 'still mine'); assert(w.storage.has('asmr-barber-youtube-save-v1'), 'the tab in use still saves');
  // the player switches to the new tab: it claims, the older tab stops completely
  w.document.visibilityState = 'hidden'; w.fire('doc', 'visibilitychange'); await flushMicro();
  w2.document.visibilityState = 'visible'; w2.fire('doc', 'visibilitychange');
  await starting; await flushMicro();
  assert.equal(w.ctx.HSC.otherTab, true); assert.equal(w2.ctx.HSC.otherTab, undefined, 'the shown tab plays');
  assert.equal(w2.ctx.HSC.executionPaused, false);
  // back in view (two windows side by side) the older tab is still fully paused until it is used
  w.document.visibilityState = 'visible';
  assert.equal(w.ctx.HSC.executionPaused, true, 'an execution pause, not only a game pause');
  assert.equal(w.document.body.inert, true, 'no input reaches the page'); assert.equal(playing.game.paused, true);
  w.storage.clear(); await a.saveProgress('a', 'lost?'); await a.flushProgress();
  assert(!w.storage.has('asmr-barber-youtube-save-v1'), 'the older tab writes nothing');
  a.destroy(); b.destroy();
});
await test('R3-1: a tap, click or key on the paused tab is swallowed and reloads it; a playing tab ignores input', async () => {
  for (const type of ['pointerdown', 'click', 'keydown', 'touchstart', 'mousedown']) {
    const w = world(), older = webClient(w), a = await older.create();
    const e0 = inputEvent(); w.fire('win', type, e0);
    assert.equal(w.location.reloads, 0); assert.equal(e0.prevented + e0.stopped, 0, 'input on a playing tab is left alone');
    const w2 = sharedTab(w, 2e12), b = await webClient(w2).create(); await flushMicro();
    assert.equal(w.ctx.HSC.otherTab, true);
    const e = inputEvent(); w.fire('win', type, e);
    assert.equal(w.location.reloads, 1, type + ' reloads the paused tab'); assert.equal(e.prevented, 1); assert.equal(e.stopped, 1);
    w.fire('win', type, inputEvent()); assert.equal(w.location.reloads, 1, 'reloads once');
    a.destroy(); b.destroy();
  }
});
await test('R3-1: a lone tab never locks itself (the game\'s own claim-less hello is not answered)', async () => {
  const w = world(), c = await webClient(w).create();
  // customers/meta.js runs its own guard on the same channel in the same page: it yields to any hello it hears
  const meta = new w.ctx.BroadcastChannel('skin-fade-studio-tabs'), heard = [];
  meta.onmessage = e => heard.push(e.data);
  meta.postMessage({ hi: 1, me: 'meta-own' }); await flushMicro(); await w.advance(1000);
  assert.deepEqual(heard, [], 'the tab does not answer its own meta guard');
  assert.equal(w.ctx.HSC.otherTab, undefined); assert.equal(w.ctx.HSC.executionPaused, false);
  w.fire('win', 'pointerdown', inputEvent()); assert.equal(w.location.reloads, 0);
  w.storage.clear(); await c.saveProgress('a', 1); assert(w.storage.has('asmr-barber-youtube-save-v1'));
  c.destroy();
});
await test('R3-1: two tabs in view never both write: a save queued as the other tab takes over is not written', async () => {
  const w = world(), a = await webClient(w).create();
  w.storage.clear();
  const late = a.saveProgress('a', 'late');
  // the newer claim arrives before the queued write runs
  w.channels[0].onmessage({ data: { hi: 1, me: 'zzzz', at: 9e12 } });
  await late; await flushMicro();
  assert(!w.storage.has('asmr-barber-youtube-save-v1'), 'the queued write is dropped once another tab owns the saves');
  assert.equal(w.ctx.HSC.executionPaused, true);
  a.destroy();
});

// ---- R2-4: the Android engine's restore puts the brows back (undo of a brow stroke) ----
await test('R2-4: restore(hair, beard, brow) applies a valid brow array; none keeps them; a damaged one is refused', async () => {
  const game = read('source/build/runtime/game.js');
  const same = (a, b, m) => assert.equal(JSON.stringify(a), JSON.stringify(b), m); // arrays from the vm's own realm
  const start = game.indexOf('async function hs_restore('), end = game.indexOf('async function hs_skip(');
  assert(start > 0 && end > start);
  const N = 128 * 32, hair = new Array(8192).fill(3), full = new Array(N).fill(2);
  const ctx = { HSC: { BROW_N: N }, c: false, T: false, renders: 0,
    s: { status: 'cutting', hair: new Array(8192).fill(1), beard: [1, 1], brow: full.slice() },
    // the engine's own helpers: rt copies own enumerable properties, gt defines the second object's properties (two arguments)
    rt: (e, t) => Object.assign(e, t), gt: (e, t) => Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)),
    J() { ctx.renders++; }, $: async () => {} };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(game.slice(start, end) + ';globalThis.restore=hs_restore;globalThis.state=()=>s;', ctx);
  const shaved = full.map((v, i) => (i % 9 === 0 ? 0 : i % 5 === 0 ? 1 : 2));
  assert.equal(await ctx.restore(hair, [0, 0], shaved), true);
  same(ctx.state().brow, shaved, 'the brows are restored'); assert.notEqual(ctx.state().brow, shaved, 'a copy');
  same(ctx.state().hair, hair); same(ctx.state().beard, [0, 0]);
  assert.equal(await ctx.restore(hair, [0, 0]), true); same(ctx.state().brow, shaved, 'no brows given keeps the current ones');
  assert.equal(await ctx.restore(hair, [0, 0], null), true); same(ctx.state().brow, shaved);
  const renders = ctx.renders;
  for (const bad of [shaved.slice(1), shaved.map((v, i) => (i === 3 ? 3 : v)), shaved.map((v, i) => (i === 3 ? 1.5 : v)), 'x', {}]) {
    assert.equal(await ctx.restore(full.slice(0, 1).concat(hair.slice(1)), [5, 5], bad), false, 'a damaged brow array refuses the restore');
  }
  assert.equal(ctx.renders, renders); same(ctx.state().beard, [0, 0], 'nothing of a refused restore is applied');
  assert.equal(await ctx.restore(hair, [0, 0], full), true); same(ctx.state().brow, full, 'undo back to full brows');
});

// ---- L2: the runtime recovery code exactly as built into the Android game.js ----
await test('L2: a second loss during the rebuild waits for the next restore instead of failing', async () => {
  const game = read('source/build/runtime/game.js');
  const start = game.indexOf('let recoveryTimer=0,recovering=false'), end = game.indexOf('a.addEventListener("webglcontextrestored",restore)');
  assert(start > 0 && end > start);
  const code = game.slice(start, end);
  function harness() {
    const w = world();
    const log = { failed: [], paused: [] };
    let lost = false, hold = null;
    Object.assign(w.ctx, { initialBoot: false, needsRender: true, ce() {},
      t: { setPauseReason(r, v) { log.paused.push(v); }, whenResumed: async () => {} },
      n: { async prepareFirstFrame() { if (hold) await hold.promise; if (lost) throw Error('Game graphics could not initialize'); }, render() {}, async waitForFirstFrame() { if (lost) throw Error('lost'); }, isContextLost: () => lost } });
    Object.assign(w.ctx.HSC, { detail: { noteContextLoss() {}, commitPending() {} },
      lifecycle: { timeout: (fn, ms) => w.ctx.setTimeout(fn, ms), clear: id => w.ctx.clearTimeout(id) },
      graphicsError: code => Object.assign(Error('Game graphics could not initialize'), { code }), failGame: e => log.failed.push(e.code || e.message) });
    vm.runInContext(code + ';globalThis.lost=lost;globalThis.restore=restore;', w.ctx);
    return { w, log, ctx: w.ctx, lose() { lost = true; w.ctx.lost(); }, back() { lost = false; w.ctx.restore(); },
      hold() { let r; hold = { promise: new Promise(x => { r = x; }) }; hold.release = () => { const h = hold; hold = null; r(); }; return hold; } };
  }
  // the audit repro: lost again while compiling, restored 1.5 s later
  let h = harness(); h.lose(); const held = h.hold(); h.back(); h.lose(); held.release(); await flushMicro();
  assert.deepEqual(h.log.failed, []);
  await h.w.advance(1500); h.back(); await flushMicro();
  assert.deepEqual(h.log.failed, []); assert.equal(h.log.paused.at(-1), false, 'the game resumes after the next restore');
  // lost and restored again while the first rebuild is still running: the queued restore rebuilds once more
  h = harness(); h.lose(); const held2 = h.hold(); h.back(); h.lose(); h.back(); held2.release(); await flushMicro(); await flushMicro();
  assert.deepEqual(h.log.failed, []); assert.equal(h.log.paused.at(-1), false);
  // lost again and never restored: the first-loss rule still ends in GFX_LOST after 8 s
  h = harness(); h.lose(); const held3 = h.hold(); h.back(); h.lose(); held3.release(); await flushMicro();
  await h.w.advance(8000); assert.deepEqual(h.log.failed, ['GFX_LOST']);
  // a rebuild that fails on a live context is still a real failure
  h = harness(); h.lose(); h.ctx.n.prepareFirstFrame = async () => { throw Object.assign(Error('shader'), { code: 'GFX_SHADER' }); };
  h.back(); await flushMicro(); assert.deepEqual(h.log.failed, ['GFX_SHADER']);
});

// ---- UU5: the privacy action ----
await test('UU5: privacy opens the policy in a new tab without AndroidHost; Android keeps its native call', async () => {
  for (const android of [false, true]) {
    const actions = [], opened = [], calls = [];
    const ctx = { HSC: { settings: { addAction: a => actions.push(a) } }, open: (...a) => { opened.push(a); return null; } };
    if (android) ctx.AndroidHost = { openPrivacy: () => calls.push('openPrivacy') };
    ctx.globalThis = ctx; vm.createContext(ctx);
    vm.runInContext(read('android/privacy.js'), ctx);
    assert.equal(actions.length, 1);
    assert.doesNotThrow(() => actions[0].run());
    if (android) { assert.deepEqual(calls, ['openPrivacy']); assert.deepEqual(opened, []); }
    else assert.deepEqual(JSON.parse(JSON.stringify(opened)), [['https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/', '_blank', 'noopener']]);
  }
  const ctx = { HSC: { settings: { addAction: a => { ctx.action = a; } } } }; ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(read('android/privacy.js'), ctx);
  assert.doesNotThrow(() => ctx.action.run(), 'a host with neither AndroidHost nor window.open still does not throw');
});
console.log(`fix-platform: ${results.length} passed${process.exitCode ? ', some FAILED' : ''}`);
})();
