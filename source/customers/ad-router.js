// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the completed-customer result router (docs/MONETIZATION-STRATEGY.md
// sections 4 and 6; implementation plan 3.2; locked by the owner; AGENTS.md: replaces the reveal-time
// interstitial only once implemented and tested).
//
// One full-screen commercial outcome per completed customer, decided at the result break:
//   rewarded       the player started any rewarded video while that result was on screen (accepted, or attempted
//                  and failed): that wins the break and the interstitial is suppressed
//   interstitial   otherwise the ordinary Continue (Next) attempts one interstitial, once
//   none           no meaningful work (incomplete), a result restored after a reload (not completed in this
//                  session), a recent reward, or the break already used
// The record is per job id, decided synchronously, and bounded; nothing here grants rewards or changes the
// earned-reward callbacks (the wardrobe's watchVideo still owns them).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const MAX = 50;
  const recs = new Map(); // job id -> 'pending' | 'rewarded' | 'interstitial' | 'none'
  const counts = { rewarded: 0, interstitial: 0, none: 0 };
  const G = () => globalThis.skinFadeStudio;
  const set = (job, v) => { recs.delete(job); recs.set(job, v); while (recs.size > MAX) recs.delete(recs.keys().next().value); };
  const settle = (job, v) => { if (recs.get(job) === 'pending') { set(job, v); counts[v]++; } };
  const router = {
    // a newly completed customer with meaningful work opens a break (requests.js, first scoring of the job only)
    completed(job, meaningful) { if (job == null || recs.has(job)) return; if (meaningful) set(job, 'pending'); else { set(job, 'none'); counts.none++; } },
    // a rewarded video started while a result is on screen wins that result's break
    rewardedStarted() {
      const g = G(), s = g && g.getState();
      if (s && s.status === 'reveal') settle(s.jobId, 'rewarded');
    },
    // Continue: 'interstitial' once for a pending break, otherwise null; the outcome is recorded before any await
    route(job) {
      if (recs.get(job) !== 'pending') return null;
      if (HSC.recentReward && HSC.recentReward()) { settle(job, 'none'); return null; }
      settle(job, 'interstitial');
      return 'interstitial';
    },
    outcome: (job) => recs.get(job) || null,
    counts: () => Object.assign({}, counts),
  };
  // every rewarded video in the game goes through HSC.watchVideo (the wardrobe owns it and its earned callback);
  // the router only notes that one started, then hands over unchanged
  const wrap = () => {
    if (typeof HSC.watchVideo !== 'function') { if (typeof setTimeout === 'function') setTimeout(wrap, 300); return; }
    if (HSC.watchVideo.__routed) return;
    const wv = HSC.watchVideo;
    const routed = function () { try { router.rewardedStarted(); } catch (e) {} return wv.apply(this, arguments); };
    routed.__routed = true;
    HSC.watchVideo = routed;
  };
  wrap();
  HSC.adRouter = router;
})(globalThis.HSC || (globalThis.HSC = {}));
