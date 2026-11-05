// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved Option 1 "Your Shop", 5 November 2026): the player's
// barbershop. The shop behind the customer is rendered in 3D (shop3d.js), light and in daylight, and softened like
// the original backdrop picture. It is modular: one choice per slot (wall, panels, floor, mat, mirror, lights,
// shelf, chair, decor), bought with coins on the economy's renovation curve (100 / 300 / 800 / 1800), and whole
// regional shops (the same base with local materials) for the price of the parts not owned yet. The TV shows the player's shop name, set in
// Settings; the first customer of a session opens on the shop with its name. No sponsored content.
// The game's renderer, camera and controls are untouched: only the picture behind them changes.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const KEY = 'skin-fade-studio-salon-v1';
  const K = '#10223f';
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio, S3 = () => HSC.shop3d;
  const t = (k) => (HSC.t ? HSC.t(k) : k);
  const I = (n, s) => (HSC.icon ? HSC.icon(n, s) : '');
  const PRICE = (HSC.economy && HSC.economy.CONFIG.salon) || [100, 300, 800, 1800];
  const NAME_MAX = 16;
  const SLOTS = ['wall', 'lower', 'floor', 'mat', 'mirror', 'lights', 'shelf', 'chair', 'decor'];
  // the options of each slot, in price order (the first is free and always owned); kept here so the save can be
  // checked without the 3D module
  const OPTIONS = {
    wall: ['deco', 'plaster', 'subway', 'mint', 'blush', 'ochre', 'hinoki'],
    lower: ['oak', 'walnut', 'navy', 'teal', 'sage', 'stone', 'talavera', 'iznik'],
    floor: ['checker', 'herringbone', 'terrazzo', 'cement', 'terracotta', 'stone'],
    mat: ['black', 'jute', 'red', 'indigo', 'none'],
    mirror: ['brass', 'oak', 'black', 'white'],
    lights: ['industrial', 'globe', 'lantern'],
    shelf: ['classic', 'coastal', 'vintage'],
    chair: ['oxblood', 'black', 'cream', 'green', 'mustard', 'navy'],
    decor: ['chart', 'plant', 'indigo'],
  };
  const REGION_IDS = ['classic', 'london', 'tokyo', 'lagos', 'istanbul', 'mexico', 'mumbai'];
  const priceOf = (slot, opt) => { const i = OPTIONS[slot].indexOf(opt); return i <= 0 ? 0 : PRICE[Math.min(i - 1, PRICE.length - 1)]; };
  const regionParts = (id) => { const r = S3() && S3().REGIONS[id]; if (!r) return null; const o = {}; for (const k of SLOTS) o[k] = r[k]; return o; };

  // ---- the save ----
  let S = null, client = null;
  const defaults = () => ({ wall: 'deco', lower: 'oak', floor: 'checker', mat: 'black', mirror: 'brass', lights: 'industrial', shelf: 'classic', chair: 'oxblood', decor: 'chart' });
  const fresh = () => ({ v: 2, region: 'classic', parts: defaults(), owned: Object.fromEntries(SLOTS.map((k) => [k, [OPTIONS[k][0]]])), regions: ['classic'], name: '', year: 0 });
  // the original 2D salon (v1): six slots with four upgrades, three shops; what was bought carries over as the
  // matching options of the same slots (and a finished shop owns all four of every slot)
  const V1 = { wall: 'wall', lower: 'lower', mirror: 'mirror', lights: 'lights', shelf: 'shelf', decor: 'decor' };
  function migrate(d) {
    const s = fresh();
    const done = Number.isInteger(d.shop) && d.shop > 0;
    for (const [old, slot] of Object.entries(V1)) {
      const tier = done ? 4 : Math.max(0, Math.min(4, d.tier && Number.isInteger(d.tier[old]) ? d.tier[old] : 0));
      const opts = OPTIONS[slot].slice(0, Math.min(tier, OPTIONS[slot].length - 1) + 1);
      s.owned[slot] = opts;
      s.parts[slot] = opts[opts.length - 1];
    }
    s.region = '';
    return s;
  }
  function cleanName(v) {
    if (typeof v !== 'string') return '';
    let n = v.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f‎‏‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();
    const g = typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(n)].map((x) => x.segment) : Array.from(n);
    if (g.length > NAME_MAX) n = g.slice(0, NAME_MAX).join('').trim();
    return blocked(n) ? '' : n;
  }
  const graphemes = (n) => (typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(n)].length : Array.from(n).length);
  // a short list of the most common insults and slurs in the game's languages (the name shows on the player's
  // own screen and in their shared pictures)
  const BAD = ['fuck', 'shit', 'cunt', 'nigg', 'fag', 'bitch', 'whore', 'slut', 'rape', 'nazi', 'hitler', 'puta', 'mierda', 'pendej', 'caralh', 'porra', 'merde', 'salope', 'encul', 'fick', 'hure', 'scheiss', 'kahpe', 'orospu', 'sik', 'amk', 'блять', 'бля', 'хуй', 'пизд', 'сука', 'كس', 'شرموط', 'زب', 'चूत', 'भोसड', 'मादरचोद', 'kontol', 'anjing', 'ngentot', '씨발', '병신', 'クソ', 'ちんこ', 'まんこ'];
  function blocked(n) { const s = n.toLowerCase().replace(/[\s._\-*0]/g, (c) => (c === '0' ? 'o' : '')); return BAD.some((w) => s.includes(w)); }
  function sanitize(d) {
    if (!d || typeof d !== 'object') return fresh();
    if (d.v === 1) return migrate(d);
    if (d.v !== 2) return fresh();
    const s = fresh();
    for (const k of SLOTS) {
      const own = Array.isArray(d.owned && d.owned[k]) ? d.owned[k].filter((o) => OPTIONS[k].includes(o)) : [];
      s.owned[k] = [...new Set([OPTIONS[k][0], ...own])];
      const p = d.parts && d.parts[k];
      s.parts[k] = s.owned[k].includes(p) ? p : OPTIONS[k][0];
    }
    s.regions = [...new Set(['classic', ...(Array.isArray(d.regions) ? d.regions.filter((r) => REGION_IDS.includes(r)) : [])])];
    s.region = REGION_IDS.includes(d.region) ? d.region : '';
    s.name = cleanName(d.name);
    s.year = Number.isInteger(d.year) && d.year >= 2024 && d.year < 2200 ? d.year : 0;
    return s;
  }
  const save = () => { if (client && client.saveProgress && S) client.saveProgress(KEY, S).catch(() => {}); };
  const coins = () => (HSC.coins ? HSC.coins.get() : 0);

  // ---- the salon on show: the founding salon (S) or a career branch (career-run.js) ----
  // A branch uses the same nine slots and the parts the barber owns; its choice is saved in the career journal by
  // the branch's own save. An invalid or missing branch look shows the neutral salon (branch plan section 12).
  // A branch starts on the founding salon's look; each fit-out stage (100/300/800/1800, the same in every city) frees
  // a group of slots to be chosen for that branch alone.
  const FIT = [['wall', 'lower'], ['floor', 'mat'], ['mirror', 'lights'], ['shelf', 'chair', 'decor']];
  const slotOpen = (slot) => !ctx || FIT.slice(0, ctx.fit | 0).some((g) => g.includes(slot));
  let ctx = null;
  const cur = () => ctx || S;
  function cleanLook(c) {
    const parts = {};
    const fit = c.fit | 0, open = (k) => FIT.slice(0, fit).some((g) => g.includes(k));
    for (const k of SLOTS) parts[k] = !open(k) && S ? S.parts[k] : c && c.parts && OPTIONS[k].includes(c.parts[k]) ? c.parts[k] : OPTIONS[k][0];
    return { city: c.city, fit, parts, region: c && REGION_IDS.includes(c.region) ? c.region : '', save: c.save };
  }
  function setContext(c) {
    const next = c && c.city && typeof c.save === 'function' ? cleanLook(c) : null;
    if (JSON.stringify(next && [next.city, next.fit, next.parts, next.region]) === JSON.stringify(ctx && [ctx.city, ctx.fit, ctx.parts, ctx.region])) return;
    ctx = next; changed();
  }
  const keep = () => { if (ctx) ctx.save(Object.assign({}, ctx.parts), ctx.region); else save(); };

  // ---- buying and choosing ----
  const owns = (slot, opt) => S.owned[slot].includes(opt);
  function equip(slot, opt) { if (!owns(slot, opt) || !slotOpen(slot)) return false; cur().parts[slot] = opt; cur().region = ''; keep(); changed(); return true; }
  async function buyPart(slot, opt) {
    if (!slotOpen(slot)) return false; // this branch's fit-out has not reached that slot
    if (owns(slot, opt)) return equip(slot, opt);
    const price = priceOf(slot, opt);
    if (coins() < price) return false;
    const ok = await (HSC.coins.buyItem || HSC.coins.spend)(price, 'salon', 'salon:part:' + slot + ':' + opt);
    if (!ok) return false;
    if (!owns(slot, opt)) S.owned[slot].push(opt);
    if (ctx) save(); // ownership is the founding salon's record, whichever salon is on show
    return equip(slot, opt);
  }
  function useRegion(id) {
    if (!S.regions.includes(id) || (ctx && (ctx.fit | 0) < FIT.length)) return false; // a whole look needs a full fit-out
    const p = regionParts(id);
    for (const k of SLOTS) { if (!owns(k, p[k])) S.owned[k].push(p[k]); cur().parts[k] = p[k]; }
    cur().region = id; if (ctx) save(); keep(); changed(); return true;
  }
  // a regional shop is a one-tap bundle of its parts: it costs exactly the parts not owned yet, at their own prices
  // (owner decision 5 November 2026: no shop cheaper than its parts, and no single price beyond the part curve's)
  function regionPrice(id) {
    const p = regionParts(id);
    if (!p || !S) return 0;
    return SLOTS.reduce((a, k) => a + (owns(k, p[k]) ? 0 : priceOf(k, p[k])), 0);
  }
  async function buyRegion(id) {
    if (S.regions.includes(id)) return useRegion(id);
    const price = regionPrice(id);
    if (coins() < price) return false;
    const ok = price ? await (HSC.coins.buyItem || HSC.coins.spend)(price, 'salon', 'salon:shop:' + id) : true;
    if (!ok) return false;
    if (!S.regions.includes(id)) S.regions.push(id);
    return useRegion(id);
  }
  // the unowned salon items, cheapest first (parts only: a shop is a bundle of them)
  function targets() {
    const out = [];
    for (const k of SLOTS) OPTIONS[k].forEach((o, i) => { if (i > 0 && !owns(k, o)) out.push({ key: 'salon:part:' + k + ':' + o, price: priceOf(k, o), slot: k }); });
    return out.sort((a, b) => a.price - b.price);
  }
  function setName(v) {
    let n = cleanName(v);
    if (n === t('shopname')) n = '';
    if (n === S.name) return n;
    S.name = n;
    if (!S.year) S.year = new Date().getFullYear();
    save(); changed();
    return n;
  }
  // what the career journal says was bought (career-run.js buyItem) is owned, even if this shop save was not
  // written after the purchase (a crash between the two writes); returns true when something was restored
  function reconcile() {
    if (!S || !HSC.econ || !HSC.econ.ready || !HSC.econ.ready() || !HSC.econ.entitlements) return false;
    let fixed = false;
    for (const k of HSC.econ.entitlements()) {
      const p = k.split(':');
      if (p[0] !== 'salon') continue;
      if (p[1] === 'part' && OPTIONS[p[2]] && OPTIONS[p[2]].includes(p[3]) && !owns(p[2], p[3])) { S.owned[p[2]].push(p[3]); fixed = true; }
      if (p[1] === 'shop' && REGION_IDS.includes(p[2]) && !S.regions.includes(p[2])) { S.regions.push(p[2]); fixed = true; }
    }
    if (fixed) save();
    return fixed;
  }
  // the neon colours come with the shop's region (or the classic ones for a mixed shop)
  const look = (parts) => Object.assign({}, parts || cur().parts, { neon: (S3() && S3().REGIONS[cur().region || 'classic'] || {}).neon || ['#ff3d9a', '#3df2ff'] });
  // until the player names it, the shop carries a default name in their language (labels.js 'shopname')
  const shown = () => S.name || t('shopname');
  const info = () => ({ name: shown(), year: S.year });

  // ---- the backdrop behind the customer ----
  let applied = null, pending = 0, failed = false;
  function changed() { applied = null; schedule(); ui.refresh(); }
  function schedule() { clearTimeout(pending); pending = setTimeout(apply, 120); }
  function apply() {
    const root = document.querySelector('.game-root');
    if (!root || !S || failed || !S3()) return;
    const land = innerWidth > innerHeight, key = land + JSON.stringify([cur().parts, cur().region, shown(), S.year]);
    if (applied === key) return;
    try {
      // drawn small and softened: the haircut stays the sharpest thing on screen
      const w = land ? 1100 : 508, h = land ? 508 : 1100;
      const r = S3().render(look(), land ? 'land' : 'port', w, h, info());
      const b = document.createElement('canvas'); b.width = w; b.height = h;
      const d = b.getContext('2d');
      if ('filter' in d) d.filter = 'blur(2.5px)';
      d.drawImage(r.canvas, 0, 0);
      root.style.backgroundImage = `url("${b.toDataURL('image/jpeg', 0.86)}")`;
      applied = key;
    } catch (e) { failed = true; console.warn('shop: 3D backdrop unavailable; keeping the picture', e); }
  }

  // ---- the shop screen ----
  const CSS = `
#hsc-salon-btn{padding:0}
#hsc-salon{position:fixed;inset:0;z-index:30;display:none;font-family:"Arial Rounded MT Bold","Nunito","Baloo 2",system-ui,sans-serif;color:${K};touch-action:manipulation;-webkit-user-select:none;user-select:none;background:#e9e2d6;overflow:hidden}
#hsc-salon.open{display:block}
#hsc-salon .view{position:absolute;left:0;top:0;right:0;overflow:hidden}
#hsc-salon .view img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .25s}
#hsc-salon .view img.busy{opacity:.75}
#hsc-salon .sui{position:absolute;inset:0;zoom:var(--hsc-s,1);pointer-events:none}
#hsc-salon .sui > *{pointer-events:auto}
#hsc-salon .j{position:relative;border:3px solid ${K};border-radius:20px;box-shadow:inset 0 -6px 0 #0003,inset 0 3px 0 #fff6,0 5px 0 ${K},0 8px 12px #0004;color:${K};font:inherit;font-weight:900;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;padding:0 12px}
#hsc-salon .j:active{transform:translateY(4px);box-shadow:inset 0 -3px 0 #0003,inset 0 3px 0 #fff6,0 1px 0 ${K}}
#hsc-salon .j:disabled{filter:grayscale(.5);opacity:.6}
#hsc-salon .c-white{background:linear-gradient(#fff,#dfe8f4)}#hsc-salon .c-yellow{background:linear-gradient(#ffe682,#ffb21a)}#hsc-salon .c-green{background:linear-gradient(#9cf06c,#36b83a)}
#hsc-salon .bar{position:absolute;left:max(12px,env(safe-area-inset-left));right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));display:flex;align-items:center;gap:8px;pointer-events:none}
#hsc-salon .bar > *{pointer-events:auto}
#hsc-salon .x{width:52px;height:52px;border-radius:50%;padding:0}
#hsc-salon .x .hsc-ic{width:30px;height:30px}
#hsc-salon .title{display:flex;align-items:center;gap:6px;color:#fff;font-size:26px;-webkit-text-stroke:5px ${K};paint-order:stroke fill;text-shadow:0 3px 0 ${K}}
#hsc-salon .title .hsc-ic{width:38px;height:38px}
#hsc-salon .grow{flex:1}
#hsc-salon .chip{display:flex;align-items:center;gap:6px;height:44px;padding:0 14px 0 6px;border-radius:22px;background:#10223fcc;border:2px solid #ffffff30;color:#fff;font-size:18px;font-variant-numeric:tabular-nums}
#hsc-salon .chip .hsc-ic{width:32px;height:32px}
#hsc-salon .pins{position:absolute;inset:0;pointer-events:none}
#hsc-salon .pin{position:absolute;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background:#ffffffe8;border:3px solid ${K};box-shadow:0 4px 0 ${K},0 6px 12px #0006;font-size:26px;font-weight:900;line-height:1;color:${K};pointer-events:auto;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}
#hsc-salon .pin.on{width:54px;height:54px;background:linear-gradient(#ffe682,#ffb21a)}
#hsc-salon .pin.on::after{content:"";position:absolute;inset:-11px;border-radius:50%;border:3px solid #ffc21a;box-shadow:0 0 16px #ffc21a;animation:hsc-pinp 1.4s ease-in-out infinite}
@keyframes hsc-pinp{50%{transform:scale(1.08);opacity:.7}}
#hsc-salon .sheet{position:absolute;left:0;right:0;bottom:0;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;padding:14px max(14px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));background:linear-gradient(#fff,#e6f0fb);border-top:3px solid ${K};border-radius:28px 28px 0 0;box-shadow:0 -10px 30px #0005}
#hsc-salon.land .bar{right:calc(430px + 12px)}
#hsc-salon.land .sheet{left:auto;top:0;width:430px;border-radius:0;border-top:0;border-left:3px solid ${K};padding-top:max(14px,env(safe-area-inset-top))}
#hsc-salon .tabs{display:flex;gap:8px}
#hsc-salon .tabs .j{flex:1;height:48px;border-radius:16px;font-size:18px}
#hsc-salon .tabs .hsc-ic{width:30px;height:30px}
#hsc-salon .tabs .on{background:linear-gradient(#ffe682,#ffb21a)}
#hsc-salon .cats{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 2px 8px;flex:none}
#hsc-salon .cats::-webkit-scrollbar{display:none}
#hsc-salon .cats .j{flex:none;flex-direction:column;gap:2px;width:66px;height:66px;border-radius:14px;font-size:12px;padding:0 2px}
#hsc-salon .cats .j.on{background:linear-gradient(#ffe682,#ffb21a)}
#hsc-salon .cats img{width:34px;height:34px;object-fit:cover;border-radius:7px;border:2px solid ${K}}
#hsc-salon .cats .hsc-lbl{max-width:100%}
#hsc-salon .cards{display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - 30px) / 4);gap:10px;overflow-x:auto;scrollbar-width:none;flex:1;min-height:120px;padding:2px 2px 8px}
#hsc-salon.land .cards{grid-auto-flow:row;grid-template-columns:1fr 1fr;grid-auto-columns:auto;overflow-y:auto;overflow-x:hidden;grid-auto-rows:150px}
#hsc-salon .cards::-webkit-scrollbar{display:none}
#hsc-salon .card{position:relative;display:flex;flex-direction:column;border-radius:16px;border:3px solid ${K};background:#fff;box-shadow:0 4px 0 ${K};overflow:hidden;cursor:pointer;padding:0;font:inherit;color:${K}}
#hsc-salon .card.sel{box-shadow:0 4px 0 ${K},0 0 0 4px #ffc21a}
#hsc-salon .card .art{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(90% 80% at 50% 30%,#eaf6ff,#a9cdf0);overflow:hidden}
#hsc-salon .card .art img{width:100%;height:100%;object-fit:cover}
#hsc-salon .card .art img.obj{object-fit:contain;width:92%;height:92%}
#hsc-salon .card .foot{height:36px;flex:none;border-top:3px solid ${K};display:flex;align-items:center;justify-content:center;gap:4px;font-weight:900;font-size:16px;background:#fff}
#hsc-salon .card .foot .hsc-ic{width:22px;height:22px}
#hsc-salon .card .tag{position:absolute;left:6px;top:6px;padding:1px 9px;border-radius:9px;background:#ffffffe8;border:2px solid ${K};font-size:13px;font-weight:900;max-width:calc(100% - 50px);white-space:nowrap;overflow:hidden}
#hsc-salon .card .own{position:absolute;right:5px;top:5px;width:28px;height:28px;border-radius:50%;background:#36b83a;border:2.5px solid ${K};display:flex;align-items:center;justify-content:center}
#hsc-salon .card .own .hsc-ic{width:20px;height:20px}
#hsc-salon .act{display:flex;gap:10px;align-items:center;flex:none;min-height:52px}
#hsc-salon .act .nm{font-size:22px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
#hsc-salon .act .j{height:52px;font-size:20px;padding:0 18px;flex:none}
#hsc-salon .act .j .hsc-ic{width:26px;height:26px}
#hsc-salon .act .j[hidden]{display:none}
#hsc-salon .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;overflow-y:auto;scrollbar-width:none;flex:1;min-height:0;grid-auto-rows:128px;padding:2px}
#hsc-salon.land .grid{grid-auto-rows:150px}
#hsc-salon [hidden]{display:none!important}
#hsc-reveal{position:fixed;inset:0;z-index:40;display:none;overflow:hidden;font-family:"Arial Rounded MT Bold","Nunito",system-ui,sans-serif;color:${K};cursor:pointer}
#hsc-reveal.on{display:block;animation:hsc-rvin .35s ease-out}
#hsc-reveal.out{animation:hsc-rvout .45s ease-in forwards}
@keyframes hsc-rvin{from{opacity:0}}@keyframes hsc-rvout{to{opacity:0;visibility:hidden}}
#hsc-reveal img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:hsc-push 2.4s ease-out forwards}
@keyframes hsc-push{from{transform:scale(1.08)}to{transform:scale(1)}}
#hsc-reveal .shade{position:absolute;inset:0;background:linear-gradient(#0000 60%,#10223f66)}
#hsc-reveal .sui{position:absolute;inset:0;zoom:var(--hsc-s,1)}
#hsc-reveal .sign{position:absolute;left:50%;top:calc(max(14px,env(safe-area-inset-top)) + 54px);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;max-width:92%}
#hsc-reveal .sign b{max-width:100%;box-sizing:border-box;padding:10px 26px;border-radius:18px;background:linear-gradient(#fff,#f1e6d0);border:3px solid ${K};box-shadow:0 6px 0 ${K},0 12px 24px #0004;font-size:30px;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;unicode-bidi:plaintext}
#hsc-reveal .sign b .hsc-ic{width:44px;height:44px}
#hsc-reveal .sign i{font-style:normal;padding:2px 12px;border-radius:13px;background:#36b83a;color:#fff;font-size:15px;font-weight:900}
#hsc-reveal .go{position:absolute;left:50%;bottom:calc(max(16px,env(safe-area-inset-bottom)) + 18px);transform:translateX(-50%);width:min(340px,80%);display:flex;flex-direction:column;align-items:center;gap:10px}
#hsc-reveal .mode{display:flex;align-items:center;gap:8px;height:52px;padding:0 20px;border-radius:26px;background:linear-gradient(#ffe682,#ffb21a);border:3px solid ${K};box-shadow:0 5px 0 ${K};font-size:22px;font-weight:900}
#hsc-reveal .mode .hsc-ic{width:34px;height:34px}
#hsc-reveal .bar{width:100%;height:16px;border-radius:8px;background:#10223f99;border:2px solid #fff6;overflow:hidden}
#hsc-reveal .bar i{display:block;height:100%;width:0;background:linear-gradient(#b5ff7a,#46c43a);border-radius:8px;animation:hsc-load 1.8s ease-in-out forwards}
@keyframes hsc-load{to{width:100%}}
@media (prefers-reduced-motion:reduce){#hsc-reveal img,#hsc-salon .pin.on::after{animation:none}}
`;
  const SLOT_ICON = { wall: 'wall', lower: 'lower', floor: 'floor', mat: 'mat', mirror: 'mirror', lights: 'lights', shelf: 'shelf', chair: 'chair', decor: 'decor' };
  const ui = {
    el: {}, built: false, tab: 'parts', slot: 'floor', pick: null, region: null, token: 0,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const p = document.createElement('div'); p.id = 'hsc-salon'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Shop');
      p.innerHTML = `<div class="view"><img alt=""></div>
        <div class="sui"><div class="pins"></div>
          <div class="bar"><button class="j c-white x" type="button" aria-label="Back">${I('back', 30)}</button><div class="title">${I('salon', 38)}<span class="hsc-lbl" data-k="salon"></span></div><div class="grow"></div><div class="chip">${I('coin', 32)}<bdi></bdi></div></div>
          <div class="sheet">
            <div class="tabs"><button class="j c-white" type="button" data-tab="shops">${I('salon', 30)}<span class="hsc-lbl" data-k="shops"></span></button><button class="j c-white" type="button" data-tab="parts">${I('styles', 30)}<span class="hsc-lbl" data-k="parts"></span></button></div>
            <div class="act"><span class="nm"></span><span class="grow"></span><button class="j c-pink wishb" type="button" hidden></button><button class="j c-yellow buy" type="button"></button></div>
            <div class="cats"></div><div class="cards"></div><div class="grid"></div>
          </div></div>`;
      document.body.appendChild(p);
      this.el = { panel: p, img: p.querySelector('.view img'), view: p.querySelector('.view'), pins: p.querySelector('.pins'), sheet: p.querySelector('.sheet'), cats: p.querySelector('.cats'), cards: p.querySelector('.cards'), grid: p.querySelector('.grid'), nm: p.querySelector('.act .nm'), buy: p.querySelector('.act .buy'), coin: p.querySelector('.chip bdi') };
      p.querySelector('.x').addEventListener('click', () => this.close());
      p.querySelectorAll('.tabs .j').forEach((b) => b.addEventListener('click', () => { if (HSC.fx) HSC.fx.play('down'); this.tab = b.dataset.tab; this.pick = null; this.region = null; this.render(); }));
      this.el.buy.addEventListener('click', () => this.act());
      // the wishlist: mark the shown part or shop as the salon target (tap again to clear)
      this.el.wish = p.querySelector('.wishb');
      this.el.wish.addEventListener('click', async () => {
        const t2 = this.target();
        if (!t2 || !HSC.econ || !HSC.econ.wish) return;
        const cur2 = HSC.econ.wishes().salon;
        await HSC.econ.wish('salon', cur2 && cur2.key === t2.key ? null : t2);
        if (HSC.fx) HSC.fx.play('tap');
        this.render();
      });
      addEventListener('resize', () => { schedule(); if (this.open_()) { this.layout(); this.draw(); } });
      setInterval(() => this.tick(), 500);
    },
    open_() { return this.el.panel && this.el.panel.classList.contains('open'); },
    open() { this.build(); this.el.panel.classList.add('open'); this.tab = 'parts'; this.pick = null; this.region = null; this.render(); },
    close() { if (HSC.fx) HSC.fx.play('back'); this.pick = null; this.region = null; this.el.panel.classList.remove('open'); },
    button() {
      const row = document.querySelector('#hsc-hud .hsc-row');
      if (!row) return;
      if (!this.el.btn || !this.el.btn.isConnected) {
        const b = document.createElement('button');
        b.className = 'hsc-btn'; b.id = 'hsc-salon-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Salon');
        b.innerHTML = I('salon', 30) + '<span class="hsc-dot" hidden></span>';
        b.addEventListener('click', () => this.open());
        const goals = document.getElementById('hsc-goals-btn');
        row.insertBefore(b, goals && goals.parentNode === row ? goals.nextSibling : row.children[1] || null);
        this.el.btn = b;
      }
    },
    // the look being shown: what is chosen, or a preview of what is picked
    previewParts() {
      if (this.tab === 'shops' && this.region) return regionParts(this.region);
      if (this.tab === 'parts' && this.pick) return Object.assign({}, cur().parts, { [this.slot]: this.pick });
      return cur().parts;
    },
    layout() {
      const land = innerWidth > innerHeight, z = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hsc-s')) || 1;
      this.el.panel.classList.toggle('land', land);
      const sheetPx = land ? 430 * z : 0;
      this.el.view.style.right = land ? sheetPx + 'px' : '0';
      this.el.sheet.style.height = land ? '' : Math.round(Math.min(innerHeight * 0.46, 420 * z) / z) + 'px';
      this.el.view.style.bottom = land ? '0' : Math.round(Math.min(innerHeight * 0.46, 420 * z) - 20 * z) + 'px';
    },
    // render the shop into the view (sharp), with its hot spots
    draw() {
      if (!S3()) return;
      const r = this.el.view.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.max(64, Math.round(r.width * dpr)), h = Math.max(64, Math.round(r.height * dpr));
      const floorView = this.tab === 'parts' && (this.slot === 'floor' || this.slot === 'mat') && r.width < r.height * 1.1;
      const focus = this.tab === 'parts' && ['chair', 'decor', 'lights'].includes(this.slot) ? this.slot : null;
      const view = floorView ? 'floor' : focus || 'shop', tok = ++this.token;
      this.el.img.classList.add('busy');
      requestAnimationFrame(() => setTimeout(() => {
        if (tok !== this.token) return;
        try {
          const out = S3().render(look(this.previewParts()), view, w, h, info());
          this.el.img.src = out.canvas.toDataURL('image/jpeg', 0.9);
          this.pinsFor(out.hot, w / r.width, r);
        } catch (e) { console.warn('shop: render failed', e); }
        this.el.img.classList.remove('busy');
      }, 0));
    },
    pinsFor(hot, k, r) {
      const z = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hsc-s')) || 1;
      const html = [];
      if (this.tab === 'parts') for (const s of [...SLOTS, 'tv']) {
        const p = hot[s];
        if (!p || !p[2]) continue;
        const x = p[0] / k, y = p[1] / k;
        if (x < 28 || x > r.width - 28 || y < 76 * z || y > r.height - 24) continue;
        html.push(`<button class="pin ${s === this.slot ? 'on' : ''}" type="button" data-s="${s}" style="left:${(r.left + x) / z}px;top:${(r.top + y) / z}px" aria-label="${s}">${s === 'tv' ? I('styles', 26) : '+'}</button>`);
      }
      this.el.pins.innerHTML = html.join('');
      this.el.pins.querySelectorAll('.pin').forEach((b) => b.addEventListener('click', () => {
        if (HSC.fx) HSC.fx.play('down');
        if (b.dataset.s === 'tv') { if (HSC.settings) HSC.settings.open(); return; }
        this.slot = b.dataset.s; this.pick = null; this.render();
      }));
    },
    render() {
      if (!this.open_()) return;
      const p = this.el.panel;
      p.querySelectorAll('.tabs .j').forEach((b) => b.classList.toggle('on', b.dataset.tab === this.tab));
      this.el.cats.hidden = this.el.cards.hidden = this.tab !== 'parts';
      this.el.grid.hidden = this.tab !== 'shops';
      if (this.tab === 'parts') {
        this.el.cats.innerHTML = SLOTS.map((s) => `<button class="j ${s === this.slot ? 'c-yellow on' : 'c-white'}" type="button" data-s="${s}"><img alt="" src="${S3() ? S3().thumb(s, cur().parts[s], 64) || '' : ''}"><span class="hsc-lbl" data-k="${SLOT_ICON[s]}"></span></button>`).join('');
        this.el.cats.querySelectorAll('.j').forEach((b) => b.addEventListener('click', () => { if (HSC.fx) HSC.fx.play('down'); this.slot = b.dataset.s; this.pick = null; this.render(); }));
        const obj = !['wall', 'lower', 'floor', 'mat'].includes(this.slot);
        this.el.cards.innerHTML = OPTIONS[this.slot].map((o) => {
          const own = owns(this.slot, o), on = cur().parts[this.slot] === o, sel = (this.pick || cur().parts[this.slot]) === o;
          const src = S3() ? S3().thumb(this.slot, o, 160) : '';
          const foot = on ? `<span style="color:#2f9e44">${I('tick', 22)}</span>` : own ? '' : `${I('coin', 22)}${priceOf(this.slot, o).toLocaleString(HSC.langTag ? HSC.langTag() : undefined)}`;
          return `<button class="card ${sel ? 'sel' : ''}" type="button" data-o="${o}"><span class="art">${src ? `<img class="${obj ? 'obj' : ''}" alt="" src="${src}">` : I('lock', 40)}</span><span class="foot">${foot}</span>${on ? `<span class="own">${I('tick', 20)}</span>` : ''}</button>`;
        }).join('');
        this.el.cards.querySelectorAll('.card').forEach((b) => b.addEventListener('click', () => {
          if (HSC.fx) HSC.fx.play('down');
          const o = b.dataset.o;
          if (owns(this.slot, o)) { this.pick = null; equip(this.slot, o); this.render(); return; }
          this.pick = o; this.render();
        }));
      } else {
        this.el.grid.innerHTML = REGION_IDS.map((id) => {
          const own = S.regions.includes(id), on = cur().region === id, sel = (this.region || cur().region) === id;
          const foot = on ? `<span style="color:#2f9e44">${I('tick', 22)}</span>` : own ? '' : `${I('coin', 22)}${regionPrice(id).toLocaleString(HSC.langTag ? HSC.langTag() : undefined)}`;
          return `<button class="card ${sel ? 'sel' : ''}" type="button" data-r="${id}"><span class="art"><img alt="" data-r="${id}"></span><span class="tag hsc-lbl" data-k="${id === 'classic' ? 'classic' : 'c_' + id}"></span><span class="foot">${foot}</span>${on ? `<span class="own">${I('tick', 20)}</span>` : ''}</button>`;
        }).join('');
        this.el.grid.querySelectorAll('.card').forEach((b) => b.addEventListener('click', () => {
          if (HSC.fx) HSC.fx.play('down');
          const id = b.dataset.r;
          if (S.regions.includes(id)) { this.region = null; useRegion(id); this.render(); return; }
          this.region = id; this.render();
        }));
        this.regionThumbs();
      }
      this.actBar();
      this.layout();
      fill(p);
      this.el.coin.textContent = coins().toLocaleString(HSC.langTag ? HSC.langTag() : undefined);
      this.draw();
    },
    // region pictures, one per idle moment (each is a separate scene)
    regionThumbs() {
      const imgs = [...this.el.grid.querySelectorAll('img[data-r]')];
      const next = () => {
        const im = imgs.find((i) => !i.src);
        if (!im || !this.open_() || this.tab !== 'shops') return;
        const id = im.dataset.r;
        if (!regionThumb.has(id)) { try { regionThumb.set(id, S3().render(look(regionParts(id)), 'thumb', 320, 200, Object.assign(info(), { shadows: false })).canvas.toDataURL('image/jpeg', 0.85)); } catch (e) { console.warn('shop: region picture failed', id, e); regionThumb.set(id, ''); } }
        im.src = regionThumb.get(id) || 'data:,';
        setTimeout(next, 30);
      };
      setTimeout(next, 60);
    },
    // what the action bar is offering, if it is something to save for
    target() {
      if (this.tab === 'parts' && this.pick && !owns(this.slot, this.pick)) return { key: 'salon:part:' + this.slot + ':' + this.pick, price: priceOf(this.slot, this.pick) };
      if (this.tab === 'shops' && this.region && !S.regions.includes(this.region)) return { key: 'salon:shop:' + this.region, price: regionPrice(this.region) };
      return null;
    },
    wishBar() {
      const t2 = this.target(), wb = this.el.wish, w = HSC.econ && HSC.econ.wishes ? HSC.econ.wishes().salon : null;
      wb.hidden = !(t2 && t2.price > 0);
      if (wb.hidden) return;
      const on = !!(w && w.key === t2.key);
      wb.className = 'j wishb ' + (on ? 'c-pink' : 'c-white');
      wb.setAttribute('aria-pressed', on);
      wb.setAttribute('aria-label', t('a_wish'));
      wb.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 20.5S3 15 3 8.8A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 9 2.2C21 15 12 20.5 12 20.5z" fill="${on ? '#ff5c98' : 'none'}" stroke="${K}" stroke-width="2.4"/></svg>`;
    },
    actBar() {
      this.wishBar();
      const b = this.el.buy;
      if (this.tab === 'parts' && this.pick) {
        const pr = priceOf(this.slot, this.pick);
        this.el.nm.innerHTML = `<span class="hsc-lbl" data-k="${SLOT_ICON[this.slot]}"></span>`;
        b.hidden = false; b.className = 'j c-yellow buy'; b.innerHTML = I('coin', 26) + pr.toLocaleString(HSC.langTag ? HSC.langTag() : undefined); b.disabled = coins() < pr;
      } else if (this.tab === 'shops' && this.region) {
        this.el.nm.innerHTML = `<span class="hsc-lbl" data-k="c_${this.region}"></span>`;
        b.hidden = false; b.className = 'j c-yellow buy'; b.innerHTML = I('coin', 26) + regionPrice(this.region).toLocaleString(HSC.langTag ? HSC.langTag() : undefined); b.disabled = coins() < regionPrice(this.region);
      } else {
        this.el.nm.innerHTML = `<span class="hsc-lbl" data-k="${this.tab === 'parts' ? SLOT_ICON[this.slot] : cur().region ? (cur().region === 'classic' ? 'classic' : 'c_' + cur().region) : 'shops'}"></span>`;
        b.hidden = true;
      }
    },
    async act() {
      const b = this.el.buy;
      if (b.disabled) { if (HSC.nope) HSC.nope(b); return; }
      b.disabled = true;
      const ok = this.tab === 'parts' ? await buyPart(this.slot, this.pick) : await buyRegion(this.region);
      if (ok) { if (HSC.fx) HSC.fx.play('reward'); this.pick = null; this.region = null; } else if (HSC.fx) HSC.fx.play('nope');
      this.render();
    },
    refresh() { if (this.open_()) this.render(); },
    tick() { if (!S) return; this.button(); if (this.open_()) this.el.coin.textContent = coins().toLocaleString(HSC.langTag ? HSC.langTag() : undefined); },
  };
  const regionThumb = new Map();
  // label texts in the player's language, then fitted to their boxes
  function fill(root) { root.querySelectorAll('.hsc-lbl[data-k]').forEach((e) => { e.textContent = t(e.dataset.k); }); if (HSC.fitLabels) HSC.fitLabels(root); }

  // ---- the first customer of a session opens on the shop ----
  let revealed = false, revealPic = null, revealKey = '';
  function revealPicture() {
    const land = innerWidth > innerHeight, key = land + JSON.stringify([cur().parts, cur().region, shown(), S.year]);
    if (revealPic && revealKey === key) return revealPic;
    const dpr = Math.min(devicePixelRatio || 1, 1.5), w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
    revealPic = S3().render(look(), land ? 'land' : 'port', w, h, info()).canvas.toDataURL('image/jpeg', 0.88);
    revealKey = key;
    return revealPic;
  }
  function reveal(mode) {
    if (revealed || !S || failed || !S3()) return;
    revealed = true;
    let pic;
    try { pic = revealPicture(); } catch (e) { return; }
    let el = document.getElementById('hsc-reveal');
    if (!el) { el = document.createElement('div'); el.id = 'hsc-reveal'; document.body.appendChild(el); }
    const ICON = { career: 'play', requests: 'orders', free: 'freestyle', fix: 'rescue', daily: 'daily', beard: 'beards', relax: 'relax', rush: 'rush' };
    const LBL = { career: 'career', requests: 'orders', free: 'quick_play', fix: 'rescue', daily: 'daily', beard: 'beards', relax: 'relax', rush: 'rush' };
    const sign = document.createTextNode(shown());
    el.innerHTML = `<img alt=""><div class="shade"></div><div class="sui"><div class="sign"><b></b><i class="hsc-lbl" data-k="open"></i></div>
      <div class="go"><div class="mode">${I(ICON[mode] || 'play', 34)}<span class="hsc-lbl" data-k="${LBL[mode] || 'play'}"></span></div><div class="bar"><i></i></div></div></div>`;
    el.querySelector('img').src = pic;
    const b = el.querySelector('.sign b');
    if (sign) b.appendChild(sign); else b.innerHTML = I('salon', 44);
    fill(el);
    el.className = 'on';
    let gone = false;
    const end = () => { if (gone) return; gone = true; el.className = 'on out'; setTimeout(() => { el.className = ''; }, 460); };
    el.onclick = end;
    setTimeout(end, 1900);
    if (HSC.fx) HSC.fx.play('open');
  }

  HSC.salon = {
    state: () => S, SLOTS, OPTIONS, REGIONS: REGION_IDS, NAME_MAX, priceOf, regionPrice, targets,
    name: () => (S ? S.name : ''), shown: () => (S ? shown() : ''), setName, cleanName, graphemes,
    buyPart, buyRegion, equip, useRegion, open: () => { reconcile(); ui.open(); }, reveal, reconcile,
    // a career branch's look in place of the founding salon (null: the founding salon); which city is on show
    setContext, context: () => (ctx ? ctx.city : null), look: () => ({ parts: Object.assign({}, cur().parts), region: cur().region }),
    // tests
    _sanitize: sanitize, _migrate: migrate, _load: (d) => { S = sanitize(d); return S; },
  };
  HSC.salonDebug = () => S;

  async function boot() {
    if (!G() || !document.body || !M() || !M().data || !HSC.coins || !document.querySelector('#hsc-hud .hsc-row')) { setTimeout(boot, 300); return; }
    client = M().client;
    const d = client && client.loadProgress ? await client.loadProgress(KEY, null).catch(() => null) : null;
    S = sanitize(d);
    // the shop is founded the first time it is seen: its year shows under the name
    if (!S.year) { S.year = new Date().getFullYear(); save(); } else if (d && d.v === 1) save();
    ui.build(); ui.button();
    // once the career journal is up, restore anything it recorded as bought
    const sync = (n) => (reconcile() || (HSC.econ && HSC.econ.ready && HSC.econ.ready()) || n > 100 ? null : setTimeout(() => sync(n + 1), 300));
    sync(0);
    // the 3D shop is drawn once the game is up (the original picture shows until then)
    const go = () => (HSC.startupTiming && HSC.startupTiming.firstPlayable ? setTimeout(apply, 400) : setTimeout(go, 300));
    go();
  }
  boot();
})(globalThis.HSC || (globalThis.HSC = {}));
