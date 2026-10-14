# ASMR Haircut Studio

Finalized Playgama package: **v3.53**.

[Download the Playgama ZIP](haircut-studio-v3.53-playgama.zip)

The archive includes `index.html` at its root and the Playgama Bridge configuration.

- File: `haircut-studio-v3.53-playgama.zip`
- Size: 364,996 bytes
- SHA-256: `f9080105a1d59ea3921eb332f232e83d07bf9b09a75a0e7b50fa0ccffbf21418`

## Changes

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
