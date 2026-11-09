// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved items M1-M7, 5 November 2026): game modes, picked on the
// home screen (menu.js). Every mode keeps the interstitial after every cut, the undo videos and x3 tips.
//
//   requests  (M1) the career: a customer asks for a cut, 1-3 stars, tips, regulars, VIPs
//   free      (M2) Quick Play (the former freestyle; `free` stays the saved id): no request and no stars, no
//             progression; Finish brings the next customer. It is a Home action, not a Modes tile.
//   fix       (M3) Rescue: a clipper job gone wrong walks in, hair and sometimes beard (a gouge, tracks, a step, a crooked
//             line-up). There is no order and no stars: the barber rescues it on their own judgment, for a set pay once real
//             work is done (owner decision, 6 November 2026). Level 2.
//   beard     (M5) Beards: bearded customers, and the barber decides what to do. No order, no stars, a set pay. Level 2.
//   rush      (M7) Orders against a 45 s clock that ticks down: order, stars and the best pay of the modes, and the time left
//             adds coins. Never fails. The third customer in Orders is a one-off taste of it at its full pay; the mode itself
//             opens at level 6 (15 customers), free, with nothing that skips the wait. Career keeps these jobs from level 4.
// Inside Career the same rules hold, except that a showcase keeps its order and stars: a city's mastery is earned there.
// The mode, its current job (the flawed start and its repair) are saved with the progress.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const INK = '#10223f';
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio;
  const LIST = ['requests', 'free', 'fix', 'beard', 'rush'];
  const LEVEL = { career: 1, requests: 1, free: 1, fix: 2, beard: 2, rush: 6 };
  const CAREER_LEVEL = { fix: 2, beard: 2, rush: 4 }; // when Career may seat these jobs: the mode's own lock does not change Career
  const data = () => {
    const d = M() && M().data;
    if (!d) return null;
    if (!d.modes || typeof d.modes !== 'object') d.modes = { mode: 'requests', job: null };
    return d.modes;
  };
  const level = () => (M() && M().data ? M().level() : 1);
  // a mode the player has already played stays open
  const unlocked = (m) => level() >= LEVEL[m] || !!(data() && Array.isArray(data().tried) && data().tried.includes(m));
  const inCareer = (m) => level() >= (CAREER_LEVEL[m] || 1);
  // 'career' (career-run.js) is the main game; the listed modes are also playable on their own
  const CR = () => HSC.careerRun && HSC.careerRun.ready() ? HSC.careerRun : null;
  const current = () => { const md = data(); if (md && md.mode === 'career' && CR()) return 'career'; const m = md && LIST.includes(md.mode) ? md.mode : 'requests'; return unlocked(m) ? m : 'requests'; };
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0 || 1; };
  const today = () => (M() && M().today ? M().today() : new Date().toISOString().slice(0, 10));
  const K = () => HSC.requestKit;
  const pack = (a) => HSC.gridPack(a), unpack = (s, max) => (typeof s === 'string' ? HSC.gridUnpack(s, max) : null);
  const BTOP = () => (HSC.BEARD_MM ? HSC.BEARD_MM.length - 1 : 16);

  // ---- cuts that suit him and are worth cutting from this start, weighted (requests.js rules) ----
  function options(person, start) {
    const out = [];
    for (const st of K().STYLES) {
      if (st.fam === 'trim') continue;
      const w = K().askFor(st, person, start);
      if (!w) continue;
      const t = K().targetFor(st, start);
      if (K().worthCutting(start, t)) out.push([w, st, t]);
    }
    // only styles his hair can really make; if none fully fits, the closest list stays
    const honest = out.filter((o) => K().fits(o[1], start));
    return honest.length ? honest : out;
  }
  // the game avoids repeating itself: what was asked for or botched lately is far less likely to come up again. The list
  // is saved, and it only changes when a job is set or finished, so a request is the same after a reload. Career has its
  // own repetition rules (director.js), so its contracts stay purely seeded.
  const askId = (x) => (x && x.id) || x;
  const asked = () => { const md = data(); if (!md || current() === 'career') return []; return Array.isArray(md.ask) ? md.ask : (md.ask = []); };
  const recently = (x) => asked().includes(askId(x));
  const noteAsk = (x) => { const a = asked(); if (!data() || current() === 'career') return; a.push(askId(x)); if (a.length > 14) a.splice(0, a.length - 14); };
  function choose(R, opts) {
    const w = opts.map((o) => o[0] * (recently(o[1]) ? 0.1 : 1));
    let r = R.next() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < opts.length; i++) if ((r -= w[i]) <= 0) return opts[i];
    return opts[opts.length - 1];
  }
  const U = (i) => (i % 128) / 128, V = (i) => Math.floor(i / 128) / 64;
  const du = (a, b) => { const d = Math.abs(a - b); return Math.min(d, 1 - d); };

  // ---- M3: a hair disaster ----
  // The barber before finished a cut, then got it wrong. The customer arrives with that finished cut and its mistakes
  // (owner decision, 9 November 2026: a rescue must look like a bad haircut, not a cut half done). Within the game's
  // parameters (one length per cell, levels 0-5, a clipper that only shortens) a cut can be bad in two ways:
  //   too short  gouge, chunks, tracks, a ledge (step), a bowl line, a fade taken too high on one side (fadehigh), one
  //              sideburn higher, a crooked neckline (nape), a crooked line-up, a stripe run up the head with no guard,
  //              a zigzag where the fade should be, one side of the top cut shorter (lopsided), a bite out of the
  //              front hairline (notch)
  //   left long  missed patches, one side not done (side), the blend skipped: a hard step (noblend)
  // The repair (the job's target) is what a barber does with a clipper: what was left long is cut to the style, a
  // one-sided mistake is matched on the other side, a crooked line is cut straight at its highest point, and a hole is
  // faded into the hair round it. It is never longer than what he walked in with, so it is always possible.
  const REPAIR_MIN = 120; // cells still longer than the repair: twice what counts as real work (MIN_WORK)
  const SEEN_MIN = 150; // cells at least two lengths (6 mm) off the style, or bare where the style keeps hair: a mistake that shows
  // two lengths apart (6 mm) shows, and so does hair against bare skin (3 mm regrowth on a shaved head)
  const shows = (a, b) => Math.abs(a - b) >= 2 || (Math.min(a, b) === 0 && Math.max(a, b) >= 1);
  const mirrorCell = (i) => (i & ~127) | ((128 - (i & 127)) & 127); // the same place on the other side of the head (front u = 0)
  // a faded repair: one length per 2.5 cells round the head and per 3.5 cells up it (hair grid cells are taller than wide)
  function fadeInto(t2, seeds) {
    const f = Float32Array.from(t2), q = seeds.slice(), inQ = new Uint8Array(8192);
    for (const i of q) inQ[i] = 1;
    const STEP_U = 1 / 2.5, STEP_V = 1 / 3.5;
    while (q.length) {
      const i = q.pop(); inQ[i] = 0;
      const cx = i & 127, cy = i >> 7;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const yy = cy + dy; if (yy < 0 || yy > 63) continue;
        const n = yy * 128 + ((cx + dx + 128) & 127), c = f[i] + (dx ? STEP_U : STEP_V);
        if (c < f[n] - 1e-4) { f[n] = c; if (!inQ[n]) { inQ[n] = 1; q.push(n); } }
      }
    }
    for (let i = 0; i < 8192; i++) t2[i] = Math.min(t2[i], Math.round(f[i]));
  }
  function disaster(person, start, R, force, beard) {
    // a repair needs room to show a mistake: only styles that take a real amount off, the biggest change if none does
    const room = (t) => { let n = 0; for (let i = 0; i < 8192; i++) if (start[i] - t[i] >= 2) n++; return n; };
    const all = options(person, start).map((o) => [o, room(o[2])]);
    const big = all.filter((o) => o[1] >= 700), opts = big.length ? big.map((o) => o[0]) : all.length ? [all.reduce((a, b) => (b[1] > a[1] ? b : a))[0]] : [];
    // every Rescue customer has a disaster: with no cut that suits him, it is the cut he walked in with that went wrong
    const [, style, target] = opts.length ? choose(R, opts) : [0, K().byId.get('trim') || { id: 'trim', fam: 'trim' }, start.slice()];
    // where hair was left long can show (two lengths over the style), and where there is hair to take too short (on a
    // 3 mm buzz a slip to the skin shows as clearly as a hole in a longer top)
    const long = [], thick = [];
    for (let i = 0; i < 8192; i++) { if (start[i] > target[i] && shows(start[i], target[i])) long.push(i); if (target[i] >= 1) thick.push(i); }
    const canShort = thick.length >= 200, canLong = long.length >= 200;
    if (!canShort && !canLong) return null;
    let bad, fix, holes, names;
    const pick = (list) => list[Math.floor(R.next() * list.length)];
    // too short: down to `to` (never below the clipper's 0); a hole is faded in, a line or one side is put right by `fix`
    const short = (i, to, hole) => { const v = Math.max(0, Math.min(bad[i], to)); if (v < bad[i]) { bad[i] = v; if (hole) holes.push(i); } };
    const lng = (i) => { bad[i] = Math.max(bad[i], start[i]); }; // left at the length he walked in with
    const fixTo = (i, v) => fix.push(i, v);
    const oval = (u0, v0, ru, rv, f) => { for (let i = 0; i < 8192; i++) { const a = du(U(i), u0) / ru, b = (V(i) - v0) / rv; if (a * a + b * b < 1) f(i); } };
    // the lowest the style goes in this cell's column, below its height: the fade's own bottom length
    const colMin = new Int8Array(128).fill(9);
    for (let i = 0; i < 8192; i++) if (V(i) < 0.35 && target[i] > 0) colMin[i & 127] = Math.min(colMin[i & 127], target[i]);
    const KINDS = {
      // a clipper slipped: a deep oval hole, nearly to the skin
      gouge() { const c = pick(thick.filter((i) => target[i] >= 3).concat(thick)); oval(U(c), V(c), R.range(0.045, 0.07), R.range(0.08, 0.13), (i) => short(i, R.next() < 0.6 || target[i] < 3 ? 0 : 1, true)); },
      // bites taken out here and there
      chunks() { const big = thick.filter((i) => target[i] >= 3), from = big.length > 100 ? big : thick; for (let k = R.int(5, 8); k > 0; k--) { const c = pick(from), r = R.range(0.02, 0.032); oval(U(c), V(c), r, r * 2.2, (i) => short(i, target[i] - 3, true)); } },
      // guard lines: parallel stripes cut two lengths too short
      tracks() { const c = pick(thick), u0 = U(c), n = R.int(3, 5), gap = R.range(0.05, 0.075), w = R.range(0.01, 0.016), v0 = Math.max(0.15, V(c) - 0.3), v1 = Math.min(1, V(c) + 0.3); for (let i = 0; i < 8192; i++) if (V(i) > v0 && V(i) < v1) for (let k = 0; k < n; k++) if (du(U(i), (u0 + k * gap) % 1) < w) short(i, target[i] - 2, true); },
      // a ring cut at the wrong height, two lengths too short: a ledge
      step() { const v0 = R.range(0.35, 0.65), h = R.range(0.03, 0.05); for (const i of thick) if (Math.abs(V(i) - v0) < h) short(i, target[i] - 2, true); },
      // a home bowl cut: everything below a wobbly line taken right down, no blending
      bowl() { const v0 = R.range(0.4, 0.55), tilt = R.range(0.04, 0.1), ph = R.next(), to = R.int(0, 1); for (let i = 0; i < 8192; i++) if (V(i) < v0 + tilt * Math.sin((U(i) + ph) * Math.PI * 2)) short(i, to, true); },
      // the fade taken too high on one side; the repair takes the other side up to match
      fadehigh() { const u0 = R.next() < 0.5 ? 0.25 : 0.75, w = R.range(0.12, 0.18), top = R.range(0.42, 0.55); for (let i = 0; i < 8192; i++) if (du(U(i), u0) < w && V(i) < top && target[i] > 0) { short(i, Math.min(target[i], colMin[i & 127]), false); fixTo(mirrorCell(i), bad[i]); } },
      // one sideburn taken right up; the repair takes the other up to match
      sideburn() { const u0 = R.next() < 0.5 ? 0.25 : 0.75, w = R.range(0.04, 0.065), top = R.range(0.3, 0.42); for (let i = 0; i < 8192; i++) if (du(U(i), u0) < w && V(i) < top) { short(i, 0, false); fixTo(mirrorCell(i), 0); } },
      // a crooked neckline taken up into the nape; the repair is a straight line at its highest point
      nape() { const w = R.range(0.1, 0.16), top = R.range(0.12, 0.2), lean = R.range(0.3, 0.6) * (R.next() < 0.5 ? -1 : 1); for (let i = 0; i < 8192; i++) { const d = du(U(i), 0.5); if (d >= w) continue; if (V(i) < top * (1 + lean * (U(i) - 0.5) / w)) short(i, 0, false); if (V(i) < top * (1 + Math.abs(lean))) fixTo(i, 0); } },
      // a crooked line-up at the front: the edge cut up at a slant; the repair is a straight edge at its highest point
      lineup() { const u0 = R.range(-0.08, 0.08), w = R.range(0.14, 0.22), top = R.range(0.1, 0.18), sl = R.next() < 0.5 ? -1 : 1; for (let i = 0; i < 8192; i++) { const d = du(U(i), (u0 + 1) % 1); if (d >= w) continue; const sgn = ((U(i) - u0 + 1.5) % 1) - 0.5; if (V(i) < top * (0.5 + 0.5 * sl * sgn / w)) short(i, 0, false); if (V(i) < top) fixTo(i, 0); } },
      // the clipper run up the head with no guard on: one stripe to the skin
      stripe() { const c = pick(thick.filter((i) => V(i) > 0.35).concat(thick)), u0 = U(c), w = R.range(0.012, 0.02), v0 = Math.max(0.05, V(c) - R.range(0.25, 0.4)), v1 = Math.min(1, V(c) + R.range(0.2, 0.4)); for (let i = 0; i < 8192; i++) if (V(i) > v0 && V(i) < v1 && du(U(i), u0) < w) short(i, 0, true); },
      // the fade line wandered: a zigzag where it should run straight; the repair is a straight line at its highest point
      zigzag() { const v0 = R.range(0.2, 0.32), amp = R.range(0.05, 0.09), f = R.int(10, 16), ph = R.next(); for (let i = 0; i < 8192; i++) { if (!(target[i] > colMin[i & 127]) || colMin[i & 127] > 5) continue; const t = (U(i) * f + ph) % 1, line = v0 + amp * (1 - 2 * Math.abs(t - 0.5)); if (V(i) < line) short(i, colMin[i & 127], false); if (V(i) < v0 + amp) fixTo(i, colMin[i & 127]); } },
      // one side of the top taken two lengths shorter than the other; the repair takes the other side down to match
      lopsided() { const u0 = R.next() < 0.5 ? 0.25 : 0.75; for (let i = 0; i < 8192; i++) if (V(i) > 0.5 && du(U(i), u0) < 0.25 && target[i] >= 1) { short(i, target[i] - 2, false); fixTo(mirrorCell(i), bad[i]); } },
      // a bite out of the front hairline, faded in by the repair
      notch() { const u0 = R.range(-0.06, 0.06), v0 = R.range(0.04, 0.12); oval((u0 + 1) % 1, v0, R.range(0.025, 0.04), R.range(0.08, 0.14), (i) => short(i, 0, true)); },
      // the job left unfinished: patches missed, still at the length he walked in with
      missed() { if (long.length < 200) return; for (let k = R.int(3, 5); k > 0; k--) { const c = pick(long), r = R.range(0.035, 0.055); oval(U(c), V(c), r, r * 2, (i) => { if (start[i] > target[i] && shows(start[i], target[i])) lng(i); }); } },
      // one side never done
      side() { if (long.length < 200) return; const c = pick(long), u0 = U(c), w = R.range(0.16, 0.24); for (const i of long) if (du(U(i), u0) < w) lng(i); },
      // the blend skipped: the in-between lengths left long, so the top drops straight onto the sides
      noblend() { for (const i of long) if (target[i] > colMin[i & 127] && V(i) < 0.75) lng(i); },
    };
    // what really goes wrong depends on the hair: clipper tracks show in straight hair, a line-up is where tight curls go wrong
    const ty = (person.hair && person.hair.type) || '1b', coily = /^(3c|4)/.test(ty), straight = /^[12]/.test(ty);
    const odds = { gouge: 2, chunks: 1.2, step: 1.4, bowl: 0.6, fadehigh: 1.6, sideburn: 1.2, nape: 1.4, missed: 1.4, side: 1.2, noblend: 1.2, tracks: straight ? 2.2 : 0.5, lineup: coily ? 3 : 0.8, stripe: 1.2, zigzag: 1, lopsided: 1.2, notch: coily ? 1.4 : 0.8 };
    // a cut right down to the skin can only have been left long; a head with nothing left long only cut too short
    const LONG = ['missed', 'side', 'noblend'];
    for (const k of Object.keys(odds)) if (LONG.includes(k) ? !canLong : !canShort) delete odds[k];
    const seen = () => { let n = 0; for (let i = 0; i < 8192; i++) if (shows(bad[i], target[i])) n++; return n; };
    let t2;
    const make = (list) => {
      bad = target.slice(); fix = []; holes = []; names = list.slice();
      for (const n of names) KINDS[n]();
      // a mistake that does not show is not a rescue: add another until it does
      for (let k = 0; k < 4 && !force && seen() < SEEN_MIN; k++) { const left = Object.entries(odds).filter(([n]) => !names.includes(n)); if (!left.length) break; const n = choose(R, left.map(([k2, w]) => [w, k2]))[1]; names.push(n); KINDS[n](); }
      t2 = target.map((v, i) => Math.min(v, bad[i]));
      for (let k = 0; k < fix.length; k += 2) t2[fix[k]] = Math.min(t2[fix[k]], fix[k + 1]);
      fadeInto(t2, holes);
      for (let i = 0; i < 8192; i++) if (t2[i] > bad[i]) t2[i] = bad[i];
    };
    const draw = () => { const l = []; for (let n = R.next() < 0.45 ? 2 : 1; n > 0; n--) { const left = Object.entries(odds).filter(([k]) => !l.includes(k)); if (left.length) l.push(choose(R, left.map(([k, w]) => [w, k]))[1]); } return l; };
    const left = () => { let n = 0; for (let i = 0; i < 8192; i++) if (bad[i] > t2[i]) n++; return n; };
    make(force || draw());
    // a rescue always leaves a real repair to do and shows its mistakes; otherwise it is drawn again, or none is made
    const ok = () => left() >= REPAIR_MIN && seen() >= SEEN_MIN;
    for (let k = 0; k < 3 && !force && !ok(); k++) make(draw());
    // every Rescue customer has a disaster: the mistakes that always show on what he has
    for (const l of [['gouge', 'chunks'], ['bowl'], ['side', 'missed'], ['stripe', 'gouge', 'chunks']]) { if (force || ok()) break; if (l.every((n) => odds[n])) make(l); }
    if (!force && !(left() > 0 && seen() > 0)) return null;
    // a man with a beard may have had that botched too
    const fixBeard = Array.isArray(beard) && !force && R.next() < 0.45 ? beardDisaster(person, beard, R) : null;
    return { start: bad, target: t2, style, flaws: names, beard: fixBeard };
  }
  // A beard botched the same way: the barber before shaped it, then got one side or a line wrong, or left patches long.
  // The repair matches the good side to the bad one (or cuts what was left long), only ever with lengths the clipper's
  // guards reach, so it is always possible.
  const BEARD_SEEN = 60;
  function beardDisaster(person, start, R) {
    const j = beardJob(person, start, R);
    if (!j) return null;
    const reach = HSC.beardReach ? HSC.beardReach() : [0];
    const has = [], long = [];
    for (let i = 0; i < 8192; i++) { if (j.target[i] >= 3) has.push(i); if (start[i] - j.target[i] >= 2) long.push(i); }
    if (has.length < 150) return null;
    const BU = (i) => ((i & 127) + 0.5) / 128, BV = (i) => ((i >> 7) + 0.5) / 64, mirror = (i) => (i & ~127) | (127 - (i & 127));
    const vs = has.map(BV), lo = Math.min(...vs), hi = Math.max(...vs), side = R.next() < 0.5, half = (i) => (BU(i) < 0.5) === side;
    const bad = j.target.slice(), fix = [];
    // one side shorter, or a line cut up on one side: the other side is matched to it
    const oneSide = (i, to) => { if (to < bad[i]) { bad[i] = to; fix.push(mirror(i), to); } };
    // a length the guards reach, two or more lengths under the beard's usual length on that side
    let usual = 0; for (const i of has) usual = Math.max(usual, j.target[i]);
    const shorter = reach.filter((l) => l <= usual - 3);
    const KINDS = {
      // one side taken down a guard too far
      lopsided() { if (!shorter.length) return; const to = shorter[Math.floor(R.next() * shorter.length)]; for (const i of has) if (half(i) && j.target[i] - to >= 2) oneSide(i, to); },
      // the cheek line pushed up on one side
      cheek() { const top = hi - (hi - lo) * R.range(0.2, 0.34); for (const i of has) if (half(i) && BV(i) > top) oneSide(i, 0); },
      // the neckline pushed up on one side
      neck() { const low = lo + (hi - lo) * R.range(0.16, 0.3); for (const i of has) if (half(i) && BV(i) < low) oneSide(i, 0); },
      // patches left at the length he walked in with
      missed() { if (long.length < 100) return; for (let k = R.int(3, 5); k > 0; k--) { const c = long[Math.floor(R.next() * long.length)], u0 = BU(c), v0 = BV(c), r = R.range(0.03, 0.05); for (const i of long) { const a = (BU(i) - u0) / r, b = (BV(i) - v0) / (r * 1.6); if (a * a + b * b < 1) bad[i] = start[i]; } } },
    };
    const seen = () => { let n = 0; for (let i = 0; i < 8192; i++) if (Math.abs(bad[i] - j.target[i]) >= 2) n++; return n; };
    const order = [];
    for (let k = 0; k < 4 && seen() < BEARD_SEEN; k++) {
      const left = [[2, 'lopsided'], [2, 'cheek'], [1.5, 'neck'], [1.5, 'missed']].filter(([, n]) => !order.includes(n));
      const n = choose(R, left)[1]; order.push(n); KINDS[n]();
    }
    if (seen() < BEARD_SEEN) return null;
    const t2 = j.target.map((v, i) => Math.min(v, bad[i]));
    for (let k = 0; k < fix.length; k += 2) t2[fix[k]] = Math.min(t2[fix[k]], fix[k + 1]);
    return { start: bad, target: t2, style: j.style, flaw: order[0], flaws: order };
  }

  // ---- M7: a tidy-up: a finished cut with a little regrowth in one or two places ----
  // a tidy-up is never already finished: regrowth only shows where the style takes hair off, so a style that cuts little
  // in the grown zones could leave nothing to do. Too little grown back: every zone grows; still too little: another style
  const TIDY_MIN = 300; // cells grown back, so the job is real work (MIN_WORK below is what counts as worked)
  function tidy(person, start, R) {
    let opts = options(person, start);
    while (opts.length) {
      const pick = choose(R, opts), [, style, target] = pick;
      const s = target.slice();
      const grow = (i) => { s[i] = Math.min(start[i], Math.max(s[i], target[i] + 1)); };
      const ZONES = {
        nape() { for (let i = 0; i < 8192; i++) if (V(i) < 0.16) grow(i); },
        side() { const u0 = R.next(); for (let i = 0; i < 8192; i++) if (du(U(i), u0) < 0.14 && V(i) < 0.45) grow(i); },
        ring() { const v0 = R.range(0.25, 0.45); for (let i = 0; i < 8192; i++) if (Math.abs(V(i) - v0) < 0.06) grow(i); },
      };
      const grown = () => { let n = 0; for (let i = 0; i < 8192; i++) if (s[i] > target[i]) n++; return n; };
      for (const z of Object.keys(ZONES).sort(() => R.next() - 0.5).slice(0, R.next() < 0.5 ? 2 : 1)) ZONES[z]();
      // (the usual case draws nothing more, so tidy-ups that already had enough to do are unchanged)
      if (grown() < TIDY_MIN) for (const z of Object.keys(ZONES)) ZONES[z]();
      if (grown() >= TIDY_MIN) return { start: s, target, style };
      opts = opts.filter((o) => o !== pick);
    }
    return null;
  }

  // ---- M5: the beard he asks for, from the beard he walked in with ----
  // what a customer can ask for (docs/BEARD-MATRIX.md). Sparse growth asks for what it can really hold: a patchy beard
  // rarely asks for a full cheek line. Growth comes from the person's own density, never directly from his group.
  const BEARD_TO = ['corporate', 'boxed', 'rounded', 'hollywood', 'chincurtain', 'extended', 'goatee', 'vandyke', 'chinstrap', 'balbo', 'anchor', 'circle', 'stubble5', 'stubble1', 'soulpatch', 'moustache', 'mutton', 'friendly', 'sideburns', 'clean'];
  const FULL_LINE = ['corporate', 'boxed', 'rounded', 'friendly', 'mutton'];
  // every style with something to work on comes through the door
  const BEARDED = HSC.BEARD_ARRIVALS = Object.keys(HSC.BEARD_STYLES || {}).filter((k) => k !== 'clean' && k !== 'stubble1' && k !== 'stubble');
  function beardGrid(person, style) {
    const S = HSC.BEARD_STYLES[style] || {}, mm = {};
    for (const k of ['moustache', 'chin', 'cheeks', 'jaw', 'neck']) mm[k] = S[k] ? Math.min(person.beard.mm[k] || 99, (S[k][0] + S[k][1]) / 2) : 0;
    return HSC.beardStartFor(Object.assign({}, person, { beard: Object.assign({}, person.beard, { style, mm }) }));
  }
  function beardJob(person, start, R) {
    const opts = [];
    for (const st of BEARD_TO) {
      if (st === person.beard.style) continue;
      const g = beardGrid(person, st), t = start.map((v, i) => Math.min(v, g[i]));
      let n = 0;
      for (let i = 0; i < 8192; i++) if (start[i] - t[i] >= 2) n++;
      if (n >= 120) opts.push([(st === 'clean' ? 1.6 : 1) * (FULL_LINE.includes(st) ? Math.max(0.1, 1 - 1.4 * (person.beard.patchy || 0)) : 1), st, t]);
    }
    if (!opts.length) return null;
    const [, style, target] = choose(R, opts);
    return { style, target };
  }
  // the beard a known style asks for from this start (a saved order is rebuilt exactly, requests.js)
  const beardTarget = (person, start, style) => { const g = beardGrid(person, style); return start.map((v, i) => Math.min(v, g[i])); };
  // stars for a beard request: the share of his beard within one length of the asked beard, counted from where he
  // started (as requests.js does for hair): 60% for 2 stars, 85% for 3
  // The job (cells that need work) and a slip (cells that were right and are now wrong) are counted apart: the job
  // done is its share of the job, and a slip is weighed against the job's size but never against less than SLIP_FLOOR of
  // the beard, so a small job is not lost to one slip. A perfect beard is 3 stars, an untouched one none of the job.
  // (requests.js does the same for the hair)
  const SLIP_FLOOR = 0.2;
  function beardStars(s, r) {
    const st = s.startBeard, now = s.beard, t = r.beard;
    if (!Array.isArray(st) || !Array.isArray(now) || !t) return 1;
    let n = 0, job = 0, done = 0, slip = 0;
    for (let i = 0; i < 8192; i++) {
      if (!(st[i] > 0)) continue;
      n++;
      const ok = Math.abs(now[i] - t[i]) <= 1;
      if (Math.abs(st[i] - t[i]) > 1) { job++; if (ok) done++; } else if (!ok) slip++;
    }
    if (!n) return 1;
    const k = Math.max(0, Math.min(1, (job ? done / job : 1) - slip / Math.max(job, SLIP_FLOOR * n)));
    return k >= 0.85 ? 3 : k >= 0.6 ? 2 : 1;
  }

  // ---- who comes in ----
  // the last customer's group and age, so the next one is someone visibly different
  const lastSeat = { her: null, age: null };
  function modePerson(mode, job, seed) {
    const R = HSC.rng((seed ^ 0x6a09e667) >>> 0 || 1), d = M() && M().data;
    // Quick Play is the open game: besides the ordinary walk-ins, the whole beard catalogue comes through the door
    const walkIn = d && d.queue && d.queue.person, twin = !!walkIn && walkIn.heritage === lastSeat.her;
    if (mode === 'free' && (!d || !d.cuts || (R.next() >= 0.4 && !twin))) return null;
    // the beard studio selects a customer who already has a beard (never rewrites one); the fallback is only for an
    // impossible run of seeds, so the mode can never stall
    // every style has an even turn here, so a player meets the whole catalogue
    const want = BEARDED[hash('beard-' + seed) % BEARDED.length], s0 = seed >>> 0 || 1;
    const p = HSC.selectPerson(s0, {}, (x) => x.beard.style === want && x.heritage !== lastSeat.her && x.age !== lastSeat.age, 600) ||
      HSC.selectPerson(s0, {}, (x) => x.beard.style === want, 600) || HSC.makePerson(s0, { beard: want });
    return Object.assign(p, { job });
  }
  const wantsPerson = (m) => m === 'beard' || m === 'free';
  function hook() {
    // the customer for a new job (no queued customer) in a mode with its own customers
    const pfj = HSC.personForJob;
    HSC.personForJob = function (s, seed) {
      const d = M() && M().data, m = current();
      if (m === 'career') {
        const p = CR().person(s.jobId);
        if (p) return p;
        // the chapter is over (or the founding city is not chosen): the world map asks where to go next
        if (CR().needsChoice() && HSC.menu && HSC.menu.career) setTimeout(() => HSC.menu.career(), 0);
      }
      if (wantsPerson(m) && !(d && d.queue && d.queue.job === s.jobId)) { const p = modePerson(m, s.jobId, seed); if (p) return p; }
      return pfj.apply(this, arguments);
    };
    // after a finished cut the career picks who comes next; a mode with its own customers puts its own in the queue
    const of = M().onFinish;
    M().onFinish = function (state) {
      const r = of.apply(this, arguments), d = M().data, m = current();
      if (r && d && wantsPerson(m)) {
        const job = state.jobId + 1, seed = (((state.seed >>> 0) ^ Math.imul(job + 1, 0x9e3779b1)) >>> 0) || 1;
        const p = modePerson(m, job, seed);
        if (p) { d.queue = { job, person: p, profile: M().profileFor(p, state.recentLooks) }; M().save(); }
        if (d.queue && d.queue.person) { lastSeat.her = d.queue.person.heritage; lastSeat.age = d.queue.person.age; }
      }
      return r;
    };
    // a new job in a mode that brings its own start (a disaster, a tidy-up, a beard to shape)
    const ens = HSC.ensure;
    HSC.ensure = function (s) {
      const out = ens.apply(this, arguments);
      try { return start(out) || out; } catch (e) { console.error('customers: mode start failed', e); return out; }
    };
  }
  function start(s) {
    const m = current(), md = data();
    if (m === 'career') return CR().start(s);
    if (!md || !s || s.status !== 'cutting' || s.cutStrokeCount || !s.look || !s.look.person || s.look.person.first) return null;
    if (md.job && md.job.n === s.jobId) return null; // this job's start is already made (also after a reload)
    const p = s.look.person;
    // the taste of Rush: once, in Orders, from the third customer, while the mode is still locked
    const taste = m === 'requests' && !md.taste && M().data.cuts >= 2 && !unlocked('rush');
    if (m !== 'fix' && m !== 'rush' && m !== 'beard' && !taste) return null;
    const R = HSC.rng(((p.seed >>> 0) ^ Math.imul((s.jobId | 0) + 11, 0x5851f42d)) >>> 0 || 1);
    if (m === 'beard') {
      if (!Array.isArray(s.startBeard)) return null;
      const b = beardJob(p, s.startBeard, R);
      md.job = b ? { n: s.jobId, m, st: b.style, b: pack(b.target) } : { n: s.jobId, m, none: true };
      if (b) noteAsk(b.style);
      M().save();
      return null;
    }
    const kind = taste ? 'rush' : m;
    const j = kind === 'fix' ? disaster(p, s.startHair, R, null, s.startBeard) : tidy(p, s.startHair, R);
    if (!j) { md.job = { n: s.jobId, m: kind, none: true }; M().save(); return null; }
    md.job = { n: s.jobId, m: kind, st: j.style.id, t: pack(j.target) };
    if (j.beard) md.job.b = pack(j.beard.target);
    noteAsk(j.style); for (const f of j.flaws || []) noteAsk(f);
    if (j.beard) { noteAsk(j.beard.style); noteAsk(j.beard.flaw); }
    M().save();
    const out = Object.assign({}, s, { hair: j.start.slice(), startHair: j.start });
    if (j.beard) Object.assign(out, { beard: j.beard.start.slice(), startBeard: j.beard.start });
    return out;
  }

  // ---- jobs with no order: the barber's judgment decides, so nothing is scored, and a set pay needs real work ----
  const judged = (s) => {
    const m = current();
    if (m === 'fix' || m === 'beard') return true;
    const a = m === 'career' && CR() ? CR().active() : null;
    return !!(a && s && a.job === s.jobId && a.role !== 'showcase' && (a.mode === 'fix' || a.mode === 'beard'));
  };
  // The one test of real work, everywhere work decides something (pay, stars, level, videos, tasks, the Rush bonus and
  // taste, regulars, Career contracts): hair or beard really changed from where he sat down. The stroke counter is not
  // used: it counts pointer samples, stays raised after an undo and counts a brushed brow.
  const MIN_WORK = 60; // cells of hair or beard really changed: a stroke or two
  // a scored job (an order: Orders, Rush, a Career order) also needs this share of the order's own work done: one dab on
  // a big order is not a job (the median order has over a thousand cells to cut, a Rush tidy-up at least 300)
  const ORDER_SHARE = 0.2;
  const changedCells = (s, stop = Infinity) => {
    let n = 0;
    if (!s) return 0;
    for (const [a, b] of [[s.hair, s.startHair], [s.beard, s.startBeard]]) {
      if (!Array.isArray(a) || !Array.isArray(b)) continue;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && ++n >= stop) return n;
    }
    return n;
  };
  // the order's own work: cells longer than the order at the start (a beard within one length of its order already
  // scores, as beardStars counts it), and how many of them have been cut at all
  function orderWork(s, target, beard) {
    let need = 0, done = 0;
    for (const [now, st, t, tol] of [[s.hair, s.startHair, target, 0], [s.beard, s.startBeard, beard, 1]]) {
      if (!Array.isArray(now) || !Array.isArray(st) || !Array.isArray(t)) continue;
      for (let i = 0; i < t.length; i++) if (st[i] - t[i] > tol) { need++; if (now[i] < st[i]) done++; }
    }
    return { need, done };
  }
  // a job with no order still has a repair or a beard it was built for (Rescue, Beards; standalone or a Career contract)
  function repairOf(s) {
    const md = data(), j = md && md.job;
    if (current() !== 'career') return j && j.n === s.jobId && !j.none ? { t: j.m === 'beard' ? null : unpack(j.t, 5), b: j.b ? unpack(j.b, BTOP()) : null } : null;
    const a = CR() && CR().active();
    return a && a.job === s.jobId && a.request ? { t: a.request.t ? unpack(a.request.t, 5) : null, b: a.request.bt ? unpack(a.request.bt, BTOP()) : null } : null;
  }
  // real work. A scored job: MIN_WORK cells (all of the order's work when it has less) and ORDER_SHARE of the order
  // cut. A job without an order (Rescue, Beards, Quick Play, the tutorial): MIN_WORK cells, or the whole of a smaller
  // repair, so a perfect small rescue always counts
  function worked(s) {
    if (!s) return false;
    const r = HSC.requestFor ? HSC.requestFor(s) : null;
    if (r && (r.target || r.beard)) {
      const w = orderWork(s, r.target, r.beard);
      const need = w.need ? Math.min(MIN_WORK, w.need) : MIN_WORK;
      return changedCells(s, need) >= need && (!w.need || w.done >= ORDER_SHARE * w.need);
    }
    const rp = judged(s) ? repairOf(s) : null, w = rp ? orderWork(s, rp.t, rp.b) : null;
    const need = w && w.need ? Math.min(MIN_WORK, w.need) : MIN_WORK;
    return changedCells(s, need) >= need;
  }

  // ---- what each mode asks for (requests.js) ----
  const reqCache = { key: null, val: undefined };
  function request(s) {
    const m = current(), md = data(), p = s.look && s.look.person;
    if (judged(s)) return null;
    // a career chair without its contract (between chapters) asks for nothing
    if (m === 'career') { const r = CR().request(s); return r !== undefined ? r : null; }
    if (m === 'free') return null;
    const j = md && md.job && md.job.n === s.jobId ? md.job : null;
    // no tidy-up could be made for him: a Rush customer asks for an ordinary cut instead (still on the clock), so he is
    // never scored without an order
    if (!j || j.none) return m === 'beard' || m === 'fix' ? null : undefined;
    const key = s.jobId + ':' + j.m + ':' + j.st;
    if (reqCache.key === key) return reqCache.val;
    let val;
    if (j.m === 'beard') { const b = unpack(j.b, BTOP()); val = b ? { style: { id: 'beard:' + j.st, fam: 'beard' }, beard: b } : null; }
    else { const t = unpack(j.t, 5), b = j.b ? unpack(j.b, BTOP()) : null; val = t ? { style: K().byId.get(j.st) || { id: j.st, fam: 'fix' }, target: t, beard: b } : null; }
    reqCache.key = key; reqCache.val = val;
    return val;
  }

  // ---- tips and results ----
  // the clock counts play time only (not an ad, the app in the background, a menu or the Open splash) and the time
  // used is saved with the job, so a restart or a mode switch cannot give it back
  // A Career contract keeps its clock by the contract's id (Career seats a suspended contract on a new job number), any
  // other job by its job number; `ads` counts videos in progress, which always hold the clock
  const rush = { job: null, key: null, used: 0, last: 0, saved: -1, held: true, ads: 0, LIMIT: 45000 };
  for (const e of ['visibilitychange', 'pagehide', 'freeze']) addEventListener(e, () => { rush.held = true; }, true);
  document.addEventListener('visibilitychange', () => { rush.held = true; }, true);
  addEventListener('blur', (e) => { if (e.target === window) rush.held = true; }); // the window, not a button losing focus
  // a host pause or an ad freezes this tick entirely, so watch the pause flag the client sets on <html> (client.js)
  try { new MutationObserver(() => { rush.held = true; }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}
  const timeLeft = () => (rush.job == null ? 0 : Math.max(0, rush.LIMIT - rush.used));
  // the economy (economy.js) prices every mode by its fee: no mode multiplies tips any more
  function tips(base) { return base; }
  // what the economy needs to know about this job's mode: the kind, a Rush time bonus (0-12). The bonus is for a job
  // done well and fast: only real work of 2 stars or more earns it (`stars`, from requests.js), so a dab and Finish
  // at once earns nothing from the clock
  function econJob(s, stars) {
    const m = current();
    const md = data(), taste = m === 'requests' && md && md.job && md.job.n === s.jobId && md.job.m === 'rush' && !md.job.none;
    const out = { kind: taste ? 'rush' : m === 'requests' || m === 'career' ? 'requests' : m };
    if (m === 'career' && CR() && CR().unscored()) out.kind = 'free'; // no contract in the chair: practice, no pay
    if (rush.job === s.jobId && stars >= 2 && worked(s)) out.rushBonus = Math.round(HSC.economy.CONFIG.rushMax * timeLeft() / rush.LIMIT);
    return out;
  }
  function done(s, stars) {
    const md = data();
    if (!md) return;
    const ca = current() === 'career' && CR() ? CR().active() : null, cid = ca && ca.job === s.jobId ? String(ca.id) : null;
    if (current() === 'career') CR().done(s, stars);
    // the taste is spent only once it has been finished with real work, so a customer skipped by changing mode, or
    // finished (or timed out) untouched, does not use it up
    if (current() === 'requests' && md.job && md.job.n === s.jobId && md.job.m === 'rush' && !md.job.none && stars > 0 && worked(s)) { md.taste = true; M().save(); }
    if (rush.job === s.jobId) { rush.job = null; rush.key = null; }
    if (md.clock && md.clock.n === s.jobId) { md.clock = null; M().save(); }
    if (cid && md.cclock && md.cclock.id === cid) { md.cclock = null; M().save(); }
  }

  // ---- switching ----
  // one switch at a time: a second tap while the first is still saving would skip a second customer
  let switching = false;
  async function setMode(m) {
    if (switching) return false;
    switching = true;
    try { return await switchTo(m); } finally { switching = false; }
  }
  async function switchTo(m) {
    const md = data(), g = G();
    const was = current(); // read before any wait, so it is the mode the player is really leaving
    if (m === 'career') { if (!CR()) return false; await CR().ensure(); }
    else if (!md || !LIST.includes(m) || !unlocked(m)) return false;
    // leaving the career chair: its contract keeps the work done so far and waits for the barber (suspended)
    if (was === 'career' && m !== 'career' && g) await CR().suspend(g.getState());
    md.mode = m;
    md.tried = Array.isArray(md.tried) ? md.tried : [];
    if (!md.tried.includes(m)) md.tried.push(m); // a mode is no longer new once played
    M().save();
    if (!g) return true;
    const s = g.getState();
    // a new customer for the new mode (the one in the chair keeps his cut in freestyle and the career)
    const keep = s.status === 'cutting' && was === m && (m !== 'career' || !!(CR().active() && CR().active().job === s.jobId));
    if (!keep && s.status === 'cutting' && g.skip) { md.job = null; if (M().data.queue && M().data.queue.job === s.jobId + 1) M().data.queue = null; await g.skip(); }
    else if (!keep && s.status === 'reveal' && g.next) { if (M().data.queue && M().data.queue.job === s.jobId + 1) M().data.queue = null; await g.next(); }
    return true;
  }
  // ---- UI: the mode badge on the menu button, the rush clock ----
  const ICON = {
    requests: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="20" cy="27" r="11" fill="#e9c9a8" stroke="${INK}" stroke-width="2.4"/><path d="M9.5 25c0-7 4.5-11 10.5-11s10.5 4 10.5 11c-3-3-7-4.5-10.5-4.5S12.5 22 9.5 25z" fill="#5a3b1f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M28 6h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-4 4v-4h-3a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" fill="#fff" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M31.5 14.5c0-3 1.6-4.6 3.5-4.6s3.5 1.6 3.5 4.6" fill="#5a3b1f"/></svg>`,
    free: `<svg viewBox="0 0 48 48" width="56" height="56"><rect x="16" y="16" width="16" height="26" rx="5" fill="#ffb627" stroke="${INK}" stroke-width="2.4"/><path d="M15 17v-6h18v6" fill="#c9cfd6" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 8l2 4M40 8l-2 4M6 20h4M42 20h-4M24 2v4" stroke="#ffb627" stroke-width="3" stroke-linecap="round"/></svg>`,
    fix: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="28" r="13" fill="#e9c9a8" stroke="${INK}" stroke-width="2.4"/><path d="M11.5 26c0-8 5.5-12.5 12.5-12.5S36.5 18 36.5 26l-4-3-2.5 4-3-5-3 6-3-6-2.5 3.5-3-3z" fill="#5a3b1f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><g transform="rotate(-35 34 12)"><rect x="25" y="8" width="18" height="8" rx="4" fill="#ffd9a8" stroke="${INK}" stroke-width="2.2"/><rect x="31" y="8" width="6" height="8" fill="#f2b880" stroke="${INK}" stroke-width="1.6"/></g></svg>`,
    beard: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="20" r="13" fill="#e9c9a8" stroke="${INK}" stroke-width="2.4"/><path d="M11 18c0 15 6 25 13 25s13-10 13-25c-3 5-7 7-13 7s-10-2-13-7z" fill="#5a3b1f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M18 28c2 1.6 4 2 6 2s4-.4 6-2" stroke="#e9c9a8" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
    rush: `<svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="26" r="16" fill="#fff" stroke="${INK}" stroke-width="2.4"/><path d="M20 4h8M24 4v6M38 12l3-3" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M26 14l-6 13h6l-3 11 9-15h-6l3-9z" fill="#ffc83d" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  };
  const NAME = { requests: 'Customer requests', free: 'Quick Play', fix: 'Hair disasters', beard: 'Beard studio', rush: 'Rush hour' };
  const LOCK = `<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="10.5" width="14" height="10" rx="2.4" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="${INK}" stroke-width="2"/></svg>`;
  const STAR = (on) => `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc83d' : 'none'}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"${on ? '' : ' stroke-dasharray="2.6 2.2" opacity=".55"'}/></svg>`;
  const TICK = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#10223f" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CSS = `
#hsc-rush{--c:#46c43a;--p:1;position:fixed;z-index:21;left:50%;pointer-events:none;top:calc(env(safe-area-inset-top) / var(--hsc-s,1) + 8px);transform:translateX(-50%);display:none;width:60px;height:60px;box-sizing:border-box;border-radius:50%;border:3px solid ${INK};background:conic-gradient(var(--c) calc(var(--p) * 1turn),#c9d6e4 0);box-shadow:inset 0 2px 0 #fff9,0 4px 0 ${INK},0 6px 8px #0004;zoom:var(--hsc-s,1)}
#hsc-rush.on{display:block}
#hsc-rush span{position:absolute;inset:5px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:linear-gradient(#fff,#e4f3ff);box-shadow:inset 0 0 0 2px #10223f22;color:${INK};font:900 1em "Arial Rounded MT Bold","Nunito",system-ui,sans-serif;font-variant-numeric:tabular-nums}
#hsc-rush.mid{--c:#ffb21a}
#hsc-rush.low{--c:#f04436;animation:hsc-rushb .5s ease-in-out infinite}
#hsc-rush.low span{color:#d11f14}
#hsc-rush.end{animation-duration:.25s}
@keyframes hsc-rushb{50%{transform:translateX(-50%) scale(1.14)}}
body.hsc-reveal #hsc-rush{display:none}
.hsc-toast{position:fixed;z-index:41;left:0;top:0;zoom:var(--hsc-s,1);transform-origin:50% 50%;display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:26px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 4px 0 ${INK};font:900 24px "DM Sans",system-ui,sans-serif;color:${INK};animation:hsc-toast 1.8s ease-out forwards;pointer-events:none}
@keyframes hsc-toast{0%{opacity:0;transform:translateY(20%) scale(.6)}15%{opacity:1;transform:scale(1.05)}25%{transform:none}80%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-20%)}}
@media (prefers-reduced-motion:reduce){#hsc-rush.low{animation:none}}
`;
  const COIN = HSC.icon ? HSC.icon('coin', 30) : `<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="9.5" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a12" stroke-width="1.8"/></svg>`; // the theme's one coin (icons.js)
  const ui = {
    el: {}, built: false,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const r = document.createElement('div'); r.id = 'hsc-rush'; r.setAttribute('aria-hidden', 'true'); r.innerHTML = '<span></span>';
      document.body.append(r);
      Object.assign(this.el, { rush: r });
      setInterval(() => this.tick(), 100);
    },
    toast(kind) {
      const t = document.createElement('div'); t.className = 'hsc-toast';
      t.innerHTML = kind === 'round' ? `${ICON.rush.replace(/56/g, '40')}${COIN}<span>+50</span>` : '';
      // drawn at the UI scale like every layer, and placed in a free spot off the customer's head (requests.js)
      t.style.cssText = 'visibility:hidden;animation:none';
      document.body.appendChild(t);
      const S = HSC.S || 1, r = t.getBoundingClientRect();
      const p = HSC.uiPlace ? HSC.uiPlace.spot(r.width, r.height) : { x: (innerWidth - r.width) / 2, y: innerHeight * 0.12, k: 1 };
      const z = S * p.k;
      t.style.cssText = `zoom:${z};left:${p.x / z}px;top:${p.y / z}px`;
      setTimeout(() => t.remove(), 1900);
    },
    // the clock's centre on the top row, in screen px: the middle of the screen, unless the customer's head reaches
    // up there (a landscape phone, the head tilted): then the nearest free spot on the row beside his head, clear of
    // the top buttons. It never takes a touch, so if no spot is free it stays in the middle over the hair
    clockX(home) {
      const W = innerWidth, size = home.height, half = size / 2, S = HSC.S || 1, gap = 6 * S;
      const mid = W / 2, row = { t: home.top, b: home.bottom };
      const hd = HSC.uiPlace && HSC.uiPlace.head ? HSC.uiPlace.head() : null;
      const at = (x) => ({ l: x - half, r: x + half, ...row });
      const hit = (a, b) => a.l < b.r + gap && a.r > b.l - gap && a.t < b.b + gap && a.b > b.t - gap;
      if (!hd || !hit(at(mid), hd)) return mid;
      const btns = [...document.querySelectorAll('#hsc-menu-btn,.ui .top button,#hsc-hud .hsc-row button')].map((e) => e.getBoundingClientRect()).filter((b) => b.width > 1).map((b) => ({ l: b.left, r: b.right, t: b.top, b: b.bottom }));
      const xs = [hd.l - gap - half - 0.5, hd.r + gap + half + 0.5];
      for (const b of btns) xs.push(b.r + gap + half + 0.5, b.l - gap - half - 0.5);
      let best = null;
      for (const x of xs) {
        const a = at(x);
        if (a.l < 8 * S || a.r > W - 8 * S || hit(a, hd) || btns.some((b) => hit(a, b))) continue;
        if (best == null || Math.abs(x - mid) < Math.abs(best - mid)) best = x;
      }
      return best == null ? mid : best;
    },
    // the mode tiles on the home screen (menu.js calls this when it opens)
    tick() {
      const g = G();
      if (!g || !M() || !M().data) return;
      const s = g.getState(), m = current();
      // the rush clock starts when a tidy-up customer sits down
      const ca = m === 'career' && CR() ? CR().active() : null;
      const jb = data().job, ownJob = jb && jb.n === s.jobId && !jb.none;
      // a Rush customer with no tidy-up asks for an ordinary cut (request above), still against the clock
      const cr = ca && ca.mode === 'rush' && ca.job === s.jobId ? ca : null;
      const rushing = s.status === 'cutting' && (m === 'rush' ? !!(jb && jb.n === s.jobId) : m === 'requests' ? !!(ownJob && jb.m === 'rush') : !!cr);
      const now = performance.now(), md = data(), key = cr ? 'c:' + cr.id : 'j:' + s.jobId;
      if (rushing && (rush.job !== s.jobId || rush.key !== key)) {
        const c = cr ? (md.cclock && md.cclock.id === String(cr.id) ? md.cclock.ms : 0) : md.clock && md.clock.n === s.jobId ? md.clock.ms : 0;
        Object.assign(rush, { job: s.jobId, key, used: c, last: now, held: true, saved: Math.floor(c / 5000) });
      }
      if (!rushing && s.status === 'cutting') { rush.job = null; rush.key = null; }
      if (rushing) {
        const v = g.getView ? g.getView() : null;
        // a video in progress (an undo, a wish) always holds the clock, whether or not the host has paused the game yet
        const hold = rush.ads > 0 || document.hidden || (v && v.paused) || document.querySelector('#hsc-menu.open, #hsc-reveal.on');
        // real play time counts in full, even on a busy device; the step after any hold (an ad, a menu, the splash,
        // the app in the background, see the visibility listener) never counts, so a pause is never charged
        const dt = Math.min(5000, Math.max(0, now - rush.last)), wasHeld = rush.held;
        rush.last = now; rush.held = !!hold;
        if (!hold && !wasHeld) rush.used = Math.min(rush.LIMIT, rush.used + dt);
        // saved every 5 s of play and whenever the clock is held (a pause, a menu, the app leaving), not every second:
        // each save writes the whole save file
        const step = Math.floor(rush.used / 5000);
        if (md && (step !== rush.saved || (hold && !wasHeld))) {
          rush.saved = step;
          if (cr) md.cclock = { id: String(cr.id), ms: Math.round(rush.used) }; else md.clock = { n: s.jobId, ms: Math.round(rush.used) };
          M().save();
        }
        // time is up: the haircut ends exactly as if Finish were pressed (the engine refuses while paused; the next tick retries)
        if (rush.used >= rush.LIMIT && !hold) g.finish();
      }
      const ms = timeLeft(), left = Math.ceil(ms / 1000), el = this.el.rush;
      el.classList.toggle('on', rushing);
      el.classList.toggle('mid', rushing && left <= 20 && left > 10);
      el.classList.toggle('low', rushing && left <= 10);
      el.classList.toggle('end', rushing && left <= 5);
      if (!rushing) { this.beat = null; return; }
      // on the same line as the Home and Finish buttons, at their scale
      const home = document.querySelector('#hsc-menu-btn'), r = home && home.getBoundingClientRect(), S = HSC.S || 1;
      if (r && r.height) { const size = r.height / S; Object.assign(el.style, { width: size + 'px', height: size + 'px', top: r.top / S + 'px', fontSize: size * 0.4 + 'px', left: this.clockX(r) / S + 'px' }); }
      el.style.setProperty('--p', (ms / rush.LIMIT).toFixed(3));
      el.querySelector('span').textContent = left;
      // tick, tock, each second; twice as fast in the last ten; a bell at zero
      const beat = ms <= 0 ? 'end' : left <= 10 ? 'h' + Math.ceil(ms / 500) : 's' + left;
      if (beat !== this.beat) {
        const first = this.beat == null;
        this.beat = beat; this.flip = !this.flip;
        if (!first && HSC.fx) HSC.fx.play(beat === 'end' ? 'bell' : this.flip ? 'tick' : 'tock');
      }
    },
  };

  // every rewarded video goes through HSC.watchVideo (the wardrobe owns it and its earned callback): this only counts
  // the videos in progress for the Rush clock, then hands over unchanged, with the same result
  function holdForVideos() {
    const wv = HSC.watchVideo;
    if (typeof wv !== 'function' || wv.__rushHeld) return;
    const held = async function () { rush.ads++; rush.held = true; try { return await wv.apply(this, arguments); } finally { rush.ads = Math.max(0, rush.ads - 1); rush.held = true; } };
    held.__rushHeld = true; held.__routed = wv.__routed;
    HSC.watchVideo = held;
  }
  const boot = () => {
    if (globalThis.skinFadeStudio && HSC.meta && HSC.meta.data && HSC.requestKit && document.body && HSC.ensure && HSC.personForJob) { hook(); holdForVideos(); ui.build(); }
    else setTimeout(boot, 200);
  };
  boot();
  HSC.modes = {
    current, unlocked, inCareer, list: LIST, level: LEVEL, set: setMode,
    request: (s) => request(s), judged, worked, changedCells, MIN_WORK, tips, done, beardStars, beardJob, beardTarget, econJob, recently, noteAsk,
    unscored: () => { const m = current(); return m === 'free' || (m === 'career' && CR().unscored()); },
    icon: (m) => ICON[m],
    // the job builders, for the career catalog (career-catalog.js)
    build: { options, disaster, beardDisaster, tidy, beardJob, beardGrid },
    // a mode just unlocked and not played yet
    isNew: (m) => { const md = data(); return m !== 'requests' && unlocked(m) && !(md && Array.isArray(md.tried) && md.tried.includes(m)); },
  };
})(globalThis.HSC || (globalThis.HSC = {}));
