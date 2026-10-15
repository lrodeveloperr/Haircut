const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  for (const [w, h, tag] of [[412, 915, 'port'], [915, 412, 'land']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5 });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route('**/playgama-bridge.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
    await p.goto('http://localhost:8124/index.html');
    await p.waitForFunction(() => globalThis.skinFadeStudio && HSC.wardrobe.data, null, { timeout: 60000 });
    await p.evaluate(() => document.querySelectorAll('.tutorial').forEach((e) => (e.style.display = 'none')));
    const st = () => p.evaluate(() => ({ tiles: document.querySelectorAll('.hsc-tile[data-key]').length, ghost: document.querySelectorAll('.hsc-tile.ghost').length, pager: !document.querySelector('.hsc-pager').hidden, page: document.querySelector('.hsc-page').textContent, prevOff: document.querySelectorAll('.hsc-arrow')[0].disabled, nextOff: document.querySelectorAll('.hsc-arrow')[1].disabled, first: (document.querySelector('.hsc-tile[data-key]') || {}).dataset.key, sheet: Math.round(document.querySelector('.hsc-sheet').getBoundingClientRect().height), vh: innerHeight }));
    // new player
    await p.click('#hsc-hud .hsc-rw'); await p.waitForTimeout(300);
    console.log(tag, 'new player', JSON.stringify(await st()));
    if (tag === 'port') await p.screenshot({ path: 'pt-1.png' });
    // unlock today's pick: it leads the wardrobe
    await p.click('.hsc-vbtn', { force: true }); await p.waitForTimeout(1200);
    console.log(tag, 'after pick', JSON.stringify(await st()), JSON.stringify(await p.evaluate(() => HSC.wardrobe.data.recent)));
    // 300 owned: pages, with timing
    await p.evaluate(() => { const W = HSC.wardrobe; for (let i = 0; i < 300; i++) W.bits.clipper[i >> 3] |= 1 << (i & 7); W.data.recent.push('clipper:250', 'clipper:120'); document.querySelector('#hsc-panel .hsc-head .hsc-x').click(); });
    const ms = await p.evaluate(async () => { const t0 = performance.now(); document.querySelector('#hsc-hud .hsc-rw').click(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return Math.round(performance.now() - t0); });
    await p.click('.hsc-tab[data-tool=clipper]'); await p.waitForTimeout(300);
    console.log(tag, '300 owned, open ms', ms, JSON.stringify(await st()));
    if (tag === 'port') await p.screenshot({ path: 'pt-2.png' });
    await p.click('.hsc-arrow[data-dir="1"]'); await p.click('.hsc-arrow[data-dir="1"]'); await p.waitForTimeout(300);
    console.log(tag, 'two pages on', JSON.stringify(await st()));
    if (tag === 'port') await p.screenshot({ path: 'pt-3.png' }); else await p.screenshot({ path: 'pt-land.png' });
    // wear one from page 3: back to page 1 with it first
    const k = await p.evaluate(() => document.querySelectorAll('.hsc-tile[data-key]')[2].dataset.key);
    await p.click(`.hsc-tile[data-key="${k}"]`, { force: true }); await p.waitForTimeout(300);
    console.log(tag, 'wore', k, JSON.stringify(await st()));
    console.log(errs.length ? errs : 'no errors');
    await p.close();
  }
  await b.close();
})();
