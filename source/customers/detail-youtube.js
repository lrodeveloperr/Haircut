/* Graphics are the playable: full hair geometry, skin shaders, beard density, MSAA and native
 * resolution on every device, for the whole session. Nothing is ever lowered, at startup or in
 * play. Frame times are measured for diagnostics only. */
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
  // The floor equals the full ratio, so a resize always draws at full resolution.
  D.pixelFloor = (width, height) => D.pixelRatio(width, height);
  let elapsed = 0, frames = 0;
  D.resetHistory = () => { elapsed = frames = 0; };
  // Records the average frame time (HSC.detail.lastFrameMs); never returns a change.
  D.sample = frameMs => {
    if (!Number.isFinite(frameMs) || frameMs <= 0) { D.resetHistory(); return null; }
    elapsed += Math.min(frameMs, 250);
    frames++;
    if (elapsed >= 1000) { D.lastFrameMs = elapsed / frames; elapsed = frames = 0; }
    return null;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
