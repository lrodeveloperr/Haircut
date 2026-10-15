# v3.95 — unchanged full-detail game, faster and recoverable startup

Base: v3.94, `e7bfdaee7b94aaa2aeef225d89d5ab59fb3742ee`.

The release preserves the v3.94 player-save schemas, procedural customer rules, controls, gameplay,
UI, audio and ad behavior. Graphics remain fixed at 30,000 scalp strands, eight-segment scalp/beard
geometry, full beard density and skin shaders, antialiasing and the same drawing-buffer policy.

## Changes

- Reflection lighting is byte-shuffled before gzip and reconstructed before upload. Its payload
  falls from 896,932 to 582,123 bytes. Every decoded byte matches v3.94; SHA-256 of the 6,291,456
  decoded bytes is `cd7b1d0c6440b77f0ece61d5aedf6b270a5e5e9906740303c819212cdaa2be57`.
- A preload starts the lighting request while the official SDK loads. A validated optional device
  copy races the bundle on repeat visits. Model building overlaps the lighting download.
- IndexedDB model reads have a 100 ms budget instead of blocking the engine for up to four seconds.
  Derived cache entries include complete data/shape checksums; damaged entries recompute, preserve
  player progress and repair themselves. Storage denial falls back to the original model builders.
- After context loss, the reflection render target is recreated from retained lighting data. The
  previous code silently sampled an empty target after restoration. Gameplay/input remains paused
  until the original scene has drawn again. Host pause remains authoritative.
- Poster capture no longer performs GPU readback and synchronous image encoding on pause/pagehide.
  Quiet snapshot work uses the host-aware scheduler. Beard-root updates avoid temporary arrays while
  performing the same arithmetic and Float32 assignments.

## Evidence

- Domain/legacy contracts: 35/35; direct YouTube SDK contracts: 40/40; graphics policy: 5/5.
- Chromium startup suite: 10/10 on the exact final archive in GitHub CI, including interrupted
  compilation, host pause and context loss. Windows ANGLE Direct3D11 startup/shader suite: 10/10.
- Mobile startup regressions: 8/8 on the final archive both locally and in GitHub CI.
  Cases cover download/model overlap, a permanently stalled IndexedDB open, zero-sized Android
  preload viewport, denied device storage, native touch rotation/cancellation, corrupt model-cache
  repair with save preservation, context loss during play and cached lighting with a slow network.
- Four seeded customer variants produce byte-identical canvas PNGs to v3.94, including an older
  coily-haired customer with a full beard, advanced hair loss and diffuse thinning.
- Three consecutive local context-loss/restoration cycles each reproduce the original canvas PNG
  byte for byte, with no console errors.
- Actual reflection-target readback before/after context restoration has 2,131,968 nonzero half floats
  and the same integer sum, 31,150,687,044. The v3.94 target instead became entirely zero after restore.
- All graphics settings remain at full detail in the quality contracts and context-recovery checks.
- GitHub standard browser suites: Chromium 18/18, Firefox 16/16, WebKit 16/16.
- GitHub layouts: all 27 viewports in four states passed; full-detail graphics quality: 3/3.
- Sustained Firefox run: 160 customer transitions in 600,452 ms, with no console errors and
  unchanged tracked canvases (1), HUDs (1) and SDK callbacks (3). All 12 GitHub jobs passed.
- Local headless Chromium standard suite: 14/17, retaining the same three completion-animation
  timeouts on this software GPU as v3.94. The headed GitHub Chromium suite passes all 18 cases.
- ZIP: 982,863 bytes; expanded runtime: 1,674,355 bytes. SHA-256:
  `bfaef32697d16cbc2c2b1777aebb5cf987ee3534f08c9ecd3b238544596ad9b6`.

## Timing and limitations

Local tests use Chromium headless 151, a 390×844 CSS viewport at DPR2, ANGLE Vulkan SwiftShader,
locally served files and a controlled SDK fixture. They are not physical-phone measurements.
During the isolated development probe, the old stalled-cache path reached ready in 7.77 seconds;
the corrected path reached the engine in about 0.15 seconds and readiness in about 3.5 seconds.
Warm cache probes reached readiness around 2.7–3.0 seconds on this software GPU. These figures are
diagnostic observations, not a guarantee of hosted or physical-device load times.

The isolated five-pair cold-start benchmark in `STARTUP-v3.95.json` uses a fresh browser process
per sample, with no other local browser tests running: v3.94 median readiness 3,484.1 ms; v3.95
3,378.1 ms. The fixed full-detail GPU frame remains the dominant cost in this software environment.
The smaller archive reduces actual download bytes by 22.3%; it is not a claim of a 22.3% reduction
in total load time. A prior concurrent benchmark was discarded for speedup comparisons.

Tested source/runtime commit: `f71f0a4bbabb8f6bc393094738abb7e83e56b2ed`.
GitHub run: https://github.com/lrodeveloperr/Haircut/actions/runs/38801049005

Not uploaded to McPlay. Physical iPhone/Android and actual YouTube-app validation remain pending.
An unsupported WebGL2 device or unrecoverable driver failure has a safe Retry path; no universal
device/error-free guarantee is claimed.
