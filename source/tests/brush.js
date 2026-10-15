const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.route('**/playgama-bridge.js', (r) => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.goto('http://localhost:8124/index.html');
  await p.waitForFunction(() => globalThis.skinFadeStudio && HSC.wardrobe.data, null, { timeout: 60000 });
  await p.evaluate(() => { document.querySelectorAll('.tutorial').forEach((e) => (e.style.display = 'none')); skinFadeStudio.toggleClipper(); skinFadeStudio.selectGuard(0); });
  for (const y of [0.3, 0.34, 0.38]) { await p.mouse.move(412 * 0.3, 915 * y); await p.mouse.down(); for (let i = 1; i <= 8; i++) await p.mouse.move(412 * (0.3 + i * 0.05), 915 * y); await p.mouse.up(); }
  const S = () => p.evaluate(() => HSC.clippingsStats());
  for (let i = 0; i < 8; i++) { await p.waitForTimeout(700); }
  console.log('before finish', JSON.stringify(await S()));
  await p.screenshot({ path: 'brush-0.png' });
  await p.evaluate(() => skinFadeStudio.finish());
  const t0 = Date.now();
  for (let i = 0; i < 12; i++) { await p.waitForTimeout(500); console.log(`+${Date.now() - t0}ms`, JSON.stringify(await S()), ''); if (i === 1) await p.screenshot({ path: 'brush-1.png' }); if (i === 3) await p.screenshot({ path: 'brush-1b.png' }); }
  await p.screenshot({ path: 'brush-2.png' });
  console.log(errs.length ? errs : 'no errors');
  await b.close();
})();
