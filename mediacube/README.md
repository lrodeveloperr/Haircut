# MediaCube / YouTube Playables release

## File to upload

Current optimized official SDK candidate: `releases/asmr-barber-fade-master-v3.100-mediacube-youtube.zip`.
The previous v3.99 release was confirmed on the owner's Android phone. This candidate keeps its
game/customer runtime bytes and full graphics, and adds lossless compact cloud transport, SDK-only
visibility handling, complete loading-screen removal and a bounded 400 ms derived-model cache read.
Content-versioned startup URLs prevent mixed cached assets. Physical-device and hosted certification
results for v3.99 do not certify this new candidate.
It has not been uploaded to McPlay.
This is a WebGL/HTML5 runtime archive with `index.html` at the root, not a source ZIP or Android package.

This target uses the direct official YouTube Playables SDK at `https://www.youtube.com/game_api/v1`.
It does not load Playgama Bridge, Playgama configuration, a mock SDK, external analytics or remote game assets.
The existing Playgama and full-detail Android builds remain separate.

See [candidate validation and timing](VALIDATION-v3.100.md), [phone-confirmed baseline](VALIDATION-v3.99.md) and [exact build identity](BUILD-v3.100.json).

## Rebuild

```sh
bash source/build-youtube.sh
# Produces source/build-youtube/, without an upload archive.

bash source/release-youtube.sh v3.100
# Creates the immutable release ZIP; refuses to overwrite an existing release.
```

For a new release, use a new version. Both scripts require Bash, Python 3 and Node.js; no game dependencies
need downloading. The deterministic packager uses Python's standard library. It includes the license files
and enforces the studio's 5,000,000-byte limits for both the ZIP and its expanded contents,
plus McPlay's 15,000,000-byte per-file advisory budget.

The official SDK is loaded first. A visible loading state sends `firstFrameReady`; `gameReady` is sent only
after the saved game, wardrobe and controller are initialized and the loading state has been removed.

## Download optimization (v3.98)

Lossless texel/row byte prediction reduces the reflection asset from 582,123 to 318,208 bytes.
The archive is 724,822 bytes, with the game/customer bundles and every lighting byte unchanged.
The standalone Sites target starts one content-hashed lighting request without an extra fetch preload.
See the linked v3.98 validation for measured local startup, estimates and actual-device limits.

## Startup recovery (v3.91)

Full detail is the only startup mode; graphics are never lowered to get the game running. A slow
GPU fence continues after about ten seconds, and a context the browser drops while loading is waited
for and restarted. If full detail still cannot start, the recovery screen shows a short code
identifying the failure.

## Startup and mobile reliability (v3.95)

Reflection lighting uses lossless byte-plane packing: 582,123 bytes instead of 896,932, reconstructing
all 6,291,456 original half-float bytes. The preload begins while the official SDK loads. A valid
device-cached lighting copy can win the race against the bundle on repeat visits. Geometry builds
while the lighting downloads, and optional IndexedDB model reads have a 100 ms budget. Invalid
derived model entries are rebuilt and repaired; none of these caches contain player saves.

Context restoration rebuilds the reflection render target before the next frame. During a loss in
play, input stays paused until the original full-detail scene has rendered again. Snapshot capture
uses quiet, asynchronous work instead of synchronous readback/encoding in a host pause or pagehide
callback. The v3.94 controls, gameplay, UI, monetization and full-detail policy are preserved.

See [v3.95 validation](VALIDATION-v3.95.md) for exact release bytes and the scope of desktop/mobile
emulation evidence. Physical-device and real YouTube-app checks remain a separate required check.

## Startup and score reporting (v3.87)

The official SDK still loads first. Language and a single protected cloud read now start before
procedural geometry, and run concurrently. Initial host pauses defer module execution and host reads.
The saved wardrobe is applied before the first customer draw. Visible first-frame materials
are compiled in advance; shader reflection/diagnostics are resolved before any customer draw.
The hidden clipper is warmed immediately after readiness, as in v3.94.
Startup input stays paused until a nonblocking GPU fence confirms the final scene has finished drawing
and the page has crossed two host-aware paint frames. Fence polling pauses with the host, cancels on
renderer teardown and reaches recovery on context loss. The slow-fence policy above is retained.
Duplicate initial resize draws are skipped. Shader compilation failure or context loss during boot
reaches Retry while preserving progress. `HSC.startupTiming` exposes local stage timestamps for a
hosted pre-flight diagnosis; no external analytics or extra network resource is introduced.

