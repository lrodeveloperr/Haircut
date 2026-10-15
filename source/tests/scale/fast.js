// All screens from one loaded game: each state is set up once, then the page is resized through every screen
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
const SCREENS = require('fs').readFileSync('tests/scale/scale.js', 'utf8').match(/\['[a-z0-9-]+', \d+, \d+\]/g).map((s) => eval(s));
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/playgama-bridge.js', (r) => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.goto('http://localhost:8124/index.html');
  await p.waitForFunction(() => globalThis.skinFadeStudio && HSC.wardrobe.data, null, { timeout: 90000 });
  await p.waitForTimeout(1500);
  const sweep = async (st) => { if (process.env.STATES && !process.env.STATES.split(',').includes(st)) return; for (const [n, w, h] of SCREENS) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(st === 'done' ? 900 : 600); await p.screenshot({ path: `tests/scale/${n}-${st}.png` }); } console.log(st, 'done', new Date().toISOString().slice(11, 19)); };
  await sweep('cut');
  await p.setViewportSize({ width: 412, height: 915 });
  await p.click('#hsc-hud .hsc-rw'); await p.waitForTimeout(500);
  await sweep('wardrobe');
  await p.evaluate(() => { const W = HSC.wardrobe; for (let i = 0; i < 300; i++) W.bits.clipper[i >> 3] |= 1 << (i & 7); document.querySelector('#hsc-panel .hsc-x').click(); });
  await p.setViewportSize({ width: 412, height: 915 }); await p.waitForTimeout(700);
  await p.click('#hsc-hud .hsc-rw', { force: true }); await p.click('.hsc-tab[data-tool=clipper]', { force: true }); await p.waitForTimeout(400);
  await sweep('wardrobe300');
  await p.evaluate(() => { document.querySelector('#hsc-panel .hsc-x').click(); document.querySelectorAll('.tutorial').forEach((e) => (e.style.display = 'none')); HSC.meta.data.cuts = 1; skinFadeStudio.toggleClipper(); skinFadeStudio.selectGuard(0); });
  await p.setViewportSize({ width: 412, height: 915 }); await p.waitForTimeout(700);
  await p.mouse.move(170, 370); await p.mouse.down(); for (let i = 1; i <= 4; i++) await p.mouse.move(170 + i * 12, 370); await p.mouse.up();
  await p.evaluate(() => skinFadeStudio.finish());
  await p.waitForFunction(() => document.querySelector('#hsc-hub.show'), null, { timeout: 90000 }); await p.waitForTimeout(900);
  await sweep('done');
  console.log(errs.length ? errs : 'no errors');
  await b.close();
})();
