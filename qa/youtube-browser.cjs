// Runs the extracted upload bytes against a strict direct-YouTube SDK fixture.
// This fixture is installed by the test runner, never packaged with the game.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,firefox,webkit}=require('playwright');
const engine=process.env.BROWSER||'chromium',root=path.resolve(process.env.RELEASE_DIR||'source/build-youtube');
const out=path.resolve(process.env.QA_OUTPUT||`qa/results/youtube-${engine}`);fs.mkdirSync(out,{recursive:true});
const results=[];let browser;
async function test(name,fn){if(process.env.TEST_FILTER&&!name.toLowerCase().includes(process.env.TEST_FILTER.toLowerCase()))return;try{const evidence=await fn();results.push({name,status:'PASS',evidence});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(JSON.stringify(results.at(-1)));fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({engine,archiveSha256:process.env.ARCHIVE_SHA,results},null,2));}
const csp="default-src 'none'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.youtube.com/game_api/v1 https://www.youtube.com/game_api/v1/; object-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self' blob: data:; base-uri 'self'; worker-src 'self' blob:";
async function fixture(options={}){
 const started=performance.now();
 let raw=Object.hasOwn(options,'saved')?options.saved:'',readFail=!!options.readFail,writeFail=false;
 const calls=[],errors=[],requests=[];
 const ctx=await browser.newContext({viewport:options.viewport||{width:390,height:844},deviceScaleFactor:options.dpr||1,reducedMotion:'reduce',hasTouch:!!options.touch,isMobile:!!options.mobile});
 const page=await ctx.newPage();page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||/THREE\.WebGLProgram/.test(m.text()))errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
 await ctx.exposeBinding('readCloud',async()=>{calls.push(['load']);if(options.loadDelay)await new Promise(r=>setTimeout(r,options.loadDelay));if(readFail)throw Error('Injected cloud read failure');return raw;});
 await ctx.exposeBinding('writeCloud',async(_,value)=>{calls.push(['save-start']);if(writeFail)throw Error('Injected cloud write failure');raw=value;calls.push(['save-ack']);});
 await ctx.addInitScript(()=>{
   const raf=window.requestAnimationFrame;window.__frames={requested:0,executed:0};
   window.requestAnimationFrame=fn=>{__frames.requested++;return raf.call(window,t=>{__frames.executed++;fn(t);});};
 });
 if(options.zeroViewport)await ctx.addInitScript(()=>{
  window.__viewportDescriptors=Object.fromEntries(['innerWidth','innerHeight'].map(key=>[key,Object.getOwnPropertyDescriptor(window,key)]));
  for(const key of ['innerWidth','innerHeight'])Object.defineProperty(window,key,{configurable:true,get:()=>0});
  addEventListener('DOMContentLoaded',()=>{const style=document.createElement('style');style.id='zero-viewport';style.textContent='#game,#scene{width:0!important;height:0!important}';document.head.append(style);});
 });
 if(options.deniedStorage)await ctx.addInitScript(()=>{
  Object.defineProperty(window,'indexedDB',{get(){throw new DOMException('Denied','SecurityError')}});
  Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError')}});
 });
 if(options.stalledCache)await ctx.addInitScript(()=>Object.defineProperty(window,'indexedDB',{value:{open:()=>({})}}));
 if(options.localSaved)await ctx.addInitScript(raw=>{
  if(location.hostname==='release.test'&&!localStorage.getItem('asmr-barber-youtube-save-v1'))localStorage.setItem('asmr-barber-youtube-save-v1',raw);
 },options.localSaved);
 if(options.silentShaderFailure)await ctx.addInitScript(()=>{
  const P=WebGL2RenderingContext.prototype,link=P.linkProgram,param=P.getProgramParameter,log=P.getProgramInfoLog,failed=new WeakSet();
  P.linkProgram=function(program){
   if(this.getAttachedShaders(program).some(s=>this.getShaderSource(s).includes('float HANG=')))failed.add(program);
   return link.call(this,program);
  };
  P.getProgramParameter=function(program,key){return key===this.LINK_STATUS&&failed.has(program)?false:param.call(this,program,key);};
  P.getProgramInfoLog=function(program){return failed.has(program)?'':log.call(this,program);};
 });
 if(options.pauseAtCompile||options.loseAtCompile)await ctx.addInitScript(({lose,restore})=>{
  const P=WebGL2RenderingContext.prototype,compile=P.compileShader;let fired=false;
  P.compileShader=function(...args){const result=compile.apply(this,args);if(!fired&&globalThis.HSC?.startupTiming?.materialsReady){fired=true;queueMicrotask(()=>{window.__startupInterrupted=true;if(lose){const ext=this.getExtension('WEBGL_lose_context');ext.loseContext();if(restore)setTimeout(()=>ext.restoreContext(),restore);}else __yt.callbacks.pause();});}return result;};
 },{lose:!!options.loseAtCompile,restore:options.restoreAfter||0});
 if(options.pauseAtFence||options.loseAtFence||options.disposeAtFence)await ctx.addInitScript(({lose,dispose,restore})=>{
  const P=WebGL2RenderingContext.prototype,fence=P.fenceSync;let fired=false;
  P.fenceSync=function(...args){const result=fence.apply(this,args);if(!fired){fired=true;queueMicrotask(()=>{window.__startupInterrupted=true;if(lose){const ext=this.getExtension('WEBGL_lose_context');ext.loseContext();if(restore)setTimeout(()=>ext.restoreContext(),restore);}else if(dispose)HSC.view.destroy();else __yt.callbacks.pause();});}return result;};
 },{lose:!!options.loseAtFence,dispose:!!options.disposeAtFence,restore:options.restoreAfter||0});
 if(options.fenceNeverSignals)await ctx.addInitScript(()=>{WebGL2RenderingContext.prototype.clientWaitSync=function(){return this.TIMEOUT_EXPIRED};});
 if(process.env.PROFILE_STARTUP==='1')await ctx.addInitScript(()=>{
  window.__glProfile=[];const shaders=new WeakMap(),programs=new WeakMap();let sequence=0;
  for(const name of ['shaderSource','attachShader','linkProgram','getProgramInfoLog']){
   const P=WebGL2RenderingContext.prototype,fn=P[name];P[name]=function(...args){const at=performance.now();
    if(name==='shaderSource')shaders.set(args[0],{len:args[1].length,defines:args[1].match(/^#define.*$/gm),bald:args[1].includes('float baldDensity')});
    if(name==='attachShader'){if(!programs.has(args[0]))programs.set(args[0],{id:++sequence,shaders:[]});programs.get(args[0]).shaders.push(shaders.get(args[1]));}
    const result=fn.apply(this,args);if(['linkProgram','getProgramInfoLog'].includes(name))__glProfile.push({name,at,ms:performance.now()-at,program:programs.get(args[0])});return result;
   };
  }
 });
 const releaseRoot=path.resolve(options.releaseRoot||root);
 await ctx.route('http://release.test/**',async route=>{
  const pathname=new URL(route.request().url()).pathname,file=path.join(releaseRoot,pathname==='/'?'index.html':pathname);
  if(!file.startsWith(releaseRoot+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'not found'});
  if(pathname==='/runtime/room-env.dat'&&options.envDelay)await new Promise(r=>setTimeout(r,options.envDelay));
  if(pathname==='/runtime/room-env.dat'&&options.missingEnv)return route.fulfill({status:404,body:'missing'});
  if(options.inspectEnvironment&&pathname==='/runtime/game.js'){
   // Observation only: expose the actual renderer-owned target, including replacement after restore.
   const body=fs.readFileSync(file,'utf8').replace('Zt.environment = environmentTarget.texture;',
    'globalThis.__testEnvironment={target:environmentTarget,renderer:t};Zt.environment = environmentTarget.texture;');
   assert.notEqual(body,fs.readFileSync(file,'utf8'));
   return route.fulfill({body,contentType:'application/javascript',headers:{'Content-Security-Policy':csp}});
  }
  await route.fulfill({path:file,headers:{'Content-Security-Policy':csp},contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.dat':'application/octet-stream'})[path.extname(file)]||'text/plain'});
 });
 if(!options.realSdk)await ctx.route('https://www.youtube.com/game_api/v1',async route=>{if(options.sdkDelay)await new Promise(r=>setTimeout(r,options.sdkDelay));return options.missing||options.localPreview?route.abort():route.fulfill({contentType:'application/javascript',body:`
   window.__yt={messages:[],ads:[],scores:[],timings:{},callbacks:{},rewardMode:'${options.rewardMode||'earned'}',paused:false,audio:${options.audio!==false}};
   const sub=k=>fn=>{__yt.callbacks[k]=fn;${options.initialPause?"if(k==='pause'){__yt.paused=true;fn();}":''}return()=>delete __yt.callbacks[k];};
   window.ytgame={IN_PLAYABLES_ENV:${options.hosted!==false},SDK_VERSION:'strict-test-fixture',
     system:{getLanguage:async()=>{__yt.timings.languageStart=performance.now();if(${options.languageDelay||0})await new Promise(r=>setTimeout(r,${options.languageDelay||0}));return 'fr-CA';},isAudioEnabled:()=>__yt.audio,onPause:sub('pause'),onResume:sub('resume'),onAudioEnabledChange:sub('audio')},
     game:{loadData:()=>{__yt.timings.loadStart=performance.now();return readCloud();},saveData:v=>writeCloud(v),firstFrameReady(){__yt.messages.push({name:'firstFrameReady',at:performance.now(),loading:!!document.getElementById('yt-loading'),loadingText:document.getElementById('yt-loading')?.textContent});},gameReady(){__yt.messages.push({name:'gameReady',at:performance.now(),loading:!!document.getElementById('yt-loading'),hud:!!document.getElementById('hud')});}},
     engagement:{sendScore:async score=>{if(!Number.isSafeInteger(score.value))throw Error('Non-integer score');__yt.scores.push({value:score.value,at:performance.now()});}},
     health:{logWarning(){}},
     ads:{requestRewardedAd:async id=>{__yt.ads.push({kind:'rewarded',id});await new Promise(r=>setTimeout(r,100));if(__yt.rewardMode==='error')throw Error('no fill');return __yt.rewardMode==='earned';},requestInterstitialAd:async()=>{__yt.ads.push({kind:'interstitial'});await new Promise(r=>setTimeout(r,100));}}
   };` });});
 await page.goto('http://release.test/',{waitUntil:'load'});
 if(!options.blocked&&!options.missing&&!options.readFail&&!options.initialPause)await page.waitForFunction(()=>!!window.skinFadeStudio,null,{timeout:options.fenceNeverSignals?90000:45000});
 return {ctx,page,calls,errors,requests,startupMs:Math.round(performance.now()-started),raw:()=>raw,readFail(value){readFail=value;},writeFail(value){writeFail=value;},close:()=>ctx.close()};
}
const state=p=>p.evaluate(()=>JSON.parse(JSON.stringify(skinFadeStudio.getState())));
async function stroke(p){
 await p.getByRole('radio',{name:/^Guard 0,/}).click();await p.keyboard.press('ArrowRight');
 if((await state(p)).interactionMode!=='cut')await p.getByRole('button',{name:'Clipper off: drag to turn the customer',exact:true}).click();
 const point=await p.evaluate(()=>{const r=document.getElementById('scene').getBoundingClientRect();for(const fy of [.25,.3,.35,.4,.45,.5])for(const fx of [.4,.5,.6]){const x=r.left+r.width*fx,y=r.top+r.height*fy;if(HSC.view.raycast(x,y)&&HSC.view.raycast(x,y+40))return{x,y};}return null;});
 const size=p.viewportSize(),pt=point||{x:size.width*.47,y:size.height*.33};
 await p.mouse.move(pt.x,pt.y);await p.mouse.down();await p.mouse.move(pt.x+12,pt.y+40,{steps:10});await p.mouse.up();await p.waitForTimeout(300);
}
// The unchanged reveal needs at least 15 frames. Full-detail SwiftShader frames
// can take seconds on a contended CI runner, so allow software-renderer headroom.
async function finish(p){await p.getByRole('button',{name:'Finish haircut',exact:true}).click();try{await p.locator('#hsc-hub.show').waitFor({state:'visible',timeout:120000});}catch(e){const debug=await p.evaluate(()=>({status:skinFadeStudio.getState().status,view:((v)=>({paused:v.paused,userPaused:v.userPaused,revealComplete:v.revealComplete,busy:v.busy}))(skinFadeStudio.getView()),detail:{level:HSC.detail.level,frameMs:HSC.detail.lastFrameMs},frames:__frames})).catch(()=>null);throw new Error(e.message+'\nReveal diagnostics: '+JSON.stringify(debug));}}
async function next(p){await p.locator('.training-continue').click();await p.locator('#hsc-hub.show').waitFor({state:'hidden',timeout:45000});await p.getByRole('button',{name:'Finish haircut',exact:true}).waitFor({state:'visible',timeout:45000});}
async function reward(p,mode){await p.evaluate(mode=>__yt.rewardMode=mode,mode);await p.locator('.hsc-vbtn').click();await p.waitForTimeout(700);}
async function standard(){
 let f=await fixture(),p=f.page;
 await test('Ready signals use a real loading screen and occur once in order',async()=>{const m=await p.evaluate(()=>__yt.messages);assert.deepEqual(m.map(x=>x.name),['firstFrameReady','gameReady']);assert.equal(m[0].loading,true);assert.match(m[0].loadingText,/Loading/);assert.equal(m[1].loading,false);assert.equal(m[1].hud,true);assert.equal(await p.locator('.audio-toggle').count(),0);assert.equal(await p.locator('html').getAttribute('lang'),'fr-CA');});
 await test('Idle frames avoid GPU redraws; native guard and camera controls redraw the scene',async()=>{await p.evaluate(()=>{window.__renders=0;const render=HSC.view.render;HSC.view.render=function(...args){__renders++;return render.apply(this,args);};});await p.waitForTimeout(300);const before=await p.evaluate(()=>__renders);await p.waitForTimeout(500);assert.equal(await p.evaluate(()=>__renders),before);await p.getByRole('radio',{name:/^Guard 2,/}).click();await p.waitForFunction(n=>__renders>n,before);const after=await p.evaluate(()=>__renders);await p.keyboard.press('ArrowRight');await p.waitForFunction(n=>__renders>n,after);});
 if(engine==='chromium')await test('An idle WebGL context restoration redraws without needing player input',async()=>{const hair=(await state(p)).hair;await p.evaluate(()=>{const canvas=document.getElementById('scene');window.__contextExtension=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');if(!__contextExtension)throw Error('Context-loss extension unavailable');window.__lost=false;canvas.addEventListener('webglcontextlost',()=>__lost=true,{once:true});__contextExtension.loseContext();});await p.waitForFunction(()=>__lost);const before=await p.evaluate(()=>__renders);await p.evaluate(()=>__contextExtension.restoreContext());await p.waitForFunction(n=>!document.getElementById('scene').getContext('webgl2').isContextLost()&&__renders>n,before,{timeout:45000});assert.deepEqual((await state(p)).hair,hair);});
 await test('Native cutting, cloud save and reload restore the exact haircut',async()=>{await stroke(p);await p.evaluate(()=>HSC.wardrobe.client.flushProgress());const before=await state(p);assert(before.cutStrokeCount>0);assert(f.raw().length>0);assert(Buffer.byteLength(f.raw())<65536);await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.skinFadeStudio);const after=await state(p);assert.deepEqual(after.hair,before.hair);assert.equal(after.selectedGuard,before.selectedGuard);});
 await test('Host pause stops input, rendering, animation scheduling and UI timers; mute survives resume',async()=>{
   await p.evaluate(()=>{__yt.callbacks.pause();});await p.waitForTimeout(500);
   const before=await state(p),frames=await p.evaluate(()=>__frames.executed);
   await p.keyboard.press('ArrowRight');await p.setViewportSize({width:844,height:390});await p.waitForTimeout(800);
   assert.equal((await state(p)).cameraYawDeg,before.cameraYawDeg);assert.equal(await p.evaluate(()=>__frames.executed),frames);assert.equal(await p.evaluate(()=>document.body.inert),true);
   await p.evaluate(()=>{__yt.audio=false;__yt.callbacks.audio(false);__yt.callbacks.resume();});
   await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>skinFadeStudio.getView().audio),false);assert.equal(await p.evaluate(()=>document.body.inert),false);
   await p.evaluate(()=>{__yt.audio=true;__yt.callbacks.audio(true);});await p.setViewportSize({width:390,height:844});
 });
 await test('Wardrobe remains interactive while gameplay is paused',async()=>{await p.locator('#hsc-hud .hsc-rw').click();await p.locator('#hsc-panel.open').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>skinFadeStudio.getView().paused),true);assert.equal(await p.evaluate(()=>document.body.inert),false);assert(await p.locator('.hsc-vbtn').isEnabled());});
 await test('Cancelled and unavailable videos grant nothing and allow retry',async()=>{const before=await p.evaluate(()=>JSON.stringify(HSC.wardrobe.data.own));for(const mode of ['cancel','error']){await reward(p,mode);assert.equal(await p.evaluate(()=>JSON.stringify(HSC.wardrobe.data.own)),before);assert(await p.locator('.hsc-vbtn').isEnabled());}});
 await test('Completed rewarded video unlocks one daily item and survives reload',async()=>{const count=await p.evaluate(()=>HSC.wardrobe.data.recent.length);await reward(p,'earned');assert.equal(await p.evaluate(()=>HSC.wardrobe.data.recent.length),count+1);const look=await p.evaluate(()=>JSON.stringify(HSC.wardrobe.data.look));await p.keyboard.press('Escape');await p.reload();await p.waitForFunction(()=>!!window.skinFadeStudio);assert.equal(await p.evaluate(()=>JSON.stringify(HSC.wardrobe.data.look)),look);});
 await test('Paid replay restores the same customer and preserves the next queue and saved haircut score',async()=>{await finish(p);await p.waitForFunction(()=>__yt.scores.some(s=>s.value===HSC.meta.data.cuts&&s.value>0));assert.equal(JSON.parse(f.raw()).slots['skin-fade-studio-meta-v1'].cuts,await p.evaluate(()=>Math.max(...__yt.scores.map(s=>s.value))));await p.screenshot({timeout:60000,path:path.join(out,'completion.png')});const before=await state(p),queue=await p.evaluate(()=>JSON.stringify(HSC.meta.data.queue));await p.locator('.hsc-replay').click();await p.getByRole('button',{name:'Finish haircut',exact:true}).waitFor({state:'visible',timeout:30000});const after=await state(p);assert.equal(after.look.person.seed,before.look.person.seed);assert.deepEqual(after.hair,after.startHair);assert.equal(await p.evaluate(()=>JSON.stringify(HSC.meta.data.queue)),queue);});
 await test('A cloud write failure blocks the reward request and preserves usability',async()=>{await p.locator('#hsc-hud .hsc-rw').click();await p.locator('.hsc-tab').last().click();f.writeFail(true);const ads=await p.evaluate(()=>__yt.ads.length);await reward(p,'earned');assert.equal(await p.evaluate(()=>__yt.ads.length),ads);assert(await p.locator('.hsc-vbtn').isEnabled());f.writeFail(false);await p.keyboard.press('Escape');});
 await test('Only bundled resources and the official YouTube SDK are requested',async()=>{assert.deepEqual(f.errors,[]);assert(f.requests.every(url=>url.startsWith('http://release.test/')||url==='https://www.youtube.com/game_api/v1'));});
 const saved=f.raw(),savedState=await state(p);await f.close();
 await test('Fresh empty JSON sessions boot without errors, save, and restore after reload',async()=>{for(const saved of ['{}','null','[]','""']){const g=await fixture({saved}),p=g.page;try{assert.deepEqual(g.errors,[]);await p.getByRole('radio',{name:/^Guard 2,/}).click();await p.waitForTimeout(700);const before=await state(p);assert([1,2].includes(JSON.parse(g.raw()).version));assert(Buffer.byteLength(g.raw())<65536);await p.reload();await p.waitForFunction(()=>!!window.skinFadeStudio);assert.equal((await state(p)).selectedGuard,2);assert.deepEqual((await state(p)).hair,before.hair);assert.deepEqual(g.errors,[]);}finally{await g.close();}}});
 await test('Unread cloud data is preserved and Retry restores it',async()=>{const g=await fixture({saved,readFail:true}),p=g.page;try{await p.getByRole('button',{name:'Retry',exact:true}).waitFor({state:'visible'});assert.equal(g.raw(),saved);assert.equal(g.calls.filter(c=>c[0]==='save-start').length,0);g.readFail(false);await p.getByRole('button',{name:'Retry',exact:true}).click();await p.waitForFunction(()=>!!window.skinFadeStudio);assert.deepEqual((await state(p)).hair,savedState.hair);}finally{await g.close();}});
 await test('A future cloud envelope shows recovery and never overwrites progress',async()=>{const saved=JSON.stringify({version:2,slots:{}}),g=await fixture({saved,blocked:true});try{await g.page.getByRole('heading',{name:'A newer game version is needed'}).waitFor({state:'visible'});assert.equal(g.raw(),saved);assert.equal(g.calls.filter(c=>c[0]==='save-start').length,0);}finally{await g.close();}});
 await test('Missing SDK gives a keyboard-focused Retry in a tiny embed',async()=>{const g=await fixture({missing:true,viewport:{width:225,height:400}});try{const retry=g.page.getByRole('button',{name:'Retry',exact:true});await retry.waitFor({state:'visible'});assert.equal(await retry.evaluate(e=>e===document.activeElement),true);await g.page.screenshot({timeout:60000,path:path.join(out,'missing-sdk.png')});}finally{await g.close();}});
 await test('An initial host pause defers gameplay until the host resumes',async()=>{const g=await fixture({initialPause:true});try{await g.page.waitForTimeout(600);assert.equal(await g.page.evaluate(()=>!!window.skinFadeStudio),false);await g.page.evaluate(()=>__yt.callbacks.resume());await g.page.waitForFunction(()=>!!window.skinFadeStudio);assert.equal(await g.page.evaluate(()=>__yt.messages.filter(m=>m.name==='gameReady').length),1);}finally{await g.close();}});
 await test('Off-platform preview uses the official SDK mode without rewarded CTAs',async()=>{const g=await fixture({hosted:false});try{await finish(g.page);assert.equal(await g.page.locator('.hsc-replay').isVisible(),false);assert.equal(g.calls.filter(c=>c[0]==='load'||c[0]==='save-start').length,0);assert.equal(await g.page.evaluate(()=>HSC.wardrobe.client.isLocalPreview),true);}finally{await g.close();}});
 if(engine==='chromium'&&process.env.SKIP_REAL_SDK!=='1')await test('The real official SDK loads under YouTube CSP in off-platform preview',async()=>{const g=await fixture({realSdk:true});try{assert.equal(await g.page.evaluate(()=>typeof ytgame.game.loadData),'function');assert.equal(await g.page.evaluate(()=>HSC.wardrobe.client.isLocalPreview),true);assert.deepEqual(g.errors,[]);}finally{await g.close();}});
}
const viewports=[[225,400],[320,568],[360,640],[375,667],[390,844],[412,915],[430,932],[568,320],[640,360],[844,390],[932,430],[717,512],[768,1024],[820,1180],[1024,1366],[1024,768],[1180,820],[1366,1024],[1280,720],[1366,768],[1440,900],[1920,1080],[2560,1440],[3440,1440],[400,400],[480,270],[270,480]];
async function layouts(){
 const group=Number(process.env.LAYOUT_GROUP||0),screens=viewports.filter((_,i)=>i%4===group);
 for(const [width,height]of screens)await test(`Layout ${width}x${height}: play, clipper wardrobe, gown wardrobe, completion`,async()=>{
   const f=await fixture({viewport:{width,height}}),p=f.page;
   try{
   await p.waitForTimeout(300);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1),false);
   const finishButton=p.getByRole('button',{name:'Finish haircut',exact:true});assert(await finishButton.isVisible());
   await p.screenshot({timeout:60000,path:path.join(out,`${width}x${height}-play.png`)});
   await p.locator('#hsc-hud .hsc-rw').click();await p.locator('.hsc-tab').first().click();await p.waitForTimeout(250);await p.screenshot({timeout:60000,path:path.join(out,`${width}x${height}-clipper.png`)});
   await p.locator('.hsc-tab').last().click();await p.waitForTimeout(150);await p.screenshot({timeout:60000,path:path.join(out,`${width}x${height}-gown.png`)});
   // The wardrobe replaces its pick button on its one-second refresh. Query and measure in one
   // browser task so a detached Playwright element handle cannot produce a spurious null box.
   const card=await p.evaluate(()=>{const e=document.querySelector('#hsc-panel.open .hsc-vbtn');if(!e)return null;const r=e.getBoundingClientRect(),sheet=document.querySelector('.hsc-sheet');return{x:r.x,y:r.y,width:r.width,height:r.height,connected:e.isConnected,visible:e.getClientRects().length>0&&getComputedStyle(e).visibility==='visible',uiScale:HSC.S,scroll:{top:sheet.scrollTop,height:sheet.clientHeight,total:sheet.scrollHeight}};});
   assert(card&&card.connected&&card.visible&&card.width>0&&card.height>0&&card.x>=-1&&card.y>=-1&&card.x+card.width<=width+1&&card.y+card.height<=height+1,JSON.stringify({viewport:{width,height},card}));
   await p.keyboard.press('Escape');await p.waitForTimeout(500);await finish(p);await p.screenshot({timeout:60000,path:path.join(out,`${width}x${height}-completion.png`)});await next(p);await p.waitForTimeout(500);
   assert.deepEqual(f.errors,[]);
   }finally{await f.close();}
 });
}
async function soak(){
 const f=await fixture({viewport:{width:320,height:568}}),p=f.page,start=Date.now();
 const metrics=()=>p.evaluate(()=>({canvases:document.querySelectorAll('canvas').length,huds:document.querySelectorAll('#hsc-hud').length,callbacks:Object.keys(__yt.callbacks).length,job:skinFadeStudio.getState().jobId,heap:performance.memory?.usedJSHeapSize}));
 const before=await metrics();let transitions=0;
 await test('Sustained run: at least 50 customer transitions and ten minutes, without resource growth or errors',async()=>{
   while(transitions<50||Date.now()-start<600000){await finish(p);await next(p);transitions++;if(transitions%10===0)console.log('SOAK',JSON.stringify({transitions,elapsed:Date.now()-start,...await metrics()}));}
   const after=await metrics();assert.equal(after.canvases,before.canvases);assert.equal(after.huds,before.huds);assert.equal(after.callbacks,before.callbacks);assert.deepEqual(f.errors,[]);return {transitions,elapsedMs:Date.now()-start,before,after};
 });await f.close();
}
async function quality(){
 const baseline=path.resolve(process.env.BASELINE_DIR);
 for(const [width,height,dpr]of [[390,844,2],[360,640,3],[768,1024,2]]){
  await test(`Full-detail phone/tablet render ${width}x${height} DPR ${dpr}`,async()=>{
   const f=await fixture({viewport:{width,height},dpr,touch:true}),p=f.page;
   try{
    // Check native interaction at phone pixel densities before comparing the saved customer.
    await p.getByRole('radio',{name:/^Guard 2,/}).click();await p.waitForTimeout(700);
    const saved=f.raw(),before=await state(p);
    const metrics=await p.evaluate(()=>{const c=document.getElementById('scene'),b=HSC.debugState.beardMesh;return{level:HSC.detail.level,shaderLow:HSC.detail.shaderLow,segments:HSC.detail.segments,beardSegments:b.geometry.attributes.position.count/2-1,beardCount:b.geometry.instanceCount,beardRoots:HSC.debugState.roots.count,antialias:c.getContext('webgl2').getContextAttributes().antialias,width:c.width,height:c.height,cssWidth:c.clientWidth,cssHeight:c.clientHeight};});
    assert.equal(metrics.level,'high');assert.equal(metrics.shaderLow,false);assert.equal(metrics.segments,8);assert.equal(metrics.beardSegments,8);assert.equal(metrics.beardCount,metrics.beardRoots);assert.equal(metrics.antialias,true);assert(metrics.width*metrics.height<=4000000);assert(metrics.width/metrics.cssWidth>=Math.min(dpr,2)-0.01);
    await p.evaluate(()=>__yt.callbacks.pause());await p.screenshot({timeout:60000,path:path.join(out,`${width}x${height}-high.png`)});
    const g=await fixture({viewport:{width,height},dpr,touch:true,saved,releaseRoot:baseline});
    try{assert.deepEqual((await state(g.page)).look,before.look);await g.page.evaluate(()=>__yt.callbacks.pause());await g.page.screenshot({timeout:60000,path:path.join(out,`${width}x${height}-baseline.png`)});assert.deepEqual(g.errors,[]);}finally{await g.close();}
    await p.evaluate(()=>{__yt.callbacks.resume();HSC.setDetail(0.5);});assert.equal(await p.evaluate(()=>HSC.debugState.beardMesh.geometry.instanceCount),metrics.beardRoots);
    await p.setViewportSize({width:3840,height:2160});await p.waitForTimeout(500);
    const resized=await p.locator('#scene').evaluate(c=>({width:c.width,height:c.height}));assert(resized.width*resized.height<=4000000);assert.deepEqual((await state(p)).hair,before.hair);assert.deepEqual(f.errors,[]);
    return {startupMs:f.startupMs,metrics,resized,zipSha:process.env.ARCHIVE_SHA};
   }finally{await f.close();}
  });
 }
}
async function startup(){
 await test('Silent scalp shader link failure reports actual statuses and preserves saves',async()=>{
  const saved=JSON.stringify({version:1,slots:{'skin-fade-studio-meta-v1':{v:1,cuts:7},other:{kept:true}}}),f=await fixture({saved,blocked:true,silentShaderFailure:true}),p=f.page;
  try{
   await p.getByRole('button',{name:'Retry',exact:true}).waitFor({state:'visible'});
   assert.equal(await p.locator('.boot-error-code').textContent(),'Code: GFX_SHADER');
   const detail=await p.locator('.boot-error-detail').textContent();
   assert.match(detail,/Status: vertex true, fragment true, link false/);assert.match(detail,/no compiler log/);assert.match(detail,/Build:/);
   assert(!/Check your connection/.test(await p.locator('.boot-error').innerText()));
   assert.equal(await p.evaluate(()=>!!window.skinFadeStudio),false);
   const progress=JSON.parse(f.raw());assert.equal(progress.slots['skin-fade-studio-meta-v1'].cuts,7);assert.deepEqual(progress.slots.other,{kept:true});
   assert.equal(await p.evaluate(()=>__yt.messages.filter(m=>m.name==='gameReady').length),0);
  }finally{await f.close();}
 });
 await test('Startup overlaps host reads, preserves full graphics and reports genuine readiness',async()=>{
  const f=await fixture({languageDelay:500,loadDelay:500,dpr:2}),p=f.page;
  try{
   const evidence=await p.evaluate(()=>({timing:HSC.startupTiming,host:__yt.timings,ready:__yt.messages.find(m=>m.name==='gameReady'),quality:{level:HSC.detail.level,segments:HSC.detail.segments,shaderLow:HSC.detail.shaderLow,maxStrands:HSC.detail.maxStrands},renderer:(()=>{const g=document.getElementById('scene').getContext('webgl2'),e=g.getExtension('WEBGL_debug_renderer_info');return e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER);})()}));
   assert(Math.abs(evidence.host.languageStart-evidence.host.loadStart)<100,'Host requests were serialized');
   assert(evidence.host.loadStart<evidence.timing.geometryReady,'Cloud read started after geometry');
   assert(evidence.timing.materialsReady<=evidence.timing.shadersReady);
   assert(evidence.timing.shadersReady<=evidence.timing.firstDraw);
   assert(evidence.timing.firstDraw<=evidence.timing.gpuReady);
   assert(evidence.timing.gpuReady<=evidence.timing.firstPlayable);
   assert(evidence.timing.firstPlayable<=evidence.timing.gameReady);
   assert.equal(evidence.ready.loading,false);assert.equal(await p.locator('body').evaluate(b=>b.inert),false);
   assert.deepEqual(evidence.quality,{level:'high',segments:8,shaderLow:false,maxStrands:30000});
   if(process.env.ANGLE_D3D11==='1')assert.match(evidence.renderer,/Direct3D11|D3D11/i,'The shader regression must use the affected HLSL backend');
   if(process.env.PROFILE_STARTUP==='1')fs.writeFileSync(path.join(out,'gl-profile.json'),JSON.stringify(await p.evaluate(()=>({timing:HSC.startupTiming,gl:__glProfile})),null,2));
   assert.deepEqual(f.errors,[]);return evidence;
  }finally{await f.close();}
 });
 for(const stage of ['Compile','Fence'])await test(`A host pause during ${stage.toLowerCase()} freezes startup and input until resume`,async()=>{
  const f=await fixture({blocked:true,[`pauseAt${stage}`]:true}),p=f.page;
  try{
   await p.waitForFunction(()=>window.__startupInterrupted&&document.body.inert);
   assert.equal(await p.evaluate(()=>!!window.skinFadeStudio),false);
   const before=await p.evaluate(()=>__frames.executed);await p.keyboard.press('ArrowRight');await p.keyboard.press('Space');await p.waitForTimeout(200);
   assert.equal(await p.evaluate(()=>__frames.executed),before);assert.equal(await p.evaluate(()=>__yt.messages.filter(m=>m.name==='gameReady').length),0);
   await p.evaluate(()=>__yt.callbacks.resume());await p.waitForFunction(()=>!!window.skinFadeStudio);
   assert.equal((await state(p)).cameraYawDeg,-55);assert.equal(await p.evaluate(()=>__yt.messages.filter(m=>m.name==='gameReady').length),1);assert.deepEqual(f.errors,[]);
  }finally{await f.close();}
 });
 if(engine==='chromium')for(const stage of ['Compile','Fence'])await test(`Context loss during ${stage.toLowerCase()} recovers at full detail once the browser restores it`,async()=>{
  const f=await fixture({blocked:true,[`loseAt${stage}`]:true,restoreAfter:500}),p=f.page;
  try{await p.waitForFunction(()=>!!window.skinFadeStudio,null,{timeout:60000});assert.equal(await p.evaluate(()=>__yt.messages.filter(m=>m.name==='gameReady').length),1);assert.equal(await p.evaluate(()=>HSC.startupTiming.contextRestores),1);assert.equal(await p.evaluate(()=>HSC.detail.antialias&&HSC.detail.pixelMax===2),true);assert.equal(await p.locator('.boot-error').count(),0);}
  finally{await f.close();}
 });
 if(engine==='chromium')for(const stage of ['Compile','Fence'])await test(`Unrestored context loss during ${stage.toLowerCase()} shows Retry with a code and never lowers graphics`,async()=>{
  const f=await fixture({blocked:true,[`loseAt${stage}`]:true}),p=f.page;
  try{await p.getByRole('button',{name:'Retry',exact:true}).waitFor({state:'visible',timeout:90000});assert.equal(await p.evaluate(()=>HSC.detail.antialias&&HSC.detail.pixelMax===2),true);assert.equal(await p.evaluate(()=>__yt.messages.filter(m=>m.name==='gameReady').length),0);assert.equal(await p.locator('body').evaluate(b=>b.inert),false);assert.equal(await p.locator('.boot-error-code').textContent(),'Code: GFX_LOST');assert(f.errors.some(e=>/graphics|WebGL/.test(e)));}
  finally{await f.close();}
 });
 if(engine==='chromium')await test('A GPU fence that never signals continues to a playable game',async()=>{
  const f=await fixture({fenceNeverSignals:true}),p=f.page;
  try{assert.equal(await p.evaluate(()=>__yt.messages.filter(m=>m.name==='gameReady').length),1);assert.equal(await p.evaluate(()=>HSC.detail.antialias&&HSC.detail.pixelMax===2),true);}
  finally{await f.close();}
 });
 await test('Renderer disposal cancels a pending GPU fence and reaches recovery',async()=>{
  const f=await fixture({blocked:true,disposeAtFence:true}),p=f.page;
  try{await p.getByRole('button',{name:'Retry',exact:true}).waitFor({state:'visible'});assert.equal(await p.evaluate(()=>__yt.messages.filter(m=>m.name==='gameReady').length),0);assert.equal(await p.locator('body').evaluate(b=>b.inert),false);assert(f.errors.some(e=>/cancelled/.test(e)));}
  finally{await f.close();}
 });
 await test('Shader programs stay clean through baldness, ageing, hair and beard variants',async()=>{
  const f=await fixture({viewport:{width:320,height:568}}),p=f.page;
  try{
   const variants=await p.evaluate(async()=>{
    const options=[{noLoss:true,beard:'clean'},{norwood:'3v',beard:'full',age:'old'},{norwood:'6',beard:'goatee'},{baldType:'diffuse',beard:'boxed'}];
    for(let i=0;i<options.length;i++){const person=HSC.makePerson(6200+i,options[i]);HSC.view.setPerson(person);HSC.view.setBeard(HSC.beardStartFor(person));HSC.view.render(false);await new Promise(r=>requestAnimationFrame(r));}
    return options.length;
   });
   assert.deepEqual(f.errors,[]);return {variants};
  }finally{await f.close();}
 });
}

