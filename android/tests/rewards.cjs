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
    assert.equal(h.H.catalog.VIDEOS(h.d), 2);
    assert.equal(h.H.catalog.VIDEOS(h.cape), 2);
    assert.equal((h.H.__test.videoBadge(h.d).match(/<svg/g) || []).length, 2);
    tests++;

    await h.ui.take(h.d);
    assert.equal(h.H.rewards.owns(h.d.key), false, 'first completed video must not unlock');
    assert.equal(h.W.data.progress[h.d.key], 1);
    assert.equal(h.W.data.look.clipper, '0', 'first credit must not equip');
    assert.equal((h.H.__test.videoBadge(h.d).match(/class="done"/g) || []).length, 1);
    assert.ok(h.saves.some(s => s.progress[h.d.key] === 1), 'first credit must be saved');
    tests++;

    h.receipt(false);
    await h.ui.take(h.d);
    assert.equal(h.W.data.progress[h.d.key], 1, 'cancellation/no fill keeps first credit');
    assert.equal(h.H.rewards.owns(h.d.key), false);
    assert.equal(h.button.disabled, false);
    h.receipt(new Error('ad failed'));
    await h.ui.take(h.d);
    assert.equal(h.W.data.progress[h.d.key], 1, 'error grants no second credit');
    tests++;

    const resumed = harness(adapted, JSON.parse(JSON.stringify(h.W.data)));
    assert.equal(resumed.W.data.progress[h.d.key], 1, 'credit survives reload');
    await resumed.ui.take(resumed.d);
    assert.equal(resumed.H.rewards.owns(resumed.d.key), true);
    assert.equal(resumed.W.data.look.clipper, resumed.d.id);
    assert.equal(resumed.W.data.progress[resumed.d.key], undefined);
    assert.equal(resumed.events.filter(e => e.name === 'rewards_unlock').length, 1);
    await resumed.ui.take(resumed.d);
    assert.equal(resumed.events.filter(e => e.name === 'rewards_unlock').length, 1, 'no duplicate grant');
    tests++;

    await resumed.ui.take(resumed.cape);
    assert.equal(resumed.H.rewards.owns(resumed.cape.key), false, 'cape needs its own two videos');
    await resumed.ui.take(resumed.cape);
    assert.equal(resumed.H.rewards.owns(resumed.cape.key), true);
    assert.equal(resumed.W.data.look.gown, resumed.cape.id);
    tests++;

    const concurrent = harness(adapted);
    let finish;
    concurrent.pending(new Promise(resolve => { finish = resolve; }));
    const first = concurrent.ui.take(concurrent.d);
    await concurrent.ui.take(concurrent.d);
    finish(true);
    await first;
    assert.equal(concurrent.W.data.progress[concurrent.d.key], 1, 'double tap cannot count as two videos');
    assert.equal(concurrent.H.rewards.owns(concurrent.d.key), false);
    tests++;

    const ordinary = harness(raw);
    assert.equal(ordinary.H.catalog.VIDEOS(ordinary.d), 1, 'shared/Playables policy remains one video');
    await ordinary.ui.take(ordinary.d);
    assert.equal(ordinary.H.rewards.owns(ordinary.d.key), true);
    tests++;

    const html = fs.readFileSync(path.join(temp, 'index.html'), 'utf8');
    assert.ok(html.includes('<title>Barber Simulator: ASMR Haircut</title>'));
    assert.ok(html.includes('aria-label="Barber Simulator: ASMR Haircut"'));
    assert.ok(adapted.includes('" rewarded video" + ((need - done) === 1 ? "" : "s")'));
    tests++;
    console.log(`PASS: ${tests} Android reward cases (two credits, cancellation/error, reload, cape, duplicate input, legacy isolation, title).`);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
