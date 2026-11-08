// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the career in the game (docs/CAREER-MAP-LOGIC.md sections 5, 10, 12;
// CAREER-SAVE-AND-QA-CONTRACT.md section 7; owner-approved 5 November 2026).
//
//   play      makes sure a career exists and a contract is offered (generated, then committed to the journal
//             before the customer is shown), then seats that customer
//   seat      the contract supplies the person, the starting hair and beard, the request
//   done      at the reveal: one-star valid work completes the contract (idempotent), mastery and regulars are
//             recorded, the director learns the result, and the next contract is generated and committed
//   resume    an offered or active contract survives a restart exactly (it is saved whole)
// The career save is its own journal (career-save.js); nothing here touches coins, prices or advertising.
//
// Cities: the 18-city registry (cities.js), every city on the neutral population table until its research lands.
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
  const SPECIALIST = () => D().SPECIALIST.filter((m) => HSC.modes && (HSC.modes.inCareer || HSC.modes.unlocked)(m));

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
    if (run.ready) try { replay(); } catch (e) { console.error('career: replay at the reveal failed', e); }
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
  // the result is reported only once the journal holds it: a commit that failed after its apply step granted and
  // charged nothing, so it reports nothing (null)
  function ecoCommit(fn) {
    let out = null;
    return commit((b) => { const body = JSON.parse(JSON.stringify(withEco(b))); const r = fn(body.eco); out = r; if (r && r.eco) body.eco = r.eco; return body; }).then((b) => { mirror(); return b ? out : null; });
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
      }).then((b) => { mirror(); return !!(b && out && !out.error); }); // bought only once the commit has landed
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
    wish: (kind, target) => commit((b) => { const body = JSON.parse(JSON.stringify(b)); body.wish = target ? { [kind]: target } : {}; return body; }),
    wishes: () => (run.body && run.body.wish) || {},
    // what milestones paid since the last look, for the result screen
    takeMilestones: () => { const m = run.milestones; run.milestones = null; return Array.isArray(m) ? m.reduce((a, x) => a + (Array.isArray(x) ? x[1] : x.amount || 0), 0) : 0; },
    // the player's one target, whichever shop it came from; an item owned by any route stops being a target
    // a malformed or stale saved wish (an item this build does not sell) is cleared, never allowed to break a shop
    wishTarget: () => {
      const w = (run.body && run.body.wish) || {};
      for (const kind of ['salon', 'cosmetic']) {
        const t = w[kind];
        if (!t) continue;
        let owned;
        try { owned = wishOwned(t.key); } catch (e) { owned = null; }
        if (owned === null) { dropWish(kind, t && t.key); continue; }
        return owned ? null : t;
      }
      return null;
    },
    // ordinary work per paid contract after the bill: what a gap is measured in (a safe default before any history)
    perJob: () => { const e = run.body && run.body.eco; return e && e.paid >= 5 ? Math.max(10, Math.round(((e.sources.job || 0) - (e.sinks.bill || 0)) / e.paid)) : 30; },
  };
  // whether a wished item is owned: true / false, or null when the key names nothing this build sells
  function wishOwned(key) {
    if (typeof key !== 'string') return null;
    if (run.body && Array.isArray(run.body.ent) && run.body.ent.includes(key)) return true;
    const k = key.split(':');
    if (k[0] === 'salon') {
      const S = HSC.salon, st = S && S.state ? S.state() : null;
      if (!st || !S.OPTIONS || !S.REGIONS) return false; // the salon has not loaded yet: the wish waits
      // a part: salon:part:<slot>:<option>
      if (k[1] === 'part' && k.length === 4) return Array.isArray(S.OPTIONS[k[2]]) && S.OPTIONS[k[2]].includes(k[3]) ? !!S.owns(k[2], k[3]) : null;
      // a regional shop: salon:shop:<city>, owned once it is in the salon's regions (priceOf knows only parts)
      if (k[1] === 'shop' && k.length === 3) return S.REGIONS.includes(k[2]) ? !!(Array.isArray(st.regions) && st.regions.includes(k[2])) : null;
      return null;
    }
    if (k[0] === 'wardrobe' && key.length > 9) {
      const W = HSC.wardrobeApi, cat = HSC.catalog;
      if (!W || !W.owns || !cat || !cat.byKey) return false;
      return cat.byKey.has(key.slice(9)) ? !!W.owns(key.slice(9)) : null;
    }
    return null;
  }
  // clears one bad wish, once (the shop renders often)
  function dropWish(kind, key) {
    run.dropping = run.dropping || {};
    if (run.dropping[kind] === key) return;
    run.dropping[kind] = key;
    console.warn('career: a saved wish names nothing on sale and is cleared', key);
    commit((b) => { const body = JSON.parse(JSON.stringify(b)); if (body.wish && body.wish[kind] && body.wish[kind].key === key) delete body.wish[kind]; return body; });
  }
  const eligibleModes = () => ['requests', 'fix', 'beard', 'rush'].filter((m) => !HSC.modes || (HSC.modes.inCareer || HSC.modes.unlocked)(m));
  // resolves to the committed body, or null when nothing was committed (callers report success only on a body)
  // a completion still owed (its write failed, below) is written first, ahead of whatever this commit carries
  const commit = (fn) => { if (run.owed && !run.completing) retryOwed(); return (run.busy = (run.busy || Promise.resolve()).then(() => run.j.commit((b) => fn(b || run.body))).then((b) => { run.body = b; return b; }).catch(async (e) => {
    console.error('career: commit failed', e);
    // another surface wrote a newer career: take it (the event is not applied twice; the player repeats it)
    if (e && e.stale) { try { const r = await run.j.load(); if (r.tooNew) run.tooNew = true; else if (r.body) run.body = Object.assign({ pop: {}, regs: {} }, r.body); } catch (e2) {} }
    return null;
  })); };
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
    return { early: !!(pos && pos.licence && pos.chapter <= 2), city: pos ? pos.city : body.core.founding, level: M().level(), turn: (body.dir && body.dir.turn) | 0, regulars: (body.regs[pos ? pos.city : body.core.founding] || []).map((g) => Object.assign({ key: g.key }, g)) };
  }
  // generate the next contract into a copy of the body (pure, for a commit)
  function withNextContract(b) {
    const body = JSON.parse(JSON.stringify(b));
    // the world map: the player chooses the next city (chooseCity); no contract is made until then (defect D1)
    if (C().phase(body.core) === 'map') { body.active = null; return body; }
    const catalog = HSC.careerCatalog.make({ pop: body.pop, regs: body.regs, recent: [] });
    const g = D().generate(body.core, body.dir, catalog, ctxFor(body));
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
  // real work: cells of hair or beard changed from the start (modes.js worked is the one definition; brows excluded)
  const worked = (s) => (HSC.modes && HSC.modes.worked ? HSC.modes.worked(s) : s.cutStrokeCount > 0);
  // any cell of hair or beard changed from the start: less than worked asks of a finish, yet still the player's cut,
  // so a checkpoint keeps it and a walk-in with it is never skipped away
  const changed = (s) => (HSC.modes && HSC.modes.changedCells ? HSC.modes.changedCells(s, 1) > 0 : worked(s));
  // brows (HSC.BROW_N cells, 2 full, 1 short, 0 shaved) pack the grids' run-length way; gridUnpack is fixed at 8192
  function unpackBrow(str) {
    const n = HSC.BROW_N;
    if (!n || typeof str !== 'string' || str.length > 24000) return null;
    const out = new Array(n), re = /([A-C])([0-9a-z]{1,4})/y;
    let i = 0, m;
    while (re.lastIndex < str.length && (m = re.exec(str))) { const k = parseInt(m[2], 36); if (!k || i + k > n) return null; out.fill(m[1].charCodeAt(0) - 65, i, i + k); i += k; }
    return i === n && re.lastIndex === str.length ? out : null;
  }
  const browsTouched = (s) => Array.isArray(s.brow) && s.brow.some((v) => v !== 2);
  // a finished contract whose completion could not be written: it is not seated again from his start (the cut and
  // the pay the result screen showed would be lost); it is written again first (owed, in done)
  const owes = (a) => !!(run.owed && a && run.owed.id === a.id);
  function person(job) {
    if (run.owed) retryOwed();
    const a = act();
    // while a finished contract's result is still being written no chair is given it: Next pressed during that save
    // must not seat him again, nor credit the next contract to him (the chair is re-seated when it lands, done)
    if (!a || a.state === 'completed' || run.completing === a.id || owes(a)) return null;
    // a new chair: an earlier chair's finish no longer applies (the engine's job numbers may start again)
    if (a.job !== job) { a.job = job; a.seated = null; delete a.doneJob; }
    return Object.assign({}, a.person, { job });
  }
  function start(s) {
    if (run.owed) retryOwed();
    const a = act();
    if (!a || run.completing === a.id || owes(a) || a.job !== s.jobId || s.cutStrokeCount) return null;
    // only the contract's own customer takes the contract's chair
    const p = s.look && s.look.person;
    if (!p || !a.person || p.seed !== a.person.seed) return null;
    const h = unpack(a.start.h, 5), b = unpack(a.start.b, BTOP());
    if (!h) return null;
    // this chair is already his (a reload): unless it no longer starts from his hair, which is a new chair that
    // carries the same number because the engine's job numbers started again
    if (a.seated === s.jobId && !(Array.isArray(s.startHair) && s.startHair.length === h.length && s.startHair.some((v, i) => v !== h[i]))) return null;
    a.seated = s.jobId;
    // a suspended contract resumes at its checkpoint (hair, beard and brows); scoring still counts from where he walked in
    const w = a.work, wh = w && unpack(w.h, 5), wb = w && unpack(w.b, BTOP()), wbr = w && unpackBrow(w.br);
    if (a.state === 'offered' || a.state === 'suspended' || a.state === 'incomplete') a.state = 'active';
    // seated again: an earlier incomplete finish no longer blocks this chair's result, even if the engine's job
    // numbers have started again and this chair has the same number
    delete a.doneJob;
    // the seat is saved (the state and this job), so a reload at this chair or at its reveal finds its contract
    const seat = Object.assign({}, a);
    commit((body) => { if (body.active && body.active.id === seat.id) { body.active = Object.assign({}, body.active, { state: seat.state, job: seat.job, seated: seat.seated }); delete body.active.doneJob; } return body; });
    const out = Object.assign({}, s, { hair: (wh || h).slice(), startHair: h, cutStrokeCount: w ? w.strokes | 0 : 0 });
    if (b) Object.assign(out, { beard: (wb || b).slice(), startBeard: b });
    if (wbr && Array.isArray(s.brow) && s.brow.length === wbr.length) { out.brow = wbr; if (HSC.setBrow) HSC.setBrow(wbr); }
    return out;
  }
  // the contract's customer has meaningful work (a checkpoint, or the chair changed from the start)
  function hasWork(a, s) {
    if (!a) return false;
    if (a.work && a.work.changed) return true;
    if (!s || a.job !== s.jobId || a.seated !== s.jobId) return false;
    // trimmed brows are kept with the checkpoint too, though they alone are not work that completes a contract
    return changed(s) || browsTouched(s);
  }
  // leaving the career chair for another mode: work is checkpointed (suspended), an untouched contract is offered again
  async function suspend(s) {
    const a = act();
    if (!a || !s || a.job !== s.jobId || s.status !== 'cutting') return;
    const work = hasWork(a, s) ? { h: pack(s.hair), b: pack(s.beard), br: Array.isArray(s.brow) && HSC.BROW_N && s.brow.length === HSC.BROW_N ? pack(s.brow) : null, strokes: Math.max(a.work ? a.work.strokes | 0 : 0, s.cutStrokeCount | 0), changed: true } : null;
    a.job = null; a.seated = null;
    await commit((b) => {
      const body = JSON.parse(JSON.stringify(b));
      if (!body.active || body.active.id !== a.id) return body;
      Object.assign(body.active, { job: null, seated: null, state: work ? 'suspended' : a.state === 'incomplete' ? 'incomplete' : 'offered' });
      if (work) body.active.work = work;
      Object.assign(a, { state: body.active.state, work: body.active.work });
      return body;
    });
  }
  const reqCache = { key: null, val: null };
  function request(s) {
    const a = act();
    if (!a || a.job !== s.jobId) return undefined;
    if (reqCache.key === a.id) return reqCache.val;
    let val = null;
    const bt = a.request.bt ? unpack(a.request.bt, BTOP()) : null, t = a.request.t ? unpack(a.request.t, 5) : null;
    // an order may be for the hair, the beard, or both
    if (t) val = { style: (HSC.requestKit && HSC.requestKit.byId.get(a.request.id)) || { id: a.request.id, fam: a.request.family }, target: t, beard: bt };
    else if (bt) val = { style: { id: a.request.id, fam: 'beard' }, beard: bt };
    reqCache.key = a.id; reqCache.val = val;
    return val;
  }
  // the chair holds no contract (between chapters, before a city is chosen): nothing is scored or paid
  const unscored = () => { const a = act(), g = G(); return !a || !g || a.job !== g.getState().jobId; };

  // ---- the reveal: commit the result, learn from it, prepare the next job ----
  // what the result screen promised for this contract: the job as it was scored (requests.js), or, after a restart
  // at the reveal (HSC.lastJob is gone), the same job rebuilt from the saved result and the contract
  function jobOf(a, s) {
    if (HSC.lastJob && HSC.lastJob.key === a.id) return HSC.lastJob.job;
    const d = M() && M().data, lr = d && d.lastRound;
    if (!lr || lr.key !== a.id || lr.job !== s.jobId) return null;
    const lines = Array.isArray(lr.lines) ? lr.lines : [], rush = lines.find((l) => l[0] === 'rush'), p = a.person || {};
    // the amounts come from the economy's own rules (payout), never from the saved numbers
    return { kind: a.role === 'showcase' ? 'showcase' : a.mode, stars: lr.stars, judged: !!lr.judged, valid: true, regular: !!p.regular || !!a.regular, vip: !!p.vip, rushBonus: rush ? rush[1] | 0 : 0, demandMatch: lines.some((l) => l[0] === 'demand') };
  }
  // o: a completion owed from an earlier failed write (retryOwed), decided as it was then: the mode, the order and
  // the result screen may have moved on since, but what was shown is what is written
  function done(s, stars, o) {
    const a = act();
    if (!a || a.job !== s.jobId || run.completing === a.id) return;
    if (a.doneJob === s.jobId) return; // this chair's result is already written (an incomplete finish seen again)
    // only the contract's own customer completes it (a chair seated while a result was still being written is not his)
    const sp = s.look && s.look.person;
    if (sp && a.person && sp.seed !== a.person.seed) return;
    // from here until the result is written, no chair is given this contract (person, start)
    run.completing = a.id;
    let postedBill = null;
    // meaningful work (map logic §5): cells really changed from where he walked in (a checkpoint's work included)
    const judged = o ? o.judged : !!(HSC.modes && HSC.modes.judged && HSC.modes.judged(s)); // a Rescue or Beards contract: real work is what counts
    const valid = o ? o.valid : judged ? stars > 0 : HSC.modes && HSC.modes.worked ? worked(s) : s.cutStrokeCount > 0 || !!(a.work && a.work.changed);
    const result = { id: a.id, stars: valid ? Math.max(1, stars | 0) : 0, valid, regular: !!a.regular, mode: a.mode, style: a.request.id, tools: ['clipper'] };
    const pj = o ? o.pj : jobOf(a, s);
    commit((b) => {
      const body = JSON.parse(JSON.stringify(withEco(b)));
      const pos = C().position(body.core);
      const r = C().complete(body.core, result);
      if (r.error) { console.error('career: completion refused', r.error); return body; }
      body.core = r.state;
      body.core.rankBest = C().rankIndex(body.core, SPECIALIST()); // an earned rank is never lost
      D().noteResult(body.dir, result.stars, valid, a.band);
      if (!valid) { if (body.active && body.active.id === a.id) Object.assign(body.active, { state: 'incomplete', doneJob: s.jobId }); return body; }
      // the job's pay and any career milestones it reached (economy, idempotent by contract id and milestone id)
      if (body.eco && E() && !r.duplicate) {
        if (pj) { const paid = E().payJob(body.eco, a.id, Object.assign({}, pj, { valid: true })); body.eco = paid.eco; postedBill = paid.bill || null; }
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
        // the regulars are the part of a career that grows with play: their saved cuts stay within a byte budget
        if (HSC.careerSave.trimRegs) body.regs = HSC.careerSave.trimRegs(body.regs);
      }
      body.active = null;
      return withNextContract(body);
    }).then((landed) => {
      run.completing = null;
      if (!landed) {
        // nothing was written. A valid finish (the result screen has shown its pay) is owed: it is written again on
        // the next commit or the next chair, keyed by the contract id so it is never paid twice, and the contract is
        // not seated again from his start meanwhile. An incomplete finish is simply worked again.
        const b = act();
        run.owed = valid && b && b.id === a.id && b.state !== 'completed' ? o || { id: a.id, s: keep(s), stars, judged, valid, pj } : null;
        return;
      }
      if (run.owed && run.owed.id === a.id) run.owed = null;
      mirror();
      const n = act(), d = M() && M().data, g = G(), cur = g && g.getState();
      if (postedBill && d && d.lastRound && d.lastRound.key === a.id && !d.lastRound.bill) {
        d.lastRound.bill = postedBill; d.lastRound.lines = (d.lastRound.lines || []).concat(postedBill.lines || []); M().save();
      }
      if (!n || !d) return;
      // Next was pressed while the result was being written: the chair got an ordinary walk-in, not a contract. If he
      // is still untouched he is replaced by the contract's customer straight away (the game's own skip, as a mode
      // switch does); once cut he is practice and the contract waits for the next chair
      if (cur && cur.jobId > s.jobId) {
        const mine = cur.look && cur.look.person && cur.look.person.seed === n.person.seed && n.job === cur.jobId;
        const untouched = cur.status === 'cutting' && !(cur.cutStrokeCount > 0) && !changed(cur) && !browsTouched(cur);
        if (!mine && untouched && g.skip && HSC.modes && HSC.modes.current() === 'career') {
          const job = cur.jobId + 1;
          n.job = null;
          if (n.state === 'offered') d.queue = { job, person: Object.assign({}, n.person, { job }), profile: n.start.profile };
          else if (d.queue && d.queue.job === job) d.queue = null;
          M().save();
          g.skip();
        }
        return;
      }
      // the next career customer waits for the next chair (the reveal screen shows him)
      if (n.state === 'offered') { n.job = s.jobId + 1; d.queue = { job: s.jobId + 1, person: Object.assign({}, n.person, { job: s.jobId + 1 }), profile: n.start.profile }; M().save(); }
    });
  }
  // the finished chair as it was at the reveal (the engine's state moves on to the next customer)
  const keep = (s) => { const out = Object.assign({}, s); for (const k of ['hair', 'startHair', 'beard', 'startBeard', 'brow']) if (s[k] && s[k].slice) out[k] = s[k].slice(); return out; };
  // write an owed completion again (commit, person, start); dropped once its contract is no longer the active one
  function retryOwed() {
    const o = run.owed, a = act();
    if (!o || run.completing) return;
    if (!a || a.id !== o.id || a.state === 'completed') { run.owed = null; return; }
    a.job = o.s.jobId; a.seated = o.s.jobId;
    done(o.s, o.stars, o);
    if (run.completing !== a.id) run.owed = null; // refused before writing: never left blocking his chair
  }
  // the app closed at a reveal before its Career result was written: when the career is ready again and the game is
  // back at that reveal, the completion is made now (idempotent: the contract id keys the pay and the progress)
  function replay() {
    const a = act(), g = G(), s = g && g.getState(), d = M() && M().data, lr = d && d.lastRound;
    if (!a || !s || !lr || s.status !== 'reveal' || lr.key !== a.id || lr.job !== s.jobId || run.completing === a.id || a.doneJob === s.jobId) return;
    if (!s.look || !s.look.person || !a.person || s.look.person.seed !== a.person.seed) return;
    a.job = s.jobId; a.seated = s.jobId;
    done(s, lr.stars);
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
    const landed = await commit((b) => {
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
    return ok && !!landed;
  }
  // the world map's choice: the next chapter's city (refused while a contract is in progress)
  async function chooseCity(id) {
    let ok = false;
    const b0 = run.body;
    if (!b0 || inProgress(b0.active) || C().phase(b0.core) !== 'map' || !C().selectable(b0.core).includes(id)) return false;
    const landed = await commit((b) => {
      const sel = C().selectCity(b.core, id);
      if (sel.error) return b;
      const body = JSON.parse(JSON.stringify(b));
      body.core = sel.state; body.active = null; ok = true;
      return withNextContract(body);
    });
    return ok && !!landed;
  }

  HSC.careerRun = {
    init, ensure, person, start, request, unscored, done, suspend, chooseCity, found, needsChoice, replay,
    body: () => run.body, ready: () => run.ready, active: act,
    // a career saved by a newer game version: kept untouched; Career asks for an update (save contract section 8)
    tooNew: () => !!run.tooNew,
    rank: () => (run.body ? C().rank(run.body.core, SPECIALIST()) : null),
  };
  // start once the progress save and the game are up
  const boot = () => {
    const client = M() && M().client;
    if (!client || !HSC.careerSave || !HSC.career || !HSC.director || !HSC.careerCatalog || !G()) return setTimeout(boot, 300);
    init(client).catch((e) => console.error('career: load failed', e)).then(() => { run.initDone = true; });
  };
  boot();
})(globalThis.HSC || (globalThis.HSC = {}));
