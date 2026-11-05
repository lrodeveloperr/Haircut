// Bakes MakeHuman's CC0 facial-expression units (targets/expression/units, one set each for African, Asian and
// Caucasian faces) onto the game's embedded head, writing customers/expressions-data.js. At the reveal each
// customer smiles with the units of his own ancestry mix (the same mix his head shape is baked from), so a smile
// keeps his features instead of borrowing one face's.
//
// Usage (from source/): node tools/head-shapes/bake-expressions.mjs
// Left and right units are summed into one symmetric unit.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { gameHead, readObj, target } from './load.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const gamejs = path.resolve(here, '../../src/runtime/game.js');
const outFile = path.resolve(here, '../../customers/expressions-data.js');
const MIN_DELTA = 0.0015;
const g = gameHead(gamejs), o = readObj();
const group = (name) => { const s = new Set(); for (const f of o.F) if (f.g === name) f.v.forEach((v) => s.add(v)); return [...s]; };
// neutral and eye frame, exactly as the head-shape bake
const V = Float64Array.from(o.V);
for (const [n, w] of [['macrodetails/caucasian-male-young', 1], ['macrodetails/universal-male-young-averagemuscle-averageweight', 1]]) {
  const t = target(n);
  for (let k = 0; k < t.idx.length; k++) { const i = t.idx[k] * 3; V[i] += w * t.d[k * 3]; V[i + 1] += w * t.d[k * 3 + 1]; V[i + 2] += w * t.d[k * 3 + 2]; }
}
const cen = (vs) => { const r = [0, 0, 0]; vs.forEach((v) => { for (let k = 0; k < 3; k++) r[k] += V[v * 3 + k]; }); return r.map((x) => x / vs.length); };
const le = cen(group('joint-l-eye')), re = cen(group('joint-r-eye'));
const S = 1.256 / Math.hypot(le[0] - re[0], le[1] - re[1], le[2] - re[2]), mid = le.map((x, k) => (x + re[k]) / 2);
const toGame = (v) => [(V[v * 3] - mid[0]) * S, (V[v * 3 + 1] - mid[1]) * S + 1.624, (V[v * 3 + 2] - mid[2]) * S + 1.627];

// correspondence (4 nearest hm08 body vertices, inverse-distance weights)
const body = new Set(); for (const f of o.F) if (f.g === 'body') f.v.forEach((v) => body.add(v));
const cell = 0.25, H = new Map(), key = (a, b, c) => a + ',' + b + ',' + c;
for (const v of body) { const p = toGame(v); if (p[1] < -5) continue; const k = key(...p.map((x) => Math.floor(x / cell))); if (!H.has(k)) H.set(k, []); H.get(k).push([v, p]); }
const K = 4, nb = new Int32Array(g.nv * K).fill(-1), nw = new Float32Array(g.nv * K);
for (let i = 0; i < g.nv; i++) {
  const p = [g.P[i * 3], g.P[i * 3 + 1], g.P[i * 3 + 2]], c = p.map((x) => Math.floor(x / cell)), best = [];
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let e = -1; e <= 1; e++) { const L = H.get(key(c[0] + a, c[1] + b, c[2] + e)); if (L) for (const [v, q] of L) best.push([Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]), v]); }
  best.sort((x, y) => x[0] - y[0]);
  if (!best.length || best[0][0] > 0.15 || g.P[i * 3 + 1] < -2.2) continue;
  let ws = 0;
  for (let k = 0; k < Math.min(K, best.length); k++) { const w = 1 / (best[k][0] + 0.01); nb[i * K + k] = best[k][1]; nw[i * K + k] = w; ws += w; }
  for (let k = 0; k < K; k++) nw[i * K + k] /= ws;
}
function bake(names) {
  const D = new Float64Array(o.V.length);
  for (const n of names) { const t = target(n); for (let k = 0; k < t.idx.length; k++) { const i = t.idx[k] * 3; D[i] += t.d[k * 3]; D[i + 1] += t.d[k * 3 + 1]; D[i + 2] += t.d[k * 3 + 2]; } }
  const idx = [], d = [];
  let mx = 0;
  for (let i = 0; i < g.nv; i++) {
    const r = [0, 0, 0];
    for (let k = 0; k < K; k++) { const v = nb[i * K + k]; if (v < 0) continue; for (let a = 0; a < 3; a++) r[a] += nw[i * K + k] * D[v * 3 + a] * S; }
    if (Math.hypot(...r) < MIN_DELTA) continue;
    idx.push(i); d.push(...r); mx = Math.max(mx, ...r.map(Math.abs));
  }
  return { idx, d, mx };
}


