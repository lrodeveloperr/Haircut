// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; plan Wave 4): the current customer's tool state, between the game and
// the pure reducer (effects.js). This file holds no physics: it builds a visit from the seated customer, sends
// every stroke through applyTool, and shows, sounds and saves what the record says.
//
//   the 0.05 mm level   the engine's beard stays on its saved level table (BEARD_MM, level 0 = skin): renumbering it
//                       would have to migrate every saved regular and career contract. The exact quanta live here;
//                       a razor or foil cell is level 0 on the engine's grid and 5 quanta in the visit.
//   save                one small record under its own key, written after strokes and on leaving the app. A record
//                       that does not match the seated customer, or fails its hash, is discarded whole.
//   undo                the state is immutable, so a snapshot is a reference: exact, including source units.
//   shader cue          the foam texture's spare channels (no new sampler): G irritation, B moisture, A sheen.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const G = () => globalThis.skinFadeStudio, M = () => HSC.meta, E = () => HSC.effects;
  const KEY = 'barber-visit-v1';
  const V = { s: null, job: null, seed: null, strokeId: 0, pump: 0, beardRef: null, browRef: null, last: null, timer: 0, loaded: false, saved: null, onAdopt: null };

  const qOfLevel = (l) => Math.round(HSC.BEARD_MM[l] * 100);
  const levelMap = new Map();
  const levelOfQ = (q) => {
    if (q <= 5) return 0; // the razor and foil residual: skin on the engine's grid
    if (!levelMap.size) HSC.BEARD_MM.forEach((mm, l) => levelMap.set(Math.round(mm * 100), l));
    const l = levelMap.get(q);
    if (l != null) return l;
    let best = 0;
    for (let i = 0; i < HSC.BEARD_MM.length; i++) if (qOfLevel(i) <= q) best = i;
    return best;
  };
  // protected cells: lips and nostril openings (anatomy contract section 7; safety masks follow the customer)
  function maskCells() {
    const mask = new Uint8Array(E().CELLS), D = HSC.debugState, P = D && D.beardCells && D.beardCells.positions;
    if (!P || !HSC.lipMask) return mask;
    for (let c = 0; c < mask.length; c++) {
      const x = P[c * 3], y = P[c * 3 + 1], z = P[c * 3 + 2];
      if (HSC.lipMask(x, y, z) > 0.5 || Math.hypot(Math.abs(x) - 0.21, y - 0.6, z - 2.36) < 0.13) mask[c] = 1;
    }
    return mask;
  }
  function build(s, earUnits) {
    const p = s.look && s.look.person, seed = p ? p.seed >>> 0 : 0;
    const len = Uint16Array.from(s.beard, qOfLevel);
    const brow = Array.isArray(s.brow) ? Uint16Array.from(s.brow, E().browQOf) : undefined;
    return E().fresh({
      job: s.jobId, customer: seed, seed, len, brow, mask: maskCells(), browStray: HSC.browStrayMask ? HSC.browStrayMask(seed) : undefined,
      nose: E().noseOf(seed, p ? p.years : 0), ear: E().earOf(seed, earUnits || 0),
    });
  }
  function matches(st, s) {
    if (!Array.isArray(s.beard)) return false;
    const L = st.f.len;
    for (let c = 0; c < L.length; c++) if (levelOfQ(L[c]) !== s.beard[c]) return false;
    if (Array.isArray(s.brow)) { const B = st.f.brow; for (let c = 0; c < B.length; c++) if (E().browLevelOf(B[c]) !== s.brow[c]) return false; }
    return true;
  }
  // a new customer in the chair
  function begin(s, earUnits) {
    V.earUnits = earUnits || 0;
    if (!Array.isArray(s.beard)) { V.s = null; return null; }
    V.job = s.jobId; V.seed = s.look && s.look.person ? s.look.person.seed >>> 0 : 0;
    V.s = build(s, V.earUnits); V.beardRef = s.beard; V.browRef = s.brow; V.pump = 0;
    adoptSaved(s);
    paintAll();
    return V.s;
  }
  function adoptSaved(s) {
    const r = V.saved;
    if (!r || r.job !== V.job || r.seed !== V.seed || !V.s || V.s.seq) return false;
    V.saved = null;
    const st = E().unpack(r.st);
    if (!st || !matches(st, s)) return false;
    V.s = st; V.pump = st.load.pump;
    paintAll();
    if (V.onAdopt) V.onAdopt();
    return true;
  }
  // the engine's grids moved without a stroke (a replay put the hair back): the visit starts again, and what was
  // proved complete stays complete so a replay never pays a service twice or loses it
  function sync(s) {
    if (!V.s || s.jobId !== V.job || !Array.isArray(s.beard)) return;
    if (s.beard === V.beardRef && s.brow === V.browRef) return;
    if (!matches(V.s, s)) {
      const keep = V.s;
      V.s = build(s, V.earUnits);
      V.s = Object.assign(V.s, { done: keep.done, steps: keep.steps, seq: keep.seq });
      paintAll();
    }
    V.beardRef = s.beard; V.browRef = s.brow;
  }

  // ---- the shader cue ----
  const byte = (v) => Math.min(255, Math.floor((v * 255) / 10000));
  function paintCell(F, f, c) {
    const o = c * 4;
    F[o] = byte(f.foam[c]);
    F[o + 1] = byte(Math.max(f.irr[c], f.stress[c] >> 1));
    F[o + 2] = byte(f.moist[c]);
    F[o + 3] = byte(Math.max(0, Math.max(f.shine[c] * 2, f.after[c] >> 1, f.oil[c] >> 1, f.balm[c] >> 1) - (f.alum[c] >> 1))); // alum leaves a matte finish
  }
  function paint(cells) {
    const F = HSC.foam && HSC.foam.data();
    if (!F || !V.s || !cells.length) return;
    for (const c of cells) paintCell(F, V.s.f, c);
    HSC.foam.update();
  }
  function paintAll() {
    const F = HSC.foam && HSC.foam.data();
    if (!F || !V.s) return;
    for (let c = 0; c < V.s.n; c++) paintCell(F, V.s.f, c);
    HSC.foam.update();
    if (HSC.onVisit) HSC.onVisit();
  }

  // ---- strokes ----
  function commit(st) {
    if (!V.s) return null;
    const stroke = Object.assign({ strokeId: V.strokeId }, st);
    const r = E().applyTool(V.s, stroke);
    if (r.effect.changed) {
      V.s = r.state; V.last = r.effect;
      paint(r.effect.cells);
      schedule();
      if (HSC.onVisit) HSC.onVisit(r.effect);
    }
    // the sound of a real change: the record, never the pointer (scissors keep their closing rhythm, tools.js)
    if (HSC.audio && st.tool !== 'scissors') HSC.audio.effect(r.effect);
    return r.effect;
  }
  addEventListener('pointerdown', () => { V.strokeId = (V.strokeId % 65000) + 1; }, true);
  const setting = (s) => (HSC.toolSetting ? HSC.toolSetting(s.selectedGuard) : s.selectedGuard);
  // a beard pass: the cells under the rendered blade, through the reducer; returns the engine's new level grid
  function cutBeard(s, cells) {
    if (!Array.isArray(s.beard)) return null;
    if (!V.s || s.jobId !== V.job) begin(s, V.earUnits);
    sync(s);
    const tool = HSC.tool ? HSC.tool() : 'clipper';
    const e = commit({ tool, surface: 'beard', cells, setting: setting(s), close: true });
    if (!e || !e.changed || !e.hairCells) return null;
    const L = V.s.f.len;
    let next = null, n = 0;
    for (const c of e.cells) { const lv = levelOfQ(L[c]); if (lv !== s.beard[c]) { next = next || s.beard.slice(); next[c] = lv; n++; } }
    if (!next) return null;
    V.beardRef = next;
    return { beard: next, changed: n, removedMm: e.removedLengthQuanta / 100 };
  }
  function cutBrow(s, cells) {
    if (!Array.isArray(s.brow)) return null;
    if (!V.s || s.jobId !== V.job) begin(s, V.earUnits);
    sync(s);
    const tool = HSC.tool ? HSC.tool() : 'clipper';
    const e = commit({ tool, surface: 'brow', cells, setting: setting(s), close: true });
    if (!e || !e.changed) return null;
    return browLevels(s);
  }
  // the renderer's view of the exact brow lengths
  function browLevels(s) {
    const B = V.s.f.brow, next = s.brow.slice();
    let n = 0;
    for (let c = 0; c < B.length; c++) { const lv = E().browLevelOf(B[c]); if (lv !== next[c]) { next[c] = lv; n++; } }
    if (!n) return null;
    V.browRef = next;
    return { brow: next, changed: n };
  }

  // ---- active-play fade: one tick a second, only while a customer is really being worked on ----
  setInterval(() => {
    const g = G();
    if (!V.s || !g || document.visibilityState !== 'visible') return;
    const s = g.getState();
    let paused = false;
    try { paused = g.getView().paused; } catch (e) {}
    if (paused || s.status !== 'cutting' || s.jobId !== V.job) return;
    const next = E().tick(V.s, 1000);
    if (next !== V.s) { V.s = next; paintAll(); }
  }, 1000);

  // ---- save ----
  const client = () => M() && M().client;
  function flush() {
    clearTimeout(V.timer); V.timer = 0;
    const c = client();
    if (!c || !c.saveProgress || !V.s) return;
    try { c.saveProgress(KEY, { job: V.job, seed: V.seed, st: E().pack(V.s) }).catch(() => {}); } catch (e) {}
  }
  function schedule() { if (!V.timer) V.timer = setTimeout(flush, 900); }
  addEventListener('pagehide', () => { if (V.timer) flush(); });
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && V.timer) flush(); });
  async function load() {
    if (V.loaded) return;
    const c = client();
    if (!c || !c.loadProgress) return;
    V.loaded = true;
    const r = await c.loadProgress(KEY, null).catch(() => null);
    if (r && r.st) { V.saved = r; const g = G(); if (g && V.s) adoptSaved(g.getState()); }
  }
  const boot = () => { if (client()) load(); else setTimeout(boot, 300); };
  boot();

  // ---- the tray's view of the visit ----
  function pinned() {
    // a normal job pins one lather source and one beard finish, from the customer's seed (never the location)
    const n = V.seed || 0;
    return { source: n & 1 ? 'shavingSoap' : 'shavingCream', finish: n & 2 ? 'beardBalm' : 'beardOil' };
  }

  HSC.visit = {
    state: () => V.s, begin, sync, commit, cutBeard, cutBrow, browLevels, paintAll, levelOfQ, pinned, flush,
    nextPump: () => ++V.pump, strokeId: () => V.strokeId, lastEffect: () => V.last,
    snapshot: () => V.s, restore(st) { if (!st || st.job !== V.job) return; V.s = st; V.beardRef = null; V.browRef = null; paintAll(); schedule(); },
    onAdopt(f) { V.onAdopt = f; },
    done: (job) => (V.s && V.job === job ? V.s.done.slice() : []), steps: (job) => (V.s && V.job === job ? V.s.steps.slice() : []),
  };
})(globalThis.HSC || (globalThis.HSC = {}));
