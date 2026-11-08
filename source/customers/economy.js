// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the economy (docs/ECONOMY-ARCHITECTURE.md, ECONOMY-BALANCE-MODEL.md,
// ECONOMY-IMPLEMENTATION-AND-QA.md; owner-approved and locked 5 November 2026). Rollout Gate A: offline economy.
//
// Pure logic: one versioned configuration holds every number, and every coin change is one transaction with an
// idempotency key, so a replayed reveal, a duplicate ad callback or a reload can never pay twice.
//
//   job payout   net = haircut fee - operating cost + organic tip + demand bonus. Stars decide the
//                tip (0 / 25 / 60% of the net fee; 60% from the 7 November 2026 calibration); regular +4 and VIP +25% of the net fee apply to the tip, which is then capped at the net fee. A rewarded triple adds two tips, as its
//                own transaction.
//   bill         the first five contracts are sponsored; each later five-contract cycle starts with a 60-coin
//                operating bill, posted at the preceding result boundary so it is visible before the next shift,
//                into debt. The balance is signed: debt never blocks play; discretionary buys need the price.
//   milestones   career facts pay once (first haircut, home chapter, licence, first city showcase, ...).
//   ledger       the balance and lifetime totals by category are authoritative; a bounded recent ledger explains
//                them. Recent idempotency keys are kept in a bounded ring; career contracts are idempotent by id.
// Not here: Play Billing (Gate C), interstitial changes (Gate D), staff and facilities (Gate E).
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const CONFIG = {
    version: 2,
    // [gross fee, operating cost] per contract type (balance model section 3)
    fee: { requests: [28, 4], fix: [30, 6], beard: [26, 4], rush: [13, 2], showcase: [52, 8], free: [0, 0] },
    // the result video: two more tips, never less than the floor. It comes at random, in every mode, so seeing it is a small
    // relief and a reason for one more customer. After each offer a hidden wait is drawn: waits[n] is the chance of n results
    // with no video, so no count ever tells the player when it is due. Quick Play earns only this, a few a day
    video: { floor: 15, practicePerDay: 5, waits: [0.5, 0.25, 0.12, 0.08, 0.05] },
    flatTip: 6, // Rescue and Beards have no order to score: the barber's judgment earns a set tip, so the result video stays
    tipShare: { 1: 0, 2: 0.25, 3: 0.6 }, // of the net fee
    regular: 4, vipShare: 0.25, rushMax: 5,
    // owner decision 7 November 2026: Rush is two to three times faster than other jobs, so it pays about 2.5 times less a
    // job (fee 32 -> 13, time bonus up to 12 -> 5) and earns about the same a minute. The first 20 paid jobs forgive a
    // weak cut: a 1-star job still earns the 2-star tip, because new players leave over bad early results, not prices
    early: { jobs: 20, tipShare: 0.25 },
    demand: { share: 0.2, max: 12, perShift: 3, shiftLength: 5 },
    // Quick Play pays a little for real work, up to a daily limit: no bill, no level, and never worth farming over paid jobs
    quickPlay: { pay: 5, perDay: 10 },
    // a video toward the wishlist, and the one-time Starter Pack for when Play Billing goes in (shown after the first shop
    // visit or wishlist, once three customers are done; Monetization Strategy section 11)
    wishVideo: { coins: 40, perDay: 2 }, starterPack: { coins: 2500, afterCustomers: 3 },
    // what real money buys (Monetization Strategy section 11): the game shows no price; Google Play shows it at purchase
    packs: [{ id: 'coins_500', coins: 500 }, { id: 'coins_3000', coins: 3000 }, { id: 'coins_7500', coins: 7500 }, { id: 'coins_18000', coins: 18000 }],
    supporterBundle: { coins: 3000 },
    bill: { every: 5, amount: 60, subsidised: 5, lines: { rent: 30, utilities: 15, cleaning: 10, supplies: 5 } },
    // owner decision 6 November 2026 (economy simulator): one-off payouts cut so ordinary work carries more of the income; paid milestones keep their keys and are never repaid or taken back
    milestones: { firstHaircut: 40, homeChapter: 75, licence: 300, cityShowcase: 50, cityMastery: 100, cityChapter: 20, tour: 200 },
    levels: [[2, 5, 50], [6, 9, 75], [10, 12, 100]], // one-time coins for reaching a level; none after 12
    goal: 25, // one daily task
    gift: { at: [600, 1200, 1800], pay: [20, 40, 60] }, // the play-time gift: seconds played today and what each pays
    salon: [100, 300, 800, 1750], // price of tier 0->1, 1->2, 2->3, 3->4 in every slot
    wardrobe: { starter: 0, common: 120, uncommon: 350, rare: 900, premium: 2400 },
    ledgerSize: 60, keyRing: 300,
    maxBalance: 999999999, minBalance: -999999999,
  };

  function fresh() {
    return { v: 1, cfg: CONFIG.version, balance: 0, seq: 0, ledger: [], keys: [], sources: {}, sinks: {}, paid: 0, cycle: { id: 0, billed: 0 }, milestones: [], levelsPaid: 0, daily: null, freestyleThanked: false, demand: null, migrated: false };
  }
  const clampBal = (n) => Math.max(CONFIG.minBalance, Math.min(CONFIG.maxBalance, n));

  // ---- one transaction: idempotent by key; returns { eco, txn, duplicate } (the input is not changed) ----
  function apply(eco0, t) {
    if (!t || !t.key || !Number.isSafeInteger(t.amount) || Math.abs(t.amount) > 1e9) return { eco: eco0, error: 'bad-transaction' };
    if (eco0.keys.includes(t.key)) return { eco: eco0, duplicate: true, txn: eco0.ledger.find((x) => x.key === t.key) || null };
    // discretionary purchases need the price in hand; mandatory costs post even into debt
    if (t.type === 'buy' && eco0.balance < -t.amount) return { eco: eco0, error: 'insufficient' };
    const eco = JSON.parse(JSON.stringify(eco0));
    const before = eco.balance;
    eco.balance = clampBal(before + t.amount);
    eco.seq++;
    const txn = { id: eco.seq, key: t.key, type: t.type, cat: t.cat, amount: t.amount, item: t.item || null, ref: t.ref || null, before, after: eco.balance, cfg: CONFIG.version, lines: t.lines || null };
    eco.ledger.push(txn); if (eco.ledger.length > CONFIG.ledgerSize) eco.ledger.splice(0, eco.ledger.length - CONFIG.ledgerSize);
    eco.keys.push(t.key); if (eco.keys.length > CONFIG.keyRing) eco.keys.splice(0, eco.keys.length - CONFIG.keyRing);
    const book = t.amount >= 0 ? eco.sources : eco.sinks;
    book[t.cat] = (book[t.cat] || 0) + Math.abs(t.amount);
    return { eco, txn };
  }

  // ---- the job payout (balance model sections 2-7) ----
  // job: { kind (mode or 'showcase'), stars, judged (no order: a set tip), valid, regular, vip, rushBonus (0..12), demandMatch }
  function payout(job) {
    const kind = job.kind in CONFIG.fee ? job.kind : 'requests';
    const [gross, cost] = CONFIG.fee[kind];
    const net = gross - cost;
    if (!job.valid || kind === 'free') return { total: 0, net: 0, tip: 0, lines: [], kind };
    // the organic tip: from stars, then regular and VIP, capped at the net fee
    let tip = job.judged ? CONFIG.flatTip : net * Math.max(CONFIG.tipShare[job.stars] || 0, job.early ? CONFIG.early.tipShare : 0);
    if (job.regular) tip += CONFIG.regular;
    if (job.vip) tip += net * CONFIG.vipShare;
    tip = Math.round(Math.min(tip, net));
    const rush = kind === 'rush' ? Math.max(0, Math.min(CONFIG.rushMax, Math.round(job.rushBonus || 0))) : 0;
    const demand = job.demandMatch ? Math.min(CONFIG.demand.max, Math.round(net * CONFIG.demand.share)) : 0;
    const lines = [['fee', gross], ['cost', -cost]];
    if (tip) lines.push(['tip', tip]);
    if (rush) lines.push(['rush', rush]);
    if (demand) lines.push(['demand', demand]);
    const total = lines.reduce((a, l) => a + l[1], 0);
    return { total, net, tip, lines, kind };
  }

  // ---- demand shifts (balance model section 7): each shift of five paid contracts highlights up to two modes ----
  // Derived from the paid-contract count, so nothing to save and nothing a reload can re-roll: a seeded permutation
  // per pass of the list means every eligible mode appears before the deck repeats. Only the bonuses used this shift
  // are stored. Quick Play is never a target; demand never depends on who the customer is.
  const DEMAND_MODES = ['requests', 'fix', 'beard', 'rush'];
  const shiftOf = (paid) => Math.floor(paid / CONFIG.demand.shiftLength);
  function demandModes(paid, eligible) {
    const list = DEMAND_MODES.filter((m) => !eligible || eligible.includes(m));
    if (!list.length) return [];
    const shift = shiftOf(paid), n = Math.min(2, list.length), out = [];
    const deck = (c) => { const a = list.slice(); let h = (c + 1) * 2654435761 >>> 0; for (let i = a.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    for (let k = 0, i = shift * n; out.length < n && k < n + list.length; k++, i++) { const m = deck(Math.floor(i / list.length))[i % list.length]; if (!out.includes(m)) out.push(m); }
    return out;
  }
  function demandMatch(eco, mode, eligible) {
    const used = eco.demand && eco.demand.shift === shiftOf(eco.paid) ? eco.demand.used : 0;
    return used < CONFIG.demand.perShift && demandModes(eco.paid, eligible).includes(mode);
  }

  // ---- paying a finished job: the base transaction, then the operating bill when a cycle closes ----
  function payJob(eco0, key, job) {
    const p = payout(job);
    if (!p.total && !p.lines.length) return { eco: eco0, payout: p };
    let r = apply(eco0, { key, type: 'earn', cat: 'job', amount: p.total, lines: p.lines, ref: job.ref || null });
    if (r.error || r.duplicate) return Object.assign(r, { payout: p });
    let eco = r.eco;
    if (job.demandMatch) { const sh = shiftOf(eco.paid), d = eco.demand; eco.demand = { shift: sh, used: (d && d.shift === sh ? d.used : 0) + 1 }; }
    eco.paid++;
    // At the end of jobs 5/10/15..., post the next cycle's bill. The result screen therefore discloses it before
    // the player can start jobs 6/11/16..., while a duplicate result cannot post it twice.
    const B = CONFIG.bill;
    let bill = null;
    if (eco.paid >= B.subsidised && eco.paid % B.every === 0) {
      const cycle = eco.paid / B.every;
      const b = apply(eco, { key: 'bill:' + cycle, type: 'cost', cat: 'bill', amount: -B.amount, lines: Object.entries(B.lines).map(([k, v]) => [k, -v]) });
      eco = b.eco; bill = b.txn || null; eco.cycle = { id: cycle, billed: cycle };
    }
    return { eco, txn: r.txn, payout: p, bill };
  }
  // the next bill: how many paid contracts until it posts (for the player's view)
  function billDue(eco) {
    const B = CONFIG.bill;
    if (eco.paid < B.subsidised) return { sponsored: B.subsidised - eco.paid, amount: B.amount };
    return { inJobs: B.every - (eco.paid % B.every), amount: B.amount };
  }
  // the rewarded result video: two more organic tips, at least the floor, keyed to the job so a duplicate callback cannot pay again
  const videoPay = (tip) => Math.max(2 * Math.max(0, tip | 0), CONFIG.video.floor);
  // the hidden wait until the next offer, from a roll of 0..1
  const videoWait = (roll) => { let a = 0; const w = CONFIG.video.waits; for (let i = 0; i < w.length; i++) { a += w[i]; if (roll < a) return i; } return w.length - 1; };
  function tripleTip(eco, jobKey, tip) { return apply(eco, { key: jobKey + ':triple', type: 'reward', cat: 'rewarded', amount: videoPay(tip) }); }

  // ---- career milestones (balance model section 9): one payment per career fact ----
  function milestonesFor(events, pos, firstHaircut) {
    const out = [];
    if (firstHaircut) out.push(['first-haircut', CONFIG.milestones.firstHaircut]);
    for (const e of events || []) {
      if (e === 'licence-complete') out.push(['licence', CONFIG.milestones.licence]);
      else if (e.startsWith('branch-established:')) out.push(['showcase:' + e.split(':')[1], CONFIG.milestones.cityShowcase]);
      else if (e.startsWith('tour-complete:')) out.push(['tour:' + e.split(':')[1], CONFIG.milestones.tour]);
      else if (e === 'chapter-complete' && pos) out.push(['chapter:' + pos.city + ':' + pos.visit + ':' + (pos.tour || 0), CONFIG.milestones.cityChapter]);
    }
    if (pos && pos.licence && pos.slot === 4) out.push(['home-chapter:' + pos.visit, CONFIG.milestones.homeChapter]);
    return out;
  }
  // A milestone that can be reached again (a mastered city is still mastered on its next chapter) is also kept in
  // the permanent `milestones` list, because the idempotency key ring is bounded and would forget it. Chapter
  // milestones are unique per chapter, so only their key is kept.
  const PERMANENT = (id) => !id.startsWith('chapter:');
  function payMilestones(eco0, list) {
    let eco = eco0;
    const paid = [];
    for (const [id, amount] of list) {
      if (PERMANENT(id) && Array.isArray(eco.milestones) && eco.milestones.includes(id)) continue;
      const r = apply(eco, { key: 'milestone:' + id, type: 'earn', cat: 'milestone', amount });
      if (!r.duplicate && !r.error) paid.push([id, amount]);
      eco = r.eco;
      if (!r.error && PERMANENT(id)) { eco = Object.assign({}, eco, { milestones: (Array.isArray(eco.milestones) ? eco.milestones : []).concat([id]) }); }
    }
    return { eco, paid };
  }
  // level rewards: capped (no automatic coins after level 12); paid once per level, never twice after migration
  function levelReward(level) { const row = CONFIG.levels.find(([a, b]) => level >= a && level <= b); return row ? row[2] : 0; }
  function payLevels(eco0, level) {
    let eco = eco0;
    for (let l = Math.max(2, eco.levelsPaid + 1); l <= level; l++) {
      const n = levelReward(l);
      const r = apply(eco, { key: 'level:' + l, type: 'earn', cat: 'level', amount: n });
      eco = r.eco; eco.levelsPaid = Math.max(eco.levelsPaid, l);
    }
    return eco;
  }
  // a discretionary purchase: the balance must cover the price (debt never buys)
  function buy(eco, key, cat, price, item) { return apply(eco, { key, type: 'buy', cat, amount: -Math.abs(price | 0), item }); }
  // a grant from a daily, weekly or calendar claim (key = the claim id)
  function grant(eco, key, cat, amount) { return apply(eco, { key, type: 'earn', cat, amount: Math.max(0, amount | 0) }); }

  // ---- migration from the existing game (implementation contract section 6) ----
  // keeps every coin; levels already reached are recorded as paid so history is never paid twice
  function migrate(eco0, old) {
    if (eco0.migrated) return eco0;
    const eco = JSON.parse(JSON.stringify(eco0));
    eco.balance = clampBal(Math.max(0, old.coins | 0));
    eco.levelsPaid = Math.max(1, old.level | 0);
    eco.migrated = true;
    eco.seq++;
    eco.ledger.push({ id: eco.seq, key: 'migration', type: 'migration', cat: 'migration', amount: 0, before: eco.balance, after: eco.balance, cfg: CONFIG.version });
    eco.keys.push('migration');
    return eco;
  }
  // the seven-day source-to-sink ratio and shares (for the simulator and QA)
  function report(eco) {
    const src = Object.values(eco.sources).reduce((a, b) => a + b, 0), snk = Object.values(eco.sinks).reduce((a, b) => a + b, 0);
    return { balance: eco.balance, sources: eco.sources, sinks: eco.sinks, ratio: src ? snk / src : 0 };
  }

  HSC.economy = { CONFIG, fresh, apply, payout, payJob, demandModes, demandMatch, billDue, tripleTip, videoPay, videoWait, milestonesFor, payMilestones, levelReward, payLevels, buy, grant, migrate, report };
})(globalThis.HSC || (globalThis.HSC = {}));
