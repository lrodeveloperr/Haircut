// Readers for the bake: the game's embedded head (inside src/runtime/game.js) and MakeHuman's CC0 hm08
// base mesh and .target files. MakeHuman data is read from MAKEHUMAN_DATA, defaulting to the MPFB 2
// Blender extension's bundled data. Only CC0 assets are read; no MakeHuman program code is used.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

export const DATA = process.env.MAKEHUMAN_DATA ||
  path.join(os.homedir(), 'Library/Application Support/Blender/4.5/extensions/blender_org/mpfb/data');

// The embedded head: [nv u32][index count u32][min xyz f32][scale xyz f32][positions int16 x3]...
export function gameHead(gamejs) {
  const s = fs.readFileSync(gamejs, 'utf8');
  const m = /var ow=["'`]([A-Za-z0-9+/=]{100000,})["'`]/.exec(s);
  if (!m) throw new Error('embedded head not found in ' + gamejs);
  const raw = Buffer.from(m[1], 'base64');
  const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  const nv = dv.getUint32(0, true);
  const mn = [8, 12, 16].map((o) => dv.getFloat32(o, true)), sc = [20, 24, 28].map((o) => dv.getFloat32(o, true));
  const P = new Float32Array(nv * 3);
  for (let d = 0; d < nv * 3; d++) P[d] = (dv.getInt16(32 + d * 2, true) + 32767) * sc[d % 3] + mn[d % 3];
  return { nv, P };
}

export function readObj() {
  const file = path.join(DATA, '3dobjs/base.obj');
  if (!fs.existsSync(file)) throw new Error('MakeHuman base mesh not found; set MAKEHUMAN_DATA (looked in ' + DATA + ')');
  const V = [], F = [];
  let g = '';
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const p = line.trim().split(/\s+/);
    if (p[0] === 'v') V.push(+p[1], +p[2], +p[3]);
    else if (p[0] === 'g') g = p[1];
    else if (p[0] === 'f') F.push({ g, v: p.slice(1).map((x) => +x.split('/')[0] - 1) });
  }
  return { V: Float64Array.from(V), F };
}

export function target(rel) {
  const text = zlib.gunzipSync(fs.readFileSync(path.join(DATA, 'targets', rel + '.target.gz'))).toString('utf8');
  const idx = [], d = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('#')) continue;
    const p = line.trim().split(/\s+/);
    if (p.length === 4) { idx.push(+p[0]); d.push(+p[1], +p[2], +p[3]); }
  }
  return { idx: Int32Array.from(idx), d: Float64Array.from(d) };
}
