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

Not submitted. Complete the correction and live declaration review before sending for review. Record the exact new artifact and verified result here.

## Verification scope

The existing Android APK workflow is a general native QA workflow, not a new storefront-capture lane. Its build/lint/toolchain steps are necessary to produce and validate this changed APK. The focused `[native-check] [age-check]` mode skips the unchanged browser suite and runs one emulator with four sequential age/layout cases from `android/tests/age-capture-manifest.json`; no signing secrets, production IDs, captions or store submission are used in CI. Smoke capture precedes expansion. Initial local lint found that the existing app name needed to be explicitly non-translatable once localized age strings were added; fixed without renaming the app. A stale incremental resource DEX caused a duplicate R class; clean rebuild removes generated intermediates.
