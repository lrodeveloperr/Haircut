# Production AdMob setup — 16 October 2026

## Authorized scope and plan

Complete production AdMob setup only. Signing/AAB and Play submission remain separate stages. Debug/testing must permanently use Google's test IDs. The owner-approved cutting renderer, clipper placement, camera, graphics, wardrobe geometry and reward rules remain frozen. The existing privacy shield remains a direct external website link.

1. Create the unpublished Android game in the approved AdMob account and its existing rewarded/next-customer placements.
2. Configure European and US-state privacy messages for this game, preserving other apps' messages. Check the live publisher file.
3. Expose Google's separately required ad-consent options only when UMP requests it, using spare wardrobe header space; preserve all existing controls' bounds and the direct policy link.
4. Verify affected code with test ads, then wire the public production identifiers to release builds only and record evidence.

## Console identifiers observed

- App: Barber Simulator: ASMR Haircut, Android, unpublished.
- App ID: `ca-app-pub-8054612600809568~2715928050`.
- `barber_rewarded`: `ca-app-pub-8054612600809568/6612520040`.
- `barber_next_customer`: `ca-app-pub-8054612600809568/5498748924`.
- Reward amount 1, item Video credit; video enabled, ad pods and interactive disabled. Google-optimised All prices; no partner bidding/mediation or SSV backend.
- Next-customer interstitial retains the approved game's scheduling; no new ad trigger is introduced.
- Live `https://worksbienstudios.com/app-ads.txt` returned HTTP 200 and `google.com, pub-8054612600809568, DIRECT, f08c47fec0942fa0`.

## Console work completed

- European message **Barber Android European Consent**: Published, English + all 31 additional supported languages. Consent, Do not consent and Manage options enabled; refusal enabled for all regions. This message selects only this game and its correct policy URL. Existing apps' messages were preserved.
- US-state message **Barber Android US Privacy**: Published, English (US), Spanish and Latin-American Spanish. Targets all current and future supported US states and offers the sale/sharing opt-out.
- Game-specific high-engagement ads: **Off**, saved and reopened to verify. This removes the additional closing steps/extended viewing-time setting; no exact ad duration is promised.
- Maximum ad content rating: **General Audiences**, inherited from the existing account. PG/T/MA ads are blocked. The SDK also requests G.
- App-ads.txt publisher line verified against the live HTTPS endpoint. Google's app-specific crawler/readiness verification is post-publication, not complete merely because the file is present.

## Release wiring and consent access

- Public app/unit IDs are tracked in `android/native/admob-production.properties`, separate from secret upload-signing material.
- Debug builds retain Google's public test app/rewarded/interstitial IDs and `.debug` package. Release build-config and manifest values come only from the production file; release tasks reject missing, malformed, test-publisher or duplicate unit IDs.
- The external policy shield and `android/privacy.js` remain unchanged. A separate Ad privacy choices button uses existing spare wardrobe header space only when UMP reports REQUIRED. It calls Google's native privacy-options form. The current requirement status is resent when the game becomes ready, covering consent callbacks that arrived before the web UI initialized.
- Opening the options form invalidates cached ads; generation checks ignore stale callbacks. Requests resume only when UMP permits them. Reward rules and all existing ad triggers remain unchanged.
- Candidate version is v1.0.7 (8). The previously delivered v1.0.6 (7) APK remains the earlier test-ad build.

## Publication boundary

Console configuration and the tested code integration in this revision are complete. On 16 October 2026 the owner explicitly approved pushing and merging these changes into `lrodeveloperr/Haircut`, resolving the earlier automatic approval rejection. The publication branch is `release/android-admob-production`; its pull request records the merge receipt. The last runtime/code change remains the locally verified v1.0.7 (8) candidate.

Signing/AAB and Play submission are still separate stages. Store linking and Google's app readiness review require publication and remain post-publication work. Never claim this unpublished game is approved for full ad serving.

## Verification

- Working Android build: PASS.
- Legacy/modern viewport normalization: PASS.
- Fixed graphics/input parity: 85 cases PASS.
- Android reward logic: 8 cases PASS.
- Shared domain/host/license contracts: 35 cases PASS.
- Four-layout browser privacy/consent access: PASS on 390×844, 844×390, 800×1280 and 1280×800. Actual game bundle checked conditional visibility, distinct dispatch, policy-button isolation, unchanged existing geometry, preserved haircut/pause and zero page errors. All four screenshots visually reviewed.
- Native debug build and Android lint: PASS, zero lint errors. Final Gradle run completed successfully in 29 seconds.
- Generated debug and release BuildConfig + merged manifests: PASS. Debug contains only Google test publisher/app/unit IDs and the `.debug` package; release contains only the observed production IDs and the canonical package. No release APK/AAB or live ad request was made.
- Actual Gradle negative checks: missing production values and Google test-publisher values both reject `generateReleaseBuildConfig` before generation. Production file restored after checks.
- Reports: `qa/results/android-admob-release-config-report.json` and `qa/results/android-browser-privacy-report.json` (local QA output, not committed binary artifacts).
- No live ads were requested, shown or clicked during testing. Production UMP-message rendering and physical-device consent behavior are not asserted from the local fixture tests.

## Audience boundary

The existing Play declaration remains 13–15, 16–17 and adults. No age screen or retargeting was introduced. G-rated ad content is not a substitute for applying under-age treatment when a user's under-age status is known. Final regional/age validation remains part of signed-release review.

## Primary references

- https://developers.google.com/admob/android/privacy — UMP consent gate and conditional privacy-options entry.
- https://support.google.com/admob/answer/9989980 — unpublished app setup and later store linking/readiness review.
- https://support.google.com/admob/answer/10114014 — European message choices and consent revocation.
