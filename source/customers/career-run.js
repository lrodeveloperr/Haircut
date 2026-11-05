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
// Cities: the owner's researched roster is still to come. Until then the registry holds one neutral home city
// with the neutral population table; the career is fully playable and each new city record drops in as data.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio;
  const pack = (a) => HSC.gridPack(a), unpack = (s, max) => (typeof s === 'string' ? HSC.gridUnpack(s, max) : null);
  const BTOP = () => (HSC.BEARD_MM ? HSC.BEARD_MM.length - 1 : 16);
  // the provisional registry: replaced by the owner's researched city records (CITY-CUSTOMER-VARIABILITY.md §10)
  HSC.CITIES = HSC.CITIES || [{ id: 'home', enabled: true, population: null, confidence: 'low', review: 'research', provisional: true }];

  const run = { j: null, body: null, catalog: null, ready: false, busy: null, queuedCity: null };
  const C = () => HSC.career, D = () => HSC.director;
  const SPECIALIST = () => D().SPECIALIST.filter((m) => HSC.modes && HSC.modes.unlocked(m));

  async function init(client) {
    C().setCities(HSC.CITIES, 1);
    run.j = HSC.careerSave.journal({
      get: (k) => client.loadProgress(k, null),
      set: (k, v) => client.saveProgress(k, v),
    });
    const r = await run.j.load();
    if (r.tooNew) { run.tooNew = true; return; }
    run.body = r.body ? Object.assign({ pop: {}, regs: {} }, r.body) : null;
    if (run.body && run.body.core) run.body.core = C().reconcile(run.body.core);
    run.ready = true;
    if (run.body && !run.body.eco && E()) await commit((b) => withEco(b));
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
    payJob: (key, job) => ecoCommit((eco) => E().payJob(eco, key, job)),
    triple: (key, tip) => ecoCommit((eco) => E().tripleTip(eco, key, tip)),
    bill: () => (run.body && run.body.eco ? E().billDue(run.body.eco) : null),
  };
  const commit = (fn) => (run.busy = (run.busy || Promise.resolve()).then(() => run.j.commit((b) => fn(b || run.body))).then((b) => { run.body = b; return b; }).catch((e) => { console.error('career: commit failed', e); }));

  // ---- the contract ----
  function packContract(c) {
    const st = c.start, rq = c.request;
    return {
      id: c.id, seed: c.seed, revision: c.revision, city: c.city, tour: c.tour, visit: c.visit, slot: c.slot, role: c.role,
      licence: c.licence, mode: c.mode, lane: c.lane, source: c.source, regular: c.regular, context: c.context, modifier: c.modifier, band: c.band,
      person: c.customer.person, start: { profile: st.silhouette, h: pack(st.hair), b: pack(st.beardGrid) },
      request: { id: rq.id, family: rq.family, t: rq.target ? pack(rq.target) : null, bt: rq.beardTarget ? pack(rq.beardTarget) : null, beardGoal: rq.beardGoal || null, services: rq.services || null },
      state: 'offered', job: null,
    };
  }
  function ctxFor(body) {
    const pos = C().position(body.core);
    return { city: pos ? pos.city : body.core.founding, level: M().level(), regulars: (body.regs[pos ? pos.city : body.core.founding] || []).map((g) => Object.assign({ key: g.key }, g)) };
  }
  // generate the next contract into a copy of the body (pure, for a commit)
  function withNextContract(b) {
    const body = JSON.parse(JSON.stringify(b));
    if (C().phase(body.core) === 'map') {
      // the world map: an incomplete city (the map screen chooses; until then the first that is left, or home)
      const rem = C().remaining(body.core), pick = run.queuedCity && C().selectable(body.core).includes(run.queuedCity) ? run.queuedCity : rem[0] || body.core.base;
      const sel = C().selectCity(body.core, pick);
      if (sel.error) return body;
      body.core = sel.state; run.queuedCity = null;
    }
    const catalog = HSC.careerCatalog.make({ pop: body.pop, regs: body.regs, recent: [] });
    const g = D().generate(body.core, body.dir, catalog, ctxFor(body));
    if (!g.contract) return body;
    body.dir = g.dir;
    body.active = packContract(g.contract);
    return body;
  }
  // a career exists and a contract is offered; returns the active contract
  // one ensure at a time: two callers at once (the mode switch and the hero) must not both found a career
  function ensure(cityId) { return (run.ensuring = (run.ensuring || Promise.resolve()).then(() => ensureNow(cityId))); }
  async function ensureNow(cityId) {
    if (!run.ready) return null;
    if (!run.body) {
      const founding = cityId || C().enabledIds()[0];
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
  function person(job) {
    const a = act();
    if (!a || a.state === 'completed') return null;
    if (a.job != null && a.job !== job) return null;
    a.job = job;
    return Object.assign({}, a.person, { job });
  }
  function start(s) {
    const a = act();
    if (!a || a.job !== s.jobId || s.cutStrokeCount || a.seated === s.jobId) return null;
    const h = unpack(a.start.h, 5), b = unpack(a.start.b, BTOP());
    if (!h) return null;
    a.seated = s.jobId;
    if (a.state === 'offered') { a.state = 'active'; commit((body) => { body.active = Object.assign({}, a); return body; }); }
    const out = Object.assign({}, s, { hair: h.slice(), startHair: h });
    if (b) Object.assign(out, { beard: b.slice(), startBeard: b });
    return out;
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
  const unscored = () => { const a = act(); return !!(a && a.mode === 'relax'); };

  // ---- the reveal: commit the result, learn from it, prepare the next job ----
  function done(s, stars) {
    const a = act();
    if (!a || a.job !== s.jobId) return;
    const doneSvc = HSC.servicesDone ? HSC.servicesDone(s.jobId) : [];
    // meaningful work (map logic §5): a changed region, or for Relax a completed service
    const valid = a.mode === 'relax' ? doneSvc.length > 0 : s.cutStrokeCount > 0;
    const result = { id: a.id, stars: valid ? Math.max(1, stars | 0) : 0, valid, mode: a.mode, style: a.request.id, tools: HSC.tool ? [HSC.tool()] : [], services: doneSvc };
    const lj = HSC.lastJob && HSC.lastJob.key === a.id ? HSC.lastJob : null;
    commit((b) => {
      const body = JSON.parse(JSON.stringify(withEco(b)));
      const pos = C().position(body.core);
      const r = C().complete(body.core, result);
      if (r.error) { console.error('career: completion refused', r.error); return body; }
      body.core = r.state;
      D().noteResult(body.dir, result.stars, valid);
      if (!valid) { body.active.state = 'incomplete'; return body; }
      // the job's pay and any career milestones it reached (economy, idempotent by contract id and milestone id)
      if (body.eco && E() && !r.duplicate) {
        if (lj) body.eco = E().payJob(body.eco, a.id, lj.job).eco;
        const first = body.eco.paid <= 1 && !body.ecoLegacy;
        const list = E().milestonesFor((r.result && r.result.events) || [], pos, first);
        const cr = pos && body.core.cities && body.core.cities[pos.city];
        if (cr && cr.chapters >= 3 && (cr.showcaseBest | 0) >= C().MASTER_STARS) list.push(['mastery:' + pos.city, E().CONFIG.milestones.cityMastery]);
        const m = E().payMilestones(body.eco, list);
        body.eco = m.eco;
        if (m.paid.length) run.milestones = m.paid;
      }
      // a relationship job makes (or keeps) a regular; regulars keep their identity and their last cut
      if (a.role === 'relationship' || a.regular) {
        const list = (body.regs[a.city] = body.regs[a.city] || []);
        const key = a.regular || 'g' + a.person.seed;
        const rec = list.find((g) => g.key === key) || (list.push({ key, seed: a.person.seed, person: a.person, visits: 0 }), list[list.length - 1]);
        rec.visits++; rec.usual = a.request.id; rec.lastChapter = (body.dir.cool || {}).chapter || 0;
        rec.h = pack(s.hair); rec.b = pack(s.beard); rec.u = a.start.b;
        if (list.length > 6) list.splice(0, list.length - 6);
      }
      body.active = null;
      return withNextContract(body);
    }).then(() => {
      mirror();
      // the next career customer waits for the next chair (the reveal screen shows him)
      const n = act(), d = M() && M().data;
      if (n && d && n.state === 'offered') { n.job = s.jobId + 1; d.queue = { job: s.jobId + 1, person: Object.assign({}, n.person, { job: s.jobId + 1 }), profile: n.start.profile }; M().save(); }
    });
  }
  // the offered (or no-action) contract may be replaced without penalty; work in progress may not
  async function replace() {
    const a = act();
    if (!a || (a.state !== 'offered' && a.state !== 'incomplete')) return false;
    await commit((b) => { const body = JSON.parse(JSON.stringify(b)); body.active = null; return withNextContract(body); });
    return true;
  }
  // the world map's choice: a city for the next chapter (queued while a contract is active)
  function chooseCity(id) { run.queuedCity = id; }

  HSC.careerRun = {
    init, ensure, person, start, request, services, unscored, done, replace, chooseCity,
    body: () => run.body, ready: () => run.ready, active: act,
    rank: () => (run.body ? C().rank(run.body.core, SPECIALIST()) : null),
  };
  // start once the progress save and the game are up
  const boot = () => {
    const client = M() && M().client;
    if (!client || !HSC.careerSave || !HSC.career || !HSC.director || !HSC.careerCatalog || !G()) return setTimeout(boot, 300);
    init(client).catch((e) => console.error('career: load failed', e));
  };
  boot();
})(globalThis.HSC || (globalThis.HSC = {}));
