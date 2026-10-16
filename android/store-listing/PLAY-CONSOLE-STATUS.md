# Google Play Console setup status

Updated 16 October 2026, America/Toronto.

## Current review state

**Production v1.0.8 (9) and all 21 changes are in Google review**, confirmed 2026-10-16T21:22:13Z. Final quick checks completed successfully and Publishing overview states **Your changes are now in review**. Managed publishing off; full rollout follows approval. No approval/publication claim.

- [Verified Console](https://play.google.com/console/u/0/developers/7097804603172918698/app/4975100930006889688/publishing)
- [Complete policy/listing audit](../PLAY-RELEASE-AUDIT-2026-10-16.md)
- [Exact signed artifact and verification](../RELEASE-AAB-1.0.8.md)
- Release regions: 176 named countries excluding mainland China plus rest of world (177 entries). Ten locales and release-note languages.
- Advertising ID declaration completed; icon and feature artwork AI labels saved. Four actual gameplay screenshots retain non-AI status. Every description includes age/region ad availability.
- Privacy policy updated live for the neutral local age choice. Unknown and under-18 users cannot initiate UMP, explicit Mobile Ads initialization or ad requests. Core game available; all 11 native age/privacy checks passed across four layouts.

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

## Remaining release work

Google review and publication are pending. No further edits or resubmission are needed while this revision is in review. After publication, link the public listing in AdMob and complete app readiness; record actual serving status. Account approval does not mean this game is approved for full ad serving.

The final artifact matches [PRIVACY-RELEASE-CONFIG.md](../PRIVACY-RELEASE-CONFIG.md): local game saves, no account/backend, AdMob/UMP for eligible adults, TLS, no extra telemetry or mediation, no legacy host SDKs, and the unchanged direct external privacy shield. Advertising ID/manifest, all four SDK data categories and purposes were reviewed live against official Google documentation. The local age band never leaves the device and is excluded from backup/transfer. No live ad requests or clicks were used for testing.

Daily wardrobe items remain two completed, optional, separately initiated rewarded videos per item; ad availability varies by age and region. Preserve the existing app and the owner-approved renderer, controls and reward rules.
