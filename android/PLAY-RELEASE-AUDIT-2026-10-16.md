# Google Play release audit — 16 October 2026

The owner authorized a full Google policy/listing review and submission. This is a readiness review, not a guarantee of Google approval.

## Evidence and findings before further code changes

- Existing app/package verified in Play Console; no duplicate created.
- Signed v1.0.7 (8) uploaded and parsed successfully; target API 36, estimated Play download 2.77 MB. Production draft created with release notes in all ten listing languages.
- All ten saved title/short/full descriptions inspected live and checked against source. Actual gameplay screenshots, icon and feature graphic remain attached. No ranking, price, size, ad-free or unsupported feature claims found.
- Advertising ID declaration was missing. Saved Yes with advertising/marketing, analytics and fraud/security/compliance, matching AdMob and the final AD_ID manifest permission.
- Country availability saved for 177 countries/regions, excluding mainland China; publication remains pending.
- **Blocking finding:** audience includes 13–15 and 16–17, while UMP is invoked without an age determination. A general-audience creative filter does not establish under-age consent treatment. Do not submit v1.0.7 as the final release.

## Required correction

Preserve gameplay, cutting geometry, wardrobe controls and earned-reward rules. Add a neutral native age-group choice before advertising/consent can start. Unknown and under-18 players receive no advertising SDK initialization, consent request or ad requests. Adults retain UMP and existing ads. Save only an age band locally; do not collect a birth date or send the band to a server. Exclude that preference from OS cloud backups and device transfer, while preserving game-save backup eligibility. Core gameplay stays available. Optional ad availability can vary. Rebuild with a new version code, validate, replace the production draft bundle, and reconcile the public privacy policy before submission.

## Official references reviewed

- https://support.google.com/googleplay/android-developer/answer/9898842
- https://support.google.com/googleplay/android-developer/answer/9857753
- https://support.google.com/googleplay/android-developer/answer/10144311
- https://support.google.com/googleplay/android-developer/answer/9867159
- https://support.google.com/googleplay/android-developer/answer/11926878
- https://developers.google.com/admob/android/privacy/play-data-disclosure
- https://developers.google.com/admob/android/privacy/gdpr
- https://developers.google.com/admob/android/targeting
- https://support.google.com/admob/answer/7313578

## Submission status

**Submitted to Google review.** At 2026-10-16T21:22:13Z, Publishing overview explicitly showed **Changes in review** and **Your changes are now in review** after the final quick checks completed. All 21 changes include production **1.0.8 (9)**, ten localized listings and their declarations. Managed publishing is off; full rollout follows Google approval. This is not an approval or publication claim.

Verified Console URL: https://play.google.com/console/u/0/developers/7097804603172918698/app/4975100930006889688/publishing

Exact AAB, source and signature: [RELEASE-AAB-1.0.8.md](RELEASE-AAB-1.0.8.md). PR #10 merged at `9d371552d05ff97a96d423bc3bf65b2f910b5cab`.

## Completed listing and declaration review

