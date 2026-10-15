/* Loading-screen picture. The loading screen shows a picture of the scene while the game starts, then
 * fades into the live game. Returning players see a snapshot of their own scene, taken by this device
 * at quiet moments. A first visit (or a changed screen shape) shows the barbershop backdrop the game draws
 * behind every customer, so only the customer fades in. The game itself is unchanged. */
(function (HSC) {
  'use strict';
  const KEY = 'asmr-barber-poster-v1';
  const aspect = () => innerWidth / Math.max(1, innerHeight);
  function stored() {
    try { const value = JSON.parse(localStorage.getItem(KEY) || 'null'); return value && typeof value.src === 'string' ? value : null; }
    catch (_) { return null; }
  }
  // Runs from the loader, before any game script, so the picture is up while the game loads.
  function show(loading) {
    if (!loading) return;
    // The backdrop comes from styles.css (.has-poster mirrors .game-root); the snapshot is the
    // transparent canvas drawn over it, so it is shown only for the screen shape it was taken at.
    loading.classList.add('has-poster');
    const saved = stored();
    if (!saved || Math.abs(saved.w / saved.h / aspect() - 1) >= 0.02) return;
    const src = saved.src;
    const picture = new Image();
    picture.className = 'yt-poster';
    picture.alt = '';
    picture.decoding = 'async';
    picture.src = src;
    loading.prepend(picture);
  }
  function start(game, client) {
    const canvas = document.getElementById('scene');
    // Bound once, so diagnostics that wrap HSC.view.render later do not count these redraws.
    const render = HSC.view && HSC.view.render;
    if (!canvas || !render) return;
    let last = '', pointer = false, timer = 0;
    const signature = () => {
      const state = game.getState();
      return [state.status, state.cutStrokeCount, state.cameraYawDeg, state.cameraElevation, innerWidth, innerHeight,
        HSC.meta && HSC.meta.data && HSC.meta.data.cuts, JSON.stringify(HSC.wardrobe && HSC.wardrobe.data && HSC.wardrobe.data.look)].join('|');
    };
    const keep = src => { try { localStorage.setItem(KEY, JSON.stringify({w: innerWidth, h: innerHeight, src})); } catch (_) {} };
    // The drawing buffer is only readable in the task that drew it, so draw, then read.
    function capture() {
      try {
        if (pointer || HSC.executionPaused || document.hidden || HSC.view.isContextLost()) return;
        const sig = signature();
        if (sig === last) return;
        last = sig;
        render(false);
        canvas.toBlob(blob => {
          if (!blob) return;
          const reader = new FileReader();
          reader.onload = () => keep(reader.result);
          reader.readAsDataURL(blob);
        }, 'image/webp', 0.8);
      } catch (_) {}
    }
    // Quiet moments only: never while a finger is down or during a host pause.
    const soon = delay => {
      HSC.lifecycle.clear(timer);
      timer = HSC.lifecycle.timeout(() => { if (!pointer && !HSC.executionPaused) capture(); }, delay);
    };
    addEventListener('pointerdown', () => { pointer = true; HSC.lifecycle.clear(timer); }, true);
    addEventListener('pointerup', () => { pointer = false; soon(2500); }, true);
    addEventListener('pointercancel', () => { pointer = false; soon(2500); }, true);
    // Keep the last quiet snapshot on exit. A GPU readback and synchronous image encoding in a
    // pause/pagehide callback competes with the host's final-save window, especially on phones.
    soon(5000);
  }
  HSC.poster = {show, start};
})(globalThis.HSC || (globalThis.HSC = {}));
