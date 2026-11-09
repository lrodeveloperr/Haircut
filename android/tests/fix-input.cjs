'use strict';
// Keys and back over the screens that cover the chair (menu.js, hub.js, salon.js, shop.js):
//   no key reaches the haircut while Home, the Shop, Settings or the Open splash covers it, or a form control has focus;
//   Escape closes the top layer only (Settings or the Shop's 3D tabs, never Home with them);
//   a part short of coins is still picked after the one video that closes the gap;
//   Android back: on Home it returns to a haircut under way and exits only with nothing under way; it waits out the
//   reveal spin; during the Open splash it only lets the splash go.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const build = path.resolve(__dirname, '../../source/build');
const ANGLE = process.env.ANGLE ? ['--use-angle=' + process.env.ANGLE] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', ...ANGLE] });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    await context.route('http://input.test/**', (route) => { const u = new URL(route.request().url()), f = path.join(build, u.pathname === '/' ? 'index.html' : u.pathname); return fs.existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' }); });
    await context.addInitScript(() => { window.__androidRewardedReady = true; window.AndroidHost = { request(id, op, payload) { setTimeout(() => { if (op === 'save') localStorage.setItem('in-save', JSON.parse(payload)); __androidHost.complete(id, true, op === 'load' ? localStorage.getItem('in-save') || '{}' : ''); }, 5); }, gameReady() {}, homeReady() {}, showRewarded() { setTimeout(() => { __androidHost.ad('rewarded', 'opened'); __androidHost.ad('rewarded', 'rewarded'); __androidHost.ad('rewarded', 'closed'); }, 20); }, showInterstitial() { setTimeout(() => __androidHost.ad('interstitial', 'failed'), 10); }, openPrivacy() {}, showPrivacyOptions() {}, shareGame() {} }; });
    const page = await context.newPage();
    page.setDefaultTimeout(400000);
    const wait = (fn) => page.waitForFunction(fn, null, { polling: 250, timeout: 400000 });
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    const ready = () => wait(() => window.skinFadeStudio && HSC.startupTiming?.firstPlayable && HSC.econ && HSC.collection && HSC.menu && document.querySelector('#hsc-menu'));
    const finish = () => page.evaluate(async () => { const g = skinFadeStudio, s = g.getState(); await g.restore(s.hair.map((v, i) => (i % 3 ? v : Math.max(0, v - 1))), s.beard, s.brow); g.getState().cutStrokeCount = 3; await g.finish(); });
    const st = () => page.evaluate(() => { const s = skinFadeStudio.getState(); return { status: s.status, job: s.jobId, guard: s.selectedGuard, yaw: s.cameraYawDeg, clip: s.clipperOn, strokes: s.cutStrokeCount, menu: !!document.querySelector('#hsc-menu.open'), home: !document.querySelector('#hsc-menu .page.home').hidden, set: !!document.querySelector('#hsc-set.open'), salon: !!document.querySelector('#hsc-salon.open'), focus: document.activeElement && document.activeElement.tagName }; });
    const key = async (k) => { await page.keyboard.press(k); await page.waitForTimeout(150); };
    const same = (a, b, what) => { for (const k of ['status', 'job', 'guard', 'yaw', 'clip', 'strokes']) assert.equal(b[k], a[k], what + ': ' + k + ' changed'); };
    const back = () => page.evaluate(() => __androidHost.back());

    // a returning barber: one customer done, then the game opens on Home
    await page.goto('http://input.test/', { waitUntil: 'commit', timeout: 400000 }); await ready();
    await finish(); await wait(() => HSC.meta.data.cuts >= 1 && HSC.meta.data.lastRound); await page.waitForTimeout(2500);
    await page.reload({ waitUntil: 'commit', timeout: 400000 }); await ready();
    await wait(() => skinFadeStudio.getState().status === 'reveal' && skinFadeStudio.getView().revealComplete);
    await page.evaluate(() => skinFadeStudio.next());
    await wait(() => skinFadeStudio.getState().status === 'cutting' && document.querySelector('#hsc-menu.open'));

    // Home, Modes, the Coins tab, Settings with the language list focused, the Shop's 3D tabs: no key reaches the chair
    const s0 = await st();
    for (const k of ['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown', '+', '-', '=', ' ', 'Enter']) await key(k);
    same(s0, await st(), 'Home');
    await page.locator('#hsc-menu [data-b=modes]').click(); await page.waitForTimeout(300);
    await key('Enter'); await key('ArrowUp'); await page.waitForTimeout(500);
    same(s0, await st(), 'Modes + Enter');
    await key('Escape'); assert.ok((await st()).home, 'Escape on Modes goes back to Home');
    await page.evaluate(() => HSC.shop.go('coins')); await page.waitForTimeout(300);
    await key('ArrowRight'); await key('Enter'); same(s0, await st(), 'Coins tab');
    await key('Escape');
    await page.evaluate(() => HSC.settings.open()); await page.waitForTimeout(300);
    await page.focus('#hsc-language');
    for (const k of [' ', 'Enter', 'ArrowDown']) await key(k);
    same(s0, await st(), 'Settings language list');
    await key('Escape');
    let s = await st(); assert.ok(!s.set && s.menu && s.home, 'Escape closes Settings and leaves Home open');
    await page.evaluate(() => HSC.shop.go('parts')); await page.waitForTimeout(500);
    for (const k of ['ArrowLeft', 'ArrowUp', 'Enter', ' ']) await key(k);
    same(s0, await st(), 'Parts');
    await key('Escape');
    s = await st(); assert.ok(!s.salon && s.menu && s.home, 'Escape closes Parts like its back button, Home stays');
    await page.evaluate(() => HSC.shop.go('shops')); await page.waitForTimeout(500);
    await page.focus('#hsc-shop-name'); await key('ArrowLeft'); await key('Escape');
    s = await st(); assert.ok(s.salon && s.focus !== 'INPUT', 'Escape in the shop name only leaves the field');
    await key('Escape');
    s = await st(); assert.ok(!s.salon && s.menu && s.home, 'Escape closes Shops');

    // short of coins for a part: the one video closes the gap and the part is still picked
    const u4 = await page.evaluate(async () => {
      const S = HSC.salon, pause = (ms) => new Promise((r) => setTimeout(r, ms));
      if (!HSC.wishVideo.state()) return { skip: true };
      let slot, o;
      for (const k of S.SLOTS) { o = S.OPTIONS[k].find((x, i) => i > 0 && !S.owns(k, x)); if (o) { slot = k; break; } }
      const diff = S.priceOf(slot, o) - 1 - HSC.coins.get();
      if (diff > 0) await HSC.coins.add(diff, 'misc'); else if (diff < 0) await HSC.coins.spend(-diff, 'misc', 'input-test:' + Date.now());
      HSC.shop.go('parts'); await pause(300);
      document.querySelector(`#hsc-salon .cats [data-s="${slot}"]`).click(); await pause(200);
      document.querySelector(`#hsc-salon .cards [data-o="${o}"]`).click(); await pause(200);
      document.querySelector('#hsc-salon .act .buy').click(); await pause(300);
      const nb = document.querySelector('#hsc-menu .page.shop [data-need]');
      if (!nb) return { slot, o, video: false };
      nb.click();
      for (let i = 0; i < 50 && !document.querySelector('#hsc-salon.open'); i++) await pause(100);
      await pause(300);
      const buy = document.querySelector('#hsc-salon .act .buy');
      return { slot, o, video: true, cat: document.querySelector('#hsc-salon .cats .on')?.dataset.s, sel: document.querySelector('#hsc-salon .cards .card.sel')?.dataset.o, buy: !buy.hidden && !buy.dataset.short };
    });
    if (!u4.skip) {
      assert.ok(u4.video, 'one video closes the gap');
      assert.equal(u4.cat, u4.slot, 'back on the same part');
      assert.equal(u4.sel, u4.o, 'the part is still picked');
      assert.ok(u4.buy, 'and can be bought now');
    }
    await page.evaluate(() => document.querySelector('#hsc-salon.open .x')?.click()); await page.waitForTimeout(300);

    // Android back on Home: nothing under way -> not handled (the app closes); a haircut under way -> back to the chair
    if (!(await st()).menu) await page.evaluate(() => HSC.menu.open());
    assert.equal(await back(), false, 'back on Home with an untouched customer leaves the app');
    await page.evaluate(() => HSC.menu.close());
    await page.evaluate(async () => { const g = skinFadeStudio, s1 = g.getState(); await g.restore(s1.hair.map((v, i) => (i % 3 ? v : Math.max(0, v - 1))), s1.beard, s1.brow); g.getState().cutStrokeCount = 3; });
    assert.equal(await back(), true); assert.ok((await st()).menu, 'back in the chair opens Home');
    const j = (await st()).job;
    assert.equal(await back(), true); s = await st();
    assert.ok(!s.menu && s.status === 'cutting' && s.job === j, 'back on Home returns to the haircut under way');
    const g0 = s.guard; await key(g0 < 4 ? 'ArrowUp' : 'ArrowDown');
    assert.notEqual((await st()).guard, g0, 'keys still reach the chair when nothing covers it');

    // back during the reveal spin waits; after it, Home; then a mode switch shows the Open splash and back only lets it go
    await finish(); await wait(() => skinFadeStudio.getState().status === 'reveal');
    const spin = await page.evaluate(() => ({ spin: !skinFadeStudio.getView().revealComplete, r: HSC.menuBack(), menu: !!document.querySelector('#hsc-menu.open') }));
    if (spin.spin) { assert.equal(spin.r, true); assert.ok(!spin.menu, 'back during the reveal spin does not open Home'); }
    await wait(() => skinFadeStudio.getView().revealComplete && document.querySelector('#hsc-hub.show'));
    assert.equal(await back(), true); assert.ok((await st()).menu, 'back after the spin opens Home');
    const sp = await page.evaluate(async () => {
      await HSC.menu.play('free');
      const el = document.querySelector('#hsc-reveal'), on = !!(el && el.classList.contains('on'));
      // Enter over the splash never finishes the customer it opens on
      const job = skinFadeStudio.getState().jobId;
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 300));
      const kept = skinFadeStudio.getState().status === 'cutting' && skinFadeStudio.getState().jobId === job;
      const r = HSC.menuBack();
      return { on, kept, r, menu: !!document.querySelector('#hsc-menu.open'), cls: el && el.className };
    });
    if (sp.on) { assert.ok(sp.kept, 'Enter over the splash does not finish the customer'); assert.equal(sp.r, true); assert.ok(!sp.menu, 'back during the Open splash does not open Home'); assert.match(sp.cls, /out/, 'the splash goes'); }
    assert.deepEqual(errors, []);
    console.log('fix-input-ok', JSON.stringify({ u4, spin, splash: sp }));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
