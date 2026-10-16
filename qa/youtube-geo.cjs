// Regression: denied/stalled browser caches cannot add waits or work during host pause.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('source/youtube/geo.js','utf8');
(async()=>{
 const forbidden=()=>{throw Error('Optional startup I/O was invoked')};
 const ctx=vm.createContext({HSC:{executionPaused:true,startupTiming:{}},performance:{now:()=>0},fetch:forbidden,indexedDB:{open:forbidden},setTimeout:forbidden,structuredClone:forbidden});
 vm.runInContext(source,ctx);await ctx.HSC.geo.ready;await ctx.HSC.geo.environmentReady;
 let count=0;const original={pos:new Float32Array([1,2,3])};
 assert.equal(ctx.HSC.geo.use('head',()=>{count++;return original}),original);assert.equal(count,1);
 ctx.HSC.geo.saveLater();assert.equal(ctx.HSC.executionPaused,true);assert.equal(ctx.HSC.geo.environment,null);
 assert.equal(ctx.HSC.startupTiming.environmentSource,'generated');
 console.log('YOUTUBE GEO 3/3: no optional I/O/timer, exact builder return, original generated lighting');
})().catch(error=>{console.error(error);process.exitCode=1;});
