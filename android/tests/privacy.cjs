'use strict';
// Actual Android web bundle: privacy must consume spare header space without moving existing UI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '../..'), build = path.join(root, 'source/build');
const out = path.join(root, 'qa/results'); fs.mkdirSync(out, {recursive:true});
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const frozen = {
  'android/clipper-input.js':'231830bf96d9e63b8a30832d75ca45399fb85e31affb8a02d47c4b7bdea115ca',
  'source/build/runtime/game.js':'d553e1a9109cbf79aae7d8f4b051e71c58244e4a729fcbdf953a4f26b62f590b',
  'source/customers/wardrobe.js':'82c57c8d2debee22a8817e52654709889587c5ffd39a326c2603505748f5d4a8',
};
for(const [p,expected] of Object.entries(frozen)) assert.equal(hash(p),expected,'owner-approved source must remain byte-identical: '+p);
const types = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.json':'application/json'};
const report = {status:'RUNNING',frozen,layouts:[],screenshots:[]};
(async()=>{
  const browser = await chromium.launch({...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    for(const [name,width,height] of [['phone-portrait',390,844],['phone-landscape',844,390],['tablet-portrait',800,1280],['tablet-landscape',1280,800]]) {
      const context = await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:true});
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        assert.equal(url.hostname,'privacy.test','bundled game must not request external services');
        const file = path.join(build,url.pathname==='/'?'index.html':url.pathname);
        if(!file.startsWith(build+path.sep)||!fs.existsSync(file)) return route.fulfill({status:404,body:''});
        await route.fulfill({path:file,contentType:types[path.extname(file)]||'application/octet-stream'});
      });
      await context.addInitScript(()=>{
        window.__privacyCalls=0;
        window.__adOptionsCalls=0;
        window.AndroidHost={
          request(id,operation,payload) {setTimeout(()=>{
            if(operation==='save') localStorage.setItem('privacy-save',JSON.parse(payload));
            __androidHost.complete(id,true,operation==='load'?localStorage.getItem('privacy-save')||'{}':'');
          },5);},
          gameReady(){},
          showRewarded(){throw Error('privacy test must not request ads');},
          showInterstitial(){throw Error('privacy test must not request ads');},
          openPrivacy(){__privacyCalls++;},
          showPrivacyOptions(){__adOptionsCalls++;},
        };
      });
      const page = await context.newPage(), errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      page.setDefaultTimeout(120000);
      await page.goto('http://privacy.test/');
      await page.waitForFunction(()=>window.skinFadeStudio&&HSC.startupTiming?.firstPlayable&&!document.body.inert&&document.querySelector('.hsc-privacy'));
      await page.getByRole('button',{name:'Wardrobe',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('#hsc-panel.open')&&skinFadeStudio.getView().paused);
      assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Close','opening wardrobe retains its existing Close focus');
      await page.addStyleTag({content:'*{animation:none!important;transition:none!important}'});
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const geometry = () => page.evaluate(()=>{
        const selectors=['#scene','#hsc-panel','.hsc-sheet','.hsc-head','.hsc-pickwrap','.hsc-pick','.hsc-coll','.hsc-grid','.hsc-pager', '.ui button','#hsc-hud button','#hsc-panel button:not(.hsc-privacy):not(.hsc-ad-options)'];
        return selectors.flatMap(selector=>[...document.querySelectorAll(selector)].map((el,index)=>{
          const r=el.getBoundingClientRect(); return {selector,index,x:r.x,y:r.y,width:r.width,height:r.height};
        }));
      });
      const hair = await page.evaluate(()=>JSON.stringify(skinFadeStudio.getState().hair));
      await page.locator('.hsc-privacy').evaluate(el=>el.style.display='none');
      const before = await geometry();
      const beforeName='android-browser-privacy-'+name+'-before.png';
      await page.screenshot({path:path.join(out,beforeName)});report.screenshots.push(beforeName);
      await page.locator('.hsc-privacy').evaluate(el=>el.style.display='');
      const after = await geometry();
      assert.deepEqual(after,before,name+': all pre-existing element bounds must be unchanged');
      assert.equal(await page.getByRole('button',{name:'Ad privacy choices',exact:true}).isVisible(),false,'ad choices hidden until UMP requires them');
      const policyBounds=await page.locator('.hsc-privacy').evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};});
      await page.evaluate(()=>{__androidPrivacyOptionsRequired=true;window.dispatchEvent(new Event('android-privacy-options'));});
      assert.deepEqual(await geometry(),after,name+': required ad choices do not move any existing control or card');
      assert.deepEqual(await page.locator('.hsc-privacy').evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}),policyBounds,'direct policy shield stays fixed');
      const optionsGeometry=await page.locator('.hsc-ad-options').evaluate(el=>{
        const r=el.getBoundingClientRect(),p=document.querySelector('.hsc-privacy').getBoundingClientRect();
        const left=Array.from(document.querySelectorAll('.hsc-head .hsc-tab')).map(t=>t.getBoundingClientRect().right);
        return{width:r.width,height:r.height,gap:p.left-r.right,centreError:Math.abs(r.y+r.height/2-p.y-p.height/2),clearTabs:r.left>Math.max(...left)};
      });
      assert(optionsGeometry.gap>0&&optionsGeometry.centreError<.02&&optionsGeometry.clearTabs,name+': separate, aligned ad-choices target fits spare header space');
      await page.getByRole('button',{name:'Ad privacy choices',exact:true}).click();
      assert.equal(await page.evaluate(()=>__adOptionsCalls),1,'ad choices dispatches only its separate native UMP operation');
      assert.equal(await page.evaluate(()=>__privacyCalls),0,'ad choices never invokes the external policy button');
      const alignment=await page.evaluate(()=>{
        const header=document.querySelector('.hsc-head');
        const p=header.querySelector('.hsc-privacy').getBoundingClientRect();
        const c=header.querySelector('.hsc-x:not(.hsc-privacy)').getBoundingClientRect();
        const tab=header.querySelector('.hsc-tab:last-of-type');
        return {privacy:{x:p.x,y:p.y,width:p.width,height:p.height},close:{x:c.x,y:c.y,width:c.width,height:c.height},gap:c.left-p.right,centreError:Math.abs(p.top+p.height/2-c.top-c.height/2)};
      });
      assert(alignment.centreError<.02,name+': button centreline matches Close');
      assert(Math.abs(alignment.privacy.width-alignment.close.width)<.02&&Math.abs(alignment.privacy.height-alignment.close.height)<.02,name+': button diameter matches Close');
      assert(alignment.gap>0,name+': separate nonoverlapping privacy and Close targets');
      const afterName='android-browser-privacy-'+name+'-after.png';
      await page.screenshot({path:path.join(out,afterName)});report.screenshots.push(afterName);
      await page.getByRole('button',{name:'Privacy',exact:true}).click();
      assert.equal(await page.evaluate(()=>__privacyCalls),1,'one tap opens native privacy entry once');
      assert.equal(await page.evaluate(()=>__adOptionsCalls),1,'policy shield never invokes UMP');
      await page.evaluate(()=>{__androidPrivacyOptionsRequired=false;window.dispatchEvent(new Event('android-privacy-options'));});
      assert.equal(await page.getByRole('button',{name:'Ad privacy choices',exact:true}).isVisible(),false,'current UMP status can remove ad choices');
      assert.deepEqual(await geometry(),after,'hiding ad choices preserves the existing geometry');
      assert.equal(await page.evaluate(()=>JSON.stringify(skinFadeStudio.getState().hair)),hair,'opening privacy preserves haircut');
      assert(await page.evaluate(()=>skinFadeStudio.getView().paused),'wardrobe retains pause ownership');
      await page.evaluate(()=>{__androidHost.pause(true);__androidHost.pause(false);});
      assert(await page.evaluate(()=>skinFadeStudio.getView().paused),'host resume must not unpause the open wardrobe');
      await page.getByRole('button',{name:'Close',exact:true}).click();
      await page.waitForFunction(()=>!skinFadeStudio.getView().paused);
      assert.equal(await page.evaluate(()=>JSON.stringify(skinFadeStudio.getState().hair)),hair,'privacy return preserves haircut');
      assert.deepEqual(errors,[],'privacy path has no page exceptions');
      report.layouts.push({name,width,height,existingBoundsUnchanged:true,alignment,optionsGeometry,conditionalAdOptions:true,separateNativeDispatch:true,nativeEntryCalls:1,hairPreserved:true,pauseOwnership:true,pageErrors:errors});
      console.log('PASS privacy:',name,'unchanged existing layout; aligned shield; native entry; preserved haircut/pause');
      await context.close();
    }
    report.status='PASS';
  } catch(error) { report.status='FAIL';report.error=error.stack;throw error; }
  finally { fs.writeFileSync(path.join(out,'android-browser-privacy-report.json'),JSON.stringify(report,null,2)); await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
