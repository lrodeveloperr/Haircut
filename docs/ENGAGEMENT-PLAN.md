# Engagement, retention and ad-revenue plan (Android)

Status: **proposal, awaiting owner approval**, except where marked built. Written 4 November 2026.

On 4 November 2026 the owner approved regulars, skin details and accessories (section 1, items 1, 3 and 5). They are built for Android in `source/customers/extras.js`. Everything else here is not implemented.

## Ground rules

- No text anywhere. Everything below is icons, numbers, pictures and motion.
- The game must stay playable on phones, tablets, foldables and desktop.

## What successful barber and haircut games do

The research covered 10 games. These are the most important:

| Game | Installs | Rating | Model |
|---|---|---|---|
| Hair Challenge | 200M | 4.0 | |
| Hair Tattoo | 192M | 3.8 | ~2.2M MAU |
| Hair Dye | 104M | 4.0 | 100% ads |
| Hair Salon | 91M | 4.2 | |
| Barber Chop | 24M | 4.25 | freeform fades with guards, the closest to ours |
| Fade Master 3D | 12M | 4.05 | |

Figures are from third-party trackers (AppGoblin), so treat them as estimates.

### What nearly all of them share

- **A request per customer.** A thought bubble shows the cut the customer wants.
- **Paid or upset at the end.** The customer pays you, or leaves unhappy.
- **Tips as soft currency**, spent on **salon decor** and **tool upgrades**.
- **A rewarded "×3 earnings" button** at the end of each customer. This is the most common rewarded placement in the genre.
- **An unlock progress bar** that fills per customer and offers "keep it now" with a video.
- **A "No Ads" purchase** at $3.99–4.99.

### Lessons from them

- **Freedom matters more than perfection.** Azur (Hair Tattoo) lost many players when it added strict patterns to follow, and concluded that "many don't strive for perfection, but for freedom of creativity". Requests should guide, never fail the player.
- **Ads are the main complaint** in reviews. The specific complaints are:
  - an ad after every person,
  - ads in the middle of a haircut or on a tool switch,
  - "ad not ready" when trying to unlock something.
