/* Loaded after Meta Instant Games SDK v8 and before engine code. */
(function () {
  'use strict';
  const loading = document.getElementById('fb-loading');
  globalThis.HSC = globalThis.HSC || {};
  HSC.startupTiming = {sdkReady: performance.now()};
  HSC.poster?.show(loading);
  HSC.dismissLoading = () => { if (loading?.isConnected) loading.remove(); };
  HSC.graphicsError = code => Object.assign(new Error('Game graphics could not initialize'), {code});
  HSC.bootCode = error => {
    if (typeof error?.code === 'string') return error.code;
    const message = String(error?.message || error);
    if (/SDK|Instant Games/i.test(message)) return 'SDK';
    if (/WebGL|graphics/i.test(message)) return 'GFX_CONTEXT';
    if (/Saved progress|Progress|cloud save/i.test(message)) return 'SAVE';
    return 'BOOT';
  };
  HSC.bootMessage = error => {
    const code = HSC.bootCode(error);
    if (code === 'SAVE_TOO_NEW') return 'Your progress is safe. Refresh to try the latest game version.';
    if (code.startsWith('GFX_')) return 'Your saved progress has been kept. The graphics could not initialize. Please retry.';
    if (code === 'SDK') return 'Your saved progress has been kept. The Meta platform service could not load. Please retry.';
    if (code === 'SAVE') return 'Your saved progress has been kept. Progress could not be read. Please retry.';
    return 'Your saved progress has been kept. Please retry.';
  };
  HSC.bootErrorCode = error => {
    const box = document.createElement('div'); box.className = 'boot-error-info';
    const code = document.createElement('p'); code.className = 'boot-error-code';
    code.textContent = 'Code: ' + HSC.bootCode(error); box.append(code);
    const timing = HSC.startupTiming || {};
    const stages = ['sdkReady', 'requestsStarted', 'localeLoaded', 'savesLoaded', 'engineStart', 'geometryReady', 'rendererReady', 'materialsReady', 'shadersReady', 'firstDraw', 'gpuReady', 'firstPlayable', 'gameReady'];
    const reached = stages.filter(key => Number.isFinite(timing[key]));
    const lines = Array.isArray(error?.detail) ? error.detail.slice() : [];
    lines.push('Diagnostic: meta-v8');
    if (reached.length) lines.push('Stage: ' + reached[reached.length - 1]);
    if (globalThis.FBInstant?.getSDKVersion) lines.push('SDK: ' + FBInstant.getSDKVersion());
    if (HSC.geoBuild) lines.push('Build: ' + HSC.geoBuild);
    if (lines.length) { const detail = document.createElement('pre'); detail.className = 'boot-error-detail'; detail.textContent = lines.join('\n'); box.append(detail); }
    return box;
  };
  HSC.bootstrapError = error => {
    HSC.dismissLoading(); console.error(error); document.documentElement.dataset.bootError = 'true';
    const panel = document.createElement('section'); panel.className = 'boot-error'; panel.setAttribute('role', 'alert');
    const title = document.createElement('h1'); title.textContent = 'The game could not load';
    const message = document.createElement('p'); message.textContent = HSC.bootMessage(error);
    const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = 'Retry';
    retry.onclick = () => { retry.disabled = true; location.reload(); };
    panel.append(title, message, retry, HSC.bootErrorCode(error)); document.body.appendChild(panel); retry.focus();
    HSC.facebookClientPromise?.then(client => client.destroy()).catch(() => {});
  };
})();
