'use strict';
// Every language fits every menu on the smallest phone and the smallest phone on its side (notch and gesture bar):
// Home (the Career line included), the dock, Modes, each Shop tab, the salon's Shops and Parts, the Collection,
// Settings, the career map and the boot error panel. In each of the 40 languages:
//   no text is clipped, cut by an ellipsis or runs out of its box, off the screen or over another text
//   every button stays 44 px or more; right-to-left languages (ar, fa, he, ur) lay the menus out right to left
// A translation too long for its slot fails here with its language, screen and text.
// Run: node android/tests/fit-i18n.cjs (ANGLE=metal for speed; LANGS=de,ar to pick languages; VPS=320x568 to pick sizes)
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const build = path.resolve(__dirname, '../../source/build');
const ANGLE = process.env.ANGLE ? ['--use-angle=' + process.env.ANGLE] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const ALL = [[320, 568, [0, 0, 0, 0]], [844, 390, [0, 47, 21, 47]]];
const VPS = process.env.VPS ? ALL.filter(([w, h]) => process.env.VPS.split(',').includes(w + 'x' + h)) : ALL;
const FIT = `// window.__fit(rootSels) -> issues about text fit
window.__fit = function (rootSels) {
  const W = innerWidth, H = innerHeight, out = [];
  const R = (e) => e.getBoundingClientRect();
  const vis = (e) => e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && R(e).width > 0.5 && R(e).height > 0.5;
  const nm = (e) => { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; if (typeof e.className === 'string' && e.className.trim()) s += '.' + e.className.trim().split(/\\s+/).slice(0, 2).join('.'); const p = e.parentElement; if (p && typeof p.className === 'string' && p.className.trim()) s = (p.tagName.toLowerCase() + '.' + p.className.trim().split(/\\s+/)[0]) + '>' + s; return s; };
  const txt = (e) => (e.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
  const roots = rootSels.flatMap((s) => [...document.querySelectorAll(s)]).filter(vis);
  const INTER = 'button,a[href],input,select,[role=button],[role=tab],.city';
  const leaves = [];
  for (const root of roots) for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.closest('svg')) continue;
    if (!vis(e)) continue;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    const cs = getComputedStyle(e), r = R(e);
    if (e.matches(INTER) && !e.matches('#hsc-req') && (r.width < 43.5 || r.height < 43.5)) out.push({ k: 'small', el: nm(e), t: txt(e), wh: [Math.round(r.width), Math.round(r.height)] });
    if (!own.length) continue;
    const ox = cs.overflowX !== 'visible', oy = cs.overflowY !== 'visible';
    if (ox && e.scrollWidth > e.clientWidth + 1) out.push({ k: cs.textOverflow === 'ellipsis' ? 'ellipsis' : 'clipX', el: nm(e), t: txt(e), d: [e.scrollWidth, e.clientWidth] });
    if (oy && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll' && e.scrollHeight > e.clientHeight + 2) out.push({ k: 'clipY', el: nm(e), t: txt(e), d: [e.scrollHeight, e.clientHeight] });
    const rg = document.createRange(); rg.selectNodeContents(e);
    let tl = 1e9, tt = 1e9, tr = -1e9, tb = -1e9;
    for (const n of own) { const q = document.createRange(); q.selectNodeContents(n); for (const b of q.getClientRects()) { tl = Math.min(tl, b.left); tt = Math.min(tt, b.top); tr = Math.max(tr, b.right); tb = Math.max(tb, b.bottom); } }
    if (tr < tl) continue;
    // text running outside its own box (overflow visible)
    if (!ox && (tl < r.left - 2 || tr > r.right + 2)) out.push({ k: 'spillX', el: nm(e), t: txt(e), d: [Math.round(tl - r.left), Math.round(tr - r.right)] });
    // text past every clipping ancestor / the screen
    let L = 0, T = 0, Rt = W, B = H, inScroll = false;
    for (let a = e.parentElement; a && a !== document.documentElement; a = a.parentElement) { const c = getComputedStyle(a); if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { if (/auto|scroll/.test(c.overflowY + c.overflowX)) { inScroll = true; break; } const ar = R(a); L = Math.max(L, ar.left); T = Math.max(T, ar.top); Rt = Math.min(Rt, ar.right); B = Math.min(B, ar.bottom); } }
    if (!inScroll && (tl < L - 1 || tr > Rt + 1 || tt < T - 1 || tb > B + 1)) out.push({ k: 'cutoff', el: nm(e), t: txt(e), d: [Math.round(L - tl), Math.round(T - tt), Math.round(tr - Rt), Math.round(tb - B)].map((v) => Math.max(0, v)) });
    const fz = parseFloat(cs.fontSize) * (r.width / (e.offsetWidth || r.width));
    if (fz < 11.5) out.push({ k: 'tiny', el: nm(e), t: txt(e), px: +fz.toFixed(1) });
    leaves.push({ e, l: tl, t: tt, r: tr, b: tb });
  }
  // overlapping text from different elements
  for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) {
    const a = leaves[i], b = leaves[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
    const ix = Math.min(a.r, b.r) - Math.max(a.l, b.l), iy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
    if (ix > 3 && iy > 3) out.push({ k: 'overlap', el: nm(a.e) + ' / ' + nm(b.e), t: txt(a.e) + ' / ' + txt(b.e), d: [Math.round(ix), Math.round(iy)] });
  }
  return out;
};`;
const fails = [];
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', ...ANGLE] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.route('http://fit.test/**', (route) => { const u = new URL(route.request().url()), f = path.join(build, u.pathname === '/' ? 'index.html' : u.pathname); return fs.existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' }); });
    await ctx.addInitScript(() => { window.__androidRewardedReady = true; window.AndroidHost = { request(id, op) { setTimeout(() => __androidHost.complete(id, true, op === 'load' ? '{}' : ''), 0); }, gameReady() {}, homeReady() {}, showRewarded() {}, showInterstitial() {}, openPrivacy() {}, showPrivacyOptions() {} }; });
    const page = await ctx.newPage(); page.setDefaultTimeout(400000);
    const cdp = await ctx.newCDPSession(page);
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    const wf = (fn) => page.waitForFunction(fn, null, { polling: 250, timeout: 400000 });
    const W = (ms) => page.waitForTimeout(ms);
    await page.goto('http://fit.test/', { waitUntil: 'commit', timeout: 400000 });
    await wf(() => window.skinFadeStudio && HSC.startupTiming?.firstPlayable && HSC.econ && HSC.collection && HSC.menu && HSC.settings);
    // entry animations end at once, so each box is measured where it comes to rest
    await page.addStyleTag({ content: '*,*::before,*::after{animation-duration:0.001s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}' });
    await page.evaluate(FIT);
    // one customer done, coins to show and the Ad choices row on (the most rows Settings can have)
    await page.evaluate(async () => { const g = skinFadeStudio, s = g.getState(); await g.restore(s.hair.map((v, i) => (i % 3 ? v : Math.max(0, v - 1))), s.beard, s.brow); g.getState().cutStrokeCount = 3; await g.finish(); });
    await wf(() => skinFadeStudio.getState().status === 'reveal' && skinFadeStudio.getView().revealComplete && HSC.meta.data.lastRound);
    await page.evaluate(() => skinFadeStudio.next());
    await wf(() => skinFadeStudio.getState().status === 'cutting');
    await page.evaluate(() => { HSC.meta.data.cuts = 40; if (HSC.coins && HSC.coins.add) HSC.coins.add(5000); HSC.settings.addAction({ id: 'test-extra', label: 'ad_choices', run() {} }); });
    const LANGS = process.env.LANGS ? process.env.LANGS.split(',') : await page.evaluate(() => HSC.languageOptions.map((x) => x[0]));
    const check = async (screen, tag, lg, roots) => {
      for (const i of await page.evaluate((r) => window.__fit(r), roots)) fails.push(`${tag} ${lg} ${screen}: ${i.k} ${i.el} "${i.t}" ${JSON.stringify(i.d || i.wh || i.px || '')}`);
      if (['ar', 'fa', 'he', 'ur'].includes(lg)) { const d = await page.evaluate((r) => r.flatMap((s) => [...document.querySelectorAll(s)]).filter((e) => e.checkVisibility()).map((e) => getComputedStyle(e).direction), roots); if (d.some((x) => x !== 'rtl')) fails.push(`${tag} ${lg} ${screen}: not right to left`); }
    };
    const MENU = ['#hsc-menu.open'];
    for (const [w, h, ins] of VPS) {
      const tag = `${w}x${h}`;
      await page.setViewportSize({ width: w, height: h });
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: ins[0], right: ins[1], bottom: ins[2], left: ins[3] } });
      await W(250);
      for (const lg of LANGS) {
        await page.evaluate((lg) => HSC.setLang(lg, false), lg); await W(60);
        await page.evaluate(() => { HSC.menu.open(); HSC.menu.view('home'); }); await W(250); await check('home', tag, lg, MENU);
        await page.evaluate(() => HSC.menu.view('modes')); await W(200); await check('modes', tag, lg, MENU);
        for (const t of ['free', 'coins', 'clipper', 'gown']) { await page.evaluate((t) => HSC.shop.go(t), t); await W(t === 'free' || t === 'coins' ? 200 : 450); await check('shop ' + t, tag, lg, MENU); }
        for (const t of ['shops', 'parts']) { await page.evaluate((t) => HSC.shop.go(t), t); await W(500); await check('salon ' + t, tag, lg, ['#hsc-salon.open']); }
        await page.evaluate(() => { HSC.salon.hide(); HSC.menu.view('home'); HSC.collection.open(); }); await W(300); await check('collection', tag, lg, MENU);
        await page.evaluate(() => { HSC.menu.view('home'); HSC.settings.open(); }); await W(200); await check('settings', tag, lg, ['#hsc-set.open']);
        await page.evaluate(() => { document.querySelector('#hsc-set .x').click(); HSC.menu.career(); }); await W(300); await check('map', tag, lg, MENU);
        await page.evaluate(() => HSC.menu.close());
        // the boot error panel (boot.js builds it when the game cannot start; the same markup here)
        await page.evaluate(() => { const p = document.createElement('section'); p.className = 'boot-error'; p.dir = HSC.rtl() ? 'rtl' : 'ltr'; const t = document.createElement('h1'); t.textContent = HSC.t('boot_fail_title'); const m = document.createElement('p'); m.textContent = HSC.t('boot_fail_msg'); const b = document.createElement('button'); b.textContent = HSC.t('retry'); p.append(t, m, b); document.body.appendChild(p); });
        await W(50); await check('boot error', tag, lg, ['.boot-error']); await page.evaluate(() => document.querySelectorAll('.boot-error').forEach((e) => e.remove()));
      }
      process.stdout.write('.');
    }
    await page.evaluate(() => HSC.setLang('en', false));
    if (errors.length) fails.push('page errors: ' + errors.slice(0, 3).join(' | '));
  } finally { await browser.close(); }
  if (fails.length) { console.error('\n' + fails.join('\n')); process.exit(1); }
  console.log('\nfit-i18n: PASS', VPS.length, 'sizes in every language');
})().catch((e) => { console.error(e); process.exit(1); });
