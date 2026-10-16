# Barber Simulator: ASMR Haircut — Android

This folder holds the Android / Google Play release work for **Barber Simulator: ASMR Haircut**.

Android English name: **LOCKED** (30 characters). See [naming, ASO and SEO](store-listing/NAMING-ASO-SEO.md), [canonical metadata](store-listing/metadata.json) and [prepared website SEO](store-listing/seo.json).

Google Play app record created: `com.worksbien.barbersimulatorasmr`. The English listing is saved as a draft. Six declarations are now saved: ads, app access, government, financial features, health and a 13+ target audience. Nine translations, category/contact settings, rating and privacy/SDK disclosures remain pending. See the [verified Console status](store-listing/PLAY-CONSOLE-STATUS.md). Use this package ID when building the Android wrapper.

## Current release direction

- Package the current validated game for Android, preserving its gameplay, graphics and controls.
- Position the release as a small-download ASMR barber / haircut game; measure the final Android download before publishing a numeric size claim.
- Use the locked English title **Barber Simulator: ASMR Haircut**. Supporting copy covers 3D freehand cutting, fades, barber shop gameplay and clipper sounds. Complete non-media listings for ten languages are in store-listing/.
- Daily clipper and cape unlocks require **two completed rewarded videos per item** on Android. The existing partial-credit UI and saved progress are reused. See [Android runtime adaptation](RUNTIME.md).
- Adapt platform services for Android, including AdMob and persistent saves.

## Historical v3.82 full-detail archive

The ZIP below is an older reference build. Select the current validated game build when Android packaging begins, so later reliability fixes are included.

- File: `asmr-barber-fade-master-v3.82-full-detail.zip`
- Size: 398,619 bytes
- SHA-256: `ca138d97b1f9b6b8ae5ad2f7400b3a4154c6a2ca91a0441763ffde2c507639a1`

### Historical build details

- Detail levels: Auto (default), Low and High. Auto checks the device when the game starts (memory,
  CPU cores, GPU) and switches to Low during play if frames stay slow. A detail button in the wardrobe
  header cycles Auto, Low and High, and the choice is saved. `?detail=low` or `?detail=high` in the
  page URL forces a level for testing.
- High detail: up to 2x resolution with anti-aliasing, 30k scalp strands with 8 segments each,
  full-density beards (8 segments), detailed skin (pores and follicles), and up to 4,000 falling
  clippings.
- Low detail matches the historical Playables v3.82 build.

The archived game content matches Playables v3.82 (customers, age-based walk-in styles, guard 0,
beards, trimming, clippings, wardrobe with daily picks, levels, streak). It is still packaged for
Playgama/YouTube using Playgama Bridge, rather than as an Android app.
