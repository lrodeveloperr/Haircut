// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved 5 November 2026): barber tools beside the clipper,
// unlocked by level. Each is modelled to scale in the clipper's own hand (the same transform, so placement and
// touch targeting are the clipper's) and cuts the way the real tool does, within the game's hair grid:
//
//   trimmer        level 3   narrow T-blade, cuts to the skin (0.5 mm): line-ups, edges and the nape
//   scissors       level 6   blends: each pass takes about 3 mm off what is longer than the chosen guard
//   straight razor level 9   very narrow; shaves beard and edges clean
//   beard trimmer  level 12  compact; its guards give fine beard lengths (1, 2, 3, 4.5, 6 mm)
//
// The tool button sits bottom-left (it appears once a second tool is unlocked). Wordless: pictures only.
// patch19 routes the engine's cut level, blade width and motor sound through here; the clipper is unchanged.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#10223f';
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio;
  const TOOLS = {
    clipper: { level: 1, width: 0.56 },
    trimmer: { level: 3, width: 0.3, cut: () => 0, hz: (g) => 168, gain: 0.8 },
    // each spot loses one level (about 3 mm) per stroke, never below the chosen guard
    scissors: { level: 6, width: 0.46, cut: (u, g, c) => { if (c == null || snipped.has(c)) return u; snipped.add(c); return Math.max(g, u - 1); }, gain: 0 },
    razor: { level: 9, width: 0.2, cut: () => 0, gain: 0 },
    beard: { level: 12, width: 0.4, hz: (g) => 150 - g * 6, gain: 0.55 },
  };
  const snipped = new Set(); // cells the scissors cut in this stroke
  addEventListener('pointerdown', () => snipped.clear(), true);
  const ORDER = ['clipper', 'trimmer', 'scissors', 'razor', 'beard'];
  let tool = 'clipper';
  const unlocked = () => { const lv = M() && M().data ? M().level() : 1; return ORDER.filter((k) => lv >= TOOLS[k].level); };

  // ---- cutting (patch19 and state.js) ----
  // rituals (turkish.js) join the tray; while one is in the hand nothing is cut and the motor is silent
  HSC.addTool = function (key, def, icon) { TOOLS[key] = Object.assign({ width: 0.01, gain: 0, ritual: true }, def); ICON[key] = icon; if (!ORDER.includes(key)) ORDER.push(key); };
  HSC.isRitual = () => !!TOOLS[tool].ritual;
  HSC.toolLevel = (u, g, c) => (TOOLS[tool].ritual ? u : TOOLS[tool].cut ? TOOLS[tool].cut(u, g, c) : g);
  HSC.bladeWidth = () => TOOLS[tool].width;
  HSC.toolHz = (g) => (TOOLS[tool].hz ? TOOLS[tool].hz(g) : 118 - Math.max(0, g) * 9);
  HSC.toolGain = () => (TOOLS[tool].gain == null ? 1 : TOOLS[tool].gain);
  const FINE = [1, 2, 3, 4.5, 6]; // the beard trimmer's guards, mm
  const levelOfMm = (mm) => { const L = HSC.BEARD_MM; let best = 0; for (let i = 0; i < L.length; i++) if (Math.abs(L[i] - mm) < Math.abs(L[best] - mm)) best = i; return best; };
  HSC.toolBeard = (g) => {
    if (TOOLS[tool].ritual) return HSC.BEARD_MM.length - 1;
    if (tool === 'razor' || tool === 'trimmer') return 0;
    if (tool === 'beard') return levelOfMm(FINE[g] != null ? FINE[g] : 3);
    if (tool === 'scissors') return HSC.GUARD_LEVEL[g];
    return HSC.GUARD_LEVEL[g];
  };

  // ---- models (built from the clipper's own geometry and material classes) ----
  const models = {}, originals = [];
  function build(group) {
    const kids = group.children.filter((o) => o.isMesh);
    const lathe = kids.find((o) => o.geometry.parameters && o.geometry.parameters.points);
    const box = kids.find((o) => o.geometry.parameters && o.geometry.parameters.width != null && o.geometry.parameters.depth != null);
    const cap = kids.find((o) => o.geometry.parameters && o.geometry.parameters.capSegments != null);
    if (!lathe || !box) return false;
    originals.push(...group.children);
    const Mesh = lathe.constructor, Lathe = lathe.geometry.constructor, Box = box.geometry.constructor, V2 = lathe.geometry.parameters.points[0].constructor;
    const Phys = lathe.material.constructor, Std = box.material.constructor, Group = group.constructor;
    const Geo = Object.getPrototypeOf(Lathe); // the plain geometry class
    const mat = (o, C = Phys) => new C(o);
    const chrome = mat({ color: '#d7dce0', metalness: 1, roughness: 0.18 }), steel = mat({ color: '#9aa1a7', metalness: 1, roughness: 0.3 });
    const blackM = mat({ color: '#1b1c1e', metalness: 0.1, roughness: 0.45, clearcoat: 0.5 }), rubber = mat({ color: '#121212', metalness: 0, roughness: 0.9 }, Std);
    const add = (g, geo, m, x, y, z, s, r) => { const o = new Mesh(geo, m); o.position.set(x, y, z); if (s) o.scale.set(s[0], s[1], s[2]); if (r) o.rotation.set(r[0], r[1], r[2]); g.add(o); return o; };
    const lath = (pts, seg = 36) => new Lathe(pts.map((p) => new V2(p[0], p[1])), seg);
    // a tapered blade: a box whose far end narrows to a point
    const blade = (len, w0, w1, th) => {
      const g = new Box(w0, len, th, 1, 8, 1), P = g.attributes.position;
      for (let i = 0; i < P.count; i++) { const t = (P.getY(i) + len / 2) / len; P.setX(i, P.getX(i) * (w1 / w0 + (1 - w1 / w0) * t)); }
      g.computeVertexNormals();
      return g;
    };
    const torus = (R, r) => {
      const pos = [], nrm = [], idx = [], ts = 32, rs = 10;
      for (let j = 0; j <= rs; j++) for (let i = 0; i <= ts; i++) { const u = (i / ts) * 6.2832, w = (j / rs) * 6.2832; nrm.push(Math.cos(w) * Math.cos(u), Math.cos(w) * Math.sin(u), Math.sin(w)); pos.push((R + r * Math.cos(w)) * Math.cos(u), (R + r * Math.cos(w)) * Math.sin(u), r * Math.sin(w)); }
      for (let j = 0; j < rs; j++) for (let i = 0; i < ts; i++) { const a = j * (ts + 1) + i, b = a + ts + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const g = new Geo();
      const A = box.geometry.attributes.position.constructor;
      g.setAttribute('position', new A(new Float32Array(pos), 3)); g.setAttribute('normal', new A(new Float32Array(nrm), 3)); g.setIndex(idx);
      return g;
    };

    // trimmer: slim body, wide flat T-blade (a detailer)
    const tr = new Group();
    add(tr, lath([[0.2, 0], [0.24, 0.15], [0.26, 0.5], [0.255, 1.1], [0.24, 1.6], [0.19, 1.85], [0.001, 1.92]]), blackM, 0, 0.32, 0, [1, 1, 0.7]);
    add(tr, new Box(0.5, 0.2, 0.15), blackM, 0, 0.2, 0);
    add(tr, new Box(0.46, 0.035, 0.1), chrome, 0, 0.06, 0.005);
    add(tr, new Box(0.46, 0.06, 0.012), steel, 0, 0.025, -0.02);
    for (let k = 0; k < 24; k++) add(tr, new Box(0.011, 0.03, 0.012), chrome, -0.22 + 0.44 * (k + 0.5) / 24, 0.0, -0.02);
    add(tr, new Box(0.07, 0.16, 0.03), chrome, 0, 1.25, 0.18);
    if (cap) for (const sx of [-1, 1]) add(tr, cap.geometry, rubber, sx * 0.2, 1.05, 0.05, [0.45, 0.85, 0.35]);
    // scissors: two halves on the pivot screw that open and close as you cut; each half is a long tapered blade,
    // a shank and a finger ring (the moving half also has the finger rest). Tips touch the hair at y 0.
    const sc = new Group(), PIV = 1.17, halves = [];
    for (const sx of [-1, 1]) {
      const h = new Group(); h.position.set(0, PIV, sx * 0.016);
      add(h, blade(PIV, 0.13, 0.022, 0.028), chrome, sx * 0.012, -PIV / 2, 0, null, [0, 0, 0]);
      add(h, new Box(0.006, PIV * 0.96, 0.03), steel, -sx * 0.052, -PIV / 2 + 0.02, 0); // the sharpened edge catches the light
      add(h, new Box(0.065, 0.46, 0.034), chrome, sx * 0.1, 0.21, 0, null, [0, 0, -sx * 0.42]);
      add(h, torus(0.165, 0.034), chrome, sx * 0.25, 0.56, 0);
      if (sx > 0) add(h, new Box(0.035, 0.24, 0.03), chrome, 0.46, 0.7, 0, null, [0, 0, -0.75]);
      sc.add(h); halves.push([h, sx]);
    }
    add(sc, lath([[0.055, 0], [0.055, 0.07], [0.001, 0.08]], 24), steel, 0, PIV, 0.05, null, [Math.PI / 2, 0, 0]);
    sc.userData.halves = halves;
    // straight razor: a hollow-ground blade whose edge lies along the skin (x), a thick spine, the tang and pivot
    // pin, and the two handle scales opened back to about 160 degrees
    const rz = new Group();
    const bladeG = new Box(0.44, 0.2, 0.024, 12, 4, 1), BP = bladeG.attributes.position;
    for (let k = 0; k < BP.count; k++) {
      const x = BP.getX(k), y = BP.getY(k), t = (y + 0.1) / 0.2; // 0 edge .. 1 spine
      BP.setZ(k, BP.getZ(k) * (0.25 + 0.75 * t)); // thin at the edge, thick at the spine
      if (x < -0.15) BP.setY(k, y - (x + 0.15) * 0.25 * t); // a rounded toe
    }
    bladeG.computeVertexNormals();
    add(rz, bladeG, chrome, 0, 0.1, 0);
    add(rz, new Box(0.44, 0.03, 0.03), steel, 0, 0.205, 0);
    add(rz, new Box(0.12, 0.07, 0.024), steel, 0.27, 0.19, 0);
    add(rz, lath([[0.028, 0], [0.028, 0.1], [0.001, 0.11]], 16), chrome, 0.3, 0.2, -0.055, null, [Math.PI / 2, 0, 0]);
    const scaleM = mat({ color: '#2b1a12', metalness: 0, roughness: 0.32, clearcoat: 0.85 });
    for (const dz of [-0.03, 0.03]) {
      const g = new Box(0.12, 1.05, 0.026, 1, 6, 1), GP = g.attributes.position;
      for (let k = 0; k < GP.count; k++) { const t = (GP.getY(k) + 0.525) / 1.05; GP.setX(k, GP.getX(k) * (0.75 + 0.35 * Math.sin(t * Math.PI))); }
      g.computeVertexNormals();
      add(rz, g, scaleM, 0.3 + Math.sin(0.35) * 0.52, 0.2 + Math.cos(0.35) * 0.52, dz, null, [0, 0, -0.35]);
    }
    // beard trimmer: compact silver body with its own comb guard
    const bt = new Group();
    const silver = mat({ color: '#b7bcc1', metalness: 0.8, roughness: 0.3, clearcoat: 0.4 });
    add(bt, lath([[0.26, 0], [0.29, 0.1], [0.3, 0.45], [0.28, 0.95], [0.22, 1.25], [0.001, 1.32]]), silver, 0, 0.3, 0, [1, 1, 0.62]);
    add(bt, new Box(0.6, 0.22, 0.16), blackM, 0, 0.19, 0);
    add(bt, new Box(0.56, 0.03, 0.12), chrome, 0, 0.06, 0);
    for (let k = 0; k < 16; k++) add(bt, new Box(0.02, 0.22, 0.012), mat({ color: '#6e7479', metalness: 0, roughness: 0.55, transparent: true, opacity: 0.85 }, Std), -0.26 + 0.52 * (k + 0.5) / 16, -0.02, -0.07, null, [0.35, 0, 0]);
    add(bt, new Box(0.12, 0.12, 0.03), blackM, 0, 0.85, 0.2);
    for (const [k, g] of [['trimmer', tr], ['scissors', sc], ['razor', rz], ['beard', bt]]) { g.visible = false; group.add(g); models[k] = g; }
    return true;
  }
  function show() {
    for (const o of originals) o.layers.set(tool === 'clipper' ? 0 : 1);
    if (HSC.onTool) HSC.onTool(tool);
    for (const [k, g] of Object.entries(models)) g.visible = k === tool;
  }
  HSC.setTool = function (k) {
    if (!TOOLS[k] || !unlocked().includes(k)) return false;
    tool = k; show(); ui.render();
    // a ritual works by touch: the hand goes to cut mode (nothing is cut)
    try { if (TOOLS[k].ritual && G().getState().interactionMode !== 'cut') G().toggleClipper(); } catch (e) {}
    try { const g = G(); g && g.getState && navigator.vibrate && navigator.vibrate(10); } catch (e) {}
    return true;
  };
  HSC.tool = () => tool;

  // ---- feel: the scissors open and close as you drag, each close a crisp snip (a crunchier shear when it is
  // cutting hair), with a light tap of vibration; the razor scrapes. The clipper keeps the game's own motor. ----
  let ac = null, out = null;
  const view = () => { try { return G().getView(); } catch (e) { return null; } };
  function audio() {
    const v = view();
    if (!v || !v.audio || v.paused) return null;
    const C = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!C) return null;
    if (!ac) { ac = new C(); out = ac.createGain(); out.connect(ac.destination); }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    out.gain.value = 0.7 * (typeof v.volume === 'number' ? v.volume : 1);
    return ac;
  }
  const noise = (a, len, shape) => { const b = a.createBuffer(1, Math.max(1, Math.round(a.sampleRate * len)), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * shape(i / d.length, i); return b; };
  const stats = { snips: 0, cuts: 0, scrapes: 0 };
  HSC.toolsDebug = () => Object.assign({ open: feel.open, phase: feel.phase }, stats); // QA
  function snip(cutting, strength) {
    stats.snips++; if (cutting) stats.cuts++;
    const a = audio();
    if (!a) return;
    const t = a.currentTime, play = (buf, type, f, q, gain, at = 0) => { const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; s.playbackRate.value = 0.92 + Math.random() * 0.16; fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.value = gain; s.connect(fl).connect(g).connect(out); s.start(t + at); };
    // the blades sliding shut: a short metallic shear, grainy where they cut through strands
    if (cutting) play(noise(a, 0.085, (u, i) => Math.pow(1 - u, 1.6) * (u < 0.04 ? u / 0.04 : 1) * (Math.floor(i / 70) % 3 === 0 ? 1.4 : 0.55 + 0.45 * Math.random())), 'bandpass', 6200, 1.1, 0.55 * strength);
    else play(noise(a, 0.04, (u) => Math.pow(1 - u, 2.5)), 'bandpass', 7400, 1.6, 0.22);
    // the blades meeting: a bright click and a faint ring of steel
    play(noise(a, 0.007, (u) => 1 - u), 'highpass', 5000, 0.7, cutting ? 0.45 : 0.3, cutting ? 0.07 : 0.03);
    for (const [f, g] of [[3150, 0.035], [4720, 0.022]]) { const o = a.createOscillator(), og = a.createGain(); o.frequency.value = f * (0.98 + Math.random() * 0.04); og.gain.setValueAtTime(g, t + 0.07); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(og).connect(out); o.start(t + 0.07); o.stop(t + 0.17); }
    if (cutting && navigator.vibrate) try { navigator.vibrate(6); } catch (e) {}
  }
  function scrape(strength) {
    stats.scrapes++;
    const a = audio();
    if (!a) return;
    const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
    s.buffer = noise(a, 0.09, (u, i) => Math.sin(Math.PI * u) * (0.6 + 0.4 * Math.random()) * (Math.floor(i / 40) % 2 ? 1 : 0.7));
    fl.type = 'bandpass'; fl.frequency.value = 3200 + Math.random() * 600; fl.Q.value = 2.4; g.gain.value = 0.28 * strength;
    s.connect(fl).connect(g).connect(out); s.start();
  }
  const ptr = { down: false, moved: 0, x: 0, y: 0, speed: 0 };
  addEventListener('pointerdown', (e) => { ptr.down = true; ptr.x = e.clientX; ptr.y = e.clientY; ptr.moved = performance.now(); }, true);
  addEventListener('pointermove', (e) => { if (!ptr.down) return; const now = performance.now(), d = Math.hypot(e.clientX - ptr.x, e.clientY - ptr.y); ptr.speed = 0.7 * ptr.speed + 0.3 * (d / Math.max(8, now - ptr.moved)) * 1000; ptr.x = e.clientX; ptr.y = e.clientY; ptr.moved = now; }, true);
  for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, () => { ptr.down = false; }, true);
  const feel = { phase: 0, open: 0.3, last: performance.now(), lastStroke: 0, scrapeAt: 0 };
  function animate() {
    const now = performance.now(), dt = Math.min(0.05, (now - feel.last) / 1000);
    feel.last = now;
    const g = G(), s = g && g.getState();
    if (!s || (tool !== 'scissors' && tool !== 'razor')) { if (s) feel.lastStroke = s.cutStrokeCount; return; }
    const inHand = !!(HSC.clipperGroup && HSC.clipperGroup.visible) && ptr.down && s.status === 'cutting';
    const moving = inHand && now - ptr.moved < 140;
    const cut = s.cutStrokeCount > feel.lastStroke;
    if (tool === 'scissors') {
      const halves = models.scissors && models.scissors.userData.halves;
      let ang;
      if (moving) {
        // 3 to 7 snips a second, faster with a quicker drag
        const rate = Math.max(3, Math.min(7, 3 + ptr.speed / 260));
        const before = feel.phase;
        feel.phase += dt * rate;
        if (Math.floor(feel.phase) > Math.floor(before)) { snip(cut, Math.min(1, 0.6 + ptr.speed / 1200)); feel.lastStroke = s.cutStrokeCount; }
        ang = 0.3 * (0.5 + 0.5 * Math.cos(feel.phase * 6.2832)); // open, then shut on each whole cycle
        feel.open = ang;
      } else {
        // at rest the blades ease slightly open
        feel.open += (0.12 - feel.open) * Math.min(1, dt * 8);
        ang = feel.open;
        if (!inHand) feel.phase = Math.ceil(feel.phase);
        feel.lastStroke = s.cutStrokeCount;
      }
      if (halves) for (const [h, sx] of halves) h.rotation.z = -sx * ang;
    } else {
      if (moving && cut && now - feel.scrapeAt > 75) { scrape(Math.min(1, 0.5 + ptr.speed / 1500)); feel.scrapeAt = now; }
      feel.lastStroke = s.cutStrokeCount;
    }
  }
  setInterval(animate, 16);

  // ---- the tool button (bottom-left) ----
  const ICON = {
    clipper: `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M8 3h8a2 2 0 0 1 2 2v12H6V5a2 2 0 0 1 2-2z" fill="#25282b" stroke="${INK}" stroke-width="1.6"/><path d="M5 17h14v3H5z" fill="#cfd5da" stroke="${INK}" stroke-width="1.6"/></svg>`,
    trimmer: `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M9.5 4h5a1.5 1.5 0 0 1 1.5 1.5V16H8V5.5A1.5 1.5 0 0 1 9.5 4z" fill="#1b1c1e" stroke="${INK}" stroke-width="1.6"/><path d="M4 16h16v2.2H4z" fill="#d7dce0" stroke="${INK}" stroke-width="1.6"/><path d="M5 18.2v1.6M8 18.2v1.6M11 18.2v1.6M14 18.2v1.6M17 18.2v1.6" stroke="${INK}" stroke-width="1.2"/></svg>`,
    scissors: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"><circle cx="7" cy="18" r="3" fill="#d7dce0"/><circle cx="17" cy="18" r="3" fill="#d7dce0"/><path d="M8.8 15.6L15.5 3M15.2 15.6L8.5 3" stroke-width="2.2"/></svg>`,
    razor: `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M3 10h11v4H3z" fill="#d7dce0" stroke="${INK}" stroke-width="1.6"/><path d="M14 11.5l7-6.5 1.2 1.3-6.6 7.2z" fill="#3b2416" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    beard: `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M9 5h6a2 2 0 0 1 2 2v8H7V7a2 2 0 0 1 2-2z" fill="#b7bcc1" stroke="${INK}" stroke-width="1.6"/><path d="M6 15h12v2H6z" fill="#1b1c1e" stroke="${INK}" stroke-width="1.4"/><path d="M7 17l-1 3M9.5 17l-.5 3M12 17v3M14.5 17l.5 3M17 17l1 3" stroke="#6e7479" stroke-width="1.4"/></svg>`,
  };
  const CSS = `
#hsc-tools{position:fixed;z-index:20;left:max(14px,env(safe-area-inset-left));bottom:max(18px,env(safe-area-inset-bottom));display:flex;flex-direction:column-reverse;gap:10px;zoom:var(--hsc-s,1)}
#hsc-tools button{width:60px;height:60px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer}
#hsc-tools button.on{background:#ffb627}
#hsc-tools button:active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
#hsc-tools .fan{display:grid;grid-template-columns:repeat(2,60px);grid-auto-flow:row;gap:10px;direction:ltr}
#hsc-tools .fan .sep{grid-column:1/3;height:3px;border-radius:2px;background:#10223f;opacity:.25}
#hsc-tools .fan[hidden],#hsc-tools[hidden]{display:none}
body.hsc-reveal #hsc-tools,body.hsc-spin #hsc-tools{display:none}
`;
  const ui = {
    el: {}, built: false,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const w = document.createElement('div'); w.id = 'hsc-tools'; w.hidden = true;
      w.innerHTML = '<button class="cur on" type="button" aria-label="Tools"></button><div class="fan" hidden></div>';
      document.body.appendChild(w);
      this.el = { w, cur: w.querySelector('.cur'), fan: w.querySelector('.fan') };
      this.el.cur.addEventListener('click', () => { this.el.fan.hidden = !this.el.fan.hidden; this.render(); });
      setInterval(() => this.tick(), 60);
    },
    render() {
      if (!this.built) return;
      const u = unlocked();
      this.el.w.hidden = u.length < 2;
      this.el.cur.innerHTML = ICON[tool];
      this.el.cur.setAttribute('aria-label', 'Tools');
      if (this.el.fan.hidden) return;
      this.el.fan.innerHTML = '';
      let sep = false;
      for (const k of u) {
        if (k === tool) continue;
        if (TOOLS[k].ritual && !sep) { sep = true; const d = document.createElement('div'); d.className = 'sep'; this.el.fan.appendChild(d); }
        const b = document.createElement('button'); b.type = 'button'; b.innerHTML = ICON[k]; b.setAttribute('aria-label', k);
        b.addEventListener('click', () => { HSC.setTool(k); this.el.fan.hidden = true; this.render(); });
        this.el.fan.appendChild(b);
      }
    },
    tick() {
      const n = unlocked().length;
      if (n !== this.n) { this.n = n; if (!unlocked().includes(tool)) HSC.setTool('clipper'); this.render(); }
      // a new customer starts with the clipper
      const g = G(), s = g && g.getState();
      if (s && s.jobId !== this.job) { this.job = s.jobId; if (tool !== 'clipper') HSC.setTool('clipper'); this.el.fan.hidden = true; this.render(); }
    },
  };
  const boot = () => {
    if (HSC.clipperGroup && G() && document.body && M() && M().data) { if (build(HSC.clipperGroup)) { ui.build(); show(); ui.render(); return; } }
    setTimeout(boot, 300);
  };
  boot();
})(globalThis.HSC || (globalThis.HSC = {}));
