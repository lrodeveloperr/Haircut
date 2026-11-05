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
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#2a1d15';
  const G = () => globalThis.skinFadeStudio, M = () => HSC.meta;
  const SERVICES = {
    aftershave: { level: 1 }, towel: { level: 2 }, massage: { level: 3 }, talc: { level: 3 }, pomade: { level: 4 },
    threading: { level: 4 }, singe: { level: 5 }, nose: { level: 5 }, lather: { level: 9 },
  };
  const S = { job: null, done: new Set(), ear: [0, 0], earLen: 0, foamCells: 0, foamPeak: 0, shine: 0, talc: 0, nose: 0, busy: null };
  HSC.servicesDone = (job) => (S.job === job ? [...S.done] : []);

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

  // ---------------- sound ----------------
  let ac = null, out = null;
  function audio() {
    let v = null; try { v = G().getView(); } catch (e) {}
    if (!v || !v.audio || v.paused) return null;
    const C = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!C) return null;
    if (!ac) { ac = new C(); out = ac.createGain(); out.connect(ac.destination); }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    out.gain.value = 0.7 * (typeof v.volume === 'number' ? v.volume : 1);
    return ac;
  }
  function noise(len, type, f, q, gain, shape = (u) => 1 - u, at = 0, sweep) {
    const a = audio(); if (!a) return;
    const b = a.createBuffer(1, Math.max(1, Math.round(a.sampleRate * len)), a.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * shape(i / d.length);
    const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + at;
    s.buffer = b; fl.type = type; fl.frequency.setValueAtTime(f, t); if (sweep) fl.frequency.exponentialRampToValueAtTime(sweep, t + len); fl.Q.value = q; g.gain.value = gain;
    s.connect(fl).connect(g).connect(out); s.start(t);
  }
  function tone(f, len, gain, type = 'sine', at = 0, f2) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + at;
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(g).connect(out); o.start(t); o.stop(t + len + 0.02);
  }
  const SND = {
    splash() { noise(0.45, 'highpass', 2500, 0.7, 0.35, (u) => Math.pow(1 - u, 1.5) * (0.6 + 0.4 * Math.random())); for (let i = 0; i < 6; i++) tone(1800 + Math.random() * 1600, 0.05, 0.04, 'sine', 0.05 + i * 0.05); },
    towel() { noise(0.6, 'lowpass', 900, 0.7, 0.4, (u) => Math.sin(Math.PI * u)); noise(1.6, 'bandpass', 5200, 0.9, 0.06, (u) => Math.sin(Math.PI * u), 0.3); },
    rub() { noise(0.22, 'lowpass', 600 + Math.random() * 300, 0.8, 0.22, (u) => Math.sin(Math.PI * u)); },
    crack() { for (const at of [0, 0.07, 0.13]) noise(0.012, 'highpass', 1800, 0.6, 0.6, (u) => 1 - u, at); },
    zip() { noise(0.09, 'bandpass', 3800, 3, 0.3, (u) => Math.sin(Math.PI * u), 0, 6800); },
    fire() { noise(0.35, 'lowpass', 1400, 0.7, 0.35, (u) => Math.sin(Math.PI * u)); for (let i = 0; i < 4; i++) noise(0.01, 'highpass', 3000, 0.6, 0.25, (u) => 1 - u, Math.random() * 0.3); },
    sizzle() { noise(0.18, 'highpass', 6000, 0.6, 0.12, (u) => (1 - u) * (0.5 + Math.random() * 0.5)); },
    lather() { noise(0.12, 'bandpass', 1500 + Math.random() * 800, 1.5, 0.18, (u) => Math.sin(Math.PI * u)); for (let i = 0; i < 3; i++) tone(700 + Math.random() * 900, 0.03, 0.03, 'sine', Math.random() * 0.1, 1400); },
    puff() { noise(0.3, 'lowpass', 1800, 0.6, 0.3, (u) => Math.pow(1 - u, 2)); },
    brush() { noise(0.25, 'bandpass', 3000, 0.8, 0.12, (u) => Math.sin(Math.PI * u)); },
    whir() { tone(210, 0.18, 0.03, 'sawtooth'); noise(0.18, 'bandpass', 4200, 2, 0.05); },
    squish() { noise(0.15, 'lowpass', 700, 1.2, 0.2, (u) => Math.sin(Math.PI * u)); },
  };

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
    const root = new Float32Array(n * 3), nrm = new Float32Array(n * 3);
    g.setAttribute('aRoot', new T.Ra(root, 3)); g.setAttribute('aNormal', new T.Ra(nrm, 3)); g.setAttribute('aSeed', new T.Ra(seeds, 4));
    g.instanceCount = n;
    const U = { uEar: { value: [0, 0, 0, 0] } };
    const vert = `attribute vec3 aRoot,aNormal;attribute vec4 aSeed;uniform vec3 cam;uniform vec4 uEar;
 varying vec3 vTip,vTangent,vSeed;varying float vAlong,vEdge,vLength,vGrey;varying vec3 vN;
 void main(){vec3 n=normalize(aNormal);float side=aSeed.w;float burn=mix(uEar.z,uEar.w,side);
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
    ear = { mesh, g, tri, bary, root, nrm, n, U };
    placeEar(HSC.ctx.Pt.attributes.position.array, HSC.ctx.Pt.attributes.normal.array);
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
    const R = HSC.rng(((p.seed >>> 0) ^ 0xea7a17) >>> 0 || 1), k = p.heritage === 'south-asian' ? 1.3 : 1;
    const has = R.next() < Math.min(0.85, HSC.smooth(35, 70, p.years) * 0.8 * k);
    return has ? [(0.06 + 0.12 * HSC.smooth(40, 80, p.years)) * (0.7 + 0.6 * R.next()), 0.35 + 0.55 * HSC.smooth(40, 80, p.years)] : [0, 0];
  }
  HSC.onMorph = (P, N) => placeEar(P, N);

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
  HSC.SERVICE_ICON = I;
  HSC.onTool = (k) => { for (const [n, m] of Object.entries(MODEL)) if (m) m.visible = false; S.held = SERVICES[k] ? k : null; };

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
  const any = { down: false, x: 0, y: 0 };
  addEventListener('pointerdown', (e) => { any.down = true; any.x = e.clientX; any.y = e.clientY; }, true);
  addEventListener('pointermove', (e) => { any.x = e.clientX; any.y = e.clientY; }, true);
  for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, () => { any.down = false; }, true);
  addEventListener('pointerdown', (e) => { if (!active() || e.target.closest('button,#hsc-tools,#hsc-menu,#hsc-panel')) return; ptr.down = true; ptr.x0 = ptr.x = e.clientX; ptr.y0 = ptr.y = e.clientY; ptr.t0 = ptr.last = performance.now(); hit = headHitAt(e); if (hit) begin(hit); }, true);
  addEventListener('pointermove', (e) => { if (!ptr.down || !active()) return; ptr.x = e.clientX; ptr.y = e.clientY; ptr.last = performance.now(); hit = headHitAt(e); if (hit) drag(hit); }, true);
  for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, () => { if (ptr.down) end(); ptr.down = false; }, true);

  const person = () => { try { return G().getState().look.person; } catch (e) { return null; } };
  function face(amounts, w) { const p = person(); if (p && HSC.setExpression) HSC.setExpression(p, amounts, w); }
  function finish(k) {
    if (S.done.has(k)) return;
    S.done.add(k);
    if (navigator.vibrate) try { navigator.vibrate([10, 40, 10]); } catch (e) {}
  }
  // the beard grid cell and the brow cell under a head hit (on the un-morphed head)
  const baseOf = (h) => (HSC.toBase ? HSC.toBase(h) : null);
  function paintBeard(h, r, fn) {
    const b = baseOf(h); if (!b || !HSC.beardCell) return 0;
    const c0 = HSC.beardCell(b[0], b[1], b[2]); if (c0 < 0) return 0;
    const col0 = c0 % 128, row0 = Math.floor(c0 / 128); let n = 0;
    for (let dr = -r; dr <= r; dr++) for (let dc = -r; dc <= r; dc++) { if (dr * dr + dc * dc > r * r) continue; const row = row0 + dr, col = col0 + dc; if (row < 0 || row > 63 || col < 0 || col > 127) continue; if (fn(row * 128 + col, Math.hypot(dr, dc) / r)) n++; }
    return n;
  }

  // ---------------- what each service does ----------------
  let fxN = null, fxA = null, held = { t: 0 }, anim = [];
  function begin(h) {
    const k = S.held;
    held = { t: 0, rub: 0, zip: 0 };
    if (k === 'aftershave') return splash(h);
    if (k === 'towel') return wrapTowel();
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
    if (m) hold(m, h.p, h.n, k === 'singe' ? 0.28 : k === 'threading' ? 0.02 : 0.03, k === 'threading' ? Math.atan2(h.n[0], h.n[2]) : 0);
    if (k === 'talc') { for (let i = 0; i < 3; i++) fxN.add({ p: h.p.map((v, j) => v + h.n[j] * 0.1 + (Math.random() - 0.5) * 0.2), v: h.n.map((v) => v * 0.3 + (Math.random() - 0.5) * 0.4), size: 0.06, grow: 0.25, life: 1.2, col: [1, 1, 1, 0.35], drag: 2 }); }
    if (k === 'pomade' && b[1] > 2.4) { S.shine = Math.min(1, S.shine + 0.012); HSC.U.uHairShine && (HSC.U.uHairShine.value = S.shine); }
    if (k === 'lather') {
      const F = HSC.foam && HSC.foam.data();
      if (F) { const n = paintBeard(h, 5, (c, d) => { const v = Math.max(F[c], Math.round(255 * (1 - d * d) * 1.2) | 0); if (v > F[c]) { F[c] = Math.min(255, v); return true; } return false; }); if (n) { HSC.foam.update(); countFoam(); } }
    }
    if (k === 'threading') threadAt(h, b);
  }
  function end() {
    const k = S.held;
    if (k === 'massage' && held.t > 2.2 && !S.done.has('massage')) { finish('massage'); SND.crack(); }
    if (k === 'massage' || k === 'towel') face({}, 0);
    if (MODEL.massage) MODEL.massage.visible = false;
  }
  // kolonya / aftershave: the bottle tips, cologne splashes on the face and neck, a cool shiver, eyes close
  function splash(h) {
    const m = MODEL.aftershave; hold(m, h.p, h.n, 0.7);
    anim.push({ t: 0, life: 1.4, step(t) { m.rotateX(0); m.scale.setScalar(0.62 * (t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1)); if (t > 0.95) m.visible = false; } });
    for (let i = 0; i < 40; i++) { const sp = 1.5 + Math.random() * 1.5; fxN.add({ p: h.p.map((v, j) => v + h.n[j] * 0.6), v: h.n.map((v) => -v * sp + (Math.random() - 0.5) * 1.6), g: -3, size: 0.018 + Math.random() * 0.02, life: 0.5 + Math.random() * 0.4, col: [0.95, 0.92, 0.6, 0.8] }); }
    for (let i = 0; i < 12; i++) fxA.add({ p: h.p.map((v) => v + (Math.random() - 0.5) * 0.5), v: [0, 0.2, 0], size: 0.03, life: 0.8, col: [1, 1, 0.85, 0.7] });
    SND.splash();
    face({ close: 0.9, smile: 0.4, cheekUp: 0.3 }, 1); setTimeout(() => face({}, 0), 1100);
    finish('aftershave');
  }
  // the hot towel: it settles over the face, steams, and is lifted off after a few seconds
  function wrapTowel() {
    if (anim.some((a) => a.towel)) return;
    const tw = makeTowel(); tw.visible = true;
    SND.towel();
    face({ close: 1, smile: 0.15 }, 1);
    anim.push({ towel: true, t: 0, life: 3.4, step(t) {
      const drop = t < 0.15 ? 1 - t / 0.15 : t > 0.88 ? (t - 0.88) / 0.12 : 0;
      tw.position.set(0, drop * 1.2, drop * 0.4); tw.scale.set(1, 1, 1);
      if (Math.random() < 0.5) fxN.add({ p: [(Math.random() - 0.5) * 2.4, -0.5 + Math.random() * 2.6, 2.1 + Math.random() * 0.2], v: [(Math.random() - 0.5) * 0.1, 0.45 + Math.random() * 0.3, 0.12], size: 0.08, grow: 0.35, life: 1.6, col: [1, 1, 1, 0.22], drag: 0.6 });
      if (t >= 1) { tw.visible = false; face({}, 0); finish('towel'); }
    } });
  }
  // threading: the twisted thread plucks the fine hair on the cheek line and stray brow hairs under it
  function threadAt(h, b) {
    const g = G(), s = g.getState();
    let nb = null, nw = null, n = 0;
    if (Array.isArray(s.beard)) { const B = s.beard; n += paintBeard(h, 2, (c) => { if (B[c] > 0) { nb = nb || B.slice(); nb[c] = 0; return true; } return false; }); }
    if (Array.isArray(s.brow) && b[1] > 1.7 && b[1] < 2.3 && HSC.BROW_N) {
      const un = (Math.abs(b[0]) - 0.2) / 1.0, v = (b[1] - 1.7) / 0.6;
      if (un >= 0 && un <= 1) { const u = b[0] < 0 ? 0.5 - un * 0.5 : 0.5 + un * 0.5, col0 = Math.floor(u * 128), row0 = Math.floor(v * 32); for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const c = (row0 + dr) * 128 + col0 + dc; if (c >= 0 && c < HSC.BROW_N && s.brow[c] > 0) { nw = nw || s.brow.slice(); nw[c] = 0; n++; } } }
    }
    const now = performance.now();
    if (now - held.zip > 110) { SND.zip(); held.zip = now; }
    if (n && g.restore) { g.restore(s.hair, nb || s.beard, nw || s.brow); held.cells = (held.cells || 0) + n; if (held.cells > 6) finish('threading'); }
  }
  function countFoam() { const F = HSC.foam.data(); let n = 0; for (let i = 0; i < F.length; i++) if (F[i] > 60) n++; S.foamCells = n; S.foamPeak = Math.max(S.foamPeak, n); }

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
      if (k === 'massage') { if (now - (held.rub || 0) > 260) { SND.rub(); held.rub = now; } face({ close: Math.min(1, held.t * 1.5), smile: 0.25 }, 1); drag(hit); }
      if (k === 'singe') {
        const m = MODEL.singe, tip = m.localToWorld ? null : null; void tip;
        const p = [m.position.x + 0, m.position.y, m.position.z];
        for (let i = 0; i < 3; i++) fxA.add({ p: p.map((v) => v + (Math.random() - 0.5) * 0.04), v: [(Math.random() - 0.5) * 0.15, 0.9 + Math.random() * 0.6, (Math.random() - 0.5) * 0.15], size: 0.05 + Math.random() * 0.03, grow: -0.05, life: 0.35 + Math.random() * 0.2, colAt: (t) => [1, 0.75 - 0.5 * t, 0.25 - 0.2 * t, 0.9] });
        if (now - (held.zip || 0) > 330) { SND.fire(); held.zip = now; }
        // near an ear: its hair burns off with a sizzle and a curl of smoke
        const b = baseOf(hit), bowl = HSC.earBowls && HSC.earBowls(), B = HSC.debugState.base;
        if (b && bowl) for (const [i, sd] of [[0, -1], [1, 1]]) { const v = bowl[sd]; if (v < 0) continue; if (Math.hypot(b[0] - B[v * 3], b[1] - B[v * 3 + 1], b[2] - B[v * 3 + 2]) < 0.5) { S.ear[i] = Math.min(1, S.ear[i] + dt * 0.7); if (Math.random() < 0.3) { SND.sizzle(); fxN.add({ p: hit.p.slice(), v: [0, 0.5, 0], size: 0.05, grow: 0.3, life: 1.4, col: [0.55, 0.55, 0.55, 0.3], drag: 0.8 }); } if (S.ear[i] > 0.85) finish('singe'); } }
        if (ear) ear.U.uEar.value = [S.earLen[0] || 0, S.earLen[1] || 0, S.ear[0], S.ear[1]];
      }
      if (k === 'nose') { const b = baseOf(hit); if (now - (held.zip || 0) > 180) { SND.whir(); held.zip = now; } if (b && Math.hypot(b[0], b[1] - 0.6, b[2] - 2.3) < 0.5) { S.nose += dt; if (S.nose > 1.2) finish('nose'); } }
      if (k === 'talc') { if (now - (held.zip || 0) > 300) { SND.brush(); held.zip = now; } const b = baseOf(hit); if (b && b[1] < 0.2) { S.talc += dt; if (S.talc > 1.6) { finish('talc'); HSC.brushNeck && HSC.brushNeck(); } } }
      if (k === 'pomade') { if (now - (held.zip || 0) > 280) { SND.squish(); held.zip = now; } if (S.shine > 0.5) finish('pomade'); }
      if (k === 'lather') { if (now - (held.zip || 0) > 160) { SND.lather(); held.zip = now; } for (let i = 0; i < 2; i++) fxN.add({ p: hit.p.map((v, j) => v + hit.n[j] * 0.03 + (Math.random() - 0.5) * 0.1), v: hit.n.map((v) => v * 0.2), size: 0.015 + Math.random() * 0.02, life: 0.5, col: [1, 1, 1, 0.8] }); }
    }
    // the razor shaves the lather away where it passes (the beard under it is cut by the razor itself)
    if (any.down && HSC.tool && HSC.tool() === 'razor' && S.foamPeak > 0) {
      const v = HSC.view, h = v && v.headHit ? v.headHit(any.x, any.y) : null, F = HSC.foam.data();
      if (h) { const n = paintBeard(h, 2, (c) => { if (F[c]) { F[c] = 0; return true; } return false; }); if (n) { HSC.foam.update(); countFoam(); if (S.foamPeak > 150 && S.foamCells < S.foamPeak * 0.3) finish('lather'); } }
    }
    for (let i = anim.length - 1; i >= 0; i--) { const a = anim[i]; a.t += dt; a.step(Math.min(1, a.t / a.life)); if (a.t >= a.life) anim.splice(i, 1); }
    fxN.step(dt); fxA.step(dt);
  }
  function newCustomer(s) {
    S.job = s.jobId; S.done = new Set(); S.ear = [0, 0]; S.foamCells = 0; S.foamPeak = 0; S.shine = 0; S.talc = 0; S.nose = 0;
    const F = HSC.foam && HSC.foam.data(); if (F) { F.fill(0); HSC.foam.update(); }
    if (HSC.U.uHairShine) HSC.U.uHairShine.value = 0;
    const p = s.look && s.look.person, eh = earHairOf(p);
    S.earLen = [eh[0], eh[1]];
    if (ear) ear.U.uEar.value = [eh[0], eh[1], 0, 0];
  }
  // keep frames coming while effects move
  const prevActive = HSC.clippingsActive;
  HSC.clippingsActive = () => (fxN && (fxN.count() > 0 || fxA.count() > 0)) || anim.length > 0 || (ptr.down && !!S.held) || (prevActive ? prevActive() : false);

  // ---------------- requests and tips ----------------
  // what a customer may ask for, by age, beard and hair: at most two services
  HSC.servicesWanted = function (p, job) {
    if (!p) return [];
    const lv = M() && M().data ? M().level() : 1, R = HSC.rng(((p.seed >>> 0) ^ Math.imul((job | 0) + 3, 0x632be5ab)) >>> 0 || 1);
    const shaved = p.beard && (p.beard.style === 'clean' || /^stubble/.test(p.beard.style));
    const w = { aftershave: 0.35, towel: 0.15, massage: 0.2 + 0.15 * HSC.smooth(35, 65, p.years), talc: 0.15, pomade: p.hair && /^[12]/.test(p.hair.type) && p.years < 50 ? 0.2 : 0.05,
      threading: ['mena', 'south-asian', 'mediterranean'].includes(p.heritage) ? 0.2 : 0.07, singe: earHairOf(p)[0] > 0 ? 0.45 : 0, nose: p.years > 45 ? 0.15 : 0, lather: shaved ? 0.3 : 0 };
    const out = [];
    for (const [k, v] of Object.entries(w)) if (lv >= SERVICES[k].level && R.next() < v * 0.8) out.push(k);
    return out.sort(() => R.next() - 0.5).slice(0, 2);
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
    setInterval(frame, 16);
  }
  boot();
  HSC.brushNeck = () => HSC.brushClippings && HSC.brushClippings();
  HSC.servicesDebug = () => ({ S, held }); // QA
})(globalThis.HSC || (globalThis.HSC = {}));
