'use strict';
// Run the production Android completion hook and production Next handler together.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const game = fs.readFileSync(path.join(root, 'source/build/runtime/game.js'), 'utf8');
const hook = fs.readFileSync(path.join(root, 'android/completion-interstitial.js'), 'utf8');
const start = game.indexOf('async function Ee(){');
const next = game.slice(start, game.indexOf('async function hs_replay()', start));
assert(game.includes(hook));
assert(game.includes('fe===1&&(x=!0,androidCompletionInterstitial())'));
assert(!next.includes('showInterstitial'), 'Next cannot issue a duplicate or late ad');
const client = fs.readFileSync(path.join(root, 'source/build/runtime/android-client.js'), 'utf8');
assert(!client.includes('performance.now() - lastAttempt < 60000'), 'every customer is eligible, including quick successive customers');

function harness(outcome) {
  const context = vm.createContext({outcome});
  vm.runInContext(`
    let C=false,T=false,c=false,x=true,y=false,l={qualified:1,activeMs:1};
    let s={status:'reveal',jobId:'customer-1',completed:1};
    let calls=0,writes=0,renderedBusy=false,releases,events=[];
    const V=()=>{},Z=()=>{renderedBusy=T},J=()=>{},ga=()=>({qualified:0,activeMs:0});
    const rt=Object.assign,gt=Object.assign,Is=old=>({...old,status:'cutting'});
    const $=async()=>{writes++};
    const t={showInterstitial:async placement=>{
      calls++;events.push(placement);
      if(outcome==='throw')throw Error('SDK failed');
      return new Promise(resolve=>{releases=resolve});
    },sendAnalytics:(...args)=>events.push(args)};
    ${hook}
    ${next}
    globalThis.h={complete:androidCompletionInterstitial,next:Ee,
      read:()=>({busy:T,status:s.status,calls,writes,renderedBusy}),
      close:value=>releases(value),destroy:()=>{C=true},
      customer:()=>{s={status:'reveal',jobId:'customer-'+(s.completed+1),completed:s.completed+1};x=true;}
    };
  `, context);
  return context.h;
}

(async () => {
  for (const displayed of [true, false]) {
    const h=harness();
    const first=h.complete();
    assert.equal(h.read().busy,true,'busy is acquired synchronously before any enabled Next render');
    assert.equal(h.read().renderedBusy,true);
    assert.equal(await h.next(),false,'a queued Next tap during save/preload cannot advance');
    await new Promise(setImmediate);
    assert.equal(h.read().calls,1);
    await h.complete();
    assert.equal(h.read().calls,1,'duplicate completion notifications cannot request a second ad');
    assert.equal(await h.next(),false,'Next stays blocked while the ad is showing');
    h.close(displayed);await first;
    assert.equal(h.read().busy,false,'close and no-fill both release the completion');
    assert.equal(await h.next(),true);
    assert.equal(h.read().status,'cutting');
    assert.equal(h.read().calls,1,'starting the next haircut does not show a late interstitial');
    h.customer();
    const second=h.complete();await new Promise(setImmediate);
    assert.equal(h.read().calls,2,'the second customer has its own ad without a time/count gate');
    h.close(displayed);await second;
  }
  const failure=harness('throw');
  await failure.complete();
  assert.equal(failure.read().busy,false,'an SDK exception cannot strand the completion');
  assert.equal(await failure.next(),true);
  const destroyed=harness();
  const pending=destroyed.complete();await new Promise(setImmediate);
  destroyed.destroy();destroyed.close(true);await pending;
  assert.equal(destroyed.read().busy,false);
  console.log('PASS: completion is atomic; rapid Next cannot bypass; every customer gets one attempt; close/no-fill/error/destruction release safely.');
})().catch(error=>{console.error(error);process.exitCode=1;});
