// Transport only. Game/lifecycle/save policy stays in the working Sites client.
(function (HSC) {
  'use strict';
  const host = globalThis.AndroidHost;
  if (!host || typeof host.request !== 'function') throw Error('Android host is unavailable');
  let sequence = 0, paused = false, ad = null;
  const pending = new Map(), listeners = new Set();
  HSC.android = {
    request(operation, payload) {
      return new Promise((resolve, reject) => {
        const id = String(++sequence);
        // the boot screen reads 'Progress' as a save problem (loader.js bootCode), so a slow first load says so
        const timer = setTimeout(() => { pending.delete(id); reject(Error('Progress storage timed out')); }, 15000);
        pending.set(id, { resolve, reject, timer });
        try { host.request(id, operation, JSON.stringify(payload)); }
        catch (error) { clearTimeout(timer); pending.delete(id); reject(error); }
      });
    },
    onPause(callback) { listeners.add(callback); callback(paused); return () => listeners.delete(callback); },
    advertisement(kind, placement) {
      if (ad) return Promise.resolve({ earned: false, displayed: false });
      return new Promise(resolve => {
        ad = { kind, resolve, earned: false, displayed: false, timer: 0 };
        const end = () => { const current = ad; ad = null; clearTimeout(current.timer); current.resolve({ earned: current.earned, displayed: current.displayed }); };
        ad.end = end;
        // a watchdog only for an ad that never opens; once it is on screen the player may watch, leave the app and
        // come back: the earned reward must still arrive, so the ad ends when Android says closed (a long safety net
        // remains in case the host never answers)
        ad.timer = setTimeout(end, 90000);
        try { kind === 'rewarded' ? host.showRewarded(String(placement || '')) : host.showInterstitial(String(placement || '')); }
        catch (_) { end(); }
      });
    },
  };
  // the native ad layer says when a rewarded video can (or can no longer) play: the game's video buttons follow it
  if (typeof globalThis.addEventListener === 'function') globalThis.addEventListener('android-rewarded-ready', () => {
    try { globalThis.dispatchEvent(new Event('hsc-rewarded-ready')); } catch (_) {}
  });
  globalThis.__androidHost = {
    complete(id, success, value) {
      const request = pending.get(String(id));
      if (!request) return;
      pending.delete(String(id)); clearTimeout(request.timer);
      success ? request.resolve(value) : request.reject(Error(String(value || 'Android storage failed')));
    },
    pause(value) { paused = !!value; for (const callback of [...listeners]) callback(paused); },
    ad(kind, state) {
      if (!ad || ad.kind !== kind) return;
      if (state === 'opened') { ad.displayed = true; clearTimeout(ad.timer); ad.timer = setTimeout(ad.end, 30 * 60000); }
      if (state === 'rewarded') ad.earned = true;
      if (state === 'closed' || state === 'failed') ad.end();
    },
    back() {
      // the wardrobe handles its own Escape; everything else goes to the home screen's back (menu.js, Android build)
      if (!document.querySelector('#hsc-panel.open')) return HSC.menuBack ? HSC.menuBack() : false;
      (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
      return true;
    },
  };
})(globalThis.HSC || (globalThis.HSC = {}));
