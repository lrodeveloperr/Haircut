'use strict';
// The Android JS bridge (android/native/app/src/main/assets/android-bridge.js) driving the real Android web
// build in Chromium, with a scripted stand-in for the native AndroidHost. Needs `TARGET=full bash
// source/buildall.sh` first. Native AdMob/UMP behaviour itself is verified on a device, not here.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();

const root = path.resolve(__dirname, '../..');
const build = path.join(root, 'source/build');
const bridge = fs.readFileSync(path.join(root, 'android/native/app/src/main/assets/android-bridge.js'), 'utf8');
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.md': 'text/plain' };

// the native side as MainActivity/AdsController behave: storage in a persistent map, ads answered with
// scripted outcomes ('reward' = opened, rewarded, closed; 'dismiss' = opened, closed; 'fail' = failed)
function fakeHost() {
  const store = JSON.parse(localStorage.getItem('fake-android-prefs') || '{}');
  const persist = () => localStorage.setItem('fake-android-prefs', JSON.stringify(store));
  window.__native = { ready: 0, ads: [], outcome: { rewarded: 'reward', interstitial: 'fail' }, failWrites: false };
  const play = (kind, placement) => {
    window.__native.ads.push([kind, placement]);
    const steps = { reward: ['opened', 'rewarded', 'closed'], dismiss: ['opened', 'closed'], fail: ['failed'] }[window.__native.outcome[kind]];
    steps.forEach((s, i) => setTimeout(() => window.__androidHost.ad(kind, s), 120 * (i + 1)));
  };
  window.AndroidHost = {
    gameReady() { window.__native.ready++; },
    storageGet(keys) { return JSON.stringify(JSON.parse(keys).map((k) => (k in store ? store[k] : null))); },
    storageSet(keys, values) {
      if (window.__native.failWrites) return false;
      const v = JSON.parse(values);
      JSON.parse(keys).forEach((k, i) => { if (typeof v[i] !== 'string') throw new Error('non-string save'); store[k] = v[i]; });
      persist();
      return true;
    },
    storageDelete(keys) { JSON.parse(keys).forEach((k) => delete store[k]); persist(); return true; },
    showRewarded(p) { play('rewarded', p); },
    showInterstitial(p) { play('interstitial', p); },
  };
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  let passed = 0;
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true });
    const external = [];
    await ctx.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === 'release.test') {
        const file = path.join(build, url.pathname === '/' ? 'index.html' : url.pathname);
        if (!file.startsWith(build + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
        return route.fulfill({ path: file, contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
      }
      if (url.href === 'https://bridge.playgama.com/v2/stable/playgama-bridge.js') return route.fulfill({ body: bridge, contentType: 'application/javascript' });
      external.push(url.href);
      return route.fulfill({ status: 404, body: '' });
    });
    await ctx.addInitScript(fakeHost);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const boot = async () => {
      await page.goto('http://release.test/');
      await page.waitForFunction(() => window.skinFadeStudio && window.HSC?.wardrobe?.data);
      await page.addStyleTag({ content: '*{animation-play-state:paused!important}' }); // pulsing buttons never settle for a click
    };

    await boot();
    assert.equal(await page.evaluate(() => window.bridge.platform.id), 'android');
    await page.waitForFunction(() => window.__native.ready === 1);
    assert.deepEqual(external, [], 'no network requests besides the replaced bridge');
    passed++;

    // Sites High-only pixel budget, even with old saved Low and a forced Low URL.
    await page.evaluate(() => AndroidHost.storageSet('["skin-fade-studio-detail-v1"]', '["low"]'));
    await page.goto('http://release.test/?detail=low');
    await page.waitForFunction(() => window.skinFadeStudio && window.HSC?.wardrobe?.data);
    await page.addStyleTag({ content: '*{animation-play-state:paused!important}' });
    const graphics = () => page.evaluate(() => {
      const c = document.querySelector('#scene'), d = HSC.detail;
      return { level: d.level, setting: d.setting, strands: d.minStrands, segments: d.segments,
        beard: d.beardMax, simpleShader: d.shaderLow, width: c.width, height: c.height,
        expectedWidth: Math.floor(c.clientWidth * d.pixelRatio(c.clientWidth, c.clientHeight)),
        expectedHeight: Math.floor(c.clientHeight * d.pixelRatio(c.clientWidth, c.clientHeight)),
        renderRatio: d.pixelRatio(c.clientWidth, c.clientHeight) };
    });
    let g = await graphics();
    assert.equal(g.level, 'high'); assert.equal(g.setting, 'fixed');
    assert.equal(g.strands, 30000); assert.equal(g.segments, 8); assert.equal(g.beard, 1); assert.equal(g.simpleShader, false);
    assert.equal(g.width, g.expectedWidth); assert.equal(g.height, g.expectedHeight);
    assert.equal(g.renderRatio, 2, '3x display must use the same fixed High budget as Sites');
    assert.equal(await page.locator('.hsc-detail').count(), 0);
    passed++;

    // Trusted touch uses the same visible-blade offset as Sites/YouTube.
    const point = await page.evaluate(() => {
      const game = skinFadeStudio, view = HSC.view;
      if (game.getState().interactionMode !== 'cut') game.toggleClipper();
      game.selectGuard(1);
      const box = view.headScreen();
      let p;
      for (const y of [0.2, 0.3, 0.4, 0.5]) {
        for (const x of [0.5, 0.4, 0.6]) {
          const candidate = { x: box.left + (box.right - box.left) * x, y: box.top + (box.bottom - box.top) * y };
          if (view.raycast(candidate.x, candidate.y)) { p = candidate; break; }
        }
        if (p) break;
      }
      if (!p) throw Error('no valid head contact for touch test');
      window.__touchRays = [];
      const raycast = view.raycast;
      view.raycast = (x, y) => { __touchRays.push({ x, y }); return raycast(x, y); };
      return { ...p, contactY: p.y + Math.min(72, document.querySelector('#scene').clientHeight * 0.12) };
    });
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.contactY }] });
    await page.waitForTimeout(200);
    const rays = await page.evaluate(() => __touchRays);
    assert(rays.length > 0, 'touch must reach the actual raycaster');
    assert(Math.abs(rays[0].x - point.x) < 1 && Math.abs(rays[0].y - point.y) < 1, 'blade target must match the Sites mapping');
    assert(rays[0].y < point.contactY - 40, 'finger must not cover the cutting blade');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x + 10, y: point.contactY + 10 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    passed++;

    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(250);
    g = await graphics();
    assert.equal(g.width, g.expectedWidth); assert.equal(g.height, g.expectedHeight);
    await page.evaluate(() => { window.__androidHost.pause(true); window.__androidHost.pause(false); });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    g = await graphics();
    assert.equal(g.width, g.expectedWidth); assert.equal(g.height, g.expectedHeight);
    assert.equal(g.level, 'high'); assert.equal(g.strands, 30000);
    passed++;

    // A restored context must redraw an idle scene at full detail without changing the haircut.
    const savedHair = await page.evaluate(() => JSON.stringify(skinFadeStudio.getState().hair));
    await page.evaluate(() => {
      const canvas = document.querySelector('#scene');
      const gl = canvas.getContext('webgl2');
      if (!gl || !gl.getExtension('WEBGL_lose_context')) throw Error('context-loss test requires WEBGL_lose_context');
      if (!gl.getContextAttributes().antialias) throw Error('High must request an antialiased context');
      window.__restoreDraws = 0;
      const render = HSC.view.render;
      HSC.view.render = (...args) => { __restoreDraws++; return render(...args); };
      const lose = gl.getExtension('WEBGL_lose_context');
      canvas.addEventListener('webglcontextlost', () => setTimeout(() => lose.restoreContext(), 150), { once: true });
      lose.loseContext();
    });
    await page.waitForFunction(() => __restoreDraws > 0 && !document.querySelector('#scene').getContext('webgl2').isContextLost());
    assert.equal(await page.evaluate(() => JSON.stringify(skinFadeStudio.getState().hair)), savedHair);
    g = await graphics();
    assert.equal(g.width, g.expectedWidth); assert.equal(g.height, g.expectedHeight);
    assert.equal(g.level, 'high'); assert.equal(g.strands, 30000);
    passed++;

    // two completed rewarded videos unlock today's clipper; the first saves 1/2 and survives a reload
    const key = await page.evaluate(() => HSC.wardrobe.data.pick.clipper);
    await page.locator('#hsc-hud .hsc-rw').click();
    await page.locator('.hsc-vbtn').click();
    await page.waitForFunction((k) => HSC.wardrobe.data.progress[k] === 1, key);
    assert.equal(await page.evaluate((k) => HSC.rewards.owns(k), key), false);
    await page.waitForTimeout(600);
    await boot();
    assert.equal(await page.evaluate((k) => HSC.wardrobe.data.progress[k], key), 1, 'first credit saved in app storage');
    passed++;

    // a dismissed or failed ad gives nothing and does not hang the button
    await page.locator('#hsc-hud .hsc-rw').click();
    for (const outcome of ['dismiss', 'fail']) {
      await page.evaluate((o) => { window.__native.outcome.rewarded = o; }, outcome);
      await page.locator('.hsc-vbtn').click();
      await page.waitForFunction(() => !document.querySelector('.hsc-vbtn').disabled && window.bridge.advertisement.rewardedState === 'closed');
      assert.equal(await page.evaluate((k) => HSC.wardrobe.data.progress[k], key), 1, outcome + ' must not credit');
    }
    passed++;

    await page.evaluate(() => { window.__native.outcome.rewarded = 'reward'; });
    await page.locator('.hsc-vbtn').click();
    await page.waitForFunction((k) => HSC.rewards.owns(k), key);
    // since the reload: dismissed, failed, completed
    assert.equal(await page.evaluate(() => window.__native.ads.filter(([k, p]) => k === 'rewarded' && p === 'unlock-item').length), 3);
    passed++;

    // Android back: closes the open wardrobe, then reports nothing left to close
    assert.equal(await page.evaluate(() => window.__androidHost.back()), true);
    await page.locator('#hsc-panel.open').waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => window.__androidHost.back()), false);
    passed++;

    // app pause/resume from the activity lifecycle
    await page.evaluate(() => window.__androidHost.pause(true));
    assert.equal(await page.evaluate(() => skinFadeStudio.getView().paused), true);
    await page.evaluate(() => window.__androidHost.pause(false));
    assert.equal(await page.evaluate(() => skinFadeStudio.getView().paused), false);
    passed++;

    // a failed write is reported to the game, not silently dropped
    await page.evaluate(() => { window.__native.failWrites = true; });
    await assert.rejects(page.evaluate(() => window.bridge.storage.set(['probe'], ['1'])), /write failed/);
    await page.evaluate(() => { window.__native.failWrites = false; });
    passed++;

    assert.deepEqual(errors, []);
    console.log(`PASS: ${passed} Android bridge cases (fixed Sites High, visible blade/trusted touch, rotation, saves, rewards, back, pause, write failure).`);
  } catch (e) {
    console.error(`FAIL after ${passed} passing cases:`, String(e.message || e).split('\n')[0]);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
