// Exercise the adaptive graphics policy embedded in the actual upload runtime.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(process.env.RELEASE_DIR||'source/build-youtube');
const source=fs.readFileSync(path.join(root,'runtime/customers.js'),'utf8');
const marker='})(globalThis.HSC || (globalThis.HSC = {}));',start=source.indexOf('(function (HSC) {');
const policy=source.slice(start,source.indexOf(marker,start)+marker.length),results=[];

function fixture(options={}){
 const store=options.store||new Map(),gpu=options.gpu||'Adreno (TM) 740';
 const gl={RENDERER:1,MAX_TEXTURE_SIZE:2,MAX_RENDERBUFFER_SIZE:3,
  getExtension(name){if(name==='WEBGL_debug_renderer_info')return{UNMASKED_RENDERER_WEBGL:4};if(name==='WEBGL_lose_context')return{loseContext(){}};return null;},
  getParameter(key){return key===4?gpu:key===1?gpu:key===2?(options.maxTexture||16384):key===3?(options.maxRenderbuffer||16384):0;}};
 const localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key)};
 const context=vm.createContext({
  devicePixelRatio:options.dpr||3,innerWidth:options.width||390,innerHeight:options.height||844,
  navigator:{deviceMemory:options.memory??8,hardwareConcurrency:options.cores??8},
  document:{hidden:false,createElement(){return{getContext(){return gl}}}},
  location:{search:options.graphics?`?graphics=${options.graphics}`:''},URLSearchParams,localStorage,
  setTimeout:()=>1,clearTimeout(){},addEventListener(){},console,HSC:{lifecycle:{timeout:()=>1,clear(){}}},
 });
 vm.runInContext(policy,context);return{d:context.HSC.detail,context,store};
}
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(JSON.stringify(results.at(-1)));}
function sample(d,state,ms,count,ceiling=d.pixelRatio()){for(let i=0;i<count;i++){const next=d.sample(ms,state.strands,state.pixel,ceiling);if(next)Object.assign(state,next);}return state;}

test('Very weak hardware selects the protected recognizable floor',()=>{
 const {d}=fixture({memory:2,cores:2,gpu:'Mali-G31',maxTexture:4096,maxRenderbuffer:4096});
 assert.equal(d.level,'potato');assert.equal(d.minStrands,12000);assert.equal(d.maxStrands,14000);
 assert.equal(d.segments,5);assert.equal(d.beardSegments,5);assert.equal(d.pixelMin,.9);assert.equal(d.shaderLow,true);assert.equal(d.fpsCap,30);
});
test('A strongest-class device receives the full Ultra ceiling even when WebView omits memory',()=>{
 const {d}=fixture({memory:0,cores:8,gpu:'Adreno (TM) 740'});
 assert.equal(d.level,'ultra');assert.equal(d.maxStrands,30000);assert.equal(d.segments,8);assert.equal(d.beardSegments,8);
 assert.equal(d.beardMax,1);assert.equal(d.shaderLow,false);assert.equal(d.antialias,true);assert.equal(d.pixelMax,2);
});
test('All four deterministic QA profiles preserve their contractual floor and ceiling',()=>{
 const expected={potato:[12000,14000,5,.9,1],balanced:[16000,20000,6,1,1.25],high:[20000,26000,7,1.1,1.5],ultra:[24000,30000,8,1.25,2]};
 for(const [level,[min,max,segments,pixelMin,pixelMax]]of Object.entries(expected)){
  const {d,store}=fixture({graphics:level});assert.deepEqual([d.level,d.minStrands,d.maxStrands,d.segments,d.pixelMin,d.pixelMax],[level,min,max,segments,pixelMin,pixelMax]);
  assert.equal(d.setting,'qa-forced');assert.equal(store.size,0,'QA overrides cannot contaminate a player profile');
 }
});
test('Every profile bounds its drawing buffer from tiny phones through 4K ultrawide',()=>{
 for(const graphics of ['potato','balanced','high','ultra'])for(const dpr of [1,2,3,4]){
  const {d}=fixture({graphics,dpr});
  for(const [w,h]of [[225,400],[390,844],[844,390],[1024,1366],[2560,1440],[3440,1440],[3840,2160]]){
   const r=d.pixelRatio(w,h);assert(Math.floor(w*r)*Math.floor(h*r)<=d.maxPixels);assert(r<=Math.min(d.pixelMax,dpr));assert(d.pixelFloor(w,h)<=r);
  }
 }
});
test('Sustained overload sheds effects, pixels and strands before a safe-boundary tier drop',()=>{
 const {d}=fixture(),state={strands:30000,pixel:2};sample(d,state,55,900);
 assert.equal(d.level,'ultra');assert.equal(d.pendingLevel,'high');assert(state.strands>=d.minStrands&&state.strands<30000);assert(state.pixel>=d.pixelFloor()&&state.pixel<2);assert(d.effectScale<1);
 assert.equal(d.commitPending(false),false,'never rebuild geometry in the middle of play');assert.equal(d.commitPending(true),true);assert.equal(d.level,'high');
});
test('The 30 fps floor benchmarks rendered intervals while input may remain 60 Hz',()=>{
 const {d}=fixture({graphics:'potato'}),state={strands:d.maxStrands,pixel:d.pixelRatio()};sample(d,state,1000/60,600);
 assert(d.lastFrameMs>30&&d.lastFrameMs<35,`expected a rendered interval, got ${d.lastFrameMs}`);
 let draws=0;for(let now=0;now<1000;now+=1000/60)if(d.shouldRender(now,true))draws++;
 assert(draws>=28&&draws<=32,`expected about 30 draws, got ${draws}`);
});
test('An unclean previous boot starts one tier safer without blocking play',()=>{
 const store=new Map(),first=fixture({store});assert.equal(first.d.level,'ultra');
 const second=fixture({store});assert.equal(second.d.level,'high');assert.equal(second.d.crashCount,1);
});
test('Context loss queues one safer profile and leaves gameplay state outside graphics policy',()=>{
 const {d}=fixture();assert.equal(d.noteContextLoss('test'),'high');assert.equal(d.level,'ultra');assert.equal(d.commitPending(true),true);assert.equal(d.level,'high');
 assert(!/skinFadeStudio\.getState|cutStrokeCount|selectedGuard|startHair/.test(policy),'graphics policy must not own logical haircut state');
});

const out=path.resolve(process.env.QA_OUTPUT||'qa/results/youtube-quality');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'contracts.json'),JSON.stringify(results,null,2));
const failed=results.filter(x=>x.status==='FAIL');console.log('YOUTUBE QUALITY',results.length-failed.length+'/'+results.length);process.exitCode=failed.length?1:0;
