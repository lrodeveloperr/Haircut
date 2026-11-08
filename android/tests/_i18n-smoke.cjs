'use strict';
const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const build = path.resolve(__dirname, '../../source/build');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const out = {};
  const cases = new Map([
    ['en-US', 'en'], ['ar-EG', 'ar'], ['es-MX', 'es-419'], ['pt-PT', 'pt-BR'], ['he-IL', 'he'],
    ['zh-TW', 'zh-Hant'], ['zh-HK', 'zh-Hant'], ['zh-CN', 'zh-Hans'], ['nb-NO', 'nb'], ['fr-CA', 'fr'],
    ['zu-ZA', 'en'],
  ]);
  for (const [lang, automatic] of cases) {
    const context = await browser.newContext({ viewport: { width: 412, height: 892 }, locale: lang });
    await context.route('http://flow.test/**', (route) => { const u = new URL(route.request().url()), f = path.join(build, u.pathname === '/' ? 'index.html' : u.pathname); return fs.existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' }); });
    await context.addInitScript(() => { window.__androidRewardedReady = true; window.AndroidHost = { languageTag() { return navigator.language; }, request(id, op) { setTimeout(() => __androidHost.complete(id, true, op === 'load' ? '{}' : ''), 0); }, gameReady() {}, showRewarded() {}, showInterstitial() {}, openPrivacy() {}, showPrivacyOptions() {} }; });
    const page = await context.newPage(); page.setDefaultTimeout(120000);
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto('http://flow.test/');
    await page.waitForFunction(() => window.skinFadeStudio && HSC.startupTiming?.firstPlayable && HSC.menu && HSC.setLang);
    // an old saved tag (es, pt) and the host language resolve to the canonical packs
    const initial = await page.evaluate(() => ({lang: HSC.lang(), htmlLang: document.documentElement.lang, dir: document.documentElement.dir}));
    if (initial.lang !== automatic) errors.push(`automatic locale ${lang} resolved to ${initial.lang}, expected ${automatic}`);
    const r = await page.evaluate(async (lang) => {
      HSC.setLang(lang, false); HSC.menu.open(); HSC.menu.view('home');
      await new Promise((f) => setTimeout(f, 400));
      const lbl = [...document.querySelectorAll('#hsc-menu .hsc-lbl[data-k]')].filter((e) => e.offsetParent).map((e) => e.dataset.k + '=' + e.textContent);
      HSC.menu.view('modes'); await new Promise((f) => setTimeout(f, 300));
      const modes = [...document.querySelectorAll('#hsc-menu .page.modes .mode .ln')].map((e) => e.textContent);
      const aria = [...document.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label')).slice(0, 12);
      return { lang: HSC.lang(), tag: HSC.langTag(), dir: document.documentElement.dir, htmlLang: document.documentElement.lang, options: HSC.languageOptions.length, city: HSC.cityName('cairo'), task: HSC.tn('task_fade', 3), lbl, modes, aria };
    }, lang);
    out[lang] = { ...r, errors };
    await context.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
  if (Object.values(out).some((x) => x.errors.length)) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });
