const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [w, h, tag] of [[412, 915, 'port'], [915, 412, 'land'], [360, 640, 'small']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5 });
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.route('**/playgama-bridge.js', (r) => r.fulfill({ body: '', contentType: 'text/javascript' }));
    await p.goto('http://localhost:8124/index.html');
    await p.waitForFunction(() => globalThis.skinFadeStudio && HSC.wardrobe.data, null, { timeout: 60000 });
    await p.evaluate(() => document.querySelectorAll('.tutorial').forEach((e) => (e.style.display = 'none')));
    // cut some hair: clipper on, drag across the head
    await p.evaluate(() => { skinFadeStudio.toggleClipper(); skinFadeStudio.selectGuard(0); });
    await p.mouse.move(w * 0.35, h * 0.42); await p.mouse.down();
    for (let i = 0; i <= 20; i++) await p.mouse.move(w * (0.35 + i * 0.015), h * (0.42 + (i % 2) * 0.03));
    await p.mouse.up();
    const sum = () => p.evaluate(() => { const s = skinFadeStudio.getState(); const d = (a, b2) => a.reduce((n, v, i) => n + (v !== b2[i] ? 1 : 0), 0); return { status: s.status, job: s.jobId, seed: s.look.person.seed, hairDiff: d(s.hair, s.startHair), beardDiff: s.beard && s.startBeard ? d(s.beard, s.startBeard) : null, cuts: HSC.meta.data.cuts, queueJob: HSC.meta.data.queue && HSC.meta.data.queue.job, hub: document.querySelector('#hsc-hub').classList.contains('show'), reveal: document.body.classList.contains('hsc-reveal') }; });
    console.log(tag, 'cut', JSON.stringify(await sum()));
    await p.evaluate(() => skinFadeStudio.finish());
    await p.waitForFunction(() => document.querySelector('#hsc-hub.show'), null, { timeout: 60000 }); await p.waitForTimeout(700);
    const geo = await p.evaluate(() => { const r = document.querySelector('.hsc-replay').getBoundingClientRect(), n = document.querySelector('.training-continue').getBoundingClientRect(); return { replay: [r.left, r.top, r.width].map(Math.round), next: [n.left, n.top, n.width].map(Math.round), hidden: document.querySelector('.hsc-replay').hidden }; });
    console.log(tag, 'done', JSON.stringify(await sum()), JSON.stringify(geo));
    await p.screenshot({ path: `replay-${tag}.png` });
    // a video that fails: still on the completion screen, button usable
    if (tag === 'port') {
      await p.evaluate(() => { HSC._wv = HSC.watchVideo; HSC.watchVideo = async () => false; });
      await p.click('.hsc-replay', { force: true }); await p.waitForTimeout(400);
      console.log(tag, 'video failed', JSON.stringify(await sum()), 'disabled', await p.evaluate(() => document.querySelector('.hsc-replay').disabled));
      await p.evaluate(() => { HSC.watchVideo = HSC._wv; });
    }
    const seed0 = (await sum()).seed;
    await p.click('.hsc-replay', { force: true }); await p.waitForTimeout(1200);
    const after = await sum();
    console.log(tag, 'replayed', JSON.stringify(after), 'same customer', after.seed === seed0);
    if (tag === 'port') await p.screenshot({ path: 'replay-after.png' });
    // finish again: completion screen comes back, then next customer works
    await p.evaluate(() => skinFadeStudio.finish());
    await p.waitForFunction(() => document.querySelector('#hsc-hub.show'), null, { timeout: 60000 }); await p.waitForTimeout(500);
    console.log(tag, 'done again', JSON.stringify(await sum()));
    await p.click('.training-continue', { force: true }); await p.waitForTimeout(1500);
    console.log(tag, 'next', JSON.stringify(await sum()));
    console.log(tag, errs.length ? errs : 'no errors');
    await p.close();
  }
  await b.close();
})();
