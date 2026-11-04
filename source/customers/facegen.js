// ---------------------------------------------------------------------------------------------
// Customer faces (MakeHuman CC0, baked by tools/head-shapes/bake-faces.mjs into faces-data.js).
// Each customer's face = one of 20 face bases of their phenotype group (the group of their head shape,
// headshapes.js) + their own small variation, both from their seed. 240 bases in all; every customer is
// unique. Features: nose, lips and mouth, chin, cheeks, ears, forehead, brows. Derived, never saved.
// Eye targets are not used: the eyes stay on the fixed eyeballs.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const OWN = 0.3; // individual variation, as a share of each slider's spread
  const cache = new Map();
  let bases = null;
  const baseTable = () => {
    if (bases || !HSC.FACE_BASES_B64) return bases;
    const b = atob(HSC.FACE_BASES_B64), q = new Int8Array(b.length);
    for (let i = 0; i < b.length; i++) q[i] = (b.charCodeAt(i) << 24) >> 24;
    return (bases = q);
  };

  // the face base for a customer: [group index, base index within the group], or null
  HSC.faceBaseOf = function (person) {
    const G = HSC.FACE_BASE_GROUPS, ids = HSC.HEAD_SHAPE_IDS, n = HSC.FACE_BASES_PER_GROUP;
    if (!G || !ids || !n || !person || !HSC.headShapeOf) return null;
    const k = HSC.headShapeOf(person), gi = k >= 0 ? G.indexOf(ids[k].split('/')[0]) : -1;
    if (gi < 0) return null;
    if (HSC.forceFaceBase != null) return [gi, HSC.forceFaceBase % n]; // QA previews only
    let h = (person.seed >>> 0) ^ 0x85ebca6b;
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
    return [gi, (h >>> 4) % n];
  };

  // [target index, weight] pairs for a customer, or [] without face data
  HSC.faceOf = function (person) {
    const S = HSC.FACE_SLIDERS;
    if (!S || !person || !HSC.rng) return [];
    const seed = HSC.forceFaceSeed != null ? HSC.forceFaceSeed : person.seed; // QA previews only
    const fb = HSC.faceBaseOf(person), table = baseTable();
    const key = seed + ':' + (fb ? fb.join(',') : '-');
    if (cache.has(key)) return cache.get(key);
    const R = HSC.rng((seed ^ 0x5eedface) >>> 0), out = [];
    const row = fb && table ? (fb[0] * HSC.FACE_BASES_PER_GROUP + fb[1]) * S.length : -1;
    S.forEach((s, i) => {
      const on = R.next() < 0.5, g = R.gauss(s.sd * OWN);
      let w = (row >= 0 ? table[row + i] / 127 : 0) + (on ? g : 0);
      w = Math.max(-0.95, Math.min(0.95, w));
      if (s.neg < 0) w = Math.max(0, w);
      if (w > 0.005) out.push([s.pos, w]); else if (w < -0.005) out.push([s.neg, -w]);
    });
    if (cache.size > 64) cache.delete(cache.keys().next().value);
    cache.set(key, out);
    return out;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
