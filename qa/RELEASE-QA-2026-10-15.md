# ASMR Haircut Studio v3.47 — release QA

**Outcome: FAIL — the existing archive is not upload-ready.**

Tested on 14–15 October 2026. The runtime and release archive were not changed. Tests and this audit are saved on `qa/v3.47-release-audit-2026-10-15`; main remains unchanged.

## Exact artifact

| Item | Identity |
|---|---|
| Repository | `lrodeveloperr/Haircut` |
| Release commit | `f4cf6fe078e10614f1321f6f123d4883bce8468f` |
| Archive | `haircut-studio-v3.47-playgama.zip` |
| ZIP SHA-256 | `0060b67873b2b4374d71ddf8e59c8c99ea4308c9b53fdc8f2fad30d50b13e815` |
| Runtime JS SHA-256 | `d8df72c121ed5a347ff61d46036cb66da4f0ab6699e32b1d54a1d50e9c7e8907` |
| ZIP / expanded bytes | 323,129 / 826,207 |
| Current Bridge CDN script used for contract confirmation | 116,334 bytes; SHA-256 `764a4734649e981680e59c1d2770c2e605be1156b90b88f65e06620cb6a7a1e1` |

## Confirmed defects

| Priority | Finding | Evidence and impact | Required correction |
|---|---|---|---|
| Blocker | Saved sessions are discarded with the current SDK | `Gu` loads `[z] = await storage.get([key])`, then always executes `JSON.parse(z)`. The stable SDK already parses JSON by default. An object causes that second parse to throw and returns the fresh-session fallback. Both strict tests and the actual CDN browser test reproduced reset on reload; a selected guard changed from 2 to 1. The actual SDK storage module returned a saved session with 11 completions, while the game wrapper returned null. | Accept already-parsed values, or explicitly request raw values before parsing; rerun actual-SDK and hosted save/reload proof. |
| Blocker | No visible recovery for startup failures | Injected SDK initialization and storage-read failures leave the backdrop/blank canvas, set `data-boot-error`, and log an error. No error explanation or Retry control is shown. Good behavior: no premature `game_ready` and no overwrite of unread progress. | Add a visible recoverable error state and a bounded retry path while preserving unread saves. |
| Blocker | Ad completion helper resolves prematurely | `showInterstitial` wraps the SDK call with `Promise.resolve(...).then(() => setTimeout(terminal, 1500))`. The SDK method returns void; the promise therefore resolves immediately. A test that kept the ad open proved the helper finishes after 1.5 seconds without a closed/failed callback. Host/ad pause ownership itself passes: this is a completion/transition defect, not proof that audio resumes while an ad is open. | Await actual terminal SDK events with a bounded failure timeout; do not treat a fulfilled/void method return as ad completion. |
| Secondary | Unsupported newer saves are reset | A valid v20 fixture with 73 completions was replaced by a fresh v19 session with zero completions. | Preserve unsupported newer saves and block destructive overwrite, especially on rollback. |
| Secondary | Extreme negative yaw does not normalize correctly | The `%` expression produces values below -180 for sufficiently large negative deltas. Ordinary rotation and keyboard input pass. | Use positive modulo and test large negative drags. |
| Packaging review | Referenced licence files are missing | `THIRD-PARTY-NOTICES.md` refers to `licenses/three-MIT.txt` and `licenses/preact-MIT.txt`, but neither exists in the seven-file archive. The bundle includes a Three.js copyright/SPDX comment. This is a notice completeness finding, not a legal-clearance opinion. | Include the referenced licence texts or correct the notices and retained rights records. |

## Executed coverage

