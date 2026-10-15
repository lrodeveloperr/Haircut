# v3.98 — smaller download with identical game and lighting

The reflection asset shrinks from 582,123 to 318,208 bytes (45.34%). The ZIP shrinks from 983,866 to 724,822 bytes (26.33%); expanded runtime is 1,414,001 bytes. The lossless format subtracts neighboring texel bytes, then neighboring row bytes, before gzip. The decoder adds them back in reverse order and supports the previous format for cached assets.

All 6,291,456 original lighting bytes are restored exactly, with SHA256 `cd7b1d0c6440b77f0ece61d5aedf6b270a5e5e9906740303c819212cdaa2be57`. The real browser decoder also compares all 3,145,728 half-float values against v3.97. Five rendered seeded customer PNGs are byte-identical, including coily hair/older skin, advanced hair loss, diffuse thinning and active areata patches. `game.js` and `customers.js` themselves are byte-identical to v3.97. The full 30,000 strands, eight segments, skin/beard shading, resolution, MSAA, controls, save schemas, SDK order and monetization remain unchanged.

## What this does to load time

Five alternating fresh Chromium-process pairs at 390×844/DPR2 on a desktop SwiftShader software GPU measured median `gameReady` at 3,307.5 ms for v3.97 and 3,298.4 ms for v3.98. This difference is within run-to-run variability: local startup is effectively unchanged. Files came from local route fulfillment with no real network/host delay; OS/GPU caches were not purged. These are not phone, McPlay or YouTube measurements.

The browser's median lighting decode cost is 21.1 ms before and 33.9 ms after (12.8 ms extra in this environment). The smaller file saves 263,915 download bytes. Ideal transfer-only savings are 2.11 seconds at 1 Mbps, 1.06 seconds at 2 Mbps, 0.31 seconds at 6.8 Mbps and 0.11 seconds at 20 Mbps, before decode costs, latency, concurrency, HTTP compression or caches. They are estimates, not measured end-to-end improvements.

Controlled candidate probes with a 1,000 ms SDK script delay reached ready at 4,327.8 ms; with a 2,000 ms cloud read delay, 4,615.5 ms. These demonstrate distinct dependencies; they do not measure the actual SDK service. Readiness still waits for protected saves and a real full-detail frame. No timeout silently resets player progress or reports readiness early.

The largest local cost remains the initial full-detail GPU draw; optional models already have bounded reads, and model construction overlaps lighting download. Replacing the renderer, lowering graphics, adding a start menu, or falsely reporting readiness would violate the unchanged-game constraint. Further work should be driven by actual phone/host traces, with first visit and repeat visit measured separately. YouTube recommends interaction within five seconds and requires the SDK before game code and `gameReady` only when interaction is available:

- https://developers.google.com/youtube/gaming/playables/certification/requirements_stability
- https://developers.google.com/youtube/gaming/playables/certification/requirements_integration

## Validation

Local domain/legacy contracts 35/35, direct SDK 41/41, fixed full-graphics policy 5/5, lossless asset verification, browser decoder parity and five rendered variants passed. Affected Chromium/Firefox/WebKit, mobile/context recovery and Windows D3D11 CI are pending. The 30-screen replay review remains applicable because the game/customer/style bytes are unchanged. Exact physical-phone and hosted-platform times remain unmeasured. Nothing has been uploaded to McPlay.

- [Exact release identity](BUILD-v3.98.json)
- [Raw timing samples and decoder comparison](STARTUP-v3.98.json)
- [Repeatable startup audit](../qa/startup-audit.cjs)

Reproduce the audit with Playwright and an extracted v3.97 archive:

```sh
BASELINE_DIR=/absolute/path/to/v397 RELEASE_DIR=source/build-youtube node qa/startup-audit.cjs
```
