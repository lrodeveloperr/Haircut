// ---------------------------------------------------------------------------------------------
// Game-state side: the customer record and beard grid live in the saved session.
//   state.look.person    the customer (see people.js)
//   state.beard          beard length level per grid cell (index into BEARD_MM)
//   state.startBeard     the beard the customer walked in with
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const LEVELS = () => HSC.BEARD_MM.length;
  const checked = new WeakSet();
  const okBeard = (a) => {
    if (checked.has(a)) return true;
    const ok = Array.isArray(a) && a.length === 8192 && a.every((v) => Number.isInteger(v) && v >= 0 && v < LEVELS());
    if (ok) checked.add(a);
    return ok;
  };

  // Walk-in hair: a style family by age and hair loss, then a style in it. Lengths are hair levels (1 = 3 mm,
  // 2 = 6, 3 = 9, 4 = 12, 5 = 16 mm); every starting length is above guard 0, so all of it can be cut.
  //   long   a 16 mm top over shorter sides (fades, tapers, undercuts)    full    16 mm all over
  //   crop   a 9 or 12 mm top over shorter sides                         buzz    6-12 mm all over
  //   tight  3 mm sides under a longer top (high and tight)              shaved  3 mm regrowth all over
  const FAMILY_BY_AGE = {
    young: { long: 34, crop: 24, tight: 12, buzz: 14, shaved: 6, full: 10 },
    middle: { long: 28, crop: 26, tight: 6, buzz: 18, shaved: 9, full: 13 },
    old: { long: 20, crop: 26, tight: 2, buzz: 22, shaved: 14, full: 16 },
  };
  // with more hair loss men keep it shorter: from a Norwood 4 on, buzz and shaved heads take over
  const FAMILY_BY_LOSS = { light: { long: 1, crop: 1.1, tight: 0.9, buzz: 1.4, shaved: 1.6, full: 0.6 }, heavy: { long: 0.35, crop: 0.8, tight: 0.3, buzz: 2.4, shaved: 3.4, full: 0.15 } };
  const CONTOUR_BY_AGE = {
    young: { low: 1, mid: 1.2, high: 1.2, drop: 1.1, taper: 0.8, even: 1 },
    middle: { low: 1.2, mid: 1, high: 0.7, drop: 0.8, taper: 1.2, even: 1 },
    old: { low: 1.3, mid: 0.8, high: 0.4, drop: 0.5, taper: 1.5, even: 1 },
  };
  // Android cuts (patch16): burst / temple / skin fades, the classic side part and crew, faux hawk, undercut
  const NEW_FAMILY = { burst: 'fade', temple: 'fade', hawk: 'hawk', undercut: 'undercut', part: 'classic', crew: 'classic' };
  const familyOf = (w) => (NEW_FAMILY[w.contour] ? NEW_FAMILY[w.contour] : w.contour === 'even' ? (w.top === 5 ? 'full' : w.top === 1 ? 'shaved' : 'buzz')
    : w.side === 1 && w.top === 5 ? (['low', 'drop', 'taper'].includes(w.contour) ? 'fade' : 'tight') : w.top === 5 ? 'long' : 'crop');
  const PH = HSC.PHENOTYPES;
  if (PH && PH.families) for (const [age, w] of Object.entries(PH.families)) Object.assign(FAMILY_BY_AGE[age], w);
  if (PH && PH.families) for (const k of ['fade', 'classic', 'hawk', 'undercut']) { FAMILY_BY_LOSS.light[k] = { fade: 1, classic: 1, hawk: 0.8, undercut: 0.8 }[k]; FAMILY_BY_LOSS.heavy[k] = { fade: 0.6, classic: 0.4, hawk: 0.2, undercut: 0.2 }[k]; }
  const lossOf = (person) => {
    const b = person.bald || {};
    const stage = { 1: 0, 2: 1, 3: 2, '3v': 2.5, 4: 3, 5: 4, 6: 5, 7: 6 }[b.norwood] || 0;
    return stage >= 3 || b.type === 'diffuse' ? 'heavy' : stage >= 1 || b.type === 'crown' ? 'light' : null;
  };
  HSC.walkInFamily = familyOf;
  // fam: the family the variety director dealt (meta.js); without one it is drawn here by age and hair loss
  HSC.pickWalkIn = function (person, recent = [], famIn) {
    const W = HSC.walkIns;
    if (!W || !person) return null;
    const R = HSC.rng(((person.seed >>> 0) ^ 0x5bd1e995) >>> 0 || 1);
    const age = FAMILY_BY_AGE[person.age] ? person.age : 'middle';
    const loss = lossOf(person), lw = loss ? FAMILY_BY_LOSS[loss] : null;
    const last = recent.slice(-4), lastFam = recent.length ? familyOf(W.list.find((w) => w.id === recent[recent.length - 1]) || {}) : null;
    // family weights; the family just seen counts for less, so two in a row of the same kind are rarer
    const fw = {};
    for (const [f, v] of Object.entries(FAMILY_BY_AGE[age])) fw[f] = v * (lw ? lw[f] : 1) * (f === lastFam ? 0.35 : 1);
    const fam = famIn && FAMILY_BY_AGE.young[famIn] != null ? famIn : R.pick(fw);
    const cw = CONTOUR_BY_AGE[age];
    let list = W.list.filter((p) => familyOf(p) === fam && !last.includes(p.id));
    if (!list.length) list = W.list.filter((p) => familyOf(p) === fam);
    // Android: cut shapes suit hair types (a temple taper is a coily-hair cut; a hard side part needs straight or wavy hair)
    const coily = person.hair && /^(3c|4)/.test(person.hair.type), straight = person.hair && /^[12]/.test(person.hair.type);
    const tex = (c) => (!PH ? 1 : c === 'temple' ? (coily ? 3 : 0.4) : c === 'burst' ? (coily ? 1.4 : 1) : c === 'part' || c === 'crew' ? (straight ? 1 : 0.15) : 1);
    const weights = list.map((p) => (cw[p.contour] || 1) * tex(p.contour));
    let r = R.next() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) if ((r -= weights[i]) <= 0) return list[i];
    return list[list.length - 1];
  };
  // the queued regular's grown-out hair and beard for this job, or null
  function regularOf(s, person) {
    const q = HSC.meta && HSC.meta.data && HSC.meta.data.queue;
    if (!q || q.job !== s.jobId || !q.regular || !person || !q.person || q.person.seed !== person.seed || !HSC.gridUnpack || !HSC.walkIns) return null;
    const hair = HSC.gridUnpack(q.regular.h, 5), beard = HSC.gridUnpack(q.regular.b, LEVELS() - 1);
    return hair && beard ? { hair, beard } : null;
  }
  HSC.regularOf = regularOf;
  function walkIn(s, person) {
    if (s.status !== 'cutting' || s.cutStrokeCount || !s.look || s.look.visit !== 'walk-in') return null;
    if (!Array.isArray(s.hair) || !Array.isArray(s.startHair) || s.hair.some((v, i) => v !== s.startHair[i])) return null;
    const recent = Array.isArray(s.recentLooks) ? s.recentLooks.slice(0, -1) : [];
    // VIPs and the very first customer come in with a full, even head of hair: the most to cut
    const q = HSC.meta && HSC.meta.data && HSC.meta.data.queue;
    // a regular (meta.js) walks in with his last cut grown out
    const reg = regularOf(s, person);
    if (reg) {
      const prof = q.profile && HSC.walkIns.list.some((w) => w.id === q.profile) ? q.profile : s.look.profile;
      const recentLooks = Array.isArray(s.recentLooks) && s.recentLooks.length ? [...s.recentLooks.slice(0, -1), prof] : [prof];
      return { hair: reg.hair, startHair: reg.hair.slice(), recentLooks, profile: prof };
    }
    const queued = q && q.job === s.jobId && q.profile && HSC.walkIns && HSC.walkIns.list.find((w) => w.id === q.profile);
    const p = queued || (person.vip || person.first ? HSC.walkIns && HSC.walkIns.list.find((w) => w.contour === 'even') : HSC.pickWalkIn(person, recent));
    if (!p) return null;
    const hair = HSC.walkIns.build(p);
    const recentLooks = Array.isArray(s.recentLooks) && s.recentLooks.length ? [...s.recentLooks.slice(0, -1), p.id] : [p.id];
    return { hair, startHair: hair.slice(), recentLooks, profile: p.id };
  }

  // make sure the session has a customer and beard for the current job (deterministic per job)
  HSC.ensure = function (s) {
    if (!s || !s.look) return s;
    let person = s.look.person;
    const fresh = !HSC.debugOverride && (!HSC.validPerson(person) || person.job !== s.jobId);
    if (fresh) {
      const seed = ((s.seed >>> 0) ^ Math.imul((s.jobId | 0) + 1, 0x9e3779b1)) >>> 0;
      person = HSC.personForJob ? HSC.personForJob(s, seed || 1) : Object.assign(HSC.makePerson(seed || 1), { job: s.jobId });
    }
    // test hook: show a specific customer (never set by the game)
    let forced = false;
    if (HSC.debugOverride) {
      forced = s.look.person !== HSC.debugOverride;
      person = HSC.debugOverride;
    }
    let beard = s.beard, startBeard = s.startBeard;
    // Android: the brows start full for every new customer (and after a replay)
    const BN = HSC.BROW_N, okBrow = (a) => !BN || (Array.isArray(a) && a.length === BN && a.every((v) => v === 0 || v === 1 || v === 2));
    let brow = s.brow;
    if (BN && (fresh || forced || !okBrow(brow))) brow = new Array(BN).fill(2);
    if (fresh || forced || !okBeard(beard) || !okBeard(startBeard) || beard.some((v, i) => v > startBeard[i])) {
      const reg = fresh && !forced ? regularOf(s, person) : null;
      startBeard = reg ? reg.beard : HSC.beardStartFor(person);
      beard = startBeard.slice();
      checked.add(startBeard);
      checked.add(beard);
    }
    const w = fresh ? walkIn(s, person) : null;
    if (HSC.setBrow) HSC.setBrow(BN ? brow : null);
    if (!w && !fresh && !forced && beard === s.beard && startBeard === s.startBeard && brow === s.brow && s.look.colour === person.hair.colour) return s;
    const look = Object.assign({}, s.look, { person, colour: person.hair.colour }, w ? { profile: w.profile } : null);
    const out = Object.assign({}, s, { look, beard, startBeard }, BN ? { brow } : null);
    if (w) Object.assign(out, { hair: w.hair, startHair: w.startHair, recentLooks: w.recentLooks });
    return out;
  };

  // Android: a stroke on a brow. The razor, the trimmer and the clipper on guard 0 shave it (a slit, a clean arch);
  // the scissors, the beard trimmer and a clipper guard trim it short (thinner and lighter). Cells: 2 full, 1 short, 0 shaved.
  HSC.cutBrow = function (s, points) {
    const none = { state: s, changed: false, changedCells: 0, removedLength: 0, intensity: 0 };
    const cells = HSC.browCells && HSC.browCells();
    if (!s || s.status !== 'cutting' || s.interactionMode !== 'cut' || !cells || !Array.isArray(s.brow) || !Array.isArray(points)) return none;
    const tool = HSC.tool ? HSC.tool() : 'clipper';
    if (HSC.isRitual && HSC.isRitual()) return none;
    // each tool's millimetre target (tools.js); the old rule (razor/trimmer/guard 0 shave, the rest trim short)
    // remains only where the tools module is absent
    const to = HSC.toolBrow ? null : tool === 'razor' || tool === 'trimmer' || (tool === 'clipper' && s.selectedGuard === 0) ? 0 : 1;
    // on a brow a barber works with the blade's corner: a razor or trimmer slit is 2-3 mm wide. Brows face forward,
    // so the stroke is a brush of that width along the drag, in the brow grid's own x / y (cells are about 1 mm)
    const R = { razor: 0.03, trimmer: 0.04, scissors: 0.11, beard: 0.09, clipper: 0.14 }[tool] || 0.14;
    const next = s.brow.slice();
    let n = 0;
    const xy = (p) => (Number.isFinite(p.u) && Number.isFinite(p.v) ? [(p.u < 0.5 ? -1 : 1) * (0.2 + Math.abs(p.u - 0.5) * 2), 1.7 + p.v * 0.6] : null);
    const pts = points.map(xy).filter(Boolean);
    if (!pts.length) return none;
    const segs = pts.length === 1 ? [[pts[0], pts[0]]] : pts.slice(1).map((b, i) => [pts[i], b]);
    for (const [a, b] of segs) {
      // a stroke never jumps from one brow to the other
      if (Math.sign(a[0]) !== Math.sign(b[0])) continue;
      const x0 = Math.min(a[0], b[0]) - R, x1 = Math.max(a[0], b[0]) + R, y0 = Math.min(a[1], b[1]) - R, y1 = Math.max(a[1], b[1]) + R;
      const dx = b[0] - a[0], dy = b[1] - a[1], ll = dx * dx + dy * dy || 1e-9;
      for (let row = Math.max(0, Math.floor((y0 - 1.7) / 0.6 * 32)); row <= Math.min(31, Math.floor((y1 - 1.7) / 0.6 * 32)); row++) {
        const cy = 1.7 + (row + 0.5) / 32 * 0.6;
        for (let col = 0; col < 128; col++) {
          const u = (col + 0.5) / 128, cx = (u < 0.5 ? -1 : 1) * (0.2 + Math.abs(u - 0.5) * 2);
          if (cx < x0 || cx > x1) continue;
          const t = Math.max(0, Math.min(1, ((cx - a[0]) * dx + (cy - a[1]) * dy) / ll));
          if (Math.hypot(cx - a[0] - dx * t, cy - a[1] - dy * t) > R) continue;
          const c = row * 128 + col;
          const tc = to == null ? HSC.toolBrow(next[c], s.selectedGuard) : to;
          if (next[c] > tc) { next[c] = tc; n++; }
        }
      }
    }
    if (!n) return none;
    HSC.setBrow && HSC.setBrow(next);
    HSC.noteTool && HSC.noteTool(s.jobId);
    return { state: Object.assign({}, s, { brow: next, cutStrokeCount: s.cutStrokeCount + 1 }), changed: true, changedCells: n, removedLength: n * 0.4, intensity: Math.min(1, n / 60) };
  };

  // a clipper stroke on the beard: every cell under the blade is cut down to the guard length
  HSC.cutBeard = function (s, points, surface) {
    const none = { state: s, changed: false, changedCells: 0, removedLength: 0, intensity: 0 };
    if (!s || s.status !== 'cutting' || s.interactionMode !== 'cut' || !surface || !Array.isArray(points) || !points.length) return none;
    // Android tools (tools.js) may set their own beard length and blade width
    const guard = HSC.toolBeard ? HSC.toolBeard(s.selectedGuard) : HSC.GUARD_LEVEL[s.selectedGuard];
    if (guard == null || !okBeard(s.beard)) return none;
    const BLADE_W = HSC.bladeWidth ? HSC.bladeWidth() : 0.56, BLADE_D = 0.1;
    // walk from the previous blade position to the current one in small steps
    const steps = [];
    const valid = points.filter((p) => p && Array.isArray(p.position) && Array.isArray(p.normal));
    for (let i = 0; i < valid.length; i++) {
      const b = valid[i], a = i ? valid[i - 1] : null;
      if (!a) { steps.push(b); continue; }
      const d = Math.hypot(b.position[0] - a.position[0], b.position[1] - a.position[1], b.position[2] - a.position[2]);
      const n = Math.max(1, Math.min(40, Math.ceil(d / 0.03)));
      for (let k = 1; k <= n; k++) {
        const t = k / n, lerp = (u, v) => u.map((x, j) => x + (v[j] - x) * t);
        steps.push({ position: lerp(a.position, b.position), normal: lerp(a.normal, b.normal), bladeAcross: lerp(a.bladeAcross || [1, 0, 0], b.bladeAcross || [1, 0, 0]), bladeAlong: lerp(a.bladeAlong || [0, 1, 0], b.bladeAlong || [0, 1, 0]) });
      }
    }
    const next = s.beard.slice();
    const changed = new Set();
    let removed = 0;
    const { positions: pos, spatial } = surface;
    // how far past the touched surface the blade clears: Android reaches the hair under the jaw the camera never sees
    const DEPTH = HSC.beardDepth || 0.1;
    const reach = Math.hypot(BLADE_W / 2, BLADE_D / 2, DEPTH);
    const unit = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
    for (const p of steps) {
      const g = p.position, across = unit(p.bladeAcross), along = unit(p.bladeAlong), nrm = unit(p.normal);
      // Android: a stroke along the chin or jaw also takes the hair under it, which no camera angle can touch
      const low = HSC.beardDepth && g[1] < -0.3, far = low ? 1.5 : reach;
      const lo = g.map((x) => Math.floor((x - far) / spatial.size)), hi = g.map((x) => Math.floor((x + far) / spatial.size));
      for (let i = lo[0]; i <= hi[0]; i++) for (let j = lo[1]; j <= hi[1]; j++) for (let k = lo[2]; k <= hi[2]; k++) {
        const list = spatial.buckets.get(i + ',' + j + ',' + k);
        if (!list) continue;
        for (const c of list) {
          const d = [pos[c * 3] - g[0], pos[c * 3 + 1] - g[1], pos[c * 3 + 2] - g[2]];
          const dot = (v) => d[0] * v[0] + d[1] * v[1] + d[2] * v[2];
          const under = low && pos[c * 3 + 1] < -0.5 && d[1] < 0.05 && Math.abs(d[0]) <= BLADE_W / 2 && Math.hypot(d[0], d[1], d[2]) <= far;
          if (!under && (Math.abs(dot(across)) > BLADE_W / 2 || Math.abs(dot(along)) > BLADE_D / 2 || Math.abs(dot(nrm)) > DEPTH)) continue;
          const to = HSC.toolBeardCell ? HSC.toolBeardCell(next[c], guard) : guard;
          if (next[c] > to) {
            removed += HSC.BEARD_MM[next[c]] - HSC.BEARD_MM[to];
            next[c] = to;
            changed.add(c);
          }
        }
      }
    }
    if (!changed.size) return none;
    checked.add(next);
    HSC.noteTool && HSC.noteTool(s.jobId);
    return {
      state: Object.assign({}, s, { beard: next, cutStrokeCount: s.cutStrokeCount + 1 }),
      changed: true,
      changedCells: changed.size,
      removedLength: removed,
      intensity: Math.min(1, removed / Math.max(1, changed.size * 16)),
    };
  };
})(globalThis.HSC || (globalThis.HSC = {}));
