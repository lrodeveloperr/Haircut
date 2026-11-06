// ---------------------------------------------------------------------------------------------
// Adaptive graphics with a protected visual floor.
//
// The logical haircut, tool contact, scoring, customer state and saves never depend on this file. It changes
// only drawing cost. Weak devices retain a dense 12k-strand floor (strand width expands to preserve coverage),
// while proven capable devices receive the original 30k / 8-segment / 2x full-quality presentation.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';

  const VERSION = 3;
  const RECORD_KEY = 'hsc-graphics-profile-v3';
  const BOOT_KEY = 'hsc-graphics-boot-v3';
  const ORDER = Object.freeze(['potato', 'balanced', 'high', 'ultra']);
  const PROFILES = Object.freeze({
    potato: Object.freeze({
      maxStrands: 14000, minStrands: 12000, segments: 5, beardSegments: 5, beardMax: 0.65,
      clipMax: 900, clipRate: 0.45, pixelMax: 1, pixelMin: 0.9, maxPixels: 1500000,
      antialias: false, shaderLow: true, fpsCap: 30,
    }),
    balanced: Object.freeze({
      maxStrands: 20000, minStrands: 16000, segments: 6, beardSegments: 6, beardMax: 0.8,
      clipMax: 1800, clipRate: 0.65, pixelMax: 1.25, pixelMin: 1, maxPixels: 2250000,
      antialias: false, shaderLow: false, fpsCap: 60,
    }),
    high: Object.freeze({
      maxStrands: 26000, minStrands: 20000, segments: 7, beardSegments: 7, beardMax: 0.9,
      clipMax: 2800, clipRate: 0.82, pixelMax: 1.5, pixelMin: 1.1, maxPixels: 3200000,
      antialias: true, shaderLow: false, fpsCap: 60,
    }),
    ultra: Object.freeze({
      maxStrands: 30000, minStrands: 24000, segments: 8, beardSegments: 8, beardMax: 1,
      clipMax: 4000, clipRate: 1, pixelMax: 2, pixelMin: 1.25, maxPixels: 4000000,
      antialias: true, shaderLow: false, fpsCap: 60,
    }),
  });

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const dimension = (n) => Math.max(1, Number(n) || 1);
  const validLevel = (value) => ORDER.includes(value);
  const safeParse = (value) => { try { return JSON.parse(value); } catch (_) { return null; } };
  const storage = {
    get(key) { try { return globalThis.localStorage && localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { if (globalThis.localStorage) localStorage.setItem(key, value); } catch (_) {} },
    remove(key) { try { if (globalThis.localStorage) localStorage.removeItem(key); } catch (_) {} },
  };

  function queryLevel() {
    try {
      const value = new URLSearchParams(globalThis.location && location.search || '').get('graphics');
      return validLevel(value) ? value : null;
    } catch (_) { return null; }
  }

  function probe() {
    const nav = globalThis.navigator || {};
    const memory = Number(nav.deviceMemory) || 0;
    const cores = Number(nav.hardwareConcurrency) || 0;
    let gpu = '', maxTexture = 0, maxRenderbuffer = 0, software = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2', { powerPreference: 'high-performance' }) ||
        canvas.getContext('webgl', { powerPreference: 'high-performance' });
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        gpu = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || '');
        maxTexture = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0;
        maxRenderbuffer = Number(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)) || 0;
        const lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      }
    } catch (_) {}

    software = /swiftshader|llvmpipe|software|mesa offscreen/i.test(gpu);
    const weakGpu = /mali-(4|t\d)|mali-g(31|51|52|57|68)\b|adreno(?: \(tm\))? (3\d\d|4\d\d|50\d|51\d|52\d|60\d|61\d)|powervr|sgx|vivante/i.test(gpu);
    const strongGpu = /adreno(?: \(tm\))? (7[3-9]\d|8\d\d)|mali-g7[1-9]|immortalis|apple (?:gpu|m\d)|rtx|radeon rx|intel arc/i.test(gpu);
    const nativePixels = dimension(globalThis.innerWidth) * dimension(globalThis.innerHeight) *
      Math.pow(clamp(Number(globalThis.devicePixelRatio) || 1, 1, 4), 2);

    let score = 0;
    const why = [];
    if (memory) {
      if (memory <= 2) { score -= 4; why.push('memory<=2'); }
      else if (memory <= 3) { score -= 2; why.push('memory<=3'); }
      else if (memory >= 8) { score += 3; why.push('memory>=8'); }
      else if (memory >= 6) { score += 2; why.push('memory>=6'); }
      else if (memory >= 4) score += 1;
    }
    if (cores) {
      if (cores <= 2) { score -= 3; why.push('cores<=2'); }
      else if (cores <= 4) { score -= 2; why.push('cores<=4'); }
      else if (cores >= 8) { score += 2; why.push('cores>=8'); }
      else if (cores >= 6) score += 1;
    }
    if (software) { score -= 8; why.push('software-gpu'); }
    else if (weakGpu) { score -= 3; why.push('entry-gpu'); }
    else if (strongGpu) { score += 3; why.push('strong-gpu'); }
    if (maxTexture && maxTexture < 4096) { score -= 4; why.push('texture<4096'); }
    else if (maxTexture >= 16384 && maxRenderbuffer >= 8192) score += 1;
    if (nativePixels > 8000000) { score -= 1; why.push('large-native-buffer'); }

    // Six points intentionally lets a current flagship GPU + 8-core CPU + full WebGL limits
    // receive Ultra even when an embedded WebView omits navigator.deviceMemory.
    const level = score >= 6 ? 'ultra' : score >= 2 ? 'high' : score >= 0 ? 'balanced' : 'potato';
    const fingerprint = [memory || '?', cores || '?', maxTexture || '?', maxRenderbuffer || '?', gpu || '?'].join('|');
    return { level, score, why, memory, cores, gpu, maxTexture, maxRenderbuffer, nativePixels, fingerprint };
  }

  const detected = probe();
  const forced = queryLevel();
  const saved = safeParse(storage.get(RECORD_KEY));
  const unfinishedBoot = safeParse(storage.get(BOOT_KEY));
  let initial = forced || detected.level;
  if (!forced && saved && saved.v === VERSION && saved.fingerprint === detected.fingerprint && validLevel(saved.level)) {
    initial = saved.level;
  }
  let crashCount = saved && saved.v === VERSION && Number.isSafeInteger(saved.crashCount) ? saved.crashCount : 0;
  if (!forced && unfinishedBoot && unfinishedBoot.v === VERSION && Date.now() - Number(unfinishedBoot.time) < 12 * 60 * 60 * 1000) {
    initial = ORDER[Math.max(0, ORDER.indexOf(initial) - 1)];
    crashCount = Math.min(9, crashCount + 1);
  }

  const D = HSC.detail = {
    setting: forced ? 'qa-forced' : 'auto', level: initial, detected: detected.level,
    why: detected.why.slice(), gpu: detected.gpu, probe: detected, pendingLevel: null,
    lastFrameMs: 0, lastP95FrameMs: 0, crashCount, effectScale: 1,
    profiles: PROFILES,
  };
  let baseClipMax = 0, baseClipRate = 0;
  let rendererAntialias = null;
  let samples = [], sampleMs = 0, cappedSampleMs = 0, stableWindows = 0, slowWindows = 0, lastRender = 0;

  function saveRecord(stable) {
    // QA profile overrides must never become a real player's remembered device profile.
    if (forced) return;
    storage.set(RECORD_KEY, JSON.stringify({
      v: VERSION, fingerprint: detected.fingerprint, level: D.level,
      crashCount: stable ? 0 : D.crashCount, stableAt: stable ? Date.now() : Number(saved && saved.stableAt) || 0,
    }));
  }

  function applyEffects(scale) {
    D.effectScale = clamp(scale, 0.35, 1);
    D.clipMax = Math.max(240, Math.round(baseClipMax * D.effectScale));
    D.clipRate = Math.max(0.2, baseClipRate * D.effectScale);
    try { HSC.clipCap && HSC.clipCap(); } catch (_) {}
  }

  function applyProfile(level, notify) {
    if (!validLevel(level)) return false;
    const profile = PROFILES[level];
    Object.assign(D, profile);
    // WebGL context attributes are fixed when the renderer is created. Report the real context
    // capability after a runtime tier change rather than pretending MSAA can be toggled in place.
    if (rendererAntialias === null) rendererAntialias = profile.antialias;
    D.requestedAntialias = profile.antialias;
    D.antialias = rendererAntialias;
    D.level = level;
    baseClipMax = profile.clipMax;
    baseClipRate = profile.clipRate;
    applyEffects(1);
    samples = []; sampleMs = 0; cappedSampleMs = 0; stableWindows = 0; slowWindows = 0; lastRender = 0;
    if (notify) {
      try { HSC.onDetailChange && HSC.onDetailChange(); } catch (error) { console.error('graphics profile change failed', error); }
      try { HSC.detailBudget && HSC.detailBudget(); } catch (error) { console.error('graphics budget change failed', error); }
    }
    saveRecord(false);
    return true;
  }

  applyProfile(initial, false);
  if (!forced) storage.set(BOOT_KEY, JSON.stringify({ v: VERSION, time: Date.now(), level: initial }));

  function markStable() {
    if (forced) return;
    D.crashCount = 0;
    storage.remove(BOOT_KEY);
    saveRecord(true);
  }
  const stableTimer = globalThis.setTimeout ? setTimeout(markStable, 30000) : 0;
  if (globalThis.addEventListener) addEventListener('pagehide', () => {
    if (stableTimer) clearTimeout(stableTimer);
    if (forced) return;
    storage.remove(BOOT_KEY);
    saveRecord(true);
  }, { once: true });

  D.pixelRatio = function (width = globalThis.innerWidth, height = globalThis.innerHeight) {
    const native = clamp(Number(globalThis.devicePixelRatio) || 1, 0.75, D.pixelMax);
    // The pixel-count ceiling is absolute: an external 4K/ultrawide display must not turn a
    // weak phone's protected quality floor into a multi-million-pixel allocation spike.
    const cap = Math.sqrt(D.maxPixels / (dimension(width) * dimension(height)));
    return Math.min(native, cap);
  };
  D.pixelFloor = function (width = globalThis.innerWidth, height = globalThis.innerHeight) {
    return Math.min(D.pixelRatio(width, height), D.pixelMin);
  };
  D.resetHistory = function () {
    samples = []; sampleMs = 0; cappedSampleMs = 0; stableWindows = 0; slowWindows = 0; D.lastFrameMs = 0; D.lastP95FrameMs = 0;
  };

  function queueLevel(level, reason) {
    if (forced || !validLevel(level) || level === D.level) return false;
    D.pendingLevel = level;
    D.pendingReason = reason || 'runtime';
    return true;
  }
  D.queueLower = function (reason) {
    if (D.pendingLevel) return false;
    const index = ORDER.indexOf(D.level);
    return index > 0 && queueLevel(ORDER[index - 1], reason || 'slow');
  };
  D.queueHigher = function (reason) {
    if (D.pendingLevel) return false;
    const index = ORDER.indexOf(D.level);
    return index >= 0 && index < ORDER.length - 1 && queueLevel(ORDER[index + 1], reason || 'stable');
  };
  D.commitPending = function (force) {
    if (!D.pendingLevel) return false;
    // Geometry/profile swaps occur only at an explicit customer boundary or after a lost
    // graphics context. Rebuilding shaders during cutting or the reveal animation is unsafe.
    if (!force) return false;
    const next = D.pendingLevel;
    D.pendingLevel = null;
    return applyProfile(next, true);
  };
  D.noteContextLoss = function (phase) {
    D.crashCount = Math.min(9, D.crashCount + 1);
    storage.set(BOOT_KEY, JSON.stringify({ v: VERSION, time: Date.now(), level: D.level, phase: phase || 'runtime' }));
    saveRecord(false);
    D.queueLower('context-loss');
    return D.pendingLevel;
  };

  D.shouldRender = function (now, active) {
    if (!active || D.fpsCap >= 55) { lastRender = now; return true; }
    const interval = 1000 / D.fpsCap;
    if (!lastRender || now - lastRender >= interval - 1) { lastRender = now; return true; }
    return false;
  };

  D.sample = function (frameMs, strands, pixel, ceiling) {
    if (!Number.isFinite(frameMs) || frameMs <= 0 || frameMs > 1000) { D.resetHistory(); return null; }
    if (globalThis.document && document.hidden) { D.resetHistory(); return null; }
    // The controller and touch model continue at the display refresh rate even when a low-end
    // profile draws at 30 fps. Combine controller ticks so the benchmark measures each rendered
    // interval instead of incorrectly treating skipped draws as spare GPU capacity.
    if (D.fpsCap < 55) {
      cappedSampleMs += frameMs;
      if (cappedSampleMs < 1000 / D.fpsCap - 2) return null;
      frameMs = cappedSampleMs;
      cappedSampleMs = 0;
    }
    const value = clamp(frameMs, 4, 250);
    samples.push(value); sampleMs += value;
    if (samples.length > 240) samples.shift();
    if (sampleMs < 2000 || samples.length < 20) return null;

    const sorted = samples.slice().sort((a, b) => a - b);
    const average = samples.reduce((sum, n) => sum + n, 0) / samples.length;
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
    const longRatio = samples.filter((n) => n > 50).length / samples.length;
    D.lastFrameMs = average;
    D.lastP95FrameMs = p95;
    samples = []; sampleMs = 0;

    const downAt = D.level === 'potato' ? 48 : D.level === 'balanced' ? 30 : 24;
    const upAt = D.level === 'potato' ? 36 : D.level === 'balanced' ? 20 : 17.5;
    let nextStrands = clamp(Number(strands) || D.maxStrands, D.minStrands, D.maxStrands);
    let nextPixel = clamp(Number(pixel) || D.pixelRatio(), D.pixelFloor(), Number(ceiling) || D.pixelRatio());
    let changed = false;

    if (p95 > downAt || longRatio > 0.12) {
      slowWindows++;
      stableWindows = 0;
      if (D.effectScale > 0.36) {
        applyEffects(D.effectScale - 0.2);
      } else if (nextPixel > D.pixelFloor() + 0.04) {
        nextPixel = Math.max(D.pixelFloor(), nextPixel - 0.1); changed = true;
      } else if (nextStrands > D.minStrands) {
        nextStrands = Math.max(D.minStrands, nextStrands - 2000); changed = true;
      } else if (slowWindows >= 2) {
        D.queueLower('sustained-slow');
      }
    } else if (p95 < upAt && longRatio < 0.02) {
      stableWindows++;
      slowWindows = 0;
      if (stableWindows >= 2) {
        if (nextStrands < D.maxStrands) {
          nextStrands = Math.min(D.maxStrands, nextStrands + 2000); changed = true;
        } else if (nextPixel < (Number(ceiling) || D.pixelRatio()) - 0.04) {
          nextPixel = Math.min(Number(ceiling) || D.pixelRatio(), nextPixel + 0.1); changed = true;
        } else if (D.effectScale < 0.99) {
          applyEffects(D.effectScale + 0.2);
        } else if (stableWindows >= 6) {
          D.queueHigher('sustained-stable');
        }
      }
    } else {
      slowWindows = 0;
      stableWindows = Math.max(0, stableWindows - 1);
    }

    D.commitPending(false);
    return changed ? { strands: Math.round(nextStrands), pixel: nextPixel } : null;
  };

  // The saved choice is device-local. It intentionally does not enter cloud/career progress.
  HSC.initDetail = async function () { return D.level; };
  HSC.graphicsDiagnostics = () => ({
    level: D.level, detected: D.detected, pending: D.pendingLevel, why: D.why.slice(),
    strands: [D.minStrands, D.maxStrands], segments: D.segments, beardSegments: D.beardSegments,
    pixel: [D.pixelFloor(), D.pixelRatio()], antialias: D.antialias, requestedAntialias: D.requestedAntialias, effectScale: D.effectScale,
    averageFrameMs: D.lastFrameMs, p95FrameMs: D.lastP95FrameMs, crashCount: D.crashCount,
  });
})(globalThis.HSC || (globalThis.HSC = {}));
