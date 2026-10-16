# Google Play Console setup status

Updated 16 October 2026, America/Toronto.

## Saved and verified in Play Console

- Developer: Worksbien Studios Inc.
- App: **Barber Simulator: ASMR Haircut**.
- Package: `com.worksbien.barbersimulatorasmr`; Play app ID `4975100930006889688`.
- Game; Free; default English (United States).
- App names, short descriptions and full descriptions saved as drafts in all ten locales: en-US, es-419, pt-BR, fr-FR, de-DE, ar, ja-JP, ko-KR, id, hi-IN.
- Original declarations saved: contains ads; unrestricted reviewer access; not government; no financial features; no health features; audience 13–15, 16–17, 18+.
- Category Game / Simulation; tags Casual, Hairdressers, Lifestyle simulation, Sandbox, Simulation.
- Contact: `info@worksbienstudios.com`, `https://worksbienstudios.com`; phone omitted.
- IARC completed after explicit owner approval of its terms. ESRB Everyone; PEGI 3; equivalent general-audience ratings elsewhere. Certificate ID displayed a dash when saved.
- **Privacy policy published and verified live**, and URL saved in Console: https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/
- **Data safety completed and saved**, with collection AND sharing declared for approximate location, app interactions, diagnostics and device/other IDs. All four: non-ephemeral, required collection, advertising/marketing + analytics + fraud/security/compliance purposes for collection and sharing.
- Encryption in transit = Yes; account creation and external-account login = None; deletion request mechanism = Yes, with public policy #delete-data anchor and studio email. No independent-security or payment badge claimed.
- Before the screenshot upload, Dashboard confirmed 10 of 11 setup tasks complete. After saving the completed listing, the setup card disappeared and the listing status visibly became **Ready to send for review**.
- **Approved app icon (512×512) and feature graphic (1024×500) uploaded and attached to the default English listing**, then saved as draft. Both image names were visible and Console confirmed **Your changes have been saved**. The existing MediaCube cover was resized/cropped only, with no added captions. Other listing languages inherit default graphics when localized media is absent.
- No Android binary uploaded, no release submitted or published. Saved declarations still await the eventual app review.

## Gameplay screenshots uploaded and saved

All four original screenshots from branch `ccr-16be693f-dnlovt`, commit `22d7b152e03f732773007eac69f74d94a99de33d`, were uploaded unchanged and attached to default en-US in this order:

1. `1-fade-clipper-back.png`
2. `2-skin-fade-side.png`
3. `3-buzz-clipper-top.png`
4. `4-beard-front.png`

Source directory: `android/store-listing/en-US/images/phoneScreenshots/`. Each file is an opaque RGB PNG, 1080×1920 (9:16), under 8 MB, with no captions. Local git blob hashes matched the source branch. The repo's capture README describes authentic full-detail gameplay states. The original cover remains separate icon/feature artwork.

The listing passed the Assets step, was saved from its Review step, and the reopened editor showed all four filenames in order, count 4/8, and **Ready to send for review**. Other languages inherit default graphics when localized graphics are absent. Optional video remains empty. No review submission or release was performed.

## Remaining release work

Implement, build, sign and validate the Android wrapper/AAB against the approved configuration below, then upload a release for testing. The saved store listing is complete; it is not a verified Android binary.

## Android release implementation boundary

The owner instructed completion of the privacy and Data safety setup before the native wrapper existed. The disclosures are now saved against the approved AdMob release configuration in [PRIVACY-RELEASE-CONFIG.md](../PRIVACY-RELEASE-CONFIG.md), using Google's current SDK data disclosure as the SDK baseline. This is **not evidence of an implemented, signed or runtime-verified Android app**.

Before uploading an AAB, implement and verify that configuration: local saves; no account/backend; AdMob with applicable UMP consent/privacy controls; TLS; no extra telemetry or mediation; no legacy Playables/Playgama host SDKs; an in-app privacy link. Any additional data flow requires updating the policy and Console answers. Advertising-ID declaration/manifest must be checked against the actual wrapper when created.

Daily wardrobe items remain two completed, optional, separately initiated rewarded videos per item. Preserve this existing Play app; do not create a duplicate.
