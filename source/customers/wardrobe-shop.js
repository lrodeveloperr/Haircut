// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): coin prices for the wardrobe (docs/ECONOMY-BALANCE-MODEL.md section 14;
// implementation plan 3.5). The Shop (shop.js) sells through here, awarding through the wardrobe's own HSC.wardrobeApi.
//
//   tier     from the design's own data: flagged premium 2,400; a special colour or finish 900 (Rare), an uncommon
//            one 350, otherwise 120 (Common). The two free designs stay free. No price depends on the wallet.
//   buying   one journal commit holds the payment and the entitlement `wardrobe:<key>`; a design missing from the
//            wardrobe save is restored from the journal on boot
//   daily    today's two picks stay one video each, and also carry their normal coin price
// Cosmetic only: nothing here changes play, scoring or access.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const C = () => HSC.catalog, W = () => HSC.wardrobeApi;
  const P = () => (HSC.economy ? HSC.economy.CONFIG.wardrobe : { common: 120, uncommon: 350, rare: 900, premium: 2400 });
  const tierOf = (name, list) => { const r = list.find((x) => x[0] === name); return r ? r[r.length - 1] : 0; };
  // the catalog tier of a design: 0 starter/common, 2 uncommon, 3 special, premium above them
  function price(d) {
    if (!d || C().FREE.has(d.key)) return 0;
    if (d.premium) return P().premium;
    const p = d.parts, cols = [p.body, p.accent, p.main, p.second, p.collar].filter(Boolean).map((c) => tierOf(c, C().COLOURS));
    const top = Math.max(0, ...cols, p.finish ? tierOf(p.finish, C().FINISHES) : 0);
    return top >= 3 ? P().rare : top >= 2 ? P().uncommon : P().common;
  }
  const entKey = (key) => 'wardrobe:' + key;
  async function buy(key) {
    const d = C().byKey.get(key), a = W();
    if (!d || !a || a.owns(key)) return false;
    const pr = price(d);
    if (HSC.coins.get() < pr) return false;
    const ok = await (HSC.coins.buyItem || HSC.coins.spend)(pr, 'wardrobe', entKey(key));
    if (!ok) return false;
    a.award(key, 'coins');
    a.wear(key);
    return true;
  }
  // anything paid for in the journal is owned, even if the wardrobe's own save was lost
  function reconcile() {
    if (!HSC.econ || !HSC.econ.ready() || !W()) return false;
    for (const k of HSC.econ.entitlements()) if (k.startsWith('wardrobe:')) W().award(k.slice(9), 'restore');
    return true;
  }

  HSC.wardrobeShop = { price, buy, reconcile };
  if (typeof setInterval === 'function') {
    const sync = (n) => (reconcile() || n > 100 ? null : setTimeout(() => sync(n + 1), 400));
    sync(0);
  }
})(globalThis.HSC || (globalThis.HSC = {}));
