// Bakes the 36 customer head shapes (12 phenotype groups x 3 outlines) from MakeHuman's CC0 targets onto
// the game's embedded head, and writes customers/headshapes-data.js.
//
// Usage (from source/): node tools/head-shapes/bake.mjs
// MakeHuman data: MAKEHUMAN_DATA, else the MPFB 2 Blender extension's bundled data (see load.mjs).
//
// Each shape is the change from the neutral head, measured after aligning both on the eyes (same eye centre
// and eye distance), so only shape remains: eyes stay on the eyeballs and nothing is moved or scaled as a
// whole. The runtime keeps every shape off the scalp (hair and cutting), the eyes and the lower neck.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { gameHead, readObj, target } from './load.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const gamejs = path.resolve(here, '../../src/runtime/game.js');
const outFile = path.resolve(here, '../../customers/headshapes-data.js');

const g = gameHead(gamejs), o = readObj();
const NV = o.V.length / 3;
const cache = new Map();
const T = (n) => { if (!cache.has(n)) cache.set(n, target(n)); return cache.get(n); };
function sum(ws) {
  const D = new Float64Array(NV * 3);
  for (const [n, w] of ws) {
    if (!w) continue;
    const t = T(n);
    for (let k = 0; k < t.idx.length; k++) { const i = t.idx[k] * 3; D[i] += w * t.d[k * 3]; D[i + 1] += w * t.d[k * 3 + 1]; D[i + 2] += w * t.d[k * 3 + 2]; }
  }
  return D;
}
const group = (name) => { const s = new Set(); for (const f of o.F) if (f.g === name) f.v.forEach((v) => s.add(v)); return [...s]; };
const L_EYE = group('joint-l-eye'), R_EYE = group('joint-r-eye');
const GAME_EYE_GAP = 1.256, GAME_EYE_Y = 1.624, GAME_EYE_Z = 1.627; // the game's eye centres are (+-0.628, 1.624, 1.627)
function eyeFrame(V) {
  const c = (vs) => { const r = [0, 0, 0]; vs.forEach((v) => { for (let k = 0; k < 3; k++) r[k] += V[v * 3 + k]; }); return r.map((x) => x / vs.length); };
  const l = c(L_EYE), r = c(R_EYE);
  return { s: GAME_EYE_GAP / Math.hypot(l[0] - r[0], l[1] - r[1], l[2] - r[2]), mid: l.map((x, k) => (x + r[k]) / 2) };
}
const toGame = (V, f, v) => [(V[v * 3] - f.mid[0]) * f.s, (V[v * 3 + 1] - f.mid[1]) * f.s + GAME_EYE_Y, (V[v * 3 + 2] - f.mid[2]) * f.s + GAME_EYE_Z];

// neutral: the young caucasian male, the closest MakeHuman match to the game head (median gap 0.026 units)
const NEUTRAL = [['macrodetails/caucasian-male-young', 1], ['macrodetails/universal-male-young-averagemuscle-averageweight', 1]];
const V = Float64Array.from(o.V);
{ const D = sum(NEUTRAL); for (let i = 0; i < V.length; i++) V[i] += D[i]; }
const F0 = eyeFrame(V);

// correspondence: each game vertex takes the 4 nearest hm08 body vertices (inverse-distance weights)
const body = new Set(); for (const f of o.F) if (f.g === 'body') f.v.forEach((v) => body.add(v));
const cell = 0.25, H = new Map(), key = (a, b, c) => a + ',' + b + ',' + c;
for (const v of body) {
  const p = toGame(V, F0, v);
  if (p[1] < -5) continue;
  const k = key(...p.map((x) => Math.floor(x / cell)));
  if (!H.has(k)) H.set(k, []);
  H.get(k).push([v, p]);
}
const K = 4, nb = new Int32Array(g.nv * K).fill(-1), nw = new Float32Array(g.nv * K);
let unmatched = 0;
for (let i = 0; i < g.nv; i++) {
  const p = [g.P[i * 3], g.P[i * 3 + 1], g.P[i * 3 + 2]], c = p.map((x) => Math.floor(x / cell)), best = [];
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let e = -1; e <= 1; e++) {
    const L = H.get(key(c[0] + a, c[1] + b, c[2] + e));
    if (L) for (const [v, q] of L) best.push([Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]), v]);
  }
  best.sort((x, y) => x[0] - y[0]);
  if (!best.length || best[0][0] > 0.15) { unmatched++; continue; } // eyeballs, mouth interior: left unchanged
  let ws = 0;
  for (let k = 0; k < Math.min(K, best.length); k++) { const w = 1 / (best[k][0] + 0.01); nb[i * K + k] = best[k][1]; nw[i * K + k] = w; ws += w; }
  for (let k = 0; k < K; k++) nw[i * K + k] /= ws;
}

