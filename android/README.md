# ASMR Haircut Studio: full-detail build (for the Android app)

This folder holds the heavier build that is **not** used for YouTube Playables. Use it as the starting
point for the Android app. The Playables package is in the repository root.

- File: `haircut-studio-v3.66-full-detail.zip`
- Size: 392,098 bytes
- SHA-256: `28e1c0b278208fb8dd65ef9f6d83aab471e2dc05b8f90123864c5706e7a5b35a`

## What it has over the Playables build

- Detail levels: Auto (default), Low and High. Auto checks the device when the game starts (memory,
  CPU cores, GPU) and switches to Low during play if frames stay slow. A detail button in the wardrobe
  header cycles Auto, Low and High, and the choice is saved. `?detail=low` or `?detail=high` in the
  page URL forces a level for testing.
- High detail: up to 2x resolution with anti-aliasing, 30k scalp strands with 8 segments each,
  full-density beards (8 segments), detailed skin (pores and follicles), and up to 4,000 falling
  clippings.
- Low detail matches the Playables build.

The game content is otherwise the same as Playables v3.66 (customers, age-based walk-in styles, guard 0,
beards, trimming, clippings, Rewards section, reveal hub, levels, streak, video offers). It is still packaged for Playgama/YouTube (Playgama Bridge). For the Android app it will
need wrapping (for example a WebView or Trusted Web Activity) and its own store, ads and save setup.
