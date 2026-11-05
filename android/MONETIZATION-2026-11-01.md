# Owner-directed Android monetization update

The owner requested a permanently reserved gameplay banner area, an interstitial at the end of every customer, high-engagement ads and mediation on 1 November 2026. This supersedes the older two-completion/60-second Android interstitial policy. The user confirmed they have only an AdMob publisher account.

Later clarification: leave rewarded advertisements exactly as they are; use a non-interactive safety gap between banner and gameplay; rapid Next input must not bypass the post-reveal interstitial. “Leaderboard” was a transcription error referring to this safety gap, not a request for player rankings. Mediation is explicitly deferred until AppLovin contacts the owner.

## Scope before implementation

- Reserve a separate native bottom strip for an adaptive banner, outside the WebView and away from controls. Keep its height stable during ad loading/no fill; recalculate on window-size changes. Preserve system/cutout insets and the current full-detail renderer/startup fixes.
  The native strip includes a 16dp non-interactive top spacer in addition to the adaptive ad height; no game control or game touch handler occupies either part of the strip.
- Attempt one interstitial when each new customer's reveal finishes, before Next is available. Remove the two-customer and 60-second gates and the separate Next-triggered ad. Do not replay an ad for an already-restored completed reveal. Wait only a bounded time for a missing preload, then release the completion screen on no fill/failure.
- Preserve voluntary rewarded items, earned-reward verification, local progress, privacy/consent and review/share features. Do not alter other platform targets.
- Keep debug/QA on Google's test ad IDs. Create a dedicated production banner unit. Do not run a production build to test advertisements.
- Enable Android high-engagement ads in AdMob. It was saved as On and verified in the app's settings.
- Mediation currently has only AdMob Network (407 authorised buyers); there are no external partner accounts connected. A genuine external-network integration remains dependent on partner onboarding, account identifiers/approval, matching SDK/adapter verification and applicable consent configuration. Do not describe the default AdMob group as newly completed external mediation.

## Material impact

The game area will be shorter by the reserved banner strip. Players finishing only one customer will now encounter a full-screen ad opportunity. AdMob high-engagement interstitials may require up to 12 seconds before skipping; rewarded inventory may require up to 60 seconds. More impressions are expected, but revenue and retention effects require measurement. No-fill/offline/consent restrictions can prevent an impression.

## Release boundary

The existing version 1.0.12 (13) was submitted for review earlier today. Prepare and verify a separate next-version candidate; this request does not require discarding that release or submitting another production rollout. Record exact verification and remaining mediation requirements before delivery.

## Banner implementation (5 November 2026)

- `MainActivity`: the WebView sits in a vertical column above a 16dp gap view that consumes every touch, then a banner slot. The slot is sized to the anchored adaptive banner's height for the current width before any ad loads, and keeps that height on no fill, failure and refresh. The system/cutout insets on the root are unchanged.
- `AdsController`: an `AdView` loads only after UMP allows ads and the SDK is initialized. It reloads when the banner size changes (rotation, folding, resize) and is torn down when consent changes. It pauses, resumes and is destroyed with the activity. Refresh follows the ad unit's refresh rate in the AdMob console.
- Landscape cap (owner decision, 4 November 2026): in landscape the anchored adaptive banner was about 64dp tall on a phone (about 80dp with the gap, a fifth of the screen), so any landscape window uses the standard 320×50dp banner instead. Portrait keeps the anchored adaptive banner.
- `build.gradle.kts`: debug uses Google's adaptive-banner test unit `ca-app-pub-3940256099942544/9214589741`. Release reads `admobBannerId` from `admob-production.properties`, and release tasks now require three distinct production unit IDs: rewarded, interstitial and banner.

## Verification

- Local: `compileDebugJavaWithJavac`, `testDebugUnitTest` and `lintDebug` pass with 0 lint errors.
- Local emulator (5 November 2026). The original `MonkeyPost_API36` emulator crash-looped on boot (`BOOTCLASSPATH is not defined`) because the Mac was low on disk. A clean `Barber_API36` emulator (Pixel 7, API 36, 3 GB data partition) was created for this app, and the debug build was run on it with test IDs only.
  - Phone portrait: the strip holds its height with no fill (network unavailable at first). Google's test banner then loaded in the same strip below the 16dp gap, and no game control overlaps it.
  - Phone landscape, before the cap: the strip resized to the landscape adaptive height (about 80dp including the gap, about a fifth of a 412dp-tall screen). The cap above replaced this.
  - Phone landscape, with the cap (4 November 2026): after rotating from portrait, the banner reloaded at 320×50dp and Google's test banner filled it, centred. The native strip is 65dp including the gap (about 16% of a 411dp-tall screen), down from about 80dp.
  - Screenshots are in `qa/results/banner-phone-*.png` (`banner-phone-landscape-capped.png` for the cap).
- Local installed-APK test (`android/tests/apk.cjs`, 4 November 2026, same emulator, test IDs only): all 29 checks pass, covering phone and tablet portrait and landscape, live resizes to 1600×2560 and 2560×1600, background and resume, offline test ad, and disk save after force-stop. The menu opened on the first native tap in every layout. Two local-only setup steps were needed: Chrome's first-run screen was turned off on the emulator (it hid the privacy link), and adb ran as a persistent server.
- Not yet checked: a test banner loaded on a tablet-sized window.
- Live ads were not requested.