// phenotype groups: MakeHuman's ethnic bone-structure mix (relative to the neutral) plus a few group traits
const E = (af, as, ca) => [['macrodetails/african-male-young', af], ['macrodetails/asian-male-young', as], ['macrodetails/caucasian-male-young', ca - 1]];
const cheeks = (w) => [['cheek/l-cheek-bones-incr', w], ['cheek/r-cheek-bones-incr', w]];
export const GROUPS = [
  ['north-european', E(0, 0, 1), [['forehead/forehead-scale-vert-incr', 0.3]]],
  ['mediterranean', E(0.06, 0.08, 0.86), [['chin/chin-prominent-incr', 0.3]]],
  ['mena', E(0.15, 0.1, 0.75), [['forehead/forehead-trans-backward', 0.25], ['chin/chin-width-incr', 0.2]]],
  ['west-african', E(1, 0, 0), []],
  ['east-african', E(0.78, 0, 0.22), [['head/head-scale-horiz-decr', 0.25], ['chin/chin-height-incr', 0.25]]],
  ['east-asian', E(0, 1, 0), []],
  ['southeast-asian', E(0.15, 0.75, 0.1), [['head/head-scale-vert-decr', 0.2]]],
  ['south-asian', E(0.22, 0.2, 0.58), []],
  ['latino', E(0.12, 0.3, 0.58), cheeks(0.2)],
  ['indigenous-american', E(0, 0.8, 0.2), [['chin/chin-width-incr', 0.3], ['forehead/forehead-temple-incr', 0.2]]],
  ['pacific-islander', E(0.3, 0.5, 0.2), [['head/head-fat-incr', 0.35], ['chin/chin-width-incr', 0.3]]],
  ['mixed', E(1 / 3, 1 / 3, 1 / 3), []],
];
const OUTLINES = [
  ['oval', [['head/head-oval', 0.7], ['head/head-scale-vert-incr', 0.25], ['chin/chin-height-incr', 0.2]]],
  ['broad', [['head/head-round', 0.55], ['head/head-square', 0.25], ['head/head-fat-incr', 0.3], ['chin/chin-width-incr', 0.35], ...cheeks(0.25)]],
  ['angular', [['head/head-rectangular', 0.45], ['head/head-diamond', 0.3], ['chin/chin-prominent-incr', 0.35], ['chin/chin-bones-incr', 0.4], ...cheeks(0.35)]],
];

const shapes = [];
for (const [gid, eth, extra] of GROUPS) for (const [oid, outline] of OUTLINES) {
  const D = sum([...eth, ...extra, ...outline]);
  const W = new Float64Array(V.length);
  for (let i = 0; i < V.length; i++) W[i] = V[i] + D[i];
  const F1 = eyeFrame(W);
  const d = new Float32Array(g.nv * 3);
  let mx = 0;
  for (let i = 0; i < g.nv; i++) {
    if (g.P[i * 3 + 1] < -2.2) continue; // shoulders and chest: the robe
    for (let k = 0; k < K; k++) {
      const v = nb[i * K + k];
      if (v < 0) continue;
      const a = toGame(W, F1, v), b = toGame(V, F0, v), w = nw[i * K + k];
      for (let c = 0; c < 3; c++) d[i * 3 + c] += w * (a[c] - b[c]);
    }
  }
  for (const x of d) mx = Math.max(mx, Math.abs(x));
  shapes.push({ id: gid + '/' + oid, d, mx });
}

// [count u16][vertex count u32], then per shape [scale f32][int8 x,y,z per vertex]
const hdr = Buffer.alloc(6);
hdr.writeUInt16LE(shapes.length, 0);
hdr.writeUInt32LE(g.nv, 2);
const parts = [hdr];
for (const s of shapes) {
  const sc = s.mx / 127 || 1e-6, b = Buffer.alloc(4 + g.nv * 3);
  b.writeFloatLE(sc, 0);
  for (let i = 0; i < g.nv * 3; i++) b.writeInt8(Math.max(-127, Math.min(127, Math.round(s.d[i] / sc))), 4 + i);
  parts.push(b);
}
const bin = Buffer.concat(parts);
const header = `// GENERATED by tools/head-shapes/bake.mjs - do not edit. ${shapes.length} customer head shapes from MakeHuman CC0
// targets (hm08 base mesh and targets, released CC0 by Data Collection AB in September 2020), as int8 deltas per
// vertex of the game's embedded head. ${bin.length} bytes before base64.
`;
fs.writeFileSync(outFile, header + `(function (HSC) {\n  HSC.HEAD_SHAPES_B64 = '${bin.toString('base64')}';\n  HSC.HEAD_SHAPE_IDS = ${JSON.stringify(shapes.map((s) => s.id))};\n})(globalThis.HSC || (globalThis.HSC = {}));\n`);
console.log(`head shapes: ${shapes.length}, game vertices ${g.nv} (${unmatched} unmatched, unchanged), ${bin.length} bytes, ${zlib.deflateRawSync(bin, { level: 9 }).length} deflated`);
for (const s of shapes) console.log(`  ${s.id.padEnd(30)} max ${s.mx.toFixed(3)}`);
