# Android release handoff — Barber Simulator: ASMR Haircut

Updated: 2026-10-27, America/Toronto. Read this file first when continuing Android work from another chat, editor or program.

## Unreleased working-tree update — 5 November 2026

The owner superseded the old Wardrobe-header location for privacy. The policy remains the same direct native
external-policy action, but it is now a readable row under text-based **Settings**; the conditional UMP ad-privacy
choice is grouped there too. Wardrobe layout and its frozen renderer remain unchanged. The current working code
still makes **Career** the large action and retains Freestyle under Modes. The owner has superseded that hierarchy
for the next implementation: Home must show **Quick Play** first using the existing pressure-free freestyle
behavior, **Career** as the second prominent named action, and no separate Freestyle tile under Modes. This latest
menu decision was documentation-only; see `../docs/MAIN-MENU-AND-MODE-ROUTING-CONTRACT.md`.

This update has passed the four-layout browser Settings/menu/privacy matrix but has **not** produced, signed,
uploaded or submitted a new release artifact. Historical sections below describe the artifacts that were actually
submitted at their dates and must not be read as a claim that this working tree is published.

## Submitted v1.0.11 share/reward release

The owner authorized the finished-haircut share flow and reducing each of the two daily reward items to one earned rewarded video. The signed candidate is **v1.0.11 (12)**; see [the complete artifact record](RELEASE-AAB-1.0.11.md). On the completion screen, an icon-only share control stays at the upper-right across phone/tablet portrait/landscape. It sends Android's native Sharesheet a 1080×1920 premium card rendered from the exact finished haircut, with a large direct-back hero above front/right/left supporting portraits, plus the Play Store link. Visible-subject cropping keeps the full haircut and cape in the composition without the former empty lower strip; dividers are straight and there is no card logo. Reward cancellation/failure behavior, replay reward and interstitial cadence are unchanged.

The candidate passed four-layout visual QA, focused four-angle composition checks, reward/graphics/runtime/privacy/review regressions, native unit tests, release lint, signing and bundletool validation. On 27 October 2026, Play Console accepted it as version **12 (1.0.11)** using the newly approved WorksBien upload key. The production release was saved at 100% rollout, submitted, passed the automated quick checks, and is now shown under **Changes in review**.

## Superseded v1.0.10 review-prompt candidate

The owner authorized adding Google Play's native review prompt and preparing the updated AAB. The signed candidate is **v1.0.10 (11)**; see [the complete artifact record](RELEASE-AAB-1.0.10.md). It adds no custom rating UI and changes no gameplay. New installs first become eligible after the third completed customer; existing updated players are eligible after their next newly completed customer. Requests are deferred across natural-break interstitials and other full-screen ad/privacy surfaces. Repeat requests require a newer app version, 60 days and five more completed customers, with a lifetime cap of three attempts.

The earlier rejected `Barber-Simulator-ASMR-Haircut-1.0.9-code10.aab` draft artifact was removed after owner confirmation. The newly approved Mimic Joy/WorksBien upload key was active, and Play accepted the exact code 12 artifact without a signing error. Release notes were added, the production preview showed no loss of supported devices, the 100% rollout was saved, and the owner-approved review submission completed successfully.

## Current release status

**Current release: v1.0.7 (8), submission accepted.** The owner explicitly approved replacement/resubmission at 17:41 New York time on 16 October 2026. The withdrawn build 9 release was discarded; its artifact remains in Console history. Original signed build 8 was selected from the existing artifact library, accepted, and marked Ready to release with no release validation error. All 21 changes were sent for review. At 2026-10-16T21:55:47Z, Publishing overview showed **Changes in review**, with automated quick checks still running and the notice that changes will proceed to review once checks complete. This is a submission acknowledgement, not a completed-check, approval or publication claim.

Original AdMob, two-video daily item unlocks, replay reward and natural-break interstitial rules are intact. No age prompt or blanket under-18 advertising block. Native/game code unchanged from restored source `04e72c2338fe13ea35bdaf156abc5ae56d707c21`. All ten descriptions verified live against the original source and saved; public policy rollback verified live. No rebuild, emulator run or live-ad test was needed.

**Owner approval rule:** Explain proposed code, monetization, audience/rating, metadata or release changes and material impacts before implementation, and obtain explicit approval. Do not repeat approval for the same concrete action already authorized. An audit is not authority to redesign monetization.

## Owner decisions and release order

