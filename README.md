# ASMR Haircut Studio

Finalized Playgama package for YouTube Playables: **v3.62**.

[Download the Playgama ZIP](haircut-studio-v3.62-playgama.zip)

The archive includes `index.html` at its root and the Playgama Bridge configuration.

- File: `haircut-studio-v3.62-playgama.zip`
- Size: 378,919 bytes
- SHA-256: `a01e2db966cc111843a2550a11e33d1015acc2ca37fff014e75ed88b4989b5f2`

The full-detail build (same game, heavier graphics) for the future Android app is kept separately in [`android/`](android/README.md).

## Changes

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
