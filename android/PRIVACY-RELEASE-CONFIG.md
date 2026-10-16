# Android privacy and Data safety release configuration

Date: 2026-10-16. Package: `com.worksbien.barbersimulatorasmr`.

This is the release configuration used to prepare the unreleased app's Play Console disclosures. The native wrapper, SDK bridge, private saves and initial UMP consent flow are implemented. The approved wardrobe shield linking directly to the external policy page was added for v1.0.6; native verification passed and is recorded in [privacy QA](PRIVACY-QA-2026-10-16.md). Production AdMob configuration, upload signing and the AAB remain separate release steps. Read the current [release handoff](RELEASE-HANDOFF.md) before continuing; the eventual AAB must conform to these disclosures.

## Approved release data boundary

- Device-local saves only: current haircut/customer, progression, wardrobe ownership, daily item partial credits, streaks, audio and other preferences.
- No developer account, sign-in, backend, cloud saves, uploads, user chat, camera, microphone, precise location or personal media access.
- Google AdMob / Google Mobile Ads SDK is the only advertising SDK; use Google's UMP for applicable consent/privacy options. No third-party mediation adapters, Firebase Analytics, Crashlytics, Play Games accounts, cloud storage or separate developer telemetry without revisiting the disclosures.
- Use the documented Google Mobile Ads SDK Legacy 25.5.0 baseline or re-audit a different version. Google's current disclosure on 2026-10-16 names that version.
- Ad requests/preloading only after UMP indicates ads may be requested; expose privacy options when required. Consent refusal must not be treated as permission for personalized ads.
- Google advertising IDs/app set IDs may be used. Do not claim collection is optional globally merely because rewarded viewing is optional or personalized ads may be refused.
- Use TLS for all transmitted user data and HTTPS for public policy/support links; disable cleartext traffic in the Android wrapper.
- The Android build must remove Playgama, YouTube, CrazyGames and other web host services rather than shipping their SDKs alongside AdMob. Bind persistence to local app storage and rewarded callbacks to verified earned rewards.
- Expose the public privacy URL within the app as well as the store listing.
- In-app route: wardrobe hanger → privacy shield beside Close → public policy page in the external browser. No intermediate menu or bundled policy. The shield consumes existing flexible header space, preserving existing control/card geometry. It does not request ads, change consent or invoke ad-specific rules. Final AdMob consent configuration is separate.
- Android backup/device-transfer behavior must be checked. The policy does not promise disabled OS backups.

## Public policy

https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/

Deletion-request page:
https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/#delete-data

Support: info@worksbienstudios.com. No game account exists. The deletion route accepts requests concerning personal information WorksBien actually holds, such as support correspondence. It explains local storage deletion and Google's separate process without promising WorksBien can erase Google's independent records.

## Intended Console mapping

Data collected/shared = Yes. Encryption in transit = Yes. Account creation/login = None. Deletion request mechanism = Yes, policy anchor above. No independent security-review or payment badge.

| Play type | Collection and sharing | Purpose | Handling |
| --- | --- | --- | --- |
| Approximate location | Collected and shared via IP-derived location | Advertising or marketing; Analytics; Fraud prevention, security and compliance | Not ephemeral; required where ad SDK operates |
| App interactions | Collected and shared | Same three SDK purposes | Not ephemeral; required |
| Diagnostics | Collected and shared | Same three SDK purposes | Not ephemeral; required |
| Device or other IDs | Collected and shared | Same three SDK purposes | Not ephemeral; required; advertising ID separately user-resettable/deletable |

No name/email, contacts, recordings, photos, precise location or local haircut saves are sent by the game. Email support uses an external email app; correspondence and website logs are explained in the policy. Additional SDK features would need a new assessment.

## Source evidence

- Google Mobile Ads SDK: https://developers.google.com/admob/android/privacy/play-data-disclosure (reviewed 2026-10-16; page last updated 2026-10-15; SDK Legacy 25.5.0; IP address, product interactions, diagnostics, device/account identifiers; advertising, analytics, fraud prevention; TLS).
- Google Play definitions: https://support.google.com/googleplay/android-developer/answer/10787469 (optional requires all users can opt out of that data collection; a contact email can be a deletion-request mechanism).
- Game source reviewed: source/storage.js, android/RUNTIME.md, android/README.md and repository tree.
- Public static page: lrodeveloperr/Worksbien-website, public/apps/barber-simulator-asmr/privacy/index.html. Main auto-deploys; live page verified.
- Direct-link policy access instructions: website commit `6db51090852492de51f1251c06ceb13d38fa430f`; both Cloudflare deployments and the live HTTPS direct-link instructions were verified on 2026-10-16. Advertising SDK/data categories remain unchanged.
