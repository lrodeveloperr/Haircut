'use strict';
// Run the actual Android bundle's profile, quality sampler, resize and cutting paths.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const game = fs.readFileSync(path.join(root, 'source/build/runtime/game.js'), 'utf8');
const customers = fs.readFileSync(path.join(root, 'source/build/runtime/customers.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'source/build/styles.css'), 'utf8');
const androidStartup = fs.readFileSync(path.join(root, 'android/adreno-startup.js'), 'utf8').trim();
const defaultStartup = `  const visible=Zt.clone(false);
  // Only what the first frame draws. The hidden clipper compiles right after (warmClipper).
  visible.traverse=visit=>Zt.traverseVisible(visit);
  await t.compileAsync(visible,ze,Zt);
  await HSC.whenYouTubeResumed();`;
const firstFrameDiagnostic = 'await n.waitForFirstFrame();HSC.startupTiming.gpuReady=performance.now();HSC.startupTiming.firstFrameConfirmed=performance.now();console.info("[HSC_STARTUP] first_frame_gpu_ready");HSC.dismissLoading();';
const defaultFirstFrame = 'await n.waitForFirstFrame();HSC.startupTiming.gpuReady=performance.now();HSC.dismissLoading();';
assert(game.includes(androidStartup), 'Android uses staged selected-profile startup compilation');
assert(game.includes(firstFrameDiagnostic), 'Android records confirmed GPU first-frame completion');
assert.match(androidStartup, /t\.compileAsync\(stage,ze,Zt\)/, 'each Android startup stage compiles the unchanged scene/camera');
assert.match(androidStartup, /t\.getContext\(\)\.isContextLost\(\)/, 'each stage detects a lost graphics context');
assert(!androidStartup.includes('setPixelRatio') && !androidStartup.includes('setSize') && !androidStartup.includes('setCount'),
  'startup compatibility code cannot change resolution or geometry detail');
assert.match(styles, /\.guard-arc\{[^}]*right:max\(12px,env\(safe-area-inset-right\)\)/, 'default and landscape guard placement remains unchanged');
assert.match(styles, /@media \(orientation:portrait\)\{\s*\.guard-arc\{right:max\(4px,env\(safe-area-inset-right\)\)\}/, 'portrait guard numbers move 8 CSS px right while respecting the safe area');
assert.match(styles, /\.ui \.clip-toggle\{[^}]*right:max\(12px,env\(safe-area-inset-right\)\)/, 'clipper toggle placement remains unchanged');
const profileMarker = '})(globalThis.HSC || (globalThis.HSC = {}));';
const profileStart = customers.indexOf('(function (HSC) {');
const profile = customers.slice(profileStart, customers.indexOf(profileMarker, profileStart) + profileMarker.length);
const sitesGame = fs.readFileSync(path.join(root, 'source/src/runtime/game.js'), 'utf8');
const aimStart = sitesGame.indexOf('function Ue(j){let ae=j.clientX');
const sitesAim = sitesGame.slice(aimStart, sitesGame.indexOf('if(n.setClipper', aimStart)) + '}';
const between = (start, end) => game.slice(game.indexOf(start), game.indexOf(end, game.indexOf(start)));
const sampler = between('function he(ue){if(Pe){let quality=HSC.detail.sample', 'let firstFramePending=');
const budget = between('function He(ue){te=Math.max(HSC.detail.minStrands', 'let O={');
const resize = between('function P(){var ue;', 'function L(){');
const cut = between('function Ue(j){', 'function Pe(j)');
let passed = 0;
const plain = x => JSON.parse(JSON.stringify(x));

const expectedProfiles = {
  potato: { maxStrands: 14000, minStrands: 12000, segments: 5, beardSegments: 5, beardMax: 0.65, pixelMax: 1, pixelMin: 0.9, maxPixels: 1500000, antialias: false, shaderLow: true, fpsCap: 30 },
  balanced: { maxStrands: 20000, minStrands: 16000, segments: 6, beardSegments: 6, beardMax: 0.8, pixelMax: 1.25, pixelMin: 1, maxPixels: 2250000, antialias: false, shaderLow: false, fpsCap: 60 },
  high: { maxStrands: 26000, minStrands: 20000, segments: 7, beardSegments: 7, beardMax: 0.9, pixelMax: 1.5, pixelMin: 1.1, maxPixels: 3200000, antialias: true, shaderLow: false, fpsCap: 60 },
  ultra: { maxStrands: 30000, minStrands: 24000, segments: 8, beardSegments: 8, beardMax: 1, pixelMax: 2, pixelMin: 1.25, maxPixels: 4000000, antialias: true, shaderLow: false, fpsCap: 60 },
};
const forcedContext = (level, ratio) => {
  const context = vm.createContext({
    devicePixelRatio: ratio, innerWidth: 390, innerHeight: 844,
    location: { search: `?graphics=${level}` }, URLSearchParams,
    navigator: { deviceMemory: 8, hardwareConcurrency: 8 },
    setTimeout: () => 1, clearTimeout() {}, addEventListener() {}, console,
    HSC: { lifecycle: { timeout: () => 1, clear() {} } },
  });
  vm.runInContext(profile, context);
  return context;
};

for (const level of Object.keys(expectedProfiles)) for (const ratio of [1, 1.25, 2, 3, 4]) {
  const context = forcedContext(level, ratio), expected = expectedProfiles[level];
  assert.equal(context.HSC.detail.level, level);
  assert.equal(context.HSC.detail.setting, 'qa-forced');
  for (const [key, value] of Object.entries(expected)) assert.equal(context.HSC.detail[key], value, `${level}: ${key}`);
  const expectedRatio = context.HSC.detail.pixelRatio();
  assert(expectedRatio <= Math.min(ratio, expected.pixelMax));
  assert(Math.floor(390 * expectedRatio) * Math.floor(844 * expectedRatio) <= expected.maxPixels);
  vm.runInContext(`{
    let $=HSC.detail.pixelRatio(),J=$,te=HSC.detail.maxStrands,Ae=0,Ue=16,Pe=0;
    const Oi={setCount(n){globalThis.actualStrands=n}};
    ${budget}${sampler}
    for(let ms=1000/60;ms<=60000;ms+=1000/60)he(ms);
    globalThis.result={strands:te,pixel:$,ceiling:J};
  }`, context);
  assert.deepEqual(plain(context.result), { strands: expected.maxStrands, pixel: expectedRatio, ceiling: expectedRatio });
  assert.equal(context.actualStrands, expected.maxStrands);
  passed++;

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
    const target = context.HSC.detail.pixelRatio(w, h);
    assert.deepEqual(plain(context.resizeTo(w, h)), { width: Math.floor(w * target), height: Math.floor(h * target), pixel: target });
    passed++;
  }
  context.devicePixelRatio = 1.5;
  const densityResize = context.resizeTo(844, 390).pixel;
  assert(densityResize >= context.HSC.detail.pixelFloor(844, 390) && densityResize <= context.HSC.detail.pixelRatio(844, 390), 'display-density change stays inside the selected profile');
  passed++;
}

for (const height of [320, 400, 600, 844, 1280]) for (const type of ['touch', 'mouse', 'pen']) for (const kind of ['scalp', 'beard']) {
  const calls = [], strokes = [];
  const state = { selectedGuard: 1 };
  const hit = { u: 0.5, v: 0.5, kind };
  const doCut = (s, points) => { strokes.push(points); return { state: s, changed: false }; };
  const context = vm.createContext({
    a: { clientHeight: height }, ur: { touchOffsetPx: 72 }, s: state, f: { lastUv: null },
    n: { touchTarget(event) { return {x:event.clientX,y:event.clientY-(event.pointerType==='touch'?height*.05:0)}; },
      raycast(x, y) { calls.push([x, y]); return hit; }, setClipper() {}, surface: {}, beardSurface: {} },
    HSC: { cutBeard: doCut }, Ts: doCut, o: { start() {}, stop() {} },
  });
  vm.runInContext(cut + ';globalThis.cut=Ue;', context);
  context.cut({ clientX: 200.25, clientY: 300.75, pointerType: type });
  const websiteCalls = [];
  const website = vm.createContext({a: {clientHeight: height}, ur: {touchOffsetPx: 72},
    n: {raycast(x,y) {websiteCalls.push([x,y]);return null;}}});
  vm.runInContext(sitesAim + ';globalThis.aim=Ue;', website);
  website.aim({clientX:200.25,clientY:300.75,pointerType:type});
  if(type!=='touch')assert.deepEqual(calls, websiteCalls, `${type}/${kind}/${height}: direct YouTube aiming`);
  const gap=type === 'touch' ? height*.05 : 0;
  assert.deepEqual(calls, [[200.25,300.75-gap]], 'cutter forwards the shared target helper result');
  assert.equal(strokes[0][0], hit, 'the actual cutter must use that same hit');
  passed++;
}
let original=game.replace(androidStartup,defaultStartup).replace(firstFrameDiagnostic,defaultFirstFrame)
  .replace(fs.readFileSync(path.join(root,'android/clipper-input.js'),'utf8')+'\n','')
  .replace('raycast:j,touchTarget:androidTouchTarget,resetTouchTarget:androidResetTouchTarget,clipperScreen:androidClipperScreen,getYaw()', 'raycast:j,getYaw()')
  .replace('f=null,o.stop(),n.resetTouchTarget(),n.setClipper(!1)', 'f=null,o.stop(),n.setClipper(!1)')
  .replace('let target=n.touchTarget(j),ae=target.x,fe=target.y,ue=n.raycast(ae,fe);', 'let ae=j.clientX,fe=j.clientY-(j.pointerType==="touch"?Math.min(ur.touchOffsetPx,a.clientHeight*.12):0),ue=n.raycast(ae,fe);')
  .replace('let target=n.touchTarget(j),ae=target.y,fe=j.pointerType==="touch"?22:12;', 'let ae=j.clientY-(j.pointerType==="touch"?Math.min(ur.touchOffsetPx,a.clientHeight*.12):0),fe=j.pointerType==="touch"?22:12;')
  .replace('C=w.left+ds*(w.width/i.current.offsetWidth)-p.clientX,x=w.top+ds*(w.height/i.current.offsetHeight)-p.clientY', 'C=w.left+ds-p.clientX,x=w.top+ds-p.clientY');
// Strip only the explicitly authorised Android completion-ad adaptation as well.
original=original
  .replace(fs.readFileSync(path.join(root,'android/completion-interstitial.js'),'utf8')+'\n','')
  .replace('await androidResultBreak();if(c||C||T||s.status!=="reveal")return!1;','')
  .replace('fe===1&&androidRevealDone()','fe===1&&(x=!0,Z())')
  .replace('Z();try{return C?!1:', 'Z();try{let j=Cc(l);if(j.showInterstitial&&!y&&!(HSC.recentReward&&HSC.recentReward()))try{await $(!0);let ae=await t.showInterstitial("next-customer",{onDisplay:ie});t.lastInterstitialRequestAccepted&&(l=j.adSession),t.sendAnalytics("interstitial_outcome",{opened:ae,nextClick:s.jobId})}catch(ae){}return C?!1:');
assert.equal(original, fs.readFileSync(path.join(root, 'source/build-youtube/runtime/game.js'), 'utf8'), 'working engine unchanged outside reviewed touch/startup/completion-ad adaptations');
assert.equal(game.split('n.touchTarget(j)').length-1,2,'cut and proximity share one touch helper');
assert(!game.includes('touchOffsetPx:0'));
assert(!game.includes('Ue>24&&te>HSC.detail.minStrands'));
assert(!customers.includes("const KEY = 'skin-fade-studio-detail-v1'"));
assert(game.includes('HSC.detail.shouldRender(j,true)'), 'low-end drawing is paced without slowing input');
assert(game.includes('HSC.detail.noteContextLoss("runtime")'), 'runtime context loss records a safer next profile');
assert(game.includes('HSC.detail.commitPending(true)'), 'profile changes occur at explicit safe boundaries');
console.log(`PASS: ${passed} Android graphics/input cases (four adaptive profiles, quality floor/ceiling, resize, recovery, shared touch-target forwarding and direct mouse/pen).`);
