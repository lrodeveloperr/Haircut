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
- Installed-APK privacy/external-browser checks: PASS on all four layouts. Native compile/lint/signature: PASS. The full native run passed27checks before its offline-ad test fixture timed out; see below.
- Public policy remains on the website. Final direct-link instructions are in website commit `6db51090852492de51f1251c06ceb13d38fa430f`; both Cloudflare deployments succeeded and the direct-link paragraph was read from the live HTTPS page on 16 October.

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
- Final direct-link source `591b3dbb34a1e618ce392b6789f2707a505e9edc`, run https://github.com/lrodeveloperr/Haircut/actions/runs/38950870866: compile/lint/signature passed, as did27installed checks including all four direct-link/geometry/return checks, cutting, two live resizes and background/resume. Its offline-ad fixture timed out: the screenshot shows a cached Google Test Ad with Reward granted and a Close control; logcat confirms AdActivity and the earned callback. Disabling connectivity does not remove a cached creative. The test incorrectly awaited completion without closing that real ad. The app advertising controller is unchanged; this is not evidence of a privacy-button failure.
- QA-only follow-up handles a cached Google sample ad through its labelled native Close control and checks the result against actual native reward callbacks. It reruns only the remaining lifecycle/save path, avoiding another full layout matrix. Source and run: pending push.

## Inspected artifact from `591b3db`

- Artifact12068464011 downloaded once. All eight intended privacy screenshots and four external ACTION_VIEW intent records are present. The intent records show the full policy URL and external browser focus.
- Nineteen native PNGs are present:18planned useful captures plus the diagnostic failure image. The final relaunch screenshot was not reached; total count alone is not a complete-matrix pass.
- Debug APK v1.0.6(7),8,090,935bytes, SHA-256 `a878f0d97801916230183de41a549087882b9ab653bd102df70384e0e866c11e`. The actual APK game asset matches the approved renderer hash above; Android privacy script hash is `2df1b64e30fc29bb7a9d76dec276dfffe8ed957758947966a777f9ed7c386fba`.
- Do not call this full run successful or store-ready. The remaining lifecycle fixture follow-up must finish before production release work.

- Raw-image inspection found that the original native wardrobe screenshots preceded the Android compositor update and showed the underlying scene. Functional tap/intent/state checks passed, but those four images are not valid wardrobe visual evidence. The focused follow-up disables only QA animation, flushes the compositor and requires the cream control in actual native pixels before accepting each capture. This changes tests only; browser visuals were already verified across four layouts.
