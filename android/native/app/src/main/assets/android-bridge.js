// Android host for the game. The page still references Playgama Bridge's script URL, so the Android app
// serves this file in its place (MainActivity intercepts that URL): no Playgama code ships in the app.
// It offers the same interface the game's platform client already uses (initialize, platform, storage,
// advertisement, analytics), backed by the native AndroidHost object:
// - storage: the app's own private storage (SharedPreferences), written synchronously before resolving;
// - advertisement: AdMob. A rewarded video counts only when the native side reports AdMob's earned-reward
//   callback ("rewarded"); a dismissed, unavailable or failed ad reports only "closed" / "failed";
// - analytics: nothing is sent (no developer telemetry on Android).
(function () {
  'use strict';
  const host = window.AndroidHost;
  if (!host) return; // not inside the Android app: the game shows its normal startup error

  function emitter() {
    const events = new Map();
    return {
      on(name, fn) { if (!events.has(name)) events.set(name, new Set()); events.get(name).add(fn); },
      off(name, fn) { const s = events.get(name); if (s) s.delete(fn); },
      emit(name, value) {
        for (const fn of [...(events.get(name) || [])]) {
          try { fn(value); } catch (e) { console.error('android bridge listener', e); }
        }
      },
    };
  }

  const parseList = (json) => {
    const out = JSON.parse(json);
    if (!Array.isArray(out)) throw new Error('Android storage returned no list');
    return out;
  };
  const keysOf = (keys) => (Array.isArray(keys) ? keys : [keys]).map(String);
  const text = (v) => (typeof v === 'string' ? v : JSON.stringify(v));

  const platform = Object.assign(emitter(), {
    id: 'android',
    language: String((navigator.language || 'en').slice(0, 2)).toLowerCase(),
    isAudioEnabled: true,
    isPaused: false,
    async sendMessage(message) { if (message === 'game_ready') host.gameReady(); },
  });

  const storage = {
    async get(keys) {
      const k = keysOf(keys);
      const values = parseList(host.storageGet(JSON.stringify(k)));
      if (values.length !== k.length) throw new Error('Android storage read failed');
      return values;
    },
    async set(keys, values) {
      const k = keysOf(keys), v = (Array.isArray(values) ? values : [values]).map(text);
      if (!host.storageSet(JSON.stringify(k), JSON.stringify(v))) throw new Error('Android storage write failed');
    },
    async delete(keys) {
      if (!host.storageDelete(JSON.stringify(keysOf(keys)))) throw new Error('Android storage delete failed');
    },
  };

  const ad = Object.assign(emitter(), {
    isInterstitialSupported: true,
    isRewardedSupported: true,
    interstitialState: 'closed',
    rewardedState: 'closed',
    showInterstitial(placement) {
      setState('interstitial', 'loading');
      host.showInterstitial(String(placement || ''));
    },
    showRewarded(placement) {
      setState('rewarded', 'loading');
      host.showRewarded(String(placement || ''));
    },
  });
  function setState(kind, state) {
    ad[kind + 'State'] = state;
    ad.emit(kind + '_state_changed', state);
  }

  // called by the native side
  window.__androidHost = {
    ad(kind, state) {
      if ((kind === 'rewarded' || kind === 'interstitial') && ['loading', 'opened', 'rewarded', 'closed', 'failed'].includes(state)) {
        setState(kind, state);
        // the game reads "failed" as finished; the ad slot is free again afterwards
        if (state === 'failed') setState(kind, 'closed');
      }
    },
    pause(paused) {
      platform.isPaused = !!paused;
      platform.emit('pause_state_changed', !!paused);
    },
    // the Android back button: close an open panel; true when something was closed
    back() {
      if (!document.querySelector('#hsc-panel.open')) return false;
      const target = document.activeElement || document.body;
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
      return true;
    },
  };

  window.bridge = {
    async initialize() { return true; },
    platform,
    storage,
    advertisement: ad,
    analytics: { async send() {} },
  };
})();
