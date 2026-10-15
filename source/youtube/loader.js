/* Loaded immediately after the official SDK and before any engine code. */
(function () {
  'use strict';
  const loading = document.getElementById('yt-loading');
  try {
    if (globalThis.ytgame?.game) globalThis.ytgame.game.firstFrameReady();
  } catch (_) { /* The regular startup recovery screen handles SDK failures. */ }
  globalThis.HSC = globalThis.HSC || {};
  HSC.startupTiming = {sdkReady: performance.now()};
  HSC.poster?.show(loading);
  // Remove the loading UI before reporting readiness. Renaming its id would leave an
  // unstyled status node behind and invalidate the selectors used for its fade.
  HSC.dismissLoading = () => {
    if (loading?.isConnected) loading.remove();
  };
  HSC.graphicsError = code => Object.assign(new Error('Game graphics could not initialize'), {code});
  // A short code on the recovery screen identifies the failure on a phone without a console.
  HSC.bootCode = error => {
    if (typeof error?.code === 'string') return error.code;
    const message = String(error?.message || error);
    if (/SDK/.test(message)) return 'SDK';
    if (/WebGL|graphics/i.test(message)) return 'GFX_CONTEXT';
    if (/Saved progress|Progress/.test(message)) return 'SAVE';
    return 'BOOT';
  };
  HSC.bootMessage = error => {
    const code = HSC.bootCode(error);
    if (code === 'SAVE_TOO_NEW') return 'Your progress is safe. Refresh to try the latest game version.';
    if (code.startsWith('GFX_')) return 'Your saved progress has been kept. The graphics could not initialize. Please retry.';
    if (code === 'SDK') return 'Your saved progress has been kept. The YouTube platform service could not load. Please retry.';
    if (code === 'SAVE') return 'Your saved progress has been kept. Progress could not be read. Please retry.';
    return 'Your saved progress has been kept. Please retry.';
  };
  HSC.bootErrorCode = error => {
    const box = document.createElement('div');
    box.className = 'boot-error-info';
    const code = document.createElement('p');
    code.className = 'boot-error-code';
    code.textContent = 'Code: ' + HSC.bootCode(error);
    box.append(code);
    const lines = Array.isArray(error?.detail) ? error.detail.slice() : [];
    // Temporary device diagnostic: expose the actual exception, never save contents or URLs.
    const timing = HSC.startupTiming || {};
    const stages = ['sdkReady', 'requestsStarted', 'localeLoaded', 'savesLoaded', 'engineStart',
      'geometryReady', 'rendererReady', 'materialsReady', 'shadersReady', 'firstDraw', 'gpuReady', 'firstPlayable', 'gameReady'];
    const reached = stages.filter(key => Number.isFinite(timing[key]));
    const safeText = value => String(value ?? '')
      .replace(/(?:https?:\/\/|blob:|data:)[^\s"'<>]+/g, '[resource]')
      .replace(/[\r\n\t]+/g, ' ').slice(0, 200);
    lines.push('Diagnostic: sdk-v3.100-d1');
    if (reached.length) lines.push('Stage: ' + reached[reached.length - 1]);
    lines.push('Error: ' + safeText(error?.name || 'Error') + ': ' + safeText(error?.message || error));
    const frame = String(error?.stack || '').match(/\/(runtime\/[A-Za-z0-9._-]+\.js)(?:\?[^\s)]*?)?:(\d+):(\d+)/);
    if (frame) lines.push('At: ' + frame[1] + ':' + frame[2] + ':' + frame[3]);
    if (globalThis.ytgame?.SDK_VERSION) lines.push('SDK: ' + safeText(globalThis.ytgame.SDK_VERSION));
    if (HSC.geoBuild) lines.push('Build: ' + HSC.geoBuild);
    if (HSC.isLocalPreview || globalThis.ytgame) lines.push('Mode: ' + (globalThis.ytgame?.IN_PLAYABLES_ENV === true ? 'YouTube' : 'preview'));
    const cuts = HSC.meta?.data?.cuts;
    if (Number.isFinite(cuts)) lines.push('Saved haircuts: ' + cuts);
    if (lines.length) {
      const detail = document.createElement('pre');
      detail.className = 'boot-error-detail';
      detail.textContent = lines.join('\n');
      box.append(detail);
    }
    return box;
  };
  // Covers a module-evaluation failure before the ordinary engine recovery handler exists.
  HSC.bootstrapError = error => {
    HSC.dismissLoading();
    console.error(error);
    document.documentElement.dataset.bootError = 'true';
    const panel = document.createElement('section');
    panel.className = 'boot-error';
    panel.setAttribute('role', 'alert');
    const title = document.createElement('h1');
    title.textContent = 'The game could not load';
    const message = document.createElement('p');
    message.textContent = HSC.bootMessage(error);
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Retry';
    retry.onclick = () => { retry.disabled = true; location.reload(); };
    panel.append(title, message, retry, HSC.bootErrorCode(error));
    document.body.appendChild(panel);
    retry.focus();
    HSC.youtubeClientPromise?.then(client => client.destroy()).catch(() => {});
  };
})();
