'use strict';
// Tool and service property tests (plan item 4.8; docs/TOOL-PHYSICS-AND-EFFECT-CONTRACT.md section 9,
// EASY-TOOL-LOGIC-AND-LOCATION-CONTRACT.md section 12): exact boundaries, the transfer rule, completion thresholds,
// then 100,000 deterministic randomized strokes for every tool. No reward without a delta.
// TOOL_STROKES overrides the per-tool stroke count for a quick local run.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const load = (files, extra) => {
  const ctx = Object.assign({ HSC: {}, console, btoa, atob, Math, addEventListener() {} }, extra);
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, 'source/customers', f), 'utf8'), ctx);
  return ctx;
};
const ctx = load(['effects.js', 'economy.js']);
const E = ctx.HSC.effects, ECO = ctx.HSC.economy;
const BP = 10000;
let cases = 0;
const N = 256, BN = 64;
const grid = (fn) => Uint16Array.from({ length: N }, (_, c) => fn(c));
const mk = (o = {}) => E.fresh(Object.assign({ cells: N, browCells: BN, job: 7, customer: 42, seed: 5 }, o));
const go = (s, stroke) => E.applyTool(s, stroke);
const hair = (q) => grid(() => q);
const damp = (s, moist) => { const f = Object.assign({}, s.f, { moist: grid(() => moist) }); const n = Object.assign({}, s, { f }); n.fh = E._hashFields(f); return n; };
const put = (s, fields) => { const f = Object.assign({}, s.f); for (const [k, v] of Object.entries(fields)) f[k] = typeof v === 'number' ? grid(() => v) : v; const n = Object.assign({}, s, { f }); n.fh = E._hashFields(f); return n; };

// 1. guarded tools: every guard against every stored length
{
  for (const tool of ['clipper', 'beard']) for (const [g, to] of E.TOOLS[tool].guards.entries()) for (const L of [0, 1, to - 1, to, to + 1, 5000]) {
    if (L < 0) continue;
    const s = mk({ len: hair(L) }), r = go(s, { tool, cells: [3, 9], setting: g });
    assert.equal(r.state.f.len[3], Math.min(L, to), `${tool} guard ${g}: ${L}`);
    assert.equal(r.state.f.len[4], L, 'an adjacent unreached cell is unchanged');
    assert.equal(r.effect.changed, L > to);
    const again = go(r.state, { tool, cells: [3, 9], setting: g });
    assert.equal(again.effect.changed, false, 'the second identical pass is zero-delta');
    assert.equal(again.state, r.state);
    assert.equal(again.effect.reason, 'already');
  }
  assert.equal(go(mk({ len: hair(900) }), { tool: 'clipper', cells: [1], setting: 9 }).effect.reason, 'invalid');
  cases++;
}

// 2. the scissor proof matrix: blade plane, close event only, no guard
{
  for (const [g, h] of E.TOOLS.scissors.planes.entries()) for (const L of [h - 1, h, h + 1]) {
    const s = mk({ len: hair(L) });
    assert.equal(go(s, { tool: 'scissors', cells: [1, 2], setting: g, close: false }).effect.reason, 'open', 'an open blade cannot cut');
    const r = go(s, { tool: 'scissors', cells: [1, 2], setting: g, close: true });
    assert.equal(r.state.f.len[1], Math.min(L, h));
    assert.equal(r.state.f.len[2], Math.min(L, h), 'every crossing fibre, not a random subset');
    assert.equal(r.state.f.len[3], L, 'hair outside the blade is unchanged');
  }
  cases++;
}

// 3. the foil boundary (easy contract 3.2): 1.50 accepted, 1.51 rejected, moisture 999 yes, 1000 no, residual exactly 0.05
{
  const hit = { tool: 'foil', cells: [1] };
  assert.equal(go(mk({ len: hair(150) }), hit).state.f.len[1], 5);
  assert.equal(go(mk({ len: hair(151) }), hit).effect.reason, 'long');
  assert.equal(go(mk({ len: hair(4) }), hit).effect.changed, false, 'a shorter original length stays');
  assert.equal(go(damp(mk({ len: hair(100) }), 999), hit).state.f.len[1], 5);
  assert.equal(go(damp(mk({ len: hair(100) }), 1000), hit).effect.reason, 'wet');
  assert.equal(go(mk({ len: hair(100) }), { tool: 'foil', cells: [1], surface: 'brow' }).effect.changed, false, 'beard only: the scalp and brow stay with the frozen kernel');
  cases++;
}

