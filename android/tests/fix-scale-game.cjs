// F5a: the order bubble, the result, the toast and the Rush clock never cover the customer's head on any
// screen (scale wave: findings A, B, H-toast, J, U2, U legacy zoom). Pure node: the placement rules of
// source/customers/requests.js run against the head boxes the engine reported on the scale auditor's 26
// viewports (Orders, Rush, result, level-up), turned/tilted variants of them, phone safe-area insets, and a
// larger UI scale (in case the 2.4 cap is raised for 4K).
// Round 2 (G1a, R4-1/2/4/8): a head that fills a tablet puts the order beside it or in a top corner, tail down, not a
// half-size bubble; the result's video button is never under 44 px; the bubble keeps its side as he turns; the Rush
// clock never takes a touch.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

// requests.js loads without a game or a page; only its placement rules are used here
const HSC = { PHENOTYPES: {} };
const ctx = vm.createContext({ HSC, console, setTimeout() {}, setInterval() {}, clearTimeout() {}, addEventListener() {}, performance: { now: () => 0 }, document: { body: null } });
ctx.globalThis = ctx;
vm.runInContext(read('source/customers/requests.js'), ctx);
const P = HSC.uiPlace.place;

// head boxes [l, t, r, b] in screen px from the engine's headScreen(), and the next-customer card on the result
const VP = {
  '320x568': { S: 1, orders: [47, 148, 260, 298], rush: [40, 170, 259, 304], result: [54, 167, 258, 304], next: [92, 435, 188, 531], levelup: [50, 164, 258, 304] },
  '360x640': { S: 1, orders: [52, 166, 293, 336], rush: [44, 190, 292, 342], result: [59, 188, 291, 343], next: [132, 507, 228, 603], levelup: [55, 183, 291, 342] },
  '360x800': { S: 1, orders: [51, 244, 295, 416], rush: [43, 269, 294, 422], result: [59, 266, 293, 423], next: [132, 667, 228, 763], levelup: [54, 262, 293, 422] },
  '390x844': { S: 1, orders: [55, 253, 320, 439], rush: [46, 279, 319, 446], result: [63, 276, 318, 447], next: [162, 711, 258, 807], levelup: [58, 272, 318, 446] },
  '412x915': { S: 1, orders: [57, 278, 339, 475], rush: [48, 306, 337, 483], result: [66, 303, 336, 484], next: [184, 782, 280, 878], levelup: [60, 298, 336, 483] },
  '430x932': { S: 1, orders: [59, 278, 354, 485], rush: [50, 308, 352, 493], result: [69, 304, 351, 494], next: [202, 799, 298, 895], levelup: [63, 299, 351, 493] },
  '600x960': { S: 1.071, orders: [81, 219, 492, 507], rush: [68, 260, 489, 518], result: [95, 255, 488, 520], next: [356, 817, 459, 920], levelup: [86, 248, 488, 518] },
  '768x1024': { S: 1.371, orders: [105, 182, 625, 547], rush: [89, 235, 622, 561], result: [123, 228, 620, 563], next: [455, 842, 587, 974], levelup: [113, 219, 620, 561] },
  '820x1180': { S: 1.464, orders: [112, 236, 669, 627], rush: [94, 292, 666, 643], result: [130, 285, 664, 645], next: [486, 985, 627, 1126], levelup: [119, 275, 664, 643] },
  '1024x1366': { S: 1.829, orders: [140, 243, 833, 729], rush: [119, 313, 829, 749], result: [164, 305, 826, 751], next: [607, 1123, 783, 1299], levelup: [150, 293, 827, 749] },
  '640x360': { S: 1, orders: [222, 65, 404, 192], rush: [217, 83, 403, 197], result: [380, 74, 558, 194], next: [142, 246, 214, 318], levelup: [377, 71, 559, 194] },
  '844x390': { S: 1, orders: [315, 69, 514, 208], rush: [309, 89, 513, 214], result: [474, 80, 668, 211], next: [142, 276, 214, 348], levelup: [470, 77, 668, 210] },
  '915x412': { S: 1, orders: [344, 72, 555, 220], rush: [338, 94, 554, 226], result: [503, 85, 709, 223], next: [142, 298, 214, 370], levelup: [499, 81, 709, 223] },
  '1024x768': { S: 1.371, orders: [301, 135, 694, 410], rush: [289, 175, 691, 421], result: [524, 159, 905, 417], next: [131, 572, 263, 704], levelup: [516, 152, 906, 415] },
  '1180x820': { S: 1.464, orders: [365, 144, 784, 438], rush: [352, 186, 782, 450], result: [602, 170, 1010, 445], next: [140, 610, 281, 751], levelup: [594, 162, 1011, 443] },
  '1280x720': { S: 1.286, orders: [442, 126, 810, 385], rush: [431, 164, 808, 395], result: [651, 149, 1009, 391], next: [123, 536, 247, 660], levelup: [643, 142, 1010, 389] },
  '1366x768': { S: 1.371, orders: [472, 135, 865, 410], rush: [460, 175, 862, 421], result: [694, 159, 1077, 417], next: [131, 572, 263, 704], levelup: [686, 152, 1077, 415] },
  '1440x900': { S: 1.607, orders: [473, 158, 933, 481], rush: [459, 205, 930, 494], result: [733, 186, 1181, 488], next: [154, 670, 309, 825], levelup: [724, 178, 1182, 487] },
  '1536x864': { S: 1.543, orders: [531, 152, 972, 462], rush: [517, 196, 970, 474], result: [781, 179, 1211, 469], next: [147, 643, 296, 792], levelup: [772, 171, 1212, 467] },
  '1920x1080': { S: 1.929, orders: [664, 190, 1216, 577], rush: [647, 246, 1212, 593], result: [976, 223, 1514, 586], next: [184, 804, 370, 990], levelup: [965, 214, 1515, 584] },
  '2560x1440': { S: 2.4, orders: [883, 250, 1623, 770], rush: [860, 325, 1618, 791], result: [1273, 297, 1993, 783], next: [230, 1097, 461, 1328], levelup: [1258, 284, 1994, 780] },
  '3840x2160': { S: 2.4, orders: [1308, 357, 2448, 1156], rush: [1273, 472, 2441, 1189], result: [1712, 439, 2814, 1182], next: [230, 1817, 461, 2048], levelup: [1690, 419, 2816, 1178] },
  '2560x1080': { S: 1.929, orders: [984, 190, 1536, 577], rush: [967, 246, 1532, 593], result: [1296, 223, 1834, 586], next: [184, 804, 370, 990], levelup: [1285, 214, 1835, 584] },
  '1920x600': { S: 1.071, orders: [795, 105, 1102, 321], rush: [786, 136, 1100, 329], result: [969, 124, 1268, 326], next: [103, 447, 206, 550], levelup: [963, 119, 1268, 325] },
  '1000x1000': { S: 1.786, orders: [226, 176, 737, 534], rush: [210, 227, 734, 549], result: [243, 221, 731, 551], next: [592, 762, 764, 934], levelup: [233, 212, 732, 549] },
  '500x1000': { S: 1, orders: [68, 281, 412, 522], rush: [57, 315, 410, 531], result: [79, 311, 409, 533], next: [272, 867, 368, 963], levelup: [72, 305, 409, 532] },
};
const box = (a) => ({ l: a[0], t: a[1], r: a[2], b: a[3] });
const hit = (a, b, m = 0) => a.l < b.r + m && a.r > b.l - m && a.t < b.b + m && a.b > b.t - m;
// the controls on the cutting screen at UI scale S (Home, Finish, the undo spot, guards and clipper, the clock)
function cutControls(W, H, S, ins, rush) {
  const c = [
    { l: ins.l + 12 * S, t: ins.t + 12 * S, r: ins.l + 60 * S, b: ins.t + 60 * S },
    { l: W - ins.r - 60 * S, t: ins.t + 12 * S, r: W - ins.r - 12 * S, b: ins.t + 60 * S },
    { l: ins.l + 12 * S, t: ins.t + 74 * S, r: ins.l + 68 * S, b: ins.t + 130 * S },
    { l: W - ins.r - 174 * S, t: H - ins.b - 187 * S, r: W - ins.r - 12 * S, b: H - ins.b - 17 * S },
  ];
  if (rush) c.push({ l: W / 2 - 24 * S, t: ins.t + 12 * S, r: W / 2 + 24 * S, b: ins.t + 60 * S });
  return c;
}
// the head as the player turns and tilts him: grown, shifted, tilted down
function variants(h, W) {
  const w = h.r - h.l, ht = h.b - h.t;
  return [h, { l: h.l - w * 0.1, t: h.t - ht * 0.1, r: h.r + w * 0.1, b: h.b + ht * 0.1 }, { ...h, l: h.l - W * 0.05, r: h.r - W * 0.05 },
    { ...h, l: h.l + W * 0.05, r: h.r + W * 0.05 }, { ...h, t: h.t - ht * 0.08, b: h.b + ht * 0.5 }];
}
const INSETS = { '390x844': { t: 47, r: 0, b: 34, l: 0 }, '844x390': { t: 0, r: 47, b: 21, l: 47 }, '640x360': { t: 0, r: 32, b: 16, l: 32 }, '820x1180': { t: 24, r: 0, b: 20, l: 0 } };
const NONE = { t: 0, r: 0, b: 0, l: 0 };
function clearOf(name, o, s) {
  const a = P.span(s.kind, s.x, s.y, s.k, o);
  // a top corner spot is held to the head's oval (the scalp box grown by the hair), the rest to the head's box
  if (/^corner/.test(s.kind)) {
    const e = P.oval(o.head, 0), bw = o.w * s.k, cx = a.l + bw / 2, bb = a.t + o.h * s.k;
    assert(P.offOval({ l: a.l, t: a.t, r: a.r, b: bb }, e) && P.offOval({ l: cx - bw * 0.2, t: bb, r: cx + bw * 0.2, b: a.b }, e), `${name}: covers the head`);
    assert(bb <= o.head.t + 1, `${name}: a corner bubble sits above the top of his head`);
  } else assert(!hit(a, o.head), `${name}: covers the head`);
  assert(a.l >= o.ins.l - 0.5 && a.t >= o.ins.t - 0.5 && a.r <= o.W - o.ins.r + 0.5 && a.b <= o.H - o.ins.b + 0.5, `${name}: off screen or in a cut-out`);
  for (const c of o.avoid) assert(!hit(a, c), `${name}: covers a control`);
  assert(P.ok(s.kind, s.x, s.y, s.k, o), `${name}: rules`);
  if (s.kind === 'above') assert(a.b <= o.head.t && (a.l + a.r) / 2 >= o.head.l && (a.l + a.r) / 2 <= o.head.r, `${name}: above him, tail toward him`);
  else if (/^corner/.test(s.kind)) assert(s.kind === 'cornerL' ? a.r < (o.head.l + o.head.r) / 2 : a.l > (o.head.l + o.head.r) / 2, `${name}: in his own top corner`);
  else assert(/^(left|downL)$/.test(s.kind) ? a.r <= o.head.l : a.l >= o.head.r, `${name}: beside him, tail toward him`);
  if (/^(down|corner)/.test(s.kind)) assert(a.b >= o.head.t && a.b <= o.head.t + (o.head.b - o.head.t) * 0.6, `${name}: a tail down beside him ends level with his head`);
}

