/* Start host I/O before evaluating procedural geometry. Loaded after the official SDK/client. */
(function (HSC) {
  'use strict';
  HSC.startupTiming.requestsStarted = performance.now();
  HSC.youtubeClientPromise = HSC.createYouTubeClient({preload: true});
  // The normal boot recovery screen consumes failures after the engine module is available.
  HSC.youtubeClientPromise.catch(() => {});
})(globalThis.HSC);