const ETH = ['african', 'asian', 'caucasian'];
// a real (Duchenne) smile, as in photos of smiling people: the mouth corners pulled up and back and the mouth
// widened (zygomaticus, risorius), the cheeks bunched up into round apples, the lower lids raised so the eyes narrow,
// deeper nose-to-mouth folds, and the brows a little lower (raised brows read as surprise, not joy).
// Units from expression/units/<ethnicity>/ follow each face type; the cheek and fold shapes are the shared face targets.
const UNITS = {
  smile: ['@mouth-corner-puller'],
  widen: ['@mouth-retraction'],
  squint: ['@eye-left-slit', '@eye-right-slit'],
  // eyes closed in comfort (the hot towel, the massage)
  close: ['@eye-left-closure', '@eye-right-closure'],
  lift: ['@mouth-elevation'],
  browsDown: ['@eyebrows-left-down', '@eyebrows-right-down'],
  cheekUp: ['cheek/l-cheek-trans-up', 'cheek/r-cheek-trans-up'],
  cheekFull: ['cheek/l-cheek-volume-incr', 'cheek/r-cheek-volume-incr'],
  folds: ['mouth/mouth-laugh-lines-in'],
  // a closed smile stretches both lips thin
  lipsThin: ['mouth/mouth-lowerlip-volume-decr', 'mouth/mouth-upperlip-volume-decr', 'mouth/mouth-lowerlip-height-decr'],
};
const targets = [];
for (const e of ETH) for (const [u, files] of Object.entries(UNITS)) targets.push({ k: e + '/' + u, ...bake(files.map((f) => (f[0] === '@' ? 'expression/units/' + e + '/' + f.slice(1) : f))) });
// the phenotype groups' ancestry mix [african, asian, caucasian], as tools/head-shapes/bake.mjs GROUPS
const MIX = {
  'north-european': [0, 0, 1], mediterranean: [0.06, 0.08, 0.86], mena: [0.15, 0.1, 0.75], 'west-african': [1, 0, 0],
  'east-african': [0.78, 0, 0.22], 'east-asian': [0, 1, 0], 'southeast-asian': [0.15, 0.75, 0.1], 'south-asian': [0.22, 0.2, 0.58],
  latino: [0.12, 0.3, 0.58], 'indigenous-american': [0, 0.8, 0.2], 'pacific-islander': [0.3, 0.5, 0.2], mixed: [1 / 3, 1 / 3, 1 / 3],
};
const parts = [Buffer.alloc(6)];
parts[0].writeUInt16LE(targets.length, 0); parts[0].writeUInt32LE(g.nv, 2);
for (const t of targets) {
  const n = t.idx.length, sc = t.mx / 127 || 1e-6, b = Buffer.alloc(6 + n * 5);
  b.writeFloatLE(sc, 0); b.writeUInt16LE(n, 4);
  t.idx.forEach((v, j) => b.writeUInt16LE(v, 6 + j * 2));
  for (let j = 0; j < n * 3; j++) b.writeInt8(Math.max(-127, Math.min(127, Math.round(t.d[j] / sc))), 6 + n * 2 + j);
  parts.push(b);
}
const bin = Buffer.concat(parts);
fs.writeFileSync(outFile, `// GENERATED by tools/head-shapes/bake-expressions.mjs - do not edit. ${targets.length} MakeHuman CC0 expression units
// (hm08 targets/expression/units, released CC0 by Data Collection AB in September 2020) as sparse int8 deltas on the
// game's embedded head: ${Object.keys(UNITS).join(', ')} for ${ETH.join(', ')} faces. ${bin.length} bytes before base64.
(function (HSC) {
  HSC.EXPR_B64 = '${bin.toString('base64')}';
  HSC.EXPR_ETH = ${JSON.stringify(ETH)};
  HSC.EXPR_UNITS = ${JSON.stringify(Object.keys(UNITS))};
  HSC.EXPR_MIX = ${JSON.stringify(MIX)};
})(globalThis.HSC || (globalThis.HSC = {}));
`);
console.log(`expression units ${targets.length}, ${bin.length} bytes, ${zlib.deflateRawSync(bin, { level: 9 }).length} deflated`);
for (const t of targets) console.log(`  ${t.k.padEnd(20)} max ${t.mx.toFixed(3)} on ${t.idx.length} verts`);
