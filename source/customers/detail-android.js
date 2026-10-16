// Android: one full-detail profile, at the display's native pixel ratio throughout play.
// Old saved Auto/Low settings, hardware guesses and URL overrides cannot lower quality.
(function (HSC) {
  'use strict';
  const D = HSC.detail = {
    setting: 'fixed', level: 'high',
    maxStrands: 30000, minStrands: 30000, segments: 8, beardSegments: 8, beardMax: 1,
    clipMax: 4000, clipRate: 1, antialias: true, shaderLow: false,
  };
  D.pixelRatio = () => {
    const ratio = Number(globalThis.devicePixelRatio);
    return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  };
  let elapsed = 0, frames = 0;
  D.resetHistory = () => { elapsed = frames = 0; };
  // Diagnostics only. Slow frames never change geometry, shading or resolution.
  D.sample = frameMs => {
    if (!Number.isFinite(frameMs) || frameMs <= 0) { D.resetHistory(); return; }
    elapsed += Math.min(frameMs, 250);
    frames++;
    if (elapsed >= 1000) { D.lastFrameMs = elapsed / frames; D.resetHistory(); }
  };
})(globalThis.HSC || (globalThis.HSC = {}));
