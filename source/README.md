# ASMR Barber: Fade Master — source

Buildable source with reliability corrections after the historical v3.82 packages. Existing ZIPs are retained unchanged.

## Build

Needs `bash`, `python3`, `node` and `zip`.

```sh
bash source/buildall.sh
```

This builds the corrected runtime in `source/build/` without preparing an upload ZIP. When a new release
is requested, `bash source/release.sh <new-version>` builds and packages both targets plus the single-file
playable. Use a new version so the historical release remains immutable.

Building only the game, without packaging: `bash source/buildall.sh` (Playables, one light detail level) or
`TARGET=full bash source/buildall.sh` (Android, detail levels Auto / Low / High). The result is in `source/build/`. The direct YouTube target uses `bash source/build-youtube.sh`,
which selects its own fixed full-detail graphics policy and outputs `source/build-youtube/`.

The Android `TARGET=full` web-runtime build also applies `android/patch-runtime.py`: its page title is
**Barber Simulator: ASMR Haircut**, and each optional daily wardrobe item requires two completed
rewarded videos. The shared/Playables targets retain their current rule. Run
`node android/tests/rewards.cjs` for the Android reward regression. Native Android packaging and
the AdMob client remain separate from this web-runtime build.

## How it is put together

- `src/` — the original game (minified Three.js / Preact bundle `runtime/game.js`, `index.html`, `styles.css`,
  images, Playgama Bridge configuration).
- `patch.py` … `patch14.py` — exact string replacements applied in order to the minified game (each one asserts its
  target appears exactly once, so a mismatch stops the build). The docstring at the top of each says what it does.
- `customers/` — readable code concatenated into `build/runtime/customers.js` and loaded before the game, in this
  order: `detail-playables` (or `detail` for Android / `detail-youtube` for direct YouTube), `people`, `glsl`, `faces`, `render`, `state`, `meta`,
  `catalog`, `patterns`, `wardrobe`, `hub`, `clippings`.
  - `people.js` customer generator (heritage, age, skin, hair, hair loss, beard, eyes, face shape)
  - `meta.js` progress, hidden levels, streak, daily VIP, next-customer queue and the variety director
  - `state.js` walk-in haircut styles and the saved customer / beard
  - `catalog.js`, `patterns.js`, `wardrobe.js` the 1,000 clipper and 600 robe designs, the wardrobe and daily picks
  - `hub.js` completion screen (next customer, replay), UI scale, tutorial layout
  - `clippings.js` falling hair and the brush-off at the reveal
- `buildall.sh` builds `build/`; `release.sh` builds and packages; `mkplay.py` makes the single-file playable.
- `tools/gen-designs.js` generated the frozen design list in `customers/catalog.js` (run once; kept for reference).
- `tests/` Playwright checks used during development. Serve the build first, then run them from `source/`:
  `npx http-server build -p 8124 -s &` then e.g. `node tests/audit.js` (3,000-customer realism audit),
  `node tests/replaytest.js`, `node tests/pagetest.js`, `node tests/scale/fast.js` (all screens, 4 states, into
  `tests/scale/`), `node tests/singletest.js dist/<name>-play.html`.

Saved progress uses the storage keys `skin-fade-studio-session-v2`, `skin-fade-studio-meta-v1` and
`skin-fade-studio-rewards-v4`; keep them so players keep their progress.

## Reliability corrections after v3.82

The source now protects each saved-data key until it has loaded successfully. Operational read failures
stop startup and show Retry; Retry reloads the page and SDK without erasing progress. Unsupported newer
session, metadata and wardrobe versions show a compatible-version message and cannot be overwritten.
`storage.js` and `boot.js` contain the readable implementations inserted by `patch14.py`. Corrupt values
still recover safely. Extreme negative rotations normalize correctly. Builds copy the referenced Three.js
and Preact MIT texts from `src/licenses/`; their upstream sources are linked in the notices.

Existing control sizes, including tiny embeds, are preserved. The v3.82 release ZIPs above are historical
and have not been regenerated with these corrections. Run `bash source/buildall.sh` to test the corrected
runtime. Packaging and external upload remain separate actions.

Regression checks: `RELEASE_DIR=source/build node qa/contracts.cjs` from the repository root. Browser checks
need Playwright 1.58.2 and its browsers: `BROWSER=chromium RELEASE_DIR=source/build node qa/browser.cjs`
(also `firefox` and `webkit`). `.github/workflows/reliability-qa.yml` runs these plus the existing source,
layout and sustained checks on the correction branch.
