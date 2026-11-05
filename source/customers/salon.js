// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved 5 November 2026): the salon behind the customer,
// drawn in code and upgraded with tips.
//
// The game's backdrop is a soft-focus picture of the shop (assets/backdrop-*.webp, CSS background). Here the same
// shop is drawn from parts on a canvas, blurred the same way, and set as that background: tier 0 of every part is
// today's shop. Six parts each have four upgrades (wall, lower wall, mirrors, lights, shelf, plants and art);
// prices rise 60 / 180 / 450 / 1000 coins. When every part is fully upgraded the next shop opens (three shops, each
// with its own palette), starting again from its basic look. Wordless: a hammer button, pictures, pips and prices.
// The renderer, camera and customer are untouched: only the picture behind them changes.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const KEY = 'skin-fade-studio-salon-v1';
  const INK = '#10223f';
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio;
  const SLOTS = ['wall', 'lower', 'mirror', 'lights', 'shelf', 'decor'];
  const PRICE = [60, 180, 450, 1000];
  const TOP = 4;

  // three shops: palettes for each part's tiers (tier 0 of shop 0 is the game's original shop)
  const SHOPS = [
    { wall: ['#e8d8b8', '#c9d6c0', '#e9dcc6', '#a9583e', '#1f2c45'], wallInk: [null, null, '#cdbb9b', '#7d3e2b', '#b89548'],
      lower: ['#5a3d29', '#a5774b', '#f2efe8', '#1d1d1f', '#e7e3dc'], frame: ['#c9a548', '#6b4426', '#151515', '#d4ad4b', '#f2efe8'], accent: '#c9a548' },
    { wall: ['#d9d4cc', '#9fb3bf', '#e6e1d6', '#6f7378', '#2d2f33'], wallInk: [null, null, '#c2bcb0', '#585c61', '#7a8088'],
      lower: ['#3a3a3c', '#8a6a4a', '#dcdcdc', '#26323b', '#c9c4bb'], frame: ['#9aa3ab', '#2b2b2b', '#0f0f0f', '#c0c6cc', '#e8ecef'], accent: '#9aa3ab' },
    { wall: ['#efe2cf', '#e0c9b9', '#f1e7da', '#3b2a3f', '#122b2a'], wallInk: [null, null, '#dccab3', '#5b4561', '#c7a35a'],
      lower: ['#4a2f2a', '#b08a5f', '#f6f3ee', '#101010', '#ebe6de'], frame: ['#c7a35a', '#4a2f2a', '#111', '#e0bd62', '#fff8ea'], accent: '#c7a35a' },
  ];

  let S = null, client = null;
  const fresh = () => ({ v: 1, shop: 0, tier: { wall: 0, lower: 0, mirror: 0, lights: 0, shelf: 0, decor: 0 } });
  function sanitize(d) {
    const f = fresh();
    if (!d || typeof d !== 'object' || d.v !== 1) return f;
    const shop = Number.isInteger(d.shop) && d.shop >= 0 && d.shop < SHOPS.length ? d.shop : 0;
    const tier = {};
    for (const k of SLOTS) tier[k] = d.tier && Number.isInteger(d.tier[k]) && d.tier[k] >= 0 && d.tier[k] <= TOP ? d.tier[k] : 0;
    return { v: 1, shop, tier };
  }
  const save = () => { if (client && client.saveProgress && S) client.saveProgress(KEY, S).catch(() => {}); };

  // ---- drawing (in the original pictures' pixels; drawn at half size, then softened) ----
  const LAYOUT = {
    portrait: { W: 1170, H: 2532, base: 1390, shelf: [190, 1283, 1073, 1308], mirrors: [[222, 267, 1099, 1238]], poles: [[57, 298, 165, 1257]],
      bulbs: [[330, 175, 1003]], plant: [985, 1283], art: [[960, 40, 1130, 230]], clock: [1060, 140], towels: [1100, 1283] },
    landscape: { W: 2532, H: 1170, base: 622, shelf: [300, 600, 2232, 622], mirrors: [[387, 108, 1118, 533], [1353, 108, 2083, 533]],
      poles: [[108, 38, 222, 635], [2235, 38, 2343, 635]], bulbs: [[470, 30, 1040], [1440, 30, 2010]], plant: [1236, 600], art: [[1160, 120, 1310, 330]], clock: [2430, 160], towels: [300, 600] },
  };
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function draw(c, L, t, P) {
    const { W, H, base } = L;
    // wall
    c.fillStyle = P.wall[t.wall]; c.fillRect(0, 0, W, base);
    const ink = P.wallInk[t.wall];
    if (t.wall === 2) { c.fillStyle = ink; for (let x = 0; x < W; x += 46) c.fillRect(x, 0, 10, base); }
    // Iznik-style tiles (as in Turkish barbershops): white ground, cobalt borders, red tulips and green leaves
    if (t.wall === 3) iznik(c, W, base);
    if (t.wall === 4) { c.strokeStyle = ink; c.lineWidth = 5; for (let y = 60; y < base; y += 150) for (let x = (Math.floor(y / 150) % 2) * 75 + 40; x < W; x += 150) { c.beginPath(); c.ellipse(x, y, 26, 40, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x, y - 60); c.lineTo(x, y + 60); c.stroke(); } }
    const wg = c.createLinearGradient(0, 0, 0, base); wg.addColorStop(0, 'rgba(255,255,255,.12)'); wg.addColorStop(1, 'rgba(0,0,0,.12)'); c.fillStyle = wg; c.fillRect(0, 0, W, base);
    // lower wall
    c.fillStyle = P.lower[t.lower]; c.fillRect(0, base, W, H - base);
    if (t.lower <= 1) { c.fillStyle = 'rgba(0,0,0,.14)'; for (let x = 0; x < W; x += 120) c.fillRect(x, base, 8, H - base); c.fillStyle = 'rgba(255,255,255,.05)'; for (let x = 40; x < W; x += 120) c.fillRect(x, base, 22, H - base); }
    if (t.lower === 2) { c.fillStyle = '#d7d3cc'; for (let y = base, r = 0; y < H; y += 60, r++) { c.fillRect(0, y, W, 5); for (let x = (r % 2) * 60; x < W; x += 120) c.fillRect(x, y, 5, 60); } }
    if (t.lower === 3) { for (let y = base, r = 0; y < H; y += 110, r++) for (let x = 0, q = r; x < W; x += 110, q++) { c.fillStyle = q % 2 ? '#f1efe9' : '#1d1d1f'; c.fillRect(x, y, 110, 110); } }
    if (t.lower === 4) { c.strokeStyle = 'rgba(120,110,100,.35)'; c.lineWidth = 4; for (let k = 0; k < 14; k++) { c.beginPath(); let x = (k * 397) % W, y = base + (k * 173) % (H - base); c.moveTo(x, y); for (let s = 0; s < 6; s++) { x += 60 + (k * 31 + s * 17) % 80; y += ((k + s) % 3 - 1) * 40; c.lineTo(x, y); } c.stroke(); } c.fillStyle = P.accent; c.fillRect(0, base + 40, W, 14); }
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, base, W, 18);
    // lights above the mirrors
    for (const [x0, y, x1] of L.bulbs) {
      if (t.lights === 2) { for (let k = 0; k < 3; k++) { const x = x0 + (x1 - x0) * (k + 0.5) / 3; c.strokeStyle = '#2b2b2b'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y + 40); c.stroke(); glow(c, x, y + 90, 120, 'rgba(255,220,150,.55)'); c.fillStyle = P.accent; c.beginPath(); c.moveTo(x - 60, y + 95); c.quadraticCurveTo(x, y + 20, x + 60, y + 95); c.closePath(); c.fill(); } continue; }
      if (t.lights === 4) continue; // neon is drawn on the wall below
      const n = t.lights === 0 ? 6 : 8;
      for (let k = 0; k < n; k++) { const x = x0 + (x1 - x0) * k / (n - 1); glow(c, x, y + 20, t.lights === 0 ? 60 : 80, 'rgba(255,236,170,.8)'); c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(x, y + 20, 16, 0, 7); c.fill(); }
    }
    // poles
    for (const [x0, y0, x1, y1] of L.poles) {
      c.fillStyle = '#f4f1ec'; rr(c, x0, y0, x1 - x0, y1 - y0, 18); c.fill();
      c.save(); rr(c, x0 + 6, y0 + 40, x1 - x0 - 12, y1 - y0 - 80, 10); c.clip();
      for (let y = y0 - 200, k = 0; y < y1 + 200; y += 90, k++) { c.fillStyle = k % 2 ? '#c7413d' : '#3e5fae'; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y - 60); c.lineTo(x1, y - 25); c.lineTo(x0, y + 35); c.closePath(); c.fill(); }
      c.restore();
    }
    // mirrors
    for (const [x0, y0, x1, y1] of L.mirrors) {
      const w = x1 - x0, h = y1 - y0, fw = [18, 34, 22, 40, 14][t.mirror], r = [0, 6, 40, 10, 60][t.mirror];
      if (t.mirror === 4) glow(c, (x0 + x1) / 2, (y0 + y1) / 2, Math.max(w, h) * 0.75, 'rgba(255,248,225,.55)');
      if (t.lights === 3) for (let k = 0; k <= 8; k++) for (const [x, y] of [[x0 - 30 + (w + 60) * k / 8, y0 - 30], [x0 - 30, y0 - 30 + (h + 60) * k / 8], [x1 + 30, y0 - 30 + (h + 60) * k / 8]]) { glow(c, x, y, 55, 'rgba(255,236,170,.75)'); c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(x, y, 14, 0, 7); c.fill(); }
      c.fillStyle = P.frame[t.mirror]; rr(c, x0 - fw, y0 - fw, w + 2 * fw, h + 2 * fw, r + fw); c.fill();
      if (t.mirror === 3) { c.strokeStyle = 'rgba(90,60,20,.45)'; c.lineWidth = 5; rr(c, x0 - fw + 10, y0 - fw + 10, w + 2 * fw - 20, h + 2 * fw - 20, r + fw - 10); c.stroke(); for (const [cx, cy] of [[x0 - fw / 2, y0 - fw / 2], [x1 + fw / 2, y0 - fw / 2], [x0 - fw / 2, y1 + fw / 2], [x1 + fw / 2, y1 + fw / 2]]) { c.fillStyle = '#e8c76a'; c.beginPath(); c.arc(cx, cy, fw * 0.6, 0, 7); c.fill(); } }
      const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#3a4f52'); g.addColorStop(1, '#1d2a31');
      c.save(); rr(c, x0, y0, w, h, r); c.clip(); c.fillStyle = g; c.fillRect(x0, y0, w, h);
      c.fillStyle = 'rgba(255,255,255,.10)'; for (const [a, b] of [[0.25, 0.08], [0.38, 0.04]]) { c.beginPath(); c.moveTo(x0 + w * a, y0); c.lineTo(x0 + w * (a + b), y0); c.lineTo(x0 + w * (a + b - 0.18), y1); c.lineTo(x0 + w * (a - 0.18), y1); c.closePath(); c.fill(); }
      if (t.mirror === 2) { c.strokeStyle = 'rgba(255,246,214,.6)'; c.lineWidth = 10; rr(c, x0 + 14, y0 + 14, w - 28, h - 28, Math.max(0, r - 14)); c.stroke(); }
      c.restore();
    }
    // neon pictures on the wall (no words): scissors, a moustache
    if (t.lights === 4) for (const [x0, y, x1] of L.bulbs) neon(c, (x0 + x1) / 2, y + 60, Math.min(160, (x1 - x0) * 0.25));
    // shelf and products
    const [sx0, sy0, sx1, sy1] = L.shelf;
    c.fillStyle = t.shelf >= 3 ? 'rgba(200,225,230,.55)' : '#6b4a33'; c.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
    if (t.shelf === 4) { c.fillStyle = P.accent; c.fillRect(sx0, sy1, sx1 - sx0, 8); }
    const cols = ['#d98a2c', '#3f9a54', '#f2efe8', '#3a72c0', '#c94a3d', '#8e5bb5', '#e6c04a', '#2f2f2f'];
    const count = [10, 12, 14, 16, 20][t.shelf];
    for (let k = 0; k < count; k++) {
      const x = sx0 + 20 + (sx1 - sx0 - 40) * (k + 0.5) / count + ((k * 37) % 21 - 10), hgt = 60 + (k * 53) % 70, wd = 40 + (k * 29) % 26;
      if (L.mirrors.some(([a, , b]) => x > a + 140 && x < b - 140) && t.shelf < 2) continue; // the original keeps the middle clear
      c.fillStyle = t.shelf >= 3 ? ['#c0c6cc', '#e6e8ea', '#9aa3ab', '#d4ad4b'][k % 4] : cols[k % cols.length];
      rr(c, x - wd / 2, sy0 - hgt, wd, hgt, 10); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - wd / 2 + 6, sy0 - hgt + 10, 6, hgt - 20);
    }
    // tea glasses and kolonya on the shelf from the first upgrade
    if (t.shelf >= 1) { teaGlass(c, sx1 - 70, sy0, 1); teaGlass(c, sx1 - 150, sy0, 1); kolonya(c, sx0 + 80, sy0, 1); if (t.shelf >= 3) kolonya(c, sx0 + 150, sy0, 0.9); }
    if (t.shelf >= 2) { const [tx, ty] = L.towels; for (let k = 0; k < 3; k++) { c.fillStyle = ['#f4f1ec', '#e8e2d8', '#f4f1ec'][k]; rr(c, tx - 90, ty - 30 - k * 32, 90, 30, 8); c.fill(); } }
    // plants, pictures and a clock
    if (t.decor >= 1) plant(c, L.plant[0], L.plant[1], t.decor >= 3 ? 1.6 : 1);
    if (t.decor >= 2) for (const [x0, y0, x1, y1] of L.art) { c.fillStyle = P.accent; c.fillRect(x0, y0, x1 - x0, y1 - y0); c.fillStyle = '#f4efe4'; c.fillRect(x0 + 14, y0 + 14, x1 - x0 - 28, y1 - y0 - 28); scissors(c, (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * 0.28, '#3a3a3a'); }
    if (t.decor >= 3) { const [cx, cy] = L.clock; c.fillStyle = INK; c.beginPath(); c.arc(cx, cy, 62, 0, 7); c.fill(); c.fillStyle = '#f7f2e8'; c.beginPath(); c.arc(cx, cy, 52, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - 36); c.moveTo(cx, cy); c.lineTo(cx + 26, cy + 8); c.stroke(); }
    if (t.decor >= 4) { plant(c, L.W - 90, L.base, 2.2); plant(c, 90, L.base, 2.2); }
  }
  function iznik(c, W, base) {
    const s = 150;
    for (let y = 0; y < base; y += s) for (let x = 0; x < W; x += s) {
      c.fillStyle = '#f4f1ea'; c.fillRect(x, y, s, s);
      c.strokeStyle = '#1f4f9a'; c.lineWidth = 6; c.strokeRect(x + 3, y + 3, s - 6, s - 6);
      const cx = x + s / 2, cy = y + s / 2;
      // four cobalt leaves in a quatrefoil, a red tulip in the middle, green stems
      c.fillStyle = '#2a64b8'; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; c.beginPath(); c.ellipse(cx + Math.cos(a) * 42, cy + Math.sin(a) * 42, 26, 11, a, 0, 7); c.fill(); }
      c.strokeStyle = '#3d8a5a'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, cy + 40); c.quadraticCurveTo(cx - 6, cy + 10, cx, cy - 4); c.stroke();
      c.fillStyle = '#c8322b'; c.beginPath(); c.moveTo(cx - 16, cy - 4); c.lineTo(cx - 14, cy - 30); c.lineTo(cx - 5, cy - 18); c.lineTo(cx, cy - 34); c.lineTo(cx + 5, cy - 18); c.lineTo(cx + 14, cy - 30); c.lineTo(cx + 16, cy - 4); c.quadraticCurveTo(cx, cy + 8, cx - 16, cy - 4); c.fill();
      c.fillStyle = '#2a64b8'; for (const [dx, dy] of [[-s / 2 + 3, -s / 2 + 3], [s / 2 - 3, -s / 2 + 3], [-s / 2 + 3, s / 2 - 3], [s / 2 - 3, s / 2 - 3]]) { c.beginPath(); c.arc(cx + dx, cy + dy, 14, 0, 7); c.fill(); }
    }
  }
  // tulip-shaped Turkish tea glasses on saucers, with red tea
  function teaGlass(c, x, y, k = 1) {
    c.fillStyle = '#d8b04a'; c.beginPath(); c.ellipse(x, y - 4 * k, 34 * k, 8 * k, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(160,40,20,.9)'; c.beginPath(); c.moveTo(x - 16 * k, y - 70 * k); c.quadraticCurveTo(x - 24 * k, y - 40 * k, x - 12 * k, y - 26 * k); c.quadraticCurveTo(x - 18 * k, y - 12 * k, x - 14 * k, y - 8 * k); c.lineTo(x + 14 * k, y - 8 * k); c.quadraticCurveTo(x + 18 * k, y - 12 * k, x + 12 * k, y - 26 * k); c.quadraticCurveTo(x + 24 * k, y - 40 * k, x + 16 * k, y - 70 * k); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4 * k; c.stroke();
  }
  // a kolonya bottle (lemon cologne)
  function kolonya(c, x, y, k = 1) {
    c.fillStyle = 'rgba(250,240,180,.85)'; rr(c, x - 22 * k, y - 110 * k, 44 * k, 110 * k, 12 * k); c.fill();
    c.fillStyle = '#f2d64e'; c.fillRect(x - 20 * k, y - 70 * k, 40 * k, 40 * k);
    c.fillStyle = '#c9a24a'; c.fillRect(x - 10 * k, y - 132 * k, 20 * k, 24 * k);
  }
  function glow(c, x, y, r, col) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  function plant(c, x, y, k) {
    c.fillStyle = '#b5603e'; c.beginPath(); c.moveTo(x - 40 * k, y - 70 * k); c.lineTo(x + 40 * k, y - 70 * k); c.lineTo(x + 30 * k, y); c.lineTo(x - 30 * k, y); c.closePath(); c.fill();
    c.fillStyle = '#3f7d46';
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.33; c.beginPath(); c.ellipse(x + Math.cos(a) * 60 * k, y - 70 * k + Math.sin(a) * 75 * k, 18 * k, 44 * k, a + Math.PI / 2, 0, 7); c.fill(); }
  }
  function scissors(c, x, y, s, col) {
    c.strokeStyle = col; c.lineWidth = s * 0.16; c.lineCap = 'round';
    c.beginPath(); c.arc(x - s * 0.45, y + s * 0.55, s * 0.28, 0, 7); c.stroke(); c.beginPath(); c.arc(x + s * 0.45, y + s * 0.55, s * 0.28, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(x - s * 0.3, y + s * 0.3); c.lineTo(x + s * 0.5, y - s); c.moveTo(x + s * 0.3, y + s * 0.3); c.lineTo(x - s * 0.5, y - s); c.stroke();
  }
  function neon(c, x, y, s) {
    c.save(); c.shadowColor = '#ff4fd8'; c.shadowBlur = 40; scissors(c, x - s * 1.2, y + s * 0.3, s * 0.8, '#ff7be3');
    c.shadowColor = '#4fe3ff'; c.strokeStyle = '#8af0ff'; c.lineWidth = s * 0.12; c.beginPath(); c.moveTo(x + s * 0.2, y + s * 0.4); c.quadraticCurveTo(x + s * 0.8, y - s * 0.1, x + s * 1.4, y + s * 0.4); c.quadraticCurveTo(x + s * 2, y - s * 0.1, x + s * 2.6, y + s * 0.4); c.stroke(); c.restore();
  }
  // the salon picture for an orientation, blurred like the original (soft focus keeps the haircut sharpest)
  function picture(orient, tiers, shop, scale = 0.5, blur = 7) {
    const L = LAYOUT[orient], P = SHOPS[shop], w = Math.round(L.W * scale), h = Math.round(L.H * scale);
    const a = document.createElement('canvas'); a.width = w; a.height = h;
    const c = a.getContext('2d'); c.scale(scale, scale); draw(c, L, tiers, P);
    if (!blur) return a;
    const b = document.createElement('canvas'); b.width = w; b.height = h;
    const d = b.getContext('2d');
    if ('filter' in d) { d.filter = `blur(${blur}px)`; d.drawImage(a, 0, 0); }
    else { const s = document.createElement('canvas'); s.width = w / 8; s.height = h / 8; s.getContext('2d').drawImage(a, 0, 0, w / 8, h / 8); d.imageSmoothingEnabled = true; d.drawImage(s, 0, 0, w, h); }
    return b;
  }
  let applied = null;
  function apply() {
    const root = document.querySelector('.game-root');
    if (!root || !S) return;
    const orient = innerWidth > innerHeight ? 'landscape' : 'portrait', key = orient + JSON.stringify(S);
    if (applied === key) return;
    applied = key;
    const url = picture(orient, S.tier, S.shop).toDataURL('image/jpeg', 0.88);
    root.style.backgroundImage = `url("${url}")`;
  }
  HSC.salon = { picture: (o, t, s) => picture(o, t || (S && S.tier), s == null ? S && S.shop : s, 0.5, 0), raw: picture, state: () => S, SLOTS };

  // ---- buying ----
  const coins = () => (HSC.coins ? HSC.coins.get() : 0);
  const finished = () => SLOTS.every((k) => S.tier[k] >= TOP);
  function buy(slot) {
    const t = S.tier[slot];
    if (t >= TOP) return false;
    const price = PRICE[t];
    if (coins() < price || !M() || !M().data) return false;
    M().data.coins -= price; M().save();
    S.tier[slot] = t + 1; save(); apply();
    return true;
  }
  function nextShop() {
    if (!finished() || S.shop >= SHOPS.length - 1) return false;
    S.shop++; for (const k of SLOTS) S.tier[k] = 0; save(); apply(); return true;
  }

  // ---- UI ----
  const COIN_OLD = (s = 20) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><circle cx="12" cy="12" r="9.5" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a12" stroke-width="1.8"/></svg>`;
  const COIN = (s = 20) => (HSC.icon ? HSC.icon('coin', s) : COIN_OLD(s)); // the theme's one coin (icons.js)
  // the salon's button: a barber chair (the shop you decorate)
  const CHAIR = `<svg viewBox="0 0 24 24" width="26" height="26"><path d="M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v6.5H5V5a1.5 1.5 0 0 1 1.5-1.5z" fill="#c0392b" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/><rect x="3.5" y="11" width="17" height="4" rx="1.6" fill="#e2553f" stroke="${INK}" stroke-width="1.7"/><path d="M3 9.5v4M21 9.5v4" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M12 15v4.5M7.5 20.5h9" stroke="#8a95a1" stroke-width="2.4" stroke-linecap="round"/><path d="M12 15v4.5M7.5 20.5h9" stroke="${INK}" stroke-width="0.9" stroke-linecap="round" opacity=".5"/></svg>`;
  const HAMMER = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"><path d="M14 4l6 6-2.5 2.5-6-6z" fill="#9aa3ab"/><path d="M12.5 8.5L4 17l3 3 8.5-8.5" fill="#c9782e"/></svg>`;
  const DOOR = `<svg viewBox="0 0 24 24" width="28" height="28"><rect x="6" y="3" width="12" height="18" rx="1.5" fill="#c9782e" stroke="${INK}" stroke-width="2"/><circle cx="15" cy="12.5" r="1.3" fill="#ffc83d"/><path d="M3 21h18" stroke="${INK}" stroke-width="2"/></svg>`;
  const TICK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2f9e44" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const CSS = `
#hsc-salon-btn{padding:0}
#hsc-salon{position:fixed;inset:0;z-index:30;display:none;background:#0d3f86b8;font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};zoom:var(--hsc-s,1);touch-action:manipulation}
#hsc-salon.open{display:flex;align-items:flex-end;justify-content:center}
#hsc-salon .sheet{width:min(100%,600px);max-height:92%;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:#fff6e6;border:3px solid ${INK};border-bottom:0;border-radius:26px 26px 0 0;box-shadow:0 -4px 0 ${INK};padding:12px max(12px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))}
@media (orientation:landscape){#hsc-salon.open{align-items:center}#hsc-salon .sheet{border-radius:26px;border-bottom:3px solid ${INK};box-shadow:0 5px 0 ${INK};max-width:820px}#hsc-salon .slots{grid-template-columns:1fr 1fr}}
#hsc-salon .head{display:flex;align-items:center;gap:10px}
#hsc-salon .head .grow{flex:1}
#hsc-salon .head .wallet{display:flex;align-items:center;gap:6px;height:44px;padding:0 14px 0 10px;border-radius:22px;border:3px solid ${INK};background:#fff;font-weight:900;font-size:18px}
#hsc-salon .x{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer;color:${INK};padding:0}
#hsc-salon .shops{display:flex;gap:6px}
#hsc-salon .shops i{width:14px;height:14px;border-radius:50%;border:2.5px solid ${INK};background:#e9dcc4}
#hsc-salon .shops i.on{background:#ffb627}
#hsc-salon .slots{display:grid;grid-template-columns:1fr;gap:8px}
#hsc-salon .slot{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:18px;border:3px solid ${INK};background:#fff}
#hsc-salon .slot canvas{width:96px;height:64px;border-radius:10px;border:2px solid ${INK};flex:none}
#hsc-salon .pips{flex:1;display:flex;gap:5px}
#hsc-salon .pips i{flex:1;height:12px;border-radius:6px;border:2px solid ${INK};background:#e9dcc4}
#hsc-salon .pips i.on{background:#ffb627}
#hsc-salon .buy{min-width:96px;height:48px;border-radius:24px;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};background:#ffb627;display:flex;align-items:center;justify-content:center;gap:4px;font-weight:900;font-size:17px;color:${INK};cursor:pointer;padding:0 10px}
#hsc-salon .buy:disabled{background:#e9dcc4;box-shadow:0 1px 0 ${INK};opacity:.7;cursor:default}
#hsc-salon .buy.max{background:#d8efd0}
#hsc-salon .next{align-self:center;height:56px;padding:0 20px;border-radius:28px;border:3px solid ${INK};box-shadow:0 4px 0 ${INK};background:#ffb627;display:flex;align-items:center;gap:8px;cursor:pointer;animation:hsc-tile 1s ease-in-out infinite}
#hsc-salon [hidden]{display:none}
`;
  const ui = {
    el: {}, built: false,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const p = document.createElement('div'); p.id = 'hsc-salon';
      p.innerHTML = `<div class="sheet" role="dialog" aria-label="Salon">
        <div class="head"><div class="shops"></div><div class="grow"></div><div class="wallet">${COIN(24)}<span></span></div><button class="x" type="button" aria-label="Close">${CLOSE}</button></div>
        <div class="slots"></div><button class="next" type="button" aria-label="Open the next shop" hidden>${DOOR}</button></div>`;
      document.body.appendChild(p);
      this.el.panel = p;
      p.querySelector('.x').addEventListener('click', () => p.classList.remove('open'));
      p.addEventListener('click', (e) => { if (e.target === p) p.classList.remove('open'); });
      p.querySelector('.next').addEventListener('click', () => { if (nextShop()) this.render(); });
      setInterval(() => this.tick(), 400);
      addEventListener('resize', () => apply());
    },
    button() {
      const row = document.querySelector('#hsc-hud .hsc-row');
      if (!row) return;
      if (!this.el.btn || !this.el.btn.isConnected) {
        const b = document.createElement('button');
        b.className = 'hsc-btn'; b.id = 'hsc-salon-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Salon');
        b.innerHTML = CHAIR + '<span class="hsc-dot" hidden></span>';
        b.addEventListener('click', () => { this.el.panel.classList.add('open'); this.render(); });
        const goals = document.getElementById('hsc-goals-btn');
        row.insertBefore(b, goals && goals.parentNode === row ? goals.nextSibling : row.children[1] || null);
        this.el.btn = b;
      }
      // a dot when an upgrade is affordable (once per new affordable price)
      const can = SLOTS.some((k) => S.tier[k] < TOP && coins() >= PRICE[S.tier[k]]) || (finished() && S.shop < SHOPS.length - 1);
      this.el.btn.querySelector('.hsc-dot').hidden = !can;
    },
    render() {
      const p = this.el.panel;
      if (!p.classList.contains('open')) return;
      p.querySelector('.wallet span').textContent = coins();
      p.querySelector('.shops').innerHTML = SHOPS.map((_, i) => `<i class="${i <= S.shop ? 'on' : ''}"></i>`).join('');
      const orient = innerWidth > innerHeight ? 'landscape' : 'portrait';
      const box = p.querySelector('.slots');
      box.innerHTML = '';
      for (const k of SLOTS) {
        const t = S.tier[k], row = document.createElement('div');
        row.className = 'slot';
        // a picture of the shop with this part upgraded once more (or as it is, when it is fully upgraded)
        const prev = Object.assign({}, S.tier, { [k]: Math.min(TOP, t + 1) });
        const cv = picture(orient, prev, S.shop, orient === 'portrait' ? 0.1 : 0.06, 0);
        const L = LAYOUT[orient], c2 = document.createElement('canvas'); c2.width = 192; c2.height = 128;
        // crop to the part
        // [x0, y0, x1, y1] of the part, in the picture's own pixels
        const crop = { wall: [0, 0, L.W, L.base], lower: [0, L.base - 60, L.W, L.H], mirror: L.mirrors[0], lights: [0, 0, L.W, L.base * 0.45], shelf: [L.shelf[0], L.shelf[1] - 280, L.shelf[2], L.shelf[3] + 30], decor: [0, 0, L.W, L.base] }[k];
        const sc = cv.width / L.W, [cx0, cy0, cx1, cy1] = crop;
        const m = 30;
        c2.getContext('2d').drawImage(cv, Math.max(0, (cx0 - m) * sc), Math.max(0, (cy0 - m) * sc), (cx1 - cx0 + 2 * m) * sc, (cy1 - cy0 + 2 * m) * sc, 0, 0, 192, 128);
        row.appendChild(c2);
        const pips = document.createElement('div'); pips.className = 'pips';
        pips.innerHTML = Array.from({ length: TOP }, (_, i) => `<i class="${i < t ? 'on' : ''}"></i>`).join('');
        row.appendChild(pips);
        const b = document.createElement('button'); b.type = 'button'; b.className = 'buy' + (t >= TOP ? ' max' : '');
        if (t >= TOP) { b.innerHTML = TICK; b.disabled = true; }
        else { b.innerHTML = COIN(20) + '<span>' + PRICE[t] + '</span>'; b.disabled = coins() < PRICE[t]; b.setAttribute('aria-label', 'Upgrade'); b.addEventListener('click', () => { if (buy(k)) { this.render(); this.button(); } else HSC.nope && HSC.nope(b); }); }
        row.appendChild(b);
        box.appendChild(row);
      }
      p.querySelector('.next').hidden = !(finished() && S.shop < SHOPS.length - 1);
    },
    tick() { if (!S) return; apply(); this.button(); },
  };

  async function boot() {
    if (!G() || !document.body || !M() || !M().data || !HSC.coins || !document.querySelector('#hsc-hud .hsc-row')) { setTimeout(boot, 300); return; }
    client = M().client;
    const d = client && client.loadProgress ? await client.loadProgress(KEY, null).catch(() => null) : null;
    S = sanitize(d);
    ui.build(); apply(); ui.button();
  }
  HSC.salonDebug = () => S; // QA
  boot();
})(globalThis.HSC || (globalThis.HSC = {}));
