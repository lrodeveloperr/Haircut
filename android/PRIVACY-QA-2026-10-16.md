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
- Updated installed-APK privacy/external-browser matrix and native compile/lint: pending CI.
- Public policy remains on the website. Final direct-link instructions are in website commit `6db51090852492de51f1251c06ceb13d38fa430f`; deployment verification is pending. The preceding website update deployed successfully and its public HTTPS page was verified.

## QA observations and fixes

- The first local privacy geometry comparison found a roughly 0.04 CSS-pixel difference in the already animated rewarded-video button across screenshot frames. Static layout elements did not move. The first capture froze CSS animation playback at an intermediate frame, whose sampling still differed around compositor delivery. QA now disables CSS animation/transition in both comparison states and waits for two paint frames before measuring. The strict existing-bounds equality assertion is retained; no production styles or layout were changed. The next local four-layout run passed. This is local verification; the CI run is recorded separately below.

- The capture-workflow heuristic marked build/lint/domain steps for removal when interpreting the existing `Android APK` workflow as raw capture only. This workflow is the app's existing build-and-verification gate, not a standalone marketing capture job. Its compile/lint and native matrix are required for this native privacy bridge change and are retained. The added privacy capture reuses the existing browser/compiled APK/emulator, adds no separate runner or reboot, and uploads its raw PNGs alongside the app evidence.

## Native privacy behavior

- One tap on the shield calls the existing Android external-browser handler with `https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/`.
- No intermediate menu, bundled policy text, consent form, ad request or ad-specific behavior is attached to this button. Website policy edits do not require an app update.
- `AdsController.java` is restored byte-for-byte to the approved `88f920b` baseline. No production IDs are configured.
- The shield uses the existing generic circular-button style, preserving original Close selectors and initial keyboard focus.
- Installed tests verify the real external ACTION_VIEW intent, external activity focus, unchanged existing wardrobe bounds and preserved haircut/pause on return. The emulator stays offline; public policy content is verified separately.

## CI runs

- Initial privacy source `d1a3123`, run https://github.com/lrodeveloperr/Haircut/actions/runs/38948587734: full build/domain/browser privacy/placement checks, APK compile/lint/signature passed. Installed phone portrait/landscape cutting and native privacy-menu checks passed; tablet portrait cutting had begun. The run was superseded/cancelled when the source-review fixes for Close focus and privacy-form ad suspension were pushed. It is partial evidence, not a successful final matrix.
- Superseded menu source `e485782d9b0abc298eaa7fa3d9d86b8b2ae16a8e`, run https://github.com/lrodeveloperr/Haircut/actions/runs/38949610005: build/domain/browser checks and native compile/lint/signature passed. Installed matrix failed before its first placement assertion: UiAutomation returned a null root with exit status zero and created no XML. The existing bounded inspection retry now also covers reading a missing dump file; coordinate/placement assertions remain strict. This run does not verify the final direct-link behavior.
- Final direct-link source/run: pending push and installed verification.
