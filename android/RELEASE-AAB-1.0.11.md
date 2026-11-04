# Android production bundle — v1.0.11 (12)

Built and verified on 27 October 2026 for the existing Play app `com.worksbien.barbersimulatorasmr`.

| Field | Verified value |
| --- | --- |
| Local filename | `android/native/app/build/outputs/bundle/release/app-release.aab` |
| Intended Play filename | `Barber-Simulator-ASMR-Haircut-1.0.11-code12.aab` |
| Version | 1.0.11, code 12 |
| Bytes | 5,280,415 |
| SHA-256 | `6af6309e6becca8f22870cb786c65900828d97869cddbaa46680be8644ba8c44` |
| Package | `com.worksbien.barbersimulatorasmr` |
| Min / target API | 26 / 36 |
| Upload certificate SHA-256 | `80:21:E4:A8:4C:13:7A:36:34:B6:43:76:E1:F9:3A:1A:5D:45:E6:5D:E6:26:90:A3:8B:11:EF:30:D6:14:B2:FB` |
| Renderer SHA-256 | `d553e1a9109cbf79aae7d8f4b051e71c58244e4a729fcbdf953a4f26b62f590b` |

## Changes

- Adds an icon-only share control at the upper-right of the finished-haircut screen on phone and tablet, in portrait and landscape.
- The shared image is composed from the game's real finished customer and haircut. A large direct-back hero showcases the fade, with front, right profile and left profile in a three-panel supporting row. Every view uses the same 16% head-to-top clearance. The supporting row and panel widths are derived from each angle's real visible-subject proportions, so the cape meets the lower edge without an empty strip, neither profile is squeezed, and no anatomy is stretched. Dividers are straight and the card carries no text or app logo. The native Android Sharesheet receives the image and the Play Store link.
- Shared media is written only to the app cache and exposed temporarily through a non-exported Android `FileProvider`; no storage permission, analytics or new network service was added.
- Each of the two daily reward items now requires one completed rewarded video instead of two. Rewards still depend on AdMob's earned-reward callback; cancelled, unavailable or failed videos grant nothing.
- Preserves the v1.0.10 native review flow, AndroidX compatibility correction and portrait guard-arc alignment.
- Cutting, clipper position and hit target, renderer, camera, customer flow, replay reward, interstitial cadence and graphics profile are unchanged.

## Verification

- Full Android runtime rebuild and JavaScript syntax checks passed.
- Focused share test confirms one image containing four renders sourced in front/right/back/left order, all using the exact finished hair state and composed in the selected back-hero layout. It also verifies the identical 16% top-clearance ratio across the hero and all three supporting portraits.
- Completion-screen visual QA passed at 390×844, 844×390, 800×1280 and 1280×800. The share control stays on the right and does not overlap rewarded replay, next customer or the finished customer.
- The generated 1080×1920 share image was visually inspected against the selected premium reference. All four angles are distinct, both profiles are complete, shoulders/cape are visible, the rear view exposes the neckline and automated lower-band checks confirm cape coverage in all four panels.
- Eight reward cases passed, including one-video daily items, earned/cancelled/failed outcomes and migration of prior credits.
- 85 graphics/input checks, 13 Android runtime browser cases, four privacy layouts, viewport checks and the review-trigger regression passed.
- Native unit tests, release lint and the signed release bundle completed successfully.
- Bundletool validation passed; `jarsigner` reports `jar verified`. The AAB includes the share runtime, `FileProvider` manifest entry and cache-path resource.
- The rebuilt renderer hash is unchanged from the released baseline.

On 27 October 2026, the obsolete rejected code 10 draft artifact was removed and this exact AAB was uploaded with the newly approved WorksBien upload key. Play Console accepted it as production version **12 (1.0.11)** without a signing or bundle validation error. A 100% rollout was saved and submitted; automated quick checks completed and Publishing overview confirmed **Changes in review**. A physical-device handoff to a third-party receiving app remains the final device-level share confirmation; the native intent, content URI, permissions and fallback path compile and package correctly.