// 4. the razor: limit, residual, preparation decides the skin, not the hair
{
  const dry = go(mk({ len: hair(200) }), { tool: 'razor', cells: [1], strokeId: 1 });
  assert.equal(dry.state.f.len[1], 5, 'a dry pass still cuts eligible stubble');
  assert.ok(dry.state.f.stress[1] > 0, 'and leaves saved dry-shave stress');
  assert.equal(go(mk({ len: hair(201) }), { tool: 'razor', cells: [1], strokeId: 1 }).effect.changed, false, 'longer hair does nothing');
  const wet = go(put(mk({ len: hair(200) }), { foam: BP }), { tool: 'razor', cells: [1], strokeId: 1 });
  assert.equal(wet.state.f.len[1], 5);
  assert.equal(wet.state.f.stress[1], 0, 'full lather produces zero stress');
  assert.equal(wet.state.f.foam[1], 0, 'the same edge removes the lather');
  assert.ok(wet.state.f.fresh[1] > dry.state.f.fresh[1], 'a prepared pass is strictly better for the same hair result');
  const warm = go(put(mk({ len: hair(200) }), { heat: BP, moist: BP }), { tool: 'razor', cells: [1], strokeId: 1 });
  assert.ok(warm.state.f.stress[1] > 0 && warm.state.f.stress[1] < dry.state.f.stress[1], 'heat and moisture help but never equal lather');
  // charged once per continuous stroke, again on a later stroke
  const same = go(dry.state, { tool: 'razor', cells: [1, 2], strokeId: 1 });
  assert.equal(same.state.f.stress[1], dry.state.f.stress[1]);
  const later = go(dry.state, { tool: 'razor', cells: [1], strokeId: 2 });
  assert.ok(later.state.f.stress[1] > dry.state.f.stress[1]);
  // the freshness ceiling: soothing cannot lift it past the dry-shave cap
  const f = E.finish(later.state);
  assert.ok(f.area <= BP && f.shaved === 1);
  const allDry = go(mk({ len: hair(100) }), { tool: 'razor', cells: Array.from({ length: N }, (_, i) => i), strokeId: 3 }).state;
  assert.equal(E.finish(allDry).premium, false, 'premium is impossible on a dry-shaved area');
  const allWet = go(put(mk({ len: hair(100) }), { foam: BP }), { tool: 'razor', cells: Array.from({ length: N }, (_, i) => i), strokeId: 3 }).state;
  assert.equal(E.finish(allWet).premium, true);
  cases++;
}

// 5. finite transfer: exact, no duplication, no loss
{
  const s0 = mk({ len: hair(300), source: 10 });
  const r = go(s0, { tool: 'beardOil', cells: [5, 1, 3], weights: [10000, 10000, 10000] });
  const got = [1, 3, 5].map((c) => r.state.f.oil[c]);
  assert.deepEqual(got, [4, 3, 3], 'the remainder goes one unit at a time in ascending cell order');
  assert.equal(r.state.src.beardOil, 0);
  assert.equal(r.effect.sourceUnitsBefore, 10);
  assert.equal(r.effect.sourceUnitsAfter, 0);
  assert.equal(go(r.state, { tool: 'beardOil', cells: [1] }).effect.reason, 'empty', 'an empty source does nothing');
  const one = go(mk({ len: hair(300), source: 1 }), { tool: 'beardOil', cells: [2, 1] });
  assert.equal(one.state.f.oil[1], 1, 'one unit goes to the lowest id');
  assert.equal(one.state.f.oil[2], 0);
  const full = put(mk({ len: hair(300) }), { oil: BP });
  assert.equal(go(full, { tool: 'beardOil', cells: [1] }).effect.reason, 'full');
  assert.equal(go(full, { tool: 'beardOil', cells: [1] }).state.src.beardOil, full.src.beardOil, 'a full destination draws nothing');
  cases++;
}

// 6. the product equations
{
  const s = mk({ len: hair(300) }), o = 2500;
  let r = go(s, { tool: 'beardOil', cells: [1] }), f = r.state.f;
  assert.equal(f.oil[1], o); assert.equal(f.cond[1], 2000); assert.equal(f.shine[1], 625); assert.equal(f.dry[1], Math.max(0, s.f.dry[1] - 1750));
  assert.equal(f.hold[1], 0, 'oil never adds hold');
  r = go(s, { tool: 'beardBalm', cells: [1], dirX: 0, dirY: BP }); f = r.state.f;
  assert.equal(f.balm[1], 2500); assert.equal(f.cond[1], 1250); assert.equal(f.hold[1], 1500); assert.equal(f.shine[1], 500);
  assert.ok(Math.abs(f.dirY[1] - BP) < Math.abs(s.f.dirY[1] - BP), 'balm moves direction toward the target');
  assert.equal(go(put(s, { wet: 3001 }), { tool: 'beardBalm', cells: [1] }).effect.reason, 'wet');
  assert.equal(go(put(s, { wet: 3000 }), { tool: 'beardBalm', cells: [1] }).effect.changed, true);
  assert.equal(go(mk(), { tool: 'beardOil', cells: [1] }).effect.reason, 'noHair', 'no product on absent hair');
  // spray: the deposit law, never hair length
  const sp = go(s, { tool: 'spray', cells: [1] });
  assert.equal(sp.state.f.wet[1], 2500); assert.equal(sp.state.f.moist[1], 2500); assert.equal(sp.state.f.len[1], 300);
  assert.equal(go(sp.state, { tool: 'spray', cells: [1] }).state.f.wet[1], 2500 + Math.floor((2500 * 7500) / BP));
  // cold towel: only after a shave, never erases dry-shave stress
  assert.equal(go(put(s, { heat: 4000 }), { tool: 'coldTowel', cells: [1] }).effect.reason, 'notShaved');
  const shaved = go(mk({ len: hair(100) }), { tool: 'razor', cells: [1, 2, 3, 4], strokeId: 1 }).state;
  const hot = put(shaved, { heat: 4000 });
  const c = go(hot, { tool: 'coldTowel', cells: [1] });
  assert.equal(c.state.f.heat[1], 1000); assert.equal(c.state.f.cold[1], 3000);
  assert.equal(c.state.f.stress[1], hot.f.stress[1], 'a towel cannot erase the stress of a dry shave');
  assert.equal(c.state.f.soothe[1], 750);
  assert.equal(go(Object.assign({}, go(mk({ len: hair(100) }), { tool: 'foil', cells: [1] }).state), { tool: 'coldTowel', cells: [1] }).effect.reason, 'notCoolable', 'no heat or irritation: an honest no-op');
  // alum: damp, lather gone, recently shaved
  const a0 = put(shaved, { moist: 3000 });
  const a = go(a0, { tool: 'alum', cells: [1] });
  assert.equal(a.state.f.alum[1], 2500); assert.equal(a.state.f.len[1], a0.f.len[1]); assert.equal(a.state.f.stress[1], a0.f.stress[1]);
  assert.equal(go(put(shaved, { moist: 499 }), { tool: 'alum', cells: [1] }).effect.reason, 'moisture');
  assert.equal(go(put(shaved, { moist: 500 }), { tool: 'alum', cells: [1] }).effect.changed, true);
  assert.equal(go(put(shaved, { moist: 6000 }), { tool: 'alum', cells: [1] }).effect.changed, true);
  assert.equal(go(put(shaved, { moist: 6001 }), { tool: 'alum', cells: [1] }).effect.reason, 'moisture');
  assert.equal(go(put(shaved, { moist: 3000, foam: 100 }), { tool: 'alum', cells: [1] }).effect.reason, 'foam');
  assert.equal(go(put(s, { moist: 3000 }), { tool: 'alum', cells: [1] }).effect.reason, 'notShaved');
  cases++;
}

