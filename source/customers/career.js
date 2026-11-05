// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the career's state machine (docs/CAREER-MAP-LOGIC.md,
// CAREER-MODE-ARCHITECTURE.md, CAREER-SAVE-AND-QA-CONTRACT.md; owner-approved 5 November 2026).
//
// Pure logic, no screen code: every event takes a career state and returns a new one (the input is never
// changed), so a commit can validate before it writes (career-save.js) and the logic runs in unit tests.
//
//   create      choose a home (founding) city: the career begins with the 30-contract home licence
//   licence     six home chapters of five contracts; contract 30 opens the world map and World Tour 1
//   chapter     a city visit of five roles: local order, specialist, relationship, surprise, showcase
//   tours       every city in the tour's frozen roster once; tours never end (Barber Legend N)
//   complete    idempotent: a contract id completes once; replays may only raise mastery
//
// Completion is derived from position, not a growing set: a contract is done when its slot is behind the
// city's visit pointer, so the save does not grow with play (section 4 of the save contract).
// Ranks are derived from committed facts, never stored (section 2 of the save contract).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const VERSION = 1;
  const LICENCE = 30, SLOTS = 5;
  const ROLES = ['local', 'specialist', 'relationship', 'surprise', 'showcase'];
  const RANKS = ['apprentice', 'licensed', 'professional', 'specialist', 'master', 'owner', 'world', 'legend'];
  // mastery: a style, city, mode, tool or service counts as mastered at 3 stars (completion is recorded apart)
  const MASTER_STARS = 3;
  // a city is mastered after three completed chapters with a 3-star showcase in it
  const CITY_MASTER_CHAPTERS = 3;

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const int = (v) => Number.isSafeInteger(v) && v >= 0;
  function hash32(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; }

  // ---- the city registry (data; docs/CITY-CUSTOMER-VARIABILITY.md section 10) ----
  // Cities are records with stable ids. Until the owner's researched roster is supplied, a test registry may be
  // installed; the career code never depends on a particular city.
  const registry = { cities: new Map(), version: 0 };
  function setCities(list, version) {
    registry.cities = new Map(list.map((c) => [c.id, c]));
    registry.version = version | 0;
  }
  const enabledIds = () => [...registry.cities.values()].filter((c) => c.enabled !== false).map((c) => c.id).sort();

  // ---- a new career ----
  function create(cityId, seed) {
    if (!registry.cities.has(cityId)) throw new Error('career: unknown city ' + cityId);
    const s = {
      v: VERSION, rev: 0, seed: (seed >>> 0) || 1, founding: cityId, base: cityId,
      licence: { next: 0 },
      tour: null, // created when the licence completes
      current: { city: cityId, visit: 0, slot: 0, practice: false }, // the licence plays as home chapters
      cities: {},
      mastery: { style: {}, mode: {}, tool: {}, service: {}, city: {} },
      completedModes: [],
      showcases: 0,
      last: null, // the last committed completion (returned again for a duplicate event)
    };
    cityRec(s, cityId);
    return s;
  }
  function cityRec(s, id) {
    if (!s.cities[id]) s.cities[id] = { visits: 0, chapters: 0, showcaseBest: 0, established: false, estTour: 0, awards: [] };
    return s.cities[id];
  }

  // ---- where the career is ----
  function phase(s) {
    if (!s) return 'none';
    if (s.licence.next < LICENCE) return 'licence';
    if (s.current) return 'chapter';
    return 'map';
  }
  // the home licence's chapter (1-6) and slot (0-4) of the next contract
  const licencePos = (s) => ({ chapter: Math.floor(s.licence.next / SLOTS) + 1, slot: s.licence.next % SLOTS });
  // the contract position currently offered: { city, visit, slot, role, tour }
  function position(s) {
    const p = phase(s);
    if (p === 'licence') { const l = licencePos(s); return { city: s.founding, visit: l.chapter - 1, slot: l.slot, role: ROLES[l.slot], tour: 0, licence: true, chapter: l.chapter }; }
    if (p === 'chapter') return { city: s.current.city, visit: s.current.visit, slot: s.current.slot, role: ROLES[s.current.slot], tour: s.tour.n, practice: !!s.current.practice };
    return null;
  }
  // career seed + tour + city + visit + slot (section 5 of the save contract)
  function contractId(s, pos) {
    pos = pos || position(s);
    if (!pos) return null;
    return [s.seed.toString(36), pos.licence ? 'L' : 't' + pos.tour, pos.city, 'v' + pos.visit, 's' + pos.slot].join(':');
  }
  const contractSeed = (id, revision) => hash32(id + '#' + (revision | 0)) || 1;

  // ---- the map ----
  // cities still to visit in the current tour (not done, not marked not-applicable, still enabled)
  function remaining(s) {
    if (!s.tour) return [];
    return s.tour.roster.filter((id) => !s.tour.done.includes(id) && !s.tour.na.includes(id));
  }
  // every enabled city may be visited: an incomplete one advances the tour, a completed one is practice
  function selectable(s) { return phase(s) === 'map' ? enabledIds() : []; }
  function selectCity(s, cityId) {
    if (phase(s) !== 'map') return { state: s, error: 'not-on-map' };
    if (!registry.cities.has(cityId) || registry.cities.get(cityId).enabled === false) return { state: s, error: 'city-unavailable' };
    const n = clone(s);
    const practice = !remaining(n).includes(cityId);
    n.current = { city: cityId, visit: cityRec(n, cityId).visits, slot: 0, practice };
    return { state: n };
  }
  // after World Tour 1 any established branch may become the active base (cosmetic; branch plan section 8)
  function setBase(s, cityId) {
    if (!s.tour || s.tour.n < 2) return { state: s, error: 'base-locked' };
    if (!(s.cities[cityId] && s.cities[cityId].established)) return { state: s, error: 'not-established' };
    const n = clone(s); n.base = cityId; return { state: n };
  }

  // ---- completion (idempotent) ----
  // result: { id, stars (1-3), valid (meaningful work), mode, style, tools[], services[] }
  function isDone(s, id) {
    // a contract is done when its position is behind the pointer for its city
    const parts = String(id).split(':');
    if (parts.length !== 5 || parts[0] !== s.seed.toString(36)) return false;
    const city = parts[2], visit = +parts[3].slice(1), slot = +parts[4].slice(1);
    if (parts[1] === 'L') return city === s.founding && visit * SLOTS + slot < s.licence.next;
    const c = s.cities[city];
    if (!c) return false;
    if (visit < c.visits) return true;
    return !!(s.current && s.current.city === city && s.current.visit === visit && slot < s.current.slot);
  }
  function recordMastery(n, r) {
    const up = (table, key) => { if (key == null) return; table[key] = Math.max(table[key] || 0, r.stars | 0); };
    up(n.mastery.style, r.style); up(n.mastery.mode, r.mode);
    for (const t of r.tools || []) up(n.mastery.tool, t);
    for (const sv of r.services || []) up(n.mastery.service, sv);
    if (r.mode && !n.completedModes.includes(r.mode)) n.completedModes.push(r.mode);
  }
  function complete(s, r) {
    if (!r || !r.id) return { state: s, error: 'no-result' };
    if (isDone(s, r.id)) {
      // a repeated event or a replay of a passed contract: progress never moves again; better work may still
      // raise mastery; a repeat of the last event returns the result already committed
      const prior = s.last && s.last.id === r.id ? s.last : { id: r.id, replay: true };
      if (!r.valid) return { state: s, result: prior, duplicate: true };
      const n = clone(s); recordMastery(n, r); return { state: n, result: prior, duplicate: true };
    }
    const id = contractId(s);
    if (r.id !== id) return { state: s, error: 'not-current' };
    // no meaningful work: no completion, no progress; the slot stays (map logic section 5)
    if (!r.valid) return { state: s, result: { id: r.id, incomplete: true } };
    const n = clone(s), pos = position(n);
    recordMastery(n, r);
    const out = { id: r.id, stars: r.stars | 0, events: [] };
    if (pos.licence) {
      n.licence.next++;
      if (pos.slot === SLOTS - 1) { const c = cityRec(n, n.founding); c.chapters++; c.visits = Math.max(c.visits, pos.visit + 1); showcase(n, n.founding, r.stars, out, 0); }
      n.current.slot = n.licence.next % SLOTS; n.current.visit = Math.floor(n.licence.next / SLOTS);
      if (n.licence.next === LICENCE) {
        // the licence is complete: the map opens and the home city counts for World Tour 1
        n.tour = { n: 1, roster: enabledIds(), rosterVersion: registry.version, done: [n.founding], na: [] };
        if (!n.tour.roster.includes(n.founding)) n.tour.roster.push(n.founding);
        n.current = null;
        out.events.push('licence-complete');
        closeTourIfDone(n, out);
      }
    } else {
      n.current.slot++;
      if (n.current.slot === SLOTS) {
        const c = cityRec(n, pos.city);
        c.visits++; c.chapters++;
        showcase(n, pos.city, r.stars, out, n.tour.n);
        if (!pos.practice && !n.tour.done.includes(pos.city)) n.tour.done.push(pos.city);
        n.current = null;
        out.events.push('chapter-complete');
        closeTourIfDone(n, out);
      }
    }
    n.rev++;
    n.last = out;
    return { state: n, result: out };
  }
  function showcase(n, city, stars, out, tourN) {
    const c = cityRec(n, city);
    c.showcaseBest = Math.max(c.showcaseBest, stars | 0);
    n.showcases++;
    if (!c.established) { c.established = true; c.estTour = tourN; out.events.push('branch-established:' + city); }
    n.mastery.city[city] = Math.max(n.mastery.city[city] || 0, stars | 0);
  }
  // a tour closes when every roster city is done or not-applicable; the next copies the enabled roster
  function closeTourIfDone(n, out) {
    if (!n.tour || remaining(n).length) return;
    n.tour = { n: n.tour.n + 1, roster: enabledIds(), rosterVersion: registry.version, done: [], na: [] };
    out.events.push('tour-complete:' + (n.tour.n - 1));
  }

  // ---- roster changes (map logic section 13; save contract section 9) ----
  // call after the registry changes: a disabled city in the active roster becomes not-applicable
  function reconcile(s) {
    if (!s || !s.tour) return s;
    const n = clone(s), on = new Set(enabledIds());
    for (const id of n.tour.roster) if (!on.has(id) && !n.tour.done.includes(id) && !n.tour.na.includes(id)) n.tour.na.push(id);
    if (n.current && !on.has(n.current.city)) n.current.suspendedCity = true;
    const out = { events: [] };
    if (!n.current) closeTourIfDone(n, out);
    return n;
  }

  // ---- ranks (derived; map logic section 4) ----
  function stats(s) {
    const cities = Object.entries(s.cities);
    const toursDone = s.tour ? s.tour.n - 1 : 0;
    const showcaseCities = cities.filter(([, c]) => c.established).length;
    const mastered = cities.filter(([, c]) => c.chapters >= CITY_MASTER_CHAPTERS && c.showcaseBest >= MASTER_STARS).length;
    const styleMasteries = Object.values(s.mastery.style).filter((v) => v >= MASTER_STARS).length;
    const branches = showcaseCities;
    return { toursDone, showcaseCities, showcases: s.showcases, mastered, styleMasteries, branches, modes: s.completedModes.length };
  }
  // specialistModes: the specialist modes currently eligible for career play
  function rank(s, specialistModes) {
    if (!s) return null;
    const st = stats(s), size = Math.max(1, enabledIds().length), three = Math.min(3, size);
    const spec = (specialistModes || []).every((m) => s.completedModes.includes(m));
    if (st.toursDone >= 2) return { id: 'legend', legend: st.toursDone - 1 };
    if (st.toursDone >= 1) return { id: 'world' };
    if (st.branches >= three && st.mastered >= three && st.styleMasteries >= 12 && spec && st.showcaseCities >= three && s.licence.next >= LICENCE) return { id: 'owner' };
    if (st.mastered >= three && st.styleMasteries >= 12 && spec && st.showcaseCities >= three && s.licence.next >= LICENCE) return { id: 'master' };
    if (spec && st.showcaseCities >= three && s.licence.next >= LICENCE) return { id: 'specialist' };
    if (st.showcaseCities >= three && s.licence.next >= LICENCE) return { id: 'professional' };
    if (s.licence.next >= LICENCE) return { id: 'licensed' };
    return { id: 'apprentice' };
  }

  // ---- invariants (checked before every commit) ----
  function validate(s) {
    const bad = [];
    if (!s || s.v !== VERSION) bad.push('version');
    if (!int(s.rev)) bad.push('rev');
    if (!registry.cities.has(s.founding) && !(s.cities && s.cities[s.founding])) bad.push('founding');
    if (!int(s.licence && s.licence.next) || s.licence.next > LICENCE) bad.push('licence');
    if (s.licence.next < LICENCE && (!s.current || s.current.city !== s.founding)) bad.push('licence-city');
    if (s.licence.next >= LICENCE && !s.tour) bad.push('tour-missing');
    if (s.tour) {
      if (!int(s.tour.n) || s.tour.n < 1) bad.push('tour-n');
      for (const id of s.tour.done) if (!s.tour.roster.includes(id)) bad.push('done-outside-roster:' + id);
    }
    if (s.current && (!int(s.current.slot) || s.current.slot >= SLOTS)) bad.push('slot');
    return bad;
  }

  HSC.career = {
    VERSION, LICENCE, SLOTS, ROLES, RANKS, MASTER_STARS,
    setCities, enabledIds, create, phase, position, contractId, contractSeed, remaining, selectable, selectCity, setBase,
    isDone, complete, reconcile, rank, stats, validate, hash32, clone,
    city: (id) => registry.cities.get(id) || null,
  };
})(globalThis.HSC || (globalThis.HSC = {}));
