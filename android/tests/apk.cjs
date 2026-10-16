'use strict';
// Exercise the installed debug APK's actual Android WebView, native input, private disk saves,
// lifecycle and phone/tablet window changes. No browser replacement or fake AndroidHost.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const app='com.worksbien.barbersimulatorasmr.debug',activity=app+'/com.worksbien.barbersimulatorasmr.MainActivity';
const out=path.resolve('qa/results');fs.mkdirSync(out,{recursive:true});
const adbPath=path.join(process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT,'platform-tools/adb');
const adb=(...args)=>{console.log('adb',...args);return execFileSync(adbPath,args,{encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024}).trim();};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const report={checks:[],layouts:[]};let browser,page;
function check(name){report.checks.push(name);console.log('PASS:',name);}
// WebView intentionally lacks browser-context/download APIs required by desktop Playwright.
// Attach directly to the inspected page with standard CDP, leaving the native app in control.
async function attach(target) {
  const socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  let id=0;const pending=new Map(),handlers=new Map();
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.id){const p=pending.get(message.id);if(!p)return;pending.delete(message.id);clearTimeout(p.timer);message.error?p.reject(Error(message.error.message)):p.resolve(message.result);}
    else for(const fn of handlers.get(message.method)||[])fn(message.params);
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error('CDP timed out: '+method));},120000);
    pending.set(key,{resolve,reject,timer});socket.send(JSON.stringify({id:key,method,params}));
  });
  const evaluate=async(fn,arg)=>{
    const response=await send('Runtime.evaluate',{expression:'('+fn.toString()+')('+(arg===undefined?'undefined':JSON.stringify(arg))+')',awaitPromise:true,returnByValue:true,userGesture:true});
    if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);
    return response.result.value;
  };
  await send('Runtime.enable');
  browser={close:async()=>socket.close()};
  page={evaluate,send,on(name,fn){if(name==='pageerror')handlers.set('Runtime.exceptionThrown',[p=>fn(Error(p.exceptionDetails.exception?.description||p.exceptionDetails.text))]);},
    async waitForFunction(fn,arg,options={}){const deadline=Date.now()+(options.timeout||120000);while(Date.now()<deadline){if(await evaluate(fn,arg))return;await pause(250);}throw Error('Installed page condition timed out: '+fn.toString());}};
}
async function connect(){
  for(let n=0;n<30;n++){
    try{
      const pid=adb('shell','pidof',app).split(' ')[0];
      adb('forward','tcp:9222','localabstract:webview_devtools_remote_'+pid);
      const targets=await(await fetch('http://127.0.0.1:9222/json/list',{signal:AbortSignal.timeout(5000)})).json();
      const target=targets.find(p=>p.url.includes('appassets.androidplatform.net'));
      if(target){await attach(target);return;}
      console.log('WebView target pending:',targets.map(p=>p.url));
    }catch(e){console.log('CDP connecting:',e.message);}
    await pause(500);
  }throw Error('installed WebView remote debugging unavailable');
}
async function ready(){
  await page.waitForFunction(()=>window.skinFadeStudio&&HSC.startupTiming?.firstPlayable&&!document.body.inert&&!skinFadeStudio.getView().paused,{},{timeout:120000});
  await page.waitForFunction(()=>{
    const c=document.querySelector('#scene'),r=HSC.detail.pixelRatio(c.clientWidth,c.clientHeight);
    return c.width===Math.floor(c.clientWidth*r)&&c.height===Math.floor(c.clientHeight*r);
  });
}
async function screenshot(name){const png=execFileSync(adbPath,['exec-out','screencap','-p'],{timeout:30000,maxBuffer:32*1024*1024});fs.writeFileSync(path.join(out,'android-installed-'+name+'.png'),png);return png;}
async function privacy(layout) {
  const tap = async selector => {
    const p=await page.evaluate(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};},selector);
    const b=layout.nativeBounds,v=layout.visualViewport;
    adb('shell','input','tap',String(Math.round(b.left+(p.x-v.offsetLeft)*(b.right-b.left)/v.width)),String(Math.round(b.top+(p.y-v.offsetTop)*(b.bottom-b.top)/v.height)));
  };
  const before=await page.evaluate(()=>JSON.stringify(skinFadeStudio.getState().hair));
  await tap('.hsc-rw');
  await page.waitForFunction(()=>document.querySelector('#hsc-panel.open .hsc-privacy')&&skinFadeStudio.getView().paused);
  const geometry=await page.evaluate(()=>{
    const button=document.querySelector('.hsc-privacy');
    const measure=()=>[...document.querySelectorAll('#hsc-panel button:not(.hsc-privacy),.hsc-sheet,.hsc-head,.hsc-pick,.hsc-coll,.hsc-grid')].map(el=>{const r=el.getBoundingClientRect();return[r.x,r.y,r.width,r.height];});
    button.style.display='none';const before=measure();button.style.display='';const after=measure();
    const p=button.getBoundingClientRect(),c=document.querySelector('.hsc-head .hsc-x:not(.hsc-privacy)').getBoundingClientRect();
    return{before,after,privacy:[p.x,p.y,p.width,p.height],close:[c.x,c.y,c.width,c.height],gap:c.left-p.right};
  });
  assert.deepEqual(geometry.after,geometry.before,'native privacy icon must not move existing wardrobe elements');
  assert(Math.abs(geometry.privacy[1]-geometry.close[1])<.1&&Math.abs(geometry.privacy[2]-geometry.close[2])<.1&&Math.abs(geometry.privacy[3]-geometry.close[3])<.1&&geometry.gap>0,'native shield matches Close size and alignment');
  await screenshot(layout.name+'-wardrobe-privacy');
  await tap('.hsc-privacy');
  let activities='';
  for(let attempt=0;attempt<20;attempt++) {
    activities=adb('shell','dumpsys','activity','activities');
    if(activities.includes('https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/') &&
       /(?:mResumedActivity|topResumedActivity).*ActivityRecord.*\}/.test(activities) &&
       !activities.split('\n').filter(line=>/(?:mResumedActivity|topResumedActivity)/.test(line)).some(line=>line.includes(app))) break;
    await pause(500);
  }
  fs.writeFileSync(path.join(out,'android-installed-'+layout.name+'-privacy-external-intent.txt'),activities);
  assert(activities.includes('act=android.intent.action.VIEW')&&activities.includes('https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/'),'trusted native tap sends the policy URL to Android external browser handling');
  const resumed=activities.split('\n').filter(line=>/(?:mResumedActivity|topResumedActivity)/.test(line));
  assert(resumed.length&&!resumed.some(line=>line.includes(app)),'external browser handling takes focus outside the game');
  await screenshot(layout.name+'-privacy-external');
  // Network is disabled in this emulator. Verify the actual external intent here;
  // deployment/content availability is verified separately on the public website.
  adb('shell','am','start','-W','-n',activity);
  await page.waitForFunction(()=>document.querySelector('#hsc-panel.open')&&skinFadeStudio.getView().paused);
  assert.equal(await page.evaluate(()=>JSON.stringify(skinFadeStudio.getState().hair)),before,'returning from the external policy preserves haircut');
  await tap('.hsc-head .hsc-x:not(.hsc-privacy)');
  await page.waitForFunction(()=>!skinFadeStudio.getView().paused);
  layout.privacy={existingBoundsUnchanged:true,alignment:geometry,externalPolicyOpened:true,hairPreserved:true};
  check(layout.name+' privacy icon preserves all existing wardrobe bounds');
  check(layout.name+' trusted native privacy tap opens external policy and preserves haircut/pause');
}
// Decode the actual Android PNG to require composited marker pixels, not merely DOM existence.
function markerPixels(png,contact,teeth,scale){
  const {width,height,data:pixels}=require('pngjs').PNG.sync.read(png),channels=4,stride=width*channels;
  const count=(point,radius,predicate)=>{let n=0;for(let y=Math.max(0,Math.floor(point[1]-radius));y<Math.min(height,Math.ceil(point[1]+radius));y++)for(let x=Math.max(0,Math.floor(point[0]-radius));x<Math.min(width,Math.ceil(point[0]+radius));x++){const i=y*stride+x*channels;if(predicate(pixels[i],pixels[i+1],pixels[i+2]))n++;}return n;};
  return{contact:count(contact,26*scale,(r,g,b)=>r>220&&g>35&&g<110&&b>60&&b<160),teeth:count(teeth,6*scale,(r,g,b)=>r<70&&g>200&&b>200)};
}
async function cut(label,layout){
  const p=await page.evaluate(()=>{
    const game=skinFadeStudio,view=HSC.view;
    if(game.getState().interactionMode!=='cut')game.toggleClipper();game.selectGuard(1);
    const state=game.getState(),b=view.headScreen();
    for(const fy of[.45,.55,.65,.35,.75])for(const fx of[.5,.4,.6,.3,.7]){
      const p={x:b.left+(b.right-b.left)*fx,y:b.top+(b.bottom-b.top)*fy};
      if(p.y<24||p.y>innerHeight-24)continue;
      const t=view.touchTarget({clientX:p.x,clientY:p.y,pointerType:'touch'}),hit=view.raycast(t.x,t.y);
      if(hit&&hit.kind!=='beard'&&state.hair[Math.min(63,Math.floor(hit.v*64))*128+Math.min(127,Math.floor(hit.u*128))]>1){
        window.__nativeTouches=[];
        const listener=e=>__nativeTouches.push({x:e.clientX,y:e.clientY,height:e.height,trusted:e.isTrusted,type:e.pointerType});
        if(window.__placementListener)window.removeEventListener('pointerdown',__placementListener,true);
        window.__placementListener=listener;window.addEventListener('pointerdown',listener,true);
        return{...p,before:JSON.stringify(state.hair)};
      }
    }throw Error('No reachable uncut scalp for native contact');
  });
  // Convert using independently observed native WebView bounds and visual viewport.
  const b=layout.nativeBounds,v=layout.visualViewport;
  const nativePoint=(x,y)=>[Math.round(b.left+(x-v.offsetLeft)*(b.right-b.left)/v.width),Math.round(b.top+(y-v.offsetTop)*(b.bottom-b.top)/v.height)];
  const start=nativePoint(p.x,p.y),end=nativePoint(p.x+6,p.y+6);
  adb('shell','input','swipe',String(start[0]),String(start[1]),String(end[0]),String(end[1]),'220');
  await page.waitForFunction(before=>JSON.stringify(skinFadeStudio.getState().hair)!==before,p.before);
  const nativeTouch=await page.evaluate(()=>__nativeTouches[0]);
  assert(nativeTouch?.trusted&&nativeTouch.type==='touch','ADB must produce trusted native touch');
  assert(Math.abs(nativeTouch.x-p.x)<3&&Math.abs(nativeTouch.y-p.y)<3,'native and visual CSS coordinates must agree');
  check(label+' native swipe cuts with verified viewport mapping');
  // Hold in the actual installed WebView using CDP; unlike a timed ADB swipe this has
  // no five-second expiry while a screenshot is composing. The ADB path above is tested separately.
  await page.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,radiusX:8,radiusY:8}]});
  try{
    await page.waitForFunction(()=>HSC.view.clipperScreen().visible);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const geometry=await page.evaluate(()=>HSC.view.clipperScreen());
    report.lastPlacement={label,contact:p,geometry};
    console.log('PLACEMENT',JSON.stringify(report.lastPlacement));
    await page.evaluate(({p,geometry})=>{
      // Preserve the last genuine High frame while DOM markers reach the native compositor.
      const view=HSC.view,render=view.render;window.__placementRenderPin={view,render,skipped:0};
      view.render=function(){__placementRenderPin.skipped++;};
      const overlay=document.createElement('div');overlay.id='placement-diagnostic';overlay.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:99999';
      for(const [name,point,color,size]of[['contact',p,'#ff4060',48],['teeth',geometry.teeth,'#00ffff',8],['grip',geometry.grip,'#ffff00',8]]){
        const m=document.createElement('div');m.dataset.point=name;m.style.cssText=`position:absolute;left:${point.x-size/2}px;top:${point.y-size/2}px;width:${size}px;height:${size}px;border:2px solid ${color};border-radius:50%;box-sizing:border-box`;overlay.append(m);
      }
      document.body.append(overlay);
    },{p,geometry});
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    // Page.captureScreenshot flushes compositor work; the evidence image remains an OS capture.
    await page.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    let markers;
    for(let attempt=0;attempt<3;attempt++){
      const png=await screenshot(label+'-blade-held');
      markers=markerPixels(png,nativePoint(p.x,p.y),nativePoint(geometry.teeth.x,geometry.teeth.y),(b.right-b.left)/v.width);
      if(markers.contact>5&&markers.teeth>3)break;
      await pause(250);
    }
    report.lastPlacement.markers=markers;
    assert(markers.contact>5&&markers.teeth>3,'OS capture must contain actual contact and tooth diagnostic markers');
    await page.evaluate(()=>{const p=__placementRenderPin;p.view.render=p.render;delete window.__placementRenderPin;document.querySelector('#placement-diagnostic')?.remove();});
    // A real move after restoring rendering proves this capture pin cannot conceal a stuck renderer.
    const movedContact={x:p.x+6,y:p.y+4};
    await page.evaluate(()=>{const view=HSC.view,render=view.render;window.__placementRestore={view,render,frames:0};view.render=function(...args){const r=render.apply(this,args);__placementRestore.frames++;return r;};});
    await page.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...movedContact,radiusX:8,radiusY:8}]});
    await page.waitForFunction(()=>__placementRestore.frames>0);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const moved=await page.evaluate(()=>HSC.view.clipperScreen());
    report.lastPlacement.moved={contact:movedContact,geometry:moved};
    assert(moved.visible&&moved.target,'real held move stays on the model after capture');
    assert.equal(moved.gap,geometry.gap,'capture restore preserves the frozen stroke gap');
    assert(Math.hypot(moved.target.x-geometry.target.x,moved.target.y-geometry.target.y)>2,'restored renderer follows actual moved contact');
    assert(Math.hypot(moved.teeth.x-moved.target.x,moved.teeth.y-moved.target.y)<5,'restored real teeth follow cutting surface');
    assert(movedContact.y-moved.teeth.y>=34&&movedContact.y-moved.teeth.y<=50,'restored moving teeth retain visible bounded clearance');
    await page.evaluate(()=>{const p=__placementRestore;p.view.render=p.render;delete window.__placementRestore;});
    assert(geometry.visible,'real rendered clipper must be visible during held touch');
    assert(Math.hypot(geometry.teeth.x-geometry.target.x,geometry.teeth.y-geometry.target.y)<5,'projected teeth must agree with real cutting surface');
    assert(p.y-geometry.teeth.y>=34,'projected blade clears24px occlusion radius by at least10px');
    assert(p.y-geometry.teeth.y<=50,'placement avoids the prior excessive portrait gap');
    assert(geometry.gap>=36&&geometry.gap<=45,'per-stroke gap obeys visibility bounds');
    check(label+' actual tooth/grip projection agrees with held touch');
    return{nativeTouch,contact:p,geometry,markers,moved:{contact:movedContact,geometry:moved}};
  }finally{
    await page.evaluate(()=>{for(const key of ['__placementRestore','__placementRenderPin']){const p=window[key];if(p){p.view.render=p.render;delete window[key];}}document.querySelector('#placement-diagnostic')?.remove();});
    await page.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
}
async function nativeWebViewBounds(){
  // UiAutomation can crash with Binder "Bad file descriptor" after display changes.
  // Retry only that observation, never a failed coordinate/placement assertion.
  // Delete its previous file first so a failed dump cannot reuse stale bounds.
  const observation=(report.nativeInspections??=[]).length;
  for(let attempt=1;attempt<=3;attempt++){
    adb('shell','rm','-f','/sdcard/placement-window.xml');
    let xml;
    try{
      adb('shell','uiautomator','dump','/sdcard/placement-window.xml');
      // UiAutomation can report a null root with exit status zero and create no file.
      xml=adb('shell','cat','/sdcard/placement-window.xml');
    }catch(error){
      (report.nativeInspectionRetries??=[]).push({observation,attempt,error:error.message});
      if(attempt===3)throw error;
      await pause(750);continue;
    }
    const evidence='android-installed-window-'+observation+'.xml';
    fs.writeFileSync(path.join(out,evidence),xml);
    const node=(xml.match(/<node[^>]*>/g)||[]).find(n=>n.includes('class="android.webkit.WebView"')&&n.includes('package="'+app+'"'));
    const m=node?.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    assert(m,'fresh native accessibility hierarchy must expose this app’s WebView bounds');
    const bounds={left:+m[1],top:+m[2],right:+m[3],bottom:+m[4]};
    assert(bounds.right>bounds.left&&bounds.bottom>bounds.top,'native WebView bounds must be nonempty');
    report.nativeInspections.push({observation,attempt,evidence,bounds});
    return bounds;
  }
}
(async()=>{
  const errors=[];
  try{
    adb('logcat','-c');
    // Acknowledge Android's one-time full-screen teaching bubble in this test fixture.
    adb('shell','settings','put','secure','immersive_mode_confirmations','confirmed');
    adb('shell','svc','wifi','disable');adb('shell','svc','data','disable');
    // Background SMS apps in the factory image can show unrelated ANR dialogs under software GPU load.
    for(const pkg of ['com.android.messaging','com.google.android.apps.messaging']){
      try{if(adb('shell','pm','path',pkg).includes('package:'))adb('shell','pm','disable-user','--user','0',pkg);}catch(_){}
    }
    adb('install','-r','android/native/app/build/outputs/apk/debug/app-debug.apk');
    adb('shell','settings','put','system','accelerometer_rotation','0');
    adb('shell','wm','user-rotation','lock','0');
    report.webview=adb('shell','dumpsys','webviewupdate');
    for(const spec of[
      {name:'phone-portrait',size:'1080x1920',density:'420',rotation:0},
      {name:'phone-landscape',size:'1920x1080',density:'420',rotation:1},
      {name:'tablet-portrait',size:'1600x2560',density:'320',rotation:0},
      {name:'tablet-landscape',size:'2560x1600',density:'320',rotation:1},
    ]){
      if(browser){await browser.close();browser=null;}
      adb('shell','am','force-stop',app);
      adb('shell','wm','size',spec.size);adb('shell','wm','density',spec.density);
      adb('shell','wm','user-rotation','lock','0');
      await pause(500);
      // Fresh WebView per density: do not carry stale page scale between fake devices.
      adb('shell','am','start','-W','-n',activity);
      await connect();page.on('pageerror',e=>errors.push(e.message));await ready();
      await page.waitForFunction(landscape=>(innerWidth>innerHeight)===landscape,spec.rotation===1);
      assert.equal(await page.evaluate(async()=>(await HSC.youtubeClientPromise).platformId),'android');
      const nativeBounds=await nativeWebViewBounds();
      const layout=await page.evaluate(()=>{
        const c=document.querySelector('#scene'),gl=c.getContext('webgl2'),d=HSC.detail;
        const rect=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};
        return {width:innerWidth,height:innerHeight,dpr:devicePixelRatio,visualViewport:{width:visualViewport.width,height:visualViewport.height,scale:visualViewport.scale,offsetLeft:visualViewport.offsetLeft,offsetTop:visualViewport.offsetTop},canvas:rect(c),root:rect(document.querySelector('#game')),uiZoom:parseFloat(getComputedStyle(document.querySelector('.ui')).zoom)||1,finishInset:parseFloat(getComputedStyle(document.querySelector('.ctl.finish').closest('.bar')).right),buffer:[c.width,c.height],level:d.level,strands:d.minStrands,segments:d.segments,
          renderer:gl.getParameter(gl.RENDERER),controls:[...document.querySelectorAll('#hud button')].filter(b=>b.getBoundingClientRect().width).map(b=>{
            const r=b.getBoundingClientRect();return{text:b.getAttribute('aria-label')||b.textContent.trim(),x:r.x,y:r.y,width:r.width,height:r.height};
          })};
      });
      layout.nativeBounds=nativeBounds;layout.requestedDisplay=spec;layout.name=spec.name;report.layouts.push(layout);
      assert(Math.abs(layout.visualViewport.scale-1)<.02,'fresh native viewport scale must be1');
      assert(Math.abs(layout.canvas.width-layout.visualViewport.width)<2&&Math.abs(layout.canvas.height-layout.visualViewport.height)<2,'canvas must fill visual viewport');
      assert(Math.abs((nativeBounds.right-nativeBounds.left)/layout.dpr-layout.visualViewport.width)<2,'native width, DPR and viewport must agree');
      assert.equal(layout.level,'high');assert.equal(layout.strands,30000);assert.equal(layout.segments,8);
      for(const b of layout.controls)assert(b.x>=-1&&b.y>=-1&&b.x+b.width<=layout.width+1&&b.y+b.height<=layout.height+1,`control outside ${spec.name}: ${b.text}`);
      const finish=layout.controls.find(b=>b.text==='Finish haircut');
      assert(finish&&Math.abs(finish.x+finish.width-(layout.canvas.x+layout.canvas.width-layout.finishInset*layout.uiZoom))<2,'Finish must visually align with canvas right inset');
      layout.zoomProbe=await page.evaluate(()=>{
        const parent=document.querySelector('.ui'),probe=document.createElement('div');probe.style.cssText='position:fixed;left:0;top:0;width:10px;height:10px;zoom:2;visibility:hidden;pointer-events:none';
        parent.append(probe);const r=probe.getBoundingClientRect();probe.remove();return{width:r.width,height:r.height};
      });
      assert(Math.abs(layout.zoomProbe.width-20*layout.uiZoom)<.25,'native UI rects must include cumulative CSS zoom');
      layout.guardTaps=[];
      for(const guard of [3,1]){
        const p=await page.evaluate(g=>{
          const b=document.querySelector(`#hud [role="radio"][aria-label^="Guard ${g},"]`),r=b.getBoundingClientRect();
          window.__guardTouch=null;window.addEventListener('pointerdown',e=>{__guardTouch={trusted:e.isTrusted,label:e.target.closest('button')?.getAttribute('aria-label')};},{capture:true,once:true});
          return{x:r.left+r.width/2,y:r.top+r.height/2};
        },guard);
        const v=layout.visualViewport,b=layout.nativeBounds;
        adb('shell','input','tap',String(Math.round(b.left+(p.x-v.offsetLeft)*(b.right-b.left)/v.width)),String(Math.round(b.top+(p.y-v.offsetTop)*(b.bottom-b.top)/v.height)));
        await page.waitForFunction(g=>skinFadeStudio.getState().selectedGuard===g,guard,{timeout:5000});
        const touch=await page.evaluate(()=>__guardTouch);assert(touch?.trusted&&touch.label.startsWith(`Guard ${guard},`),'native tap must hit and select the visible intermediate guard');
        layout.guardTaps.push({guard,point:p,touch});
      }
      check(spec.name+' native guard1/3 taps match visible controls');
      layout.name=spec.name;layout.touch=await cut(spec.name,layout);
      await screenshot(spec.name);
      await privacy(layout);
    }
    report.rotations=[];
    let previousContact=report.layouts[report.layouts.length-1].touch.contact;
    for(const size of ['1600x2560','2560x1600']){
      await page.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:previousContact.x,y:previousContact.y,radiusX:8,radiusY:8}]});
      await page.waitForFunction(()=>HSC.view.clipperScreen().visible);
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const held=await page.evaluate(()=>({gap:HSC.view.clipperScreen().gap,hair:JSON.stringify(skinFadeStudio.getState().hair)}));
      assert(held.gap>=36&&held.gap<=45,'live resize must interrupt a real bounded held stroke');
      const before=held.hair;
      adb('shell','wm','size',size); // Same density and live WebView: genuine configuration roundtrip.
      await page.waitForFunction(landscape=>(innerWidth>innerHeight)===landscape,size==='2560x1600');await ready();
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const live=await page.evaluate(()=>{const c=document.querySelector('#scene'),r=c.getBoundingClientRect();return{
        width:innerWidth,height:innerHeight,dpr:devicePixelRatio,visualViewport:{width:visualViewport.width,height:visualViewport.height,scale:visualViewport.scale,offsetLeft:visualViewport.offsetLeft,offsetTop:visualViewport.offsetTop},
        canvas:{x:r.x,y:r.y,width:r.width,height:r.height},gap:HSC.view.clipperScreen().gap,hair:JSON.stringify(skinFadeStudio.getState().hair),level:HSC.detail.level};});
      live.nativeBounds=await nativeWebViewBounds();
      assert.equal(live.hair,before,'same-density live orientation must preserve haircut');delete live.hair;
      assert.equal(live.gap,null,'configuration change releases real held stroke');
      await page.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal(live.level,'high');
      assert(Math.abs(live.visualViewport.scale-1)<.02);
      assert(Math.abs(live.canvas.width-live.visualViewport.width)<2&&Math.abs(live.canvas.height-live.visualViewport.height)<2,'live canvas must fill viewport');
      assert(Math.abs((live.nativeBounds.right-live.nativeBounds.left)/live.dpr-live.visualViewport.width)<2,'live native/CSS mapping stays aligned');
      live.interruptedGap=held.gap;live.touch=await cut('live-'+size,live);previousContact=live.touch.contact;report.rotations.push(live);
      check('same-density live resize '+size+' preserves layout, input and haircut');
    }
    const saved=await page.evaluate(async()=>{await(await HSC.youtubeClientPromise).flushProgress();return JSON.stringify(skinFadeStudio.getState().hair);});
    adb('shell','input','keyevent','KEYCODE_HOME');await pause(500);adb('shell','am','start','-W','-n',activity);await ready();
    assert.equal(await page.evaluate(()=>JSON.stringify(skinFadeStudio.getState().hair)),saved);check('background/resume preserves haircut and releases host pause');
    // Offline/no-fill native ads cannot grant rewards or trap the game in a pause.
    adb('shell','svc','wifi','disable');adb('shell','svc','data','disable');
    const earned=await page.evaluate(async()=>(await HSC.youtubeClientPromise).showRewarded('apk-offline-check'));
    // A cached Google test ad may legitimately earn a receipt only after manual playback;
    // no-fill offline is expected here, so any earned result must fail this automated test.
    assert.equal(earned,false);await ready();check('native offline/no-fill ad returns without reward or stuck pause');
    await page.evaluate(async()=>(await HSC.youtubeClientPromise).flushProgress());
    await browser.close();browser=null;
    adb('shell','am','force-stop',app);adb('shell','am','start','-W','-n',activity);await connect();await ready();
    assert.equal(await page.evaluate(()=>JSON.stringify(skinFadeStudio.getState().hair)),saved);check('force-stop/relaunch restores real private disk save');
    await screenshot('relaunch');assert.deepEqual(errors,[]);
    report.status='PASS';console.log(JSON.stringify(report,null,2));
  }catch(e){report.status='FAIL';report.error=e.stack||String(e);console.error(report.error);process.exitCode=1;
    try{await screenshot('failure');if(page)report.page=await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,touches:window.__nativeTouches,url:location.href,text:document.body.innerText,error:document.documentElement.dataset.bootError,timing:window.HSC?.startupTiming}));}catch(_){}
  }finally{
    fs.writeFileSync(path.join(out,'android-installed-report.json'),JSON.stringify(report,null,2));
    try{fs.writeFileSync(path.join(out,'android-installed-logcat.txt'),adb('logcat','-d','-t','3000'));}catch(_){}
    if(browser)await browser.close();
  }
})();
