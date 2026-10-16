// ---------------------------------------------------------------------------------------------
// Customer generator. Every customer is a plain, serialisable record derived deterministically from
// a seed, so a saved session always brings back the same person.
//
// Heritage groups only steer *correlated* traits (skin tone range, hair texture, natural hair colour,
// eye colour, beard density, how common pattern baldness is, and small average face-shape tendencies).
// Individual variation is always larger than the group tendency, and face-shape offsets are kept
// subtle so nobody is drawn as a caricature. Group ids are internal and never shown to the player.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';

  const PERSON_VERSION = 1;

  // small deterministic PRNG (mulberry32)
  function rng(seed) {
    // scramble the seed first (murmur3 finaliser) so nearby seeds give unrelated people
    let a = seed >>> 0;
    a = Math.imul(a ^ (a >>> 16), 0x85ebca6b);
    a = Math.imul(a ^ (a >>> 13), 0xc2b2ae35);
    a = (a ^ (a >>> 16)) >>> 0 || 1;
    const next = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
      next,
      range: (lo, hi) => lo + (hi - lo) * next(),
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      // approximately normal (sum of uniforms)
      gauss: (sd = 1) => (next() + next() + next() + next() - 2) * 1.732 * sd,
      pick(weights) {
        const entries = Object.entries(weights).filter(([, w]) => w > 0);
        let total = 0;
        for (const [, w] of entries) total += w;
        let x = next() * total;
        for (const [k, w] of entries) {
          if ((x -= w) < 0) return k;
        }
        return entries[entries.length - 1][0];
      },
    };
  }
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const smooth = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  // ---- skin: 10 tones from very fair to very deep, linear albedo used directly by the skin shader ----
  const SKIN_TONES = [
    [0.7, 0.425, 0.345],
    [0.66, 0.385, 0.3],
    [0.615, 0.37, 0.27],
    [0.56, 0.345, 0.235],
    [0.485, 0.298, 0.19],
    [0.4, 0.24, 0.15],
    [0.31, 0.182, 0.112],
    [0.225, 0.128, 0.082],
    [0.155, 0.088, 0.058],
    [0.105, 0.06, 0.042],
  ];
  const UNDERTONES = {
    pink: [1.03, 0.97, 1.0],
    neutral: [1, 1, 1],
    olive: [0.98, 1.02, 0.94],
    golden: [1.03, 1.0, 0.85],
    red: [1.04, 0.96, 0.95],
  };

  // ---- hair colour: index into the game's 12 colour presets ----
  const HAIR = {
    jet: 0, softBlack: 1, vdb: 2, db: 3, mb: 4, lb: 5, dblonde: 6, gblonde: 7, lblonde: 8, auburn: 9, ginger: 10, silver: 11,
  };
  // stubble / brow tint per preset (dark-end colour of the hair, linear)
  const HAIR_DARK = [
    [0.012, 0.011, 0.012], [0.018, 0.016, 0.016], [0.026, 0.019, 0.014], [0.035, 0.024, 0.018], [0.05, 0.034, 0.022],
    [0.075, 0.052, 0.033], [0.1, 0.075, 0.045], [0.14, 0.1, 0.05], [0.2, 0.16, 0.1], [0.08, 0.035, 0.018],
    [0.13, 0.05, 0.02], [0.18, 0.18, 0.18],
  ];

  const EYES = {
    blue: ['#a8c4d6', '#5d90b3', '#34688d', '#1d3c55'],
    grey: ['#c4cdd2', '#8b9aa3', '#5f6e78', '#36424a'],
    green: ['#b5c49a', '#6f8e55', '#4d6b3a', '#2c3f22'],
    hazel: ['#c9b27a', '#8d7a45', '#5f5a33', '#3a331c'],
    lbrown: ['#b38a5a', '#7d5631', '#5a3b1f', '#33200f'],
    brown: ['#8a6038', '#5a3a1e', '#3d2612', '#22150a'],
    dbrown: ['#5a3c22', '#3a2412', '#26170b', '#140c06'],
  };

  // morph keys, each in [-1, 1]; see faces.js for what they do
  const MORPHS = ['noseW', 'noseBridge', 'noseTip', 'lips', 'jaw', 'chin', 'cheek', 'brow'];

  // The four customer classes. Skin tone range, hair textures (with their curl sub-types), natural hair and
  // eye colours, beard growth and how common pattern baldness is all follow the class; age then decides
  // greying and baldness stage.
  const HERITAGE = [
    { id: 'white', w: 25, skin: [0, 3.2], under: { pink: 3, neutral: 3, olive: 2, red: 1 },
      tex: { straight: 55, wavy: 30, curly: 15 },
      hair: { jet: 0.5, softBlack: 2, vdb: 4, db: 6, mb: 5, lb: 4, dblonde: 3, gblonde: 2, lblonde: 1.2, auburn: 1, ginger: 1 },
      eyes: { blue: 4, grey: 1, green: 2, hazel: 2.5, lbrown: 1.5, brown: 3.5 }, greyOnset: 34, bald: 1, beard: 1.05, patchy: 0.08,
      morph: { noseW: -0.2, noseBridge: 0.35, noseTip: 0.12, lips: -0.15, jaw: 0.1, chin: 0.12, cheek: -0.05, brow: 0.3 } },
    { id: 'black', w: 25, skin: [5.6, 9.4], under: { neutral: 3, golden: 1, red: 1 },
      tex: { coily: 85, curly: 15 },
      hair: { jet: 8, softBlack: 3 },
      eyes: { dbrown: 8, brown: 2 }, greyOnset: 40, bald: 0.7, beard: 0.9, patchy: 0.15,
      morph: { noseW: 0.5, noseBridge: -0.2, noseTip: -0.08, lips: 0.55, jaw: 0.1, chin: 0, cheek: 0.2, brow: 0.1 } },
    { id: 'east-asian', w: 25, skin: [1, 3.8], under: { golden: 4, neutral: 1 },
      tex: { straight: 90, wavy: 10 },
      hair: { jet: 7, softBlack: 4, vdb: 1 },
      eyes: { dbrown: 7, brown: 3 }, greyOnset: 37, bald: 0.6, beard: 0.45, patchy: 0.45,
      morph: { noseW: 0.15, noseBridge: -0.5, noseTip: -0.2, lips: 0.1, jaw: 0.2, chin: -0.1, cheek: 0.4, brow: -0.4 } },
    { id: 'south-asian', w: 25, skin: [3.6, 7.2], under: { golden: 3, neutral: 2 },
      tex: { straight: 40, wavy: 50, curly: 10 },
      hair: { jet: 6, softBlack: 4, vdb: 2 },
      eyes: { brown: 6, dbrown: 4, hazel: 0.6, lbrown: 0.6, green: 0.2 }, greyOnset: 33, bald: 0.9, beard: 1.1, patchy: 0.12,
      morph: { noseW: 0.2, noseBridge: 0.15, noseTip: 0.1, lips: 0.2, jaw: 0, chin: -0.05, cheek: 0.1, brow: 0.1 } },
  ];

  const AGE_BANDS = {
    young: { w: 40, years: [18, 30] },
    middle: { w: 35, years: [31, 55] },
    old: { w: 25, years: [56, 84] },
  };

  // ---- natural hair colour by class, adjusted by age --------------------------------------------
  // White: UK Biobank (white British adults): light brown 41%, dark brown 37%, blond 11.5%, red 4.6%,
  // black 4.2%. Blond darkens through childhood into the 20s, so it is a little more common among young
  // men and less among older ones. Black, East Asian and South Asian hair is almost always black /
  // soft black, with a little very dark brown (more often in South Asians).
  const HAIR_BY_CLASS = {
    white: {
      base: { jet: 1, softBlack: 3.2, vdb: 12, db: 25, mb: 24, lb: 17, dblonde: 6.5, gblonde: 3, lblonde: 1.5, auburn: 2, ginger: 2.6 },
      young: { lb: 1.1, dblonde: 1.3, gblonde: 1.4, lblonde: 1.5 },
      old: { dblonde: 0.75, gblonde: 0.6, lblonde: 0.5, ginger: 0.9 },
    },
    black: { base: { jet: 70, softBlack: 28, vdb: 2 } },
    'east-asian': { base: { jet: 55, softBlack: 40, vdb: 5 } },
    'south-asian': { base: { jet: 55, softBlack: 35, vdb: 9, db: 1 } },
  };

  // ---- greying by class -------------------------------------------------------------------------
  // Average onset: mid-30s White, late 30s East Asian, mid-40s Black; at 50 only 6-23% of people are
  // half grey, so it builds slowly. Premature greying (before ~25) is reported in roughly a quarter or
  // more of young South Asian adults. Beards usually grey ahead of the scalp, often chin first.
  const GREY_BY_CLASS = {
    white: { onset: 34, sd: 8, span: 44, premature: 0.06 },
    black: { onset: 44, sd: 9, span: 50, premature: 0.03 },
    'east-asian': { onset: 38, sd: 8, span: 47, premature: 0.06 },
    'south-asian': { onset: 34, sd: 8, span: 45, premature: 0.3 },
  };
  const GREY_PATTERNS = { temples: 45, even: 30, front: 12, crown: 13 };
  const GREY_TONES = { silver: 45, pewter: 30, white: 25 }; // how the unpigmented hair reads
  const BEARD_GREY_PATTERNS = { chin: 50, even: 35, sides: 15 };

  // ---- hair loss by class -----------------------------------------------------------------------
  // Pattern baldness is most common in White men (and very common in Indian population studies), about
  // a third as common in East Asian men (14-20% vs ~50%) and thought to be about a third lower in Black
  // men. East Asian men show relatively more crown / diffuse loss and less frontal recession; in Black
  // men crown-first loss (including scarring crown alopecia) is relatively common.
  const NORWOOD = {
    young: { 1: 52, 2: 28, 3: 11, '3v': 4, 4: 3, 5: 1.5, 6: 0.4, 7: 0.1 },
    middle: { 1: 24, 2: 22, 3: 15, '3v': 10, 4: 11, 5: 8, 6: 6, 7: 4 },
    old: { 1: 12, 2: 13, 3: 12, '3v': 10, 4: 12, 5: 13, 6: 14, 7: 14 },
  };
  const BALD_BY_CLASS = {
    white: { prevalence: 1, types: { norwood: 85, 'norwood-a': 5, crown: 7, diffuse: 3 } },
    'south-asian': { prevalence: 1, types: { norwood: 80, 'norwood-a': 5, crown: 10, diffuse: 5 } },
    'east-asian': { prevalence: 0.45, types: { norwood: 50, 'norwood-a': 5, crown: 25, diffuse: 20 } },
    black: { prevalence: 0.65, types: { norwood: 55, 'norwood-a': 5, crown: 30, diffuse: 10 } },
  };
  // alopecia areata: round smooth patches, any class, most often in young men; sometimes in the beard
  const AREATA_BY_AGE = { young: 0.03, middle: 0.015, old: 0.01 };
  // [front recession, temple recession, crown radius, bridge loss, horseshoe (fringe drop)] in radians-ish
  const NORWOOD_SHAPE = {
    1: [0, 0, 0, 0, 0],
    2: [0.02, 0.1, 0, 0, 0],
    3: [0.05, 0.2, 0, 0, 0],
    '3v': [0.05, 0.2, 0.17, 0, 0],
    4: [0.14, 0.27, 0.23, 0, 0],
    5: [0.26, 0.34, 0.3, 0.5, 0],
    6: [0.46, 0.42, 0.36, 1, 0],
    7: [0.62, 0.5, 0.44, 1, 0.3],
  };
  const STAGE_LEVEL = { 1: 0, 2: 1, 3: 2, '3v': 2.5, 4: 3, 5: 4, 6: 5, 7: 6 };
  // the baldness shape for any hair-loss type: [front, temple, crown, bridge, fringe, diffuse]
  function baldShape(b) {
    const s = NORWOOD_SHAPE[b.norwood] || NORWOOD_SHAPE[1];
    const lv = STAGE_LEVEL[b.norwood] || 0;
    const k = 0.85 + 0.3 * (b.edge || 0);
    switch (b.type) {
      case 'norwood-a': // the hairline moves straight back, no M-shaped temples
        return [(s[0] * 1.2 + s[1] * 0.55) * k, 0.02, s[2] * 0.6 * k, s[3], s[4], b.diffuse || 0];
      case 'crown': // vertex loss spreading outward from the crown, hairline kept
        return [0, 0.02 * lv, (0.08 + 0.065 * lv) * k, 0, 0, b.diffuse || 0];
      case 'diffuse': // thinning over the whole top, frontal hairline kept
        return [0, 0.03 * lv, 0.04 * lv, 0, 0, Math.min(0.8, 0.18 + 0.1 * lv + (b.diffuse || 0))];
      default:
        return [s[0] * k, s[1] * k, s[2] * k, s[3], s[4], b.diffuse || 0];
    }
  }

  // ---- facial hair --------------------------------------------------------------------------------
  // regions and lengths (mm); flags shape special styles (see faces.js beardStart)
  const BEARD_STYLES = {
    clean: {},
    stubble: { moustache: [0.8, 2], chin: [0.8, 2], cheeks: [0.8, 2], neck: [0.5, 1.5], jaw: [0.8, 2] },
    moustache: { moustache: [8, 16] }, // chevron
    pencil: { moustache: [2, 4], pencil: true },
    walrus: { moustache: [20, 30] },
    horseshoe: { moustache: [10, 16], horseshoe: true },
    goatee: { moustache: [6, 12], chin: [8, 16] },
    vandyke: { moustache: [8, 14], chin: [10, 20], chinOnly: true },
    chinstrap: { jaw: [4, 8], chin: [4, 8] },
    shenandoah: { chin: [13, 25], cheeks: [10, 16], jaw: [13, 22], neck: [8, 13] }, // full beard, no moustache
    boxed: { moustache: [6, 10], chin: [8, 13], cheeks: [6, 10], jaw: [8, 13], neck: [3, 6] },
    full: { moustache: [10, 16], chin: [13, 22], cheeks: [10, 16], jaw: [13, 22], neck: [8, 13] },
    long: { moustache: [13, 20], chin: [30, 50], cheeks: [16, 25], jaw: [25, 40], neck: [16, 25] },
    mutton: { cheeks: [10, 16], jaw: [8, 13] },
  };
  // Baseline by age (UK YouGov): ~46% clean-shaven; beard + moustache 34%, stubble 13%, beard only 4%,
  // moustache only 2%. Young men lean to stubble, middle-aged men to beards, most men over 60 shave,
  // and moustache-only peaks at 40-59.
  const BEARD_BY_AGE = {
    young: { clean: 33, stubble: 26, boxed: 13, full: 9, goatee: 6, chinstrap: 3, vandyke: 2, moustache: 1.5, pencil: 0.5, shenandoah: 1.5, long: 1, horseshoe: 0.3 },
    middle: { clean: 40, stubble: 14, boxed: 12, full: 11, goatee: 6, vandyke: 3, moustache: 4, pencil: 1, walrus: 1, horseshoe: 1, shenandoah: 2.5, long: 2, mutton: 1, chinstrap: 1.5 },
    old: { clean: 60, stubble: 5, full: 7, boxed: 4, long: 3, moustache: 9, walrus: 3, pencil: 1, horseshoe: 1, goatee: 3, shenandoah: 2.5, mutton: 1.5 },
  };
  // class leanings (weak evidence; kept mild): lighter, patchier beard growth and more shaving among
  // East Asian men; moustaches and long full beards more common among South Asian men; short boxed
  // beards, goatees and chinstraps more common among Black men.
  const BEARD_CLASS_MULT = {
    white: {},
    'east-asian': { clean: 1.8, stubble: 1.1, full: 0.35, boxed: 0.45, long: 0.3, mutton: 0.3, shenandoah: 0.3, goatee: 1.3, moustache: 1.3, pencil: 1.5, walrus: 0.4 },
    'south-asian': { moustache: 2.5, walrus: 1.5, pencil: 1.5, full: 1.3, long: 2.5, horseshoe: 1.2 },
    black: { boxed: 1.3, goatee: 1.4, chinstrap: 1.8, vandyke: 1.2, long: 0.6, walrus: 0.6, stubble: 1.1 },
  };

  function makePerson(seed, opts = {}) {
    const R = rng(seed);
    const weights = {};
    HERITAGE.forEach((h, i) => (weights[i] = h.w));
    const her = HERITAGE[opts.heritage != null ? opts.heritage : +R.pick(weights)];
    const cls = her.id;

    const ageBand = opts.age || R.pick(Object.fromEntries(Object.entries(AGE_BANDS).map(([k, v]) => [k, v.w])));
    const [y0, y1] = AGE_BANDS[ageBand].years;
    const years = R.int(y0, y1);
    const age01 = clamp((years - 18) / (80 - 18), 0, 1);

    const skinT = R.range(her.skin[0], her.skin[1]);
    const under = R.pick(her.under);
    const texture = opts.texture || R.pick(her.tex);
    // curl tightness inside the texture family (e.g. 3a..3c, 4a..4c)
    let curl = R.next();
    if (cls === 'black' && texture === 'curly') curl = 0.4 + 0.6 * curl; // 3b-3c
    if (cls === 'east-asian' && texture === 'wavy') curl *= 0.6; // 2a-2b

    // natural hair colour
    const hc = HAIR_BY_CLASS[cls] || HAIR_BY_CLASS.white;
    const hw = Object.assign({}, hc.base);
    for (const [k, m] of Object.entries(hc[ageBand] || {})) if (hw[k]) hw[k] *= m;
    const hairColour = opts.hairColour != null ? opts.hairColour : HAIR[R.pick(hw)];

    // greying
    const gc = GREY_BY_CLASS[cls] || GREY_BY_CLASS.white;
    const onset = gc.onset + R.gauss(gc.sd);
    let grey = Math.min(0.97, Math.pow(clamp((years - onset) / gc.span, 0, 1), 1.1));
    // premature: a scattering of grey before ~30
    if (years <= 30 && R.next() < gc.premature) grey = Math.max(grey, R.range(0.02, 0.1));
    if (opts.grey != null) grey = opts.grey;
    const greyPattern = opts.greyPattern || R.pick(GREY_PATTERNS);
    const greyTone = R.pick(Object.assign({}, GREY_TONES, { white: GREY_TONES.white * (0.6 + age01) }));
    // the beard usually greys ahead of the scalp, sometimes level with it, occasionally behind
    const lead = R.pick({ ahead: 70, level: 20, behind: 10 });
    let beardGrey = lead === 'ahead' ? (grey > 0.005 || years > onset - 3 ? Math.min(1, grey * 1.3 + 0.05) : 0) : lead === 'level' ? grey : grey * 0.7;
    if (opts.beardGrey != null) beardGrey = opts.beardGrey;
    const beardGreyPattern = R.pick(BEARD_GREY_PATTERNS);

    // hair loss
    const bc = BALD_BY_CLASS[cls] || BALD_BY_CLASS.white;
    const nwTable = Object.assign({}, NORWOOD[ageBand]);
    for (const k of Object.keys(nwTable)) if (k !== '1') nwTable[k] *= bc.prevalence;
    // opts.noLoss: a full head of hair (no pattern loss, thinning or patches)
    let norwood = opts.noLoss ? '1' : opts.norwood != null ? String(opts.norwood) : R.pick(nwTable);
    let baldType = opts.noLoss ? 'none' : opts.baldType || (norwood === '1' ? 'none' : R.pick(bc.types));
    if (baldType !== 'none' && norwood === '1') norwood = '3';
    const diffuse = !opts.noLoss && R.next() < 0.04 + 0.08 * age01 ? R.range(0.12, 0.4) * (0.4 + age01) : 0;
    // alopecia areata patches (scalp, sometimes beard)
    const patches = [];
    if (opts.areata || (!opts.noLoss && R.next() < AREATA_BY_AGE[ageBand])) {
      const n = 1 + Math.floor(R.next() * 2.4);
      for (let i = 0; i < n; i++) {
        if (R.next() < 0.25) {
          // beard area (alopecia barbae): cheek / jaw / chin
          const sx = R.next() < 0.5 ? -1 : 1;
          patches.push([+(sx * R.range(0.4, 1.2)).toFixed(3), +R.range(-0.75, 0.25).toFixed(3), +R.range(1.3, 1.9).toFixed(3), +R.range(0.12, 0.2).toFixed(3)]);
        } else {
          // scalp: a point on the head shell around (0, 2.1, -0.13)
          const th = R.range(-1.4, 1.0), ph = R.range(-1.15, 1.15), rr = 1.75;
          const x = Math.sin(ph) * rr, yz = Math.cos(ph) * rr;
          patches.push([+x.toFixed(3), +(2.1 + Math.cos(th) * yz).toFixed(3), +(-0.13 + Math.sin(th) * yz).toFixed(3), +R.range(0.14, 0.3).toFixed(3)]);
        }
      }
    }

    // facial hair
    const bw = Object.assign({}, BEARD_BY_AGE[ageBand]);
    for (const [k, m] of Object.entries(BEARD_CLASS_MULT[cls] || {})) if (bw[k] != null) bw[k] *= m;
    const beardStyle = opts.beard || R.pick(bw);
    const style = BEARD_STYLES[beardStyle];
    const beard = {};
    for (const region of ['moustache', 'chin', 'cheeks', 'jaw', 'neck']) {
      if (style[region]) beard[region] = +R.range(style[region][0], style[region][1]).toFixed(1);
    }
    const cheekLine = R.range(-1, 1); // high (-1) to low (1) cheek line
    const neckLine = R.range(-1, 1);
    const patchy = clamp(her.patchy + R.gauss(0.08) + (ageBand === 'young' ? 0.12 : 0), 0, 0.85);

    // face shape: group tendency (subtle) + individual variation (larger)
    const morph = {};
    for (const k of MORPHS) morph[k] = +clamp(0.55 * (her.morph[k] || 0) + R.gauss(0.42), -1, 1).toFixed(3);
    if (opts.morph) Object.assign(morph, opts.morph);

    const eyes = R.pick(her.eyes);
    const brow = { thick: +clamp(R.range(0.82, 1.18) + 0.18 * age01, 0.7, 1.45).toFixed(3), grey: +clamp(grey * 0.65, 0, 1).toFixed(3) };

    return {
      v: PERSON_VERSION,
      seed: seed >>> 0,
      heritage: her.id,
      age: ageBand,
      years,
      skin: { tone: +skinT.toFixed(3), under },
      hair: {
        texture, type: { straight: '1', wavy: '2', curly: '3', coily: '4' }[texture] + 'abc'[Math.min(2, Math.floor(curl * 3))],
        curl: +curl.toFixed(3), colour: hairColour, grey: +grey.toFixed(3), greyPattern, greyTone,
      },
      bald: { type: baldType, norwood, diffuse: +diffuse.toFixed(3), edge: +R.range(0, 1).toFixed(3), patches },
      beard: { style: beardStyle, mm: beard, grey: +beardGrey.toFixed(3), greyPattern: beardGreyPattern, patchy: +patchy.toFixed(3),
        cheekLine: +cheekLine.toFixed(3), neckLine: +neckLine.toFixed(3), warm: +clamp(R.gauss(0.5) + 0.15, 0, 1).toFixed(3) },
      eyes,
      brow,
      morph,
    };
  }

  // a saved customer is only used when every field the game reads has the right type (own keys only, so
  // "constructor" and friends are not table entries); anything else is regenerated from the seed
  const own = (t, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(t, k);
  const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
  const num = Number.isFinite;
  const nums = (o, keys) => isObj(o) && Object.keys(o).length <= 16 && Object.entries(o).every(([k, v]) => num(v) && (!keys || keys.includes(k)));
  const str = (v) => typeof v === 'string' && v.length < 40;
  function validPerson(p) {
    try {
      return (
        isObj(p) && p.v === PERSON_VERSION && Number.isInteger(p.seed) &&
        Number.isInteger(p.years) && p.years >= 16 && p.years <= 95 && own(AGE_BANDS, p.age) &&
        isObj(p.skin) && num(p.skin.tone) && own(UNDERTONES, p.skin.under) &&
        isObj(p.hair) && ['straight', 'wavy', 'curly', 'coily'].includes(p.hair.texture) && Number.isInteger(p.hair.colour) &&
        p.hair.colour >= 0 && p.hair.colour < HAIR_DARK.length && num(p.hair.grey) && num(p.hair.curl) && str(p.hair.greyPattern) && str(p.hair.greyTone) &&
        isObj(p.bald) && own(NORWOOD_SHAPE, p.bald.norwood) && str(p.bald.type) && num(p.bald.diffuse) && num(p.bald.edge) &&
        Array.isArray(p.bald.patches) && p.bald.patches.length <= 64 && p.bald.patches.every((q) => Array.isArray(q) && q.length === 4 && q.every(num)) &&
        isObj(p.beard) && own(BEARD_STYLES, p.beard.style) && nums(p.beard.mm, ['moustache', 'chin', 'cheeks', 'jaw', 'neck']) &&
        ['grey', 'patchy', 'cheekLine', 'neckLine', 'warm'].every((k) => num(p.beard[k])) && str(p.beard.greyPattern) &&
        own(EYES, p.eyes) && nums(p.brow) && num(p.brow.thick) && num(p.brow.grey) && nums(p.morph, MORPHS)
      );
    } catch (e) {
      return false;
    }
  }

  // the colour of skin at tone t (0..9.4, fractional), with undertone
  function skinColour(p) {
    const t = clamp(p.skin.tone, 0, SKIN_TONES.length - 1);
    const i = Math.min(SKIN_TONES.length - 2, Math.floor(t)), f = t - i;
    const u = UNDERTONES[p.skin.under] || UNDERTONES.neutral;
    return [0, 1, 2].map((k) => (SKIN_TONES[i][k] * (1 - f) + SKIN_TONES[i + 1][k] * f) * u[k]);
  }

  Object.assign(HSC, {
    rng, clamp, smooth, makePerson, validPerson, skinColour,
    SKIN_TONES, UNDERTONES, HAIR, HAIR_BY_CLASS, BEARD_BY_AGE, BEARD_CLASS_MULT, BALD_BY_CLASS, HAIR_DARK, EYES, MORPHS, HERITAGE, NORWOOD_SHAPE, BEARD_STYLES, PERSON_VERSION, baldShape,
  });
})(globalThis.HSC || (globalThis.HSC = {}));
