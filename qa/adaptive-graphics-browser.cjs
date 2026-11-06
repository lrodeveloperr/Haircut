'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const harness=require('./youtube-browser.cjs');
const out=path.resolve(process.env.QA_OUTPUT||'qa/results/adaptive-graphics');
fs.mkdirSync(out,{recursive:true});

(async()=>{
 await harness.start();
 const evidence={};
 try{
  for(const level of ['potato','ultra']){
   const f=await harness.fixture({graphics:level,viewport:{width:390,height:844},dpr:3,touch:true});
   try{
    const before=await harness.state(f.page);
    await f.page.evaluate(()=>{
     const person=HSC.makePerson(314159,{beard:'full',noLoss:true});
     HSC.view.setPerson(person);HSC.view.setBeard(HSC.beardStartFor(person));
     HSC.view.setYaw(-55);HSC.view.setElevation(10);HSC.view.render(false);
     const canvas=document.getElementById('scene');
     for(const element of document.querySelectorAll('body *'))if(element!==canvas&&!element.contains(canvas))element.style.visibility='hidden';
    });
    await f.page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const metrics=await f.page.evaluate(()=>{
     const c=document.getElementById('scene'),d=HSC.graphicsDiagnostics();
     return{...d,buffer:[c.width,c.height],css:[c.clientWidth,c.clientHeight],hairCells:skinFadeStudio.getState().hair.length};
    });
    assert.equal(metrics.level,level);assert.equal(metrics.hairCells,8192);assert.deepEqual((await harness.state(f.page)).hair,before.hair);
    if(level==='potato'){assert.deepEqual(metrics.strands,[12000,14000]);assert.equal(metrics.segments,5);assert(metrics.buffer[0]*metrics.buffer[1]<=1500000);}
    else{assert.deepEqual(metrics.strands,[24000,30000]);assert.equal(metrics.segments,8);assert(metrics.buffer[0]*metrics.buffer[1]<=4000000);}
    await f.page.locator('#scene').screenshot({path:path.join(out,`${level}.png`),timeout:60000});
    evidence[level]=metrics;assert.deepEqual(f.errors,[]);
   }finally{await f.close();}
  }
  fs.writeFileSync(path.join(out,'evidence.json'),JSON.stringify(evidence,null,2));
  console.log('PASS: seeded Potato and Ultra renders preserve 8,192-cell gameplay and profile ceilings.');
 }finally{await harness.stop();}
})().catch(error=>{console.error(error);process.exitCode=1;});
