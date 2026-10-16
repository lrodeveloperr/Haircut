# Independent expert review: Android clipper placement

Reviewed 16 October 2026 at the user's explicit request for an independent expert review and sign-off.

## Current decision

**Technical sign-off granted for the clipper-positioning change.** No production correctness blocker was identified. The complete installed-phone/tablet matrix and focused browser placement/interruption/bridge run passed.

This report reviews runtime commit `24bb0958d8627791321392f2e42a9814ddcd9784` and the subsequent QA-only native inspection changes through `9b467a55a78a562d517e91ab54ac3b7d07309770`. The later commits do not change the shipped clipper/input runtime. Fresh PR metadata and the local checkout were checked. No `AGENTS.md` was present in the checkout.

## Independent source review

- `android/clipper-input.js` computes a projected-grip candidate, bounds the requested blade ray to **36–45 CSS pixels above contact**, refines once at stroke start and retains that same gap for the stroke. It does not continuously feed changing surface normals back into the offset. Invalid or foreshortened projection values fall back to the lower bound.
- Cutting and proximity use one `touchTarget` helper and retain the real surface raycast. The actual tooth geometry is centered at clipper-local `(0, -.012, -.004)`; the diagnostic projection uses that same geometry and the real rendered world matrix. The model has not been independently shifted away from its cutting target.
- The helper restores the previous render hit after its initial probes. Mouse and pen retain direct coordinates. Release, cancel, lost capture, mode/guard changes, pause and viewport interruption use the existing release path, which now also clears the cached pointer ID and gap.
- `android/viewport-compat.js` feature-detects the older WebView CSS-zoom rectangle behavior. Modern engines retain their native method. The normalization is scoped to the four game UI roots, retains canvas geometry and handles nested zoom; the guard anchor is converted from local design units to the same viewport coordinates as input.
- The Android build reverses the explicit input/guard adaptations and verifies equality with the working web renderer. Camera, model scale, geometry, shaders and drawing-loop behavior remain unchanged outside those adaptations.
- The QA-only native hierarchy retry removes the previous XML before each attempt, matches this app's WebView package, requires nonempty bounds and retains a uniquely indexed raw XML observation. It retries failed inspection commands only; failed coordinate or placement assertions are not retried or weakened. It does not infer bounds from the requested display size or from JavaScript.

## Independently repeated local checks

Against a fresh full build of the reviewed runtime:

| Check | Result |
|---|---|
| `TARGET=full bash source/buildall.sh` | PASS, including generated-runtime syntax checks |
| `node android/tests/viewport.cjs` | PASS: modern/legacy zoom, nested zoom, resize, raw rectangles and canvas isolation |
| `node android/tests/graphics.cjs` | PASS: 85 graphics/input cases and renderer parity |
| `node android/tests/rewards.cjs` | PASS: 8 reward cases |
| `RELEASE_DIR=source/build-foundation node qa/contracts.cjs` | PASS: 35 contracts |
| Browser coverage of all 16 layout/region combinations | Aggregate placement coverage PASS; focused run 11 runtime cases PASS |

The graphics/input suite verifies shared-target forwarding; its mocked helper alone is not evidence of actual visible blade clearance. Real geometry, held-touch screenshots and native trusted input provide that separate evidence.

## Final installed-APK evidence independently inspected