| Area | Evidence / result |
| --- | --- |
| Identity and metadata | Existing package, studio, app title and category match. Thirty localized fields inspected. Titles within 30, short descriptions within 80 and full descriptions within 4,000 characters; NFC and canonical-file checks pass. No rank, award, review, price, exact-size, medical, ad-free or unsupported-feature claims. |
| Product truthfulness | Freehand cuts, guard lengths, 360-degree rotation, clipper audio, generated customer variety, capes and clippers are supported by the frozen game. Two optional, separately initiated completed videos per daily item remain disclosed in all ten languages. Added age/region ad availability in every description. |
| Visuals and AI labels | Approved 512×512 icon, 1024×500 feature graphic and four authentic 1080×1920 gameplay PNGs remain attached. No added captions, ratings, ranking marks, misleading UI, unrelated brands, celebrity likeness or inappropriate imagery identified. Saved AI-created/edited labels for icon and feature artwork only; screenshots remain actual game captures. |
| Privacy | HTTPS page reopened live after website commit `a76ba0e85dda0ae11e485d060f6eed9bdf69859c`. Correct studio, package, support, local saves, AdMob/UMP, categories, purposes, recipients, retention, backup, rights and deletion routes disclosed. The new local age-band/ad eligibility paragraph is visible. Existing direct in-app policy shield is unchanged. |
| Data safety | All four SDK categories are collected AND shared: approximate location, app interactions, diagnostics, device/other IDs. Every category's purposes match advertising/marketing, analytics and fraud/security/compliance. TLS, no accounts/external login, deletion page and absence of unsupported security/payment badges verified live. Local age bands add no off-device data type. |
| Advertising ID | Missing declaration corrected to Yes with the three SDK purposes. Actual signed artifact contains AD_ID, as Console also detected. No persistent-identifier linking or developer advertising profile added. |
| Audience and ratings | Existing 13–15, 16–17, 18+ audience preserved. Neutral native age choice blocks advertising/UMP for unknown and under-18 users. IARC is Completed, category Game; ESRB Everyone, PEGI 3 and equivalent local ratings shown. Content remains nonviolent, without gambling, sexual content, user chat or uploads. Certificate ID still displays a dash in Console; no certificate was invented. |
| Ads and rewards | Contains ads Yes. AdMob G creative ceiling and high-engagement ads off were configured previously. Adult UMP comes before canRequestAds, with conditional separate privacy options. Reward callbacks alone credit completion; no monetary/transferable reward or ad-click incentive. Existing next-customer natural-break interstitial scheduling and no mid-cut ads preserved. |
| Access, contacts and declarations | No login, payment or special reviewer credentials; core gameplay available. Studio support email and website verified. Government, financial and health declarations accurately No. No IAP/subscriptions, external purchase links, UGC, health data, camera/microphone capture or real-money game feature. |
| Software and permissions | Clean debug/release build/lint, signing and bundle checks pass. API 36 accepted by Console; no native libraries. Final permissions and SDKs unchanged from the audited AdMob configuration. No additional sensitive permission or host-platform SDK. |
| Production draft | v1.0.8 (9) accepted, measured download 2.77 MB, ten release-note languages, 177 country/region entries excluding mainland China. Superseded v1.0.7 removed from the release. Preview Ready to release with no validation error; saved to Publishing overview. All 21 changes submitted; final quick checks completed and Console confirms Changes in review. |

This audit covers applicable policies and consistency supported by source, artifact and live Console evidence. It does not guarantee Google approval or claim that live advertising was exercised. AdMob store linking/app readiness follows publication.

## Verification scope

The existing Android APK workflow is a general native QA workflow, not a new storefront-capture lane. Its build/lint/toolchain steps are necessary to produce and validate this changed APK. The focused `[native-check] [age-check]` mode skips the unchanged browser suite and runs one emulator with four sequential age/layout cases from `android/tests/age-capture-manifest.json`; no signing secrets, production IDs, captions or store submission are used in CI. Smoke capture precedes expansion. Initial local lint found that the existing app name needed to be explicitly non-translatable once localized age strings were added; fixed without renaming the app. A stale incremental resource DEX caused a duplicate R class; clean rebuild removes generated intermediates.


## Final installed-device evidence

All **11 native checks passed** across 1080×1920 phone portrait, 1920×1080 phone landscape, 1600×2560 tablet portrait and 2560×1600 tablet landscape. The neutral choice has no preselection, Continue requires a choice, all four bands save locally and survive relaunch, and the three under-18 bands retain the bundled core game while actual native rewarded requests fail without earning a reward. Four raw screenshots were validated and visually inspected; all controls are readable and unclipped.

Six phone checks and three valid raw images were preserved from [partial run 38967133699](https://github.com/lrodeveloperr/Haircut/actions/runs/38967133699). A bounded UI-hierarchy recovery and focused tablet follow-up completed the remaining five checks and one raw in [successful run 38967888876](https://github.com/lrodeveloperr/Haircut/actions/runs/38967888876). No application/game source changed between the signed build source `bb81bc267d2b1ef4f91db10e41ef69f9510928da` and final test source `6bd8679521024ae9d47133ce19e0a0d7cca96f2e`. Test fixes did not weaken assertions. See [combined evidence](qa/age-gate-2026-10-16.json) and [capture issue ledger](../docs/screenshot-capture-issues.md). Adult live ad serving was not exercised.