let n = 0, smallest = 9, sides = 0, downs = 0, x3min = 99;
const small = {}; // the smallest order bubble per screen
for (const [vp, d] of Object.entries(VP)) {
  const [W, H] = vp.split('x').map(Number);
  const scales = [d.S, Math.min(4, Math.min(W, H) / 560)].filter((s, i, a) => i === 0 || s > a[0] + 0.05);
  for (const S of scales) for (const ins of [NONE, INSETS[vp]].filter(Boolean)) {
    for (const mode of ['orders', 'rush']) {
      for (const h of variants(box(d[mode]), W)) {
        const f = P.frameOf(W, H, S, ins, h, { N: 106 * S, T: 40 * S });
        const below = ins.t + (mode === 'rush' ? 72 : 70) * S;
        const o = P.order(f, cutControls(W, H, S, ins, mode === 'rush'), below);
        const s = P.orderSpot(o, false);
        const tag = `${vp} S${S.toFixed(2)} ${mode} ${JSON.stringify(ins)} head ${[h.l, h.t, h.r, h.b].map(Math.round)}`;
        assert(s, `${tag}: no clear spot for the order`);
        clearOf(tag, o, s);
        assert(s.k >= 0.5 && s.k <= 1, `${tag}: size ${s.k}`);
        smallest = Math.min(smallest, s.k); if (s.kind !== 'above') sides++; if (/^down/.test(s.kind)) downs++;
        const sk = vp + (ins === NONE ? '' : '+inset') + (S === d.S ? '' : ' S' + S.toFixed(2)); small[sk] = Math.min(small[sk] || 9, s.k);
        const b = P.orderSpot(o, true, s.kind);
        clearOf(tag + ' enlarged', o, b);
        assert(b.k >= s.k && b.k <= 1.8, `${tag}: enlarged bubble smaller than the normal one`);
        n++;
      }
    }
    for (const which of ['result', 'levelup']) {
      for (const h of variants(box(d[which]), W)) {
        const f = P.frameOf(W, H, S, ins, h, {});
        const nx = d.next, cw = nx[2] - nx[0];
        const avoid = [{ l: nx[0] - 8 * S, t: nx[1] - 8 * S, r: nx[2] + cw * 1.1 + 8 * S, b: nx[3] + 8 * S }];
        // the column (stars, coins, video) 150 x 162 at S, with or without the bill pill hanging 83 px off its right
        for (const bill of [0, 83]) {
          // the video button 116 x 52 at S
          const o = P.result(f, avoid, 150 * S, (150 + bill) * S, 162 * S, { w: 116 * S, h: 52 * S });
          const s = P.resultSpot(o);
          const tag = `${vp} S${S.toFixed(2)} ${which} bill ${bill} ${JSON.stringify(ins)} head ${[h.l, h.t, h.r, h.b].map(Math.round)}`;
          assert(s, `${tag}: no clear spot for the result`);
          clearOf(tag, { ...o, w: s.w2, h: s.h2 }, s);
          const x3h = 52 * S * s.k * s.x3z; x3min = Math.min(x3min, x3h);
          assert(x3h >= 44 - 1e-6, `${tag}: the video button is ${x3h.toFixed(1)} px tall`);
          if (W > H * 1.2) assert(s.kind !== 'above' || s.k >= 0.95, `${tag}: landscape result squeezed over the head instead of the free side`);
          n++;
        }
      }
    }
  }
}
assert(smallest >= 0.65, 'the order never shrinks below 65% on the audited screens (0.55 before the top-corner and beside-the-head spots): ' + smallest);
assert(sides > 0, 'landscape screens put the order beside the head');
assert(downs > 0, 'a head that fills a tablet puts the order beside it under the top buttons, tail down');
// the tablets (R4-1): beside the head or in a top corner, tail down, not the half-size bubble over it (before: 0.50
// to 0.60). Even a head grown a tenth that fills a tablet's width keeps two thirds of the bubble
for (const vp of ['768x1024', '820x1180', '1024x1366', '1000x1000', '600x960']) {
  const k = Math.min(small[vp] || 9, small[vp + '+inset'] || 9);
  assert(k >= 0.66, vp + ': bubble ' + k);
}

