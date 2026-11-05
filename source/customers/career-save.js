// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the career's save journal (docs/CAREER-SAVE-AND-QA-CONTRACT.md
// sections 3, 6, 8 and 10; owner-approved 5 November 2026).
//
// The host's storage has no transactions, so a career commit writes two journal records in turn:
//   1. copy the last committed record and apply the event in memory; check every invariant
//   2. raise the revision; write the inactive slot with a checksum, marked uncommitted
//   3. read it back and verify it; mark it committed; point at it
// On load the highest committed revision with a valid checksum that passes sanitizing wins, so an interrupted
// write always leaves the previous complete career (never a mix of the two). A record from a newer game
// version is kept untouched and never overwritten.
// The career save is separate from progress, advertising, consent and wardrobe saves.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const SCHEMA = 1;
  const KEYS = ['barber-career-j0', 'barber-career-j1'], PTR = 'barber-career-ptr';
  const checksum = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0).toString(36) + ':' + s.length; };
  // prototype keys are refused anywhere in a saved record
  function safe(v, depth = 0) {
    if (depth > 12) return false;
    if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) { if (k === '__proto__' || k === 'constructor' || k === 'prototype') return false; if (!safe(v[k], depth + 1)) return false; }
    }
    return true;
  }
  function seal(body, rev, committed) {
    const json = JSON.stringify(body);
    return { schema: SCHEMA, rev, committed, sum: checksum(json), body: json };
  }
  function open(rec) {
    if (!rec || typeof rec !== 'object') return { bad: 'missing' };
    if (rec.schema > SCHEMA) return { tooNew: true, rec };
    if (rec.schema !== SCHEMA || !Number.isSafeInteger(rec.rev) || rec.rev < 0 || typeof rec.body !== 'string') return { bad: 'shape' };
    if (checksum(rec.body) !== rec.sum) return { bad: 'checksum' };
    let body;
    try { body = JSON.parse(rec.body); } catch (e) { return { bad: 'json' }; }
    if (!safe(body)) return { bad: 'prototype' };
    return { rec, body };
  }
  // the parts of a career record: core (career.js), dir (director.js), regs (per-city regulars), active contract
  function sanitize(body) {
    const C = HSC.career;
    if (!body || typeof body !== 'object' || !body.core) return null;
    const bad = C.validate(body.core);
    if (bad.length) return null;
    const regs = body.regs && typeof body.regs === 'object' ? body.regs : {};
    for (const k of Object.keys(regs)) if (!Array.isArray(regs[k])) delete regs[k]; else regs[k] = regs[k].slice(-6);
    const out = { core: body.core, dir: body.dir && typeof body.dir === 'object' ? body.dir : HSC.director.fresh(), regs, active: body.active && body.active.id ? body.active : null };
    if (body.pop && typeof body.pop === 'object' && !Array.isArray(body.pop)) out.pop = body.pop;
    // the economy (economy.js): a damaged record is dropped, and the first commit re-migrates the mirrored coins
    const e = body.eco;
    if (e && typeof e === 'object' && Number.isSafeInteger(e.balance) && Number.isSafeInteger(e.paid) && Array.isArray(e.ledger) && Array.isArray(e.keys) && e.sources && e.sinks) out.eco = e;
    if (body.ecoLegacy) out.ecoLegacy = true;
    return out;
  }

  // storage: { get(key) -> Promise(value|null), set(key, value) -> Promise }
  function journal(storage) {
    let head = null; // { slot, rev, body }
    let lease = Symbol('lease');
    async function load() {
      const recs = await Promise.all(KEYS.map((k) => storage.get(k).catch(() => null)));
      let best = null, newer = false;
      recs.forEach((rec, slot) => {
        const o = open(rec);
        if (o.tooNew) { newer = true; return; }
        if (o.bad || !o.rec.committed) return;
        const body = sanitize(o.body);
        if (!body) return;
        if (!best || o.rec.rev > best.rev) best = { slot, rev: o.rec.rev, body };
      });
      if (newer && (!best)) return { tooNew: true };
      head = best;
      return best ? { body: best.body, rev: best.rev, newerExists: newer } : { body: null, newerExists: newer };
    }
    // apply(body) -> new body (pure); the event is applied to a copy of the last committed body
    async function commit(apply) {
      const mine = lease;
      const base = head ? JSON.parse(JSON.stringify(head.body)) : null;
      const next = apply(base);
      if (!next || !next.core) throw new Error('career-save: empty commit');
      const bad = HSC.career.validate(next.core);
      if (bad.length) throw new Error('career-save: invariant ' + bad.join(','));
      const rev = (head ? head.rev : 0) + 1, slot = head ? 1 - head.slot : 0;
      const pending = seal(next, rev, false);
      await storage.set(KEYS[slot], pending);
      if (mine !== lease) throw new Error('career-save: lease lost');
      const back = open(await storage.get(KEYS[slot]));
      if (back.bad || back.rec.rev !== rev) throw new Error('career-save: read-back failed');
      await storage.set(KEYS[slot], Object.assign({}, pending, { committed: true }));
      await storage.set(PTR, { slot, rev });
      head = { slot, rev, body: next };
      return next;
    }
    // another surface took over: stop writing (save contract section 10)
    const release = () => { lease = Symbol('lease'); };
    return { load, commit, release, current: () => (head ? head.body : null), rev: () => (head ? head.rev : 0) };
  }

  HSC.careerSave = { SCHEMA, KEYS, PTR, journal, checksum, sanitize, open };
})(globalThis.HSC || (globalThis.HSC = {}));
