# ASMR Barber: Fade Master

## MediaCube / YouTube Playables

Upload [`asmr-barber-fade-master-v3.86-mediacube-youtube.zip`](releases/asmr-barber-fade-master-v3.86-mediacube-youtube.zip)
to McPlay's **Replace game bundle** field. This direct-YouTube build includes the reliability corrections,
official SDK integration, protected cloud saves, host lifecycle handling and complete license files.
See [`mediacube/README.md`](mediacube/README.md) for build commands, ad behavior and validation scope.

## Historical Playgama packages

Historical packaged release for YouTube Playables: **v3.82**.

The source on this branch includes later reliability corrections: protected saves, startup Retry, rotation
normalization and complete license texts. **The linked ZIPs have not been rebuilt with those corrections.**
Game control sizes are unchanged. See [source build instructions](source/README.md) and
[correction validation](qa/FIX-VALIDATION-2026-10-15.md).

[Download the Playgama ZIP](asmr-barber-fade-master-v3.82-playgama.zip)

The archive includes `index.html` at its root and the Playgama Bridge configuration.

- File: `asmr-barber-fade-master-v3.82-playgama.zip`
- Size: 397,431 bytes
- SHA-256: `bb72694a03d935a16600929dbcdb3713a23084575fa820dc9ed21cfafa1f2701`

The full-detail build (same game, heavier graphics) for the future Android app is kept separately in [`android/`](android/README.md).

The corrected source is in [`source/`](source/README.md); build it with `bash source/buildall.sh`.
The historical ZIPs were reproduced byte for byte from commit
`3ed0ef990326781164dfa9c09efc04835ee594fd` during the release audit.

## Changes

- v3.82: The game is named **ASMR Barber: Fade Master** (page title, screen-reader label, packages). Saved
  progress keeps its storage keys, so players keep their progress.
- v3.81: Real-life customers, engineered for variety. The variety director's decks now hold their cards in
  real-life proportions: hair texture and colour per heritage (East Asian hair 90% straight, Black hair coily
  or tightly curly 3b-3c, White hair mostly brown with blond and red as in UK figures), hair loss per age group
  with each heritage's odds and typical pattern (young men rarely very bald), and facial hair per age group
  (most older men clean-shaven) with styles in their real odds for age and heritage. Heritage and haircut never
  repeat back to back, and there are never more than three in a row of bearded, clean-shaven, hair loss or full
  hair; VIPs wait a customer rather than break that. Older men no longer get a high-and-tight cut. An audit of
  3,000 customers finds no unrealistic combination (no straight-haired Black or blond East Asian customers, no
  long top over a bald crown).
- v3.80: Engineered customer variety. New walk-in haircuts join the 16 mm-top styles: short crops (9 / 12 mm tops),
  buzz cuts (6-12 mm all over), high-and-tight (3 mm sides) and shaved heads (3 mm regrowth). A variety director
  deals every customer's heritage, age, hair loss, beard and haircut from shuffled decks (saved with progress):
  each deck is used up before it refills and the same card never comes twice in a row, so a few customers cover
  every kind and nothing repeats back to back. Customers with heavy hair loss get crops, buzzes or shaved heads.
  Hair loss now appears from level 2 (very advanced loss from level 4), and walk-in VIPs never come close together.
- v3.79: The robe is brushed clean at the reveal again. The sweep now takes every clipping (those still falling or
  sliding when the haircut ends, not only the ones at rest), and swept pieces fall past the robe and out of sight
  instead of landing on it again, so the completion screen always shows a clean robe.
- v3.78: The replay icon is centred in the small top-left replay button (it sat against the button's left edge:
  the grid used for centring shrank to the icon and stayed at the start). Every icon button and badge now centres
  its icon with flex, and an in-game check confirms every icon is centred on all screen sizes.
