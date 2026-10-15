// ---------------------------------------------------------------------------------------------
// Detail for the YouTube Playables build: one light level for every device, so the game runs the
// same on cheap phones, desktops and everything in between. 1x resolution, no MSAA, 14k scalp
// strands (the game may drop to 9k on slow frames), 45% beard density, simpler strand geometry and
// skin shading, at most 1200 falling clippings.
// The full-detail build (auto / low / high, used for the Android app) uses detail.js instead.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const D = (HSC.detail = {
    setting: 'fixed', level: 'low', why: [],
    maxStrands: 14000, minStrands: 9000, segments: 5, beardSegments: 4, beardMax: 0.45,
    clipMax: 1200, clipRate: 0.5, pixelMax: 1, pixelMin: 0.85, antialias: false, shaderLow: true,
  });
  D.pixelRatio = () => Math.max(D.pixelMin, Math.min(D.pixelMax, globalThis.devicePixelRatio || 1));
})(globalThis.HSC || (globalThis.HSC = {}));
