# Implementation Plan — everything the locked docs define that the game does not do yet

Written 5 November 2026 from a line-by-line audit of all 28 documents in `docs/` against the code on
`feature/head-shapes-36` (commit `ea15237` plus the uncommitted working tree).

Authority: `EVERGREEN-GAME-IMPLEMENTATION-HANDOFF.md` authorizes the internal game-side work below. Anything
marked **[OWNER]** changes revenue, frozen code or a doc conflict and waits for an explicit decision. Anything
marked **[EXTERNAL]** needs Play Console, AdMob, Billing, research or human review and is built only up to a
disabled, tested interface.

Never touched: the age prompt / under-18 ad block (not reintroduced), Google test ad IDs in debug, build 9,
the approved renderer, clipper placement, controls and camera (unless an [OWNER] item is approved), the
Settings privacy action, earned-reward callbacks.

---

## 0. Baseline (done 5 Nov)

| Check | Result |
| --- | --- |
| Full Android build (`TARGET=full`) | pass |
| economy, career, career-save, director, salon unit suites | pass |
| viewport, graphics (150 cases), rewards (8), privacy (4 layouts), share-trigger | pass |
| completion-interstitial | **fails: harness.** The test runs the game's Next handler in an empty sandbox; the approved Android patches now call `HSC` inside it. Fix the harness, not the game. |
| bridge | **fails: guard-tap timeout.** File belongs to the other session's uncommitted graphics change; left alone. |

---

## 1. What the audit found — the defects first

These are bugs against already-locked rules. They come first because later work builds on them.

| # | Defect | Where | Effect today |
| --- | --- | --- | --- |
| D1 | The world map can never be used to pick a city: a finished chapter auto-picks the next city, so the save never sits in the `map` phase the tiles require | career-run.js:95-101, career-ui.js:107 | Map is display-only |
| D2 | One-city roster: every chapter closes a whole World Tour | career.js:154-188, career-run.js:23 | World Barber at contract 30, +1 Legend and +400 coins every 5 contracts, forever |
| D3 | Shop Owner can never show apart from Master; ranks are recomputed and can drop | career.js:209-220 | Wrong rank; a new mode would demote players |
| D4 | Tool mastery records only the tool in hand at the reveal | career-run.js:168 | Multi-tool mastery impossible |
| D5 | Regulars album reads the legacy list, not the career's regulars | collection.js:175 | Career regulars invisible |
| D6 | First-haircut 40-coin milestone only pays inside Career; default mode is Orders | career-run.js:181, modes.js:29 | Most players never get it |
| D7 | Salon ownership saved outside the coin journal | salon.js:13,93-106 | A crash can take coins without the part, or the reverse |
| D8 | Coins credited before the ledger is ready can be overwritten by `mirror()` | requests.js / career-run.js:60 | Rare lost coins at startup |
| D9 | Services complete and pay with no real change (aftershave tap, towel timer, massage hold, talc with nothing to sweep, nose by proximity, singe sizzle with no ear hair) | services.js:394-468, economy.js:81 | Coins for nothing; breaks the before/after rule |
| D10 | Undoing threading leaves it counted done; razor clears foam at the finger, not the blade | requests.js:287, services.js:467 | Wrong state / visible offset |
| D11 | Scissors cut to the selected clipper guard; trimmer leaves 0 mm on beard; brow ignores guard length | tools.js:23-47, state.js:144 | Tools don't behave as documented |
| D12 | Blade-size / strength settings change cutting power, scalp only | settings.js:34-41 | Accessibility setting alters scoring |
| D13 | Changing language leaves Home in the old language; ~44 screen-reader labels are English-only | menu.js:222, 13 files | Mixed-language UI |
| D14 | `zh`, `no`, `he`, `fa`, `ur` unmapped; numbers use the device locale, not the chosen language; 11 px shop label | labels.js:53-67, salon.js | Wrong fallback, below 12 px floor |
| D15 | Director: "broad" fallback is a no-op; population deficits drift per attempt; validation result not saved | career-catalog.js:32-96, career-run.js:78 | Skewed population, no audit trail |
| D16 | Customers aged 16-17 accepted | people.js:410 | Violates adult-customer invariant |
| D17 | Lookbook style book updated by every mode; "Practise" pays coins and stars | requests.js:117-127,240 | Breaks portfolio §4.1 and §5 |
| D18 | Regional shop (2,500) cheaper than its own parts (up to ~5,000); 1,800-coin parts ≈ 69 jobs | salon.js:19,34 | Arbitrage; above the 60-job stage cap — **[OWNER]** price change |

---

