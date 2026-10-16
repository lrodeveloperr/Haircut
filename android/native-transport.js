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
        const timer = setTimeout(() => { pending.delete(id); reject(Error('Android storage timed out')); }, 15000);
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
        ad.timer = setTimeout(end, 90000);
        try { kind === 'rewarded' ? host.showRewarded(String(placement || '')) : host.showInterstitial(String(placement || '')); }
        catch (_) { end(); }
      });
    },
  };
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
      if (state === 'opened') ad.displayed = true;
      if (state === 'rewarded') ad.earned = true;
      if (state === 'closed' || state === 'failed') ad.end();
    },
    back() {
      if (!document.querySelector('#hsc-panel.open')) return false;
      (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
      return true;
    },
  };
})(globalThis.HSC || (globalThis.HSC = {}));
