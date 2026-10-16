'use strict';
// Run the actual Android bundle's profile, quality sampler, resize and cutting paths.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const game = fs.readFileSync(path.join(root, 'source/build/runtime/game.js'), 'utf8');
const customers = fs.readFileSync(path.join(root, 'source/build/runtime/customers.js'), 'utf8');
const profile = customers.slice(0, customers.indexOf('// ---------------------------------------------------------------------------------------------'));
const between = (start, end) => game.slice(game.indexOf(start), game.indexOf(end, game.indexOf(start)));
const sampler = between('function he(ue){if(Pe)HSC.detail.sample', 'function _(ue=!0)');
const budget = between('function He(ue){te=Math.max(HSC.detail.minStrands', 'let O={');
const resize = between('function P(){var ue;', 'function L(){');
const cut = between('function Ue(j){let ae=j.clientX', 'function Pe(j)');
let passed = 0;
const plain = x => JSON.parse(JSON.stringify(x));

for (const ratio of [1, 1.25, 2, 3, 4]) {
  const context = vm.createContext({ devicePixelRatio: ratio, location: { search: '?detail=low' },
    navigator: new Proxy({}, { get() { throw Error('fixed High must not classify hardware'); } }) });
  vm.runInContext(profile, context);
  assert.equal(context.HSC.detail.pixelRatio(), ratio, 'native density must not be capped');
  assert.equal(context.HSC.detail.level, 'high');
  assert.equal(context.HSC.initDetail, undefined, 'old saved Low must not be loaded');
  assert.equal(context.HSC.setDetailSetting, undefined, 'no Auto/Low control');
  for (const interval of [1000 / 60, 25, 1000 / 30, 50, 100, 250]) {
    vm.runInContext(`{
      let $=HSC.detail.pixelRatio(),J=$,te=HSC.detail.maxStrands,Ae=0,Ue=16,Pe=0;
      const Oi={setCount(n){globalThis.actualStrands=n}};
      ${budget}${sampler}
      for(let ms=${interval};ms<=1200000;ms+=${interval})he(ms);
      globalThis.result={strands:te,pixel:$,ceiling:J};
    }`, context);
    assert.deepEqual(plain(context.result), { strands: 30000, pixel: ratio, ceiling: ratio });
    assert.equal(context.actualStrands, 30000);
    assert.equal(context.HSC.detail.segments, 8);
    assert.equal(context.HSC.detail.beardSegments, 8);
    assert.equal(context.HSC.detail.beardMax, 1);
    assert.equal(context.HSC.detail.shaderLow, false);
    assert.equal(context.HSC.detail.antialias, true);
    passed++;
  }
  // Exercise the actual renderer resize code in portrait, landscape, and large viewports.
  vm.runInContext(`{
    let $=HSC.detail.pixelRatio(),J=$,O={};
    const e={clientWidth:390,clientHeight:844,width:0,height:0,
      parentElement:{querySelector(){return null}},getBoundingClientRect(){return{left:0,top:0}}};
    const t={setPixelRatio(r){this.r=r},setSize(w,h){e.width=Math.floor(w*this.r);e.height=Math.floor(h*this.r)}};
    const ze={updateProjectionMatrix(){}};
    ${resize}
    globalThis.resizeTo=(w,h)=>{e.clientWidth=w;e.clientHeight=h;P();return{width:e.width,height:e.height,pixel:$}};
  }`, context);
  for (const [w, h] of [[390, 844], [844, 390], [1280, 800], [2560, 1600]]) {
    assert.deepEqual(plain(context.resizeTo(w, h)), { width: Math.floor(w * ratio), height: Math.floor(h * ratio), pixel: ratio });
    passed++;
  }
  context.devicePixelRatio = 1.5;
  assert.equal(context.resizeTo(844, 390).pixel, 1.5, 'display-density change must update the buffer');
  passed++;
}

for (const height of [400, 600, 844]) for (const type of ['touch', 'mouse', 'pen']) for (const kind of ['scalp', 'beard']) {
  const calls = [], strokes = [];
  const state = { selectedGuard: 1 };
  const hit = { u: 0.5, v: 0.5, kind };
  const doCut = (s, points) => { strokes.push(points); return { state: s, changed: false }; };
  const context = vm.createContext({
    a: { clientHeight: height }, s: state, f: { lastUv: null },
    n: { raycast(x, y) { calls.push([x, y]); return hit; }, setClipper() {}, surface: {}, beardSurface: {} },
    HSC: { cutBeard: doCut }, Ts: doCut, o: { start() {}, stop() {} },
  });
  vm.runInContext(cut + ';globalThis.cut=Ue;', context);
  context.cut({ clientX: 200.25, clientY: 300.75, pointerType: type });
  assert.deepEqual(calls, [[200.25, 300.75]], `${type} must aim directly at contact`);
  assert.equal(strokes[0][0], hit, 'the actual cutter must use that same hit');
  passed++;
}
assert(!game.includes('Math.min(ur.touchOffsetPx,a.clientHeight*.12)'));
assert(!game.includes('Ue>24&&te>HSC.detail.minStrands'));
assert(!customers.includes("const KEY = 'skin-fade-studio-detail-v1'"));
console.log(`PASS: ${passed} Android graphics/input cases (20-minute simulated cadences, native DPR/resize, direct scalp/beard contact).`);
