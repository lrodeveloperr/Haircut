// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; plan Wave 4): the one authoritative tool reducer
// (docs/TOOL-PHYSICS-AND-EFFECT-CONTRACT.md section 3.1, EASY-TOOL-LOGIC-AND-LOCATION-CONTRACT.md).
//
//   applyTool(state, stroke) -> { state, effect }
//
// Pure and DOM-free: integers only, no clock, no random. A stroke with no positive delta returns the same state
// object and a reason; a positive stroke returns a new state (copy on write, only the touched fields) and one
// immutable effect record. Sound, particles, the shader cue, completion and rewards read that record; nothing
// else may change hair, skin or product. The scalp keeps the frozen kernel (tools.js, patch19): this reducer owns
// the beard grid (hair and skin on the same 128x64 cells), the brow grid and the specialised hair bundles.
//
// Lengths are 0.01 mm quanta; every other field is basis points 0..10000 (direction -10000..10000).
//
// Rewards: only the nine existing paid services can reach servicesDone. New tools complete `steps`, which pay
// nothing until the owner approves a price (AGENTS.md; reported with Wave 4).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const RULESET = 1, BP = 10000, CELLS = 8192, BROW_CELLS = 4096;
  const U16 = ['len', 'wet', 'dry', 'cond', 'shine', 'hold', 'oil', 'balm', 'soap', 'cream', 'foam',
    'heat', 'moist', 'heatRem', 'moistRem', 'heatOrg', 'moistOrg', 'warmMs', 'irr', 'stress', 'soothe', 'fresh',
    'recent', 'cold', 'alum', 'after', 'razorAt', 'brow'];
  const I16 = ['dirX', 'dirY'];
  const FIELDS = U16.concat(I16), FI = Object.fromEntries(FIELDS.map((k, i) => [k, i]));
  const FOAM_VALID = 2400;        // a cell counts as lathered from here (the old 60 of 255)
  const HEAT_MS = 30000, MOIST_MS = 60000;
  const CLOSE_Q = 100;            // a beard cell left at 1 mm or less is skin-close (the shaved area)

  // ---- the immutable registry: one entry per tool or service, nothing duplicated in the model or the UI ----
  const SRC = 30000000; // a job's reservoir: covers every cell of the grid; misuse can still run it dry
  const TOOLS = {
    clipper: { kind: 'guard', guards: [50, 300, 600, 1000, 1300], group: 'cut' },
    beard: { kind: 'guard', guards: [100, 200, 300, 450, 600], group: 'cut' },
    trimmer: { kind: 'fixed', residualQ: 50, group: 'cut' },
    scissors: { kind: 'plane', planes: [300, 600, 1000, 1300, 1600], group: 'cut' },
    razor: { kind: 'razor', maxQ: 200, residualQ: 5, group: 'cut' },
    foil: { kind: 'foil', maxQ: 150, residualQ: 5, wetMax: 1000, group: 'cut' },
    spray: { kind: 'spray', deposit: 2500, source: SRC, group: 'prep' },
    towel: { kind: 'towel', fullMs: 3000, needBp: 6000, group: 'prep', paid: true },
    shavingSoap: { kind: 'soap', deposit: 2500, source: SRC, formulation: 'soap-1', group: 'prep' },
    shavingCream: { kind: 'cream', dose: 3000000, source: SRC, formulation: 'cream-1', group: 'prep' },
    lather: { kind: 'brush', agitate: 4000, milestoneBp: 6000, removeBp: 7000, group: 'prep', paid: true },
    beardOil: { kind: 'oil', deposit: 2500, source: SRC, needBp: 7000, group: 'finish' },
    beardBalm: { kind: 'balm', deposit: 2500, source: SRC, needBp: 7000, wetMax: 3000, holdGain: 2500, group: 'finish' },
    coldTowel: { kind: 'cold', deposit: 3000, source: SRC, needBp: 6000, dropBp: 2000, group: 'finish' },
    alum: { kind: 'alum', deposit: 2500, source: SRC, needBp: 6000, moistMin: 500, moistMax: 6000, group: 'finish' },
    aftershave: { kind: 'aftershave', deposit: 10000, needBp: 6000, group: 'finish', paid: true },
    massage: { kind: 'massage', fullMs: 2200, zoneMs: 500, group: 'care', paid: true },
    talc: { kind: 'talc', needBp: 7000, group: 'finish', paid: true },
    pomade: { kind: 'cover', needBp: 5000, group: 'finish', paid: true },
    threading: { kind: 'thread', needBp: 8000, group: 'detail', paid: true },
    singe: { kind: 'singe', rateQ: 500, needBp: 9000, group: 'detail', paid: true },
    nose: { kind: 'nose', needBp: 9000, group: 'detail', paid: true },
  };
  // versioned lather chemistry: the formulation, not the tool, defines the ratio (easy contract 5.2)
  const FORMULA = {
    'soap-1': { hydrationMin: 1000, hydrationMax: 10000, conversion: 200 },
    'cream-1': { hydrationMin: 0, hydrationMax: 10000, conversion: 170 },
  };
  const BRUSH_HYDRATION = 2000;   // a wet brush carries at least this much hydration to the cell
  const BRUSH_WATER = 30000000;
  // Hair-bearing anatomy (anatomy contract section 1). Eyelashes are protected: no tool may list them.
  const ANATOMY = {
    beard: { state: 'len', tools: ['clipper', 'beard', 'trimmer', 'scissors', 'razor', 'foil'] },
    brow: { state: 'brow', tools: ['clipper', 'beard', 'trimmer', 'scissors', 'razor', 'threading'] },
    strays: { state: 'len+brow', tools: ['threading'] },
    nose: { state: 'nose', tools: ['nose'] },
    ear: { state: 'ear', tools: ['singe'] },
    debris: { state: 'clippings', tools: ['talc'] },
    eyelash: { state: null, tools: [], protected: true },
  };

  // ---- deterministic helpers ----
  const rng = (seed) => { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const mix = (fi, c, v) => { if (!v) return 0; let h = Math.imul(Math.imul(fi + 1, 0x9e3779b1) ^ c, 0x85ebca6b) ^ Math.imul(v, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); return (h ^ (h >>> 16)) >>> 0; };
  const bpOf = (n, d) => (d > 0 ? Math.floor((BP * n) / d) : 0);
  const trunc = (x) => (x < 0 ? Math.ceil(x) : Math.floor(x));
  const moveToward = (v, target, p) => { const t = Math.min(p, BP); return Math.max(-BP, Math.min(BP, v + trunc(((target - v) * t) / BP))); };

  // legacy levels to quanta, once, on the way in (physics contract section 2)
  const browQOf = (lv) => (lv >= 2 ? 600 : lv === 1 ? 200 : 0);
  const browLevelOf = (q) => (q >= 500 ? 2 : q >= 100 ? 1 : 0); // the renderer's view; the saved length stays exact

  // ---- stable per-customer anatomy (age only; never heritage or city: customer invariants section 3) ----
  function noseOf(seed, years) {
    const R = rng(((seed >>> 0) ^ 0x4e05e) >>> 0);
    const potential = Math.floor(BP * Math.min(0.8, 0.12 + smooth(28, 70, years || 0) * 0.68));
    const has = R() * BP < potential, per = has ? 5 + Math.floor(R() * 4) : 0;
    const rim = [], len = [], side = [];
    for (const sd of [0, 1]) for (let i = 0; i < per; i++) {
      const r = 300 + Math.floor(R() * 200);                    // root to the aperture plane: 3-5 mm, protective
      const out = R() < 0.72 ? 80 + Math.floor(R() * (120 + 320 * smooth(40, 80, years))) : 0; // protrusion
      rim.push(r); len.push(r + out); side.push(sd);
    }
    return { potential, rim: Uint16Array.from(rim), len: Uint16Array.from(len), side: Uint8Array.from(side) };
  }
  // the ear's bundles from the customer's ear-hair length (services.js earHairOf, in head units of about 45 mm)
  function earOf(seed, lengthUnits) {
    const R = rng(((seed >>> 0) ^ 0xea7b) >>> 0), per = lengthUnits > 0 ? 8 : 0, len = [], side = [];
    for (const sd of [0, 1]) for (let i = 0; i < per; i++) { len.push(Math.floor(lengthUnits * 4500 * (0.55 + 0.9 * R()))); side.push(sd); }
    return { len: Uint16Array.from(len), side: Uint8Array.from(side) };
  }

  // ---- state ----
  function hashFields(f) { let h = 0; for (const k of FIELDS) { const a = f[k], fi = FI[k]; for (let c = 0; c < a.length; c++) if (a[c]) h = (h + mix(fi, c, a[c])) >>> 0; } return h; }
  function hashRest(s) {
    let h = 2166136261;
    const eat = (v) => { h = Math.imul(h ^ (v | 0), 16777619); };
    for (const a of [s.nose.len, s.ear.len]) { eat(a.length); for (let i = 0; i < a.length; i++) eat(a[i]); }
    for (const k of Object.keys(s.src).sort()) eat(s.src[k]);
    eat(s.load.water); eat(s.load.cream); eat(s.load.pump); eat(s.relax); eat(s.zones.L); eat(s.zones.R); eat(s.zones.C); eat(s.zones.all);
    eat(s.foamCells); eat(s.foamPeak); eat(s.shaved);
    for (const k of Object.keys(s.att).sort()) { const a = s.att[k]; eat(a.n); eat(a.removed); eat(a.ms); eat(a.base); eat(a.flag); }
    for (const k of s.done) for (let i = 0; i < k.length; i++) eat(k.charCodeAt(i));
    for (const k of s.steps) for (let i = 0; i < k.length; i++) eat(k.charCodeAt(i));
    return h >>> 0;
  }
  const hash = (s) => (((s.fh ^ hashRest(s)) >>> 0).toString(36));

  // o: { job, customer, seed, cells, browCells, len, brow, mask, browStray, nose, ear }
  function fresh(o = {}) {
    const n = o.cells || CELLS, bn = o.browCells || BROW_CELLS, f = {};
    for (const k of U16) f[k] = new Uint16Array(k === 'brow' ? bn : n);
    for (const k of I16) f[k] = new Int16Array(n);
    if (o.len) f.len.set(o.len);
    if (o.brow) f.brow.set(o.brow);
    f.fresh.fill(BP);
    // the walk-in condition of the beard: a little dry and unruly, from the customer's seed
    for (let c = 0; c < n; c++) if (f.len[c]) {
      const m = mix(31, c, (o.seed | 0) + 1);
      f.dry[c] = 1500 + (m % 3000);
      f.dirX[c] = ((m >>> 12) % 7001) - 3500;
      f.dirY[c] = 6000 + ((m >>> 20) % 3000);
    }
    const src = {};
    for (const [k, d] of Object.entries(TOOLS)) if (d.source) src[k] = o.source != null ? o.source : d.source;
    const s = {
      rules: RULESET, job: o.job || 0, customer: o.customer || 0, n, bn, f,
      mask: o.mask || new Uint8Array(n), browStray: o.browStray || new Uint8Array(bn),
      nose: o.nose || { potential: 0, rim: new Uint16Array(0), len: new Uint16Array(0), side: new Uint8Array(0) },
      ear: o.ear || { len: new Uint16Array(0), side: new Uint8Array(0) },
      src, load: { water: o.water != null ? o.water : BRUSH_WATER, cream: 0, pump: 0 },
      relax: 0, zones: { L: 0, R: 0, C: 0, all: 0 }, att: {}, done: [], steps: [], foamCells: 0, foamPeak: 0, shaved: 0, seq: 0, fh: 0,
    };
    s.fh = hashFields(f);
    return s;
  }

  // ---- a transaction: nothing is written to the before state; failure leaves it untouched ----
  class Tx {
    constructor(s, st) { this.s = s; this.st = st; this.f = {}; this.fh = s.fh; this.d = {}; this.cells = new Set(); this.touched = 0; this.removedQ = 0; this.hairCells = 0; this.rest = null; this.done = null; this.eligible = 0; this.sourceTool = null; this.srcBefore = 0; this.bundles = 0; }
    get(k) { return (this.f[k] || this.s.f[k]); }
    w(k) { return this.f[k] || (this.f[k] = this.s.f[k].slice()); }
    set(k, c, v) {
      const a = this.w(k), old = a[c];
      if (old === v) return 0;
      a[c] = v;
      const fi = FI[k];
      this.fh = (this.fh - mix(fi, c, old) + mix(fi, c, v)) >>> 0;
      this.d[k] = (this.d[k] || 0) + (v - old);
      if (k !== 'brow') this.cells.add(c);
      return v - old;
    }
    // scalars and bundles change through a copied shell
    r() { if (this.rest) return this.rest; const s = this.s; this.rest = { src: Object.assign({}, s.src), load: Object.assign({}, s.load), zones: Object.assign({}, s.zones), att: Object.assign({}, s.att), relax: s.relax, foamCells: s.foamCells, foamPeak: s.foamPeak, shaved: s.shaved, done: s.done, steps: s.steps, nose: s.nose, ear: s.ear }; return this.rest; }
    v(k) { return this.rest ? this.rest[k] : this.s[k]; }
    setFoam(c, v) {
      const old = this.get('foam')[c];
      if (old === v) return;
      const r = this.r();
      if (old < FOAM_VALID && v >= FOAM_VALID) r.foamCells++;
      else if (old >= FOAM_VALID && v < FOAM_VALID) r.foamCells--;
      if (r.foamCells > r.foamPeak) r.foamPeak = r.foamCells;
      this.set('foam', c, v);
    }
    // the attempt of a service: its frozen eligible set, covered once per id, in basis points of that set
    att(id, makeElig, base = 0) {
      const r = this.r();
      let a = r.att[id];
      if (!a) {
        const e = makeElig();
        if (!e || !e.length) return null;
        a = { elig: Uint32Array.from(e), cov: new Uint8Array(e.length), n: 0, removed: 0, ms: 0, base, flag: 0, own: this };
        r.att[id] = a;
      } else if (a.own !== this) { a = Object.assign({}, a, { cov: a.cov.slice(), own: this }); r.att[id] = a; }
      return a;
    }
  }
  const indexIn = (a, id) => { let lo = 0, hi = a.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1, v = a[m]; if (v === id) return m; if (v < id) lo = m + 1; else hi = m - 1; } return -1; };
  const cover = (a, id) => { const i = indexIn(a.elig, id); if (i < 0 || a.cov[i]) return false; a.cov[i] = 1; a.n++; return true; };
  const completeService = (t, id) => { const r = t.r(); if (!r.done.includes(id)) { r.done = r.done.concat(id).sort(); t.done = id; } };
  const completeStep = (t, id) => { const r = t.r(); if (!r.steps.includes(id)) { r.steps = r.steps.concat(id).sort(); t.step = id; } };
  const finishOf = (t, id, spec) => (spec.paid ? completeService(t, id) : completeStep(t, id));

  // contacted cells: ascending, unique, in range; protected cells are dropped before anything else
  function contact(t, st, n, mask) {
    const list = Array.isArray(st.cells) || ArrayBuffer.isView(st.cells) ? st.cells : [], w = st.weights, seen = new Map();
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      if (!Number.isInteger(c) || c < 0 || c >= n) continue;
      if (mask && mask[c]) { t.masked = (t.masked || 0) + 1; continue; }
      const wi = w ? Math.max(0, Math.min(BP, w[i] | 0)) : BP;
      if (!seen.has(c) || seen.get(c) < wi) seen.set(c, wi);
    }
    const ids = [...seen.keys()].sort((a, b) => a - b);
    return { ids, w: ids.map((c) => seen.get(c)) };
  }
  // finite transfer (easy contract 2.1): wanted per cell, apportioned exactly when the source cannot meet it all
  function allocate(wanted, remaining) {
    let sum = 0;
    for (let i = 0; i < wanted.length; i++) sum += wanted[i];
    if (sum <= remaining) return wanted.slice();
    const out = new Array(wanted.length);
    let given = 0;
    for (let i = 0; i < wanted.length; i++) { out[i] = Math.floor((wanted[i] * remaining) / sum); given += out[i]; }
    let left = remaining - given;
    while (left > 0) {
      let moved = false;
      for (let i = 0; i < wanted.length && left > 0; i++) if (out[i] < wanted[i]) { out[i]++; left--; moved = true; }
      if (!moved) break;
    }
    return out;
  }
  function draw(t, id, sum) { const r = t.r(); t.sourceTool = id; t.srcBefore = r.src[id]; r.src[id] -= sum; }
  // the freshness of one shaved cell (physics contract 4.4)
  function refresh(t, c) {
    const stress = t.get('stress')[c], cap = BP - Math.floor(stress / 2);
    t.set('fresh', c, Math.min(cap, Math.max(0, BP - t.get('irr')[c] + Math.floor(t.get('soothe')[c] / 2))));
  }
  function wetTo(t, c, add) { // moisture that fades in active play; a new dose restarts its fade
    const m = t.get('moist')[c], after = Math.min(BP, m + add), got = after - m;
    if (!got) return 0;
    t.set('moist', c, after);
    const rem = Math.min(BP, t.get('moistRem')[c] + got);
    t.set('moistRem', c, rem); t.set('moistOrg', c, rem); t.set('heatOrg', c, t.get('heatRem')[c]); t.set('warmMs', c, 0);
    return got;
  }
  function warmTo(t, c, add) {
    const h = t.get('heat')[c], after = Math.min(BP, h + add), got = after - h;
    if (!got) return 0;
    t.set('heat', c, after);
    const rem = Math.min(BP, t.get('heatRem')[c] + got);
    t.set('heatRem', c, rem); t.set('heatOrg', c, rem); t.set('moistOrg', c, t.get('moistRem')[c]); t.set('warmMs', c, 0);
    return got;
  }
  // the frozen list of cells that hold hair (the area of a beard-care request)
  const hairCells = (t) => { const L = t.get('len'), M = t.s.mask, e = []; for (let c = 0; c < L.length; c++) if (L[c] && !M[c]) e.push(c); return e; };
  const shavedList = (t) => { const R = t.get('recent'), M = t.s.mask, e = []; for (let c = 0; c < R.length; c++) if (R[c] && !M[c]) e.push(c); return e; };
  const lengthAfterCut = (t, c, to) => {
    const L = t.get('len')[c];
    if (L <= to) return 0;
    t.set('len', c, to); t.removedQ += L - to; t.hairCells++;
    if (to <= CLOSE_Q) { if (!t.get('recent')[c]) t.r().shaved++; t.set('recent', c, BP); refresh(t, c); }
    return L - to;
  };

  // ---- the effect kinds ----
  const KIND = {
    guard(t, spec, st) { const to = spec.guards[st.setting]; if (to == null) return 'invalid'; return cut(t, st, () => to); },
    fixed(t, spec, st) { return cut(t, st, () => spec.residualQ); },
    plane(t, spec, st) { if (!st.close) return 'open'; const to = spec.planes[st.setting]; if (to == null) return 'invalid'; return cut(t, st, () => to); },
    razor(t, spec, st) {
      if (st.surface === 'brow') return cut(t, st, (L) => (L <= spec.maxQ ? 0 : L), 'long');
      const { ids } = contact(t, st, t.s.n, t.s.mask);
      if (!ids.length) return t.masked ? 'masked' : 'air';
      t.eligible = ids.length;
      const stroke = (st.strokeId | 0) & 0xffff;
      let long = 0, foamGone = 0;
      for (const c of ids) {
        const L = t.get('len')[c];
        if (L > spec.maxQ) { long++; continue; }
        // calculated from the state before the lather is removed
        const lather = t.get('foam')[c];
        if (!stroke || t.get('razorAt')[c] !== stroke) {
          t.set('razorAt', c, stroke);
          const soft = Math.floor((t.get('heat')[c] + t.get('moist')[c]) / 2);
          const delta = Math.ceil(((BP - Math.min(BP, lather)) * (15000 - soft)) / 120000);
          if (delta) {
            t.set('stress', c, Math.min(BP, t.get('stress')[c] + delta));
            t.set('irr', c, Math.min(BP, t.get('irr')[c] + Math.floor(delta / 2)));
          }
        }
        if (lather) { t.setFoam(c, 0); foamGone++; }
        lengthAfterCut(t, c, spec.residualQ);
        if (t.get('recent')[c]) refresh(t, c);
      }
      t.foamGone = foamGone;
      const a = t.v('att').lather;
      if (a && t.removedQ > 0) { const b = t.att('lather'); b.removed += t.removedQ; }
      const l = t.v('att').lather, cur = t.v('foamCells'), peak = t.v('foamPeak');
      if (l && l.flag && l.removed > 0 && peak > 0 && (peak - cur) * BP >= TOOLS.lather.removeBp * peak) completeService(t, 'lather');
      return long ? 'long' : 'already';
    },
    foil(t, spec, st) {
      if (st.surface === 'brow') return 'long';
      const { ids } = contact(t, st, t.s.n, t.s.mask);
      if (!ids.length) return t.masked ? 'masked' : 'air';
      t.eligible = ids.length;
      let long = 0, wet = 0;
      for (const c of ids) {
        const L = t.get('len')[c];
        if (L > spec.maxQ) { long++; continue; }
        if (t.get('moist')[c] >= spec.wetMax || t.get('wet')[c] >= spec.wetMax) { wet++; continue; }
        lengthAfterCut(t, c, spec.residualQ);
      }
      return wet ? 'wet' : long ? 'long' : 'already';
    },
    spray(t, spec, st) {
      const { ids, w } = contact(t, st, t.s.n, t.s.mask);
      if (!ids.length) return t.masked ? 'masked' : 'air';
      const left = t.v('src').spray;
      if (left <= 0) return 'empty';
      const wet = t.get('wet'), wanted = ids.map((c, i) => Math.floor((Math.floor((spec.deposit * (BP - wet[c])) / BP) * w[i]) / BP));
      const p = allocate(wanted, left);
      let sum = 0;
      ids.forEach((c, i) => { if (!p[i]) return; sum += p[i]; t.set('wet', c, Math.min(BP, wet[c] + p[i])); wetTo(t, c, p[i]); });
      if (!sum) return 'full';
      draw(t, 'spray', sum);
      return null;
    },
    towel(t, spec, st) {
      const ms = Math.max(0, st.ms | 0);
      const { ids } = contact(t, st, t.s.n, t.s.mask);
      if (!ids.length || !ms) return 'air';
      const a = t.att('towel', () => ids.slice());
      const dose = Math.min(BP, Math.floor((BP * ms) / spec.fullMs));
      let any = 0;
      for (const c of ids) { const got = warmTo(t, c, dose) + wetTo(t, c, dose); if (got) { any++; cover(a, c); } }
      if (!any) return 'full';
      a.ms += ms;
      if (a.ms >= spec.fullMs && bpOf(a.n, a.elig.length) >= spec.needBp) completeService(t, 'towel');
      return null;
    },
    soap(t, spec, st) {
      const { ids, w } = contact(t, st, t.s.n, t.s.mask);
      if (!ids.length) return t.masked ? 'masked' : 'air';
      const left = t.v('src').shavingSoap;
      if (left <= 0) return 'empty';
      const F = FORMULA[spec.formulation], soap = t.get('soap'), moist = t.get('moist');
      const wanted = ids.map((c, i) => (moist[c] >= F.hydrationMin ? Math.min(Math.floor((spec.deposit * w[i]) / BP), BP - soap[c]) : 0));
      if (!wanted.some(Boolean)) return wanted.length && ids.every((c) => moist[c] < F.hydrationMin) ? 'dry' : 'full';
      const p = allocate(wanted, left);
      let sum = 0;
      ids.forEach((c, i) => { if (p[i]) { sum += p[i]; t.set('soap', c, soap[c] + p[i]); } });
      if (!sum) return 'full';
      draw(t, 'shavingSoap', sum);
      completeStep(t, 'shavingSoap');
      return null;
    },
    cream(t, spec, st) {
      // one complete actuation is one dose; holding past the detent repeats nothing until the pump returns
      if (!st.pump) return 'partial';
      const id = st.pump | 0;
      if (id <= t.v('load').pump) return 'held';
      const left = t.v('src').shavingCream;
      if (left <= 0) return 'empty';
      const dose = Math.min(spec.dose, left), r = t.r();
      r.load.pump = id; r.load.cream += dose;
      t.d.loadCream = dose; t.bundles = 1;
      draw(t, 'shavingCream', dose);
      completeStep(t, 'shavingCream');
      return null;
    },
    brush(t, spec, st) {
      const { ids, w } = contact(t, st, t.s.n, t.s.mask);
      if (!ids.length) return t.masked ? 'masked' : 'air';
      const a0 = t.v('load');
      const soap = t.get('soap'), cream = t.get('cream');
      const film = ids.some((c) => soap[c] > 0 || cream[c] > 0);
      if (a0.cream <= 0 && !film) return 'empty';
      if (a0.water <= 0) return 'dry';
      // the brush lays its cream down first, from its real load
      if (a0.cream > 0) {
        const wanted = ids.map((c, i) => Math.min(Math.floor((spec.agitate * w[i]) / BP), BP - cream[c]));
        const p = allocate(wanted, a0.cream);
        let sum = 0;
        ids.forEach((c, i) => { if (p[i]) { sum += p[i]; t.set('cream', c, t.get('cream')[c] + p[i]); } });
        if (sum) t.r().load.cream -= sum;
      }
      const a = t.att('lather', () => hairCells(t));
      let made = 0;
      for (let i = 0; i < ids.length; i++) {
        const c = ids[i], s0 = t.get('soap')[c], c0 = t.get('cream')[c];
        if (!(s0 + c0)) continue;
        const F = FORMULA[s0 >= c0 ? 'soap-1' : 'cream-1'], h = Math.max(t.get('moist')[c], BRUSH_HYDRATION);
        if (h < F.hydrationMin || h > F.hydrationMax) continue;
        const water = t.v('load').water;
        if (water <= 0) break;
        const work = Math.min(s0 + c0, Math.floor((spec.agitate * w[i]) / BP));
        if (!work) continue;
        const room = BP - t.get('foam')[c], foamAdd = Math.min(room, Math.floor((work * F.conversion) / 100));
        if (!foamAdd) continue;
        const used = Math.min(s0 + c0, Math.ceil((foamAdd * 100) / F.conversion)), fromSoap = Math.min(s0, used);
        t.set('soap', c, s0 - fromSoap); t.set('cream', c, c0 - (used - fromSoap));
        t.setFoam(c, t.get('foam')[c] + foamAdd);
        t.r().load.water = Math.max(0, water - Math.ceil(used / 4));
        wetTo(t, c, Math.floor(used / 5));
        made += foamAdd;
        if (a && t.get('foam')[c] >= FOAM_VALID) cover(a, c);
      }
      t.foamMade = made;
      if (a && !a.flag && bpOf(a.n, a.elig.length) >= spec.milestoneBp) { a.flag = 1; completeStep(t, 'latherReady'); }
      return made ? null : 'full';
    },
    oil(t, spec, st) { return care(t, spec, st, 'beardOil', 'oil', () => true, (c, o) => {
      t.set('oil', c, Math.min(BP, t.get('oil')[c] + o));
      t.set('cond', c, Math.min(BP, t.get('cond')[c] + Math.floor((4 * o) / 5)));
      t.set('dry', c, Math.max(0, t.get('dry')[c] - Math.floor((7 * o) / 10)));
      t.set('shine', c, Math.min(BP, t.get('shine')[c] + Math.floor(o / 4)));
    }, (a) => a.n > 0 && bpOf(a.n, a.elig.length) >= spec.needBp); },
    balm(t, spec, st) {
      const tx = st.dirX == null ? 0 : st.dirX | 0, ty = st.dirY == null ? BP : st.dirY | 0;
      const err = (c) => Math.abs(t.get('dirX')[c] - tx) + Math.abs(t.get('dirY')[c] - ty);
      return care(t, spec, st, 'beardBalm', 'balm', (c) => t.get('wet')[c] <= spec.wetMax, (c, b) => {
        t.set('balm', c, Math.min(BP, t.get('balm')[c] + b));
        t.set('cond', c, Math.min(BP, t.get('cond')[c] + Math.floor(b / 2)));
        t.set('hold', c, Math.min(BP, t.get('hold')[c] + Math.floor((3 * b) / 5)));
        t.set('shine', c, Math.min(BP, t.get('shine')[c] + Math.floor(b / 5)));
        t.set('dirX', c, moveToward(t.get('dirX')[c], tx, b));
        t.set('dirY', c, moveToward(t.get('dirY')[c], ty, b));
      }, (a) => {
        if (bpOf(a.n, a.elig.length) < spec.needBp) return false;
        let hold = 0, e = 0;
        for (let i = 0; i < a.elig.length; i++) { hold += t.get('hold')[a.elig[i]]; e += err(a.elig[i]); }
        return Math.floor(hold / a.elig.length) >= spec.holdGain && e < a.base;
      }, (e) => { let b = 0; for (const c of e) b += err(c); return b; });
    },
    cold(t, spec, st) {
      const { ids, w } = contact(t, st, t.s.n, t.s.mask);
      if (!ids.length) return t.masked ? 'masked' : 'air';
      if (!t.v('shaved')) return 'notShaved';
      const left = t.v('src').coldTowel;
      if (left <= 0) return 'empty';
      const heat = t.get('heat'), irr = t.get('irr'), foam = t.get('foam'), cold = t.get('cold');
      const a = t.att('coldTowel', () => { const e = []; for (let c = 0; c < heat.length; c++) if ((heat[c] || irr[c]) && !t.s.mask[c]) e.push(c); return e; }, (() => { let b = 0; for (let c = 0; c < heat.length; c++) if (!t.s.mask[c]) b += heat[c] + irr[c]; return b; })());
      if (!a) return 'notCoolable';
      const wanted = ids.map((c, i) => (foam[c] ? 0 : Math.min(Math.floor((spec.deposit * w[i]) / BP), BP - cold[c], Math.max(heat[c], irr[c] * 4))));
      const p = allocate(wanted, left);
      let sum = 0;
      ids.forEach((c, i) => {
        const d = p[i]; if (!d) return;
        sum += d;
        const hAfter = Math.max(0, heat[c] - d), lost = heat[c] - hAfter;
        t.set('heat', c, hAfter);
        t.set('heatRem', c, Math.max(0, t.get('heatRem')[c] - lost));
        t.set('irr', c, Math.max(0, irr[c] - Math.floor(d / 4)));
        t.set('soothe', c, Math.min(BP, t.get('soothe')[c] + Math.floor(d / 4)));
        t.set('moist', c, Math.min(BP, t.get('moist')[c] + Math.floor(d / 5)));
        t.set('cold', c, Math.min(BP, cold[c] + d));
        if (t.get('recent')[c]) refresh(t, c);
        cover(a, c);
      });
      if (!sum) return 'notCoolable';
      draw(t, 'coldTowel', sum);
      let now = 0;
      const H = t.get('heat'), I = t.get('irr');
      for (let c = 0; c < H.length; c++) if (!t.s.mask[c]) now += H[c] + I[c];
      if (bpOf(a.n, a.elig.length) >= spec.needBp && (a.base - now) * BP >= spec.dropBp * a.base) completeStep(t, 'coldTowel');
      return null;
    },
    alum(t, spec, st) {
      const { ids, w } = contact(t, st, t.s.n, t.s.mask);
      if (!ids.length) return t.masked ? 'masked' : 'air';
      if (t.v('src').alum <= 0) return 'empty';
      const recent = t.get('recent'), foam = t.get('foam'), moist = t.get('moist'), alum = t.get('alum');
      let why = null;
      const wanted = ids.map((c, i) => {
        if (!recent[c]) { why = why || 'notShaved'; return 0; }
        if (foam[c]) { why = 'foam'; return 0; }
        if (moist[c] < spec.moistMin || moist[c] > spec.moistMax) { why = why === 'foam' ? why : 'moisture'; return 0; }
        return Math.min(Math.floor((spec.deposit * w[i]) / BP), BP - alum[c]);
      });
      if (!wanted.some(Boolean)) return why || 'full';
      const a = t.att('alum', () => shavedList(t));
      const p = allocate(wanted, t.v('src').alum);
      let sum = 0;
      ids.forEach((c, i) => {
        const d = p[i]; if (!d) return;
        sum += d;
        t.set('alum', c, Math.min(BP, alum[c] + d));
        t.set('irr', c, Math.max(0, t.get('irr')[c] - Math.floor(d / 10)));
        t.set('soothe', c, Math.min(BP, t.get('soothe')[c] + Math.floor(d / 10)));
        refresh(t, c);
        if (a) cover(a, c);
      });
      if (!sum) return 'empty';
      draw(t, 'alum', sum);
      if (a && bpOf(a.n, a.elig.length) >= spec.needBp) completeStep(t, 'alum');
      return null;
    },
    aftershave(t, spec, st) {
      const { ids, w } = contact(t, st, t.s.n, t.s.mask);
      if (!ids.length) return t.masked ? 'masked' : 'air';
      const a = t.att('aftershave', () => shavedList(t));
      if (!a) return 'notShaved';
      const recent = t.get('recent'), foam = t.get('foam');
      let any = 0;
      ids.forEach((c, i) => {
        if (!recent[c] || foam[c]) return;
        const cur = t.get('after')[c], d = Math.min(Math.floor((spec.deposit * w[i]) / BP), BP - cur);
        if (!d) return;
        any++;
        t.set('after', c, cur + d);
        t.set('irr', c, Math.max(0, t.get('irr')[c] - Math.floor(d / 10)));
        t.set('soothe', c, Math.min(BP, t.get('soothe')[c] + Math.floor(d / 5)));
        refresh(t, c);
        cover(a, c);
      });
      if (!any) return 'full';
      if (bpOf(a.n, a.elig.length) >= spec.needBp) completeService(t, 'aftershave');
      return null;
    },
    massage(t, spec, st) {
      const ms = Math.max(0, st.ms | 0);
      if (!ms || !st.moved) return 'still'; // kneading counts while the fingers move
      const z = st.zone, zoned = z === 'L' || z === 'R' || z === 'C';
      if (t.v('done').includes('massage') || (!zoned && t.v('relax') >= BP)) return 'already';
      const r = t.r();
      r.zones.all += ms;
      if (zoned) r.zones[z] += ms;
      const relax = Math.min(BP, Math.floor((BP * r.zones.all) / spec.fullMs));
      t.d.relax = relax - r.relax; r.relax = relax;
      t.d.massageMs = ms; t.bundles = 1;
      if (r.relax >= BP && r.zones.L >= spec.zoneMs && r.zones.R >= spec.zoneMs && r.zones.C >= spec.zoneMs) completeService(t, 'massage');
      return null;
    },
    talc(t, spec, st) {
      const removed = Math.max(0, st.removed | 0);
      const a = t.att('talc', () => (st.avail > 0 ? [0] : null), Math.max(0, st.avail | 0));
      if (!a) return 'nothing';
      if (!removed) return 'already';
      const got = Math.min(removed, Math.max(0, a.base - a.removed));
      if (!got) return 'already';
      a.removed += got;
      t.d.debris = -got; t.bundles = 1;
      if (bpOf(a.removed, a.base) >= spec.needBp) completeService(t, 'talc');
      return null;
    },
    cover(t, spec, st) { // pomade: frozen head vertices
      if (!st.elig && !t.v('att').pomade) return 'ineligible';
      const a = t.att('pomade', () => Array.from(st.elig || []).sort((x, y) => x - y));
      if (!a) return 'ineligible';
      let n = 0;
      for (const v of st.cells || []) if (cover(a, v)) n++;
      if (!n) return 'already';
      t.d.pomade = n; t.bundles = n;
      if (bpOf(a.n, a.elig.length) >= spec.needBp) completeService(t, 'pomade');
      return null;
    },
    thread(t, spec, st) {
      // the frozen set is the stray mask: the cheek line (beard ids) and the brow strays (ids from t.s.n up)
      const n = t.s.n, a = t.att('threading', () => { const e = Array.from(st.elig || []); const S = t.s.browStray, B = t.get('brow'); for (let c = 0; c < S.length; c++) if (S[c] && B[c]) e.push(n + c); return e.sort((x, y) => x - y); });
      if (!a) return 'ineligible';
      const { ids } = contact(t, st, n, t.s.mask);
      let hit = 0;
      for (const c of ids) if (indexIn(a.elig, c) >= 0 && t.get('len')[c]) { t.removedQ += t.get('len')[c]; t.set('len', c, 0); cover(a, c); t.hairCells++; hit++; }
      const bids = st.browCells || [], B = t.s.browStray;
      for (const c of bids) if (Number.isInteger(c) && c >= 0 && c < t.s.bn && B[c] && t.get('brow')[c]) { t.removedQ += t.get('brow')[c]; t.set('brow', c, 0); cover(a, n + c); t.hairCells++; hit++; }
      if (!hit) return ids.length || bids.length ? 'already' : 'air';
      if (bpOf(a.n, a.elig.length) >= spec.needBp) completeService(t, 'threading');
      return null;
    },
    singe(t, spec, st) {
      const ms = Math.max(0, st.ms | 0), list = st.bundles || [], E = t.v('ear');
      if (!ms || !list.length) return 'air';
      let total = 0;
      for (let i = 0; i < E.len.length; i++) total += E.len[i];
      const a = t.att('singe', () => { const e = []; for (let i = 0; i < E.len.length; i++) if (E.len[i]) e.push(i); return e; }, total);
      if (!a) return 'nothing';
      const dec = Math.floor((ms * spec.rateQ) / 1000), next = E.len.slice();
      let cut = 0, hit = 0;
      for (const i of list) if (next[i]) { const d = Math.min(next[i], dec); next[i] -= d; cut += d; hit++; }
      if (!cut) return 'already';
      t.r().ear = { len: next, side: E.side };
      a.removed += cut; t.removedQ += cut; t.bundles = hit; t.d.ear = -cut;
      if (bpOf(a.removed, a.base) >= spec.needBp) completeService(t, 'singe');
      return null;
    },
    nose(t, spec, st) {
      const list = st.bundles || [], N = t.v('nose');
      if (!list.length) return 'air';
      let total = 0;
      for (let i = 0; i < N.len.length; i++) if (N.len[i] > N.rim[i]) total += N.len[i] - N.rim[i];
      const a = t.att('nose', () => { const e = []; for (let i = 0; i < N.len.length; i++) if (N.len[i] > N.rim[i]) e.push(i); return e; }, total);
      if (!a) return 'nothing';
      const next = N.len.slice();
      let cut = 0, hit = 0;
      // only the fibres entering the guarded opening, cut at the aperture plane: the internal set stays
      for (const i of list) if (next[i] > N.rim[i]) { cut += next[i] - N.rim[i]; next[i] = N.rim[i]; hit++; }
      if (!cut) return 'already';
      t.r().nose = Object.assign({}, N, { len: next });
      a.removed += cut; t.removedQ += cut; t.bundles = hit; t.d.nose = -cut;
      if (bpOf(a.removed, a.base) >= spec.needBp) completeService(t, 'nose');
      return null;
    },
  };
  function cut(t, st, target, zero) {
    const brow = st.surface === 'brow';
    const { ids } = contact(t, st, brow ? t.s.bn : t.s.n, brow ? null : t.s.mask);
    if (!ids.length) return t.masked ? 'masked' : 'air';
    t.eligible = ids.length;
    for (const c of ids) {
      if (brow) { const L = t.get('brow')[c], to = target(L); if (L > to) { t.set('brow', c, to); t.removedQ += L - to; t.hairCells++; } } else lengthAfterCut(t, c, target(t.get('len')[c]));
    }
    return zero || 'already';
  }
  function care(t, spec, st, id, field, ok, apply, done, baseOf) {
    const { ids, w } = contact(t, st, t.s.n, t.s.mask);
    if (!ids.length) return t.masked ? 'masked' : 'air';
    if (t.v('src')[id] <= 0) return 'empty';
    const len = t.get('len'), cur = t.get(field);
    let why = null;
    const wanted = ids.map((c, i) => {
      if (!len[c]) { why = why || 'noHair'; return 0; }
      if (!ok(c)) { why = 'wet'; return 0; }
      return Math.min(Math.floor((spec.deposit * w[i]) / BP), BP - cur[c]);
    });
    if (!wanted.some(Boolean)) return why || 'full';
    const elig = hairCells(t), a = t.att(id, () => elig, baseOf ? baseOf(elig) : 0);
    const p = allocate(wanted, t.v('src')[id]);
    let sum = 0;
    ids.forEach((c, i) => { if (p[i]) { sum += p[i]; apply(c, p[i]); if (a) cover(a, c); } });
    if (!sum) return 'empty';
    draw(t, id, sum);
    if (a && done(a)) finishOf(t, id, spec);
    return null;
  }

  // ---- the reducer ----
  const changedKeys = (t) => Object.keys(t.d).filter((k) => t.d[k] !== 0);
  function applyTool(s, st) {
    const spec = st && TOOLS[st.tool];
    const zero = (reason, extra) => ({ state: s, effect: Object.assign({ toolId: st && st.tool, changed: false, reason, eligibleCount: 0, changedCount: 0, removedLengthQuanta: 0, changedFields: [], perFieldDeltas: {}, beforeHash: hash(s), afterHash: hash(s), rulesetVersion: RULESET, eventSequence: s.seq }, extra) });
    if (!spec) return zero('invalid');
    if (st.ruleset != null && st.ruleset !== RULESET) return zero('ruleset');
    const t = new Tx(s, st);
    const reason = KIND[spec.kind](t, spec, st);
    const keys = changedKeys(t);
    if (!keys.length) return zero(reason || 'none', { eligibleCount: t.eligible });
    const rest = t.rest || {};
    const after = Object.assign({}, s, rest, { f: Object.assign({}, s.f, t.f), fh: t.fh, seq: s.seq + 1 });
    after.att = Object.fromEntries(Object.entries(after.att).map(([k, a]) => { if (a.own) { const b = Object.assign({}, a); delete b.own; return [k, b]; } return [k, a]; }));
    const beforeHash = hash(s), afterHash = hash(after);
    const effect = Object.freeze({
      effectId: s.job + ':' + after.seq, eventSequence: after.seq, toolId: st.tool, formulationId: spec.formulation || null, customerId: s.customer, jobId: s.job,
      surfaceKind: st.surface === 'brow' ? 'brow' : st.surface || 'beard', changed: true, reason: null,
      eligibleCount: t.eligible || t.cells.size, changedCount: t.cells.size || t.bundles, cells: [...t.cells], hairCells: t.hairCells,
      removedLengthQuanta: t.removedQ, changedFields: keys, perFieldDeltas: Object.assign({}, t.d),
      sourceTool: t.sourceTool, sourceUnitsBefore: t.sourceTool ? t.srcBefore : null, sourceUnitsAfter: t.sourceTool ? after.src[t.sourceTool] : null,
      foamMade: t.foamMade || 0, foamRemoved: t.foamGone || 0, completed: t.done || null, step: t.step || null,
      beforeHash, afterHash, rulesetVersion: RULESET,
      key: s.job + ':' + after.seq + ':' + beforeHash + ':' + afterHash,
    });
    return { state: after, effect };
  }

  // active-play fade of heat (30 s) and moisture (60 s): a contribution only ever falls to its desired value, and
  // wet hair cannot be wetter than the skin under it. Paused time is simply never passed in.
  function tick(s, ms) {
    ms = Math.max(0, ms | 0);
    if (!ms) return s;
    const hr = s.f.heatRem, mr = s.f.moistRem;
    let t = null;
    for (let c = 0; c < s.n; c++) {
      if (!hr[c] && !mr[c]) continue;
      t = t || new Tx(s, null);
      const e = Math.min(MOIST_MS, t.get('warmMs')[c] + ms);
      t.set('warmMs', c, e);
      const dh = Math.floor((t.get('heatOrg')[c] * Math.max(0, HEAT_MS - e)) / HEAT_MS), dm = Math.floor((t.get('moistOrg')[c] * Math.max(0, MOIST_MS - e)) / MOIST_MS);
      const rh = t.get('heatRem')[c], rm = t.get('moistRem')[c];
      if (rh > dh) { t.set('heatRem', c, dh); t.set('heat', c, Math.max(0, t.get('heat')[c] - (rh - dh))); }
      if (rm > dm) { t.set('moistRem', c, dm); t.set('moist', c, Math.max(0, t.get('moist')[c] - (rm - dm))); }
      if (t.get('wet')[c] > t.get('moist')[c]) t.set('wet', c, t.get('moist')[c]);
      if (!dh && !dm) { t.set('warmMs', c, 0); t.set('heatOrg', c, 0); t.set('moistOrg', c, 0); }
    }
    if (!t) return s;
    return Object.assign({}, s, { f: Object.assign({}, s.f, t.f), fh: t.fh });
  }

  // ---- reading the state ----
  // progress of a tool or service in basis points of its frozen set, 0 before the first touch
  function progress(s, id) {
    const a = s.att[id];
    if (!a) return 0;
    if (id === 'talc' || id === 'singe' || id === 'nose') return bpOf(a.removed, a.base);
    return bpOf(a.n, a.elig.length);
  }
  // area freshness (physics contract 4.4): the mean over the shaved cells, or null with nothing shaved
  function finish(s) {
    let n = 0, sum = 0, clean = 0;
    const R = s.f.recent, F = s.f.fresh, D = s.f.stress;
    for (let c = 0; c < s.n; c++) if (R[c]) { n++; sum += F[c]; if (!D[c]) clean++; }
    if (!n) return null;
    const area = Math.floor(sum / n);
    return { area, band: area >= 9500 ? 'fresh' : area >= 7500 ? 'acceptable' : 'rough', premium: area >= 9500 && clean * BP >= 9500 * n, shaved: n };
  }
  const protruding = (s) => { const N = s.nose; let n = 0; for (let i = 0; i < N.len.length; i++) if (N.len[i] > N.rim[i]) n++; return n; };

  // ---- save: fields as packed runs, verified against the state hash on the way back in ----
  const b64 = (u8) => { let t = ''; for (let i = 0; i < u8.length; i += 8192) t += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return (globalThis.btoa ? btoa(t) : Buffer.from(t, 'binary').toString('base64')); };
  const unb64 = (str) => { const t = globalThis.atob ? atob(str) : Buffer.from(str, 'base64').toString('binary'), o = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) o[i] = t.charCodeAt(i); return o; };
  function packArray(a) {
    // [run length, value] pairs as 16-bit words: long empty stretches cost four bytes
    const out = [];
    for (let i = 0; i < a.length;) { let j = i + 1; while (j < a.length && j - i < 65535 && a[j] === a[i]) j++; out.push(j - i, a[i] & 0xffff); i = j; }
    return b64(new Uint8Array(Uint16Array.from(out).buffer));
  }
  function unpackArray(str, n, signed) {
    const u8 = unb64(str);
    if (u8.length % 4) return null;
    const w = new Uint16Array(u8.buffer, u8.byteOffset, u8.length / 2), a = signed ? new Int16Array(n) : new Uint16Array(n);
    let p = 0;
    for (let i = 0; i < w.length; i += 2) { const end = p + w[i]; if (!w[i] || end > n) return null; a.fill(signed ? (w[i + 1] << 16) >> 16 : w[i + 1], p, end); p = end; }
    return p === n ? a : null;
  }
  function pack(s) {
    const f = {};
    for (const k of FIELDS) { let any = false; const a = s.f[k]; for (let c = 0; c < a.length && !any; c++) if (a[c]) any = true; if (any) f[k] = packArray(a); }
    const att = {};
    for (const [k, a] of Object.entries(s.att)) att[k] = { e: packArray(Uint16Array.from(a.elig)), c: packArray(a.cov), n: a.n, r: a.removed, m: a.ms, b: a.base, g: a.flag, l: a.elig.length };
    return { v: 1, rules: s.rules, job: s.job, customer: s.customer, n: s.n, bn: s.bn, f, mask: packArray(s.mask), stray: packArray(s.browStray),
      nose: { p: s.nose.potential, r: Array.from(s.nose.rim), l: Array.from(s.nose.len), s: Array.from(s.nose.side) }, ear: { l: Array.from(s.ear.len), s: Array.from(s.ear.side) },
      src: s.src, load: s.load, relax: s.relax, zones: s.zones, att, done: s.done, steps: s.steps, foamCells: s.foamCells, foamPeak: s.foamPeak, shaved: s.shaved, seq: s.seq, h: hash(s) };
  }
  const safeInt = (v) => Number.isSafeInteger(v) && v >= 0;
  function unpack(o) {
    if (!o || o.v !== 1 || o.rules !== RULESET || !safeInt(o.n) || !safeInt(o.bn) || !o.f || typeof o.f !== 'object') return null;
    try {
      const s = fresh({ cells: o.n, browCells: o.bn, job: o.job, customer: o.customer });
      for (const k of FIELDS) {
        const a = o.f[k] != null ? unpackArray(o.f[k], s.f[k].length, I16.includes(k)) : s.f[k].fill(0);
        if (!a) return null;
        const top = k === 'len' || k === 'brow' || k === 'razorAt' || k === 'warmMs' ? 65535 : BP;
        for (let c = 0; c < a.length; c++) if (a[c] > top || a[c] < -BP) return null;
        s.f[k] = a;
      }
      s.mask = unpackArray(o.mask, o.n); s.browStray = unpackArray(o.stray, o.bn);
      if (!s.mask || !s.browStray) return null;
      const u16 = (l) => { if (!Array.isArray(l) || !l.every(safeInt)) throw new Error('bad'); return Uint16Array.from(l); };
      s.nose = { potential: o.nose.p | 0, rim: u16(o.nose.r), len: u16(o.nose.l), side: Uint8Array.from(u16(o.nose.s)) };
      s.ear = { len: u16(o.ear.l), side: Uint8Array.from(u16(o.ear.s)) };
      for (const k of Object.keys(s.src)) { if (!safeInt(o.src[k])) return null; s.src[k] = o.src[k]; }
      s.load = { water: o.load.water, cream: o.load.cream, pump: o.load.pump };
      s.relax = o.relax; s.zones = { L: o.zones.L, R: o.zones.R, C: o.zones.C, all: o.zones.all };
      for (const [k, a] of Object.entries(o.att || {})) {
        const e = unpackArray(a.e, a.l), c = unpackArray(a.c, a.l);
        if (!e || !c) return null;
        s.att[k] = { elig: Uint32Array.from(e), cov: Uint8Array.from(c), n: a.n, removed: a.r, ms: a.m, base: a.b, flag: a.g };
      }
      s.done = Array.isArray(o.done) ? o.done.slice() : []; s.steps = Array.isArray(o.steps) ? o.steps.slice() : [];
      s.foamCells = o.foamCells; s.foamPeak = o.foamPeak; s.shaved = o.shaved; s.seq = o.seq;
      s.fh = hashFields(s.f);
      return hash(s) === o.h ? s : null;
    } catch (e) { return null; }
  }

  // ---- the minimal tray (easy contract 8.1) ----
  // what a tool could really do now: the visible tray only ever shows these, so an honest no-op is rarely offered
  function useful(id, s, ctx = {}) {
    if (!s) return false;
    const stubble = () => { const L = s.f.len; for (let c = 0; c < s.n; c++) if (L[c] && L[c] <= 200) return true; return false; };
    const beard = () => { const L = s.f.len; for (let c = 0; c < s.n; c++) if (L[c] >= 300) return true; return false; };
    const foam = s.foamCells > 0 || s.load.cream > 0 || filmed(s);
    switch (id) {
      case 'spray': return stubble() || beard();
      case 'foil': { const L = s.f.len, M = s.f.moist; for (let c = 0; c < s.n; c++) if (L[c] > 5 && L[c] <= 150 && M[c] < 1000) return true; return false; }
      case 'shavingSoap': case 'shavingCream': return stubble() && !s.foamCells;
      case 'lather': return foam;
      case 'beardOil': case 'beardBalm': return beard();
      case 'coldTowel': case 'aftershave': return s.shaved > 0 && !s.foamCells;
      case 'alum': return s.shaved > 0 && !s.foamCells;
      case 'nose': return protruding(s) > 0;
      case 'singe': { for (let i = 0; i < s.ear.len.length; i++) if (s.ear.len[i]) return true; return false; }
      case 'talc': return (ctx.loose || 0) > 0;
      case 'threading': return !!ctx.cheekLine;
      default: return !!(ctx.wanted && ctx.wanted.includes(id));
    }
  }
  const filmed = (s) => { const A = s.f.soap, B = s.f.cream; for (let c = 0; c < s.n; c++) if (A[c] || B[c]) return true; return false; };
  const WORKFLOW = ['towel', 'spray', 'shavingSoap', 'shavingCream', 'lather', 'foil', 'massage', 'nose', 'singe', 'threading', 'coldTowel', 'alum', 'aftershave', 'beardOil', 'beardBalm', 'pomade', 'talc'];
  // { mode, owned[], cutters[], state, wanted[], pinned: {source, finish}, ctx } -> { cut[], care[] }
  function trayFor(o) {
    const owned = new Set(o.owned), ctx = Object.assign({ wanted: o.wanted || [] }, o.ctx);
    const all = WORKFLOW.filter((k) => owned.has(k));
    const cutters = (o.cutters || []).filter((k) => owned.has(k) && k !== 'foil');
    if (o.mode === 'free') return { cut: (o.cutters || []).filter((k) => owned.has(k)), care: all.filter((k) => k !== 'foil') }; // Quick Play: everything, grouped
    const wanted = all.filter((k) => ctx.wanted.includes(k));
    const pin = o.pinned || {};
    const alt = (k) => (k === 'shavingSoap' || k === 'shavingCream' ? k === (pin.source || 'shavingCream') : k === 'beardOil' || k === 'beardBalm' ? k === (pin.finish || 'beardOil') : true);
    const rest = all.filter((k) => !wanted.includes(k) && alt(k) && useful(k, o.state, ctx));
    const noPrep = o.mode === 'rush';
    const pick = wanted.concat(noPrep ? rest.filter((k) => k === 'foil') : rest).slice(0, 3);
    const relaxing = o.mode === 'relax';
    return { cut: relaxing && !wanted.includes('lather') ? [] : cutters, care: pick };
  }

  // ---- location (easy contract section 9): selection weights only, never physics ----
  // The proposed overlay, every row at zero confidence until it has sources and cultural review: provisional rows
  // behave exactly neutrally.
  const NEUTRAL = 10000, SECONDARY = 12500;
  const OVERLAY = {
    foil: ['lagos', 'nairobi', 'johannesburg', 'london', 'berlin', 'warsaw', 'new-york', 'los-angeles'],
    shavingSoap: ['cairo', 'casablanca', 'istanbul', 'amman', 'karachi', 'dhaka', 'sydney', 'auckland'],
    shavingCream: ['cairo', 'london', 'istanbul', 'karachi', 'dhaka', 'tokyo', 'mexico-city', 'sao-paulo', 'sydney', 'auckland'],
    coldTowel: ['madrid', 'dubai', 'amman', 'karachi', 'mexico-city', 'sao-paulo', 'sydney', 'auckland'],
    beardOil: ['nairobi', 'casablanca', 'riyadh', 'dubai', 'madrid', 'mexico-city', 'sao-paulo', 'buenos-aires'],
    beardBalm: ['nairobi', 'riyadh', 'dubai', 'madrid', 'mexico-city', 'sao-paulo', 'buenos-aires'],
    alum: ['karachi'],
  };
  // reviewed cities and their confidence land here; empty today, so every city is neutral
  const CONFIDENCE = {};
  const cityWeight = (tool, city, conf = CONFIDENCE) => {
    const c = conf[city] || 0, listed = (OVERLAY[tool] || []).includes(city);
    return NEUTRAL + Math.floor(((listed ? SECONDARY : NEUTRAL) - NEUTRAL) * c / BP);
  };
  // The opening set a Career home city gives: bulk (the clipper and its guards guide it), precision, cleanup. The
  // neutral set is the same everywhere; a reviewed city may swap in a signature tool, never lose a role.
  const STARTER = ['clipper', 'trimmer', 'talc'];
  const starterFor = (city, conf = CONFIDENCE) => { const sig = (conf[city] || 0) > 0 ? Object.keys(OVERLAY).find((k) => OVERLAY[k].includes(city)) : null; return sig ? STARTER.concat(sig) : STARTER.slice(); };
  // the first Career job in a city may loan one signature tool for that job, free of coins and ads
  const loanFor = (city, owned, seen, conf = CONFIDENCE) => {
    if (!((conf[city] || 0) > 0) || (seen || []).includes(city)) return null;
    return Object.keys(OVERLAY).find((k) => OVERLAY[k].includes(city) && !owned.includes(k)) || null;
  };

  HSC.effects = { RULESET, BP, CELLS, BROW_CELLS, FIELDS, TOOLS, FORMULA, ANATOMY, FOAM_VALID, fresh, applyTool, tick, hash, progress, finish, protruding, pack, unpack, noseOf, earOf, browQOf, browLevelOf, trayFor, useful, cityWeight, starterFor, loanFor, OVERLAY, STARTER, _hashFields: hashFields };
})(globalThis.HSC || (globalThis.HSC = {}));
