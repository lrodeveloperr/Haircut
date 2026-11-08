// Transport only. Game/lifecycle/save policy stays in the working Sites client.
(function (HSC) {
  'use strict';
  const host = globalThis.AndroidHost;
  if (!host || typeof host.request !== 'function') throw Error('Android host is unavailable');
  let sequence = 0, paused = false, ad = null;
  const pending = new Map(), listeners = new Set();
  HSC.android = {
    request(operation, payload) {
      return new Promise((resolve, reject) => {
        const id = String(++sequence);
        // the boot screen reads 'Progress' as a save problem (loader.js bootCode), so a slow first load says so
        const timer = setTimeout(() => { pending.delete(id); reject(Error('Progress storage timed out')); }, 15000);
        pending.set(id, { resolve, reject, timer });
        try { host.request(id, operation, JSON.stringify(payload)); }
        catch (error) { clearTimeout(timer); pending.delete(id); reject(error); }
      });
    },
    onPause(callback) { listeners.add(callback); callback(paused); return () => listeners.delete(callback); },
    advertisement(kind, placement) {
      if (ad) return Promise.resolve({ earned: false, displayed: false });
      return new Promise(resolve => {
        ad = { kind, resolve, earned: false, displayed: false, timer: 0 };
        const end = () => { const current = ad; ad = null; clearTimeout(current.timer); current.resolve({ earned: current.earned, displayed: current.displayed }); };
        ad.end = end;
        // a watchdog only for an ad that never opens; once it is on screen the player may watch, leave the app and
        // come back: the earned reward must still arrive, so the ad ends when Android says closed (a long safety net
        // remains in case the host never answers)
        ad.timer = setTimeout(end, 90000);
        try { kind === 'rewarded' ? host.showRewarded(String(placement || '')) : host.showInterstitial(String(placement || '')); }
        catch (_) { end(); }
      });
    },
  };
  // the native ad layer says when a rewarded video can (or can no longer) play: the game's video buttons follow it
  if (typeof globalThis.addEventListener === 'function') globalThis.addEventListener('android-rewarded-ready', () => {
    try { globalThis.dispatchEvent(new Event('hsc-rewarded-ready')); } catch (_) {}
  });
  // Google Play Billing owns the buyer-facing price and purchase sheet. The game grants a completed purchase
  // into its durable journal first; Android acknowledges or consumes it only after that save has landed.
  const billingPrices = new Map(), billingOwned = new Set();
  let billingPending = null;
  const productIds = new Set(['coins_500', 'coins_3000', 'coins_7500', 'coins_18000', 'starter_pack', 'supporter_bundle']);
  const productCoins = id => {
    const cfg = HSC.economy && HSC.economy.CONFIG;
    if (!cfg) return 0;
    const pack = cfg.packs.find(x => x.id === id);
    if (pack) return pack.coins;
    if (id === 'starter_pack') return cfg.starterPack.coins;
    if (id === 'supporter_bundle') return cfg.supporterBundle.coins;
    return 0;
  };
  const billingReady = () => HSC.economy && HSC.coins && HSC.shop && HSC.meta && HSC.meta.client && HSC.meta.client.flushProgress;
  async function grantPurchase(data) {
    const id = String(data.productId || ''), token = String(data.purchaseToken || '');
    if (!productIds.has(id) || !token) return;
    for (let n = 0; n < 200 && !billingReady(); n++) await new Promise(resolve => setTimeout(resolve, 50));
    if (!billingReady()) { try { host.billingComplete(id, token, false); } catch (_) {} return; }
    let granted = false;
    try {
      const coins = productCoins(id);
      if (!coins) throw Error('Unknown Play product');
      const result = await HSC.coins.add(coins, 'purchase', 'billing:' + token);
      if (!result) throw Error('Purchase save failed');
      if (id === 'starter_pack' || id === 'supporter_bundle') {
        for (const key of HSC.shop.packItems(id)) HSC.wardrobeApi && HSC.wardrobeApi.award(key, 'purchase');
        billingOwned.add(id);
      }
      await HSC.meta.client.flushProgress();
      granted = true;
    } catch (_) {}
    try { host.billingComplete(id, token, granted); } catch (_) {}
  }
  HSC.billing = {
    price: id => billingPrices.get(String(id)) || null,
    owned: id => billingOwned.has(String(id)),
    buy(id) {
      id = String(id || '');
      if (!productIds.has(id) || billingPending || typeof host.billingBuy !== 'function') return Promise.resolve(false);
      return new Promise(resolve => {
        const timer = setTimeout(() => { if (billingPending && billingPending.id === id) { billingPending = null; resolve(false); } }, 5 * 60000);
        billingPending = { id, resolve, timer };
        try { host.billingBuy(id); } catch (_) { clearTimeout(timer); billingPending = null; resolve(false); }
      });
    },
  };
  globalThis.__androidHost = {
    complete(id, success, value) {
      const request = pending.get(String(id));
      if (!request) return;
      pending.delete(String(id)); clearTimeout(request.timer);
      success ? request.resolve(value) : request.reject(Error(String(value || 'Android storage failed')));
    },
    pause(value) { paused = !!value; for (const callback of [...listeners]) callback(paused); },
    ad(kind, state) {
      if (!ad || ad.kind !== kind) return;
      if (state === 'opened') { ad.displayed = true; clearTimeout(ad.timer); ad.timer = setTimeout(ad.end, 30 * 60000); }
      if (state === 'rewarded') ad.earned = true;
      if (state === 'closed' || state === 'failed') ad.end();
    },
    billingCatalog(json) {
      try {
        const data = JSON.parse(json), prices = data && data.prices;
        billingPrices.clear(); billingOwned.clear();
        if (prices && typeof prices === 'object') for (const [id, price] of Object.entries(prices)) if (productIds.has(id) && typeof price === 'string') billingPrices.set(id, price);
        if (Array.isArray(data && data.owned)) for (const id of data.owned) if (productIds.has(id)) billingOwned.add(id);
        globalThis.dispatchEvent(new Event('hsc-billing-prices'));
      } catch (_) {}
    },
    billingPurchase(json) { try { grantPurchase(JSON.parse(json)); } catch (_) {} },
    billingDone(id, success) {
      if (!billingPending || billingPending.id !== String(id)) return;
      const current = billingPending; billingPending = null; clearTimeout(current.timer); current.resolve(!!success);
    },
    back() {
      // the wardrobe handles its own Escape; everything else goes to the home screen's back (menu.js, Android build)
      if (!document.querySelector('#hsc-panel.open')) return HSC.menuBack ? HSC.menuBack() : false;
      (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
      return true;
    },
  };
})(globalThis.HSC || (globalThis.HSC = {}));
