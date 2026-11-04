// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): small real-life details on customers, and regulars.
//
//   skin details  moles, a small scar (through the eyebrow, on the chin or a cheek), light acne in young
//                 men, razor bumps where coily beards are shaved
//   accessories   ear studs and small hoops, in-the-ear hearing aids on older men, a neck tattoo above the gown
//   regulars      a customer the player has cut may come back later with that same cut grown out
//
// Details and accessories are derived from the customer's seed, so they are never saved and a saved
// customer always comes back the same. render.js places them on the head; glsl.js draws the skin details.
// Prevalences are rounded real-life estimates (cited inline), kept on the modest side.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const R0 = (person, salt) => HSC.rng(((person.seed >>> 0) ^ salt) >>> 0 || 1);
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const cache = new Map();
  const remember = (map, key, val) => { if (map.size > 64) map.delete(map.keys().next().value); map.set(key, val); return val; };

  // ---- skin details ----
  // moles: most adults have a few visible facial moles; fewer on deep skin (fewer naevi), some fade after 60.
  // scars: a small healed scar in about 1 in 15 men. Acne: about 4 in 10 men aged 18-20, falling through the
  // 20s. Razor bumps (pseudofolliculitis barbae): 45-80% of men with tightly curled beard hair who shave.
  HSC.skinDetailsOf = function (person) {
    if (!person || !HSC.rng) return null;
    const y = person.years, ty = (person.hair && person.hair.type) || '1a', st = person.beard && person.beard.style;
    const key = person.seed + ':' + y + ':' + ty + ':' + st + ':' + person.skin.tone;
    if (cache.has('s' + key)) return cache.get('s' + key);
    const R = R0(person, 0x3a91c2e7), deep = person.skin.tone >= 6;
    const nMoles = +R.pick(deep ? { 0: 65, 1: 25, 2: 8, 3: 2 } : { 0: 48, 1: 32, 2: 14, 3: 6 });
    const moles = [];
    for (let i = 0; i < nMoles; i++) moles.push({ at: R.next(), r: R.range(0.03, 0.055) * (1 - 0.25 * sm(60, 85, y)), raised: R.next() < 0.35 ? 1 : 0 });
    let scar = null;
    if (R.next() < 0.07) {
      const kind = R.pick({ brow: 55, chin: 30, cheek: 15 });
      scar = { kind, side: R.next() < 0.5 ? -1 : 1, at: R.next(), tilt: R.range(-0.45, 0.45), len: R.range(0.75, 1.25), s: R.range(0.55, 1) };
    }
    const acneP = y <= 20 ? 0.42 : y <= 24 ? 0.28 : y <= 29 ? 0.12 : y <= 39 ? 0.05 : 0.02;
    const acne = R.next() < acneP ? R.range(0.35, 1) * (y <= 24 ? 1 : 0.65) : 0;
    const shaved = st === 'clean' || /^stubble/.test(st || '');
    const bumpP = !shaved ? 0 : /^(4|3c)/.test(ty) ? 0.45 : /^3/.test(ty) ? 0.12 : 0.03;
    const bumps = R.next() < bumpP ? R.range(0.4, 1) : 0;
    return remember(cache, 's' + key, { moles, scar, acne: +acne.toFixed(3), bumps: +bumps.toFixed(3) });
  };

  // ---- accessories ----
  // ear piercings: roughly 1 in 6 young men, rarer with age (left ear alone, both, sometimes the right alone).
  // hearing aids: about 1 in 20 men in their 60s, 1 in 8 in their 70s, 1 in 5 over 80, usually both ears.
  // a visible neck tattoo: a few percent of young men, rarer with age. Designs are pictures, never lettering.
  HSC.TATTOOS = ['star', 'rose', 'tribal', 'geo'];
  HSC.accessoriesOf = function (person) {
    if (!person || !HSC.rng) return null;
    const y = person.years, key = 'a' + person.seed + ':' + y + ':' + person.skin.tone;
    if (cache.has(key)) return cache.get(key);
    const R = R0(person, 0x6c8e9cf5);
    let ear = null;
    if (R.next() < (y <= 29 ? 0.16 : y <= 44 ? 0.09 : y <= 59 ? 0.04 : 0.015)) {
      const sides = R.pick({ L: 45, both: 45, R: 10 });
      const kind = R.next() < (y <= 29 ? 0.3 : 0.18) ? 'hoop' : 'stud';
      const metal = kind === 'stud' ? R.pick({ silver: 40, gold: 22, black: 13, gem: 25 }) : R.pick({ silver: 55, gold: 35, black: 10 });
      ear = { sides: sides === 'both' ? [-1, 1] : sides === 'L' ? [1] : [-1], kind, metal };
    }
    let aid = null;
    if (R.next() < (y >= 80 ? 0.2 : y >= 70 ? 0.12 : y >= 60 ? 0.05 : 0)) {
      const deep = person.skin.tone >= 6;
      aid = { sides: R.next() < 0.72 ? [-1, 1] : [R.next() < 0.5 ? -1 : 1], colour: R.pick(deep ? { brown: 55, grey: 30, beige: 15 } : { beige: 50, grey: 35, brown: 15 }) };
    }
    let tattoo = null;
    if (R.next() < (y <= 29 ? 0.07 : y <= 44 ? 0.05 : y <= 59 ? 0.02 : 0.008)) {
      const kind = HSC.TATTOOS[Math.floor(R.next() * HSC.TATTOOS.length)];
      // older ink is softer and a little green-blue
      tattoo = { kind, side: R.next() < 0.5 ? -1 : 1, size: R.range(0.85, 1.15), rot: R.range(-0.35, 0.35), fade: Math.min(1, R.range(0, 0.35) + 0.5 * sm(25, 65, y)) };
    }
    return remember(cache, key, { ear, aid, tattoo });
  };

  // ---- hair and falling-hair prototypes ----
  // The owner picked hair C and falling hair 3 (5 November 2026): they are the Android game's look. The other
  // prototypes stay reachable for QA only, through ?hair=0..4 and ?clip=0..2 on the page URL.
  //   hair: [shading, locks + flyaways, crown swirl, strand variation] and the scalp strand count
  HSC.HAIR_PROTOS = [
    { id: 'today', q: [0, 0, 0, 0], n: 30000 },
    { id: 'shading', q: [1, 0, 0, 1], n: 30000 },
    { id: 'locks', q: [1, 1, 1, 1], n: 30000 },
    { id: 'dense', q: [1, 1, 1, 1], n: 60000 },
    { id: 'max', q: [1, 1, 1, 1], n: 100000 },
  ];
  HSC.CLIP_PROTOS = [{ id: 'today', cap: 4000 }, { id: 'tufts', cap: 12000 }, { id: 'landing', cap: 12000 }];
  const qa = (() => { try { return new URLSearchParams(globalThis.location.search); } catch (e) { return null; } })();
  // a QA page asking for prototypes builds enough strand roots for the densest one (the game keeps 30,000)
  if (qa && (qa.has('hair') || qa.has('hairqa'))) HSC.HAIR_MAX = 100000;
  HSC.HAIR_DEFAULT = 2;
  HSC.clipProto = 2;
  HSC.setHairProto = function (i) {
    const p = HSC.HAIR_PROTOS[i];
    if (!p || !HSC.U || !HSC.U.uHairQ || !HSC.detail) return false;
    HSC.U.uHairQ.value = p.q.slice();
    const n = Math.min(p.n, HSC.HAIR_MAX || 30000);
    HSC.detail.maxStrands = HSC.detail.minStrands = n;
    if (HSC.detailBudget) HSC.detailBudget();
    HSC.hairProto = i;
    return n === p.n;
  };
  HSC.setClipProto = function (i) {
    const p = HSC.CLIP_PROTOS[i];
    if (!p || !HSC.detail) return false;
    HSC.clipProto = i;
    HSC.clipCap && HSC.clipCap();
    return true;
  };
  if (qa && (qa.has('hair') || qa.has('clip'))) {
    const t0 = Date.now();
    (function apply() {
      if (!HSC.detailBudget || !HSC.ready) { if (Date.now() - t0 < 60000) setTimeout(apply, 250); return; }
      if (qa.has('hair')) HSC.setHairProto(+qa.get('hair') || 0);
      if (qa.has('clip')) HSC.setClipProto(+qa.get('clip') || 0);
    })();
  }

  // ---- regulars: their last haircut, packed for saving ----
  // run-length text: a capital letter per level (A = 0 .. Q = 16), then the run length in base 36
  const LV = 'ABCDEFGHIJKLMNOPQ';
  HSC.gridPack = function (a) {
    let s = '';
    for (let i = 0; i < a.length;) {
      let j = i;
      while (j < a.length && a[j] === a[i]) j++;
      s += LV[a[i]] + (j - i).toString(36);
      i = j;
    }
    return s;
  };
  // the grid, or null unless it is exactly 8192 levels, each 0..max
  HSC.gridUnpack = function (s, max) {
    if (typeof s !== 'string' || s.length > 24000) return null;
    const out = new Array(8192);
    const re = /([A-Q])([0-9a-z]{1,4})/y;
    let n = 0, m;
    re.lastIndex = 0;
    while (re.lastIndex < s.length && (m = re.exec(s))) {
      const v = LV.indexOf(m[1]), k = parseInt(m[2], 36);
      if (v > max || !k || n + k > 8192) return null;
      out.fill(v, n, n + k);
      n += k;
    }
    return n === 8192 && re.lastIndex === s.length ? out : null;
  };
  // a regular walks back in some weeks later: scalp hair `weeks` hair levels longer (about 3 mm a week, up to
  // the 16 mm walk-in limit); the beard grows back toward his usual style, never past it
  HSC.regularGrow = function (hair, beard, usualBeard, weeks) {
    const MM = HSC.BEARD_MM, top = MM.length - 1;
    const h = hair.map((v) => Math.min(5, v + weeks));
    const b = beard.map((v, c) => {
      const usual = usualBeard[c] || 0;
      if (!usual) return 0;
      const mm = MM[Math.min(top, v)] + 3 * weeks;
      let l = 0;
      while (l < top && MM[l + 1] <= mm) l++;
      return Math.min(usual, l);
    });
    return { hair: h, beard: b };
  };
})(globalThis.HSC || (globalThis.HSC = {}));
