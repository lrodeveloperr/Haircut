const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r => errs.push('req ' + r.url().slice(0, 80)));
  await p.goto('file://' + require('path').resolve(process.argv[2] || 'dist/play.html'));
  await p.waitForFunction(() => globalThis.skinFadeStudio && HSC.wardrobe.data && HSC.meta.data, null, { timeout: 60000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'single.png' });
  console.log(errs.length ? errs : 'boots, no errors', await p.evaluate(() => document.documentElement.dataset.bootError || 'no boot error'));
  await b.close();
})();
