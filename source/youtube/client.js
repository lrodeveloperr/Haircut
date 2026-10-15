/* Direct YouTube Playables integration. No Playgama SDK or production mock. */
(function (HSC) {
  'use strict';
  const schemas = new Map([
    ['skin-fade-studio-session-v2', ['version', 19]],
    ['skin-fade-studio-meta-v1', ['v', 1]],
    ['skin-fade-studio-rewards-v4', ['v', 4]],
  ]);
  const previewKey = 'asmr-barber-youtube-save-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  const tooNew = () => Object.assign(new Error('Progress needs a newer game version'), {code: 'SAVE_TOO_NEW'});

  // Only game-owned UI work uses this scheduler. SDK callbacks remain responsive while paused.
  function scheduler() {
    let paused = false, disposed = false, sequence = 0;
    const tasks = new Map();
    function arm(task) {
      if (paused || disposed) return;
      task.at = performance.now() + task.remaining;
      task.handle = setTimeout(() => {
        task.handle = null;
        if (paused || disposed) return;
        if (!task.repeat) tasks.delete(task.id);
        task.fn();
        if (task.repeat && tasks.has(task.id)) { task.remaining = task.delay; arm(task); }
      }, task.remaining);
    }
    function add(fn, delay, repeat) {
      const id = ++sequence, task = {id, fn, delay: Math.max(0, delay || 0), remaining: Math.max(0, delay || 0), repeat, handle: null};
      if (!disposed) { tasks.set(id, task); arm(task); }
      return id;
    }
    return {
      timeout: (fn, delay) => add(fn, delay, false),
      interval: (fn, delay) => add(fn, delay, true),
      clear(id) { const task = tasks.get(id); if (task) clearTimeout(task.handle); tasks.delete(id); },
      setPaused(value) {
        if (paused === value) return;
        paused = value;
        for (const task of tasks.values()) {
          if (paused) { clearTimeout(task.handle); task.handle = null; task.remaining = Math.max(0, task.at - performance.now()); }
          else arm(task);
        }
      },
      dispose() { disposed = true; for (const task of tasks.values()) clearTimeout(task.handle); tasks.clear(); },
    };
  }
  HSC.lifecycle = scheduler();

  HSC.createYouTubeClient = async function () {
    const sdk = globalThis.ytgame;
    if (!sdk || !sdk.game || !sdk.system) throw new Error('YouTube Playables SDK could not load');
    const hosted = sdk.IN_PLAYABLES_ENV === true;
    let disposed = false, loaded = false, envelope = null, loadPromise;
    let queue = Promise.resolve(), game = null, hostAudio = sdk.system.isAudioEnabled() === true;
    let userAudio = true, adPending = false, ready = false, lastAttempt = -Infinity, interstitialAccepted = false;
    const reasons = new Set(), listeners = new Set(), cleanup = [];
    const state = () => ({paused: reasons.size > 0, executionPaused: reasons.has('host') || reasons.has('advertisement-request'), audioEnabled: hostAudio && userAudio && reasons.size === 0});
    const report = () => { try { sdk.health?.logWarning(); } catch (_) {} };
    function publish() {
      if (disposed) return;
      const next = state();
      HSC.executionPaused = next.executionPaused;
      HSC.lifecycle.setPaused(next.executionPaused);
      document.documentElement.classList.toggle('yt-paused', next.executionPaused);
      if (document.body) document.body.inert = next.executionPaused;
      game?.setPaused(next.paused);
      game?.setAudioEnabled(next.audioEnabled);
      HSC.setRevealAudio?.(next.audioEnabled);
      for (const callback of [...listeners]) callback(next);
    }
    function pause(reason, value) { if (value) reasons.add(reason); else reasons.delete(reason); publish(); }
    function whenResumed() {
      if (disposed) return Promise.reject(new Error('Game disposed'));
      if (!state().executionPaused) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const callback = next => {
          if (disposed || !next.executionPaused) { listeners.delete(callback); disposed ? reject(new Error('Game disposed')) : resolve(); }
        };
        listeners.add(callback);
      });
    }
    // Register before awaiting any asynchronous initialization so early host events cannot be lost.
    cleanup.push(sdk.system.onPause(() => {
      pause('host', true);
      // onPause is the SDK's documented final-save window. Never clear an unread save.
      if (loaded && game) flush().catch(report);
    }));
    cleanup.push(sdk.system.onResume(() => pause('host', false)));
    cleanup.push(sdk.system.onAudioEnabledChange(enabled => { hostAudio = enabled === true; publish(); }));

    async function load() {
      if (loadPromise) return loadPromise;
      loadPromise = (async () => {
        const raw = hosted ? await sdk.game.loadData() : globalThis.localStorage.getItem(previewKey);
        let parsed;
        if (!raw) parsed = {version: 1, slots: {}};
        else {
          // An invalid envelope is not known-safe empty data. Preserve it and show Retry.
          try { parsed = JSON.parse(raw); } catch (_) { throw new Error('Saved progress could not be decoded'); }
          if (parsed?.version > 1) throw tooNew();
          if (parsed?.version !== 1 || !parsed.slots || typeof parsed.slots !== 'object' || Array.isArray(parsed.slots))
            throw new Error('Saved progress has an unsupported format');
        }
        for (const [key, [field, version]] of schemas) {
          const value = parsed.slots[key];
          if (value && Number.isFinite(value[field]) && value[field] > version) throw tooNew();
        }
        envelope = parsed;
        loaded = true;
      })();
      return loadPromise;
    }
    function requireLoaded() {
      if (disposed) throw new Error('Game disposed');
      if (!loaded) throw new Error('Progress is protected until it loads successfully');
    }
    function persist() {
      requireLoaded();
      // Serialize at execution time: concurrently changing slots cannot overwrite one another.
      const pending = queue.catch(() => {}).then(async () => {
        requireLoaded();
        const data = JSON.stringify(envelope);
        if (new TextEncoder().encode(data).byteLength >= 3 * 1024 * 1024) throw new Error('Cloud save exceeds size limit');
        if (hosted) await sdk.game.saveData(data);
        else globalThis.localStorage.setItem(previewKey, data);
      });
      queue = pending;
      return pending;
    }
    async function flush() {
      requireLoaded();
      if (game?.flush) await game.flush();
      await persist();
    }
    async function advertisement(kind, placement) {
      if (kind === 'interstitial') interstitialAccepted = false;
      if (!hosted || disposed || adPending || state().executionPaused) return false;
      const method = kind === 'rewarded' ? 'requestRewardedAd' : 'requestInterstitialAd';
      if (typeof sdk.ads?.[method] !== 'function') return false;
      if (kind === 'interstitial' && performance.now() - lastAttempt < 60000) return false;
      adPending = true;
      let result = false;
      try {
        // A failed save blocks the ad, preserving the current customer and earned content.
        await flush();
        if (!state().executionPaused && !disposed) {
          pause('advertisement-request', true);
          if (kind === 'interstitial') {
            lastAttempt = performance.now();
            await sdk.ads.requestInterstitialAd();
            interstitialAccepted = true;
            // The API confirms a request, not a displayed impression. Return false to the old
            // display counter; the independent attempt cooldown prevents repeated requests.
          } else {
            result = (await sdk.ads.requestRewardedAd(placement)) === true;
          }
        }
      } catch (_) { report(); }
      finally { pause('advertisement-request', false); adPending = false; }
      await whenResumed();
      return result;
    }
    function destroy() {
      if (disposed) return;
      disposed = true;
      for (const unsubscribe of cleanup) if (typeof unsubscribe === 'function') unsubscribe();
      for (const callback of [...listeners]) callback(state());
      listeners.clear(); HSC.lifecycle.dispose(); game = null;
      document.documentElement.classList.remove('yt-paused');
      if (document.body) document.body.inert = false;
      HSC.setRevealAudio?.(false);
    }
    let language = 'en';
    try { language = await sdk.system.getLanguage(); } catch (_) { report(); }
    return {
      platformId: 'youtube', language: language || 'en', isLocalPreview: !hosted,
      rewardedSupported: hosted && typeof sdk.ads?.requestRewardedAd === 'function',
      async loadProgress(key, fallback) { await load(); const value = envelope.slots[key]; return value == null ? fallback : clone(value); },
      async saveProgress(key, value) { requireLoaded(); envelope.slots[key] = clone(value); return persist(); },
      async deleteProgress(key) { requireLoaded(); delete envelope.slots[key]; return persist(); },
      flushProgress: flush, whenResumed, setPauseReason: pause,
      setUserAudioEnabled(value) { userAudio = !!value; publish(); },
      bindGame(value) { game = value; publish(); },
      onStateChange(callback) { listeners.add(callback); callback(state()); return () => listeners.delete(callback); },
      async gameReady() { if (!ready) { ready = true; sdk.game.gameReady(); } },
      showInterstitial: () => advertisement('interstitial'),
      get lastInterstitialRequestAccepted() { return interstitialAccepted; },
      showRewarded: placement => advertisement('rewarded', placement),
      // The legacy game reports completion events here; no external analytics are sent.
      async sendAnalytics() {}, destroy,
    };
  };
})(globalThis.HSC || (globalThis.HSC = {}));
