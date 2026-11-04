# Android production bundle — v1.0.10 (11)

Built and verified on 25 October 2026 for the existing Play app `com.worksbien.barbersimulatorasmr`.

| Field | Verified value |
| --- | --- |
| Local filename | `android/native/app/build/outputs/bundle/release/app-release.aab` |
| Intended Play filename | `Barber-Simulator-ASMR-Haircut-1.0.10-code11.aab` |
| Version | 1.0.10, code 11 |
| Bytes | 5,268,611 |
| SHA-256 | `1e9f7d3c8139dde45bc1aeaca817aa2b28976b4740939c2366fde5f57119752d` |
| Package | `com.worksbien.barbersimulatorasmr` |
| Min / target API | 26 / 36 |
| Upload certificate SHA-256 | `80:21:E4:A8:4C:13:7A:36:34:B6:43:76:E1:F9:3A:1A:5D:45:E6:5D:E6:26:90:A3:8B:11:EF:30:D6:14:B2:FB` |
| Renderer SHA-256 | `d553e1a9109cbf79aae7d8f4b051e71c58244e4a729fcbdf953a4f26b62f590b` |

## Changes

- Adds Google Play's native in-app review flow at a positive, interruption-free moment after a completed customer.
- New installs first become eligible after the third completed customer. Existing updated players become eligible after their next newly completed customer.
- A request is deferred when a natural-break interstitial is pending or another full-screen ad/privacy surface is active.
- Google controls whether the review card is shown and suppresses ineligible or already-reviewed users. The app never infers whether a rating was submitted.
- Local retry policy requires a newer app version, at least 60 days, and at least five additional completed customers; maximum three attempts.
- Preserves the previously owner-approved AndroidX compatibility correction and portrait-only 8 CSS px right shift of the numbered guard arc.
- Cutting, clipper position and hit target, 3D renderer, camera, customers, rewards, ad cadence, graphics profile and landscape layout are unchanged.

## Verification

- Full source build passed; viewport, 85 graphics/input, 8 reward and 35 contract checks passed.
- Focused browser test confirms one native review signal for a newly completed reveal and no signal for a restored reveal.
- Native unit tests cover the third-customer threshold, existing-player path, ad deferral, cooldown/version/completion gates and attempt cap.
- Clean `testDebugUnitTest`, release bundle, release APK and release lint completed successfully.
- Signed APK verification passed with one signer. Production AdMob IDs are present and Google test IDs are absent from the release artifact.
- Extracted AAB game assets match the rebuilt source exactly. The renderer hash is unchanged from the released baseline.
- Cleartext traffic remains disabled. No native libraries, keystore or signing secret are bundled.

## Play Console state

The production draft still contains the earlier `Barber-Simulator-ASMR-Haircut-1.0.9-code10.aab` and shows validation errors. Play Console reports: **“Your new upload key is being processed and will become valid on 27 October 2026 at 08:38.”**

The v1.0.10 (11) AAB was therefore not uploaded on 25 October. Replacing the draft bundle before the key becomes valid would only create another invalid upload. After activation, remove code 10, upload this exact code 11 bundle, verify that Play accepts version 1.0.10 (11) with no signing or validation error, add release notes, and preview the release before submission.

