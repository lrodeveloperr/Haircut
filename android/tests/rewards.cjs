'use strict';

// Exercise the actual catalog + wardrobe through the Android build adaptation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const catalog = fs.readFileSync(path.join(root, 'source/customers/catalog.js'), 'utf8');
const wardrobe = fs.readFileSync(path.join(root, 'source/customers/wardrobe.js'), 'utf8');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'haircut-android-rewards-'));
let tests = 0;

function harness(code, saved = null) {
  const marker = '  HSC.rewards = {';
  assert.equal(code.split(marker).length - 1, 1);
  const instrumented = code.replace(marker,
    '  HSC.__test = { ui, grant, sanitize, picks, videoBadge };\n' + marker);
  const ctx = {
    console, Date, setTimeout, clearTimeout, innerWidth: 390, innerHeight: 844,
    document: { documentElement: { style: { setProperty() {} } } },
  };
  ctx.globalThis = ctx;
  vm.runInNewContext(instrumented, ctx);
  const H = ctx.HSC, W = H.wardrobe, ui = H.__test.ui;
  let receipt = true, pending = null;
  const saves = [], events = [], button = { disabled: false };
  W.data = H.__test.sanitize(saved);
  W.client = {
    rewardedSupported: true,
    async showRewarded(placement) {
      assert.equal(placement, 'unlock-item');
      if (pending) return pending;
      if (receipt instanceof Error) throw receipt;
      return receipt;
    },
    async saveProgress(key, data) { saves.push(JSON.parse(JSON.stringify(data))); },
    sendAnalytics(name, payload) { events.push({ name, payload }); },
  };
  H.nope = () => {};
  ui.el = { pick: { querySelector: () => button } };
  ui.render = () => {};
  ui.pop = () => {};
  const pick = H.__test.picks();
  return {
    H, W, ui, saves, events, button,
    d: H.catalog.byKey.get(pick.clipper),
    cape: H.catalog.byKey.get(pick.gown),
    receipt: value => { receipt = value; },
    pending: value => { pending = value; },
  };
}

(async () => {
  try {
    fs.mkdirSync(path.join(temp, 'runtime'));
    const raw = catalog + '\n' + wardrobe;
    fs.writeFileSync(path.join(temp, 'runtime/customers.js'), raw);
    fs.copyFileSync(path.join(root, 'source/src/index.html'), path.join(temp, 'index.html'));
    execFileSync('python3', [path.join(root, 'android/patch-runtime.py'), temp]);
    const adapted = fs.readFileSync(path.join(temp, 'runtime/customers.js'), 'utf8');
    const h = harness(adapted);
    assert.equal(h.H.catalog.VIDEOS(h.d), 1);
    assert.equal(h.H.catalog.VIDEOS(h.cape), 1);
    assert.equal((h.H.__test.videoBadge(h.d).match(/<svg/g) || []).length, 1);
    tests++;

    await h.ui.take(h.d);
    assert.equal(h.H.rewards.owns(h.d.key), true, 'one completed video unlocks the daily clipper');
    assert.equal(h.W.data.look.clipper, h.d.id);
    assert.equal(h.W.data.progress[h.d.key], undefined);
    assert.equal(h.events.filter(e => e.name === 'rewards_unlock').length, 1);
    await h.ui.take(h.d);
    assert.equal(h.events.filter(e => e.name === 'rewards_unlock').length, 1, 'no duplicate grant');
    tests++;

    const denied = harness(adapted);
    denied.receipt(false);
    await denied.ui.take(denied.d);
    assert.equal(denied.H.rewards.owns(denied.d.key), false, 'cancellation/no fill grants nothing');
    assert.equal(denied.W.data.progress[denied.d.key], undefined);
    assert.equal(denied.button.disabled, false);
    denied.receipt(new Error('ad failed'));
    await denied.ui.take(denied.d);
    assert.equal(denied.H.rewards.owns(denied.d.key), false, 'error grants nothing');
    tests++;

    const legacySave = JSON.parse(JSON.stringify(denied.W.data));
    legacySave.progress[denied.d.key] = 1;
    const resumed = harness(adapted, legacySave);
    assert.equal(resumed.H.rewards.owns(resumed.d.key), true, 'one old partial credit migrates to ownership');
    assert.equal(resumed.W.data.progress[resumed.d.key], undefined);
    tests++;

    await resumed.ui.take(resumed.cape);
    assert.equal(resumed.H.rewards.owns(resumed.cape.key), true, 'cape needs its own one video');
    assert.equal(resumed.W.data.look.gown, resumed.cape.id);
    tests++;

    const concurrent = harness(adapted);
    let finish;
    concurrent.pending(new Promise(resolve => { finish = resolve; }));
    const first = concurrent.ui.take(concurrent.d);
    await concurrent.ui.take(concurrent.d);
    finish(true);
    await first;
    assert.equal(concurrent.H.rewards.owns(concurrent.d.key), true, 'double tap still produces one unlock');
    assert.equal(concurrent.events.filter(e => e.name === 'rewards_unlock').length, 1);
    tests++;

    const ordinary = harness(raw);
    assert.equal(ordinary.H.catalog.VIDEOS(ordinary.d), 1, 'shared/Playables policy remains one video');
    await ordinary.ui.take(ordinary.d);
    assert.equal(ordinary.H.rewards.owns(ordinary.d.key), true);
    tests++;

    const html = fs.readFileSync(path.join(temp, 'index.html'), 'utf8');
    assert.ok(html.includes('<title>Barber Simulator: ASMR Haircut</title>'));
    assert.ok(html.includes('aria-label="Barber Simulator: ASMR Haircut"'));
    tests++;
    console.log(`PASS: ${tests} Android reward cases (one video per item, cancellation/error, old-credit migration, cape, duplicate input, platform parity, title).`);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
