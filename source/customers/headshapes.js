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
    const groups = GROUPS_BY_HERITAGE[her] || GROUPS_BY_HERITAGE.white;
    let h = (person.seed >>> 0) ^ 0x9e3779b9;
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
    return ids.indexOf(groups[h % 3] + '/' + OUTLINES[(h >>> 8) % 3]);
  };
})(globalThis.HSC || (globalThis.HSC = {}));