- v3.77: A new replay icon, centred in its button: a circular arrow with a filled arrowhead at the top (the old
  one's arrowhead pulled its weight to the top-left).
- v3.76: The level badge (star and dots) is gone from the completion screen; levels still count and unlock new
  kinds of customers, shown by the sparkle on the next-customer picture. Every top-row item has one size and one
  line on every screen: the streak chip is as tall as the sound and wardrobe buttons, the finish button sits on
  the same top line and mirrors their margin in landscape too, and the replay button in the top-left corner is
  the size of the other top buttons.
- v3.75: On completion screens where the replay button has no room beside the next row (narrow phones,
  tablets, desktops, foldables), it sits in the top-left corner, aligned with the level badge, instead of
  stacked above the next button.
- v3.74: One UI scale on every screen. All controls (the game's buttons, guard ladder, wardrobe, completion
  screen, tutorial hints) are laid out at phone size and drawn at the screen's scale: 1 on phones, larger on
  tablets and desktops (up to 2.4), smaller in tiny embeds (down to 0.6), so spacing and proportions match
  everywhere. The wardrobe's pick card sizes itself to its column, the sheet shrinks to fit instead of
  scrolling, short landscape screens use 4 columns and tiny square embeds one row. On the completion screen
  the replay button mirrors the next row in portrait and joins it on the outer side in landscape (never over
  the customer). The rotate hint stays below the top buttons when there is no room above the head.
  Audited on 27 screens (phones, foldables, tablets, laptops, desktops, ultra-wide, embeds) in 4 states.
- v3.73: End-to-end logic review (persistence, ads, game flow, UI) and fixes.
  - Saves: progress, level and unlocked designs now survive a reload on the real Playgama Bridge (v2 parses
    stored JSON itself; the game parsed it again and fell back to defaults). The latest strokes are saved when
    the page closes. Corrupt or hostile saves can no longer stop the game from starting; a corrupt wardrobe
    save unlocks nothing. Only one tab plays at a time (the one in front); the other pauses and does not save.
    A haircut that reached the session save but not the progress save is counted on the next load.
  - Ads: rewarded videos now pay out on Bridge v2 (the client stopped waiting 1.5 s after the call, before
    the reward arrived). The game stays paused and muted until the ad closes. Slow-loading interstitials count
    as shown. Without rewarded videos on a platform, the wardrobe offers no video picks and shows no dot.
    A paid replay waits for the game to resume. A video that does not come shakes its button.
  - Wardrobe: at midnight an open wardrobe switches to the new day's picks (yesterday's can no longer be
    claimed). The countdown ring uses the real length of the day (clock-change days). The tab dots stay while
    the panel is open. Escape closes it, rotating re-flows the two rows, and small screens fit.
  - Flow: the next-customer picture uses that customer's own hair colour; a replay keeps the next customer
    (the daily VIP too); finishing without a cut is not counted; a new level's showcase customer comes before
    the daily VIP, which is never given twice for one day; the level badge survives a reload; fewer repeated
    walk-in haircuts; huge level numbers are computed directly.
  - UI: a tap on the dimmed backdrop no longer reaches the game under it; a cancelled press on next no longer
    hides the completion screen; a short guard after a screen closes stops the second tap of a double tap
    turning the clipper on; the next-customer picture is tappable as part of next; the replay button moves
    above the next row on narrow screens and keeps clear of notches; the HUD stays hidden for the whole reveal.
- v3.72: Replays have their own rewarded ad placement, `replay-customer`, so they can be told apart from
  wardrobe unlocks (`unlock-item`) in ad reports. Both are listed in `playgama-bridge-config.json`;
  `unlock-item` stays the fallback.
- v3.71: The completion screen has a replay button: a blue round button with the video icon as a subscript,
  in the corner opposite the next customer. One rewarded video brings the same customer back with the hair and
  beard they walked in with, so the haircut can be done again; the next customer stays the same. If the video
  does not finish, the player stays on the completion screen. The button hides where rewarded videos are not
  available.
- v3.70: The daily pick's countdown is a ring around the design that drains with the day: green, orange
  from 6 hours left, red from 2 hours. The timer pill matches the colour. In the last 10 minutes the design
  beats like a heart and the card glows red. Once the pick is taken the ring goes away.
- v3.69: The wardrobe shows at most two rows of owned designs; with more, orange arrows and a page number
  (e.g. 3/38) sit under the rows. The newest and the worn design come first, and only the open page is drawn,
  so even hundreds of designs open instantly. The clipper tab uses the same clipper icon as the game.
- v3.68: Every daily pick unlocks with one rewarded video (no more two-video premium picks). The wardrobe
  shows only the designs the player owns plus a single empty slot as a hint, so the panel stays small.
