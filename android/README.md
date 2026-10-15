# ASMR Barber: Fade Master: full-detail build (for the Android app)

This folder holds the heavier build that is **not** used for YouTube Playables. Use it as the starting
point for the Android app. The Playables package is in the repository root.

- File: `asmr-barber-fade-master-v3.82-full-detail.zip`
- Size: 398,619 bytes
- SHA-256: `ca138d97b1f9b6b8ae5ad2f7400b3a4154c6a2ca91a0441763ffde2c507639a1`

## What it has over the Playables build

- Detail levels: Auto (default), Low and High. Auto checks the device when the game starts (memory,
  CPU cores, GPU) and switches to Low during play if frames stay slow. A detail button in the wardrobe
  header cycles Auto, Low and High, and the choice is saved. `?detail=low` or `?detail=high` in the
  page URL forces a level for testing.
- High detail: up to 2x resolution with anti-aliasing, 30k scalp strands with 8 segments each,
  full-density beards (8 segments), detailed skin (pores and follicles), and up to 4,000 falling
  clippings.
- Low detail matches the Playables build.

The game content is otherwise the same as Playables v3.82 (customers, age-based walk-in styles, guard 0,
beards, trimming, clippings, wardrobe with daily picks, levels, streak). It is still packaged for Playgama/YouTube (Playgama Bridge). For the Android app it will
need wrapping (for example a WebView or Trusted Web Activity) and its own store, ads and save setup.
