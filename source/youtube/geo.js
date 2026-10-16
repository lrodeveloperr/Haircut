/* Build the original deterministic models directly: no optional storage or lighting download. */
(function (HSC) {
  'use strict';
  if (HSC.startupTiming) HSC.startupTiming.modelCache = 'disabled';
  HSC.geo = {
    ready: Promise.resolve(),
    environmentReady: Promise.resolve().then(() => {
      if (HSC.startupTiming) {
        HSC.startupTiming.environment = 'generated';
        HSC.startupTiming.environmentSource = 'generated';
        HSC.startupTiming.environmentReady = performance.now();
      }
    }),
    environment: null,
    use(_key, compute) { return compute(); },
    saveLater() {},
  };
})(globalThis.HSC || (globalThis.HSC = {}));
