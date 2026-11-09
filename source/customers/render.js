// ---------------------------------------------------------------------------------------------
// Renderer glue: attaches to the game's head mesh and materials, then applies a customer.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const { clamp, smooth } = HSC;
  const LIFT = 0.6, EXPOSURE = 1.2;

  // the game's hair colour presets (uHairTint per colour index)
  const TINTS = [
    [0.3, 0.32, 0.38], [0.48, 0.48, 0.52], [0.72, 0.68, 0.64], [1, 1, 1], [1.55, 1.36, 1.16], [2.3, 1.95, 1.55],
    [3.1, 2.65, 1.95], [4, 3.35, 2.05], [5.1, 4.45, 3.1], [2.4, 1.25, 0.8], [4, 1.8, 0.75], [2.1, 3.15, 5.2],
    // Android colours (phenotypes.js): strawberry blond, ash brown, golden brown, ash blond, copper, blue-black
    [4.4, 2.6, 1.35], [1.4, 1.36, 1.32], [2.5, 1.9, 1.2], [3, 2.85, 2.5], [3.2, 1.55, 0.8], [0.26, 0.3, 0.42],
  ];
  const STRAND_STYLE = {
    straight: (c) => ({ A: [0.22, 0.56, 0.56, 0.5], B: [0.16, 0.1, 0.02, 1], C: [0, 0, 1, 1] }),
    wavy: (c) => ({ A: [0.18, 0.4, 0.62, 0.6], B: [0.2, 0.08, 0.07 + 0.05 * c, 1.4 + 0.6 * c], C: [0, 0, 0.92, 1.05] }),
    curly: (c) => ({ A: [0.1, 0.2, 0.75, 0.8], B: [0.28, 0.04, 0, 1], C: [0.1 + 0.06 * c, 1.6 + 1.0 * c, 0.72 - 0.1 * c, 1.15] }),
    coily: (c) => ({ A: [0.03, 0.05, 0.9, 0.95], B: [0.36, 0, 0, 1], C: [0.16 + 0.08 * c, 3 + 2.5 * c, 0.5 - 0.08 * c, 1.35] }),
  };
  const BEARD_STYLE = {
    straight: { A: [0.04, 0.6, 0.45, 0.12], B: [0, 0, 1, 1] },
    wavy: { A: [0.07, 0.9, 0.5, 0.1], B: [0.03, 1.2, 0.95, 1.05] },
    curly: { A: [0, 1, 0.6, 0.05], B: [0.12, 1.8, 0.75, 1.1] },
    coily: { A: [0, 1, 0.75, 0.02], B: [0.2, 3.5, 0.55, 1.25] },
  };
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const mul = (a, b) => a.map((v, i) => v * b[i]);

  let ctx = null;
  const st = {};

  HSC.attach = function (c) {
    try {
      ctx = c;
      HSC.ctx = c; // turkish.js adds its tools and effects to the same head
      const T = c.T, Pt = c.Pt;
      const P = Pt.attributes.position.array;
      st.base = Float32Array.from(P);
      st.N0 = Float32Array.from(Pt.attributes.normal.array);
      st.coarse = Pt.userData.coarse;
      st.coarseBase = Float32Array.from(st.coarse.pos);
      Pt.setAttribute('hsBase', new T.It(st.base, 3));
      // Built from the un-morphed base head with fixed seeds: identical on every load, so a device
      // cache (HSC.geo, YouTube target only) may supply the stored result instead of recomputing it.
      const baseModel = () => {
        const ci = HSC.canonIds(st.base);
        const nBase = HSC.areaNormals(st.base, Pt.index.array, ci.canon, ci.count);
        const surface = HSC.buildBeardSurface(st.base, Pt.index.array);
        // Android carries a denser beard; the lowest tier still draws today's count (HSC.setDetail)
        const roots = HSC.sampleBeardRoots(st.base, Pt.index.array, surface, globalThis.AndroidHost ? 20000 : 14000, 0xbea7d);
        return { canon: ci.canon, canonCount: ci.count, nBase, surface, roots };
      };
      const model = HSC.geo ? HSC.geo.use('beard', baseModel) : baseModel();
      st.canon = model.canon; st.canonCount = model.canonCount;
      st.nBase = model.nBase;
      // scalp mask per vertex, to keep morphs off the scalp
      st.scalp = new Float32Array(P.length / 3);
      for (let v = 0; v < st.scalp.length; v++) st.scalp[v] = c.Na(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]);
      st.scalpC = new Float32Array(st.coarseBase.length / 3);
      for (let v = 0; v < st.scalpC.length; v++) st.scalpC[v] = c.Na(st.coarseBase[v * 3], st.coarseBase[v * 3 + 1], st.coarseBase[v * 3 + 2]);
      prepareShapes();
      try { prepareExtras(c); } catch (err) { console.error('customers: extras attach failed', err); st.extras = null; }

      // beard length grid texture
      st.beardData = new Uint8Array(8192);
      const tex = new T.uu(st.beardData, 128, 64, T.Jn, T.cr);
      tex.minFilter = tex.magFilter = T.or;
      tex.needsUpdate = true;
      st.beardTex = tex;
      HSC.U.uBeard.value = tex;
      // Android: the brows' trim mask (128 x 32 over both brows), and each cell's place on the brow skin
      if (HSC.U.uBrowMask) {
        st.browData = new Uint8Array(BROW_N).fill(255);
        const bt = new T.uu(st.browData, 128, 32, T.Jn, T.cr);
        bt.minFilter = bt.magFilter = T.or; bt.needsUpdate = true;
        st.browTex = bt; HSC.U.uBrowMask.value = bt;
        // the shaving lather, on the beard grid
        st.foamData = new Uint8Array(8192); const ft = new T.uu(st.foamData, 128, 64, T.Jn, T.cr); ft.minFilter = ft.magFilter = T.or; ft.needsUpdate = true; st.foamTex = ft; HSC.U.uFoam.value = ft;
        st.browCells = browCells(st.base);
        try { st.browMesh = makeBrowMesh(c); c.vt.add(st.browMesh); } catch (err) { console.error('customers: brow strands failed', err); }
      }

      // beard surface + strands
      st.surface = model.surface;
      st.roots = model.roots;
      // a cell with no roots holds no visible hair (the mesh's inner surfaces share the grid): no beard starts there
      st.surface.rooted = new Uint8Array(8192);
      for (let i = 0; i < model.roots.count; i++) { const c = HSC.beardCell(model.roots.base[i * 3], model.roots.base[i * 3 + 1], model.roots.base[i * 3 + 2]); if (c >= 0) st.surface.rooted[c] = 1; }
      // the roots are random, so a cell of the outer skin can miss them all. Among rooted cells of the same surface (at
      // the same distance from the grid's centre) it still holds beard: a zero there thinned the beard and its shadow in
      // scattered spots, since the length grid is filtered between cells
      {
        const R0 = st.surface.rooted.slice(), mr = st.surface.maxR, S0 = st.surface;
        for (let c = 0; c < 8192; c++) {
          if (R0[c] || S0.offs[c] === S0.offs[c + 1]) continue;
          const cx = c & 127, cy = c >> 7;
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const xx = cx + dx, yy = cy + dy, nb = yy * 128 + xx;
            if ((dx || dy) && xx >= 0 && xx < 128 && yy >= 0 && yy < 64 && R0[nb] && Math.abs(mr[nb] - mr[c]) < 0.1) n++;
          }
          if (n >= 4) st.surface.rooted[c] = 1;
        }
      }
      st.beardCells = HSC.beardCellPositions(st.surface, st.base);
      HSC.beardSurface = st.beardCells;
      st.beardMesh = makeBeardMesh(c, st.roots);
      c.vt.add(st.beardMesh);
      try { HSC.attachClippings && HSC.attachClippings(c); } catch (err) { console.error('customers: clippings attach failed', err); }
      try { HSC.attachGown && c.robe && HSC.attachGown(c.robe, c.T); } catch (err) { console.error('customers: gown attach failed', err); }
      HSC.ready = true;
      try { HSC.onDetailChange(); } catch (err) { console.error('customers: detail apply failed', err); }
    } catch (err) {
      console.error('customers: attach failed', err);
      HSC.ready = false;
    }
  };

  function makeBeardMesh(c, roots) {
    const T = c.T, n = roots.count;
    const g = new T.af();
    const pos = [], idx = [];
    const SEG = 8;
    for (let s = 0; s <= SEG; s++) {
      pos.push(-1, s / SEG, 0, 1, s / SEG, 0);
      if (s < SEG) { const u = s * 2; idx.push(u, u + 1, u + 2, u + 1, u + 3, u + 2); }
    }
    g.setAttribute('position', new T.mt(pos, 3));
    g.setIndex(idx);
    st.aRoot = new Float32Array(n * 3);
    st.aNormal = new Float32Array(n * 3);
    const seeds = new Float32Array(n * 3), R = HSC.rng(911);
    for (let i = 0; i < n * 3; i++) seeds[i] = R.next();
    g.setAttribute('aRoot', new T.Ra(st.aRoot, 3));
    g.setAttribute('aNormal', new T.Ra(st.aNormal, 3));
    g.setAttribute('aBase', new T.Ra(roots.base.subarray(0, n * 3), 3));
    g.setAttribute('aSeed', new T.Ra(seeds, 3));
    g.instanceCount = n;
    updateRoots(st.base, st.N0);
    const mat = new T.fr({
      vertexShader: HSC.glsl.beardVert(c.Ql),
      fragmentShader: HSC.glsl.beardFrag(c.Ql),
      uniforms: Object.assign({ uGrid: c.uGrid, uHairTint: c.uHairTint, uDensity: c.uDensity, uWidth: { value: 1 } }, c.light, HSC.U),
      side: T.$t,
    });
    const mesh = new T.Ze(g, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    mesh.visible = false;
    return mesh;
  }

  function updateRoots(P, N) {
    const r = st.roots;
    for (let i = 0; i < r.count; i++) {
      let nx = 0, ny = 0, nz = 0, x = 0, y = 0, z = 0;
      for (let j = 0; j < 3; j++) {
        const v = r.tri[i * 3 + j] * 3, w = r.bary[i * 3 + j];
        x += P[v] * w; y += P[v + 1] * w; z += P[v + 2] * w;
        nx += N[v] * w; ny += N[v + 1] * w; nz += N[v + 2] * w;
      }
      const l = Math.hypot(nx, ny, nz) || 1;
      const at = i * 3;
      st.aRoot[at] = x; st.aRoot[at + 1] = y; st.aRoot[at + 2] = z;
      st.aNormal[at] = nx / l; st.aNormal[at + 1] = ny / l; st.aNormal[at + 2] = nz / l;
    }
    if (st.beardMesh) {
      st.beardMesh.geometry.attributes.aRoot.needsUpdate = true;
      st.beardMesh.geometry.attributes.aNormal.needsUpdate = true;
    }
  }

  // ---- head shapes (headshapes.js): decoded once, per vertex of the coarse head ----
  // The drawn head is a refinement of the coarse head (smooth.js), so each drawn vertex takes the deltas at
  // its place in the coarse triangle it came from. Every delta is faded out on and near the scalp (hair and
  // cutting keep the original head), around the eyeballs and down the neck (the robe).
  function prepareShapes() {
    st.shapes = null;
    if (!HSC.HEAD_SHAPES_B64 || !HSC.headShapeOf) return;
    const t0 = performance.now();
    try {
      const bin = atob(HSC.HEAD_SHAPES_B64), raw = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i);
      const tDecode = performance.now() - t0;
      const dv = new DataView(raw.buffer), n = dv.getUint16(0, true), nv = dv.getUint32(2, true);
      const CB = st.coarseBase, CI = st.coarse.idx, org = ctx.Pt.userData.org, SI = ctx.Pt.index.array, B = st.base;
      const ns = B.length / 3;
      // the drawn head keeps the coarse vertices first, in order (smooth.js only appends split points)
      let same = !!(n && CI && org && nv * 3 === CB.length && ns >= nv);
      for (let i = 0; same && i < nv * 3; i++) if (Math.abs(B[i] - CB[i]) > 1e-5) same = false;
      if (!same) { console.error('customers: head shapes do not match the head'); return; }
      const shapes = [];
      for (let k = 0, o = 6; k < n; k++, o += 4 + nv * 3) shapes.push({ sc: dv.getFloat32(o, true), q: new Int8Array(raw.buffer, o + 4, nv * 3) });

      // where a shape may act: off the scalp, the eyeballs and the lower neck (as the face-shape morph)
      const eye = [0.628, 1.624, 1.627];
      const zone = (x, y, z, scalp) =>
        (1 - smooth(0.0, 0.03, scalp)) * smooth(0.37, 0.5, Math.hypot(Math.abs(x) - eye[0], y - eye[1], z - eye[2])) * smooth(-1.9, -1.3, y);

      // distance over the head's surface to the hair-bearing scalp; shapes fade out over the last 0.9 units
      // before the hairline, so skin never rises over the hair roots or the short hair lying on the temples
      const canon = new Int32Array(nv), ids = new Map();
      for (let i = 0; i < nv; i++) {
        const k = (Math.round(CB[i * 3] * 1e4) + 1e5) * 4e10 + (Math.round(CB[i * 3 + 1] * 1e4) + 1e5) * 2e5 + Math.round(CB[i * 3 + 2] * 1e4) + 1e5;
        let c = ids.get(k);
        if (c === undefined) { c = ids.size; ids.set(k, c); }
        canon[i] = c;
      }
      const nc = ids.size, dist = new Float32Array(nc).fill(1);
      for (let i = 0; i < nv; i++) if (st.scalpC[i] > 0.02) dist[canon[i]] = 0;
      const E = [];
      for (let t = 0; t < CI.length; t += 3) for (let j = 0; j < 3; j++) {
        const a = CI[t + j], b = CI[t + (j + 1) % 3];
        E.push(canon[a], canon[b], Math.hypot(CB[a * 3] - CB[b * 3], CB[a * 3 + 1] - CB[b * 3 + 1], CB[a * 3 + 2] - CB[b * 3 + 2]));
      }
      for (let pass = 0, changed = true; changed && pass < 80; pass++) {
        changed = false;
        for (let e = 0; e < E.length; e += 3) {
          const a = E[e], b = E[e + 1], l = E[e + 2];
          if (dist[a] + l < dist[b]) { dist[b] = dist[a] + l; changed = true; } else if (dist[b] + l < dist[a]) { dist[a] = dist[b] + l; changed = true; }
        }
      }
      const fadeC = new Float32Array(nv);
      st.sgC = new Float32Array(nv);
      for (let i = 0; i < nv; i++) {
        fadeC[i] = smooth(0.1, 0.9, dist[canon[i]]);
        st.sgC[i] = zone(CB[i * 3], CB[i * 3 + 1], CB[i * 3 + 2], st.scalpC[i]) * fadeC[i];
      }

      // each drawn vertex: itself (a coarse vertex) or its barycentric place in the coarse triangle it came from
      const K = 3;
      st.nbr = new Int32Array(ns * K).fill(-1);
      st.nbw = new Float32Array(ns * K);
      for (let v = 0; v < nv; v++) { st.nbr[v * K] = v; st.nbw[v * K] = 1; }
      for (let t = 0; t < org.length; t++) {
        const c = org[t] * 3, i0 = CI[c], i1 = CI[c + 1], i2 = CI[c + 2];
        const ax = CB[i0 * 3], ay = CB[i0 * 3 + 1], az = CB[i0 * 3 + 2];
        const ux = CB[i1 * 3] - ax, uy = CB[i1 * 3 + 1] - ay, uz = CB[i1 * 3 + 2] - az;
        const wx = CB[i2 * 3] - ax, wy = CB[i2 * 3 + 1] - ay, wz = CB[i2 * 3 + 2] - az;
        const uu = ux * ux + uy * uy + uz * uz, uw = ux * wx + uy * wy + uz * wz, ww = wx * wx + wy * wy + wz * wz, den = uu * ww - uw * uw || 1e-12;
        for (let j = 0; j < 3; j++) {
          const v = SI[t * 3 + j];
          if (st.nbr[v * K] >= 0) continue;
          const px = B[v * 3] - ax, py = B[v * 3 + 1] - ay, pz = B[v * 3 + 2] - az;
          const pu = px * ux + py * uy + pz * uz, pw = px * wx + py * wy + pz * wz;
          let b1 = Math.max(0, (ww * pu - uw * pw) / den), b2 = Math.max(0, (uu * pw - uw * pu) / den), b0 = Math.max(0, 1 - b1 - b2);
          const sum = b0 + b1 + b2 || 1;
          st.nbr[v * K] = i0; st.nbw[v * K] = b0 / sum;
          st.nbr[v * K + 1] = i1; st.nbw[v * K + 1] = b1 / sum;
          st.nbr[v * K + 2] = i2; st.nbw[v * K + 2] = b2 / sum;
        }
      }
      // expressions (expressions-data.js) may also move the lids and brows, which the shape guard keeps still:
      // only the eyeballs themselves (radius 0.305), the scalp and the lower neck stay out
      const zoneE = (x, y, z, scalp) => (1 - smooth(0.0, 0.03, scalp)) * smooth(0.33, 0.4, Math.hypot(Math.abs(x) - eye[0], y - eye[1], z - eye[2])) * smooth(-1.9, -1.3, y);
      st.eg = new Float32Array(ns);
      for (let v = 0; v < ns; v++) {
        const ge = zoneE(B[v * 3], B[v * 3 + 1], B[v * 3 + 2], st.scalp[v]);
        if (ge <= 0) continue;
        let fade = 0;
        for (let k = 0; k < K; k++) { const i = st.nbr[v * K + k]; if (i >= 0) fade += st.nbw[v * K + k] * fadeC[i]; }
        st.eg[v] = ge * fade;
      }
      st.sg = new Float32Array(ns);
      for (let v = 0; v < ns; v++) {
        const g = zone(B[v * 3], B[v * 3 + 1], B[v * 3 + 2], st.scalp[v]);
        if (g <= 0) continue;
        let fade = 0;
        for (let k = 0; k < K; k++) { const i = st.nbr[v * K + k]; if (i >= 0) fade += st.nbw[v * K + k] * fadeC[i]; }
        st.sg[v] = g * fade;
      }
      st.shapes = shapes;
      // face-feature targets (facegen.js): sparse [scale f32][n u16][idx u16 x n][int8 x 3n] each
      st.faces = null;
      if (HSC.FACE_TARGETS_B64 && HSC.faceOf) {
        const fb = atob(HSC.FACE_TARGETS_B64), fr = new Uint8Array(fb.length);
        for (let i = 0; i < fb.length; i++) fr[i] = fb.charCodeAt(i);
        const fv = new DataView(fr.buffer), fn = fv.getUint16(0, true);
        if (fv.getUint32(2, true) === nv) {
          const faces = [];
          for (let k = 0, o = 6; k < fn; k++) {
            const sc = fv.getFloat32(o, true), m = fv.getUint16(o + 4, true), idx = new Uint16Array(m);
            for (let j = 0; j < m; j++) idx[j] = fv.getUint16(o + 6 + j * 2, true);
            faces.push({ sc, idx, q: new Int8Array(fr.buffer, o + 6 + m * 2, m * 3) });
            o += 6 + m * 5;
          }
          st.faces = faces;
        } else console.error('customers: face targets do not match the head');
      }
      st.D = new Float32Array(nv * 3);
      // expression units (sparse, the faces' format), [ethnicity][unit]
      st.expr = null;
      if (HSC.EXPR_B64) {
        const eb = atob(HSC.EXPR_B64), er = new Uint8Array(eb.length);
        for (let i = 0; i < eb.length; i++) er[i] = eb.charCodeAt(i);
        const ev = new DataView(er.buffer), en = ev.getUint16(0, true);
        if (ev.getUint32(2, true) === nv) {
          const units = [];
          for (let k = 0, o = 6; k < en; k++) {
            const sc = ev.getFloat32(o, true), m = ev.getUint16(o + 4, true), idx = new Uint16Array(m);
            for (let j = 0; j < m; j++) idx[j] = ev.getUint16(o + 6 + j * 2, true);
            units.push({ sc, idx, q: new Int8Array(er.buffer, o + 6 + m * 2, m * 3) });
            o += 6 + m * 5;
          }
          st.expr = units;
          st.DE = new Float32Array(nv * 3);
        }
      }
      if (HSC.startupTiming) { HSC.startupTiming.headShapesMs = Math.round(performance.now() - t0); HSC.startupTiming.headShapesDecodeMs = Math.round(tDecode); }
    } catch (err) {
      console.error('customers: head shapes failed', err);
      st.shapes = null;
    }
  }

  // ---- Android details and accessories (extras.js) ----
  // Places are found once on the coarse head (its vertices come first in the drawn head, in order): skin where a
  // mole may sit, both earlobes and the bowl of both ears. Skin details live in the un-morphed head space the skin
  // shader draws in; accessories follow the morphed ear.
  function prepareExtras(c) {
    st.extras = null;
    if (!HSC.skinDetailsOf || !HSC.accessoriesOf) return;
    const CB = st.coarseBase, nv = CB.length / 3, T = c.T;
    const at = (v) => [CB[v * 3], CB[v * 3 + 1], CB[v * 3 + 2]];
    const moleAt = [];
    for (let v = 0; v < nv; v++) {
      const [x, y, z] = at(v), ax = Math.abs(x);
      if (st.scalpC[v] > 0.005 || z < -0.3 || y < -1.2 || y > 2.75 || ax > 1.45) continue;
      if (Math.hypot(ax - 0.628, y - 1.624, z - 1.627) < 0.48) continue; // eyes
      if (ax < 0.72 && y > -0.25 && y < 0.5 && z > 1.5) continue; // lips
      if (y > 1.78 && y < 2.2 && ax > 0.22 && ax < 1.15 && z > 1.1) continue; // brows
      if (Math.hypot(ax - 0.21, y - 0.6, z - 2.36) < 0.16) continue; // nostrils
      moleAt.push(v);
    }
    // per side (+1 the customer's left, -1 the right): earlobe (outer face) and ear bowl (deepest point)
    const best = (test, score) => { let b = -1, bs = -1e9; for (let v = 0; v < nv; v++) { const p = at(v); if (test(p) && score(p) > bs) { bs = score(p); b = v; } } return b; };
    // the earlobe (on the drawn head; it is joined to the head, so only its outer face exists): its bottom edge,
    // and the piercing in the visual centre of the soft lobe pad, about 5-6 mm (0.11 units) above that edge
    const B = st.base, N0 = st.N0;
    const lobeOf = (sd) => {
      const ear = [];
      for (let v = 0; v < B.length / 3; v++) {
        const x = sd * B[v * 3], y = B[v * 3 + 1], z = B[v * 3 + 2];
        if (x > 1.58 && y > 0.55 && y < 1.0 && z > -0.3 && z < 0.2) ear.push(v);
      }
      if (!ear.length) return null;
      const yB = Math.min(...ear.map((v) => B[v * 3 + 1]));
      const pad = ear.filter((v) => B[v * 3 + 1] < yB + 0.2), zs = pad.map((v) => B[v * 3 + 2]).sort((a, b) => a - b);
      const zc = zs[zs.length >> 1], yc = yB + 0.11;
      let h = -1, hd = 1e9, b = -1, bd = 1e9;
      for (const v of ear) {
        const y = B[v * 3 + 1], z = B[v * 3 + 2];
        if (sd * N0[v * 3] > 0.5) { const d = Math.hypot(y - yc, z - zc); if (d < hd) { hd = d; h = v; } }
        const e = (y - yB) * 4 + Math.abs(z - zc); // the lowest point of the edge below the pad centre
        if (e < bd) { bd = e; b = v; }
      }
      return h >= 0 && b >= 0 ? { h, b } : null;
    };
    const lobe = {}, bowl = {};
    for (const sd of [-1, 1]) {
      lobe[sd] = lobeOf(sd);
      bowl[sd] = best(([x, y, z]) => sd * x > 1.38 && sd * x < 1.62 && y > 1.0 && y < 1.2 && z > -0.15 && z < 0.05, ([x]) => -sd * x);
    }
    // small meshes, built here (the game exposes no sphere or torus geometry to us); T.af is the instanced
    // geometry class, so these use the head's own plain geometry class
    const Geo = c.Pt.constructor;
    const geo = (pos, nrm, idx) => { const g = new Geo(); g.setAttribute('position', new T.mt(pos, 3)); g.setAttribute('normal', new T.mt(nrm, 3)); g.setIndex(idx); return g; };
    const sphere = (ws, hs) => {
      const pos = [], idx = [];
      for (let j = 0; j <= hs; j++) for (let i = 0; i <= ws; i++) { const th = (j / hs) * Math.PI, ph = (i / ws) * 2 * Math.PI; pos.push(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)); }
      for (let j = 0; j < hs; j++) for (let i = 0; i < ws; i++) { const a = j * (ws + 1) + i, b = a + ws + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
      return geo(pos, pos.slice(), idx);
    };
    const torus = (R, r, ts, rs) => {
      const pos = [], nrm = [], idx = [];
      for (let j = 0; j <= rs; j++) for (let i = 0; i <= ts; i++) {
        const u = (i / ts) * 2 * Math.PI, w = (j / rs) * 2 * Math.PI, cx = Math.cos(u), cy = Math.sin(u);
        nrm.push(Math.cos(w) * cx, Math.cos(w) * cy, Math.sin(w));
        pos.push((R + r * Math.cos(w)) * cx, (R + r * Math.cos(w)) * cy, r * Math.sin(w));
      }
      for (let j = 0; j < rs; j++) for (let i = 0; i < ts; i++) { const a = j * (ts + 1) + i, b = a + ts + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      return geo(pos, nrm, idx);
    };
    const Mat = c.Gi && c.Gi.constructor;
    if (!Mat) return;
    const mat = (o) => new Mat(Object.assign({ metalness: 0, roughness: 0.4 }, o));
    const mats = {
      silver: mat({ color: '#d6d8dc', metalness: 1, roughness: 0.22 }), gold: mat({ color: '#e2b65a', metalness: 1, roughness: 0.25 }),
      black: mat({ color: '#1c1c20', metalness: 0.5, roughness: 0.3 }), gem: mat({ color: '#f3f6ff', metalness: 1, roughness: 0.04, envMapIntensity: 2.2 }),
      beige: mat({ color: '#d8b898', roughness: 0.38, clearcoat: 0.6 }), brown: mat({ color: '#6a4935', roughness: 0.38, clearcoat: 0.6 }), grey: mat({ color: '#8c9095', roughness: 0.38, clearcoat: 0.6 }),
    };
    const ball = sphere(16, 12), ring = torus(1, 0.17, 40, 10), group = new c.vt.constructor();
    // the game stops updating world matrices after its first frame: each accessory takes the head's own
    // world matrix just before it is drawn
    const make = (g) => {
      const m = new T.Ze(g, mats.silver);
      m.visible = false; m.frustumCulled = false; m.matrixAutoUpdate = false;
      m.onBeforeRender = () => m.matrixWorld.multiplyMatrices(c.vt.matrixWorld, m.matrix);
      group.add(m);
      return m;
    };
    const meshes = { stud: { 1: make(ball), [-1]: make(ball) }, hoop: { 1: make(ring), [-1]: make(ring) }, aid: { 1: make(ball), [-1]: make(ball) } };
    c.vt.add(group);
    st.extras = { moleAt, lobe, bowl, mats, meshes, group };
  }
  // the nearest place on the front of the (un-morphed) head to (x, y), or null
  function frontPoint(x, y, r = 0.07) {
    const CB = st.coarseBase;
    let b = null;
    for (let v = 0; v < CB.length / 3; v++) {
      const px = CB[v * 3], py = CB[v * 3 + 1], pz = CB[v * 3 + 2];
      if (pz > 0.5 && Math.hypot(px - x, py - y) < r && (!b || pz > b[2])) b = [px, py, pz];
    }
    return b;
  }
  // the outermost place on one side of the neck at (y, z), or null
  function sidePoint(sd, y, z, r = 0.1) {
    const CB = st.coarseBase;
    let b = null;
    for (let v = 0; v < CB.length / 3; v++) {
      const px = CB[v * 3], py = CB[v * 3 + 1], pz = CB[v * 3 + 2];
      if (sd * px > 0.5 && Math.hypot(py - y, pz - z) < r && (!b || sd * px > sd * b[0])) b = [px, py, pz];
    }
    return b;
  }
  function setSkinDetails(person, ft) {
    const U = HSC.U, X = st.extras, d = X && HSC.skinDetailsOf(person);
    const mole = U.uMole.value, scar = U.uScar.value;
    mole.fill(0); scar.fill(0);
    U.uTatA.value = [0, 0, 0, 0]; U.uTatB.value = [0, 0, 0, 0];
    if (!d) return;
    d.moles.slice(0, 3).forEach((m, i) => {
      if (!X.moleAt.length) return;
      const v = X.moleAt[Math.min(X.moleAt.length - 1, Math.floor(m.at * X.moleAt.length))], CB = st.coarseBase;
      mole.set([CB[v * 3], CB[v * 3 + 1], CB[v * 3 + 2], m.raised ? -m.r : m.r], i * 4);
    });
    const sc = d.scar;
    if (sc) {
      // a centre, a direction (0 = straight up) and a half length per kind
      let cx, cy, ang, half, w = 0.038;
      if (sc.kind === 'brow') {
        // across the brow line at this customer's brow height (glsl.js browShape)
        const ax = 0.45 + 0.4 * sc.at, t = (ax - 0.3) / 0.8, arch = ft ? ft.brow[0] : 0.08, tilt = ft ? ft.brow[1] : 0;
        const rs = smooth(0, 0.45, t), fl = smooth(0.45, 1, t);
        cx = sc.side * ax; cy = 1.939 + arch * rs * (1 - 0.75 * fl) + tilt * (t - 0.4); ang = sc.side * sc.tilt * 0.6; half = 0.13 * sc.len;
      } else if (sc.kind === 'chin') {
        cx = sc.side * 0.3 * sc.at; cy = -0.42; ang = Math.PI / 2 + sc.tilt; half = 0.12 * sc.len; w = 0.04;
      } else {
        cx = sc.side * (0.75 + 0.3 * sc.at); cy = 0.55 + 0.35 * sc.at; ang = sc.side * sc.tilt; half = 0.14 * sc.len;
      }
      const dx = Math.sin(ang) * half, dy = Math.cos(ang) * half;
      const a = frontPoint(cx - dx, cy - dy), b = frontPoint(cx + dx, cy + dy);
      if (a && b) scar.set([...a, w, ...b, sc.s]);
    }
    const tat = HSC.accessoriesOf(person).tattoo;
    if (tat) {
      // below and behind the ear, its lower part under the gown collar
      const c = sidePoint(tat.side, -0.6, -0.5);
      if (c) {
        U.uTatA.value = [c[0], c[1], c[2], 0.46 * tat.size];
        U.uTatB.value = [HSC.TATTOOS.indexOf(tat.kind) + 1, tat.fade, tat.rot, 0];
      }
    }
    U.uSkinB.value = [U.uSkinB.value[0], U.uSkinB.value[1], d.acne, d.bumps];
  }
  // earrings and hearing aids on the morphed ears (P, N: the drawn head's positions and normals)
  function placeAccessories(person, P, N) {
    const X = st.extras;
    if (!X) return;
    const acc = HSC.accessoriesOf(person) || {};
    for (const k of Object.keys(X.meshes)) for (const sd of [-1, 1]) X.meshes[k][sd].visible = false;
    const V = (x, y, z) => X.group.position.clone().set(x, y, z);
    const where = (v, sd) => {
      if (v < 0) return null;
      const n = V(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]);
      if (n.x * sd < 0.2) n.set(sd, 0, 0); // a normal pointing into the head: use the plain outward direction
      return { p: V(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]), n: n.normalize() };
    };
    const show = (m, material, pos, n, scale) => {
      m.material = material;
      m.position.copy(pos);
      m.quaternion.setFromUnitVectors(V(0, 0, 1), n);
      m.scale.set(scale[0], scale[1], scale[2]);
      m.updateMatrix();
      m.visible = true;
    };
    if (acc.ear) for (const sd of acc.ear.sides) {
      const L = X.lobe[sd], at = L && where(L.h, sd);
      if (!at) continue;
      const m = X.mats[acc.ear.metal] || X.mats.silver;
      if (acc.ear.kind === 'stud') {
        // the stud's front sits flat on the lobe at the piercing (a 4-5 mm head)
        const r = acc.ear.metal === 'gem' ? 0.048 : 0.042;
        show(X.meshes.stud[sd], m, at.p.clone().addScaledVector(at.n, 0.008), at.n, [r, r, r * 0.5]);
      } else {
        // a huggie hoop: in through the piercing (mid-lobe, 2 mm behind its face) and round the lobe's bottom
        // edge, in the plane of the hole and the lobe below it; its inner diameter is the hole-to-edge distance
        // plus about 1 mm, as hoops are sized
        const edge = V(P[L.b * 3], P[L.b * 3 + 1], P[L.b * 3 + 2]);
        const down = edge.sub(at.p), drop = down.clone().addScaledVector(at.n, -down.dot(at.n));
        const len = drop.length();
        if (len < 0.03) continue;
        drop.normalize();
        const hole = at.p.clone().addScaledVector(at.n, -0.04);
        const R = Math.max(0.075, Math.min(0.13, (len + 0.05) / 2 + 0.008));
        const axis = at.n.clone().cross(drop).normalize();
        show(X.meshes.hoop[sd], m, hole.addScaledVector(drop, R), axis, [R, R, R]);
      }
    }
    if (acc.aid) for (const sd of acc.aid.sides) {
      const at = where(X.bowl[sd], sd);
      if (!at) continue;
      // an in-the-ear aid filling the bowl of the ear
      show(X.meshes.aid[sd], X.mats[acc.aid.colour] || X.mats.beige, at.p.clone().addScaledVector(at.n, 0.035), at.n, [0.085, 0.11, 0.06]);
    }
  }

  // ---- eyebrows (Android): a 128 x 32 grid over both brows, x -1.2..1.2, y 1.7..2.3 (glsl.js browKeep) ----
  const BROW_N = 128 * 32;
  const browCell = (x, y) => {
    const un = (Math.abs(x) - 0.2) / 1.0, v = (y - 1.7) / 0.6;
    if (un < 0 || un > 1 || v < 0 || v > 1) return -1;
    const u = x < 0 ? 0.5 - un * 0.5 : 0.5 + un * 0.5;
    return Math.min(31, Math.floor(v * 32)) * 128 + Math.min(127, Math.floor(u * 128));
  };
  // each cell's point on the front of the (un-morphed) head
  function browCells(B) {
    const pos = new Float32Array(BROW_N * 3), has = new Uint8Array(BROW_N), best = new Float32Array(BROW_N).fill(1e9);
    for (let v = 0; v < B.length / 3; v++) {
      const x = B[v * 3], y = B[v * 3 + 1], z = B[v * 3 + 2];
      if (z < 1.0) continue;
      const c = browCell(x, y);
      if (c < 0) continue;
      // the cell centre, and the vertex closest to it
      const col = c % 128, row = Math.floor(c / 128), u = (col + 0.5) / 128, vv = (row + 0.5) / 32;
      const cx = (u < 0.5 ? -1 : 1) * (0.2 + Math.abs(u - 0.5) * 2), cy = 1.7 + vv * 0.6;
      const d = Math.hypot(x - cx, y - cy);
      if (d < best[c]) { best[c] = d; pos.set([cx, cy, z], c * 3); has[c] = 1; }
    }
    // cells no vertex fell in take their neighbour's depth
    for (let pass = 0; pass < 4; pass++) for (let c = 0; c < BROW_N; c++) if (!has[c]) {
      for (const n of [c - 1, c + 1, c - 128, c + 128]) if (n >= 0 && n < BROW_N && has[n] && Math.floor(n / 128) === Math.floor(c / 128) || (n === c - 128 || n === c + 128) && n >= 0 && n < BROW_N && has[n]) {
        const col = c % 128, row = Math.floor(c / 128), u = (col + 0.5) / 128, vv = (row + 0.5) / 32;
        pos.set([(u < 0.5 ? -1 : 1) * (0.2 + Math.abs(u - 0.5) * 2), 1.7 + vv * 0.6, pos[n * 3 + 2]], c * 3); has[c] = 2; break;
      }
    }
    return { pos, has };
  }
  // the customer's brow shape at a point, as glsl.js browShape draws it
  function browShapeAt(x, y, z) {
    const U = HSC.U, B = U.uBrowB.value, A = U.uBrowA.value, ax = Math.abs(x);
    const t = clamp((ax - 0.3) / 0.8, 0, 1), rs = smooth(0, 0.45, t), fl = smooth(0.45, 1, t);
    const yb = 1.624 + 0.315 + B[0] * rs * (1 - 0.75 * fl) + B[1] * (t - 0.4);
    let th = (0.14 + (0.058 - 0.14) * smooth(0.25, 1, t)) * (0.45 + 0.55 * smooth(0, 0.22, t)) * B[2];
    th *= 1 - A[2] * smooth(0.55, 1, t);
    const along = smooth(0.27, 0.36, ax) * (1 - smooth(1, 1.12, ax));
    const across = 1 - smooth(0.3, 1, Math.abs(y - yb) / Math.max(th, 0.001));
    return along * across * smooth(0.9, 1.5, z);
  }
  // brow strands: roots spread over the brow area of the un-morphed head (the shader grows only those inside the
  // customer's own brow shape); kept on the morphed face like the beard roots
  function makeBrowMesh(c) {
    const T = c.T, B = st.base, I = c.Pt.index.array, tris = [], cum = [];
    let area = 0;
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t] * 3, b = I[t + 1] * 3, d = I[t + 2] * 3;
      const cx = (B[a] + B[b] + B[d]) / 3, cy = (B[a + 1] + B[b + 1] + B[d + 1]) / 3, cz = (B[a + 2] + B[b + 2] + B[d + 2]) / 3;
      if (cz < 1.05 || Math.abs(cx) < 0.24 || Math.abs(cx) > 1.16 || cy < 1.76 || cy > 2.28) continue;
      const ux = B[b] - B[a], uy = B[b + 1] - B[a + 1], uz = B[b + 2] - B[a + 2], wx = B[d] - B[a], wy = B[d + 1] - B[a + 1], wz = B[d + 2] - B[a + 2];
      const ar = 0.5 * Math.hypot(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx);
      if (ar <= 0) continue;
      area += ar; tris.push(t); cum.push(area);
    }
    const n = 9000, R = HSC.rng(0xb20a5), tri = new Int32Array(n * 3), bary = new Float32Array(n * 3), base = new Float32Array(n * 3), seeds = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      let lo = 0, hi = cum.length - 1; const x = R.next() * area;
      while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < x) lo = m + 1; else hi = m; }
      const t = tris[lo], r1 = Math.sqrt(R.next()), r2 = R.next(), w = [1 - r1, r1 * (1 - r2), r1 * r2];
      for (let j = 0; j < 3; j++) { tri[i * 3 + j] = I[t + j]; bary[i * 3 + j] = w[j]; }
      for (let k = 0; k < 3; k++) base[i * 3 + k] = w[0] * B[I[t] * 3 + k] + w[1] * B[I[t + 1] * 3 + k] + w[2] * B[I[t + 2] * 3 + k];
      seeds[i * 3] = R.next(); seeds[i * 3 + 1] = R.next(); seeds[i * 3 + 2] = R.next();
    }
    st.browRoots = { count: n, tri, bary };
    const g = new T.af(), pos = [], idx = [], SEG = 5;
    for (let s = 0; s <= SEG; s++) { pos.push(-1, s / SEG, 0, 1, s / SEG, 0); if (s < SEG) { const u = s * 2; idx.push(u, u + 1, u + 2, u + 1, u + 3, u + 2); } }
    g.setAttribute('position', new T.mt(pos, 3)); g.setIndex(idx);
    st.bRoot = new Float32Array(n * 3); st.bNormal = new Float32Array(n * 3);
    g.setAttribute('aRoot', new T.Ra(st.bRoot, 3)); g.setAttribute('aNormal', new T.Ra(st.bNormal, 3));
    g.setAttribute('aBase', new T.Ra(base, 3)); g.setAttribute('aSeed', new T.Ra(seeds, 3));
    g.instanceCount = n;
    const mat = new T.fr({ vertexShader: HSC.glsl.browVert(c.Ql), fragmentShader: HSC.glsl.browFrag(c.Ql),
      uniforms: Object.assign({ uGrid: c.uGrid, uHairTint: c.uHairTint, uDensity: c.uDensity, uWidth: { value: 1 } }, c.light, HSC.U), side: T.$t });
    const mesh = new T.Ze(g, mat);
    mesh.frustumCulled = false; mesh.renderOrder = 1;
    st.browGeo = g;
    updateBrowRoots(st.base, st.N0);
    return mesh;
  }
  function updateBrowRoots(P, N) {
    const r = st.browRoots;
    if (!r) return;
    for (let i = 0; i < r.count; i++) {
      let x = 0, y = 0, z = 0, nx = 0, ny = 0, nz = 0;
      for (let j = 0; j < 3; j++) { const v = r.tri[i * 3 + j] * 3, w = r.bary[i * 3 + j]; x += P[v] * w; y += P[v + 1] * w; z += P[v + 2] * w; nx += N[v] * w; ny += N[v + 1] * w; nz += N[v + 2] * w; }
      const l = Math.hypot(nx, ny, nz) || 1;
      st.bRoot.set([x, y, z], i * 3); st.bNormal.set([nx / l, ny / l, nz / l], i * 3);
    }
    st.browGeo.attributes.aRoot.needsUpdate = true; st.browGeo.attributes.aNormal.needsUpdate = true;
  }
  // a head hit (morphed, coarse triangle) back on the un-morphed head: { p, tri } -> [x, y, z]
  HSC.toBase = function (hit) {
    if (!hit || !hit.tri || !st.coarse) return null;
    const C = st.coarse.pos, B = st.coarseBase, [i0, i1, i2] = hit.tri.map((v) => v * 3), p = hit.p;
    const v0 = [C[i1] - C[i0], C[i1 + 1] - C[i0 + 1], C[i1 + 2] - C[i0 + 2]], v1 = [C[i2] - C[i0], C[i2 + 1] - C[i0 + 1], C[i2 + 2] - C[i0 + 2]], v2 = [p[0] - C[i0], p[1] - C[i0 + 1], p[2] - C[i0 + 2]];
    const d = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], d00 = d(v0, v0), d01 = d(v0, v1), d11 = d(v1, v1), d20 = d(v2, v0), d21 = d(v2, v1), den = d00 * d11 - d01 * d01 || 1;
    const b = (d11 * d20 - d01 * d21) / den, c = (d00 * d21 - d01 * d20) / den, a = 1 - b - c;
    return [0, 1, 2].map((k) => B[i0 + k] * a + B[i1 + k] * b + B[i2 + k] * c);
  };
  // a hit on the drawn head back on the un-morphed head (engine, patch21): the scalp's cutting grid lives there
  HSC.warpBase = function (x, y, z, A, I, k) {
    const B = A === ctx.Pt.attributes.position.array ? st.base : st.coarseBase, a = I[k] * 3, b = I[k + 1] * 3, c = I[k + 2] * 3;
    const ux = A[b] - A[a], uy = A[b + 1] - A[a + 1], uz = A[b + 2] - A[a + 2], vx = A[c] - A[a], vy = A[c + 1] - A[a + 1], vz = A[c + 2] - A[a + 2];
    const px = x - A[a], py = y - A[a + 1], pz = z - A[a + 2];
    const d00 = ux * ux + uy * uy + uz * uz, d01 = ux * vx + uy * vy + uz * vz, d11 = vx * vx + vy * vy + vz * vz, d20 = px * ux + py * uy + pz * uz, d21 = px * vx + py * vy + pz * vz;
    const den = d00 * d11 - d01 * d01 || 1e-12, s = (d11 * d20 - d01 * d21) / den, t = (d00 * d21 - d01 * d20) / den, r = 1 - s - t;
    return [B[a] * r + B[b] * s + B[c] * t, B[a + 1] * r + B[b + 1] * s + B[c + 1] * t, B[a + 2] * r + B[b + 2] * s + B[c + 2] * t];
  };
  // the ear bowls (extras.js), for the ear hair and the flame
  HSC.foam = { data: () => st.foamData, update: () => { if (st.foamTex) st.foamTex.needsUpdate = true; } };
  HSC.earBowls = () => (st.extras ? st.extras.bowl : null);
  HSC.BROW_N = BROW_N;
  HSC.browCells = () => st.browCells;
  // a clipper hit on a brow (un-morphed head coordinates), or null
  HSC.browHit = function (x, y, z) {
    if (!st.browCells || z < 1.0) return null;
    const c = browCell(x, y);
    if (c < 0 || browShapeAt(x, y, z) < 0.12) return null;
    return { kind: 'brow', u: (c % 128 + 0.5) / 128, v: (Math.floor(c / 128) + 0.5) / 32 };
  };
  HSC.setBrow = function (levels) {
    if (!st.browTex) return;
    if (st.browLevels === levels) return;
    st.browLevels = levels;
    for (let c = 0; c < BROW_N; c++) st.browData[c] = levels && levels.length === BROW_N ? [0, 128, 255][levels[c]] : 255;
    st.browTex.needsUpdate = true;
  };

  // ---- face-shape morph (and head shape) applied to the smooth mesh and the coarse picking mesh ----
  function applyMorph(person) {
    const Pt = ctx.Pt;
    const P = Pt.attributes.position.array, N = Pt.attributes.normal.array, I = Pt.index.array;
    const age = clamp((person.years - 18) / 62, 0, 1);
    const m = person.morph;
    let moved = false;
    // head shape + face features as one delta per coarse vertex, then guarded and carried to the drawn head
    const shp = st.shapes ? st.shapes[HSC.headShapeOf(person)] : null;
    const face = st.faces && HSC.faceOf ? HSC.faceOf(person) : [];
    const D = st.D, shaped = !!(shp || face.length);
    if (shaped) {
      if (shp) for (let i = 0; i < D.length; i++) D[i] = shp.q[i] * shp.sc; else D.fill(0);
      for (const [t, w] of face) {
        const f = st.faces[t];
        if (!f) continue;
        const k = w * f.sc;
        for (let j = 0; j < f.idx.length; j++) { const i = f.idx[j] * 3; D[i] += k * f.q[j * 3]; D[i + 1] += k * f.q[j * 3 + 1]; D[i + 2] += k * f.q[j * 3 + 2]; }
      }
    }
    const sdC = (i, a) => (shaped ? D[i * 3 + a] * st.sgC[i] : 0);
    // the customer's expression (a smile at the reveal), in his own ancestry mix of the expression units
    const ex = st.expr && st.face && st.face.seed === person.seed && st.face.w > 0.001 && !HSC.snapshotting ? st.face : null;
    const DE = st.DE;
    if (ex) {
      DE.fill(0);
      const E = HSC.EXPR_ETH, U = HSC.EXPR_UNITS, mix = (HSC.EXPR_MIX || {})[person.heritage] || [1 / 3, 1 / 3, 1 / 3];
      E.forEach((_, ei) => U.forEach((u, ui) => {
        // eyes narrow most into crescents on East Asian faces (the reference photos)
        const asianEye = u === 'squint' ? 1 + 0.35 * mix[1] : 1;
        const w = (ex.amounts[u] || 0) * mix[ei] * ex.w * asianEye, t = st.expr[ei * U.length + ui];
        if (!w || !t) return;
        const k = w * t.sc;
        for (let j = 0; j < t.idx.length; j++) { const i = t.idx[j] * 3; DE[i] += k * t.q[j * 3]; DE[i + 1] += k * t.q[j * 3 + 1]; DE[i + 2] += k * t.q[j * 3 + 2]; }
      }));
    }
    if (HSC.U.uSmileA) HSC.U.uSmileA.value = [ex ? ex.w * Math.min(1, ex.amounts.folds || ex.amounts.smile || 0) : 0, 0, 0, 0];
    // this customer's own skull, neck and eyelids (headshapes.js), over everything above
    const F = HSC.headFormOf ? HSC.headFormOf(person) : null;
    if (HSC.U.uHeadA && F) { HSC.U.uHeadA.value = [F.w, F.h, F.d, F.back]; HSC.U.uHeadB.value = [F.top, F.neck, 0, 0]; }
    const se = (v, a) => {
      if (!ex || !(st.eg[v] > 0)) return 0;
      let t = 0;
      for (let k = 0; k < 3; k++) { const i = st.nbr[v * 3 + k]; if (i >= 0) t += st.nbw[v * 3 + k] * DE[i * 3 + a]; }
      return t * st.eg[v];
    };
    const sd = (v, a) => {
      if (!shaped || !(st.sg[v] > 0)) return 0;
      let t = 0;
      for (let k = 0; k < 3; k++) { const i = st.nbr[v * 3 + k]; if (i >= 0) t += st.nbw[v * 3 + k] * D[i * 3 + a]; }
      return t * st.sg[v];
    };
    for (let v = 0; v < P.length / 3; v++) {
      const x = st.base[v * 3], y = st.base[v * 3 + 1], z = st.base[v * 3 + 2];
      const d = HSC.morphDelta(x, y, z, m, age, st.scalp[v]);
      P[v * 3] = x + (d ? d[0] : 0) + sd(v, 0) + se(v, 0); P[v * 3 + 1] = y + (d ? d[1] : 0) + sd(v, 1) + se(v, 1); P[v * 3 + 2] = z + (d ? d[2] : 0) + sd(v, 2) + se(v, 2);
      if (d || (shaped && st.sg[v] > 0) || (ex && st.eg[v] > 0)) moved = true;
      if (F) {
        // the lids stay clear of the eyeball itself
        const l = HSC.lidDelta(x, y, z, F);
        if (l) { const g = smooth(0.3, 0.34, Math.hypot(Math.abs(x) - 0.628, y - 1.624, z - 1.627)); P[v * 3] += l[0] * g; P[v * 3 + 1] += l[1] * g; P[v * 3 + 2] += l[2] * g; }
        HSC.headWarp(P, v * 3, F);
        moved = true;
      }
    }
    const C = st.coarse.pos;
    for (let v = 0; v < C.length / 3; v++) {
      const x = st.coarseBase[v * 3], y = st.coarseBase[v * 3 + 1], z = st.coarseBase[v * 3 + 2];
      const d = HSC.morphDelta(x, y, z, m, age, st.scalpC[v]);
      C[v * 3] = x + (d ? d[0] : 0) + sdC(v, 0); C[v * 3 + 1] = y + (d ? d[1] : 0) + sdC(v, 1); C[v * 3 + 2] = z + (d ? d[2] : 0) + sdC(v, 2);
      if (F) HSC.headWarp(C, v * 3, F);
    }
    // a longer or shorter neck: the whole head sits a little higher or lower in the collar
    if (F && ctx.vt) {
      if (st.headY == null) st.headY = ctx.vt.position.y;
      ctx.vt.position.y = st.headY + 0.03 * F.lift;
      ctx.vt.updateMatrixWorld(true);
    }
    // normals: the original (artist) normals plus the change the morph makes to the geometric normals
    if (moved) {
      const nm = HSC.areaNormals(P, I, st.canon, st.canonCount);
      for (let v = 0; v < N.length / 3; v++) {
        const c = st.canon[v] * 3;
        const x = st.N0[v * 3] + nm[c] - st.nBase[c], y = st.N0[v * 3 + 1] + nm[c + 1] - st.nBase[c + 1], z = st.N0[v * 3 + 2] + nm[c + 2] - st.nBase[c + 2];
        const l = Math.hypot(x, y, z) || 1;
        N[v * 3] = x / l; N[v * 3 + 1] = y / l; N[v * 3 + 2] = z / l;
      }
    } else N.set(st.N0);
    Pt.attributes.position.needsUpdate = true;
    Pt.attributes.normal.needsUpdate = true;
    Pt.computeBoundingSphere();
    updateRoots(P, N);
    if (st.browRoots) updateBrowRoots(P, N);
    if (HSC.onMorph) try { HSC.onMorph(P, N, person); } catch (err) { console.error('customers: morph hook failed', err); }
    try { placeAccessories(person, P, N); } catch (err) { console.error('customers: accessories failed', err); }
    st.beardCells = HSC.beardCellPositions(st.surface, P);
    HSC.beardSurface = st.beardCells;
  }

  // ---- iris texture ----
  function drawEyes(person) {
    const cv = ctx.eyeCanvas, tex = ctx.eyeTexture;
    if (!cv || !tex) return;
    const e = cv.getContext('2d');
    const R = HSC.rng(person.seed ^ 0x51ed);
    const stops = HSC.EYES[person.eyes] || HSC.EYES.blue;
    // Android: the grey ring at the iris edge (arcus) by age band, for that share of men; otherwise from 60
    const PH = HSC.PHENOTYPES;
    let old = person.years >= 60;
    if (PH) { let h = Math.imul((person.seed >>> 0) ^ 0xa3c59ac3, 0x9e3779b1) >>> 0; old = (h % 1000) / 1000 < PH.arcus[PH.bandOf(person.years)]; }
    e.setTransform(1, 0, 0, 1, 0, 0);
    e.scale(0.5, 0.5);
    e.fillStyle = old ? '#ebe1d0' : '#efe7e0';
    e.fillRect(0, 0, 2048, 1024);
    for (let o = 0; o < 70 + (old ? 40 : 0); o++) {
      const s = (R.next() < 0.5 ? 0.05 + R.next() * 0.12 : 0.38 + R.next() * 0.12) * 2048, l = (0.25 + R.next() * 0.5) * 1024;
      e.strokeStyle = `rgba(190,90,85,${0.05 + R.next() * 0.12})`;
      e.lineWidth = 1.5;
      e.beginPath(); e.moveTo(s, l);
      e.bezierCurveTo(s + 30, l + 20 * (R.next() - 0.5), s + 60, l + 40 * (R.next() - 0.5), s + 90 * (R.next() < 0.5 ? 1 : -1), l + 30 * (R.next() - 0.5));
      e.stroke();
    }
    const i = 150;
    e.save();
    e.translate(512, 512);
    e.scale(1, 300 / i);
    e.fillStyle = 'rgba(40,30,28,.28)';
    e.beginPath(); e.arc(0, 0, i * 1.08, 0, 7); e.fill();
    const gr = e.createRadialGradient(0, 0, 10, 0, 0, i);
    gr.addColorStop(0, '#060606'); gr.addColorStop(0.2, '#060606');
    gr.addColorStop(0.24, stops[0]); gr.addColorStop(0.5, stops[1]); gr.addColorStop(0.78, stops[2]); gr.addColorStop(0.93, stops[3]);
    gr.addColorStop(1, '#0b0b0b');
    e.fillStyle = gr;
    e.beginPath(); e.arc(0, 0, i, 0, 7); e.fill();
    const fib = stops[0].match(/\w\w/g).map((h) => parseInt(h, 16));
    for (let o = 0; o < 160; o++) {
      const s = R.next() * 6.283, l = i * (0.32 + R.next() * 0.1), cc = i * (0.62 + R.next() * 0.33);
      const k = 0.9 + R.next() * 0.35;
      e.strokeStyle = `rgba(${Math.min(255, fib[0] * k) | 0},${Math.min(255, fib[1] * k) | 0},${Math.min(255, fib[2] * k) | 0},${0.1 + R.next() * 0.22})`;
      e.lineWidth = 1.6;
      e.beginPath(); e.moveTo(Math.cos(s) * l, Math.sin(s) * l); e.lineTo(Math.cos(s) * cc, Math.sin(s) * cc); e.stroke();
    }
    if (old) {
      // arcus: a pale ring at the edge of the iris
      e.strokeStyle = 'rgba(215,215,205,.4)';
      e.lineWidth = 9;
      e.beginPath(); e.arc(0, 0, i * 0.95, 0, 7); e.stroke();
    }
    e.restore();
    tex.needsUpdate = true;
  }

  // ---- apply a customer ----
  HSC.setPerson = function (person) {
    if (!ctx || !HSC.validPerson(person)) return;
    const key = JSON.stringify(person);
    if (st.key === key) return;
    st.key = key;
    // a fresh customer sits down in a clean gown
    // (not while the reveal hub takes a snapshot of the next customer)
    if (!HSC.snapshotting && st.personSeed !== person.seed) { st.personSeed = person.seed; HSC.clearClippings && HSC.clearClippings(); }
    const U = HSC.U;
    const age = clamp((person.years - 18) / 62, 0, 1);
    const dark = clamp(person.skin.tone / 9.4, 0, 1);
    const skin = HSC.skinColour(person);
    U.uSkinA.value = [...skin, dark];
    // one bright, even light for every customer: bright enough that dark hair reads clearly on the
    // darkest skin, with a broad sheen on the strands (as under a barber's ring light)
    U.uLift.value = LIFT;
    HSC.setExposure && HSC.setExposure(EXPOSURE);
    U.uLip.value = lerp([1.06, 0.78, 0.93], [0.86, 0.7, 0.8], smooth(0.2, 0.8, dark));
    const tint = TINTS[person.hair.colour] || TINTS[1];
    const greyCol = [0.2, 0.2, 0.19];
    const hairDark = lerp(mul([0.035, 0.024, 0.018], tint), greyCol, person.hair.grey * 0.85);
    U.uHairDark.value = hairDark;
    // beards often grow in warmer than the scalp hair, visibly so only on brown, blond and red hair
    const warmable = person.hair.colour >= 3 && person.hair.colour <= 10 ? 1 : 0;
    const beardTint = lerp([1, 1, 1], [1.28, 0.95, 0.78], person.beard.warm * 0.55 * warmable);
    U.uBeardTint.value = beardTint;
    U.uBeardDark.value = lerp(mul(mul([0.035, 0.024, 0.018], tint), beardTint), greyCol, person.beard.grey * 0.85);
    U.uBrowTint.value = lerp(mul([0.085, 0.055, 0.04], tint), [0.36, 0.35, 0.33], person.brow.grey);
    if (U.uBrowHair) {
      // phenotype leanings (photographic brow studies; mild): South Asian brows longer and denser, African brows a little
      // less dense, East Asian brows straighter; older men grow a few long wiry hairs
      const g = person.heritage, dens = { 'south-asian': 1.15, mena: 1.12, mediterranean: 1.05, 'west-african': 0.86, 'east-african': 0.86, mixed: 0.95 }[g] || 1;
      const len = { 'south-asian': 1.12, mena: 1.08, 'west-african': 0.92, 'east-african': 0.92 }[g] || 1;
      const wiry = 0.03 * smooth(50, 78, person.years);
      U.uBrowHair.value = [person.brow.grey, clamp(person.brow.thick, 0.7, 1.4) * len, clamp(person.brow.thick, 0.75, 1.3) * dens, wiry];
      // brows read a shade darker than light scalp hair
      U.uBrowDark.value = [6, 7, 8, 12, 15].includes(person.hair.colour) ? 0.68 : [4, 5, 14].includes(person.hair.colour) ? 0.85 : 1;
    }
    U.uBrowA.value = [person.brow.thick, clamp(0.9 + 0.15 * age, 0, 1.2), 0, 0];
    // how strongly shaved follicles show through: dark hair on light skin shows most, grey hair least
    const hairLum = 0.2126 * hairDark[0] + 0.7152 * hairDark[1] + 0.0722 * hairDark[2];
    const castStrength = (0.2 + 0.8 * (1 - smooth(0.02, 0.14, hairLum))) * (1 - 0.45 * dark) * (1 - 0.55 * person.hair.grey);
    U.uCast.value = [...lerp([0.7, 0.73, 0.8], [0.8, 0.79, 0.8], dark), clamp(castStrength, 0.1, 1)];
    U.uAgeA.value = [age, smooth(0.5, 1, age) * (1 - 0.6 * dark), 1, age * 0.6];
    // hair texture
    // Android: one strand preset per hair type 1A-4C, thicker strands for coarse-haired groups
    const PH = HSC.PHENOTYPES, tp = PH && PH.hairTypes[person.hair.type];
    const ss = tp || STRAND_STYLE[person.hair.texture](person.hair.curl);
    const grp = PH && PH.groups.find((g) => g.id === person.heritage);
    U.uStyleA.value = ss.A; U.uStyleB.value = ss.B;
    U.uStyleC.value = tp && grp && grp.coarse !== 1 ? [ss.C[0], ss.C[1], ss.C[2], ss.C[3] * grp.coarse] : ss.C;
    const bs = BEARD_STYLE[person.hair.texture];
    U.uBStyleA.value = bs.A;
    // the beard curls like his hair: 4C coils tighter than 4A, 3A looser than 3C
    U.uBStyleB.value = tp ? [Math.max(bs.B[0], tp.C[0] * 0.95), Math.max(bs.B[1], tp.C[1] * 0.7), (bs.B[2] + tp.C[2]) / 2, bs.B[3]] : bs.B;
    // grey hair reads silver, pewter or white
    const toneB = { silver: 0.62, pewter: 0.46, white: 0.78 }[person.hair.greyTone] || 0.62;
    U.uGreyA.value = [person.hair.grey, 0, toneB + 0.05 * age, 0];
    U.uGreyB.value = { temples: [1.2, 0, 0, 0.4], front: [0, 1.2, 0, 0.35], crown: [0, 0, 1.2, 0.35], even: [0, 0, 0, 0] }[person.hair.greyPattern || 'temples'] || [1.2, 0, 0, 0.4];
    U.uBeardGrey.value = [person.beard.grey, Math.min(0.85, toneB + 0.04), person.beard.patchy, 0];
    // how far a moustache hangs over the upper lip (never past the mouth line). A moustache is trimmed to the top of
    // the lip; only a walrus, which is defined by it, still covers the upper lip
    U.uBeardLip.value = { walrus: 0.95 }[person.beard.style] ?? 0;
    // Android: brow shape, freckles and dark papules, hairline shape (phenotypes.js); defaults keep the original look
    const ft = HSC.featuresOf ? HSC.featuresOf(person) : null;
    U.uBrowB.value = ft ? ft.brow : [0.08, 0, 1, 0];
    U.uBrowA.value[2] = ft ? ft.tail : 0;
    U.uSkinB.value = ft ? ft.skin : [0, 0, 0, 0];
    U.uBaldC.value = ft ? ft.hairline : [0, 0, 0, 0];
    try { setSkinDetails(person, ft); } catch (err) { console.error('customers: skin details failed', err); }
    // Android hair: where the crown swirl sits and which way it turns (about 2 in 3 clockwise)
    if (U.uWhorl && HSC.PHENOTYPES) {
      const W = HSC.rng(((person.seed >>> 0) ^ 0x2545f491) >>> 0 || 1);
      U.uWhorl.value = [W.range(-0.2, 0.2), -0.55 + W.range(-0.18, 0.18), W.next() < 0.65 ? 1 : -1, 0];
    }
    U.uBeardGreyB.value = { chin: [1.1, 0, 0.4, 0.4], sides: [0, 1.1, 0, 0.35], even: [0, 0, 0, 0] }[person.beard.greyPattern || 'chin'] || [1.1, 0, 0.4, 0.4];
    // alopecia areata patches
    const ar = new Float32Array(12);
    (person.bald.patches || []).slice(0, 3).forEach((q, i) => ar.set(q, i * 4));
    U.uAreata.value = ar;
    // baldness
    // hair loss: Norwood (frontal / temporal + crown), Norwood A, crown-only, diffuse thinning
    const loss = person.bald.type === 'none' ? [0, 0, 0, 0, 0, person.bald.diffuse || 0] : HSC.baldShape(Object.assign({ type: 'norwood' }, person.bald));
    U.uBaldA.value = [loss[0], loss[1], loss[2], loss[3]];
    U.uBaldB.value = [loss[4], loss[5], (person.seed % 97) * 0.37, 0];
    // skin sheen follows the skin tone
    if (ctx.Gi && ctx.Gi.sheenColor) {
      const sc = lerp([1, 0.27, 0.19], [0.42, 0.28, 0.22], dark);
      ctx.Gi.sheenColor.setRGB(sc[0], sc[1], sc[2]);
      ctx.Gi.sheen = 0.6 - 0.2 * dark;
    }
    try { applyMorph(person); } catch (err) { console.error('customers: morph failed', err); }
    try { drawEyes(person); } catch (err) { console.error('customers: eyes failed', err); }
  };

  // a facial expression for the customer in the chair (requests.js): unit amounts (smile, squint, brows, lift) at
  // strength w 0..1; w 0 is his resting face. Snapshots of the next customer never carry it.
  HSC.setExpression = function (person, amounts, w) {
    if (!ctx || !st.expr || !person || !HSC.validPerson(person)) return false;
    st.face = { seed: person.seed, amounts: amounts || {}, w: Math.max(0, Math.min(1, w || 0)) };
    try { applyMorph(person); } catch (err) { console.error('customers: expression failed', err); return false; }
    return true;
  };

  HSC.setBeard = function (levels) {
    if (!st.beardTex) return;
    let any = false;
    for (let c = 0; c < 8192; c++) {
      const v = levels && levels[c] ? HSC.BEARD_MM[levels[c]] || 0 : 0;
      st.beardData[c] = Math.round((v / 50) * 255);
      if (v >= 0.5) any = true;
    }
    st.beardTex.needsUpdate = true;
    if (st.beardMesh) st.beardMesh.visible = any;
  };

  // clipper picking: is this (morphed) hit on the beard? returns grid coords like the scalp's u/v
  HSC.beardHit = function (x, y, z, triStart, fine) {
    if (!ctx || !st.surface) return null;
    let bx = x, by = y, bz = z;
    if (fine) {
      // map the hit back onto the un-morphed head through the hit triangle's barycentrics
      const P = ctx.Pt.attributes.position.array, I = ctx.Pt.index.array;
      const a = I[triStart] * 3, b = I[triStart + 1] * 3, c = I[triStart + 2] * 3;
      const v0 = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], v1 = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]], v2 = [x - P[a], y - P[a + 1], z - P[a + 2]];
      const d00 = v0[0] * v0[0] + v0[1] * v0[1] + v0[2] * v0[2], d01 = v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2], d11 = v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2];
      const d20 = v2[0] * v0[0] + v2[1] * v0[1] + v2[2] * v0[2], d21 = v2[0] * v1[0] + v2[1] * v1[1] + v2[2] * v1[2];
      const den = d00 * d11 - d01 * d01 || 1;
      const wb = (d11 * d20 - d01 * d21) / den, wc = (d00 * d21 - d01 * d20) / den, wa = 1 - wb - wc;
      const B = st.base;
      bx = B[a] * wa + B[b] * wb + B[c] * wc; by = B[a + 1] * wa + B[b + 1] * wb + B[c + 1] * wc; bz = B[a + 2] * wa + B[b + 2] * wb + B[c + 2] * wc;
    }
    if (HSC.beardZone(bx, by, bz) < 0.2) return HSC.browHit ? HSC.browHit(bx, by, bz) : null;
    const cell = HSC.beardCell(bx, by, bz);
    if (cell < 0 || !st.beardCells.has[cell]) return null;
    const [u, v] = HSC.beardUV(bx, by, bz);
    return { kind: 'beard', u, v };
  };

  // follow the game's automatic detail level (it lowers scalp strand counts when frames run slow)
  // strand ribbon geometry with a given number of segments (fewer on the low detail level)
  function strandGeometry(geo, seg) {
    const T = ctx.T, pos = [], idx = [];
    for (let s = 0; s <= seg; s++) {
      pos.push(-1, s / seg, 0, 1, s / seg, 0);
      if (s < seg) { const u = s * 2; idx.push(u, u + 1, u + 2, u + 1, u + 3, u + 2); }
    }
    geo.setAttribute('position', new T.mt(pos, 3));
    geo.setIndex(idx);
  }
  // apply the current detail level to everything already built
  HSC.onDetailChange = function () {
    if (!ctx) return;
    const D = HSC.detail;
    if (ctx.Oi && ctx.Oi.mesh) strandGeometry(ctx.Oi.mesh.geometry, D.segments);
    if (st.beardMesh) strandGeometry(st.beardMesh.geometry, D.beardSegments);
    for (const m of [ctx.Gi, ctx.Oi && ctx.Oi.mesh.material, st.beardMesh && st.beardMesh.material]) {
      if (!m) continue;
      m.defines = Object.assign({}, m.defines);
      if (D.shaderLow) m.defines.HSC_LOW = ''; else delete m.defines.HSC_LOW;
      m.needsUpdate = true;
    }
    HSC.setDetail(1);
    HSC.clipCap && HSC.clipCap();
  };

  HSC.setDetail = function (f) {
    if (!st.beardMesh || !st.roots) return;
    const k = Math.max(0.3, Math.min(1, f)) * HSC.detail.beardMax;
    // the lowest tier never draws more than it always has
    const n = Math.max(1, Math.round((HSC.detail.level === 'potato' ? 14000 : st.roots.count) * k));
    st.beardMesh.geometry.instanceCount = n;
    st.beardMesh.material.uniforms.uWidth.value = Math.max(0.9, Math.sqrt(14000 / n));
  };

  HSC.beardStartFor = (person) => (st.surface ? HSC.beardStart(person, st.surface, st.base) : new Array(8192).fill(0));
  HSC.debugState = st;
})(globalThis.HSC || (globalThis.HSC = {}));
