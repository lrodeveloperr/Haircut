'use strict';
// The player's journey, end to end, in the real game (docs/LOGIC-LOCK-2026-11-06.md): first launch, Home, Collection,
// Quick Play, Career, leaving a Career result for Orders, the Rush clock.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const build = path.resolve(__dirname, '../../source/build');
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pass = [];
  const ok = (m) => { pass.push(m); console.log('ok: ' + m); };
  try {
    const context = await browser.newContext({ viewport: { width: 412, height: 892 } });
    await context.route('http://flow.test/**', (route) => { const u = new URL(route.request().url()), f = path.join(build, u.pathname === '/' ? 'index.html' : u.pathname); return fs.existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' }); });
    await context.addInitScript(() => { window.AndroidHost = { request(id, op) { setTimeout(() => __androidHost.complete(id, true, op === 'load' ? '{}' : ''), 0); }, gameReady() {}, showRewarded() {}, showInterstitial() {}, openPrivacy() {}, showPrivacyOptions() {} }; });
    const page = await context.newPage();
    page.setDefaultTimeout(120000);
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('http://flow.test/');
    await page.waitForFunction(() => window.skinFadeStudio && HSC.startupTiming?.firstPlayable && HSC.econ && HSC.collection && HSC.menu);
    const finish = () => page.evaluate(async () => { const g = skinFadeStudio, s = g.getState(); await g.restore(s.hair.map((v, i) => (i % 3 ? v : Math.max(0, v - 1))), s.beard, s.brow); g.getState().cutStrokeCount = 3; await g.finish(); });
    const reveal = () => page.waitForFunction(() => skinFadeStudio.getState().status === 'reveal' && skinFadeStudio.getView().revealComplete && HSC.meta.data.lastRound && HSC.meta.data.lastRound.job === skinFadeStudio.getState().jobId);
    const next = () => page.evaluate(() => skinFadeStudio.next());
    const cutting = () => page.waitForFunction(() => skinFadeStudio.getState().status === 'cutting');
    const coins = () => page.evaluate(() => HSC.coins.get());
    const cuts = () => page.evaluate(() => HSC.meta.data.cuts);

    // a new player: the first customer, then Home opens by itself once
    assert.equal(await page.evaluate(() => HSC.collection.list().length), 0);
    await page.evaluate(() => { window.__smile = 0; const f = HSC.setExpression; HSC.setExpression = function () { window.__smile++; return f.apply(this, arguments); }; });
    await page.evaluate(() => { HSC.collection.open(); });
    assert.match(await page.locator('#hsc-menu .port .plist').innerText(), /No customers yet/);
    await page.evaluate(() => HSC.menu.close());
    ok('an empty Collection says so and shows nothing else');
    await finish(); await reveal();
    assert.equal(await page.evaluate(() => HSC.collection.list().length), 1);
    await next(); await cutting();
    await page.waitForFunction(() => document.querySelector('#hsc-menu.open'));
    ok('Home opens after the first customer, and that customer is in the Collection');
    assert.equal(await page.evaluate(() => window.__smile), 0);
    ok('no smile at the reveal');

    // Quick Play earns no level
    const c0 = await cuts();
    await page.evaluate(() => HSC.menu.play('free')); await cutting();
    await finish(); await reveal();
    assert.equal(await cuts(), c0, 'Quick Play earns no level');
    assert.equal(await page.evaluate(() => HSC.collection.list().length), 2, 'every mode reaches the Collection');
    ok('Quick Play earns no level and reaches the Collection');
    await next(); await cutting();

    // Career: pick the one home city, then a contract is seated
    await page.evaluate(() => { HSC.menu.open(); return HSC.menu.play('career'); });
    await page.waitForFunction(() => { const p = document.querySelector('#hsc-menu .page.map'); return p && !p.hidden && p.querySelectorAll('.city.pick').length === 18; });
    assert.equal(await page.locator('#hsc-menu .city .cstars, #hsc-menu .city .facts').count(), 0, 'a city tile carries no counters');
    await page.locator('#hsc-menu .city.pick').first().click();
    await page.waitForFunction(() => HSC.modes.current() === 'career' && HSC.careerRun.active() && HSC.careerRun.active().job === skinFadeStudio.getState().jobId && !document.querySelector('#hsc-menu.open'));
    ok('Career asks for one city, then seats its contract');

    // the Career result: stars, coins, the next customer, no retry
    await finish(); await reveal();
    assert.equal(await page.locator('.hsc-replay').count(), 0, 'no retry on the result');
    await page.waitForFunction(() => HSC.careerRun.active() && HSC.careerRun.active().job === skinFadeStudio.getState().jobId + 1);
    await page.waitForFunction(() => { const n = document.querySelector('.hsc-next'); return n && !n.hidden && n.querySelector('img').src; });
    ok('a Career result shows the next customer and no retry');

    // leaving a Career result for Orders: the next job is paid as Orders
    await page.evaluate(() => { HSC.menu.open(); return HSC.modes.set('requests'); }); await cutting();
    await page.evaluate(() => HSC.menu.close());
    const before = await coins();
    await finish(); await reveal();
    await page.waitForFunction((b) => HSC.coins.get() > b, before);
    ok('an Orders job after a Career result is really paid');
    await next(); await cutting();

    // Rush inside Career runs its clock
    await page.evaluate(() => HSC.modes.set('career')); await cutting();
    await page.waitForFunction(() => HSC.careerRun.active() && HSC.careerRun.active().job === skinFadeStudio.getState().jobId);
    // the order is one head, and it turns with the customer; there is no toggle
    await page.waitForFunction(() => { const r = document.querySelector('#hsc-req'); return r && !r.hidden && r.querySelector('img').src; });
    assert.equal(await page.locator('#hsc-cmp, #hsc-newc').count(), 0, 'no toggle, no New customer button');
    assert.equal(await page.locator('#hsc-req img').count(), 1, 'one head');
    const picture = await page.evaluate(() => document.querySelector('#hsc-req img').src);
    await page.evaluate(() => { const g = skinFadeStudio; g.turn(90); });
    await page.waitForFunction((b) => document.querySelector('#hsc-req img').src !== b, picture);
    await page.evaluate(() => { skinFadeStudio.turn(-90); });
    await page.waitForFunction((b) => document.querySelector('#hsc-req img').src === b, picture);
    ok('the order is one head that turns with the customer');
    await page.evaluate(() => { HSC.careerRun.active().mode = 'rush'; });
    await page.waitForFunction(() => document.querySelector('#hsc-rush.on'));
    ok('a Rush job in Career shows its clock');

    // short of coins: the smallest offer that covers the gap is marked; one video leads when it closes the gap, then back to the item
    await page.evaluate(() => { HSC.menu.open(); HSC.shop.go('coins', 300, 'gown'); });
    assert.equal(await page.locator('#hsc-menu .cp.hot [data-p]').getAttribute('data-p'), 'coins_500');
    await page.evaluate(() => HSC.shop.go('coins', 4000, 'gown'));
    assert.equal(await page.locator('#hsc-menu .cp.hot [data-p]').getAttribute('data-p'), await page.evaluate(() => (HSC.meta.data.cuts >= 3 ? 'starter_pack' : 'coins_5000')));
    await page.evaluate(() => { HSC.canVideo = () => true; HSC.watchVideo = async () => true; window.__c = HSC.coins.get(); HSC.shop.go('coins', 20, 'gown'); });
    assert.equal(await page.locator('#hsc-menu .cp.hot').count(), 0, 'no pack is pushed when a video closes the gap');
    await page.locator('#hsc-menu [data-need]').click();
    await page.waitForFunction(() => HSC.coins.get() === window.__c + 25 && document.querySelector('#hsc-menu .hc.pick'));
    ok('short of coins leads to one video or the right pack');
    await page.evaluate(() => HSC.shop.go('coins'));
    assert.equal(await page.locator('#hsc-menu .cp.hot, #hsc-menu [data-need]').count(), 0, 'opening Coins by choice marks nothing');
    assert.deepEqual([...new Set(await page.locator('#hsc-menu [data-p]').allTextContents())], ['Buy'], 'the game shows no price');

    // the Shop dot: the wished item can be had now, or with one video; it opens that item, and a far-off wish adds no dot
    const dot = (gap) => page.evaluate(async (gap) => { const d = HSC.catalog.designs.gown[9]; await HSC.econ.wish('cosmetic', { key: 'wardrobe:' + d.key, price: Math.max(1, HSC.coins.get() + gap) }); return { dot: HSC.shop.dot(), ready: HSC.shop.ready() }; }, gap);
    assert.equal((await dot(0)).dot, true, 'affordable');
    assert.equal((await dot(20)).dot, true, 'one video away');
    const far = await dot(500); assert.equal(far.dot, far.ready, 'a far-off wish adds no dot');
    await dot(0); await page.evaluate(() => { HSC.shop.enter(); });
    await page.waitForFunction(() => document.querySelector('#hsc-menu .hc.pick'));
    await page.evaluate(() => HSC.econ.wish('cosmetic', null));
    ok('the Shop dot opens the wished item when it is close');

    // gowns: eight necks across the catalogue, every colour bright, the first a light neutral; each neck fits and paints
    const g = await page.evaluate(() => {
      const lum = (id) => { const h = HSC.catalog.colourHex.get(id), n = parseInt(h.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
      const all = HSC.catalog.designs.gown, cuts = {};
      for (const d of all) cuts[HSC.gownCut(d)] = (cuts[HSC.gownCut(d)] || 0) + 1;
      const banned = new Set(['charcoal', 'jet', 'graphite', 'grey', 'midnight', 'navy', 'steel', 'denim', 'indigo', 'burgundy', 'brown', 'forest', 'olive', 'tan', 'mustard', 'khaki', 'sand', 'cream', 'peach', 'rose']);
      const bad = all.filter((d) => [d.parts.main, d.parts.second, d.parts.collar].some((c) => banned.has(c)) || lum(d.parts.main) < 0.2).length;
      return { n: all.length, cuts, bad, first: all[0].parts.main, cut0: HSC.gownCut(all[0]), fit: HSC.gownFit() };
    });
    assert.equal(g.n, 600); assert.equal(Object.keys(g.cuts).length, 8); assert.equal(g.bad, 0); assert.equal(g.first, 'silver'); assert.equal(g.cut0, 'snap'); assert.equal(g.fit, true);
    assert(Object.values(g.cuts).every((n) => n > 40), 'every neck is well represented');
    ok('600 bright gowns across eight necks, built around the customer');

    // Rush: one taste at its full pay in Orders, with the clock, then locked until 15 customers; Career keeps its own level
    await page.evaluate(async () => { const d = HSC.meta.data; d.cuts = 2; d.modes.taste = false; d.modes.tried = []; d.modes.job = null; HSC.menu.open(); await HSC.modes.set('requests'); HSC.menu.close(); });
    await cutting();
    await page.waitForFunction(() => HSC.meta.data.modes.job && HSC.meta.data.modes.job.n === skinFadeStudio.getState().jobId);
    await page.waitForFunction(() => document.querySelector('#hsc-rush.on'));
    const taste = await page.evaluate(async () => ({ m: HSC.meta.data.modes.job.m, kind: HSC.modes.econJob(skinFadeStudio.getState()).kind, open: HSC.modes.unlocked('rush'), rescue: HSC.modes.unlocked('fix'), career: HSC.modes.inCareer('fix'), set: await HSC.modes.set('rush'), cur: HSC.modes.current(), req: !document.querySelector('#hsc-req').hidden }));
    assert.deepEqual(taste, { m: 'rush', kind: 'rush', open: false, rescue: true, career: true, set: false, cur: 'requests', req: true });
    await finish(); await reveal();
    await page.waitForFunction(() => HSC.meta.data.lastRound.paid >= 28);
    await next(); await cutting();
    assert.notEqual(await page.evaluate(() => { const j = HSC.meta.data.modes.job; return j && j.n === skinFadeStudio.getState().jobId ? j.m : 'requests'; }), 'rush', 'the taste comes once');
    await page.evaluate(() => { HSC.menu.open(); HSC.menu.view('modes'); });
    assert.equal(await page.locator('#hsc-menu .mode[data-m=rush] .lock b').textContent(), '3/15');
    assert.equal(await page.locator('#hsc-menu .mode[data-m=fix] .lock').count(), 0, 'Rescue is open');
    await page.evaluate(() => { HSC.meta.data.cuts = 15; });
    assert.equal(await page.evaluate(() => HSC.modes.unlocked('rush')), true, 'opens at 15 customers');
    ok('Rush: one paid taste with its clock, then locked until 15 customers');

    // Rescue and Beards: no order, no stars, a set pay that needs real work, and the video stays
    for (const [mode, pay] of [['fix', 30], ['beard', 28]]) {
      await page.evaluate(async (m) => { HSC.menu.open(); await HSC.modes.set(m); HSC.menu.close(); }, mode);
      await cutting();
      await page.waitForFunction(() => { const j = HSC.meta.data.modes.job; return j && j.n === skinFadeStudio.getState().jobId; });
      await page.waitForFunction(() => { const r = document.querySelector('#hsc-req'); return !r || r.hidden; }); // no bubble once the job is seated
      await finish(); await reveal();
      await page.waitForFunction(() => HSC.meta.data.lastRound.paid >= 26); // the balance may also take the shop bill on this job
      await page.waitForFunction(() => document.querySelectorAll('#hsc-score .stars svg').length === 0); // the result screen has caught up
      const r = await page.evaluate(() => { const l = HSC.meta.data.lastRound; return { judged: l.judged, tip: l.tip, starsShown: document.querySelectorAll('#hsc-score .stars svg').length, paid: l.paid }; });
      assert.equal(r.judged, true); assert.equal(r.starsShown, 0, mode + ' shows no stars'); assert(r.tip >= 6, 'the set tip keeps the video'); assert(r.paid >= pay, mode + ' pays its set amount');
      await next(); await cutting();
    }
    const lazy = await page.evaluate(async () => { const g = skinFadeStudio; g.getState().cutStrokeCount = 1; const a = HSC.coins.get(); await g.finish(); await new Promise((r) => setTimeout(r, 400)); return { paid: HSC.meta.data.lastRound.paid, a }; });
    assert.equal(lazy.paid, 0, 'no pay without real work');
    await reveal(); await next(); await cutting();

    // the result video is in every mode; Quick Play pays little and both stop at a daily limit
    await page.evaluate(async () => { HSC.menu.open(); await HSC.modes.set('free'); HSC.menu.close(); });
    await cutting();
    await page.evaluate(() => { HSC.meta.data.modes.wait = 0; }); // the wait is random: none left makes the offer certain
    await finish(); await reveal();
    await page.waitForFunction(() => { const b = document.querySelector('#hsc-score .x3'); return b && getComputedStyle(b).visibility === 'visible' && b.querySelector('span').textContent.trim() === '+10'; }); // Quick Play has its video
    assert.equal(await page.evaluate(() => HSC.meta.data.lastRound.paid), 5, 'Quick Play pays a little');
    const qp = await coins();
    await page.locator('#hsc-score .x3').click();
    await page.waitForFunction((b) => HSC.coins.get() === b + 10, qp);
    await page.evaluate(() => { HSC.meta.data.modes.pv.n = 5; HSC.meta.data.modes.qp.n = 10; HSC.meta.data.modes.wait = 0; });
    await next(); await cutting(); await finish(); await reveal();
    assert.deepEqual(await page.evaluate(() => [HSC.meta.data.lastRound.video, HSC.meta.data.lastRound.paid]), [0, 0], 'Quick Play stops paying at its daily limits');
    const waits = await page.evaluate(() => { const seen = new Set(); for (let i = 0; i < 4000; i++) seen.add(HSC.economy.videoWait(Math.random())); return [...seen].sort(); });
    assert.deepEqual(waits, [0, 1, 2, 3, 4], 'the wait varies, so it cannot be counted: twice running, or up to four results without it');
    // a level-up always has the video, whatever the hidden wait says
    await page.evaluate(async () => { const d = HSC.meta.data; HSC.menu.open(); await HSC.modes.set('requests'); HSC.menu.close(); d.cuts = 19; d.modes.wait = 4; });
    await cutting(); await finish(); await reveal();
    assert(await page.evaluate(() => HSC.meta.data.lastRound.video) >= 10, 'a level-up has the video');
    await next(); await cutting();
    ok('a result video in every mode, at random, capped in Quick Play');
    ok('Rescue and Beards: no order, no stars, set pay for real work');

    assert.deepEqual(errors, []);
    console.log('PASS: flow (' + pass.length + ' journey checks).');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
