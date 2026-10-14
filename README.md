# ASMR Haircut Studio

Finalized Playgama package: **v3.50**.

[Download the Playgama ZIP](haircut-studio-v3.50-playgama.zip)

The archive includes `index.html` at its root and the Playgama Bridge configuration.

- File: `haircut-studio-v3.50-playgama.zip`
- Size: 327,182 bytes
- SHA-256: `b71faeeba333801728f916dc15fbb37cd15ff6562e2c8a05d277b2f8274a910c`

## Changes

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
