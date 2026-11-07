// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved Option 1 "Your Shop", 5 November 2026): the barbershop
// behind the customer, built in 3D with Three.js r180 (three-r180.js, the same version as the game's engine) so it
// sits with the semi-realistic customer. The game's renderer, camera and controls are untouched: this module only
// renders pictures (the soft-focus backdrop, the shop screen, thumbnails) on its own small offscreen renderer.
//
// One base shop; every look is one choice per slot (SLOTS / PARTS). A regional shop (REGIONS) is a preset of parts
// with local materials and colours; never sacred objects or flags (docs/CAREER-SALON-BRANCH-PLAN.md section 7).
// The TV shows the player's own shop name (Settings); there is no sponsored content.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const THREE = HSC.THREE;
  if (!THREE) return;

  // ---- procedural textures (canvas): grain, wear and variation on every surface ----
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
  function noise(x, w, h, a, n) { for (let i = 0; i < n; i++) { const v = rnd() < 0.5 ? 0 : 255; x.fillStyle = `rgba(${v},${v},${v},${(rnd() * a) / 255})`; x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); } }
  const TEX = {
    checker() {
      const [c, x] = cv(512, 512), n = 4, s = 128;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const white = (i + j) % 2 === 0;
        x.fillStyle = white ? '#e7e2d8' : '#1b1b1f'; x.fillRect(i * s, j * s, s, s);
        x.save(); x.beginPath(); x.rect(i * s, j * s, s, s); x.clip();
        for (let k = 0; k < 3; k++) { x.strokeStyle = white ? `rgba(120,115,110,${0.15 + rnd() * 0.2})` : `rgba(90,90,100,${0.25 + rnd() * 0.25})`; x.lineWidth = 0.6 + rnd() * 1.2; x.beginPath(); let px = i * s + rnd() * s, py = j * s; x.moveTo(px, py); for (let t = 0; t < 10; t++) { px += (rnd() - 0.5) * 26; py += s / 9; x.lineTo(px, py); } x.stroke(); }
        x.restore();
      }
      noise(x, 512, 512, 12, 6000);
      x.strokeStyle = '#8c857b'; x.lineWidth = 2; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, 512); x.stroke(); x.beginPath(); x.moveTo(0, i * s); x.lineTo(512, i * s); x.stroke(); }
      return c;
    },
    wood(base, dark, w = 256, h = 256) {
      const [c, x] = cv(w, h);
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 110; i++) { x.strokeStyle = `rgba(${rnd() < 0.5 ? '30,15,8' : '120,80,50'},${0.05 + rnd() * 0.12})`; x.lineWidth = 0.6 + rnd() * 2; x.beginPath(); const p = rnd() * w; for (let t = 0; t <= 30; t++) { const q = (t / 30) * h, off = Math.sin(t * 0.3 + i) * 3; t ? x.lineTo(p + off, q) : x.moveTo(p + off, q); } x.stroke(); }
      for (let i = 0; i < 4; i++) { const g = x.createRadialGradient(rnd() * w, rnd() * h, 2, rnd() * w, rnd() * h, 30 + rnd() * 30); g.addColorStop(0, dark + '44'); g.addColorStop(1, '#0000'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
      noise(x, w, h, 10, 2000);
      return c;
    },
    deco(bg = '#efe3cc', ink = '#dcc9a4', gold = '#c49a42') {
      const [c, x] = cv(512, 512);
      x.fillStyle = bg; x.fillRect(0, 0, 512, 512);
      const fan = (cx, cy, r) => { for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(cx, cy, r - k * (r / 4.5), Math.PI, 2 * Math.PI); x.strokeStyle = k === 0 ? gold + '66' : ink; x.lineWidth = k === 0 ? 2 : 3; x.stroke(); } };
      for (let row = 0; row < 6; row++) for (let col = -1; col < 6; col++) fan(col * 128 + (row % 2) * 64 + 64, row * 96 + 90, 62);
      noise(x, 512, 512, 12, 6000);
      return c;
    },
    plaster(bg, speck = 'rgba(120,100,80,0.05)') {
      const [c, x] = cv(256, 256);
      x.fillStyle = bg; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 30; i++) { const g = x.createRadialGradient(rnd() * 256, rnd() * 256, 2, rnd() * 256, rnd() * 256, 30 + rnd() * 40); g.addColorStop(0, speck); g.addColorStop(1, '#0000'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }
      noise(x, 256, 256, 8, 3000);
      return c;
    },
    subway() {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#cfcac0'; x.fillRect(0, 0, 256, 256);
      for (let r = 0; r < 8; r++) for (let k = -1; k < 5; k++) { const ox = k * 64 + (r % 2) * 32, oy = r * 32; const g = x.createLinearGradient(0, oy, 0, oy + 32); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#f1eee6'); x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(ox + 2, oy + 2, 60, 28, 4) : x.rect(ox + 2, oy + 2, 60, 28); x.fill(); }
      return c;
    },
    slats(bg = '#efe6d6', slat = '#d9b48a') {
      const [c, x] = cv(256, 256);
      x.fillStyle = bg; x.fillRect(0, 0, 256, 256);
      const wd = TEX.wood(slat, '#a8805a', 32, 256);
      for (let i = 0; i < 8; i++) x.drawImage(wd, i * 32 + 5, 0, 22, 256);
      return c;
    },
    painted(style) {
      // blue-and-white hand-painted tile: Talavera and Iznik families (floral, not religious)
      const [c, x] = cv(256, 256), s = 64;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const ox = i * s, oy = j * s, cx = ox + s / 2, cy = oy + s / 2;
        x.fillStyle = '#f7f3ea'; x.fillRect(ox, oy, s, s); x.strokeStyle = '#d8d2c4'; x.lineWidth = 2; x.strokeRect(ox + 1, oy + 1, s - 2, s - 2);
        if (style === 'talavera') {
          x.fillStyle = '#1f4fa8'; for (let a = 0; a < 8; a++) { x.save(); x.translate(cx, cy); x.rotate((a / 8) * Math.PI * 2); x.beginPath(); x.ellipse(0, -13, 4.5, 10, 0, 0, 7); x.fill(); x.restore(); }
          x.fillStyle = '#f2b632'; x.beginPath(); x.arc(cx, cy, 6, 0, 7); x.fill();
          x.fillStyle = '#1f4fa8'; for (const [dx, dy] of [[0, 0], [s, 0], [0, s], [s, s]]) { x.beginPath(); x.arc(ox + dx, oy + dy, 9, 0, 7); x.fill(); }
        } else {
          x.strokeStyle = '#1d4fa0'; x.lineWidth = 3; x.strokeRect(ox + 5, oy + 5, s - 10, s - 10);
          x.fillStyle = '#2aa6a0'; for (const sg of [-1, 1]) { x.beginPath(); x.ellipse(cx + sg * 9, cy + 5, 3.5, 11, sg * 0.5, 0, 7); x.fill(); }
          x.fillStyle = '#c8322e'; x.beginPath(); x.moveTo(cx, cy - 17); x.bezierCurveTo(cx + 9, cy - 12, cx + 7, cy - 1, cx, cy + 1); x.bezierCurveTo(cx - 7, cy - 1, cx - 9, cy - 12, cx, cy - 17); x.fill();
        }
      }
      return c;
    },
    terrazzo() {
      const [c, x] = cv(512, 512);
      x.fillStyle = '#ece7df'; x.fillRect(0, 0, 512, 512);
      const cols = ['#c9b8a6', '#8f9aa6', '#d98a6a', '#6f7f6a', '#f7f4ef', '#3a3a3e'];
      for (let i = 0; i < 700; i++) { x.fillStyle = cols[i % 6]; x.beginPath(); const r = 1.5 + rnd() * 5; x.ellipse(rnd() * 512, rnd() * 512, r, r * (0.5 + rnd() * 0.5), rnd() * 3, 0, 7); x.fill(); }
      return c;
    },
    herringbone() {
      const [c, x] = cv(512, 512);
      x.fillStyle = '#8a6a44'; x.fillRect(0, 0, 512, 512);
      const L = 80, W = 20;
      for (let r = -8; r < 30; r++) for (let k = -8; k < 30; k++) { const ox = k * W * 2 + r * W, oy = r * W * 2; x.fillStyle = (r + k) % 2 ? '#c8a274' : '#b48c5e'; x.fillRect(ox, oy, L, W - 1); x.fillStyle = (r + k) % 2 ? '#b48c5e' : '#c8a274'; x.fillRect(ox + L - W + 1, oy + W, W - 1, L); }
      noise(x, 512, 512, 10, 5000);
      return c;
    },
    terracotta() {
      const [c, x] = cv(512, 512), s = 512 / 6;
      x.fillStyle = '#9a5a3a'; x.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { const v = rnd() * 22; x.fillStyle = `rgb(${196 - v},${112 - v * 0.6},${74 - v * 0.4})`; x.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); }
      noise(x, 512, 512, 12, 5000);
      return c;
    },
    cement() {
      const [c, x] = cv(512, 512), s = 128;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const ox = i * s, oy = j * s, cx = ox + s / 2, cy = oy + s / 2;
        x.fillStyle = '#f1ece2'; x.fillRect(ox, oy, s, s);
        x.fillStyle = '#5f8f8a'; x.beginPath(); x.moveTo(cx, oy + 10); x.lineTo(ox + s - 10, cy); x.lineTo(cx, oy + s - 10); x.lineTo(ox + 10, cy); x.fill();
        x.fillStyle = '#f1ece2'; x.beginPath(); x.arc(cx, cy, s * 0.22, 0, 7); x.fill();
        x.fillStyle = '#d9a35a'; x.beginPath(); x.arc(cx, cy, s * 0.1, 0, 7); x.fill();
        for (const [dx, dy] of [[0, 0], [s, 0], [0, s], [s, s]]) { x.beginPath(); x.arc(ox + dx, oy + dy, s * 0.14, 0, 7); x.fill(); }
      }
      return c;
    },
    indigo() {
      // hand-dyed indigo resist cloth (adire family): circles and lines
      const [c, x] = cv(256, 256);
      x.fillStyle = '#20356b'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#c9d6ee'; x.fillStyle = '#c9d6ee';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const ox = i * 64, oy = j * 64, cx = ox + 32, cy = oy + 32;
        if ((i + j) % 2) { for (let r = 6; r < 28; r += 6) { x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke(); } }
        else { x.lineWidth = 2; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(ox + 7, oy + 9 + k * 9); x.lineTo(ox + 57, oy + 9 + k * 9); x.stroke(); } }
      }
      return c;
    },
    sky(warm) {
      const [c, x] = cv(512, 384);
      const g = x.createLinearGradient(0, 0, 0, 384); g.addColorStop(0, '#8ec9f2'); g.addColorStop(0.7, '#d9ecf7'); g.addColorStop(1, '#f2eee6'); x.fillStyle = g; x.fillRect(0, 0, 512, 384);
      for (let i = 0; i < 4; i++) { const cx = rnd() * 512, cy = 30 + rnd() * 100; for (let k = 0; k < 5; k++) { x.fillStyle = 'rgba(255,255,255,0.7)'; x.beginPath(); x.ellipse(cx + k * 15, cy + Math.sin(k) * 4, 20, 11, 0, 0, 7); x.fill(); } }
      const fac = warm ? ['#e8c9a0', '#d9a77a', '#f2dcc0', '#c98f6a'] : ['#e9e2d6', '#d8cdbd', '#c9d3dc', '#efe7d9'];
      let bx = -10;
      while (bx < 512) { const bw = 55 + rnd() * 70, bh = 130 + rnd() * 150, by = 384 - bh; x.fillStyle = fac[Math.floor(rnd() * 4)]; x.fillRect(bx, by, bw, bh); for (let wy = by + 10; wy < 350; wy += 22) for (let wx = bx + 7; wx < bx + bw - 12; wx += 17) { x.fillStyle = '#6f8aa0'; x.fillRect(wx, wy, 9, 13); } bx += bw + 4; }
      x.fillStyle = '#b9b2a6'; x.fillRect(0, 365, 512, 19);
      return c;
    },
    label(bg, ink, text, accent) {
      const [c, x] = cv(256, 64);
      x.fillStyle = bg; x.fillRect(0, 0, 256, 64);
      if (accent) { x.fillStyle = accent; x.fillRect(0, 5, 256, 3); x.fillRect(0, 56, 256, 3); }
      x.fillStyle = ink; x.font = '900 26px "Arial Rounded MT Bold", Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
      for (const cx of [64, 192]) x.fillText(text, cx, 33);
      return c;
    },
    chart() {
      // a classic style chart: pictures of cuts, no words
      const [c, x] = cv(256, 384);
      x.fillStyle = '#f4ecdc'; x.fillRect(0, 0, 256, 384); x.strokeStyle = '#2a2a2a'; x.lineWidth = 3; x.strokeRect(9, 9, 238, 366);
      for (let i = 0; i < 6; i++) {
        const cx = 70 + (i % 2) * 116, cy = 75 + Math.floor(i / 2) * 110;
        x.fillStyle = '#e8d8bc'; x.beginPath(); x.ellipse(cx, cy + 5, 31, 37, 0, 0, 7); x.fill();
        x.fillStyle = '#2a2016'; x.beginPath(); x.ellipse(cx, cy - 11, 32, [13, 20, 6, 26, 17, 10][i] + 15, 0, Math.PI, 2 * Math.PI); x.fill();
        x.fillStyle = '#c9a24a'; x.fillRect(cx - 20, cy + 50, 40, 3);
      }
      return c;
    },
    pole() {
      const [c, x] = cv(128, 256);
      x.fillStyle = '#f4f2ee'; x.fillRect(0, 0, 128, 256);
      const cols = ['#c8202c', '#f4f2ee', '#1f4fb4', '#f4f2ee'];
      for (let i = -8; i < 16; i++) { x.fillStyle = cols[((i % 4) + 4) % 4]; x.beginPath(); x.moveTo(0, i * 20); x.lineTo(128, i * 20 + 64); x.lineTo(128, i * 20 + 84); x.lineTo(0, i * 20 + 20); x.fill(); }
      return c;
    },
    peg() {
      const [c, x] = cv(256, 128);
      x.fillStyle = '#b8936a'; x.fillRect(0, 0, 256, 128); noise(x, 256, 128, 18, 2500);
      for (let i = 0; i < 32; i++) for (let j = 0; j < 16; j++) { x.fillStyle = '#3a2a1c'; x.beginPath(); x.arc(4 + i * 8, 4 + j * 8, 1.3, 0, 7); x.fill(); }
      return c;
    },
    tuft() {
      const [c, x] = cv(128, 128);
      x.fillStyle = '#808080'; x.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const cx = i * 32 + (j % 2) * 16, cy = j * 32 + 16, g = x.createRadialGradient(cx, cy, 1, cx, cy, 20); g.addColorStop(0, '#202020'); g.addColorStop(0.25, '#9a9a9a'); g.addColorStop(1, '#808080'); x.fillStyle = g; x.fillRect(cx - 20, cy - 20, 40, 40); }
      return c;
    },
    carbon() { const [c, x] = cv(128, 128); for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { x.fillStyle = (i + j) % 2 ? '#16171b' : '#23252b'; x.fillRect(i * 8, j * 8, 8, 8); } return c; },
    flame() {
      const [c, x] = cv(128, 256);
      x.fillStyle = '#a3121b'; x.fillRect(0, 0, 128, 256);
      for (let i = 0; i < 9; i++) { const cx = 10 + i * 14, g = x.createLinearGradient(0, 256, 0, 75); g.addColorStop(0, '#ffcf3a'); g.addColorStop(0.5, '#ff6a1a'); g.addColorStop(1, '#ff6a1a00'); x.fillStyle = g; x.beginPath(); x.moveTo(cx - 12, 256); x.bezierCurveTo(cx - 15, 190, cx + 5, 165, cx - 2, 85 + rnd() * 40); x.bezierCurveTo(cx + 13, 150, cx + 15, 200, cx + 12, 256); x.fill(); }
      return c;
    },
  };
  // the TV: the player's own shop name, fitted to the screen in every script; and the year it was named
  const RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
  function nameCanvas(name, year) {
    const w = 1024, h = 576, [c, x] = cv(w, h);
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#123a3a'); g.addColorStop(1, '#0a1a24'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const r = x.createRadialGradient(w / 2, h * 0.45, 10, w / 2, h * 0.45, h * 0.8); r.addColorStop(0, '#ffffff22'); r.addColorStop(1, '#0000'); x.fillStyle = r; x.fillRect(0, 0, w, h);
    const ink = '#ffe7a8';
    x.strokeStyle = ink; x.lineWidth = 10; x.lineCap = 'round';
    const cx = w / 2, cy = name ? 140 : h / 2 - 20, k = name ? 1 : 1.8;
    x.beginPath(); x.arc(cx - 70 * k, cy + 22 * k, 22 * k, 0, 7); x.stroke(); x.beginPath(); x.arc(cx - 70 * k, cy - 22 * k, 22 * k, 0, 7); x.stroke();
    x.beginPath(); x.moveTo(cx - 50 * k, cy + 14 * k); x.lineTo(cx + 80 * k, cy - 26 * k); x.moveTo(cx - 50 * k, cy - 14 * k); x.lineTo(cx + 80 * k, cy + 26 * k); x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const fit = (text, max, size, min, weight) => { let s = size; do { x.font = `${weight} ${s}px "Arial Rounded MT Bold", "Noto Sans", Arial, sans-serif`; s -= 4; } while (x.measureText(text).width > max && s > min); };
    if (name) {
      x.direction = RTL.test(name) ? 'rtl' : 'ltr';
      fit(name, w * 0.86, 128, 36, 900); x.fillStyle = ink; x.fillText(name, w / 2, h * 0.58);
    }
    if (year) {
      const est = (HSC.t ? HSC.t('est') : 'Est. {y}').replace('{y}', year);
      x.direction = RTL.test(est) ? 'rtl' : 'ltr';
      fit(est, w * 0.6, 40, 20, 700); x.fillStyle = '#ffffffbf'; x.fillText(est, w / 2, name ? h * 0.8 : h * 0.78);
    }
    return c;
  }

  // ---- materials and models ----
  const tex = (canvas, rep = [1, 1], srgb = true) => { const t = new THREE.CanvasTexture(canvas); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const M = {
    chrome: () => new THREE.MeshStandardMaterial({ color: '#e8ecf2', metalness: 1, roughness: 0.14 }),
    brushed: () => new THREE.MeshStandardMaterial({ color: '#c9ced6', metalness: 1, roughness: 0.32 }),
    brass: () => new THREE.MeshStandardMaterial({ color: '#c9a046', metalness: 1, roughness: 0.28 }),
    gold: () => new THREE.MeshStandardMaterial({ color: '#e2b84f', metalness: 1, roughness: 0.2 }),
    blackGloss: () => new THREE.MeshPhysicalMaterial({ color: '#0c0d10', metalness: 0.2, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }),
    blackMatte: () => new THREE.MeshStandardMaterial({ color: '#151619', metalness: 0.1, roughness: 0.6 }),
    leather: (c, bump) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4, bumpMap: bump || null, bumpScale: 1.4 }),
    glass: (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.08, transparent: true, opacity: 0.72, clearcoat: 1 }),
    wood: (base, dark, rep = [1, 1]) => new THREE.MeshStandardMaterial({ map: tex(TEX.wood(base, dark), rep), roughness: 0.55 }),
    white: () => new THREE.MeshPhysicalMaterial({ color: '#f4f2ee', roughness: 0.35, clearcoat: 0.6 }),
  };
  const rbox = (w, h, d, r, seg = 3) => new THREE.RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
  const mesh = (g, m, cast = true, recv = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = recv; return o; };

  function clipper(finish) {
    const g = new THREE.Group();
    const body = finish === 'carbon' ? new THREE.MeshPhysicalMaterial({ map: tex(TEX.carbon(), [2, 4]), roughness: 0.35, clearcoat: 1, metalness: 0.3 })
      : finish === 'flame' ? new THREE.MeshPhysicalMaterial({ map: tex(TEX.flame()), roughness: 0.3, clearcoat: 1, metalness: 0.5 })
        : finish === 'gold' ? M.gold() : M.chrome();
    const accent = finish === 'chrome' ? M.blackGloss() : M.gold();
    const s = new THREE.Shape(), W1 = 0.027, W2 = 0.022, H = 0.165;
    s.moveTo(-W2, 0); s.lineTo(W2, 0); s.quadraticCurveTo(W2 + 0.006, 0.01, W2 + 0.005, 0.03); s.lineTo(W1, H - 0.01); s.quadraticCurveTo(W1, H, W1 - 0.01, H);
    s.lineTo(-W1 + 0.01, H); s.quadraticCurveTo(-W1, H, -W1, H - 0.01); s.lineTo(-W2 - 0.005, 0.03); s.quadraticCurveTo(-W2 - 0.006, 0.01, -W2, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.026, bevelEnabled: true, bevelThickness: 0.009, bevelSize: 0.008, bevelSegments: 4, curveSegments: 10 });
    geo.translate(0, 0, -0.013);
    const pos = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + 0.04) / 0.08, pos.getY(i) / H);
    g.add(mesh(geo, body));
    const head = mesh(rbox(0.062, 0.022, 0.04, 0.006), M.brushed()); head.position.set(0, H + 0.016, 0); g.add(head);
    const blade = mesh(rbox(0.064, 0.008, 0.012, 0.002), M.chrome()); blade.position.set(0, H + 0.03, 0.006); g.add(blade);
    const sw = mesh(rbox(0.016, 0.03, 0.01, 0.005), accent); sw.position.set(0, 0.11, 0.022); g.add(sw);
    return g;
  }
  function chair(leather, metal) {
    const g = new THREE.Group(), met = metal === 'gold' ? M.gold() : M.chrome();
    const lea = M.leather(leather, tex(TEX.tuft(), [2, 2], false)), plain = M.leather(leather);
    const base = mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.035, 40), met); base.position.y = 0.018; g.add(base);
    const pump = mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.32, 28), met); pump.position.y = 0.2; g.add(pump);
    const col = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 20), met); col.position.y = 0.42; g.add(col);
    const seat = mesh(rbox(0.56, 0.14, 0.52, 0.06), plain); seat.position.set(0, 0.54, 0); g.add(seat);
    const back = mesh(rbox(0.52, 0.62, 0.13, 0.06), lea); back.position.set(0, 0.92, -0.22); back.rotation.x = -0.12; g.add(back);
    const head = mesh(rbox(0.26, 0.12, 0.1, 0.045), plain); head.position.set(0, 1.3, -0.27); g.add(head);
    const headBar = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 10), met); headBar.position.set(0, 1.22, -0.29); g.add(headBar);
    for (const sd of [-1, 1]) {
      // the armrests sit on the seat's edge: a chrome side frame bolted to the seat carries a padded arm
      const frame = mesh(rbox(0.035, 0.2, 0.42, 0.012), met); frame.position.set(sd * 0.29, 0.6, 0); g.add(frame);
      const arm = mesh(rbox(0.085, 0.055, 0.48, 0.026), plain); arm.position.set(sd * 0.29, 0.725, 0.02); g.add(arm);
    }
    const foot = mesh(rbox(0.42, 0.025, 0.14, 0.01), met); foot.position.set(0, 0.2, 0.42); g.add(foot);
    for (const xx of [-0.14, 0.14]) {
      const a = new THREE.Vector3(xx, 0.5, 0.24), b = new THREE.Vector3(xx, 0.21, 0.4), st = mesh(new THREE.CylinderGeometry(0.012, 0.012, a.distanceTo(b), 10), met);
      st.position.copy(a.clone().add(b).multiplyScalar(0.5)); st.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); g.add(st);
    }
    const pedal = mesh(rbox(0.2, 0.022, 0.035, 0.008), met); pedal.position.set(0.17, 0.08, 0.05); pedal.rotation.y = -0.35; g.add(pedal);
    const tread = mesh(rbox(0.07, 0.03, 0.05, 0.01), M.blackMatte()); tread.position.set(0.27, 0.085, 0.09); tread.rotation.y = -0.35; g.add(tread);
    return g;
  }
  function tin(label, lid = '#1a1b1f') {
    const g = new THREE.Group();
    const body = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 32, 1, true), new THREE.MeshStandardMaterial({ map: tex(label), metalness: 0.4, roughness: 0.35 })); body.position.y = 0.02; g.add(body);
    const top = mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.014, 32), new THREE.MeshStandardMaterial({ color: lid, metalness: 0.6, roughness: 0.25 })); top.position.y = 0.045; g.add(top);
    return g;
  }
  function bottle(glass, cap, label, h = 0.2) {
    const g = new THREE.Group();
    const prof = [[0, 0], [0.032, 0], [0.036, 0.006], [0.036, h * 0.62], [0.03, h * 0.72], [0.014, h * 0.8], [0.012, h * 0.88]].map(([x, y]) => new THREE.Vector2(x, y));
    g.add(mesh(new THREE.LatheGeometry(prof, 32), M.glass(glass)));
    const cp = mesh(new THREE.CylinderGeometry(0.016, 0.016, h * 0.14, 20), cap || M.blackGloss()); cp.position.y = h * 0.93; g.add(cp);
    if (label) { const lb = mesh(new THREE.CylinderGeometry(0.0365, 0.0365, h * 0.3, 32, 1, true, -1.2, 2.4), new THREE.MeshStandardMaterial({ map: tex(label), roughness: 0.6 })); lb.position.y = h * 0.32; lb.rotation.y = Math.PI / 2; g.add(lb); }
    return g;
  }
  function neonSign(pink, cyan) {
    const g = new THREE.Group();
    const tube = (pts, col, r = 0.008, closed = false) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0.03)), closed), 80, r, 8, closed), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 3 }), false, false);
    const ring = (cx, cy, r) => Array.from({ length: 14 }, (_, i) => [cx + Math.cos((i / 14) * Math.PI * 2) * r, cy + Math.sin((i / 14) * Math.PI * 2) * r]);
    g.add(tube(ring(-0.36, 0.07, 0.06), pink, 0.008, true)); g.add(tube(ring(-0.36, -0.09, 0.06), pink, 0.008, true));
    g.add(tube([[-0.3, 0.05], [-0.1, -0.02], [0.08, -0.1]], pink)); g.add(tube([[-0.3, -0.07], [-0.1, 0], [0.08, 0.08]], pink));
    g.add(tube([[0.14, 0.09], [0.42, 0.09], [0.42, 0.04], [0.14, 0.04], [0.14, 0.09]], cyan));
    for (let i = 0; i < 9; i++) g.add(tube([[0.16 + i * 0.032, 0.04], [0.16 + i * 0.032, -0.08]], cyan, 0.006));
    g.add(mesh(rbox(1.0, 0.36, 0.02, 0.03), new THREE.MeshPhysicalMaterial({ color: '#0a0c12', roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.85 })));
    g.userData.lights = [[pink, -0.2], [cyan, 0.28]];
    return g;
  }
  function pole() {
    const g = new THREE.Group(), st = tex(TEX.pole(), [1, 1.6]);
    g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.72, 32), new THREE.MeshStandardMaterial({ map: st, roughness: 0.35, emissive: '#ffffff', emissiveMap: st, emissiveIntensity: 0.2 })));
    g.add(mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.72, 32, 1, true), M.glass('#ffffff'), false));
    for (const s of [1, -1]) { const cap = mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 32), M.chrome()); cap.position.y = s * 0.385; g.add(cap); }
    const dome = mesh(new THREE.SphereGeometry(0.075, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.chrome()); dome.position.y = 0.41; g.add(dome);
    const tip = mesh(new THREE.SphereGeometry(0.03, 16, 10), M.brass()); tip.position.y = 0.49; g.add(tip);
    return g;
  }
  function pendant(style) {
    const g = new THREE.Group();
    if (style === 'globe') { g.add(mesh(new THREE.SphereGeometry(0.15, 32, 20), new THREE.MeshStandardMaterial({ color: '#fffaf0', emissive: '#ffe2b0', emissiveIntensity: 1.2, roughness: 0.35 }), false)); const cap = mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.06, 20), M.brass()); cap.position.y = 0.16; g.add(cap); return g; }
    if (style === 'lantern') { const l = mesh(new THREE.SphereGeometry(0.16, 24, 18), new THREE.MeshStandardMaterial({ color: '#ffe9c4', emissive: '#ffcf8a', emissiveIntensity: 1.4, roughness: 0.9 }), false); l.scale.y = 1.25; g.add(l); for (const y of [0.2, -0.2]) { const c = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 20), M.blackMatte()); c.position.y = y; g.add(c); } return g; }
    const prof = [[0.012, 0.1], [0.03, 0.09], [0.05, 0.05], [0.16, -0.06], [0.17, -0.08]].map(([x, y]) => new THREE.Vector2(x, y));
    g.add(mesh(new THREE.LatheGeometry(prof, 32), new THREE.MeshStandardMaterial({ color: '#16181d', metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide })));
    const b = mesh(new THREE.SphereGeometry(0.04, 16, 12), new THREE.MeshStandardMaterial({ color: '#fff3d6', emissive: '#ffd99a', emissiveIntensity: 3 }), false); b.position.y = -0.04; g.add(b);
    return g;
  }
  function plant(scale) {
    const g = new THREE.Group();
    const potP = [[0, 0], [0.13, 0], [0.16, 0.05], [0.18, 0.3], [0.19, 0.32], [0.17, 0.32], [0, 0.32]].map(([x, y]) => new THREE.Vector2(x, y));
    g.add(mesh(new THREE.LatheGeometry(potP, 32), new THREE.MeshPhysicalMaterial({ color: '#efe9df', roughness: 0.35, clearcoat: 0.6 })));
    const ls = new THREE.Shape(); ls.moveTo(0, 0); ls.bezierCurveTo(0.09, 0.08, 0.08, 0.26, 0, 0.34); ls.bezierCurveTo(-0.08, 0.26, -0.09, 0.08, 0, 0);
    const lg = new THREE.ShapeGeometry(ls, 8), greens = ['#2f6b3a', '#3c8048', '#28592f', '#467f3e'];
    for (let i = 0; i < 14; i++) {
      const piv = new THREE.Group(); piv.position.y = 0.3; piv.rotation.y = (i / 14) * Math.PI * 2 + rnd() * 0.3; g.add(piv);
      const arm = new THREE.Group(); arm.rotation.z = 0.5 + rnd() * 0.6; piv.add(arm);
      const len = 0.25 + rnd() * 0.35, stem = mesh(new THREE.CylinderGeometry(0.004, 0.006, len, 5), new THREE.MeshStandardMaterial({ color: '#335a2c' })); stem.position.y = len / 2; arm.add(stem);
      const leaf = mesh(lg, new THREE.MeshStandardMaterial({ color: greens[i % 4], roughness: 0.5, side: THREE.DoubleSide })); leaf.position.y = len; leaf.rotation.x = -0.6 - rnd() * 0.5; leaf.scale.setScalar(0.9 + rnd() * 0.6); arm.add(leaf);
    }
    g.scale.setScalar(scale);
    return g;
  }
  function mirrorModel(w, h, frameMat) {
    // no vanity bulbs: the light stays soft at the top of the picture (owner, 5 November 2026)
    const g = new THREE.Group(), r = 0.06, b = 0.07;
    const rr = (s, x, y, W, H, R) => { s.moveTo(x + R, y); s.lineTo(x + W - R, y); s.quadraticCurveTo(x + W, y, x + W, y + R); s.lineTo(x + W, y + H - R); s.quadraticCurveTo(x + W, y + H, x + W - R, y + H); s.lineTo(x + R, y + H); s.quadraticCurveTo(x, y + H, x, y + H - R); s.lineTo(x, y + R); s.quadraticCurveTo(x, y, x + R, y); };
    const outer = new THREE.Shape(); rr(outer, -w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b, r + b * 0.5);
    const hole = new THREE.Path(); rr(hole, -w / 2, -h / 2, w, h, r); outer.holes.push(hole);
    g.add(mesh(new THREE.ExtrudeGeometry(outer, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 4, curveSegments: 10 }), frameMat));
    const gs = new THREE.Shape(); rr(gs, -w / 2, -h / 2, w, h, r);
    const gl = mesh(new THREE.ShapeGeometry(gs, 10), new THREE.MeshPhysicalMaterial({ color: '#b9c6c8', metalness: 0.75, roughness: 0.14, envMapIntensity: 0.9, clearcoat: 1, clearcoatRoughness: 0.05 }), false, true);
    gl.position.z = 0.012; g.add(gl);
    return g;
  }

  // ---- the modular parts: every shop is the same base with one choice per slot (the first is always neutral) ----
  const SLOTS = ['wall', 'lower', 'floor', 'mat', 'mirror', 'lights', 'shelf', 'chair', 'decor'];
  const PARTS = {
    wall: { deco: () => TEX.deco(), plaster: () => TEX.plaster('#f4efe6'), subway: () => TEX.subway(), mint: () => TEX.plaster('#cfe6d8', 'rgba(60,110,80,0.06)'), blush: () => TEX.plaster('#f2d9cf', 'rgba(150,80,60,0.06)'), ochre: () => TEX.plaster('#efc98a', 'rgba(160,90,30,0.08)'), hinoki: () => TEX.slats() },
    lower: { oak: { kind: 'wood', c: ['#b98a5a', '#8a6038'] }, walnut: { kind: 'wood', c: ['#7a4c30', '#4a2a18'] }, navy: { kind: 'paint', c: '#2f4766' }, teal: { kind: 'paint', c: '#2f7a76' }, sage: { kind: 'paint', c: '#8fae94' }, stone: { kind: 'paint', c: '#cfc8bc' }, talavera: { kind: 'tile', t: () => TEX.painted('talavera') }, iznik: { kind: 'tile', t: () => TEX.painted('iznik') } },
    floor: { checker: () => [TEX.checker(), 1.2], herringbone: () => [TEX.herringbone(), 2.2], terrazzo: () => [TEX.terrazzo(), 2.5], cement: () => [TEX.cement(), 1.6], terracotta: () => [TEX.terracotta(), 2.0], stone: () => [TEX.plaster('#d9d4cb', 'rgba(90,90,90,0.08)'), 2.0] },
    mat: { black: '#26282d', jute: '#c9a77a', red: '#9e2a2a', indigo: 'indigo', none: null },
    mirror: { brass: () => M.brass(), oak: () => M.wood('#b98a5a', '#8a6038'), black: () => M.blackGloss(), white: () => M.white() },
    lights: { industrial: 1, globe: 1, lantern: 1 },
    shelf: { classic: 1, coastal: 1, vintage: 1 },
    chair: { oxblood: '#7a1e1e', black: '#141414', cream: '#e9e1d2', green: '#1f4a34', mustard: '#c98a2a', navy: '#24395a' },
    decor: { chart: 1, plant: 1, indigo: 1 },
  };
  const OPTIONS = Object.fromEntries(SLOTS.map((k) => [k, Object.keys(PARTS[k])]));
  // regional shops: presets of parts with local materials (city names are the labels)
  const REGIONS = {
    classic: { wall: 'deco', lower: 'oak', floor: 'checker', mat: 'black', mirror: 'brass', lights: 'industrial', shelf: 'classic', chair: 'oxblood', decor: 'chart', neon: ['#ff3d9a', '#3df2ff'] },
    london: { wall: 'subway', lower: 'navy', floor: 'herringbone', mat: 'black', mirror: 'brass', lights: 'globe', shelf: 'vintage', chair: 'green', decor: 'chart', neon: ['#ffd36a', '#ffffff'] },
    tokyo: { wall: 'hinoki', lower: 'stone', floor: 'stone', mat: 'jute', mirror: 'black', lights: 'lantern', shelf: 'coastal', chair: 'black', decor: 'plant', neon: ['#3df2ff', '#ffffff'] },
    lagos: { wall: 'ochre', lower: 'teal', floor: 'terrazzo', mat: 'indigo', mirror: 'oak', lights: 'globe', shelf: 'classic', chair: 'mustard', decor: 'indigo', neon: ['#ffd36a', '#3df2ff'] },
    istanbul: { wall: 'plaster', lower: 'iznik', floor: 'terrazzo', mat: 'red', mirror: 'brass', lights: 'globe', shelf: 'vintage', chair: 'oxblood', decor: 'plant', neon: ['#3df2ff', '#ffd36a'] },
    mexico: { wall: 'plaster', lower: 'talavera', floor: 'terracotta', mat: 'jute', mirror: 'oak', lights: 'globe', shelf: 'coastal', chair: 'navy', decor: 'plant', neon: ['#ff3d9a', '#ffd36a'] },
    mumbai: { wall: 'mint', lower: 'oak', floor: 'cement', mat: 'red', mirror: 'brass', lights: 'globe', shelf: 'classic', chair: 'mustard', decor: 'chart', neon: ['#ff3d9a', '#3df2ff'] },
  };

  // ---- the room ----
  const WIN = { x0: -2.55, x1: -1.5, y0: 1.15, y1: 2.5 };
  function buildRoom(scene, parts, info) {
    const P = Object.assign({}, REGIONS.classic, parts);
    const hot = {}, W = 7.2, Hc = 3.2, wainH = 1.0;
    const lower = PARTS.lower[P.lower], frameMat = PARTS.mirror[P.mirror]();
    const trim = lower.kind === 'wood' ? lower.c : lower.kind === 'paint' ? [lower.c, lower.c] : ['#b98a5a', '#8a6038'];
    // floor and ceiling
    const [fc, tile] = PARTS.floor[P.floor]();
    const fl = mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshPhysicalMaterial({ map: tex(fc, [10 / tile, 6 / tile]), roughness: 0.32, clearcoat: 0.35, clearcoatRoughness: 0.25 }), false, true);
    fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, 3); scene.add(fl);
    const ce = mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshStandardMaterial({ color: '#f2ece2', roughness: 0.9 }), false, true); ce.rotation.x = Math.PI / 2; ce.position.set(0, Hc, 3); scene.add(ce);
    // the back wall with the window opening
    const ws = new THREE.Shape(); ws.moveTo(-W / 2 - 1, wainH); ws.lineTo(W / 2 + 1, wainH); ws.lineTo(W / 2 + 1, Hc); ws.lineTo(-W / 2 - 1, Hc); ws.lineTo(-W / 2 - 1, wainH);
    const hole = new THREE.Path(); hole.moveTo(WIN.x0, WIN.y0); hole.lineTo(WIN.x1, WIN.y0); hole.lineTo(WIN.x1, WIN.y1); hole.lineTo(WIN.x0, WIN.y1); hole.lineTo(WIN.x0, WIN.y0); ws.holes.push(hole);
    const wg = new THREE.ShapeGeometry(ws), uv = wg.attributes.uv, pp = wg.attributes.position; for (let i = 0; i < pp.count; i++) uv.setXY(i, pp.getX(i) / 1.2, pp.getY(i) / 1.2);
    scene.add(mesh(wg, new THREE.MeshStandardMaterial({ map: tex(PARTS.wall[P.wall]()), roughness: 0.82 }), false, true));
    const woodM = M.wood(trim[0], trim[1], [6, 1]);
    const crown = mesh(new THREE.BoxGeometry(W + 2, 0.16, 0.08), woodM); crown.position.set(0, Hc - 0.08, 0.04); scene.add(crown);
    const crownT = mesh(new THREE.BoxGeometry(W + 2, 0.025, 0.1), frameMat); crownT.position.set(0, Hc - 0.17, 0.05); scene.add(crownT);
    const lowerMat = lower.kind === 'wood' ? M.wood(lower.c[0], lower.c[1], [8, 1]) : lower.kind === 'tile' ? new THREE.MeshPhysicalMaterial({ map: tex(lower.t(), [(W + 2) / 0.6, wainH / 0.6]), roughness: 0.25, clearcoat: 0.8 }) : new THREE.MeshStandardMaterial({ color: lower.c, roughness: 0.55 });
    const wain = mesh(new THREE.BoxGeometry(W + 2, wainH, 0.04), lowerMat); wain.position.set(0, wainH / 2, 0.02); scene.add(wain);
    const rail = mesh(rbox(W + 2, 0.06, 0.07, 0.02), woodM); rail.position.set(0, wainH, 0.05); scene.add(rail);
    const base = mesh(new THREE.BoxGeometry(W + 2, 0.14, 0.06), M.wood(trim[1], '#000000', [8, 1])); base.position.set(0, 0.07, 0.05); scene.add(base);
    if (lower.kind !== 'tile') {
      const pm = lower.kind === 'wood' ? M.wood(lower.c[0], lower.c[1]) : new THREE.MeshStandardMaterial({ color: lower.c, roughness: 0.5 });
      for (let x = -W / 2 - 0.6; x < W / 2 + 0.6; x += 0.9) { const cx = x + 0.45, cy = 0.55, w = 0.72, h = 0.6; for (const [px, py, pw, ph] of [[cx, cy + h / 2, w, 0.03], [cx, cy - h / 2, w, 0.03], [cx - w / 2, cy, 0.03, h], [cx + w / 2, cy, 0.03, h]]) { const m = mesh(rbox(pw + 0.02, ph + 0.02, 0.03, 0.01), pm); m.position.set(px, py, 0.05); scene.add(m); } }
    }
    // window, the street outside, a sill plant and the neon picture (no words)
    const city = mesh(new THREE.PlaneGeometry(4.2, 3.0), new THREE.MeshBasicMaterial({ map: tex(TEX.sky(P.lower === 'talavera' || P.wall === 'ochre')) }), false, false);
    city.position.set((WIN.x0 + WIN.x1) / 2, 1.85, -1.6); scene.add(city);
    const wf = M.wood(trim[0], trim[1]);
    for (const [x, y, w, h] of [[(WIN.x0 + WIN.x1) / 2, WIN.y1 + 0.04, WIN.x1 - WIN.x0 + 0.16, 0.08], [(WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.04, WIN.x1 - WIN.x0 + 0.2, 0.08], [WIN.x0 - 0.04, (WIN.y0 + WIN.y1) / 2, 0.08, WIN.y1 - WIN.y0 + 0.08], [WIN.x1 + 0.04, (WIN.y0 + WIN.y1) / 2, 0.08, WIN.y1 - WIN.y0 + 0.08], [(WIN.x0 + WIN.x1) / 2, WIN.y0 + (WIN.y1 - WIN.y0) * 0.62, WIN.x1 - WIN.x0, 0.04]]) { const m = mesh(rbox(w, h, 0.12, 0.01), wf); m.position.set(x, y, 0); scene.add(m); }
    const sill = mesh(rbox(WIN.x1 - WIN.x0 + 0.3, 0.04, 0.22, 0.01), wf); sill.position.set((WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.09, 0.08); scene.add(sill);
    const sp = plant(0.45); sp.position.set(WIN.x0 + 0.2, WIN.y0 - 0.07, 0.1); scene.add(sp);
    const wn = neonSign(P.neon[0], P.neon[1]); wn.scale.setScalar(0.85); wn.position.set((WIN.x0 + WIN.x1) / 2, 2.2, 0.02); scene.add(wn);
    for (const [c, x] of wn.userData.lights) { const l = new THREE.PointLight(c, 0.6, 1.4, 2); l.position.set((WIN.x0 + WIN.x1) / 2 + x * 0.85, 2.2, 0.15); scene.add(l); }
    hot.window = new THREE.Vector3((WIN.x0 + WIN.x1) / 2, 2.2, 0.05);
    const pl = pole(); pl.position.set(-1.18, 1.75, 0.12); scene.add(pl);
    // the mirror station (no vanity bulbs) and the counter with the shelf products
    const mir = mirrorModel(1.5, 1.2, frameMat); mir.position.set(0, 1.78, 0.02); scene.add(mir);
    hot.mirror = new THREE.Vector3(0.5, 2.15, 0.05);
    const counter = mesh(rbox(2.0, 0.05, 0.3, 0.012), new THREE.MeshPhysicalMaterial({ color: '#f1ece4', roughness: 0.22, clearcoat: 0.8 })); counter.position.set(0, 1.04, 0.15); scene.add(counter);
    for (const x of [-0.82, 0.82]) { const br = mesh(rbox(0.04, 0.12, 0.25, 0.01), frameMat); br.position.set(x, 0.98, 0.13); scene.add(br); }
    const L = (bg, ink, t, ac) => TEX.label(bg, ink, t, ac);
    const SETS = {
      classic: () => [bottle('#2f8f55', M.blackGloss(), L('#f4efe4', '#1d3b28', 'TONIC', '#2f8f55'), 0.22), tin(L('#b8322a', '#fff', 'POMADE', '#f2d27a')), bottle('#d98a2b', M.gold(), L('#f4efe4', '#5a3412', 'BAY RUM', '#d98a2b'), 0.19), tin(L('#e0b544', '#2a1a08', 'WAX', '#7a4a12'), '#2a1a08')],
      coastal: () => [bottle('#4aa0d8', M.chrome(), L('#f4efe4', '#123a5a', 'AQUA', '#4aa0d8'), 0.2), tin(L('#2a4a8a', '#fff', 'CLAY', '#f2d27a'), '#e9edf3'), bottle('#9fd3c6', M.chrome(), L('#f4efe4', '#1d4a40', 'MIST', '#5aa99a'), 0.17), tin(L('#e9edf3', '#24395a', 'GEL', '#4aa0d8'), '#24395a')],
      vintage: () => [bottle('#7a3a1a', M.brass(), L('#efe3c8', '#3a1a0a', 'TONIC', '#7a3a1a'), 0.22), tin(L('#1f3b2c', '#efe3c8', 'POMADE', '#c9a046'), '#c9a046'), bottle('#c9a046', M.brass(), L('#efe3c8', '#3a2a0a', 'OIL', '#7a5a1a'), 0.17), tin(L('#5a1414', '#efe3c8', 'BALM', '#c9a046'), '#c9a046')],
    };
    const items = SETS[P.shelf]().concat(SETS[P.shelf]());
    const xs = [-0.86, -0.72, -0.58, -0.44, 0.44, 0.58, 0.72, 0.86];
    items.forEach((o, i) => { o.position.set(xs[i], 1.065, 0.16); o.scale.setScalar(1.55); o.rotation.y = (rnd() - 0.5) * 0.8; scene.add(o); });
    hot.shelf = new THREE.Vector3(0.42, 1.2, 0.2);
    const tn = neonSign(P.neon[0], P.neon[1]); tn.scale.setScalar(0.55); tn.position.set(0, 2.66, 0.03); scene.add(tn);
    // the TV: the player's shop name
    const tvx = 1.75, tvy = 2.3;
    const tvB = mesh(rbox(0.98, 0.58, 0.05, 0.015), M.blackGloss()); tvB.position.set(tvx, tvy, 0.05); scene.add(tvB);
    const st = tex(nameCanvas(info.name, info.year));
    const scr = mesh(new THREE.PlaneGeometry(0.94, 0.53), new THREE.MeshStandardMaterial({ map: st, emissive: '#ffffff', emissiveMap: st, emissiveIntensity: 0.9, roughness: 0.15 }), false, false);
    scr.position.set(tvx, tvy, 0.077); scene.add(scr);
    const tl = new THREE.PointLight('#ffe2b0', 0.4, 1.5, 2); tl.position.set(tvx, tvy, 0.35); scene.add(tl);
    hot.tv = new THREE.Vector3(tvx, tvy, 0.08);
    // the tool wall
    const peg = mesh(rbox(1.0, 0.62, 0.025, 0.01), new THREE.MeshStandardMaterial({ map: tex(TEX.peg()), roughness: 0.8 })); peg.position.set(1.75, 1.45, 0.03); scene.add(peg);
    ['carbon', 'flame', 'chrome', 'gold'].forEach((f, i) => { const c = clipper(f); c.scale.setScalar(1.9); c.position.set(1.38 + i * 0.24, 1.2, 0.08); c.rotation.y = -0.15; scene.add(c); });
    // decor: a style chart, a big plant or a framed indigo cloth
    const px = 2.75;
    if (P.decor === 'plant') { const bp = plant(1.15); bp.position.set(px, wainH + 0.02, 0.25); scene.add(bp); }
    else { const pf = mesh(rbox(0.56, 0.78, 0.04, 0.01), frameMat); pf.position.set(px, 1.85, 0.03); scene.add(pf); const pi = mesh(new THREE.PlaneGeometry(0.48, 0.7), new THREE.MeshStandardMaterial({ map: tex(P.decor === 'indigo' ? TEX.indigo() : TEX.chart()), roughness: 0.7 }), false, false); pi.position.set(px, 1.85, 0.055); scene.add(pi); }
    hot.decor = new THREE.Vector3(px, 1.85, 0.06);
    // the second chair and the waiting bench
    const ch = chair(PARTS.chair[P.chair], P.mirror === 'brass' && P.chair === 'black' ? 'gold' : 'chrome'); ch.position.set(2.5, 0, 0.6); ch.rotation.y = -0.75; scene.add(ch);
    hot.chair = new THREE.Vector3(2.5, 0.9, 0.6);
    const bm = M.leather(PARTS.chair[P.chair]);
    const bench = mesh(rbox(1.1, 0.12, 0.42, 0.05), bm); bench.position.set(-2.35, 0.48, 0.3); scene.add(bench);
    const bb = mesh(rbox(1.1, 0.45, 0.1, 0.05), bm); bb.position.set(-2.35, 0.78, 0.1); scene.add(bb);
    for (const x of [-2.8, -1.9]) { const leg = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 10), M.chrome()); leg.position.set(x, 0.21, 0.3); scene.add(leg); }
    // the mat in front of the station
    const mc = PARTS.mat[P.mat];
    if (mc) { const mm = mc === 'indigo' ? new THREE.MeshStandardMaterial({ map: tex(TEX.indigo(), [2, 1]), roughness: 0.95 }) : new THREE.MeshStandardMaterial({ color: mc, roughness: 0.85 }); const mt = mesh(rbox(1.5, 0.012, 0.9, 0.005), mm, false, true); mt.position.set(0, 0.006, 1.3); scene.add(mt); }
    hot.mat = new THREE.Vector3(0.45, 0.02, 1.0);
    hot.floor = new THREE.Vector3(-1.0, 0, 0.75);
    hot.wall = new THREE.Vector3(-0.85, 2.55, 0.02);
    hot.lower = new THREE.Vector3(-0.6, 0.5, 0.06);
    // pendants: above the picture's top edge; their light still falls on the wall
    for (const x of [-2.2, 0, 2.2]) {
      const pd = pendant(P.lights); pd.position.set(x, 3.05, 1.0); scene.add(pd);
      const sl = new THREE.SpotLight(P.lights === 'lantern' ? '#ffc98a' : '#ffe2b8', 2.6, 6, 0.95, 0.85, 2); sl.position.set(x, 2.95, 1.0); sl.target.position.set(x * 0.9, 1.2, 0);
      sl.castShadow = info.shadows; sl.shadow.mapSize.set(512, 512); sl.shadow.bias = -0.0005; scene.add(sl); scene.add(sl.target);
    }
    hot.lights = new THREE.Vector3(0, 2.9, 0.4);
    // daylight
    scene.add(new THREE.HemisphereLight('#eaf4ff', '#d9c9b0', 0.85));
    const key = new THREE.DirectionalLight('#fff4e4', 1.1); key.position.set(1.2, 3.2, 5); key.target.position.set(0, 1.2, 0); key.castShadow = info.shadows; key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 3.5, bottom: -0.5 }); key.shadow.bias = -0.0005; scene.add(key); scene.add(key.target);
    const sun = new THREE.SpotLight('#fff3d6', 3, 5, 0.9, 0.9, 1.5); sun.position.set(-2.0, 2.0, -0.6); sun.target.position.set(-1.2, 0.6, 2); scene.add(sun); scene.add(sun.target);
    return hot;
  }

  // ---- views (cameras); the backdrop views start at the moulding above the mirror (owner, 5 November 2026) ----
  const VIEWS = {
    land: { pos: [0, 1.42, 5.0], look: [0, 1.48, 0], fov: 33 },
    port: { pos: [0.1, 1.2, 4.9], look: [0.95, 0.98, 0], fov: 44 },
    shop: { pos: [0.1, 1.5, 5.0], look: [0.1, 1.5, 0], fov: 46.6 },
    floor: { pos: [0.5, 2.35, 3.6], look: [0.3, 0.55, 0.6], fov: 52 },
    thumb: { pos: [0, 1.55, 4.2], look: [0, 1.7, 0], fov: 42 },
    // the Home screen: the whole shop, wide and unzoomed, with no customer
    homeP: { pos: [-0.9, 1.75, 6.6], look: [1.25, 0.72, 0], fov: 62 },
    homeL: { pos: [0.1, 1.42, 6.2], look: [0.1, 0.72, 0], fov: 42 },
    // the shop screen moves to the part being changed
    chair: { pos: [1.2, 1.35, 3.6], look: [2.3, 0.85, 0.5], fov: 40 },
    decor: { pos: [1.6, 1.5, 4.0], look: [2.7, 1.55, 0.1], fov: 38 },
    lights: { pos: [0.3, 1.5, 4.6], look: [0, 2.45, 0.8], fov: 46 },
  };

  // ---- rendering: one small offscreen renderer, scenes cached by look ----
  let R = null, envTex = null;
  const cache = new Map();
  function renderer() {
    if (R) return R;
    const c = document.createElement('canvas');
    R = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    R.setPixelRatio(1); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
    const pm = new THREE.PMREMGenerator(R); envTex = pm.fromScene(new THREE.RoomEnvironment(), 0.04).texture; pm.dispose();
    c.addEventListener('webglcontextlost', (e) => { e.preventDefault(); drop(); });
    return R;
  }
  function disposeScene(s) { s.traverse((o) => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? [].concat(o.material) : []; for (const m of ms) { for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose(); m.dispose(); } }); }
  function drop() { for (const v of cache.values()) disposeScene(v.scene); cache.clear(); if (R) { R.dispose(); R = null; } envTex = null; backdrop = null; }
  function sceneFor(parts, info) {
    const key = JSON.stringify([parts, info.name, info.year, info.shadows]);
    if (cache.has(key)) { const v = cache.get(key); cache.delete(key); cache.set(key, v); return v; }
    seed = 7;
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#e9e2d6'); scene.environment = envTex; scene.environmentIntensity = 0.4;
    const hot = buildRoom(scene, parts, info);
    const v = { scene, hot };
    cache.set(key, v);
    while (cache.size > 3) { const [k0, v0] = cache.entries().next().value; disposeScene(v0.scene); cache.delete(k0); }
    return v;
  }
  // render a view of a look into a new 2D canvas; returns { canvas, hot } (hot spots in canvas pixels)
  function render(parts, view, w, h, info = {}) {
    const r = renderer();
    const { scene, hot } = sceneFor(parts, Object.assign({ name: '', year: 0, shadows: true }, info));
    const V = VIEWS[view] || VIEWS.land, cam = new THREE.PerspectiveCamera(V.fov, w / h, 0.05, 40);
    cam.position.set(...V.pos); cam.lookAt(...V.look); cam.updateMatrixWorld(true);
    r.setSize(w, h, false); r.render(scene, cam);
    const out = document.createElement('canvas'); out.width = w; out.height = h; out.getContext('2d').drawImage(r.domElement, 0, 0);
    const pts = {};
    for (const [n, p] of Object.entries(hot)) { const q = p.clone().project(cam); pts[n] = [((q.x + 1) / 2) * w, ((1 - q.y) / 2) * h, q.z < 1]; }
    return { canvas: out, hot: pts };
  }
  // a small product picture of one part option (for the shop's cards), transparent background
  const thumbs = new Map();
  function thumb(slot, opt, size = 160) {
    const k = slot + ':' + opt + ':' + size;
    if (thumbs.has(k)) return thumbs.get(k);
    let url;
    const flat = (c) => { const o = document.createElement('canvas'); o.width = o.height = size; const x = o.getContext('2d'); x.drawImage(c, 0, 0, size, size); return o.toDataURL('image/jpeg', 0.86); };
    if (slot === 'wall') url = flat(PARTS.wall[opt]());
    else if (slot === 'floor') url = flat(PARTS.floor[opt]()[0]);
    else if (slot === 'lower') { const p = PARTS.lower[opt]; url = flat(p.kind === 'tile' ? p.t() : p.kind === 'wood' ? TEX.wood(p.c[0], p.c[1]) : TEX.plaster(p.c, 'rgba(0,0,0,0.05)')); }
    else if (slot === 'mat') { const m = PARTS.mat[opt]; url = m === null ? '' : flat(m === 'indigo' ? TEX.indigo() : TEX.plaster(m, 'rgba(0,0,0,0.08)')); }
    else {
      // 3D product shot
      const r = renderer(), scene = new THREE.Scene(); scene.environment = envTex; scene.environmentIntensity = 0.9;
      let o;
      if (slot === 'chair') o = chair(PARTS.chair[opt], 'chrome');
      else if (slot === 'lights') o = pendant(opt);
      else if (slot === 'mirror') { o = new THREE.Group(); o.add(mirrorModel(0.6, 0.8, PARTS.mirror[opt]())); }
      else if (slot === 'decor') o = opt === 'plant' ? plant(1) : (() => { const g = new THREE.Group(); g.add(mesh(rbox(0.56, 0.78, 0.04, 0.01), M.brass())); const pi = mesh(new THREE.PlaneGeometry(0.48, 0.7), new THREE.MeshStandardMaterial({ map: tex(opt === 'indigo' ? TEX.indigo() : TEX.chart()) })); pi.position.z = 0.025; g.add(pi); return g; })();
      else if (slot === 'shelf') { o = new THREE.Group(); const S2 = { classic: ['#2f8f55', '#b8322a'], coastal: ['#4aa0d8', '#2a4a8a'], vintage: ['#7a3a1a', '#1f3b2c'] }[opt]; const b = bottle(S2[0], M.blackGloss(), TEX.label('#f4efe4', '#222', ' ', S2[0]), 0.22); b.position.x = -0.04; o.add(b); const t = tin(TEX.label(S2[1], '#fff', ' ', '#f2d27a')); t.position.x = 0.05; o.add(t); }
      scene.add(o);
      scene.add(new THREE.HemisphereLight('#ffffff', '#776655', 0.8));
      const dl = new THREE.DirectionalLight('#fff4e6', 2); dl.position.set(-1.2, 2.4, 1.6); scene.add(dl);
      const box = new THREE.Box3().setFromObject(o), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3()), R0 = Math.max(s.x, s.y, s.z);
      o.rotation.y = slot === 'mirror' || slot === 'decor' ? 0 : -0.5;
      const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 20); const d = (R0 * 0.62) / Math.tan(THREE.MathUtils.degToRad(15));
      cam.position.set(c.x, c.y + d * 0.15, c.z + d); cam.lookAt(c); cam.updateMatrixWorld(true);
      r.setClearColor(0x000000, 0); r.setSize(size, size, false); scene.background = null; r.render(scene, cam);
      url = r.domElement.toDataURL('image/png');
      disposeScene(scene);
    }
    thumbs.set(k, url);
    return url;
  }
  // ---- the store's product shots: a clipper or a gown from its design, lit like the shop, on a studio backdrop ----
  const shots = new Map();
  let backdrop = null;
  function studio() {
    if (backdrop) return backdrop;
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d'), g = x.createRadialGradient(128, 104, 10, 128, 128, 190);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#e4f1fb'); g.addColorStop(1, '#a9cdf0');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    backdrop = new THREE.CanvasTexture(c); backdrop.colorSpace = THREE.SRGBColorSpace;
    return backdrop;
  }
  function pattern(name, a, b, rep) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    HSC.drawPattern(c.getContext('2d'), 256, name, a, b, 11);
    return tex(c, rep);
  }
  function clipperShot(p, C) {
    const hex = (id) => C.colourHex.get(id) || '#888888', fin = C.finishes.get(p.finish) || C.finishes.get('chrome');
    const g = new THREE.Group(), W1 = 0.03, W2 = 0.023, H = 0.17, s = new THREE.Shape();
    s.moveTo(-W2, 0); s.lineTo(W2, 0); s.quadraticCurveTo(W2 + 0.006, 0.01, W2 + 0.005, 0.03); s.lineTo(W1, H - 0.012); s.quadraticCurveTo(W1, H, W1 - 0.012, H);
    s.lineTo(-W1 + 0.012, H); s.quadraticCurveTo(-W1, H, -W1, H - 0.012); s.lineTo(-W2 - 0.005, 0.03); s.quadraticCurveTo(-W2 - 0.006, 0.01, -W2, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.011, bevelSize: 0.009, bevelSegments: 6, curveSegments: 14 });
    geo.translate(0, 0, -0.015);
    const pos = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + 0.04) / 0.08, pos.getY(i) / H);
    g.add(mesh(geo, new THREE.MeshPhysicalMaterial({ map: pattern(p.pattern, hex(p.body), hex(p.accent), [1, 2]), roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.18 })));
    const metal = (c) => new THREE.MeshStandardMaterial({ color: c, metalness: Math.max(0.6, fin.metal), roughness: Math.min(0.4, fin.rough) });
    const head = mesh(rbox(0.074, 0.026, 0.05, 0.008), metal(fin.light)); head.position.set(0, H + 0.02, 0); g.add(head);
    const base = mesh(rbox(0.078, 0.009, 0.016, 0.003), metal(fin.dark)); base.position.set(0, H + 0.036, 0.008); g.add(base);
    for (let i = 0; i < 19; i++) { const t = mesh(new THREE.BoxGeometry(0.0022, 0.01, 0.006), metal(fin.light)); t.position.set(-0.036 + i * 0.004, H + 0.045, 0.01); g.add(t); }
    const acc = new THREE.MeshPhysicalMaterial({ color: hex(p.accent), roughness: 0.3, clearcoat: 1 });
    const sw = mesh(rbox(0.018, 0.036, 0.012, 0.006), acc); sw.position.set(0, 0.112, 0.029); g.add(sw);
    for (const sd of [-1, 1]) { const gr = mesh(rbox(0.008, 0.09, 0.006, 0.003), acc); gr.position.set(sd * 0.03, 0.08, 0.024); g.add(gr); }
    g.rotation.set(-0.12, -0.5, -0.32);
    return g;
  }
  // the gown as it is in the game (gown.js), on a plain form, turned to show its neck and closure
  const made = new WeakMap();
  function gownGeo(g) {
    if (made.has(g)) return made.get(g);
    const o = new THREE.BufferGeometry();
    o.setAttribute('position', new THREE.BufferAttribute(g.pos, 3)); o.setAttribute('uv', new THREE.BufferAttribute(g.uv, 2)); o.setIndex(g.ix); o.computeVertexNormals();
    o.userData.keep = true; made.set(g, o);
    return o;
  }
  const PART = { paper: ['#f6f3ec', 0, 0.88], metal: ['#aab1b9', 0.6, 0.34], dark: ['#17191d', 0, 0.42], loop: ['#c9ccd0', 0, 0.95] };
  function gownShot(d, C) {
    const p = d.parts, hex = (id) => C.colourHex.get(id) || '#888888', s = HSC.gownShape(HSC.gownCut(d)), g = new THREE.Group();
    const tall = p.pattern === 'yoke' || p.pattern === 'fade';
    const std = (c, metal, rough) => new THREE.MeshStandardMaterial({ color: c, metalness: metal, roughness: rough, side: THREE.DoubleSide });
    const cloth = new THREE.MeshStandardMaterial({ map: pattern(p.pattern, hex(p.main), hex(p.second), tall ? [6, 1] : [6, 1.4]), roughness: 0.62, side: THREE.DoubleSide });
    g.add(new THREE.Mesh(gownGeo(s.cloth), cloth));
    g.add(new THREE.Mesh(gownGeo(s.band), std(s.colour === 'main' ? hex(p.main) : hex(p.collar), 0, s.tex === 'terry' ? 0.96 : s.tex === 'smooth' ? 0.42 : 0.62)));
    for (const x of s.parts) { const k = PART[x.kind], c = x.kind === 'self' ? hex(p.main) : x.kind === 'trim' ? hex(p.collar) : k[0]; g.add(new THREE.Mesh(gownGeo(x.grid), std(c, k ? k[1] : 0, k ? k[2] : 0.6))); }
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.25, 1.1, 40), std('#8e99a6', 0, 0.7));
    neck.position.set(0, -0.72, -0.35); g.add(neck);
    g.rotation.set(0.1, Math.PI - 0.55, 0);
    g.scale.setScalar(0.2);
    return g;
  }
  function item(d, size = 128) {
    const k = d.key + ':' + size;
    if (shots.has(k)) { const v = shots.get(k); shots.delete(k); shots.set(k, v); return v; }
    const r = renderer(), C = HSC.catalog, scene = new THREE.Scene(); scene.environment = envTex; scene.environmentIntensity = 0.85; scene.background = studio();
    const o = d.tool === 'clipper' ? clipperShot(d.parts, C) : gownShot(d, C);
    scene.add(o);
    scene.add(new THREE.HemisphereLight('#ffffff', '#99aabb', 0.7));
    const dl = new THREE.DirectionalLight('#fff4e6', 2); dl.position.set(-1.2, 2.4, 2); scene.add(dl);
    const box = new THREE.Box3().setFromObject(o), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3()), R0 = Math.max(s.x, s.y);
    const cam = new THREE.PerspectiveCamera(28, 1, 0.01, 20), dist = (R0 * 0.6) / Math.tan(THREE.MathUtils.degToRad(14));
    cam.position.set(c.x, c.y + dist * 0.08, c.z + dist); cam.lookAt(c); cam.updateMatrixWorld(true);
    r.setSize(size, size, false); r.render(scene, cam);
    const url = r.domElement.toDataURL('image/jpeg', 0.88);
    scene.background = null;
    scene.traverse((x) => { if (x.geometry && !x.geometry.userData.keep) x.geometry.dispose(); if (x.material) { if (x.material.map) x.material.map.dispose(); x.material.dispose(); } });
    shots.set(k, url);
    while (shots.size > 300) shots.delete(shots.keys().next().value);
    return url;
  }
  HSC.shop3d = { SLOTS, PARTS, OPTIONS, REGIONS, VIEWS, render, thumb, item, nameCanvas, drop, ok: () => { try { renderer(); return true; } catch (e) { return false; } } };
})(globalThis.HSC || (globalThis.HSC = {}));
