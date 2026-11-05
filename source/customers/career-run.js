// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the career in the game (docs/CAREER-MAP-LOGIC.md sections 5, 10, 12;
// CAREER-SAVE-AND-QA-CONTRACT.md section 7; owner-approved 5 November 2026).
//
//   play      makes sure a career exists and a contract is offered (generated, then committed to the journal
//             before the customer is shown), then seats that customer
//   seat      the contract supplies the person, the starting hair and beard, the request and the services
//   done      at the reveal: one-star valid work completes the contract (idempotent), mastery and regulars are
//             recorded, the director learns the result, and the next contract is generated and committed
//   resume    an offered or active contract survives a restart exactly (it is saved whole)
// The career save is its own journal (career-save.js); nothing here touches coins, prices or advertising.
//
// Cities: the 36-city registry (cities.js), every city on the neutral population table until its research lands.
// A career is created at startup on a placeholder home city (the economy needs the journal); the first Career visit
// asks for the founding city (found), and each finished chapter returns to the world map for the player's choice.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio;
  const pack = (a) => HSC.gridPack(a), unpack = (s, max) => (typeof s === 'string' ? HSC.gridUnpack(s, max) : null);
  const BTOP = () => (HSC.BEARD_MM ? HSC.BEARD_MM.length - 1 : 16);
  const run = { j: null, body: null, catalog: null, ready: false, busy: null };
  const C = () => HSC.career, D = () => HSC.director;
  const SPECIALIST = () => D().SPECIALIST.filter((m) => HSC.modes && HSC.modes.unlocked(m));

  async function init(client) {
    C().setCities(HSC.CITIES || [], HSC.CITIES_VERSION || 1);
    run.j = HSC.careerSave.journal({
      get: (k) => client.loadProgress(k, null),
      set: (k, v) => client.saveProgress(k, v),
    });
    const r = await run.j.load();
    if (r.tooNew) { run.tooNew = true; return; }
    run.body = r.body ? Object.assign({ pop: {}, regs: {} }, r.body) : null;
    if (run.body && run.body.core) run.body.core = C().reconcile(run.body.core);
    // a career from before the portfolio: its sets are inferred from existing facts, once (portfolio section 14)
    if (run.body && !run.body.port && HSC.portfolio && !C().needsFounding(run.body.core)) await commit((b) => { const body = JSON.parse(JSON.stringify(b)); HSC.portfolio.settle(body, true); return body; });
    if (run.body && !activeOk(run.body)) {
      console.warn('career: the saved contract was damaged; a fresh contract for the same slot replaces it');
      await commit((b) => { const body = JSON.parse(JSON.stringify(b)); body.active = null; return withNextContract(body); });
    }
    if (!run.body && E()) {
      // Establish the journal and signed wallet during startup, not only after the player first opens Career.
      // Orders and every standalone mode therefore use the same ledger, bills and idempotency from customer one.
      // the founding city is the player's choice on their first Career visit (map logic phase A)
      const seed = (Math.random() * 4294967296) >>> 0 || 1;
      await commit(() => withNextContract(withEco({ core: C().create(C().UNSET, seed), dir: D().fresh(), regs: {}, pop: {}, active: null })));
      mirror();
    } else if (run.body && !run.body.eco && E()) await commit((b) => withEco(b));
    run.ready = !E() || !!run.body;
  }
  // ---- the economy (economy.js) lives in the same journal, so a job, its milestones and the next contract
  // land in one commit; the first career body migrates the progress save's coins and level (never paid twice) ----
  const E = () => HSC.economy;
  function withEco(b) {
    if (b.eco || !E()) return b;
    const d = (M() && M().data) || {};
    const body = Object.assign({}, b);
    body.eco = E().migrate(E().fresh(), { coins: d.coins || 0, level: M() && M().level ? M().level() : 1 });
    body.ecoLegacy = (d.cuts || 0) > 0; // an existing player has had a first haircut already
    return body;
  }
  // the progress save mirrors the balance (not below zero) so other builds and the fallback show the same coins
  function mirror() { const d = M() && M().data; if (d && run.body && run.body.eco) { d.coins = Math.max(0, run.body.eco.balance); M().save(); } }
  function ecoCommit(fn) {
    let out = null;
    return commit((b) => { const body = JSON.parse(JSON.stringify(withEco(b))); const r = fn(body.eco); out = r; if (r && r.eco) body.eco = r.eco; return body; }).then(() => { mirror(); return out; });
  }
  HSC.econ = {
    ready: () => !!(run.ready && run.body && run.body.eco && E()),
    balance: () => (run.body && run.body.eco ? run.body.eco.balance : 0),
    state: () => run.body && run.body.eco,
    earn: (key, cat, n) => ecoCommit((eco) => E().apply(eco, { key, type: 'earn', cat, amount: Math.max(0, Math.round(n)) })),
    spend: (key, cat, price) => ecoCommit((eco) => E().buy(eco, key, cat, price)).then((r) => !!(r && !r.error)),
    // a purchase and what it buys land in one journal commit (implementation contract section 4): the item key is
    // kept in the career's entitlement list, so the shop can never lose a paid item or keep an unpaid one
    buyItem: (key, cat, price) => {
      let out = null;
      return commit((b) => {
        const body = JSON.parse(JSON.stringify(withEco(b)));
        const r = E().buy(body.eco, key, cat, price);
        out = r;
        if (r.error) return body;
        if (!r.duplicate) body.eco = r.eco;
        const ent = (body.ent = Array.isArray(body.ent) ? body.ent : []);
        if (!ent.includes(key)) ent.push(key);
        // a bought wish is done
        if (body.wish) for (const k of Object.keys(body.wish)) if (body.wish[k] && body.wish[k].key === key) body.wish[k] = null;
        return body;
      }).then(() => { mirror(); return !!(out && !out.error); });
    },
    // a branch fit-out stage: the same four prices in every city; payment and stage land in one commit
    buyFit: (city) => {
      let out = false;
      return commit((b) => {
        const body = JSON.parse(JSON.stringify(withEco(b))), br = body.branches && body.branches[city], stage = br ? br.fit | 0 : 9;
        if (!br || stage >= E().CONFIG.salon.length) return body;
        const r = E().buy(body.eco, 'branch:' + city + ':' + (stage + 1), 'branch', E().CONFIG.salon[stage]);
        if (r.error || r.duplicate) return body;
        body.eco = r.eco; br.fit = stage + 1; out = true;
        return body;
      }).then(() => { mirror(); syncLook(); return out; });
    },
    owns: (key) => !!(run.body && Array.isArray(run.body.ent) && run.body.ent.includes(key)),
    entitlements: () => (run.body && Array.isArray(run.body.ent) ? run.body.ent.slice() : []),
    // until the career journal has loaded (or failed to), coin credits wait so a startup write cannot be lost
    starting: () => !run.initDone,
    payJob: (key, job) => ecoCommit((eco) => {
      const r = E().payJob(eco, key, job);
      // the first paid haircut pays its milestone on every path, not only in Career (balance model section 9)
      if (!r.error && !r.duplicate && r.eco.paid === 1 && !(run.body && run.body.ecoLegacy)) {
        const m = E().payMilestones(r.eco, [['first-haircut', E().CONFIG.milestones.firstHaircut]]);
        r.eco = m.eco; if (m.paid.length) run.milestones = m.paid;
      }
      return r;
    }),
    triple: (key, tip) => ecoCommit((eco) => E().tripleTip(eco, key, tip)),
    // the shift's highlighted modes, among those unlocked, and whether a job in this mode earns the bonus now
    demand: () => (run.body && run.body.eco ? E().demandModes(run.body.eco.paid, eligibleModes()) : []),
    demandMatch: (mode) => !!(run.body && run.body.eco && E().demandMatch(run.body.eco, mode, eligibleModes())),
    bill: () => (run.body && run.body.eco ? E().billDue(run.body.eco) : null),
    // the wishlist: one salon target and one cosmetic (economy architecture, "Wishlist"), kept in the journal
    wish: (kind, target) => commit((b) => { const body = JSON.parse(JSON.stringify(b)); body.wish = Object.assign({}, body.wish, { [kind]: target || null }); return body; }),
    wishes: () => (run.body && run.body.wish) || {},
    // ordinary work per paid contract after the bill: what a gap is measured in (a safe default before any history)
    perJob: () => { const e = run.body && run.body.eco; return e && e.paid >= 5 ? Math.max(10, Math.round(((e.sources.job || 0) - (e.sinks.bill || 0)) / e.paid)) : 30; },
  };
  const eligibleModes = () => ['requests', 'fix', 'beard', 'relax', 'rush'].filter((m) => !HSC.modes || HSC.modes.unlocked(m));
  const commit = (fn) => (run.busy = (run.busy || Promise.resolve()).then(() => run.j.commit((b) => fn(b || run.body))).then((b) => { run.body = b; return b; }).catch(async (e) => {
    console.error('career: commit failed', e);
    // another surface wrote a newer career: take it (the event is not applied twice; the player repeats it)
    if (e && e.stale) { try { const r = await run.j.load(); if (r.body) run.body = Object.assign({ pop: {}, regs: {} }, r.body); } catch (e2) {} }
  }));
  // the foreground owns the career (save contract section 10): hidden, it releases the lease; its next write reloads
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => {
    if (!run.j) return;
    if (document.hidden) { run.busy = (run.busy || Promise.resolve()).then(() => run.j.release()); return; }
    // back in front: pick up anything another surface committed meanwhile
    if (run.j.released()) run.busy = (run.busy || Promise.resolve()).then(() => run.j.load()).then((r) => { if (r && r.body) run.body = Object.assign({ pop: {}, regs: {} }, r.body); }).catch(() => {});
  });

  // ---- the contract ----
  function packContract(c) {
    const st = c.start, rq = c.request;
    return {
      id: c.id, seed: c.seed, revision: c.revision, reroll: c.reroll | 0, city: c.city, tour: c.tour, visit: c.visit, slot: c.slot, role: c.role,
      licence: c.licence, mode: c.mode, lane: c.lane, source: c.source, regular: c.regular, context: c.context, modifier: c.modifier, band: c.band,
      // how it was made: the fallback stage and whether the final recheck passed (director section 11)
      stage: c.stage || null, validated: c.validated !== false,
      person: c.customer.person, start: { profile: st.silhouette, h: pack(st.hair), b: pack(st.beardGrid) },
      request: { id: rq.id, family: rq.family, t: rq.target ? pack(rq.target) : null, bt: rq.beardTarget ? pack(rq.beardTarget) : null, beardGoal: rq.beardGoal || null, services: rq.services || null },
      state: 'offered', job: null,
    };
  }
  function ctxFor(body) {
    const pos = C().position(body.core);
    // turn: the career calendar (one turn per generated contract); a regular's regrowth follows it, never the clock
    return { city: pos ? pos.city : body.core.founding, level: M().level(), turn: (body.dir && body.dir.turn) | 0, regulars: (body.regs[pos ? pos.city : body.core.founding] || []).map((g) => Object.assign({ key: g.key }, g)) };
  }
  // generate the next contract into a copy of the body (pure, for a commit)
  function withNextContract(b, reroll) {
    const body = JSON.parse(JSON.stringify(b));
    // the world map: the player chooses the next city (chooseCity); no contract is made until then (defect D1)
    if (C().phase(body.core) === 'map') { body.active = null; return body; }
    const catalog = HSC.careerCatalog.make({ pop: body.pop, regs: body.regs, recent: [] });
    const g = D().generate(body.core, body.dir, catalog, Object.assign(ctxFor(body), { reroll: reroll | 0 }));
    if (!g.contract) return body;
    body.dir = g.dir;
    // count the offered customer in the city's population scheduler, once
    const draw = g.contract.customer && g.contract.customer.draw;
    if (draw && HSC.careerCatalog.commitGroup) HSC.careerCatalog.commitGroup(body.pop, draw.city, draw.group);
    body.active = packContract(g.contract);
    return body;
  }
  // a career exists and a contract is offered; returns the active contract
  // one ensure at a time: two callers at once (the mode switch and the hero) must not both found a career
  function ensure(cityId) { return (run.ensuring = (run.ensuring || Promise.resolve()).then(() => ensureNow(cityId))); }
  async function ensureNow(cityId) {
    if (!run.ready) return null;
    if (!run.body) {
      const founding = cityId || C().UNSET;
      const seed = (Math.random() * 4294967296) >>> 0 || 1; // the career seed is drawn once and saved
      await commit(() => withNextContract(withEco({ core: C().create(founding, seed), dir: D().fresh(), regs: {}, pop: {}, active: null })));
      mirror();
    } else if (!run.body.active) {
      await commit((b) => withNextContract(b));
    }
    return run.body && run.body.active;
  }

  // ---- seating the contract's customer (modes.js asks these while the career mode is on) ----
  const act = () => run.body && run.body.active;
  // Contract states (save contract section 7): offered (drawn, not worked) -> active (in the chair) -> completed;
  // incomplete (finished with no meaningful work: back to the chair, or replace); suspended (left for another mode
  // with work done: the work is checkpointed and the same customer comes back with it).
  // The contract follows the career chair: when Career seats a new chair job (after a mode switch, a reload of an
  // unfinished contract or an incomplete finish), the contract moves to that job instead of being stranded.
  function person(job) {
    const a = act();
    if (!a || a.state === 'completed') return null;
    if (a.job !== job) { a.job = job; a.seated = null; }
    return Object.assign({}, a.person, { job });
  }
  function start(s) {
    const a = act();
    if (!a || a.job !== s.jobId || s.cutStrokeCount || a.seated === s.jobId) return null;
    const h = unpack(a.start.h, 5), b = unpack(a.start.b, BTOP());
    if (!h) return null;
    a.seated = s.jobId;
    // a suspended contract resumes at its checkpoint; scoring still counts from where he walked in
    const w = a.work, wh = w && unpack(w.h, 5), wb = w && unpack(w.b, BTOP());
    if (a.state === 'offered' || a.state === 'suspended' || a.state === 'incomplete') { a.state = 'active'; commit((body) => { body.active = Object.assign({}, a); return body; }); }
    const out = Object.assign({}, s, { hair: (wh || h).slice(), startHair: h });
    if (b) Object.assign(out, { beard: (wb || b).slice(), startBeard: b });
    return out;
  }
  // the contract's customer has meaningful work (a checkpoint, or the chair changed from the start)
  function hasWork(a, s) {
    if (!a) return false;
    if (a.work && a.work.changed) return true;
    if (!s || a.job !== s.jobId || a.seated !== s.jobId) return false;
    if (s.cutStrokeCount > 0) return true;
    const h = unpack(a.start.h, 5);
    return !!(h && Array.isArray(s.hair) && s.hair.some((v, i) => v !== h[i]));
  }
  // leaving the career chair for another mode: work is checkpointed (suspended), an untouched contract is offered again
  async function suspend(s) {
    const a = act();
    if (!a || !s || a.job !== s.jobId || s.status !== 'cutting') return;
    const work = hasWork(a, s) ? { h: pack(s.hair), b: pack(s.beard), strokes: (a.work ? a.work.strokes : 0) + (s.cutStrokeCount | 0), changed: true } : null;
    a.job = null; a.seated = null;
    await commit((b) => {
      const body = JSON.parse(JSON.stringify(b));
      if (!body.active || body.active.id !== a.id) return body;
      Object.assign(body.active, { job: null, seated: null, state: work ? 'suspended' : a.state === 'incomplete' ? 'incomplete' : 'offered' });
      if (work) body.active.work = work;
      Object.assign(a, { state: body.active.state, work: body.active.work });
      return body;
    });
    pendingBase();
  }
  const reqCache = { key: null, val: null };
  function request(s) {
    const a = act();
    if (!a || a.job !== s.jobId) return undefined;
    if (a.mode === 'relax') return null;
    if (reqCache.key === a.id) return reqCache.val;
    let val = null;
    if (a.request.bt) { const bt = unpack(a.request.bt, BTOP()); val = bt ? { style: { id: a.request.id, fam: 'beard' }, beard: bt } : null; }
    else if (a.request.t) { const t = unpack(a.request.t, 5); val = t ? { style: (HSC.requestKit && HSC.requestKit.byId.get(a.request.id)) || { id: a.request.id, fam: a.request.family }, target: t } : null; }
    reqCache.key = a.id; reqCache.val = val;
    return val;
  }
  const services = (p, job) => { const a = act(); return a && a.job === job && a.request.services ? a.request.services.slice() : null; };
  // the chair holds no contract (between chapters, before a city is chosen): nothing is scored or paid
  const unscored = () => { const a = act(), g = G(); return !a || !g || a.job !== g.getState().jobId || a.mode === 'relax'; };

  // ---- the reveal: commit the result, learn from it, prepare the next job ----
  function done(s, stars) {
    const a = act();
    if (!a || a.job !== s.jobId) return;
    let postedBill = null;
    const doneSvc = HSC.servicesDone ? HSC.servicesDone(s.jobId) : [];
    // meaningful work (map logic §5): a changed region (also before a suspension), or for Relax a completed service
    const valid = a.mode === 'relax' ? doneSvc.length > 0 : s.cutStrokeCount > 0 || !!(a.work && a.work.changed);
    const result = { id: a.id, stars: valid ? Math.max(1, stars | 0) : 0, valid, regular: !!a.regular, mode: a.mode, style: a.request.id, tools: HSC.toolsUsed ? HSC.toolsUsed(s.jobId) : HSC.tool ? [HSC.tool()] : [], services: doneSvc };
    const lj = HSC.lastJob && HSC.lastJob.key === a.id ? HSC.lastJob : null;
    commit((b) => {
      const body = JSON.parse(JSON.stringify(withEco(b)));
      const pos = C().position(body.core);
      const r = C().complete(body.core, result);
      if (r.error) { console.error('career: completion refused', r.error); return body; }
      body.core = r.state;
      body.core.rankBest = C().rankIndex(body.core, SPECIALIST()); // an earned rank is never lost
      // a city's first showcase creates its one branch record (branch plan sections 4 and 6)
      for (const e of (r.result && r.result.events) || []) if (e.startsWith('branch-established:')) newBranch(body, e.split(':')[1]);
      // the portfolio's sets complete in this same commit (portfolio contract section 13)
      if (valid && HSC.portfolio) HSC.portfolio.settle(body);
      // the finished job's before/after recipe, kept until the next job for an explicit save to Favourite work
      if (valid && !r.duplicate) run.lastCard = { src: a.id, city: a.city, style: a.request.id, mode: a.mode, person: a.person, bh: a.start.h, ah: pack(s.hair), bb: a.start.b || null, ab: Array.isArray(s.beard) ? pack(s.beard) : null, q: result.stars, rev: body.core.rev };
      D().noteResult(body.dir, result.stars, valid, a.band);
      if (!valid) { body.active.state = 'incomplete'; return body; }
      // the job's pay and any career milestones it reached (economy, idempotent by contract id and milestone id)
      if (body.eco && E() && !r.duplicate) {
        if (lj) { const paid = E().payJob(body.eco, a.id, Object.assign({}, lj.job, { valid: true })); body.eco = paid.eco; postedBill = paid.bill || null; }
        const first = body.eco.paid <= 1 && !body.ecoLegacy;
        const list = E().milestonesFor((r.result && r.result.events) || [], pos, first);
        if (pos && C().cityMastery(body.core, pos.city).all) list.push(['mastery:' + pos.city, E().CONFIG.milestones.cityMastery]);
        const m = E().payMilestones(body.eco, list);
        body.eco = m.eco;
        if (m.paid.length) run.milestones = m.paid;
      }
      // a relationship job makes (or keeps) a regular; regulars keep their identity and their last cut
      if (a.role === 'relationship' || a.regular) {
        const list = (body.regs[a.city] = body.regs[a.city] || []);
        const key = a.regular || 'g' + a.person.seed;
        const rec = list.find((g) => g.key === key) || (list.push({ key, seed: a.person.seed, person: a.person, visits: 0 }), list[list.length - 1]);
        rec.visits++; rec.usual = a.request.id; rec.lastChapter = (body.dir.cool || {}).chapter || 0; rec.lastDay = (body.dir.turn | 0);
        rec.h = pack(s.hair); rec.b = pack(s.beard); rec.u = a.start.b;
        if (list.length > 6) list.splice(0, list.length - 6);
      }
      body.active = null;
      return withNextContract(body);
    }).then(() => {
      mirror();
      // the next career customer waits for the next chair (the reveal screen shows him)
      const n = act(), d = M() && M().data;
      if (postedBill && d && d.lastRound && d.lastRound.key === a.id && !d.lastRound.bill) {
        d.lastRound.bill = postedBill; d.lastRound.lines = (d.lastRound.lines || []).concat(postedBill.lines || []); M().save();
      }
      pendingBase(); syncLook();
      if (n && d && n.state === 'offered') { n.job = s.jobId + 1; d.queue = { job: s.jobId + 1, person: Object.assign({}, n.person, { job: s.jobId + 1 }), profile: n.start.profile }; M().save(); }
    });
  }
  // the offered (or no-action) contract may be replaced without penalty; meaningful work may not (map logic §5)
  const canReplace = () => { const a = act(), g = G(); return !!a && a.state !== 'suspended' && a.state !== 'completed' && !hasWork(a, g && g.getState()); };
  async function replace() {
    const a = act();
    if (!canReplace()) return false;
    const old = a.id;
    await commit((b) => {
      const body = JSON.parse(JSON.stringify(b));
      if (!body.active || body.active.id !== old) return body;
      // the replacement keeps the same slot and contract id, drawn again with its replacement count
      const n = (body.active.reroll | 0) + 1, L = body.dir && body.dir.chapterLog;
      // the replaced offer leaves the chapter's record (its signature stays, so it is not offered straight back)
      if (Array.isArray(L) && L.length && L[L.length - 1].city === body.active.city && L[L.length - 1].visit === body.active.visit) L.pop();
      body.active = null;
      return withNextContract(body, n);
    });
    return !!(act() && act().id === old && act().reroll > 0);
  }
  // a damaged active contract (bad grids, a person that no longer validates, or not this career position) is
  // replaced by a fresh contract for the same slot; earlier progress is untouched (save contract section 7)
  function activeOk(body) {
    const a = body.active;
    if (!a) return true;
    if (a.state === 'completed') return false;
    const pos = C().position(body.core);
    if (!pos || a.id !== C().contractId(body.core)) return false;
    if (!a.person || (HSC.validPerson && !HSC.validPerson(a.person))) return false;
    if (!unpack(a.start && a.start.h, 5)) return false;
    if (a.request && a.request.t && !unpack(a.request.t, 5)) return false;
    if (a.work && !unpack(a.work.h, 5)) return false;
    return true;
  }
  // ---- branches (docs/CAREER-SALON-BRANCH-PLAN.md) ----
  // One record per established city: its salon look (the shop's nine slots, chosen from parts the barber owns, so
  // nothing is bought twice) and its display objects. A new branch starts with the founding salon's current look.
  // Missing or invalid looks fall back to the neutral salon; the career facts never depend on them.
  const BRANCH_V = 1;
  function newBranch(body, city) {
    body.branches = body.branches && typeof body.branches === 'object' ? body.branches : {};
    if (body.branches[city]) return; // at most one branch per city, ever
    const sh = HSC.salon && HSC.salon.state();
    body.branches[city] = { v: BRANCH_V, theme: 'neutral', parts: sh ? Object.assign({}, sh.parts) : null, region: sh ? sh.region || '' : '', objects: ['showcase'] };
  }
  // the city whose salon is behind the chair: the contract's city in Career (an established branch), otherwise the
  // active base; the founding city (or a guest station before a showcase) shows the founding salon itself
  function lookCity() {
    const b = run.body;
    if (!b || C().needsFounding(b.core)) return null;
    const a = b.active, mode = HSC.modes && HSC.modes.current();
    const city = mode === 'career' && a ? a.city : mode === 'career' && b.core.current ? b.core.current.city : b.core.base;
    if (!city || city === b.core.founding) return null;
    return b.branches && b.branches[city] ? city : null;
  }
  function branchLook(city) {
    const br = run.body && run.body.branches && run.body.branches[city];
    if (!br) return null;
    return { city, fit: br.fit | 0, parts: br.parts, region: br.region || '', save: (parts, region) => commit((b) => { const body = JSON.parse(JSON.stringify(b)); if (body.branches && body.branches[city]) Object.assign(body.branches[city], { parts: Object.assign({}, parts), region: region || '' }); return body; }) };
  }
  function syncLook() { if (HSC.salon && HSC.salon.setContext) HSC.salon.setContext(branchLook(lookCity())); }
  // relocation (branch plan section 8): after World Tour 1 any established branch may become the active base; asked
  // during a haircut with work in it, it waits until that job ends or is left
  async function setBase(city) {
    const b0 = run.body;
    if (!b0) return false;
    const chk = C().setBase(b0.core, city);
    if (chk.error) return false;
    const g = G();
    if (inProgress(b0.active) && hasWork(b0.active, g && g.getState())) { run.pendingBase = city; return 'queued'; }
    let ok = false;
    await commit((b) => { const r = C().setBase(b.core, city); if (r.error) return b; const body = JSON.parse(JSON.stringify(b)); body.core = r.state; ok = true; return body; });
    run.pendingBase = null;
    syncLook();
    return ok;
  }
  const pendingBase = () => { if (run.pendingBase) { const c = run.pendingBase; run.pendingBase = null; setBase(c); } };

  // the Daily result attaches to career mastery (it never takes a slot); nothing is written when nothing improves
  function side(r) {
    if (!run.body || !r) return Promise.resolve(false);
    const t = C().side(run.body.core, r);
    if (t.error || t.duplicate) return Promise.resolve(false);
    return commit((b) => { const x = C().side(b.core, r); if (x.error || x.duplicate) return b; const body = JSON.parse(JSON.stringify(b)); body.core = x.state; if (HSC.portfolio) HSC.portfolio.settle(body); return body; }).then(() => true);
  }
  // Favourite work: save the last finished job's card (or replace one exact card when the 24 are full)
  async function saveCard(replaceId) {
    const P = HSC.portfolio, last = run.lastCard;
    if (!P || !last || !run.body) return false;
    let ok = false;
    await commit((b) => {
      const body = JSON.parse(JSON.stringify(b)), p = P.port(body);
      if (p.cards.some((c) => c.src === last.src)) return b;
      const next = P.withCard(p.cards, P.recipe(last), replaceId || null);
      if (!next) return b; // refused before anything changes: the gallery stays as it was
      p.cards = next; body.port = p; ok = true;
      return body;
    });
    return ok;
  }
  // what Career needs from the player before it can seat a contract: 'found' (the founding city), 'map' (the next
  // city, after a chapter or the licence) or null
  function needsChoice() {
    const b = run.body;
    if (!b) return null;
    if (C().needsFounding(b.core)) return 'found';
    if (C().phase(b.core) === 'map' && !b.active) return 'map';
    return null;
  }
  const inProgress = (a) => !!(a && a.state !== 'offered' && a.state !== 'incomplete');
  // the founding city: the placeholder becomes the chosen city in the career, its regulars and its milestone keys;
  // an offered contract is drawn again in the chosen city, work in progress keeps its customer
  async function found(cityId) {
    let ok = false;
    if (!run.body || !C().needsFounding(run.body.core)) return false;
    await commit((b) => {
      const r = C().found(b.core, cityId);
      if (r.error) return b;
      const body = JSON.parse(JSON.stringify(b)), U = C().UNSET;
      body.core = r.state; ok = true;
      if (body.regs[U]) { body.regs[cityId] = (body.regs[cityId] || []).concat(body.regs[U]).slice(-6); delete body.regs[U]; }
      if (body.pop[U]) delete body.pop[U];
      // milestones already paid for the placeholder stay paid for the chosen city
      if (body.eco) {
        const ren = (k) => k.split(':').map((p) => (p === U ? cityId : p)).join(':');
        for (const k of body.eco.keys.slice()) if (k.split(':').includes(U) && !body.eco.keys.includes(ren(k))) body.eco.keys.push(ren(k));
        if (Array.isArray(body.eco.milestones)) body.eco.milestones = body.eco.milestones.map(ren);
      }
      const a = body.active;
      if (!inProgress(a)) { body.active = null; return withNextContract(body); }
      a.id = a.id.split(':').map((p, i) => (i === 2 && p === U ? cityId : p)).join(':');
      if (a.city === U) a.city = cityId;
      return body;
    });
    syncLook();
    return ok;
  }
  // the world map's choice: the next chapter's city (refused while a contract is in progress)
  async function chooseCity(id) {
    let ok = false;
    const b0 = run.body;
    if (!b0 || inProgress(b0.active) || C().phase(b0.core) !== 'map' || !C().selectable(b0.core).includes(id)) return false;
    await commit((b) => {
      const sel = C().selectCity(b.core, id);
      if (sel.error) return b;
      const body = JSON.parse(JSON.stringify(b));
      body.core = sel.state; body.active = null; ok = true;
      return withNextContract(body);
    });
    syncLook();
    return ok;
  }

  HSC.careerRun = {
    saveCard, lastCard: () => run.lastCard || null,
    setBase, syncLook, branchLook, lookCity, branches: () => (run.body && run.body.branches) || {},
    init, ensure, person, start, request, services, unscored, done, side, replace, canReplace, suspend, chooseCity, found, needsChoice,
    body: () => run.body, ready: () => run.ready, active: act,
    // a career saved by a newer game version: kept untouched; Career asks for an update (save contract section 8)
    tooNew: () => !!run.tooNew,
    rank: () => (run.body ? C().rank(run.body.core, SPECIALIST()) : null),
  };
  // start once the progress save and the game are up
  const boot = () => {
    const client = M() && M().client;
    if (!client || !HSC.careerSave || !HSC.career || !HSC.director || !HSC.careerCatalog || !G()) return setTimeout(boot, 300);
    init(client).catch((e) => console.error('career: load failed', e)).then(() => { run.initDone = true; syncLook(); });
  };
  boot();
})(globalThis.HSC || (globalThis.HSC = {}));
