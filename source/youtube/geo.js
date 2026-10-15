/* Device cache for the startup models. The base head, gown, hair roots, strands and beard surface are
 * computed from fixed data with fixed seeds, so every load produces identical arrays. The first load
 * computes and stores them; later loads read the same arrays back instead of recomputing them.
 * The cache is optional: any storage failure falls back to computing, exactly as before. */
(function (HSC) {
  'use strict';
  const DB = 'asmr-barber-models', STORE = 'models', WAIT_MS = 1500;
  const build = HSC.geoBuild || 'dev';
  let cached = null, pending = new Map(), db = null;
  const open = () => new Promise(resolve => {
    try {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => { db = request.result; resolve(db); };
      request.onerror = request.onblocked = () => resolve(null);
    } catch (_) { resolve(null); }
  });
  const read = database => new Promise(resolve => {
    if (!database) { resolve(null); return; }
    try {
      const request = database.transaction(STORE, 'readonly').objectStore(STORE).get(build);
      request.onsuccess = () => resolve(request.result && typeof request.result === 'object' ? request.result : null);
      request.onerror = () => resolve(null);
    } catch (_) { resolve(null); }
  });
  // Started before the game scripts evaluate; never delays startup by more than WAIT_MS.
  HSC.geo = {
    ready: Promise.race([open().then(read), new Promise(resolve => setTimeout(() => resolve(null), WAIT_MS))])
      .then(value => { cached = value; if (HSC.startupTiming) HSC.startupTiming.modelCache = value ? 'hit' : 'miss'; }),
    // Returns the stored result for key, or computes it and keeps a copy to store after startup.
    use(key, compute) {
      if (cached && cached[key] !== undefined) return cached[key];
      const value = compute();
      try { pending.set(key, structuredClone(value)); } catch (_) {}
      return value;
    },
    // Called once the game is playable, so writing never competes with startup.
    saveLater() {
      // Only a full set computed by this load is written; handed-out cached arrays may be mutated.
      if (cached || !pending.size || !db) return;
      setTimeout(() => {
        try {
          const record = Object.fromEntries(pending);
          const store = db.transaction(STORE, 'readwrite').objectStore(STORE);
          store.clear();
          store.put(record, build);
          pending = new Map();
        } catch (_) {}
      }, 2000);
    },
  };
})(globalThis.HSC || (globalThis.HSC = {}));
