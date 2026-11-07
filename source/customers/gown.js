// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner decision 6 November 2026): the gown, built around the customer in the
// chair. The frozen game's cape is one fixed shape made for the small YouTube and playable builds, and customers' necks
// differ by about 40%, so skin could cut through it. Here the cloth and the neck are rebuilt for each customer from their
// real neck and shoulders.
//
// Every neck starts inside the skin and comes out of it, so there can be no space between the neck and the gown from any
// angle, and it overlaps the cloth below it. Eight kinds of neck, all taken from real barber gowns:
//
//   snap  stand collar, metal snaps at the nape, white paper neck strip folded over it (the starting gown)
//   towel folded towel wrapped round the neck, its end overlapping at the nape
//   band  wide soft neckband lying on the shoulders, metal clasp
//   rib   knitted ribbed collar
//   hook  flat band with a hook-and-loop tab
//   neo   padded neoprene seal with one plastic snap
//   tie   thin binding tied in a bow
//   clip  cloth gathered at the neck over a paper strip, held by a barber's clip
//
// Each of the 600 gown designs keeps its id, colours, pattern and price, and gains one kind of neck (HSC.gownCut).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const AXIS = -0.35, BACK = -1.3, FRONT = -1.62, HEM = -7.5, TAU = Math.PI * 2;
  const NT = 128, TOP = -0.55, DY = 0.04, BOTTOM = -4, NY = Math.ceil((TOP - BOTTOM) / DY) + 1;
  const COLS = 160, ROWS = 110;
  const CUTS = ['snap', 'towel', 'band', 'rib', 'hook', 'neo', 'tie', 'clip'];
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const neckline = (t) => { const c = Math.max(0, Math.cos(t)); return BACK + (FRONT - BACK) * c * c; };

  // every design keeps a fixed neck of its own
  HSC.gownCut = (d) => (d.i === 0 ? 'snap' : CUTS[(Math.imul(d.i + 1, 2654435761) >>> 0) >>> 29]);
  // Gowns are bright (owner, 6 November 2026): a dark gown swallows a dark-skinned customer's neck, and browns, tans and
  // peaches sit too close to skin. Each such colour becomes its nearest bright one; ids, patterns and prices do not change.
  const BRIGHT = {
    charcoal: 'silver', jet: 'silver', graphite: 'silver', grey: 'silver', midnight: 'sky', navy: 'blue', steel: 'sky', denim: 'sky', indigo: 'violet',
    burgundy: 'candy-red', brown: 'orange', forest: 'green', olive: 'lime', tan: 'amber', mustard: 'amber', khaki: 'lime', sand: 'pearl', cream: 'pearl', peach: 'coral', rose: 'pink',
  };
  const bright = (c) => BRIGHT[c] || c;
  if (HSC.catalog) {
    for (const d of HSC.catalog.designs.gown) {
      const p = d.parts, main = bright(p.main), second = bright(p.second);
      d.parts = Object.assign({}, p, { main, second: second === main ? (main === 'white' ? 'sky' : 'white') : second, collar: bright(p.collar) });
    }
    // the starting gown: a plain light neutral
    const first = HSC.catalog.byKey.get('gown:0');
    if (first) first.parts = Object.assign({}, first.parts, { main: 'silver', second: 'white', collar: 'white' });
  }

  // ---- the customer: how far their neck and shoulders reach, by angle and height ----
  let tris = null;
  function profile(head) {
    const P = head.geometry.attributes.position.array, I = head.geometry.index.array, S = new Float32Array(NT * NY).fill(-1);
    if (!tris) { tris = []; for (let i = 0; i < I.length; i += 3) if (Math.min(P[I[i] * 3 + 1], P[I[i + 1] * 3 + 1], P[I[i + 2] * 3 + 1]) < TOP + 0.5) tris.push(I[i] * 3, I[i + 1] * 3, I[i + 2] * 3); }
    let m = 9187;
    const R = () => (m = Math.imul(m, 1664525) + 1013904223 >>> 0, m / 4294967296);
    const put = (x, y, z) => {
      if (y > TOP || y < BOTTOM) return;
      const a = Math.round(((Math.atan2(x, z - AXIS) + TAU) % TAU) / TAU * NT) % NT, b = Math.round((TOP - y) / DY), r = Math.hypot(x, z - AXIS);
      if (b >= 0 && b < NY && r > S[a * NY + b]) S[a * NY + b] = r;
    };
    for (let i = 0; i < tris.length; i += 3) {
      const a = tris[i], b = tris[i + 1], c = tris[i + 2];
      if (Math.min(P[a + 1], P[b + 1], P[c + 1]) > TOP) continue;
      const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
      const area = Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) * 0.5, n = Math.min(60, Math.max(3, Math.ceil(area * 500)));
      for (let k = 0; k < n; k++) { let p = R(), q = R(); if (p + q > 1) { p = 1 - p; q = 1 - q; } put(P[a] + ux * p + vx * q, P[a + 1] + uy * p + vy * q, P[a + 2] + uz * p + vz * q); }
    }
    for (let pass = 0; pass < 30; pass++) {
      let open = 0;
      const s = S.slice();
      for (let a = 0; a < NT; a++) for (let b = 0; b < NY; b++) {
        if (s[a * NY + b] >= 0) continue;
        open++;
        const v = Math.max(s[((a + NT - 1) % NT) * NY + b], s[((a + 1) % NT) * NY + b], b ? s[a * NY + b - 1] : -1, b < NY - 1 ? s[a * NY + b + 1] : -1);
        if (v >= 0) S[a * NY + b] = v;
      }
      if (!open) break;
    }
    return S;
  }
  const along = (S, A, B, op) => {
    const t = new Float32Array(S.length), o = new Float32Array(S.length);
    for (let a = 0; a < NT; a++) for (let b = 0; b < NY; b++) { let v = op ? -1 : 0; for (let i = -A; i <= A; i++) { const x = S[((a + i + NT) % NT) * NY + b]; v = op ? Math.max(v, x) : v + x; } t[a * NY + b] = op ? v : v / (2 * A + 1); }
    for (let a = 0; a < NT; a++) for (let b = 0; b < NY; b++) { let v = op ? -1 : 0, n = 0; for (let j = -B; j <= B; j++) { const y = b + j; if (y < 0 || y >= NY) continue; const x = t[a * NY + y]; v = op ? Math.max(v, x) : v + x; n++; } o[a * NY + b] = op ? v : v / n; }
    return o;
  };
  const widen = (S, A, B) => along(S, A, B, true), soften = (S, A, B) => along(S, A, B, false);
  const look = (S, t, y) => {
    const f = ((t % TAU + TAU) % TAU) / TAU * NT, a = Math.floor(f), u = f - a, g = clamp((TOP - y) / DY, 0, NY - 1.001), b = Math.floor(g), v = g - b;
    const q = (i, j) => S[((i % NT + NT) % NT) * NY + j];
    return (q(a, b) * (1 - u) + q(a + 1, b) * u) * (1 - v) + (q(a, b + 1) * (1 - u) + q(a + 1, b + 1) * u) * v;
  };
  function shape(S) {
    // the neck: the real skin, smoothed a little; under the chin the jaw above the collar line is ignored
    const Q = S.slice();
    for (let a = 0; a < NT; a++) { const t = a / NT * TAU, top = Math.floor((TOP - (neckline(t) + 0.08)) / DY); if (Math.cos(t) > 0.25) for (let b = top - 1; b >= 0; b--) Q[a * NY + b] = Q[a * NY + top]; }
    const N = soften(Q, 2, 1);
    // the body: from the collar line down, widened and softened more with depth, so the cloth hangs rather than clings
    const B = new Float32Array(S.length);
    for (let a = 0; a < NT; a++) { const t = a / NT * TAU, top = Math.floor((TOP - (neckline(t) + 0.1)) / DY); for (let b = 0; b < NY; b++) B[a * NY + b] = b < top ? -1 : S[a * NY + b]; for (let b = top - 1; b >= 0; b--) B[a * NY + b] = B[a * NY + top]; }
    const down = (X) => { for (let a = 0; a < NT; a++) for (let b = 1; b < NY; b++) X[a * NY + b] = Math.max(X[a * NY + b], X[a * NY + b - 1]); return X; };
    const near = down(soften(widen(B, 6, 3), 6, 3)), far = soften(down(widen(B, 12, 6)), 12, 9), C = new Float32Array(S.length);
    for (let a = 0; a < NT; a++) { const t = a / NT * TAU; for (let b = 0; b < NY; b++) { const z = smooth((neckline(t) - (TOP - b * DY) - 0.3) / 0.9), i = a * NY + b; C[i] = near[i] + (far[i] - near[i]) * z; } }
    return { N, C: down(C) };
  }

  // ---- the cloth ----
  const grid = (rows, cols, fn) => {
    const pos = new Float32Array((rows + 1) * (cols + 1) * 3), uv = new Float32Array((rows + 1) * (cols + 1) * 2), ix = [];
    for (let r = 0, i = 0; r <= rows; r++) for (let c = 0; c <= cols; c++, i++) { const p = fn(r / rows, c / cols); pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2]; uv[i * 2] = p[3] == null ? c / cols : p[3]; uv[i * 2 + 1] = p[4] == null ? r / rows : p[4]; }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const a = r * (cols + 1) + c, b = a + cols + 1; ix.push(a, b, a + 1, a + 1, b, b + 1); }
    return { pos, uv, ix, rows, cols };
  };
  const at = (t, r, y, u, v) => [Math.sin(t) * r, y, AXIS + Math.cos(t) * r, u, v];
  const ridge = (x, p) => Math.pow(0.5 + 0.5 * Math.sin(x), p) * 2 - 1;
  const CLOTH = {
    nylon: { gap: 0.085, fall: 0.13, amp: 0.13, k1: 11, k2: 17, k3: 21, sharp: 1.5, fine: 0.04, nape: 0.05, grow: 1.9 },
    heavy: { gap: 0.1, fall: 0.15, amp: 0.17, k1: 9, k2: 15, k3: 19, sharp: 1.7, fine: 0.032, nape: 0.04, grow: 1.7 },
    crisp: { gap: 0.075, fall: 0.11, amp: 0.095, k1: 10, k2: 16, k3: 24, sharp: 1.3, fine: 0.02, nape: 0.022, grow: 2.2 },
    gathered: { gap: 0.09, fall: 0.13, amp: 0.14, k1: 11, k2: 18, k3: 28, sharp: 1.5, fine: 0.045, nape: 0.05, grow: 1.7 },
  };
  function fold(t, d, o) {
    const back = Math.max(0, -Math.cos(t)), side = Math.abs(Math.sin(t));
    const wob = 1.1 * Math.sin(t * 3 + d * 0.27 + 1.1) + 0.6 * Math.sin(t * 5 - d * 0.41 + 0.5) + 0.3 * Math.sin(t * 9 + d * 0.6);
    const tense = 1 - 0.55 * Math.exp(-Math.pow((side - 1) / 0.18, 2)) * (1 - smooth(d / 3.2));
    let f = o.amp * smooth(d / o.grow) * tense * (0.62 * ridge(t * o.k1 + wob, o.sharp) + 0.38 * ridge(t * o.k2 - wob * 1.3 + 1.9, o.sharp));
    f += o.fine * Math.exp(-d / 1.15) * smooth(d / 0.12) * (0.4 + 0.6 * back) * Math.sin(t * o.k3 + 1.7 * Math.sin(t * 5 + d * 0.6));
    f += o.nape * back * back * Math.exp(-d / 2.1) * smooth(d / 0.3) * ridge(t * 13 + 0.4 * Math.sin(d * 0.8), 1.5);
    return f;
  }
  // the outside of the cloth at this angle and height; x is where the cloth starts
  function clothAt(F, o, t, y, x) {
    const d = x - y, low = BOTTOM + 0.05, base = look(F.C, t, Math.max(y, low)) + o.gap + Math.max(0, low - y) * o.fall;
    const r0 = look(F.N, t, x) + 0.02, k = smooth(d / 0.22);
    return Math.max(r0, base * k + r0 * (1 - k)) + fold(t, d, o);
  }
  const cloth = (F, o, start, rows, cols, hem) => grid(rows, cols, (v, u) => {
    const t = u * TAU, x = start(t), y = x + (hem - x) * Math.pow(v, 1.55);
    return at(t, clothAt(F, o, t, y, x), y, u, v);
  });

  // ---- the necks ----
  // comes out of the skin at the top edge: e is how far the neck then stands off the skin
  const out = (s, e) => -0.03 + (0.03 + e) * smooth(s / 0.08);
  // a stand-up band following the neck, overlapping the cloth at its foot
  function band(F, o, start, top, height, e, cols) {
    return grid(16, cols, (s, u) => {
      const t = u * TAU, y = top(t) - height * s, x = start(t);
      let r = look(F.N, t, y) + out(s, e) + 0.012 * Math.sin(Math.PI * s);
      if (y < x - 0.02) r = Math.max(r, clothAt(F, o, t, y, x) + 0.014 + o.fine);
      return at(t, r, y, u * 10, s);
    });
  }
  const bandAt = (F, o, start, e) => (t, y) => { const x = start(t); let r = look(F.N, t, y) + e + 0.012; if (y < x - 0.02) r = Math.max(r, clothAt(F, o, t, y, x) + 0.014 + o.fine); return r; };
  // white paper strip: out of the skin, over the band's top edge and down its face
  function strip(F, top, cols) {
    const p = [[-0.035, 0.09], [0.002, 0.095], [0.024, 0.085], [0.042, 0.055], [0.052, 0], [0.054, -0.075]];
    return grid(15, cols, (s, u) => {
      const t = u * TAU, f = s * (p.length - 1), i = Math.min(p.length - 2, Math.floor(f)), k = f - i, y = top(t) + p[i][1] + (p[i + 1][1] - p[i][1]) * k;
      return at(t, look(F.N, t, y) + p[i][0] + (p[i + 1][0] - p[i][0]) * k + 0.005 * Math.sin(t * 17 + 1) + 0.003 * Math.sin(t * 31), y, u * 14, s);
    });
  }
  // a soft roll round the neck; the inner side is always inside the skin, at every height
  function roll(F, o, start, y0, a0, b0, opts, cols) {
    return grid(34, cols, (s, u) => {
      const t = u * TAU, ph = s * TAU, c = Math.cos(ph), q = Math.sin(ph), L = opts.lump || 0;
      const over = opts.overlap ? smooth((t - (Math.PI - 0.5)) / 0.035) * (1 - smooth((t - (Math.PI + 0.62)) / 0.03)) : 0;
      const lump = 1 + L * Math.sin(t * 3 + 1) + 0.7 * L * Math.sin(t * 5 + 2) + 0.4 * L * Math.sin(t * 11);
      const a = a0 * lump + 0.04 * over, b = b0 * (1 + 0.5 * L * Math.sin(t * 4 + 0.4)) + 0.02 * over;
      const sq = Math.sign(c) * Math.pow(Math.abs(c), opts.flat || 1), sr = Math.sign(q) * Math.pow(Math.abs(q), opts.flat ? 0.72 : 1);
      const y = y0(t) + 0.012 * over + b * sr;
      const step = opts.layers ? 0.04 * (1 - smooth((q + 0.18) / 0.06)) * (c > 0 ? 1 : 0) : 0;
      const spread = (opts.spread || 0) * smooth((0.1 - q) / 0.9) * (c > 0 ? 1 : 0.5);
      let r = look(F.N, t, y) + a * (sq + 0.8) + step + spread;
      if (c > 0 && y < start(t) - 0.02) r = Math.max(r, clothAt(F, o, t, y, start(t)) + 0.012);
      return at(t, r, y, u * 22, s * 5);
    });
  }
  // a soft rounded patch lying on a surface; rot turns it, sizes are in the game's units
  function patch(R, tc, yc, hw, hh, lift, rot = 0, n = 5) {
    const co = Math.cos(rot), si = Math.sin(rot), R0 = R(tc, yc);
    return grid(12, 20, (v, u) => {
      const a = u * 2 - 1, b = v * 2 - 1, m = Math.max(Math.abs(a), Math.abs(b)), q = Math.pow(Math.pow(Math.abs(a), n) + Math.pow(Math.abs(b), n), 1 / n) || 1, x = a * (m / q) * hw, y = -b * (m / q) * hh;
      const t = tc + (x * co - y * si) / R0, yy = yc + x * si + y * co;
      return at(t, R(t, yy) + lift * (1 - Math.pow(m, 7)) - 0.004, yy, u, v);
    });
  }
  function stud(R, tc, yc, rad, h) {
    const r0 = R(tc, yc);
    return grid(8, 18, (s, u) => { const f = u * TAU; return at(tc + Math.sin(f) * rad * s / r0, r0 + h * Math.sqrt(Math.max(0, 1 - s * s * 0.92)), yc + Math.cos(f) * rad * s, u, s); });
  }
  const PI = Math.PI;
  const NECKS = {
    snap(F, c) {
      const top = (t) => neckline(t) + 0.2, o = c.o, R = bandAt(F, o, c.start, 0.05), y = BACK + 0.2 - 0.17;
      const parts = [{ kind: 'paper', grid: strip(F, top, c.cols) }, { kind: 'self', grid: patch(R, PI - 0.13, y, 0.42, 0.115, 0.03) }];
      for (const dt of [-0.3, -0.12, 0.06]) parts.push({ kind: 'metal', grid: stud((t, yy) => R(t, yy) + 0.03, PI + dt, y, 0.05, 0.026) });
      return { band: band(F, o, c.start, top, 0.32, 0.04, c.cols), tex: 'stitch', colour: 'main', parts };
    },
    towel(F, c) { return { band: roll(F, c.o, c.start, (t) => neckline(t) + 0.04, 0.135, 0.225, { lump: 0.1, flat: 0.62, layers: true, overlap: true, spread: 0.09 }, c.cols), tex: 'terry', colour: 'collar', parts: [] }; },
    band(F, c) {
      const o = c.o, top = (t) => neckline(t) + 0.14;
      const R = (t, y) => { const tp = top(t), s = clamp((tp - y) / 0.34), x = c.start(t); let r = look(F.N, t, Math.max(y, tp - 0.2)) + out(s * 2, 0.035) + 0.52 * Math.pow(s, 1.25); if (y < x - 0.02) r = Math.max(r, clothAt(F, o, t, y, x) + 0.03); return r; };
      const g = grid(22, c.cols, (s, u) => { const t = u * TAU, y = top(t) - 0.12 * smooth(s / 0.14) - (0.2 + 0.14 * Math.abs(Math.cos(t))) * Math.pow(s, 1.25) - 0.012 * smooth((s - 0.9) / 0.1), x = c.start(t); let r = look(F.N, t, Math.max(y, top(t) - 0.2)) + out(s, 0.035) + (0.52 + 0.06 * Math.sin(t * 2 + 1.2)) * Math.pow(s, 1.25); if (y < x - 0.02) r = Math.max(r, clothAt(F, o, t, y, x) + 0.03 - 0.02 * smooth((s - 0.9) / 0.1)); return at(t, r, y, u * 10, s); });
      const y = BACK + 0.14 - 0.2, parts = [{ kind: 'metal', grid: patch(R, PI, y, 0.17, 0.075, 0.02, 0, 4) }];
      for (const dt of [-0.075, 0, 0.075]) parts.push({ kind: 'dark', grid: stud((t, yy) => R(t, yy) + 0.018, PI + dt, y, 0.02, 0.004) });
      return { band: g, tex: 'smooth', colour: 'collar', parts };
    },
    rib(F, c) { return { band: band(F, c.o, c.start, (t) => neckline(t) + 0.2, 0.34, 0.045, c.cols), tex: 'rib', colour: 'collar', parts: [] }; },
    hook(F, c) {
      const top = (t) => neckline(t) + 0.16, R = bandAt(F, c.o, c.start, 0.05), y = BACK + 0.16 - 0.13;
      return { band: band(F, c.o, c.start, top, 0.28, 0.04, c.cols), tex: 'stitch', colour: 'main', parts: [{ kind: 'loop', grid: patch(R, PI, y, 0.3, 0.085, 0.016) }] };
    },
    neo(F, c) {
      const y0 = (t) => neckline(t) + 0.06, R = (t, y) => look(F.N, t, y) + 0.13, y = BACK + 0.06;
      return { band: roll(F, c.o, c.start, y0, 0.075, 0.15, { lump: 0.02 }, c.cols), tex: 'smooth', colour: 'collar', parts: [{ kind: 'dark', grid: stud(R, PI, y, 0.052, 0.02) }] };
    },
    tie(F, c) {
      const top = (t) => neckline(t) + 0.13, R = bandAt(F, c.o, c.start, 0.05), y = BACK + 0.13 - 0.08;
      const parts = [{ kind: 'trim', grid: patch(R, PI - 0.13, y + 0.015, 0.14, 0.05, 0.04, 0.3) }, { kind: 'trim', grid: patch(R, PI + 0.13, y + 0.015, 0.14, 0.05, 0.04, -0.3) }];
      parts.push({ kind: 'trim', grid: patch(R, PI - 0.08, y - 0.17, 0.035, 0.17, 0.028, 0.2) }, { kind: 'trim', grid: patch(R, PI + 0.08, y - 0.17, 0.035, 0.17, 0.028, -0.2) });
      parts.push({ kind: 'trim', grid: stud((t, yy) => R(t, yy) + 0.03, PI, y, 0.05, 0.035) });
      return { band: band(F, c.o, c.start, top, 0.2, 0.04, c.cols), tex: 'plain', colour: 'collar', parts };
    },
    clip(F, c) {
      const top = (t) => neckline(t) + 0.15, R = bandAt(F, c.o, c.start, 0.05), y = BACK + 0.15 - 0.09;
      return { band: band(F, c.o, c.start, top, 0.22, 0.036, c.cols), tex: 'plain', colour: 'main', parts: [{ kind: 'paper', grid: strip(F, top, c.cols) }, { kind: 'metal', grid: patch(R, PI, y, 0.2, 0.06, 0.03, 0, 4) }, { kind: 'dark', grid: patch((t, yy) => R(t, yy) + 0.03, PI, y, 0.15, 0.012, 0.006, 0, 4) }] };
    },
  };
  const FABRIC = { snap: 'nylon', towel: 'heavy', band: 'crisp', rib: 'crisp', hook: 'nylon', neo: 'crisp', tie: 'nylon', clip: 'gathered' };
  const CLOTH_TOP = { towel: 0.06, band: 0.03 };
  function build(F, cut, rows = ROWS, cols = COLS, hem = HEM) {
    const o = CLOTH[FABRIC[cut]], start = (t) => neckline(t) + (CLOTH_TOP[cut] || 0);
    return Object.assign(NECKS[cut](F, { o, start, cols }), { cloth: cloth(F, o, start, rows, cols, hem) });
  }

  // ---- in the game ----
  const G = { F: null, cut: null, tex: {}, mats: {}, dirty: true, queued: false };
  const W = () => HSC.wardrobe;
  const headOf = (robe) => { let h = null; robe.parent.children.forEach((o) => { if (o.isMesh && o !== robe && o.geometry.index && (!h || o.geometry.attributes.position.count > h.geometry.attributes.position.count)) h = o; }); return h; };
  function texture(name) {
    if (G.tex[name] !== undefined) return G.tex[name];
    const T = W().T, make = (w, h, draw, srgb) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.Fg(c); t.wrapS = t.wrapT = T.Pn; t.anisotropy = 4; if (srgb) t.colorSpace = T.Lt; return t; };
    const noise = (x, w, h, lo, hi) => { const d = x.createImageData(w, h); let m = 77; for (let i = 0; i < w * h; i++) { m = Math.imul(m, 1664525) + 1013904223 >>> 0; const v = lo + (m / 4294967296) * (hi - lo); d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; } x.putImageData(d, 0, 0); };
    const set = {
      stitch: () => make(256, 256, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#7d848c'; for (const y of [24, 224]) for (let i = 0; i < w; i += 26) x.fillRect(i, y, 17, 5); }, true),
      rib: () => make(256, 16, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#00000040'; for (let i = 0; i < w; i += 16) x.fillRect(i, 0, 5, h); }, true),
      terry: () => make(256, 256, (x, w, h) => noise(x, w, h, 208, 255), true),
      terryBump: () => make(256, 256, (x, w, h) => noise(x, w, h, 40, 215)),
      crepe: () => make(128, 128, (x, w, h) => { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 4) { x.fillStyle = i % 8 ? '#666' : '#9a9a9a'; x.fillRect(i, 0, 2, h); } }),
      fuzz: () => make(64, 64, (x, w, h) => noise(x, w, h, 60, 200)),
    };
    return (G.tex[name] = set[name] ? set[name]() : null);
  }
  const kindMat = (kind, base) => {
    if (G.mats[kind]) return G.mats[kind];
    const m = base.clone();
    m.map = null; m.bumpMap = null; m.metalness = 0; m.roughness = 0.6;
    if (kind === 'paper') { m.color.set('#f6f3ec'); m.roughness = 0.88; m.bumpMap = texture('crepe'); m.bumpScale = 0.6; }
    if (kind === 'metal') { m.color.set('#aab1b9'); m.metalness = 0.6; m.roughness = 0.34; }
    if (kind === 'dark') { m.color.set('#17191d'); m.roughness = 0.42; }
    if (kind === 'loop') { m.color.set('#c9ccd0'); m.roughness = 0.95; m.bumpMap = texture('fuzz'); m.bumpScale = 1.4; }
    return (G.mats[kind] = m);
  };
  function geometry(mesh, g, seam) {
    const B = mesh.geometry.constructor, A = mesh.geometry.attributes.position.constructor, o = new B();
    o.setAttribute('position', new A(g.pos, 3)); o.setAttribute('uv', new A(g.uv, 2)); o.setIndex(g.ix); o.computeVertexNormals();
    if (seam) { const n = o.attributes.normal, c = g.cols + 1; for (let r = 0; r <= g.rows; r++) { const a = r * c, b = a + g.cols, x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1; n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l); } }
    return o;
  }
  function paint(built, parts) {
    const w = W(), C = HSC.catalog, hex = (id) => C.colourHex.get(id) || '#888888', m = w.gown.collar;
    const self = built.colour === 'main' ? hex(parts.main) : hex(parts.collar);
    m.color.set(self);
    m.roughness = built.tex === 'terry' ? 0.96 : built.tex === 'smooth' ? 0.42 : 0.62;
    m.map = built.tex === 'stitch' ? texture('stitch') : built.tex === 'rib' ? texture('rib') : built.tex === 'terry' ? texture('terry') : null;
    m.bumpMap = built.tex === 'terry' ? texture('terryBump') : null;
    m.bumpScale = 3;
    m.needsUpdate = true;
    if (G.mats.self) G.mats.self.color.set(hex(parts.main));
    if (G.mats.trim) G.mats.trim.color.set(hex(parts.collar));
  }
  function apply() {
    const w = W(), gown = w && w.gown;
    if (!gown || !gown.robe || !w.T || !G.design) return false;
    const robe = gown.robe, [cloth0, collar0] = robe.children, head = headOf(robe);
    if (!head) return false;
    if (G.dirty || !G.F) { G.F = shape(profile(head)); G.dirty = false; }
    const cut = HSC.gownCut(G.design), built = build(G.F, cut);
    const old = cloth0.geometry, oldBand = collar0.geometry;
    cloth0.geometry = geometry(cloth0, built.cloth, true);
    collar0.geometry = geometry(collar0, built.band, true);
    old.dispose(); oldBand.dispose();
    for (const o of robe.children.slice(2)) { robe.remove(o); o.geometry.dispose(); }
    for (const p of built.parts) { const k = new cloth0.constructor(geometry(cloth0, p.grid, p.grid.cols === COLS), kindMat(p.kind, gown.collar)); robe.add(k); }
    const cm = gown.cloth;
    cm.roughness = 0.62; cm.sheen = 0.5; cm.sheenRoughness = 0.5; // no bump map on the cloth: over this much of the screen it cost 5 frames a second against 60
    G.cut = cut; G.built = built;
    paint(built, G.design.parts);
    if (HSC.clippingsCape) HSC.clippingsCape(robe);
    return true;
  }
  // the wardrobe's look changed
  HSC.gownDress = (design) => { const changed = !G.design || HSC.gownCut(design) !== G.cut; G.design = design; if (changed || !G.F) apply(); else paint(G.built, design.parts); };
  // a new customer sat down: fit once, on the next frame, so previews of other customers cost nothing
  const morphed = HSC.onMorph;
  HSC.onMorph = function (P, N, person) {
    if (morphed) morphed(P, N, person);
    G.dirty = true;
    if (G.queued) return;
    G.queued = true;
    requestAnimationFrame(() => { G.queued = false; try { apply(); } catch (e) { console.error('gown: fit failed', e); } });
  };
  HSC.gownFit = apply; // tests

  // ---- the shop's product shot: the same gown on a plain form ----
  let form = null;
  const shots = {};
  function plainForm() {
    if (form) return form;
    const S = new Float32Array(NT * NY);
    for (let a = 0; a < NT; a++) {
      const t = a / NT * TAU, side = Math.abs(Math.sin(t));
      for (let b = 0; b < NY; b++) {
        const y = TOP - b * DY, k = smooth((-1.15 - y) / 1.5), wide = 1.25 + (0.45 + 1.15 * Math.pow(side, 2)) * k;
        S[a * NY + b] = wide;
      }
    }
    return (form = shape(S));
  }
  HSC.gownShape = (cut) => (shots[cut] || (shots[cut] = build(plainForm(), cut, 60, 112, -5.2)));
})(globalThis.HSC || (globalThis.HSC = {}));
