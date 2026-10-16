# Android release handoff — Barber Simulator: ASMR Haircut

Updated: 2026-10-16, America/Toronto. Read this file first when continuing Android work from another chat, editor or program.

## Current release status

**Current status — owner-requested rollback, 16 October 2026:** The unapproved age prompt and blanket under-18 ad block have been removed. Native implementation and native test workflow exactly match `9032cdf838cb01673c31ae29f6d82c692570c94d`. Build 9 was withdrawn from Google review and is now an unsubmitted release. The original signed **v1.0.7 (8)** is verified and available for restoration. No new build or emulator run was needed. Replacement/resubmission awaits explicit owner approval; automatic approval review blocked discarding the withdrawn release. Do not submit build 9. See [rollback record](ROLLBACK-AGE-GATE-2026-10-16.md).

**Owner approval rule:** Explain proposed code, monetization, audience/rating, metadata or release changes and their impact before implementing them. Obtain explicit owner approval. A policy audit is not authorization to redesign monetization or gameplay. The current exact rollback was explicitly requested; any additional change or resubmission needs approval.

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
- Live Publishing overview confirmed **Changes in review** on 16 October after submission and completed quick checks.
- Declared audience includes ages 13–15, 16–17 and adults. Verify consent/advertising configuration against the declared audience and distribution regions; do not silently retarget the app.

## Privacy — current state and work

- Existing policy URL: https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/
- Deletion information: the same URL with `#delete-data`.
- Support: `info@worksbienstudios.com`.
- Website repository: `lrodeveloperr/Worksbien-website`; page: `public/apps/barber-simulator-asmr/privacy/index.html`. Main auto-deploys to Cloudflare Pages.
- Privacy policy and Data safety were previously prepared/published/saved for the approved AdMob-only release configuration. Reconcile the final native SDK and permissions with [PRIVACY-RELEASE-CONFIG.md](PRIVACY-RELEASE-CONFIG.md).
- Public policy verified live in the browser after the website update; both Cloudflare deployment checks succeeded. The earlier HTTP-checker 403 did not reproduce in the browser.
- Existing native dependencies: Google Mobile Ads `25.5.0`, UMP `3.2.0`; no mediation, Firebase Analytics, Crashlytics, sign-in or game backend.
- Game saves stay in private device storage and remain eligible for OS backup. The new advertising age-band preference alone is excluded from backup and device transfer.
- Adult consent checking and earned-reward callbacks remain unchanged from the approved baseline; unknown and under-18 players cannot initiate advertising consent or ad requests. The shield only opens the public policy URL. AdMob consent-message configuration and any separately required advertising privacy controls belong to the final AdMob stage, outside this button.

## Ordered remaining checklist

1. **Documentation first — DONE.** Handoff committed to GitHub as `1311141c1f7e1ec5e8a0f5e830332e0296f59aa4`; README link committed as `89f42e02429ffa19bcecb89ef5a9f6b9ff41cf6c`, before application changes.
2. **Finalize policy — DONE.** Existing SDK/local-save/backup/support/deletion disclosures match current source. Website commit `6db51090852492de51f1251c06ceb13d38fa430f` updates the direct shield-to-browser access instructions. Both Cloudflare deployments succeeded; the direct-link paragraph was verified on the live HTTPS page. No new data categories or store-disclosure changes were introduced.
3. **Approved privacy UI — DONE.** Android-only `android/privacy.js` adds the shield in flexible header space. One tap opens the policy URL in the external browser, with no menu or ad-related action. See [privacy QA evidence](PRIVACY-QA-2026-10-16.md).
4. **Test-ad verification — DONE FOR THIS PRIVACY UPDATE.** Full build, 85 graphics/input cases, 8 reward cases, 35 contracts and four-layout privacy geometry/dispatch/state checks passed locally. Cutting renderer, clipper helper and shared wardrobe source remain byte-identical to owner-approved hashes. Native compile/lint/signature and all four installed privacy/external-link checks passed. Source `591b3db` passed 27 native checks; its cached-test-ad fixture was then corrected without changing app code. Final focused source `bef3f313e41852ac447476a1222cf3cf9d2fc733` passed all 13 privacy/capture/lifecycle/save checks in https://github.com/lrodeveloperr/Haircut/actions/runs/38953250070. These runs together cover the original matrix and the added privacy path. Actual native wardrobe screenshots were visually reviewed on all four layouts. Keep all test builds on Google's public test IDs.
5. **Production AdMob — DONE IN THIS REVISION.** On 16 October the game was created in AdMob with rewarded and next-customer units; European (32 languages) and US-state (3 language variants) messages were published; the live publisher file matched; high-engagement ads were disabled and General Audiences filtering verified. Release-only IDs and a separate, conditionally required UMP-options control are integrated. The existing external policy shield remains unchanged. v1.0.7 (8) passed native compile/lint, generated debug/release ID checks, negative release-ID guards and four-layout browser verification. The owner explicitly approved pushing and merging on 16 October, resolving the earlier approval block. See [complete production setup and verification](ADMOB-RELEASE-SETUP.md). Debug remains test-only; signing and submission are next.
6. **Signing/AAB — DONE.** Current signed v1.0.8 (9) replaces draft-only v1.0.7 (8). Dedicated upload key unchanged and backed up privately; no secrets in git. Clean build/lint, strict signature, bundle/APK, permissions/production IDs and unchanged game-assets checks passed. See [current artifact record](RELEASE-AAB-1.0.8.md) and historical signing/restoration record [v1.0.7](RELEASE-AAB-1.0.7.md).
7. **Play submission — WITHDRAWN.** Previous submission (historical): Existing app, production **1.0.8 (9)** only, 177 country/region entries excluding mainland China, ten listing/release-note languages. All 21 changes submitted. Final quick checks passed and **Changes in review** confirmed 2026-10-16T21:22:13Z. [Console](https://play.google.com/console/u/0/developers/7097804603172918698/app/4975100930006889688/publishing). Approval/publication pending.
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
