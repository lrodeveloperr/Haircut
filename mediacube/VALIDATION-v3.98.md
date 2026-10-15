# v3.98 — smaller download with identical game and lighting

The reflection asset shrinks from 582,123 to 318,208 bytes (45.34%). The ZIP shrinks from 983,866 to 724,822 bytes (26.33%); expanded runtime is 1,414,001 bytes. The lossless format subtracts neighboring texel bytes, then neighboring row bytes, before gzip. The decoder adds them back in reverse order and supports the previous format for cached assets.

All 6,291,456 original lighting bytes are restored exactly, with SHA256 `cd7b1d0c6440b77f0ece61d5aedf6b270a5e5e9906740303c819212cdaa2be57`. The real browser decoder also compares all 3,145,728 half-float values against v3.97. Five rendered seeded customer PNGs are byte-identical, including coily hair/older skin, advanced hair loss, diffuse thinning and active areata patches. `game.js` and `customers.js` themselves are byte-identical to v3.97. The full 30,000 strands, eight segments, skin/beard shading, resolution, MSAA, controls, save schemas, SDK order and monetization remain unchanged.

The standalone Sites target also removes its duplicate lighting download. It originally used different preload/fetch URLs. Matching those URLs fixed Chromium and Firefox, but WebKit QA still made two identical requests. The standalone target now omits the extra fetch preload and starts one content-hashed lighting request directly; it has no remote SDK wait to overlap. A request-count regression checks this in each browser. The production YouTube target keeps its existing matching-URL preload to overlap the mandatory SDK download. This does not change the production archive hash above.

## What this does to load time

Five alternating fresh Chromium-process pairs at 390×844/DPR2 on a desktop SwiftShader software GPU measured median `gameReady` at 3,307.5 ms for v3.97 and 3,298.4 ms for v3.98. This difference is within run-to-run variability: local startup is effectively unchanged. Files came from local route fulfillment with no real network/host delay; OS/GPU caches were not purged. These are not phone, McPlay or YouTube measurements.

The browser's median lighting decode cost is 21.1 ms before and 33.9 ms after (12.8 ms extra in this environment). The smaller file saves 263,915 download bytes. Ideal transfer-only savings are 2.11 seconds at 1 Mbps, 1.06 seconds at 2 Mbps, 0.31 seconds at 6.8 Mbps and 0.11 seconds at 20 Mbps, before decode costs, latency, concurrency, HTTP compression or caches. They are estimates, not measured end-to-end improvements.

Controlled candidate probes with a 1,000 ms SDK script delay reached ready at 4,327.8 ms; with a 2,000 ms cloud read delay, 4,615.5 ms. These demonstrate distinct dependencies; they do not measure the actual SDK service. Readiness still waits for protected saves and a real full-detail frame. No timeout silently resets player progress or reports readiness early.

The largest local cost remains the initial full-detail GPU draw; optional models already have bounded reads, and model construction overlaps lighting download. Replacing the renderer, lowering graphics, adding a start menu, or falsely reporting readiness would violate the unchanged-game constraint. Further work should be driven by actual phone/host traces, with first visit and repeat visit measured separately. YouTube recommends interaction within five seconds and requires the SDK before game code and `gameReady` only when interaction is available:

- https://developers.google.com/youtube/gaming/playables/certification/requirements_stability
- https://developers.google.com/youtube/gaming/playables/certification/requirements_integration

## Validation

Local domain/legacy contracts 35/35, direct SDK 41/41, fixed full-graphics policy 5/5, startup 11/11, mobile/cache/context recovery 8/8, lossless asset verification, browser decoder parity and five rendered variants passed. Final CI passed: Chromium 18/18, Firefox 16/16 and WebKit 16/16; standalone 2/2 in each engine; startup 11/11, mobile/context/cache 8/8, Windows D3D11 11/11, deterministic cache contracts 3/3, graphics 3/3 and five image variants identical to v3.94. Domain/legacy 35/35, direct SDK 41/41, full-graphics policy 5/5 and reproducible ZIP verification also pass in CI. The 30-screen replay review remains applicable because the game/customer/style bytes are unchanged. Exact physical-phone and hosted-platform times remain unmeasured. Nothing has been uploaded to McPlay.

- [Exact release identity](BUILD-v3.98.json)
- [Raw timing samples and decoder comparison](STARTUP-v3.98.json)
- [Repeatable startup audit](../qa/startup-audit.cjs)

Reproduce the audit with Playwright and an extracted v3.97 archive:

```sh
BASELINE_DIR=/absolute/path/to/v397 RELEASE_DIR=source/build-youtube node qa/startup-audit.cjs
```

The smaller standalone build is published to the existing private phone-test Site, with its audience preserved: https://haircut-studio-v387.lat23445.chatgpt.site . Site source commit `0f63d38db8eec0294b0163fac0bee3f75148fcbc`; deployment `appgdep_6ad1488dbf608191b1cb2c9a76cfc1aa` succeeded. Physical-phone timing remains unmeasured.

The first CI run exposed two QA assumptions: WebKit did not reuse the standalone fetch preload, and optional model reads sometimes exceeded their existing 100 ms budget on the shared runner. The standalone preload was removed. Cache QA now checks the repaired IndexedDB hash/first value and unchanged saved hair directly, while deterministic VM contracts separately prove valid-cache adoption, corrupt-cache rejection and missing-cache fallback. The production cache budget and runtime are unchanged; a cache miss must continue with the original model builders.

Final browser/graphics evidence: https://github.com/lrodeveloperr/Haircut/actions/runs/38811352980 (all six affected jobs passed, source `e5311457593b111239dfde0950c3d57de9c6a3bd`). Final contract/cache evidence: https://github.com/lrodeveloperr/Haircut/actions/runs/38811738504 (all three affected jobs passed, source `28f5a7cdb60d7a68b3e8f12a5f34d603921b8fd1`). The latter changes QA only; the production archive is identical in both runs. Layouts and soak were not repeated for unchanged game/customer/style bytes.
