'use strict';
// Customer contact sheet (plan 5.5): a grid of real customers from the real game, for a person to review by eye.
// Each customer is drawn by the game itself, from the front, with the same seeds every run.
//   node qa/customer-contact-sheet.cjs [out.png] [count]     (build first: cd source && TARGET=full bash buildall.sh)
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'), build = path.join(root, 'source/build');
const out = path.resolve(process.argv[2] || path.join(root, 'qa/results/customer-contact-sheet.png')), COUNT = +process.argv[3] || 48, COLS = 8, CELL = 150;
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.json': 'application/json' };

(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const context = await browser.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 1 });
    await context.route('http://sheet.test/**', async (route) => {
      const url = new URL(route.request().url()), file = path.join(build, url.pathname === '/' ? 'index.html' : url.pathname);
      if (!file.startsWith(build + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
      await route.fulfill({ path: file, contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    await context.addInitScript(() => {
      window.AndroidHost = { request(id, op) { setTimeout(() => __androidHost.complete(id, true, op === 'load' ? '{}' : ''), 0); }, gameReady() {}, showRewarded() {}, showInterstitial() {}, openPrivacy() {}, showPrivacyOptions() {} };
    });
    const page = await context.newPage();
    page.setDefaultTimeout(180000);
    await page.goto('http://sheet.test/');
    await page.waitForFunction(() => window.HSC && HSC.modes && HSC.menu && globalThis.skinFadeStudio && HSC.debugState && HSC.debugState.coarse);
    await page.evaluate(async () => { await HSC.menu.play('free'); });
    const cells = [];
    for (let i = 0; i < COUNT; i++) {
      const seed = ((i + 1) * 2654435761) >>> 0;
      const info = await page.evaluate(async (s) => {
        const p = HSC.makePerson(s); HSC.debugOverride = p;
        await HSC.modes.newCustomer();
        return { years: p.years, beard: p.beard.style, hair: p.hair && p.hair.type };
      }, seed);
      await page.waitForFunction(() => { const s = skinFadeStudio.getState(); return s.status === 'cutting' && s.look.person === HSC.debugOverride; });
      await page.evaluate(() => { const g = skinFadeStudio, s = g.getState(); g.turn(180 - s.cameraYawDeg); });
      await page.waitForTimeout(700);
      const png = await page.screenshot({ clip: { x: 36, y: 210, width: 340, height: 480 } });
      cells.push({ src: 'data:image/png;base64,' + png.toString('base64'), label: `${seed.toString(36)} · ${info.years} · ${info.hair} · ${info.beard}` });
    }
    const sheet = await context.newPage();
    const rows = Math.ceil(COUNT / COLS);
    await sheet.setViewportSize({ width: COLS * CELL, height: rows * (CELL * 1.41 + 18) });
    await sheet.setContent(`<body style="margin:0;background:#20242a;display:grid;grid-template-columns:repeat(${COLS},${CELL}px);font:10px sans-serif;color:#dfe6ee">${cells.map((c) => `<figure style="margin:0"><img src="${c.src}" style="width:${CELL}px;display:block"><figcaption style="height:18px;line-height:18px;overflow:hidden;white-space:nowrap;padding:0 4px">${c.label}</figcaption></figure>`).join('')}</body>`);
    await sheet.waitForTimeout(500);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sheet.screenshot({ path: out, fullPage: true });
    console.log('PASS: contact sheet of ' + COUNT + ' customers: ' + path.relative(root, out));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
