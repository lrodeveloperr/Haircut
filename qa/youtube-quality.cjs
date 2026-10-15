// Exercise the graphics policy embedded in the actual upload runtime.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(process.env.RELEASE_DIR||'source/build-youtube');
const source=fs.readFileSync(path.join(root,'runtime/customers.js'),'utf8');
const end=source.indexOf('})(globalThis.HSC || (globalThis.HSC = {}));')+'})(globalThis.HSC || (globalThis.HSC = {}));'.length;
const start=source.indexOf('(function (HSC) {');
const results=[];
function fixture(dpr=3){const context=vm.createContext({devicePixelRatio:dpr,innerWidth:390,innerHeight:844,navigator:{deviceMemory:2,hardwareConcurrency:2},HSC:{}});vm.runInContext(source.slice(start,end),context);return context.HSC.detail;}
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(JSON.stringify(results.at(-1)));}
function sample(d,state,ms,count){for(let i=0;i<count;i++){const next=d.sample(ms,state.strands,state.pixel,2);if(next)Object.assign(state,next);}return state;}
function warm(d,state){sample(d,state,25,60);}
test('A phone with low hardware hints still starts with full geometry, shading and MSAA',()=>{const d=fixture();assert.equal(d.level,'high');assert.equal(d.maxStrands,30000);assert.equal(d.segments,8);assert.equal(d.beardSegments,8);assert.equal(d.beardMax,1);assert.equal(d.shaderLow,false);assert.equal(d.antialias,true);assert.equal(d.pixelRatio(390,844),2);});
test('Drawing-buffer budget holds from tiny phones through 4K/ultrawide at different DPRs',()=>{for(const dpr of [1,2,3,4]){const d=fixture(dpr);for(const [w,h]of [[225,400],[390,844],[844,390],[1024,1366],[2560,1440],[3440,1440],[3840,2160]]){const r=d.pixelRatio(w,h);assert(Math.floor(w*r)*Math.floor(h*r)<=d.maxPixels);assert(r<=Math.min(2,dpr));assert(d.pixelFloor(w,h)<=r);}}});
test('Sustained overload never lowers resolution, hair or any other detail',()=>{for(const ms of [40,100,250]){const d=fixture(),s={strands:30000,pixel:2};sample(d,s,ms,2000);assert.equal(s.pixel,2);assert.equal(s.strands,30000);assert.equal(d.minStrands,d.maxStrands);assert.equal(d.antialias,true);assert.equal(d.shaderLow,false);assert.equal(d.segments,8);assert.equal(d.beardMax,1);}});
test('Resolution floor equals the full ratio at every viewport and DPR',()=>{for(const dpr of [1,2,3]){const d=fixture(dpr);for(const [w,h]of [[390,844],[844,390],[1024,1366],[3840,2160]])assert.equal(d.pixelFloor(w,h),d.pixelRatio(w,h));}});
test('Frame times are still measured for diagnostics',()=>{const d=fixture(),s={strands:30000,pixel:2};sample(d,s,40,60);assert(Math.abs(d.lastFrameMs-40)<0.01);});
const out=path.resolve(process.env.QA_OUTPUT||'qa/results/youtube-quality');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'contracts.json'),JSON.stringify(results,null,2));const failed=results.filter(x=>x.status==='FAIL');console.log('YOUTUBE QUALITY',results.length-failed.length+'/'+results.length);process.exitCode=failed.length?1:0;
