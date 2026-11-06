// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; plan Wave 4, docs/TOOL-ASMR-AUDIO-CONTRACT.md): the one audio engine
// for everything outside the frozen engine's clipper motor. One AudioContext, one master gain into a limiter, one
// cached noise buffer per recipe (nothing allocated per pointer sample), and variation seeded from
// toolId + eventSequence + layer, so a recording is reproducible and audio can never touch the simulation.
//
// Layers (contract section 5): mechanism and contact may sound without a state change; `result` is reachable only
// through effect(), which refuses a record with no committed delta.
//
// 100% original procedural Web Audio: no files, no third-party recordings (source type: original-procedural).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const view = () => { try { return globalThis.skinFadeStudio.getView(); } catch (e) { return null; } };
  const A = { ctx: null, master: null, limiter: null, buses: {}, bufs: new Map(), curves: new Map(), live: new Set(), acc: {} };
  const stats = { contexts: 0, buffers: 0, voices: 0, peakVoices: 0, mechanism: 0, contact: 0, result: 0, dropped: 0, refused: 0, byTool: {} };
  const MAX_VOICES = 24;

  // the context, created once on the first audible use; null while muted or paused (ui sounds ignore the pause)
  function ctx(o) {
    const v = view();
    if (!v || !v.audio || (v.paused && !(o && o.ui))) return null;
    if (!A.ctx) {
      const C = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!C) return null;
      A.ctx = new C(); stats.contexts++;
      A.master = A.ctx.createGain();
      // a limiter, so overlapping layers never clip
      const L = A.limiter = A.ctx.createDynamicsCompressor();
      L.threshold.value = -6; L.knee.value = 0; L.ratio.value = 20; L.attack.value = 0.002; L.release.value = 0.09;
      A.master.connect(L); L.connect(A.ctx.destination);
    }
    if (A.ctx.state === 'suspended') A.ctx.resume().catch(() => {});
    A.master.gain.value = typeof v.volume === 'number' ? v.volume : 1;
    return A.ctx;
  }
  // a named sub-mix (tools, ui, reveal) with its own level into the master
  function bus(name, level) {
    const c = ctx({ ui: true });
    if (!c) return null;
    let b = A.buses[name];
    if (!b) { b = A.buses[name] = c.createGain(); b.connect(A.master); }
    b.gain.value = level;
    return b;
  }

  // ---- seeded variation ----
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); return (h ^ (h >>> 13)) >>> 0; };
  const unit = (tool, seq, layer) => hash(tool + ':' + seq + ':' + layer) / 4294967296;
  const between = (lo, hi, tool, seq, layer) => lo + (hi - lo) * unit(tool, seq, layer);
  const lcg = (seed) => { let a = seed >>> 0 || 1; return () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; }; };

  // ---- cached material ----
  // recipe: 'white' (a long plain noise) or 'grain' (the granular bite of blades through strands)
  function noiseBuffer(c, recipe) {
    const k = recipe + ':' + c.sampleRate;
    let b = A.bufs.get(k);
    if (b) return b;
    b = c.createBuffer(1, Math.round(c.sampleRate * 2), c.sampleRate);
    const d = b.getChannelData(0), R = lcg(hash(recipe));
    if (recipe === 'grain') for (let i = 0; i < d.length; i++) d[i] = (R() * 2 - 1) * (Math.floor(i / 70) % 3 === 0 ? 1.4 : 0.55 + 0.45 * R());
    else for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1;
    A.bufs.set(k, b); stats.buffers = A.bufs.size;
    return b;
  }
  // envelopes are cached curves, applied by a gain node: a new sound costs a few nodes, never a new buffer
  const SHAPES = {
    fall: (u) => 1 - u, arch: (u) => Math.sin(Math.PI * u), fall2: (u) => Math.pow(1 - u, 2), fall15: (u) => Math.pow(1 - u, 1.5),
    snap: (u) => Math.pow(1 - u, 1.6) * (u < 0.04 ? u / 0.04 : 1), tick: (u) => Math.pow(1 - u, 2.5),
  };
  function curve(shape, gain) {
    const k = shape + ':' + gain.toFixed(3);
    let a = A.curves.get(k);
    if (a) return a;
    a = new Float32Array(32);
    const f = SHAPES[shape] || SHAPES.fall;
    for (let i = 0; i < a.length; i++) a[i] = f(i / (a.length - 1)) * gain;
    if (A.curves.size > 256) A.curves.clear();
    A.curves.set(k, a);
    return a;
  }

  // ---- voices ----
  function track(src, nodes) {
    A.live.add(src); stats.voices = A.live.size; if (stats.voices > stats.peakVoices) stats.peakVoices = stats.voices;
    src.onended = () => { A.live.delete(src); stats.voices = A.live.size; for (const n of nodes) { try { n.disconnect(); } catch (e) {} } };
  }
  const room = () => { if (A.live.size < MAX_VOICES) return true; stats.dropped++; return false; };
  // one filtered noise burst. o: { len, type, f, q, gain, shape, at, sweep, recipe, seed: [tool, seq, layer], rate }
  function noise(o) {
    const c = ctx(), out = c && bus('tools', 0.7);
    if (!c || !out || !room()) return;
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (o.at || 0), len = Math.max(0.004, o.len);
    const seed = o.seed || ['-', 0, 'n'];
    s.buffer = noiseBuffer(c, o.recipe || 'white');
    s.playbackRate.value = (o.rate || 1) * between(0.96, 1.04, seed[0], seed[1], seed[2]);
    fl.type = o.type || 'bandpass'; fl.frequency.setValueAtTime(o.f, t);
    if (o.sweep) fl.frequency.exponentialRampToValueAtTime(o.sweep, t + len);
    fl.Q.value = o.q || 0.7;
    g.gain.setValueCurveAtTime(curve(o.shape || 'fall', o.gain), t, len);
    s.connect(fl).connect(g).connect(out);
    track(s, [s, fl, g]);
    s.start(t, unit(seed[0], seed[1], seed[2] + 'o') * 1.6, len + 0.02);
  }
  function tone(o) {
    const c = ctx(), out = c && bus('tools', 0.7);
    if (!c || !out || !room()) return;
    const n = c.createOscillator(), g = c.createGain(), t = c.currentTime + (o.at || 0), len = o.len;
    n.type = o.type || 'sine'; n.frequency.setValueAtTime(o.f, t);
    if (o.f2) n.frequency.exponentialRampToValueAtTime(o.f2, t + len);
    g.gain.setValueAtTime(o.gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    n.connect(g).connect(out);
    track(n, [n, g]);
    n.start(t); n.stop(t + len + 0.02);
  }

  // ---- the tool sounds ----
  // mechanism and contact: what the tool itself does, whether or not it changed anything
  const MECH = {
    bottle: (q) => tone({ f: 620, len: 0.04, gain: 0.03, at: 0, f2: 480, seed: q }),
    trigger: (q) => { noise({ len: 0.012, type: 'highpass', f: 2600, gain: 0.3, seed: q }); },
    pump: (q) => { noise({ len: 0.02, type: 'bandpass', f: 900, q: 2, gain: 0.3, seed: q }); noise({ len: 0.02, type: 'bandpass', f: 1400, q: 2, gain: 0.2, at: 0.09, seed: q }); },
    towel: (q) => { noise({ len: 0.6, type: 'lowpass', f: 900, gain: 0.4, shape: 'arch', seed: q }); noise({ len: 1.6, type: 'bandpass', f: 5200, q: 0.9, gain: 0.06, shape: 'arch', at: 0.3, seed: q }); },
    cloth: (q) => noise({ len: 0.28, type: 'lowpass', f: 700, gain: 0.16, shape: 'arch', seed: q }),
    rub: (q) => noise({ len: 0.22, type: 'lowpass', f: between(600, 900, q[0], q[1], 'f'), q: 0.8, gain: 0.14, shape: 'arch', seed: q }),
    zip: (q) => noise({ len: 0.09, type: 'bandpass', f: 3800, q: 3, gain: 0.3, shape: 'arch', sweep: 6800, seed: q }),
    fire: (q) => noise({ len: 0.35, type: 'lowpass', f: 1400, gain: 0.3, shape: 'arch', seed: q }),
    whir: (q) => { tone({ f: 210, len: 0.18, gain: 0.03, type: 'sawtooth', seed: q }); noise({ len: 0.18, type: 'bandpass', f: 4200, q: 2, gain: 0.05, seed: q }); },
    puff: (q) => noise({ len: 0.3, type: 'lowpass', f: 1800, q: 0.6, gain: 0.3, shape: 'fall2', seed: q }),
    bristle: (q) => noise({ len: 0.25, type: 'bandpass', f: 3000, q: 0.8, gain: 0.07, shape: 'arch', seed: q }),
    crack: (q) => { for (const at of [0, 0.07, 0.13]) noise({ len: 0.012, type: 'highpass', f: 1800, q: 0.6, gain: 0.6, at, seed: [q[0], q[1], q[2] + at] }); },
    mineral: (q) => noise({ len: 0.16, type: 'bandpass', f: 2200, q: 1.5, gain: 0.05, shape: 'arch', seed: q }),
    snipClick: (q, on) => {
      if (!on) noise({ len: 0.04, type: 'bandpass', f: 7400, q: 1.6, gain: 0.22, shape: 'tick', seed: q });
      noise({ len: 0.007, type: 'highpass', f: 5000, gain: on ? 0.45 : 0.3, at: on ? 0.07 : 0.03, seed: q });
      const at = 0.07;
      for (const [f, g] of [[3150, 0.035], [4720, 0.022]]) tone({ f: f * between(0.98, 1.02, q[0], q[1], 'r' + f), len: 0.09, gain: g, at, seed: q });
    },
  };
  // result: only ever from a committed positive effect
  const RESULT = {
    scissors: (q, load) => noise({ len: 0.085, type: 'bandpass', f: 6200, q: 1.1, gain: 0.55 * load, shape: 'snap', recipe: 'grain', seed: q }),
    razor: (q, load) => noise({ len: 0.09, type: 'bandpass', f: between(3200, 3800, q[0], q[1], 'f'), q: 2.4, gain: 0.28 * load, shape: 'arch', recipe: 'grain', seed: q }),
    foil: (q, load) => { for (let i = 0; i < 3; i++) noise({ len: 0.012, type: 'highpass', f: 5200, q: 0.8, gain: 0.3 * load, at: between(0, 0.09, q[0], q[1], 'c' + i), seed: [q[0], q[1], q[2] + i] }); },
    spray: (q, load) => { noise({ len: 0.34, type: 'highpass', f: 4200, q: 0.7, gain: 0.2 * load, shape: 'fall15', seed: q }); },
    towel: (q, load) => noise({ len: 0.4, type: 'lowpass', f: 1100, gain: 0.22 * load, shape: 'arch', seed: q }),
    shavingSoap: (q, load) => noise({ len: 0.16, type: 'lowpass', f: 1000, q: 1, gain: 0.2 * load, shape: 'arch', seed: q }),
    shavingCream: (q, load) => noise({ len: 0.22, type: 'lowpass', f: 800, q: 1.3, gain: 0.26 * load, shape: 'arch', at: 0.05, seed: q }),
    lather: (q, load) => { noise({ len: 0.12, type: 'bandpass', f: between(1500, 2300, q[0], q[1], 'f'), q: 1.5, gain: 0.18 * load, shape: 'arch', seed: q }); for (let i = 0; i < 3; i++) tone({ f: between(700, 1600, q[0], q[1], 'b' + i), len: 0.03, gain: 0.03 * load, at: between(0, 0.1, q[0], q[1], 'a' + i), f2: 1400, seed: q }); },
    beardOil: (q, load) => { for (let i = 0; i < 2; i++) tone({ f: between(900, 1500, q[0], q[1], 'd' + i), len: 0.05, gain: 0.05 * load, at: i * 0.06, f2: 500, seed: q }); },
    beardBalm: (q, load) => noise({ len: 0.2, type: 'lowpass', f: 620, q: 1.4, gain: 0.24 * load, shape: 'arch', seed: q }),
    coldTowel: (q, load) => noise({ len: 0.3, type: 'lowpass', f: 1500, gain: 0.2 * load, shape: 'arch', seed: q }),
    alum: (q, load) => noise({ len: 0.18, type: 'bandpass', f: 2600, q: 1.2, gain: 0.12 * load, shape: 'arch', recipe: 'grain', seed: q }),
    aftershave: (q, load) => { noise({ len: 0.45, type: 'highpass', f: 2500, gain: 0.35 * load, shape: 'fall15', seed: q }); for (let i = 0; i < 6; i++) tone({ f: between(1800, 3400, q[0], q[1], 'p' + i), len: 0.05, gain: 0.04 * load, at: 0.05 + i * 0.05, seed: q }); },
    massage: (q, load) => noise({ len: 0.22, type: 'lowpass', f: 480, gain: 0.2 * load, shape: 'arch', seed: q }),
    talc: (q, load) => noise({ len: 0.2, type: 'bandpass', f: 3400, q: 0.8, gain: 0.16 * load, shape: 'arch', recipe: 'grain', seed: q }),
    pomade: (q, load) => noise({ len: 0.15, type: 'lowpass', f: 700, q: 1.2, gain: 0.2 * load, shape: 'arch', seed: q }),
    threading: (q, load) => { for (let i = 0; i < 3; i++) noise({ len: 0.01, type: 'highpass', f: 3200, gain: 0.3 * load, at: i * 0.03, seed: [q[0], q[1], q[2] + i] }); },
    singe: (q, load) => noise({ len: 0.18, type: 'highpass', f: 6000, q: 0.6, gain: 0.12 * load, seed: q }),
    nose: (q, load) => { for (let i = 0; i < 2; i++) noise({ len: 0.012, type: 'bandpass', f: 5200, q: 2, gain: 0.2 * load, at: i * 0.05, seed: [q[0], q[1], q[2] + i] }); },
  };
  // the real quantities behind each tool's load, and how much change must add up before the next accent
  const MAGNITUDE = {
    scissors: (e) => [Math.min(1, e.hairCells / 40), 0],
    razor: (e) => [Math.min(1, (e.hairCells + e.foamRemoved) / 12), 0.5],
    foil: (e) => [Math.min(1, e.hairCells / 12), 0.4],
    lather: (e) => [Math.min(1, e.foamMade / 200000), 0.5],
    talc: (e) => [Math.min(1, -(e.perFieldDeltas.debris || 0) / 8), 0.5],
    singe: (e) => [Math.min(1, e.removedLengthQuanta / 200), 0.5],
    nose: (e) => [Math.min(1, e.removedLengthQuanta / 300), 0.2],
    threading: (e) => [Math.min(1, e.hairCells / 6), 0.3],
    massage: (e) => [Math.min(1, (e.perFieldDeltas.relax || 0) / 600), 0.6],
    pomade: (e) => [Math.min(1, (e.perFieldDeltas.pomade || 0) / 10), 0.5],
  };
  const qOf = (e) => [e.toolId, e.eventSequence, 'result'];

  // a committed effect record. A record without a positive delta gets no result layer, whatever asked for it.
  function effect(e) {
    if (!e || !e.changed) { stats.refused++; return false; }
    const play = RESULT[e.toolId];
    if (!play) return false;
    const [mag, every] = (MAGNITUDE[e.toolId] || ((r) => [Math.min(1, (r.changedCount || 1) / 60), 0.4]))(e);
    A.acc[e.toolId] = (A.acc[e.toolId] || 0) + mag;
    if (A.acc[e.toolId] < every) return false; // a deterministic amount of real change between accents
    A.acc[e.toolId] = 0;
    stats.result++;
    stats.byTool[e.toolId] = (stats.byTool[e.toolId] || 0) + 1;
    play(qOf(e), Math.sqrt(Math.max(0, Math.min(1, mag))));
    return true;
  }
  function mechanism(name, q, arg) {
    stats.mechanism++;
    const f = MECH[name];
    if (f) f(q || [name, 0, 'mech'], arg);
  }
  // tool switch, pause, backgrounding, customer exit: everything scheduled stops, and nothing is replayed later
  function stop() {
    for (const s of A.live) { try { s.onended = null; s.stop(); s.disconnect(); } catch (e) {} }
    A.live.clear(); stats.voices = 0; A.acc = {};
  }
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') stop(); });
  addEventListener('pagehide', stop);

  HSC.audio = { ctx, bus, noise, tone, effect, mechanism, stop, stats: () => Object.assign({}, stats, { live: A.live.size }), noiseBuffer: (r) => { const c = ctx({ ui: true }); return c ? noiseBuffer(c, r || 'white') : null; }, seeded: between };
})(globalThis.HSC || (globalThis.HSC = {}));
