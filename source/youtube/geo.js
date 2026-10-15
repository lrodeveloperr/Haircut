/* Disposable acceleration data. Player saves are owned by youtube-client.js. */
(function (HSC) {
  'use strict';
  const DB = 'asmr-barber-models', STORE = 'models', CACHE_WAIT_MS = 100, ENV_WAIT_MS = 4000;
  const build = 'models-v2:' + (HSC.geoBuild || 'dev');
  const envKey = 'lighting:' + (HSC.environmentBuild || 'dev');
  let cached = null, pending = new Map(), db = null, saveTimer = 0, environmentBytes = null;
  const timing = (key, value) => { if (HSC.startupTiming) HSC.startupTiming[key] = value; };
  function limit(promise, ms) {
    return new Promise(resolve => {
      const timer = setTimeout(() => resolve(null), ms);
      promise.then(value => { clearTimeout(timer); resolve(value); }, () => { clearTimeout(timer); resolve(null); });
    });
  }
  const database = new Promise(resolve => {
    try {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => {
        db = request.result;
        db.onversionchange = () => { db.close(); db = null; };
        resolve(db);
      };
      request.onerror = request.onblocked = () => resolve(null);
    } catch (_) { resolve(null); }
  });
  const read = key => database.then(connection => new Promise(resolve => {
    if (!connection) { resolve(null); return; }
    try {
      const request = connection.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    } catch (_) { resolve(null); }
  }));
  const remove = key => { try { db?.transaction(STORE, 'readwrite').objectStore(STORE).delete(key); } catch (_) {} };

  // Non-security checksum of every array byte, shape and scalar. A damaged derived entry is rebuilt.
  function fingerprint(value) {
    let hash = 2166136261;
    const byte = n => { hash = Math.imul(hash ^ n, 16777619); };
    const text = s => { for (let i = 0; i < s.length; i++) { byte(s.charCodeAt(i) & 255); byte(s.charCodeAt(i) >>> 8); } byte(255); };
    function visit(v) {
      if (ArrayBuffer.isView(v) && !(v instanceof DataView)) {
        text(v.constructor.name + ':' + v.length);
        const bytes = new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
        for (let i = 0; i < bytes.length; i++) byte(bytes[i]);
      } else if (Array.isArray(v)) { text('array:' + v.length); for (const item of v) visit(item); }
      else if (v && Object.getPrototypeOf(v) === Object.prototype) {
        const keys = Object.keys(v).sort(); text('object:' + keys.length);
        for (const key of keys) { text(key); visit(v[key]); }
      } else if (typeof v === 'number' && Number.isFinite(v)) text('number:' + v);
      else throw Error('Invalid derived model');
    }
    visit(value);
    return hash >>> 0;
  }
  const ENV_BYTES = 768 * 1024 * 4 * 2, MAGIC = 'HSENV001', DELTA_MAGIC = 'HSENV002';
  async function decodeEnvironment(input) {
    let bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    const magic = String.fromCharCode(...bytes.subarray(0, 8));
    if (bytes.byteLength === ENV_BYTES + 8 && (magic === MAGIC || magic === DELTA_MAGIC)) {
      if (magic === DELTA_MAGIC) {
        // Undo the two byte predictors in reverse order. Uint8 assignment wraps exactly;
        // the resulting half-float bytes, texture dimensions and lighting are unchanged.
        const packed = bytes.subarray(8);
        for (const stride of [768 * 4, 4])
          for (let i = stride; i < packed.length; i++) packed[i] += packed[i - stride];
      }
      // Restore the original half-float bytes exactly; no quantization or change to the lighting.
      const raw = new Uint8Array(ENV_BYTES), half = ENV_BYTES / 2;
      for (let i = 0; i < half; i++) { raw[i * 2] = bytes[8 + i]; raw[i * 2 + 1] = bytes[8 + half + i]; }
      bytes = raw;
    }
    if (bytes.byteLength !== ENV_BYTES) throw Error('Invalid reflection lighting');
    if (bytes.byteOffset % 2) bytes = bytes.slice();
    return new Uint16Array(bytes.buffer, bytes.byteOffset, ENV_BYTES / 2);
  }
  const controller = new AbortController();
  // The optional device copy races the bundle. Missing/invalid cache cannot win or block the asset.
  const network = (async () => {
    const response = await fetch('./runtime/room-env.dat', {signal: controller.signal});
    if (!response.ok) throw Error('Reflection lighting unavailable');
    const bytes = new Uint8Array(await response.arrayBuffer());
    return {value: await decodeEnvironment(bytes), bytes, source: 'bundle'};
  })();
  const stored = limit(read(envKey), CACHE_WAIT_MS).then(async bytes => {
    if (!bytes) throw Error('No cached reflection lighting');
    try { return {value: await decodeEnvironment(bytes), source: 'device'}; }
    catch (error) { remove(envKey); throw error; }
  });
  const firstValid = new Promise(resolve => {
    let failed = 0;
    for (const source of [network, stored]) source.then(resolve, () => { if (++failed === 2) resolve(null); });
  });
  HSC.geo = {
    // Geometry starts after a short model-read budget, while reflection lighting still downloads.
    ready: limit(read(build), CACHE_WAIT_MS).then(value => {
      cached = value?.version === 2 && value.models && typeof value.models === 'object' ? value.models : null;
      timing('modelCache', cached ? 'hit' : 'miss');
    }),
    environmentReady: limit(firstValid, ENV_WAIT_MS).then(result => {
      controller.abort();
      HSC.geo.environment = result?.value || null;
      environmentBytes = result?.bytes || null;
      timing('environment', result ? 'shipped' : 'generated');
      timing('environmentSource', result?.source || 'generated');
      timing('environmentReady', performance.now());
    }),
    environment: null,
    use(key, compute) {
      const entry = cached?.[key];
      if (entry) {
        try { if (Number.isInteger(entry.hash) && fingerprint(entry.value) === entry.hash) return entry.value; } catch (_) {}
        timing('modelCacheInvalid', (HSC.startupTiming?.modelCacheInvalid || 0) + 1);
      }
      const value = compute();
      // These pristine copies are saved later; the game morphs its live arrays after construction.
      try { if (db) pending.set(key, structuredClone(value)); } catch (_) {}
      return value;
    },
    saveLater() {
      if (saveTimer || (!pending.size && !environmentBytes)) return;
      saveTimer = HSC.lifecycle.timeout(() => {
        saveTimer = 0;
        if (!db || HSC.executionPaused) return;
        try {
          const models = {};
          for (const [key, value] of pending) models[key] = {value, hash: fingerprint(value)};
          const transaction = db.transaction(STORE, 'readwrite'), store = transaction.objectStore(STORE);
          if (Object.keys(models).length) {
            const request = store.get(build);
            request.onsuccess = () => {
              const previous = request.result;
              store.put({version: 2, models: {...(previous?.version === 2 ? previous.models : {}), ...models}}, build);
            };
          }
          if (environmentBytes) store.put(environmentBytes, envKey);
          // Retain only this build's derived models and lighting. This database contains no saves.
          const keys = store.getAllKeys();
          keys.onsuccess = () => { for (const key of keys.result) if (key !== build && key !== envKey) store.delete(key); };
          transaction.oncomplete = () => { pending.clear(); environmentBytes = null; timing('deviceCacheSaved', performance.now()); };
          transaction.onerror = transaction.onabort = () => {};
        } catch (_) {}
      }, 2000);
    },
  };
})(globalThis.HSC || (globalThis.HSC = {}));
