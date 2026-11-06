// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved 5 November 2026): the services barbers do worldwide,
// beyond the cut, as hand tools in the tool tray. Each is modelled, animated and sounded, works by touch on the
// customer (the same hand as the clipper) and is wordless.
//
//   aftershave   level 1   a splash of lemon kolonya (Turkey) or aftershave: droplets, a cool shiver, eyes close
//   towel        level 2   a steaming hot towel wrapped over the face for a few seconds
//   massage      level 3   two hands knead the scalp and temples (Turkish massage, Indian champi); eyes close
//   talc         level 3   the neck duster: a puff of talc on the neck and the loose hair brushed off
//   pomade       level 4   styling product worked through the top: the hair takes a soft shine
//   threading    level 4   a twisted cotton thread cleans the cheek line and brow strays (Turkey, MENA, South Asia)
//   singe        level 5   a flaming cotton torch burns off ear hair (Turkey); the ear hairs older men grow
//   nose         level 5   a rotary nose-hair trimmer
//   lather       level 9   a shaving brush lathers the beard area; the straight razor then shaves foam and stubble
//
// Customers sometimes ask for services (icons under the cut in their thought bubble); a service done pays tips,
// more when it was asked for. Rituals cut nothing and never change the haircut's score.
//
// A service is done only when it really changed the customer (docs/TOOL-PHYSICS-AND-EFFECT-CONTRACT.md 7.2): every
// touch here only finds what the working surface reached and hands it to the one reducer (effects.js, through
// visit.js). Coverage, source units, completion and the sound all come from the effect record that returns.
//
// Wave 4 adds the care tools. They use the same hand and the same reducer, and they complete `steps`, not paid
// services: spray (water), shavingSoap and shavingCream (the lather sources), beardOil, beardBalm, coldTowel, alum.
// Their models are toolart.js. They pay nothing until the owner approves a price.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#10223f';
  const G = () => globalThis.skinFadeStudio, M = () => HSC.meta;
  const SERVICES = {
    aftershave: { level: 1 }, towel: { level: 2 }, massage: { level: 3 }, talc: { level: 3 }, pomade: { level: 4 },
    threading: { level: 4 }, singe: { level: 5 }, nose: { level: 5 }, lather: { level: 9 },
  };
  // unlock levels of the care tools (each stays earnable through ordinary play: easy-tool contract 9.2)
  const CARE = { spray: { level: 2 }, beardOil: { level: 5 }, coldTowel: { level: 7 }, beardBalm: { level: 7 }, shavingSoap: { level: 9 }, shavingCream: { level: 9 }, alum: { level: 10 } };
  // how each hand-held tool sits and what it reaches: lift off the skin, stamp radius in beard cells, contact sound
  const RUB = { lather: { r: 5, lift: 0.03, snd: 'bristle' }, shavingSoap: { r: 4, lift: 0.02, snd: 'rub' }, beardOil: { r: 5, lift: 0.1, snd: 'rub' }, beardBalm: { r: 5, lift: 0.05, snd: 'rub' }, coldTowel: { r: 8, lift: 0.03, snd: 'cloth' }, alum: { r: 4, lift: 0.02, snd: 'mineral' } };
  const S = { job: null, seed: null, earLen: [0, 0], held: null, talcAvail: -1, pomade: null };
  const V = () => HSC.visit, EF = () => HSC.effects;
  HSC.servicesDone = (job) => (S.job === job && V() ? V().done(job) : []);
  HSC.servicesSteps = (job) => (S.job === job && V() ? V().steps(job) : []);

  // ---------------- three.js classes (from the head, the skin and the clipper) ----------------
  let K = null;
  function classes() {
    if (K) return K;
    const c = HSC.ctx, grp = HSC.clipperGroup;
    if (!c || !grp) return null;
    const kids = grp.children.filter((o) => o.isMesh);
    const lathe = kids.find((o) => o.geometry.parameters && o.geometry.parameters.points);
    const box = kids.find((o) => o.geometry.parameters && o.geometry.parameters.depth != null && o.geometry.parameters.width != null);
    const cap = kids.find((o) => o.geometry.parameters && o.geometry.parameters.capSegments != null);
    if (!lathe || !box || !cap) return null;
    K = { T: c.T, c, Mesh: lathe.constructor, Lathe: lathe.geometry.constructor, Box: box.geometry.constructor, Cap: cap.geometry.constructor,
      V2: lathe.geometry.parameters.points[0].constructor, Phys: lathe.material.constructor, Std: box.material.constructor, Group: grp.constructor,
      Geo: Object.getPrototypeOf(lathe.geometry.constructor), Attr: box.geometry.attributes.position.constructor };
    return K;
  }
  // a child of the head whose world matrix follows the head (the game stops auto-updating world matrices)
  function headChild(o) {
    const vt = HSC.ctx.vt;
    o.matrixAutoUpdate = false;
    o.traverse((m) => { if (m.isMesh) { m.frustumCulled = false; m.onBeforeRender = function () { this.updateMatrix(); let p = this, chain = []; while (p && p !== vt) { chain.push(p); p = p.parent; } let mw = vt.matrixWorld.clone(); for (let i = chain.length - 1; i >= 0; i--) { chain[i].updateMatrix(); mw = mw.multiply(chain[i].matrix); } this.matrixWorld.copy(mw); }; } });
    vt.add(o);
    return o;
  }

  // ---------------- particles: soft billboards in head space (additive for fire and sparks) ----------------
  function particles(max, additive) {
    const { T } = K, g = new T.af();
    g.setAttribute('position', new T.mt([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    const P = new Float32Array(max * 4), C = new Float32Array(max * 4);
    g.setAttribute('iP', new T.Ra(P, 4)); g.setAttribute('iC', new T.Ra(C, 4)); g.instanceCount = 0;
    const mat = new T.fr({
      vertexShader: `attribute vec4 iP,iC;varying vec4 vC;varying vec2 vU;void main(){vC=iC;vU=position.xy;vec4 mv=modelViewMatrix*vec4(iP.xyz,1.0);mv.xy+=position.xy*iP.w;gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying vec4 vC;varying vec2 vU;void main(){float d=length(vU);float a=(1.0-smoothstep(.25,1.0,d))*vC.a;if(a<.01)discard;gl_FragColor=vec4(vC.rgb,a);}`,
      transparent: true, depthWrite: false, side: T.$t,
    });
    if (additive) mat.blending = 2;
    const mesh = headChild(new T.Ze(g, mat));
    mesh.renderOrder = 3;
    const list = [];
    return {
      add(p) { if (list.length < max) list.push(Object.assign({ age: 0, life: 1, v: [0, 0, 0], size: 0.05, grow: 0, col: [1, 1, 1, 1], drag: 0, g: 0 }, p)); },
      step(dt) {
        let n = 0;
        for (let i = list.length - 1; i >= 0; i--) {
          const q = list[i];
          q.age += dt;
          if (q.age >= q.life) { list.splice(i, 1); continue; }
          q.v[1] += q.g * dt; const k = Math.exp(-q.drag * dt); q.v = q.v.map((v) => v * k);
          q.p = q.p.map((v, j) => v + q.v[j] * dt);
        }
        for (const q of list) {
          const t = q.age / q.life, fade = q.fade ? q.fade(t) : t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
          P.set([q.p[0], q.p[1], q.p[2], q.size + q.grow * q.age], n * 4);
          const c = q.colAt ? q.colAt(t) : q.col;
          C.set([c[0], c[1], c[2], c[3] * fade], n * 4);
          n++;
        }
        g.instanceCount = n; g.attributes.iP.needsUpdate = true; g.attributes.iC.needsUpdate = true;
        return n;
      },
      count: () => list.length,
    };
  }

  // ---------------- sound: the one engine (audio.js); the result layer plays from the effect record in visit.js ----------------
  let beat = 0;
  const mech = (name, arg) => { if (HSC.audio) HSC.audio.mechanism(name, [S.held || name, ++beat, 'mech'], arg); };

  // ---------------- models ----------------
  const MODEL = {};
  function buildModels() {
    const { Mesh, Lathe, Box, Cap, V2, Phys, Std, Group } = K;
    const mat = (o, C = Phys) => new C(o);
    const lath = (pts, seg = 32) => new Lathe(pts.map((p) => new V2(p[0], p[1])), seg);
    const add = (g, geo, m, x, y, z, s, r) => { const o = new Mesh(geo, m); o.position.set(x, y, z); if (s) o.scale.set(s[0], s[1], s[2]); if (r) o.rotation.set(r[0], r[1], r[2]); g.add(o); return o; };
    const sphere = (r) => lath(Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 2 + (i / 12) * Math.PI; return [Math.max(0.0001, Math.cos(a) * r), Math.sin(a) * r]; }), 24);
    const brass = mat({ color: '#c9a24a', metalness: 1, roughness: 0.28 }), chrome = mat({ color: '#d7dce0', metalness: 1, roughness: 0.2 });
    const wood = mat({ color: '#6b3f22', roughness: 0.45, clearcoat: 0.6 }), white = mat({ color: '#f4f1ea', roughness: 0.9, sheen: 1, sheenColor: '#ffffff' });
    const skin = mat({ color: '#c58d68', roughness: 0.55, sheen: 0.6, sheenColor: '#ffb59a' });
    // kolonya / aftershave: a glass bottle with lemon-yellow cologne and a gold cap (tip at y 0, pointing at the customer)
    const kb = new Group();
    add(kb, lath([[0.001, 0], [0.09, 0.02], [0.1, 0.12], [0.24, 0.3], [0.27, 0.7], [0.26, 1.05], [0.001, 1.08]]), mat({ color: '#fff6c8', metalness: 0, roughness: 0.05, transparent: true, opacity: 0.42, clearcoat: 1 }), 0, 0, 0);
    add(kb, lath([[0.001, 0.32], [0.22, 0.34], [0.23, 0.68], [0.001, 0.7]]), mat({ color: '#f2d64e', roughness: 0.2, transparent: true, opacity: 0.8 }), 0, 0, 0);
    add(kb, lath([[0.001, -0.14], [0.11, -0.13], [0.11, 0.02], [0.001, 0.03]]), brass, 0, 0, 0);
    MODEL.aftershave = kb;
    // hot towel: built per customer over his face (makeTowel)
    // massage: two hands (a rounded palm, four fingers, a thumb)
    const hand = (sx) => {
      const h = new Group();
      add(h, sphere(0.5), skin, 0, 0, 0, [0.95, 1.05, 0.32]);
      // four fingers in three bending segments each, curling over toward the head (-z)
      for (let f = 0; f < 4; f++) {
        const x = -0.33 + f * 0.22, len = [0.36, 0.42, 0.4, 0.3][f];
        let y = 0.5, z = 0, a = 0;
        for (let seg = 0; seg < 3; seg++) {
          const l = len * [0.45, 0.32, 0.23][seg];
          add(h, new Cap(0.075 - seg * 0.008, l, 6, 12), skin, x, y + Math.cos(a) * l / 2, z - Math.sin(a) * l / 2, null, [-a, 0, 0]);
          y += Math.cos(a) * l; z -= Math.sin(a) * l; a += 0.62;
        }
      }
      add(h, new Cap(0.09, 0.38, 6, 12), skin, -sx * 0.5, -0.05, -0.08, null, [-0.3, 0, -sx * 0.9]);
      return h;
    };
    const hm = new Group(); const hl = hand(-1), hr = hand(1); hm.add(hl, hr); hm.userData.hands = [hl, hr];
    MODEL.massage = hm;
    // the neck duster: a soft brush on a wooden handle
    const du = new Group();
    add(du, lath([[0.001, 0], [0.32, 0.04], [0.3, 0.32], [0.16, 0.45], [0.001, 0.46]]), mat({ color: '#efe3cc', roughness: 1, sheen: 1, sheenColor: '#fff' }), 0, 0, 0, [1, 1, 0.55]);
    add(du, lath([[0.13, 0], [0.11, 0.6], [0.14, 1.1], [0.001, 1.14]]), wood, 0, 0.44, 0);
    MODEL.talc = du;
    // pomade: a round tin, lid off, product on two fingertips
    const pm = new Group();
    add(pm, lath([[0.001, 0], [0.38, 0], [0.38, 0.18], [0.36, 0.2], [0.001, 0.2]]), mat({ color: '#2d4a7a', metalness: 0.6, roughness: 0.3 }), 0, 0.15, 0.35, null, [Math.PI / 2, 0, 0]);
    add(pm, lath([[0.001, 0], [0.34, 0], [0.34, 0.03], [0.001, 0.05]]), mat({ color: '#d9cfb5', roughness: 0.3, clearcoat: 1 }), 0, 0.15, 0.36, null, [Math.PI / 2, 0, 0]);
    for (const x of [-0.1, 0.1]) add(pm, new Cap(0.08, 0.5, 6, 12), skin, x, 0.25, 0, null, [0.3, 0, 0]);
    MODEL.pomade = pm;
    // threading: a twisted cotton thread (two strands wound round each other) stretched across
    const th = new Group(), strand = mat({ color: '#fbfaf5', roughness: 0.8 }, Std);
    for (let i = 0; i < 46; i++) { const t = i / 45, x = -0.7 + 1.4 * t, tw = t > 0.35 && t < 0.65 ? 0.025 : 0.06 * Math.abs(t - 0.5) * 2 + 0.01; for (const ph of [0, Math.PI]) { const a = t * 30 + ph; add(th, new Box(0.034, 0.012, 0.012), strand, x, Math.sin(a) * tw, Math.cos(a) * tw); } }
    for (const sx of [-1, 1]) for (const dy of [-0.06, 0.06]) add(th, new Box(0.9, 0.01, 0.01), strand, sx * 1.12, dy * 2.5, 0, null, [0, 0, sx * dy * 2.4]);
    MODEL.threading = th;
    // ear-hair singeing: a metal rod with a cotton ball dipped in spirit (the flame is particles)
    const sg = new Group();
    add(sg, sphere(0.085), mat({ color: '#e9dcc4', roughness: 1 }), 0, 0.06, 0, [1, 1.3, 1]);
    add(sg, lath([[0.022, 0], [0.022, 1.6], [0.001, 1.62]], 12), chrome, 0, 0.12, 0);
    add(sg, lath([[0.07, 0], [0.07, 0.5], [0.001, 0.52]], 16), wood, 0, 1.3, 0);
    MODEL.singe = sg;
    // nose-hair trimmer: a slim battery body with a slotted guard head
    const nt = new Group(), blackM = mat({ color: '#1b1c1e', roughness: 0.4, clearcoat: 0.5 });
    add(nt, lath([[0.001, 0], [0.07, 0.02], [0.08, 0.18], [0.12, 0.3], [0.14, 1.2], [0.001, 1.24]]), blackM, 0, 0, 0);
    add(nt, lath([[0.001, 0], [0.07, 0.01], [0.075, 0.16], [0.001, 0.17]], 16), chrome, 0, 0, 0);
    MODEL.nose = nt;
    // shaving brush: a badger knot (dark band, light tips) on a black handle, with lather on the tips
    const sb = new Group();
    add(sb, lath([[0.001, 0], [0.18, 0.03], [0.24, 0.18], [0.2, 0.42], [0.13, 0.55], [0.001, 0.56]]), mat({ color: '#efe9e0', roughness: 1, sheen: 1 }), 0, 0, 0);
    add(sb, lath([[0.13, 0.5], [0.15, 0.62], [0.001, 0.64]]), mat({ color: '#4a3a2c', roughness: 1 }), 0, 0, 0);
    add(sb, lath([[0.14, 0], [0.17, 0.12], [0.15, 0.5], [0.18, 0.62], [0.001, 0.64]]), mat({ color: '#141414', roughness: 0.3, clearcoat: 1 }), 0, 0.6, 0);
    add(sb, sphere(0.2), mat({ color: '#ffffff', roughness: 0.6 }), 0, 0.0, 0, [1.05, 0.4, 1.05]);
    MODEL.lather = sb;
    // the care tools: the same description draws the model in the hand and the tray picture (toolart.js)
    if (HSC.toolArtBuild) for (const k of Object.keys(CARE)) {
      const m = HSC.toolArtBuild(k, { Group, Mesh, Lathe, Box, Phys, V2 });
      if (m) MODEL[k] = m;
    }
    for (const [k, m] of Object.entries(MODEL)) { m.visible = false; headChild(m); }
  }
  // hold a model at a head point, its tip (y 0) on the surface and its body along the normal
  function hold(m, p, n, lift = 0.05, spin = 0) {
    const V = (x, y, z) => m.position.clone().set(x, y, z);
    m.position.set(p[0] + n[0] * lift, p[1] + n[1] * lift, p[2] + n[2] * lift);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), V(n[0], n[1], n[2]).normalize());
    if (spin) m.rotateY(spin);
    m.scale.setScalar(0.62);
    m.visible = true;
  }

  // ---------------- the hot towel, wrapped over this customer's face ----------------
  let towel = null;
  function makeTowel() {
    const st = HSC.debugState, C = st.coarse.pos, { Mesh, Geo, Attr, Phys } = K;
    const NX = 26, NY = 18, pos = [], idx = [];
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) {
      const th = -1.25 + 2.5 * (i / NX), y = -0.9 + 3.2 * (j / NY), dx = Math.sin(th), dz = Math.cos(th);
      // the head surface in that direction at that height: the furthest coarse vertex near the ray
      let best = 1.6;
      for (let v = 0; v < C.length / 3; v++) { const vy = C[v * 3 + 1]; if (Math.abs(vy - y) > 0.18) continue; const x = C[v * 3], z = C[v * 3 + 2] + 0.13, r = Math.hypot(x, z); if (r < 0.3 || (x * dx + z * dz) / r < 0.97) continue; if (r > best) best = r; }
      const fold = 0.035 * Math.sin(i * 1.7 + j * 0.9) + 0.02 * Math.sin(i * 0.6 - j * 1.9);
      const r = best + 0.12 + fold;
      pos.push(dx * r, y, dz * r - 0.13);
    }
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + NX + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new Geo(); g.setAttribute('position', new Attr(new Float32Array(pos), 3)); g.setIndex(idx); g.computeVertexNormals();
    if (towel) { towel.parent && towel.parent.remove(towel); towel.geometry.dispose(); }
    towel = headChild(new Mesh(g, new Phys({ color: '#f6f3ec', roughness: 1, sheen: 1, sheenRoughness: 0.9, sheenColor: '#ffffff', side: 2 })));
    towel.visible = false;
    return towel;
  }

  // ---------------- ear hair: the tragus / concha hairs older men grow ----------------
  let ear = null;
  function makeEarHair() {
    const st = HSC.debugState, bowl = HSC.earBowls && HSC.earBowls(), B = st.base, T = K.T, I = HSC.ctx.Pt.index.array;
    if (!bowl) return;
    const tris = [], cum = [];
    let area = 0;
    for (const sd of [-1, 1]) {
      const v = bowl[sd]; if (v < 0) continue;
      const cx = B[v * 3], cy = B[v * 3 + 1], cz = B[v * 3 + 2];
      for (let t = 0; t < I.length; t += 3) {
        const a = I[t] * 3, b = I[t + 1] * 3, d = I[t + 2] * 3, mx = (B[a] + B[b] + B[d]) / 3, my = (B[a + 1] + B[b + 1] + B[d + 1]) / 3, mz = (B[a + 2] + B[b + 2] + B[d + 2]) / 3;
        if (Math.hypot(mx - cx, (my - cy) * 0.8, mz - cz - 0.05) > 0.2) continue;
        const ux = B[b] - B[a], uy = B[b + 1] - B[a + 1], uz = B[b + 2] - B[a + 2], wx = B[d] - B[a], wy = B[d + 1] - B[a + 1], wz = B[d + 2] - B[a + 2];
        const ar = 0.5 * Math.hypot(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx);
        if (ar > 0) { area += ar; tris.push([t, sd]); cum.push(area); }
      }
    }
    if (!tris.length) return;
    const n = 700, R = HSC.rng(0xea8), tri = new Int32Array(n * 3), bary = new Float32Array(n * 3), seeds = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      let lo = 0, hi = cum.length - 1; const x = R.next() * area;
      while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < x) lo = m + 1; else hi = m; }
      const [t, sd] = tris[lo], r1 = Math.sqrt(R.next()), r2 = R.next(), w = [1 - r1, r1 * (1 - r2), r1 * r2];
      for (let j = 0; j < 3; j++) { tri[i * 3 + j] = I[t + j]; bary[i * 3 + j] = w[j]; }
      seeds.set([R.next(), R.next(), R.next(), sd > 0 ? 1 : 0], i * 4);
    }
    const g = new T.af(), pos = [], idx = [], SEG = 4;
    for (let s = 0; s <= SEG; s++) { pos.push(-1, s / SEG, 0, 1, s / SEG, 0); if (s < SEG) { const u = s * 2; idx.push(u, u + 1, u + 2, u + 1, u + 3, u + 2); } }
    g.setAttribute('position', new T.mt(pos, 3)); g.setIndex(idx);
    const root = new Float32Array(n * 3), nrm = new Float32Array(n * 3), keep = new Float32Array(n).fill(1);
    g.setAttribute('aRoot', new T.Ra(root, 3)); g.setAttribute('aNormal', new T.Ra(nrm, 3)); g.setAttribute('aSeed', new T.Ra(seeds, 4)); g.setAttribute('aKeep', new T.Ra(keep, 1));
    g.instanceCount = n;
    // each strand belongs to one of the ear's eight bundles, by its sector round the bowl: what the flame reaches
    const bundle = new Uint8Array(n), centre = new Float32Array(16 * 3), count = new Uint16Array(16);
    for (let i = 0; i < n; i++) {
      const sd = seeds[i * 4 + 3] > 0.5 ? 1 : 0, v = bowl[sd ? 1 : -1];
      let x = 0, y = 0, z = 0;
      for (let j = 0; j < 3; j++) { const q = tri[i * 3 + j] * 3, w = bary[i * 3 + j]; x += B[q] * w; y += B[q + 1] * w; z += B[q + 2] * w; }
      const sec = Math.min(7, Math.floor(((Math.atan2(y - B[v * 3 + 1], z - B[v * 3 + 2]) + Math.PI) / (2 * Math.PI)) * 8)), id = sd * 8 + sec;
      bundle[i] = id; centre[id * 3] += x; centre[id * 3 + 1] += y; centre[id * 3 + 2] += z; count[id]++;
    }
    for (let id = 0; id < 16; id++) if (count[id]) for (let j = 0; j < 3; j++) centre[id * 3 + j] /= count[id];
    const U = { uEar: { value: [0, 0, 0, 0] } };
    const vert = `attribute vec3 aRoot,aNormal;attribute vec4 aSeed;attribute float aKeep;uniform vec3 cam;uniform vec4 uEar;
 varying vec3 vTip,vTangent,vSeed;varying float vAlong,vEdge,vLength,vGrey;varying vec3 vN;
 void main(){vec3 n=normalize(aNormal);float side=aSeed.w;float burn=1.0-aKeep;
  float L=uEar.x*(.5+.9*aSeed.x)*step(aSeed.z,uEar.y)*(1.0-burn);
  vec3 r=normalize(vec3(aSeed.x-.5,aSeed.y-.5,aSeed.z-.5));vec3 t1=normalize(cross(n,r)+vec3(.0001));
  float t=position.y;vec3 dir=normalize(n*.75+t1*(aSeed.y-.5)*.9+vec3(0.0,-.15,0.0));
  vec3 c=normalize(dir+vec3(0.0,-.5,0.0)*t*.6+t1*sin(t*4.0+aSeed.x*6.28)*.25*burn*4.0);
  vec3 p=aRoot+n*.002+c*(t*L);vec3 tang=c;vec3 view=normalize(cam-p),sd=cross(tang,view);if(dot(sd,sd)<.00001)sd=vec3(1.0,0.0,0.0);sd=normalize(sd);
  p+=sd*position.x*.004*mix(1.0,.3,t*t);vGrey=step(fract(aSeed.z*7.3),.4);
  vTip=p;vTangent=tang;vSeed=aSeed.xyz;vAlong=t;vEdge=position.x;vLength=L;vN=n;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`;
    const c = HSC.ctx;
    const mat = new T.fr({ vertexShader: vert, fragmentShader: HSC.glsl.browFrag(c.Ql), uniforms: Object.assign({ uGrid: c.uGrid, uHairTint: c.uHairTint, uDensity: c.uDensity }, c.light, HSC.U, U), side: T.$t });
    const mesh = new T.Ze(g, mat); mesh.frustumCulled = false; mesh.renderOrder = 1;
    c.vt.add(mesh);
    ear = { mesh, g, tri, bary, root, nrm, n, U, keep, bundle, centre, count };
    placeEar(HSC.ctx.Pt.attributes.position.array, HSC.ctx.Pt.attributes.normal.array);
  }
  // the strands left on each bundle, from the visit's saved lengths
  function showEar() {
    const st0 = V() && V().state();
    if (!ear || !st0) return;
    const L = st0.ear.len, L0 = S.ear0;
    for (let i = 0; i < ear.n; i++) { const b = ear.bundle[i]; ear.keep[i] = L0 && L0[b] ? L[b] / L0[b] : 1; }
    ear.g.attributes.aKeep.needsUpdate = true;
  }
  // ---------------- nose hair: fibres past the nostril rim, one strand list per side, a bundle each ----------------
  let nose = null;
  const NOSTRIL = [0.21, 0.6, 2.36];
  function makeNoseHair() {
    const B = HSC.debugState.base, T = K.T, I = HSC.ctx.Pt.index.array, NN = HSC.ctx.Pt.attributes.normal.array, tris = [], cum = [];
    let area = 0;
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t] * 3, b = I[t + 1] * 3, d = I[t + 2] * 3, mx = (B[a] + B[b] + B[d]) / 3, my = (B[a + 1] + B[b + 1] + B[d + 1]) / 3, mz = (B[a + 2] + B[b + 2] + B[d + 2]) / 3;
      if (Math.hypot(Math.abs(mx) - NOSTRIL[0], my - NOSTRIL[1], mz - NOSTRIL[2]) > 0.17) continue;
      if (NN[a + 1] + NN[b + 1] + NN[d + 1] > -0.6) continue; // only the underside: the fibres leave through the opening
      const ux = B[b] - B[a], uy = B[b + 1] - B[a + 1], uz = B[b + 2] - B[a + 2], wx = B[d] - B[a], wy = B[d + 1] - B[a + 1], wz = B[d + 2] - B[a + 2];
      const ar = 0.5 * Math.hypot(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx);
      if (ar > 0) { area += ar; tris.push(t); cum.push(area); }
    }
    if (!tris.length) return;
    const n = 96, R = HSC.rng(0x4e05), tri = new Int32Array(n * 3), bary = new Float32Array(n * 3), seeds = new Float32Array(n * 4), base = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      let lo = 0, hi = cum.length - 1; const x = R.next() * area;
      while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < x) lo = m + 1; else hi = m; }
      const t = tris[lo], r1 = Math.sqrt(R.next()), r2 = R.next(), w = [1 - r1, r1 * (1 - r2), r1 * r2];
      for (let j = 0; j < 3; j++) { tri[i * 3 + j] = I[t + j]; bary[i * 3 + j] = w[j]; const q = I[t + j] * 3; base[i * 3] += B[q] * w[j]; base[i * 3 + 1] += B[q + 1] * w[j]; base[i * 3 + 2] += B[q + 2] * w[j]; }
      seeds.set([R.next(), R.next(), R.next(), base[i * 3] > 0 ? 1 : 0], i * 4);
    }
    const g = new T.af(), pos = [], idx = [], SEG = 3;
    for (let s0 = 0; s0 <= SEG; s0++) { pos.push(-1, s0 / SEG, 0, 1, s0 / SEG, 0); if (s0 < SEG) { const u = s0 * 2; idx.push(u, u + 1, u + 2, u + 1, u + 3, u + 2); } }
    g.setAttribute('position', new T.mt(pos, 3)); g.setIndex(idx);
    const root = new Float32Array(n * 3), nrm = new Float32Array(n * 3), out = new Float32Array(n);
    g.setAttribute('aRoot', new T.Ra(root, 3)); g.setAttribute('aNormal', new T.Ra(nrm, 3)); g.setAttribute('aSeed', new T.Ra(seeds, 4)); g.setAttribute('aOut', new T.Ra(out, 1));
    g.instanceCount = n;
    const vert = `attribute vec3 aRoot,aNormal;attribute vec4 aSeed;attribute float aOut;uniform vec3 cam;
 varying vec3 vTip,vTangent,vSeed;varying float vAlong,vEdge,vLength,vGrey;varying vec3 vN;
 void main(){vec3 n=normalize(aNormal);float L=aOut;float t=position.y;float sx=aSeed.w*2.0-1.0;
  vec3 dir=normalize(vec3(sx*.2+(aSeed.x-.5)*1.1,-1.0,.32+(aSeed.y-.5)*.7));vec3 c=normalize(dir+vec3((aSeed.z-.5)*.9,-.2,0.0)*t);
  vec3 p=aRoot+vec3(0.0,0.0,.006)+c*(t*L);vec3 view=normalize(cam-p),sd=cross(c,view);if(dot(sd,sd)<.00001)sd=vec3(1.0,0.0,0.0);sd=normalize(sd);
  p+=sd*position.x*.0055*mix(1.0,.3,t*t);vGrey=step(fract(aSeed.z*7.3),.3);
  vTip=p;vTangent=c;vSeed=aSeed.xyz;vAlong=t;vEdge=position.x;vLength=L;vN=n;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`;
    const c = HSC.ctx;
    const mat = new T.fr({ vertexShader: vert, fragmentShader: HSC.glsl.browFrag(c.Ql), uniforms: Object.assign({ uGrid: c.uGrid, uHairTint: c.uHairTint, uDensity: c.uDensity }, c.light, HSC.U), side: T.$t });
    const mesh = new T.Ze(g, mat); mesh.frustumCulled = false; mesh.renderOrder = 1;
    c.vt.add(mesh);
    nose = { mesh, g, tri, bary, root, nrm, n, out, base, seeds, bundle: new Int16Array(n).fill(-1), centres: [] };
    placeNose(HSC.ctx.Pt.attributes.position.array, HSC.ctx.Pt.attributes.normal.array);
  }
  function placeNose(P, N) {
    if (!nose) return;
    for (let i = 0; i < nose.n; i++) {
      let x = 0, y = 0, z = 0, a = 0, b = 0, d = 0;
      for (let j = 0; j < 3; j++) { const v = nose.tri[i * 3 + j] * 3, w = nose.bary[i * 3 + j]; x += P[v] * w; y += P[v + 1] * w; z += P[v + 2] * w; a += N[v] * w; b += N[v + 1] * w; d += N[v + 2] * w; }
      const l = Math.hypot(a, b, d) || 1;
      nose.root.set([x, y, z], i * 3); nose.nrm.set([a / l, b / l, d / l], i * 3);
    }
    nose.g.attributes.aRoot.needsUpdate = true; nose.g.attributes.aNormal.needsUpdate = true;
  }
  // this customer's bundles on the nostril strands: each bundle takes the strands nearest its place round the rim
  function dealNose() {
    const st0 = V() && V().state();
    if (!nose || !st0) return;
    const N = st0.nose, per = [[], []];
    for (let b = 0; b < N.len.length; b++) per[N.side[b]].push(b);
    nose.bundle.fill(-1);
    const sum = new Float32Array(N.len.length * 3), cnt = new Uint16Array(N.len.length);
    for (let i = 0; i < nose.n; i++) {
      const sd = nose.seeds[i * 4 + 3] > 0.5 ? 1 : 0, list = per[sd];
      if (!list.length) continue;
      const ang = Math.atan2(nose.base[i * 3 + 2] - NOSTRIL[2], Math.abs(nose.base[i * 3]) - NOSTRIL[0]);
      const b = list[Math.min(list.length - 1, Math.floor(((ang + Math.PI) / (2 * Math.PI)) * list.length))];
      nose.bundle[i] = b; cnt[b]++;
      for (let j = 0; j < 3; j++) sum[b * 3 + j] += nose.base[i * 3 + j];
    }
    nose.centres = Array.from(cnt, (n, b) => (n ? [sum[b * 3] / n, sum[b * 3 + 1] / n, sum[b * 3 + 2] / n] : null));
    showNose();
  }
  function showNose() {
    const st0 = V() && V().state();
    if (!nose || !st0) return;
    const N = st0.nose;
    // only the portion past the rim renders: 0.01 mm quanta in head units (about 45 mm, with a little reading room:
    // the chair camera is further away than a real barber's eye)
    for (let i = 0; i < nose.n; i++) { const b = nose.bundle[i]; nose.out[i] = b >= 0 ? Math.max(0, N.len[b] - N.rim[b]) / 3600 * (0.55 + 0.75 * nose.seeds[i * 4]) : 0; }
    nose.g.attributes.aOut.needsUpdate = true;
  }
  function placeEar(P, N) {
    if (!ear) return;
    for (let i = 0; i < ear.n; i++) {
      let x = 0, y = 0, z = 0, a = 0, b = 0, d = 0;
      for (let j = 0; j < 3; j++) { const v = ear.tri[i * 3 + j] * 3, w = ear.bary[i * 3 + j]; x += P[v] * w; y += P[v + 1] * w; z += P[v + 2] * w; a += N[v] * w; b += N[v + 1] * w; d += N[v + 2] * w; }
      const l = Math.hypot(a, b, d) || 1;
      ear.root.set([x, y, z], i * 3); ear.nrm.set([a / l, b / l, d / l], i * 3);
    }
    ear.g.attributes.aRoot.needsUpdate = true; ear.g.attributes.aNormal.needsUpdate = true;
  }
  // how much ear hair a customer has: none before about 35, growing with age (more in South Asian men)
  function earHairOf(p) {
    if (!p) return [0, 0];
    // by age only: service and grooming frequency never follow heritage (customer invariants section 3)
    const R = HSC.rng(((p.seed >>> 0) ^ 0xea7a17) >>> 0 || 1);
    const has = R.next() < Math.min(0.85, HSC.smooth(35, 70, p.years) * 0.8);
    return has ? [(0.06 + 0.12 * HSC.smooth(40, 80, p.years)) * (0.7 + 0.6 * R.next()), 0.35 + 0.55 * HSC.smooth(40, 80, p.years)] : [0, 0];
  }
  HSC.onMorph = (P, N) => { placeEar(P, N); placeNose(P, N); };
  HSC.earHairOf = earHairOf;

  // ---------------- the service tools in the tray ----------------
  const I = {
    aftershave: `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M10 3h4v3h-4z" fill="#c9a24a" stroke="${INK}" stroke-width="1.5"/><path d="M9 6h6l2 4v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9z" fill="#fff3b0" stroke="${INK}" stroke-width="1.6"/><path d="M7.5 13h9v4h-9z" fill="#f2d64e"/><path d="M19 4l2-1M19 7h2.5M18 2l1-1.5" stroke="#4aa3df" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    towel: `<svg viewBox="0 0 24 24" width="30" height="30"><rect x="4" y="8" width="16" height="11" rx="3" fill="#f6f3ec" stroke="${INK}" stroke-width="1.6"/><path d="M4 12h16M4 15h16" stroke="#d9d2c4" stroke-width="1.2"/><path d="M8 6c0-2 2-2 2-4M12 6c0-2 2-2 2-4M16 6c0-2 2-2 2-4" fill="none" stroke="#9fb6c6" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    massage: `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M7 21v-6l-2.5-3.5a1.2 1.2 0 0 1 2-1.4L8 12V5a1.2 1.2 0 0 1 2.4 0v5V3.8a1.2 1.2 0 0 1 2.4 0V10V4.6a1.2 1.2 0 0 1 2.4 0V11V6.4a1.2 1.2 0 0 1 2.4 0V15l-2 6z" fill="#e2b08e" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
    talc: `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M11 2h2v9h-2z" fill="#6b3f22" stroke="${INK}" stroke-width="1.4"/><path d="M6 11h12l-1 7c-.5 2-2 3-5 3s-4.5-1-5-3z" fill="#efe3cc" stroke="${INK}" stroke-width="1.6"/><circle cx="4" cy="20" r="1" fill="#ddd"/><circle cx="20" cy="19" r="1.3" fill="#ddd"/></svg>`,
    pomade: `<svg viewBox="0 0 24 24" width="30" height="30"><ellipse cx="12" cy="15" rx="8" ry="3" fill="#2d4a7a" stroke="${INK}" stroke-width="1.6"/><path d="M4 15v3c0 1.7 3.6 3 8 3s8-1.3 8-3v-3" fill="#2d4a7a" stroke="${INK}" stroke-width="1.6"/><ellipse cx="12" cy="15" rx="6" ry="2" fill="#e8dfc5"/><path d="M15 5l3-2M17 8l3-1" stroke="#ffc83d" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    threading: `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"><path d="M2 6l8 6-8 6M22 6l-8 6 8 6"/><path d="M10 12c1-1 3 1 4 0" stroke="#999" stroke-width="2.4"/></svg>`,
    singe: `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 22l1-10h-2z" fill="#9aa1a7" stroke="${INK}" stroke-width="1.2"/><path d="M12 2c2 3 4 4.5 4 7.5a4 4 0 0 1-8 0c0-2 1-3 1.6-4 .4 1.4 1.2 2 1.9 2 0-2-.5-3.6.5-5.5z" fill="#ff8a3d" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 7c1 1.5 2 2.5 2 3.8a2 2 0 0 1-4 0c0-1 .6-1.6 1-2.2.3.6.6.9 1 .9" fill="#ffd45e"/></svg>`,
    nose: `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M9.5 9h5l.8 12h-6.6z" fill="#1b1c1e" stroke="${INK}" stroke-width="1.5"/><path d="M10.5 3h3l1 6h-5z" fill="#d7dce0" stroke="${INK}" stroke-width="1.5"/><path d="M11 5h2M11 7h2" stroke="${INK}" stroke-width="1"/></svg>`,
    lather: `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M8 9c0-4 2-6 4-6s4 2 4 6z" fill="#efe9e0" stroke="${INK}" stroke-width="1.5"/><path d="M9.5 9h5l-.6 12h-3.8z" fill="#141414" stroke="${INK}" stroke-width="1.5"/><circle cx="7" cy="4" r="2" fill="#fff" stroke="#ccc"/><circle cx="17.5" cy="5" r="1.5" fill="#fff" stroke="#ccc"/></svg>`,
  };
  for (const [k, d] of Object.entries(SERVICES)) HSC.addTool && HSC.addTool(k, { level: d.level }, I[k]);
  for (const [k, d] of Object.entries(CARE)) HSC.addTool && HSC.addTool(k, { level: d.level, care: true }, '');
  HSC.SERVICE_ICON = I;
  HSC.onTool = (k) => { for (const [n, m] of Object.entries(MODEL)) if (m) m.visible = false; S.held = SERVICES[k] || CARE[k] ? k : null; if (HSC.audio) HSC.audio.stop(); };

  // ---------------- touch ----------------
  const ptr = { down: false, x: 0, y: 0, x0: 0, y0: 0, t0: 0, last: 0 };
  let hit = null;
  function headHitAt(e) {
    const v = HSC.view;
    if (!v || !v.headHit) return null;
    let x = e.clientX, y = e.clientY;
    try { if (e.pointerType === 'touch' && v.touchTarget) { const t = v.touchTarget(e); x = t.x; y = t.y; } } catch (er) {}
    return v.headHit(x, y);
  }
  const active = () => { const g = G(); if (!g || !S.held) return false; const s = g.getState(); return s.status === 'cutting'; };
  addEventListener('pointermove', () => { ptr.moved = performance.now(); }, true);
  addEventListener('pointerdown', (e) => { if (!active() || e.target.closest('button,#hsc-tools,#hsc-menu,#hsc-panel')) return; ptr.down = true; ptr.x0 = ptr.x = e.clientX; ptr.y0 = ptr.y = e.clientY; ptr.t0 = ptr.last = performance.now(); hit = headHitAt(e); if (hit) begin(hit); }, true);
  addEventListener('pointermove', (e) => { if (!ptr.down || !active()) return; ptr.x = e.clientX; ptr.y = e.clientY; ptr.last = performance.now(); hit = headHitAt(e); if (hit) drag(hit); }, true);
  for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, () => { if (ptr.down) end(ev === 'pointerup'); ptr.down = false; }, true);

  const person = () => { try { return G().getState().look.person; } catch (e) { return null; } };
  function face(amounts, w) { const p = person(); if (p && HSC.setExpression) HSC.setExpression(p, amounts, w); }
  // the beard grid cell and the brow cell under a head hit (on the un-morphed head)
  const baseOf = (h) => (HSC.toBase ? HSC.toBase(h) : null);
  // the beard cells under a working surface of radius r (cells), with their contact weight (10000 at the centre)
  function cellsAt(b, r) {
    if (!b || !HSC.beardCell) return null;
    const c0 = HSC.beardCell(b[0], b[1], b[2]);
    if (c0 < 0) return null;
    const col0 = c0 % 128, row0 = Math.floor(c0 / 128), cells = [], weights = [];
    for (let dr = -r; dr <= r; dr++) for (let dc = -r; dc <= r; dc++) {
      const d2 = dr * dr + dc * dc;
      if (d2 > r * r) continue;
      const row = row0 + dr, col = col0 + dc;
      if (row < 0 || row > 63 || col < 0 || col > 127) continue;
      cells.push(row * 128 + col); weights.push(10000 - Math.floor((6000 * d2) / (r * r)));
    }
    return { cells, weights };
  }

  // ---------------- what each service does ----------------
  let fxN = null, fxA = null, held = { t: 0 }, anim = [];
  function begin(h) {
    const k = S.held;
    held = { t: 0, rub: 0, zip: 0, stamp: null, ms: 0 };
    if (k === 'aftershave') return splash(h);
    if (k === 'towel') return wrapTowel();
    if (k === 'spray') return sprayAt(h);
    if (k === 'shavingCream') { hold(MODEL.shavingCream, h.p, h.n, 0.75); held.pump = true; return; } // one dose when the pump comes back up
    drag(h);
  }
  function drag(h) {
    const k = S.held, m = MODEL[k], b = baseOf(h);
    if (!b) return;
    if (k === 'massage') {
      // both hands, mirrored, palms on the sides of the head at the touch height, kneading in circles
      const hm = MODEL.massage; hm.visible = true; hm.position.set(0, 0, 0); hm.quaternion.identity(); hm.scale.setScalar(1);
      const t = performance.now() / 1000, y = Math.min(3.2, Math.max(1.6, h.p[1]));
      hm.userData.hands.forEach((hd, i) => { const sx = i ? 1 : -1, a = t * 6 + i * Math.PI; hd.position.set(sx * 1.86 + Math.cos(a) * 0.03, 2.15 + Math.sin(a) * 0.07, 0.25 + Math.cos(a) * 0.06); hd.rotation.set(0, sx * Math.PI / 2, sx * 0.22); hd.scale.setScalar(1.1); });
      return;
    }
    const rub = RUB[k];
    if (m) hold(m, h.p, h.n, rub ? rub.lift : k === 'singe' ? 0.28 : k === 'threading' ? 0.02 : k === 'spray' || k === 'shavingCream' ? 0.75 : 0.03, k === 'threading' ? Math.atan2(h.n[0], h.n[2]) : 0);
    if (k === 'pomade') pomadeAt(b);
    if (rub) stampAlong(k, b, rub.r, h);
    if (k === 'threading') threadAt(h, b);
    if (k === 'nose') noseAt(h, b);
  }
  // a rubbing tool lays one stamp per fixed distance travelled: frame rate and touch rate change nothing, and a
  // still finger adds nothing (physics contract 3.2)
  const SPACING = 0.07;
  function stampAlong(k, b, r, h) {
    const last = held.stamp;
    const d = last ? Math.hypot(b[0] - last[0], b[1] - last[1], b[2] - last[2]) : Infinity;
    if (d < SPACING) return;
    const n = last ? Math.min(14, Math.floor(d / SPACING)) : 1;
    for (let i = 1; i <= n; i++) {
      const p = last ? last.map((v, j) => v + (b[j] - v) * ((i * SPACING) / d)) : b;
      const at = cellsAt(p, r);
      if (!at) continue;
      const e = V().commit({ tool: k, cells: at.cells, weights: at.weights, dirX: 0, dirY: 10000 });
      if (e && e.changed && h) sparkle(k, h);
    }
    held.stamp = last && d <= SPACING * 14 ? last.map((v, j) => v + (b[j] - v) * ((n * SPACING) / d)) : b;
  }
  const TINT = { lather: [1, 1, 1, 0.8], shavingSoap: [0.95, 0.92, 0.82, 0.5], beardOil: [0.95, 0.75, 0.3, 0.5], beardBalm: [0.9, 0.85, 0.65, 0.4], coldTowel: [0.8, 0.9, 1, 0.35], alum: [0.95, 0.95, 1, 0.4] };
  function sparkle(k, h) {
    if (!fxN) return;
    fxN.add({ p: h.p.map((v, j) => v + h.n[j] * 0.03 + (Math.random() - 0.5) * 0.1), v: h.n.map((v) => v * 0.2), size: 0.015 + Math.random() * 0.02, life: 0.5, col: TINT[k] || [1, 1, 1, 0.5] });
  }
  // the spray bottle: one squeeze of the trigger, one cone of water
  function sprayAt(h) {
    const b = baseOf(h), m = MODEL.spray;
    if (m) hold(m, h.p, h.n, 0.75);
    mech('trigger');
    const at = cellsAt(b, 9), e = at ? V().commit({ tool: 'spray', cells: at.cells, weights: at.weights }) : null;
    if (e && e.changed) for (let i = 0; i < 26; i++) fxN.add({ p: h.p.map((v, j) => v + h.n[j] * 0.7), v: h.n.map((v) => -v * (1.4 + Math.random()) + (Math.random() - 0.5) * 1.1), g: -2, size: 0.012 + Math.random() * 0.012, life: 0.45 + Math.random() * 0.3, col: [0.75, 0.87, 1, 0.65] });
  }
  // ---- eligible areas ----
  const st = () => HSC.debugState;
  // pomade: the top of the head where there is scalp (coarse head vertices), frozen at the first touch
  function pomadeAt(b) {
    const D = st();
    if (!S.pomade) {
      const B = D && D.coarseBase, sc = D && D.scalpC, e = [];
      if (B && sc) for (let v = 0; v < sc.length; v++) if (sc[v] > 0.5 && B[v * 3 + 1] > 2.4) e.push(v);
      S.pomade = e;
    }
    if (!S.pomade.length || b[1] < 2.2) return;
    const B = D.coarseBase, near = [];
    for (const v of S.pomade) if (Math.hypot(B[v * 3] - b[0], B[v * 3 + 1] - b[1], B[v * 3 + 2] - b[2]) < 0.32) near.push(v);
    V().commit({ tool: 'pomade', cells: near, elig: S.pomade });
  }
  // threading: the cheek line, beard cells at the top edge of the beard on the cheeks (empty skin above them),
  // frozen when the thread first touches; the beard's body and the brows are never threaded
  function cheekLine() {
    const g = G(), s = g && g.getState(), D = st(), out = new Set();
    const P = D && D.beardCells && D.beardCells.positions;
    if (!s || !Array.isArray(s.beard) || !P) return out;
    const B = s.beard;
    for (let c = 0; c < B.length; c++) {
      if (!(B[c] > 0) || Math.abs(P[c * 3]) < 0.45) continue;
      const row = Math.floor(c / 128), col = c % 128;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const r2 = row + dr, c2 = col + dc;
        if (r2 < 0 || r2 > 63 || c2 < 0 || c2 > 127) continue;
        const n = r2 * 128 + c2;
        if (B[n] === 0 && P[n * 3 + 1] > P[c * 3 + 1]) { out.add(c); break; }
      }
    }
    return out;
  }
  // talc / neck duster: available loose clippings when the brush first touches
  function dustAt(b) {
    if (S.talcAvail < 0) { const cs = HSC.clippingsStats ? HSC.clippingsStats() : null; S.talcAvail = cs ? Math.max(0, cs.onShow - cs.swept) : 0; }
    if (!HSC.dustClippings) return;
    // the bristle footprint: a band across the gown under the brush (head x -1.6..1.6 maps onto the gown)
    const removed = S.talcAvail ? HSC.dustClippings((b[0] + 1.6) / 3.2, 0.14) : 0;
    V().commit({ tool: 'talc', removed, avail: S.talcAvail });
  }
  function end(released) {
    const k = S.held;
    if (k === 'massage' || k === 'towel') face({}, 0);
    if (MODEL.massage) MODEL.massage.visible = false;
    // a complete actuation: down and back up. A cancelled press registers nothing.
    if (k === 'shavingCream' && held.pump) { held.pump = false; mech('pump'); if (released) V().commit({ tool: 'shavingCream', pump: V().nextPump() }); }
  }
  // kolonya / aftershave: the bottle tips, cologne splashes on the face and neck, a cool shiver, eyes close
  function splash(h) {
    const m = MODEL.aftershave; hold(m, h.p, h.n, 0.7);
    anim.push({ t: 0, life: 1.4, step(t) { m.rotateX(0); m.scale.setScalar(0.62 * (t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1)); if (t > 0.95) m.visible = false; } });
    for (let i = 0; i < 40; i++) { const sp = 1.5 + Math.random() * 1.5; fxN.add({ p: h.p.map((v, j) => v + h.n[j] * 0.6), v: h.n.map((v) => -v * sp + (Math.random() - 0.5) * 1.6), g: -3, size: 0.018 + Math.random() * 0.02, life: 0.5 + Math.random() * 0.4, col: [0.95, 0.92, 0.6, 0.8] }); }
    for (let i = 0; i < 12; i++) fxA.add({ p: h.p.map((v) => v + (Math.random() - 0.5) * 0.5), v: [0, 0.2, 0], size: 0.03, life: 0.8, col: [1, 1, 0.85, 0.7] });
    mech('bottle');
    face({ close: 0.9, smile: 0.4, cheekUp: 0.3 }, 1); setTimeout(() => face({}, 0), 1100);
    // the splash treats the freshly shaved skin it lands on; 60% of the shaved area completes it. With nothing
    // shaved yet it is only a splash: the reducer changes nothing and no result sound plays.
    const at = cellsAt(baseOf(h), 11);
    if (at) V().commit({ tool: 'aftershave', cells: at.cells });
  }
  // the hot towel: it settles over the face, steams, and is lifted off after a few seconds
  function wrapTowel() {
    if (anim.some((a) => a.towel)) return;
    const tw = makeTowel(); tw.visible = true;
    mech('towel');
    face({ close: 1, smile: 0.15 }, 1);
    anim.push({ towel: true, t: 0, life: 3.4, step(t) {
      const drop = t < 0.15 ? 1 - t / 0.15 : t > 0.88 ? (t - 0.88) / 0.12 : 0;
      tw.position.set(0, drop * 1.2, drop * 0.4); tw.scale.set(1, 1, 1);
      if (Math.random() < 0.5) fxN.add({ p: [(Math.random() - 0.5) * 2.4, -0.5 + Math.random() * 2.6, 2.1 + Math.random() * 0.2], v: [(Math.random() - 0.5) * 0.1, 0.45 + Math.random() * 0.3, 0.12], size: 0.08, grow: 0.35, life: 1.6, col: [1, 1, 1, 0.22], drag: 0.6 });
      // the full wrap is 3.4 s of contact over the whole face: heat and moisture to full, decaying in play
      if (t >= 1) { tw.visible = false; face({}, 0); V().commit({ tool: 'towel', cells: faceCells(), ms: 3000 }); }
    } });
  }
  // the towel's mask: every cell on the front of the face and neck
  let faceList = null;
  function faceCells() {
    if (faceList) return faceList;
    const D = st(), P = D && D.beardCells && D.beardCells.positions, out = [];
    if (P) for (let c = 0; c < 8192; c++) if (D.beardCells.has[c] && P[c * 3 + 2] > -0.3) out.push(c);
    return (faceList = out);
  }
  // threading: the twisted thread plucks only the stray set: the cheek line and the brow's fringe. The frozen cheek
  // line is computed here from the current beard; the reducer keeps it from the first effect on.
  function threadAt(h, b) {
    const g = G(), s = g.getState(), now = performance.now();
    if (now - held.zip > 110) { mech('zip'); held.zip = now; }
    const at = cellsAt(b, 2), C = HSC.browCells && HSC.browCells(), browCells = [];
    if (C) for (let c = 0; c < 4096; c++) if (C.has[c] && Math.hypot(C.pos[c * 3] - b[0], C.pos[c * 3 + 1] - b[1]) < 0.07) browCells.push(c);
    const e = V().commit({ tool: 'threading', cells: at ? at.cells : [], browCells, elig: [...cheekLine()] });
    if (!e || !e.changed || !g.restore) return;
    const v = V().state(), nb = s.beard.slice();
    for (const c of e.cells) nb[c] = V().levelOfQ(v.f.len[c]);
    const lv = V().browLevels(s);
    if (lv && HSC.setBrow) HSC.setBrow(lv.brow);
    g.restore(s.hair, nb, lv ? lv.brow : s.brow);
  }
  // the rotary nose trimmer: only the fibres entering the guarded opening at the nostril, never by proximity alone
  function noseAt(h, b) {
    const now = performance.now();
    if (now - (held.zip || 0) > 180) { mech('whir'); held.zip = now; }
    if (!nose || Math.hypot(Math.abs(b[0]) - NOSTRIL[0], b[1] - NOSTRIL[1], b[2] - NOSTRIL[2]) > 0.26) return;
    const list = [];
    nose.centres.forEach((c, i) => { if (c && Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2]) < 0.12) list.push(i); });
    if (list.length) V().commit({ tool: 'nose', bundles: list });
  }

  // ---------------- the frame loop ----------------
  let last = performance.now();
  function frame() {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const g = G(); if (!g || !K) return;
    const s = g.getState();
    const ps = s.look && s.look.person ? s.look.person.seed : null;
    if (s.jobId !== S.job || ps !== S.seed) { S.seed = ps; newCustomer(s); }
    // held services animate and sound while the finger is down
    if (ptr.down && active() && hit) {
      held.t += dt;
      const k = S.held;
      if (k === 'massage') {
        if (now - (held.rub || 0) > 260) { mech('rub'); held.rub = now; }
        face({ close: Math.min(1, held.t * 1.5), smile: 0.25 }, 1); drag(hit);
        // kneading counts while the fingers move, on the temples and the crown (one still point never completes it)
        const b = baseOf(hit);
        held.ms += Math.round(dt * 1000);
        if (b && held.ms >= 100) {
          const z = b[1] > 3.0 ? 'C' : b[1] > 1.9 && b[1] < 2.9 && b[0] < -1.0 ? 'L' : b[1] > 1.9 && b[1] < 2.9 && b[0] > 1.0 ? 'R' : null;
          V().commit({ tool: 'massage', ms: held.ms, zone: z, moved: now - (ptr.moved || 0) < 250 });
          held.ms = 0;
        }
      }
      if (k === 'singe') {
        const m = MODEL.singe, p = [m.position.x, m.position.y, m.position.z];
        for (let i = 0; i < 3; i++) fxA.add({ p: p.map((v) => v + (Math.random() - 0.5) * 0.04), v: [(Math.random() - 0.5) * 0.15, 0.9 + Math.random() * 0.6, (Math.random() - 0.5) * 0.15], size: 0.05 + Math.random() * 0.03, grow: -0.05, life: 0.35 + Math.random() * 0.2, colAt: (t) => [1, 0.75 - 0.5 * t, 0.25 - 0.2 * t, 0.9] });
        if (now - (held.zip || 0) > 330) { mech('fire'); held.zip = now; }
        // the flame's safe heat zone reaches the bundles near its tip: only those shorten, with a sizzle and smoke
        const b = baseOf(hit);
        held.ms += Math.round(dt * 1000);
        if (b && ear && held.ms >= 50) {
          const list = [];
          for (let id = 0; id < 16; id++) if (ear.count[id] && Math.hypot(ear.centre[id * 3] - b[0], ear.centre[id * 3 + 1] - b[1], ear.centre[id * 3 + 2] - b[2]) < 0.34) list.push(id);
          const e = V().commit({ tool: 'singe', bundles: list, ms: held.ms });
          held.ms = 0;
          if (e && e.changed) fxN.add({ p: hit.p.slice(), v: [0, 0.5, 0], size: 0.05, grow: 0.3, life: 1.4, col: [0.55, 0.55, 0.55, 0.3], drag: 0.8 });
        }
      }
      if (k === 'talc') {
        if (now - (held.zip || 0) > 300) { mech('bristle'); held.zip = now; }
        for (let i = 0; i < 2; i++) fxN.add({ p: hit.p.map((v, j) => v + hit.n[j] * 0.1 + (Math.random() - 0.5) * 0.2), v: hit.n.map((v) => v * 0.3 + (Math.random() - 0.5) * 0.4), size: 0.06, grow: 0.25, life: 1.2, col: [1, 1, 1, 0.3], drag: 2 });
        const b = baseOf(hit); if (b && b[1] < 0.6 && now - (ptr.moved || 0) < 250) dustAt(b);
      }
      const rub = RUB[k];
      if (rub && now - (held.zip || 0) > 240 && now - (ptr.moved || 0) < 160) { mech(rub.snd); held.zip = now; }
    }
    if (V()) V().sync(s);
    for (let i = anim.length - 1; i >= 0; i--) { const a = anim[i]; a.t += dt; a.step(Math.min(1, a.t / a.life)); if (a.t >= a.life) anim.splice(i, 1); }
    fxN.step(dt); fxA.step(dt);
  }
  function newCustomer(s) {
    S.job = s.jobId; S.talcAvail = -1; S.pomade = null; faceList = null;
    const p = s.look && s.look.person, eh = earHairOf(p);
    S.earLen = [eh[0], eh[1]];
    if (V()) V().begin(s, eh[0]);
    S.ear0 = V() && V().state() ? V().state().ear.len.slice() : null;
    if (ear) ear.U.uEar.value = [eh[0], eh[1], 0, 0];
    dealNose();
    showVisit();
  }
  // what the visit's state shows on the customer, after a stroke, an undo or a reload
  function showVisit(e) {
    const v = V() && V().state();
    if (!v) return;
    if (!e || e.toolId === 'singe') showEar();
    if (!e || e.toolId === 'nose') showNose();
    if ((!e || e.toolId === 'pomade') && HSC.U.uHairShine) HSC.U.uHairShine.value = Math.min(1, EF().progress(v, 'pomade') / 10000);
    if (e && e.completed) {
      if (navigator.vibrate) try { navigator.vibrate([10, 40, 10]); } catch (er) {}
      if (e.completed === 'massage') mech('crack');
    }
  }
  HSC.onVisit = showVisit;
  if (HSC.visit) HSC.visit.onAdopt(() => { S.ear0 = V().state().ear.len.slice(); dealNose(); showVisit(); });
  // keep frames coming while effects move
  const prevActive = HSC.clippingsActive;
  HSC.clippingsActive = () => (fxN && (fxN.count() > 0 || fxA.count() > 0)) || anim.length > 0 || (ptr.down && !!S.held) || (prevActive ? prevActive() : false);

  // ---------------- requests and tips ----------------
  // a nose-hair request needs fibres that really protrude (anatomy contract 3.2): the same stable bundles the chair has
  const noseHairOn = (p) => { const n = HSC.effects.noseOf(p.seed >>> 0, p.years); return n.len.some((l, i) => l > n.rim[i]); };
  // what a customer may ask for, by age, beard and hair: at most two services
  HSC.servicesWanted = function (p, job) {
    if (!p) return [];
    const lv = M() && M().data ? M().level() : 1, R = HSC.rng(((p.seed >>> 0) ^ Math.imul((job | 0) + 3, 0x632be5ab)) >>> 0 || 1);
    // only what this customer can really receive (the eligible before state exists); never by heritage
    const shaved = p.beard && (p.beard.style === 'clean' || /^stubble/.test(p.beard.style));
    const hasFace = p.beard && p.beard.style !== 'clean'; // stubble or a beard: something to shave, then soothe
    const styled = p.beard && p.beard.style !== 'clean' && !/^stubble/.test(p.beard.style); // a beard with a cheek line
    const w = { aftershave: hasFace ? 0.35 : 0, towel: 0.15, massage: 0.2 + 0.15 * HSC.smooth(35, 65, p.years), talc: 0.15, pomade: p.hair && /^[12]/.test(p.hair.type) && p.years < 50 ? 0.2 : 0.05,
      threading: styled ? 0.1 : 0, singe: earHairOf(p)[0] > 0 ? 0.45 : 0, nose: noseHairOn(p) ? 0.3 : 0, lather: shaved && hasFace ? 0.3 : 0 };
    const out = [];
    for (const [k, v] of Object.entries(w)) if (lv >= SERVICES[k].level && R.next() < v * 0.8) out.push(k);
    return out.sort(() => R.next() - 0.5).slice(0, 2);
  };
  // whether a ritual can really be done on this customer (the before state its completion needs exists): a lather
  // shave needs stubble to shave, aftershave in a ritual follows that shave, threading needs a beard's cheek line
  HSC.serviceFits = function (p, k) {
    if (!p || !SERVICES[k]) return false;
    const st = p.beard && p.beard.style || 'clean', stubble = /^stubble/.test(st);
    if (k === 'lather' || k === 'aftershave') return stubble;
    if (k === 'threading') return st !== 'clean' && !stubble;
    if (k === 'singe') return earHairOf(p)[0] > 0;
    if (k === 'nose') return noseHairOn(p);
    return true;
  };
  // tips for the services done on a job: 8 for each one asked for, 4 for each other (at most three)
  HSC.serviceTips = function (job, wanted) {
    const done = HSC.servicesDone(job);
    let n = 0, extra = 0;
    for (const k of done) { if (wanted.includes(k)) n += 8; else if (extra < 3) { n += 4; extra++; } }
    return { coins: n, done };
  };

  // ---------------- start ----------------
  function boot() {
    if (!classes() || !G() || !HSC.debugState || !HSC.debugState.coarse || !HSC.ctx) { setTimeout(boot, 300); return; }
    buildModels();
    fxN = particles(600, false); fxA = particles(400, true);
    try { makeEarHair(); } catch (e) { console.error('customers: ear hair failed', e); }
    try { makeNoseHair(); } catch (e) { console.error('customers: nose hair failed', e); }
    setInterval(frame, 16);
  }
  boot();
  HSC.brushNeck = () => HSC.brushClippings && HSC.brushClippings();
  HSC.servicesDebug = () => ({ S, held, nose, ear, models: Object.keys(MODEL), cheekLine: () => [...cheekLine()] }); // QA
  // undo (requests.js): a stroke undone also takes back what the services had counted for it, exactly, because the
  // visit's state is immutable
  HSC.servicesSnapshot = () => ({ job: S.job, visit: V() ? V().snapshot() : null });
  HSC.servicesRestore = (snap) => { if (!snap || snap.job !== S.job || !V()) return; V().restore(snap.visit); };
})(globalThis.HSC || (globalThis.HSC = {}));
