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
      const T = c.T, Pt = c.Pt;
      const P = Pt.attributes.position.array;
      st.base = Float32Array.from(P);
      st.N0 = Float32Array.from(Pt.attributes.normal.array);
      st.coarse = Pt.userData.coarse;
      st.coarseBase = Float32Array.from(st.coarse.pos);
      Pt.setAttribute('hsBase', new T.It(st.base, 3));
      const ci = HSC.canonIds(st.base);
      st.canon = ci.canon; st.canonCount = ci.count;
      st.nBase = HSC.areaNormals(st.base, Pt.index.array, st.canon, st.canonCount);
      // scalp mask per vertex, to keep morphs off the scalp
      st.scalp = new Float32Array(P.length / 3);
      for (let v = 0; v < st.scalp.length; v++) st.scalp[v] = c.Na(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]);
      st.scalpC = new Float32Array(st.coarseBase.length / 3);
      for (let v = 0; v < st.scalpC.length; v++) st.scalpC[v] = c.Na(st.coarseBase[v * 3], st.coarseBase[v * 3 + 1], st.coarseBase[v * 3 + 2]);

      // beard length grid texture
      st.beardData = new Uint8Array(8192);
      const tex = new T.uu(st.beardData, 128, 64, T.Jn, T.cr);
      tex.minFilter = tex.magFilter = T.or;
      tex.needsUpdate = true;
      st.beardTex = tex;
      HSC.U.uBeard.value = tex;

      // beard surface + strands
      st.surface = HSC.buildBeardSurface(st.base, Pt.index.array);
      st.roots = HSC.sampleBeardRoots(st.base, Pt.index.array, st.surface, 14000, 0xbea7d);
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
      st.aRoot.set([x, y, z], i * 3);
      st.aNormal.set([nx / l, ny / l, nz / l], i * 3);
    }
    if (st.beardMesh) {
      st.beardMesh.geometry.attributes.aRoot.needsUpdate = true;
      st.beardMesh.geometry.attributes.aNormal.needsUpdate = true;
    }
  }

  // ---- face-shape morph applied to the smooth mesh and the coarse picking mesh ----
  function applyMorph(person) {
    const Pt = ctx.Pt;
    const P = Pt.attributes.position.array, N = Pt.attributes.normal.array, I = Pt.index.array;
    const age = clamp((person.years - 18) / 62, 0, 1);
    const m = person.morph;
    let moved = false;
    for (let v = 0; v < P.length / 3; v++) {
      const x = st.base[v * 3], y = st.base[v * 3 + 1], z = st.base[v * 3 + 2];
      const d = HSC.morphDelta(x, y, z, m, age, st.scalp[v]);
      P[v * 3] = x + (d ? d[0] : 0); P[v * 3 + 1] = y + (d ? d[1] : 0); P[v * 3 + 2] = z + (d ? d[2] : 0);
      if (d) moved = true;
    }
    const C = st.coarse.pos;
    for (let v = 0; v < C.length / 3; v++) {
      const x = st.coarseBase[v * 3], y = st.coarseBase[v * 3 + 1], z = st.coarseBase[v * 3 + 2];
      const d = HSC.morphDelta(x, y, z, m, age, st.scalpC[v]);
      C[v * 3] = x + (d ? d[0] : 0); C[v * 3 + 1] = y + (d ? d[1] : 0); C[v * 3 + 2] = z + (d ? d[2] : 0);
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
    const old = person.years >= 60;
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
    U.uBrowA.value = [person.brow.thick, clamp(0.9 + 0.15 * age, 0, 1.2), 0, 0];
    // how strongly shaved follicles show through: dark hair on light skin shows most, grey hair least
    const hairLum = 0.2126 * hairDark[0] + 0.7152 * hairDark[1] + 0.0722 * hairDark[2];
    const castStrength = (0.2 + 0.8 * (1 - smooth(0.02, 0.14, hairLum))) * (1 - 0.45 * dark) * (1 - 0.55 * person.hair.grey);
    U.uCast.value = [...lerp([0.7, 0.73, 0.8], [0.8, 0.79, 0.8], dark), clamp(castStrength, 0.1, 1)];
    U.uAgeA.value = [age, smooth(0.5, 1, age) * (1 - 0.6 * dark), 1, age * 0.6];
    // hair texture
    const ss = STRAND_STYLE[person.hair.texture](person.hair.curl);
    U.uStyleA.value = ss.A; U.uStyleB.value = ss.B; U.uStyleC.value = ss.C;
    const bs = BEARD_STYLE[person.hair.texture];
    U.uBStyleA.value = bs.A; U.uBStyleB.value = bs.B;
    // grey hair reads silver, pewter or white
    const toneB = { silver: 0.62, pewter: 0.46, white: 0.78 }[person.hair.greyTone] || 0.62;
    U.uGreyA.value = [person.hair.grey, 0, toneB + 0.05 * age, 0];
    U.uGreyB.value = { temples: [1.2, 0, 0, 0.4], front: [0, 1.2, 0, 0.35], crown: [0, 0, 1.2, 0.35], even: [0, 0, 0, 0] }[person.hair.greyPattern || 'temples'] || [1.2, 0, 0, 0.4];
    U.uBeardGrey.value = [person.beard.grey, Math.min(0.85, toneB + 0.04), person.beard.patchy, 0];
    // how far a moustache hangs over the upper lip (never past the mouth line)
    U.uBeardLip.value = { walrus: 0.95, moustache: 0.45, horseshoe: 0.45, pencil: 0, full: 0.4, long: 0.5, boxed: 0.3, goatee: 0.3, vandyke: 0.3 }[person.beard.style] ?? 0.3;
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
    if (HSC.beardZone(bx, by, bz) < 0.2) return null;
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
    const n = Math.max(1, Math.round(st.roots.count * k));
    st.beardMesh.geometry.instanceCount = n;
    st.beardMesh.material.uniforms.uWidth.value = Math.sqrt(st.roots.count / n);
  };

  HSC.beardStartFor = (person) => (st.surface ? HSC.beardStart(person, st.surface, st.base) : new Array(8192).fill(0));
  HSC.debugState = st;
})(globalThis.HSC || (globalThis.HSC = {}));