- v3.67: Simpler wardrobe and completion screen.
  - The rewards section is now the Wardrobe (hanger icon). It shows only the clippers and robes the
    player owns; tap one to wear it.
  - Each day exactly one new clipper and one new robe are on offer (the same for every player), each with
    a live countdown to midnight. One rewarded video unlocks the pick and puts it on (premium picks take
    two; a tick shows after the first). At midnight the picks change, and a half-watched premium is lost.
    The red dot on the hanger comes up once a day while a pick is waiting.
  - The gallery of locked designs, shelves, featured design, "one more" and the level-up fly-in are gone.
    The 1,600 designs remain the source of the daily picks.
  - Completion screen: only the finished customer in the robe they already wear, and the next-customer
    dock. No try-on robe, no offer button, no VIP or trial-clipper offers. The level badge still shows
    on a level-up.
  - The finish button (top right) is the same size as the top-left buttons (48 px).
  - Rewarded placements: `unlock-item` only.
- v3.66: 1,000 clipper designs and 600 gown designs.
  - Generated once with colour-harmony rules and frozen in the code (about 8 KB): every pair of colours
    goes together, colours that look the same side by side were merged (32 distinct colours), and
    two-colour patterns have enough contrast to show (motif patterns need more). No design changes
    between versions.
  - 373 premium clippers and 135 premium gowns take two videos (wild patterns, precious metals, neon on
    black, flowers / palms / scissors / argyle / houndstooth / barber-pole gowns).
  - Gallery shelves: clippers classic, bright, stripes, checks, waves, metal, neon, wild; gowns plain,
    stripes, checks, waves, wild. Each shelf shows its pattern chip and how many of it the player owns;
    new designs sit on their own shelf at the top. The gallery starts with 30 clippers and 24 gowns and
    adds 20 and 12 at every barber level; the featured design of the day can be any design.
  - Tile pictures are drawn as they scroll into view (a few hundred kept in memory); owned designs are
    saved as one bit each (about 200 bytes for all 1,600).
  - Flower, palm and scissors patterns are bigger and bolder, on gallery tiles and on the gown.
  - Rewards progress uses a new save; unlocks from earlier test builds are reset.
- v3.65: Rewards gallery and a radically simple completion screen.
  - Rewards is a gallery of 40 complete clipper designs and 40 complete gown designs (no mixing parts).
    Tap a design you own and it goes on; tap a locked one and the rewarded video starts, then it unlocks
    and goes on. 20 premium designs take two videos (a tick appears on the badge after the first). Only
    the starting clipper and gown are free.
  - Featured design of the day at the top of each tab (the same for every player that day), a counter of
    designs owned, and sparkles on designs that are new.
  - "One more": right after an unlock, a matching design from the other tab slides up with its video
    button (placement `one-more`).
  - The gallery starts with 12 designs of each kind and grows by 4 at every barber level; the new designs
    fly into the rewards button.
  - The rewards button keeps the gift icon and gets a red dot once a day, and whenever there are new
    designs.
  - Completion screen: only the finished customer, one video offer (a picture of the gown, clipper or
    VIP plus the video button) and the next-customer dock. The top buttons are hidden; the level badge
    shows only on a level-up. Offers alternate between gown try-ons and VIP customers, with the trial
    clipper every few customers.
  - First-time tutorial: turn the customer (hint centred above the head, sized from the head on every
    screen), switch the clipper on, change the guard. No cutting line.
  - Rewards progress uses a new save; unlocks from earlier test builds are reset.
- v3.64: Shorter first-time tutorial: only the clipper on/off button, then the guard ladder (0-4). The
  rotate hint and the cutting line are gone. The game stays free-style.
- v3.63: Playtest fixes.
  - Brighter lighting for every customer (exposure x1.2), and dark hair gets a lifted, warm sheen so cut
    lines read clearly on the darkest skin. Light hair keeps its colour.
  - Rewards panel: tap a swatch to preview it; one big button under the preview says what happens: grey
    tick (in use), green tick (use this), blue play + lock (watch a video to unlock and use it).
  - Only the starting look is owned at the start (2 clipper colours, chrome, solid; 2 gown colours,
    solid). Everything else unlocks with a rewarded video; colours and patterns given away by earlier
    builds are taken back on load.
  - The next-customer picture is a real render of that customer with their exact walk-in hair and beard
    (crown on VIPs). It sits in one dock with the next button, with a chevron between them.
  - Reveal sound: a soft whoosh as the camera spins and a bell chime when it lands (brighter on a
    level-up), following the game's sound setting.
