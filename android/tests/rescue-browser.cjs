'use strict';
// Rescue: every botched cut, hair and beard, can be put right with the clipper alone. Runs the game's own generator.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const build = path.resolve(__dirname, '../../source/build');
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const context = await browser.newContext({ viewport: { width: 412, height: 892 } });
    await context.route('http://rescue.test/**', (route) => { const u = new URL(route.request().url()), f = path.join(build, u.pathname === '/' ? 'index.html' : u.pathname); return fs.existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' }); });
    await context.addInitScript(() => { window.__androidRewardedReady = true; window.AndroidHost = { request(id, op) { setTimeout(() => __androidHost.complete(id, true, op === 'load' ? '{}' : ''), 0); }, gameReady() {}, homeReady() {}, showRewarded() {}, showInterstitial() {}, openPrivacy() {}, showPrivacyOptions() {} }; });
    const page = await context.newPage();
    page.setDefaultTimeout(200000);
    await page.goto('http://rescue.test/');
    await page.waitForFunction(() => window.skinFadeStudio && HSC.startupTiming?.firstPlayable && HSC.requestKit && HSC.walkIns && HSC.debugState && HSC.debugState.coarse);
    const r = await page.evaluate(() => {
      const B = HSC.modes.build, reach = HSC.beardReach(), out = { jobs: 0, none: 0, hairUp: 0, beardUp: 0, unseen: 0, faint: 0, minSeen: 1e9, small: 0, beards: 0, beardFar: 0, beardFaint: 0, flaws: {}, byType: {}, beardFlaws: {} };
      for (let i = 1; i <= 2000; i++) {
        const P = HSC.makePerson(i * 6151), w = HSC.pickWalkIn(P, []); if (!w) continue;
        const h = HSC.walkIns.build(w), b0 = HSC.beardStartFor(P), j = B.disaster(P, h, HSC.rng(i * 31 + 7), null, b0);
        if (!j) { out.none++; continue; }
        out.jobs++;
        // a rescue must look like a bad haircut: its mistakes stand two lengths (6 mm) off the finished style he should
        // have had, or bare where that style keeps hair, over a real area; and the repair is real work
        const T = HSC.requestKit.targetFor(j.style, h);
        let up = 0, mark = 0, seen = 0, work = 0; for (let c = 0; c < 8192; c++) { if (j.target[c] > j.start[c]) up++; if (j.start[c] !== h[c]) mark++; const a = j.start[c], b = T[c]; if (Math.abs(a - b) >= 2 || (Math.min(a, b) === 0 && Math.max(a, b) >= 1)) seen++; if (j.start[c] > j.target[c]) work++; }
        if (up) out.hairUp++; if (mark < 60) out.unseen++; if (seen < 150) out.faint++; if (work < 120) out.small++; out.minSeen = Math.min(out.minSeen, seen);
        const ty = P.hair.type[0];
        for (const f of j.flaws) { out.flaws[f] = (out.flaws[f] || 0) + 1; out.byType[ty + ':' + f] = (out.byType[ty + ':' + f] || 0) + 1; }
        if (j.beard) {
          out.beards++; out.beardFlaws[j.beard.flaw] = (out.beardFlaws[j.beard.flaw] || 0) + 1;
          let bu = 0, need = 0, ok = 0; for (let c = 0; c < 8192; c++) { const a = j.beard.start[c], t = j.beard.target[c]; if (t > a) bu++; if (t < a) { need++; if (reach.some((l) => l <= a && Math.abs(l - t) <= 1)) ok++; } }
          if (bu) out.beardUp++; if (need && ok / need < 0.85) out.beardFar++;
          let bs = 0; for (let c = 0; c < 8192; c++) if (j.beard.start[c] - j.beard.target[c] >= 2) bs++;
          if (bs < 30) out.beardFaint++;
        }
      }
      return out;
    });
    console.log(JSON.stringify(r));
    assert.equal(r.none, 0, 'every Rescue customer has a hair disaster');
    assert.equal(r.hairUp, 0, 'no hair repair needs hair to grow');
    assert.equal(r.beardUp, 0, 'no beard repair needs hair to grow');
    assert.equal(r.beardFar, 0, 'every beard repair is within the guards');
    assert.equal(r.unseen, 0, 'every botch can be seen');
    assert.equal(r.faint, 0, 'every botch stands two lengths off the style, or hair against bare skin, over at least 150 cells');
    assert.equal(r.small, 0, 'every repair is real work');
    assert.equal(r.beardFaint, 0, 'every botched beard shows');
    assert.ok(r.beards > 200, 'beards get botched too');
    console.log('PASS: rescue (' + r.jobs + ' jobs, ' + r.beards + ' with a beard): every mistake can be seen and repaired with the clipper.');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
