'use strict';
// Native transport + real working engine; native disk/WebView behavior is covered by apk.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../..'), build = path.join(root, 'source/build');
const types = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.json':'application/json'};
function fakeHost() {
  window.__native = {ready:0, outcome:'reward', delay:10, failWrites:false, ads:[]};
  window.AndroidHost = {
    request(id, op, payload) {
      setTimeout(() => {
        if(op === 'save' && __native.failWrites) return __androidHost.complete(id, false, 'Android storage write failed');
        if(op === 'save') localStorage.setItem('fake-android-envelope', JSON.parse(payload));
        __androidHost.complete(id, true, op === 'load' ? localStorage.getItem('fake-android-envelope') || '{}' : '');
      }, __native.delay);
    },
    gameReady() {__native.ready++;},
    showRewarded(p) {
      __native.ads.push(p);
      ({reward:['opened','rewarded','closed'],dismiss:['opened','closed'],fail:['failed']}[__native.outcome])
        .forEach((s,i)=>setTimeout(()=>__androidHost.ad('rewarded',s),120*(i+1)));
    },
    showInterstitial(){setTimeout(()=>__androidHost.ad('interstitial','failed'),20);},
  };
}
(async()=>{
  const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  let passed=0;
  try {
    const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true});
    const external=[];
    await ctx.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.hostname!=='release.test'){external.push(url.href);return route.fulfill({status:404,body:''});}
      const file=path.join(build,url.pathname==='/'?'index.html':url.pathname);
      if(!file.startsWith(build+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
      return route.fulfill({path:file,contentType:types[path.extname(file)]||'application/octet-stream'});
    });
    await ctx.addInitScript(fakeHost);
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(120000);
    const boot=async()=>{
      await page.goto('http://release.test/?detail=low');
      await page.waitForFunction(()=>window.skinFadeStudio && HSC.startupTiming?.firstPlayable && !document.body.inert && __native.ready===1);
      await page.addStyleTag({content:'*{animation-play-state:paused!important}'});
    };
    const buffer=()=>page.waitForFunction(()=>{
      const c=document.querySelector('#scene'),r=HSC.detail.pixelRatio(c.clientWidth,c.clientHeight);
      return c.width===Math.floor(c.clientWidth*r)&&c.height===Math.floor(c.clientHeight*r)&&!skinFadeStudio.getView().paused;
    });
    await boot();
    assert.equal(await page.evaluate(async()=>(await HSC.youtubeClientPromise).platformId),'android');
    assert.deepEqual(external,[]);passed++;
    for(const [width,height]of[[390,844],[844,390],[800,1280],[1280,800]]){
      await page.setViewportSize({width,height});await buffer();
      assert.deepEqual(await page.evaluate(()=>[HSC.detail.level,HSC.detail.minStrands,HSC.detail.segments,HSC.detail.antialias]),['high',30000,8,true]);
      const p=await page.evaluate(()=>{
        if(skinFadeStudio.getState().interactionMode!=='cut')skinFadeStudio.toggleClipper();
        skinFadeStudio.selectGuard(0);const b=HSC.view.headScreen();
        for(const y of[.3,.4,.5,.6])for(const x of[.5,.4,.6]){
          const p={x:b.left+(b.right-b.left)*x,y:b.top+(b.bottom-b.top)*y};
          if((()=>{const hit=HSC.view.raycast(p.x,p.y);return hit&&hit.kind!=='beard';})()){
            window.__rays=[];const ray=HSC.view.raycast;
            HSC.view.raycast=(x,y)=>{__rays.push([x,y]);return ray(x,y);};return {...p,gap:Math.min(72,document.querySelector('#scene').clientHeight*.12)};
          }
        }throw Error('head must remain reachable after resize');
      });
      const session=await ctx.newCDPSession(page);
      await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y+p.gap,radiusX:8,radiusY:8}]});
      await page.waitForTimeout(60);
      await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      const rays=await page.evaluate(()=>__rays);
      assert(rays.some(([x,y])=>Math.abs(x-p.x)<1&&Math.abs(y-p.y)<1),'touch and visible blade share the exact YouTube ray target');
      await page.evaluate(()=>{__rays=[];});
      await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.up();
      assert((await page.evaluate(()=>__rays)).some(([x,y])=>Math.abs(x-p.x)<1&&Math.abs(y-p.y)<1),'mouse remains direct, exactly as YouTube');
      await session.detach();passed++;
    }
    const saved=await page.evaluate(async()=>{
      const c=await HSC.youtubeClientPromise;await c.flushProgress();return JSON.stringify(skinFadeStudio.getState().hair);
    });
    await boot();assert.equal(await page.evaluate(()=>JSON.stringify(skinFadeStudio.getState().hair)),saved);passed++;
    // A delayed durable acknowledgement must not block input/event-loop timers.
    assert.deepEqual(await page.evaluate(async()=>{
      __native.delay=250;let timer=false,done=false;
      const c=await HSC.youtubeClientPromise,p=c.saveProgress('probe',{ok:true}).then(()=>{done=true;});
      await new Promise(r=>setTimeout(()=>{timer=true;r();},30));const early=done;await p;__native.delay=10;return[timer,early,done];
    }),[true,false,true]);passed++;
    await page.evaluate(()=>{__native.failWrites=true;});
    await assert.rejects(page.evaluate(async()=>(await HSC.youtubeClientPromise).saveProgress('probe',{ok:false})),/write failed/);
    await page.evaluate(()=>{__native.failWrites=false;});passed++;
    // Reward receipts are real-earned only, and the two-credit policy persists.
    const key=await page.evaluate(()=>HSC.wardrobe.data.pick.clipper);
    await page.locator('#hsc-hud .hsc-rw').click();
    await page.locator('.hsc-vbtn').click();
    await page.waitForFunction(k=>HSC.wardrobe.data.progress[k]===1,key);
    await page.evaluate(async()=>(await HSC.youtubeClientPromise).flushProgress());
    await boot();assert.equal(await page.evaluate(k=>HSC.wardrobe.data.progress[k],key),1);passed++;
    await page.locator('#hsc-hud .hsc-rw').click();
    for(const outcome of['dismiss','fail']){
      await page.evaluate(o=>{__native.outcome=o;},outcome);await page.locator('.hsc-vbtn').click();
      await page.waitForFunction(()=>!document.querySelector('.hsc-vbtn').disabled&&!document.body.inert);
      assert.equal(await page.evaluate(k=>HSC.wardrobe.data.progress[k],key),1);
    }passed++;
    await page.evaluate(()=>{__native.outcome='reward';});await page.locator('.hsc-vbtn').click();
    await page.waitForFunction(k=>HSC.rewards.owns(k),key);passed++;
    assert.equal(await page.evaluate(()=>__androidHost.back()),true);
    await page.locator('#hsc-panel.open').waitFor({state:'hidden'});passed++;
    await page.evaluate(()=>__androidHost.pause(true));assert.equal(await page.evaluate(()=>skinFadeStudio.getView().paused),true);
    await page.evaluate(()=>__androidHost.pause(false));await buffer();passed++;
    await page.evaluate(()=>{
      const c=document.querySelector('#scene'),gl=c.getContext('webgl2'),ext=gl.getExtension('WEBGL_lose_context');
      c.addEventListener('webglcontextlost',()=>setTimeout(()=>ext.restoreContext(),150),{once:true});ext.loseContext();
    });
    await page.waitForFunction(()=>!document.querySelector('#scene').getContext('webgl2').isContextLost()&&!skinFadeStudio.getView().paused);
    await buffer();passed++;
    assert.deepEqual(errors,[]);console.log(`PASS: ${passed} working Android runtime browser cases.`);
  }catch(e){console.error(`FAIL after ${passed}:`,e);process.exitCode=1;}finally{await browser.close();}
})();