- v3.62: Engagement and ad revenue upgrades, all wordless.
  - Reveal hub: after the reveal spin the screen shows the barber level (star + number, pips filling per
    haircut), a portrait of the next customer, and at most one optional video offer.
  - Video offers (rewarded placements `try-on`, `keep-clipper`, `vip-customer`, plus `unlock-item` in the
    Rewards panel):
    - Try-on: the customer wears a gown the player does not own through the reveal; one video keeps it.
    - Trial clipper: every 4th customer from the 6th on, a locked clipper skin is lent for that haircut;
      one video keeps it.
    - VIP swap: a VIP portrait (crown) next to the next-customer card; one video makes the VIP the next
      customer. VIPs have a full, even head of hair and, from level 2, a big beard.
    - Rules: no offers on the first 2 haircuts, one offer per reveal (alternating try-on / VIP), no VIP
      offer on a level-up reveal, and after 3 declines in a row offers pause for 3 customers. Each offer
      type pulses the first time it appears.
  - Barber level: levels at 2, 4, 7 and 10 haircuts, then every 5. Customer features arrive with levels:
    level 1 clean-shaven young / middle-aged men with full hair, 2 beards and moustaches, 3 older men and
    grey hair, 4 hair loss, 5+ VIPs sometimes walk in. The customer after a level-up shows the new feature
    (sparkle on the portrait). The four customer classes are never gated.
  - Daily VIP: from the second day of play, the first customer each day is a VIP (the same one for every
    player that day). Streak: a flame with the number of days in a row, next to the gift button.
  - First customer: a full, even head of hair, clean-shaven, young or middle-aged.
  - No interstitial within 60 s of a rewarded video.
  - Brush-off: at the reveal the clippings on the gown are flicked off in a sweep.
- v3.61: No more free gift every 5 customers. Locked clipper and gown items unlock only with a rewarded
  video. Items a player already received as gifts stay unlocked.
- v3.60:
  - Guard 0 (0.5 mm, no comb) is back on the clipper for scalp and beard. It had been removed because of
    the scalp scar fixed in v3.48.
  - Walk-in hair depends on age. Every customer arrives with a 16 mm top. Young men more often have the
    sides and back already shorter (only 15% come in even); older men are mostly even or have a soft, low
    taper (53% even). Every starting length is above guard 0, so any style a customer walks in with can
    be cut.
  - Rewards section (the gift button next to sound) replaces the coin wardrobe. It has Clipper and Gown
    tabs, and the item in use has a check mark. A locked item shows a video badge: tap it, watch one
    rewarded video, and it unlocks and is put on straight away. A free gift still arrives every 5
    customers. Coins are gone.
  - Rewarded videos are now enabled on YouTube (Playgama Bridge lists YouTube as supported), with one
    placement, `unlock-item`. The existing interstitial on "next customer" (after 2 completed haircuts
    and at least 60 s of play) is unchanged.
- v3.59: Playables closeout. The Playables build now uses one light detail level on every device so the
  game runs the same on cheap phones and fast desktops: 1x resolution, no anti-aliasing, 14k scalp strands
  (down to 9k on slow frames), 45% beard density, simpler strand geometry and skin shading, and at most
  1,200 falling clippings. The heavy extras (2x resolution, anti-aliasing, 30k strands, full-density
  beards, detailed skin, 4,000 clippings) are removed from this build, along with the automatic switching
  and the detail button in the wardrobe. Customers, beards, trimming, clippings and the wardrobe are unchanged.
  The v3.58 full-detail build moved to `android/`.
- v3.58: Low-detail setting for weaker phones. The default is Auto: the game checks the device when it
  starts (memory of 3 GB or less, 4 CPU cores or fewer, older Mali/Adreno/PowerVR GPUs or software
  rendering) and picks High or Low. If frames are still slow after the game's own quality scaling, it
  switches to Low during play. The detail button in the wardrobe header cycles Auto, Low and High, and
  the choice is saved. Low draws fewer and simpler hair strands (14k scalp strands, fewer segments,
  45% beard density), fewer falling clippings, renders at 1x resolution without anti-aliasing and uses
  cheaper skin shading. In a software-renderer test it ran about 3x faster per frame. Add `?detail=low`
  or `?detail=high` to the page URL to force a level for testing.
- v3.57: Removed the bare circles that v3.56 left at the mouth corners of full beards. The beard now
  meets the lip corners naturally; hair beside the corners still grows down and outward, away from the mouth.
- v3.56: Mouth corners kept clear: a small bare slit continues the mouth line at each corner, and beard
  hair rooted beside the corners grows down and outward (no spin or coils back toward the mouth), so
  full, long and coily beards no longer reach over the lip corners.