## 2. Work plan — five waves, each shippable and tested on its own

Effort: S = under half a day, M = 1-2 days, L = 3+ days.

### Wave 1 — Correctness (all locked rules, no new features)

| Item | Work | Effort | Tests |
| --- | --- | --- | --- |
| 1.1 | Test harness: give the completion-interstitial sandbox an `HSC` stub | S | suite passes |
| 1.2 | D3 rank: Owner ≠ Master; persist highest rank reached (`core.rankBest`) | S | career.cjs +2 |
| 1.3 | D4 multi-tool mastery: record every tool that produced a valid change during the job (`HSC.toolsUsed(job)`) | S | career.cjs |
| 1.4 | D5 one regular source: album reads career `regs` (with city), legacy list kept for non-career | S | browser |
| 1.5 | D6 first-haircut milestone on every paid path (idempotent key `milestone:firstCut`) | S | economy.cjs |
| 1.6 | D7 salon purchase written in the same journal commit as the coin spend; migrate existing ownership | M | salon.cjs, career-save.cjs |
| 1.7 | D8 queue credits until the ledger is ready, then post them by key | S | economy.cjs |
| 1.8 | D9/D10 services: each completes only on its documented state change; pay only for completed; undo restores service state; razor foam at the projected blade | M | new services.cjs |
| 1.9 | D11/D12 tool kernel: scissors ignore guards (cut one step per close), trimmer 0.5 mm everywhere, brow uses the mm kernel, settings change only collision width / per-pass feel equally on every surface | S | new tools.cjs |
| 1.10 | D13/D14 language: every panel re-renders on `hsc-language`; all aria-labels keyed in 12 packs; locale mapping (zh-Hans/Hant, nb, es-419, pt-BR), RTL set {ar, he, fa, ur}; `Intl.NumberFormat(lang)`; 12 px floor | M | labels unit + privacy.cjs extension |
| 1.11 | D15 director: working broad stage; deficits updated once per chosen customer; validation stage/reasons saved on the contract | S | director.cjs |
| 1.12 | D16 adults only (years ≥ 18) with seed-stable remap for existing persons | S | new customers.cjs |
| 1.13 | D17 style book from career facts only; Practise = Quick Play, zero coins/stars/progress | S | browser |

**Wave 1 status — implemented and verified 5 November 2026 (not committed).**

Evidence: full Android build; economy 10, career 14 (two new: Shop Owner apart from Master, sticky rank), career-save
7, director 100,000 contracts, salon 5, completion-interstitial, viewport, graphics 150, rewards 8, privacy (4
layouts, frozen renderer/wardrobe hashes unchanged), share-trigger — all pass. Headless real-game checks at
412×892 and 892×412: first-haircut milestone paid in Orders (36 job + 40 milestone), every tool's millimetre
target, tool-specific arc (scissors 3-16, beard trimmer 1-6, hidden for trimmer/razor), multi-tool record, atomic
shop purchase restored from the journal after a simulated lost shop save, German/Arabic/Portuguese switch reaching
Home and every spoken label, zero-reward Practice.

Decisions taken while implementing (each follows the locked contract; listed so they can be reviewed):

- **Scissors:** the contract wants the blade height from the scissors' physical position, but the camera and
  controls are frozen and give no height input. The tool-specific arc (approved) is used as the scissors' blade
  height scale in millimetres, labelled and spoken as such; it is not a guard.
