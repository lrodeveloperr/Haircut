# Growth plan: engagement, retention, ad revenue and reach (Android)

**Career source-of-truth note:** Career structure is now approved separately in
[CAREER-MODE-ARCHITECTURE.md](CAREER-MODE-ARCHITECTURE.md). The economy, advertising, purchases and platform
services below remain proposals and are not implied by the career approval.

**Economy source-of-truth note:** The owner-approved holistic economy design is
[ECONOMY-ARCHITECTURE.md](ECONOMY-ARCHITECTURE.md). Where this older plan differs, the approved design controls.
The owner rejected paid ad removal on 5 November 2026; no purchase or bundle may suppress advertising.

Status: **proposal, awaiting owner approval.** Written 5 November 2026. Nothing in this document is implemented
unless it is marked **built**. It extends `docs/ENGAGEMENT-PLAN.md` (4 November) and replaces its ordering.

## Where the game stands

- **Players:** about 320 monthly users (30–50 a day) from the AdMob data reviewed on 4 November.
- **Ads:**
  - only 3% of loaded rewarded ads are shown,
  - an interstitial at the end of every customer plus a permanent banner, per the owner's direction of 1 November (`android/MONETIZATION-2026-11-01.md`),
  - AdMob only, with mediation deferred until AppLovin replies,
  - app-ads.txt verification and app readiness review are still listed as pending after publication.
- **Built:**
  - 12 phenotype groups, 240 faces, 1A–4C textures, beards and walk-in cuts,
  - regulars, skin details and accessories,
  - realistic hair (C) and falling hair (3),
  - share card, review prompt, daily items and a VIP.
- **Reach today:**
  - a download of about 5–6 MB (a big advantage),
  - Android 8.0 and later (minSdk 26),
  - no text anywhere in the game,
  - store listings in 10 languages,
  - automatic Potato/Balanced/High/Ultra graphics with a protected visual floor and full Ultra ceiling,
  - works offline (ads need a connection).

The biggest revenue lever is not ad tuning. With 30–50 players a day, revenue is a few dollars a day whatever
the ad setup. The plan has to grow the number of players, keep them longer, and give them reasons to watch
rewarded videos.

## What the best games in the genre do

| Game | Size | What it is known for |
|---|---|---|
| Hair Challenge | ~200M installs | runner: collect hair, avoid blades |
| Hair Tattoo | ~162–192M | carving designs into short hair; many tools |
| Hair Dye | ~104M | colouring; 100% ads |
| Hair Salon | ~91M | salon decor, customers, styling |
| Barber Chop | ~24M, 3.8–4.5★ | freeform cutting with guards, **undo**, zoom, **design feed**, diverse characters |
| Barber Shop Simulator 3D | 1.8M, ~370K MAU, ~$50K/month | still growing years after launch |
| Fade Master 3D | ~12M | character reactions and humour |

Figures are third-party tracker estimates (AppGoblin, SimilarWeb, AppFollow).

**Shared patterns:**
- a request per customer, scored loosely, never a fail,
- tips as currency,
- ×3 tips on a rewarded video,
- salon and tool upgrades,
- an unlock progress bar,
- character reactions,
- designs and colour as extra jobs,
- daily, weekly and monthly tasks (Barber Chop 2),
- leaderboards and feeds of other players' work,
- direct coin and exact-cosmetic purchases.

**Player complaints:**
- ads after every customer and mid-action,
- "ad not ready",
- dated looks,
- characters that feel uncanny,
- missing styles (braids, fades for women).

**Benchmarks** (vendor data; directional only):
- **Retention:** median D1 about 22% and D7 about 3.5–4%; the top quartile reaches about 30% D1.
- **Hybrid-casual vs ads-only casual:**

  | | Hybrid-casual (ads plus progression and light IAP) | Ads-only casual |
  |---|---|---|
  | ARPDAU | $0.10–0.50 | $0.01–0.05 |
  | IAP share of revenue | 40–60% | — |

