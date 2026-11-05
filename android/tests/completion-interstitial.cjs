'use strict';
// The completed-customer result router (MONETIZATION-STRATEGY sections 4 and 6; plan 3.2): runs the production
// Android reveal hook, the production Next handler and the real HSC.adRouter together.
//   - the reveal shows no ad; Continue attempts one interstitial for a newly completed customer
//   - a rewarded video started on that result wins the break: Continue shows no interstitial
//   - an incomplete customer, or a reveal restored after a reload, shows none
//   - rapid Next taps cannot advance during the ad or request a second one; no fill and SDK errors release it
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const game = fs.readFileSync(path.join(root, 'source/build/runtime/game.js'), 'utf8');
const hook = fs.readFileSync(path.join(root, 'android/completion-interstitial.js'), 'utf8');
const routerSrc = fs.readFileSync(path.join(root, 'source/customers/ad-router.js'), 'utf8');
const start = game.indexOf('async function Ee(){');
const next = game.slice(start, game.indexOf('async function hs_replay()', start));
assert(game.includes(hook), 'the router hook is in the Android game');
assert(game.includes('fe===1&&androidRevealDone()'), 'the reveal only enables Continue');
assert(!game.includes('androidCompletionInterstitial'), 'no ad at the reveal');
assert(next.startsWith('async function Ee(){if(c||T||s.status!=="reveal"||!x)return!1;await androidResultBreak();'), 'Continue asks the router first');
assert.equal((next.match(/showInterstitial/g) || []).length, 0, 'the Next body itself requests no ad');

function harness(outcome) {
  const context = vm.createContext({ outcome, console });
  vm.runInContext(`
    var HSC = { PHENOTYPES: {}, detail: { commitPending() {} } };
    var globalThis_ = this;
    ${routerSrc.replace('globalThis.HSC || (globalThis.HSC = {})', 'HSC')}
    let C=false,T=false,c=false,x=false,y=false,l={};
    let s={status:'reveal',jobId:1};
    let calls=0,writes=0,releases,events=[];
    const V=()=>{},Z=()=>{},J=()=>{},ga=()=>({});
    const rt=Object.assign,gt=Object.assign,Is=old=>({...old,status:'cutting',jobId:old.jobId+1});
    const $=async()=>{writes++};
    const t={showInterstitial:async placement=>{
      calls++;events.push(placement);
      if(outcome==='throw')throw Error('SDK failed');
      return new Promise(resolve=>{releases=resolve});
    },sendAnalytics:(...args)=>events.push(args)};
    this.skinFadeStudio = { getState: () => s };
    ${hook}
    ${next}
    globalThis.h={reveal:()=>{androidRevealDone();},next:Ee,router:HSC.adRouter,
      read:()=>({busy:T,status:s.status,job:s.jobId,calls}),
      close:value=>releases(value),destroy:()=>{C=true},
      customer:()=>{s={status:'reveal',jobId:s.jobId,completed:1};x=false;}
    };
  `, context);
  return context.h;
}
const tick = () => new Promise(setImmediate);

(async () => {
  // 1. a completed customer: the reveal shows nothing; Continue attempts one interstitial, blocks, then advances
  for (const displayed of [true, false]) {
    const h = harness();
    h.router.completed(1, true);
    h.reveal();
    assert.equal(h.read().calls, 0, 'no ad at the reveal');
    const first = h.next();
    await tick();
    assert.equal(h.read().calls, 1, 'Continue attempts the interstitial');
    assert.equal(h.read().busy, true);
    assert.equal(await h.next(), false, 'a second tap during the ad cannot advance');
    assert.equal(h.read().calls, 1, 'or request a second ad');
    h.close(displayed);
    assert.equal(await first, true, 'close and no-fill both continue to the next customer');
    assert.equal(h.read().status, 'cutting');
    assert.equal(h.router.outcome(1), 'interstitial');
    // the next customer has his own break
    h.customer(); h.router.completed(2, true); h.reveal();
    const second = h.next(); await tick();
    assert.equal(h.read().calls, 2, 'every completed customer gets one attempt');
    h.close(displayed); await second;
  }
  // 2. a rewarded video started on the result wins the break
  {
    const h = harness();
    h.router.completed(1, true); h.reveal();
    h.router.rewardedStarted();
    assert.equal(await h.next(), true);
    assert.equal(h.read().calls, 0, 'no interstitial after a rewarded result');
    assert.equal(h.router.outcome(1), 'rewarded');
  }
  // 3. incomplete work, and a reveal restored after a reload (never completed in this session): no ad
  {
    const h = harness();
    h.router.completed(1, false); h.reveal();
    assert.equal(await h.next(), true); assert.equal(h.read().calls, 0, 'an incomplete customer opens no break');
    const r = harness(); r.reveal();
    assert.equal(await r.next(), true); assert.equal(r.read().calls, 0, 'a restored reveal shows no ad');
  }
  // 4. a replay of the same customer cannot open a second break
  {
    const h = harness();
    h.router.completed(1, true); h.router.completed(1, true);
    h.reveal(); const p = h.next(); await tick(); h.close(true); await p;
    assert.equal(h.router.route(1), null, 'the break is used once');
  }
  // 5. SDK errors and destruction release Continue
  {
    const f = harness('throw'); f.router.completed(1, true); f.reveal();
    assert.equal(await f.next(), true); assert.equal(f.read().busy, false, 'an SDK exception cannot strand Continue');
    const d = harness(); d.router.completed(1, true); d.reveal();
    const p = d.next(); await tick(); d.destroy(); d.close(true); await p;
    assert.equal(d.read().busy, false);
  }
  console.log('PASS: result router: no ad at the reveal; one interstitial on Continue per completed customer; a rewarded result, incomplete work or a restored reveal shows none; rapid taps, no fill and errors release safely.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
