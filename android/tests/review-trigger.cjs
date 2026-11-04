'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require('playwright');
const script=path.resolve(__dirname,'../review.js');

(async()=>{
  const browser=await chromium.launch({args:['--no-sandbox']});
  try{
    const page=await browser.newPage();
    await page.setContent('<button class="training-continue" disabled>Next</button>');
    await page.evaluate(()=>{
      window.reviewEvents=[];
      window.AndroidHost={reviewMoment(completed,qualified,activeMs){reviewEvents.push({completed,qualified,activeMs});}};
      window.reviewState={status:'cutting',completed:2,adCadence:{qualified:1,activeMs:59_900}};
      window.reviewView={revealComplete:false};
      window.skinFadeStudio={getState:()=>reviewState,getView:()=>reviewView};
    });
    await page.addScriptTag({path:script});
    await page.waitForTimeout(300);
    await page.evaluate(()=>{
      reviewState={status:'reveal',completed:3,adCadence:{qualified:1,activeMs:61_234.9}};
      document.body.dataset.phase='spinning';
    });
    await page.evaluate(()=>{
      reviewView={revealComplete:true};
      document.querySelector('.training-continue').disabled=false;
    });
    await page.waitForFunction(()=>reviewEvents.length===1);
    assert.deepEqual(await page.evaluate(()=>reviewEvents),[{completed:3,qualified:1,activeMs:61234}]);
    await page.evaluate(()=>{document.body.dataset.extra='mutation';});
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(()=>reviewEvents.length),1,'one report per completion');

    const restored=await browser.newPage();
    await restored.setContent('<button class="training-continue">Next</button>');
    await restored.evaluate(()=>{
      window.reviewEvents=[];
      window.AndroidHost={reviewMoment(...args){reviewEvents.push(args);}};
      window.reviewState={status:'reveal',completed:9,adCadence:{qualified:1,activeMs:70_000}};
      window.reviewView={revealComplete:true};
      window.skinFadeStudio={getState:()=>reviewState,getView:()=>reviewView};
    });
    await restored.addScriptTag({path:script});
    await restored.waitForTimeout(350);
    assert.deepEqual(await restored.evaluate(()=>reviewEvents),[],'restored reveal does not request a review');
    console.log('PASS: Android review bridge reports one newly completed reveal and ignores restored reveals.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
