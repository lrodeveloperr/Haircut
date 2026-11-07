'use strict';
// Every beard a customer can walk in with can be taken off completely, with the clipper alone, on the real head. Sweeps
// guard 0 over the screen from the angles the player can turn and tilt to, through the game's own hit test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const build = path.resolve(__dirname, '../../source/build');
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const context = await browser.newContext({ viewport: { width: 412, height: 892 } });
    await context.route('http://beards.test/**', (route) => {
      const u = new URL(route.request().url()), file = path.join(build, u.pathname === '/' ? 'index.html' : u.pathname);
      return fs.existsSync(file) ? route.fulfill({ path: file }) : route.fulfill({ status: 404, body: '' });
    });
    await context.addInitScript(() => { window.AndroidHost = { request(id, op) { setTimeout(() => __androidHost.complete(id, true, op === 'load' ? '{}' : ''), 0); }, gameReady() {}, showRewarded() {}, showInterstitial() {}, openPrivacy() {}, showPrivacyOptions() {} }; });
    const page = await context.newPage();
    page.setDefaultTimeout(240000);
    await page.goto('http://beards.test/');
    await page.waitForFunction(() => window.skinFadeStudio && HSC.startupTiming?.firstPlayable && HSC.menu && HSC.debugState && HSC.debugState.coarse);
    await page.evaluate(async () => { await HSC.menu.play('free'); });
    const out = [];
    for (const h of (process.env.BEARD_GROUPS || '0,3,5,8').split(',').map(Number)) {
      await page.evaluate(async (hh) => { HSC.debugOverride = HSC.makePerson(777 + hh, { beard: 'bandholz', heritage: hh, age: 'middle', noLoss: true }); await skinFadeStudio.skip(); }, h);
      await page.waitForFunction(() => { const s = skinFadeStudio.getState(); return s.status === 'cutting' && s.look.person === HSC.debugOverride; });
      out.push(await page.evaluate(async () => {
        const g = skinFadeStudio, S = HSC.beardSurface, P = HSC.debugOverride, styles = HSC.BEARD_ARRIVALS.concat('stubble', 'stubble1');
        const starts = styles.map((st) => HSC.beardStartFor(Object.assign({}, HSC.makePerson(P.seed, { beard: st, heritage: HSC.HERITAGE.findIndex((x) => x.id === P.heritage), age: 'middle', noLoss: true }))));
        const all = new Array(8192).fill(0); for (const a of starts) for (let i = 0; i < 8192; i++) if (a[i] > all[i]) all[i] = a[i];
        let s = { status: 'cutting', interactionMode: 'cut', selectedGuard: 0, beard: all, cutStrokeCount: 0, jobId: -1 };
        const cut = HSC.cutBeard, keep = HSC.setBeard; HSC.setBeard = () => {};
        for (const elev of [10, -40]) for (let yaw = 0; yaw < 360; yaw += 45) {
          const now = g.getState(); g.turn(yaw - now.cameraYawDeg, elev - now.cameraElevation); await new Promise((r) => setTimeout(r, 900));
          // real strokes: each column is one continuous pass down the screen, as a finger makes
          for (let x = 12; x < 400; x += 8) {
            let prev = null;
            for (let y = 120; y < 860; y += 8) {
              const hit = HSC.view.raycast(x, y), on = hit && hit.kind === 'beard';
              if (on) s = cut(s, prev ? [prev, hit] : [hit], S).state;
              prev = on ? hit : null;
            }
          }
        }
        HSC.setBeard = keep;
        const left = {}; let total = 0;
        const where = []; for (let i = 0; i < 8192; i++) if (all[i] > 0 && s.beard[i] > 0) where.push([0, 1, 2].map((k) => +S.positions[i * 3 + k].toFixed(2)));
        styles.forEach((st, k) => { let n = 0; for (let i = 0; i < 8192; i++) if (starts[k][i] > 0 && s.beard[i] > 0) n++; if (n) left[st] = n; total += n; });
        return { heritage: P.heritage, styles: styles.length, left, total, where: where.slice(0, 6), cells: all.filter((v) => v > 0).length };
      }));
    }
    console.log(JSON.stringify(out));
    for (const r of out) assert.equal(r.total, 0, r.heritage + ' leaves beard that cannot be shaved: ' + JSON.stringify(r.left));
    console.log('PASS: every beard (' + out[0].styles + ' styles, ' + out.length + ' groups) can be shaved to the skin with the clipper.');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
