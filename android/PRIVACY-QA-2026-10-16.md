# Android privacy verification — 16 October 2026

Owner-approved scope: a shield icon beside wardrobe Close; existing game/control layout and cutting remain frozen. All QA uses test ads.

## Baseline hashes

- `android/clipper-input.js`: `231830bf96d9e63b8a30832d75ca45399fb85e31affb8a02d47c4b7bdea115ca`
- Generated Android `runtime/game.js`: `d553e1a9109cbf79aae7d8f4b051e71c58244e4a729fcbdf953a4f26b62f590b`
- Shared `source/customers/wardrobe.js`: `82c57c8d2debee22a8817e52654709889587c5ffd39a326c2603505748f5d4a8`

These three hashes remain unchanged after the privacy build. The new Android-only script adds a button in existing flexible header space; it does not patch the shared wardrobe or game renderer.

## Current evidence

- Full build and runtime syntax checks: PASS.
- Viewport modern/legacy/nested-zoom suite: PASS.
- Graphics/input/renderer parity: 85 cases PASS.
- Reward rules: 8 cases PASS.
- Game and bridge domain contracts: 35 cases PASS.
- New four-layout privacy/geometry browser check: PASS, including strict equality of every existing measured control/card/panel bound before/after adding the shield, matched Close diameter/centreline, native entry dispatch, unchanged haircut and pause ownership. Eight raw before/after PNGs were captured locally.
- Updated installed-APK privacy/native-menu matrix and native compile/lint: pending CI.
- Public website privacy instructions updated in website commit `12f499327da9b6a7815f8d04fedc015a830013a7`. Both Cloudflare build checks succeeded. The public HTTPS page was then opened successfully in the browser and the new shield/menu instructions were read from the live page.

## QA observations and fixes

- The first local privacy geometry comparison found a roughly 0.04 CSS-pixel difference in the already animated rewarded-video button across screenshot frames. Static layout elements did not move. The first capture froze CSS animation playback at an intermediate frame, whose sampling still differed around compositor delivery. QA now disables CSS animation/transition in both comparison states and waits for two paint frames before measuring. The strict existing-bounds equality assertion is retained; no production styles or layout were changed. The next local four-layout run passed. This is local verification; the CI run is recorded separately below.

- The capture-workflow heuristic marked build/lint/domain steps for removal when interpreting the existing `Android APK` workflow as raw capture only. This workflow is the app's existing build-and-verification gate, not a standalone marketing capture job. Its compile/lint and native matrix are required for this native privacy bridge change and are retained. The added privacy capture reuses the existing browser/compiled APK/emulator, adds no separate runner or reboot, and uploads its raw PNGs alongside the app evidence.

## Native privacy behavior

- The shield opens an Android privacy menu with a policy link to the existing public page.
- If UMP reports `PrivacyOptionsRequirementStatus.REQUIRED`, the menu also contains Privacy choices and reopens the SDK form.
- Reopening privacy choices invalidates loaded ads and in-flight callbacks from the previous consent generation. New preloads use the current consent state.
- No production ad IDs were configured for this work. Actual region-dependent UMP form availability requires the later app-specific AdMob consent-message setup and is not claimed as verified by an offline emulator.

- Native source review identified an initialization race: the initial Mobile Ads initialization callback could arrive while Privacy choices was open. A dedicated privacy-form pause now blocks every ad request until the SDK form closes, in addition to invalidating old cached requests. Browser/game assets are unchanged. This native-only correction is verified by the next compile/installed-APK run.

- The new shield uses the existing generic circular-button style rather than the Close-specific class. This preserves the original wardrobe focus target and Close selectors. The browser check now explicitly requires initial keyboard focus to remain on Close, as well as strict geometry equality.
