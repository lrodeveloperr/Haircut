'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../..');
const build = path.join(root, 'source/build');
const output = process.env.SHARE_VISUAL_OUTPUT || path.join(root, 'qa/results/share');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' };

function fakeHost() {
  window.__native = { ready: 0, image: null };
  window.AndroidHost = {
    request(id, operation) {
      setTimeout(() => __androidHost.complete(id, true, operation === 'load' ? '{}' : ''), 0);
    },
    gameReady() { __native.ready++; },
    showRewarded() { setTimeout(() => __androidHost.ad('rewarded', 'failed'), 0); },
    showInterstitial() { setTimeout(() => __androidHost.ad('interstitial', 'failed'), 0); },
    reviewMoment() {},
    showPrivacyOptions() {},
    openPrivacy() {},
    shareGame(image) { __native.image = image; },
  };
}

function overlaps(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const context = await browser.newContext({ deviceScaleFactor: 1 });
    await context.addInitScript(fakeHost);
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'share.test') return route.fulfill({ status: 404, body: '' });
      const file = path.join(build, url.pathname === '/' ? 'index.html' : url.pathname);
      if (!file.startsWith(build + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ path: file, contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://share.test/?detail=low');
    await page.waitForFunction(() => window.skinFadeStudio && HSC.view && __native.ready === 1, null, { timeout: 60000 });
    await page.evaluate(() => {
      document.querySelectorAll('.tutorial').forEach(node => { node.style.display = 'none'; });
      skinFadeStudio.finish();
    });
    await page.waitForFunction(() => document.querySelector('#hsc-hub.show') && skinFadeStudio.getView().revealComplete,
      null, { timeout: 180000 });

    const sizes = [
      ['phone-portrait', 390, 844],
      ['phone-landscape', 844, 390],
      ['tablet-portrait', 800, 1280],
      ['tablet-landscape', 1280, 800],
    ];
    const layouts = [];
    for (const [name, width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(700);
      // the next row settles a moment after a turn of the device, and Share follows it: slower under load
      await page.waitForFunction(() => { const a = document.querySelector('.hsc-native-share').getBoundingClientRect(), b = document.querySelector('.hsc-next'), c = b && b.getBoundingClientRect(); return !c || c.width === 0 || a.right <= c.left || a.left >= c.right; }, null, { timeout: 5000 }).catch(() => {});
      const layout = await page.evaluate(() => {
        const box = selector => {
          const node = document.querySelector(selector);
          if (!node || getComputedStyle(node).display === 'none') return null;
          const r = node.getBoundingClientRect();
          return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
        };
        return {
          viewport: { width: innerWidth, height: innerHeight },
          share: box('.hsc-native-share'),
          customer: box('.hsc-next'),
          next: box('.training-continue'),
          visibility: getComputedStyle(document.querySelector('.hsc-native-share')).visibility,
        };
      });
      assert.equal(layout.visibility, 'visible', name + ': share control is visible on completion');
      assert(layout.share, name + ': share control has layout');
      assert(layout.share.left >= 10 && layout.share.right < width / 2 + 200, name + ': share control is on the left side');
      assert(layout.share.top > height / 2, name + ': share control is at the bottom');
      for (const target of [layout.customer, layout.next].filter(Boolean))
        assert(!overlaps(layout.share, target), name + ': share control does not overlap completion actions ' + JSON.stringify(layout));
      layouts.push({ name, ...layout });
      await page.screenshot({ path: path.join(output, name + '.png') });
    }

    await page.locator('.hsc-native-share').click();
    await page.waitForFunction(() => typeof __native.image === 'string' && __native.image.startsWith('data:image/jpeg;base64,'), null, { timeout: 30000 });
    const dataUrl = await page.evaluate(() => __native.image);
    fs.writeFileSync(path.join(output, 'share-card.jpg'), Buffer.from(dataUrl.split(',')[1], 'base64'));
    const analysis = await page.evaluate(async source => {
      const img = await new Promise((resolve, reject) => {
        const node = new Image();
        node.onload = () => resolve(node);
        node.onerror = reject;
        node.src = source;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const at = (x, y) => { const i = (y * canvas.width + x) * 4; return [pixels[i], pixels[i + 1], pixels[i + 2]]; };
      return { width: canvas.width, height: canvas.height, after: at(800, 334), before: at(280, 334) };
    }, dataUrl);
    fs.writeFileSync(path.join(output, 'share-card-analysis.json'), JSON.stringify(analysis, null, 2));
    assert.equal(analysis.width, 1080);
    assert(analysis.height >= 900 && analysis.height <= 1120, 'the card is only as tall as its two heads: ' + analysis.height);
    assert(analysis.after[0] > 230 && analysis.after[2] < 190, 'the after panel is gold');
    assert(analysis.before[2] > 200, 'the before panel is pale');
    fs.writeFileSync(path.join(output, 'layout-report.json'), JSON.stringify(layouts, null, 2));
    assert.deepEqual(errors, []);
    console.log('PASS: share completion layouts and generated flyer:', output);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