| Area | Result |
|---|---|
| ZIP integrity, paths, entrypoint, asset decoding and byte caps | PASS. CRC valid; `index.html` at root; seven safe paths; both WEBP assets decode; ZIP and expanded runtime well below 5,000,000 bytes. |
| JavaScript syntax | PASS with `node --check` on the packaged runtime. |
| Domain and SDK contracts | 32 tests executed: 28 PASS, 4 FAIL. Includes 1,000 seeded sessions and 500 customer transitions. |
| Content variation | 500 simulated transitions remained valid, with 89 starting-look profiles and 13 request IDs encountered; no consecutive starting look/request repetition. Request IDs are internal to this free-style build, not a claim that scored challenge UI is visible. |
| Core play loop | Cutting, all four guards, rotation, Finish/reveal/Next, tutorial, keyboard controls and Escape behavior passed in Chromium/WebKit. Desktop mouse and native touch were separately verified in all three engines. |
| Persistence | Strict array signatures, acknowledgement waiting, write serialization, failed-write recovery, isolated keys, delete, supported v15–v18 migrations and raw-string reload pass. Current-SDK parsed-object restore and actual CDN reload fail. |
| Lifecycle | Host/ad pause composition, initial pause/mute, interruption during strokes, mute persistence, pointer cancellation, WebGL context loss/recovery and SDK subscription disposal pass within the recorded tests. These use injected host events; actual publishing-host events remain unverified. |
| Layout | All 18 required sizes passed bounds, at-least-44-pixel control targets, no page scrollbar and state preservation in the completed browser runs. An initial Chromium screenshot timeout at 320×1138 was superseded by a passing headed capture. Actual phone safe-area behavior remains unverified. |
| Network | No game-owned external asset or third-party analytics requests observed beyond the official Bridge CDN. No direct localStorage/sessionStorage/IndexedDB or external tracking patterns in the game runtime. Bridge-owned internals are separate from game-owned calls. |
| Audio | Host mute, user mute, reload preference and pause routing pass. Actual audible quality/volume on a physical device was not assessed. |
| YouTube variant | Duplicate in-game audio control is absent; host mute works; `platform.language` reaches document lang (Arabic fixture). Rewarded is disabled in the shipped configuration and has no visible retry path. |
| Accessibility | Control labels and sizes, keyboard guard/rotation/Finish/Next, Escape, and reduced-motion CSS were assessed. Visible HUD is wordless; assistive labels remain English. The 3D reveal still rotates regardless of reduced-motion preference; no haptic-off setting is exposed. Full screen-reader and physical haptic testing remain unverified. |

## Viewport matrix

`320×568`, `360×640`, `375×667`, `390×844`, `414×896`, `430×932`, `768×1024`, `1024×768`, `640×360`, `844×390`, `915×412`, `1280×720`, `2560×1440`, `320×1138`, `360×840`, `720×720`, `2520×1080`, `2560×720`. Cutting and reveal/context-restored renders were inspected. These are emulated dimensions, not physical-device certification.

## Ad pacing and sustained play

- First completion/Next did not show an interstitial. The eligible trigger is Next after at least two completions and 60 accumulated active game seconds, with a 60-second wrapper cooldown. No ad was requested during active cutting.
- Firefox and WebKit passed the actual trigger test after legally earned active time. Approximate wall durations were 101.5 and 89.0 seconds, with recorded active times 61.23 and 61.74 seconds. Earlier fixed-wall-time failures were superseded; no clock/counter was changed to force eligibility.
- Chromium software rendering accumulated only 30.43 active game seconds in 182.1 wall seconds. Its live-trigger prerequisite did not complete within the test budget. This is a CI/software-rendering performance limitation and possible active-clock concern; it does not establish real-phone performance or a live ad-provider failure.
- The 10-minute Chromium soak ran 602.9 seconds and performed 30 customer transitions without crashes. Counts stayed at one canvas, one HUD, four SDK subscriptions, and one audio context. All 31 started oscillators were stopped. The coarse sampled JS heap gauge stayed at 11.2 MB; that gauge cannot rule out small leaks.
- The studio target of at least 50 interactive transitions was **not met** in that soak. The 500 domain transitions supplement it; they do not replace full-renderer coverage.

## Browser fixture corrections

The first Firefox headless startup was blocked by graphics availability. Headed software rendering allowed startup and layout testing. A touch-emulated Firefox page did not emit mouse pointer events, even when focused and not paused; its mouse failures were therefore not counted as confirmed game defects. Separate desktop (`hasTouch: false`) and native-touch contexts both passed in Firefox, Chromium, and WebKit. The retained harness uses separate modality contexts.

## Reproduction and evidence

The QA branch contains `qa/contracts.cjs`, `qa/browser.cjs`, and `.github/workflows/release-qa.yml`. The workflow verifies the original archive SHA before extraction. SDK mock tests are identified as such; the actual-CDN reload check additionally fails. Run artifacts contain detailed JSON results and screenshots.

