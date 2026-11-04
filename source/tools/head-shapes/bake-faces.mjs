// Bakes MakeHuman's CC0 face-feature targets (nose, mouth, chin, cheeks, ears, forehead, eyebrows; no eye
// targets) onto the game's embedded head as sparse int8 deltas, and pairs them into sliders, writing
// customers/faces-data.js. Every customer then gets a unique face from their seed (customers/faces.js).
//
// Usage (from source/): node tools/head-shapes/bake-faces.mjs
// Left/right targets are summed into one symmetric target; opposite targets (decr/incr, down/up, ...)
// become the two ends of one slider.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { gameHead, readObj, target, DATA } from './load.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const gamejs = path.resolve(here, '../../src/runtime/game.js');
const outFile = path.resolve(here, '../../customers/faces-data.js');
const FOLDERS = ['nose', 'mouth', 'chin', 'cheek', 'ears', 'forehead', 'eyebrows'];
const MIN_DELTA = 0.0015; // game units; smaller per-vertex moves are dropped

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

// targets: symmetric (l-/r- summed) and named by feature
const names = [];
// sideways translations (nose / mouth "trans-in", "trans-out") would push a feature off the face's centre line
const SKIP = /-trans-(in|out)$/;
for (const f of FOLDERS) for (const file of fs.readdirSync(path.join(DATA, 'targets', f))) {
  const n = f + '/' + file.replace('.target.gz', '');
  if (file.endsWith('.target.gz') && !SKIP.test(n)) names.push(n);
}
const sym = new Map(); // logical name -> [target files]
for (const n of names) { const [f, b] = n.split('/'); const k = f + '/' + b.replace(/^[lr]-/, ''); if (!sym.has(k)) sym.set(k, []); sym.get(k).push(n); }
const OPP = [['decr', 'incr'], ['down', 'up'], ['compress', 'uncompress'], ['concave', 'convex'], ['backward', 'forward'], ['in', 'out']];
const sliders = [], used = new Set();
for (const k of [...sym.keys()].sort()) {
  if (used.has(k)) continue;
  const m = /^(.*)-([a-z]+)$/.exec(k), pair = m && OPP.find((p) => p.includes(m[2]));
  const other = pair && m[1] + '-' + pair[pair[0] === m[2] ? 1 : 0];
  if (other && sym.has(other)) { used.add(k); used.add(other); sliders.push({ id: m[1], neg: m[1] + '-' + pair[0], pos: m[1] + '-' + pair[1] }); }
  else { used.add(k); sliders.push({ id: k, neg: null, pos: k }); }
}
const targets = [], tIndex = new Map();
const tgt = (k) => { if (!tIndex.has(k)) { tIndex.set(k, targets.length); targets.push({ k, ...bake(sym.get(k)) }); } return tIndex.get(k); };
// spread per feature (slider standard deviation); translations, rotations and the forehead stay subtle
const SPREAD = (id) =>
  /mouth-angles|laugh-lines|dimples|lip-middle/.test(id) ? 0.15 : // these read as expressions, not features
  // fine nose detail: on the game's lower-resolution head several of these together make ridges
  /nose-(greek|hump|compression|curve|septumangle|nostrils-angle|point-width|width[123])/.test(id) ? 0.14 :
  /volume/.test(id) ? 0.3 :
  /forehead/.test(id) ? 0.25 : /trans|rot/.test(id) ? 0.2 : /^ears\//.test(id) ? 0.35 : /^eyebrows\//.test(id) ? 0.3 : 0.42;
const out = sliders.map((s) => ({ id: s.id, neg: s.neg ? tgt(s.neg) : -1, pos: tgt(s.pos), sd: SPREAD(s.id) }));

// ---- face bases: 20 per phenotype group (same groups as the head shapes), each a full slider recipe ----
// Candidates are drawn with stronger values than individual variation, then picked by farthest-point
// sampling on visible change (slider value x size of its target's movement), so no two bases in a group
// look alike. Customers add their own small variation on top (customers/facegen.js).
const GROUPS = ['north-european', 'mediterranean', 'mena', 'west-african', 'east-african', 'east-asian', 'southeast-asian',
  'south-asian', 'latino', 'indigenous-american', 'pacific-islander', 'mixed']; // as tools/head-shapes/bake.mjs
