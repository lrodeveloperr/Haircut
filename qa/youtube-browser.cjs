// Runs the extracted upload bytes against a strict direct-YouTube SDK fixture.
// This fixture is installed by the test runner, never packaged with the game.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,firefox,webkit}=require('playwright');
const engine=process.env.BROWSER||'chromium',root=path.resolve(process.env.RELEASE_DIR||'source/build-youtube');
const out=path.resolve(process.env.QA_OUTPUT||`qa/results/youtube-${engine}`);fs.mkdirSync(out,{recursive:true});
const results=[];let browser;
async function test(name,fn){try{const evidence=await fn();results.push({name,status:'PASS',evidence});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(JSON.stringify(results.at(-1)));fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({engine,archiveSha256:process.env.ARCHIVE_SHA,results},null,2));}
const csp="default-src 'none'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.youtube.com/game_api/v1 https://www.youtube.com/game_api/v1/; object-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self' blob: data:; base-uri 'self'; worker-src 'self' blob:";
async function fixture(options={}){
 let raw=options.saved||'',readFail=!!options.readFail,writeFail=false;
 const calls=[],errors=[],requests=[];
 const ctx=await browser.newContext({viewport:options.viewport||{width:390,height:844},reducedMotion:'reduce',hasTouch:!!options.touch});
 const page=await ctx.newPage();page.setDefaultTimeout(10000);
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await ctx.exposeBinding('readCloud',async()=>{calls.push(['load']);if(readFail)throw Error('Injected cloud read failure');return raw;});
 await ctx.exposeBinding('writeCloud',async(_,value)=>{calls.push(['save-start']);if(writeFail)throw Error('Injected cloud write failure');raw=value;calls.push(['save-ack']);});
 await ctx.addInitScript(()=>{
   const raf=window.requestAnimationFrame;window.__frames={requested:0,executed:0};
   window.requestAnimationFrame=fn=>{__frames.requested++;return raf.call(window,t=>{__frames.executed++;fn(t);});};
 });
 await ctx.route('http://release.test/**',async route=>{const pathname=new URL(route.request().url()).pathname;const file=path.join(root,pathname==='/'?'index.html':pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'not found'});await route.fulfill({path:file,headers:{'Content-Security-Policy':csp},contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp'})[path.extname(file)]||'text/plain'});});
 if(!options.realSdk)await ctx.route('https://www.youtube.com/game_api/v1',route=>options.missing?route.abort():route.fulfill({contentType:'application/javascript',body:`
   window.__yt={messages:[],ads:[],callbacks:{},rewardMode:'${options.rewardMode||'earned'}',paused:false,audio:${options.audio!==false}};
   const sub=k=>fn=>{__yt.callbacks[k]=fn;${options.initialPause?"if(k==='pause'){__yt.paused=true;fn();}":''}return()=>delete __yt.callbacks[k];};
   window.ytgame={IN_PLAYABLES_ENV:${options.hosted!==false},SDK_VERSION:'strict-test-fixture',
     system:{getLanguage:async()=> 'fr-CA',isAudioEnabled:()=>__yt.audio,onPause:sub('pause'),onResume:sub('resume'),onAudioEnabledChange:sub('audio')},
     game:{loadData:()=>readCloud(),saveData:v=>writeCloud(v),firstFrameReady(){__yt.messages.push({name:'firstFrameReady',loading:!!document.getElementById('yt-loading')});},gameReady(){__yt.messages.push({name:'gameReady',loading:!!document.getElementById('yt-loading'),hud:!!document.getElementById('hud')});}},
     health:{logWarning(){}},
     ads:{requestRewardedAd:async id=>{__yt.ads.push({kind:'rewarded',id});await new Promise(r=>setTimeout(r,100));if(__yt.rewardMode==='error')throw Error('no fill');return __yt.rewardMode==='earned';},requestInterstitialAd:async()=>{__yt.ads.push({kind:'interstitial'});await new Promise(r=>setTimeout(r,100));}}
   };` }));
 await page.goto('http://release.test/',{waitUntil:'load'});
 if(!options.blocked&&!options.missing&&!options.readFail&&!options.initialPause)await page.waitForFunction(()=>!!window.skinFadeStudio,null,{timeout:45000});
 return {ctx,page,calls,errors,requests,raw:()=>raw,readFail(value){readFail=value;},writeFail(value){writeFail=value;},close:()=>ctx.close()};
}
const state=p=>p.evaluate(()=>JSON.parse(JSON.stringify(skinFadeStudio.getState())));
async function stroke(p){
 await p.getByRole('radio',{name:/^Guard 0,/}).click();await p.keyboard.press('ArrowRight');
 if((await state(p)).interactionMode!=='cut')await p.getByRole('button',{name:'Clipper off: drag to turn the customer',exact:true}).click();
 const point=await p.locator('.tutorial.tut-cut').evaluateAll(es=>es.length?{x:es[0].getBoundingClientRect().x,y:es[0].getBoundingClientRect().y}:null);
 const size=p.viewportSize(),pt=point||{x:size.width*.47,y:size.height*.33};
 await p.mouse.move(pt.x,pt.y);await p.mouse.down();await p.mouse.move(pt.x+30,pt.y+80,{steps:10});await p.mouse.up();await p.waitForTimeout(300);
}
async function finish(p){await p.getByRole('button',{name:'Finish haircut',exact:true}).click();await p.locator('#hsc-hub.show').waitFor({state:'visible',timeout:45000});}
async function next(p){await p.locator('.training-continue').click();await p.locator('#hsc-hub.show').waitFor({state:'hidden',timeout:45000});await p.getByRole('button',{name:'Finish haircut',exact:true}).waitFor({state:'visible',timeout:45000});}
async function reward(p,mode){await p.evaluate(mode=>__yt.rewardMode=mode,mode);await p.locator('.hsc-vbtn').click();await p.waitForTimeout(700);}
async function standard(){
 let f=await fixture(),p=f.page;
 await test('Ready signals use a real loading screen and occur once in order',async()=>{const m=await p.evaluate(()=>__yt.messages);assert.deepEqual(m.map(x=>x.name),['firstFrameReady','gameReady']);assert.equal(m[0].loading,true);assert.equal(m[1].loading,false);assert.equal(m[1].hud,true);assert.equal(await p.locator('.audio-toggle').count(),0);assert.equal(await p.locator('html').getAttribute('lang'),'fr-CA');});
 await test('Native cutting, cloud save and reload restore the exact haircut',async()=>{await stroke(p);const before=await state(p);assert(before.cutStrokeCount>0);await p.waitForTimeout(700);assert(f.raw().length>0);await p.reload();await p.waitForFunction(()=>!!window.skinFadeStudio);const after=await state(p);assert.deepEqual(after.hair,before.hair);assert.equal(after.selectedGuard,before.selectedGuard);});
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
 await test('Paid replay restores the same customer and preserves the next queue',async()=>{await finish(p);await p.screenshot({path:path.join(out,'completion.png')});const before=await state(p),queue=await p.evaluate(()=>JSON.stringify(HSC.meta.data.queue));await p.locator('.hsc-replay').click();await p.getByRole('button',{name:'Finish haircut',exact:true}).waitFor({state:'visible',timeout:30000});const after=await state(p);assert.equal(after.look.person.seed,before.look.person.seed);assert.deepEqual(after.hair,after.startHair);assert.equal(await p.evaluate(()=>JSON.stringify(HSC.meta.data.queue)),queue);});
 await test('A cloud write failure blocks the reward request and preserves usability',async()=>{await p.locator('#hsc-hud .hsc-rw').click();await p.locator('.hsc-tab').last().click();f.writeFail(true);const ads=await p.evaluate(()=>__yt.ads.length);await reward(p,'earned');assert.equal(await p.evaluate(()=>__yt.ads.length),ads);assert(await p.locator('.hsc-vbtn').isEnabled());f.writeFail(false);await p.keyboard.press('Escape');});
 await test('Only bundled resources and the official YouTube SDK are requested',async()=>{assert.deepEqual(f.errors,[]);assert(f.requests.every(url=>url.startsWith('http://release.test/')||url==='https://www.youtube.com/game_api/v1'));});
 const saved=f.raw();await f.close();
 await test('Unread cloud data is preserved and Retry restores it',async()=>{const g=await fixture({saved,readFail:true}),p=g.page;try{await p.getByRole('button',{name:'Retry',exact:true}).waitFor({state:'visible'});assert.equal(g.raw(),saved);assert.equal(g.calls.filter(c=>c[0]==='save-start').length,0);g.readFail(false);await p.getByRole('button',{name:'Retry',exact:true}).click();await p.waitForFunction(()=>!!window.skinFadeStudio);assert.deepEqual((await state(p)).hair,JSON.parse(saved).slots['skin-fade-studio-session-v2'].hair);}finally{await g.close();}});
 await test('A future cloud envelope shows recovery and never overwrites progress',async()=>{const saved=JSON.stringify({version:2,slots:{}}),g=await fixture({saved,blocked:true});try{await g.page.getByRole('heading',{name:'A newer game version is needed'}).waitFor({state:'visible'});assert.equal(g.raw(),saved);assert.equal(g.calls.filter(c=>c[0]==='save-start').length,0);}finally{await g.close();}});
 await test('Missing SDK gives a keyboard-focused Retry in a tiny embed',async()=>{const g=await fixture({missing:true,viewport:{width:225,height:400}});try{const retry=g.page.getByRole('button',{name:'Retry',exact:true});await retry.waitFor({state:'visible'});assert.equal(await retry.evaluate(e=>e===document.activeElement),true);await g.page.screenshot({path:path.join(out,'missing-sdk.png')});}finally{await g.close();}});
 await test('An initial host pause defers gameplay until the host resumes',async()=>{const g=await fixture({initialPause:true});try{await g.page.waitForTimeout(600);assert.equal(await g.page.evaluate(()=>!!window.skinFadeStudio),false);await g.page.evaluate(()=>__yt.callbacks.resume());await g.page.waitForFunction(()=>!!window.skinFadeStudio);assert.equal(await g.page.evaluate(()=>__yt.messages.filter(m=>m.name==='gameReady').length),1);}finally{await g.close();}});
 await test('Off-platform preview uses the official SDK mode without rewarded CTAs',async()=>{const g=await fixture({hosted:false});try{assert.equal(await g.page.locator('.hsc-replay').count(),0);assert.equal(g.calls.filter(c=>c[0]==='load'||c[0]==='save-start').length,0);assert.equal(await g.page.evaluate(()=>HSC.wardrobe.client.isLocalPreview),true);}finally{await g.close();}});
 if(engine==='chromium')await test('The real official SDK loads under YouTube CSP in off-platform preview',async()=>{const g=await fixture({realSdk:true});try{assert.equal(await g.page.evaluate(()=>typeof ytgame.game.loadData),'function');assert.equal(await g.page.evaluate(()=>HSC.wardrobe.client.isLocalPreview),true);assert.deepEqual(g.errors,[]);}finally{await g.close();}});
}
const viewports=[[225,400],[320,568],[360,640],[375,667],[390,844],[412,915],[430,932],[568,320],[640,360],[844,390],[932,430],[717,512],[768,1024],[820,1180],[1024,1366],[1024,768],[1180,820],[1366,1024],[1280,720],[1366,768],[1440,900],[1920,1080],[2560,1440],[3440,1440],[400,400],[480,270],[270,480]];
async function layouts(){
 const group=Number(process.env.LAYOUT_GROUP||0),screens=viewports.filter((_,i)=>i%4===group);
 const f=await fixture(),p=f.page;
 for(const [width,height]of screens)await test(`Layout ${width}x${height}: play, clipper wardrobe, gown wardrobe, completion`,async()=>{
   await p.setViewportSize({width,height});await p.waitForTimeout(300);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1),false);
   const finishButton=p.getByRole('button',{name:'Finish haircut',exact:true});assert(await finishButton.isVisible());
   await p.screenshot({path:path.join(out,`${width}x${height}-play.png`)});
   await p.locator('#hsc-hud .hsc-rw').click();await p.locator('.hsc-tab').first().click();await p.waitForTimeout(250);await p.screenshot({path:path.join(out,`${width}x${height}-clipper.png`)});
   await p.locator('.hsc-tab').last().click();await p.waitForTimeout(150);await p.screenshot({path:path.join(out,`${width}x${height}-gown.png`)});
   const card=await p.locator('.hsc-vbtn').boundingBox();assert(card&&card.x>=-1&&card.y>=-1&&card.x+card.width<=width+1&&card.y+card.height<=height+1);
   await p.keyboard.press('Escape');await p.waitForTimeout(500);await finish(p);await p.screenshot({path:path.join(out,`${width}x${height}-completion.png`)});await next(p);await p.waitForTimeout(500);
 });
 assert.deepEqual(f.errors,[]);await f.close();
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
(async()=>{
 browser=await({chromium,firefox,webkit}[engine]).launch({headless:process.env.HEADED!=='1',...(engine==='chromium'?{args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{}) ,...(engine==='firefox'?{firefoxUserPrefs:{'webgl.force-enabled':true,'webgl.disabled':false,'gfx.webrender.software':true}}:{})});
 if(process.env.LAYOUT==='1')await layouts();else if(process.env.SOAK==='1')await soak();else await standard();
 await browser.close();const failed=results.filter(x=>x.status==='FAIL');console.log('YOUTUBE BROWSER',engine,results.length-failed.length+'/'+results.length);process.exitCode=failed.length?1:0;
})().catch(async e=>{console.error(e);fs.writeFileSync(path.join(out,'fatal.txt'),e.stack);await browser?.close();process.exitCode=2;});
