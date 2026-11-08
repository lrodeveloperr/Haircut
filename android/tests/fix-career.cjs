'use strict';
// Career run and save-journal fixes (fixer F2, 7 November 2026), pure node: the real career.js, career-save.js,
// economy.js and career-run.js run against a stub game, a stub director and an in-memory host store.
//   E1  a wished regional shop (salon:shop:<city>) or a malformed / stale wish never breaks the shop: it is
//       checked against the salon's regions, and a bad one is cleared
//   E2  a purchase or a coin change reports success only once the journal commit has landed
//   C1  while a reveal's result is being written no chair is given the finished contract; a walk-in seated by
//       Next meanwhile is replaced by the next contract's customer; the wrong customer never takes a contract
//   C2  the app closed at a reveal before its Career result was written: the completion and its pay are made when
//       the career is ready again, once only
//   C3  records are budgeted in envelope bytes; regulars' saved cuts are capped one by one and in total
//   C5  a record from a newer game version makes the career read-only (no frozen half); a damaged newest record
//       does not freeze saving
//   XU2 the Career checkpoint keeps the brows
//   R2-2 a completion whose write failed is written again (on the next commit or the next chair), paid once, and
//       the contract is not seated again from his start meanwhile (fixer G2)
//   R2-3 an earlier incomplete finish never blocks a later chair's result, even when the engine's job numbers
//       start again; a new chair with an old number gets the contract's start (fixer G2)
//   G2  a checkpoint keeps any change of the cut, not only one that would complete the contract
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const src = (f) => fs.readFileSync(path.join(root, 'source/customers', f), 'utf8');
const plain = (x) => JSON.parse(JSON.stringify(x));
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
let passed = 0;

// ---- the grids' run-length text (extras.js) ----
const LV = 'ABCDEFGHIJKLMNOPQ';
function gridPack(a) { let s = ''; for (let i = 0; i < a.length;) { let j = i; while (j < a.length && a[j] === a[i]) j++; s += LV[a[i]] + (j - i).toString(36); i = j; } return s; }
function gridUnpack(s, max) {
  if (typeof s !== 'string' || s.length > 24000) return null;
  const out = new Array(8192), re = /([A-Q])([0-9a-z]{1,4})/y; let n = 0, m; re.lastIndex = 0;
  while (re.lastIndex < s.length && (m = re.exec(s))) { const v = LV.indexOf(m[1]), k = parseInt(m[2], 36); if (v > max || !k || n + k > 8192) return null; out.fill(v, n, n + k); n += k; }
  return n === 8192 && re.lastIndex === s.length ? out : null;
}

// an in-memory host store shared by game instances (a restart is a new instance on the same store)
function hostStore() {
  const data = new Map();
  const st = { data, failNext: 0, failKey: null, delay: 0, writes: 0 };
  st.client = {
    loadProgress: async (k, fb) => (data.has(k) ? JSON.parse(data.get(k)) : fb),
    saveProgress: async (k, v) => {
      if (st.delay) await tick(st.delay);
      st.writes++;
      if (st.failNext > 0 && (!st.failKey || st.failKey(k))) { st.failNext--; throw new Error('host write failed'); }
      data.set(k, JSON.stringify(v));
    },
  };
  return st;
}