// 7. the lather chain: dry soap fails, a pump registers one dose per complete actuation, foam needs film and water
{
  const stub = hair(100), all = Array.from({ length: N }, (_, i) => i);
  assert.equal(go(mk({ len: stub }), { tool: 'shavingSoap', cells: [1] }).effect.reason, 'dry', 'dry soap does not become film');
  assert.equal(go(damp(mk({ len: stub }), 999), { tool: 'shavingSoap', cells: [1] }).effect.reason, 'dry');
  const film = go(damp(mk({ len: stub }), 1000), { tool: 'shavingSoap', cells: [1] });
  assert.equal(film.state.f.soap[1], 2500);
  assert.equal(film.state.f.foam[1], 0, 'soap film is not foam');
  assert.equal(go(mk({ len: stub }), { tool: 'lather', cells: [1] }).effect.reason, 'empty', 'an empty brush paints nothing');
  assert.equal(go(mk({ len: stub, water: 0 }), { tool: 'shavingCream', pump: 1 }).state.src.shavingCream < E.TOOLS.shavingCream.source, true);
  assert.equal(go(mk({ len: stub }), { tool: 'shavingCream', pump: 0 }).effect.reason, 'partial', 'partial motion registers no dose');
  const p1 = go(mk({ len: stub }), { tool: 'shavingCream', pump: 1 });
  assert.equal(p1.state.load.cream, E.TOOLS.shavingCream.dose);
  assert.equal(go(p1.state, { tool: 'shavingCream', pump: 1 }).effect.reason, 'held', 'holding past the detent cannot repeat');
  assert.equal(go(p1.state, { tool: 'shavingCream', pump: 2 }).state.load.cream, 2 * E.TOOLS.shavingCream.dose);
  const low = go(mk({ len: stub, source: 7 }), { tool: 'shavingCream', pump: 1 });
  assert.equal(low.state.load.cream, 7, 'a nearly empty pump delivers only what remains');
  const dryBrush = go(mk({ len: stub, water: 0 }), { tool: 'shavingCream', pump: 1 }).state;
  assert.equal(go(dryBrush, { tool: 'lather', cells: [1] }).effect.reason, 'dry', 'cream is not foam without water');
  // cream to lather to a full shave, proven from effect records
  let s = p1.state;
  for (let i = 0; i < 40 && !s.steps.includes('latherReady'); i++) { if (i && s.load.cream <= 0) s = go(s, { tool: 'shavingCream', pump: 2 + i }).state; s = go(s, { tool: 'lather', cells: all }).state; }
  assert.ok(s.steps.includes('latherReady'), 'the lather milestone at 60% of the frozen shave area');
  assert.ok(!s.done.includes('lather'), 'foam alone completes nothing');
  const thin = go(s, { tool: 'razor', cells: all, strokeId: 4 });
  assert.ok(thin.state.done.includes('lather'), 'the chain ends with a positive razor delta and 70% of the peak foam gone');
  assert.equal(thin.effect.completed, 'lather');
  const dryStress = go(mk({ len: stub }), { tool: 'razor', cells: [1], strokeId: 4 }).state.f.stress[1];
  assert.ok(thin.state.f.stress[1] < dryStress, 'a thin lather already helps');
  let rich = s;
  for (let i = 0; i < 12; i++) { rich = go(rich, { tool: 'shavingCream', pump: 100 + i }).state; rich = go(rich, { tool: 'lather', cells: all }).state; }
  assert.equal(rich.f.foam[1], E.BP);
  assert.equal(go(rich, { tool: 'razor', cells: all, strokeId: 4 }).state.f.stress[1], 0, 'a full lather shave is stress-free');
  // peak foam left on the face: not enough removed
  const partial = go(s, { tool: 'razor', cells: all.slice(0, 40), strokeId: 4 });
  assert.ok(!partial.state.done.includes('lather'));
  cases++;
}