Source-matched artifact from successful workflow [38937815985](https://github.com/lrodeveloperr/Haircut/actions/runs/38937815985), source `9b467a55a78a562d517e91ab54ac3b7d07309770`: the reviewer read the JSON, parsed all six raw native XML observations, recomputed measurements and inspected all six held-touch Android OS PNGs. Game, viewport and customer assets in the final APK match the fresh build byte for byte. APK SHA-256: `26a9e418738ac4e2b44d02c623fac0618e6cc06bb7d31a3950157dc34ba7f01c`.

| Layout | Held tooth clearance | Moved tooth clearance | Held tooth-to-cut-target error | Diagnostic pixels: contact / tooth |
|---|---:|---:|---:|---:|
| Phone portrait, native 1080×1920 | 37.25 CSS px | 37.29 CSS px | 1.35 CSS px | 1,687 / 236 |
| Phone landscape, native 1920×1080 | 36.96 CSS px | 36.95 CSS px | 1.11 CSS px | 1,617 / 241 |
| Tablet portrait, native 1600×2560 | 47.28 CSS px | 47.11 CSS px | 2.50 CSS px | 995 / 140 |
| Tablet landscape, native 2560×1600 | 46.58 CSS px | 46.37 CSS px | 1.87 CSS px | 1,014 / 138 |
| Live resize to tablet portrait | 47.11 CSS px | 47.11 CSS px | 2.12 CSS px | 1,008 / 140 |
| Live resize to tablet landscape | 46.61 CSS px | 46.71 CSS px | 1.72 CSS px | 988 / 140 |

All six captures visibly contain the real clipper blade above the 24 CSS-pixel-radius diagnostic contact envelope. All 21 installed checks passed: four fresh phone/tablet layouts, trusted native ADB scalp cutting and intermediate guard taps, six held captures, two genuinely held stroke interruptions through same-density live resizing, lifecycle, offline/no-fill recovery and private-save relaunch. Native bounds, DPR, visual viewport and visible controls agree. All native hierarchy observations succeeded on attempt one, with no retries. Across held and moved observations, actual tooth clearance was 36.946–47.280 CSS pixels. No page exceptions were reported.

The blade remained aligned after a real held move following restoration of the test-only render pin. The pin exists only in QA and does not alter the packaged runtime. The current browser crown/sideburn captures were also visually inspected: the projected tooth marker lies on the blade and the blade is outside the contact envelope.

## Browser aggregate coverage and release-event verification

Coverage is aggregate coverage of all **16 distinct layout/region combinations**, not a claim that one uninterrupted all-layout run passed. Regions are crown, sideburn, beard and lower scalp in phone/tablet portrait/landscape.

The initial run retained 14 held observations and 39 valid held moves before an immediate post-CDP cancellation assertion read `45` instead of `null`. All completed geometry assertions passed. Its 53 observations and failure log are preserved as `qa/results/android-browser-placement-initial-review-report.json` and `android-browser-placement-initial-review.log`.

Three traced genuine trusted cancels showed the engine gap clearing by `lostpointercapture` 0.2–0.4ms after the window-capture cancellation observation. That diagnostic completed 13 browser runtime cases; PNG encoding was omitted for its cancellation-only scope. The original failing instant lacked event tracing: interpreting it as an input-delivery ordering race is an inference supported by these traces and corrected verification, not a captured timeline of that original instant.

The QA correction requires the matching trusted canvas `pointerup`/`pointercancel` **and** a null cached gap within five seconds, then retains the explicit null assertion. It orders mouse-up before the next touch and retains focused results separately. It does not invoke the reset helper to force success and changes no production code.

The focused final-layout run completed **11 runtime cases with zero page errors**, including four held regions and ten valid moves, the bridge/storage/reward/lifecycle remainder and context recovery. Its affected sideburn cancellation and reused-pointer release passed with real trusted canvas events. Across the initial and focused reports' 67 observations, actual clearance was 36.188–45.877 CSS pixels; maximum tooth-to-target error was 3.455 CSS pixels. Current beard and lower-scalp PNGs were visually inspected. Command: `ANDROID_LAST_LAYOUT=1 CHROMIUM_EXECUTABLE_PATH=/tmp/haircut-local-browser/chrome-headless-shell-linux64/chrome-headless-shell node android/tests/bridge.cjs`.

These browser observations prove alignment and regional reach. Native ADB tests separately prove actual scalp cutting; browser diagnostics with `lastCut: null` are not claimed as region-specific hair-removal proof. The prior native `uiautomator` crash is superseded by the complete successful native matrix.

## Scope and practical limit

The technical criteria are blade visibility beyond the stated diagnostic envelope, less than 50 CSS pixels of actual upward clearance, less than 5 CSS pixels of tooth-to-cut-target error, stable stroke offset and preserved rendering/cutting behavior. They do not claim that a diagnostic circle is every physical user's finger, guarantee comfort on every device or establish physical equivalence to a particular YouTube host. Those are limits of the evidence, not additional unrequested release approval steps.

**Reviewer: independent clipper/input expert agent. Final technical sign-off: APPROVED for the reviewed clipper placement and interruption change. No outstanding positioning blocker.**
