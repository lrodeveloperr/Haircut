// Deterministic cache adoption/integrity checks, independent of browser disk latency.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('source/youtube/geo.js','utf8');
async function fixture(mode){
 let record;
 const context=vm.createContext({setTimeout,clearTimeout,queueMicrotask,performance,AbortController,Uint8Array,Uint16Array,Blob,Response,DecompressionStream,structuredClone,
  fetch:async()=>{throw Error('No lighting in this cache unit test');},
  indexedDB:{open(){const request={};queueMicrotask(()=>{request.result={close(){},transaction(){return{objectStore(){return{get(key){const q={};queueMicrotask(()=>{q.result=key.startsWith('models-v2:')?record:null;q.onsuccess?.()});return q},delete(){}}}}}};request.onsuccess()});return request}},
  HSC:{geoBuild:'unit',startupTiming:{},lifecycle:{timeout(){return 0}}}
 });
 // Expose the real checksum only in this VM. Cache values are created in its realm.
 vm.runInContext(source.replace('  const ENV_BYTES =','  HSC.testFingerprint=fingerprint;\n  const ENV_BYTES ='),context);
 record=vm.runInContext('(()=>{const value={pos:new Float32Array([1,2,3])};return{version:2,models:{head:{value,hash:HSC.testFingerprint(value)}}}})()',context);
 if(mode==='corrupt')record.models.head.value.pos[0]=NaN;
 if(mode==='missing')record=null;
 await context.HSC.geo.ready;
 return context;
}
(async()=>{
 const hit=await fixture('valid');
 assert.equal(hit.HSC.startupTiming.modelCache,'hit');
 assert.equal(hit.HSC.geo.use('head',()=>{throw Error('Valid cache was not used')}).pos[0],1);
 const corrupt=await fixture('corrupt'),replacement=vm.runInContext('({pos:new Float32Array([4,5,6])})',corrupt);let calls=0;
 assert.equal(corrupt.HSC.geo.use('head',()=>{calls++;return replacement}),replacement);
 assert.equal(calls,1);assert.equal(corrupt.HSC.startupTiming.modelCacheInvalid,1);
 const miss=await fixture('missing');
 assert.equal(miss.HSC.startupTiming.modelCache,'miss');assert.equal(miss.HSC.geo.use('head',()=>replacement),replacement);
 console.log('YOUTUBE GEO 3/3: valid reuse, corrupt rebuild, absent fallback');
})().catch(error=>{console.error(error);process.exitCode=1;});
