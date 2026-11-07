// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the level moment and the daily tasks.
//
//   level        reaching a new level pays the economy's one-time level coins (economy.js).
//   daily tasks  3 small goals a day (fades, beards, regulars, 3-star cuts, customers, tips), each paying CONFIG.goal.
// Items are bought with coins: nothing here gives away a clipper or a gown (owner decision, 6 November 2026).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const KEY = 'skin-fade-studio-progress-v1';
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio;
  const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const hash = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

  const TASKS = {
    fade: { goal: 3, test: (e) => e.fade },
    beard: { goal: 2, test: (e) => e.beard },
    regular: { goal: 1, test: (e) => e.regular },
    star3: { goal: 2, test: (e) => e.stars === 3 },
    customers: { goal: 5, test: () => true },
    tips: { goal: 120, amount: (e) => e.tips },
  };
  const taskPay = () => HSC.economy.CONFIG.goal;

  // ---- saved state ----
  let P = null, client = null;
  const fresh = () => ({ v: 1, tasks: { day: null, list: [] }, level: 0, lastJob: null });
  function sanitize(d) {
    const f = fresh();
    if (!d || typeof d !== 'object' || d.v !== 1) return f;
    const int = (v, lo, hi, dflt) => (Number.isSafeInteger(v) && v >= lo && v <= hi ? v : dflt);
    const day = (v) => (typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v) ? v : null);
    const list = d.tasks && Array.isArray(d.tasks.list) ? d.tasks.list.filter((t) => t && TASKS[t.k]).slice(0, 3).map((t) => ({ k: t.k, n: int(t.n, 0, 1e6, 0), claimed: t.claimed === true })) : [];
    return {
      v: 1,
      tasks: { day: day(d.tasks && d.tasks.day), list },
      level: int(d.level, 0, 9999, 0), lastJob: Number.isSafeInteger(d.lastJob) ? d.lastJob : null,
    };
  }
  const save = () => { if (client && client.saveProgress && P) client.saveProgress(KEY, P).catch(() => {}); };

  // ---- daily tasks ----
  function ensureTasks() {
    const today = dayKey();
    if (P.tasks.day !== today) {
      // goals come only from what this barber can do today (balance model section 11): beards from level 2, regulars
      // once there is one to come back; fades, stars, customers and tips are always reachable, so three always exist
      const hasRegular = Object.values((HSC.careerRun && HSC.careerRun.body && HSC.careerRun.body() && HSC.careerRun.body().regs) || {}).some((l) => l && l.length) || !!(M() && M().data && (M().data.regulars || []).length);
      const keys = Object.keys(TASKS).filter((k) => (k !== 'beard' || (M() && M().level() >= 2)) && (k !== 'regular' || hasRegular)), out = [];
      let h = hash('tasks|' + today);
      while (out.length < 3) { h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; const k = keys[h % keys.length]; if (!out.includes(k)) out.push(k); }
      P.tasks = { day: today, list: out.map((k) => ({ k, n: 0, claimed: false })) };
    }
    return P.tasks.list;
  }
  const taskDone = (t) => t.n >= TASKS[t.k].goal;
  function track(e) {
    let changed = false;
    for (const t of ensureTasks()) {
      if (t.claimed || taskDone(t)) continue;
      const T = TASKS[t.k], add = T.amount ? T.amount(e) : T.test(e) ? 1 : 0;
      if (add > 0) { t.n = Math.min(T.goal, t.n + add); changed = true; }
    }
    if (changed) save();
  }

  // ---- after every finished customer (requests.js has scored him): the tasks ----
  const done = HSC.onHaircutDone;
  HSC.onHaircutDone = function (state) {
    const r = done ? done.apply(this, arguments) : undefined;
    try { afterCut(state); } catch (e) { console.error('customers: progress failed', e); }
    return r;
  };
  function afterCut(s) {
    const d = M() && M().data, last = d && d.lastRound;
    if (!P || !last || last.job !== s.jobId || P.lastJob === s.jobId || !(s.cutStrokeCount > 0)) return;
    // Quick Play is outside the tasks (a pressure-free customer cannot farm them)
    if (HSC.modes && HSC.modes.econJob && HSC.modes.econJob(s).kind === 'free') return;
    P.lastJob = s.jobId;
    const p = s.look && s.look.person, req = HSC.requestFor ? HSC.requestFor(s) : null;
    const beard = Array.isArray(s.beard) && Array.isArray(s.startBeard) && s.beard.some((v, i) => v < s.startBeard[i]);
    track({ stars: last.stars, tips: last.paid, regular: !!(p && p.regular), beard, fade: !!(req && ['skin', 'fade', 'taper', 'temple'].includes(req.style.fam)) });
    save();
  }

  // rewards from goals (tips from customers count toward the tips task in afterCut)
  // every claim is one idempotent transaction keyed by its claim id (economy.js)
  const pay = (n, cat, key) => HSC.coins.add(n, cat, key);

  // ---- the Free tab (shop.js) ----
  const WORDS = { fade: 'task_fade', beard: 'task_beard', regular: 'task_regular', star3: 'task_star3', customers: 'task_customers', tips: 'task_tips' };
  HSC.tasks = {
    list: () => (P ? ensureTasks().map((x) => ({ k: x.k, n: x.n, goal: TASKS[x.k].goal, done: taskDone(x), claimed: x.claimed, pay: taskPay(), text: (HSC.t ? HSC.t(WORDS[x.k]) : x.k).replace('{n}', TASKS[x.k].goal) })) : []),
    ready: () => !!P && ensureTasks().some((x) => taskDone(x) && !x.claimed),
    claim(i) {
      const x = P && P.tasks.list[i];
      if (!x || x.claimed || !taskDone(x)) return false;
      x.claimed = true; pay(taskPay(), 'goal', 'goal:' + dayKey() + ':' + x.k); save();
      return true;
    },
  };

  // ---- a new level: the economy's one-time coins, added to the result's one coin number ----
  const ui = {
    reveal(s) {
      const key = s.jobId + ':' + s.cutStrokeCount;
      if (this.revealKey === key) return;
      this.revealKey = key;
      const last = M().data.lastRound, lv = M().level();
      if (!last || last.job !== s.jobId || lv <= P.level) return;
      if (P.level > 0) for (let l = Math.max(2, P.level + 1); l <= lv; l++) { const n = HSC.economy ? HSC.economy.levelReward(l) : 0; if (n) { pay(n, 'level', 'level:' + l); last.mile = (last.mile || 0) + n; } }
      P.level = lv; save();
    },
    tick() {
      const g = G();
      if (!g || !P || !M() || !M().data) return;
      const s = g.getState();
      if (s.status === 'reveal' && document.body.classList.contains('hsc-reveal')) this.reveal(s);
      else if (s.status === 'cutting') this.revealKey = null;
    },
  };

  // QA: the saved progress (read only in the game)
  HSC.progressDebug = () => P;
  async function boot() {
    if (!G() || !document.body || !M() || !M().data || !HSC.coins) { setTimeout(boot, 300); return; }
    client = M().client;
    const d = client && client.loadProgress ? await client.loadProgress(KEY, null).catch(() => null) : null;
    P = sanitize(d);
    if (!P.level) P.level = M().level();
    ensureTasks(); save();
    setInterval(() => ui.tick(), 200);
  }
  boot();
})(globalThis.HSC || (globalThis.HSC = {}));
