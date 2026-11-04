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

## Verification

Pending implementation, debug-ad verification and candidate build.
