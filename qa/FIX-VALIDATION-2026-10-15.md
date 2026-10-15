# Haircut reliability corrections — validation

Scope: five corrections requested after the v3.82 audit. The user explicitly excluded enlarging controls
in small embedded windows. Existing game control sizes, scaling, layout and artwork are unchanged.

Source base: `3ed0ef990326781164dfa9c09efc04835ee594fd`. Implementation commit:
`d96943d533558f800e2d7c143100f1d25bcbc844`. Final browser harness revision:
`8e4a4373b5d3c666a6480d4f471c2caf5096a1cc`.

## Corrections

| Finding | Change | Regression evidence |
| --- | --- | --- |
| A failed storage read could overwrite existing progress | Known production keys start write-protected. Reads propagate operational failures; writes and deletes remain blocked until the key loads successfully. Startup reads all data before creating gameplay. | B04/B18; N11/N15 check no writes on failure, original values unchanged, successful Retry restores the haircut. |
| SDK initialization failure left a blank page | Visible recovery screen with keyboard-focused Retry. Retry reloads the SDK and game without clearing data. Startup failure sends no readiness message. | N12 verifies recovery to play and exactly one readiness message. N16 checks a missing SDK script and keyboard access in a 225×400 embed. |
| A newer save could reset to current defaults | Session versions above 19, metadata above v1 and wardrobe above v4 are rejected as unsupported and kept write-protected. Show a newer-version message. | D12/B19; N14 checks all three keys through repeated startup/retry without writes or replacement. Supported session migrations and corrupt-session recovery still pass. |
| Extreme negative rotation escaped the normal range | Normalize both operands before addition, then apply nonnegative modulo. | D04 checks both signs, ordinary turns, ±1,000,000 and ±Number.MAX_VALUE; range stays `[-180,180)`. |
| Referenced license texts were absent | Copy upstream Three.js r180 and Preact 10.27.2 MIT texts into both builds; retain upstream links in notices. | P01 checks the referenced files and notice text in both targets. |

Readable `source/storage.js` and `source/boot.js` are inserted by the final asserted patch,
`source/patch14.py`. Both build targets share those fixes. The inherited minified base remains intact.

## Results

| Check | Result |
| --- | --- |
| Primary build, syntax and contracts | PASS — 35/35 contracts |
| Full-detail build, syntax and contracts | PASS — 35/35 contracts |
| Browser integration | PASS — Chromium 16/16, Firefox 15/15, WebKit 15/15 |
| 3,000-customer source audit | PASS — no rule breaks or browser errors |
| Existing replay, wardrobe pagination, brush cleanup, single-file and top-row suites | PASS |
| Layout matrix | COMPLETE — 27 viewports × four states; 568 expected overlap observations and 71 retained small-target warnings; no other flags |
| Sustained run | PASS — 50 transitions over 781,638 ms (13 minutes 1.6 seconds); stable resource counts |
| Recovery screen visual review | PASS — inspected startup-error, unsupported-save and missing-SDK screenshots; text and focused Retry fit in normal phone and 225×400 viewports |
| Repeated build | PASS — repeated primary builds are byte-identical |
| Control-size preservation | PASS — original stylesheet is byte-identical and all wardrobe UI/sizing code is unchanged |

Primary expanded runtime: **1,058,339 bytes**, 10 files. Full-detail expanded runtime: **1,061,632 bytes**,
10 files. Both remain under the 5,000,000-byte expanded-runtime cap. No upload ZIP was produced.

| Runtime file | SHA-256 |
| --- | --- |
| Shared game bundle | `94c40436f1b14ae1261d02ae0a4dcd258d0dc283c5a244fabb0707058a94807b` |
| Primary customer bundle | `681d8b2f7316960bcf0e76327510d6405e28e24873447dc03cfb86d26bee657d` |
| Full-detail customer bundle | `67a0e9479200aee6003690dfc48edf5570a6a0cb206678f7e8872defefe5f884` |

## Sustained-run measurements

The extended run uses a standard 320×568 viewport on the same corrected runtime. It advances job 1 → 51.

| Resource | Baseline | End |
| --- | ---: | ---: |
| Canvases | 1 | 1 |
| HUD roots | 1 | 1 |
| Counted event listeners | 4 | 4 |
| Audio contexts | 2 | 2 |
| Audio sources started / stopped | 2 / 2 | 1,038 / 1,038 |
| JavaScript heap | 36,008,060 bytes | 40,104,717 bytes |

The heap difference is an observation, not proof of leak freedom. Physical-device/GPU memory remains
outside this run. The measured resource invariants and no-console/page-error assertions all pass.

## Execution evidence

- [Full correction suite](https://github.com/lrodeveloperr/Haircut/actions/runs/38670935480): both contract targets, seven existing source suites, four layout groups and the sustained run.
- [Reload-wait correction](https://github.com/lrodeveloperr/Haircut/actions/runs/38671152081): three complete browser suites pass after fixing the harness wait.
- [Extended sustained run](https://github.com/lrodeveloperr/Haircut/actions/runs/38672025076): 50 transitions, more than ten minutes, no recorded page/console errors, stable counted resources.
- [Final browser suite and recovery captures](https://github.com/lrodeveloperr/Haircut/actions/runs/38671245788): adds missing-SDK coverage and the three inspected recovery captures.
- [Pull request](https://github.com/lrodeveloperr/Haircut/pull/2).

The first sustained run reached ten minutes but only 29 transitions, so it failed its coverage target.
The follow-up uses a standard 320×568 viewport and requires both at least ten minutes and at least
50 transitions; it is not permitted to stop early when software graphics are slow. No game code
changed for this adjustment.

The full run's initial N04/N09 failures were test-harness ReferenceErrors: it accessed a bare game global
before asynchronous reload startup had created it. Waiting on `window.skinFadeStudio` fixes that race.
The game implementation did not change between those runs. The later browser run is authoritative for
those two cases. Assertions were retained and normal save/reload and rewarded equipment persistence pass.

The layout checker includes expected overlap observations from wardrobe overlays and the grouped guard
arc. Small-embed target warnings are intentionally retained at the user's direction. Existing source
layout/centering scripts can print warnings and still exit zero; a green job alone is not a clean layout
claim. The streak pill's icon-only centering flag remains an icon-plus-number grouping observation.

These are Ubuntu CI browser checks using Playwright 1.58.2 and software graphics. Mock SDK cases exercise
failure, cancellation and callback behavior; Chromium also checks real stable Bridge CDN save/reload.
They do not establish MediaCube-hosted ads, portal certification or physical-phone GPU performance.
Full-detail browser/device performance was not retested; its build and contract paths were checked.

## Repository and packaging state

Changes are isolated in `fix/qa-reliability-2026-10-15` / PR #2. The historical v3.82 ZIPs are unchanged
and therefore do not yet contain these source corrections. No game upload or submission was performed.
When packaging is requested, build a new version from the corrected source rather than replacing v3.82.
