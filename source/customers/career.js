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
  // UNSET: the placeholder home city of a career whose founding city is not chosen yet. The journal and wallet are
  // created at startup (economy), before the player opens Career; the first Career visit asks for the city and
  // `found` renames the placeholder. Careers from the one-city build used the same id, so they migrate the same way.
  const UNSET = 'home';
  function create(cityId, seed) {
    if (cityId !== UNSET && !registry.cities.has(cityId)) throw new Error('career: unknown city ' + cityId);
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
    const c = s.cities[id];
    // the four-part city mastery (branch plan section 10), bounded: 3-star styles cut here, the modes, tools and
    // services used validly here, returning-regular visits here, and the tours with a 3-star showcase here
    if (!Array.isArray(c.styles)) c.styles = [];
    if (!Number.isSafeInteger(c.regVisits)) c.regVisits = 0;
    if (!Number.isSafeInteger(c.gold)) c.gold = 0;
    return c;
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

  // ---- the founding city (map logic section 3, phase A) ----
  const needsFounding = (s) => !!s && s.founding === UNSET && !registry.cities.has(UNSET);
  // choose the founding city: the placeholder becomes the chosen city everywhere it is recorded. A career from the
  // one-city build also gets its open tour's full roster here (defect D2): its tour number is kept, so no rank or
  // Legend number is lost, and the roster can no longer close a whole tour with one chapter.
  function found(s, cityId) {
    if (!needsFounding(s)) return { state: s, error: 'already-founded' };
    const rec = registry.cities.get(cityId);
    if (!rec || rec.enabled === false || cityId === UNSET) return { state: s, error: 'city-unavailable' };
    const n = clone(s), sw = (id) => (id === UNSET ? cityId : id), uniq = (a) => [...new Set(a.map(sw))];
    const old = n.cities[UNSET];
    delete n.cities[UNSET];
    const c = cityRec(n, cityId);
    if (old) {
      c.visits = Math.max(c.visits, old.visits); c.chapters += old.chapters; c.showcaseBest = Math.max(c.showcaseBest, old.showcaseBest);
      if (old.established && !c.established) { c.established = true; c.estTour = old.estTour; }
      c.awards = c.awards.concat(old.awards || []);
      for (const x of old.styles || []) if (!c.styles.includes(x) && c.styles.length < 64) c.styles.push(x);
      c.regVisits += old.regVisits | 0; c.gold += old.gold | 0;
    }
    if (UNSET in n.mastery.city) { n.mastery.city[cityId] = Math.max(n.mastery.city[cityId] || 0, n.mastery.city[UNSET]); delete n.mastery.city[UNSET]; }
    n.founding = cityId; n.base = sw(n.base);
    if (n.current) n.current.city = sw(n.current.city);
    if (n.tour) {
      n.tour.done = uniq(n.tour.done); n.tour.na = uniq(n.tour.na).filter((id) => id !== cityId); n.tour.roster = uniq(n.tour.roster);
      if ((n.tour.rosterVersion | 0) < registry.version) {
        n.tour.roster = enabledIds();
        if (!n.tour.roster.includes(cityId)) n.tour.roster.push(cityId);
        n.tour.rosterVersion = registry.version;
        n.tour.done = n.tour.done.filter((id) => n.tour.roster.includes(id));
        n.tour.na = [];
        n.tour.migrated = true;
      }
    }
    n.last = null; // its ids named the placeholder
    n.rev++;
    return { state: n };
  }

  // ---- the map ----
  // cities still to visit in the current tour (not done, not marked not-applicable, still enabled)
  function remaining(s) {
    if (!s.tour) return [];
    return s.tour.roster.filter((id) => !s.tour.done.includes(id) && !s.tour.na.includes(id));
  }
  // every enabled city may be visited: an incomplete one advances the tour, a completed one is practice
  function selectable(s) { return phase(s) === 'map' && !needsFounding(s) ? enabledIds() : []; }
  function selectCity(s, cityId) {
    if (phase(s) !== 'map') return { state: s, error: 'not-on-map' };
    if (needsFounding(s)) return { state: s, error: 'needs-founding' };
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
    if (r.mode && !n.completedModes.includes(r.mode)) n.completedModes.push(r.mode);
  }
  // what a valid job in a city adds to that city's mastery record
  function cityWork(n, city, r) {
    const c = cityRec(n, city);
    if ((r.stars | 0) >= MASTER_STARS && r.style != null && !c.styles.includes(r.style) && c.styles.length < 64) c.styles.push(String(r.style));
    if (r.regular) c.regVisits++;
  }
  // city mastery: every part complete (a city stays playable forever after; mastery adds no power)
  const MASTERY_NEED = { chapters: CITY_MASTER_CHAPTERS, styles: 4, regVisits: 2 };
  function cityMastery(s, id) {
    const c = s.cities[id];
    if (!c) return { completion: 0, style: 0, relationship: 0, all: false };
    const part = (v, need) => Math.max(0, Math.min(1, (v | 0) / need));
    const out = {
      completion: c.showcaseBest >= MASTER_STARS ? part(c.chapters, MASTERY_NEED.chapters) : Math.min(0.99, part(c.chapters, MASTERY_NEED.chapters)),
      style: part((c.styles || []).length, MASTERY_NEED.styles),
      relationship: part(c.regVisits, MASTERY_NEED.regVisits),
    };
    out.all = out.completion >= 1 && out.style >= 1 && out.relationship >= 1;
    return out;
  }
  // the branch's state (branch plan section 4): unvisited, visiting, established, growing, mastered, legend
  function branchState(s, id) {
    const c = s.cities[id];
    if (!c || (!c.visits && !c.chapters && !(s.current && s.current.city === id))) return 'unvisited';
    if (!c.established) return 'visiting';
    const m = cityMastery(s, id);
    if (m.all && (c.gold | 0) >= 3) return 'legend';
    if (m.all) return 'mastered';
    return c.chapters > 1 ? 'growing' : 'established';
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
    cityWork(n, pos.city, r);
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
    // a 3-star showcase in a new tour counts toward the Legend branch (one per tour, so it stays bounded)
    if ((stars | 0) >= MASTER_STARS && c.goldTour !== tourN) { c.gold = (c.gold | 0) + 1; c.goldTour = tourN; }
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
    // a career still on the placeholder city keeps its tour untouched until `found` migrates it
    if (!s || !s.tour || needsFounding(s)) return s;
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
    const mastered = cities.filter(([id]) => cityMastery(s, id).all).length;
    const styleMasteries = Object.values(s.mastery.style).filter((v) => v >= MASTER_STARS).length;
    // the founding city is the home salon (branch plan sections 3 and 5); a branch is a city beyond it
    const branches = cities.filter(([id, c]) => c.established && id !== s.founding).length;
    return { toursDone, showcaseCities, showcases: s.showcases, mastered, styleMasteries, branches, modes: s.completedModes.length };
  }
  // specialistModes: the specialist modes currently eligible for career play.
  // An earned rank is kept (map logic section 4): a mode added later, or a city disabled, never demotes a player;
  // the highest rank reached is saved as `rankBest` and wins over a lower computed rank.
  function rank(s, specialistModes) {
    if (!s) return null;
    const now = rankNow(s, specialistModes), best = Number.isSafeInteger(s.rankBest) ? s.rankBest : 0;
    return RANKS.indexOf(now.id) >= best ? now : { id: RANKS[Math.min(best, RANKS.indexOf('owner'))] };
  }
  // the rank to save after a commit (the index of the highest rank reached)
  function rankIndex(s, specialistModes) { return Math.max(Number.isSafeInteger(s.rankBest) ? s.rankBest : 0, RANKS.indexOf(rankNow(s, specialistModes).id)); }
  function rankNow(s, specialistModes) {
    const st = stats(s), size = Math.max(1, enabledIds().length), three = Math.min(3, size), branchesNeeded = Math.min(3, Math.max(1, size - 1));
    const spec = (specialistModes || []).every((m) => s.completedModes.includes(m));
    if (st.toursDone >= 2) return { id: 'legend', legend: st.toursDone - 1 };
    if (st.toursDone >= 1) return { id: 'world' };
    if (st.branches >= branchesNeeded && st.mastered >= three && st.styleMasteries >= 12 && spec && st.showcaseCities >= three && s.licence.next >= LICENCE) return { id: 'owner' };
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
    if (s.rankBest != null && (!int(s.rankBest) || s.rankBest >= RANKS.length)) bad.push('rank-best');
    return bad;
  }

  // ---- regulars (director section 12): the relationship stage from completed visits ----
  const REG_STAGES = [['signature', 7], ['trusted', 4], ['familiar', 2], ['recognized', 1]];
  const regularStage = (visits) => { for (const [id, n] of REG_STAGES) if ((visits | 0) >= n) return id; return null; };

  HSC.career = {
    regularStage, REG_STAGES, cityMastery, branchState, MASTERY_NEED,
    VERSION, LICENCE, SLOTS, ROLES, RANKS, MASTER_STARS,
    UNSET, needsFounding, found,
    setCities, enabledIds, create, phase, position, contractId, contractSeed, remaining, selectable, selectCity, setBase,
    isDone, complete, reconcile, rank, rankIndex, stats, validate, hash32, clone,
    city: (id) => registry.cities.get(id) || null,
  };
})(globalThis.HSC || (globalThis.HSC = {}));
