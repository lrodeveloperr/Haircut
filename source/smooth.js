// Adaptive Phong-curved refinement of the head mesh. Edges longer than `maxLen` are split at a point on
// the curved surface implied by the vertex normals (original vertices never move), and each triangle is
// re-tiled into 2, 3 or 4 children depending on how many of its edges were split, so neighbours always
// agree and no cracks open. `org` maps every output triangle to the input triangle it came from.
function smoothHead(e, maxLen, passes) {
  let P = Array.from(e.pos), N = Array.from(e.nrm), U = Array.from(e.uv), I = Array.from(e.idx);
  let org = new Array(I.length / 3);
  for (let k = 0; k < org.length; k++) org[k] = k;
  for (let pass = 0; pass < passes; pass++) {
    // vertices sharing a position (uv / normal seams) get one canonical id and an averaged normal,
    // so both sides of a seam bend the same way
    let V = P.length / 3, ids = new Map(), canon = new Int32Array(V), sm = [];
    for (let v = 0; v < V; v++) {
      let k = (Math.round(P[v * 3] * 1e4) + 1e5) * 4e10 + (Math.round(P[v * 3 + 1] * 1e4) + 1e5) * 2e5 + Math.round(P[v * 3 + 2] * 1e4) + 1e5;
      let c = ids.get(k);
      if (c === undefined) { c = sm.length / 3; ids.set(k, c); sm.push(0, 0, 0); }
      canon[v] = c;
      sm[c * 3] += N[v * 3]; sm[c * 3 + 1] += N[v * 3 + 1]; sm[c * 3 + 2] += N[v * 3 + 2];
    }
    for (let c = 0; c < sm.length; c += 3) {
      let l = Math.hypot(sm[c], sm[c + 1], sm[c + 2]) || 1;
      sm[c] /= l; sm[c + 1] /= l; sm[c + 2] /= l;
    }
    let ek = (a, b) => { let x = canon[a], y = canon[b]; return x < y ? x * 1e6 + y : y * 1e6 + x; };
    // split decision and curved midpoint per positional edge (-1: not split)
    let mid = new Map(), mp = [], any = false;
    for (let k = 0; k < I.length; k += 3) for (let j = 0; j < 3; j++) {
      let a = I[k + j], b = I[k + (j + 1) % 3], key = ek(a, b);
      if (mid.has(key)) continue;
      let dx = P[b * 3] - P[a * 3], dy = P[b * 3 + 1] - P[a * 3 + 1], dz = P[b * 3 + 2] - P[a * 3 + 2];
      if (dx * dx + dy * dy + dz * dz <= maxLen * maxLen) { mid.set(key, -1); continue; }
      any = true;
      let ca = canon[a] * 3, cb = canon[b] * 3;
      let da = dx * sm[ca] + dy * sm[ca + 1] + dz * sm[ca + 2], db = dx * sm[cb] + dy * sm[cb + 1] + dz * sm[cb + 2];
      mid.set(key, mp.length);
      for (let q = 0; q < 3; q++) mp.push((P[a * 3 + q] + P[b * 3 + q]) / 2 + .1875 * (db * sm[cb + q] - da * sm[ca + q]));
    }
    if (!any) break;
    // one new vertex per vertex pair, so seams keep their own uv and normal at the shared position
    let vx = new Map();
    let mv = (a, b) => {
      let key = a < b ? a * 1e6 + b : b * 1e6 + a, v = vx.get(key);
      if (v !== undefined) return v;
      v = P.length / 3;
      let m = mid.get(ek(a, b));
      P.push(mp[m], mp[m + 1], mp[m + 2]);
      let nx = N[a * 3] + N[b * 3], ny = N[a * 3 + 1] + N[b * 3 + 1], nz = N[a * 3 + 2] + N[b * 3 + 2], l = Math.hypot(nx, ny, nz) || 1;
      N.push(nx / l, ny / l, nz / l);
      U.push((U[a * 2] + U[b * 2]) / 2, (U[a * 2 + 1] + U[b * 2 + 1]) / 2);
      vx.set(key, v);
      return v;
    };
    let J = [], O = [];
    for (let k = 0; k < I.length; k += 3) {
      let v0 = I[k], v1 = I[k + 1], v2 = I[k + 2], o = org[k / 3];
      let s0 = mid.get(ek(v0, v1)) >= 0, s1 = mid.get(ek(v1, v2)) >= 0, s2 = mid.get(ek(v2, v0)) >= 0;
      let n = s0 + s1 + s2;
      if (n === 0) { J.push(v0, v1, v2); O.push(o); continue; }
      if (n === 3) {
        let ab = mv(v0, v1), bc = mv(v1, v2), ca = mv(v2, v0);
        J.push(v0, ab, ca, ab, v1, bc, ca, bc, v2, ab, bc, ca); O.push(o, o, o, o);
        continue;
      }
      // rotate so that a-b is split (and, with two splits, b-c too while c-a is not)
      let r = n === 1 ? (s0 ? 0 : s1 ? 1 : 2) : (!s0 ? 1 : !s1 ? 2 : 0);
      let t = [v0, v1, v2], a = t[r], b = t[(r + 1) % 3], c = t[(r + 2) % 3], ab = mv(a, b);
      if (n === 1) { J.push(a, ab, c, ab, b, c); O.push(o, o); continue; }
      let bc = mv(b, c);
      J.push(ab, b, bc, a, ab, bc, a, bc, c); O.push(o, o, o);
    }
    I = J; org = O;
  }
  return { pos: new Float32Array(P), nrm: new Float32Array(N), uv: new Float32Array(U),
    idx: P.length / 3 > 65535 ? new Uint32Array(I) : new Uint16Array(I), org: new Int32Array(org) };
}
if (typeof module !== 'undefined') module.exports = smoothHead;