- [Initial contracts, full browsers and 10-minute soak](https://github.com/lrodeveloperr/Haircut/actions/runs/38665810303)
- [Headed browser coverage and actual CDN reload](https://github.com/lrodeveloperr/Haircut/actions/runs/38666242251)
- [Ad trigger with genuine accumulated active game time](https://github.com/lrodeveloperr/Haircut/actions/runs/38666417901)
- [Final separate desktop and native-touch checks](https://github.com/lrodeveloperr/Haircut/actions/runs/38667145767)

## Not completed / not claimed

- Hosted Playgama/YouTube/MediaCube readiness, persistence, real ad delivery and moderation certification were not run. No game was uploaded or submitted in this test task.
- Physical Android/iPhone/iPad performance, real audio quality, safe-area behavior and device-specific touch/haptic behavior remain unverified.
- A clean source rebuild and dependency-lock reproducibility cannot be run from this repository because it contains the release ZIP and README rather than the editable source project.
- No enjoyment, retention, revenue, originality or rights clearance is inferred from passing functional tests.

## Individual domain / SDK contract results

| ID | Test | Result |
|---|---|
| D01 | 1,000 seeded fresh sessions satisfy state invariants | PASS |
| D02 | 500 customer transitions remain valid and avoid consecutive looks/requests | PASS |
| D03 | Illegal clipper guards cannot change selected guard | PASS |
| D04 | Rotation wraps, elevation clamps, and invalid yaw is ignored | FAIL |
| D05 | Cutting is immutable and never increases any hair length | PASS |
| D06 | Rotate mode/reveal/empty/invalid strokes do not cut | PASS |
| D07 | Stroke interpolation crosses the scalp seam without cutting the opposite side | PASS |
| D08 | Finish is idempotent and preserves the haircut | PASS |
| D09 | Next preserves completed/tutored progress and resets transient cutting state | PASS |
| D10 | Corrupt and malformed session values recover without throwing | PASS |
| D11 | Supported v15-v18 saves migrate without losing valid hair/progress | PASS |
| D12 | Unsupported newer saves are preserved instead of reset | FAIL |
| D13 | Interstitial eligibility requires both two completions and 60 active seconds | PASS |
| D14 | Invalid cadence inputs stay finite and cannot force an ad | PASS |
| D15 | Clipper feedback remains bounded and guard-dependent | PASS |
| B01 | Strict array storage save/load works with raw-string SDK responses | PASS |
| B02 | Saved object restores with current SDK default JSON parsing | FAIL |
| B03 | Audio settings and separate storage keys stay isolated | PASS |
| B04 | Malformed JSON falls back and storage read failures propagate | PASS |
| B05 | Writes await real acknowledgements and serialize correctly | PASS |
| B06 | A failed write does not poison the next queued save | PASS |
| B07 | Delete uses array signature and removes only the requested key | PASS |
| B08 | Initialization rejection and false result stop startup | PASS |
| B09 | Host/ad pause reasons compose; host mute remains authoritative | PASS |
| B10 | Initial host pause/mute and already-open interstitial are respected | PASS |
| B11 | Unsupported interstitial is skipped without pausing | PASS |
| B12 | Interstitial waits for terminal closed/failed event | FAIL |
| B13 | Duplicate opened callbacks count one display and concurrent requests are blocked | PASS |
| B14 | Rejected/failed ad releases request pause and remains retryable | PASS |
| B15 | No-event ad request timeout clears request pause | PASS |
| B16 | YouTube excludes duplicate page visibility handlers and rewarded calls | PASS |
| B17 | Disposal removes SDK event subscriptions | PASS |

## Primary references used for API checks

- [Playgama Storage documentation](https://wiki.playgama.com/playgama/bridge-sdk/api/storage)
- [Playgama Platform documentation](https://wiki.playgama.com/playgama/bridge-sdk/api/platform)
- [Playgama Interstitial documentation](https://wiki.playgama.com/playgama/bridge-sdk/api/advertisement/interstitial)
- [Official Bridge storage source at inspected revision](https://github.com/Playgama/bridge/blob/e33dc66f0fca39aa302bc065e5bd0ec464b879f5/src/modules/storage/StorageModule.ts)

Archive bytes remain unchanged. Resolve the confirmed blockers, rebuild from the source project, and rerun the affected exact-archive and hosted checks before uploading.
