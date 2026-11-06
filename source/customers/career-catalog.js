// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the career director's catalog, built from the game itself
// (docs/CAREER-CONTRACT-DIRECTOR.md section 3-5; CITY-CUSTOMER-VARIABILITY.md sections 3-9).
//
//   customers   resident (the city's weighted-fair population scheduler), visitor, VIP, or a returning regular
//               (restored, never rerolled); the game's own person generator draws the physical traits
//   starts      a walk-in cut, a regular's grown-out last cut, a hair disaster, a tidy-up or a beard to shape
//   requests    every style the engine can build that suits the person and is shorter than the start
//   validate    returns reason codes: nothing to grow back, tools and services unlocked, beard present, ...
//   baseline    a trim one length shorter everywhere: always achievable from any start with hair to cut
//
// City tables (population mix, style and tattoo tendencies) are data. Until the owner's researched tables arrive
// every city uses the neutral shared table: the game's global heritage weights, marked low confidence. Nothing
// here derives a style, tattoo or behaviour from heritage; heritage only picks plausible physical appearance.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const M = () => HSC.meta;
  const H = () => HSC.HERITAGE || [];
  const K = () => HSC.requestKit, B = () => HSC.modes && HSC.modes.build;
  const level = () => (M() && M().data ? M().level() : 1);
  const BIG_DROP = 2600; // total levels removed: above this a cut is a transformation, below a precision job

  // ---- the neutral population table (low confidence; city research replaces it per city) ----
  function neutralTable() { const t = {}; H().forEach((h, i) => { t[i] = h.w; }); return { groups: t, confidence: 'low', source: 'neutral-global' }; }
  // a sourced population table wins; otherwise the city's main group is about two-thirds of its customers, a second group
  // about one in seven, and the neutral table the rest, so no city is ever uniform
  const MAIN = 0.65, SECOND = 0.15;
  function tableFor(cityId) {
    const c = HSC.career && HSC.career.city(cityId);
    if (c && c.population) return c.population;
    const n = neutralTable(), ids = H().map((h) => h.id), [a, b] = (c && c.people) || [];
    if (ids.indexOf(a) < 0 || ids.indexOf(b) < 0) return n;
    const tot = Object.values(n.groups).reduce((x, y) => x + y, 0), g = {};
    for (const k in n.groups) g[k] = (1 - MAIN - SECOND) * (n.groups[k] / tot);
    g[ids.indexOf(a)] += MAIN; g[ids.indexOf(b)] += SECOND;
    return { groups: g, confidence: 'low', source: 'owner-provisional' };
  }
  // the weighted-fair scheduler (variability section 4): each draw adds every group's share to its deficit, the
  // largest deficit is chosen (seeded tie-break) and loses one; deficits persist per city and are bounded
  // Choosing does not change the saved deficits: a generation transaction tries several candidates, and only the
  // customer of the contract finally offered is counted (commitGroup), once.
  function step(pop, cityId) {
    const t = tableFor(cityId).groups, ids = Object.keys(t), total = ids.reduce((a, k) => a + t[k], 0) || 1;
    const d0 = pop[cityId] || {}, d = {};
    for (const k of ids) d[k] = Math.max(-2, Math.min(4, (d0[k] || 0) + t[k] / total));
    return { ids, d };
  }
  function drawGroup(pop, cityId, R) {
    const { ids, d } = step(pop, cityId);
    let best = null;
    for (const k of ids) if (best == null || d[k] > d[best] + 1e-9 || (Math.abs(d[k] - d[best]) < 1e-9 && R.next() < 0.5)) best = k;
    return +best;
  }
  function commitGroup(pop, cityId, group) {
    const { d } = step(pop, cityId);
    if (!(String(group) in d)) return pop;
    d[group] -= 1;
    pop[cityId] = d;
    return pop;
  }

  const traitsOf = (p, silhouette) => ({ silhouette, texture: (p.hair && p.hair.type) || '1b', beard: p.beard.style, age: p.years });
  function makeCatalog(env) {
    // env: { pop (per-city deficits, saved), regs (per-city regulars, saved), recent walk-ins }
    const catalog = {
      modes: {
        requests: { lane: (st, rq) => (rq.drop >= BIG_DROP ? 'transformation' : 'precision') },
        fix: { lane: () => 'recovery', specialist: true, eligible: () => HSC.modes.unlocked('fix') },
        beard: { lane: () => 'precision', specialist: true, eligible: () => HSC.modes.unlocked('beard') },
        rush: { lane: () => 'pressure', specialist: true, eligible: () => HSC.modes.unlocked('rush') },
      },
      // the city's own setting, kept inside the registry's bound; the 12% neutral fallback until a city is researched
      visitorShare(cityId) {
        const c = (HSC.CITIES || []).find((x) => x.id === cityId), v = c && c.visitor;
        return v && v.share >= 0 ? Math.min(v.share, HSC.cityRegistry.VISITOR_MAX) : 0;
      },
      customer(seed, ctx) {
        if (ctx.source === 'regular' && ctx.regular && ctx.regular.person) {
          const p = Object.assign({}, ctx.regular.person);
          return { person: p, regular: ctx.regular, traits: traitsOf(p, 'grown:' + (ctx.regular.usual || 'own') + ':' + ctx.regular.visits) };
        }
        const R = HSC.rng(seed);
        const opts = {};
        // residents follow the city's population scheduler; visitors and VIPs use the neutral world table
        if (ctx.source === 'resident') opts.heritage = drawGroup(env.pop, ctx.city, R);
        const draw = ctx.source === 'resident' ? { city: ctx.city, group: opts.heritage } : null;
        // residents also follow their city's habits: its age mix, and how many men wear facial hair
        const home = ctx.source === 'resident' && HSC.career && HSC.career.city(ctx.city), habit = home && home.habits;
        if (habit) { const a = R.next(), [y, m] = habit.age; opts.age = a < y ? 'young' : a < y + m ? 'middle' : 'old'; }
        const bearded = habit && ctx.mode !== 'beard' ? R.next() < habit.beard : null;
        // Beards selects someone who already has a beard to shape; it never writes one onto a customer
        const want = ctx.mode === 'beard' ? HSC.BEARD_ARRIVALS[seed % HSC.BEARD_ARRIVALS.length] : null;
        const p = want ? HSC.selectPerson(seed, opts, (x) => x.beard.style === want, 600) || HSC.makePerson(seed, Object.assign({}, opts, { beard: want })) : bearded != null ? HSC.selectPerson(seed, opts, (x) => (x.beard.style !== 'clean') === bearded, 60) || HSC.makePerson(seed, opts) : HSC.makePerson(seed, opts);
        if (!p) return null;
        if (habit) p.local = { tattoo: habit.tattoo, ear: habit.ear }; // what is usual where he lives (extras.js)
        if (ctx.source === 'vip') p.vip = true;
        // a visitor's origin is recorded: the neutral world table until a city's visitor mix is researched
        if (ctx.source === 'visitor') p.visitor = { origin: 'neutral-world', v: 1 };
        return { person: p, traits: traitsOf(p, null), draw };
      },
      starts(cu, mode, ctx) {
        const p = cu.person, W = HSC.walkIns, R = HSC.rng((p.seed ^ 0x9e3779b9) >>> 0);
        let walk, profile;
        if (cu.regular && cu.regular.h) {
          // a regular comes back with his last cut grown out (two to four weeks)
          const h = HSC.gridUnpack(cu.regular.h, 5), b = HSC.gridUnpack(cu.regular.b, HSC.BEARD_MM.length - 1), u = HSC.gridUnpack(cu.regular.u, HSC.BEARD_MM.length - 1);
          // regrowth follows the career calendar: about a week per chapter (five contracts) since his last visit,
          // one to six weeks; a record from before the calendar keeps the old two-to-four-week rhythm
          const weeks = Number.isSafeInteger(cu.regular.lastDay) && Number.isSafeInteger(ctx && ctx.turn) ? Math.max(1, Math.min(6, Math.round((ctx.turn - cu.regular.lastDay) / 5))) : 2 + (cu.regular.visits % 3);
          if (h && b && u) { const g = HSC.regularGrow(h, b, u, weeks); walk = g.hair; cu.startBeard = g.beard; profile = 'grown:' + (cu.regular.usual || 'own') + ':w' + weeks; }
        }
        if (!walk) { const w = HSC.pickWalkIn(p, (env.recent || []).slice(-4)); if (!w) return []; walk = W.build(w); profile = w.id; }
        const beard0 = cu.startBeard || HSC.beardStartFor(p);
        const base = { silhouette: profile, beard: p.beard.style, hair: walk, beardGrid: beard0, cost: {} };
        if (mode === 'fix') { const j = B().disaster(p, walk, R, null, beard0); return j ? [Object.assign({}, base, { id: 'disaster', silhouette: profile + ':botched:' + j.flaws.join('+'), hair: j.start, beardGrid: j.beard ? j.beard.start : beard0, job: j, cost: { repair: 1 } })] : []; }
        if (mode === 'rush') { const j = B().tidy(p, walk, R); return j ? [Object.assign({}, base, { id: 'tidy', silhouette: profile + ':tidy', hair: j.start, job: j, cost: { time: 1 } })] : []; }
        if (mode === 'beard') return p.beard.style === 'clean' || /^stubble/.test(p.beard.style) ? [] : [Object.assign({}, base, { id: 'beard' })];
        return [Object.assign({}, base, { id: cu.regular ? 'regular' : 'walkin' })];
      },
      requests(cu, st, mode, ctx) {
        const p = cu.person, kit = K();
        // a rescue's complexity is its repair (the start's cost), not a second precision charge, so the licence's
        // rescue chapter (bands 1-2, budget 1) offers real repairs instead of falling back to a trim
        if (mode === 'fix' || mode === 'rush') return [{ id: st.job.style.id, family: st.job.style.fam || 'fix', target: st.job.target, beardGoal: st.job.beard ? st.job.beard.style : undefined, beardTarget: st.job.beard ? st.job.beard.target : undefined, drop: dropOf(st.hair, st.job.target), cost: { precision: 0 }, weight: 1 }];
        if (mode === 'beard') {
          const j = B().beardJob(p, st.beardGrid, HSC.rng((p.seed ^ 0x51ed27) >>> 0));
          return j ? [{ id: 'beard:' + j.style, family: 'beard:' + j.style, beardGoal: j.style, beardTarget: j.target, cost: { precision: ['goatee', 'vandyke', 'anchor', 'balbo', 'circle'].includes(j.style) ? 1 : 0 }, weight: 1, drop: 0 }] : [];
        }
        // orders: every suitable, achievable cut. A Familiar regular (two visits) asks for his usual, or a mild
        // variation of it (the same family), more often (director section 12)
        const R0 = cu.regular, fam = R0 && R0.usual && HSC.requestKit && HSC.requestKit.byId.get(R0.usual);
        const lean = (style) => (!R0 || (R0.visits | 0) < 2 ? 1 : R0.usual === style.id ? 4 : fam && fam.fam === style.fam ? 2 : 1);
        // the city's popular cuts lean up; every suitable cut stays possible
        const home = ctx && ctx.city && HSC.career ? HSC.career.city(ctx.city) : null, cuts = (home && home.habits && home.habits.cuts) || {};
        const opts = B().options(p, st.hair).map(([w, style, target]) => ({ id: style.id, family: style.fam + ':' + (style.contour || ''), target, drop: dropOf(st.hair, target), cost: { precision: ['part', 'crew', 'temple', 'taper'].includes(style.contour) ? 1 : 0 }, weight: w * lean(style) * (cuts[style.fam] || 1) }));
        // about half of the men with a beard want it done too: one order for the hair and the beard
        const bj = (p.seed & 1) === 0 ? B().beardJob(p, st.beardGrid, HSC.rng((p.seed ^ 0x51ed29) >>> 0)) : null;
        if (bj) for (const o of opts) Object.assign(o, { beardGoal: bj.style, beardTarget: bj.target });
        // the broad stage (director fallback 5): a plausible style without its usual weighting, still feasible
        return ctx.broad ? opts.map((o) => Object.assign(o, { weight: 1 })) : opts;
      },
      validate(c) {
        const r = [];
        const t = c.request.target, h = c.start.hair;
        if (t) { for (let i = 0; i < 8192; i++) if (t[i] > h[i]) { r.push('needs-growth'); break; } }
        if (c.request.beardTarget) { const b = c.start.beardGrid; for (let i = 0; i < 8192; i++) if (c.request.beardTarget[i] > b[i]) { r.push('beard-needs-growth'); break; } }
        if (c.mode === 'beard' && !c.request.beardTarget) r.push('no-beard-target');
        if (c.mode !== 'beard' && t && dropOf(h, t) < 150) r.push('nothing-to-cut');
        if (c.mode !== 'requests' && !HSC.modes.unlocked(c.mode)) r.push('mode-locked');
        // owned tools: a beard request is offered only if the unlocked tools can bring 85% of the beard it changes
        // within one length of the target (the 3-star line); the scalp is always reachable with the clipper's guards
        if (c.request.beardTarget && HSC.beardReach) {
          const reach = HSC.beardReach(), b = c.start.beardGrid, t = c.request.beardTarget;
          let need = 0, ok = 0;
          for (let i = 0; i < 8192; i++) {
            if (!(t[i] < b[i])) continue;
            need++;
            if (reach.some((l) => l <= b[i] && Math.abs(l - t[i]) <= 1)) ok++;
          }
          if (need && ok / need < 0.85) r.push('tool-unavailable');
        }
        return r;
      },
      // the broad state he sits down with (map logic section 9): hair shaved / short / medium / long by the mean
      // scalp length, and facial hair clean / stubble / beard by the mean length of the grown beard cells
      presence(c) {
        const h = c.start.hair, b = c.start.beardGrid, MM = HSC.BEARD_MM;
        let hs = 0, hn = 0, bs = 0, bn = 0;
        if (h) for (let i = 0; i < 8192; i += 5) { hs += h[i]; hn++; }
        if (b) for (let i = 0; i < 8192; i += 5) if (b[i] > 0) { bs += MM[b[i]]; bn++; }
        const m = hn ? hs / hn : 0, bm = bn ? bs / bn : 0;
        const hair = m < 0.6 ? 'shaved' : m < 2 ? 'short' : m < 3.5 ? 'medium' : 'long';
        const beard = bn < 80 ? 'clean' : bm <= 2 ? 'stubble' : 'beard';
        return hair + '|' + beard;
      },
      // seconds a Rush tidy-up needs: the regrowth to clear at a steady clipper pace (about 200 cells a second for
      // the 0.56-wide clipper), plus pick-up, a tool switch
      // and the reveal, then a 1.5x accessibility margin (director section 6)
      timeNeeded(c) {
        const h = c.start.hair, t = c.request.target;
        if (!h || !t) return 0;
        let cells = 0;
        for (let i = 0; i < 8192; i++) if (h[i] > t[i]) cells++;
        return (cells / 200 + 3 + 2 + 3) * 1.5;
      },
      baseline(cu, ctx, st) {
        const s0 = st || (catalog.starts(cu, 'requests', ctx) || [])[0];
        if (!s0) return null;
        const target = s0.hair.map((v) => Math.max(0, v - 1));
        return { start: s0, request: { id: 'trim', family: 'trim', target, drop: dropOf(s0.hair, target), cost: {}, weight: 1 } };
      },
    };
    return catalog;
  }
  function dropOf(a, b) { let d = 0; for (let i = 0; i < 8192; i++) d += Math.max(0, a[i] - b[i]); return d; }

  HSC.careerCatalog = { make: makeCatalog, neutralTable, tableFor, drawGroup, commitGroup, dropOf };
})(globalThis.HSC || (globalThis.HSC = {}));
