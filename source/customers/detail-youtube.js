/* Graphics are the playable: retain full hair geometry, skin shaders and beard density.
 * Start at high quality on every device. Adapt from sustained rendering measurements only;
 * core count, memory hints and GPU names do not predict this scene's visual budget. */
(function (HSC) {
  'use strict';
  const D = HSC.detail = {
    setting: 'adaptive', level: 'high',
    maxStrands: 30000, minStrands: 24000, segments: 8, beardSegments: 8, beardMax: 1,
    clipMax: 4000, clipRate: 1, pixelMax: 2, pixelMin: 1.5,
    maxPixels: 4000000, antialias: true, shaderLow: false,
  };
  const dimension = value => Math.max(1, Number(value) || 1);
  D.pixelRatio = (width = globalThis.innerWidth, height = globalThis.innerHeight) => {
    const native = Math.max(1, Math.min(D.pixelMax, Number(globalThis.devicePixelRatio) || 1));
    return Math.min(native, Math.sqrt(D.maxPixels / (dimension(width) * dimension(height))));
  };
  // Respect native resolution and the pixel cap even when they are below the adaptive floor.
  D.pixelFloor = (width, height) => Math.min(D.pixelMin, D.pixelRatio(width, height));
  let warmup = 0, elapsed = 0, frames = 0, slow = 0, fast = 0;
  D.resetHistory = () => { warmup = elapsed = frames = slow = fast = 0; };
  D.sample = (frameMs, strands, pixel, target) => {
    if (!Number.isFinite(frameMs) || frameMs <= 0) {
      D.resetHistory();
      return null;
    }
    // One compilation stall must not dominate the average; sustained very slow frames must
    // still reach the adaptation windows. Host pause/resume resets history explicitly.
    frameMs = Math.min(frameMs, 250);
    if (warmup < 1500) { warmup += frameMs; return null; }
    elapsed += frameMs;
    frames++;
    if (elapsed < 1000) return null;
    const average = elapsed / frames;
    D.lastFrameMs = average;
    elapsed = frames = 0;
    slow = average > 38 ? slow + 1 : 0;
    fast = average < 26 ? fast + 1 : 0;
    const floor = Math.min(D.pixelMin, target);
    let nextStrands = strands, nextPixel = pixel;
    if (slow >= 2) {
      // Preserve hair first. Lower resolution before touching scalp strand count.
      if (pixel > floor + 0.01) nextPixel = Math.max(floor, pixel - 0.25);
      else nextStrands = Math.max(D.minStrands, strands - 2000);
      slow = fast = 0;
    } else if (fast >= 3) {
      if (strands < D.maxStrands) nextStrands = Math.min(D.maxStrands, strands + 2000);
      else nextPixel = Math.min(target, pixel + 0.25);
      slow = fast = 0;
    }
    return nextStrands !== strands || nextPixel !== pixel ? {strands: nextStrands, pixel: nextPixel} : null;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
