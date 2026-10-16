# Google Play Console setup status

Updated 16 October 2026, America/Toronto.

## Current rollback state

**Build 9 has been withdrawn from review** at the owner’s instruction. Console confirms **Changes not yet submitted for review** and release 1.0.8 (9) **Not yet sent for review**. It has not been published.

The native age question and blanket under-18 advertising block are removed in source. Original signed v1.0.7 (8) is intact, verified and available for reuse. No rebuild or emulator run was needed. Restoring the Console release and resubmitting requires explicit owner approval: automatic approval review rejected Discard release, and Manage artifact returned an unexpected Console error.

The existing Advertising ID and AI artwork declarations remain. Original full descriptions are restored in the repository; live removal of the added age/region sentence is pending approval with the replacement submission. Existing ratings remain ESRB Everyone / PEGI 3; declared target audience remains 13+. [Rollback record](../ROLLBACK-AGE-GATE-2026-10-16.md).

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
