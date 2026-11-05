// ---------------------------------------------------------------------------------------------
// Android: 12 phenotype groups and 7 adult age bands for the customer generator (people.js reads
// HSC.PHENOTYPES when present; the Playables / YouTube builds do not include this file).
// Weights follow docs/CUSTOMER-VARIETY-PLAN.md: sourced figures where studies exist (greying, balding,
// facial-hair prevalence, hairline), researched estimates elsewhere (texture, eye and skin mixes), to be
// tuned in playtests. Group ids match the head shapes (headshapes.js) and face bases (facegen.js).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  // skin: Monk Skin Tone 1-10 weights (rendered on the game's 10 tones, fair to deep)
  // each pair leans to its darker tone (inside a band, deeper shades are the more common)
  const monk = (a, b, c, d, e) => ({ 1: a * 0.4, 2: a * 0.6, 3: b * 0.4, 4: b * 0.6, 5: c * 0.4, 6: c * 0.6, 7: d * 0.4, 8: d * 0.6, 9: e * 0.4, 10: e * 0.6 });
  // hair texture 1A-4C weights
  const tex = (s) => Object.fromEntries(s.split(' ').map((p) => { const [k, v] = p.split(':'); return [k, +v]; }));
  const DARK = { dbrown: 85, brown: 14, lbrown: 1 };
  const AFRICAN_BEARD = { boxed: 1.3, goatee: 1.4, chinstrap: 1.8, vandyke: 1.2, long: 0.6, walrus: 0.6, stubble: 1.1 };
  const SPARSE_BEARD = { clean: 1.8, stubble: 1.1, full: 0.35, boxed: 0.45, long: 0.3, mutton: 0.3, shenandoah: 0.3, goatee: 1.3, moustache: 1.3, pencil: 1.5, walrus: 0.4 };

  // w: spawn weight (player traffic: Brazil, US, Turkiye, Indonesia, India, Mexico, Peru, Balkans, Portugal)
  // morph: mild face-shape tendency (head shapes and face bases carry most of the phenotype)
  // brow: brow thickness factor; coarse: strand thickness factor; shave: share of styled beards shaved off
  const groups = [
    { id: 'north-european', w: 8, skin: monk(45, 50, 5, 0, 0), under: { pink: 4, neutral: 3, red: 1, olive: 1 },
      tex: tex('1a:25 1b:30 1c:12 2a:15 2b:10 2c:4 3a:3 3b:1'),
      eyes: { dbrown: 3, brown: 12, lbrown: 3, amber: 2, hazel: 12, green: 10, grey: 8, blue: 35, lblue: 15 },
      patchy: 0.08, brow: 0.97, coarse: 1, morph: { noseW: -0.2, noseBridge: 0.35, noseTip: 0.12, lips: -0.15, jaw: 0.1, chin: 0.12, cheek: -0.05, brow: 0.3 } },
    { id: 'mediterranean', w: 9, skin: monk(10, 57, 33, 0, 0), under: { olive: 4, neutral: 3, golden: 1, pink: 1 },
      tex: tex('1a:8 1b:20 1c:15 2a:15 2b:17 2c:12 3a:8 3b:4 3c:1'),
      eyes: { dbrown: 15, brown: 35, lbrown: 6, amber: 4, hazel: 18, green: 8, grey: 3, blue: 9, lblue: 2 },
      patchy: 0.07, brow: 1.06, coarse: 1, morph: { noseW: -0.05, noseBridge: 0.3, noseTip: 0.05, lips: 0, jaw: 0.1, chin: 0.1, cheek: 0, brow: 0.25 } },
    { id: 'mena', w: 10, skin: monk(3, 39, 52, 6, 0), under: { olive: 4, neutral: 3, golden: 2 },
      tex: tex('1a:5 1b:15 1c:15 2a:12 2b:18 2c:15 3a:12 3b:6 3c:2'),
      eyes: { dbrown: 35, brown: 35, lbrown: 5, amber: 3, hazel: 12, green: 5, grey: 1, blue: 3, lblue: 1 },
      patchy: 0.06, brow: 1.12, coarse: 1.12, shave: 0, morph: { noseW: 0.05, noseBridge: 0.4, noseTip: 0.1, lips: 0.05, jaw: 0.1, chin: 0.05, cheek: 0.05, brow: 0.3 } },
    { id: 'west-african', w: 9, skin: monk(0, 0, 1, 36, 63), under: { neutral: 3, red: 2, golden: 1 },
      tex: tex('3c:2 4a:15 4b:38 4c:45'), eyes: DARK,
      patchy: 0.15, brow: 1, coarse: 1, morph: { noseW: 0.5, noseBridge: -0.2, noseTip: -0.08, lips: 0.55, jaw: 0.1, chin: 0, cheek: 0.2, brow: 0.1 } },
    { id: 'east-african', w: 4, skin: monk(0, 0, 5, 52, 43), under: { neutral: 3, red: 2, golden: 1 },
      tex: tex('3b:5 3c:20 4a:35 4b:30 4c:10'), eyes: DARK,
      patchy: 0.15, brow: 1, coarse: 1, morph: { noseW: 0.2, noseBridge: 0.05, noseTip: 0, lips: 0.35, jaw: 0, chin: 0.05, cheek: 0.15, brow: 0.1 } },
    { id: 'east-asian', w: 6, skin: monk(15, 60, 25, 0, 0), under: { golden: 4, neutral: 2, olive: 1 },
      tex: tex('1a:55 1b:30 1c:8 2a:5 2b:2'), eyes: DARK,
      patchy: 0.45, brow: 0.92, coarse: 1.15, shave: 0.45, morph: { noseW: 0.15, noseBridge: -0.5, noseTip: -0.2, lips: 0.1, jaw: 0.2, chin: -0.1, cheek: 0.4, brow: -0.4 } },
    { id: 'southeast-asian', w: 9, skin: monk(0, 18, 67, 15, 0), under: { golden: 4, olive: 2, neutral: 1 },
      tex: tex('1a:35 1b:30 1c:12 2a:12 2b:7 2c:3 3a:1'), eyes: DARK,
      patchy: 0.4, brow: 0.95, coarse: 1.1, shave: 0.4, morph: { noseW: 0.25, noseBridge: -0.4, noseTip: -0.15, lips: 0.2, jaw: 0.1, chin: -0.1, cheek: 0.3, brow: -0.3 } },
    { id: 'south-asian', w: 11, skin: monk(0, 10, 50, 37, 3), under: { golden: 3, olive: 2, neutral: 2 },
      tex: tex('1a:10 1b:20 1c:20 2a:18 2b:15 2c:10 3a:5 3b:2'),
      eyes: { dbrown: 60, brown: 28, lbrown: 3, amber: 2, hazel: 5, green: 1.5, blue: 0.5 },
      patchy: 0.12, brow: 1.12, coarse: 1, morph: { noseW: 0.2, noseBridge: 0.15, noseTip: 0.1, lips: 0.2, jaw: 0, chin: -0.05, cheek: 0.1, brow: 0.1 } },
    { id: 'latino', w: 14, skin: monk(3, 27, 50, 18, 2), under: { olive: 3, golden: 3, neutral: 2, red: 1 },
      tex: tex('1a:18 1b:23 1c:14 2a:12 2b:9 2c:7 3a:5 3b:3 3c:3 4a:3 4b:2 4c:1'),
      eyes: { dbrown: 45, brown: 30, lbrown: 5, amber: 3, hazel: 9, green: 4, grey: 1, blue: 2, lblue: 1 },
      patchy: 0.15, brow: 1.02, coarse: 1.05, morph: {} },
    { id: 'indigenous-american', w: 4, skin: monk(0, 15, 63, 21, 1), under: { golden: 3, red: 2, olive: 2 },
      tex: tex('1a:60 1b:28 1c:10 2a:2'), eyes: DARK,
      patchy: 0.5, brow: 0.95, coarse: 1.15, shave: 0.5, morph: { noseW: 0.1, noseBridge: 0.1, noseTip: 0, lips: 0.05, jaw: 0.15, chin: 0, cheek: 0.35, brow: -0.1 } },
    { id: 'pacific-islander', w: 3, skin: monk(0, 5, 45, 45, 5), under: { golden: 3, neutral: 2, red: 2 },
      tex: tex('1c:10 2a:12 2b:18 2c:20 3a:18 3b:12 3c:7 4a:3'), eyes: DARK,
      patchy: 0.2, brow: 1, coarse: 1.05, morph: { noseW: 0.3, noseBridge: -0.1, noseTip: -0.05, lips: 0.3, jaw: 0.15, chin: 0, cheek: 0.2, brow: 0 } },
    { id: 'mixed', w: 13, skin: monk(5, 25, 35, 25, 10), under: { neutral: 3, olive: 2, golden: 2, red: 1, pink: 1 },
      tex: tex('1a:10 1b:12 1c:10 2a:10 2b:10 2c:10 3a:10 3b:9 3c:8 4a:6 4b:3 4c:2'),
      eyes: { dbrown: 40, brown: 30, lbrown: 5, amber: 3, hazel: 10, green: 5, grey: 2, blue: 4, lblue: 1 },
      patchy: 0.15, brow: 1, coarse: 1, morph: {} },
  ];

  // natural hair colour per group (the game's 12 colour presets); age modifiers as people.js
  const hair = {
    'north-european': { base: { jet: 1, softBlack: 2, vdb: 10, db: 20, mb: 25, lb: 20, dblonde: 10, gblonde: 5, lblonde: 2, auburn: 2, ginger: 3 },
      young: { lb: 1.1, dblonde: 1.3, gblonde: 1.4, lblonde: 1.5 }, old: { dblonde: 0.75, gblonde: 0.6, lblonde: 0.5, ginger: 0.9 } },
    mediterranean: { base: { jet: 10, softBlack: 15, vdb: 25, db: 20, mb: 18, lb: 7, dblonde: 3, gblonde: 1, auburn: 0.5, ginger: 0.5 } },
    mena: { base: { jet: 30, softBlack: 25, vdb: 25, db: 10, mb: 7, lb: 2, dblonde: 0.5, auburn: 0.5 } },
    'west-african': { base: { jet: 70, softBlack: 28, vdb: 2 } },
    'east-african': { base: { jet: 68, softBlack: 29, vdb: 3 } },
    'east-asian': { base: { jet: 55, softBlack: 40, vdb: 5 } },
    'southeast-asian': { base: { jet: 55, softBlack: 38, vdb: 7 } },
    'south-asian': { base: { jet: 55, softBlack: 35, vdb: 9, db: 1 } },
    latino: { base: { jet: 25, softBlack: 25, vdb: 25, db: 13, mb: 8, lb: 3, dblonde: 1 } },
    'indigenous-american': { base: { jet: 65, softBlack: 33, vdb: 2 } },
    'pacific-islander': { base: { jet: 55, softBlack: 35, vdb: 8, db: 2 } },
    mixed: { base: { jet: 20, softBlack: 20, vdb: 20, db: 15, mb: 13, lb: 7, dblonde: 3, gblonde: 1, ginger: 1 } },
  };

  // greying: onset (years), spread, span to full grey, share with premature grey before 30
  const grey = {
    'north-european': { onset: 34, sd: 6, span: 44, premature: 0.06 }, mediterranean: { onset: 34, sd: 6, span: 44, premature: 0.06 },
    mena: { onset: 36, sd: 6, span: 45, premature: 0.08 }, 'south-asian': { onset: 35, sd: 7, span: 45, premature: 0.3 },
    latino: { onset: 36, sd: 6, span: 46, premature: 0.06 }, 'east-asian': { onset: 38, sd: 6, span: 47, premature: 0.06 },
    'southeast-asian': { onset: 38, sd: 6, span: 47, premature: 0.06 }, 'west-african': { onset: 44, sd: 7, span: 50, premature: 0.03 },
    'east-african': { onset: 44, sd: 7, span: 50, premature: 0.03 }, 'indigenous-american': { onset: 44, sd: 7, span: 50, premature: 0.03 },
    'pacific-islander': { onset: 44, sd: 7, span: 50, premature: 0.03 }, mixed: { onset: 38, sd: 7, span: 47, premature: 0.06 },
  };

  // pattern baldness: prevalence multiplier and loss types per group
  const EURO = { norwood: 85, 'norwood-a': 5, crown: 7, diffuse: 3 }, ASIAN = { norwood: 50, 'norwood-a': 5, crown: 25, diffuse: 20 };
  const bald = {
    'north-european': { prevalence: 1, types: EURO }, mediterranean: { prevalence: 1, types: EURO }, mena: { prevalence: 0.95, types: EURO },
    'west-african': { prevalence: 0.6, types: { norwood: 55, 'norwood-a': 5, crown: 30, diffuse: 10 } },
    'east-african': { prevalence: 0.6, types: { norwood: 55, 'norwood-a': 5, crown: 30, diffuse: 10 } },
    'east-asian': { prevalence: 0.5, types: ASIAN }, 'southeast-asian': { prevalence: 0.5, types: ASIAN },
    'south-asian': { prevalence: 0.9, types: { norwood: 80, 'norwood-a': 5, crown: 10, diffuse: 5 } },
    latino: { prevalence: 0.85, types: EURO }, 'indigenous-american': { prevalence: 0.45, types: ASIAN },
    'pacific-islander': { prevalence: 0.75, types: { norwood: 75, 'norwood-a': 5, crown: 12, diffuse: 8 } },
    mixed: { prevalence: 0.8, types: { norwood: 75, 'norwood-a': 5, crown: 12, diffuse: 8 } },
  };

  // facial-hair style multipliers per group (on people.js's age odds)
  const beardMult = {
    'north-european': {}, mediterranean: { full: 1.2, boxed: 1.2 },
    mena: { full: 1.3, boxed: 1.3, moustache: 2, walrus: 1.5, horseshoe: 1.3 },
    'west-african': AFRICAN_BEARD, 'east-african': AFRICAN_BEARD,
    'east-asian': SPARSE_BEARD, 'southeast-asian': Object.assign({}, SPARSE_BEARD, { goatee: 1.4, moustache: 1.4 }),
    'south-asian': { moustache: 2.5, walrus: 1.5, pencil: 1.5, full: 1.3, long: 2.5, horseshoe: 1.2 },
    latino: { moustache: 1.5, horseshoe: 1.4, goatee: 1.3, vandyke: 1.2 },
    'indigenous-american': Object.assign({}, SPARSE_BEARD, { clean: 2 }),
    'pacific-islander': { full: 1.1, goatee: 1.2 }, mixed: {},
  };

  // 7 adult age bands (barbershop-weighted); the saved coarse age (young 18-30, middle 31-55, old 56+)
  // still drives progression, the band drives appearance
  const ages = [
    { id: '18-24', years: [18, 24], w: 20 }, { id: '25-34', years: [25, 34], w: 26 }, { id: '35-44', years: [35, 44], w: 20 },
    { id: '45-54', years: [45, 54], w: 15 }, { id: '55-64', years: [55, 64], w: 10 }, { id: '65-74', years: [65, 74], w: 6 },
    { id: '75+', years: [75, 84], w: 3 },
  ];
  // Norwood stage odds per band for White men (III+: ~16% at 18-29, ~30% 30s, 53% 40s, ~80% 70+), times the
  // group's prevalence in people.js
  const norwood = {
    '18-24': { 1: 62, 2: 28, 3: 6, '3v': 2, 4: 1.5, 5: 0.4, 6: 0.1, 7: 0 },
    '25-34': { 1: 42, 2: 36, 3: 11, '3v': 5, 4: 4, 5: 1.5, 6: 0.4, 7: 0.1 },
    '35-44': { 1: 30, 2: 35, 3: 13, '3v': 8, 4: 7, 5: 4, 6: 2, 7: 1 },
    '45-54': { 1: 22, 2: 27, 3: 13, '3v': 10, 4: 10, 5: 8, 6: 6, 7: 4 },
    '55-64': { 1: 18, 2: 24, 3: 12, '3v': 10, 4: 11, 5: 10, 6: 8, 7: 7 },
    '65-74': { 1: 14, 2: 20, 3: 11, '3v': 9, 4: 12, 5: 12, 6: 11, 7: 11 },
    '75+': { 1: 10, 2: 12, 3: 10, '3v': 8, 4: 12, 5: 14, 6: 16, 7: 18 },
  };
  // arcus (grey ring at the iris edge) by band
  const arcus = { '18-24': 0, '25-34': 0, '35-44': 0.05, '45-54': 0.25, '55-64': 0.55, '65-74': 0.8, '75+': 0.85 };

  // the variety director's decks (meta.js): coarse ages in their real shares (~36 / 45 / 19%), and facial
  // hair by coarse age (clean-shaven ~35% young and middle-aged, ~50% over 55)
  const decks = {
    age: ['young', 'young', 'young', 'young', 'middle', 'middle', 'middle', 'middle', 'middle', 'old', 'old'],
    beardyoung: ['clean', 'clean', 'clean', 'clean', 'clean', 'clean', 'clean', 'stubble', 'stubble', 'stubble', 'stubble', 'stubble', 'stubble', 'style', 'style', 'style', 'style', 'style', 'style', 'style'],
    beardmiddle: ['clean', 'clean', 'clean', 'clean', 'clean', 'clean', 'clean', 'stubble', 'stubble', 'stubble', 'stubble', 'style', 'style', 'style', 'style', 'style', 'style', 'style', 'style', 'style'],
    beardold: ['clean', 'clean', 'clean', 'clean', 'clean', 'clean', 'clean', 'clean', 'clean', 'clean', 'stubble', 'stubble', 'style', 'style', 'style', 'style', 'style', 'style', 'style', 'style'],
  };

  // hair textures 1A-4C: strand settings for the existing hair shader (no new hair model)
  //   A: hang, forward, lift, top lift   B: spread, sag, wave, wave frequency
  //   C: coil radius (x length), coil turns, shrinkage (length kept), strand thickness
  const hairTypes = {
    '1a': { A: [0.24, 0.58, 0.54, 0.48], B: [0.14, 0.12, 0, 1], C: [0, 0, 1, 0.95] },
    '1b': { A: [0.22, 0.56, 0.56, 0.5], B: [0.16, 0.1, 0.02, 1], C: [0, 0, 1, 1] },
    '1c': { A: [0.2, 0.52, 0.6, 0.55], B: [0.18, 0.08, 0.04, 1.2], C: [0, 0, 1, 1.12] },
    '2a': { A: [0.18, 0.42, 0.62, 0.6], B: [0.2, 0.08, 0.065, 1.4], C: [0, 0, 0.95, 1] },
    '2b': { A: [0.17, 0.4, 0.63, 0.61], B: [0.21, 0.08, 0.095, 1.7], C: [0, 0, 0.92, 1.05] },
    '2c': { A: [0.16, 0.36, 0.66, 0.63], B: [0.23, 0.07, 0.12, 2.0], C: [0, 0, 0.88, 1.1] },
    '3a': { A: [0.11, 0.22, 0.73, 0.78], B: [0.27, 0.05, 0, 1], C: [0.12, 1.3, 0.76, 1.1] },
    '3b': { A: [0.1, 0.2, 0.75, 0.8], B: [0.28, 0.04, 0, 1], C: [0.13, 2.1, 0.67, 1.15] },
    '3c': { A: [0.08, 0.15, 0.8, 0.85], B: [0.31, 0.03, 0, 1], C: [0.16, 2.7, 0.6, 1.2] },
    '4a': { A: [0.04, 0.07, 0.88, 0.93], B: [0.34, 0, 0, 1], C: [0.16, 3.1, 0.52, 1.3] },
    '4b': { A: [0.03, 0.05, 0.9, 0.95], B: [0.38, 0, 0, 1], C: [0.2, 4.2, 0.46, 1.35] },
    '4c': { A: [0.02, 0.04, 0.92, 0.96], B: [0.42, 0, 0, 1], C: [0.24, 5.5, 0.42, 1.4] },
  };

  // ---- Phase B: per-customer features derived from seed, group and age (never saved) ----
  // brows: shape (straight 40 / soft angle 35 / arched 15 / rising 10), thickness level, unibrow;
  // freckles; dark facial papules (DPN) on deep skin from 40; hairline: mature (from ~25), linear / M /
  // round shape (46 / 43 / 11), widow's peak
  const FEAT = {
    'north-european': { thick: 0.2, uni: 0.04, freckle: 0.3, peak: 0.3 },
    mediterranean: { thick: 0.35, uni: 0.07, freckle: 0.05, peak: 0.32 },
    mena: { thick: 0.45, uni: 0.13, freckle: 0.015, peak: 0.35 },
    'west-african': { thick: 0.25, uni: 0.03, freckle: 0.005, peak: 0.15 },
    'east-african': { thick: 0.25, uni: 0.03, freckle: 0.005, peak: 0.15 },
    'east-asian': { thick: 0.15, uni: 0.015, freckle: 0.01, peak: 0.33, straight: 1.6 },
    'southeast-asian': { thick: 0.18, uni: 0.02, freckle: 0.01, peak: 0.3, straight: 1.4 },
    'south-asian': { thick: 0.45, uni: 0.12, freckle: 0.01, peak: 0.46 },
    latino: { thick: 0.3, uni: 0.05, freckle: 0.02, peak: 0.3 },
    'indigenous-american': { thick: 0.18, uni: 0.015, freckle: 0.01, peak: 0.25, straight: 1.4 },
    'pacific-islander': { thick: 0.25, uni: 0.03, freckle: 0.01, peak: 0.25 },
    mixed: { thick: 0.28, uni: 0.05, freckle: 0.03, peak: 0.3 },
  };
  const LEGACY = { white: 'north-european', black: 'west-african', 'east-asian': 'east-asian', 'south-asian': 'south-asian' };
  const REDS = [9, 10, 12, 16]; // auburn, ginger, strawberry blond, copper
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const featCache = new Map();
  HSC.featuresOf = function (person) {
    if (!person || !HSC.rng) return null;
    const key = person.seed + ':' + person.years + ':' + person.heritage + ':' + person.hair.colour + ':' + person.skin.tone;
    if (featCache.has(key)) return featCache.get(key);
    const f = FEAT[person.heritage] || FEAT[LEGACY[person.heritage]] || FEAT.mixed, y = person.years;
    const R = HSC.rng(((person.seed >>> 0) ^ 0xb40f1ce5) >>> 0 || 1);
    const shape = R.pick({ straight: 40 * (f.straight || 1), soft: 35, arched: 15, rising: 10 });
    const arch = { straight: 0.025, soft: 0.08, arched: 0.13, rising: 0.045 }[shape] + R.range(-0.01, 0.01);
    const tilt = shape === 'rising' ? R.range(0.05, 0.08) : R.range(-0.01, 0.015);
    const lv = R.next(), thick = (lv < f.thick ? 1.22 : lv > 0.8 ? 0.84 : 1) * (1 + 0.15 * sm(45, 70, y));
    // the owner asked for no unibrows (5 November 2026); the roll is kept so every other feature stays the same
    const uniRoll = R.next() < f.uni ? R.range(0.55, 1) : 0, unibrow = 0 * uniRoll;
    const tail = 0.45 * sm(58, 80, y);
    const freckles = R.next() < (REDS.includes(person.hair.colour) ? 0.75 : f.freckle) ? R.range(0.5, 1) * (1 - 0.4 * sm(50, 75, y)) : 0;
    const dpn = person.skin.tone >= 6.5 && R.next() < 0.6 * sm(40, 65, y) ? R.range(0.4, 1) : 0;
    const hl = R.pick({ linear: 46, M: 43, round: 11 });
    let mature = y < 25 ? 0 : R.range(0.012, 0.03) * sm(24, 34, y);
    const mDepth = hl === 'M' ? 0.015 + R.range(0.03, 0.07) * sm(20, 35, y) : 0;
    const round = hl === 'round' ? R.range(0.015, 0.03) : 0;
    const peak = R.next() < f.peak ? R.range(0.5, 1) : 0;
    if (peak && mature < 0.025) mature = 0.025; // a peak shows as a V against a set-back line
    const out = { brow: [arch, tilt, thick, unibrow], tail, skin: [freckles, dpn, 0, 0], hairline: [mature, mDepth, round, peak], shape, hl };
    if (featCache.size > 64) featCache.delete(featCache.keys().next().value);
    featCache.set(key, out);
    return out;
  };

  // new beard styles join the age odds (people.js BEARD_BY_AGE), and stubble comes in three lengths
  const beardByAge = {
    young: { balbo: 2, anchor: 1.5, circle: 3, soulpatch: 1, handlebar: 0.3, ducktail: 1, garibaldi: 0.5 },
    middle: { balbo: 3, anchor: 2, circle: 3.5, soulpatch: 0.5, handlebar: 1, ducktail: 2, garibaldi: 1.5 },
    old: { balbo: 1.5, anchor: 1, circle: 2, soulpatch: 0.2, handlebar: 1.5, ducktail: 1.5, garibaldi: 1.5 },
  };
  const stubble = { stubble1: 30, stubble: 45, stubble5: 25 };

  // hair colours: the game's 12 presets plus strawberry blond, ash brown, golden brown, ash blond, copper and
  // blue-black (tints for the engine's hair shader; HAIR_DARK in people.js holds their skin-level tint)
  const tints = [
    [0.3, 0.32, 0.38], [0.48, 0.48, 0.52], [0.72, 0.68, 0.64], [1, 1, 1], [1.55, 1.36, 1.16], [2.3, 1.95, 1.55],
    [3.1, 2.65, 1.95], [4, 3.35, 2.05], [5.1, 4.45, 3.1], [2.4, 1.25, 0.8], [4, 1.8, 0.75], [2.1, 3.15, 5.2],
    [4.4, 2.6, 1.35], [1.4, 1.36, 1.32], [2.5, 1.9, 1.2], [3, 2.85, 2.5], [3.2, 1.55, 0.8], [0.26, 0.3, 0.42],
  ];
  const sheen = [0.94, 0.96, 0.98, 1, 0.98, 0.97, 0.96, 0.95, 0.94, 0.96, 0.94, 0.92, 0.95, 0.97, 0.97, 0.95, 0.95, 0.93];
  HSC.HAIR_TINTS = tints;
  HSC.HAIR_SHEEN = sheen;
  // the new colours in the groups that have them (moved from their nearest existing colour)
  const add = (g, w) => Object.assign(hair[g].base, w);
  add('north-european', { strawberry: 2, ashBrown: 6, goldenBrown: 5, ashBlond: 4, copper: 1 });
  add('mediterranean', { ashBrown: 3, goldenBrown: 3, copper: 0.3 });
  add('mena', { ashBrown: 1, goldenBrown: 2 });
  add('east-asian', { blueBlack: 25 });
  add('southeast-asian', { blueBlack: 12 });
  add('indigenous-american', { blueBlack: 15 });
  add('latino', { goldenBrown: 3, ashBrown: 2 });
  add('mixed', { goldenBrown: 3, ashBrown: 2, strawberry: 0.5, copper: 0.5 });

  // ---- Phase C: walk-in cut families (patch16) by coarse age (barber trend estimates), and the director's deck ----
  const families = {
    young: { fade: 30, classic: 6, hawk: 7, undercut: 6 },
    middle: { fade: 18, classic: 16, hawk: 2, undercut: 3 },
    old: { fade: 6, classic: 26, hawk: 0, undercut: 0 },
  };
  decks.fam = ['long', 'long', 'long', 'long', 'crop', 'crop', 'crop', 'crop', 'fade', 'fade', 'fade', 'fade', 'fade', 'classic', 'classic', 'classic',
    'buzz', 'buzz', 'tight', 'full', 'full', 'shaved', 'shaved', 'hawk', 'undercut'];

  HSC.PHENOTYPES = { groups, hair, grey, bald, beardMult, ages, norwood, arcus, decks, hairTypes, beardByAge, stubble, families,
    areata: { young: 0.006, middle: 0.004, old: 0.003 }, beardLead: { ahead: 40, level: 40, behind: 20 },
    bandOf: (years) => (ages.find((a) => years <= a.years[1]) || ages[ages.length - 1]).id };
})(globalThis.HSC || (globalThis.HSC = {}));
