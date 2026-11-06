// ---------------------------------------------------------------------------------------------
// Customer head shapes (MakeHuman CC0, baked by tools/head-shapes/bake.mjs into headshapes-data.js).
// Each customer wears one of 36 shapes: 12 phenotype groups x oval / broad / angular face outlines.
// The shape is derived from the customer's seed and heritage, so it is never saved and a saved customer
// always comes back with the same face. Shapes only reach the face, jaw, cheeks, forehead and upper neck:
// render.js keeps them off the scalp (hair and cutting), the eyes and the lower neck.
// Without headshapes-data.js (non-Android targets) every customer keeps the original head.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  // the current heritage classes each draw from three phenotype groups
  const GROUPS_BY_HERITAGE = {
    white: ['north-european', 'mediterranean', 'mena'],
    black: ['west-african', 'east-african', 'mixed'],
    'east-asian': ['east-asian', 'southeast-asian', 'indigenous-american'],
    'south-asian': ['south-asian', 'latino', 'pacific-islander'],
  };
  const OUTLINES = ['oval', 'broad', 'angular'];

  // index into HSC.HEAD_SHAPE_IDS, or -1 for the original head
  HSC.headShapeOf = function (person) {
    if (HSC.forceShape != null) return HSC.forceShape; // QA previews only
    const ids = HSC.HEAD_SHAPE_IDS;
    if (!ids || !ids.length || !person) return -1;
    const her = (HSC.HERITAGE && HSC.HERITAGE[person.heritage] && HSC.HERITAGE[person.heritage].id) || person.heritage;
    let h = (person.seed >>> 0) ^ 0x9e3779b9;
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
    // a phenotype group (phenotypes.js) wears its own shapes; the original four classes draw from three groups
    const own = ids.some((id) => id.startsWith(her + '/'));
    const groups = own ? [her, her, her] : GROUPS_BY_HERITAGE[her] || GROUPS_BY_HERITAGE.white;
    return ids.indexOf(groups[h % 3] + '/' + OUTLINES[(h >>> 8) % 3]);
  };

  // ---- head form (owner-approved, 6 November 2026): every customer has his own skull and neck ----
  // One smooth warp reaches what the head shapes above cannot: the back and top of the skull, and the neck. It leaves
  // the eyes and the face alone. The head mesh takes it on the CPU (render.js) and the scalp hair in its vertex shader
  // (glsl.js, the same formula); cutting stays on the un-warped head (HSC.warpBase). Derived from the seed, never saved.
  // Each value is about -1..1: width, height, depth, a round or flat back, a narrow or broad top, neck girth and length.
  const FORM = {
    'north-european': { w: -0.2, d: 0.35, back: 0.35 }, mediterranean: { w: -0.1, d: 0.25, back: 0.2 }, mena: { w: -0.25, d: 0.4, back: 0.35 },
    'west-african': { w: -0.25, d: 0.5, back: 0.5, h: -0.1 }, 'east-african': { w: -0.4, d: 0.45, back: 0.45, h: 0.15 },
    'east-asian': { w: 0.55, d: -0.5, back: -0.6, h: 0.15 }, 'southeast-asian': { w: 0.4, d: -0.35, back: -0.4 },
    'south-asian': { w: -0.2, d: 0.25, back: 0.15 }, latino: { w: 0.15 }, 'indigenous-american': { w: 0.5, d: -0.3, back: -0.35 },
    'pacific-islander': { w: 0.4, d: -0.1, h: 0.15, neck: 0.4 }, mixed: {},
  };
  // the eyelids: an upper-lid fold that fills the crease, an inner-corner fold, the slant and the opening
  const LIDS = {
    'east-asian': { fold: 1.4, inner: 1.2, slant: 0.9, open: 0.9 }, 'southeast-asian': { fold: 0.9, inner: 0.7, slant: 0.45, open: 0.45 },
    'indigenous-american': { fold: 0.75, inner: 0.5, slant: 0.5, open: 0.45 }, 'pacific-islander': { fold: 0.2, inner: 0.1, slant: 0.1, open: 0 },
  };
  const forms = new Map();
  HSC.headFormOf = function (person) {
    if (!person || !HSC.rng) return null;
    const key = person.seed + ':' + person.heritage;
    if (forms.has(key)) return forms.get(key);
    const her = (HSC.HERITAGE && HSC.HERITAGE[person.heritage] && HSC.HERITAGE[person.heritage].id) || person.heritage;
    const R = HSC.rng(((person.seed >>> 0) ^ 0x4ead5eed) >>> 0 || 1), m = FORM[her] || {}, l = LIDS[her] || {};
    const c = (v) => Math.max(-1, Math.min(1, v)), own = (k, sd) => c((m[k] || 0) + R.gauss(sd));
    const pos = (v) => Math.max(0, Math.min(1.6, v));
    const f = { w: own('w', 0.5), h: own('h', 0.5), d: own('d', 0.5), back: own('back', 0.5), top: own('top', 0.5), neck: own('neck', 0.55), lift: own('lift', 0.55),
      fold: pos((l.fold || 0) + R.gauss(0.1)), inner: pos((l.inner || 0) + R.gauss(0.08)), slant: (l.slant || 0) + R.gauss(0.12), open: (l.open || 0) + R.gauss(0.15) };
    if (forms.size > 64) forms.clear();
    forms.set(key, f);
    return f;
  };
  const sm = (a, b, t) => { const x = Math.max(0, Math.min(1, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
  // moves the point at p[i..i+2]. glsl.js holds the same formula: change both together
  HSC.headWarp = function (p, i, f) {
    const x = p[i], y = p[i + 1], z = p[i + 2];
    const rearSide = 1 - sm(0.2, 1.25, z), above = sm(0.7, 1.9, y), rear = 1 - sm(-0.7, 0.4, z);
    let dx = x * (0.16 * f.w * above * rearSide + 0.08 * f.top * sm(2.4, 3.6, y));
    const dy = (y - 2.2) * 0.12 * f.h * sm(2.3, 3.5, y);
    let dz = (z + 0.13) * 0.22 * f.d * rear * sm(0.4, 1.6, y);
    dz -= 0.16 * f.back * rear * Math.exp(-(x * x / 1.21 + (y - 2) * (y - 2) / 0.5625));
    const neck = (1 - sm(-0.2, 0.7, y)) * (1 - sm(-1.2, -0.6, y) * sm(0.2, 0.9, z));
    dx += x * 0.2 * f.neck * neck; dz += (z - 0.3) * 0.16 * f.neck * neck;
    p[i] = x + dx; p[i + 1] = y + dy; p[i + 2] = z + dz;
  };
  // the eyelids around the fixed eyeball, for a point on the un-morphed head: [dx, dy, dz] or null
  HSC.lidDelta = function (x, y, z, f) {
    if (z < 1.25) return null;
    const ax = Math.abs(x), sx = x < 0 ? -1 : 1, u = ax - 0.628, v = y - 1.624;
    if (u * u + v * v > 0.5) return null;
    const G = Math.exp(-(u * u / 0.1764 + v * v / 0.1156)), up = sm(0, 0.2, v), low = sm(0, 0.2, -v);
    const crease = Math.exp(-(u * u / 0.16 + (v - 0.24) * (v - 0.24) / 0.0144));
    const corner = Math.exp(-((u + 0.3) * (u + 0.3) / 0.01 + (v + 0.01) * (v + 0.01) / 0.0144));
    return [sx * 0.05 * f.inner * corner, G * (-0.07 * f.open * up + 0.035 * f.open * low + 0.075 * f.slant * (u / 0.32)) - 0.02 * f.fold * crease, 0.055 * f.fold * crease + 0.02 * f.inner * corner];
  };
})(globalThis.HSC || (globalThis.HSC = {}));
