// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the completed-customer result router (docs/MONETIZATION-STRATEGY.md
// sections 4 and 6; implementation plan 3.2; locked by the owner; AGENTS.md: replaces the reveal-time
// interstitial only once implemented and tested).
//
// One full-screen commercial outcome per completed customer, decided at the result break:
//   rewarded       a rewarded video asked for on that result came on screen (watched to the end or closed early):
//                  that wins the break and the interstitial is suppressed. One that never showed (no fill, no
//                  consent, offline) leaves the break to the interstitial
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
  const onResult = () => { const g = G(), s = g && g.getState(); return s && s.status === 'reveal' ? s.jobId : null; };
  let asked = null; // the result on screen when the rewarded video in flight was asked for, until it ends
  const router = {
    // a newly completed customer with meaningful work opens a break (requests.js, first scoring of the job only)
    completed(job, meaningful) { if (job == null || recs.has(job)) return; if (meaningful) set(job, 'pending'); else { set(job, 'none'); counts.none++; } },
    // a rewarded video came on screen (or paid out) while a result was showing: it wins that result's break
    rewardedStarted() {
      const job = asked != null ? asked : onResult();
      if (job != null) settle(job, 'rewarded');
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
  // the router notes which result it was asked on and hands over unchanged: the break is the rewarded one only
  // once Android says the video opened, or it paid out (an earned reward means it showed)
  const wrap = () => {
    if (typeof HSC.watchVideo !== 'function') { if (typeof setTimeout === 'function') setTimeout(wrap, 300); return; }
    if (HSC.watchVideo.__routed) return;
    const wv = HSC.watchVideo;
    const routed = function () {
      const job = onResult();
      asked = job;
      const done = () => { if (asked === job) asked = null; };
      let p;
      try { p = wv.apply(this, arguments); } catch (e) { done(); throw e; }
      return Promise.resolve(p).then((ok) => { try { if (ok) router.rewardedStarted(); } catch (e) {} done(); return ok; }, (e) => { done(); throw e; });
    };
    routed.__routed = true;
    HSC.watchVideo = routed;
  };
  wrap();
  // Android's ad events (native-transport.js): 'opened' is the moment a rewarded video is really on screen
  const host = globalThis.__androidHost;
  if (host && typeof host.ad === 'function' && !host.ad.__routed) {
    const ad = host.ad;
    const seen = function (kind, state) { try { if (kind === 'rewarded' && state === 'opened' && asked != null) router.rewardedStarted(); } catch (e) {} return ad.apply(this, arguments); };
    seen.__routed = true;
    host.ad = seen;
  }
  HSC.adRouter = router;
})(globalThis.HSC || (globalThis.HSC = {}));
