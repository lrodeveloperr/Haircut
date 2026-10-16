// Android: the same fixed High rendering budget as the smooth Sites/YouTube build.
// Old saved Auto/Low settings, hardware guesses and URL overrides cannot lower quality.
(function (HSC) {
  'use strict';
  const D = HSC.detail = {
    setting: 'fixed', level: 'high',
    maxStrands: 30000, minStrands: 30000, segments: 8, beardSegments: 8, beardMax: 1,
    clipMax: 4000, clipRate: 1, pixelMax: 2, pixelMin: 2,
    maxPixels: 4000000, antialias: true, shaderLow: false,
  };
  const dimension = value => Math.max(1, Number(value) || 1);
  D.pixelRatio = (width = globalThis.innerWidth, height = globalThis.innerHeight) => {
    const native = Math.max(1, Math.min(D.pixelMax, Number(globalThis.devicePixelRatio) || 1));
    return Math.min(native, Math.sqrt(D.maxPixels / (dimension(width) * dimension(height))));
  };
  D.pixelFloor = (width, height) => D.pixelRatio(width, height);
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
