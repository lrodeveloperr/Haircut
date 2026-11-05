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
  function tableFor(cityId) { const c = HSC.career && HSC.career.city(cityId); return (c && c.population) || neutralTable(); }
  // the weighted-fair scheduler (variability section 4): each draw adds every group's share to its deficit, the
  // largest deficit is chosen (seeded tie-break) and loses one; deficits persist per city and are bounded
  function drawGroup(pop, cityId, R) {
    const t = tableFor(cityId).groups, ids = Object.keys(t), total = ids.reduce((a, k) => a + t[k], 0) || 1;
    const d = (pop[cityId] = pop[cityId] || {});
    for (const k of ids) d[k] = Math.max(-2, Math.min(4, (d[k] || 0) + t[k] / total));
    let best = null;
    for (const k of ids) if (best == null || d[k] > d[best] + 1e-9 || (Math.abs(d[k] - d[best]) < 1e-9 && R.next() < 0.5)) best = k;
    d[best] -= 1;
    return +best;
  }

  const traitsOf = (p, silhouette) => ({ silhouette, texture: (p.hair && p.hair.type) || '1b', beard: p.beard.style, age: p.years });
  function makeCatalog(env) {
    // env: { pop (per-city deficits, saved), regs (per-city regulars, saved), recent walk-ins }
    const catalog = {
      modes: {
        requests: { lane: (st, rq) => (rq.drop >= BIG_DROP ? 'transformation' : 'precision') },
        fix: { lane: () => 'recovery', specialist: true, eligible: () => HSC.modes.unlocked('fix') },
        beard: { lane: () => 'precision', specialist: true, eligible: () => HSC.modes.unlocked('beard') },
        relax: { lane: () => 'service', specialist: true, eligible: () => HSC.modes.unlocked('relax') },
        rush: { lane: () => 'pressure', specialist: true, eligible: () => HSC.modes.unlocked('rush') },
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
        if (ctx.mode === 'beard') opts.beard = ['full', 'boxed', 'long', 'garibaldi', 'ducktail', 'shenandoah'][Math.floor(R.next() * 6)];
        const p = HSC.makePerson(seed, opts);
        if (ctx.source === 'vip') p.vip = true;
        if (ctx.source === 'visitor') p.visitor = true;
        return { person: p, traits: traitsOf(p, null) };
      },
      starts(cu, mode, ctx) {
        const p = cu.person, W = HSC.walkIns, R = HSC.rng((p.seed ^ 0x9e3779b9) >>> 0);
        let walk, profile;
        if (cu.regular && cu.regular.h) {
          // a regular comes back with his last cut grown out (two to four weeks)
          const h = HSC.gridUnpack(cu.regular.h, 5), b = HSC.gridUnpack(cu.regular.b, HSC.BEARD_MM.length - 1), u = HSC.gridUnpack(cu.regular.u, HSC.BEARD_MM.length - 1);
          if (h && b && u) { const g = HSC.regularGrow(h, b, u, 2 + (cu.regular.visits % 3)); walk = g.hair; cu.startBeard = g.beard; profile = 'grown:' + (cu.regular.usual || 'own'); }
        }
        if (!walk) { const w = HSC.pickWalkIn(p, (env.recent || []).slice(-4)); if (!w) return []; walk = W.build(w); profile = w.id; }
        const beard0 = cu.startBeard || HSC.beardStartFor(p);
        const base = { silhouette: profile, beard: p.beard.style, hair: walk, beardGrid: beard0, cost: {} };
        if (mode === 'fix') { const j = B().disaster(p, walk, R); return j ? [Object.assign({}, base, { id: 'disaster', silhouette: profile + ':botched:' + j.flaws.join('+'), hair: j.start, job: j, cost: { repair: 1 } })] : []; }
        if (mode === 'rush') { const j = B().tidy(p, walk, R); return j ? [Object.assign({}, base, { id: 'tidy', silhouette: profile + ':tidy', hair: j.start, job: j, cost: { time: 1 } })] : []; }
        if (mode === 'beard') return p.beard.style === 'clean' || /^stubble/.test(p.beard.style) ? [] : [Object.assign({}, base, { id: 'beard' })];
        return [Object.assign({}, base, { id: cu.regular ? 'regular' : 'walkin' })];
      },
      requests(cu, st, mode, ctx) {
        const p = cu.person, kit = K();
        if (mode === 'fix' || mode === 'rush') return [{ id: st.job.style.id, family: st.job.style.fam || 'fix', target: st.job.target, drop: dropOf(st.hair, st.job.target), cost: { precision: mode === 'rush' ? 0 : 1 }, weight: 1 }];
        if (mode === 'beard') {
          const j = B().beardJob(p, st.beardGrid, HSC.rng((p.seed ^ 0x51ed27) >>> 0));
          return j ? [{ id: 'beard:' + j.style, family: 'beard:' + j.style, beardGoal: j.style, beardTarget: j.target, cost: { precision: ['goatee', 'vandyke', 'anchor', 'balbo', 'circle'].includes(j.style) ? 1 : 0 }, weight: 1, drop: 0 }] : [];
        }
        if (mode === 'relax') {
          const want = HSC.servicesWanted ? ['towel', 'lather', 'massage', 'aftershave', 'talc', 'pomade'].filter((k) => level() >= ({ towel: 2, lather: 9, massage: 3, aftershave: 1, talc: 3, pomade: 4 })[k]).slice(0, 4) : [];
          if (!want.length) return [];
          return [{ id: 'ritual:' + want.join('+'), family: 'ritual', services: want, cost: { services: want.length >= 3 ? 1 : 0 }, weight: 1, drop: 0 }];
        }
        // orders: every suitable, achievable cut (the regular's usual weighted up)
        const opts = B().options(p, st.hair).map(([w, style, target]) => ({ id: style.id, family: style.fam + ':' + (style.contour || ''), target, drop: dropOf(st.hair, target), cost: { precision: ['part', 'crew', 'temple', 'taper'].includes(style.contour) ? 1 : 0 }, weight: w * (cu.regular && cu.regular.usual === style.id ? 4 : 1) }));
        return ctx.broad ? opts : opts;
      },
      validate(c) {
        const r = [];
        const t = c.request.target, h = c.start.hair;
        if (t) { for (let i = 0; i < 8192; i++) if (t[i] > h[i]) { r.push('needs-growth'); break; } }
        if (c.request.beardTarget) { const b = c.start.beardGrid; for (let i = 0; i < 8192; i++) if (c.request.beardTarget[i] > b[i]) { r.push('beard-needs-growth'); break; } }
        if (c.mode === 'beard' && !c.request.beardTarget) r.push('no-beard-target');
        if (c.mode !== 'relax' && c.mode !== 'beard' && t && dropOf(h, t) < 150) r.push('nothing-to-cut');
        if (c.mode === 'relax' && !(c.request.services && c.request.services.length)) r.push('no-service');
        if (c.mode !== 'requests' && !HSC.modes.unlocked(c.mode)) r.push('mode-locked');
        return r;
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

  HSC.careerCatalog = { make: makeCatalog, neutralTable, drawGroup, dropOf };
})(globalThis.HSC || (globalThis.HSC = {}));
