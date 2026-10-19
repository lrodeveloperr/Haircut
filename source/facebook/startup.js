/* Start Meta initialization and cloud-save loading before procedural geometry. */
(function (HSC) {
  'use strict';
  HSC.startupTiming.requestsStarted = performance.now();
  HSC.facebookClientPromise = HSC.createFacebookClient({preload: true});
  HSC.facebookClientPromise.catch(() => {});
})(globalThis.HSC);
