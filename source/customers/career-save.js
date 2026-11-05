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
//
// Hardening (save contract section 8): records migrate one schema version at a time (deterministic and
// idempotent), every section is sanitized field by field (types, bounds, collection sizes), a record above
// 2.5 MB warns and one above 3 MB is refused before it is written, a commit whose base revision is older than the
// stored pointer is refused as stale (another surface wrote), and when the page is hidden the lease is released:
// the next write first reloads the latest committed record.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const SCHEMA = 2;
  const WARN_BYTES = 2.5 * 1024 * 1024, MAX_BYTES = 3 * 1024 * 1024;
  // one migration per schema step: MIGRATE[n] turns a schema-n body into a schema-(n+1) body
  const MIGRATE = {
    // 1 -> 2 (Wave 2): sections that schema 1 left optional get their empty defaults; nothing else changes
    1: (b) => Object.assign({ regs: {}, pop: {}, ent: [] }, b),
  };
  function migrate(body, from) {
    let b = body;
    for (let v = from; v < SCHEMA; v++) { if (!MIGRATE[v]) return null; b = MIGRATE[v](b); }
    return b;
  }
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
    if (!Number.isSafeInteger(rec.schema) || rec.schema < 1 || !Number.isSafeInteger(rec.rev) || rec.rev < 0 || typeof rec.body !== 'string') return { bad: 'shape' };
    if (checksum(rec.body) !== rec.sum) return { bad: 'checksum' };
    let body;
    try { body = JSON.parse(rec.body); } catch (e) { return { bad: 'json' }; }
    if (!safe(body)) return { bad: 'prototype' };
    if (rec.schema < SCHEMA) { body = migrate(body, rec.schema); if (!body) return { bad: 'migration' }; }
    return { rec, body };
  }
  // ---- per-field sanitizing ----
  const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const str = (v, max) => typeof v === 'string' && v.length <= max;
  const nat = (v, max) => Number.isSafeInteger(v) && v >= 0 && v <= max;
  const ID = /^[a-z0-9][a-z0-9_-]{0,31}$/;
  // regulars: per city (a stable id), at most six, each with an identity key, a seed, a person and packed grids
  function cleanRegs(r) {
    const out = {};
    if (!obj(r)) return out;
    for (const city of Object.keys(r).slice(0, 64)) {
      if (!ID.test(city) || !Array.isArray(r[city])) continue;
      const list = r[city].filter((g) => obj(g) && str(g.key, 40) && Number.isSafeInteger(g.seed) && obj(g.person) && nat(g.visits, 1e6) &&
        (g.h == null || str(g.h, 24000)) && (g.b == null || str(g.b, 24000)) && (g.u == null || str(g.u, 24000)) && (g.usual == null || str(g.usual, 60)));
      if (list.length) out[city] = list.slice(-6);
    }
    return out;
  }
  // population deficits: per city, a bounded number per group
  function cleanPop(p) {
    const out = {};
    if (!obj(p)) return out;
    for (const city of Object.keys(p).slice(0, 64)) {
      if (!ID.test(city) || !obj(p[city])) continue;
      const d = {};
      for (const g of Object.keys(p[city]).slice(0, 64)) { const v = p[city][g]; if (/^\d{1,3}$/.test(g) && typeof v === 'number' && Number.isFinite(v)) d[g] = Math.max(-2, Math.min(4, v)); }
      out[city] = d;
    }
    return out;
  }
  // the active contract: its shape and sizes (career-run.js checks that it is this career's playable contract)
  const STATES = ['offered', 'active', 'suspended', 'incomplete', 'completed'];
  function cleanActive(a) {
    if (!obj(a) || !str(a.id, 120) || !STATES.includes(a.state) || !obj(a.person) || !obj(a.start) || !str(a.start.h, 24000) || !obj(a.request)) return null;
    if (a.start.b != null && !str(a.start.b, 24000)) return null;
    if (a.work != null && !(obj(a.work) && str(a.work.h, 24000) && (a.work.b == null || str(a.work.b, 24000)))) return null;
    if (a.job != null && !nat(a.job, 1e9)) a.job = null;
    return a;
  }
  // the director's memory: bounded rings; a damaged one starts fresh (it only shapes variety)
  function cleanDir(d) {
    const D = HSC.director;
    if (!obj(d) || !Array.isArray(d.sig) || !Array.isArray(d.lanes) || !Array.isArray(d.chapterLog)) return D.fresh();
    d.sig = d.sig.filter((x) => typeof x === 'string' && x.length < 400).slice(-(D.RING || 64));
    d.lanes = d.lanes.filter((x) => typeof x === 'string' && x.length < 40).slice(-64);
    d.chapterLog = d.chapterLog.filter(obj).slice(-10);
    return d;
  }
  // the parts of a career record: core (career.js), dir (director.js), regs (per-city regulars), active contract
  function sanitize(body) {
    const C = HSC.career;
    if (!body || typeof body !== 'object' || !body.core) return null;
    const bad = C.validate(body.core);
    if (bad.length) return null;
    const out = { core: body.core, dir: cleanDir(body.dir), regs: cleanRegs(body.regs), active: cleanActive(body.active) };
    out.pop = cleanPop(body.pop);
    // the economy (economy.js): a damaged record is dropped, and the first commit re-migrates the mirrored coins
    const e = body.eco;
    if (e && typeof e === 'object' && Number.isSafeInteger(e.balance) && Number.isSafeInteger(e.paid) && Array.isArray(e.ledger) && Array.isArray(e.keys) && e.sources && e.sinks) out.eco = e;
    if (body.ecoLegacy) out.ecoLegacy = true;
    // entitlements bought with coins (item keys such as salon:part:wall:plaster); bounded by the catalog
    if (Array.isArray(body.ent)) out.ent = body.ent.filter((k) => typeof k === 'string' && k.length < 80).slice(-500);
    // branches: one per city id; a damaged look is dropped (the salon shows the neutral look), the record stays
    if (obj(body.branches)) {
      out.branches = {};
      for (const city of Object.keys(body.branches).slice(0, 64)) {
        const br = body.branches[city];
        if (!ID.test(city) || !obj(br)) continue;
        out.branches[city] = { v: nat(br.v, 99) ? br.v : 1, theme: str(br.theme, 32) ? br.theme : 'neutral', parts: obj(br.parts) ? br.parts : null, region: str(br.region, 32) ? br.region : '', objects: Array.isArray(br.objects) ? br.objects.filter((x) => str(x, 40)).slice(0, 16) : [] };
      }
    }
    // the portfolio's own section: seals, claimed reward ids and at most 24 favourite cards within their budgets;
    // a damaged card is dropped, never the career (portfolio contract section 14)
    if (obj(body.port)) {
      const P = HSC.portfolio, p = body.port, seals = {};
      if (obj(p.seals)) for (const k of Object.keys(p.seals).slice(0, 512)) if (str(k, 120) && p.seals[k] === 1) seals[k] = 1;
      let cards = Array.isArray(p.cards) ? p.cards.filter((c) => (P ? P.validCard(c) : obj(c))).slice(0, 24) : [];
      while (cards.length && JSON.stringify(cards).length > 384 * 1024) cards = cards.slice(0, -1);
      out.port = { v: 1, edition: str(p.edition, 16) ? p.edition : 'p1', seals, claimed: Array.isArray(p.claimed) ? p.claimed.filter((x) => str(x, 160)).slice(0, 512) : [], cards, migrated: p.migrated === true };
    }
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
    let released = false;
    async function commit(apply) {
      // a released journal (the page was hidden) reloads before it writes again, so it never overwrites what another
      // surface wrote meanwhile; a write is never dropped (a reward credit may arrive while an ad covers the page)
      if (released) await load2();
      const mine = lease;
      // a newer revision written by another surface: this one is stale and must reload first (section 10)
      const ptr = await storage.get(PTR).catch(() => null);
      if (head && ptr && Number.isSafeInteger(ptr.rev) && ptr.rev > head.rev) { const e = new Error('career-save: stale base revision'); e.stale = true; throw e; }
      const base = head ? JSON.parse(JSON.stringify(head.body)) : null;
      const next = apply(base);
      if (!next || !next.core) throw new Error('career-save: empty commit');
      const bad = HSC.career.validate(next.core);
      if (bad.length) throw new Error('career-save: invariant ' + bad.join(','));
      const rev = (head ? head.rev : 0) + 1, slot = head ? 1 - head.slot : 0;
      const pending = seal(next, rev, false);
      // size budget (section 4): refuse a record that would not fit, warn well before it
      const bytes = pending.body.length * 2;
      if (bytes > MAX_BYTES) { const e = new Error('career-save: record too large (' + bytes + ' bytes)'); e.tooLarge = true; throw e; }
      if (bytes > WARN_BYTES) console.warn('career-save: record is ' + bytes + ' bytes (limit ' + MAX_BYTES + ')');
      await storage.set(KEYS[slot], pending);
      if (mine !== lease) throw new Error('career-save: lease lost');
      const back = open(await storage.get(KEYS[slot]));
      if (back.bad || back.rec.rev !== rev) throw new Error('career-save: read-back failed');
      await storage.set(KEYS[slot], Object.assign({}, pending, { committed: true }));
      await storage.set(PTR, { slot, rev });
      head = { slot, rev, body: next };
      return next;
    }
    // another surface took over, or the page was hidden: stop writing until the journal is loaded again
    const release = () => { lease = Symbol('lease'); released = true; };
    const load2 = async () => { const r = await load(); released = false; return r; };
    return { load: load2, commit, release, released: () => released, current: () => (head ? head.body : null), rev: () => (head ? head.rev : 0) };
  }

  HSC.careerSave = { SCHEMA, KEYS, PTR, WARN_BYTES, MAX_BYTES, journal, checksum, sanitize, open, migrate };
})(globalThis.HSC || (globalThis.HSC = {}));
