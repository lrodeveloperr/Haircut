/* Loaded immediately after the official SDK and before any engine code. */
(function () {
  'use strict';
  const loading = document.getElementById('yt-loading');
  try {
    if (globalThis.ytgame?.game) globalThis.ytgame.game.firstFrameReady();
  } catch (_) { /* The regular startup recovery screen handles SDK failures. */ }
  globalThis.HSC = globalThis.HSC || {};
  HSC.startupTiming = {sdkReady: performance.now()};
  HSC.dismissLoading = () => loading?.remove();
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
  HSC.bootErrorCode = error => {
    const box = document.createElement('div');
    box.className = 'boot-error-info';
    const code = document.createElement('p');
    code.className = 'boot-error-code';
    code.textContent = 'Code: ' + HSC.bootCode(error);
    box.append(code);
    const lines = Array.isArray(error?.detail) ? error.detail.slice() : [];
    if (globalThis.ytgame) lines.push('Mode: ' + (globalThis.ytgame.IN_PLAYABLES_ENV === true ? 'YouTube' : 'preview'));
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
    message.textContent = 'Your saved progress has been kept. Check your connection and try again.';
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
