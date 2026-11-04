// ---------------------------------------------------------------------------------------------
// Falling hair: every clipper pass releases cut pieces the length of what was removed, in the
// customer's colour (with grey strands) and curl. They flutter down with air drag, tumble, land on
// the gown and settle (sliding off steep folds), and stay there until the next customer.
// World units: about 1 unit = 10 cm.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  // Android (prototypes): room for 12,000 pieces; other builds keep 4,000
  const MAX = HSC.PHENOTYPES ? 12000 : 4000, SEG = 6;
  const EXC = !!HSC.PHENOTYPES;
  const G = 98; // gravity in world units / s^2
  const K = {
    pos: new Float32Array(MAX * 3), vel: new Float32Array(MAX * 3), dir: new Float32Array(MAX * 3), axis: new Float32Array(MAX * 3),
    spin: new Float32Array(MAX), len: new Float32Array(MAX), drag: new Float32Array(MAX), phase: new Float32Array(MAX),
    state: new Uint8Array(MAX), // 0 free, 1 falling, 2 sliding, 3 resting
    swept: new Uint8Array(MAX), // brushed off at the reveal: falls past the gown and out of sight
    through: new Uint8Array(MAX), // over a hole in the gown: 1 falls past it out of sight, 2 lands on the collar (land), 3 no collar found
    land: new Float32Array(MAX * 3),
    born: new Float64Array(MAX), col: new Float32Array(MAX * 3), curl: new Float32Array(MAX * 4),
    count: 0, next: 0, last: 0, moving: 0,
  };
  let mesh = null, geo = null, attrs = null, ctx = null, field = null, Rng = HSC.rng(4242);
  const CLIPQ = { value: 0 };

  const VERT = `
attribute vec4 iPos;   // xyz centre, w length
attribute vec3 iDir;   // unit direction of the piece
attribute vec4 iCurl;  // curl radius (x length), turns, phase, width
attribute vec3 iCol;
varying vec3 vCol; varying float vShade; varying float vEdge;
${EXC ? 'uniform float uClipQ; varying float vSpec;' : ''}
void main(){
  float t=position.y-.5;
  vec3 d=normalize(iDir);
  vec3 up=abs(d.y)<.95?vec3(0.0,1.0,0.0):vec3(1.0,0.0,0.0);
  vec3 a=normalize(cross(d,up)),b=cross(d,a);
  float L=iPos.w;
  float ph=t*iCurl.y*6.2831+iCurl.z;
  vec3 p=iPos.xyz+d*(t*L)+(a*cos(ph)+b*sin(ph))*iCurl.x*L;
  vec3 tang=normalize(d*L+(-a*sin(ph)+b*cos(ph))*iCurl.x*L*iCurl.y*6.2831+vec3(1e-5));
  vec3 view=normalize(cameraPosition-p);
  vec3 side=normalize(cross(tang,view)+vec3(1e-5));
  p+=side*position.x*iCurl.w;
  vCol=iCol; vEdge=position.x;
  float tangentLight=dot(tang,normalize(vec3(-.3,.8,.5)));
  vShade=.62+.5*sqrt(max(0.0,1.0-tangentLight*tangentLight));
  ${EXC ? `// prototype: the scalp hair's sharp highlight, and a little darker where a piece faces away
  vec3 hh=normalize(view+normalize(vec3(-.3,.8,.5)));float th=dot(tang,hh);
  vSpec=pow(sqrt(max(0.0,1.0-th*th)),48.0)*uClipQ;
  vShade=mix(vShade,.5+.62*sqrt(max(0.0,1.0-tangentLight*tangentLight)),uClipQ);` : ''}
  gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0);
}`;
  const FRAG = `
varying vec3 vCol; varying float vShade; varying float vEdge;
${EXC ? 'varying float vSpec;' : ''}
void main(){
  if(abs(vEdge)>.98)discard;
  gl_FragColor=vec4(vCol*vShade${EXC ? '+vec3(1.0,.93,.84)*vSpec*.22' : ''},1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

  HSC.attachClippings = function (c) {
    ctx = c;
    const T = c.T;
    geo = new T.af();
    const pos = [], idx = [];
    for (let s = 0; s <= SEG; s++) {
      pos.push(-1, s / SEG, 0, 1, s / SEG, 0);
      if (s < SEG) { const u = s * 2; idx.push(u, u + 1, u + 2, u + 1, u + 3, u + 2); }
    }
    geo.setAttribute('position', new T.mt(pos, 3));
    geo.setIndex(idx);
    attrs = {
      iPos: new T.Ra(new Float32Array(MAX * 4), 4), iDir: new T.Ra(new Float32Array(MAX * 3), 3),
      iCurl: new T.Ra(new Float32Array(MAX * 4), 4), iCol: new T.Ra(new Float32Array(MAX * 3), 3),
    };
    for (const [k, a] of Object.entries(attrs)) { a.setUsage && a.setUsage(35048); geo.setAttribute(k, a); }
    geo.instanceCount = 0;
    mesh = new T.Ze(geo, new T.fr({ vertexShader: VERT, fragmentShader: FRAG, side: T.$t, uniforms: EXC ? { uClipQ: CLIPQ } : {} }));
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    c.scene.add(mesh);
  };

  // heightfield of the gown's top surface (world space), rebuilt when the gown is attached / changed
  let robeRef = null;
  HSC.clippingsCape = function (robe) { if (robe) { robeRef = robe; field = null; } };
  // Playables / YouTube: the original gown surface (from vertices, gaps filled), unchanged
  function buildFieldWeb(robe) {
    try {
      robe.updateWorldMatrix(true, true);
      const pts = [];
      robe.traverse((o) => {
        if (!o.isMesh) return;
        const p = o.geometry.attributes.position, m = o.matrixWorld.elements;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
          pts.push(m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]);
        }
      });
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (let i = 0; i < pts.length; i += 3) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); z0 = Math.min(z0, pts[i + 2]); z1 = Math.max(z1, pts[i + 2]); }
      const N = 96, h = new Float32Array(N * N).fill(-1e9);
      const cell = (x, z) => [Math.min(N - 1, Math.max(0, Math.floor(((x - x0) / (x1 - x0)) * N))), Math.min(N - 1, Math.max(0, Math.floor(((z - z0) / (z1 - z0)) * N)))];
      for (let i = 0; i < pts.length; i += 3) { const [cx, cz] = cell(pts[i], pts[i + 2]); h[cz * N + cx] = Math.max(h[cz * N + cx], pts[i + 1]); }
      // fill gaps (and the neck opening) from neighbours
      for (let pass = 0; pass < 12; pass++) {
        const src = h.slice();
        for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) {
          if (src[z * N + x] > -1e8) continue;
          let s = 0, n = 0;
          for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
            const v = src[Math.min(N - 1, Math.max(0, z + dz)) * N + Math.min(N - 1, Math.max(0, x + dx))];
            if (v > -1e8) { s += v; n++; }
          }
          if (n) h[z * N + x] = s / n;
        }
      }
      field = { N, h, x0, x1, z0, z1 };
    } catch (e) { console.error('customers: clippings field failed', e); }
  }
  // Android: the gown's top surface, rasterised from its triangles: each cell takes the highest gown surface over its centre.
  // Real holes stay holes (the neck opening, past the hem), so cut hair falls into the collar or off the gown instead
  // of resting on an invisible lid; only one-cell cracks between triangles are filled.
  function buildField(robe) {
    if (!EXC) return buildFieldWeb(robe);
    try {
      robe.updateWorldMatrix(true, true);
      const tris = [];
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      robe.traverse((o) => {
        if (!o.isMesh) return;
        const p = o.geometry.attributes.position, ix = o.geometry.index, m = o.matrixWorld.elements;
        const W = (i) => { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]]; };
        const n = ix ? ix.count : p.count;
        for (let t = 0; t + 2 < n; t += 3) {
          const tr = [W(ix ? ix.getX(t) : t), W(ix ? ix.getX(t + 1) : t + 1), W(ix ? ix.getX(t + 2) : t + 2)];
          for (const v of tr) { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); z0 = Math.min(z0, v[2]); z1 = Math.max(z1, v[2]); }
          tris.push(tr);
        }
      });
      if (!tris.length) return;
      const N = 192, h = new Float32Array(N * N).fill(-1e9), sx = (x1 - x0) / N, sz = (z1 - z0) / N;
      const put = (cx, cz, y) => { if (cx >= 0 && cz >= 0 && cx < N && cz < N && y > h[cz * N + cx]) h[cz * N + cx] = y; };
      for (const [a, b, c] of tris) {
        const d = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2]);
        // triangles smaller than a cell still mark the cells their corners fall in; steep walls (the collar band's
        // sides) do not, so their top edge does not become a ledge a cell wide
        const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const ny = u[2] * w[0] - u[0] * w[2], nn = Math.hypot(u[1] * w[2] - u[2] * w[1], ny, u[0] * w[1] - u[1] * w[0]) || 1;
        if (Math.abs(ny) / nn > 0.3) for (const v of [a, b, c]) put(Math.floor((v[0] - x0) / sx), Math.floor((v[2] - z0) / sz), v[1]);
        if (Math.abs(d) < 1e-12) continue;
        const ax = Math.floor((Math.min(a[0], b[0], c[0]) - x0) / sx), bx = Math.floor((Math.max(a[0], b[0], c[0]) - x0) / sx);
        const az = Math.floor((Math.min(a[2], b[2], c[2]) - z0) / sz), bz = Math.floor((Math.max(a[2], b[2], c[2]) - z0) / sz);
        for (let cz = az; cz <= bz; cz++) for (let cx = ax; cx <= bx; cx++) {
          const x = x0 + (cx + 0.5) * sx, z = z0 + (cz + 0.5) * sz;
          const l1 = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / d, l2 = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / d, l3 = 1 - l1 - l2;
          if (l1 >= -1e-6 && l2 >= -1e-6 && l3 >= -1e-6) put(cx, cz, l1 * a[1] + l2 * b[1] + l3 * c[1]);
        }
      }
      // one-cell cracks: an empty cell with gown on at least 6 of its 8 neighbours
      const src = h.slice();
      for (let z = 1; z < N - 1; z++) for (let x = 1; x < N - 1; x++) {
        if (src[z * N + x] > -1e8) continue;
        let s = 0, n = 0;
        for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const v = src[(z + dz) * N + x + dx]; if (v > -1e8) { s += v; n++; } }
        if (n >= 6) h[z * N + x] = s / n;
      }
      // the triangles too, bucketed over the gown, so a piece that comes to rest sits on the exact cloth surface
      const TB = 48, tb = new Map(), tx = (x1 - x0) / TB, tz = (z1 - z0) / TB;
      for (const t of tris) {
        const ax = Math.floor((Math.min(t[0][0], t[1][0], t[2][0]) - x0) / tx), bx = Math.floor((Math.max(t[0][0], t[1][0], t[2][0]) - x0) / tx);
        const az = Math.floor((Math.min(t[0][2], t[1][2], t[2][2]) - z0) / tz), bz = Math.floor((Math.max(t[0][2], t[1][2], t[2][2]) - z0) / tz);
        for (let cz = az; cz <= bz; cz++) for (let cx = ax; cx <= bx; cx++) { const k = cz * TB + cx; if (!tb.has(k)) tb.set(k, []); tb.get(k).push(t); }
      }
      field = { N, h, x0, x1, z0, z1, TB, tb, tx, tz };
    } catch (e) { console.error('customers: clippings field failed', e); }
  }
  // the highest gown surface at (x, z) not far above y, and its upward normal, or null
  function clothAt(x, y, z) {
    if (!field || !field.tb) return null;
    const L = field.tb.get(Math.floor((z - field.z0) / field.tz) * field.TB + Math.floor((x - field.x0) / field.tx));
    if (!L) return null;
    let best = null, bh = -1e9;
    for (const [a, b, c] of L) {
      const d = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2]);
      if (Math.abs(d) < 1e-12) continue;
      const l1 = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / d, l2 = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / d, l3 = 1 - l1 - l2;
      if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
      const hy = l1 * a[1] + l2 * b[1] + l3 * c[1];
      if (hy > bh && hy < y + 0.05) { bh = hy; best = [a, b, c]; }
    }
    if (!best) return null;
    const [a, b, c] = best, u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    if (n[1] < 0) n = n.map((q) => -q);
    const nl = Math.hypot(...n) || 1;
    return { y: bh, n: n.map((q) => q / nl) };
  }
  function heightAt(x, z) {
    if (!field) return -1e9;
    const { N, h, x0, x1, z0, z1 } = field;
    const fx = ((x - x0) / (x1 - x0)) * N - 0.5, fz = ((z - z0) / (z1 - z0)) * N - 0.5;
    if (fx < 0 || fz < 0 || fx > N - 1 || fz > N - 1) return -1e9;
    const ix = Math.floor(fx), iz = Math.floor(fz), tx = fx - ix, tz = fz - iz;
    const a = h[iz * N + ix], b = h[iz * N + Math.min(N - 1, ix + 1)], c = h[Math.min(N - 1, iz + 1) * N + ix], d = h[Math.min(N - 1, iz + 1) * N + Math.min(N - 1, ix + 1)];
    if (a < -1e8 || b < -1e8 || c < -1e8 || d < -1e8) return -1e9;
    return a + (b - a) * tx + (c - a) * tz + (a - b - c + d) * tx * tz;
  }

  function hairColour(kind) {
    const tint = ctx && ctx.uHairTint ? ctx.uHairTint.value : { x: 1, y: 1, z: 1 };
    const U = HSC.U;
    const greyF = kind === 'beard' ? U.uBeardGrey.value[0] : U.uGreyA.value[0];
    if (Rng.next() < greyF) { const g = 0.36 + 0.26 * Rng.next(); return [g, g * 0.98, g * 0.93]; }
    const bt = kind === 'beard' ? U.uBeardTint.value : [1, 1, 1];
    const k = 0.055 + 0.04 * Rng.next();
    return [k * tint.x * bt[0], k * 0.68 * tint.y * bt[1], k * 0.38 * tint.z * bt[2]];
  }

  // called by the renderer for each successful cut, with the blade hit and HSC.lastCut set by the controller
  HSC.emitClippings = function (hit, intensity) {
    if (!mesh || !hit || !hit.point) return false;
    if (!field && robeRef) buildField(robeRef);
    const cut = HSC.lastCut || { cells: 6, removed: 30, kind: 'scalp' };
    HSC.lastCut = null;
    const mmEach = Math.max(0.5, cut.removed / Math.max(1, cut.cells));
    const rate = (HSC.detail && HSC.detail.clipRate) || 1;
    const n = Math.min(Math.ceil(36 * rate), Math.ceil((cut.cells * 0.45 + cut.removed / 60) * rate));
    const across = hit.bladeAcross || [1, 0, 0], nrm = hit.normal;
    const curl = HSC.U.uStyleC.value, bcurl = HSC.U.uBStyleB.value;
    const isBeard = cut.kind === 'beard';
    const now = performance.now();
    const proto = EXC ? HSC.clipProto || 0 : 0;
    CLIPQ.value = proto ? 1 : 0;
    if (proto) return emitTufts(hit, cut, mmEach, rate, isBeard ? bcurl : curl, cut.kind, now);
    for (let k = 0; k < n; k++) {
      const i = alloc();
      const s = (Rng.next() - 0.5) * 0.23;
      const o = i * 3;
      K.pos[o] = hit.point.x + across[0] * s + nrm.x * 0.008;
      K.pos[o + 1] = hit.point.y + across[1] * s + nrm.y * 0.008;
      K.pos[o + 2] = hit.point.z + across[2] * s + nrm.z * 0.008;
      // flicked off the blade: outward from the head, plus a little scatter
      const out = 0.4 + 0.9 * Rng.next();
      K.vel[o] = nrm.x * out + (Rng.next() - 0.5) * 0.9;
      K.vel[o + 1] = nrm.y * out + (Rng.next() - 0.2) * 0.8;
      K.vel[o + 2] = nrm.z * out + (Rng.next() - 0.5) * 0.9;
      const d = [Rng.next() - 0.5, Rng.next() - 0.5, Rng.next() - 0.5], dl = Math.hypot(...d) || 1;
      const ax = [Rng.next() - 0.5, Rng.next() - 0.5, Rng.next() - 0.5], al = Math.hypot(...ax) || 1;
      K.dir.set(d.map((v) => v / dl), o);
      K.axis.set(ax.map((v) => v / al), o);
      K.spin[i] = (4 + 10 * Rng.next()) * (Rng.next() < 0.5 ? -1 : 1);
      // a piece is the removed length (varying), 1 mm ~ 0.01 world units
      const L = Math.max(0.004, mmEach * (0.5 + 0.7 * Rng.next()) * 0.01024);
      K.len[i] = L;
      // short fluff hangs in the air longer than long pieces
      K.drag[i] = 9 + 22 * (1 - Math.min(1, L / 0.12));
      K.phase[i] = Rng.next() * 6.28;
      K.state[i] = 1;
      K.swept[i] = 0; K.through[i] = 0;
      K.born[i] = now;
      K.col.set(hairColour(cut.kind), o);
      const cr = isBeard ? bcurl : curl;
      K.curl.set([cr[0] * 0.8, Math.max(0.3, cr[1] * Math.min(1, L / 0.15)), Rng.next() * 6.28, 0.0028 * (cr[3] || 1)], i * 4);
    }
    K.moving += n;
    K.dirty = true;
    return true;
  };
  // prototype: clipped hair leaves the blade as tufts of near-parallel pieces that hold together for a moment and
  // then drift apart (each piece's drag differs a little), with fine dust from short guards and a few loose pieces
  function litColour(c) {
    const lum = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2], lift = (HSC.U.uLift ? HSC.U.uLift.value : 0) * (1 - HSC.smooth(0.03, 0.14, lum));
    return c.map((v) => v * (1 + 2.2 * lift) * 1.15);
  }
  function emitTufts(hit, cut, mmEach, rate, cr, kind, now) {
    const across = hit.bladeAcross || [1, 0, 0], nrm = hit.normal;
    const pieces = Math.min(Math.ceil(90 * rate), Math.ceil((cut.cells * 1.1 + cut.removed / 25) * rate));
    let made = 0;
    while (made < pieces) {
      const short = mmEach < 2.5, size = short ? 1 : 3 + Math.floor(Rng.next() * 10);
      const s = (Rng.next() - 0.5) * 0.23, out = 0.35 + 0.8 * Rng.next();
      const c0 = [hit.point.x + across[0] * s + nrm.x * 0.008, hit.point.y + across[1] * s + nrm.y * 0.008, hit.point.z + across[2] * s + nrm.z * 0.008];
      const v0 = [nrm.x * out + (Rng.next() - 0.5) * 0.8, nrm.y * out + (Rng.next() - 0.2) * 0.7, nrm.z * out + (Rng.next() - 0.5) * 0.8];
      const d = [Rng.next() - 0.5, Rng.next() - 0.5, Rng.next() - 0.5], dl = Math.hypot(...d) || 1;
      const ax = [Rng.next() - 0.5, Rng.next() - 0.5, Rng.next() - 0.5], al = Math.hypot(...ax) || 1;
      const spin = (3 + 8 * Rng.next()) * (Rng.next() < 0.5 ? -1 : 1), L0 = Math.max(0.003, mmEach * (0.6 + 0.6 * Rng.next()) * 0.01024);
      // the same brightening the scalp strands get under the ring light, so cut hair matches the head
      const col = litColour(hairColour(kind));
      for (let m = 0; m < size && made < pieces; m++, made++) {
        const i = alloc(), o = i * 3, j = () => (Rng.next() - 0.5);
        // dust: very short bits, lighter and slower; tuft members sit side by side, almost parallel
        const L = short ? Math.max(0.002, L0 * (0.4 + 0.8 * Rng.next())) : L0 * (0.85 + 0.3 * Rng.next());
        K.pos[o] = c0[0] + j() * 0.012; K.pos[o + 1] = c0[1] + j() * 0.012; K.pos[o + 2] = c0[2] + j() * 0.012;
        K.vel[o] = v0[0] + j() * 0.12; K.vel[o + 1] = v0[1] + j() * 0.12; K.vel[o + 2] = v0[2] + j() * 0.12;
        const dd = [d[0] / dl + j() * 0.18, d[1] / dl + j() * 0.18, d[2] / dl + j() * 0.18], ddl = Math.hypot(...dd) || 1;
        K.dir.set(dd.map((v) => v / ddl), o);
        K.axis.set(ax.map((v) => v / al), o);
        K.spin[i] = spin * (0.85 + 0.3 * Rng.next());
        K.len[i] = L;
        K.drag[i] = (short ? 26 + 22 * Rng.next() : 8 + 16 * (1 - Math.min(1, L / 0.12))) * (0.85 + 0.3 * Rng.next());
        K.phase[i] = Rng.next() * 6.28;
        K.state[i] = 1;
        K.swept[i] = 0; K.through[i] = 0;
        K.born[i] = now;
        const shade = 0.9 + 0.2 * Rng.next();
        K.col.set(col.map((v) => v * shade), o);
        K.curl.set([cr[0] * 0.8, Math.max(0.3, cr[1] * Math.min(1, L / 0.15)), Rng.next() * 6.28, (short ? 0.0011 : 0.0014) * (cr[3] || 1)], i * 4);
      }
    }
    K.moving += made;
    K.dirty = true;
    return true;
  }
  // prototype "landing": pieces that touch bare skin below the hairline (neck, nape, ears, jaw) catch there about
  // 3 in 5 times, as clipped hair clings to a real customer, until the barber brushes off at the reveal. Contact is
  // tested against the customer's own (morphed) head mesh through a small grid of its skin vertices.
  let skin = null;
  function skinGrid() {
    if (skin) return skin;
    const Pt = ctx && ctx.Pt, st = HSC.debugState;
    if (!Pt || !st || !st.scalp) return null;
    const P = Pt.attributes.position.array, N = Pt.attributes.normal.array, cells = new Map(), C = 0.2;
    for (let v = 0; v < P.length / 3; v++) {
      const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
      if (st.scalp[v] > 0.05 || y < -1.6 || y > 1.4 || (z > 0.9 && Math.abs(x) < 1.2)) continue;
      const k = Math.floor(x / C) + ',' + Math.floor(y / C) + ',' + Math.floor(z / C);
      if (!cells.has(k)) cells.set(k, []);
      cells.get(k).push(v);
    }
    return (skin = { P, N, cells, C });
  }
  function neckCatch(i, o) {
    const vt = ctx && ctx.vt, g = skinGrid();
    if (!vt || !g) return false;
    const sc = vt.scale.x || 1, hx = (K.pos[o] - vt.position.x) / sc, hy = (K.pos[o + 1] - vt.position.y) / sc, hz = (K.pos[o + 2] - vt.position.z) / sc;
    if (hy < -1.7 || hy > 1.5 || Math.abs(hx) > 2.2 || hz < -2.2 || hz > 2.0) return false;
    const { P, N, cells, C } = g, cx = Math.floor(hx / C), cy = Math.floor(hy / C), cz = Math.floor(hz / C);
    let best = -1, bd = 0.045 * 0.045;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) {
      const L = cells.get((cx + a) + ',' + (cy + b) + ',' + (cz + c));
      if (L) for (const v of L) { const dx = P[v * 3] - hx, dy = P[v * 3 + 1] - hy, dz = P[v * 3 + 2] - hz, d = dx * dx + dy * dy + dz * dz; if (d < bd) { bd = d; best = v; } }
    }
    if (best < 0) return false;
    const nx = N[best * 3], ny = N[best * 3 + 1], nz = N[best * 3 + 2];
    const sticks = ((Math.imul(i + 1, 0x9e3779b1) >>> 0) % 10) < 6;
    if (sticks) {
      // lies on the skin along its surface
      K.pos[o] = vt.position.x + (P[best * 3] + nx * 0.012) * sc;
      K.pos[o + 1] = vt.position.y + (P[best * 3 + 1] + ny * 0.012) * sc;
      K.pos[o + 2] = vt.position.z + (P[best * 3 + 2] + nz * 0.012) * sc;
      const d = [K.dir[o], K.dir[o + 1], K.dir[o + 2]], dn = d[0] * nx + d[1] * ny + d[2] * nz;
      d[0] -= dn * nx; d[1] -= dn * ny; d[2] -= dn * nz;
      const l = Math.hypot(...d) || 1;
      K.dir[o] = d[0] / l; K.dir[o + 1] = d[1] / l; K.dir[o + 2] = d[2] / l;
      K.vel[o] = K.vel[o + 1] = K.vel[o + 2] = 0;
      K.state[i] = 3;
      return true;
    }
    // glances off the skin and keeps falling
    const vn = K.vel[o] * nx + K.vel[o + 1] * ny + K.vel[o + 2] * nz;
    if (vn < 0) { K.vel[o] -= 1.6 * vn * nx; K.vel[o + 1] -= 1.6 * vn * ny; K.vel[o + 2] -= 1.6 * vn * nz; }
    return false;
  }
  // Android: the falling-hair prototype sets the cap (12,000 for tufts and dust); other builds keep the detail profile's
  const cap = () => Math.min(MAX, EXC && HSC.CLIP_PROTOS ? HSC.CLIP_PROTOS[HSC.clipProto || 0].cap : (HSC.detail && HSC.detail.clipMax) || MAX);
  function alloc() {
    if (K.count < cap()) return K.count++;
    // reuse the oldest piece
    const i = K.next % cap();
    K.next = (i + 1) % cap();
    return i;
  }
  HSC.clipCap = function () {
    if (K.count > cap()) { K.count = cap(); K.next = 0; K.dirty = true; }
  };

  HSC.clearClippings = function () { skin = null; K.count = 0; K.next = 0; K.moving = 0; K.dirty = false; if (geo) geo.instanceCount = 0; };
  HSC.clippingsActive = () => K.moving > 0;
  // QA: the pieces and the gown they rest on (read only)
  HSC.clippingsDebug = () => ({ K, robe: robeRef, field });
  // counts by state (for tests): free, falling, sliding, resting
  HSC.clippingsStats = () => { const c = [0, 0, 0, 0]; let gone = 0, swept = 0; for (let i = 0; i < K.count; i++) { if (K.len[i] <= 0) gone++; else { c[K.state[i]]++; if (K.swept[i]) swept++; } } return { count: K.count, onShow: K.count - gone, falling: c[1], sliding: c[2], resting: c[3], swept, gone }; };

  // the barber brushes the gown off at the reveal: resting pieces are flicked outward in a sweep
  // across the gown, most of them falling off the shoulders and the lap
  HSC.brushClippings = function () {
    if (!mesh || !K.count) return;
    const rest = [];
    let cx = 0, cz = 0;
    for (let i = 0; i < K.count; i++) if (K.len[i] > 0 && !K.swept[i]) { rest.push(i); cx += K.pos[i * 3]; cz += K.pos[i * 3 + 2]; }
    if (!rest.length) return;
    cx /= rest.length; cz /= rest.length;
    rest.sort((a, b) => K.pos[a * 3] - K.pos[b * 3]);
    const waves = 6;
    for (let w = 0; w < waves; w++) {
      setTimeout(() => {
        const now = performance.now();
        const from = Math.floor((rest.length * w) / waves), to = Math.floor((rest.length * (w + 1)) / waves);
        for (let k = from; k < to; k++) {
          const i = rest[k], o = i * 3;
          if (K.len[i] <= 0 || K.swept[i]) continue;
          const wasMoving = K.state[i] !== 3;
          let dx = K.pos[o] - cx, dz = K.pos[o + 2] - cz;
          const l = Math.hypot(dx, dz) || 1;
          dx /= l; dz /= l;
          const sp = 3 + 2.5 * Rng.next();
          K.vel[o] = dx * sp + (Rng.next() - 0.5) * 0.6;
          K.vel[o + 1] = 1.2 + 1.4 * Rng.next();
          K.vel[o + 2] = dz * sp + 1.6 + (Rng.next() - 0.5) * 0.8;
          K.pos[o + 1] += 0.02;
          K.drag[i] = 1 + 1.2 * Rng.next(); // flicked pieces fly further than drifting fluff
          K.state[i] = 1;
          K.swept[i] = 1;
          K.born[i] = now;
          if (!wasMoving) K.moving++;
        }
        K.dirty = true;
      }, 500 + w * 170);
    }
  };

  HSC.stepClippings = function () {
    if (!mesh) return;
    const now = performance.now();
    if (!K.moving && !K.dirty) { K.last = now; return; }
    K.dirty = false;
    const dt = Math.min(0.033, K.last ? (now - K.last) / 1000 : 0.016);
    K.last = now;
    let moving = 0;
    const t = now / 1000;
    for (let i = 0; i < K.count; i++) {
      const st = K.state[i];
      if (st === 0 || st === 3) continue;
      const o = i * 3;
      let x = K.pos[o], y = K.pos[o + 1], z = K.pos[o + 2], vx = K.vel[o], vy = K.vel[o + 1], vz = K.vel[o + 2];
      if (st === 1) {
        // gravity, air drag and a little flutter
        const k = K.drag[i], ph = K.phase[i];
        vx += (Math.sin(t * 7 + ph) * 5) * dt;
        vz += (Math.cos(t * 6 + ph * 1.3) * 5) * dt;
        vy -= G * dt;
        const damp = Math.exp(-k * dt);
        vx *= damp; vy *= damp; vz *= damp;
        // tumble
        const a = [K.axis[o], K.axis[o + 1], K.axis[o + 2]], d = [K.dir[o], K.dir[o + 1], K.dir[o + 2]], ang = K.spin[i] * dt;
        const c = Math.cos(ang), s = Math.sin(ang), dot = a[0] * d[0] + a[1] * d[1] + a[2] * d[2];
        const cr = [a[1] * d[2] - a[2] * d[1], a[2] * d[0] - a[0] * d[2], a[0] * d[1] - a[1] * d[0]];
        for (let q = 0; q < 3; q++) K.dir[o + q] = d[q] * c + cr[q] * s + a[q] * dot * (1 - c);
      }
      if (!EXC) {
        // Playables / YouTube: the original landing, unchanged
        if (st !== 1) {
          // sliding down a steep fold of the gown
          vx *= Math.exp(-6 * dt); vz *= Math.exp(-6 * dt);
        }
        x += vx * dt; y += vy * dt; z += vz * dt;
        if (EXC && HSC.clipProto === 2 && st === 1 && !K.swept[i]) {
          K.pos[o] = x; K.pos[o + 1] = y; K.pos[o + 2] = z; K.vel[o] = vx; K.vel[o + 1] = vy; K.vel[o + 2] = vz;
          const caught = neckCatch(i, o);
          x = K.pos[o]; y = K.pos[o + 1]; z = K.pos[o + 2]; vx = K.vel[o]; vy = K.vel[o + 1]; vz = K.vel[o + 2];
          if (caught) continue;
        }
        const ground = K.swept[i] ? -1e9 : heightAt(x, z);
        if (y < ground + 0.004) {
          const e = 0.05;
          const gx = (heightAt(x + e, z) - heightAt(x - e, z)) / (2 * e), gz = (heightAt(x, z + e) - heightAt(x, z - e)) / (2 * e);
          const slope = Math.hypot(gx, gz);
          y = ground + 0.004;
          if (slope > 1.1 && Number.isFinite(slope) && slope < 50) {
            K.state[i] = 2;
            const sp = 0.9;
            vx = (-gx / slope) * sp; vz = (-gz / slope) * sp; vy = 0;
          } else {
            K.state[i] = 3;
            vx = vy = vz = 0;
            // lie flat on the cloth
            K.dir[o + 1] *= 0.15;
            const l = Math.hypot(K.dir[o], K.dir[o + 1], K.dir[o + 2]) || 1;
            K.dir[o] /= l; K.dir[o + 1] /= l; K.dir[o + 2] /= l;
          }
        }
        if (y < -4 || (!K.swept[i] && now - K.born[i] > 20000)) { K.state[i] = 3; vx = vy = vz = 0; if (y < -4) K.len[i] = 0; }
      } else {
      if (st !== 1) {
          // sliding down a steep fold of the gown: pulled downhill, slowed by the cloth
          const e = 0.03, gx = (heightAt(x + e, z) - heightAt(x - e, z)) / (2 * e), gz = (heightAt(x, z + e) - heightAt(x, z - e)) / (2 * e);
          if (Number.isFinite(gx) && Number.isFinite(gz) && Math.abs(gx) < 50 && Math.abs(gz) < 50) {
            const sl = Math.hypot(gx, gz) || 1, acc = G * 0.35 * Math.min(1, sl) / Math.sqrt(1 + sl * sl);
            vx += (-gx / sl) * acc * dt; vz += (-gz / sl) * acc * dt;
          }
          vx *= Math.exp(-4 * dt); vz *= Math.exp(-4 * dt); vy = 0;
        }
      x += vx * dt; y += vy * dt; z += vz * dt;
      if (EXC && HSC.clipProto === 2 && st === 1 && !K.swept[i]) {
        K.pos[o] = x; K.pos[o + 1] = y; K.pos[o + 2] = z; K.vel[o] = vx; K.vel[o + 1] = vy; K.vel[o + 2] = vz;
        const caught = neckCatch(i, o);
        x = K.pos[o]; y = K.pos[o + 1]; z = K.pos[o + 2]; vx = K.vel[o]; vy = K.vel[o + 1]; vz = K.vel[o + 2];
        if (caught) continue;
      }
      const ground = K.swept[i] || K.through[i] === 1 ? -1e9 : heightAt(x, z);
      // over the neck opening a falling piece meets the neck and slides down it onto the collar: it is given the
      // nearest cloth outward from the neck once, and settles there when it falls to that height
      if (st === 1 && !K.swept[i] && ground < -1e8 && (K.through[i] === 0 || K.through[i] === 2) && ctx && ctx.vt && field && field.tb) {
        const vt = ctx.vt, sc = vt.scale.x || 1;
        const hy = (y - vt.position.y) / sc;
        // looked for once the piece has fallen to about chin height (the collar is below the jaw)
        if (!K.through[i] && hy < -0.3) {
          K.through[i] = 3;
          const ax = vt.position.x, az = vt.position.z - 0.15 * sc;
          let rx = x - ax, rz = z - az;
          const rl = Math.hypot(rx, rz);
          if (rl > 1e-4 && rl < 1.6 * sc && hy > -2.6) {
            rx /= rl; rz /= rl;
            for (let step = 0.006; step < 0.35; step += 0.006) {
              const c2 = clothAt(x + rx * step, y + 0.4, z + rz * step);
              if (c2 && c2.y < y + 0.05) { K.through[i] = 2; K.land.set([x + rx * (step + 0.004), c2.y, z + rz * (step + 0.004)], o); break; }
            }
          }
        }
        if (K.through[i] === 2 && y <= K.land[o + 1] + 0.003) {
          x = K.land[o]; z = K.land[o + 2];
          const cl = clothAt(x, K.land[o + 1] + 0.02, z);
          y = (cl ? cl.y : K.land[o + 1]) + 0.003;
          vx = vy = vz = 0;
          K.state[i] = 3;
          K.through[i] = 0;
          const n = cl ? cl.n : [0, 1, 0], d = [K.dir[o], K.dir[o + 1], K.dir[o + 2]], dn = d[0] * n[0] + d[1] * n[1] + d[2] * n[2];
          d[0] -= dn * n[0]; d[1] -= dn * n[1]; d[2] -= dn * n[2];
          const l = Math.hypot(d[0], d[1], d[2]) || 1;
          K.dir[o] = d[0] / l; K.dir[o + 1] = d[1] / l; K.dir[o + 2] = d[2] / l;
          K.pos[o] = x; K.pos[o + 1] = y; K.pos[o + 2] = z; K.vel[o] = K.vel[o + 1] = K.vel[o + 2] = 0;
          continue;
        }
      }
      if (st === 2 && !(y < ground + 0.03)) {
        // slid off the edge of a fold (or into the neck opening): it falls again
        K.state[i] = 1;
        K.drag[i] = Math.max(K.drag[i], 6);
      } else if (y < ground + 0.004 || st === 2) {
        const e = 0.03;
        const gx = (heightAt(x + e, z) - heightAt(x - e, z)) / (2 * e), gz = (heightAt(x, z + e) - heightAt(x, z - e)) / (2 * e);
        const slope = Math.hypot(gx, gz), ok = Number.isFinite(slope) && slope < 50;
        y = ground + 0.004;
        const speed = Math.hypot(vx, vz);
        if (ok && slope > 1.1 && !(st === 2 && speed < 0.05)) {
          if (st !== 2) { K.state[i] = 2; vx = (-gx / slope) * 0.6; vz = (-gz / slope) * 0.6; }
          vy = 0;
        } else {
          K.state[i] = 3;
          vx = vy = vz = 0;
          // lie on the exact cloth under it, along the surface (no part of its direction across the surface)
          const cl = clothAt(x, y, z);
          let n = ok ? [-gx, 1, -gz] : [0, 1, 0];
          if (cl) { y = cl.y + 0.003; n = cl.n; }
          else if (field && field.tb) {
            // no cloth anywhere under it (the neck opening, just past a collar edge): it falls on through, out of
            // sight, never resting in the air
            K.state[i] = 1;
            K.through[i] = 1;
            vx = (Rng.next() - 0.5) * 0.2; vz = (Rng.next() - 0.5) * 0.2; vy = -0.2;
            K.pos[o] = x; K.pos[o + 1] = y; K.pos[o + 2] = z; K.vel[o] = vx; K.vel[o + 1] = vy; K.vel[o + 2] = vz;
            moving++;
            continue;
          }
          const nl2 = n[0] * n[0] + n[1] * n[1] + n[2] * n[2];
          const d = [K.dir[o], K.dir[o + 1], K.dir[o + 2]], dn = (d[0] * n[0] + d[1] * n[1] + d[2] * n[2]) / nl2;
          d[0] -= dn * n[0]; d[1] -= dn * n[1]; d[2] -= dn * n[2];
          const l = Math.hypot(d[0], d[1], d[2]) || 1;
          K.dir[o] = d[0] / l; K.dir[o + 1] = d[1] / l; K.dir[o + 2] = d[2] / l;
        }
      }
      if (y < -4) { K.state[i] = 3; vx = vy = vz = 0; K.len[i] = 0; }
      // a piece still moving long after it was cut has fallen away out of sight: stop it (never mid-air on show)
      else if (!K.swept[i] && now - K.born[i] > 20000 && K.state[i] !== 3) { K.state[i] = 3; vx = vy = vz = 0; K.len[i] = 0; }
      }
      K.pos[o] = x; K.pos[o + 1] = y; K.pos[o + 2] = z;
      K.vel[o] = vx; K.vel[o + 1] = vy; K.vel[o + 2] = vz;
      if (K.state[i] !== 3) moving++;
    }
    K.moving = moving;
    // upload
    const P = attrs.iPos.array, D = attrs.iDir.array, Cu = attrs.iCurl.array, Co = attrs.iCol.array;
    for (let i = 0; i < K.count; i++) {
      P[i * 4] = K.pos[i * 3]; P[i * 4 + 1] = K.pos[i * 3 + 1]; P[i * 4 + 2] = K.pos[i * 3 + 2]; P[i * 4 + 3] = K.len[i];
      D[i * 3] = K.dir[i * 3]; D[i * 3 + 1] = K.dir[i * 3 + 1]; D[i * 3 + 2] = K.dir[i * 3 + 2];
      for (let q = 0; q < 4; q++) Cu[i * 4 + q] = K.curl[i * 4 + q];
      Co[i * 3] = K.col[i * 3]; Co[i * 3 + 1] = K.col[i * 3 + 1]; Co[i * 3 + 2] = K.col[i * 3 + 2];
    }
    for (const a of Object.values(attrs)) a.needsUpdate = true;
    geo.instanceCount = K.count;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