- **Rewarded video:** the format with the highest eCPM ($8–18 vs $2.5–5 for interstitials). Puzzle games average about 24 rewarded views per user.
- **Size:** each extra 6 MB costs about 1% install conversion; 10 MB costs about 2.5% in India and Brazil (Google Play data).
- **Disability:** about 1 in 5 casual players has a disability (PopCap).

## The plan, in order of value for effort

Each item is marked by what it moves: **E** engagement (session length), **R** retention, **$** ad revenue,
**P** players reached. "Owner decision" marks items that change something the owner already decided.

### Phase 1: quick wins (days, little risk)

1. **Finish AdMob verification ($).** Link the live store entry, verify app-ads.txt and complete app readiness review. Unverified apps get less demand. Pending since publication.
2. **Undo button (E, R).** Undo the last stroke. Barber Chop's most-praised control. It removes the fear of ruining a cut, and that fear ends sessions.
3. **Reveal reactions (E).** A wordless face at the reveal: a nod, a big smile, a raised eyebrow, looking in the mirror. The best-rated games are praised for reactions.
4. **Accessibility basics (P).**
   - Left-handed layout (a mirrored control side).
   - Clipper sensitivity and size settings.
   - A haptics toggle.
   - Reduce motion (shorter reveal spin).
   - Visual cues for every sound.
   - Icons that differ by shape, not only colour.
   - Touch targets of at least 48 dp.
   - A one-finger play check on every screen.
5. **Store listing growth (P).**
   - Grow in-game support from the current implementation to the owner-locked 40-language catalog in
     `GLOBAL-LANGUAGE-AND-TEXT-CONTRACT.md`. Store-listing expansion remains a separate public-metadata action.
   - Screenshots that show customers from the region's own groups. The 12 phenotype groups make this possible, and Barber Chop is praised for diverse characters.
   - Custom store listings by country.
   - A 30-second gameplay video.
   - Keywords: barber, haircut, fade, ASMR, hair salon.
6. **Keep it small (P).** Hold the download under about 10 MB. Today's size is a real advantage in emerging markets.

### Phase 2: the economy and rewarded value (1–2 weeks; the big revenue step)

7. **Tips (E, R, $).** Coins fly into a tip jar at the reveal. More for a happy customer, a streak or a VIP.
8. **Loose requests with 1–3 stars, never a fail (E, R).** A thought bubble shows the cut he wants. Quick Play remains the separate pressure-free path. Regulars ask for "his usual".
9. **×3 tips (rewarded) on the reveal ($).**
   - A coin stack with ×3 and a ▶ button.
   - "Take ×1" appears after about 2 s.
   - This is the genre's biggest rewarded placement.
   - Target: rewarded views per player going from near zero to 3+ a day.
10. **More reasons to watch, always optional ($).**
    - Try a premium tool for one customer.
    - Repair a broken streak.
    - Call in a regular or a VIP now.
    - Double the daily reward.
    - Show "ad not ready" only as a disabled ▶ that lights up when an ad loads, never as a failure.
11. **Interstitial pacing (R, $; owner decision).** Today an interstitial follows every customer.
    - **Grace period:** no interstitial for a new player's first 3 customers or first 3 minutes.
    - **Natural break:** keep the post-reveal placement.
    - **After a rewarded video:** skip the next interstitial.

    Ads after every customer are the genre's top complaint. Early ads hurt D1 most, when players decide whether to keep the game. Recommendation: A/B test this against the current rule before choosing.
12. **Starter purchase ($).**
    - A small one-time pack containing disclosed coins, one premium clipper skin and one gown.
    - It does not remove or reduce advertising.
    - Needs Google Play Billing and a listing update.

### Phase 3: progression and daily return (2–4 weeks)

