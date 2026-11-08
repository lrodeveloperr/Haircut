'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

(async () => {
  const calls = { buy: [], complete: [], coins: [], items: [], flush: 0, events: [] };
  const host = {
    request() {}, showRewarded() {}, showInterstitial() {},
    billingBuy(id) { calls.buy.push(id); },
    billingComplete(id, token, granted) { calls.complete.push([id, token, granted]); },
  };
  const context = {
    AndroidHost: host,
    HSC: {
      economy: { CONFIG: {
        packs: [{ id: 'coins_500', coins: 500 }, { id: 'coins_3000', coins: 3000 }, { id: 'coins_7500', coins: 7500 }, { id: 'coins_18000', coins: 18000 }],
        starterPack: { coins: 2500 }, supporterBundle: { coins: 3000 },
      } },
      coins: { async add(n, cat, key) { calls.coins.push([n, cat, key]); return { txn: true }; } },
      shop: { packItems(id) { return id === 'starter_pack' ? ['clipper:rare', 'gown:rare'] : ['clipper:premium', 'gown:premium']; } },
      wardrobeApi: { award(key, via) { calls.items.push([key, via]); return true; } },
      meta: { client: { async flushProgress() { calls.flush++; } } },
    },
    Event: class { constructor(type) { this.type = type; } },
    addEventListener() {},
    dispatchEvent(event) { calls.events.push(event.type); },
    setTimeout, clearTimeout, Promise, Map, Set, JSON, String, Error,
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../native-transport.js'), 'utf8'), context);

  context.__androidHost.billingCatalog(JSON.stringify({ prices: { coins_500: '$0.99', starter_pack: '$1.99' }, owned: [] }));
  assert.equal(context.HSC.billing.price('coins_500'), '$0.99');
  assert.equal(context.HSC.billing.owned('starter_pack'), false);
  assert.ok(calls.events.includes('hsc-billing-prices'));

  const coinBuy = context.HSC.billing.buy('coins_500');
  assert.deepEqual(calls.buy, ['coins_500']);
  await context.__androidHost.billingPurchase(JSON.stringify({ productId: 'coins_500', purchaseToken: 'token-coin' }));
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(calls.coins[0], [500, 'purchase', 'billing:token-coin']);
  assert.deepEqual(calls.complete[0], ['coins_500', 'token-coin', true]);
  context.__androidHost.billingDone('coins_500', true);
  assert.equal(await coinBuy, true);

  const starterBuy = context.HSC.billing.buy('starter_pack');
  await context.__androidHost.billingPurchase(JSON.stringify({ productId: 'starter_pack', purchaseToken: 'token-starter' }));
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(calls.coins[1], [2500, 'purchase', 'billing:token-starter']);
  assert.deepEqual(calls.items, [['clipper:rare', 'purchase'], ['gown:rare', 'purchase']]);
  assert.equal(context.HSC.billing.owned('starter_pack'), true);
  assert.deepEqual(calls.complete[1], ['starter_pack', 'token-starter', true]);
  context.__androidHost.billingDone('starter_pack', true);
  assert.equal(await starterBuy, true);
  assert.equal(calls.flush, 2);

  assert.equal(await context.HSC.billing.buy('unknown_product'), false);
  console.log('billing bridge: prices, consumable grant, durable bundle grant and completion passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