- **Settings:** *Tool width* and *Cut per pass* are removed (contract 7.3 items 5-6: a setting may not change a
  tool's result or footprint). Saved values are ignored.
- **Nose trimmer** is out of the tray and never requested until nose hair exists as real state (Wave 4.3).
- **Threading** works only on the beard's cheek line (frozen at first touch, 80% completes); it no longer clears
  bulk beard or brows.
- **Talc** is no longer part of Relax rituals (a ritual cuts nothing, so there are no clippings to dust).
- **Heritage edges removed** from service requests and ear hair (threading and the ×1.3 ear-hair factor).
- The browser/document title "Barber Simulator: ASMR Haircut" stays in English (product name).

### Wave 2 — The evergreen career (world, continuity, portfolio)

| Item | Work | Effort |
| --- | --- | --- |
| 2.1 | **Menu (locked):** Home = Quick Play (pressure-free freestyle, no progression) first, Career second; Freestyle tile removed from Modes; `quick_play` key in 12 packs; four-layout browser matrix | S/M |
| 2.2 | **City registry:** §10 record schema + validator; 36 records from the handoff's candidate roster, all with the neutral low-confidence population table and `review:'owner'` until research lands **[OWNER: names]**; localized names via label keys | M |
| 2.3 | **Map choice (D1/D2):** chapter end → `map` phase; tap a city to travel; founding-city choice screen at career creation; relocation (`setBase`); tours close only when every enabled city is done; existing one-city saves migrate without losing rank, coins or Legend count | M |
| 2.4 | **Contract lifecycle:** suspended / replaced / archived states; Replace button for an offered contract; work checkpoints so a restart resumes the same grids; corrupt active contract → safe baseline for the same slot | M |
| 2.5 | **Save hardening:** schema migration chain + golden fixtures of today's saves; per-field sanitizer; 2.5 MB warning / 3 MB refusal; "update required" screen for a newer save; lease released on page hide | M |
| 2.6 | **Director completion:** style-family, service and regular decks; underuse weights; no 3+ customers in a row with the same hair/beard presence; comfort-band cap (+2); timer minimums; owned-tool feasibility; real-catalog generative browser test | M/L |
| 2.7 | **Regulars:** Recognized → Familiar → Trusted → Signature stages from visits; career calendar (`lastCareerDay`) drives regrowth; album shows stage and city | M |
| 2.8 | **Branches:** per-city salon selections layered on the shop's slots; branch screen; Growing/Mastered/Legend states; four-part city mastery; neutral-theme fallback | L |
| 2.9 | **Career Portfolio:** catalog + versioned frozen sets; passport with showcase seals; mastery cabinet; 24 favourite-work slots (card codec, 12 KiB per card, 384 KiB section); three-goal selector; `portfolio:set:version` rewards; migration that infers entries from existing career facts | L |
| 2.10 | Daily result attaches to career mastery | S |

**Wave 2 status — implemented 5 November 2026 (not committed).** Verification evidence is in §4a below.

What was built (files: `cities.js` and `portfolio.js` new; `career.js`, `career-run.js`, `career-ui.js`,
`career-catalog.js`, `career-save.js`, `director.js`, `menu.js`, `modes.js`, `salon.js`, `collection.js`,
`economy.js`, `tools.js`, `icons.js`, `labels.js`, `buildall.sh`):

- **2.1 Menu:** Home shows Quick Play (yellow, first) and Career (green, the career customer's portrait) side by
  side; Modes lists Orders, Rescue, Daily, Beards, Relax, Rush only. `free` stays the saved id. Career opens the
  map instead of seating anyone while a city must be chosen. `quick_play` in all 12 packs.
- **2.2 Cities:** the 36 candidate cities with the 8-group coverage allocation, each on the neutral population
  table, `confidence: 'low'`, `review: 'research'`, names in 12 languages (machine-drafted). A record and registry
  validator (sums, visitor bound, coverage, unsourced tables) runs in the unit suite. The map sorts by name in the
  player's language.
- **2.3 Map choice (D1/D2):** a career is created at startup on a placeholder city (the wallet needs the journal);
  the first Career tap asks for the founding city. A chapter's end puts the career on the map and the player picks
  the next city (a done city is practice). One-city saves migrate at the founding choice: the open tour takes the
  36-city roster and keeps its number, so rank and Legend count are kept; paid milestone keys follow the rename.
- **2.4 Lifecycle:** a contract follows the career chair (fixes a trap: leaving Career mid-contract stranded it
  forever). Leaving with work suspends it with a checkpoint; returning restores that haircut, scored from the
  original start. Replace (a swap icon on the career strip) works only with no meaningful work and redraws the same
  slot. A damaged saved contract is replaced by a fresh one for the same slot.
- **2.5 Save hardening:** journal schema 2 with a one-step migration chain and a real schema-1 fixture; per-field
  sanitizers (regulars, populations, contract, director memory, branches, portfolio); 2.5 MB warning / 3 MB refusal
  before writing; a stale writer is refused; the lease is released when the page is hidden and the next write
  reloads first (a reward credit arriving under a full-screen ad is never dropped); a newer save shows "Update the
  game to continue your Career" and is never overwritten.
- **2.6 Director:** style-family, service and regular decks with a capped ×2.5 underuse bonus; never a fourth
  customer in a row with the same broad hair state or facial-hair state (map logic §9; the plan's wording was
  corrected to the source rule); progression capped at the recent comfort band + 2; Rush jobs must fit 45 s with
  margins; beard requests must be reachable with the owned tools. Found and fixed: Rescue was charged twice
  (repair + precision), so the licence's rescue chapter fell back to plain trims in 23% of real-catalog contracts;
  now under 3%.
- **2.7 Regulars:** Recognized/Familiar/Trusted/Signature from visits; Familiar asks for his usual or a variation;
  Trusted regulars may come for specialist jobs, Signature regulars for showcases; regrowth follows the career
  calendar (a week per chapter, 1-6 weeks); the album shows stage dots and city.
- **2.8 Branches:** one branch record per city, created once at its first showcase, with its own salon look (the
  nine shop slots from parts already owned; starts as a copy of the founding salon; invalid looks fall back to the
  neutral salon). The salon behind the chair follows the city being played (Career) or the active base. City
  mastery has four parts (chapters + 3-star showcase, 4 gold styles, 4 skills, 2 returning-regular visits) and is
  now what Master Barber counts; earned ranks are kept. Branch states Established/Growing/Mastered/Legend (Legend:
  mastered plus 3-star showcases in three tours). Branch screen from the map: state, stars, mastery bars, regulars,
  Salon, Make base (after World Tour 1; queued during a haircut).
- **2.9 Portfolio:** opened from the rank chip. Overview (rank, tours, customers served, seals, three goals),
  styles, passport with showcase seals, regulars, mastery cabinet, Favourite work. Sets version by the hash of
  their id list. Seals and `portfolio:setId:version` claims commit in the job's own journal revision; existing
  careers are migrated from their facts once, with one zero-coin record. **Set rewards are seals and a branch
  wall seal only; coin amounts are left at 0 for the owner's economy decision (3.7).** 24 favourite cards with a
  64×32 3-bit codec (about 5 KB each; 12 KiB and 384 KiB budgets enforced); a full gallery asks which card to
  replace.
- **2.10 Daily:** a valid Daily raises career mastery (style, tools, services, mode) without a slot or progress.

Not done in Wave 2 (kept for later, no blocker): city previews with a customer montage and salon view (needs art
and research), visitor share per city (5.4), culturally specific branch themes (need research and review).

### Wave 3 — Economy completion and commercial routing

| Item | Work | Effort |
| --- | --- | --- |
| 3.1 | **Balance simulator** (`android/tests/economy-sim.cjs`): 30/90/365 days × casual/steady/skilled/debt archetypes; job distance per purchase, debt recovery, sources/sinks rolling 7-day ratio. Runs before any price change | M |
| 3.2 | **Result router (locked in MONETIZATION-STRATEGY):** one commercial outcome per contract id; interstitial moves from the reveal to Continue; an accepted or attempted rewarded on that result suppresses it; replay of the same job cannot fire a second one. Earned-reward callbacks unchanged. Revenue impact: fewer stacked ads per result, interstitial at a natural break instead of over the ×3 offer | M |
| 3.3 | Undo: one contextual rewarded entitlement per contract, offered after a measurable mistake | S |
| 3.4 | Wishlist (one target) + HUD coin-gap chip + "N jobs to next bill" on the result screen + three-distance goal panel | M |
| 3.5 | Wardrobe coin prices (120/350/900/2,400 tiers) and buy path; daily video stays at one video per item (AGENTS.md wins over the friction doc's two) | M |
| 3.6 | Quick Play: one-time 5 coins, no prize-bar/task progress; demand shifts wired; daily goals filtered to unlocked content; weekly chest duplicate → 50 coins | S |
| 3.7 | Re-price parts and regional shops into the bands the simulator proves **[OWNER]**; fold the play-time Gift (350-700/day) into the source budget **[OWNER]** | S |
| 3.8 | Branch fit-outs as coin sinks; facilities/staff only after their effect specs are approved | M |
| 3.9 | Neutral sponsor slots (`presented by` line, wall panel, shelf) that resolve to normal salon art when empty | S/M |

### Wave 4 — Tools, anatomy, services and audio

| Item | Work | Effort |
| --- | --- | --- |
| 4.1 | One `applyTool` reducer + effect record for beard, brow and services (scalp keeps the frozen kernel) | L |
| 4.2 | Skin/product grids: heat, moisture, lather, dry-shave stress, irritation, freshness; shader cue | M/L |
| 4.3 | Nose-hair slice: stable potential, strands, guarded-opening trim, 90% proof, save/undo | M |
| 4.4 | Ear-hair bundle state (saved), threading stray mask, brow body vs strays | M |
| 4.5 | First easy-tool batch: neck duster, spray bottle (wetness), foil shaver (needs 0.05 mm beard level), then shaving soap/cream, beard oil/balm, cold towel, alum | L |
| 4.6 | Minimal tray per mode; location starter set and loaned signature tool | M |
| 4.7 | One audio engine (single AudioContext, limiter, cached noise buffers, seeded variation); sounds only on real effect | M |
| 4.8 | Tool/service property tests: 100,000 randomized strokes, no reward without delta | M |
| 4.9 | **[OWNER, frozen controls]** guard arc hidden for scissors/razor and fine-trimmer labels for the beard trimmer | S |
| 4.10 | **[OWNER, frozen renderer]** 0.01 mm fixed-point scalp storage; thinning shears; blade-height input for scissors | L |

### Wave 5 — Customers, language and platform

**Before starting Wave 5: remind the owner.** They will change the UI first so the translation work is efficient (asked 5 November 2026). Do not start 5.6 until they confirm.

| Item | Work | Effort |
| --- | --- | --- |
| 5.1 | Customer schema v2: label-hashed seed streams per trait, person id, migration that keeps every saved regular looking identical | M |
| 5.2 | Remove protected-trait edges: threading and ear-hair frequency not by heritage; beard *style* moves to the city cultural profile (neutral = global table), heritage keeps density only; `tribal` motif renamed | S/M |
| 5.3 | Remove forced-trait shortcuts: Beards mode and VIPs select an eligible customer instead of rewriting one; level gates select, never mutate | M |
| 5.4 | Visitor origin and bounded visitor share per city; cultural-presentation profile (tattoo/piercing) with neutral fallback | M |
| 5.5 | Customer QA: 10,000-customer per-city audits, determinism, contact-sheet generator | M |
| 5.6 | 28 missing language packs as machine drafts, hidden from the selector until human review **[EXTERNAL review]**; bundled Noto fallback subsets within the size budget | L |
| 5.7 | **Google Play Games** native layer per the strategy: envelope from the career commit, native catalog/outbox/snapshot conflict logic, JUnit tests — all inert while the APP_ID is empty **[OWNER go-ahead + EXTERNAL console]** | L |
| 5.8 | Play Billing products **[EXTERNAL]**: cards stay hidden until the native host reports Billing | — |

---

## 3. Owner decisions (answered 5 November 2026)

1. **Prices (3.7): fix both.** Re-price shop parts/regions to ≤ 60 jobs per stage and fold the play-time Gift
   into the daily source budget, using simulator numbers shown before commit.
2. **City roster (2.2): 36 cities, neutral.** Ship the handoff's 36 candidate cities with the neutral population
   table, flagged `needs research` and for owner review before release.
3. **Frozen code (4.9, 4.10): guard arc only.** The tool-specific guard arc is allowed. The renderer stays
   frozen: no fixed-point scalp storage, so razor/foil residual work is beard-only and thinning shears stay out.
4. **Google Play Games (5.7): build it, inert.** Native layer and tests now; active only once Console IDs are
   added. Console setup and the privacy/Data Safety update remain the owner's.

## 4a. Wave 2 verification (5 November 2026, on the Mac)

| Check | Result |
| --- | --- |
| Full Android build (`TARGET=full`) | pass |
| economy 10, career 20 (new: founding, one-city migration, registry, Daily mastery, city mastery, relocation), career-save 11 (new: schema-1 fixture, size budget, stale writes, field sanitizing), salon 5, portfolio 4 (new suite) | pass |
| director: 100,000 synthetic contracts (new checks: no avoidable 4th same-state customer, comfort cap, family balance, stage-gated regulars) | pass |
| director-browser (new suite): 320 real-catalog contracts at levels 2 and 40 | pass |
| rewards 8, share-trigger, completion-interstitial, viewport, graphics 150, privacy 4 layouts (menu assertions updated to the locked Quick Play/Career contract; frozen renderer and wardrobe hashes unchanged) | pass |
| Headless real game: Home in 4 layouts and Russian; Quick Play; founding choice; 30-contract licence → map → next city; replace, suspend/resume across a mode switch, completion; damaged contract recovery after reload; newer-save update screen; regulars album; branch screen and branch salon; portfolio tabs, 24 cards, replacement; Wave 1 checks rerun | pass |
| Known open item | once in four runs the home screen stayed open after the founding-city choice; not reproduced in three reruns |
| bridge | not run: the other session's uncommitted graphics file (guard-tap timeout noted in Wave 1) |

## 4. How each wave is verified (on the Mac only)

1. Full build, all unit suites, all browser suites (phone/tablet × portrait/landscape).
2. Headless real-game run of the changed flows with screenshots reviewed.
3. Save migration fixtures from today's saves load identically.
4. Native: `./gradlew assembleDebug lintDebug testDebugUnitTest` for any Java change; installed-APK check on the
   local emulator before any release candidate.
5. No commit or push without the owner's request.