13. **Salon decor (R).** A hammer icon opens glowing slots: chair, mirror, floor, walls, lights, plants. Pay with tips. A finished room unlocks the next shop.
14. **Tools by level (E, R).** Scissors over comb, razor line-up, trimmer edge-up, straight razor for beards and a beard trimmer. Each tool is a new satisfying sound and feel.
15. **7-day calendar, forgiving (R).** Seven tiles with a chest on day 7. A missed day pauses the streak instead of resetting it, as top studios do. ▶ doubles a day's reward.
16. **Daily and weekly tasks (R).** Three wordless icon tasks a day ("3 fades", "a beard trim", "a regular"), plus a weekly chest. Barber Chop 2 added these.
17. **Queue, combo, rush hour (E).** Customers wait in the window. A flame counter multiplies tips for consecutive 3-star cuts. Occasional quick tidy-ups run against a clock icon.
18. **Lookbook and customer album (R).** A grid of cuts that colour in when done, and an album of regulars with their visit count. Collection is a proven retention loop in satisfying games.
19. **Wordless notifications (R).** A coin, a regular's face or a clock. Ask permission only after day 1 (Android 13+).
20. **Cloud save with Google Play Games (R, P).** Progress survives a new phone. Players lose games when they change devices.
21. **App-open ad on a warm return after day 1 ($).**

### Phase 4: new jobs and new audiences (bigger work; owner decisions)

22. **Hair designs (E, P).**
    - Razor lines and shapes carved into short hair: parts, stars, waves, a lightning bolt.
    - Hair Tattoo, the biggest game in the genre, is built on this.
    - The engine's 0.5 mm guard already cuts a line.
    - Needs a fine trimmer tool and a finer cutting grid.
23. **Colour jobs (E, P).** Bleach tips, dyed fades, grey blending. Hair Dye has 100M+ installs.
24. **Longer hair and scissor cuts (E).** Crops, pompadours, textured tops. Needs hair above the 16 mm walk-in limit and scissors.
25. **Women and children as customers (P; big).** It would greatly widen the audience. The biggest hair games are played heavily by girls and women, and Barber Chop players ask for women's fades and braids. It needs long-hair rendering and new faces. Consider short women's cuts first (pixie, undercut, fade).
26. **Design feed and sharing (E, P).** Players see and like each other's cuts, as Barber Chop does. Needs a small server, moderation and privacy updates. A cheaper first step: weekly themed share cards.
27. **Seasonal events (R).** Holiday decor, themed customers and limited robes.

### Phase 5: reach every device (ongoing; owner decisions)

28. **Low-end phones (built; physical-device certification pending).** The shared renderer now selects Potato,
    Balanced, High or Ultra automatically, preserves a 12,000-strand/5-segment recognizable floor, gives proven
    strong devices the original 30,000-strand/8-segment/2× Ultra ceiling, adapts only rendering cost and recovers
    lost contexts at a safer tier. Complete weak/strong physical-phone testing before publication; see
    `ADAPTIVE-GRAPHICS-AND-STABILITY-CONTRACT.md`.
29. **Android 7 support (P).** minSdk 26 → 24 adds Android 7.x phones, a few percent of active devices, concentrated in emerging markets. Needs a WebView/WebGL check on those versions.
30. **Mediation bidding ($).** Add bidding partners (Unity, ironSource, InMobi, Meta, AppLovin) inside AdMob mediation. AdMob added several in July 2025. Each needs a partner account and consent setup. Today this waits on AppLovin; the others could start now.
31. **PC and Microsoft Store (P).** Google Play Games on PC lists Play games automatically, so confirm the game is not opted out (mouse and pen input already work). For the Microsoft Store, package the web build as a store app with the same no-text UI.

## What to measure

Before and after each phase:
- D1, D7 and D30 retention (Play Console),
- minutes and customers per session,
- rewarded views per daily user,
- impressions per daily user,
- ARPDAU (AdMob user metrics),
- install conversion by country (Play Console),
- crash and ANR rates on low-end devices (Android vitals).

A/B tests (interstitial pacing, ×3 tips layout, calendar) need Firebase Remote Config or a simple local split. Either needs privacy and Data safety review first.

## Realistic outcome

With 30–50 players a day, Phases 1–3 could plausibly lift revenue per player 3–5× (hybrid-casual vs ads-only
benchmarks), but total revenue stays small until reach grows. Phases 1 (store listing), 4 (designs, colour,
women customers) and 5 (low-end devices, Android 7, PC) are what grow the number of players. These are
directional estimates from vendor benchmarks, not forecasts.
