// ---------------------------------------------------------------------------------------------
// Wardrobe (the hanger button): the clippers and robes the player owns, two rows at a time (arrows and a
// page number when there are more; the one worn first, then the newest), tap one to wear it. Each day
// there is exactly one new clipper and one new robe on offer (the same for every player that day), with
// a countdown to midnight: one rewarded video unlocks it and puts it on. When the day ends the offer is
// gone. The red dot on the hanger
// comes up once a day while a pick is waiting. Wordless: icons, numbers and pictures of the designs.
// Designs come from catalog.js; progress is saved through the platform storage.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const C = () => HSC.catalog;
  const KEY = 'skin-fade-studio-rewards-v4';
  const INK = '#2a1d15';

  const W = {
    data: null, // { v, own: { clipper: bits, gown: bits } (base64), look: { clipper: id, gown: id }, progress: { key: videos }, dotDay, pick: { day, clipper: key, gown: key }, recent: [keys, newest last] }
    bits: null, // the owned designs, one bit each: { clipper: Uint8Array, gown: Uint8Array }
    client: null,
    game: null,
    clipper: null, // { body:[materials], accent:[...], light:[...], dark:[...] }
    gown: null, // { cloth, collar }
    T: null,
    tex: {},
    preview: { clipper: null, gown: null }, // try-on / trial designs shown without owning them
  };
  HSC.wardrobe = W;

  const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const hash = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const TOOLS = ['clipper', 'gown'];
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const toB64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 3) { const n = (u8[i] << 16) | ((u8[i + 1] || 0) << 8) | (u8[i + 2] || 0); s += B64[n >> 18] + B64[(n >> 12) & 63] + B64[(n >> 6) & 63] + B64[n & 63]; } return s; };
  const fromB64 = (str, len) => { const u8 = new Uint8Array(len); if (!/^[A-Za-z0-9+/]*$/.test(str)) return u8; /* corrupt: nothing owned but the free designs */ let k = 0; for (let i = 0; i + 3 < str.length + 1 && k < len; i += 4) { const n = (B64.indexOf(str[i]) << 18) | (B64.indexOf(str[i + 1]) << 12) | (B64.indexOf(str[i + 2]) << 6) | B64.indexOf(str[i + 3]); for (const v of [n >> 16, (n >> 8) & 255, n & 255]) if (k < len) u8[k++] = v & 255; } return u8; };
  const bytes = (tool) => Math.ceil(C().designs[tool].length / 8);
  const split = (key) => { const c = key.indexOf(':'); return [key.slice(0, c), +key.slice(c + 1)]; };
  const owns = (key) => { const [t, i] = split(key); const b = W.bits && W.bits[t]; return !!b && i >= 0 && ((b[i >> 3] >> (i & 7)) & 1) === 1; };
  function setOwned(key) {
    const [t, i] = split(key);
    W.bits[t][i >> 3] |= 1 << (i & 7);
    W.data.own[t] = toB64(W.bits[t]);
  }

  function fresh() {
    return { v: 4, own: {}, look: Object.assign({}, C().DEFAULT_LOOK), progress: {}, dotDay: null, pick: null };
  }
  function sanitize(d) {
    const f = fresh();
    if (!d || typeof d !== 'object' || d.v !== 4) d = f;
    W.bits = {};
    for (const t of TOOLS) W.bits[t] = typeof (d.own && d.own[t]) === 'string' ? fromB64(d.own[t], bytes(t)) : new Uint8Array(bytes(t));
    const pk = d.pick && typeof d.pick.day === 'string' && C().byKey.has(d.pick.clipper) && C().byKey.has(d.pick.gown) ? { day: d.pick.day, clipper: d.pick.clipper, gown: d.pick.gown } : null;
    const recent = Array.isArray(d.recent) ? d.recent.filter((k) => typeof k === 'string' && C().byKey.has(k)) : [];
    const out = { v: 4, own: {}, look: Object.assign({}, f.look), progress: {}, dotDay: typeof d.dotDay === 'string' ? d.dotDay : null, pick: pk, recent };
    W.data = out;
    for (const k of C().FREE) setOwned(k);
    for (const t of TOOLS) {
      out.own[t] = toB64(W.bits[t]);
      const id = d.look && d.look[t];
      if (id != null && owns(t + ':' + id)) out.look[t] = String(id);
    }
    if (d.progress && typeof d.progress === 'object') for (const [k, n] of Object.entries(d.progress)) if (C().byKey.has(k) && Number.isSafeInteger(n) && n > 0) out.progress[k] = n;
    return out;
  }
  function save() {
    if (W.client && W.client.saveProgress) W.client.saveProgress(KEY, W.data).catch(() => {});
  }
  const track = (name, payload) => { try { W.client && W.client.sendAnalytics && W.client.sendAnalytics(name, payload); } catch (e) {} };

  // ---------------- 3D ----------------
  HSC.attachClipper = function (group) {
    // the game's clipper model; tell its parts apart by their original colours
    const parts = { body: new Set(), accent: new Set(), light: new Set(), dark: new Set() };
    const hex = (m) => (m && m.color ? m.color.getHexString() : '');
    group.traverse((o) => {
      if (!o.isMesh || o === group.userData.comb) return;
      const h = hex(o.material);
      if (h === '25282b') parts.body.add(o.material);
      else if (h === '141516') parts.accent.add(o.material);
      else if (h === 'cfd5da' || h === 'b9bfc4') parts.light.add(o.material);
      else if (h === '8a9298') parts.dark.add(o.material);
    });
    W.clipper = Object.fromEntries(Object.entries(parts).map(([k, s]) => [k, [...s]]));
    applyLook();
  };
  HSC.attachGown = function (robe, T) {
    W.T = T;
    const meshes = [];
    robe.traverse((o) => o.isMesh && meshes.push(o));
    // the robe is the larger mesh, the collar band the other
    meshes.sort((a, b) => b.geometry.attributes.position.count - a.geometry.attributes.position.count);
    W.gown = { cloth: meshes[0] && meshes[0].material, collar: meshes[1] && meshes[1].material, robe };
    applyLook();
  };

  function patternTexture(name, key, a, b, size, flipY, repeat) {
    if (!W.T) return null;
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    HSC.drawPattern(cv.getContext('2d'), size, name, a, b, 11);
    const t = new W.T.Fg(cv);
    t.colorSpace = W.T.Lt;
    t.wrapS = t.wrapT = W.T.Pn;
    t.flipY = flipY;
    t.repeat.set(repeat[0], repeat[1]);
    t.anisotropy = 4;
    if (W.tex[key]) W.tex[key].dispose();
    W.tex[key] = t;
    return t;
  }
  const hexOf = (id) => C().colourHex.get(id) || '#888888';
  const finishOf = (id) => C().finishes.get(id) || C().finishes.get('chrome');
  const design = (tool, id) => C().byKey.get(tool + ':' + id) || C().byKey.get(tool + ':' + C().DEFAULT_LOOK[tool]);
  const worn = (tool) => design(tool, W.preview[tool] || W.data.look[tool]);

  function applyLook() {
    if (!W.data) return;
    if (W.clipper && W.T) {
      const c = worn('clipper').parts, body = hexOf(c.body), accent = hexOf(c.accent), fin = finishOf(c.finish);
      const tex = patternTexture(c.pattern, 'clipper', body, accent, 256, true, [2, 1]);
      for (const m of W.clipper.body) { m.color.set('#ffffff'); m.map = tex; m.needsUpdate = true; }
      for (const m of W.clipper.accent) m.color.set(accent);
      for (const [list, col] of [[W.clipper.light, fin.light], [W.clipper.dark, fin.dark]]) for (const m of list) {
        m.color.set(col); m.metalness = fin.metal; m.roughness = fin.rough; m.needsUpdate = true;
      }
    }
    if (W.gown && W.gown.cloth && W.T) {
      const g = worn('gown').parts, main = hexOf(g.main), second = hexOf(g.second);
      const tall = g.pattern === 'yoke' || g.pattern === 'fade';
      const tex = patternTexture(g.pattern, 'gown', main, second, 512, false, tall ? [6, 1] : [6, 2.5]);
      const cloth = W.gown.cloth;
      cloth.color.set('#ffffff');
      cloth.map = tex;
      if (cloth.sheenColor) cloth.sheenColor.set(HSC.colourTools.mix(main, '#ffffff', 0.45));
      cloth.needsUpdate = true;
      if (W.gown.collar) W.gown.collar.color.set(hexOf(g.collar));
    }
    HSC.clippingsCape && HSC.clippingsCape(W.gown && W.gown.robe);
  }

  // ---------------- pictures of the designs ----------------
  function drawClipper(cv, p) {
    const ctx = cv.getContext('2d'), k = cv.width / 440;
    ctx.clearRect(0, 0, cv.width, cv.height); ctx.save(); ctx.scale(k, k); ctx.lineJoin = 'round';
    const body = hexOf(p.body), accent = hexOf(p.accent), fin = finishOf(p.finish);
    const tile = document.createElement('canvas'); tile.width = tile.height = 256;
    HSC.drawPattern(tile.getContext('2d'), 256, p.pattern, body, accent, 11);
    const cx = 220, path = new Path2D();
    path.moveTo(cx - 70, 330); path.lineTo(cx - 84, 190); path.quadraticCurveTo(cx - 84, 70, cx, 62); path.quadraticCurveTo(cx + 84, 70, cx + 84, 190); path.lineTo(cx + 70, 330); path.closePath();
    ctx.save(); ctx.clip(path); ctx.drawImage(tile, cx - 100, 50, 200, 290); ctx.restore();
    const sh = ctx.createLinearGradient(cx - 84, 0, cx + 84, 0);
    sh.addColorStop(0, '#00000040'); sh.addColorStop(0.35, '#ffffff38'); sh.addColorStop(0.55, '#ffffff00'); sh.addColorStop(1, '#00000050');
    ctx.fillStyle = sh; ctx.fill(path); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(path);
    ctx.fillStyle = accent;
    for (const x of [cx - 62, cx + 48]) { ctx.beginPath(); ctx.roundRect(x, 150, 14, 140, 7); ctx.fill(); ctx.lineWidth = 3; ctx.stroke(); }
    ctx.beginPath(); ctx.roundRect(cx - 12, 108, 24, 46, 6); ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
    const g = ctx.createLinearGradient(0, 330, 0, 380); g.addColorStop(0, fin.light); g.addColorStop(0.5, '#fff'); g.addColorStop(1, fin.dark);
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(cx - 96, 326, 192, 40, 8); ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = fin.dark; for (let i = 0; i < 17; i++) ctx.fillRect(cx - 90 + i * 11, 366, 6, 16);
    ctx.restore();
  }
  function drawGown(cv, p) {
    const ctx = cv.getContext('2d'), k = cv.width / 440;
    ctx.clearRect(0, 0, cv.width, cv.height); ctx.save(); ctx.scale(k, k); ctx.lineJoin = 'round';
    const main = hexOf(p.main), second = hexOf(p.second), collar = hexOf(p.collar);
    const tile = document.createElement('canvas'); tile.width = tile.height = 256;
    HSC.drawPattern(tile.getContext('2d'), 256, p.pattern, main, second, 11);
    const cx = 220, path = new Path2D();
    path.moveTo(cx - 60, 92); path.quadraticCurveTo(cx - 150, 120, cx - 175, 210); path.lineTo(cx - 190, 400);
    path.quadraticCurveTo(cx, 420, cx + 190, 400); path.lineTo(cx + 175, 210); path.quadraticCurveTo(cx + 150, 120, cx + 60, 92); path.closePath();
    ctx.save(); ctx.clip(path);
    // patterns drawn large enough that motifs (palms, scissors, flowers) read on a small gallery tile
    for (let y = 70; y < 430; y += 190) for (let x = cx - 200; x < cx + 200; x += 190) ctx.drawImage(tile, x, y, 190, 190);
    const sh = ctx.createLinearGradient(cx - 190, 0, cx + 190, 0); sh.addColorStop(0, '#00000045'); sh.addColorStop(0.4, '#ffffff22'); sh.addColorStop(1, '#00000045');
    ctx.fillStyle = sh; ctx.fillRect(0, 0, 440, 440); ctx.restore();
    ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(path);
    ctx.beginPath(); ctx.ellipse(cx, 96, 64, 22, 0, 0, Math.PI * 2); ctx.fillStyle = collar; ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, 92, 44, 13, 0, 0, Math.PI * 2); ctx.fillStyle = '#e4cdb0'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
  // drawn on demand and kept for the most recent few hundred (tiles are drawn as they scroll into view)
  const pics = new Map();
  function picture(d, size = 160) {
    const key = d.key + '|' + size;
    let url = pics.get(key);
    if (url) { pics.delete(key); pics.set(key, url); return url; }
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    (d.tool === 'clipper' ? drawClipper : drawGown)(cv, d.parts);
    url = cv.toDataURL();
    pics.set(key, url);
    if (pics.size > 300) pics.delete(pics.keys().next().value);
    return url;
  }

  // ---------------- unlocking ----------------
  const canVideo = () => !!(W.client && W.client.rewardedSupported && W.client.showRewarded);
  async function watchVideo(placement) {
    const c = W.client;
    if (!canVideo()) return false;
    let ok = false;
    try { ok = !!(await c.showRewarded(placement)); } catch (e) {}
    if (ok) HSC.lastRewardAt = Date.now();
    return ok;
  }
  // a rewarded video in the last minute: the next interstitial is skipped
  HSC.watchVideo = watchVideo;
  HSC.nope = (el) => { el.classList.remove('hsc-nope'); void el.offsetWidth; el.classList.add('hsc-nope'); setTimeout(() => el.classList.remove('hsc-nope'), 500); };
  HSC.canVideo = canVideo;
  HSC.recentReward = () => !!HSC.lastRewardAt && Date.now() - HSC.lastRewardAt < 60000;
  // one watched video toward a design: 'unlocked' when it has all it needs, else 'progress'
  function grant(d, via) {
    if (owns(d.key)) return 'unlocked';
    const n = (W.data.progress[d.key] || 0) + 1;
    if (n >= C().VIDEOS(d)) {
      delete W.data.progress[d.key];
      setOwned(d.key);
      W.data.recent = W.data.recent.filter((k) => k !== d.key).concat(d.key);
      track('rewards_unlock', { item: d.key, via });
      save();
      return 'unlocked';
    }
    W.data.progress[d.key] = n;
    save();
    return 'progress';
  }
  function equip(tool, id) {
    W.data.look[tool] = id;
    if (W.preview[tool] === id) W.preview[tool] = null;
    save();
    applyLook();
  }
  // today's clipper and robe: the same for every player that day, never one the player owns; a new day
  // brings new picks
  function picks() {
    const day = today();
    if (W.data.pick && W.data.pick.day === day) return W.data.pick;
    const old = W.data.pick;
    if (old) for (const t of TOOLS) delete W.data.progress[old[t]];
    const pick = { day };
    for (const t of TOOLS) {
      const all = C().designs[t], n = all.length;
      let i = hash(day + '|' + t) % n;
      for (let k = 0; k < n && (owns(all[i].key) || C().FREE.has(all[i].key)); k++) i = (i + 1) % n;
      pick[t] = all[i].key;
    }
    W.data.pick = pick;
    save();
    return pick;
  }
  // time left today, as the countdown shows it (h:mm:ss, or m:ss in the last hour)
  function timeLeft() {
    const now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), now.getDate()), end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const t = Math.max(0, Math.floor((end - now) / 1000)), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
    const two = (v) => String(v).padStart(2, '0');
    // the ring around the pick drains with the day: green, orange from 6 h, red from 2 h, a heartbeat at the end
    return { text: h ? `${h}:${two(m)}:${two(sec)}` : `${m}:${two(sec)}`, low: t < 2 * 3600, lvl: t < 2 * 3600 ? 'r' : t < 6 * 3600 ? 'o' : 'g', last: t < 600, frac: Math.max(0, Math.min(1, (t * 1000) / Math.max(1, end - start))) };
  }

  // ---------------- UI ----------------
  // the UI scale: 1 on phones (short side 300-560 px), up to 2.4 on big screens, down to 0.6 in tiny embeds
  HSC.uiScale = () => {
    const m = Math.min(innerWidth, innerHeight);
    return +(m < 300 ? Math.max(0.6, m / 300) : Math.min(2.4, Math.max(1, m / 560))).toFixed(3);
  };
  HSC.applyScale = () => {
    const s = HSC.uiScale();
    if (s !== HSC.S) { HSC.S = s; document.documentElement.style.setProperty('--hsc-s', String(s)); }
  };
  HSC.applyScale();
  const RING = '<svg class="hsc-ring" viewBox="0 0 140 140" aria-hidden="true"><circle class="trk" cx="70" cy="70" r="62"/><g transform="rotate(-90 70 70) translate(0 140) scale(1 -1)"><circle class="arc out" cx="70" cy="70" r="62"/><circle class="arc col" cx="70" cy="70" r="62"/></g></svg>';
  const ICON = {
    hanger: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7a2 2 0 1 1 2-2"/><path d="M12 7v1.5L3 15a1.5 1.5 0 0 0 1 2.7h16a1.5 1.5 0 0 0 1-2.7l-9-6.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="13" r="8.5"/><path d="M12 8.5V13l3 2"/><path d="M9.5 2.5h5"/></svg>',
    // the same icon as the game's clipper on / off button
    clipper: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="8" width="10" height="14" rx="3"/><path d="M6 4h12v4H6z"/><path d="M8 4V2M11 4V2M14 4V2M17 4V2"/></svg>',
    arrow: (dir) => `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="${dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`,
    gown: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"><path d="M9 3h6l1 2 5 3-2 13H5L3 8l5-3z"/><path d="M9 3a3 3 0 0 0 6 0"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    tick: (s = 20) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
    spark: (s = 34) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M12 1.5l2.2 7.3 7.3 2.2-7.3 2.2L12 20.5l-2.2-7.3L2.5 11l7.3-2.2z" fill="#ffe14d" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  };
  // the one icon that means "watch a video": a little screen with a play triangle
  const AD = (s = 26) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><rect x="2.5" y="4.5" width="19" height="13.5" rx="2.6" fill="#fff6e6" stroke="${INK}" stroke-width="2.2"/><path d="M10 8.2v6.2l5.3-3.1z" fill="${INK}"/><path d="M8 21h8" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  HSC.AD_ICON = AD;
  // the video badge of a locked design
  const videoBadge = (d, s = 24) => {
    const need = C().VIDEOS(d), done = W.data.progress[d.key] || 0;
    return Array.from({ length: need }, (_, i) => (i < done ? `<b class="done">${ICON.tick(s * 0.7)}</b>` : AD(s))).join('');
  };

  const CSS = `
/* every control layer is laid out at phone size and drawn at the screen's scale (--hsc-s, set from the
   short side of the screen): percentages stay true to the screen, pixel sizes and gaps scale together */
.ui,#hsc-hud,#hsc-panel,#hsc-hub{zoom:var(--hsc-s,1)}
#hsc-hud,#hsc-panel,#hsc-hub{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.hsc-art img,.hsc-tile img{pointer-events:none;-webkit-user-drag:none}
/* just after a screen goes away, the controls under the finger ignore the second tap of a double tap */
body.hsc-settle .ui button,body.hsc-settle #hsc-hud *,body.hsc-settle .hsc-replay{pointer-events:none!important}
#hsc-hud{position:fixed;left:0;top:0;z-index:20;pointer-events:none;font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};transition:opacity .25s}
#hsc-hud .hsc-row{position:absolute;display:flex;gap:8px;align-items:center}
.hsc-btn{pointer-events:auto;position:relative;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};color:${INK};cursor:pointer;padding:0}
.hsc-btn:active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
.hsc-dot{position:absolute;right:-4px;top:-4px;width:17px;height:17px;border-radius:50%;background:#ff3b30;border:2.5px solid ${INK};animation:hsc-dotpulse 1.2s ease-in-out infinite}
.hsc-dot[hidden]{display:none}
@keyframes hsc-dotpulse{50%{transform:scale(1.18)}}
.hsc-pill{pointer-events:auto;height:48px;padding:0 14px 0 10px;border-radius:24px;display:flex;gap:6px;align-items:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};font-weight:800;font-size:18px;font-variant-numeric:tabular-nums}
#hsc-panel{position:fixed;inset:0;z-index:30;display:none;background:#2a1d1599;font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};touch-action:manipulation}
#hsc-panel.open{display:flex;align-items:flex-end;justify-content:center}
.hsc-sheet{position:relative;width:min(100%,600px);max-height:min(92%,920px);overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;display:flex;flex-direction:column;gap:12px;background:#fff6e6;border:3px solid ${INK};border-bottom:0;border-radius:26px 26px 0 0;box-shadow:0 -4px 0 ${INK};padding:12px max(12px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))}
@media (orientation:landscape){#hsc-panel.open{align-items:center}.hsc-sheet{border-radius:26px;border-bottom:3px solid ${INK};box-shadow:0 5px 0 ${INK};width:min(96%,900px);max-height:94%}}
.hsc-head{display:flex;gap:8px;align-items:center}
.hsc-head .grow{flex:1}
.hsc-tab{width:60px;height:50px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:#f1e4cc;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};color:${INK};cursor:pointer;padding:0;position:relative}
.hsc-tab[aria-selected=true]{background:#ffb627}
.hsc-tab .hsc-dot{right:-6px;top:-6px;width:14px;height:14px}
.hsc-x{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer;color:${INK};padding:0}
.hsc-pickwrap{padding:4px 6px 0}
.hsc-coll{display:flex;flex-direction:column;gap:12px;padding:6px 6px 8px}
@media (orientation:landscape){.hsc-sheet{display:grid;grid-template-columns:minmax(0,40%) minmax(0,1fr);grid-template-rows:auto auto;column-gap:16px}.hsc-head{grid-column:1/3}.hsc-pickwrap{align-self:start}}
.hsc-pager{display:flex;align-items:center;justify-content:center;gap:16px}
.hsc-pager[hidden]{display:none}
.hsc-arrow{width:56px;height:50px;border-radius:25px;display:flex;align-items:center;justify-content:center;background:#ffb627;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};color:${INK};cursor:pointer;padding:0}
.hsc-arrow:disabled{background:#e9dcc4;color:#a89a8a;box-shadow:0 1px 0 ${INK};cursor:default}
.hsc-arrow:not(:disabled):active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
.hsc-page{min-width:70px;text-align:center;font-weight:900;font-size:19px;font-variant-numeric:tabular-nums}
.hsc-pick{position:relative;display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:24px;border:3px solid ${INK};box-shadow:0 5px 0 ${INK};background:radial-gradient(circle at 25% 50%,#fff,#ffe9a8 75%);color:${INK}}
.hsc-art{position:relative;flex:none;width:clamp(92px,34vw,140px);height:clamp(92px,34vw,140px);display:flex;align-items:center;justify-content:center}
.hsc-art img{width:81%;height:81%;position:relative}
.hsc-ring{position:absolute;inset:0;width:100%;height:100%}
.hsc-ring .arc{fill:none;stroke-linecap:round}
.hsc-ring .trk{fill:none;stroke:#e9dcc4;stroke-width:11}
.hsc-ring .out{stroke:${INK};stroke-width:15}
.hsc-ring .col{stroke-width:9;stroke:#3fbf5a;transition:stroke .4s}
.hsc-pick.o .hsc-ring .col{stroke:#ff9f1c}.hsc-pick.r .hsc-ring .col{stroke:#ff3b30}
.hsc-pick.taken img{opacity:.45}
.hsc-pick.last{background:radial-gradient(circle at 25% 50%,#fff,#ffc7b8 75%);animation:hsc-alarm 1s ease-in-out infinite}
.hsc-pick.last .hsc-art{animation:hsc-beat 1s ease-in-out infinite}
@keyframes hsc-alarm{0%,100%{box-shadow:0 5px 0 ${INK},0 0 0 4px #ff4d3d55,0 0 14px 4px #ff4d3d66}50%{box-shadow:0 5px 0 ${INK},0 0 0 7px #ff4d3d77,0 0 28px 10px #ff4d3d99}}
@keyframes hsc-beat{0%,45%,100%{transform:scale(1)}12%{transform:scale(1.08)}24%{transform:scale(1.01)}34%{transform:scale(1.06)}}
@media (prefers-reduced-motion:reduce){.hsc-pick.last,.hsc-pick.last .hsc-art{animation:none}}
@media (orientation:landscape) and (max-height:430px){.hsc-sheet{grid-template-columns:minmax(0,46%) minmax(0,1fr)}.hsc-art{width:clamp(80px,14vw,104px);height:clamp(80px,14vw,104px)}.hsc-timer{font-size:15px;padding:0 9px;gap:5px}.hsc-timer svg{width:17px;height:17px}}
.hsc-pick .right{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:10px}
.hsc-pick .right .hsc-vbtn{width:100%;max-width:250px}
/* the pick card sizes itself to its own column (landscape columns can be narrow): the picture gives way so the
   video button and the countdown always fit beside it */
.hsc-pickwrap{container-type:inline-size}
@container (max-width:345px){.hsc-art{width:108px;height:108px}}
@container (max-width:305px){.hsc-art{width:88px;height:88px}.hsc-timer{font-size:15px;padding:0 8px;gap:4px}.hsc-timer svg{width:17px;height:17px}}
@container (max-width:270px){.hsc-art{width:74px;height:74px}.hsc-pick{gap:8px;padding:8px}}
@media (max-width:360px){.hsc-timer{font-size:15px;padding:0 8px;gap:4px}.hsc-timer svg{width:17px;height:17px}.hsc-vbtn{height:62px}}
.hsc-vbtn{height:72px;border-radius:36px;display:flex;align-items:center;justify-content:center;gap:6px;background:#58c8f5;border:3px solid ${INK};box-shadow:0 4px 0 ${INK};cursor:pointer;color:${INK};padding:0;animation:hsc-breathe 1.3s ease-in-out infinite}
.hsc-vbtn:disabled{animation:none}
.hsc-vbtn:not(:disabled):active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
.hsc-vbtn .done{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#5ccf72;border:2px solid ${INK};color:${INK}}
.hsc-pick.taken .hsc-vbtn{background:#e9dcc4;color:#7d6e5f;box-shadow:0 2px 0 ${INK};animation:none;cursor:default}
@keyframes hsc-breathe{50%{transform:scale(1.04)}}
.hsc-timer{align-self:center;display:flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:17px;background:#fff6e6;border:2.5px solid ${INK};font-weight:900;font-size:17px;font-variant-numeric:tabular-nums}
.hsc-timer.g{background:#c8f0cf}.hsc-timer.o{background:#ffd27a}.hsc-timer.r{background:#ff3b30;color:#fff}
.hsc-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px 12px}
@media (orientation:landscape) and (min-height:431px){.hsc-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}
.hsc-tile{position:relative;aspect-ratio:1;border-radius:18px;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};background:radial-gradient(circle at 50% 40%,#fff,#f1e4cc 75%);display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;color:${INK}}
.hsc-tile img{width:92%;height:92%;pointer-events:none}
.hsc-tile.cur{outline:4px solid #5ccf72;outline-offset:3px}
.hsc-tile .on{position:absolute;right:-10px;top:-10px;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#5ccf72;border:3px solid ${INK}}
.hsc-tile .new{position:absolute;left:-12px;top:-14px;filter:drop-shadow(0 2px 0 ${INK})}
.hsc-tile.ghost{border-style:dashed;box-shadow:none;background:#f6ecd8;opacity:.6;cursor:default}
.hsc-tile:not(.ghost):active{transform:translateY(3px)}
.hsc-pop{animation:hsc-popin .5s cubic-bezier(.3,1.6,.5,1)}
.hsc-pickwrap[hidden]{display:none}
/* no video came: a short shake, the button stays ready */
.hsc-nope{animation:hsc-nope .45s ease-in-out!important}
@keyframes hsc-nope{20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}
@keyframes hsc-popin{0%{transform:scale(.75)}100%{transform:scale(1)}}
/* the finish button sits on the same line and margin as the top-left buttons (the game's own CSS used 8 px from
   the top in landscape and 12 px from the right on short landscape screens, against the row's 12 / 8) */
@media (orientation:landscape){.ui[data-status] .bar{top:max(12px,env(safe-area-inset-top))}}
@media (orientation:landscape) and (max-height:430px){.ui[data-status] .bar{top:max(8px,env(safe-area-inset-top));right:max(8px,env(safe-area-inset-right))}}
/* the finish button in the top right: the same size as the buttons in the top left */
.ui .finish.seal,.ui[data-status=cutting] .ctl.finish.seal{width:48px!important;height:48px!important}
.ui .finish.seal svg:not(.seal-shape){width:24px;height:24px}
`;

  const ui = {
    tool: 'clipper',
    page: 0,
    el: {},
    busy: false,
    build() {
      const st = document.createElement('style');
      st.textContent = CSS;
      document.head.appendChild(st);
      const hud = document.createElement('div');
      hud.id = 'hsc-hud';
      hud.innerHTML = `<div class="hsc-row"><button class="hsc-btn hsc-rw" type="button" aria-label="Wardrobe">${ICON.hanger}<span class="hsc-dot" hidden></span></button></div>`;
      document.body.appendChild(hud);
      this.el.hud = hud;
      this.el.row = hud.querySelector('.hsc-row');
      this.el.btn = hud.querySelector('.hsc-rw');
      this.el.dot = hud.querySelector('.hsc-dot');
      this.el.btn.addEventListener('click', () => this.open());

      const panel = document.createElement('div');
      panel.id = 'hsc-panel';
      panel.innerHTML = `<div class="hsc-sheet" role="dialog" aria-label="Wardrobe">
        <div class="hsc-head">
          <button class="hsc-tab" data-tool="clipper" type="button" aria-label="Clippers">${ICON.clipper}<span class="hsc-dot" hidden></span></button>
          <button class="hsc-tab" data-tool="gown" type="button" aria-label="Robes">${ICON.gown}<span class="hsc-dot" hidden></span></button>
          <div class="grow"></div>
          ${HSC.setDetailSetting ? '<button class="hsc-btn hsc-detail" type="button" aria-label="Detail level"></button>' : ''}
          <button class="hsc-x" type="button" aria-label="Close">${ICON.close}</button>
        </div>
        <div class="hsc-pickwrap"></div>
        <div class="hsc-coll"><div class="hsc-grid"></div>
          <div class="hsc-pager" hidden><button class="hsc-arrow" data-dir="-1" type="button" aria-label="Previous">${ICON.arrow(-1)}</button><div class="hsc-page"></div><button class="hsc-arrow" data-dir="1" type="button" aria-label="Next">${ICON.arrow(1)}</button></div></div>
      </div>`;
      document.body.appendChild(panel);
      this.el.panel = panel;
      this.el.sheet = panel.querySelector('.hsc-sheet');
      this.el.pick = panel.querySelector('.hsc-pickwrap');
      this.el.grid = panel.querySelector('.hsc-grid');
      this.el.pager = panel.querySelector('.hsc-pager');
      this.el.pageNum = panel.querySelector('.hsc-page');
      panel.querySelectorAll('.hsc-arrow').forEach((b) => b.addEventListener('click', () => { this.page += +b.dataset.dir; this.render(); }));
      panel.querySelector('.hsc-head .hsc-x').addEventListener('click', () => this.close());
      panel.addEventListener('click', (e) => { if (e.target === panel) this.close(); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.el.panel.classList.contains('open')) { e.preventDefault(); this.close(); } });
      // turning the device with the panel open: two rows of the new width
      try { matchMedia('(orientation: landscape)').addEventListener('change', () => { if (this.el.panel.classList.contains('open')) this.render(); }); } catch (e) {}
      panel.querySelectorAll('.hsc-tab').forEach((b) => b.addEventListener('click', () => { this.tool = b.dataset.tool; this.page = 0; this.render(); }));
      // the Android build keeps its detail-level button
      this.el.detail = panel.querySelector('.hsc-detail');
      if (this.el.detail) this.el.detail.addEventListener('click', () => {
        const order = ['auto', 'low', 'high'], D = HSC.detail;
        HSC.setDetailSetting(order[(order.indexOf(D.setting) + 1) % order.length]);
        this.drawDetail();
      });
      const place = () => { HSC.applyScale(); this.place(); if (this.el.panel.classList.contains('open')) this.render(); };
      addEventListener('resize', place);
      // keeps the button in place, the red dot up to date, and the countdown ticking
      setInterval(() => {
        place();
        const open = this.el.panel.classList.contains('open');
        if (open && this.day !== today()) this.render(); // midnight: today's new picks replace yesterday's
        else if (open) this.tickTimer();
        this.dot();
      }, 1000);
      place();
      this.dot();
    },
    place() {
      // sit to the right of the game's sound button (or in its place if there is none); the row is drawn at
      // the UI scale, so screen positions are divided by it
      const audio = document.querySelector('.audio-toggle'), S = HSC.S || 1;
      const r = audio ? audio.getBoundingClientRect() : null;
      this.el.row.style.left = r && r.width ? r.right / S + 8 + 'px' : 'max(12px, env(safe-area-inset-left))';
      this.el.row.style.top = r && r.height ? r.top / S + 'px' : 'max(12px, env(safe-area-inset-top))';
    },
    // the red dot: once a day, while today's pick is waiting
    waiting(tool) { return canVideo() && !owns(picks()[tool]); },
    dot() {
      if (!W.data || !this.el.dot) return;
      this.el.dot.hidden = !(W.data.dotDay !== today() && (this.waiting('clipper') || this.waiting('gown')));
      const fresh = W.data.dotDay !== today() || (this.openDot && this.el.panel.classList.contains('open'));
      this.el.panel.querySelectorAll('.hsc-tab').forEach((b) => { b.querySelector('.hsc-dot').hidden = !(fresh && this.waiting(b.dataset.tool)); });
    },
    open() {
      // open on the tab whose pick is still waiting
      if (!this.waiting(this.tool) && this.waiting(this.tool === 'clipper' ? 'gown' : 'clipper')) this.tool = this.tool === 'clipper' ? 'gown' : 'clipper';
      this.page = 0;
      this.render();
      this.openDot = W.data.dotDay !== today();
      this.dot();
      W.data.dotDay = today();
      save();
      this.el.panel.classList.add('open');
      this.fit();
      W.client && W.client.setPauseReason && W.client.setPauseReason('wardrobe', true);
      try { this.el.panel.querySelector('.hsc-x').focus({ preventScroll: true }); } catch (e) {}
    },
    close() {
      if (!this.el.panel.classList.contains('open')) return;
      this.el.panel.classList.remove('open');
      HSC.settle && HSC.settle();
      W.client && W.client.setPauseReason && W.client.setPauseReason('wardrobe', false);
      this.dot();
    },
    drawDetail() {
      if (!this.el.detail) return; // builds with one fixed detail level have no button
      const D = HSC.detail || { level: 'high', setting: 'auto' };
      const on = D.level === 'low' ? 1 : 3;
      const bar = (i, h) => `<rect x="${4 + i * 6}" y="${20 - h}" width="4.4" height="${h}" rx="1.2" fill="${i < on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6"/>`;
      this.el.detail.innerHTML = `<svg viewBox="0 0 24 24" width="26" height="26">${bar(0, 6)}${bar(1, 11)}${bar(2, 16)}${D.setting === 'auto' ? '<circle cx="5" cy="5" r="2.6" fill="#ff8a3d" stroke="currentColor" stroke-width="1.2"/>' : ''}</svg>`;
    },
    tickTimer() {
      const t = this.el.pick.querySelector('.hsc-timer');
      if (!t) return;
      const left = timeLeft();
      t.querySelector('span').textContent = left.text;
      const taken = !!t.dataset.taken, card = this.el.pick.querySelector('.hsc-pick');
      t.classList.toggle('low', left.low && !taken);
      for (const l of ['g', 'o', 'r']) { t.classList.toggle(l, !taken && left.lvl === l); card.classList.toggle(l, !taken && left.lvl === l); }
      card.classList.toggle('last', !taken && left.last);
      // what is left of the day, as an arc that empties anticlockwise towards the top (a red dot at the very end)
      const C = 2 * Math.PI * 62, len = Math.max(left.frac * C, left.frac > 0 ? 4 : 0);
      this.el.pick.querySelectorAll('.hsc-ring .arc').forEach((a) => a.setAttribute('stroke-dasharray', `${len.toFixed(1)} ${C.toFixed(1)}`));
    },
    render() {
      if (!W.data) return;
      this.drawDetail();
      const tool = this.tool, cur = W.data.look[tool];
      this.el.panel.querySelectorAll('.hsc-tab').forEach((b) => b.setAttribute('aria-selected', b.dataset.tool === tool ? 'true' : 'false'));
      // today's pick: one video and it is yours; the countdown runs to midnight
      const pk = picks(), d = C().byKey.get(pk[tool]), taken = owns(d.key);
      this.day = pk.day;
      // no rewarded videos on this platform: nothing to offer, only the wardrobe
      this.el.pick.hidden = !canVideo();
      const need = C().VIDEOS(d), done = W.data.progress[d.key] || 0;
      const badge = taken ? ICON.tick(34) : Array.from({ length: need }, (_, i) => (i < done ? `<b class="done">${ICON.tick(20)}</b>` : AD(need > 1 ? 40 : 46))).join('');
      this.el.pick.innerHTML = `<div class="hsc-pick${taken ? ' taken' : ''}"><div class="hsc-art">${taken ? '' : RING}<img src="${picture(d, 260)}" alt=""></div>
        <div class="right"><button class="hsc-vbtn" type="button" ${taken ? 'disabled' : ''} aria-label="${taken ? 'Yours: a new one tomorrow' : "Today's pick: watch a video to get it"}">${badge}</button>
        <div class="hsc-timer" ${taken ? 'data-taken="1"' : ''} aria-label="Time left today">${ICON.clock}<span></span></div></div></div>`;
      this.el.pick.querySelector('.hsc-vbtn').addEventListener('click', () => this.take(d));
      this.tickTimer();
      // everything the player owns: the one worn first, then the newest; one empty slot at the end hints that
      // there is more to get. Two rows at a time (only those pictures are drawn), arrows for the rest.
      const rank = new Map(W.data.recent.map((k, n) => [k, n]));
      const owned = C().designs[tool].filter((x) => owns(x.key))
        .sort((a, b) => ((b.id === cur) - (a.id === cur)) || ((rank.has(b.key) ? rank.get(b.key) : -1) - (rank.has(a.key) ? rank.get(a.key) : -1)) || a.i - b.i);
      // two rows; one on squat portrait screens (tiny square embeds), where two rows of tiles cannot fit
      const land = matchMedia('(orientation: landscape)').matches;
      const rows = !land && innerHeight / (HSC.S || 1) < 520 ? 1 : 2;
      const cols = land && matchMedia('(min-height: 431px)').matches ? 5 : 4, per = cols * rows;
      const items = [...owned, null], pages = Math.ceil(items.length / per);
      this.page = Math.max(0, Math.min(pages - 1, this.page));
      this.el.grid.innerHTML = items.slice(this.page * per, this.page * per + per).map((x) => (x
        ? `<button type="button" class="hsc-tile${x.id === cur ? ' cur' : ''}" data-key="${x.key}" aria-label="${x.id === cur ? 'Wearing' : 'Wear this'}"><img src="${picture(x)}" alt="">${x.id === cur ? `<span class="on">${ICON.tick(18)}</span>` : ''}${x.key === this.fresh ? `<span class="new">${ICON.spark(30)}</span>` : ''}</button>`
        : '<div class="hsc-tile ghost"></div>')).join('');
      this.el.pager.hidden = pages <= 1;
      this.el.pageNum.textContent = `${this.page + 1}/${pages}`;
      const [prev, next] = this.el.pager.querySelectorAll('.hsc-arrow');
      prev.disabled = this.page === 0;
      next.disabled = this.page >= pages - 1;
      for (const b of this.el.grid.querySelectorAll('.hsc-tile[data-key]')) b.addEventListener('click', () => {
        const x = C().byKey.get(b.dataset.key);
        // the worn design leads the wardrobe: back to the first page to see it there
        if (W.data.look[x.tool] !== x.id) { equip(x.tool, x.id); this.page = 0; this.render(); this.pop(x.key); }
      });
      this.fit();
    },
    fit() {
      const sh = this.el.sheet;
      if (!sh || !this.el.panel.classList.contains('open')) return;
      // the tiles follow the sheet's width, so a smaller drawing reflows taller: refine a few times
      let z = 1;
      sh.style.zoom = '';
      for (let i = 0; i < 6 && sh.scrollHeight > sh.clientHeight + 1 && z > 0.55; i++) {
        z = Math.max(0.55, z * (sh.clientHeight / sh.scrollHeight) * 0.995);
        sh.style.zoom = String(z);
      }
    },
    pop(key) {
      const t = this.el.grid.querySelector(`[data-key="${key}"]`);
      if (t) { t.classList.remove('hsc-pop'); void t.offsetWidth; t.classList.add('hsc-pop'); }
    },
    async take(d) {
      if (this.busy || owns(d.key)) return;
      this.busy = true;
      const b = this.el.pick.querySelector('.hsc-vbtn');
      b.disabled = true;
      const ok = await watchVideo('unlock-item');
      this.busy = false;
      if (!ok) { b.disabled = false; HSC.nope && HSC.nope(b); return; }
      if (grant(d, 'daily') === 'unlocked') { equip(d.tool, d.id); this.fresh = d.key; this.page = 0; this.render(); this.pop(d.key); }
      else this.render();
    },
  };

  HSC.wardrobeApply = () => applyLook();
  // for other modules: the current look, pictures of designs, and a design previewed without owning it
  HSC.rewards = {
    canVideo,
    owns: (key) => !!W.data && owns(key),
    preview(tool, id) { W.preview[tool] = id || null; applyLook(); },
    clearPreview() { W.preview = { clipper: null, gown: null }; applyLook(); },
    picture: (d, size) => picture(d, size),
  };
  HSC.wardrobeInit = async function ({ client, game }) {
    W.client = client;
    W.game = game;
    let d = null;
    try { d = client && client.loadProgress ? await client.loadProgress(KEY, null) : null; } catch (e) {}
    W.data = sanitize(d);
    try { ui.build(); } catch (e) { console.error('customers: rewards UI failed', e); }
    try { HSC.hubInit && HSC.hubInit(); } catch (e) { console.error('customers: hub failed', e); }
    applyLook();
    save();
  };
})(globalThis.HSC || (globalThis.HSC = {}));