The game sends the existing completed-haircuts count through `engagement.sendScore({value})` only after
that exact progress snapshot is acknowledged by cloud saving. Restored positive progress is synchronized
after readiness. Empty accounts send no artificial zero, and failed/pending score requests never block
saving, readiness or gameplay. To exercise McPlay's integer-score check on a fresh save, complete a
haircut with **Finish haircut** and let cloud saving acknowledge it; opening the game alone deliberately
sends no dummy score. The haircut rules, progression, UI and graphics policy are unchanged.

## Graphics

Full detail on every device for the whole session: 30,000 scalp strands, eight-segment hair and
beards, full beard density, full skin shading, antialiasing and native resolution up to 2x. Nothing
is lowered at startup or during play (v3.91 removed the v3.85 adaptive scaling). The drawing buffer
keeps its 4,000,000-pixel cap, which only applies above phone and tablet sizes. Frame times are
measured for diagnostics only (`HSC.detail.lastFrameMs`).

## Saves and platform lifecycle

YouTube stores one versioned JSON envelope through `loadData` / `saveData`. Its slots retain the existing
session v19, metadata v1 and wardrobe v4 schemas. Parallel changes merge into serialized, acknowledged
cloud writes. Empty SDK results (including empty JSON objects, arrays and null) start a new game and
write the canonical envelope on the first save. Unread, nonempty invalid-envelope and unsupported
newer saves cannot be overwritten. Retry reloads
the SDK and game without deleting saved data.

The host owns pause/resume and mute. A host pause cancels the gameplay frame loop, suspends game-owned UI
timers, blocks interaction, mutes both sound paths and uses the SDK's final-save window. Resume restarts
the loop with a reset clock and reflows the current viewport. Opening the wardrobe pauses gameplay while
leaving the wardrobe interactive; it does not simulate a YouTube host pause. There is no page-visibility
or multiple-tab pause owner in this target. YouTube's existing audio-control suppression is retained.

When the **real official SDK** reports `IN_PLAYABLES_ENV === false`, the same archive supports an
off-platform browser/McPlay preview: data is stored locally, rewarded controls are unavailable, and no
ads or cloud calls are fabricated. Missing SDK code is an error, never a reason to install a fake SDK.
Preview data and a prior Playgama publisher's cloud data are not automatically migrated to YouTube storage.

## Ads

- Pre-roll is managed by YouTube; the game never requests it manually.
- Daily wardrobe items use `unlock-item`; paid customer replay uses `replay-customer`.
- Only `requestRewardedAd(id)` resolving to **true** grants the promised reward. Cancellation, no fill,
  rejection, concurrent clicks and a failed pre-ad save grant nothing.
- Natural-break interstitials keep the game's two-completion / 60-active-second eligibility and recent
  rewarded-ad suppression. The adapter enforces at least 60 seconds between attempts. An accepted request
  advances pacing without claiming that an impression was shown; the SDK does not expose that guarantee.
- Host pause remains authoritative if an ad Promise completes before YouTube resumes the game.

## Validation

The `MediaCube YouTube release` workflow builds an archive, extracts it, and runs tests against those exact
extracted bytes. A committed release must match the reproducibly rebuilt archive byte for byte.

```sh
bash source/build-youtube.sh
node qa/contracts.cjs
node qa/youtube-contracts.cjs
# Browser tests require Playwright 1.58.2 and its installed browsers:
BROWSER=chromium node qa/youtube-browser.cjs
BROWSER=firefox node qa/youtube-browser.cjs
BROWSER=webkit node qa/youtube-browser.cjs
```

CI also captures 27 viewport sizes in four states and performs a run of at least 50 customer transitions
over at least ten minutes. The browser SDK fixture is installed by the test runner and is not shipped.
A separate Chromium case loads the real official SDK under YouTube's content-source restrictions.

These checks establish local/CI release evidence. They do not attest that McPlay pre-flight, manual
certification, real monetized ad delivery, or physical-device performance has passed.

After uploading this exact archive, let McPlay run pre-flight, inspect every reported failure/warning,
then use its hosted test/review path to verify save/reload, pause/mute, completed/cancelled rewards and
the naturally reached next-customer interstitial. Keep the ZIP hash with the final portal result.

## Primary references (checked 2026-10-15 UTC)

- Mediacube onboarding: https://mediacube.io/en/playables
- McPlay upload and SDK validation: https://mcplay.mediacube.io/
- SDK setup: https://developers.google.com/youtube/gaming/playables/reference/getting_started
- SDK reference: https://developers.google.com/youtube/gaming/playables/reference/sdk
- Integration requirements: https://developers.google.com/youtube/gaming/playables/certification/requirements_integration
- Monetization: https://developers.google.com/youtube/gaming/playables/reference/monetization
- Stability/archive constraints: https://developers.google.com/youtube/gaming/playables/certification/requirements_stability
- CSP/test suite: https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide
- Bundle analyzer: https://developers.google.com/youtube/gaming/playables/samples/bundle_analyzer