// 8. services complete from their effect only
{
  const all = Array.from({ length: N }, (_, i) => i);
  // massage: time alone at one point never completes; all three zones and moving fingers do
  let s = mk();
  assert.equal(go(s, { tool: 'massage', ms: 1000, moved: false, zone: 'C' }).effect.reason, 'still', 'a stationary hold adds nothing');
  for (let i = 0; i < 40; i++) s = go(s, { tool: 'massage', ms: 100, moved: true, zone: 'C' }).state;
  assert.equal(s.relax, BP);
  assert.ok(!s.done.includes('massage'), 'one point never completes');
  for (const z of ['L', 'R']) for (let i = 0; i < 5; i++) s = go(s, { tool: 'massage', ms: 100, moved: true, zone: z }).state;
  assert.ok(s.done.includes('massage'));
  // towel: 3,000 ms of contact and 60% of the mask, heat 30 s and moisture 60 s of active play
  s = mk({ len: hair(100) });
  let r = go(s, { tool: 'towel', cells: all, ms: 2999 });
  assert.ok(!r.state.done.includes('towel'));
  r = go(s, { tool: 'towel', cells: all, ms: 3000 });
  assert.ok(r.state.done.includes('towel'));
  assert.equal(r.state.f.heat[9], BP); assert.equal(r.state.f.moist[9], BP);
  let w = E.tick(r.state, 15000);
  assert.equal(w.f.heat[9], 5000); assert.equal(w.f.moist[9], 7500);
  w = E.tick(w, 15000);
  assert.equal(w.f.heat[9], 0); assert.equal(w.f.moist[9], 5000);
  w = E.tick(w, 30000);
  assert.equal(w.f.moist[9], 0);
  assert.equal(E.tick(mk(), 1000).seq, 0);
  // pausing is simply not ticking; a second tick path gives the same result as one long one
  let a = r.state, b = r.state; for (let i = 0; i < 30; i++) a = E.tick(a, 1000); b = E.tick(b, 30000);
  assert.equal(E.hash(a), E.hash(b), 'the fade does not depend on the tick rate');
  // aftershave: untouched faces cannot count
  assert.equal(go(mk({ len: hair(100) }), { tool: 'aftershave', cells: all }).effect.reason, 'notShaved');
  s = go(mk({ len: hair(100) }), { tool: 'razor', cells: all.slice(0, 100), strokeId: 1 }).state;
  r = go(s, { tool: 'aftershave', cells: all.slice(0, 59) });
  assert.ok(!r.state.done.includes('aftershave'), '59% is not 60%');
  r = go(r.state, { tool: 'aftershave', cells: all.slice(59, 60) });
  assert.ok(r.state.done.includes('aftershave'), 'exactly 60% of the frozen shaved area');
  assert.equal(go(r.state, { tool: 'aftershave', cells: all.slice(0, 59) }).effect.changed, false, 'revisiting cannot inflate coverage');
  // talc: only the removal of real loose clippings counts
  s = mk();
  assert.equal(go(s, { tool: 'talc', removed: 0, avail: 0 }).effect.reason, 'nothing');
  assert.equal(go(s, { tool: 'talc', removed: 0, avail: 100 }).effect.changed, false, 'a dry brush stroke is zero-delta');
  r = go(s, { tool: 'talc', removed: 69, avail: 100 });
  assert.ok(!r.state.done.includes('talc'));
  r = go(r.state, { tool: 'talc', removed: 1, avail: 100 });
  assert.ok(r.state.done.includes('talc'));
  // pomade covers unique vertices of the frozen set
  const elig = [10, 20, 30, 40];
  r = go(mk(), { tool: 'pomade', cells: [10], elig });
  assert.equal(E.progress(r.state, 'pomade'), 2500);
  assert.equal(go(r.state, { tool: 'pomade', cells: [10], elig }).effect.changed, false);
  r = go(r.state, { tool: 'pomade', cells: [20], elig });
  assert.ok(r.state.done.includes('pomade'));
  cases++;
}

