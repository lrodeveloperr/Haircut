// ---------------------------------------------------------------------------------------------
// Detail level: "high" for capable devices, "low" for weaker phones (fewer and simpler hair strands,
// fewer falling clippings, 1x resolution, no MSAA, cheaper skin shading).
// Setting: "auto" (default: detected from the device, and dropped to low mid-game if frames stay slow
// even after the game's own adaptive quality), or forced "low" / "high". Saved via platform storage.
// For testing, ?detail=low or ?detail=high in the page URL forces a level.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const KEY = 'skin-fade-studio-detail-v1';
  const PROFILES = {
    high: { maxStrands: 30000, minStrands: 16000, segments: 8, beardSegments: 8, beardMax: 1, clipMax: 4000, clipRate: 1, pixelMax: 2, pixelMin: 1.1, antialias: true, shaderLow: false },
    low: { maxStrands: 14000, minStrands: 9000, segments: 5, beardSegments: 4, beardMax: 0.45, clipMax: 1200, clipRate: 0.5, pixelMax: 1, pixelMin: 0.85, antialias: false, shaderLow: true },
  };
  const D = (HSC.detail = Object.assign({ setting: 'auto', level: 'high', detected: null, why: [] }, PROFILES.high));
  D.pixelRatio = () => Math.max(D.pixelMin, Math.min(D.pixelMax, globalThis.devicePixelRatio || 1));

  function forcedByUrl() {
    try {
      const q = new URLSearchParams(globalThis.location.search).get('detail');
      return q === 'low' || q === 'high' ? q : null;
    } catch (e) { return null; }
  }
  function detect() {
    const why = [];
    const mem = globalThis.navigator && navigator.deviceMemory;
    if (mem && mem <= 3) why.push('memory ' + mem + 'GB');
    const cores = globalThis.navigator && navigator.hardwareConcurrency;
    if (cores && cores <= 4) why.push(cores + ' cores');
    let gpu = '';
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl');
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        gpu = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
        if (gl.getParameter(gl.MAX_TEXTURE_SIZE) < 4096) why.push('small textures');
        const lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      }
    } catch (e) {}
    if (/Mali-(4|T\d)|Mali-G(31|51|52|57|68)\b|Adreno \(TM\) (3\d\d|4\d\d|50\d|51\d|52\d|60\d|61\d)|PowerVR|SGX|Vivante|SwiftShader|llvmpipe/i.test(gpu)) why.push('gpu ' + gpu);
    return { level: why.length ? 'low' : 'high', why, gpu };
  }

  function apply(level) {
    Object.assign(D, PROFILES[level]);
    D.level = level;
    try { HSC.onDetailChange && HSC.onDetailChange(); } catch (e) { console.error('customers: detail change failed', e); }
  }
  const effective = () => forcedByUrl() || (D.setting === 'auto' ? D.detected : D.setting);

  // decided synchronously when the script loads, so the game is built at the right level
  const d = detect();
  D.detected = d.level;
  D.why = d.why;
  D.gpu = d.gpu;
  apply(effective());

  // the saved setting arrives before the renderer is created
  HSC.initDetail = async function (client) {
    D.client = client;
    try {
      const s = client && client.loadProgress ? await client.loadProgress(KEY, 'auto') : 'auto';
      if (s === 'auto' || s === 'low' || s === 'high') D.setting = s;
    } catch (e) {}
    if (effective() !== D.level) apply(effective());
  };
  HSC.setDetailSetting = function (s) {
    if (s !== 'auto' && s !== 'low' && s !== 'high') return;
    D.setting = s;
    try { D.client && D.client.saveProgress && D.client.saveProgress(KEY, s).catch(() => {}); } catch (e) {}
    if (effective() !== D.level) {
      apply(effective());
      HSC.detailBudget && HSC.detailBudget();
    }
  };

  // auto: if frames stay slow at the game's lowest adaptive quality, switch to low for good
  let slow = 0;
  HSC.detailWatch = function (frameMs, strands, pixel) {
    if (D.setting !== 'auto' || D.level === 'low' || forcedByUrl()) return;
    const atFloor = strands <= D.minStrands + 1 && pixel <= D.pixelMin + 0.06;
    slow = frameMs > 30 && atFloor ? slow + 1 : 0;
    if (slow >= 3) {
      slow = 0;
      D.detected = 'low';
      apply('low');
      HSC.detailBudget && HSC.detailBudget();
    }
  };
})(globalThis.HSC || (globalThis.HSC = {}));
