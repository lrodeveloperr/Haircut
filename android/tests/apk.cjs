'use strict';
// Exercise the installed debug APK's actual Android WebView, native input, private disk saves,
// lifecycle and phone/tablet window changes. No browser replacement or fake AndroidHost.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const app='com.worksbien.barbersimulatorasmr.debug',activity=app+'/com.worksbien.barbersimulatorasmr.MainActivity';
const out=path.resolve('qa/results');fs.mkdirSync(out,{recursive:true});
const adbPath=path.join(process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT,'platform-tools/adb');
const adb=(...args)=>{console.log('adb',...args);return execFileSync(adbPath,args,{encoding:'utf8',timeout:30000}).trim();};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const report={checks:[],layouts:[]};let browser,page;
function check(name){report.checks.push(name);console.log('PASS:',name);}
async function connect(){
  for(let n=0;n<40;n++){
    try{
      const pid=adb('shell','pidof',app).split(' ')[0];
      adb('forward','tcp:9222','localabstract:webview_devtools_remote_'+pid);
      browser=await chromium.connectOverCDP('http://127.0.0.1:9222',{timeout:5000});
      page=browser.contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('appassets.androidplatform.net'));
      if(page){page.setDefaultTimeout(120000);return;}
      console.log('WebView targets:',browser.contexts().flatMap(c=>c.pages()).map(p=>p.url()));
      throw Error('Game target not ready');
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
async function screenshot(name){fs.writeFileSync(path.join(out,'android-installed-'+name+'.png'),execFileSync(adbPath,['exec-out','screencap','-p'],{timeout:30000}));}
async function cut(label){
  const p=await page.evaluate(()=>{
    const game=skinFadeStudio,view=HSC.view;
    if(game.getState().interactionMode!=='cut')game.toggleClipper();game.selectGuard(1);
    const state=game.getState(),b=view.headScreen();
    for(const y of[.25,.35,.45,.55,.65])for(const x of[.5,.4,.6,.3,.7]){
      const p={x:b.left+(b.right-b.left)*x,y:b.top+(b.bottom-b.top)*y},hit=view.raycast(p.x,p.y);
      if(hit && hit.kind!=='beard' && state.hair[Math.min(63,Math.floor(hit.v*64))*128+Math.min(127,Math.floor(hit.u*128))]>1){
        window.__nativeTouches=[];
        window.addEventListener('pointerdown',e=>__nativeTouches.push({x:e.clientX,y:e.clientY,height:e.height,trusted:e.isTrusted}),{once:true,capture:true});
        return {...p,dpr:devicePixelRatio,before:JSON.stringify(state.hair)};
      }
    }throw Error('No accessible uncut scalp after window resize');
  });
  // The emulator profile has no camera cutout and bars are hidden. Actual native pixel input.
  adb('shell','input','swipe',String(Math.round(p.x*p.dpr)),String(Math.round((p.y+24)*p.dpr)),String(Math.round((p.x+6)*p.dpr)),String(Math.round((p.y+30)*p.dpr)),'220');
  await page.waitForFunction(before=>JSON.stringify(skinFadeStudio.getState().hair)!==before,p.before);
  const touch=await page.evaluate(()=>__nativeTouches[0]);
  assert(touch?.trusted,'native input must produce trusted touch');
  assert(Math.abs(touch.x-p.x)<3&&Math.abs(touch.y-(p.y+24))<3,'native and WebView coordinates must agree');
  const gap=await page.evaluate(t=>HSC.android.touchOffset({pointerType:'touch',height:t.height}),touch);
  assert(gap>=18&&gap<=28,'blade clearance remains compact on tablet and phone');
  check(label+' native swipe removes hair with compact blade clearance');
  return touch;
}
(async()=>{
  const errors=[];
  try{
    adb('logcat','-c');
    adb('shell','svc','wifi','disable');adb('shell','svc','data','disable');
    adb('install','-r','android/native/app/build/outputs/apk/debug/app-debug.apk');
    adb('shell','settings','put','system','accelerometer_rotation','0');
    adb('shell','settings','put','system','user_rotation','0');
    adb('shell','am','start','-W','-n',activity);
    await connect();page.on('pageerror',e=>errors.push(e.message));await ready();
    report.webview=adb('shell','dumpsys','webviewupdate');
    assert.equal(await page.evaluate(async()=>(await HSC.youtubeClientPromise).platformId),'android');
    check('installed APK boots full working engine');
    for(const spec of[
      {name:'phone-portrait',size:'1080x1920',density:'420',rotation:0},
      {name:'phone-landscape',size:'1080x1920',density:'420',rotation:1},
      {name:'tablet-portrait',size:'1600x2560',density:'320',rotation:0},
      {name:'tablet-landscape',size:'1600x2560',density:'320',rotation:1},
    ]){
      adb('shell','wm','size',spec.size);adb('shell','wm','density',spec.density);
      adb('shell','settings','put','system','user_rotation',String(spec.rotation));
      await page.waitForFunction(landscape=>(innerWidth>innerHeight)===landscape,spec.rotation===1);
      await pause(750);await ready();
      const layout=await page.evaluate(()=>{
        const c=document.querySelector('#scene'),gl=c.getContext('webgl2'),d=HSC.detail;
        return {width:innerWidth,height:innerHeight,dpr:devicePixelRatio,buffer:[c.width,c.height],level:d.level,strands:d.minStrands,segments:d.segments,
          renderer:gl.getParameter(gl.RENDERER),controls:[...document.querySelectorAll('#hud button')].filter(b=>b.getBoundingClientRect().width).map(b=>{
            const r=b.getBoundingClientRect();return{text:b.getAttribute('aria-label')||b.textContent.trim(),x:r.x,y:r.y,width:r.width,height:r.height};
          })};
      });
      assert.equal(layout.level,'high');assert.equal(layout.strands,30000);assert.equal(layout.segments,8);
      for(const b of layout.controls)assert(b.x>=-1&&b.y>=-1&&b.x+b.width<=layout.width+1&&b.y+b.height<=layout.height+1,`control outside ${spec.name}: ${b.text}`);
      layout.name=spec.name;layout.touch=await cut(spec.name);report.layouts.push(layout);
      await screenshot(spec.name);
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
    try{await screenshot('failure');if(page)report.page=await page.evaluate(()=>({url:location.href,text:document.body.innerText,error:document.documentElement.dataset.bootError,timing:window.HSC?.startupTiming}));}catch(_){}
  }finally{
    fs.writeFileSync(path.join(out,'android-installed-report.json'),JSON.stringify(report,null,2));
    try{fs.writeFileSync(path.join(out,'android-installed-logcat.txt'),adb('logcat','-d','-t','3000'));}catch(_){}
    if(browser)await browser.close();
  }
})();