// 9. anatomy: nose hair, ear bundles, threading strays, brow body vs strays, the safety mask
{
  // stable: the same customer always has the same nose hair; age shifts probability, nothing else is an input
  assert.deepEqual([...E.noseOf(77, 60).len], [...E.noseOf(77, 60).len]);
  let found = null;
  for (let seed = 1; seed < 400 && !found; seed++) { const n = E.noseOf(seed, 70); if (n.len.some((l, i) => l > n.rim[i]) && n.len.some((l, i) => l === n.rim[i])) found = n; }
  assert.ok(found, 'older customers can have protruding and non-protruding bundles');
  const protr = () => { const e = []; found.len.forEach((l, i) => { if (l > found.rim[i]) e.push(i); }); return e; };
  let s = mk({ nose: found });
  assert.equal(go(s, { tool: 'nose', bundles: [] }).effect.reason, 'air', 'proximity and time give no credit');
  const list = protr(), head = list.slice(0, Math.ceil(list.length / 2));
  let r = go(s, { tool: 'nose', bundles: head });
  for (const i of head) assert.equal(r.state.nose.len[i], found.rim[i], 'cut at the aperture plane');
  for (let i = 0; i < found.len.length; i++) assert.ok(r.state.nose.len[i] >= found.rim[i] && r.state.nose.len[i] > 0, 'the protective internal hair stays');
  assert.equal(go(r.state, { tool: 'nose', bundles: head }).effect.changed, false, 'a repeated pass is zero-delta');
  assert.equal(r.state.f.len[1], 0, 'moustache cells are not touched');
  r = go(r.state, { tool: 'nose', bundles: list });
  assert.ok(r.state.done.includes('nose'), '90% of the protruding length, proven by length deltas');
  // a customer with none cannot be served
  assert.equal(go(mk(), { tool: 'nose', bundles: [0] }).effect.reason, 'nothing');
  // ear: only contacted bundles shorten; 90% of the requested length completes
  const ear = E.earOf(9, 0.12);
  assert.equal(ear.len.length, 16);
  s = mk({ ear });
  r = go(s, { tool: 'singe', bundles: [0, 1], ms: 100 });
  assert.equal(r.state.ear.len[0], ear.len[0] - 50);
  assert.equal(r.state.ear.len[9], ear.len[9], 'an uncontacted bundle is unchanged');
  assert.equal(go(mk(), { tool: 'singe', bundles: [0], ms: 100 }).effect.reason, 'nothing', 'no ear hair: the flame only burns');
  const every = Array.from(ear.len.keys());
  for (let i = 0; i < 200 && !r.state.done.includes('singe'); i++) r = go(r.state, { tool: 'singe', bundles: every, ms: 100 });
  assert.ok(r.state.done.includes('singe'));
  // threading: the stray set only; bulk beard and the brow body are not eligible
  const browStray = new Uint8Array(BN); browStray[3] = 1; browStray[4] = 1;
  s = mk({ len: hair(600), brow: Uint16Array.from({ length: BN }, () => 600), browStray });
  r = go(s, { tool: 'threading', cells: [10, 11, 50], elig: [10, 11, 12, 13] });
  assert.equal(r.state.f.len[10], 0); assert.equal(r.state.f.len[50], 600, 'bulk beard under the thread is not touched');
  r = go(r.state, { tool: 'threading', browCells: [3, 9], elig: [10, 11, 12, 13] });
  assert.equal(r.state.f.brow[3], 0); assert.equal(r.state.f.brow[9], 600, 'the brow body is not touched');
  assert.equal(E.progress(r.state, 'threading'), Math.floor((BP * 3) / 6));
  r = go(r.state, { tool: 'threading', cells: [12, 13], browCells: [4], elig: [] });
  assert.ok(r.state.done.includes('threading'));
  assert.equal(go(mk({ len: hair(600) }), { tool: 'threading', cells: [1], elig: [] }).effect.reason, 'ineligible', 'an empty set is invalid, not complete');
  // protected cells are impossible targets for every tool
  const mask = new Uint8Array(N); mask[7] = 1;
  s = put(mk({ len: hair(100), mask }), { moist: 3000, foam: 0 });
  for (const tool of ['clipper', 'beard', 'trimmer', 'scissors', 'razor', 'foil', 'spray', 'shavingSoap', 'beardOil', 'beardBalm', 'alum', 'coldTowel', 'aftershave', 'lather']) {
    r = go(s, { tool, cells: [7], setting: 0, close: true, strokeId: 1 });
    assert.equal(r.effect.changed, false, tool + ' on a protected cell');
    assert.equal(r.effect.reason, 'masked', tool);
  }
  // eyelashes are in the registry as protected and no tool lists them
  assert.equal(E.ANATOMY.eyelash.protected, true);
  assert.deepEqual([...E.ANATOMY.eyelash.tools], []);
  cases++;
}

// 10. brow surface parity: one millimetre equation, exact lengths kept, the renderer sees a view
{
  const s = mk({ brow: Uint16Array.from({ length: BN }, () => E.browQOf(2)) });
  let r = go(s, { tool: 'clipper', surface: 'brow', setting: 1, cells: [5] });
  assert.equal(r.state.f.brow[5], 300, 'the 3 mm guard leaves 3 mm');
  assert.equal(E.browLevelOf(300), 1);
  r = go(s, { tool: 'trimmer', surface: 'brow', cells: [5] });
  assert.equal(r.state.f.brow[5], 50);
  assert.equal(E.browLevelOf(50), 0);
  assert.equal(go(s, { tool: 'razor', surface: 'brow', cells: [5], strokeId: 1 }).effect.changed, false, 'a full brow is too long for the razor');
  const short = mk({ brow: Uint16Array.from({ length: BN }, () => E.browQOf(1)) });
  assert.equal(go(short, { tool: 'razor', surface: 'brow', cells: [5], strokeId: 1 }).state.f.brow[5], 0);
  cases++;
}

// 11. undo, redo and save: exact, and corruption is refused rather than half-loaded
{
  const all = Array.from({ length: N }, (_, i) => i);
  let s = mk({ len: hair(120), nose: E.noseOf(11, 75), ear: E.earOf(11, 0.1) });
  s = go(s, { tool: 'spray', cells: all.slice(0, 60) }).state;
  s = go(s, { tool: 'razor', cells: all.slice(0, 30), strokeId: 2 }).state;
  s = go(s, { tool: 'shavingCream', pump: 1 }).state;
  s = go(s, { tool: 'lather', cells: all.slice(30, 90) }).state;
  const before = s, h0 = E.hash(s), src0 = s.load.cream;
  const r = go(s, { tool: 'lather', cells: all.slice(30, 90) });
  assert.notEqual(E.hash(r.state), h0);
  assert.equal(E.hash(before), h0, 'the before state is never mutated');
  assert.equal(before.load.cream, src0, 'undo returns source units without refilling beyond them');
  // incremental hash equals a full recomputation
  assert.equal(r.state.fh, E._hashFields(r.state.f));
  const json = JSON.stringify(E.pack(r.state)), back = E.unpack(JSON.parse(json));
  assert.ok(back, 'a saved visit loads');
  assert.equal(E.hash(back), E.hash(r.state), 'save and reload reproduce the exact hash');
  assert.deepEqual([...back.f.foam], [...r.state.f.foam]);
  assert.deepEqual([...back.f.dirX], [...r.state.f.dirX], 'signed direction survives');
  const after = go(back, { tool: 'lather', cells: all.slice(30, 90) });
  assert.equal(after.effect.afterHash, go(r.state, { tool: 'lather', cells: all.slice(30, 90) }).effect.afterHash, 'a reloaded visit continues identically');
  const bad = JSON.parse(json); bad.src.spray += 1;
  assert.equal(E.unpack(bad), null, 'a changed reservoir fails the hash');
  const bad2 = JSON.parse(json); bad2.f.foam = 'AAAA';
  assert.equal(E.unpack(bad2), null, 'a damaged grid is refused');
  assert.equal(E.unpack({ v: 2 }), null);
  assert.equal(E.unpack(null), null);
  assert.ok(json.length < 40000, 'a visit stays small: ' + json.length);
  // a full-size visit stays within the save budget
  const big = E.fresh({ job: 1, customer: 1, seed: 1, len: Uint16Array.from({ length: E.CELLS }, (_, c) => 100 + (c % 7)) });
  let b = go(big, { tool: 'spray', cells: Array.from({ length: E.CELLS }, (_, i) => i) }).state;
  b = go(b, { tool: 'razor', cells: Array.from({ length: E.CELLS }, (_, i) => i), strokeId: 1 }).state;
  assert.ok(JSON.stringify(E.pack(b)).length < 400000, 'worst-case visit save');
  cases++;
}

