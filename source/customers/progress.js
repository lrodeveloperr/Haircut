// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-approved 5 November 2026): progression and the daily return.
//
//   unlock bar   every finished customer fills the next clipper or robe a little (8% for 1 star, 12% for 2,
//                16% for 3). At 100% it is yours; a rewarded video also gives the one after it.
//   level badge  the barber level on a medal in the top bar; reaching a new level pays 20 coins per level.
//   calendar     7 tiles (20, 25, 30, 35, 40, 50 coins, then a chest with the next clipper or robe and 80
//                coins), one a day. A missed day pauses the calendar, it never resets. A video doubles a day.
//   daily tasks  3 small goals a day (fades, beards, regulars, 3-star cuts, customers, tips), 40 coins each;
//                15 finished in a week open a chest (200 coins and a clipper or robe). Values: economy.js.
// Everything is wordless: icons, numbers, bars and pictures. Saved through the platform storage.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const KEY = 'skin-fade-studio-progress-v1';
  const INK = '#10223f';
  const M = () => HSC.meta, G = () => globalThis.skinFadeStudio, A = () => HSC.wardrobeApi, C = () => HSC.catalog;
  const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const weekKey = (d = new Date()) => { const t = new Date(d); t.setHours(0, 0, 0, 0); t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); return dayKey(t); };
  const hash = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

  // the economy's values (economy.js, balance model section 11): 20..50 coins, then a chest of 80 and an item
  const CAL = [20, 25, 30, 35, 40, 50, 'chest'];
  const CHEST_PAY = 80;
  const TASKS = {
    fade: { goal: 3, test: (e) => e.fade },
    beard: { goal: 2, test: (e) => e.beard },
    regular: { goal: 1, test: (e) => e.regular },
    star3: { goal: 2, test: (e) => e.stars === 3 },
    customers: { goal: 5, test: () => true },
    tips: { goal: 120, amount: (e) => e.tips },
  };
  const TASK_PAY = 25, WEEK_GOAL = 15, WEEK_PAY = 200;

  // ---- saved state ----
  let P = null, client = null;
  const fresh = () => ({ v: 1, prize: null, cal: { idx: 0, last: null, doubled: null }, tasks: { day: null, list: [] }, week: { key: null, done: 0, opened: false }, level: 0, lastJob: null, seenDay: null });
  function sanitize(d) {
    const f = fresh();
    if (!d || typeof d !== 'object' || d.v !== 1) return f;
    const int = (v, lo, hi, dflt) => (Number.isSafeInteger(v) && v >= lo && v <= hi ? v : dflt);
    const day = (v) => (typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v) ? v : null);
    const prize = d.prize && typeof d.prize.key === 'string' && C().byKey.has(d.prize.key) ? { key: d.prize.key, pct: int(d.prize.pct, 0, 100, 0) } : null;
    const list = d.tasks && Array.isArray(d.tasks.list) ? d.tasks.list.filter((t) => t && TASKS[t.k]).slice(0, 3).map((t) => ({ k: t.k, n: int(t.n, 0, 1e6, 0), claimed: t.claimed === true })) : [];
    return {
      v: 1, prize,
      cal: { idx: int(d.cal && d.cal.idx, 0, 6, 0), last: day(d.cal && d.cal.last), doubled: day(d.cal && d.cal.doubled) },
      tasks: { day: day(d.tasks && d.tasks.day), list },
      week: { key: day(d.week && d.week.key), done: int(d.week && d.week.done, 0, 999, 0), opened: !!(d.week && d.week.opened === true) },
      level: int(d.level, 0, 9999, 0), lastJob: Number.isSafeInteger(d.lastJob) ? d.lastJob : null, seenDay: day(d.seenDay),
    };
  }
  const save = () => { if (client && client.saveProgress && P) client.saveProgress(KEY, P).catch(() => {}); };

  // ---- the next clipper or robe: the first one not owned, clippers and robes in turn, never today's offers ----
  function nextPrize(skip) {
    const api = A(), cat = C();
    if (!api || !cat) return null;
    const todays = new Set(api.todays()), n = Math.max(cat.designs.clipper.length, cat.designs.gown.length);
    for (let i = 1; i < n; i++) for (const t of ['clipper', 'gown']) {
      const d = cat.designs[t][i];
      if (d && !api.owns(d.key) && !todays.has(d.key) && d.key !== skip) return d.key;
    }
    return null;
  }
  function ensurePrize() {
    if (!P) return null;
    if (!P.prize || A().owns(P.prize.key)) { const k = nextPrize(); P.prize = k ? { key: k, pct: P.prize && A().owns(P.prize.key) ? 0 : (P.prize ? P.prize.pct : 0) } : null; }
    return P.prize;
  }

  // ---- daily tasks ----
  function ensureTasks() {
    const today = dayKey();
    if (P.tasks.day !== today) {
      const keys = Object.keys(TASKS), out = [];
      let h = hash('tasks|' + today);
      while (out.length < 3) { h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; const k = keys[h % keys.length]; if (!out.includes(k)) out.push(k); }
      P.tasks = { day: today, list: out.map((k) => ({ k, n: 0, claimed: false })) };
    }
    const wk = weekKey();
    if (P.week.key !== wk) P.week = { key: wk, done: 0, opened: false };
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

  // ---- after every finished customer (requests.js has scored him): the unlock bar and the tasks ----
  const done = HSC.onHaircutDone;
  HSC.onHaircutDone = function (state) {
    const r = done ? done.apply(this, arguments) : undefined;
    try { afterCut(state); } catch (e) { console.error('customers: progress failed', e); }
    return r;
  };
  function afterCut(s) {
    const d = M() && M().data, last = d && d.lastRound;
    if (!P || !last || last.job !== s.jobId || P.lastJob === s.jobId || !(s.cutStrokeCount > 0)) return;
    if (HSC.practiceJob && HSC.practiceJob(s.jobId)) return; // practice advances nothing (portfolio contract 5)
    P.lastJob = s.jobId;
    const p = s.look && s.look.person, req = HSC.requestFor ? HSC.requestFor(s) : null;
    const beard = Array.isArray(s.beard) && Array.isArray(s.startBeard) && s.beard.some((v, i) => v < s.startBeard[i]);
    track({ stars: last.stars, tips: last.paid, regular: !!(p && p.regular), beard, fade: !!(req && ['skin', 'fade', 'taper', 'temple'].includes(req.style.fam)) });
    const pr = ensurePrize();
    if (pr) {
      ui.prizeFrom = pr.pct;
      pr.pct = Math.min(100, pr.pct + ({ 1: 8, 2: 12, 3: 16 }[last.stars] || 8));
      ui.prizeKey = pr.key;
      if (pr.pct >= 100) { A().award(pr.key, 'bar'); ui.won = pr.key; P.prize = null; ensurePrize(); }
      else ui.won = null;
    }
    save();
  }

  // rewards from goals (tips from customers count toward the tips task in afterCut)
  // every claim is one idempotent transaction keyed by its claim id (economy.js)
  const pay = (n, cat, key) => HSC.coins.add(n, cat, key);

  // ---- the calendar ----
  const calReady = () => !!P && P.cal.last !== dayKey();
  function claimDay() {
    if (!calReady()) return null;
    const tile = CAL[P.cal.idx];
    let item = null;
    if (tile === 'chest') { pay(CHEST_PAY, 'calendar', 'calendar:' + dayKey()); const k = nextPrize(); if (k && A().award(k, 'calendar')) item = k; }
    else pay(tile, 'calendar', 'calendar:' + dayKey());
    P.cal.last = dayKey();
    P.cal.claimedIdx = P.cal.idx;
    P.cal.idx = (P.cal.idx + 1) % CAL.length;
    save();
    return { tile, item };
  }
  async function doubleDay(btn) {
    if (!P || P.cal.last !== dayKey() || P.cal.doubled === dayKey()) return;
    btn.disabled = true;
    const ok = HSC.watchVideo ? await HSC.watchVideo('double-daily') : false;
    if (ok && P.cal.doubled !== dayKey()) {
      const i = (P.cal.idx + CAL.length - 1) % CAL.length, tile = CAL[i];
      pay(tile === 'chest' ? CHEST_PAY : tile, 'rewarded', 'calendar-double:' + dayKey()); // a video doubles the coin portion only
      P.cal.doubled = dayKey();
      save();
    } else if (!ok) HSC.nope && HSC.nope(btn);
    btn.disabled = false;
    ui.panel();
  }

  // ---- icons ----
  const COIN_OLD = (s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><circle cx="12" cy="12" r="9.5" fill="#ffc83d" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a12" stroke-width="1.8"/><path d="M10.6 8.6h2.8v6.8" fill="none" stroke="#c98a12" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const COIN = (s = 22) => (HSC.icon ? HSC.icon('coin', s) : COIN_OLD(s)); // the theme's one coin (icons.js)
  const MEDAL = (n) => `<svg viewBox="0 0 40 40" width="40" height="40"><path d="M12 2h6l3 9-6 2zM28 2h-6l-3 9 6 2z" fill="#4a90d9" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><circle cx="20" cy="25" r="12" fill="#ffc83d" stroke="${INK}" stroke-width="2.4"/><text x="20" y="30" text-anchor="middle" font-family="DM Sans,system-ui,sans-serif" font-weight="900" font-size="${n > 99 ? 10 : n > 9 ? 13 : 15}" fill="${INK}">${n}</text></svg>`;
  const CHEST = (s = 34) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M3 10h18v10H3z" fill="#c9782e" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M3 10c0-4 3-6 9-6s9 2 9 6z" fill="#e0913b" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M3 12.5h18" stroke="#ffc83d" stroke-width="2"/><rect x="10" y="10.5" width="4" height="5" rx="1" fill="#ffc83d" stroke="${INK}" stroke-width="1.5"/></svg>`;
  const TICK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2f9e44" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const HANGER = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8a2 2 0 1 1 2-2c0 1-2 1.4-2 3L3 16h18z"/></svg>';
  const GIFT = '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="3.5" y="9" width="17" height="11" rx="1.5" fill="#ff5d73" stroke="' + INK + '" stroke-width="1.8"/><rect x="2.5" y="7" width="19" height="4" rx="1" fill="#ff7b8d" stroke="' + INK + '" stroke-width="1.8"/><path d="M12 7v13" stroke="#ffc83d" stroke-width="2.4"/><path d="M12 7c-2-4-6-3-4 0M12 7c2-4 6-3 4 0" fill="none" stroke="' + INK + '" stroke-width="1.6"/></svg>';
  const TASK_ICON = {
    fade: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 20c0-8 3-14 7-14s7 6 7 14" fill="#e9dcc4" stroke="' + INK + '" stroke-width="1.8"/><path d="M6.5 13c1-5 3-7 5.5-7s4.5 2 5.5 7" fill="#5a3b1f"/><path d="M6.2 14.5h11.6" stroke="#8d6b4c" stroke-width="2.2"/><path d="M5.6 17h12.8" stroke="#c3a789" stroke-width="2"/></svg>',
    beard: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 7c0 7 3 12 7 12s7-5 7-12c-2 3-4 4-7 4S7 10 5 7z" fill="#5a3b1f" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 12.5c1.5 1 4.5 1 6 0" stroke="#e9c9a8" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
    regular: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 20.5S3 15 3 8.8A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 9 2.2C21 15 12 20.5 12 20.5z" fill="#ff5d73" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/></svg>',
    star3: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="#ffc83d" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><text x="12" y="15" text-anchor="middle" font-family="DM Sans,system-ui" font-weight="900" font-size="7" fill="' + INK + '">3</text></svg>',
    customers: '<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="8" r="4" fill="#e9c9a8" stroke="' + INK + '" stroke-width="1.8"/><path d="M4 21c0-5 4-7 8-7s8 2 8 7z" fill="#4a90d9" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    tips: COIN(30),
  };

  // ---- UI ----
  const CSS = `
#hsc-goals-btn{position:relative;padding:0}
#hsc-goals-btn svg{width:40px;height:40px}
#hsc-goals{position:fixed;inset:0;z-index:30;display:none;background:#0d3f86b8;font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};touch-action:manipulation;zoom:var(--hsc-s,1)}
#hsc-goals.open{display:flex;align-items:flex-end;justify-content:center}
#hsc-goals .sheet{position:relative;width:min(100%,560px);max-height:92%;overflow-y:auto;display:flex;flex-direction:column;gap:14px;background:#fff6e6;border:3px solid ${INK};border-bottom:0;border-radius:26px 26px 0 0;box-shadow:0 -4px 0 ${INK};padding:14px max(14px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}
@media (orientation:landscape){#hsc-goals.open{align-items:center}#hsc-goals .sheet{border-radius:26px;border-bottom:3px solid ${INK};box-shadow:0 5px 0 ${INK}}}
#hsc-goals .head{display:flex;align-items:center;gap:12px}
#hsc-goals .head .bar{flex:1}
#hsc-goals .x{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};cursor:pointer;color:${INK};padding:0}
.hsc-bar{height:18px;border-radius:9px;background:#e9dcc4;border:2.5px solid ${INK};overflow:hidden}
.hsc-bar>i{display:block;height:100%;background:linear-gradient(#ffd45e,#ffb627);transition:width .6s}
#hsc-goals .cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
#hsc-goals .tile{position:relative;aspect-ratio:3/4;border-radius:14px;border:3px solid ${INK};background:#f1e4cc;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-weight:900;font-size:13px;padding:2px;cursor:default}
#hsc-goals .tile.got{background:#d8efd0}
#hsc-goals .tile.now{background:#ffe08a;cursor:pointer;animation:hsc-tile 1s ease-in-out infinite}
#hsc-goals .tile .ok{position:absolute;right:-6px;top:-8px}
@keyframes hsc-tile{50%{transform:scale(1.07)}}
#hsc-goals .row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:18px;border:3px solid ${INK};background:#fff}
#hsc-goals .row .bar{flex:1}
#hsc-goals .row .num{min-width:58px;text-align:center;font-weight:900;font-variant-numeric:tabular-nums}
#hsc-goals .claim{min-width:82px;height:48px;border-radius:24px;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};background:#ffb627;display:flex;align-items:center;justify-content:center;gap:4px;font-weight:900;font-size:17px;color:${INK};cursor:pointer;padding:0 10px}
#hsc-goals .claim:disabled{background:#e9dcc4;box-shadow:0 1px 0 ${INK};opacity:.75;cursor:default}
#hsc-goals .claim.on{animation:hsc-tile 1s ease-in-out infinite}
#hsc-goals .dbl{position:relative;align-self:center;height:50px;padding:0 18px 0 12px;border-radius:25px;background:#ffb627;border:3px solid ${INK};box-shadow:0 4px 0 ${INK};font-weight:900;font-size:22px;display:flex;gap:6px;align-items:center;cursor:pointer;color:${INK}}
#hsc-goals .dbl .hsc-ad,#hsc-score .hsc-prize .hsc-ad{position:absolute;right:-8px;bottom:-6px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#ffb627;color:${INK};border:2.5px solid ${INK}}
#hsc-goals [hidden],#hsc-score [hidden],#hsc-score .hsc-prize button[hidden],#hsc-goals .dbl[hidden]{display:none}
#hsc-score .hsc-prize{pointer-events:auto;display:flex;align-items:center;gap:8px;padding:6px 10px 6px 6px;border-radius:22px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 3px 0 ${INK}}
#hsc-score .hsc-prize .pic{position:relative;width:64px;height:64px}
#hsc-score .hsc-prize .pic img{position:absolute;inset:0;width:100%;height:100%}
#hsc-score .hsc-prize .pic img.grey{filter:grayscale(1) brightness(.75) opacity(.55)}
#hsc-score .hsc-prize .pic img.col{transition:clip-path 1s ease-out}
#hsc-score .hsc-prize .pct{font-weight:900;font-size:20px;min-width:56px;font-variant-numeric:tabular-nums}
#hsc-score .hsc-prize.won{background:radial-gradient(circle,#fff,#ffe08a);animation:hsc-pop .6s ease-out}
#hsc-score .hsc-prize button{position:relative;height:48px;min-width:48px;border-radius:24px;border:3px solid ${INK};box-shadow:0 3px 0 ${INK};background:#fff6e6;display:flex;align-items:center;justify-content:center;gap:4px;color:${INK};cursor:pointer;padding:0 10px;font-weight:900;font-size:18px}
#hsc-score .hsc-prize button.bonus{background:#ffb627}
#hsc-score .hsc-prize button:disabled{opacity:.55}
#hsc-score .hsc-lvl{display:flex;align-items:center;gap:6px;font-weight:900;font-size:22px;animation:hsc-pop .7s ease-out}
#hsc-score .hsc-lvl svg{width:64px;height:64px}
`;
  const ui = {
    el: {}, built: false, prizeFrom: null, prizeKey: null, won: null, wonShownJob: null, bonusUsed: null,
    build() {
      if (this.built || !document.body) return;
      this.built = true;
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const panel = document.createElement('div'); panel.id = 'hsc-goals';
      panel.innerHTML = `<div class="sheet" role="dialog" aria-label="Goals">
        <div class="head"><span class="medal"></span><div class="bar hsc-bar"><i></i></div><button class="x" type="button" aria-label="Close">${CLOSE}</button></div>
        <div class="cal"></div><button class="dbl" type="button" aria-label="Watch a video to double today's reward" hidden>${COIN(28)}<span>×2</span><span class="hsc-ad">${HSC.AD_ICON ? HSC.AD_ICON(18) : ''}</span></button>
        <div class="tasks"></div><div class="row week"><span>${CHEST(34)}</span><div class="bar hsc-bar"><i></i></div><span class="num"></span><button class="claim" type="button" aria-label="Open the weekly chest">${GIFT}</button></div>
      </div>`;
      document.body.appendChild(panel);
      this.el.panel = panel;
      panel.querySelector('.x').addEventListener('click', () => this.close());
      panel.addEventListener('click', (e) => { if (e.target === panel) this.close(); });
      panel.querySelector('.dbl').addEventListener('click', (e) => doubleDay(e.currentTarget));
      panel.querySelector('.week .claim').addEventListener('click', () => this.openWeek());
      // the score layer (requests.js) gets the unlock bar and the level-up medal
      const score = document.getElementById('hsc-score');
      if (score) {
        const lvl = document.createElement('div'); lvl.className = 'hsc-lvl'; lvl.hidden = true;
        const pz = document.createElement('div'); pz.className = 'hsc-prize'; pz.hidden = true;
        pz.innerHTML = `<div class="pic"><img class="grey" alt=""><img class="col" alt=""></div><span class="pct"></span>
          <button class="wear" type="button" aria-label="Wear it" hidden>${HANGER}</button>
          <button class="bonus" type="button" aria-label="Watch a video for one more" hidden>${GIFT}<span>+1</span><span class="hsc-ad">${HSC.AD_ICON ? HSC.AD_ICON(18) : ''}</span></button>`;
        score.append(lvl, pz);
        this.el.lvl = lvl; this.el.prize = pz;
        pz.querySelector('.wear').addEventListener('click', (e) => { const k = e.currentTarget.dataset.key; if (k) { A().wear(k); e.currentTarget.disabled = true; } });
        pz.querySelector('.bonus').addEventListener('click', (e) => this.bonus(e.currentTarget));
      }
      setInterval(() => this.tick(), 200);
    },
    button() {
      const row = document.querySelector('#hsc-hud .hsc-row');
      if (!row) return;
      if (!this.el.btn || !this.el.btn.isConnected) {
        const b = document.createElement('button');
        b.className = 'hsc-btn'; b.id = 'hsc-goals-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Goals');
        b.innerHTML = '<span class="m"></span><span class="hsc-dot" hidden></span>';
        b.addEventListener('click', () => this.open());
        row.insertBefore(b, row.children[1] || null); // right after the wardrobe
        this.el.btn = b;
      }
      const lv = M().level();
      if (this.el.btn.dataset.lv !== String(lv)) { this.el.btn.dataset.lv = String(lv); this.el.btn.querySelector('.m').innerHTML = MEDAL(lv); }
      const dot = calReady() || ensureTasks().some((t) => taskDone(t) && !t.claimed) || (P.week.done >= WEEK_GOAL && !P.week.opened);
      this.el.btn.querySelector('.hsc-dot').hidden = !dot;
    },
    open() { this.el.panel.classList.add('open'); this.panel(); },
    close() { this.el.panel.classList.remove('open'); },
    panel() {
      if (!this.el.panel.classList.contains('open')) return;
      const pn = this.el.panel, cuts = M().data.cuts, lv = M().level(), a = M().cutsFor(lv), b = M().cutsFor(lv + 1);
      pn.querySelector('.medal').innerHTML = MEDAL(lv);
      pn.querySelector('.head .bar i').style.width = Math.round(100 * Math.max(0, Math.min(1, (cuts - a) / Math.max(1, b - a)))) + '%';
      // calendar
      const ready = calReady();
      pn.querySelector('.cal').innerHTML = CAL.map((t, i) => {
        // collected this round of seven (after the chest, all seven show collected until the next day)
        const now = ready && i === P.cal.idx, done = i < P.cal.idx || (!ready && P.cal.idx === 0 && !!P.cal.last);
        return `<div class="tile${now ? ' now' : ''}${done ? ' got' : ''}" data-i="${i}">${t === 'chest' ? CHEST(30) : COIN(24) + '<span>' + t + '</span>'}${done ? '<span class="ok">' + TICK + '</span>' : ''}</div>`;
      }).join('');
      const nowTile = pn.querySelector('.tile.now');
      if (nowTile) nowTile.addEventListener('click', () => { const r = claimDay(); if (r) { this.burst(nowTile); this.panel(); this.button(); } });
      const dbl = pn.querySelector('.dbl');
      dbl.hidden = !(P.cal.last === dayKey() && P.cal.doubled !== dayKey() && HSC.canVideo && HSC.canVideo());
      // tasks
      pn.querySelector('.tasks').innerHTML = ensureTasks().map((t, i) => {
        const T = TASKS[t.k], ok = taskDone(t);
        return `<div class="row" data-i="${i}"><span>${TASK_ICON[t.k]}</span><div class="bar hsc-bar"><i style="width:${Math.round(100 * t.n / T.goal)}%"></i></div>
          <span class="num">${t.n}/${T.goal}</span><button class="claim${ok && !t.claimed ? ' on' : ''}" type="button" ${ok && !t.claimed ? '' : 'disabled'} aria-label="Collect">${t.claimed ? TICK : COIN(22) + '<span>' + TASK_PAY + '</span>'}</button></div>`;
      }).join('');
      pn.querySelectorAll('.tasks .claim').forEach((btn) => btn.addEventListener('click', () => {
        const t = P.tasks.list[+btn.closest('.row').dataset.i];
        if (!t || t.claimed || !taskDone(t)) return;
        t.claimed = true; P.week.done++; pay(TASK_PAY, 'goal', 'goal:' + dayKey() + ':' + t.k); save(); this.burst(btn); this.panel(); this.button();
      }));
      // week
      const w = pn.querySelector('.week');
      w.querySelector('.bar i').style.width = Math.round(100 * Math.min(1, P.week.done / WEEK_GOAL)) + '%';
      w.querySelector('.num').textContent = Math.min(P.week.done, WEEK_GOAL) + '/' + WEEK_GOAL;
      const wc = w.querySelector('.claim'), can = P.week.done >= WEEK_GOAL && !P.week.opened;
      wc.disabled = !can; wc.classList.toggle('on', can); wc.innerHTML = P.week.opened ? TICK : GIFT;
    },
    openWeek() {
      if (!(P.week.done >= WEEK_GOAL && !P.week.opened)) return;
      P.week.opened = true;
      pay(WEEK_PAY, 'weekly', 'weekly:' + P.week.key);
      const k = nextPrize();
      if (k) A().award(k, 'week');
      save();
      this.burst(this.el.panel.querySelector('.week .claim'));
      this.panel(); this.button();
    },
    burst(el) {
      const to = document.querySelector('.hsc-coins'), a = el.getBoundingClientRect(), b = to && to.getBoundingClientRect();
      if (!b || !b.width) return;
      for (let i = 0; i < 6; i++) {
        const c = document.createElement('div');
        c.className = 'hsc-fly'; c.innerHTML = COIN(24);
        c.style.left = a.left + a.width / 2 - 12 + 'px'; c.style.top = a.top + a.height / 2 - 12 + 'px';
        document.body.appendChild(c);
        setTimeout(() => { c.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.7)`; c.style.opacity = '.2'; }, 40 + i * 70);
        setTimeout(() => c.remove(), 950 + i * 70);
      }
    },
    async bonus(btn) {
      const won = this.won;
      if (!won || this.bonusUsed === won) return;
      btn.disabled = true;
      const ok = HSC.watchVideo ? await HSC.watchVideo('bonus-item') : false;
      if (ok && this.bonusUsed !== won) {
        const k = nextPrize(P.prize && P.prize.key);
        if (k && A().award(k, 'bonus')) { this.bonusUsed = won; this.showPrize(k, 100, 100, true); }
        else btn.disabled = false;
      } else { if (!ok) HSC.nope && HSC.nope(btn); btn.disabled = false; }
    },
    showPrize(key, from, to, won) {
      const pz = this.el.prize, d = C().byKey.get(key);
      if (!pz || !d) return;
      const url = A().picture(d, 128);
      pz.querySelectorAll('img').forEach((im) => { if (im.src !== url) im.src = url; });
      const col = pz.querySelector('img.col');
      col.style.transition = 'none'; col.style.clipPath = `inset(${100 - from}% 0 0 0)`;
      void col.offsetWidth;
      col.style.transition = ''; col.style.clipPath = `inset(${100 - to}% 0 0 0)`;
      pz.querySelector('.pct').textContent = won ? '' : to + '%';
      pz.querySelector('.pct').hidden = !!won;
      pz.classList.toggle('won', !!won);
      const wear = pz.querySelector('.wear'), bonus = pz.querySelector('.bonus');
      wear.hidden = !won; wear.disabled = false; wear.dataset.key = key;
      bonus.hidden = !(won && this.bonusUsed !== this.won && HSC.canVideo && HSC.canVideo());
      bonus.disabled = false;
      pz.hidden = false;
    },
    reveal(s) {
      // once per finished customer, when the score layer shows
      const key = s.jobId + ':' + s.cutStrokeCount;
      if (this.revealKey === key) return;
      this.revealKey = key;
      const last = M().data.lastRound;
      if (!last || last.job !== s.jobId) { this.el.prize.hidden = true; this.el.lvl.hidden = true; return; }
      if (this.won) this.showPrize(this.won, this.prizeFrom || 0, 100, true);
      else if (P.prize) this.showPrize(P.prize.key, this.prizeKey === P.prize.key && this.prizeFrom != null ? this.prizeFrom : P.prize.pct, P.prize.pct, false);
      else this.el.prize.hidden = true;
      // a new level: the medal and the economy's one-time level coins (50 / 75 / 100; none after level 12)
      const lv = M().level();
      if (lv > P.level) {
        const gained = lv - Math.max(1, P.level);
        let got = 0;
        if (P.level > 0 && gained > 0) for (let l = Math.max(2, P.level + 1); l <= lv; l++) { const n = HSC.economy ? HSC.economy.levelReward(l) : 0; if (n) { pay(n, 'level', 'level:' + l); got += n; } }
        P.level = lv; save();
        if (gained > 0) { this.el.lvl.innerHTML = MEDAL(lv) + (got ? '<span>+' + got + '</span>' + COIN(26) : ''); this.el.lvl.hidden = false; }
      } else this.el.lvl.hidden = true;
    },
    tick() {
      const g = G();
      if (!g || !P || !M() || !M().data) return;
      this.button();
      const s = g.getState();
      if (s.status === 'reveal' && document.body.classList.contains('hsc-reveal')) this.reveal(s);
      else if (s.status === 'cutting') { this.revealKey = null; if (this.won && this.wonJob !== s.jobId) { this.won = null; } }
      if (s.status === 'reveal') this.wonJob = s.jobId;
      // the first time each day, after the first customer ever: the calendar opens by itself
      if (s.status === 'cutting' && P.seenDay !== dayKey() && M().data.cuts >= 1 && calReady() && !document.querySelector('#hsc-panel.open')) {
        P.seenDay = dayKey(); save(); this.open();
      }
      this.panel();
    },
  };

  // QA: the saved progress (read only in the game)
  HSC.progressDebug = () => P;
  async function boot() {
    if (!G() || !document.body || !M() || !M().data || !A() || !HSC.coins) { setTimeout(boot, 300); return; }
    client = M().client;
    const d = client && client.loadProgress ? await client.loadProgress(KEY, null).catch(() => null) : null;
    P = sanitize(d);
    if (!P.level) P.level = M().level();
    ensureTasks(); ensurePrize(); save();
    ui.build();
  }
  boot();
})(globalThis.HSC || (globalThis.HSC = {}));