- v3.55: Beards and moustaches keep out of the mouth. Moustache hair is combed down along the upper lip
  and stops at the style's trimmed line (pencil above the lip, chevron and most beards partway over the
  upper lip, walrus down to the mouth line but never past it); hair under the lower lip grows downward,
  and curls near the mouth are kept tight.
- v3.54: Research-based variety by class and age:
  - Hair colour: White customers follow UK Biobank proportions (light brown, dark brown, blond, red,
    black), with blond a little more common in young men; other classes are black / soft black with a
    little very dark brown.
  - Greying: onset mid-30s White, late 30s East Asian, mid-40s Black; frequent premature greying in young
    South Asian men; slow build-up (6-23% of people are half grey at 50). Four patterns (temples, front,
    crown, even), silver / pewter / white grey, and beards that usually grey ahead of the scalp (chin,
    sides or even).
  - Hair loss: Norwood, Norwood A (straight-back hairline), crown-only and diffuse thinning, with class
    prevalence and pattern mix (more crown / diffuse loss in East Asian and Black men), plus alopecia
    areata patches on the scalp or in the beard. Crown loss now thins gradually from a bald centre.
  - Beards by age and class: clean-shaven most common in older men; new pencil, walrus and horseshoe
    moustaches and the Shenandoah (beard without moustache).
- v3.53: Full beards by the ears: beard hair in front of the ear now grows straight down and a little
  forward along the jaw (as real beards do from the sideburns), lies close to the face and hangs with
  length instead of fanning back toward the ear. The beard area reaches up to join the sideburns.
- v3.52:
  - Four customer classes, equally likely: White, Black, East Asian, South Asian. The class sets the skin
    tone range and the hair types (every curl sub-type from 1a to 4c); age sets greying and baldness.
  - Wardrobe (hanger button next to the sound button): customise the clipper (body colour, accent colour,
    metal finish, pattern) and the barber gown (main colour, pattern colour, pattern, collar). 46 colours,
    11 metal finishes, 18 clipper patterns and 18 gown patterns, unlocked separately so they combine freely.
  - Unlocks: coins (25 per customer, +10 when the beard was trimmed), a free gift every 5 customers, and
    rewarded videos (unlock an item, or +100 coins). Rewarded placements `unlock-item` and `bonus-coins`
    are enabled in `playgama-bridge-config.json`. Progress is saved under `skin-fade-studio-wardrobe-v1`.
  - Falling hair: cut pieces the length of what was removed, in the customer's colour, curl and grey,
    flutter down, tumble, land and settle on the gown until the next customer. Beard trims fall too.
- v3.51: Every customer is now a different person (new `runtime/customers.js`, loaded before the game):
  - Age (young 18-30, middle 31-55, old 56-84) drives greying, wrinkles, age spots, jowls, brow
    greying and which baldness patterns and beard styles are likely.
  - Skin tone across ten tones with undertones, with matching lips, flushing, scalp and shave shadow.
    Heritage groups steer correlated traits (skin range, hair texture and colour, eye colour, beard
    density, baldness prevalence, subtle face-shape tendencies); individual variation is larger.
  - Hair textures: straight, wavy, curly and coily, with grey strands that start at the temples.
  - Pattern baldness by Hamilton-Norwood stage (2 to 7, plus vertex and diffuse thinning) with a
    shinier, sun-exposed bald scalp.
  - Trimmable beards: stubble, moustache, goatee, van dyke, chinstrap, boxed, full, long, mutton
    chops. The clipper trims the beard to the guard length; the beard is saved with the session.
  - Face shape (nose, lips, jaw, chin, cheekbones, brow) and eye colour vary per customer.
- v3.50: Smoother head shape. Long edges of the head mesh (mostly the scalp and back of the skull) are
  split at load time onto the curved surface implied by the vertex normals, so the bald head's outline is
  round instead of polygonal. The face keeps its original vertices. Clipper touch-picking still tests the
  original mesh first and then refines on the smooth triangles, so it stays fast on phones.
- v3.49: More realistic shaved scalp skin: a cool blue-grey shadow over the hair-growth area, fine
  follicle specks (faded out when too small to resolve, so they never shimmer), softer and paler scalp
  tone with gentle mottling, and a light natural sheen on top.
- v3.48: Fixed an uncut tuft ("scar") left on top of the crown after shaving the scalp. Every visible
  scalp cell can now be reached by the clipper, including the narrow cells at the crown and along the
  front hairline.
