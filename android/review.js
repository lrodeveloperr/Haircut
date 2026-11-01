// Android-only bridge from the game's completed reveal to Google Play's native review policy.
// It observes state without changing gameplay, controls, timing, saves or advertising decisions.
(function () {
  'use strict';
  const host = globalThis.AndroidHost;
  if (!host || typeof host.reviewMoment !== 'function') return;

  let initialized = false, lastStatus = '', pendingCompletion = 0, startupTimer = 0;
  const inspect = () => {
    const game = globalThis.skinFadeStudio;
    if (!game) return;
    const state = game.getState(), view = game.getView();
    if (!state || !view) return;
    if (!initialized) {
      initialized = true;
      lastStatus = state.status;
      // A completion can occur immediately after startup, before this observer's first 250 ms probe.
      // A restored reveal starts already complete; a newly finished haircut is still spinning.
      if (state.status === 'reveal' && !view.revealComplete)
        pendingCompletion = Number.isSafeInteger(state.completed) ? state.completed : 0;
      clearInterval(startupTimer);
      return;
    }
    if (state.status === 'cutting') {
      lastStatus = 'cutting';
      pendingCompletion = 0;
      return;
    }
    if (state.status === 'reveal' && lastStatus === 'cutting') {
      lastStatus = 'reveal';
      pendingCompletion = Number.isSafeInteger(state.completed) ? state.completed : 0;
    }
    const next = document.querySelector('.training-continue:not([disabled])');
    if (state.status !== 'reveal' || !view.revealComplete || !next || pendingCompletion !== state.completed) return;
    const cadence = state.adCadence || {};
    const completed = pendingCompletion;
    pendingCompletion = 0; // exactly one native eligibility check per newly completed customer
    host.reviewMoment(
      completed,
      Number.isSafeInteger(cadence.qualified) ? cadence.qualified : 0,
      Number.isFinite(cadence.activeMs) ? Math.max(0, Math.floor(cadence.activeMs)) : 0,
    );
  };

  const observer = new MutationObserver(inspect);
  observer.observe(document.documentElement, {subtree: true, childList: true, attributes: true});
  startupTimer = setInterval(inspect, 250);
  globalThis.addEventListener('pagehide', () => {
    clearInterval(startupTimer);
    observer.disconnect();
  }, {once: true});
})();
