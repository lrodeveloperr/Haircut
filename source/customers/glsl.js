// ---------------------------------------------------------------------------------------------
// Shader code driven by the current customer. All coordinates are the head mesh's own (un-morphed)
// object space: y up, +z toward the face, the scalp top around y = 3.9.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';

  // Uniforms shared by every material that draws the customer. Plain arrays work for vecN uniforms.
  HSC.U = {
    uBaldA: { value: [0, 0, 0, 0] }, // front recession, temple recession, crown radius, bridge loss
    uBaldB: { value: [0, 0, 0, 0] }, // horseshoe fringe drop, diffuse thinning, pattern seed, -
    uBrowA: { value: [1, 1, 0, 0] }, // brow thickness, brow density
    uBeard: { value: null }, // beard length grid (mm / 50)
    uSkinA: { value: [0.66, 0.385, 0.3, 0] }, // base albedo, darkness 0..1
    uLip: { value: [1.06, 0.78, 0.93] }, // lip colour relative to skin
    uCast: { value: [0.7, 0.73, 0.8, 1] }, // shaved-follicle cast colour, strength
    uHairDark: { value: [0.035, 0.024, 0.018] }, // hair colour where it covers skin (scalp)
    uBeardDark: { value: [0.035, 0.024, 0.018] }, // beard colour where it covers skin
    uBrowTint: { value: [0.085, 0.055, 0.04] },
    uAgeA: { value: [0, 0, 0, 0] }, // age 0..1, age spots, wrinkle depth, sallowness
    uStyleA: { value: [0.22, 0.56, 0.56, 0.5] }, // hang, forward, lift, top lift
    uStyleB: { value: [0.16, 0.1, 0.02, 1] }, // spread, sag, wave, wave frequency
    uStyleC: { value: [0, 0, 1, 1] }, // coil radius (x length), coil turns, shrinkage, strand thickness
    uGreyA: { value: [0, 0.6, 0.62, 0] }, // grey fraction, -, grey brightness, -
    uGreyB: { value: [1.2, 0, 0, 0.4] }, // where the scalp greys first: temples, front, crown, average
    uBeardGreyB: { value: [1, 0, 0, 0.4] }, // where the beard greys first: chin, sides, moustache, average
    uBeardLip: { value: 0.4 }, // how far the moustache may hang over the upper lip: 0 lip edge .. 1 mouth line
    uAreata: { value: new Float32Array(12) }, // up to 3 alopecia areata patches: centre xyz, radius
    uBStyleA: { value: [0, 0.15, 0.45, 0.1] }, // beard: wave, wave frequency, lift, sag
    uBStyleB: { value: [0, 0, 1, 1] }, // beard: coil radius, coil turns, shrinkage, thickness
    uBeardTint: { value: [1, 1, 1] },
    uBeardGrey: { value: [0, 0.62, 0.3, 0] }, // grey fraction, grey brightness, patchiness, -
    uLift: { value: 0 }, // extra sheen and rim light on the hair (0..1), the same for every customer
    uDebug: { value: 0 },
  };

  // Beard grid: a 128 x 64 map of the lower face, projected from a point inside the mouth.
  const BC = [0, 0.3, 0.3], AZR = 1.85, EL0 = -1.45, ELR = 2.25;
  HSC.BEARD_PROJ = { BC, AZR, EL0, ELR };

  // ---- shared declarations, injected into the game's common shader prelude ----
  HSC.glsl = {};
  // Keep the same helper bodies, but only send functions used by this vertex stage to
  // the driver. Mobile linkers otherwise receive the entire skin/beard library too.
  function vertexPrelude(source, roots) {
    const functions = [], signature = /\b(?:float|vec[234])\s+(\w+)\s*\([^()]*\)\s*\{/g;
    let match;
    while ((match = signature.exec(source))) {
      let end = signature.lastIndex, depth = 1;
      while (end < source.length && depth) {
        const ch = source[end++];
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
      }
      if (depth) throw new Error('Incomplete shader helper: ' + match[1]);
      functions.push({ name: match[1], start: match.index, end, body: source.slice(signature.lastIndex, end - 1) });
      signature.lastIndex = end;
    }
    const used = new Set(roots), pending = [...roots];
    while (pending.length) {
      const name = pending.pop(), fn = functions.find(fn => fn.name === name);
      if (!fn) throw new Error('Missing shader helper');
      for (const called of functions) {
        if (!used.has(called.name) && new RegExp('\\b' + called.name + '\\s*\\(').test(fn.body)) {
          used.add(called.name); pending.push(called.name);
        }
      }
    }
    for (const fn of functions.reverse()) if (!used.has(fn.name)) source = source.slice(0, fn.start) + source.slice(fn.end);
    return source;
  }
  HSC.glsl.decls = `
uniform vec4 uBaldA, uBaldB, uBrowA;
uniform vec4 uAreata[3];
// alopecia areata: round, smooth patches (scalp or beard) with a slightly irregular edge
float areataPatch(vec3 p, vec4 a, float i){
  float keep = 1.0;
  if (a.w > .001) keep = smoothstep(a.w * .72, a.w * 1.08, distance(p, a.xyz) + (n3(p * 7.0 + i) - .5) * a.w * .35);
  return keep;
}
float areataKeep(vec3 p){
  float k = 1.0;
  // Constant indices avoid a driver-dependent uniform-array loop. Multiply in the same order.
  k *= areataPatch(p, uAreata[0], 0.0);
  k *= areataPatch(p, uAreata[1], 1.0);
  k *= areataPatch(p, uAreata[2], 2.0);
  return k;
}
uniform sampler2D uBeard;
uniform float uDebug;
// Pattern baldness (Hamilton-Norwood): 1 where hair grows, 0 where it is gone, a soft thinning band between.
float baldDensity(vec3 p){
  float density = 1.0;
  if (uBaldA.x + uBaldA.y + uBaldA.z + uBaldB.x + uBaldB.y >= .001) {
  vec3 q = vec3(p.x, p.y - 2.1, p.z + .13);
  float th = atan(q.z, q.y);                  // 0 on top, + toward the face, - toward the nape
  float ph = atan(p.x, length(q.yz));         // left / right
  float aph = abs(ph);
  float wob = (n3(p * 2.7 + uBaldB.z) - .5) * .10 + (n3(p * 8.0 + uBaldB.z) - .5) * .035;
  // frontal and temporal recession: the hairline moves back from its natural line
  float templeOffset = (aph - .58) / .22;
  float templ = exp(-templeOffset * templeOffset);
  float rec = uBaldA.x + uBaldA.y * templ;
  float hairline = 1.13 - rec + wob;
  float front = smoothstep(hairline - .07, hairline + .1, th) * step(.001, rec) * smoothstep(2.35, 2.7, p.y);
  // crown (vertex) bald spot
  // the crown thins outward from a bald centre: a wide band of sparse, finer hair, slightly oval and uneven
  float cr = length(vec2((th + .27) * .85, ph * 1.08));
  float crown = (1.0 - smoothstep(uBaldA.z * .45, uBaldA.z * 1.2 + .03, cr + wob * 1.3)) * step(.001, uBaldA.z);
  // the bridge between them goes as the pattern advances
  float bw = mix(.25, .62, uBaldA.w) + wob;
  float bridge = uBaldA.w * smoothstep(-.3, -.15, th) * (1.0 - smoothstep(bw - .08, bw + .04, aph)) * smoothstep(2.35, 2.7, p.y);
  // horseshoe: only a fringe stays around the sides and back
  // the fringe sits low over the ears and rises toward the back of the head
  float fringe = 3.08 - uBaldB.x - .18 * smoothstep(.9, 1.5, aph) + .22 * (1.0 - smoothstep(-.9, -.2, th)) * (1.0 - smoothstep(.6, 1.3, aph)) + wob * 1.4;
  float top = step(.001, uBaldB.x) * smoothstep(fringe - .06, fringe + .1, p.y);
  float b = max(max(front, crown), max(bridge, top));
  float d = 1.0 - b;
  // diffuse thinning over the top
  d *= 1.0 - uBaldB.y * smoothstep(2.9, 3.5, p.y) * (.55 + .45 * n3(p * 3.3 + 9.0));
  density = clamp(d, 0.0, 1.0);
  }
  return density * areataKeep(p);
}
const vec3 BEARD_C = vec3(${BC.join(',')});
vec2 beardUV(vec3 p){
  vec3 d = p - BEARD_C;
  float az = atan(d.x, d.z);
  float el = atan(d.y, length(d.xz));
  return vec2(az / ${(2 * AZR).toFixed(4)} + .5, (el - (${EL0.toFixed(4)})) / ${ELR.toFixed(4)});
}
float beardMM(vec3 p){ return texture2D(uBeard, beardUV(p)).r * 50.0; }
float lipMask(vec3 p){
  float ax = abs(p.x), ly = p.y - .125;
  float lipW = 1.0 - smoothstep(.55, .72, ax);
  float upL = (1.0 - smoothstep(.55, .95, length(vec2(p.x / .66, (ly - .12) / .15)))) * step(.0, ly);
  float loL = (1.0 - smoothstep(.55, .95, length(vec2(p.x / .62, (ly + .13) / .21)))) * step(ly, .0);
  return max(upL, loL) * smoothstep(1.8, 2.2, p.z) * lipW;
}
// the area where a beard can grow (individual styles use part of it)
float beardZoneS(vec3 p, float soft){
  float ax = abs(p.x);
  float ang = atan(ax, p.z - .25);
  float yTop = mix(.53, 1.45, smoothstep(.3, 1.45, ang));
  float yBot = mix(-1.22, -.8, smoothstep(.85, 1.6, ang));
  float m = smoothstep(yBot - .04 * soft, yBot + .08 * soft, p.y) * (1.0 - smoothstep(yTop - .08 * soft, yTop + .03, p.y));
  m *= 1.0 - smoothstep(1.5 - .03 * soft, 1.64, ang);
  m *= 1.0 - smoothstep(.15, .5, lipMask(p));
  return m;
}
float beardZone(vec3 p){ return beardZoneS(p, 1.0); }
`;

  // ---- skin material (replaces the game's onBeforeCompile for the head) ----
  HSC.skinCompile = function (e, ctx) {
    Object.assign(e.uniforms, { uGrid: ctx.uGrid, uHairTint: ctx.uHairTint, uDensity: ctx.uDensity }, HSC.U);
    e.vertexShader = e.vertexShader
      .replace('#include <common>', `#include <common>
attribute vec3 hsBase;
varying vec3 vObj;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
vObj = hsBase;`);
    e.fragmentShader = e.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vObj;
${ctx.Ql}
uniform vec4 uSkinA, uCast, uAgeA, uBeardGrey;
uniform vec3 uLip, uHairDark, uBeardDark, uBrowTint;
#ifdef HSC_LOW
float skinBump(vec3 P){ return n3(P * 62.0); }
#else
float skinBump(vec3 P){ return .55 * n3(P * 62.0) + .30 * n3(P * 118.0) + .15 * n3(P * 36.0); }
#endif
float segDist(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
// expression lines and folds that deepen with age (0 = none)
float wrinkles(vec3 P, float age){
  if (age < .02) return 0.0;
  float aX = abs(P.x), w = 0.0;
  // forehead: horizontal, slightly wavy lines
  float fh = smoothstep(2.12, 2.3, P.y) * (1.0 - smoothstep(2.72, 2.9, P.y)) * smoothstep(1.55, 1.95, P.z) * (1.0 - smoothstep(.85, 1.25, aX));
  float fl = pow(abs(sin(P.y * 26.0 + 2.6 * n3(P * vec3(1.6, .4, 1.6)) + .8 * sin(P.x * 2.3))), 22.0);
  float broken = smoothstep(.35, .65, n3(P * vec3(2.2, 9.0, 2.2) + 5.0));   // lines fade in and out along their length
  w += fh * fl * broken * smoothstep(.25, .85, age) * .7;
  // frown lines between the brows
  float gl = (1.0 - smoothstep(.0, .035, abs(aX - .13 - .05 * (P.y - 2.0)))) * smoothstep(1.85, 1.95, P.y) * (1.0 - smoothstep(2.15, 2.3, P.y)) * smoothstep(2.0, 2.2, P.z);
  w += gl * smoothstep(.3, .8, age) * .8;
  // crow's feet at the outer eye corners
  vec2 cf = vec2(aX - .98, P.y - 1.6);
  float cr = length(cf), ca = atan(cf.y, cf.x);
  float crow = (1.0 - smoothstep(.12, .36, cr)) * smoothstep(.04, .1, cr) * step(-.02, cf.x) * pow(abs(sin(ca * 7.0 + 2.0 * n3(P * 5.0))), 10.0);
  w += crow * smoothstep(.2, .75, age);
  // nasolabial folds (nose wing to mouth corner) and marionette lines (mouth corner down)
  vec2 xy = vec2(aX, P.y);
  float nl = 1.0 - smoothstep(.0, .045 + .02 * age, segDist(xy, vec2(.36, .66), vec2(.7, .02)));
  float ml = 1.0 - smoothstep(.0, .035, segDist(xy, vec2(.66, .0), vec2(.62, -.45)));
  w += nl * smoothstep(1.7, 2.1, P.z) * (.25 + .75 * smoothstep(.1, .8, age));
  w += ml * smoothstep(1.6, 1.95, P.z) * smoothstep(.55, .95, age);
  // under-eye lines
  vec2 ue = vec2((aX - .63) / .32, (P.y - 1.33) / .1);
  w += (1.0 - smoothstep(.0, .25, abs(length(ue) - 1.0))) * step(P.y, 1.4) * smoothstep(1.8, 2.05, P.z) * smoothstep(.3, .9, age) * .6;
  // neck rings
  float nk = .6 * pow(abs(sin(P.y * 22.0 + n3(P * 2.0) * 2.0)), 10.0) * smoothstep(-1.7, -1.35, P.y) * (1.0 - smoothstep(-1.05, -.9, P.y)) * smoothstep(.3, .9, P.z);
  w += nk * smoothstep(.45, 1.0, age) * .7;
  return clamp(w, 0.0, 1.0) * uAgeA.z;
}
`)
      .replace('#include <map_fragment>', `
      vec3 P = vObj; float aX = abs(P.x);
      vec3 base = uSkinA.rgb; float dark = uSkinA.w; float age = uAgeA.x;
      vec3 tone = base;
      tone *= 1.0 + .10 * (n3(P * 1.1) - .5);
      tone *= 1.0 + vec3(.11, -.03, -.03) * (n3(P * 2.6 + 4.0) - .5);
      tone *= 1.0 + vec3(.08, -.025, -.025) * (n3(P * 9.0 + 11.0) - .5);
      float pores = pow(n3(P * 85.0), 4.0);
      tone *= 1.0 - (.14 + .08 * age) * pores;
      // older skin: a little sallower and less even
      tone *= mix(vec3(1.0), vec3(1.0, .965, .92), uAgeA.w);
      tone *= 1.0 + .12 * age * (n3(P * 4.5 + 3.0) - .5);
      float fr = smoothstep(.2, 2.0, P.z);
      float flush = 1.0 - .75 * dark;   // redness reads much less on deeper skin
      float cheek = fr * (1.0 - smoothstep(.55, 1.5, aX - .35)) * smoothstep(-.4, .5, P.y) * (1.0 - smoothstep(1.3, 1.9, P.y));
      tone *= 1.0 + vec3(.12, -.05, -.05) * cheek * flush;
      float nose = 1.0 - smoothstep(.0, .5, length(vec3(P.x, P.y - .8, P.z - 2.5)));
      tone *= 1.0 + vec3(.11, -.05, -.05) * nose * flush;
      float ear = smoothstep(1.66, 1.85, aX) * (1.0 - smoothstep(2.2, 2.7, P.y));
      tone *= 1.0 + vec3(.14, -.05, -.03) * ear * flush;
      // lips + mouth line
      float ly = P.y - .125;
      float lipsM = lipMask(P);
      float lipTone = n3(P * 40.0);
      vec3 lipC = base * uLip * mix(vec3(1.0), vec3(.94, .87, .87), step(ly, .0)) * (.9 + .2 * lipTone);
      lipC *= 1.0 - .25 * (1.0 - smoothstep(.0, .06, abs(ly - .06)));
      tone = mix(tone, lipC, lipsM * .95);
      float mline = (1.0 - smoothstep(.0, .022, abs(ly + .035 * P.x * P.x * 2.0))) * (1.0 - smoothstep(.5, .66, aX)) * smoothstep(1.9, 2.3, P.z);
      tone *= 1.0 - .6 * mline;
      // nostrils
      float nost = 1.0 - smoothstep(.04, .13, length(vec3((aX - .21) * 1.2, (P.y - .60) * 1.6, P.z - 2.36)));
      tone *= 1.0 - .7 * nost;
      // eye sockets, lid creases, lash lines
      vec3 eC = vec3(aX - 0.628, P.y - 1.624, P.z - 1.627);
      float eyesock = 1.0 - smoothstep(.0, .8, length(eC));
      tone *= 1.0 - (.20 + .08 * age) * eyesock;
      vec2 eo = vec2(eC.x / .40, eC.y / .21);
      float ring = 1.0 - smoothstep(.0, .12, abs(length(eo) - 1.0));
      float upper = smoothstep(-.1, .5, eC.y);
      tone *= 1.0 - ring * (.25 + .35 * upper) * smoothstep(.4, 1.0, P.z);
      float crease = (1.0 - smoothstep(.0, .06, abs(length(vec2(eC.x / .46, (eC.y - .12) / .30)) - 1.0))) * upper;
      tone *= 1.0 - (.08 + .1 * age) * crease;
      // dark circles under the eyes
      float circ = (1.0 - smoothstep(.0, .3, length(vec2((aX - .62) / 1.3, P.y - 1.36)))) * smoothstep(1.8, 2.1, P.z);
      tone *= 1.0 - circ * (.06 + .1 * age) * vec3(.8, 1.0, 1.0);
      // eyebrows
      float bm = browMask(P) * uBrowA.y;
      float browHair = .72 + .5 * n3(P * vec3(95.0, 230.0, 95.0));
      tone = mix(tone, uBrowTint * browHair, clamp(bm * 1.25, 0.0, .94));
      // age spots on the sun-exposed upper face and scalp
      float sunlit = smoothstep(1.9, 2.6, P.y) * (smoothstep(1.2, 2.0, P.z) + smoothstep(3.0, 3.6, P.y)) + smoothstep(1.4, 1.75, aX) * smoothstep(1.3, 2.0, P.y) * .5;
      float spots = smoothstep(.76, .82, n3(P * 11.0 + 19.0)) * (.5 + .5 * n3(P * 37.0));
      tone *= mix(vec3(1.0), vec3(.9, .82, .74), clamp(spots * sunlit, 0.0, 1.0) * uAgeA.y);
      // beard area: shaved-follicle cast, follicle dots, and the stubble itself
      float bz = beardZone(P) * areataKeep(P);
      float bmm = beardMM(P) * bz;
      #ifdef HSC_LOW
      // low detail: follicles only as their average tone
      float fol = 0.0, folAA = 0.0;
      #else
      float folF = 42.0;
      vec3 fc = floor(P * folF), ff = fract(P * folF);
      vec3 fj = .3 + .4 * vec3(hsh(fc), hsh(fc + 17.0), hsh(fc + 31.0));
      float fd = length(ff - fj);
      float faa = max(fwidth(fd), .02);
      float fol = (1.0 - smoothstep(.2 - faa, .2 + faa, fd)) * step(.25, hsh(fc + 5.0));
      float folAA = 1.0 - smoothstep(.25, .7, length(fwidth(P)) * folF);
      #endif
      // the shave shadow fades out gradually toward the cheekbones and down the neck
      float bzs = beardZoneS(P, 4.0) * (.75 + .25 * n3(P * 3.0));
      tone = mix(tone, tone * uCast.rgb, bzs * .5 * uCast.w * (1.0 - .35 * uBeardGrey.z * n3(P * 6.0)));
      tone = mix(tone, tone * vec3(.45, .45, .5), bzs * uCast.w * mix(.05, .6 * fol, folAA));
      float bedge = smoothstep(.25, .75, n3(P * 7.0 + 2.0) * .6 + smoothstep(.0, 1.2, bmm) * .7);
      // even shadow of short stubble, fuller as it grows; only a soft, low-frequency variation
      float bcov = smoothstep(.1, 1.2, bmm) * mix(.72, .95, smoothstep(1.5, 5.0, bmm));
      tone = mix(tone, uBeardDark * (.85 + .3 * n3(P * 38.0)), bz * bcov * bedge * mix(.82 + .18 * n3(P * 14.0), 1.0, smoothstep(2.0, 6.0, bmm)));
      // scalp / fade skin
      float Lh = hairLen(P);
      float hm = hairMask(P);
      float hm0 = hairMask0(P);
      float baldSkin = hm0 * (1.0 - baldDensity(P));
      float st = hm * smoothstep(1.0, 2.3, P.y);
      // scalp skin sees less sun than the face: a touch paler and less red, with soft blotchy mottling
      float sc = hm0 * smoothstep(1.2, 1.9, P.y);
      vec3 scalpC = base * vec3(.977, 1.026, 1.05);
      scalpC *= 1.0 + .07 * (n3(P * 2.2 + 7.0) - .5);
      scalpC *= 1.0 + vec3(.045, -.02, -.03) * (n3(P * 2.6 + 2.0) - .5);
      // a bald scalp is sun exposed: warmer, a little ruddier
      scalpC = mix(scalpC, base * vec3(1.03, .97, .94) * (1.0 + .06 * (n3(P * 3.0) - .5)), smoothstep(.2, .8, baldSkin));
      tone = mix(tone, scalpC, sc * .9);
      // hair still below the skin leaves a cool cast over the whole growth area, even on a clean shave
      float under = st * (.85 + .15 * n3(P * 5.0 + 3.0));
      tone = mix(tone, tone * uCast.rgb, under * .6 * uCast.w);
      tone = mix(tone, tone * vec3(.42, .42, .48), st * uCast.w * mix(.06, .7 * fol, folAA));
      tone = mix(tone, tone * vec3(.26, .19, .16), st * .88 * smoothstep(0.0,.12,gridValue(P)));
      tone = mix(tone, uHairDark, smoothstep(.06, .32, Lh) * .92);
      float wr = wrinkles(P, age);
      tone *= 1.0 - .32 * wr;
      if (uDebug > .5) tone = mix(tone, vec3(.9, .1, .1), bz * .7) + vec3(0.0, .25, 0.0) * step(.5, fract(beardUV(P).x * 16.0)) * bz;
      diffuseColor.rgb = tone;`)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
      #ifdef USE_SHEEN
        material.sheenColor *= 1.0 - .8 * smoothstep(.2, .8, baldSkin);
      #endif`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, .26, lipsM);
      roughnessFactor = mix(roughnessFactor, .44, smoothstep(2.2, 3.0, P.y) * fr * .6);
      float scR = hm * smoothstep(1.6, 3.2, P.y);
      roughnessFactor = mix(roughnessFactor, .40 + .14 * n3(P * 7.0 + 5.0), scR * .75);
      // a bald scalp shines
      roughnessFactor = mix(roughnessFactor, .3 + .1 * n3(P * 6.0), smoothstep(.3, .9, baldSkin) * .85);
      roughnessFactor = mix(roughnessFactor, min(1.0, roughnessFactor + .12), age);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      {
        float hb = skinBump(vObj) * (1.0 + .6 * age);
        hb -= .25 * (st + bzs) * fol * folAA;
        hb -= 1.6 * wr;
        vec2 dh = vec2(dFdx(hb), dFdy(hb));
        vec3 q0 = dFdx(-vViewPosition), q1 = dFdy(-vViewPosition);
        vec3 R1 = cross(q1, normal), R2 = cross(normal, q0);
        float det = dot(q0, R1);
        vec3 grad = sign(det) * (dh.x * R1 + dh.y * R2);
        normal = normalize(abs(det) * normal - .0022 * grad * (1.0 - .6 * lipsM));
      }`);
  };

  // ---- strand shaders (scalp and beard share most of the code) ----
  // No noise, skin, beard or grid functions are called by the strand fragment stage.
  const strandFrag = (_t, tint, grey) => `
 uniform vec3 uHairTint;
 uniform float uDensity;
 uniform vec3 lA,lB,lC,cam;
 uniform vec4 uGreyA, uBeardGrey;
 uniform vec3 uBeardTint;
 uniform float uLift;
 varying vec3 vTip,vTangent,vSeed;varying float vAlong,vEdge,vLength,vGrey;
 void main(){
  if(vLength<.0001||vSeed.z>uDensity)discard;
  float edge=abs(vEdge),aa=max(fwidth(edge),.03);if(edge>1.0-aa*.25)discard;
  vec3 tangent=normalize(vTangent),view=normalize(cam-vTip);
  vec3 root=vec3(.012,.008,.005),tip=mix(vec3(.045,.029,.017),vec3(.095,.066,.036),vSeed.x);
  vec3 base=mix(root,tip,smoothstep(0.0,.9,vAlong))*${tint};
  // unpigmented (grey / white) strands, a little yellowed toward the root
  vec3 white=mix(vec3(.30,.29,.27),vec3(.62,.61,.58),fract(vSeed.x*13.7))*${grey};
  base=mix(base,white*mix(vec3(.92,.88,.8),vec3(1.0),smoothstep(.0,.6,vAlong)),vGrey);
  float tangentA=dot(tangent,lA);
  float light=.58+.80*sqrt(max(0.0,1.0-tangentA*tangentA));
  vec3 halfA=normalize(view+lA),halfB=normalize(view+lB);
  // a broad sheen and a bright rim, as under a barber's ring light, so dark hair reads on dark skin;
  // light hair already reads and keeps its normal sheen
  float lf=uLift*(1.0-smoothstep(.03,.14,dot(base,vec3(.3,.59,.11))));
  float tangentHalfA=dot(tangent,halfA),tangentHalfB=dot(tangent,halfB);
  float glint=pow(sqrt(max(0.0,1.0-tangentHalfA*tangentHalfA)),mix(65.0,42.0,lf))*mix(.08,.14,vGrey)*(1.0+.6*lf);
  float rim=pow(sqrt(max(0.0,1.0-tangentHalfB*tangentHalfB)),mix(45.0,32.0,lf))*.04*(1.0+1.5*lf);
  // the hair's own colour is lifted (a warm brown-black, not white highlights, which read as grey)
  vec3 lit=base*light*(1.0+2.2*lf)+vec3(1.0,.86,.66)*(glint+rim)*smoothstep(.05,.6,vAlong);
  gl_FragColor=vec4(lit,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;

  HSC.glsl.strandVert = (t) => vertexPrelude(t, ['gridValue', 'hairMask']) + `
 attribute vec3 aRoot,aNormal,aSeed;
 uniform vec3 cam;uniform float uWidth;
 uniform vec4 uStyleA,uStyleB,uStyleC,uGreyA,uGreyB;
 varying vec3 vTip,vTangent,vSeed;varying float vAlong,vEdge,vLength,vGrey;
 void main(){
  float HANG=uStyleA.x,FWD=uStyleA.y,LIFT=uStyleA.z,TOPLIFT=uStyleA.w,SPREAD=uStyleB.x,SAG=uStyleB.y,WAVE=uStyleB.z,WAVEF=uStyleB.w;
  vec3 n=normalize(aNormal);
  vec3 down=vec3(0.0,-1.0,0.0);down-=n*dot(down,n);
  // at the very top of the head "down along the surface" vanishes; fall back to a fixed backward direction
  vec3 back=vec3(0.0,0.0,-1.0);back-=n*dot(back,n);
  down=normalize(mix(back,down,smoothstep(.12,.5,length(down)))+vec3(.0001));
  vec3 fwd=vec3(0.0,.25,1.0);fwd-=n*dot(fwd,n);fwd=normalize(fwd+vec3(.0001));
  // combed flow: the top lies forward, the back and sides fall down; strands scatter where the two meet
  float topW=smoothstep(3.05,3.75,aRoot.y)*smoothstep(-1.1,.2,aRoot.z);
  vec3 flow=normalize(mix(down,fwd,topW)+vec3(.0001));
  vec3 tA=normalize(cross(n,flow)+vec3(.0001));
  float g=gridValue(aRoot),hm=hairMask(aRoot);
  float stock=smoothstep(.80,1.0,g);
  float top=smoothstep(3.22,3.62,aRoot.y);
  float crown=1.0-smoothstep(.0,.42,distance(aRoot,vec3(.12,3.65,-.55)));
  float L0=${(16 / 42).toFixed(6)};
  float jitter=1.0+(aSeed.x-.5)*mix(.08,.24,stock);
  float ragged=mix(.72+.38*aSeed.y,1.0,smoothstep(.55,.98,hm));
  float L=g*L0*hm*mix(1.0,jitter*ragged,stock)*uStyleC.z;
  float shortHair=1.0-smoothstep(.10,.45,g);
  float hang=(1.0-smoothstep(2.7,3.65,aRoot.y))*HANG;
  flow=normalize(mix(flow,down,hang));
  flow=normalize(mix(flow,fwd,top*FWD));
  float lift=mix(LIFT,.95,shortHair);
  lift=mix(lift,TOPLIFT,top);
  float scatter=clamp(4.0*topW*(1.0-topW),0.0,1.0);
  float spinA=(aSeed.x-.5)*6.2831*scatter*scatter*(3.0-2.0*scatter);
  // curly and coily hair has no combed direction: every strand turns its own way
  spinA+=(aSeed.x-.5)*6.2831*smoothstep(.0,.15,uStyleC.x);
  flow=normalize(flow*cos(spinA)+tA*sin(spinA));
  tA=normalize(cross(n,flow)+vec3(.0001));
  lift=mix(lift,.42,max(crown,scatter)*.7*(1.0-smoothstep(.0,.15,uStyleC.x)));
  vec3 dir=normalize(n*lift+flow*(1.0-lift*.75)+tA*(aSeed.z-.5)*SPREAD+flow*(aSeed.y-.5)*SPREAD*.6);
  float t=position.y;
  float sag=SAG*t*clamp(L/L0,0.0,1.6);
  vec3 curve=normalize(dir+flow*(.10*t)+down*sag);
  float wave=sin(t*6.2831*WAVEF+aSeed.x*6.2831)*WAVE*t;
  vec3 p=aRoot+n*.002+curve*(t*L)+tA*wave*L;
  // coils: a helix around the strand's path, opening up from the root
  vec3 b2=normalize(cross(curve,tA)+vec3(.0001));
  float coilR=uStyleC.x*L*(.75+.5*aSeed.z)*smoothstep(.0,.18,t);
  float ph=t*uStyleC.y*(.8+.4*aSeed.y)*6.2831+aSeed.x*6.2831;
  p+=(tA*cos(ph)+b2*sin(ph))*coilR;
  vec3 tang=normalize(curve*L+(-tA*sin(ph)+b2*cos(ph))*coilR*uStyleC.y*6.2831+vec3(.00001));
  vec3 view=normalize(cam-p),side=cross(tang,view);
  if(dot(side,side)<.00001)side=cross(tang,vec3(0.0,1.0,.001));side=normalize(side);
  float radius=.0062*uWidth*uStyleC.w*(.82+.36*aSeed.y)*mix(1.0,.28,pow(t,2.0));
  float facing=abs(dot(n,normalize(cam-aRoot)));
  radius*=mix(1.0,smoothstep(.04,.40,facing),shortHair);
  p+=side*position.x*radius;
  // greying starts at the temples and sides
  // where greying starts depends on the person: temples, frontal hairline, crown, or evenly (salt and pepper)
  float gTemple=smoothstep(1.1,1.6,abs(aRoot.x))*(1.0-smoothstep(2.9,3.5,aRoot.y));
  float gFront=smoothstep(.6,1.6,aRoot.z)*smoothstep(2.6,3.2,aRoot.y);
  float gCrown=(1.0-smoothstep(-.9,-.2,aRoot.z))*smoothstep(2.6,3.4,aRoot.y);
  float gBias=dot(uGreyB.xyz,vec3(gTemple,gFront,gCrown))-uGreyB.w;
  float gf=clamp(uGreyA.x*(1.0+gBias*(1.0-uGreyA.x)*1.6),0.0,1.0);
  vGrey=step(fract(aSeed.z*7.31+aSeed.x*3.17),gf);
  vTip=p;vTangent=tang;vSeed=aSeed;vAlong=t;vEdge=position.x;vLength=L;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
 }`;
  HSC.glsl.strandFrag = (t) => strandFrag(t, 'uHairTint', 'uGreyA.z');

  HSC.glsl.beardVert = (t) => vertexPrelude(t, ['beardMM', 'beardZone', 'areataKeep', 'n3']) + `
 attribute vec3 aRoot,aNormal,aSeed,aBase;
 uniform vec3 cam;uniform float uWidth;
 uniform vec4 uBStyleA,uBStyleB,uBeardGrey,uBeardGreyB;
 uniform float uBeardLip;
 varying vec3 vTip,vTangent,vSeed;varying float vAlong,vEdge,vLength,vGrey;
 void main(){
  vec3 n=normalize(aNormal);
  vec3 B=aBase;float ax=abs(B.x);
  float mm=beardMM(B)*smoothstep(.05,.35,beardZone(B));
  // patchy growth on the cheeks and neck for lighter beards
  float cheekW=smoothstep(.45,.9,atan(ax,B.z-.25))*(1.0-smoothstep(-.2,.2,B.y-.9*(1.0-smoothstep(.0,1.0,ax))));
  float ptch=smoothstep(uBeardGrey.z-.15,uBeardGrey.z+.15,n3(B*3.4+aSeed.z*.3)+(1.0-cheekW)*.35);
  float keep=mix(1.0,ptch,uBeardGrey.z>.01?1.0:0.0)*areataKeep(B);
  float L=mm/42.0*(.82+.36*aSeed.x)*uBStyleB.z*keep;
  // growth direction: down the face; outward on the moustache; down the neck under the jaw
  vec3 down=vec3(0.0,-1.0,0.0);down-=n*dot(down,n);
  vec3 outw=vec3(sign(B.x),-.9,.0);outw-=n*dot(outw,n);
  float must=smoothstep(.15,.3,B.y)*(1.0-smoothstep(.5,.62,B.y))*(1.0-smoothstep(.55,.85,ax));
  // in front of the ear (sideburn and back of the jaw) beard hair grows straight down and a little
  // forward along the jaw, toward the chin; it never sweeps back toward the ear
  float rear=smoothstep(.8,1.3,atan(ax,B.z-.25));
  vec3 fd=vec3(0.0,-1.0,.4);fd-=n*dot(fd,n);
  vec3 flow=normalize(mix(mix(down,outw,must*.55),normalize(fd+vec3(.0001)),rear)+vec3(.0001));
  vec3 tA=normalize(cross(n,flow)+vec3(.0001));
  float spin=((aSeed.y-.5)*.9+(aSeed.x-.5)*6.2831*smoothstep(.0,.15,uBStyleB.x))*(1.0-.8*rear);
  flow=normalize(flow*cos(spin)+tA*sin(spin));
  // nothing points backward there
  flow.z=mix(flow.z,max(flow.z,.08),rear);flow-=n*dot(flow,n);flow=normalize(flow+vec3(.0001));
  tA=normalize(cross(n,flow)+vec3(.0001));
  // short stubble stands up; longer hair lies down and starts to hang, closest to the face by the ear
  float lift=mix(.85,uBStyleA.z,smoothstep(1.0,8.0,mm));
  lift=mix(lift,min(lift,.24),rear*smoothstep(2.0,6.0,mm));
  // around the mouth: the mouth line (in un-morphed head coordinates) and how close this root is to it
  float yMouth=.125-.07*B.x*B.x;
  float mouthW=(1.0-smoothstep(.62,.8,ax))*smoothstep(1.55,1.85,B.z);
  float above=step(yMouth,B.y)*mouthW;
  float below=(1.0-step(yMouth,B.y))*mouthW*(1.0-smoothstep(.12,.45,yMouth-B.y));
  // beside the mouth corners hair grows down and outward, away from the mouth
  float cornerW=(1.0-smoothstep(.16,.42,length(vec3(ax-.66,B.y-.095,(B.z-1.95)*.6))))*smoothstep(1.4,1.75,B.z);
  vec3 od=vec3(sign(B.x)*.75,-1.0,-.1);od-=n*dot(od,n);
  flow=normalize(mix(flow,normalize(od+vec3(.0001)),cornerW));
  tA=normalize(cross(n,flow)+vec3(.0001));
  // moustache hair is combed down to lie along the upper lip
  lift=mix(lift,min(lift,.2),above*smoothstep(2.0,6.0,mm));
  vec3 dir=normalize(n*lift+flow*(1.0-lift*.7)+tA*(aSeed.z-.5)*.3);
  float t=position.y;
  float sagK=max(uBStyleA.w,.3*rear)*smoothstep(6.0,30.0,mm);
  // hair just under the lower lip grows down, away from the mouth
  dir=normalize(mix(dir,vec3(dir.x,min(dir.y,-.55),dir.z),below));
  vec3 curve=normalize(dir+vec3(0.0,-1.0,0.0)*sagK*t);
  // a moustache stops at its trimmed line on the upper lip and never reaches into the mouth:
  // cap the strand so its tip (where it hangs lowest, at t = 1) stays above that line
  vec3 tipDir=normalize(dir+vec3(0.0,-1.0,0.0)*sagK);
  float lipTop=yMouth+.27-.13*B.x*B.x;
  float yEnd=mix(lipTop,yMouth+.03,uBeardLip);
  float fall=max(.2,-tipDir.y);
  float Lcap=max(0.0,(B.y-yEnd)/fall);
  L=mix(L,min(L,Lcap),above);
  float wave=sin(t*6.2831*uBStyleA.y*(1.0+mm/15.0)+aSeed.x*6.2831)*uBStyleA.x*t;
  vec3 p=aRoot+n*.002+curve*(t*L)+tA*wave*L;
  vec3 b2=normalize(cross(curve,tA)+vec3(.0001));
  float coilR=uBStyleB.x*L*(.7+.6*aSeed.z)*smoothstep(.0,.2,t)*(1.0-.75*max(max(above,below),cornerW));
  float ph=t*uBStyleB.y*(.8+.4*aSeed.y)*6.2831+aSeed.x*6.2831;
  p+=(tA*cos(ph)+b2*sin(ph))*coilR;
  vec3 tang=normalize(curve*L+(-tA*sin(ph)+b2*cos(ph))*coilR*uBStyleB.y*6.2831+vec3(.00001));
  vec3 view=normalize(cam-p),side=cross(tang,view);
  if(dot(side,side)<.00001)side=cross(tang,vec3(0.0,1.0,.001));side=normalize(side);
  float radius=.0058*uWidth*uBStyleB.w*(.82+.36*aSeed.y)*mix(1.0,.3,pow(t,2.0));
  float facing=abs(dot(n,normalize(cam-aRoot)));
  radius*=mix(1.0,smoothstep(.04,.4,facing),1.0-smoothstep(1.5,5.0,mm));
  p+=side*position.x*radius;
  // the chin greys first
  // the beard greys chin first, sides first, or evenly
  float bChin=(1.0-smoothstep(.2,.6,ax))*(1.0-must);
  float bSides=smoothstep(.7,1.2,ax);
  float bBias=dot(uBeardGreyB.xyz,vec3(bChin,bSides,must))-uBeardGreyB.w;
  float bgf=clamp(uBeardGrey.x*(1.0+bBias*(1.0-uBeardGrey.x)*1.6),0.0,1.0);
  vGrey=step(fract(aSeed.z*7.31+aSeed.x*3.17),bgf);
  vTip=p;vTangent=tang;vSeed=aSeed;vAlong=t;vEdge=position.x;vLength=L;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
 }`;
  HSC.glsl.beardFrag = (t) => strandFrag(t, 'uHairTint*uBeardTint', 'uBeardGrey.y');
})(globalThis.HSC || (globalThis.HSC = {}));
