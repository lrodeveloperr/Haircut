# ASMR Barber: Fade Master — v3.82 release QA

Test date: 15 October 2026. Repository: [lrodeveloperr/Haircut](https://github.com/lrodeveloperr/Haircut).

**Outcome: core gameplay passes, but this is not a clean release pass. Protect unread saved progress before upload. SDK startup also needs a visible recovery path.** No game source or release archive was changed during this audit. Tests and this report are isolated on `qa/v3.82-release-audit-2026-10-15`; main remains unchanged.

## Exact release tested

| Item | Verified value |
| --- | --- |
| Main commit | `3ed0ef990326781164dfa9c09efc04835ee594fd` |
| Primary archive | `asmr-barber-fade-master-v3.82-playgama.zip` |
| Compressed / expanded size | 397,431 / 1,052,188 bytes |
| SHA-256 | `bb72694a03d935a16600929dbcdb3713a23084575fa820dc9ed21cfafa1f2701` |
| Archive validation | CRC passes; root `index.html`; eight payload files; under 5 MB |
| Reproducibility | `bash source/buildall.sh` reproduces all eight extracted payload files byte for byte |
| Full-detail HTML archive | `android/asmr-barber-fade-master-v3.82-full-detail.zip` |
| Full-detail compressed / expanded size | 398,619 / 1,055,514 bytes |
| Full-detail SHA-256 | `ca138d97b1f9b6b8ae5ad2f7400b3a4154c6a2ca91a0441763ffde2c507639a1` |
| Full-detail reproducibility | CRC passes; `TARGET=full bash source/buildall.sh` reproduces all eight payload files |

The main revision was checked again when closing this report and still matched the tested commit. Full-detail validation here covers packaging, syntax and build equivalence; it does not certify an Android APK or full-detail device performance.

## Confirmed findings

### 1. High — a storage read failure can replace existing saved progress

The storage adapter treats an operational `storage.get` rejection as a missing save and returns fresh defaults. Browser test N11 seeded valid saved progress, injected a read failure, then changed a guard after boot. The subsequent save replaced the original progress. This reproduced in Chromium, Firefox and WebKit. Contract B04 also fails because the read failure is swallowed.

Expected recovery: distinguish an absent or corrupt value from an unsuccessful read. Preserve the unread key and suppress writes to it until a read succeeds or the player explicitly resets it. Safe temporary play or a retry screen can still be offered. A transient storage outage must not silently reset a returning player.

### 2. Medium — SDK startup failure leaves a blank game without retry

Browser test N12 rejected SDK initialization. All three engines produced a blank game with no visible error or Retry control. Startup correctly stops, but the diagnostic attribute/console output is insufficient for a player to recover.

Expected recovery: display a readable startup error and a working retry path without treating the failed initialization as successful readiness.

### 3. Secondary — unsupported newer saves reset to fresh progress

Contract D12 supplied a newer v20 session. The v19 session loader replaced it with a fresh session, changing completed jobs from 73 to 0. This is a forward-compatibility/rollback hazard rather than evidence that current supported saves fail. Preserve an unsupported newer value instead of overwriting it.

### 4. Secondary — extreme negative rotation does not normalize into range

Contract D04 finds that an extreme negative yaw delta can leave `cameraYawDeg` outside `[-180, 180)`. Ordinary rotation and cutting passed. Use a modulo expression that handles negative input; this audit does not establish a visible failure during normal gestures.

### 5. Packaging — notice references point to absent files

`THIRD-PARTY-NOTICES.md` references `licenses/three-MIT.txt` and `licenses/preact-MIT.txt`, but neither referenced file is in the release. The bundled Three.js code contains a copyright/SPDX comment. Reconcile the notice file and packaged license texts; this is a technical completeness finding, not a legal determination.

### 6. Layout — tiny embedded viewports have small targets

The source checker reports some targets around 32–39 px in 300×300, 400×225 and 225×400 embeds, below its 40 px threshold. Review these embed layouts. Normal phone, tablet and desktop configurations were not flagged for small targets. One displayed 40×40 result is a floating-point threshold edge.

## Coverage and observed results

| Area | Result and evidence |
| --- | --- |
| Archive / scripts | CRC, sizes, root entry, both packaged JavaScript syntax checks and exact primary/full-detail rebuild comparisons pass |
| Runtime contracts | 32 cases: 29 pass; D04, D12 and B04 fail as described above |
| State generation | 1,000 deterministic fresh sessions satisfy invariants; 500 transitions remain valid without consecutive repeated looks/requests |
| Source customer audit | 3,000 customers; audit prints `RULE BREAKS: none`; no browser errors |
| Browser engines | Chromium, Firefox and WebKit via Playwright 1.58.2 on Ubuntu CI; primary packaged release served over HTTP |
| Boot and controls | Customer systems initialize; `game_ready` sent once; all five guards work through visible buttons |
| Cutting | Actual mouse strokes remove hair without increasing hair lengths; immutable model, seam interpolation and invalid/non-cutting inputs pass |
| Save / reload | Hair, beard, customer seed, guard, stroke count and job persist with parsed SDK storage responses; current stable Bridge CDN save/reload also passes in Chromium |
| Save resilience | Supported v15–v18 migrations, malformed session recovery, independent keys, queued writes, failed-write recovery and delete contract pass; operational read failure remains unsafe |
| Wardrobe | Open pauses; Escape closes/resumes; initial and subsequent selections work; 300-item pagination and equip ordering pass in portrait/landscape |
| Completion / replay | Finish, reveal, Next and customer progression pass; rewarded replay resets hair/beard while preserving the customer and next queue |
| Rewards | Cancel grants nothing; duplicate reward callbacks grant exactly one daily item; equipment persists — verified in all three engines in the follow-up run |
| Corrupt wardrobe / metadata | Corrupt session, metadata and wardrobe recover without unauthorized unlocks in all three engines |
| Host lifecycle / sound | Host pause prevents cutting; composed pause reasons and host mute work; player audio choice is preserved |
| Ad adapter | Cadence, unsupported ads, concurrent requests, duplicate callbacks, failure and timeout recovery, event disposal and initial host/ad state pass; active interstitial waits for terminal close/failure; rewarded stays paused until close |
| Brush cleanup | 45 clippings cleared by the approximately 5.76-second checkpoint; no errors |
| Layout matrix | 27 viewports × four states = 108 captures/checks; see interpretation below |
| Top row | All 27 viewports pass height/top alignment, mirrored margin and replay placement checks; removed level badge stays absent |
| Single-file demo | Builds and boots without errors; its stand-in ads and test storage are not production-ad proof |
| Sustained run | Ten minutes and 50 customer transitions complete without crash; measured resource counts remain stable |

### Layout checker interpretation

The source scale tests logged 568 raw overlap flags and 71 small-target flags. These are individual observations across states, not 639 confirmed UI defects. Most overlaps are the paused/dimmed game intentionally visible behind wardrobe layers or the grouped five-stop tap/slide guard arc. All five guard centers were selectable in browser tests. No off-screen, wardrobe clipping, wardrobe scroll or unwanted-text flags were reported.

The center checker flags the flame icon about 11 px left of its pill center. The pill contains both an icon and a number; centering the icon alone is not the intended group alignment. Completion icons were centered and the dedicated top-row tests passed. Tiny-embed target sizes remain a review item as described above.

Several existing source scripts report findings but exit with code zero. Their green CI status must not be read as a clean layout verdict.

### Ten-minute soak measurements

The Chromium soak ran for 600,004 ms and advanced from job 1 to job 51 (50 transitions).

| Measurement | Baseline | End |
| --- | ---: | ---: |
| Canvases | 1 | 1 |
| HUD roots | 1 | 1 |
| Counted event listeners | 4 | 4 |
| Audio contexts | 2 | 2 |
| Audio sources started / stopped | 2 / 2 | 1,038 / 1,038 |
| JavaScript heap | 34,310,536 bytes | 37,835,861 bytes |

The approximately 3.53 MB heap change is an observation, not proof of a leak or proof of leak freedom. GPU memory and physical-phone performance were not measured.

## Execution evidence and reproducibility

- [Full current-release run](https://github.com/lrodeveloperr/Haircut/actions/runs/38668443772): includes all source suites, contracts, three browser engines, four layout groups and the sustained run. Overall failure is expected from the confirmed negative-path defects.
- [Reward/replay/corruption follow-up](https://github.com/lrodeveloperr/Haircut/actions/runs/38669061930): R01, R02 and R03 pass in all three engines.
- [Tested source revision](https://github.com/lrodeveloperr/Haircut/commit/3ed0ef990326781164dfa9c09efc04835ee594fd).
- QA branch: `qa/v3.82-release-audit-2026-10-15`; workflow `.github/workflows/current-qa.yml`, contract harness `qa/contracts.cjs`, browser harness `qa/browser.cjs`.

The first browser run's N08/N09 click timeouts were caused by Playwright waiting for a continuously pulsing reward button to become stable. This left wardrobe open and contaminated N10. The follow-up uses reduced motion, explicit visible/enabled checks and a forced click for the animated button, then a fresh replay fixture. R01/R02 pass in all engines. These superseded automation failures are not counted as confirmed reward/replay defects. The independent storage and startup failures reproduce without that contamination.

Core lifecycle tests use controlled SDK fixtures to test success, cancellation, duplicated callbacks and operational failures. One current stable Bridge CDN save/reload path was tested separately. Successful fixtures do not establish live MediaCube ad delivery.

An initial pass used an older cached v3.47 snapshot. This report replaces that pass for current-release decisions. Its former double-parse restore and early ad-completion findings are fixed in v3.82; they are not current defects.

## Remaining release evidence

The MediaCube-hosted iframe, actual portal ad inventory, portal certification and physical iOS/Android devices were not tested. Browser emulation and software-rendered CI do not certify touch feel, thermals or mobile GPU performance. No upload or game package preparation was performed.

Recommended order: fix unread-save protection and startup recovery, rerun their regression cases, then collect hosted and physical-device evidence before submission. The newer-save guard, extreme-yaw normalization, notice files and tiny-embed targets are documented follow-ups.