// R4-4: turning him on a square screen, the bubble keeps its side while that side still has a good spot
{
  const W = 1000, H = 1000, S = 1.786, ins = NONE;
  let hops = 0, prev = null;
  for (let a = 0; a <= 360; a += 3) {
    const sh = Math.sin(a * Math.PI / 180) * 60, h = { l: 226 + sh, t: 176, r: 737 + sh, b: 534 };
    const f = P.frameOf(W, H, S, ins, h, { N: 106 * S, T: 40 * S });
    const o = P.order(f, cutControls(W, H, S, ins, false), ins.t + 70 * S);
    const s = P.orderSpot(o, false, prev && prev.kind);
    assert(s, 'square screen: a spot at ' + a);
    if (prev && prev.kind !== s.kind) hops++;
    prev = s;
  }
  assert(hops <= 2, 'the bubble hops sides ' + hops + ' times in one full turn');
}

// the CSS: no blind 1.8x, env() not multiplied by the UI zoom, strokes pass the bubble, toast at UI scale off the head
const req = read('source/customers/requests.js'), modes = read('source/customers/modes.js');
assert(!/#hsc-req\.big\{transform/.test(req), 'the enlarged bubble is sized by the placement, not a blind 1.8x');
assert(!/env\(safe-area-inset-top\) \+/.test(req), 'requests.js: env() inside a zoomed layer must be divided by the UI scale');
assert(/#hsc-req\.thru,#hsc-req\.clash\{pointer-events:none\}/.test(req), 'a stroke never ends on the bubble');
assert(/scene\.addEventListener\('pointerdown', \(\) => reqEl\.classList\.add\('thru'\), true\)/.test(req), 'strokes on the customer pass through the bubble');
assert(/\.hsc-toast\{[^}]*zoom:var\(--hsc-s,1\)/.test(modes) && !/\.hsc-toast\{[^}]*top:40%/.test(modes), 'the toast is drawn at the UI scale and not over the head');
assert(/HSC\.uiPlace \? HSC\.uiPlace\.spot\(/.test(modes), 'the toast takes a free spot off the head');
assert(/#hsc-rush\{[^}]*top:calc\(env\(safe-area-inset-top\) \/ var\(--hsc-s,1\) \+ 8px\)/.test(modes), 'the clock fallback inset is not multiplied by the zoom');

// legacy WebView zoom: the new layers report their boxes in screen pixels like the rest of the UI
{
  const code = read('android/viewport-compat.js');
  class Rect { constructor(x, y, width, height) { Object.assign(this, { x, y, width, height, left: x, top: y, right: x + width, bottom: y + height }); } }
  class Element {
    constructor(sel, zoom = 1, rect = new Rect(10, 20, 30, 40)) { this.sel = sel; this.zoom = zoom; this.rect = rect; this.parentElement = null; this.style = {}; this.classList = { contains: () => false }; }
    closest(list) { return list.split(',').includes(this.sel) ? this : null; }
    getBoundingClientRect() { return this.rect; }
    remove() {}
  }
  const c2 = vm.createContext({ window: { HSC: { S: 2 } }, Element, DOMRect: Rect, getComputedStyle: (el) => ({ zoom: el.zoom }), document: { body: { appendChild() {} }, createElement: () => new Element('probe', 1, new Rect(0, 0, 10, 10)) } });
  vm.runInContext(code, c2);
  assert.equal(c2.window.HSC.viewportCompat.legacyRectZoom, true);
  for (const sel of ['#hsc-req', '#hsc-score', '#hsc-undo', '#hsc-rush', '.hsc-toast', '.ui', '#hsc-hud']) assert.equal(new Element(sel, 2).getBoundingClientRect().width, 60, sel + ' in screen pixels on legacy zoom');
  assert.equal(new Element('#hsc-menu', 2).getBoundingClientRect().width, 30, 'other layers keep their existing behaviour');
}
assert(/#hsc-rush\{[^}]*pointer-events:none/.test(modes), 'the Rush clock never takes a touch');
console.log(`PASS: order bubble (normal and enlarged) and result clear of the head, controls and safe area in ${n} placements over 26 screens (smallest bubble ${smallest.toFixed(2)}; video button at least ${x3min.toFixed(1)} px); CSS scale fixes; legacy zoom boxes.`);
if (process.env.VERBOSE) console.log(Object.entries(small).map(([k, v]) => k + ' ' + v.toFixed(2)).join('\n'));
