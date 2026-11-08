'use strict';

// Android must uncover its icon-free platform splash onto the approved furnished Home, never the blue menu theme.
// The second case forces the salon canvas path to fail and requires the bounded approved-image recovery.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../..');
const build = path.join(root, 'source/build');
const evidence = path.join(root, 'qa/results');
fs.mkdirSync(evidence, { recursive: true });
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.json': 'application/json' };

function fakeHost() {
  window.__native = { homeReady: 0, gameReady: 0, home: null };
  window.__androidRewardedReady = false;
  window.AndroidHost = {
    request(id, op) { setTimeout(() => __androidHost.complete(id, true, op === 'load' ? '{}' : ''), 0); },
    homeReady() {
      const menu = document.getElementById('hsc-menu');
      const page = menu?.querySelector('.page.home');
      __native.homeReady++;
      __native.home = {
        inlineBackground: menu?.style.backgroundImage || '',
        paintedBackground: menu ? getComputedStyle(menu).backgroundImage : '',
        furnished: !!menu?.classList.contains('athome'),
        open: !!menu?.classList.contains('open'),
        page: page?.hidden === false,
        pageOpacity: page ? getComputedStyle(page).opacity : '',
        dock: [...(menu?.querySelectorAll('.dock [data-b]') || [])].map((button) => button.dataset.b),
      };
    },
    gameReady() { __native.gameReady++; },
    showRewarded() {}, showInterstitial() {}, openPrivacy() {}, showPrivacyOptions() {},
  };
}

(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  try {
    for (const forcedFallback of [false, true]) {
      const context = await browser.newContext({ viewport: { width: 412, height: 816 }, deviceScaleFactor: 2 });
      await context.route('http://home.test/**', (route) => {
        const url = new URL(route.request().url());
        const file = path.join(build, url.pathname === '/' ? 'index.html' : url.pathname);
        if (!file.startsWith(build + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
        return route.fulfill({ path: file, contentType: types[path.extname(file)] || 'application/octet-stream' });
      });
      if (forcedFallback) await context.addInitScript(() => { window.HSC = { __testForceHomeFallback: true, __testHomeFallbackMs: 0 }; window.__homeLaunchStarted = performance.now(); });
      else await context.addInitScript(() => { window.HSC = { __testHomeFallbackMs: 120000 }; window.__homeLaunchStarted = performance.now(); });
      await context.addInitScript(fakeHost);
      const page = await context.newPage();
      page.setDefaultTimeout(Number(process.env.HOME_TIMEOUT_MS || 120000));
      const errors = [];
      page.on('pageerror', (error) => errors.push(String(error)));
      page.on('console', (message) => { if (message.type() === 'error') errors.push('console: ' + message.text()); });
      await page.goto('http://home.test/?graphics=potato');
      try {
        await page.waitForFunction(() => __native.homeReady === 1);
      } catch (error) {
        const diagnostic = await page.evaluate(() => ({
          timing: HSC?.startupTiming,
          gameplayReady: HSC?.androidGameplayReady,
          homeApi: typeof HSC?.openLaunchHome,
          menu: !!document.getElementById('hsc-menu'),
          background: document.getElementById('hsc-menu')?.style.backgroundImage || '',
          bootError: document.documentElement.dataset.bootError || '',
          body: document.body.innerText.slice(0, 500),
          errors: window.__bootError || '',
        }));
        console.error('launch diagnostic', diagnostic);
        throw error;
      }
      const home = await page.evaluate(() => ({ ...__native.home, readyMs: performance.now() - __homeLaunchStarted }));
      assert.equal(home.open && home.page && home.furnished, true, 'Android uncovers the furnished Home');
      assert.equal(home.pageOpacity, '1', 'Home controls finish their approved entrance before Android uncovers them');
      assert.deepEqual(home.dock, ['modes', 'shop', 'collection', 'settings'], 'approved four-item dock is preserved');
      if (forcedFallback) assert.match(home.inlineBackground, /home-fallback\.jpg/, 'failed salon render uses approved recovery picture');
      else assert.match(home.inlineBackground, /^url\(["']?data:image\/jpeg;base64,/, 'normal launch uses the current rendered salon');
      assert.doesNotMatch(home.paintedBackground, /radial-gradient/, 'blue menu fallback is not the uncovered background');
      await page.screenshot({ path: path.join(evidence, forcedFallback ? 'android-home-launch-fallback.png' : 'android-home-launch-normal.png'), fullPage: true });
      assert.deepEqual(errors, []);
      console.log((forcedFallback ? 'fallback' : 'normal') + ' home ready in ' + Math.round(home.readyMs) + 'ms');
      await context.close();
    }
    console.log('PASS: normal and forced-failure Android launches reveal an approved furnished Home with the four-item dock.');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exit(1); });
