# ASMR Haircut Studio

Finalized Playgama package: **v3.51**.

[Download the Playgama ZIP](haircut-studio-v3.51-playgama.zip)

The archive includes `index.html` at its root and the Playgama Bridge configuration.

- File: `haircut-studio-v3.51-playgama.zip`
- Size: 347,774 bytes
- SHA-256: `7f761f60a386e38b42f8a434d7f1605ab88979893e2315a42a8cbaa2dc3b60a8`

## Changes

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
