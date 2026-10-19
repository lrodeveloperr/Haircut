/* Meta Instant Games SDK v8 adapter. No Playgama or cross-publisher SDKs. */
(function (HSC) {
  'use strict';
  const schemas = new Map([
    ['skin-fade-studio-session-v2', ['version', 19]],
    ['skin-fade-studio-meta-v1', ['v', 1]],
    ['skin-fade-studio-rewards-v4', ['v', 4]],
  ]);
  const knownKeys = [...schemas.keys(), 'skin-fade-studio-audio-v1', 'skin-fade-studio-detail-v1'];
  const previewPrefix = 'asmr-barber-facebook-preview:';
  const clone = value => JSON.parse(JSON.stringify(value));
  const bytes = value => new TextEncoder().encode(JSON.stringify(value)).byteLength;
  const tooNew = () => Object.assign(new Error('Progress needs a newer game version'), {code: 'SAVE_TOO_NEW'});

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
      const id = ++sequence;
      const task = {id, fn, delay: Math.max(0, delay || 0), remaining: Math.max(0, delay || 0), repeat, handle: null};
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

  HSC.createFacebookClient = async function ({preload = false} = {}) {
    const sdk = globalThis.FBInstant;
    const localPreview = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) ||
      new URLSearchParams(location.search).has('facebook_preview');
    const hosted = !localPreview;
    if (hosted) {
      if (!sdk || typeof sdk.initializeAsync !== 'function') throw new Error('Meta Instant Games SDK could not load');
      await sdk.initializeAsync();
      sdk.setLoadingProgress?.(10);
    }

    let disposed = false, loaded = false, ready = false, game = null, loadPromise;
    let queue = Promise.resolve(), adPending = false, userAudio = true, interstitialAccepted = false;
    let lastInterstitialAttempt = -Infinity;
    const slots = {};
    const reasons = new Set(), listeners = new Set();
    if (preload) reasons.add('startup');
    const state = () => ({
      paused: reasons.size > 0,
      executionPaused: reasons.has('host') || reasons.has('advertisement-request') || reasons.has('graphics'),
      audioEnabled: userAudio && reasons.size === 0,
    });
    function report(error) { console.warn('Meta Instant Games adapter:', error?.code || error?.message || error); }
    function publish() {
      if (disposed) return;
      const next = state();
      HSC.executionPaused = next.executionPaused;
      HSC.lifecycle.setPaused(next.executionPaused);
      document.documentElement.classList.toggle('fb-paused', next.executionPaused);
      if (document.body) document.body.inert = next.executionPaused || reasons.has('startup');
      game?.setPaused(next.paused);
      game?.setAudioEnabled(next.audioEnabled);
      HSC.setRevealAudio?.(next.audioEnabled);
      for (const callback of [...listeners]) callback(next);
    }
    function pause(reason, value) { value ? reasons.add(reason) : reasons.delete(reason); publish(); }
    function whenResumed() {
      if (disposed) return Promise.reject(new Error('Game disposed'));
      if (!state().executionPaused) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const callback = next => {
          if (disposed || !next.executionPaused) {
            listeners.delete(callback);
            disposed ? reject(new Error('Game disposed')) : resolve();
          }
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
        listeners.add(update); update(state());
      });
    }
    if (preload) HSC.whenFacebookResumed = whenResumed;

    if (hosted) {
      sdk.onPause?.(() => {
        pause('host', true);
        if (loaded && game) flush().catch(report);
      });
      sdk.onResume?.(() => pause('host', false));
    }

    function decode(key, raw) {
      if (raw == null) return null;
      let value = raw;
      if (typeof raw === 'string') {
        try { value = JSON.parse(raw); }
        catch (_) { throw new Error('Saved progress could not be decoded'); }
      }
      const schema = schemas.get(key);
      if (schema && value && Number.isFinite(value[schema[0]]) && value[schema[0]] > schema[1]) throw tooNew();
      return value;
    }
    async function load() {
      if (loadPromise) return loadPromise;
      loadPromise = (async () => {
        await whenResumed();
        if (HSC.startupTiming) HSC.startupTiming.saveRequest = performance.now();
        let values = {};
        if (hosted) values = await sdk.player.getDataAsync(knownKeys);
        else {
          for (const key of knownKeys) {
            try { values[key] = localStorage.getItem(previewPrefix + key); }
            catch (_) { values[key] = null; }
          }
        }
        await whenResumed();
        for (const key of knownKeys) {
          const value = decode(key, values?.[key]);
          if (value != null) slots[key] = value;
        }
        loaded = true;
        if (HSC.startupTiming) HSC.startupTiming.savesLoaded = performance.now();
      })();
      return loadPromise;
    }
    function requireLoaded() {
      if (disposed) throw new Error('Game disposed');
      if (!loaded) throw new Error('Progress is protected until it loads successfully');
    }
    function enforceLimit(nextSlots) {
      if (bytes(nextSlots) >= 950 * 1024) throw new Error('Meta cloud save exceeds the 1 MB player limit');
    }
    function persist(key) {
      requireLoaded();
      const pending = queue.catch(() => {}).then(async () => {
        requireLoaded(); enforceLimit(slots);
        const value = Object.hasOwn(slots, key) ? JSON.stringify(slots[key]) : null;
        if (hosted) await sdk.player.setDataAsync({[key]: value});
        else {
          try { value == null ? localStorage.removeItem(previewPrefix + key) : localStorage.setItem(previewPrefix + key, value); }
          catch (_) { /* Preview retains the in-memory slot for this page load. */ }
        }
      });
      queue = pending; return pending;
    }
    async function flush() {
      requireLoaded();
      if (game?.flush) await game.flush();
      await queue;
      if (hosted) await sdk.player.flushDataAsync();
    }

    const config = HSC.facebookConfig || {};
    function placementFor(kind, placement) {
      const ads = config.ads || {};
      if (kind === 'interstitial') return String(ads.interstitial || '');
      return String(ads.rewarded?.[placement] || ads.rewarded?.default || '');
    }
    const cachedAds = new Map();
    function adKey(kind, placement) { return kind + ':' + placement; }
    async function prepareAd(kind, placement) {
      const placementID = placementFor(kind, placement);
      if (!hosted || !placementID) return null;
      const key = adKey(kind, placement);
      if (!cachedAds.has(key)) {
        const pending = (async () => {
          const ad = kind === 'rewarded'
            ? await sdk.getRewardedVideoAsync(placementID)
            : await sdk.getInterstitialAdAsync(placementID);
          await ad.loadAsync(); return ad;
        })().catch(error => { cachedAds.delete(key); throw error; });
        cachedAds.set(key, pending);
      }
      return cachedAds.get(key);
    }
    async function advertisement(kind, placement = '') {
      if (kind === 'interstitial') interstitialAccepted = false;
      if (!hosted || disposed || adPending || state().executionPaused || !placementFor(kind, placement)) return false;
      if (kind === 'interstitial' && performance.now() - lastInterstitialAttempt < 60000) return false;
      adPending = true;
      const key = adKey(kind, placement);
      let shown = false;
      try {
        await flush();
        if (disposed || state().executionPaused) return false;
        pause('advertisement-request', true);
        if (kind === 'interstitial') lastInterstitialAttempt = performance.now();
        const ad = await prepareAd(kind, placement);
        cachedAds.delete(key);
        if (!ad) return false;
        await ad.showAsync();
        shown = true;
        if (kind === 'interstitial') interstitialAccepted = true;
      } catch (error) { report(error); }
      finally {
        pause('advertisement-request', false); adPending = false;
        prepareAd(kind, placement).catch(() => {});
      }
      await whenResumed();
      return shown;
    }

    function destroy() {
      if (disposed) return;
      disposed = true;
      for (const callback of [...listeners]) callback(state());
      listeners.clear(); cachedAds.clear(); HSC.lifecycle.dispose(); game = null;
      document.documentElement.classList.remove('fb-paused');
      if (document.body) document.body.inert = false;
      HSC.setRevealAudio?.(false);
    }

    if (preload) load().catch(() => {});
    let language = navigator.language || 'en';
    if (hosted) language = sdk.getLocale?.() || language;
    if (HSC.startupTiming) HSC.startupTiming.localeLoaded = performance.now();
    return {
      platformId: 'facebook', language, isLocalPreview: !hosted,
      rewardedSupported: hosted && !!(placementFor('rewarded', 'unlock-item') || placementFor('rewarded', 'replay-customer')),
      async loadProgress(key, fallback) { await load(); const value = slots[key]; return value == null ? fallback : clone(value); },
      async saveProgress(key, value) { requireLoaded(); slots[key] = clone(value); return persist(key); },
      async deleteProgress(key) { requireLoaded(); delete slots[key]; return persist(key); },
      flushProgress: flush, whenResumed, afterPaint, setPauseReason: pause,
      finishStartup() { pause('startup', false); },
      setUserAudioEnabled(value) { userAudio = !!value; publish(); },
      bindGame(value) { game = value; publish(); },
      onStateChange(callback) { listeners.add(callback); callback(state()); return () => listeners.delete(callback); },
      async gameReady() {
        await whenResumed();
        if (!ready) {
          if (hosted) { sdk.setLoadingProgress?.(100); await sdk.startGameAsync(); }
          ready = true;
          prepareAd('rewarded', 'unlock-item').catch(() => {});
          prepareAd('rewarded', 'replay-customer').catch(() => {});
          prepareAd('interstitial', '').catch(() => {});
          if (HSC.startupTiming) HSC.startupTiming.gameReady = performance.now();
        }
      },
      showInterstitial: () => advertisement('interstitial'),
      get lastInterstitialRequestAccepted() { return interstitialAccepted; },
      showRewarded: placement => advertisement('rewarded', placement),
      // The game reports completion events here; no additional developer analytics are sent.
      async sendAnalytics() {}, destroy,
    };
  };
})(globalThis.HSC || (globalThis.HSC = {}));
