'use strict';
// The menus at every screen size (menu.js, shop.js, settings.js, salon.js, career-ui.js, collection.js, the UI scale
// in wardrobe.js): phones upright and on their side (with notch and gesture-bar insets), tablets, square and short
// windows, 1080p, 4K and ultra-wide.
//   the UI scale keeps the same proportions up to 4K (short side / 560, at most 4)
//   Home's dock spans the whole screen, its buttons clear of every safe-area inset
//   the coin packs' Buy buttons are the shop's one button height; claim buttons and the salon name are 44 px or more
//   no shop tab, task, dock label or city name is cut, and in every language the dock and the tab rows fit without
//     sliding (a long translation on a small phone takes two rows of tabs; the salon's side sheet grows instead)
//   the salon's side sheet leaves the back button, the title and the coins on the screen; the parts sheet shows its
//     cards and prices whole; no pin sits under the bar, the sheet or the gesture bar
//   every Settings row, Privacy and Ad choices included, is in view without scrolling on a phone on its side
// Every box is measured once the screen's entry animations are over (a page slides and grows in for 0.42 s, which a
// slow software renderer stretches far beyond any fixed wait).
// Run: node android/tests/fix-scale-menus.cjs (ANGLE=metal for speed; VPS=640x360,... to pick sizes)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const build = path.resolve(__dirname, '../../source/build');
const ANGLE = process.env.ANGLE ? ['--use-angle=' + process.env.ANGLE] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
// [width, height, insets top/right/bottom/left]
const ALL = [
  [320, 568], [360, 640], [390, 844, [47, 0, 34, 0]], [412, 915], [768, 1024], [820, 1180, [24, 0, 20, 0]],
  [640, 360, [0, 32, 16, 32]], [844, 390, [0, 47, 21, 47]], [915, 412], [1024, 768], [1366, 768], [1920, 1080],
  [3840, 2160], [2560, 1080], [1920, 600], [1000, 1000], [500, 1000], [915, 412, [0, 47, 21, 47]], [960, 540], [1024, 600],
];
const VPS = process.env.VPS ? ALL.filter(([w, h]) => process.env.VPS.split(',').includes(w + 'x' + h)) : ALL;
const fails = [];
const check = (ok, what) => { if (!ok) fails.push(what); };
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', ...ANGLE] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.route('http://scale.test/**', (route) => { const u = new URL(route.request().url()), f = path.join(build, u.pathname === '/' ? 'index.html' : u.pathname); return fs.existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' }); });
    await context.addInitScript(() => { window.__androidRewardedReady = true; window.AndroidHost = { request(id, op) { setTimeout(() => __androidHost.complete(id, true, op === 'load' ? '{}' : ''), 0); }, gameReady() {}, homeReady() {}, showRewarded() {}, showInterstitial() {}, openPrivacy() {}, showPrivacyOptions() {} }; });
    const page = await context.newPage();
    page.setDefaultTimeout(400000);
    const cdp = await context.newCDPSession(page);
    const wait = (fn) => page.waitForFunction(fn, null, { polling: 250, timeout: 400000 });
    // every finite animation over (the stripes and the pulsing pin run for ever)
    const settle = () => page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a.effect.getComputedTiming().iterations === Infinity), null, { polling: 100, timeout: 400000 });
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('http://scale.test/', { waitUntil: 'commit', timeout: 400000 });
    await wait(() => window.skinFadeStudio && HSC.startupTiming?.firstPlayable && HSC.econ && HSC.collection && HSC.menu && HSC.settings && document.querySelector('#hsc-set'));
    // one customer done, coins to show, and the Ad choices row on as well (the most rows Settings can have)
    await page.evaluate(async () => { const g = skinFadeStudio, s = g.getState(); await g.restore(s.hair.map((v, i) => (i % 3 ? v : Math.max(0, v - 1))), s.beard, s.brow); g.getState().cutStrokeCount = 3; await g.finish(); });
    await wait(() => skinFadeStudio.getState().status === 'reveal' && skinFadeStudio.getView().revealComplete && HSC.meta.data.lastRound);
    await page.evaluate(() => skinFadeStudio.next());
    await wait(() => skinFadeStudio.getState().status === 'cutting');
    await page.evaluate(() => { HSC.meta.data.cuts = 40; if (HSC.coins && HSC.coins.add) HSC.coins.add(5000); HSC.settings.addAction({ id: 'test-extra', label: 'ad_choices', run() {} }); });

    // the scale itself
    for (const [w, h, want] of [[390, 844, 1], [1920, 1080, 1.929], [3840, 2160, 3.857], [2560, 1080, 1.929], [7680, 4320, 4]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(150);
      assert.equal(await page.evaluate(() => HSC.uiScale()), want, `UI scale at ${w}x${h}`);
    }

    // a box in screen pixels; inside(b) is true when b is on the screen and clear of the insets
    const geo = (sel) => page.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => e.checkVisibility()).map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height, sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight, tx: (e.innerText || '').trim().slice(0, 20) }; }), sel);
    for (const [w, h, ins = [0, 0, 0, 0]] of VPS) {
      const tag = `${w}x${h}` + (ins.some(Boolean) ? ' (insets)' : '');
      await page.setViewportSize({ width: w, height: h });
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: ins[0], right: ins[1], bottom: ins[2], left: ins[3] } });
      await page.waitForTimeout(250);
      const [T, R, B, L] = ins;
      const inside = (b, what) => check(b.l >= L - 0.5 && b.r <= w - R + 0.5 && b.t >= T - 0.5 && b.b <= h - B + 0.5, `${tag} ${what} [${[b.l, b.t, b.r, b.b].map(Math.round)}] is off the screen or under an inset`);
      const S = await page.evaluate(() => HSC.S);

      // Home: the dock edge to edge, its buttons clear of the insets
      await page.evaluate(() => { HSC.menu.open(); HSC.menu.view('home'); }); await page.waitForTimeout(500); await settle();
      const [dock] = await geo('#hsc-menu .page.home .dock');
      check(Math.abs(dock.l) <= 1 && Math.abs(dock.r - w) <= 1 && Math.abs(dock.b - h) <= 1, `${tag} the dock does not span the screen [${[dock.l, dock.r, dock.b].map(Math.round)}]`);
      for (const b of await geo('#hsc-menu .page.home .dock button')) inside(b, 'dock button ' + b.tx);
      for (const b of await geo('#hsc-menu .page.home .dock .hsc-lbl')) check(b.sw <= b.cw + 1, `${tag} dock label "${b.tx}" cut`);
      for (const b of await geo('#hsc-menu .page.home .top > *, #hsc-menu .page.home .duo > *')) inside(b, 'home ' + b.tx);

      // Shop, Free: tabs and tasks whole, claim buttons 44 px
      await page.evaluate(() => HSC.shop.go('free')); await page.waitForTimeout(400); await settle();
      const tabs = await geo('#hsc-menu .page.shop .hsc-stabs button');
      for (const b of tabs) { check(b.sw <= b.cw + 1, `${tag} shop tab "${b.tx}" cut (${b.sw} > ${b.cw})`); check(b.h >= 44 * S - 1, `${tag} shop tab ${b.tx} under 44`); }
      const [strip] = await geo('#hsc-menu .page.shop .hsc-stabs');
      if (w >= 320) check(strip.sw <= strip.cw + 1, `${tag} the shop tabs do not fit the row (${strip.sw} > ${strip.cw})`);
      for (const b of await geo('#hsc-menu .tk > span:first-child')) check(b.sh <= b.ch + 1 && b.sw <= b.cw + 1, `${tag} task "${b.tx}" cut`);
      for (const b of await geo('#hsc-menu .tk .sb')) check(b.h >= 44 * S - 0.5, `${tag} claim button ${b.h} tall`);
      for (const b of await geo('#hsc-menu .page.shop .mhead > *')) inside(b, 'shop header');

      // Shop, Coins: every Buy the shop's one height
      await page.evaluate(() => HSC.shop.go('coins')); await page.waitForTimeout(400); await settle();
      for (const b of await geo('#hsc-menu .cp .sb')) check(Math.abs(b.h - 50 * S) <= 1, `${tag} coin pack Buy ${Math.round(b.h)} tall, not ${50 * S}`);

      // the salon: bar on the picture, sheet contents whole, pins clear of the bar and the sheet
      for (const tab of ['shops', 'parts']) {
        await page.evaluate((t) => HSC.shop.go(t), tab); await page.waitForTimeout(1400); await settle();
        const [sheet] = await geo('#hsc-salon .sheet');
        const land = await page.evaluate(() => document.querySelector('#hsc-salon').classList.contains('land'));
        const bar = await geo('#hsc-salon .bar > .x, #hsc-salon .bar > .title, #hsc-salon .bar > .chip');
        for (const b of bar) { inside(b, `salon ${tab} bar "${b.tx}"`); if (land) check(b.r <= sheet.l + 0.5, `${tag} salon ${tab} bar "${b.tx}" under the sheet`); else check(b.b <= sheet.t, `${tag} salon ${tab} bar under the sheet`); }
        check(sheet.l >= -0.5 && sheet.r <= w + 0.5 && sheet.b <= h + 0.5, `${tag} salon sheet off the screen`);
        for (const b of await geo('#hsc-salon .sheet .hsc-stabs button')) check(b.sw <= b.cw + 1, `${tag} salon tab "${b.tx}" cut`);
        for (const b of await geo('#hsc-salon .sheet .hsc-stabs')) check(b.sw <= b.cw + 1, `${tag} salon tabs do not fit the sheet (${b.sw} > ${b.cw})`);
        for (const b of await geo('#hsc-salon .namer input')) check(b.h >= 44 * S - 0.5, `${tag} salon name field ${b.h} tall`);
        if (tab === 'parts') {
          const [cards] = await geo('#hsc-salon .cards'), feet = await geo('#hsc-salon .cards .card .foot');
          // the first row of cards shows whole, their prices included
          const top = Math.min(...feet.map((f) => f.t));
          check(feet.length && feet.filter((f) => f.t < top + 1 && f.l < cards.r).every((f) => f.b <= cards.b + 1 && f.b <= h - B + 0.5), `${tag} salon parts: the cards' prices are cut`);
          // the Shop can open straight on Parts: its tabs still wear the shop's style
          check(await page.evaluate(() => getComputedStyle(document.querySelector('#hsc-salon .hsc-stabs button')).borderTopStyle === 'solid'), `${tag} salon tabs unstyled`);
          check(cards.h >= 100 * S, `${tag} salon parts: only ${Math.round(cards.h)} px of cards`);
          const pins = await geo('#hsc-salon .pin');
          for (const p of pins) {
            for (const b of bar) check(p.r <= b.l || p.l >= b.r || p.b <= b.t || p.t >= b.b, `${tag} pin over the bar`);
            check(land ? p.r <= sheet.l : p.b <= sheet.t, `${tag} pin under the sheet`);
            inside(p, 'pin');
          }
        }
      }
      await page.evaluate(() => { HSC.salon.hide(); HSC.menu.view('home'); });

      // Collection (the empty-state note lands at the same share of the screen at every scale)
      await page.evaluate(() => HSC.collection.open()); await page.waitForTimeout(500); await settle();
      for (const b of await geo('#hsc-menu .page.port .mhead > *')) inside(b, 'collection header');
      await page.evaluate(() => HSC.menu.view('home'));

      // Settings: every row in view without scrolling (phones on their side included)
      await page.evaluate(() => HSC.settings.open()); await page.waitForTimeout(400); await settle();
      const rows = await geo('#hsc-set .head .x, #hsc-set .row');
      check(rows.length >= 6, `${tag} settings rows missing`);
      for (const b of rows) inside(b, 'settings row ' + b.tx.replace(/\n.*/s, ''));
      for (const b of await geo('#hsc-set .row .label')) check(b.sw <= b.cw + 1, `${tag} settings label "${b.tx}" cut`);
      await page.evaluate(() => document.querySelector('#hsc-set .x').click());

      // the career map: no city name cut
      await page.evaluate(() => HSC.menu.career()); await page.waitForTimeout(500); await settle();
      for (const b of await geo('#hsc-menu .city .hsc-lbl')) check(b.sh <= b.ch + 1 && b.sw <= b.cw + 1, `${tag} city "${b.tx.replace(/\n/g, ' ')}" cut`);
      await page.evaluate(() => HSC.menu.close());
      process.stdout.write('.');
    }

    // every language on the smallest phone and the smallest phone on its side (notch and gesture bar): the dock's
    // labels whole, the shop's and the salon's tabs on the screen without sliding, each one 44 px or more
    const LANGS = await page.evaluate(() => HSC.languageOptions.map((x) => x[0]));
    for (const [w, h, ins = [0, 0, 0, 0]] of (process.env.VPS ? [] : [[320, 568], [640, 360, [0, 47, 21, 47]], [844, 390, [0, 47, 21, 47]]])) {
      await page.setViewportSize({ width: w, height: h });
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: ins[0], right: ins[1], bottom: ins[2], left: ins[3] } });
      await page.waitForTimeout(250);
      const S = await page.evaluate(() => HSC.S);
      for (const lg of LANGS) {
        const tag = `${w}x${h} ${lg}`;
        await page.evaluate((lg) => { HSC.setLang(lg, false); HSC.menu.open(); HSC.menu.view('home'); }, lg); await page.waitForTimeout(300); await settle();
        const [dock] = await geo('#hsc-menu .page.home .dock');
        check(dock.sw <= dock.cw + 1, `${tag} the dock is too wide (${dock.sw} > ${dock.cw})`);
        for (const b of await geo('#hsc-menu .page.home .dock .hsc-lbl')) check(b.sw <= b.cw + 1 && b.sh <= b.ch + 2, `${tag} dock label "${b.tx}" cut`);
        for (const where of ['#hsc-menu .page.shop', '#hsc-salon .sheet']) {
          await page.evaluate((t) => HSC.shop.go(t), where.startsWith('#hsc-salon') ? 'parts' : 'free'); await page.waitForTimeout(200); await settle();
          const [row] = await geo(where + ' .hsc-stabs');
          check(row.sw <= row.cw + 1, `${tag} ${where} tabs slide (${row.sw} > ${row.cw})`);
          for (const b of await geo(where + ' .hsc-stabs button')) { check(b.sw <= b.cw + 1, `${tag} ${where} tab "${b.tx}" cut`); check(b.h >= 44 * S - 1 && b.w >= 44 * S - 1, `${tag} ${where} tab ${b.tx} under 44`); check(b.l >= row.l - 0.5 && b.r <= row.r + 0.5 && b.l >= ins[3] - 0.5 && b.r <= w - ins[1] + 0.5, `${tag} ${where} tab ${b.tx} off the row`); }
        }
        await page.evaluate(() => { HSC.salon.hide(); HSC.menu.close(); });
      }
      process.stdout.write('.');
    }
    await page.evaluate(() => HSC.setLang('en', false));
    assert.deepEqual(errors, [], 'page errors');
  } finally { await browser.close(); }
  if (fails.length) { console.error('\n' + fails.join('\n')); process.exit(1); }
  console.log('\nfix-scale-menus: PASS', VPS.length, 'sizes', process.env.VPS ? '' : '(and every language at 3)');
})().catch((e) => { console.error(e); process.exit(1); });
