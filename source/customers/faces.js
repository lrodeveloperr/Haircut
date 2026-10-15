// ---------------------------------------------------------------------------------------------
// CPU-side face geometry: the beard grid (mirrors the shader's beardUV / beardZone exactly), the
// beard's per-cell surface positions, beard strand roots, and per-customer face-shape morphs.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const { clamp, smooth } = HSC;
  const { BC, AZR, EL0, ELR } = HSC.BEARD_PROJ;

  // beard length levels (mm); state.beard stores indices into this table
  const BEARD_MM = [0, 0.5, 1, 1.5, 2, 3, 4.5, 6, 8, 10, 13, 16, 20, 25, 30, 40, 50];
  const GUARD_MM = { 0: 0.5, 1: 3, 2: 6, 3: 10, 4: 13 };
  const levelOf = (mm) => {
    let best = 0;
    for (let i = 0; i < BEARD_MM.length; i++) if (Math.abs(BEARD_MM[i] - mm) < Math.abs(BEARD_MM[best] - mm)) best = i;
    return best;
  };
  const GUARD_LEVEL = Object.fromEntries(Object.entries(GUARD_MM).map(([g, mm]) => [g, levelOf(mm)]));

  function beardUV(x, y, z) {
    const dx = x - BC[0], dy = y - BC[1], dz = z - BC[2];
    const az = Math.atan2(dx, dz), el = Math.atan2(dy, Math.hypot(dx, dz));
    return [az / (2 * AZR) + 0.5, (el - EL0) / ELR];
  }
  function beardCell(x, y, z) {
    const [u, v] = beardUV(x, y, z);
    if (!(u >= 0 && u <= 1 && v >= 0 && v <= 1)) return -1;
    return Math.min(63, Math.floor(v * 64)) * 128 + Math.min(127, Math.floor(u * 128));
  }
  function lipMask(x, y, z) {
    const ax = Math.abs(x), ly = y - 0.125;
    const lipW = 1 - smooth(0.55, 0.72, ax);
    const upL = (1 - smooth(0.55, 0.95, Math.hypot(x / 0.66, (ly - 0.12) / 0.15))) * (ly >= 0 ? 1 : 0);
    const loL = (1 - smooth(0.55, 0.95, Math.hypot(x / 0.62, (ly + 0.13) / 0.21))) * (ly <= 0 ? 1 : 0);
    return Math.max(upL, loL) * smooth(1.8, 2.2, z) * lipW;
  }
  function beardZone(x, y, z) {
    const ax = Math.abs(x);
    const ang = Math.atan2(ax, z - 0.25);
    const yTop = 0.53 + (1.45 - 0.53) * smooth(0.3, 1.45, ang);
    const yBot = -1.22 + (-0.8 + 1.22) * smooth(0.85, 1.6, ang);
    let m = smooth(yBot - 0.04, yBot + 0.08, y) * (1 - smooth(yTop - 0.08, yTop + 0.03, y));
    m *= 1 - smooth(1.5, 1.64, ang);
    m *= 1 - smooth(0.15, 0.5, lipMask(x, y, z));
    return m;
  }

  // beard style regions, from the cell's (un-morphed) position
  function beardRegion(x, y, z, person) {
    const ax = Math.abs(x);
    const ang = Math.atan2(ax, z - 0.25);
    const cheekShift = 0.1 * (person.beard.cheekLine || 0);
    const neckShift = 0.1 * (person.beard.neckLine || 0);
    const jawY = -0.92 + 0.42 * smooth(0.5, 1.5, ang);
    if (y < -1.22 + 0.42 * smooth(0.85, 1.6, ang) + 0.12 + neckShift * (1 - smooth(0.6, 1.3, ang))) return null; // below the neckline
    const rag = 0.05 * Math.sin(x * 23.1 + y * 7.3) + 0.04 * Math.sin(z * 31.7 - x * 11.9);
    const yTop = 0.53 + 0.92 * smooth(0.3, 1.45, ang) + cheekShift * smooth(0.4, 1.2, ang) * (ang > 0.5 ? 1 : 0) + rag * smooth(0.4, 0.9, ang);
    if (y > yTop) return null;
    if (y > 0.26 && ax < 0.8 && ang < 0.65) return 'moustache';
    if (ax < 0.5 && y < 0.02 && z > 0.9 && y > jawY - 0.3) return 'chin';
    if (y < jawY - 0.12) return 'neck';
    if (Math.abs(y - jawY) < 0.2) return 'jaw';
    return 'cheeks';
  }

  // ---------------- geometry helpers ----------------
  function canonIds(P) {
    const ids = new Map(), canon = new Int32Array(P.length / 3);
    for (let v = 0; v < canon.length; v++) {
      const k = Math.round(P[v * 3] * 1e4) + ',' + Math.round(P[v * 3 + 1] * 1e4) + ',' + Math.round(P[v * 3 + 2] * 1e4);
      let c = ids.get(k);
      if (c === undefined) ids.set(k, (c = ids.size));
      canon[v] = c;
    }
    return { canon, count: ids.size };
  }
  function areaNormals(P, I, canon, count) {
    const acc = new Float32Array(count * 3);
    for (let k = 0; k < I.length; k += 3) {
      const a = I[k] * 3, b = I[k + 1] * 3, c = I[k + 2] * 3;
      const e1x = P[b] - P[a], e1y = P[b + 1] - P[a + 1], e1z = P[b + 2] - P[a + 2];
      const e2x = P[c] - P[a], e2y = P[c + 1] - P[a + 1], e2z = P[c + 2] - P[a + 2];
      const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
      for (const v of [I[k], I[k + 1], I[k + 2]]) {
        const o = canon[v] * 3;
        acc[o] += nx; acc[o + 1] += ny; acc[o + 2] += nz;
      }
    }
    for (let o = 0; o < acc.length; o += 3) {
      const l = Math.hypot(acc[o], acc[o + 1], acc[o + 2]) || 1;
      acc[o] /= l; acc[o + 1] /= l; acc[o + 2] /= l;
    }
    return acc;
  }

  // ---------------- face-shape morphs ----------------
  const eyeC = [0.628, 1.624, 1.627];
  const G = (x, y, z, c, r) => {
    const a = (x - c[0]) / r[0], b = (y - c[1]) / r[1], d = (z - c[2]) / r[2];
    return Math.exp(-(a * a + b * b + d * d));
  };
  // displacement of a base-mesh point for a customer; zero on the scalp, around the eyeballs and on the neck
  function morphDelta(x, y, z, m, age, scalp) {
    const ax = Math.abs(x), sx = x < 0 ? -1 : 1;
    const guard =
      (1 - smooth(0.0, 0.03, scalp)) *
      smooth(0.37, 0.5, Math.hypot(ax - eyeC[0], y - eyeC[1], z - eyeC[2])) *
      smooth(-1.6, -1.2, y);
    if (guard <= 0) return null;
    let dx = 0, dy = 0, dz = 0, g;
    g = G(ax, y, z, [0, 0.7, 2.35], [0.42, 0.3, 0.36]); dx += x * 0.32 * m.noseW * g;
    g = G(ax, y, z, [0, 1.25, 2.4], [0.18, 0.38, 0.35]); dz += 0.08 * m.noseBridge * g;
    g = G(ax, y, z, [0, 0.82, 2.6], [0.2, 0.18, 0.25]); dz += 0.06 * m.noseTip * g; dy -= 0.025 * m.noseTip * g;
    g = G(ax, y, z, [0, 0.12, 2.2], [0.62, 0.25, 0.3]); dz += 0.05 * m.lips * g; dy += (y - 0.125) * 0.3 * m.lips * g;
    g = G(ax, y, z, [1.05, -0.35, 1.0], [0.55, 0.55, 0.8]); dx += x * 0.1 * m.jaw * g;
    g = G(ax, y, z, [0, -0.72, 1.95], [0.42, 0.32, 0.42]); dz += 0.09 * m.chin * g; dy -= 0.035 * m.chin * g;
    g = G(ax, y, z, [1.15, 1.15, 1.65], [0.38, 0.32, 0.42]); dx += sx * 0.065 * m.cheek * g; dz += 0.03 * m.cheek * g;
    g = G(ax, y, z, [0.6, 2.05, 2.05], [0.5, 0.13, 0.25]); dz += 0.045 * m.brow * g;
    // age: jowls and under-eye bags
    const a2 = age * age;
    g = G(ax, y, z, [0.95, -0.5, 1.55], [0.35, 0.28, 0.4]); dy -= 0.07 * a2 * g; dx += sx * 0.03 * a2 * g;
    g = G(ax, y, z, [0.62, 1.3, 1.98], [0.22, 0.07, 0.18]); dz += 0.025 * a2 * g;
    if (!dx && !dy && !dz) return null;
    return [dx * guard, dy * guard, dz * guard];
  }

  // ---------------- beard surface (built once on the un-morphed head) ----------------
  // Cells are a linear combination of mesh vertices, so after a morph each cell's position is
  // recomputed cheaply. Only the outermost surface counts: the mesh also has a closed mouth cavity.
  function buildBeardSurface(P, I) {
    const tris = [];
    for (let k = 0; k < I.length; k += 3) {
      const vs = [I[k], I[k + 1], I[k + 2]];
      if (vs.some((v) => beardZone(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]) > 0.01)) tris.push(k);
    }
    const samples = [];
    const maxR = new Float32Array(8192);
    const radius = (x, y, z) => Math.hypot(x - BC[0], y - BC[1], z - BC[2]);
    for (const k of tris) {
      const a = I[k], b = I[k + 1], c = I[k + 2];
      const pa = [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], pb = [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], pc = [P[c * 3], P[c * 3 + 1], P[c * 3 + 2]];
      const edge = Math.max(Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]), Math.hypot(pc[0] - pa[0], pc[1] - pa[1], pc[2] - pa[2]), Math.hypot(pc[0] - pb[0], pc[1] - pb[1], pc[2] - pb[2]));
      const n = Math.max(2, Math.min(12, Math.ceil(edge / 0.03)));
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
        const wa = 1 - (i + j) / n, wb = i / n, wc = j / n;
        const x = pa[0] * wa + pb[0] * wb + pc[0] * wc, y = pa[1] * wa + pb[1] * wb + pc[1] * wc, z = pa[2] * wa + pb[2] * wb + pc[2] * wc;
        if (beardZone(x, y, z) < 0.02) continue;
        const cell = beardCell(x, y, z);
        if (cell < 0) continue;
        const r = radius(x, y, z);
        if (r > maxR[cell]) maxR[cell] = r;
        samples.push(cell, r, a, b, c, wa, wb, wc);
      }
    }
    // gather outermost samples per cell as vertex weights
    const lists = Array.from({ length: 8192 }, () => new Map());
    for (let s = 0; s < samples.length; s += 8) {
      const cell = samples[s];
      if (samples[s + 1] < maxR[cell] - 0.07) continue;
      const m = lists[cell];
      for (let q = 0; q < 3; q++) m.set(samples[s + 2 + q], (m.get(samples[s + 2 + q]) || 0) + samples[s + 5 + q]);
    }
    // index triangles by the grid cells they cover, so each gap-filling ray tests only a few
    const bins = new Map();
    for (const k of tris) {
      let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
      for (let q = 0; q < 3; q++) {
        const v = I[k + q] * 3, [u, w] = beardUV(P[v], P[v + 1], P[v + 2]);
        u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, w); v1 = Math.max(v1, w);
      }
      if (u1 - u0 > 0.5) continue; // wraps around behind the projection centre: never part of the beard
      const cx0 = Math.max(0, Math.floor(u0 * 128) - 1), cx1 = Math.min(127, Math.floor(u1 * 128) + 1);
      const cy0 = Math.max(0, Math.floor(v0 * 64) - 1), cy1 = Math.min(63, Math.floor(v1 * 64) + 1);
      for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
        const c = cy * 128 + cx;
        let l = bins.get(c);
        if (!l) bins.set(c, (l = []));
        l.push(k);
      }
    }
    // cells too small to catch a sample: cast a ray from the projection centre, keep the farthest hit
    const filled = lists.map((m) => m.size > 0), tried = new Uint8Array(8192);
    for (let pass = 0, grew = true; grew && pass < 6; pass++) {
      grew = false;
      const next = filled.slice();
      for (let cell = 0; cell < 8192; cell++) {
        if (filled[cell] || tried[cell]) continue;
        const cx = cell & 127, cy = cell >> 7;
        let nb = false;
        for (let dy = -1; dy <= 1 && !nb; dy++) for (let dx = -1; dx <= 1; dx++) {
          const yy = cy + dy, xx = cx + dx;
          if (yy >= 0 && yy < 64 && xx >= 0 && xx < 128 && filled[yy * 128 + xx]) { nb = true; break; }
        }
        if (!nb) continue;
        tried[cell] = 1;
        const az = ((cx + 0.5) / 128 - 0.5) * 2 * AZR, el = (cy + 0.5) / 64 * ELR + EL0;
        const d = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
        let best = -1, hit = null;
        for (const k of bins.get(cell) || []) {
          const a = I[k] * 3, b = I[k + 1] * 3, c = I[k + 2] * 3;
          const e1 = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], e2 = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]];
          const px = d[1] * e2[2] - d[2] * e2[1], py = d[2] * e2[0] - d[0] * e2[2], pz = d[0] * e2[1] - d[1] * e2[0];
          const det = e1[0] * px + e1[1] * py + e1[2] * pz;
          if (Math.abs(det) < 1e-9) continue;
          const iv = 1 / det, tx = BC[0] - P[a], ty = BC[1] - P[a + 1], tz = BC[2] - P[a + 2];
          const u = (tx * px + ty * py + tz * pz) * iv;
          if (u < 0 || u > 1) continue;
          const qx = ty * e1[2] - tz * e1[1], qy = tz * e1[0] - tx * e1[2], qz = tx * e1[1] - ty * e1[0];
          const v = (d[0] * qx + d[1] * qy + d[2] * qz) * iv;
          if (v < 0 || u + v > 1) continue;
          const t = (e2[0] * qx + e2[1] * qy + e2[2] * qz) * iv;
          if (t > best) { best = t; hit = [k, 1 - u - v, u, v]; }
        }
        if (!hit) continue;
        const [k, wa, wb, wc] = hit;
        const hx = BC[0] + d[0] * best, hy = BC[1] + d[1] * best, hz = BC[2] + d[2] * best;
        if (beardZone(hx, hy, hz) < 0.02) continue;
        const m = lists[cell];
        m.set(I[k], (m.get(I[k]) || 0) + wa); m.set(I[k + 1], (m.get(I[k + 1]) || 0) + wb); m.set(I[k + 2], (m.get(I[k + 2]) || 0) + wc);
        maxR[cell] = Math.max(maxR[cell], best);
        next[cell] = true;
        grew = true;
      }
      for (let c = 0; c < 8192; c++) filled[c] = next[c];
    }
    // flatten
    const offs = new Int32Array(8193), verts = [], wts = [];
    for (let c = 0; c < 8192; c++) {
      offs[c] = verts.length;
      let tot = 0;
      for (const w of lists[c].values()) tot += w;
      for (const [v, w] of lists[c]) { verts.push(v); wts.push(w / tot); }
    }
    offs[8192] = verts.length;
    return { tris, maxR, offs, verts: Int32Array.from(verts), wts: Float32Array.from(wts) };
  }

  // positions of all beard cells for the current (possibly morphed) vertex positions
  function beardCellPositions(S, P) {
    const pos = new Float32Array(8192 * 3), has = new Uint8Array(8192);
    for (let c = 0; c < 8192; c++) {
      if (S.offs[c] === S.offs[c + 1]) continue;
      has[c] = 1;
      for (let i = S.offs[c]; i < S.offs[c + 1]; i++) {
        const v = S.verts[i] * 3, w = S.wts[i];
        pos[c * 3] += P[v] * w; pos[c * 3 + 1] += P[v + 1] * w; pos[c * 3 + 2] += P[v + 2] * w;
      }
    }
    // spatial buckets for the clipper
    const size = 0.22, buckets = new Map();
    for (let c = 0; c < 8192; c++) {
      if (!has[c]) continue;
      const k = Math.floor(pos[c * 3] / size) + ',' + Math.floor(pos[c * 3 + 1] / size) + ',' + Math.floor(pos[c * 3 + 2] / size);
      let l = buckets.get(k);
      if (!l) buckets.set(k, (l = []));
      l.push(c);
    }
    return { positions: pos, has, spatial: { size, buckets } };
  }

  // beard strand roots: fixed (triangle, barycentric) picks on the outer beard area
  function sampleBeardRoots(P, I, S, count, seed) {
    const R = HSC.rng(seed);
    const areas = [];
    let total = 0;
    for (const k of S.tris) {
      const a = I[k] * 3, b = I[k + 1] * 3, c = I[k + 2] * 3;
      const e1 = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], e2 = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]];
      total += 0.5 * Math.hypot(e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]);
      areas.push(total);
    }
    const tri = new Int32Array(count * 3), bary = new Float32Array(count * 3), base = new Float32Array(count * 3);
    let made = 0, guard = 0;
    while (made < count && guard++ < count * 40) {
      const x = R.next() * total;
      let lo = 0, hi = areas.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (areas[mid] < x) lo = mid + 1; else hi = mid; }
      const k = S.tris[lo];
      const r1 = Math.sqrt(R.next()), r2 = R.next();
      const w = [1 - r1, r1 * (1 - r2), r1 * r2];
      const vs = [I[k], I[k + 1], I[k + 2]];
      const p = [0, 1, 2].map((q) => vs.reduce((s, v, j) => s + P[v * 3 + q] * w[j], 0));
      if (beardZone(...p) < 0.06) continue;
      const cell = beardCell(...p);
      if (cell < 0 || Math.hypot(p[0] - BC[0], p[1] - BC[1], p[2] - BC[2]) < S.maxR[cell] - 0.07) continue;
      tri.set(vs, made * 3); bary.set(w, made * 3); base.set(p, made * 3);
      made++;
    }
    return { count: made, tri, bary, base };
  }

  // the starting beard (length levels per cell) for a customer
  function beardStart(person, S, P) {
    const out = new Array(8192).fill(0);
    if (!S || !person) return out;
    const mm = person.beard.mm || {};
    const style = HSC.BEARD_STYLES[person.beard.style] || {};
    if (!Object.keys(mm).length) return out;
    const cells = beardCellPositions(S, P).positions;
    const raw = new Float32Array(8192);
    for (let c = 0; c < 8192; c++) {
      if (S.offs[c] === S.offs[c + 1]) continue;
      const x = cells[c * 3], y = cells[c * 3 + 1], z = cells[c * 3 + 2];
      if (beardZone(x, y, z) < 0.05) continue;
      let region = beardRegion(x, y, z, person);
      // horseshoe: the moustache runs down past the mouth corners to the jaw
      if (style.horseshoe && region && region !== 'moustache' && region !== 'neck') {
        const ax = Math.abs(x), jawY = -0.92 + 0.42 * smooth(0.5, 1.5, Math.atan2(ax, z - 0.25));
        if (ax > 0.46 && ax < 0.74 && y < 0.3 && y > jawY - 0.02 && z > 1.2) region = 'moustache';
      }
      if (!region) continue;
      // pencil: a thin line just above the lip
      if (style.pencil && region === 'moustache' && (y > 0.37 || Math.abs(x) > 0.62)) continue;
      // a van dyke keeps the chin tuft separate from the moustache
      if (style.chinOnly && region === 'chin' && Math.abs(x) > 0.36) continue;
      // jaw/chin-only styles let a chin region borrow the jaw length and vice versa
      let v = mm[region];
      if (v == null && region === 'jaw' && mm.cheeks) v = mm.cheeks;
      if (v == null && region === 'neck' && person.beard.style === 'chinstrap') v = null;
      if (v == null) continue;
      raw[c] = v;
    }
    // soften length steps between regions (not the outer edges)
    for (let it = 0; it < 2; it++) {
      const src = raw.slice();
      for (let c = 0; c < 8192; c++) {
        if (!src[c]) continue;
        const cx = c & 127, cy = c >> 7;
        let s = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const yy = cy + dy, xx = cx + dx;
          if (yy < 0 || yy > 63 || xx < 0 || xx > 127) continue;
          const v = src[yy * 128 + xx];
          if (v) { s += v; n++; }
        }
        raw[c] = s / n;
      }
    }
    for (let c = 0; c < 8192; c++) if (raw[c] > 0) out[c] = Math.max(1, levelOf(raw[c]));
    return out;
  }

  Object.assign(HSC, {
    BEARD_MM, GUARD_LEVEL, beardUV, beardCell, beardZone, lipMask, beardRegion, canonIds, areaNormals, morphDelta,
    buildBeardSurface, beardCellPositions, sampleBeardRoots, beardStart,
  });
})(globalThis.HSC || (globalThis.HSC = {}));
