# ASMR Haircut Studio: full-detail build (for the Android app)

This folder holds the heavier build that is **not** used for YouTube Playables. Use it as the starting
point for the Android app. The Playables package is in the repository root.

- File: `haircut-studio-v3.60-full-detail.zip`
- Size: 371,864 bytes
- SHA-256: `46bee00ab3fe535c546a61ddc633d406f12a34f3304ac82c146b510a0058d9ef`

## What it has over the Playables build

- Detail levels: Auto (default), Low and High. Auto checks the device when the game starts (memory,
  CPU cores, GPU) and switches to Low during play if frames stay slow. A detail button in the wardrobe
  header cycles Auto, Low and High, and the choice is saved. `?detail=low` or `?detail=high` in the
  page URL forces a level for testing.
- High detail: up to 2x resolution with anti-aliasing, 30k scalp strands with 8 segments each,
  full-density beards (8 segments), detailed skin (pores and follicles), and up to 4,000 falling
  clippings.
- Low detail matches the Playables build.

The game content is otherwise the same as Playables v3.60 (customers, age-based walk-in styles, guard 0,
beards, trimming, clippings, Rewards section). It is still packaged for Playgama/YouTube (Playgama Bridge). For the Android app it will
need wrapping (for example a WebView or Trusted Web Activity) and its own store, ads and save setup.
