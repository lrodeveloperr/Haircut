// Inserted inside the Android game instance; other publishing targets retain their own cadence.
// The completed-customer result router (MONETIZATION-STRATEGY sections 4 and 6; plan 3.2): the reveal no longer
// shows an ad. The ordinary Continue (Next) asks HSC.adRouter once per completed customer: when that result's
// rewarded route was neither accepted nor attempted, one interstitial is attempted before the next customer.
// Busy is set synchronously before any await, so queued taps cannot advance or request a second ad.
function androidRevealDone() {
  x = !0;
  Z();
}
async function androidResultBreak() {
  const R = HSC.adRouter, customer = s.jobId;
  if (!R || R.route(customer) !== 'interstitial') return;
  T = true;
  Z();
  try {
    await $(!0).catch(() => {});
    if (C) return;
    const opened = await t.showInterstitial('customer-completed');
    t.sendAnalytics('interstitial_outcome', {opened, completedCustomer: customer});
  } catch (_) {
    // No fill, no consent, offline and SDK failures release Continue normally.
  } finally {
    l = ga();
    T = false;
    if (!C) Z();
  }
}
