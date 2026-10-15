# MediaCube / YouTube Playables release

## File to upload

Use `releases/asmr-barber-fade-master-v3.83-mediacube-youtube.zip` in McPlay's **Replace game bundle** field.
This is a WebGL/HTML5 runtime archive with `index.html` at the root, not a source ZIP or Android package.

This target uses the direct official YouTube Playables SDK at `https://www.youtube.com/game_api/v1`.
It does not load Playgama Bridge, Playgama configuration, a mock SDK, external analytics or remote game assets.
The existing Playgama and full-detail Android builds remain separate.

## Rebuild

```sh
bash source/build-youtube.sh
# Produces source/build-youtube/, without an upload archive.

bash source/release-youtube.sh v3.83
# Creates the immutable release ZIP; refuses to overwrite an existing release.
```

For a new release, use a new version. Both scripts require Bash, Python 3 and Node.js; no game dependencies
need downloading. The deterministic packager uses Python's standard library. It includes the license files
and enforces the studio's 5,000,000-byte limits for both the ZIP and its expanded contents.

The official SDK is loaded first. A visible loading state sends `firstFrameReady`; `gameReady` is sent only
after the saved game, wardrobe and controller are initialized and the loading state has been removed.

## Saves and platform lifecycle

YouTube stores one versioned JSON envelope through `loadData` / `saveData`. Its slots retain the existing
session v19, metadata v1 and wardrobe v4 schemas. Parallel changes merge into serialized, acknowledged
cloud writes. Unread, invalid-envelope and unsupported newer saves cannot be overwritten. Retry reloads
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
