# Google Play Console setup status

Updated 16 October 2026, America/Toronto.

## Current release state

**Current release: v1.0.7 (8), submission accepted.** The owner explicitly approved replacement/resubmission at 17:41 New York time on 16 October 2026. The withdrawn build 9 release was discarded; its artifact remains in Console history. Original signed build 8 was selected from the existing artifact library, accepted, and marked Ready to release with no release validation error. All 21 changes were sent for review. At 2026-10-16T21:55:47Z, Publishing overview showed **Changes in review**, with automated quick checks still running and the notice that changes will proceed to review once checks complete. This is a submission acknowledgement, not a completed-check, approval or publication claim.

- Existing bundle **8 (1.0.7)** only in the replacement production release; measured new-install download **2.77 MB**, API 26+ / target 36. No version-code increase or rebuild needed.
- All ten full descriptions restored exactly, verified in the live editor against repository source, and saved. Thirty canonical source fields pass the listing validator.
- Ten initial release-note languages saved. Original regions, full rollout after approval, ratings, target audience and ads preserved.
- Advertising ID and icon/feature AI labels retained. Four authentic gameplay screenshots and all approved media unchanged.
- Public privacy page reopened live after rollback deployment: no age-band paragraph or under-18 ad-block claim.
- ESRB Everyone / PEGI 3; audience 13–15, 16–17 and adults. No age/rating change performed.

Verified Console: https://play.google.com/console/u/0/developers/7097804603172918698/app/4975100930006889688/publishing

[Exact artifact](../RELEASE-AAB-1.0.7.md) · [Rollback and owner approval](../ROLLBACK-AGE-GATE-2026-10-16.md).

## Historical saved/submitted state

## Saved and verified in Play Console

- Developer: Worksbien Studios Inc.
- App: **Barber Simulator: ASMR Haircut**.
- Package: `com.worksbien.barbersimulatorasmr`; Play app ID `4975100930006889688`.
- Game; Free; default English (United States).
- App names, short descriptions and full descriptions submitted in all ten locales: en-US, es-419, pt-BR, fr-FR, de-DE, ar, ja-JP, ko-KR, id, hi-IN.
- Original declarations saved: contains ads; unrestricted reviewer access; not government; no financial features; no health features; audience 13–15, 16–17, 18+.
- Category Game / Simulation; tags Casual, Hairdressers, Lifestyle simulation, Sandbox, Simulation.
- Contact: `info@worksbienstudios.com`, `https://worksbienstudios.com`; phone omitted.
- IARC completed after explicit owner approval of its terms. ESRB Everyone; PEGI 3; equivalent general-audience ratings elsewhere. Certificate ID displayed a dash when saved.
- **Privacy policy published and verified live**, and URL saved in Console: https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/
- **Data safety completed and saved**, with collection AND sharing declared for approximate location, app interactions, diagnostics and device/other IDs. All four: non-ephemeral, required collection, advertising/marketing + analytics + fraud/security/compliance purposes for collection and sharing.
- Encryption in transit = Yes; account creation and external-account login = None; deletion request mechanism = Yes, with public policy #delete-data anchor and studio email. No independent-security or payment badge claimed.
- Before the screenshot upload, Dashboard confirmed 10 of 11 setup tasks complete. After saving the completed listing, the setup card disappeared and the listing status visibly became **Ready to send for review**.
- **Approved app icon (512×512) and feature graphic (1024×500) uploaded and attached to the default English listing**, then saved as draft. Both image names were visible and Console confirmed **Your changes have been saved**. The existing MediaCube cover was resized/cropped only, with no added captions. Other listing languages inherit default graphics when localized media is absent.
- Signed v1.0.8 (9) uploaded, accepted and submitted for production review. v1.0.7 was removed from the draft before submission. Publication remains pending.

## Gameplay screenshots uploaded and saved

All four original screenshots from branch `ccr-16be693f-dnlovt`, commit `22d7b152e03f732773007eac69f74d94a99de33d`, were uploaded unchanged and attached to default en-US in this order:

1. `1-fade-clipper-back.png`
2. `2-skin-fade-side.png`
3. `3-buzz-clipper-top.png`
4. `4-beard-front.png`

Source directory: `android/store-listing/en-US/images/phoneScreenshots/`. Each file is an opaque RGB PNG, 1080×1920 (9:16), under 8 MB, with no captions. Local git blob hashes matched the source branch. The repo's capture README describes authentic full-detail gameplay states. The original cover remains separate icon/feature artwork.

The listing passed the Assets step, was saved from its Review step, and the reopened editor showed all four filenames in order, count 4/8, and **Ready to send for review**. Other languages inherit default graphics when localized graphics are absent. Optional video remains empty. These assets are now part of the submitted listing.

## Historical remaining release work

Google review and publication are pending. No further edits or resubmission are needed while this revision is in review. After publication, link the public listing in AdMob and complete app readiness; record actual serving status. Account approval does not mean this game is approved for full ad serving.

The final artifact matches [PRIVACY-RELEASE-CONFIG.md](../PRIVACY-RELEASE-CONFIG.md): local game saves, no account/backend, AdMob/UMP for eligible adults, TLS, no extra telemetry or mediation, no legacy host SDKs, and the unchanged direct external privacy shield. Advertising ID/manifest, all four SDK data categories and purposes were reviewed live against official Google documentation. The local age band never leaves the device and is excluded from backup/transfer. No live ad requests or clicks were used for testing.

Daily wardrobe items remain two completed, optional, separately initiated rewarded videos per item; ad availability varies by age and region. Preserve the existing app and the owner-approved renderer, controls and reward rules.
