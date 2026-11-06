// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved 5 November 2026): barber tools beside the clipper,
// unlocked by level. Each is modelled to scale in the clipper's own hand (the same transform, so placement and
// touch targeting are the clipper's) and cuts the way the real tool does, within the game's hair grid:
//
//   trimmer        level 3   narrow T-blade with a fixed 0.5 mm residual on every surface: line-ups, edges, the nape
//   scissors       level 6   no guard: they cut every hair crossing the blades at the blade height (3-16 mm,
//                            chosen on the scissors' own height arc)
//   straight razor level 9   very narrow; shaves only stubble of 2 mm or less, to the skin; longer hair is untouched
//   foil shaver    level 8   dry finishing: stubble of 1.5 mm or less, on dry skin, to 0.05 mm (beard only: the scalp
//                            stays on the frozen renderer's 0.5 mm floor, owner decision 5 November 2026)
//   beard trimmer  level 12  compact; its own guards (1, 2, 3, 4.5, 6 mm) apply to any hair it reaches
// One millimetre target per tool applies identically to scalp, beard and brow (TOOL-PHYSICS contract 4, 7.1);
// the clipper's own guards and behaviour are unchanged. The scalp stays on the frozen kernel below; beard, brow and
// every service go through the one reducer (effects.js), which owns the targets this file only displays.
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
    scissors: { level: 6, width: 0.46, cut: (u, g) => scalpLevel(SCISSOR_MM[g] != null ? SCISSOR_MM[g] : 6), gain: 0 },
    // the scalp is stored at 0.5 mm and above: nothing there is short enough to change under the razor
    razor: { level: 9, width: 0.2, cut: (u) => u, gain: 0 },
    beard: { level: 12, width: 0.4, cut: (u, g) => scalpLevel(FINE[g] != null ? FINE[g] : 3), hz: (g) => 150 - g * 6, gain: 0.55 },
    foil: { level: 8, width: 0.35, cut: (u) => u, hz: () => 205, gain: 0.5 },
  };
  // the stored scalp lengths (mm) and each tool's physical target
  const SCALP_MM = [0.5, 3, 6, 10, 13, 16];
  const SCISSOR_MM = HSC.effects.TOOLS.scissors.planes.map((q) => q / 100); // the scissors' blade heights
  // the longest stored scalp length that is not above a target (never leaves more than the tool's length)
  const scalpLevel = (mm) => { let l = 0; for (let i = 0; i < SCALP_MM.length; i++) if (SCALP_MM[i] <= mm + 1e-9) l = i; return l; };
  const ORDER = ['clipper', 'trimmer', 'scissors', 'razor', 'foil', 'beard'];
  let tool = 'clipper';
  // a Career home city's opening set, and the one tool a reviewed city may loan for its first job there (easy-tool
  // contract 9.2, anatomy contract section 6). Every city is provisional today: one neutral set, and no loan.
  const opening = { job: null, list: [] };
  function extras() {
    const g = G(), job = g ? g.getState().jobId : null;
    if (opening.job === job) return opening.list;
    opening.job = job; opening.list = [];
    try {
      const cr = HSC.careerRun, E = HSC.effects;
      if (HSC.modes && HSC.modes.current() === 'career' && cr && cr.ready() && HSC.career) {
        const city = HSC.career.position(cr.body().core).city, d = M().data;
        opening.list = E.starterFor(city);
        const lv = M().level(), mine = ORDER.filter((k) => lv >= TOOLS[k].level).concat(opening.list);
        const seen = (d.toolLoans && d.toolLoans.seen) || [], loan = E.loanFor(city, mine, seen);
        if (loan) { opening.list = opening.list.concat(loan); d.toolLoans = { seen: seen.concat(city).slice(-64) }; M().save(); }
      }
    } catch (e) { opening.list = []; }
    return opening.list;
  }
  const unlocked = () => { const lv = M() && M().data ? M().level() : 1, more = extras(); return ORDER.filter((k) => lv >= TOOLS[k].level || more.includes(k)); };

  // ---- cutting (patch19 and state.js) ----
  // rituals (turkish.js) join the tray; while one is in the hand nothing is cut and the motor is silent
  HSC.addTool = function (key, def, icon) { TOOLS[key] = Object.assign({ width: 0.01, gain: 0, ritual: true }, def); ICON[key] = icon; if (!ORDER.includes(key)) ORDER.push(key); };
  HSC.isRitual = () => !!TOOLS[tool].ritual;
  HSC.toolLevel = (u, g, c) => { const r = TOOLS[tool].ritual ? u : TOOLS[tool].cut ? TOOLS[tool].cut(u, g, c) : g; if (r < u) dirty.add(tool); return r; };
  // ---- which tools really changed hair during a job (career tool mastery: map logic section 4) ----
  // a tool counts once it shortens at least one cell; strokes are attributed to the job they were made in
  const used = { job: null, set: new Set() }, dirty = new Set();
  const flush = (job) => {
    if (job == null) return;
    if (used.job !== job) { used.job = job; used.set = new Set(); }
    for (const t of dirty) used.set.add(t);
    dirty.clear();
  };
  HSC.noteTool = (job) => { dirty.add(tool); flush(job); };
  HSC.toolsUsed = (job) => { const g = G(); flush(g ? g.getState().jobId : job); return used.job === job ? [...used.set] : []; };
  addEventListener('pointerup', () => { const g = G(); if (g && dirty.size) flush(g.getState().jobId); }, true);
  addEventListener('pointercancel', () => { const g = G(); if (g && dirty.size) flush(g.getState().jobId); }, true);
  HSC.bladeWidth = () => TOOLS[tool].width;
  HSC.toolHz = (g) => (TOOLS[tool].hz ? TOOLS[tool].hz(g) : 118 - Math.max(0, g) * 9);
  HSC.toolGain = () => (TOOLS[tool].gain == null ? 1 : TOOLS[tool].gain);
  const FINE = HSC.effects.TOOLS.beard.guards.map((q) => q / 100); // the beard trimmer's guards, mm
  // the reducer's setting index for the selector position (the same fallbacks the old targets used)
  HSC.toolSetting = (g) => (tool === 'beard' ? (FINE[g] != null ? g : 2) : tool === 'scissors' ? (SCISSOR_MM[g] != null ? g : 1) : g);
  const levelOfMm = (mm) => { const L = HSC.BEARD_MM; let best = 0; for (let i = 0; i < L.length; i++) if (Math.abs(L[i] - mm) < Math.abs(L[best] - mm)) best = i; return best; };
  // the tool's physical target in millimetres for a selector position (null: a ritual in hand, nothing cut)
  HSC.toolMm = (g) => {
    if (TOOLS[tool].ritual) return null;
    if (tool === 'trimmer') return 0.5;
    if (tool === 'razor' || tool === 'foil') return 0.05;
    if (tool === 'scissors') return SCISSOR_MM[g] != null ? SCISSOR_MM[g] : 6;
    if (tool === 'beard') return FINE[g] != null ? FINE[g] : 3;
    return HSC.GUARD_MM ? HSC.GUARD_MM[g] : null;
  };
  // the beard lengths the barber's owned (unlocked) tools can leave, without picking any of them up: the career
  // director offers only beard requests these can reach (director section 4: owned-tool feasibility)
  HSC.beardReach = () => {
    const out = new Set(), u = unlocked();
    for (const k of u) {
      if (TOOLS[k].ritual) continue;
      if (k === "clipper") { for (const l of Object.values(HSC.GUARD_LEVEL || {})) if (l != null) out.add(l); }
      else if (k === 'trimmer') out.add(levelOfMm(0.5));
      else if (k === 'scissors') for (const mm of SCISSOR_MM) out.add(levelOfMm(mm));
      else if (k === 'beard') for (const mm of FINE) out.add(levelOfMm(mm));
    }
    // the razor takes stubble of 2 mm or less to skin, so it reaches 0 once another tool can reach 2 mm
    if (u.includes('razor') && [...out].some((l) => HSC.BEARD_MM[l] <= 2)) out.add(0);
    if (u.includes('foil') && [...out].some((l) => HSC.BEARD_MM[l] <= 1.5)) out.add(0);
    return [...out].sort((a, b) => a - b);
  };
  HSC.toolSelector = () => (tool === 'scissors' ? SCISSOR_MM : tool === 'beard' ? FINE : tool === 'clipper' ? null : []);
  // the rest of this block is the path for a build without the reducer; on Android state.js goes through visit.js
  HSC.toolBeard = (g) => {
    if (TOOLS[tool].ritual) return HSC.BEARD_MM.length - 1;
    if (tool === 'razor' || tool === 'foil') return 0; // with toolBeardCell: only short stubble goes
    if (tool === 'clipper') return HSC.GUARD_LEVEL[g];
    return levelOfMm(HSC.toolMm(g));
  };
  // per beard cell: the razor's edge takes only short stubble; every other tool cuts to its target
  HSC.toolBeardCell = (cur, guard) => (tool === 'razor' ? (HSC.BEARD_MM[cur] <= 2 ? 0 : cur) : tool === 'foil' ? (HSC.BEARD_MM[cur] <= 1.5 ? 0 : cur) : guard);
  // a brow cell (2 full, 1 short, 0 shaved) under the tool: the same millimetre target as everywhere else
  HSC.toolBrow = (cur, g) => {
    if (TOOLS[tool].ritual) return cur;
    if (tool === 'razor') return cur <= 1 ? 0 : cur; // a full brow is too long for the razor's edge
    if (tool === 'foil') return cur;
    const mm = HSC.toolMm(g);
    if (mm == null) return cur;
    return Math.min(cur, mm < 1 ? 0 : mm < 5 ? 1 : 2);
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
    // the foil shaver: described once in toolart.js (hand model and tray picture)
    const fo = HSC.toolArtBuild ? HSC.toolArtBuild('foil', { Group, Mesh, Lathe, Box, Phys, V2 }) : null;
    for (const [k, g] of [['trimmer', tr], ['scissors', sc], ['razor', rz], ['beard', bt], ['foil', fo]]) { if (!g) continue; g.visible = false; group.add(g); models[k] = g; }
    return true;
  }
  function show() {
    for (const o of originals) o.layers.set(tool === 'clipper' ? 0 : 1);
    if (HSC.onTool) HSC.onTool(tool);
    for (const [k, g] of Object.entries(models)) g.visible = k === tool;
  }
  HSC.setTool = function (k) {
    if (!TOOLS[k] || !unlocked().includes(k)) return false;
    tool = k; show(); ui.render(); arc();
    // a ritual works by touch: the hand goes to cut mode (nothing is cut)
    try { if (TOOLS[k].ritual && G().getState().interactionMode !== 'cut') G().toggleClipper(); } catch (e) {}
    try { const g = G(); g && g.getState && navigator.vibrate && navigator.vibrate(10); } catch (e) {}
    return true;
  };
  HSC.tool = () => tool;

  // ---- the guard arc follows the tool in hand (owner-approved 5 November 2026; TOOL-PHYSICS contract 7.1) ----
  // clipper: its own guards, unchanged. Beard trimmer: its five fine guards in millimetres. Scissors have no guard:
  // the arc becomes their blade-height scale (3-16 mm). Trimmer, razor and the rituals have a fixed working edge or
  // cut nothing, so the arc is hidden. A visible number is never reinterpreted: the label, the spoken label and the
  // millimetre target always agree. Only the labels change; the engine's control, layout and input are untouched.
  const fmt = (mm) => (HSC.num ? HSC.num(mm) : String(mm));
  function arc() {
    const el = document.querySelector('.guard-arc');
    if (!el) return;
    const sel = HSC.toolSelector ? HSC.toolSelector() : null;
    const off = Array.isArray(sel) && !sel.length;
    el.classList.toggle('hsc-arc-off', off);
    el.classList.toggle('hsc-arc-mm', !!(sel && sel.length));
    const say = (node, key, args) => (HSC.setSpoken ? HSC.setSpoken(node, key, args) : node.setAttribute('aria-label', key));
    say(el, tool === 'scissors' ? 'arc_scissors' : tool === 'beard' ? 'arc_beard' : 'arc_clipper');
    el.querySelectorAll('.rung').forEach((b, i) => {
      if (!b.dataset.n) b.dataset.n = b.textContent;
      if (sel && sel.length) {
        b.textContent = fmt(sel[i]);
        say(b, 'a_mmv', { v: sel[i] });
      } else {
        if (b.textContent !== b.dataset.n) b.textContent = b.dataset.n;
        const g = +b.dataset.n;
        say(b, 'a_guard', { g, mm: HSC.GUARD_MM ? HSC.GUARD_MM[g] : g });
      }
    });
  }
  HSC.relabelArc = arc;
  addEventListener('hsc-language', arc);
  new MutationObserver(() => { const el = document.querySelector('.guard-arc'); if (el && !el.dataset.hscSeen) { el.dataset.hscSeen = '1'; arc(); } }).observe(document.documentElement, { childList: true, subtree: true });

  // ---- feel: the scissors open and close as you drag, each close a crisp snip (a crunchier shear when it is
  // cutting hair), with a light tap of vibration; the razor scrapes. The clipper keeps the game's own motor. ----
  const stats = { snips: 0, cuts: 0 };
  HSC.toolsDebug = () => Object.assign({ open: feel.open, phase: feel.phase }, stats); // QA
  let closes = 0;
  // one blade closure: the click is the mechanism; the shear is a result, only when the stroke really cut. A beard or
  // brow cut has its own record; the frozen scalp kernel's proof is its committed stroke count (cutting).
  function snip(cutting, strength) {
    stats.snips++; if (cutting) stats.cuts++;
    const A = HSC.audio;
    if (!A) return;
    closes++;
    A.mechanism('snipClick', ['scissors', closes, 'mech'], cutting);
    if (cutting) {
      A.effect({ toolId: 'scissors', changed: true, eventSequence: closes, hairCells: Math.round(40 * strength * strength), foamRemoved: 0, perFieldDeltas: {}, changedCount: 1, removedLengthQuanta: 0 });
      if (navigator.vibrate) try { navigator.vibrate(6); } catch (e) {}
    }
  }
  const ptr = { down: false, moved: 0, x: 0, y: 0, speed: 0 };
  addEventListener('pointerdown', (e) => { ptr.down = true; ptr.x = e.clientX; ptr.y = e.clientY; ptr.moved = performance.now(); }, true);
  addEventListener('pointermove', (e) => { if (!ptr.down) return; const now = performance.now(), d = Math.hypot(e.clientX - ptr.x, e.clientY - ptr.y); ptr.speed = 0.7 * ptr.speed + 0.3 * (d / Math.max(8, now - ptr.moved)) * 1000; ptr.x = e.clientX; ptr.y = e.clientY; ptr.moved = now; }, true);
  for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, () => { ptr.down = false; }, true);
  const feel = { phase: 0, open: 0.3, last: performance.now(), lastStroke: 0 };
  function animate() {
    const now = performance.now(), dt = Math.min(0.05, (now - feel.last) / 1000);
    feel.last = now;
    const g = G(), s = g && g.getState();
    if (!s || tool !== 'scissors') { if (s) feel.lastStroke = s.cutStrokeCount; return; }
    const inHand = !!(HSC.clipperGroup && HSC.clipperGroup.visible) && ptr.down && s.status === 'cutting';
    const moving = inHand && now - ptr.moved < 140;
    const cut = s.cutStrokeCount > feel.lastStroke;
    {
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
  // every tool shows a lit picture of its 3D model (toolart.js, shop3d.js), so the tray reads as one set; a device with
  // no spare WebGL context falls back to the drawn icon, then a plain outline
  const PLAIN = `<svg viewBox="0 0 24 24" width="30" height="30"><rect x="8" y="4" width="8" height="16" rx="3" fill="#d7dce0" stroke="${INK}" stroke-width="1.6"/></svg>`;
  const pics = {};
  function picture(k) {
    if (pics[k]) return pics[k];
    let url = '';
    try { url = HSC.shop3d && HSC.toolArtBuild ? HSC.shop3d.product((C) => HSC.toolArtBuild(k, C), 112) : ''; } catch (e) {}
    return url ? (pics[k] = `<img alt="" src="${url}" width="50" height="50">`) : ICON[k] || PLAIN;
  }
  // what the tray offers: everything owned in Quick Play; otherwise the cutters and the few tools useful right now
  function trayNow(u) {
    const E = HSC.effects, v = HSC.visit && HSC.visit.state(), g = G(), s = g && g.getState();
    const cutters = ORDER.filter((k) => !TOOLS[k].ritual);
    if (!E || !v || !s) return { cut: u.filter((k) => !TOOLS[k].ritual), care: u.filter((k) => TOOLS[k].ritual) };
    const p = s.look && s.look.person;
    let wanted = [];
    try { wanted = HSC.servicesWanted && p && !p.first ? HSC.servicesWanted(p, s.jobId).filter((k) => !v.done.includes(k)) : []; } catch (e) {}
    const cs = HSC.clippingsStats ? HSC.clippingsStats() : null;
    return E.trayFor({ mode: HSC.modes ? HSC.modes.current() : 'free', owned: u, cutters, state: v, wanted, pinned: HSC.visit.pinned(),
      ctx: { loose: cs ? cs.onShow - cs.swept : 0, cheekLine: !!(p && HSC.serviceFits && HSC.serviceFits(p, 'threading')) } });
  }
  HSC.trayNow = () => trayNow(unlocked()); // QA
  const CSS = `
.guard-arc.hsc-arc-off{visibility:hidden;pointer-events:none}
.guard-arc.hsc-arc-mm .rung{font-size:15px;letter-spacing:-.02em}
#hsc-tools{position:fixed;z-index:20;left:max(14px,env(safe-area-inset-left));bottom:max(18px,env(safe-area-inset-bottom));display:flex;flex-direction:column-reverse;gap:10px;zoom:var(--hsc-s,1)}
#hsc-tools button{width:60px;height:60px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer}
#hsc-tools button.on{background:#ffb627}
#hsc-tools button:active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
#hsc-tools .fan{display:grid;grid-template-columns:repeat(var(--cols,2),60px);grid-auto-flow:row;gap:10px;direction:ltr;overflow-y:auto;scrollbar-width:none;padding-bottom:3px}
#hsc-tools .fan .sep{grid-column:1/-1;height:3px;border-radius:2px;background:#10223f;opacity:.25}
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
      if (!this.el.w.hidden) this.el.cur.innerHTML = picture(tool);
      this.el.cur.setAttribute('aria-label', 'Tools');
      if (this.el.fan.hidden) return;
      this.el.fan.innerHTML = '';
      const todo = [], tray = trayNow(u), spoken = (b, k) => (HSC.setSpoken ? HSC.setSpoken(b, 'tool_' + k) : b.setAttribute('aria-label', k));
      const add = (k) => {
        const b = document.createElement('button'); b.type = 'button'; spoken(b, k);
        if (pics[k]) b.innerHTML = pics[k]; else todo.push([b, k]);
        b.addEventListener('click', () => { HSC.setTool(k); this.el.fan.hidden = true; this.render(); });
        this.el.fan.appendChild(b);
      };
      for (const k of tray.cut) if (k !== tool) add(k);
      const care = tray.care.filter((k) => k !== tool);
      if (care.length) { const d = document.createElement('div'); d.className = 'sep'; this.el.fan.appendChild(d); }
      for (const k of care) add(k);
      this.fit();
      // first opening: one picture a frame, so a phone never stalls on the whole tray at once
      const next = () => { const q = todo.shift(); if (!q) return; q[0].innerHTML = picture(q[1]); requestAnimationFrame(next); };
      next();
    },
    // the fan stays clear of the top bar and on screen: it gains columns on short screens, scrolling only as a last resort
    fit() {
      const fan = this.el.fan, z = parseFloat(getComputedStyle(this.el.w).getPropertyValue('--hsc-s')) || 1, CELL = 70;
      const sep = fan.querySelector('.sep'), kids = [...fan.children], cut = sep ? kids.indexOf(sep) : kids.length, care = kids.length - cut - (sep ? 1 : 0);
      const high = (innerHeight - 84) / z - 18 - CELL, wide = innerWidth / z - 28, most = Math.max(2, Math.floor((wide + 10) / CELL));
      let cols = 2;
      while (cols < most && Math.ceil(cut / cols) * CELL + Math.ceil(care / cols) * CELL + (sep ? 13 : 0) - 10 > high) cols++;
      fan.style.setProperty('--cols', String(cols));
      fan.style.maxHeight = Math.max(CELL, high) + 'px';
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