// 12. the path: cutters are independent of sampling order and rate
{
  const len = grid((c) => 100 + (c * 37) % 2000);
  const pts = Array.from({ length: 120 }, (_, i) => (i * 7) % N);
  for (const tool of ['trimmer', 'foil']) {
    let a = mk({ len }); a = go(a, { tool, cells: pts }).state;
    let b = mk({ len }); for (const p of [...pts].reverse()) b = go(b, { tool, cells: [p] }).state;
    assert.deepEqual([...a.f.len], [...b.f.len], tool + ': the same path at any sampling gives the same result');
  }
  cases++;
}

// 13. mode trays and location
{
  const stub = mk({ len: hair(100) });
  const owned = ['clipper', 'trimmer', 'scissors', 'razor', 'beard', 'foil', 'spray', 'shavingSoap', 'shavingCream', 'lather', 'beardOil', 'beardBalm', 'coldTowel', 'alum', 'aftershave', 'towel', 'massage', 'talc', 'pomade', 'threading', 'singe', 'nose'];
  const cutters = ['clipper', 'trimmer', 'scissors', 'razor', 'beard', 'foil'];
  const free = E.trayFor({ mode: 'free', owned, cutters, state: stub });
  assert.equal(free.cut.length + free.care.length, owned.length, 'Quick Play shows every owned tool, grouped');
  for (const mode of ['requests', 'career', 'fix', 'beard', 'daily']) {
    const t = E.trayFor({ mode, owned, cutters, state: stub, wanted: ['towel'], pinned: { source: 'shavingSoap', finish: 'beardBalm' } });
    assert.ok(t.care.length <= 3, 'the required tool and at most two others: ' + t.care);
    assert.equal(t.care[0], 'towel', 'what the customer asked for comes first');
    assert.ok(!(t.care.includes('shavingSoap') && t.care.includes('shavingCream')), 'soap and cream never together');
    assert.ok(!(t.care.includes('beardOil') && t.care.includes('beardBalm')));
  }
  assert.deepEqual([...E.trayFor({ mode: 'relax', owned, cutters, state: stub, wanted: ['massage'] }).cut], [], 'Relax: cutters only in a request that needs them');
  const rush = E.trayFor({ mode: 'rush', owned, cutters, state: stub });
  assert.ok(rush.care.every((k) => k === 'foil'), 'Rush never adds a preparation chain');
  const hidden = E.trayFor({ mode: 'requests', owned: ['clipper', 'spray'], cutters, state: stub });
  assert.ok(!hidden.care.includes('alum'), 'an unowned tool is never shown');
  const clean = E.trayFor({ mode: 'requests', owned, cutters, state: mk() });
  assert.deepEqual([...clean.care], [], 'nothing useful, nothing shown');
  // every city is neutral until reviewed: selection weight 10000, no starter change, no loan
  const cities = ['lagos', 'london', 'karachi', 'sao-paulo', 'tokyo', 'paris'];
  for (const c of cities) for (const k of Object.keys(E.OVERLAY)) assert.equal(E.cityWeight(k, c), 10000, c + ' ' + k);
  for (const c of cities) { assert.deepEqual([...E.starterFor(c)], [...E.STARTER], 'provisional cities share one viable set'); assert.equal(E.loanFor(c, ['clipper'], []), null); }
  // the mechanism, when a row is reviewed one day
  const conf = { karachi: 10000 };
  assert.equal(E.cityWeight('alum', 'karachi', conf), 12500);
  assert.equal(E.cityWeight('alum', 'tokyo', conf), 10000);
  assert.ok(E.starterFor('karachi', conf).length > E.STARTER.length);
  assert.ok(E.STARTER.includes('clipper') && E.STARTER.includes('trimmer') && E.STARTER.includes('talc'), 'bulk, precision, cleanup');
  const loan = E.loanFor('karachi', ['clipper'], [], conf);
  assert.ok(loan);
  assert.equal(E.loanFor('karachi', ['clipper'], ['karachi'], conf), null, 'one introduction per city');
  // location never changes physics: the reducer takes no city at all
  assert.ok(!/city/i.test(ctx.HSC.effects.applyTool.toString()));
  cases++;
}

