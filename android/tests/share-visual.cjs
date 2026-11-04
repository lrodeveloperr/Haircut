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
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
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
      await page.waitForTimeout(250);
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
          replay: box('.hsc-replay'),
          customer: box('.hsc-next'),
          next: box('.training-continue'),
          visibility: getComputedStyle(document.querySelector('.hsc-native-share')).visibility,
        };
      });
      assert.equal(layout.visibility, 'visible', name + ': share control is visible on completion');
      assert(layout.share, name + ': share control has layout');
      const rightGap = width - layout.share.right;
      assert(rightGap >= 10 && rightGap <= 26, name + ': share control is fixed to the right');
      for (const target of [layout.replay, layout.customer, layout.next].filter(Boolean))
        assert(!overlaps(layout.share, target), name + ': share control does not overlap completion actions');
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
      const dividerPixel = offset => {
        const r = pixels[offset], g = pixels[offset + 1], b = pixels[offset + 2];
        return r > 190 && g > 145 && b < 225 && r > b * 1.08;
      };
      const blueRatio = (left, top, right, bottom) => {
        let blue = 0, count = 0;
        for (let y = top; y < bottom; y += 2) for (let x = left; x < right; x += 2) {
          const offset = (y * canvas.width + x) * 4;
          const r = pixels[offset], g = pixels[offset + 1], b = pixels[offset + 2];
          if (b > r * 1.18 && b > g * 1.04 && b > 72) blue++;
          count++;
        }
        return blue / count;
      };
      const horizontal = [];
      for (let y = 900; y < 1600; y++) {
        let hits = 0, count = 0;
        for (let x = 24; x < 1056; x += 4) {
          if (dividerPixel((y * canvas.width + x) * 4)) hits++;
          count++;
        }
        if (hits / count > .72) horizontal.push(y);
      }
      const dividerY = Math.round(horizontal.reduce((sum, y) => sum + y, 0) / horizontal.length);
      const vertical = [];
      for (let x = 120; x < 960; x++) {
        let hits = 0, count = 0;
        for (let y = dividerY + 18; y < 1900; y += 4) {
          if (dividerPixel((y * canvas.width + x) * 4)) hits++;
          count++;
        }
        if (hits / count > .72) vertical.push(x);
      }
      const groups = [];
      for (const x of vertical) {
        const last = groups[groups.length - 1];
        if (!last || x > last[last.length - 1] + 1) groups.push([x]);
        else last.push(x);
      }
      const columns = groups.map(group => Math.round(group.reduce((sum, x) => sum + x, 0) / group.length));
      const [first, second] = columns;
      return {
        width: canvas.width,
        height: canvas.height,
        dividerY,
        columns,
        heroCape: blueRatio(60, dividerY - 90, 1020, dividerY - 18),
        frontCape: blueRatio(24, 1840, first - 18, 1904),
        rightCape: blueRatio(first + 18, 1840, second - 18, 1904),
        leftCape: blueRatio(second + 18, 1840, 1056, 1904),
      };
    }, dataUrl);
    fs.writeFileSync(path.join(output, 'share-card-analysis.json'), JSON.stringify(analysis, null, 2));
    assert.equal(analysis.width, 1080);
    assert.equal(analysis.height, 1920);
    assert(analysis.dividerY > 1100 && analysis.dividerY < 1500, 'premium hero divider is detected');
    assert.equal(analysis.columns.length, 2, 'two straight supporting-panel dividers are detected');
    assert(analysis.heroCape > .22, 'hero cape visually reaches the bottom of the hero panel');
    for (const key of ['frontCape', 'rightCape', 'leftCape'])
      assert(analysis[key] > .06, key + ': cape visually reaches the card bottom instead of leaving dead space');
    fs.writeFileSync(path.join(output, 'layout-report.json'), JSON.stringify(layouts, null, 2));
    assert.deepEqual(errors, []);
    console.log('PASS: share completion layouts and generated four-angle card:', output);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