const PER_GROUP = 20, CANDIDATES = 3000;
const norm = (t) => { let q = 0; for (const x of targets[t].d) q += x * x; return Math.sqrt(q); };
const impact = out.map((s) => [s.neg >= 0 ? norm(s.neg) : 0, norm(s.pos)]);
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (r, sd) => (r() + r() + r() + r() - 2) * 1.732 * sd;
const bases = [];
GROUPS.forEach((gid, gi) => {
  const r = mulberry(0xba5e0000 + gi * 7919), cand = [];
  for (let c = 0; c < CANDIDATES; c++) {
    cand.push(out.map((s) => {
      if (r() > 0.65) { gauss(r, 1); return 0; }
      const v = Math.max(-0.75, Math.min(0.75, gauss(r, s.sd * 1.1)));
      return s.neg < 0 ? Math.max(0, v) : v;
    }));
  }
  const vis = (rec) => rec.map((v, i) => v * (v < 0 ? impact[i][0] : impact[i][1]));
  // coherence: keep the less exaggerated half of the candidates (total visible change), then spread them apart
  let V2 = cand.map(vis);
  const mag = V2.map((x) => Math.hypot(...x)), cut = mag.slice().sort((a, b) => a - b)[Math.floor(mag.length * 0.5)];
  const keep = cand.map((_, c) => c).filter((c) => mag[c] <= cut);
  cand.splice(0, cand.length, ...keep.map((c) => cand[c])); V2 = keep.map((c) => V2[c]);
  const pick = [0], dmin = V2.map((x) => x.reduce((a, y, i) => a + (y - V2[0][i]) ** 2, 0));
  while (pick.length < PER_GROUP) {
    let best = 0;
    for (let c = 1; c < cand.length; c++) if (dmin[c] > dmin[best]) best = c;
    pick.push(best);
    for (let c = 0; c < cand.length; c++) { const d = V2[c].reduce((a, y, i) => a + (y - V2[best][i]) ** 2, 0); if (d < dmin[c]) dmin[c] = d; }
  }
  for (const c of pick) bases.push(cand[c]);
});
// int8 per slider (value x 127), groups in GROUPS order, PER_GROUP bases each
const baseBin = Buffer.alloc(bases.length * out.length);
bases.forEach((rec, b) => rec.forEach((v, i) => baseBin.writeInt8(Math.round(v * 127), b * out.length + i)));

// [target count u16][vertex count u32], per target [scale f32][n u16][idx u16 x n][int8 x 3n]
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
fs.writeFileSync(outFile, `// GENERATED by tools/head-shapes/bake-faces.mjs - do not edit. ${targets.length} MakeHuman CC0 face targets
// (hm08 targets, released CC0 by Data Collection AB in September 2020) as sparse int8 deltas on the game's
// embedded head, paired into ${out.length} sliders, plus ${bases.length} face bases (${PER_GROUP} per phenotype group) as
// slider recipes. ${bin.length} + ${baseBin.length} bytes before base64.
(function (HSC) {
  HSC.FACE_TARGETS_B64 = '${bin.toString('base64')}';
  HSC.FACE_SLIDERS = ${JSON.stringify(out)};
  HSC.FACE_BASE_GROUPS = ${JSON.stringify(GROUPS)};
  HSC.FACE_BASES_PER_GROUP = ${PER_GROUP};
  HSC.FACE_BASES_B64 = '${baseBin.toString('base64')}';
})(globalThis.HSC || (globalThis.HSC = {}));
`);
const verts = targets.reduce((a, t) => a + t.idx.length, 0);
console.log(`face bases ${bases.length} (${baseBin.length} bytes), face targets ${targets.length}, sliders ${out.length}, moved vertices ${verts} (avg ${Math.round(verts / targets.length)}), ${bin.length} bytes, ${zlib.deflateRawSync(bin, { level: 9 }).length} deflated`);
for (const t of targets.slice().sort((a, b) => b.mx - a.mx).slice(0, 6)) console.log(`  largest: ${t.k} max ${t.mx.toFixed(3)} on ${t.idx.length} verts`);
for (const t of targets.filter((t) => t.idx.length === 0)) console.log(`  empty on game head: ${t.k}`);
