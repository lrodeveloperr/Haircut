'use strict';
// Actual Android web bundle: policy and conditional UMP choices live as readable actions under Settings.
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
  // re-pinned 5 November 2026 for the result router (plan 3.2) only: reversing android/completion-interstitial.js and
  // its two splice points reproduces the previous approved hash bd68b869... exactly, so the renderer is unchanged.
  // Re-pinned 6 November 2026 with the owner's approval for head form and camera tilt: source/patch21.py only
  'source/build/runtime/game.js':'3f8fc36c31672de8f7d86cf834b97d8d0c1dd557366ecca78f31e3bef2aa5a62',
  'source/customers/wardrobe.js':'02dc5a1e503d9219c41dbd8eb8522685886475c62b500f3b2bfbd780d8a20291',
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
        window.__privacyCalls=0; window.__adOptionsCalls=0;
        window.AndroidHost={
          request(id,operation,payload) {setTimeout(()=>{if(operation==='save')localStorage.setItem('privacy-save',JSON.parse(payload));__androidHost.complete(id,true,operation==='load'?localStorage.getItem('privacy-save')||'{}':'');},5);},
          gameReady(){}, showRewarded(){throw Error('privacy test must not request ads');}, showInterstitial(){throw Error('privacy test must not request ads');},
          openPrivacy(){__privacyCalls++;}, showPrivacyOptions(){__adOptionsCalls++;},
        };
      });
      const page = await context.newPage(), errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.setDefaultTimeout(120000);
      await page.goto('http://privacy.test/');
      await page.waitForFunction(()=>window.skinFadeStudio&&HSC.startupTiming?.firstPlayable&&!document.body.inert&&document.querySelector('#hsc-set .hsc-privacy'));
      const hair = await page.evaluate(()=>JSON.stringify(skinFadeStudio.getState().hair));
      if(!await page.locator('#hsc-menu.open').count()) await page.getByRole('button',{name:'Menu',exact:true}).click();
      assert.equal(await page.locator('#hsc-menu .home [data-b="daily"]').count(),0,'Daily has no duplicate Home shortcut');
      assert.equal((await page.locator('#hsc-menu .qp').innerText()).trim(),'Quick Play','Quick Play is the first Home action');
      assert.equal((await page.locator('#hsc-menu .hero .hsc-lbl').innerText()).trim(),'Career','the second Home action names its Career outcome');
      assert.ok(await page.evaluate(()=>{const q=document.querySelector('#hsc-menu .qp'),c=document.querySelector('#hsc-menu .hero');return !!(q.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING);}),'Quick Play comes before Career');
      await page.locator('#hsc-menu [data-b="modes"]').click();
      await page.waitForFunction(()=>!document.querySelector('#hsc-menu .modes').hidden);
      assert.equal(await page.locator('#hsc-menu .modes [data-m="daily"]').count(),0,'Daily mode was removed');
      assert.equal(await page.locator('#hsc-menu .modes [data-m="free"]').count(),0,'Modes has no Freestyle or Quick Play tile');
      assert.equal(await page.locator('#hsc-menu .modes [data-m="career"]').count(),0,'Modes has no Career tile');
      await page.locator('#hsc-menu .page.modes > .mhead .back').click();
      await page.getByRole('button',{name:'Settings',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('#hsc-set.open .hsc-privacy'));
      assert.equal(await page.locator('#hsc-panel .hsc-privacy').count(),0,'privacy is not hidden in Wardrobe');
      const visibleText = await page.locator('#hsc-set.open').innerText();
      for(const label of ['Settings','Language','Hand','Sound','Privacy']) assert(visibleText.includes(label),name+': readable setting '+label);
      // a setting may not change a tool's physical result (TOOL-PHYSICS-AND-EFFECT-CONTRACT.md 7.3 items 5-6)
      for(const label of ['Tool width','Cut per pass','Vibration','Reduce motion','Sound cues']) assert(!visibleText.includes(label),name+': removed setting '+label);
      const policy = page.getByRole('button',{name:'Privacy',exact:true});
      const bounds = await policy.evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};});
      assert(bounds.width>=48&&bounds.height>=48,name+': privacy action has a full touch target');
      assert.equal(await page.getByRole('button',{name:'Ad choices',exact:true}).isVisible(),false,'ad choices start hidden');
      await policy.click(); assert.equal(await page.evaluate(()=>__privacyCalls),1,'policy action dispatches once');
      await page.evaluate(()=>{__androidPrivacyOptionsRequired=true;dispatchEvent(new Event('android-privacy-options'));});
      const choices = page.getByRole('button',{name:'Ad choices',exact:true}); await choices.waitFor({state:'visible'});
      await choices.click(); assert.equal(await page.evaluate(()=>__adOptionsCalls),1,'UMP action dispatches separately');
      await page.evaluate(()=>{__androidPrivacyOptionsRequired=false;dispatchEvent(new Event('android-privacy-options'));});
      assert.equal(await choices.isVisible(),false,'current UMP status removes the optional action');
      assert.equal(await page.locator('#hsc-language option').count(),12,'selector exposes exactly the implemented language packs');
      await page.locator('#hsc-language').selectOption('es');
      assert((await page.locator('#hsc-set.open').innerText()).includes('Ajustes'),'language change updates Settings atomically');
      await page.locator('#hsc-language').selectOption('en');
      assert.equal(await page.evaluate(()=>JSON.stringify(skinFadeStudio.getState().hair)),hair,'settings and privacy preserve the haircut');
      assert.deepEqual(errors,[],'privacy path has no page exceptions');
      const shot='android-browser-settings-'+name+'.png'; await page.screenshot({path:path.join(out,shot)}); report.screenshots.push(shot);
      report.layouts.push({name,width,height,careerFreestyleDistinct:true,dailyGrouped:true,languageSwitch:true,settingsText:true,policyUnderSettings:true,conditionalAdOptions:true,nativeEntryCalls:1,hairPreserved:true,pageErrors:errors});
      console.log('PASS privacy:',name,'text Settings; policy/UMP routing; preserved haircut');
      await context.close();
    }
    report.status='PASS';
  } catch(error) { report.status='FAIL'; report.error=error.stack; throw error; }
  finally { fs.writeFileSync(path.join(out,'android-browser-privacy-report.json'),JSON.stringify(report,null,2)); await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
