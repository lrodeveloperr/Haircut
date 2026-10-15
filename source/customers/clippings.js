// ---------------------------------------------------------------------------------------------
// Falling hair: every clipper pass releases cut pieces the length of what was removed, in the
// customer's colour (with grey strands) and curl. They flutter down with air drag, tumble, land on
// the gown and settle (sliding off steep folds), and stay there until the next customer.
// World units: about 1 unit = 10 cm.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const MAX = 4000, SEG = 6;
  const G = 98; // gravity in world units / s^2
  const K = {
    pos: new Float32Array(MAX * 3), vel: new Float32Array(MAX * 3), dir: new Float32Array(MAX * 3), axis: new Float32Array(MAX * 3),
    spin: new Float32Array(MAX), len: new Float32Array(MAX), drag: new Float32Array(MAX), phase: new Float32Array(MAX),
    state: new Uint8Array(MAX), // 0 free, 1 falling, 2 sliding, 3 resting
    swept: new Uint8Array(MAX), // brushed off at the reveal: falls past the gown and out of sight
    born: new Float64Array(MAX), col: new Float32Array(MAX * 3), curl: new Float32Array(MAX * 4),
    count: 0, next: 0, last: 0, moving: 0,
  };
  let mesh = null, geo = null, attrs = null, ctx = null, field = null, Rng = HSC.rng(4242);

  const VERT = `
attribute vec4 iPos;   // xyz centre, w length
attribute vec3 iDir;   // unit direction of the piece
attribute vec4 iCurl;  // curl radius (x length), turns, phase, width
attribute vec3 iCol;
varying vec3 vCol; varying float vShade; varying float vEdge;
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
  vShade=.62+.5*sqrt(max(0.0,1.0-pow(dot(tang,normalize(vec3(-.3,.8,.5))),2.0)));
  gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0);
}`;
  const FRAG = `
varying vec3 vCol; varying float vShade; varying float vEdge;
void main(){
  if(abs(vEdge)>.98)discard;
  gl_FragColor=vec4(vCol*vShade,1.0);
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
    mesh = new T.Ze(geo, new T.fr({ vertexShader: VERT, fragmentShader: FRAG, side: T.$t }));
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    c.scene.add(mesh);
  };

  // heightfield of the gown's top surface (world space), rebuilt when the gown is attached / changed
  let robeRef = null;
  HSC.clippingsCape = function (robe) { if (robe) { robeRef = robe; field = null; } };
  function buildField(robe) {
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
      K.swept[i] = 0;
      K.born[i] = now;
      K.col.set(hairColour(cut.kind), o);
      const cr = isBeard ? bcurl : curl;
      K.curl.set([cr[0] * 0.8, Math.max(0.3, cr[1] * Math.min(1, L / 0.15)), Rng.next() * 6.28, 0.0028 * (cr[3] || 1)], i * 4);
    }
    K.moving += n;
    K.dirty = true;
    return true;
  };
  const cap = () => Math.min(MAX, (HSC.detail && HSC.detail.clipMax) || MAX);
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

  HSC.clearClippings = function () { K.count = 0; K.next = 0; K.moving = 0; K.dirty = false; if (geo) geo.instanceCount = 0; };
  HSC.clippingsActive = () => K.moving > 0;
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
      } else {
        // sliding down a steep fold of the gown
        vx *= Math.exp(-6 * dt); vz *= Math.exp(-6 * dt);
      }
      x += vx * dt; y += vy * dt; z += vz * dt;
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