// 14. rewards: nothing new pays, and no reward without a delta
{
  const paid = Object.entries(E.TOOLS).filter(([, d]) => d.paid).map(([k]) => k).sort();
  assert.deepEqual(paid, ['aftershave', 'lather', 'massage', 'nose', 'pomade', 'singe', 'talc', 'threading', 'towel'], 'exactly the nine existing services can reach servicesDone');
  // every tool, driven only by strokes with no effect: no completion, no steps, no sequence
  const blank = mk();
  for (const tool of Object.keys(E.TOOLS)) {
    for (const st of [{ tool }, { tool, cells: [] }, { tool, cells: [1], setting: 0, close: true, strokeId: 1, ms: 0 }, { tool, bundles: [] }, { tool, removed: 0 }]) {
      const r = go(blank, st);
      // the razor's edge on bare skin is the one exception: real skin stress (contract 4.4), but no hair and no credit
      if (tool === 'spray' && st.cells && st.cells.length) { assert.equal(r.effect.removedLengthQuanta, 0); assert.equal(r.state.done.length + r.state.steps.length, 0); continue; } // water on skin is a real change
      if (tool === 'razor' && st.cells && st.cells.length) { assert.equal(r.effect.removedLengthQuanta, 0); assert.equal(r.effect.hairCells, 0); assert.equal(r.state.done.length + r.state.steps.length, 0); continue; }
      assert.equal(r.state, blank, tool + ' with no effect keeps the same state');
      assert.equal(r.effect.changed, false);
      assert.equal(r.effect.afterHash, r.effect.beforeHash);
      assert.ok(r.effect.reason, tool + ' says why');
    }
  }
  assert.equal(blank.seq, 0);
  assert.equal(blank.done.length + blank.steps.length, 0);
  // a job's payout with what the reducer proved: the service list comes from state.done only
  const job = { kind: 'requests', stars: 3, valid: true, servicesRequested: ['towel'], servicesDone: blank.done };
  assert.equal(ECO.payout(job).total, 36, 'an empty state adds nothing to the fee');
  cases++;
}

// 15. the audio engine: one context, cached buffers, seeded variation, no result without a delta
{
  class Param { constructor() { this.value = 0; } setValueAtTime() {} exponentialRampToValueAtTime() {} linearRampToValueAtTime() {} setValueCurveAtTime(a) { peak = Math.max(peak, Math.max(...a)); } }
  let peak = 0, contexts = 0, buffers = 0, rates = [];
  const node = () => ({ connect(n) { return n; }, disconnect() {}, gain: new Param(), frequency: new Param(), Q: new Param(), threshold: new Param(), knee: new Param(), ratio: new Param(), attack: new Param(), release: new Param(), playbackRate: { set value(v) { rates.push(v); } }, start() {}, stop() {} });
  class FakeAC { constructor() { contexts++; this.state = 'running'; this.currentTime = 1; this.sampleRate = 8000; this.destination = {}; } createGain() { return node(); } createDynamicsCompressor() { return node(); } createBiquadFilter() { return node(); } createBufferSource() { return node(); } createOscillator() { return node(); } createBuffer(c, n) { buffers++; const d = new Float32Array(n); return { getChannelData: () => d }; } resume() { return Promise.resolve(); } }
  const view = { audio: true, paused: false, volume: 1 };
  const a = load(['audio.js'], { AudioContext: FakeAC, skinFadeStudio: { getView: () => view }, document: { visibilityState: 'visible' } }).HSC.audio;
  const rec = (seq, changed) => ({ toolId: 'foil', changed, eventSequence: seq, hairCells: 40, foamRemoved: 0, perFieldDeltas: {}, changedCount: 40, removedLengthQuanta: 100 });
  assert.equal(a.effect(rec(1, false)), false, 'a zero-delta record has no result layer');
  assert.equal(a.effect(null), false);
  assert.equal(a.stats().result, 0);
  assert.equal(contexts, 0, 'no context until something is really heard');
  assert.equal(a.effect(rec(1, true)), true);
  for (let i = 2; i < 200; i++) a.effect(rec(i, true));
  assert.equal(contexts, 1, 'one AudioContext for every sound');
  assert.ok(buffers <= 2, 'noise buffers are cached by recipe, not made per sound');
  a.stop();
  assert.equal(a.stats().live, 0, 'stop silences every scheduled voice');
  rates = []; a.effect(rec(5, true)); a.stop(); const first = rates.slice();
  rates = []; a.effect(rec(5, true)); a.stop();
  assert.deepEqual(rates, first, 'variation is seeded by tool, sequence and layer');
  view.audio = false;
  const before = a.stats().result;
  a.effect(rec(9, true));
  assert.equal(a.stats().voices, 0, 'muted is silent');
  assert.ok(a.stats().result >= before);
  cases++;
}

