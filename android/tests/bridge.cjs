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
  const browser=await chromium.launch({...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  let passed=0,reviewPage;
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
    const page=reviewPage=await ctx.newPage(),errors=[];
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
      const session=await ctx.newCDPSession(page);
      const zoomProbe=await page.evaluate(()=>{
        const parent=document.querySelector('.ui'),probe=document.createElement('div');
        probe.style.cssText='position:fixed;left:0;top:0;width:10px;height:10px;zoom:2;visibility:hidden;pointer-events:none';
        parent.append(probe);const width=probe.getBoundingClientRect().width,scale=parseFloat(getComputedStyle(parent).zoom)||1;probe.remove();return{width,scale};
      });
      assert(Math.abs(zoomProbe.width-20*zoomProbe.scale)<.25,'UI client rects must include cumulative CSS zoom');
      for(const guard of [3,1]){
        const p=await page.evaluate(g=>{
          const button=document.querySelector(`#hud [role="radio"][aria-label^="Guard ${g},"]`),r=button.getBoundingClientRect();
          window.__guardContact=null;window.addEventListener('pointerdown',e=>{__guardContact={trusted:e.isTrusted,label:e.target.closest('button')?.getAttribute('aria-label')};},{capture:true,once:true});
          return{x:r.left+r.width/2,y:r.top+r.height/2};
        },guard);
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,radiusX:8,radiusY:8}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await page.waitForFunction(g=>skinFadeStudio.getState().selectedGuard===g,guard,{timeout:5000});
        const touch=await page.evaluate(()=>__guardContact);
        assert(touch?.trusted&&touch.label.startsWith(`Guard ${guard},`),'real touch must select the visible intermediate guard');
      }
      if(process.env.ANDROID_GUARD_ONLY==='1'){await session.detach();passed++;continue;}
      for(const region of (process.env.ANDROID_PLACEMENT_SMOKE==='1'?['top-scalp']:['top-scalp','sideburn','beard','lower-scalp'])){
        console.log('REGION',width,height,region);
        const p=await page.evaluate(region=>{
          if(skinFadeStudio.getState().interactionMode!=='cut')skinFadeStudio.toggleClipper();
          skinFadeStudio.selectGuard(0);
          const yaw=region==='beard'?180:region==='sideburn'?-90:-55;
          skinFadeStudio.turn(yaw-skinFadeStudio.getState().cameraYawDeg);
          const b=HSC.view.headScreen();
          const rows=region==='beard'?Array.from({length:Math.max(0,Math.ceil((innerHeight-25-b.bottom)/24))},(_,i)=>b.bottom+i*24):
            (region==='top-scalp'?[.2,.25,.3,.35]:region==='sideburn'?[.8,.95,1.1,1.25,.65]:[.9,1,1.1,1.2]).map(fy=>b.top+(b.bottom-b.top)*fy);
          for(const cy of rows)
          for(const fx of(region==='sideburn'?[.15,.85,.25,.75,.35,.65]:[.5,.4,.6,.3,.7,.2,.8])){
            const contact={clientX:b.left+(b.right-b.left)*fx,clientY:cy,pointerType:'touch'};
            if(contact.clientY<25||contact.clientY>innerHeight-25)continue;
            const t=HSC.view.touchTarget(contact),hit=HSC.view.raycast(t.x,t.y);
            if(hit&&(region==='beard'?hit.kind==='beard':hit.kind!=='beard')&&(region!=='sideburn'||(Math.abs(hit.position[0])>.7&&hit.v<.4))&&(region!=='top-scalp'||hit.v>.65)&&(region!=='lower-scalp'||hit.v<.3)){
              window.__placementContact=null;
              window.addEventListener('pointerdown',e=>window.__placementContact={x:e.clientX,y:e.clientY,type:e.pointerType,id:e.pointerId,trusted:e.isTrusted},{capture:true,once:true});
              return {x:contact.clientX,y:contact.clientY};
            }
          }
          throw Error('No reachable '+region+' touch target');
        },region);
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,radiusX:8,radiusY:8}]});
        await page.waitForFunction(()=>HSC.view.clipperScreen().visible);
        await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const geometry=await page.evaluate(()=>({contact:__placementContact,model:HSC.view.clipperScreen(),cut:window.HSC.lastCut}));
        console.log('PLACEMENT',JSON.stringify({width,height,region,...geometry}));
        await page.evaluate(({p,geometry,region})=>{
          const overlay=document.createElement('div');overlay.id='placement-diagnostic';overlay.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:99999';
          for(const [name,point,color,size]of[['contact',p,'#ff4060',48],['teeth',geometry.model.teeth,'#00ffff',8],['grip',geometry.model.grip,'#ffff00',8]]){
            const m=document.createElement('div');m.dataset.point=name;m.style.cssText=`position:absolute;left:${point.x-size/2}px;top:${point.y-size/2}px;width:${size}px;height:${size}px;border:2px solid ${color};border-radius:50%;box-sizing:border-box`;overlay.append(m);
          }
          document.body.append(overlay);
          (window.__placementEvidence||=[]).push({region,...geometry});
        },{p,geometry,region});
        await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const dir=path.join(root,'qa/results');fs.mkdirSync(dir,{recursive:true});
        await page.screenshot({path:path.join(dir,`android-browser-placement-${width}x${height}-${region}.png`)});
        assert(geometry.contact?.trusted&&geometry.contact.type==='touch');
        assert(geometry.model.visible,'actual model must be visible while touch is held');
        const {teeth,grip,target}=geometry.model;
        assert(Math.hypot(teeth.x-target.x,teeth.y-target.y)<5,'projected teeth must agree with the real cutting surface');
        assert(p.y-teeth.y>=34,'real teeth must clear24px occlusion radius by at least10px');
        assert(p.y-teeth.y<=50,'candidate must avoid the previously excessive portrait gap');
        assert(geometry.model.gap>=36&&geometry.model.gap<=45,'requested gap obeys measured visibility bounds');
        await page.evaluate(()=>document.querySelector('#placement-diagnostic').remove());
        let validMoves=0;
        for(const [dx,dy]of(process.env.ANDROID_PLACEMENT_SMOKE==='1'?[[8,0]]:[[8,0],[-8,8],[0,-8]])){
          const contact={x:p.x+dx,y:p.y+dy};
          await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...contact,radiusX:8,radiusY:8}]});
          await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
          const moved=await page.evaluate(()=>HSC.view.clipperScreen());
          if(!moved.visible||!moved.target)continue; // off the model correctly hides the tool
          validMoves++;
          assert.equal(moved.gap,geometry.model.gap,'gap must not jump across surface normals during a stroke');
          assert(Math.hypot(moved.teeth.x-moved.target.x,moved.teeth.y-moved.target.y)<5,'moved actual teeth track cutter');
          assert(contact.y-moved.teeth.y>=34&&contact.y-moved.teeth.y<=50,'moved blade stays outside occlusion envelope');
          await page.evaluate(item=>__placementEvidence.push(item),{region,move:true,contact,model:moved});
        }
        assert(validMoves>0,'at least one held move must remain on '+region);
        await session.send('Input.dispatchTouchEvent',{type:region==='sideburn'?'touchCancel':'touchEnd',touchPoints:[]});
        assert.equal(await page.evaluate(()=>HSC.view.clipperScreen().gap),null,'end/cancel releases per-stroke clearance');
        // A second real stroke must acquire a new gap after release.
        await page.evaluate(()=>window.addEventListener('pointerdown',e=>{__placementContact={id:e.pointerId};},{capture:true,once:true}));
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,radiusX:8,radiusY:8}]});
        await page.waitForFunction(()=>HSC.view.clipperScreen().visible);
        const reused=await page.evaluate(()=>({id:__placementContact.id,gap:HSC.view.clipperScreen().gap}));
        console.log('POINTER-REUSE',JSON.stringify({previous:geometry.contact.id,current:reused.id,gap:reused.gap}));
        assert(reused.gap>=36&&reused.gap<=45,'reused pointer receives bounded new stroke gap');
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert.equal(await page.evaluate(()=>HSC.view.clipperScreen().gap),null);
      }
      // Mouse/pen continue to target their actual pointer, independent of touch grip placement.
      const mouse=await page.evaluate(()=>{const b=HSC.view.headScreen();return{x:b.x,y:b.y};});
      await page.mouse.move(mouse.x,mouse.y);await page.mouse.down();
      await page.waitForFunction(()=>HSC.view.clipperScreen().visible);
      const m=await page.evaluate(()=>HSC.view.clipperScreen());
      assert(Math.hypot(m.target.x-mouse.x,m.target.y-mouse.y)<2,'mouse target remains direct');
      await page.mouse.up();
      const reuse=await page.evaluate(p=>{
        const v=HSC.view,a={clientX:p.x,clientY:p.y,pointerType:'touch',pointerId:777};
        const first=v.touchTarget(a),moved=v.touchTarget({...a,clientY:a.clientY+12});
        v.resetTouchTarget();const cleared=v.clipperScreen().gap;
        const preview=v.touchTarget({clientX:a.clientX,clientY:a.clientY+12,pointerType:'touch'});
        const next=v.touchTarget({...a,clientY:a.clientY+12});
        v.resetTouchTarget();
        const pen=v.touchTarget({...a,pointerType:'pen'});
        return{first,moved,cleared,preview,next,pen};
      },mouse);
      assert.equal(reuse.first.gap,reuse.moved.gap,'same pointer retains one gap within stroke');
      assert.equal(reuse.cleared,null,'explicit interruption clears cached ID');
      assert.equal(reuse.next.gap,reuse.preview.gap,'reused pointer ID computes fresh target after reset');
      assert.deepEqual(reuse.pen,{x:mouse.x,y:mouse.y,gap:0},'pen remains direct');
      await session.detach();passed++;
    }
    if(process.env.ANDROID_GUARD_ONLY==='1'||process.env.ANDROID_PLACEMENT_SMOKE==='1'){assert.deepEqual(errors,[]);console.log(`PASS: ${passed} Android zoom/guard and ${process.env.ANDROID_PLACEMENT_SMOKE==='1'?'four-layout placement smoke':'compatibility'} cases with zero page errors.`);return;}
    fs.writeFileSync(path.join(root,'qa/results/android-browser-placement-report.json'),JSON.stringify(await page.evaluate(()=>window.__placementEvidence||[]),null,2));
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
  }catch(e){console.error(`FAIL after ${passed}:`,e);process.exitCode=1;}finally{
    if(reviewPage)try{const dir=path.join(root,'qa/results');fs.mkdirSync(dir,{recursive:true});const evidence=await reviewPage.evaluate(()=>window.__placementEvidence||[]);if(evidence.length)fs.writeFileSync(path.join(dir,'android-browser-placement-report.json'),JSON.stringify(evidence,null,2));}catch(_){}
    await browser.close();}
})();