- **The best-rated games (4.2–4.55★)** share:
  - a tactile, satisfying core (Barber Chop's guards and undo),
  - character reactions and humour (Fade Master's most-praised feature),
  - a realistic look,
  - targets used as guidance rather than strict grading.
- **Variety:** customers who all look alike is a repeated complaint. Our phenotype, face and cut variety already addresses it.

## 1. More realistic ways to vary customers

Ordered by value for effort. All are wordless and need no new hair model.

1. **Regulars who come back** (built). Attachment to recurring customers is a proven retention driver.
   - About 3 in 5 customers the player really cuts become regulars. The last 6 are kept with the exact cut they left with.
   - From the next day, or 10 customers later, one may walk back in (30% chance per customer, never within 3 customers of the last regular). He has the same face and his last cut grown out 1–2 levels (about 1–2 weeks). His beard grows back toward his usual style, never past it.
   - The next-customer card shows him with that grown-out hair and a heart badge.
   - "Asks for his usual" waits for the requests feature (item 2).
2. **Requests.** Each customer arrives with a thought bubble showing one of the 182 cuts. Who asks for what follows the age and texture rules already in place. The same customer face then produces different jobs.
3. **Skin and face details**. Built in the shader:
   - moles: 0–3 per face, 2–5 mm, some raised; fewer on deep skin,
   - small healed scars, in about 1 in 15 men: through the eyebrow (with a gap in the brow), on the chin or on a cheek,
   - razor bumps where tightly curled beards are shaved: 45% of 3C–4C clean or stubble customers,
   - light acne: about 4 in 10 men aged 18–20, falling through the 20s; red spots on light skin, dark marks on deep skin.

   Not built yet: a single grey streak (poliosis) and sunburned or tanned noses in summer.
4. **Hair condition:**
   - thin or thick density,
   - a crown whorl or cowlick position (it changes the hair flow),
   - a double crown,
   - an uneven grown-out previous cut,
   - bleached or dyed tips on some young men, about 3%.
5. **Accessories**. Built:
   - ear studs (silver, gold, black or a stone) and small hoops, in about 1 in 6 young men and fewer with age,
   - in-the-ear hearing aids, in 1 in 20 men in their 60s up to 1 in 5 over 80,
   - a neck tattoo peeking above the gown collar: a nautical star, rose, tribal or geometric design (pictures only, never lettering). Older ink is softer.

   Glasses are worth adding later; they need one small model.
6. **The shop and its world:**
   - time-of-day lighting (morning, afternoon, evening),
   - weather through the window,
   - holiday decorations,
   - the next customers visible waiting outside.
7. **Reactions:** wordless faces at the reveal, from a nod to a big smile or a raised eyebrow, plus a few idle head movements. The best-rated games are praised mostly for character reactions.

## 2. Face review (done in this round)

Every one of the 240 face bases was rendered on its head shape as a real customer and reviewed group by group. Several faces came out exaggerated: pouty lips, round "baby" cheeks, bulbous noses, and skin tones off for the group.

**Causes found and fixed:**

| # | Cause | Fix |
|---|---|---|
| 1 | Ethnic bone-structure targets at full strength | Reduced to 75% |
| 2 | Padding in the "broad" outline | Mostly removed |
| 3 | Lip protrusion, depth and fullness sliders | Kept small |
| 4 | Face bases drawn from the less exaggerated half of candidates | Now drawn from the least exaggerated third, with each slider capped |
| 5 | The original 8 face sliders adding a second layer of group tendency | Their group tendency is removed; only a small individual variation remains |
| 6 | The skin-scale mapping | Recalibrated by eye to how each game tone actually renders, with one deeper tone added for the darkest complexions |
| 7 | Amber eyes on dark-eyed groups | Removed, because they glowed |
| 8 | Unrealistic deep-skin tails in some groups | Trimmed for Mediterranean, MENA, South Asian, Southeast Asian and Indigenous American |

## 3. Engagement, retention and ad revenue

Players come back for progress they can see, and they watch rewarded ads when the reward is worth having. Today the game has neither: there's no currency or goal, and the only rewards are one skin a day and a replay. That explains the 3% rewarded show rate. Competitors that pay in tips and offer ×3 get 20–36% of daily players watching.

### Phase 1: the economy and the ad fix

Highest impact, about 1–2 weeks of work.

1. **Interstitial pacing.**
   - No interstitial for a player's first 3 customers or first 3 minutes.
   - After that, at most one every 90 seconds.
   - Show it *before* the reveal, between finish and result. Unity's A/B tests found this placement gives +150% impressions per daily user.
   - Skip the next interstitial after any rewarded video.
   - Never show one during cutting or on a tap that starts something.
2. **Tips (soft currency).** A coin icon with a counter in the top bar. At the reveal, coins fly from the customer into a tip jar. More coins for a satisfied customer, a streak, or a VIP.
3. **Loose requests with 1–3 stars.**
   - The customer's bubble shows the cut he wants; the reveal shows a reaction and stars.
   - Never a fail: freestyle still pays at least 1 star. This follows the Azur lesson.
4. **×3 tips on the reveal screen (rewarded).** A coin stack, "×3" and a ▶ icon. A small "take ×1" coin appears after about 2 seconds. Optionally a swinging meter from ×2 to ×5. This is the biggest rewarded lever in the genre.

### Phase 2: progression

5. **Unlock progress bar** instead of one skin a day.
   - The silhouette of the next clipper or robe fills a few percent per customer.
   - At 100%: keep it, or watch ▶ to keep the bonus one too.
   - ▶ also adds +25% early.

   This turns the 1,000 clippers and 600 robes into a ladder players can see.
6. **Salon decor.**
   - A hammer icon opens the shop; glowing slots (chair, mirror, floor, walls, plants, lights) show coin prices.
   - A fully decorated room unlocks the next shop.
   - This gives a long-term goal and spends tips, which makes ×3 worth watching.
7. **Tools and trials.**
   - Unlock by level (padlock with the level number): scissors, razor line-up, straight razor for beards, trimmer.
   - A golden premium tool with a ▶ badge can be used free for this customer.

### Phase 3: daily return and session length

8. **7-day reward calendar.**
   - 7 tiles, with day 7 as a chest. Today's tile pulses.
   - ▶ doubles today's reward, and ▶ repairs a broken streak.
   - The daily VIP becomes the chest customer.
9. **Queue and combo.**
   - Waiting customers are visible through the window.
   - A flame counter for consecutive 3-star cuts multiplies tips.
   - An occasional "rush hour" of quick tidy-ups, marked by a clock icon, with no fail.

   This is the strongest "one more customer" driver.
10. **Lookbook and practice.**
    - A grid of the 182 cuts as silhouettes, coloured in once done, with a completion counter.
    - Tap a completed cut to practise it freely.
    - Share cards show the stars.

    This feeds collection, retention and organic installs.

### Extras

- **Wordless local notifications** (coin, VIP face, clock) around the 3rd launch.
- **An app-open ad** on a warm return, only after day 1.
- **A "No Ads" purchase** ($3.99–4.99), which removes interstitials but keeps rewarded videos optional.
- **AdMob bidding partners** when you're ready.
- **A banner only on the shop and decor screens**, never on the cutting screen.

### Realistic numbers

At about 320 monthly users (30–50 a day) and $0.03–0.08 of ad revenue per daily user, revenue is about $1–4 a day whatever we change. That's an extrapolation from benchmarks, not a measurement.

Phases 1–3 should multiply revenue per player, perhaps 3–5× through rewarded videos and longer sessions. Growing the number of players (store page, share cards, TikTok-style clips) matters just as much.

**Measure before and after each phase:**
- AdMob user metrics,
- impressions per daily user,
- rewarded engagement,
- day-1 and day-7 retention.
