/* Direct YouTube Playables integration. No Playgama SDK or production mock. */
(function (HSC) {
  'use strict';
  const schemas = new Map([
    ['skin-fade-studio-session-v2', ['version', 19]],
    ['skin-fade-studio-meta-v1', ['v', 1]],
    ['skin-fade-studio-rewards-v4', ['v', 4]],
  ]);
  const previewKey = 'asmr-barber-youtube-save-v1';
  // Off-platform preview only. Sandboxed frames and strict privacy modes can deny localStorage;
  // the preview then keeps progress for this page load instead of failing to start.
  let previewMemory = null, previewStorageUnavailable = false;
  const previewStore = {
    get() {
      if (previewStorageUnavailable) return previewMemory;
      try { return globalThis.localStorage.getItem(previewKey); }
      catch (_) { previewStorageUnavailable = true; return previewMemory; }
    },
    set(data) {
      previewMemory = data;
      if (previewStorageUnavailable) return;
      try { globalThis.localStorage.setItem(previewKey, data); }
      catch (_) { previewStorageUnavailable = true; }
    },
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  // v3.82 saved through Playgama Bridge: a flat {key: JSON string} object with no envelope.
  // Only objects whose every key is one of the game's own are migrated; anything else stays protected.
  const legacyBridgeSave = value => value && typeof value === 'object' && !Array.isArray(value) &&
    !Object.hasOwn(value, 'version') && Object.keys(value).every(key => key.startsWith('skin-fade-studio-'));
  function migrateBridgeSave(value) {
    const slots = {};
    for (const [key, item] of Object.entries(value)) {
      if (typeof item !== 'string') { slots[key] = item; continue; }
      try { slots[key] = JSON.parse(item); }
      catch (_) { throw new Error('Saved progress could not be decoded'); }
    }
    return {version: 1, slots};
  }
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

  HSC.createYouTubeClient = async function ({preload = false} = {}) {
    const sdk = globalThis.ytgame;
    if (!sdk || !sdk.game || !sdk.system) throw new Error('YouTube Playables SDK could not load');
    const hosted = sdk.IN_PLAYABLES_ENV === true;
    let disposed = false, loaded = false, envelope = null, loadPromise;
    let queue = Promise.resolve(), game = null, hostAudio = sdk.system.isAudioEnabled() === true;
    let userAudio = true, adPending = false, ready = false, lastAttempt = -Infinity, interstitialAccepted = false;
    let acknowledgedCuts = 0, reportedCuts = 0, scorePending = false;
    const reasons = new Set(), listeners = new Set(), cleanup = [];
    if (preload) reasons.add('startup');
    const state = () => ({paused: reasons.size > 0, executionPaused: reasons.has('host') || reasons.has('advertisement-request'), audioEnabled: hostAudio && userAudio && reasons.size === 0});
    const report = () => { try { sdk.health?.logWarning(); } catch (_) {} };
    function publish() {
      if (disposed) return;
      const next = state();
      HSC.executionPaused = next.executionPaused;
      HSC.lifecycle.setPaused(next.executionPaused);
      document.documentElement.classList.toggle('yt-paused', next.executionPaused);
      if (document.body) document.body.inert = next.executionPaused || reasons.has('startup');
      game?.setPaused(next.paused);
      game?.setAudioEnabled(next.audioEnabled);
      HSC.setRevealAudio?.(next.audioEnabled);
      for (const callback of [...listeners]) callback(next);
      reportScore();
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
    function afterPaint() {
      return new Promise((resolve, reject) => {
        let handle = 0;
        const update = next => {
          if (disposed) {
            if (handle) cancelAnimationFrame(handle);
            listeners.delete(update);
            reject(new Error('Game disposed'));
          } else if (next.executionPaused) {
            if (handle) cancelAnimationFrame(handle);
            handle = 0;
          } else if (!handle) {
            handle = requestAnimationFrame(() => { handle = 0; listeners.delete(update); resolve(); });
          }
        };
        listeners.add(update);
        update(state());
      });
    }
    // Available synchronously to the early bootstrap, before the SDK requests resolve.
    if (preload) HSC.whenYouTubeResumed = whenResumed;
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
        await whenResumed();
        if (HSC.startupTiming) HSC.startupTiming.saveRequest = performance.now();
        const raw = hosted ? await sdk.game.loadData() : previewStore.get();
        await whenResumed();
        let parsed = raw;
        if (typeof raw === 'string') {
          // The SDK owns the transport, not our save schema. A new account/test host may
          // return empty JSON rather than the empty string used by the first fixture.
          try { parsed = raw.trim() === '' ? null : JSON.parse(raw); }
          catch (_) { throw new Error('Saved progress could not be decoded'); }
        }
        const empty = parsed == null || parsed === '' || parsed === false || parsed === 0 ||
          (typeof parsed === 'string' && parsed.trim() === '') ||
          (typeof parsed === 'object' && Object.keys(parsed).length === 0);
        if (empty) parsed = {version: 1, slots: {}};
        else if (legacyBridgeSave(parsed)) parsed = migrateBridgeSave(parsed);
        else {
          // Preserve unknown nonempty and future saves; never silently reset player data.
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
        acknowledgedCuts = savedCuts(envelope);
        if (HSC.startupTiming) HSC.startupTiming.savesLoaded = performance.now();
      })();
      return loadPromise;
    }
    function savedCuts(value) {
      const meta = value.slots['skin-fade-studio-meta-v1'];
      if (meta?.v !== 1) return 0;
      const cuts = meta.cuts;
      return Number.isSafeInteger(cuts) && cuts > 0 ? cuts : 0;
    }
    function reportScore() {
      if (!hosted || !ready || disposed || state().executionPaused || scorePending ||
          !sdk.engagement?.sendScore || acknowledgedCuts <= reportedCuts) return;
      const value = acknowledgedCuts;
      scorePending = true;
      // Reporting is independent of the save queue and never delays readiness, input or ads.
      Promise.resolve().then(async () => {
        if (disposed || state().executionPaused) return;
        await sdk.engagement.sendScore({value});
        reportedCuts = Math.max(reportedCuts, value);
      }).catch(report).finally(() => {
        scorePending = false;
        // A newer acknowledged completion may have arrived while this report was in flight.
        // On failure, retry the same score at the next save/resume, not in a tight loop.
        if (acknowledgedCuts > value) reportScore();
      });
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
        const cuts = savedCuts(envelope);
        if (new TextEncoder().encode(data).byteLength >= 3 * 1024 * 1024) throw new Error('Cloud save exceeds size limit');
        if (hosted) await sdk.game.saveData(data);
        else previewStore.set(data);
        acknowledgedCuts = cuts;
        reportScore();
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
    // The first cloud read and locale lookup are independent. Attach an immediate rejection
    // handler to the eager read; hC still consumes the original rejection and protects saves.
    if (preload) load().catch(() => {});
    let language = 'en';
    try {
      await whenResumed();
      if (HSC.startupTiming) HSC.startupTiming.localeRequest = performance.now();
      language = await sdk.system.getLanguage();
      if (HSC.startupTiming) HSC.startupTiming.localeLoaded = performance.now();
    } catch (_) { report(); }
    return {
      platformId: 'youtube', language: language || 'en', isLocalPreview: !hosted,
      rewardedSupported: hosted && typeof sdk.ads?.requestRewardedAd === 'function',
      async loadProgress(key, fallback) { await load(); const value = envelope.slots[key]; return value == null ? fallback : clone(value); },
      async saveProgress(key, value) { requireLoaded(); envelope.slots[key] = clone(value); return persist(); },
      async deleteProgress(key) { requireLoaded(); delete envelope.slots[key]; return persist(); },
      flushProgress: flush, whenResumed, afterPaint, setPauseReason: pause,
      finishStartup() { pause('startup', false); },
      setUserAudioEnabled(value) { userAudio = !!value; publish(); },
      bindGame(value) { game = value; publish(); },
      onStateChange(callback) { listeners.add(callback); callback(state()); return () => listeners.delete(callback); },
      async gameReady() { await whenResumed(); if (!ready) { ready = true; sdk.game.gameReady(); if (HSC.startupTiming) HSC.startupTiming.gameReady = performance.now(); reportScore(); } },
      showInterstitial: () => advertisement('interstitial'),
      get lastInterstitialRequestAccepted() { return interstitialAccepted; },
      showRewarded: placement => advertisement('rewarded', placement),
      // The legacy game reports completion events here; no external analytics are sent.
      async sendAnalytics() {}, destroy,
    };
  };
})(globalThis.HSC || (globalThis.HSC = {}));
