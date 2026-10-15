// Local before/after and lossless-decoder evidence. Host delays are controlled fixtures,
// not measurements of YouTube/MediaCube or a physical phone.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const game=require('./youtube-browser.cjs');
const baseline=path.resolve(process.env.BASELINE_DIR),candidate=path.resolve(process.env.RELEASE_DIR||'source/build-youtube');
const output=path.resolve(process.env.QA_OUTPUT||'qa/results/startup-audit');fs.mkdirSync(output,{recursive:true});
const samples=[];let browser;
async function sample(name,releaseRoot,extra={}){
 browser=await game.start();
 try{const f=await game.fixture({releaseRoot,dpr:2,touch:true,mobile:true,...extra});
  try{const row={name,...await f.page.evaluate(()=>({timing:HSC.startupTiming,ready:__yt.messages,quality:{strands:HSC.detail.maxStrands,segments:HSC.detail.segments,antialias:HSC.detail.antialias,shaderLow:HSC.detail.shaderLow}})),errors:f.errors};
   assert.deepEqual(row.errors,[]);assert.equal(row.quality.strands,30000);assert.equal(row.quality.segments,8);assert.equal(row.quality.antialias,true);assert.equal(row.quality.shaderLow,false);
   samples.push(row);console.log(JSON.stringify({name,readyMs:row.timing.gameReady}));
  }finally{await f.close();}
 }finally{await browser.close();browser=null;}
}
(async()=>{
 for(let i=0;i<5;i++){await sample(`baseline-${i+1}`,baseline);await sample(`candidate-${i+1}`,candidate);}
 await sample('candidate-sdk-delay-1000ms',candidate,{sdkDelay:1000});
 await sample('candidate-cloud-delay-2000ms',candidate,{loadDelay:2000});
 browser=await game.start();let decoder;
 try{const f=await game.fixture({releaseRoot:candidate,dpr:2,touch:true,mobile:true});
  try{
   const src=fs.readFileSync(path.join(candidate,'runtime/youtube-geo.js'),'utf8'),start=src.indexOf('async function decodeEnvironment('),end=src.indexOf('\n  const controller',start);
   assert(start>=0&&end>start);
   decoder=await f.page.evaluate(async({source,files})=>{
    const decode=new Function('ENV_BYTES','MAGIC','DELTA_MAGIC','return ('+source+');')(768*1024*4*2,'HSENV001','HSENV002');
    const inputs=files.map(s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0))),times=[[],[]];let values;
    for(let round=0;round<5;round++){
     values=[];
     for(let i=0;i<2;i++){const at=performance.now();values[i]=await decode(inputs[i]);times[i].push(performance.now()-at);}
    }
    let identical=values[0].length===values[1].length;
    for(let i=0;identical&&i<values[0].length;i++)if(values[0][i]!==values[1][i])identical=false;
    return{identical,halfFloatValues:values[0].length,decodeMs:times};
   },{source:src.slice(start,end),files:[baseline,candidate].map(root=>fs.readFileSync(path.join(root,'runtime/room-env.dat')).toString('base64'))});
   assert.equal(decoder.identical,true);assert.deepEqual(f.errors,[]);
  }finally{await f.close();}
 }finally{await browser.close();browser=null;}
 const result={environment:{browser:'Chromium',version:'151 headless shell',gpu:'ANGLE SwiftShader software renderer',viewport:[390,844],dpr:2,network:'local route fulfillment; no real host/CDN latency or bandwidth',cold:'fresh browser process per sample; OS/GPU caches not purged',physicalPhone:false},samples,decoder};
 fs.writeFileSync(path.join(output,'startup-audit.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({decoder}));
})().catch(async error=>{console.error(error);await browser?.close();process.exitCode=1;});