- The owner tested v1.0.5 (6) on 16 October and approved the cutting and finger-to-blade distance as perfect. Freeze the approved cutting, clipper placement, camera, graphics, hair, controls and reward rules.
- The owner approved the privacy shield preview: one cream circular button immediately left of the wardrobe's existing close button, matching its diameter, centreline, dark outline and shadow. Use the header's existing flexible empty space. Do not move existing controls, change header/panel/card sizes, or add anything to the cutting or reveal screens.
- The privacy shield is a direct external link to the existing WorksBien policy page. No intermediate menu, bundled policy text, consent-form action or advertisement-specific behavior belongs to this button. Website policy edits do not require an APK update.
- **Document remaining work before changing the application.** This file is that record; update it with actual evidence after each completed stage.
- **Production AdMob is the last configuration step before the signed store build/submission.** Keep development, screenshots, emulator testing and owner testing on Google's test ad IDs. Never test by clicking live ads or replace debug IDs with live IDs.
- Current authorization includes finalizing privacy, implementing the approved icon, completing necessary release work, generating/signing the AAB, attaching it to the existing listing and submitting for review. Honor the test-first/live-AdMob-last order. Do not create a duplicate Play app.

## Repository and exact approved build

- Repository: https://github.com/lrodeveloperr/Haircut
- Production AdMob integration: [PR #9](https://github.com/lrodeveloperr/Haircut/pull/9) merged on 16 October 2026 at `fdbcdcf8214b254c2b67d9cc51e143bff148995e`; tested implementation head `a8154509cad8200df932cee952fe2dee554b12ea`. The remote tree matched the locally verified candidate exactly. No new GitHub workflow was triggered by this Android-only branch; the native build/lint, variant-ID and four-layout results above are local verification.
- Current source: `main`. Android CI branch: `build/android-current-apk`. PR https://github.com/lrodeveloperr/Haircut/pull/8 was merged after successful final verification (merge `c0c1ea1d5d285ffd1edc32b907044502cf9c756a`).
- Starting source for this finalization: `88f920b9cd369a4e69667b67fc29136250cb4e17`.
- Approved runtime source: `24bb0958d8627791321392f2e42a9814ddcd9784`; later changes through `9b467a55a78a562d517e91ab54ac3b7d07309770` are QA-only. See [expert sign-off](CLIPPER-PLACEMENT-REVIEW.md).
- Successful installed-APK workflow: https://github.com/lrodeveloperr/Haircut/actions/runs/38937815985
- Approved debug APK: v1.0.5, version code 6, 8,089,695 bytes, SHA-256 `26a9e418738ac4e2b44d02c623fac0618e6cc06bb7d31a3950157dc34ba7f01c`.
- Android native project: `android/native/`. Android build adaptation: `android/build-runtime.py`. Shared game source: `source/`.
- The native SDK/bridge and local saves already exist. Older README/build notes describing them as unimplemented are historical; this handoff and current source take precedence.

## Existing Play listing

- Developer: Worksbien Studios Inc.; developer ID `7097804603172918698`.
- App: Barber Simulator: ASMR Haircut; package `com.worksbien.barbersimulatorasmr`; app ID `4975100930006889688`.
- Existing dashboard: https://play.google.com/console/u/0/developers/7097804603172918698/app/4975100930006889688/app-dashboard
- Saved listing record: [PLAY-CONSOLE-STATUS.md](store-listing/PLAY-CONSOLE-STATUS.md).
- Already saved: ten localized listings, icon, feature graphic, four gameplay screenshots, contact/category/tags, ads declaration, reviewer access, content rating, target audience, privacy URL and Data safety. These are submitted and in review, not published approvals.
- Latest Publishing overview shows build 8 in **Changes in review** with automated quick checks still running; approval/publication pending.
- Declared audience includes ages 13–15, 16–17 and adults. Verify consent/advertising configuration against the declared audience and distribution regions; do not silently retarget the app.

## Privacy — current state and work

- Existing policy URL: https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/
- Deletion information: the same URL with `#delete-data`.
- Support: `info@worksbienstudios.com`.
- Website repository: `lrodeveloperr/Worksbien-website`; page: `public/apps/barber-simulator-asmr/privacy/index.html`. Main auto-deploys to Cloudflare Pages.
- Privacy policy and Data safety were previously prepared/published/saved for the approved AdMob-only release configuration. Reconcile the final native SDK and permissions with [PRIVACY-RELEASE-CONFIG.md](PRIVACY-RELEASE-CONFIG.md).
- Public policy verified live in the browser after the website update; both Cloudflare deployment checks succeeded. The earlier HTTP-checker 403 did not reproduce in the browser.
- Existing native dependencies: Google Mobile Ads `25.5.0`, UMP `4.0.0` and an explicit AndroidX Fragment `1.9.1` override for Play services' legacy transitive request; no mediation, Firebase Analytics, Crashlytics, sign-in or game backend.
- Game saves stay in private device storage and remain eligible for OS backup. The new advertising age-band preference alone is excluded from backup and device transfer.
- Adult consent checking and earned-reward callbacks remain unchanged from the approved baseline; unknown and under-18 players cannot initiate advertising consent or ad requests. The shield only opens the public policy URL. AdMob consent-message configuration and any separately required advertising privacy controls belong to the final AdMob stage, outside this button.

## Ordered remaining checklist

1. **Documentation first — DONE.** Handoff committed to GitHub as `1311141c1f7e1ec5e8a0f5e830332e0296f59aa4`; README link committed as `89f42e02429ffa19bcecb89ef5a9f6b9ff41cf6c`, before application changes.
2. **Finalize policy — DONE.** Existing SDK/local-save/backup/support/deletion disclosures match current source. Website commit `6db51090852492de51f1251c06ceb13d38fa430f` updates the direct shield-to-browser access instructions. Both Cloudflare deployments succeeded; the direct-link paragraph was verified on the live HTTPS page. No new data categories or store-disclosure changes were introduced.
3. **Approved privacy UI — DONE.** Android-only `android/privacy.js` adds the shield in flexible header space. One tap opens the policy URL in the external browser, with no menu or ad-related action. See [privacy QA evidence](PRIVACY-QA-2026-10-16.md).
4. **Test-ad verification — DONE FOR THIS PRIVACY UPDATE.** Full build, 85 graphics/input cases, 8 reward cases, 35 contracts and four-layout privacy geometry/dispatch/state checks passed locally. Cutting renderer, clipper helper and shared wardrobe source remain byte-identical to owner-approved hashes. Native compile/lint/signature and all four installed privacy/external-link checks passed. Source `591b3db` passed 27 native checks; its cached-test-ad fixture was then corrected without changing app code. Final focused source `bef3f313e41852ac447476a1222cf3cf9d2fc733` passed all 13 privacy/capture/lifecycle/save checks in https://github.com/lrodeveloperr/Haircut/actions/runs/38953250070. These runs together cover the original matrix and the added privacy path. Actual native wardrobe screenshots were visually reviewed on all four layouts. Keep all test builds on Google's public test IDs.
5. **Production AdMob — DONE IN THIS REVISION.** On 16 October the game was created in AdMob with rewarded and next-customer units; European (32 languages) and US-state (3 language variants) messages were published; the live publisher file matched; high-engagement ads were disabled and General Audiences filtering verified. Release-only IDs and a separate, conditionally required UMP-options control are integrated. The existing external policy shield remains unchanged. v1.0.7 (8) passed native compile/lint, generated debug/release ID checks, negative release-ID guards and four-layout browser verification. The owner explicitly approved pushing and merging on 16 October, resolving the earlier approval block. See [complete production setup and verification](ADMOB-RELEASE-SETUP.md). Debug remains test-only; signing and submission are next.
6. **Signing/AAB — DONE.** Current signed v1.0.8 (9) replaces draft-only v1.0.7 (8). Dedicated upload key unchanged and backed up privately; no secrets in git. Clean build/lint, strict signature, bundle/APK, permissions/production IDs and unchanged game-assets checks passed. See [current artifact record](RELEASE-AAB-1.0.8.md) and historical signing/restoration record [v1.0.7](RELEASE-AAB-1.0.7.md).
7. **Play submission — SUBMISSION ACCEPTED.** Owner approved restoration/resubmission. Original **1.0.7 (8)** replaces discarded build 9 release. Console accepted 21 changes, with automated quick checks running before the next review stage. All ten original descriptions saved; 177 country/region entries, original audience and ratings preserved. Approval/publication pending.
8. **After publication — PENDING.** Link the live store entry in AdMob, complete app-ads.txt verification and app readiness review, and record actual serving status. Account approval alone does not mean this new game is approved for full ad serving.

## Commands and evidence

```sh
TARGET=full bash source/buildall.sh
node android/tests/viewport.cjs
node android/tests/graphics.cjs
node android/tests/rewards.cjs
RELEASE_DIR=source/build-foundation node qa/contracts.cjs
node android/tests/bridge.cjs
cd android/native
./gradlew assembleDebug lintDebug
# Installed test APK, with Android SDK/emulator and Playwright available:
# node android/tests/apk.cjs  (run from repository root)
# Only after final verification and secure production configuration:
# ./gradlew bundleRelease
```

The existing CI workflow is `.github/workflows/android-apk.yml`. It builds a test-ad debug APK, runs the native phone/tablet matrix and retains its artifact/evidence. Prior 21 installed checks passed, including real Android WebView input, tablet windows 1600×2560 and 2560×1600, resize interruption, no-fill recovery and persisted save relaunch. These are emulator results; the owner separately approved cutting on their phone. Physical-tablet performance was not tested.

## Primary policy references

- In-app privacy policy link/text: https://support.google.com/googleplay/android-developer/answer/10144311
- UMP privacy-options entry point: https://developers.google.com/admob/android/privacy
- SDK disclosure: https://developers.google.com/admob/android/privacy/play-data-disclosure
- App verification/app-ads.txt: https://support.google.com/admob/answer/14538460
- App readiness after publication: https://support.google.com/admob/answer/10564477

## Change/evidence log

- 2026-10-16: Created this documentation before privacy/runtime changes. All pending items above remain explicitly pending. User approval covers the shield preview and cutting freeze; production AdMob remains deferred until test-ad verification is complete.
- 2026-10-16: Privacy policy finalization/deployment and local privacy layout checks completed. Native CI verification is next. Test-ad IDs remain unchanged. Older "not implemented" privacy notes above describe the starting audit; use the ordered checklist for current status.

- 2026-10-16, owner clarification: removed the intermediate privacy menu and all ad-specific additions associated with the button. Restored `AdsController.java` byte-for-byte to source `88f920b`. The approved shield links directly to the website; policy text stays there. Native direct-link verification: https://github.com/lrodeveloperr/Haircut/actions/runs/38950870866 (source `591b3db`): privacy checks passed on all four layouts. The corrected focused run `38953250070` is fully green; privacy/capture/lifecycle/save verification is complete.

- 2026-10-16: Final privacy verification completed at source `bef3f313e41852ac447476a1222cf3cf9d2fc733`. All 13 focused installed checks passed, including a real cached Google test ad opened/earned/closed and force-stop save restoration. Artifact `12070520546` was inspected once; all 11 expected native PNGs were retained, including four correctly rendered wardrobe views. Debug APK v1.0.6 (7), 8,090,935 bytes, SHA-256 `0bb5e31f9a037a820ae3ee6bde6fcbdf37e4d07a5a3ba433dce17e03ac558f1d`. This is a test-ad APK, not a signed production AAB.

- 2026-10-16: AdMob console setup completed and verified. Production app ID `ca-app-pub-8054612600809568~2715928050`, rewarded `ca-app-pub-8054612600809568/6612520040`, interstitial `ca-app-pub-8054612600809568/5498748924`. Local candidate v1.0.7 (8) preserves cutting and adds separately required UMP options in spare header space. Pushes were automatically rejected; source/documentation remain local pending explicit push authorization. No signing, AAB, Play upload or submission was performed.

- 2026-10-16, owner approval received: publishing and merging the tested production-AdMob revision is explicitly authorized. The earlier rejection is resolved. No additional runtime changes were made after local verification; signing/AAB, Play submission and post-publication serving review remain outstanding.

- 2026-10-16, publication verified: PR #9 is merged and `main` contains the production AdMob integration. The approval block is resolved. Stage 5 is complete; signing/AAB and submission remain pending. Debug retains Google test IDs.

- 2026-10-16, signed AAB completed: v1.0.7 (8), 5,188,387 bytes, SHA-256 `cecc1c906ec50e1d3ef03fc888f4bf53dea5af4844213080b3063bda65bcbfbd`. Dedicated upload key and private backup saved separately. Release build/lint, signature, bundle structure, generated APK signature, production IDs and unchanged game assets verified. No Play upload/submission performed.

- 2026-10-16, release submitted: full listing/policy audit corrected Advertising ID and AI artwork labels and found the teen-advertising consent gap. Neutral local age safeguard added in v1.0.8 (9), with gameplay freeze preserved. Native checks 11/11 and four layout captures verified; PR #10 merged. Signed build 9 replaces draft-only build 8. Google Console confirms all 21 changes in review after final quick checks. This latest entry supersedes historical pending statuses above.

- 2026-10-16, owner-directed correction: Removed the unapproved age gate and blanket advertising block. Restored native implementation, assets and tests to the pre-change baseline; preserved original two-video unlocks, consent, ad units and natural-break interstitial schedule. Build 9 withdrawn from review. Reusing verified original build 8 requires no new build/testing campaign. Future changes require prior owner approval. Replacement/resubmission is pending approval after automatic review rejected discarding the withdrawn release.

- 2026-10-16, approved replacement submitted: owner authorization received at 17:41 New York time. Discarded only withdrawn release 1.0.8 (9), selected existing 1.0.7 (8), and saved Ready to release. Restored/verified all ten full descriptions exactly and re-entered ten initial release-note languages. Submitted all 21 changes; Console acknowledges Changes in review while quick checks run. Prior automatic approval block is resolved. No application rebuild or new AdMob configuration.

- 2026-10-25, owner-authorized AndroidX/portrait-control candidate: Before editing, current `main` was compared with application source `1b28d3eec9f15371398284b0e3237a5540130a78`, the source recorded for submitted build 8. The complete `source` tree, native app tree and Android runtime/transport/privacy inputs have identical Git object hashes; only a later native README differs. The rebuilt Android renderer remains SHA-256 `d553e1a9109cbf79aae7d8f4b051e71c58244e4a729fcbdf953a4f26b62f590b`, exactly the build-8 renderer hash. The candidate makes only two product changes: it resolves Play services' transitive Fragment 1.1.0 request to Fragment 1.9.1 (and makes the already-resolved UMP 4.0.0 dependency explicit), and moves only the numbered guard arc 8 CSS px right in portrait. The clipper button, 3D clipper, landscape layout, renderer, cutting, camera rules, customer flow and ad/reward behavior are unchanged. Android API 36 captures verified compact portrait at 360×755 CSS px, tall portrait at 412×863, and an unchanged landscape control at 732×389; all retained the fixed High profile (30,000 strands, 8 segments, antialiasing). Full source build, viewport check, 85 graphics/input cases, 8 reward cases, 35 contracts, native debug compile and lint passed. Gradle dependency insight resolves Fragment 1.9.1. This remains an uncommitted debug/test-ID candidate awaiting owner visual approval; no release version bump, signed AAB, push or Play upload has been performed.

- 2026-10-25, owner-authorized review-prompt AAB: added Play Review 2.0.2 and the native review flow described above; version advanced to 1.0.10 (11). Clean release build/lint and unit/source/browser checks passed. Signed AAB is 5,268,611 bytes, SHA-256 `1e9f7d3c8139dde45bc1aeaca817aa2b28976b4740939c2366fde5f57119752d`, with unchanged renderer hash. Play Console confirms the new upload key becomes valid on 27 October 2026 at 08:38. Existing invalid code 10 draft remains untouched; code 11 upload is pending key activation.

- 2026-10-27, owner-authorized share/reward AAB submitted: added the native four-angle finished-haircut share card and upper-right completion control; changed each daily item from two rewarded videos to one while preserving earned-reward enforcement. Version advanced to 1.0.11 (12). The selected premium card uses a large direct-back hero above front/right/left portraits, shows the head/neck/shoulders/cape without an empty lower strip, uses straight dividers and contains no logo. All four angles now use the same 16% head-to-top clearance; the supporting row and panel widths adapt to the real subject proportions without stretching anatomy. All four completion layouts and the generated share card were visually inspected and passed proportional-spacing and pixel-level cape/contact checks. Signed AAB is 5,280,415 bytes, SHA-256 `6af6309e6becca8f22870cb786c65900828d97869cddbaa46680be8644ba8c44`; renderer hash remains unchanged. The obsolete invalid code 10 draft attachment was removed after explicit confirmation. Play accepted code 12 with the newly approved upload key, the 100% rollout was saved and submitted, automated quick checks completed successfully, and Publishing overview confirmed **Changes in review**.

- 2026-11-01, owner-authorized Samsung compatibility update — SUBMITTED: version 1.0.12 (13) changes only Android startup scheduling so the existing full-detail scene compiles in small, frame-separated GPU submissions before its first draw, with first-frame diagnostics. Three cold starts passed on a real Galaxy A36 5G running Android 16 with full detail visibly intact and no context loss, GPU out-of-memory event, native/Java crash or app ANR. Release unit tests, lint, signing and bundletool validation passed. Google Play accepted the exact signed AAB, retained every previously supported device, and saved the 100% production rollout with notes in all 19 configured locales. After the owner's final confirmation, Play displayed **1 change sent for review** and moved the production change to **Changes in review**; automated quick checks showed less than a minute remaining. Managed publishing is off, so the rollout proceeds automatically after approval. See [the complete artifact record](RELEASE-AAB-1.0.12.md).
- 2026-11-05, owner re-approved the frozen-source pins in `android/tests/privacy.cjs` for branch `feature/head-shapes-36`: renderer `source/build/runtime/game.js` SHA-256 `489f971e82774b6e882b64ead1120bfa50eff981579f7bd8f446d062cd466490` (Android patches 15–19 for the approved walk-in cuts, hair colours, hair upgrade, requests/undo, tools and services) and `source/customers/wardrobe.js` `b6b0cb1d438cb8da4f4a0ca754a27ca02e2df25cffd4811835608420ab0948e6` (award/tool hooks). `android/clipper-input.js` is unchanged (`231830bf…`). Clipper placement, controls, camera and privacy shield are unchanged. Re-pin whenever either file changes again, with owner approval.
- 2026-11-05, owner approved re-pinning the renderer pin for branch `feature/head-shapes-36` after patch20 added `skip()` (seats a fresh customer without finishing, scoring or an advertisement; used by the owner-approved game modes): `source/build/runtime/game.js` SHA-256 `20fa35d106d5de83e29f9adee055022203aa333d4c24f967028867c423992f01`. `source/customers/wardrobe.js` (`b6b0cb1d…`) and `android/clipper-input.js` (`231830bf…`) are unchanged. Clipper placement, controls, camera and privacy shield are unchanged.

- 2026-11-05, owner-authorized adaptive-graphics implementation candidate: the shared Sites/YouTube/Android renderer now selects Potato, Balanced, High or Ultra automatically. The protected floor is 12,000–14,000 scalp strands, five scalp/beard segments, 65% beard density, a normal-phone 0.9–1× buffer and 30 fps drawing with full-rate input; strongest-class devices receive the original 30,000-strand, eight-segment, full-beard, full-shader, MSAA and 2× Ultra ceiling. Runtime overload removes clippings, then pixels, then rendered strands before queuing exactly one tier change at a customer boundary. Context loss queues a safer tier and recovers without changing the 8,192-cell haircut state; an unclean boot starts one tier safer. Deterministic policy tests passed 8/8, Android graphics/input 150/150, Android host browser 13/13, rewards 8/8, domain/host/license contracts 35/35, and viewport compatibility passed. Seeded Potato and Ultra screenshots were visually inspected: both retain the same recognizable customer, hair/beard silhouette, skin, cape, lighting and camera; Ultra adds the intended density and edge quality. Native `assembleDebug lintDebug` passed; the local test-ID debug APK is 9.9 MB. A targeted Ultra browser run passed readiness, idle rendering, WebGL restoration, haircut/save/reload and pause/resume before the older broad suite reached a stale wardrobe selector from the newer menu work; that selector is not an adaptive-graphics failure but remains a general QA maintenance item. No Android device or emulator is connected, so weak-phone and flagship sustained physical testing remains an explicit publication gate under `docs/ADAPTIVE-GRAPHICS-AND-STABILITY-CONTRACT.md`. No release version bump, signed AAB, Git push, Play upload or submission was performed.
- 2026-11-05, adaptive candidate final local follow-up: current Android renderer SHA-256 is `bd68b869f04724b4abfd9dd3fbf8464d1a3b5fd2fbe141af7c24f49d8d55292c`; the unchanged wardrobe and clipper-input pins remain `b6b0cb1d…` and `231830bf…`. Four-layout privacy/control regression passed after the owner-authorized renderer re-pin. The strongest-device classifier now grants Ultra to a flagship GPU, eight-core CPU and full WebGL limits even when Android WebView omits its memory hint. Final debug APK rebuild succeeded. `adb devices -l` reported no connected targets, so installed weak/strong physical-device certification remains pending.
