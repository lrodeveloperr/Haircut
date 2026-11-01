// Inserted inside the Android game instance; other publishing targets retain their own cadence.
// Set busy synchronously, before publishing the completed reveal. Every route to Next/replay
// checks that same flag, so a queued tap or keyboard event cannot start another customer early.
async function androidCompletionInterstitial() {
  if (C || T || s.status !== 'reveal') return;
  T = true;
  const customer = s.jobId;
  Z();
  try {
    await $(!0).catch(() => {});
    if (C) return;
    const opened = await t.showInterstitial('customer-completed');
    t.sendAnalytics('interstitial_outcome', {opened, completedCustomer: customer});
  } catch (_) {
    // No fill, no consent, offline and SDK failures release the reveal normally.
  } finally {
    l = ga();
    T = false;
    if (!C) {
      Z();
      await $(!0).catch(() => {});
    }
  }
}
