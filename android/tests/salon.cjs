'use strict';
// The modular 3D shop (source/customers/salon.js): save checks, the move from the original 2D salon, prices,
// buying parts and regional shops, and the shop name rules (16 letters in any script, no insults).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const spent = [];
let balance = 10000;
const ctx = {
  HSC: { PHENOTYPES: 1, economy: { CONFIG: { salon: [100, 300, 800, 1800] } },
    coins: { get: () => balance, spend: async (n, cat, key) => { if (balance < n) return false; balance -= n; spent.push(key); return true; } },
    shop3d: { REGIONS: { classic: { wall: 'deco', lower: 'oak', floor: 'checker', mat: 'black', mirror: 'brass', lights: 'industrial', shelf: 'classic', chair: 'oxblood', decor: 'chart' },
      tokyo: { wall: 'hinoki', lower: 'stone', floor: 'stone', mat: 'jute', mirror: 'black', lights: 'lantern', shelf: 'coastal', chair: 'black', decor: 'plant' } } } },
  console, Intl, setTimeout: () => 0, clearTimeout: () => {}, Date,
};
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'source/customers/salon.js'), 'utf8'), ctx);
const S = ctx.HSC.salon;
const plain = (x) => JSON.parse(JSON.stringify(x));
let passed = 0;

(async () => {
  // 1. the original salon's upgrades carry over as the matching options of the same slots
  let s = S._sanitize({ v: 1, shop: 0, tier: { wall: 2, lower: 0, mirror: 1, lights: 3, shelf: 4, decor: 0 } });
  assert.equal(s.v, 2);
  assert.deepEqual(plain(s.owned.wall), ['deco', 'plaster', 'subway']);
  assert.equal(s.parts.wall, 'subway', 'the most upgraded look stays on');
  assert.deepEqual(plain(s.owned.lights), ['industrial', 'globe', 'lantern'], 'a slot with fewer options owns them all');
  assert.deepEqual(plain(s.owned.floor), ['checker'], 'new slots start with their free option');
  s = S._sanitize({ v: 1, shop: 1, tier: { wall: 0 } });
  assert.equal(s.owned.wall.length, 5, 'a finished first shop owns four upgrades of every old slot');
  passed++;

  // 2. damaged and unknown saves fall back safely
  s = S._sanitize({ v: 2, parts: { wall: 'lava', floor: 'terrazzo' }, owned: { floor: ['terrazzo', 'gold'] }, regions: ['mars', 'tokyo'], region: 'mars', name: 'x'.repeat(40), year: 1900 });
  assert.equal(s.parts.wall, 'deco'); assert.equal(s.parts.floor, 'terrazzo');
  assert.deepEqual(plain(s.owned.floor), ['checker', 'terrazzo']);
  assert.deepEqual(plain(s.regions), ['classic', 'tokyo']); assert.equal(s.region, '');
  assert.equal(S.graphemes(s.name), 16); assert.equal(s.year, 0);
  assert.equal(S._sanitize(null).v, 2); assert.equal(S._sanitize({ v: 9 }).parts.wall, 'deco');
  passed++;

  // 3. prices follow the economy's renovation curve; the first option is free
  assert.equal(S.priceOf('floor', 'checker'), 0);
  assert.equal(S.priceOf('floor', 'herringbone'), 100);
  assert.equal(S.priceOf('floor', 'terrazzo'), 300);
  assert.equal(S.priceOf('floor', 'cement'), 800);
  assert.equal(S.priceOf('floor', 'stone'), 1800, 'later options stay at the top price');
  assert.equal(S.SHOP_PRICE, 2500);
  passed++;

  // 4. the name: 16 letters in any script, control and direction characters removed, insults refused
  const c = S.cleanName;
  assert.equal(c('  fresh   fade  '), 'fresh fade');
  assert.equal(S.graphemes(c('ABCDEFGHIJKLMNOPQRSTUVWXYZ')), 16);
  assert.equal(S.graphemes(c('नमस्तेनमस्तेनमस्तेनमस्तेनमस्तेनमस्ते')), 16, 'Hindi letters count as letters, not code points');
  assert.equal(c('नमस्तेनमस्तेनमस्तेनमस्तेनमस्तेनमस्ते').length > 16, true, 'more code points than letters');
  assert.equal(c('ABCDEFGHIJKLMNO PQR'), 'ABCDEFGHIJKLMNO', 'a cut that ends on a space is trimmed');
  assert.equal(S.graphemes(c('👨‍👩‍👧‍👦'.repeat(20))), 16, 'emoji families count once');
  assert.equal(c('A‮B\u0007C'), 'ABC', 'direction overrides and control characters are removed');
  assert.equal(c('صالون الحلاقة'), 'صالون الحلاقة');
  assert.equal(c('Fuck Cuts'), '', 'insults are refused');
  assert.equal(c('сука'), '');
  passed++;

  // 5. buying: a part once (then it is just chosen), a shop with all its parts, nothing without the coins
  S._load(null);
  assert.equal(await S.buyPart('floor', 'terrazzo'), true);
  assert.equal(balance, 10000 - 300); assert.equal(S.state().parts.floor, 'terrazzo');
  assert.equal(await S.buyPart('floor', 'terrazzo'), true, 'owned: choosing it again is free');
  assert.equal(balance, 10000 - 300);
  assert.equal(await S.buyPart('floor', 'checker'), true); assert.equal(balance, 10000 - 300, 'the free option is always owned');
  assert.equal(await S.buyRegion('tokyo'), true);
  assert.equal(balance, 10000 - 300 - 2500); assert.equal(S.state().region, 'tokyo'); assert.equal(S.state().parts.lights, 'lantern');
  assert.ok(S.state().owned.wall.includes('hinoki'), 'a shop brings its parts');
  assert.deepEqual(spent, ['salon:part:floor:terrazzo', 'salon:shop:tokyo'], 'one keyed transaction per purchase');
  balance = 50;
  assert.equal(await S.buyPart('chair', 'navy'), false, 'no coins, no purchase'); assert.equal(S.state().parts.chair, 'black');
  assert.equal(S.setName('  Fresh  Fade '), 'Fresh Fade'); assert.equal(S.state().year, new Date().getFullYear());
  passed++;
  console.log('PASS: ' + passed + ' shop cases (migration, damaged saves, prices, names, buying).');
})().catch((e) => { console.error(e); process.exitCode = 1; });
