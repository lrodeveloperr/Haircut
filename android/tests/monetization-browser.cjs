'use strict';
// Actual packaged Android game/transport, with controlled native ad receipts (no live ads).
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../..'),build=path.join(root,'source/build');

function hostFixture(){
  window.__native={ready:0,ads:[],outcome:'hold',reviews:[]};
  window.AndroidHost={
    request(id,op,payload){setTimeout(()=>{
      if(op==='save')localStorage.setItem('android-test-envelope',JSON.parse(payload));
      __androidHost.complete(id,true,op==='load'?localStorage.getItem('android-test-envelope')||'{}':'');
    },5);},
    gameReady(){__native.ready++;},
    showInterstitial(placement){
      __native.ads.push(placement);
      setTimeout(()=>__androidHost.ad('interstitial',__native.outcome==='fail'?'failed':'opened'),10);
    },
    showRewarded(){setTimeout(()=>__androidHost.ad('rewarded','failed'),10);},
    reviewMoment(...args){__native.reviews.push(args);},shareGame(){},
  };
}

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,
    args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const errors=[];
  try{
    const context=await browser.newContext({viewport:{width:390,height:778},deviceScaleFactor:1,hasTouch:true});
    await context.route('**/*',async route=>{
      const u=new URL(route.request().url());
      if(u.hostname!=='monetization.test')return route.fulfill({status:404,body:''});
      const file=path.resolve(build,'.'+(u.pathname==='/'?'/index.html':u.pathname));
      if(!file.startsWith(build+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
      const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.json':'application/json'};
      return route.fulfill({path:file,contentType:type[path.extname(file)]||'application/octet-stream'});
    });
    await context.addInitScript(hostFixture);
    const page=await context.newPage();page.setDefaultTimeout(120000);
    page.on('pageerror',error=>errors.push(error.message));
    const ready=()=>page.waitForFunction(()=>window.skinFadeStudio&&HSC.startupTiming?.firstPlayable&&!document.body.inert&&!skinFadeStudio.getView().paused);
    await page.goto('http://monetization.test/');await ready();
    // These are game-window sizes AFTER the native adaptive banner and 16dp spacer.
    const layouts=[];
    for(const [width,height]of [[390,778],[844,324],[800,1174],[1280,694]]){
      await page.setViewportSize({width,height});
      await page.waitForFunction(()=>{
        const c=document.querySelector('#scene'),r=HSC.detail.pixelRatio(c.clientWidth,c.clientHeight);
        return c.width===Math.floor(c.clientWidth*r)&&c.height===Math.floor(c.clientHeight*r);
      });
      const layout=await page.evaluate(()=>{
        const names=['.clip-toggle','.ctl.finish',...Array.from({length:5},(_,i)=>`.guard-arc [role="radio"]:nth-of-type(${i+1})`)];
        return {width:innerWidth,height:innerHeight,profile:HSC.detail.level,
          controls:names.map(selector=>{
            const node=document.querySelector(selector);if(!node)return {selector,missing:true};
            const r=node.getBoundingClientRect();return {selector,x:r.left+r.width/2,y:r.top+r.height/2};
          })};
      });
      assert.equal(layout.profile,'high');
      for(const control of layout.controls){
        assert(!control.missing,JSON.stringify(control));
        assert(control.x>=0&&control.x<width&&control.y>=0&&control.y<height,JSON.stringify({layout,control}));
      }
      layouts.push(layout);
    }
    await page.setViewportSize({width:390,height:778});
    // One customer: hammer the engine's Next route throughout the reveal. It must
    // neither advance before the ad nor display an ad over a new haircut.
    const first=await page.evaluate(async()=>{
      const g=skinFadeStudio,job=g.getState().jobId;
      window.__earlyAdvance=false;
      g.finish();
      window.__hammer=setInterval(async()=>{
        if(await g.next())__earlyAdvance=true;
      },10);
      return job;
    });
    await page.waitForFunction(()=>__native.ads.length===1&&skinFadeStudio.getView().busy);
    await page.evaluate(()=>clearInterval(__hammer));
    assert.equal(await page.evaluate(()=>__earlyAdvance),false);
    assert.equal(await page.evaluate(()=>skinFadeStudio.getState().jobId),first);
    assert.equal(await page.evaluate(()=>skinFadeStudio.getState().status),'reveal');
    assert.equal(await page.locator('.training-continue').isDisabled(),true);
    await page.evaluate(()=>__androidHost.ad('interstitial','closed'));
    await page.waitForFunction(()=>!skinFadeStudio.getView().busy&&!skinFadeStudio.getView().paused);
    await page.getByRole('button',{name:'Next customer',exact:true}).click();
    await page.waitForFunction(()=>skinFadeStudio.getState().status==='cutting');
    // A second completion immediately afterwards must still request an ad.
    await page.evaluate(()=>skinFadeStudio.finish());
    await page.waitForFunction(()=>__native.ads.length===2&&skinFadeStudio.getView().busy);
    await page.evaluate(()=>__androidHost.ad('interstitial','closed'));
    await page.waitForFunction(()=>!skinFadeStudio.getView().busy&&!skinFadeStudio.getView().paused);
    await page.getByRole('button',{name:'Next customer',exact:true}).click();
    await page.waitForFunction(()=>skinFadeStudio.getState().status==='cutting');
    await page.evaluate(()=>{__native.outcome='fail';skinFadeStudio.finish();});
    await page.waitForFunction(()=>__native.ads.length===3&&!skinFadeStudio.getView().busy&&!skinFadeStudio.getView().paused);
    assert.equal(await page.locator('.training-continue').isEnabled(),true,'no fill releases the completion');
    await page.evaluate(async()=>(await HSC.youtubeClientPromise).flushProgress());
    await page.reload();await ready();
    assert.equal(await page.evaluate(()=>skinFadeStudio.getState().status),'reveal');
    assert.equal(await page.evaluate(()=>__native.ads.length),0,'restoring a completed reveal does not duplicate the ad');
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed:true,layouts,checks:['rapid Next cannot bypass','first customer monetized','successive customer monetized without 60-second gate','no fill releases Next','restored reveal does not replay an ad','full-detail renderer preserved','controls stay inside reduced game window']},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