// one game instance: the real career modules on stubs for the engine, the director, the catalog and the shops
function game(store, opts = {}) {
  const ctx = { console: { log() {}, warn() {}, error() {} }, setTimeout, clearTimeout, Promise, TextEncoder };
  ctx.globalThis = ctx;
  const HSC = (ctx.HSC = { PHENOTYPES: {}, BROW_N: 4096, gridPack, gridUnpack, CITIES: ['ist', 'lon', 'lag'].map((id) => ({ id, enabled: true })), CITIES_VERSION: 1 });
  vm.createContext(ctx);
  for (const f of ['career.js', 'career-save.js', 'economy.js']) vm.runInContext(src(f), ctx);
  let personSeed = 1000 + (opts.seedBase || 0);
  HSC.director = {
    SPECIALIST: ['fix', 'beard', 'rush'], RING: 64,
    fresh: () => ({ turn: 0, sig: [], lanes: [], chapterLog: [], cool: { chapter: 0 }, regs: {} }),
    noteResult() {},
    generate(core, dir) {
      const id = HSC.career.contractId(core);
      if (!id) return { dir };
      const seed = ++personSeed;
      return { dir: Object.assign({}, dir, { turn: (dir.turn | 0) + 1 }), contract: {
        id, seed, revision: 0, city: HSC.career.position(core).city, slot: 0, role: opts.role || 'standard', mode: 'requests', lane: 'precision',
        customer: { person: { seed, name: 'p' + seed } },
        start: { silhouette: 'walk', hair: new Array(8192).fill(4), beardGrid: new Array(8192).fill(2) },
        request: { id: 'fade', family: 'fade', target: new Array(8192).fill(1) },
      } };
    },
  };
  HSC.careerCatalog = { make: () => ({}), commitGroup() {} };
  // the chair: the engine's state, with skip() counted
  const chair = { s: null, skips: 0 };
  ctx.skinFadeStudio = { getState: () => chair.s, skip: () => { chair.skips++; return Promise.resolve(true); } };
  const MIN_WORK = 60;
  HSC.modes = {
    current: () => 'career', inCareer: () => true, unlocked: () => true, judged: () => false,
    worked: (s) => { let n = 0; for (const [a, b] of [[s.hair, s.startHair], [s.beard, s.startBeard]]) { if (!a || !b) continue; for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && ++n >= MIN_WORK) return true; } return false; },
  };
  HSC.setBrow = (b) => { chair.brow = b; };
  const meta = { data: Object.assign({ coins: 0, cuts: 1, lastRound: null, queue: null }, opts.meta || {}), level: () => 3, save() { meta.saves = (meta.saves || 0) + 1; }, client: store.client };
  HSC.meta = meta;
  if (opts.chair) chair.s = opts.chair;
  vm.runInContext(src('career-run.js'), ctx);
  return { ctx, HSC, chair, meta, R: HSC.careerRun, ready: async () => { for (let i = 0; i < 200 && !(HSC.careerRun.ready() && HSC.econ.ready()); i++) await tick(5); assert.ok(HSC.careerRun.ready(), 'career ready'); await HSC.careerRun.ensure(); } };
}
const cut = (s, n = 200) => { const hair = s.hair.slice(); for (let i = 0; i < n; i++) hair[i] = 1; return Object.assign({}, s, { hair, cutStrokeCount: 3 }); };
function seatFor(g, job) {
  const p = g.R.person(job);
  assert.ok(p, 'the contract has a customer for job ' + job);
  const s0 = { jobId: job, status: 'cutting', cutStrokeCount: 0, hair: new Array(8192).fill(5), startHair: new Array(8192).fill(5), beard: new Array(8192).fill(0), startBeard: new Array(8192).fill(0), brow: new Array(4096).fill(2), look: { person: p } };
  const s = g.R.start(s0);
  assert.ok(s, 'the contract seats its customer');
  return (g.chair.s = s);
}
const settle = async (g) => { for (let i = 0; i < 50; i++) await tick(2); };