async function mobileStartup(){
 await test('Cold startup makes no optional lighting download even with a stalled model database',async()=>{
  const f=await fixture({envDelay:10000,stalledCache:true,dpr:2,touch:true,mobile:true});
  try{assert.equal(f.requests.filter(url=>url.includes('room-env.dat')).length,0);assert.equal(await f.page.evaluate(()=>HSC.startupTiming.environmentSource),'generated');assert.equal(await f.page.evaluate(()=>HSC.detail.maxStrands),30000);assert.deepEqual(f.errors,[]);}finally{await f.close();}
 });
 await test('A zero-sized Android preloading viewport boots and reflows without changing the saved customer',async()=>{
  const f=await fixture({zeroViewport:true,touch:true,mobile:true,dpr:2});
  try{const before=await state(f.page);await f.page.evaluate(()=>{for(const[key,descriptor]of Object.entries(__viewportDescriptors))Object.defineProperty(window,key,descriptor);document.getElementById('zero-viewport').remove();dispatchEvent(new Event('resize'));});await f.page.waitForTimeout(300);const after=await state(f.page);assert.deepEqual(after.hair,before.hair);assert.deepEqual(after.look,before.look);const size=await f.page.locator('#scene').evaluate(c=>[c.width,c.height]);assert.deepEqual(size,[780,1688]);assert.deepEqual(f.errors,[]);return size;}finally{await f.close();}
 });
 await test('A phone preview with denied localStorage and IndexedDB starts at full detail',async()=>{
  const f=await fixture({deniedStorage:true,hosted:false,touch:true,mobile:true,dpr:2});
  try{assert.equal(await f.page.evaluate(()=>HSC.detail.maxStrands),30000);assert.deepEqual(f.errors,[]);}finally{await f.close();}
 });
 await test('Native touch rotation and cancellation leave the phone controls usable',async()=>{
  const f=await fixture({touch:true,mobile:true,dpr:2}),p=f.page;
  try{
   const cdp=await f.ctx.newCDPSession(p),before=await state(p);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:170,y:320,id:1}]});
   for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:170+i*18,y:320,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
   assert.notEqual((await state(p)).cameraYawDeg,before.cameraYawDeg);
   await p.getByRole('radio',{name:/^Guard 2,/}).tap();
   await p.getByRole('button',{name:'Clipper off: drag to turn the customer',exact:true}).tap();
   assert.equal((await state(p)).selectedGuard,2);assert.equal((await state(p)).interactionMode,'cut');
   await p.getByRole('button',{name:'Clipper on: drag on the hair to cut',exact:true}).tap();
   assert.equal((await state(p)).interactionMode,'rotate');assert.deepEqual(f.errors,[]);
  }finally{await f.close();}
 });
 await test('Cloud progress restores without opening an optional model database',async()=>{
  const f=await fixture({stalledCache:true,touch:true,mobile:true,dpr:2}),p=f.page;
  try{await p.getByRole('radio',{name:/^Guard 2,/}).click();await p.evaluate(()=>HSC.wardrobe.client.flushProgress());const before=await state(p);await p.reload();await p.waitForFunction(()=>!!window.skinFadeStudio);const after=await state(p);assert.deepEqual(after.hair,before.hair);assert.deepEqual(after.look,before.look);assert.equal(after.selectedGuard,2);assert.deepEqual(f.errors,[]);}finally{await f.close();}
 });
 await test('Reflection texels and the full-detail customer survive context loss during play',async()=>{
  const f=await fixture({touch:true,mobile:true,dpr:2,inspectEnvironment:true}),p=f.page;
  async function pixels(){return p.evaluate(()=>{const{target,renderer}=__testEnvironment,b=new Uint16Array(target.width*target.height*4);renderer.readRenderTargetPixels(target,0,0,target.width,target.height,b);let sum=0,nonzero=0;for(let i=0;i<b.length;i++){sum+=b[i];nonzero+=b[i]!==0}return{sum,nonzero}})}
  try{
   const before=await pixels(),stateBefore=await state(p);assert(before.nonzero>1000000);
   await p.evaluate(()=>{const c=document.getElementById('scene'),g=c.getContext('webgl2'),ext=g.getExtension('WEBGL_lose_context');ext.loseContext();setTimeout(()=>ext.restoreContext(),300)});
   await p.waitForFunction(()=>HSC.startupTiming.environmentRestores===1&&!skinFadeStudio.getView().paused,null,{timeout:60000});
   assert.deepEqual(await pixels(),before);assert.deepEqual((await state(p)).hair,stateBefore.hair);assert.deepEqual((await state(p)).look,stateBefore.look);assert.equal(await p.evaluate(()=>HSC.detail.maxStrands),30000);assert.deepEqual(f.errors,[]);return before;
  }finally{await f.close();}
 });
 await test('A paused startup with storage denied waits for SDK resume at full detail',async()=>{
  const f=await fixture({initialPause:true,deniedStorage:true,hosted:true,touch:true,mobile:true,dpr:2}),p=f.page;
  try{await p.waitForTimeout(500);assert.equal(await p.evaluate(()=>!!window.skinFadeStudio),false);assert.equal(f.requests.filter(url=>url.includes('room-env.dat')).length,0);await p.evaluate(()=>__yt.callbacks.resume());await p.waitForFunction(()=>!!window.skinFadeStudio);assert.equal(await p.evaluate(()=>HSC.detail.maxStrands),30000);assert.deepEqual(f.errors,[]);}finally{await f.close();}
 });
}
async function parity(){
 const crypto=require('node:crypto'),baseline=path.resolve(process.env.BASELINE_DIR);
 const f=await fixture({touch:true,mobile:true,dpr:2}),p=f.page;
 try{
  await p.getByRole('radio',{name:/^Guard 2,/}).click();await p.waitForTimeout(700);
  // Give both releases the same decoded save. The older baseline intentionally
  // protects a newer transport instead of interpreting its packed arrays.
  const saved=await p.evaluate(async encoded=>{const slots={};for(const key of Object.keys(JSON.parse(encoded).slots))slots[key]=await HSC.wardrobe.client.loadProgress(key,null);return JSON.stringify({version:1,slots});},f.raw());
  const g=await fixture({saved,releaseRoot:baseline,touch:true,mobile:true,dpr:2});
  try{
   const variants=[{}, {heritage:1,texture:'coily',beard:'full',age:'old'}, {norwood:'6',beard:'goatee'}, {baldType:'diffuse',beard:'boxed'}, {areata:true,beard:'full'}],evidence=[];
   for(let i=0;i<variants.length;i++){
    const images=[];
    for(const page of [g.page,p]){
     const data=await page.evaluate(({seed,opts})=>{const person=HSC.makePerson(seed,opts);if(opts.areata)person.bald.patches=[[0,3.75,-.13,.28],[1.3,3.1,.4,.25],[.7,-.1,1.6,.18]];HSC.view.setPerson(person);HSC.view.setBeard(HSC.beardStartFor(person));HSC.view.render(false);return document.getElementById('scene').toDataURL('image/png').split(',')[1]},{seed:6200+i,opts:variants[i]});
     images.push(Buffer.from(data,'base64'));
    }
    const hashes=images.map(b=>crypto.createHash('sha256').update(b).digest('hex'));assert.equal(hashes[1],hashes[0],`Changed rendered customer ${i}`);evidence.push({variant:variants[i],sha256:hashes[0]});
    if(i===0){fs.writeFileSync(path.join(out,'v394-customer.png'),images[0]);fs.writeFileSync(path.join(out,'v395-customer.png'),images[1]);}
   }
   assert.deepEqual(f.errors,[]);assert.deepEqual(g.errors,[]);return evidence;
  }finally{await g.close();}
 }finally{await f.close();}
}
async function launch(){return({chromium,firefox,webkit}[engine]).launch({headless:process.env.HEADED!=='1',...(engine==='chromium'?{...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox',process.env.ANGLE_D3D11==='1'?'--use-angle=d3d11':'--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}:{}) ,...(engine==='firefox'?{firefoxUserPrefs:{'webgl.force-enabled':true,'webgl.disabled':false,'gfx.webrender.software':true}}:{})});}
async function standalonePreview(){
 await test('Standalone preview boots with YouTube blocked, restores progress and retains full detail',async()=>{
  const localSaved=JSON.stringify({version:1,slots:{'skin-fade-studio-meta-v1':{v:1,cuts:7}}});
  const f=await fixture({localPreview:true,localSaved,touch:true,mobile:engine!=='firefox',dpr:2}),p=f.page;
  try{
   assert.equal(await p.evaluate(()=>typeof globalThis.ytgame),'undefined');
   assert.equal(await p.evaluate(()=>HSC.meta.data.cuts),7);
   assert.equal(await p.evaluate(()=>HSC.detail.maxStrands),30000);
   assert.equal(await p.evaluate(()=>HSC.detail.segments),8);
   const environmentRequests=f.requests.filter(url=>new URL(url).pathname==='/runtime/room-env.dat');
   assert.equal(environmentRequests.length,1,JSON.stringify(environmentRequests));
   await p.getByRole('radio',{name:/^Guard 2,/}).click();await p.waitForTimeout(700);const before=await state(p);
   await p.reload();await p.waitForFunction(()=>!!window.skinFadeStudio);
   assert.equal((await state(p)).selectedGuard,2);assert.deepEqual((await state(p)).hair,before.hair);
   assert.equal(await p.evaluate(()=>HSC.wardrobe.client.rewardedSupported),false);
   assert(f.requests.every(url=>url.startsWith('http://release.test/')));assert.deepEqual(f.errors,[]);
  }finally{await f.close();}
 });
 await test('Standalone preview boots when browser storage is unavailable',async()=>{
  const f=await fixture({localPreview:true,deniedStorage:true,touch:true,mobile:engine!=='firefox',dpr:2});
  try{assert.equal(await f.page.locator('.boot-error').count(),0);assert.equal(await f.page.evaluate(()=>HSC.detail.shaderLow),false);assert.deepEqual(f.errors,[]);}finally{await f.close();}
 });
}
async function benchmark(){
 const builds=[['baseline',process.env.BASELINE_DIR],['candidate',root]],samples={baseline:[],candidate:[]};
 for(let round=0;round<5;round++)for(const [name,releaseRoot]of builds){
  await browser?.close();browser=await launch();
  await test(`Cold startup ${name} ${round+1}/5, 390x844 DPR2`,async()=>{
   const f=await fixture({releaseRoot,dpr:2}),p=f.page;
   try{
    const evidence=await p.evaluate(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return{reportedReady:__yt.messages.find(m=>m.name==='gameReady').at,frameCheckpoint:performance.now(),timing:HSC.startupTiming||null};});
    samples[name].push(evidence);assert.deepEqual(f.errors,[]);return evidence;
   }finally{await f.close();}
  });
 }
 fs.writeFileSync(path.join(out,'startup-benchmark.json'),JSON.stringify({environment:{browser:engine,viewport:[390,844],dpr:2,host:'controlled SDK fixture, no live platform/network latency',cold:'fresh browser process per sample'},samples},null,2));
}
if(require.main!==module)module.exports={start:async()=>{browser=await launch();return browser;},fixture,state,stroke,finish,next};
else (async()=>{
 browser=await launch();
 if(process.env.STANDALONE_PREVIEW==='1')await standalonePreview();else if(process.env.PARITY==='1')await test('All rendered pixels match baseline for seeded customer variants',parity);else if(process.env.MOBILE_STARTUP==='1')await mobileStartup();else if(process.env.BENCHMARK==='1')await benchmark();else if(process.env.STARTUP==='1')await startup();else if(process.env.QUALITY==='1')await quality();else if(process.env.LAYOUT==='1')await layouts();else if(process.env.SOAK==='1')await soak();else await standard();
 await browser.close();const failed=results.filter(x=>x.status==='FAIL');console.log('YOUTUBE BROWSER',engine,results.length-failed.length+'/'+results.length);process.exitCode=failed.length?1:0;
})().catch(async e=>{console.error(e);fs.writeFileSync(path.join(out,'fatal.txt'),e.stack);await browser?.close();process.exitCode=2;});