// 16. 100,000 deterministic randomized strokes per tool
{
  const STROKES = +(process.env.TOOL_STROKES || 100000);
  const lcg = (seed) => { let a = seed >>> 0 || 1; return (n) => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return Math.floor((a / 4294967296) * n); }; };
  const toolIds = Object.keys(E.TOOLS);
  const started = Date.now();
  let total = 0, positive = 0;
  const U = ['wet', 'dry', 'cond', 'shine', 'hold', 'oil', 'balm', 'soap', 'cream', 'foam', 'heat', 'moist', 'heatRem', 'moistRem', 'irr', 'stress', 'soothe', 'fresh', 'recent', 'cold', 'alum', 'after'];
  const mask = new Uint8Array(N); for (let c = 0; c < N; c += 17) mask[c] = 1;
  const browStray = new Uint8Array(BN); for (let c = 0; c < BN; c += 5) browStray[c] = 1;
  const fresh = (R) => { const len = grid((c) => (mask[c] ? 0 : R(3) ? 5 + R(1800) : R(250))); return mk({ len, mask, browStray, brow: Uint16Array.from({ length: BN }, () => E.browQOf(R(3))), nose: E.noseOf(R(1000), 30 + R(50)), ear: E.earOf(R(1000), 0.05 + R(100) / 500), source: R(4) ? undefined : R(100000) }); };
  for (const tool of toolIds) {
    const R = lcg(0x51ed + total + tool.length * 977);
    let s = fresh(R), n = 0, pump = 0, strokeId = 1, masked = [...mask.keys()].filter((c) => mask[c]);
    let lastCheck = null;
    for (let i = 0; i < STROKES; i++) {
      // refresh the customer now and then so strokes keep hitting live state, and mix in a little of the chain
      if (i % 500 === 499) { s = fresh(R); pump = 0; }
      const k = 1 + R(24), base = R(N), cells = [], weights = [];
      for (let j = 0; j < k; j++) { cells.push((base + j * (1 + R(3))) % N); weights.push(R(10001)); }
      if (i % 37 === 0) { cells.push(N + 5, -1, 1.5); weights.push(5, 5, 5); } // garbage ids are ignored
      if (i % 11 === 0) strokeId = (strokeId % 60000) + 1;
      if (i % 9 === 0 && tool !== 'lather') { const r = go(s, { tool: 'spray', cells: cells.slice(0, 6) }); s = r.state; }
      if (tool === 'lather' && i % 5 === 0) s = go(s, { tool: 'shavingCream', pump: ++pump }).state;
      if (tool === 'coldTowel' || tool === 'alum' || tool === 'aftershave') { if (i % 7 === 0) s = go(s, { tool: 'razor', cells: cells.slice(0, 4), strokeId }).state; if (i % 13 === 0) s = go(s, { tool: 'towel', cells, ms: 300 }).state; }
      const st = { tool, cells, weights, setting: R(6), close: R(4) > 0, strokeId, ms: R(250), moved: R(5) > 0, zone: ['L', 'R', 'C', null][R(4)], pump: tool === 'shavingCream' ? (R(4) ? ++pump : 0) : 0, removed: R(9), avail: 200, elig: cells.slice(0, 8), browCells: [R(BN), R(BN), R(BN)], bundles: [R(30), R(30), R(30)], surface: R(5) ? 'beard' : 'brow', dirX: R(20001) - 10000, dirY: R(20001) - 10000 };
      const before = s, r = go(s, st), e = r.effect, a = r.state;
      total++;
      if (!e.changed) {
        assert.equal(a, before, tool + ': a zero effect leaves the same state');
        assert.ok(e.reason, tool + ': a zero effect has a reason');
      } else {
        positive++; n++;
        assert.notEqual(a, before);
        assert.equal(a.seq, before.seq + 1, tool + ': one sequence per committed effect');
        assert.notEqual(e.afterHash, e.beforeHash, tool + ': a committed effect changes the hash');
        assert.ok(e.changedFields.length > 0);
        if (e.completed) assert.ok(a.done.includes(e.completed));
        // no reward without a delta: a completion can only arrive with a positive record, and only a paid id
        for (const d of a.done) if (!before.done.includes(d)) { assert.equal(d, e.completed); assert.equal(E.TOOLS[d].paid, true); }
      }
      // the before state is immutable and cutters never lengthen
      const L0 = before.f.len, L1 = a.f.len;
      if (L0 !== L1) for (const c of e.cells) if (L1[c] > L0[c]) assert.fail(tool + ': hair grew');
      for (const c of masked) if (a.f.len[c] || a.f.foam[c] || a.f.stress[c] || a.f.oil[c]) assert.fail(tool + ': a protected cell changed');
      for (const k2 in a.src) if (a.src[k2] < 0 || a.src[k2] > before.src[k2]) assert.fail(tool + ': a reservoir only falls: ' + k2);
      assert.ok(a.load.cream >= 0 && a.load.water >= 0);
      for (let c = 0; c < a.nose.len.length; c++) if (a.nose.len[c] < a.nose.rim[c] && a.nose.len[c] !== before.nose.len[c]) assert.fail('the internal nose hair stays');
      if (e.changed) for (const c of e.cells) for (const f of U) { const v = a.f[f][c]; if (!(v >= 0 && v <= BP)) assert.fail(`${tool}: ${f}[${c}]=${v}`); }
      if (e.changed && e.cells.length) for (const c of e.cells) { if (Math.abs(a.f.dirX[c]) > BP || Math.abs(a.f.dirY[c]) > BP) assert.fail(tool + ': direction out of range'); if (a.f.recent[c] && a.f.fresh[c] > BP - Math.floor(a.f.stress[c] / 2)) assert.fail(tool + ': the freshness ceiling holds'); }
      // sampled deep checks: hash integrity, undo by the kept before state, exact save and reload
      if (i % 5000 === 17) {
        assert.equal(a.fh, E._hashFields(a.f), tool + ': the incremental hash equals a full recomputation');
        const back = E.unpack(JSON.parse(JSON.stringify(E.pack(a))));
        assert.ok(back, tool + ': the visit reloads');
        assert.equal(E.hash(back), E.hash(a), tool + ': reload is exact');
        assert.equal(E.hash(before), e.beforeHash, tool + ': undo restores the exact before hash');
        lastCheck = i;
      }
      s = a;
      if (i % 100 === 99) s = E.tick(s, 100 + R(2000));
    }
    assert.ok(lastCheck != null);
    assert.ok(n > 0 || tool === 'noop', tool + ': the randomized run produced real effects');
  }
  cases++;
  console.log(`  ${total} strokes (${toolIds.length} tools x ${STROKES}), ${positive} with a real effect, in ${((Date.now() - started) / 1000).toFixed(1)} s`);
}

console.log(`PASS: ${cases} tool and service property groups (guards, blade plane, foil and razor boundaries, finite transfer, product equations, lather chain, service completion, anatomy and masks, undo and save, path invariance, trays and location, no reward without a delta, audio engine, randomized strokes).`);