(async () => {
  // ---- E1: wishes ----
  {
    const st = hostStore(), g = game(st);
    await g.ready();
    const regions = ['classic'];
    const OPTIONS = { wall: ['plain', 'brick', 'tile'] };
    const owned = { wall: ['plain'] };
    // the salon's real rule: owns() prices the option of a slot, so it throws for a city id
    const priceOf = (slot, opt) => { const i = OPTIONS[slot].indexOf(opt); return i <= 0 ? 0 : 100; };
    g.HSC.salon = { state: () => ({ regions, owned }), OPTIONS, REGIONS: ['classic', 'london', 'tokyo'], owns: (slot, opt) => priceOf(slot, opt) === 0 || owned[slot].includes(opt) };
    g.HSC.catalog = { byKey: new Map([['gown:red', {}]]) };
    g.HSC.wardrobeApi = { owns: (k) => k === 'gown:blue' };
    await g.HSC.econ.wish('salon', { key: 'salon:shop:tokyo', price: 900 });
    assert.deepEqual(plain(g.HSC.econ.wishTarget()), { key: 'salon:shop:tokyo', price: 900 }, 'a wished regional shop is a target, not an exception');
    regions.push('tokyo');
    assert.equal(g.HSC.econ.wishTarget(), null, 'an owned regional shop is no longer a target');
    await g.HSC.econ.wish('salon', { key: 'salon:part:wall:brick', price: 100 });
    assert.equal(g.HSC.econ.wishTarget().key, 'salon:part:wall:brick');
    owned.wall.push('brick');
    assert.equal(g.HSC.econ.wishTarget(), null);
    await g.HSC.econ.wish('cosmetic', { key: 'wardrobe:gown:red', price: 50 });
    assert.equal(g.HSC.econ.wishTarget().key, 'wardrobe:gown:red');
    // malformed or stale wishes: null, then cleared from the journal
    for (const key of ['salon:shop:atlantis', 'salon:part:nowall:x', 'salon:shop', 'wardrobe:gown:gone', 'nonsense', 'salon:part:wall:marble']) {
      const kind = key.startsWith('wardrobe') ? 'cosmetic' : 'salon';
      await g.HSC.econ.wish(kind, { key, price: 10 });
      assert.equal(g.HSC.econ.wishTarget(), null, key + ' is never a target');
      await settle(g);
      assert.equal((g.R.body().wish || {})[kind], undefined, key + ' is cleared from the save');
    }
    // before the salon has loaded its save, a good wish waits (it is not cleared)
    await g.HSC.econ.wish('salon', { key: 'salon:shop:london', price: 900 });
    g.HSC.salon.state = () => null;
    assert.deepEqual(plain(g.HSC.econ.wishTarget()), { key: 'salon:shop:london', price: 900 });
    await settle(g);
    assert.ok(g.R.body().wish.salon, 'a wish is not cleared while the salon is still loading');
    passed++;
  }

  // ---- E2: success only once the commit has landed ----
  {
    const st = hostStore(), g = game(st);
    await g.ready();
    await g.HSC.econ.earn('gift:1', 'misc', 500);
    const bal = g.HSC.econ.balance();
    // the pending record cannot be written: nothing is bought, nothing is charged
    st.failNext = 1; st.failKey = (k) => k.startsWith('barber-career-j');
    assert.equal(await g.HSC.econ.buyItem('salon:part:wall:brick', 'salon', 100), false);
    assert.equal(g.HSC.econ.balance(), bal);
    assert.equal(g.HSC.econ.owns('salon:part:wall:brick'), false);
    // the committed write fails (after the pending record): still nothing, also after a restart
    st.failNext = 0;
    const w0 = st.writes;
    st.failKey = (k) => k.startsWith('barber-career-j') && st.writes === w0 + 2; st.failNext = 1;
    assert.equal(await g.HSC.econ.buyItem('salon:part:wall:tile', 'salon', 100), false);
    assert.equal(g.HSC.econ.balance(), bal);
    st.failNext = 0;
    const g2 = game(st); await g2.ready();
    assert.equal(g2.HSC.econ.owns('salon:part:wall:tile'), false, 'an unpaid item is not granted after a restart');
    assert.equal(g2.HSC.econ.balance(), bal);
    // only the pointer write fails: the committed record is the commit, so the purchase stands
    st.failNext = 1; st.failKey = (k) => k === 'barber-career-ptr';
    assert.equal(await g2.HSC.econ.buyItem('salon:part:wall:brick', 'salon', 100), true);
    assert.equal(g2.HSC.econ.balance(), bal - 100);
    st.failNext = 0;
    const g3 = game(st); await g3.ready();
    assert.equal(g3.HSC.econ.owns('salon:part:wall:brick'), true);
    assert.equal(g3.HSC.econ.balance(), bal - 100);
    // coin changes: null on failure, and spend() is false
    st.failNext = 1; st.failKey = null;
    assert.equal(await g3.HSC.econ.earn('gift:2', 'misc', 5), null);
    st.failNext = 1;
    assert.equal(await g3.HSC.econ.spend('spend:1', 'misc', 5), false);
    assert.equal(g3.HSC.econ.balance(), bal - 100);
    passed++;
  }

  // ---- C1: Next pressed while the reveal's result is being written ----
  {
    const st = hostStore(), g = game(st);
    await g.ready();
    const a = g.R.active();
    const s = cut(seatFor(g, 1));
    g.chair.s = Object.assign(s, { status: 'reveal' });
    g.HSC.lastJob = { key: a.id, job: { kind: 'requests', stars: 2, judged: false, valid: true } };
    st.delay = 20; // slow native storage
    const bal = g.HSC.econ.balance();
    g.R.done(s, 2);
    assert.equal(g.R.person(2), null, 'no chair is given the finished contract while its result is written');
    // the engine seats an ordinary walk-in for job 2; the old contract does not take it
    const walkIn = { jobId: 2, status: 'cutting', cutStrokeCount: 0, hair: new Array(8192).fill(5), startHair: new Array(8192).fill(5), beard: new Array(8192).fill(0), startBeard: new Array(8192).fill(0), brow: new Array(4096).fill(2), look: { person: { seed: 7 } } };
    assert.equal(g.R.start(walkIn), null);
    g.chair.s = walkIn;
    g.R.done(s, 2); // a second result for the same reveal is ignored
    for (let i = 0; i < 400 && g.R.active().id === a.id; i++) await tick(5);
    await settle(g);
    const n = g.R.active();
    assert.notEqual(n.id, a.id, 'the contract was completed');
    assert.equal(g.R.body().core.licence.next, 1, 'completed once');
    assert.ok(g.HSC.econ.balance() > bal, 'and paid');
    assert.equal(g.chair.skips, 1, 'the untouched walk-in is replaced straight away');
    assert.equal(g.meta.data.queue.job, 3);
    assert.equal(g.meta.data.queue.person.seed, n.person.seed, 'by the next contract\'s customer');
    assert.equal(g.R.person(3).seed, n.person.seed);
    // a chair holding someone else never completes or seats the contract, even with its job number
    st.delay = 0;
    const other = Object.assign(cut(walkIn), { jobId: 3, status: 'reveal' });
    assert.equal(g.R.start(Object.assign({}, walkIn, { jobId: 3 })), null);
    g.R.done(other, 3);
    await settle(g);
    assert.equal(g.R.active().id, n.id, 'a stranger in the chair does not complete the contract');
    // once cut, the walk-in is not replaced: he stays practice and the contract waits for the next chair
    const g2 = game(st, { seedBase: 50 }); await g2.ready();
    const a2 = g2.R.active(), s2 = cut(seatFor(g2, 1));
    g2.chair.s = Object.assign(s2, { status: 'reveal' });
    st.delay = 20;
    g2.R.done(s2, 2);
    g2.chair.s = cut(Object.assign({}, walkIn));
    for (let i = 0; i < 400 && g2.R.active().id === a2.id; i++) await tick(5);
    await settle(g2);
    assert.equal(g2.chair.skips, 0);
    assert.equal(g2.R.person(3).seed, g2.R.active().person.seed, 'the next contract takes the next chair');
    st.delay = 0;
    passed++;
  }

  // ---- C2: closed at the reveal before the Career result was written ----
  {
    const st = hostStore(), g = game(st);
    await g.ready();
    const a = g.R.active(), s = cut(seatFor(g, 1));
    await settle(g); // the seat is saved
    const balance = g.HSC.econ.balance(), next = g.R.body().core.licence.next;
    const job = { kind: 'requests', stars: 3, judged: false, valid: true, regular: false, vip: false };
    const pay = g.HSC.economy.payout(job);
    // what the progress save holds at the kill: the session at the reveal and the result screen's numbers
    const lastRound = { job: 1, key: a.id, stars: 3, judged: false, tip: pay.tip, paid: pay.total, lines: pay.lines, tripled: false, free: false };
    const reveal = Object.assign({}, s, { status: 'reveal' });
    const g2 = game(st, { chair: plain(reveal), meta: { lastRound: plain(lastRound) } });
    await g2.ready();
    await settle(g2);
    assert.equal(g2.R.body().core.licence.next, next + 1, 'the contract is completed at the restored reveal');
    assert.equal(g2.HSC.econ.balance(), balance + pay.total, 'and paid what the result screen showed');
    // the game's own repeat of the reveal and another restart do not pay again
    g2.R.done(g2.chair.s, 3);
    await settle(g2);
    const g3 = game(st, { chair: plain(reveal), meta: { lastRound: plain(lastRound) } });
    await g3.ready(); await settle(g3);
    assert.equal(g3.R.body().core.licence.next, next + 1);
    assert.equal(g3.HSC.econ.balance(), balance + pay.total, 'paid once');
    // a restored reveal with no real work: the contract is incomplete once, and stays so on another restart
    const st2 = hostStore(), h = game(st2); await h.ready();
    const b = h.R.active(), t = seatFor(h, 1); await settle(h);
    const lr0 = { job: 1, key: b.id, stars: 0, judged: false, tip: 0, paid: 0, lines: [], tripled: false, free: false };
    const h2 = game(st2, { chair: plain(Object.assign({}, t, { status: 'reveal' })), meta: { lastRound: plain(lr0) } });
    await h2.ready(); await settle(h2);
    assert.equal(h2.R.active().state, 'incomplete');
    assert.equal(h2.R.active().doneJob, 1);
    const rev = h2.R.body() && st2.data.get('barber-career-ptr');
    const h3 = game(st2, { chair: plain(Object.assign({}, t, { status: 'reveal' })), meta: { lastRound: plain(lr0) } });
    await h3.ready(); await settle(h3);
    assert.equal(st2.data.get('barber-career-ptr'), rev, 'an incomplete result seen again writes nothing');
    passed++;
  }

  // ---- XU2: the checkpoint keeps the brows ----
  {
    const st = hostStore(), g = game(st);
    await g.ready();
    const s = seatFor(g, 1);
    const brow = s.brow.slice(); for (let i = 100; i < 300; i++) brow[i] = 0;
    g.chair.s = Object.assign({}, s, { brow });
    await g.R.suspend(g.chair.s);
    const a = g.R.active();
    assert.equal(a.state, 'suspended', 'trimmed brows alone are a checkpoint worth keeping');
    assert.ok(typeof a.work.br === 'string');
    // a restart, then the contract is seated again: the brows come back as they were left
    const g2 = game(st); await g2.ready();
    const s2 = seatFor(g2, 5);
    assert.deepEqual(plain(s2.brow), brow);
    assert.deepEqual(plain(g2.chair.brow), brow, 'the renderer is given the brows');
    // and brows alone are not work that completes a contract
    g2.chair.s = Object.assign({}, s2, { status: 'reveal' });
    g2.HSC.lastJob = { key: g2.R.active().id, job: { kind: 'requests', stars: 2, valid: true } };
    g2.R.done(g2.chair.s, 2); await settle(g2);
    assert.equal(g2.R.active().state, 'incomplete');
    passed++;
  }

  // ---- R2-2: the completion's write fails ----
  {
    const careerKeys = (k) => k.startsWith('barber-career-');
    // the same contract finished in a game whose storage works: what the result is worth
    const ctl = game(hostStore(), { seedBase: 300 }); await ctl.ready();
    const ca = ctl.R.active(), cs = cut(seatFor(ctl, 1)); await settle(ctl);
    const cb = ctl.HSC.econ.balance();
    ctl.chair.s = Object.assign(cs, { status: 'reveal' });
    ctl.HSC.lastJob = { key: ca.id, job: { kind: 'requests', stars: 2, judged: false, valid: true } };
    ctl.R.done(ctl.chair.s, 2); await settle(ctl);
    const worth = ctl.HSC.econ.balance() - cb;
    assert.ok(worth > 0);

    // (a) retried at the next chair
    const st = hostStore(), g = game(st, { seedBase: 300 });
    await g.ready();
    const a = g.R.active(), s = cut(seatFor(g, 1)); await settle(g);
    assert.equal(a.person.seed, ca.person.seed, 'the same contract as the control');
    const bal = g.HSC.econ.balance(), next = g.R.body().core.licence.next;
    g.chair.s = Object.assign(s, { status: 'reveal' });
    g.HSC.lastJob = { key: a.id, job: { kind: 'requests', stars: 2, judged: false, valid: true } };
    st.failNext = 99; st.failKey = careerKeys;
    g.R.done(g.chair.s, 2); await settle(g);
    assert.equal(g.R.active().id, a.id, 'nothing was written');
    assert.equal(g.HSC.econ.balance(), bal);
    // Next: the engine moves on and the result screen's job is gone; the chair is not given him from his start
    g.HSC.lastJob = { key: 'job:other', job: { kind: 'free', stars: 1, valid: true } };
    g.chair.s = { jobId: 2, status: 'cutting', cutStrokeCount: 0, hair: new Array(8192).fill(5), startHair: new Array(8192).fill(5), beard: new Array(8192).fill(0), startBeard: new Array(8192).fill(0), brow: new Array(4096).fill(2), look: { person: { seed: 9 } } };
    assert.equal(g.R.person(2), null, 'the owed contract is not seated again while storage still fails');
    await settle(g);
    assert.equal(g.R.active().id, a.id);
    assert.equal(g.R.person(2), null, 'still owed after a second failed write');
    await settle(g);
    assert.equal(g.R.start(Object.assign({}, g.chair.s, { look: { person: a.person } })), null, 'never seated from his start while owed');
    await settle(g);
    // storage works again: the next chair writes the owed completion first
    st.failNext = 0;
    assert.equal(g.R.person(2), null);
    for (let i = 0; i < 400 && g.R.active().id === a.id; i++) await tick(5);
    await settle(g);
    const n = g.R.active();
    assert.notEqual(n.id, a.id, 'the owed contract is completed');
    assert.equal(g.R.body().core.licence.next, next + 1);
    assert.equal(g.HSC.econ.balance() - bal, worth, 'paid what the result screen showed, from the job as it was then');
    assert.equal(g.chair.skips, 1, 'the untouched walk-in gives way to the next contract');
    assert.equal(g.R.person(3).seed, n.person.seed);
    // nothing pays it again: another commit, another chair, a repeated done
    g.R.done(Object.assign({}, s, { status: 'reveal' }), 2);
    await g.HSC.econ.earn('gift:r22', 'misc', 7); await settle(g);
    assert.equal(g.HSC.econ.balance() - bal, worth + 7, 'paid once');
    assert.equal(g.R.body().core.licence.next, next + 1);

    // (b) retried by the next commit (another mode's coins), ahead of it
    const st2 = hostStore(), h = game(st2, { seedBase: 300 });
    await h.ready();
    const b = h.R.active(), t = cut(seatFor(h, 1)); await settle(h);
    const bal2 = h.HSC.econ.balance();
    h.chair.s = Object.assign(t, { status: 'reveal' });
    h.HSC.lastJob = { key: b.id, job: { kind: 'requests', stars: 2, judged: false, valid: true } };
    st2.failNext = 99; st2.failKey = careerKeys;
    h.R.done(h.chair.s, 2); await settle(h);
    st2.failNext = 0;
    h.HSC.modes.current = () => 'requests'; h.HSC.modes.judged = () => true; // the player has left Career meanwhile
    assert.ok(await h.HSC.econ.earn('gift:r22b', 'misc', 5));
    await settle(h);
    assert.notEqual(h.R.active().id, b.id, 'the owed completion was written by the next commit');
    assert.equal(h.HSC.econ.balance() - bal2, worth + 5, 'decided and paid as it was shown');
    passed++;
  }

  // ---- R2-3: an earlier incomplete finish and job numbers that start again ----
  {
    const st = hostStore(), g = game(st);
    await g.ready();
    const a = g.R.active();
    const s1 = seatFor(g, 1);
    g.chair.s = Object.assign({}, s1, { status: 'reveal' });
    g.R.done(g.chair.s, 0); await settle(g);
    assert.equal(g.R.active().doneJob, 1, 'an untouched finish is incomplete');
    // the next chair takes him again, and that seat no longer carries the old finish (also in the save)
    const s2 = seatFor(g, 2); await settle(g);
    assert.equal(g.R.active().doneJob, undefined);
    assert.equal(JSON.parse(JSON.parse(st.data.get('barber-career-j' + JSON.parse(st.data.get('barber-career-ptr')).slot)).body).active.doneJob, undefined);
    await g.R.suspend(Object.assign({}, s2));
    // the engine's session was replaced: its jobs start again at 1, and he is seated at a chair numbered 1
    const s3 = cut(seatFor(g, 1)); await settle(g);
    g.chair.s = Object.assign(s3, { status: 'reveal' });
    g.HSC.lastJob = { key: a.id, job: { kind: 'requests', stars: 2, valid: true } };
    g.R.done(g.chair.s, 2); await settle(g);
    assert.notEqual(g.R.active().id, a.id, 'the genuine completion is not blocked by the old finish');
    // the contract saved as seated at job 1, then a restart whose engine session was replaced: the new chair 1
    // starts from someone else's hair, so it is a new chair and gets the contract's start
    const st2 = hostStore(), h = game(st2); await h.ready();
    seatFor(h, 1); await settle(h);
    const h2 = game(st2); await h2.ready();
    const p = h2.R.person(1);
    const fresh = { jobId: 1, status: 'cutting', cutStrokeCount: 0, hair: new Array(8192).fill(5), startHair: new Array(8192).fill(5), beard: new Array(8192).fill(0), startBeard: new Array(8192).fill(0), brow: new Array(4096).fill(2), look: { person: p } };
    const out = h2.R.start(fresh);
    assert.ok(out && out.startHair[0] === 4, 'a new chair with an old number is seated from the contract');
    assert.equal(h2.R.start(Object.assign({}, fresh, out)), null, 'and a reload of that chair is not seated again');
    passed++;
  }

  // ---- G2: a checkpoint keeps any change of the cut ----
  {
    const st = hostStore(), g = game(st);
    await g.ready();
    const s = cut(seatFor(g, 1), 10); // less than a finish needs
    g.chair.s = s;
    assert.equal(g.HSC.modes.worked(s), false);
    g.HSC.modes.changedCells = (x, stop) => { let n = 0; for (let i = 0; i < x.hair.length; i++) if (x.hair[i] !== x.startHair[i] && ++n >= stop) return n; return n; };
    await g.R.suspend(s);
    assert.equal(g.R.active().state, 'suspended', 'a small start on the cut is kept');
    const s2 = seatFor(g, 2);
    assert.equal(s2.hair.filter((v) => v === 1).length, 10, 'and he comes back with it');
    passed++;
  }

  // ---- C3: envelope budget and the regulars' caps ----
  {
    const J = game(hostStore()).HSC.careerSave;
    const big = () => 'B' + Array.from({ length: 3000 }, (_, i) => LV[i % 6] + '2').join(''); // ~6 KB per grid
    const regs = {};
    for (const c of ['ist', 'lon', 'lag', 'nyc', 'sao', 'mum', 'tyo', 'par', 'ber', 'rom', 'mad', 'cai', 'del', 'syd', 'mex', 'lim', 'seo', 'bkk'])
      regs[c] = Array.from({ length: 6 }, (_, i) => ({ key: c + i, seed: i, person: { seed: i }, visits: 1, lastDay: i, h: big(), b: big(), u: big() }));
    const trimmed = J.trimRegs(plain(regs));
    assert.ok(JSON.stringify(trimmed).length <= J.REGS_BYTES, 'all regulars together stay within their budget');
    assert.equal(Object.values(trimmed).reduce((n, l) => n + l.length, 0), 108, 'trimming drops saved cuts before anyone');
    assert.ok(Object.values(trimmed).some((l) => l.some((g) => g.h)), 'the most recent regulars keep their cuts');
    const one = J.trimRegs({ ist: [{ key: 'x', seed: 1, person: {}, visits: 1, h: 'A'.repeat(15000), b: 'A'.repeat(15000) }] });
    assert.equal(one.ist[0].h, undefined, 'one oversized saved cut is dropped');
    // a journal commit is budgeted in envelope bytes: both records and the other saves fit the 3 MiB envelope
    assert.ok(2 * J.MAX_BYTES + 512 * 1024 <= 3 * 1024 * 1024);
    const st = hostStore(), g = game(st); await g.ready();
    const j = J.journal({ get: (k) => st.client.loadProgress(k, null), set: (k, v) => st.client.saveProgress(k, v) });
    await j.load();
    // a body of quotes doubles in the envelope (escaped): the budget counts that
    await assert.rejects(j.commit((b) => Object.assign(b, { port: { pad: '"'.repeat(0.7 * 1024 * 1024) } })), /too large/);
    // oversized regulars are trimmed instead of refusing the career
    const body = await j.commit((b) => Object.assign(b, { regs: plain(regs), port: { pad: 'x'.repeat(700 * 1024) } }));
    assert.ok(body, 'the commit lands');
    for (const k of J.KEYS) if (st.data.has(k)) assert.ok(J.sizeOf(JSON.parse(st.data.get(k))) <= J.MAX_BYTES);
    // a loaded record's regulars are trimmed by sanitize
    const s = J.sanitize(Object.assign(plain(body), { regs: plain(regs) }));
    assert.ok(JSON.stringify(s.regs).length <= J.REGS_BYTES);
    passed++;
  }

  // ---- C5: newer records; damaged newest record ----
  {
    const st = hostStore(), g = game(st); await g.ready();
    const J = g.HSC.careerSave;
    const io = { get: (k) => st.client.loadProgress(k, null), set: (k, v) => st.client.saveProgress(k, v) };
    const j = J.journal(io); await j.load();
    await j.commit((b) => b); await j.commit((b) => b);
    const ptr = JSON.parse(st.data.get(J.PTR));
    // a damaged newest record: load falls back, and the next commit is not refused as stale
    const keep = st.data.get(J.KEYS[ptr.slot]);
    const bad = JSON.parse(keep); bad.body = bad.body.replace('"turn"', '"tUrn"');
    st.data.set(J.KEYS[ptr.slot], JSON.stringify(bad));
    const j2 = J.journal(io), r2 = await j2.load();
    assert.equal(r2.rev, ptr.rev - 1);
    assert.ok(await j2.commit((b) => b), 'a pointer to a damaged record does not freeze saving');
    // a newer build wrote one slot: the career is read-only (tooNew), never a half that refuses every write
    const newer = JSON.parse(st.data.get(J.KEYS[0])); newer.schema = J.SCHEMA + 1; newer.rev = 99;
    st.data.set(J.KEYS[0], JSON.stringify(newer)); st.data.set(J.PTR, JSON.stringify({ slot: 0, rev: 99 }));
    const j3 = J.journal(io), r3 = await j3.load();
    assert.equal(r3.tooNew, true);
    await assert.rejects(j3.commit((b) => b), /newer/);
    const g2 = game(st);
    for (let i = 0; i < 100 && !g2.R.tooNew(); i++) await tick(5);
    assert.equal(g2.R.tooNew(), true, 'Career asks for the update');
    assert.equal(g2.R.ready(), false);
    passed++;
  }

  console.log('PASS: ' + passed + ' career fix cases (E1 wishes, E2 commit success, C1 Next during the save, C2 restart at the reveal, XU2 brows, R2-2 owed completion, R2-3 old finish, G2 checkpoint, C3 budget, C5 newer records).');
})().catch((e) => { console.error(e); process.exit(1); });
