# v3.93 load-time validation

v3.93 targets load time. Graphics, gameplay and UI are unchanged: with the same saved game, the rendered
frame is byte-identical to v3.92 (SHA-256 of the canvas PNG) whether the models are computed or read
from the device.

## Changes

- **Stored startup models.** The base head, gown, hair roots, strands and beard surface come from fixed
  data with fixed seeds, so every load computes identical arrays. The first load stores them in IndexedDB
  (keyed by the exact runtime); later loads read them back. Without storage the game computes them as before.
- **Faster hair-root sampling.** The same arithmetic in the same order without per-sample temporary
  arrays. Output is bit-identical to v3.92 (SHA-256 of positions and weights).
- **Loading screen.** It shows the barbershop backdrop the game draws behind every customer, with a small
  "Loading…" label. Returning players see a snapshot of their own scene, taken at quiet moments (never
  during a touch): 1.5 s after loading, 2.5 s after a touch ends, and when the host pauses or the page hides.
  The screen fades into the live game. Readiness is still reported after the loading screen is dismissed.

## Measured (Chromium, 390x844 DPR2, CPU slowed 4x, software GPU)

| Build | Ready |
| --- | ---: |
| v3.92 | 12.2 s |
| v3.93, first open | 11.9 s |
| v3.93, return visit | 9.8-10.3 s |

Model building dropped from 3.5 s to 0.8-1.0 s on return visits. A first open still builds every model.
Shader preparation and the first full-detail frame run on a software GPU here; physical-phone GPU times are
not represented.

## Checks

Direct SDK contracts 40/40; domain/legacy 35/35; graphics 5/5; Chromium startup suite 10/10.
Not uploaded to McPlay and not run on a physical phone.
