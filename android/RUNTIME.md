# Android runtime policy

Android name: **Barber Simulator: ASMR Haircut**.

## Daily wardrobe unlocks

- Each daily clipper design or cape requires **two completed rewarded videos**.
- Each video is a separate optional, player-initiated request. Completing the first does not automatically start another ad.
- The first earned reward saves 1/2 progress and keeps the item locked. The second unlocks and equips that item.
- Cancelling an ad, no fill or an error gives no credit and retains an already earned first credit.
- The existing two-icon badge shows progress; the accessibility label states the remaining number of videos.
- Clipper and cape progress are separate. Unlocking both daily items therefore requires four completed videos in total.
- Existing owned items remain owned. Daily offers and unfinished progress retain the existing midnight rotation rules.
- Replay rewards retain their existing separate policy.

## Build integration

`TARGET=full bash source/buildall.sh` builds the complete working YouTube/Sites engine, then `android/build-runtime.py` adapts only native services and Android reward/title policy, preserving the original YouTube input mapping. Shader preparation, first-frame readiness, model construction, camera, resize and context recovery are the same engine code used by the working web build. The generated engine is checked byte-for-byte against that web engine with no input substitutions.

`android/native-transport.js` sends asynchronous requests to the native private-storage worker. Successful save acknowledgements are delivered only after disk commit. Existing flat game-key saves are migrated into the same versioned envelope used by the working web client. Native AdMob earned callbacks remain the only reward source. The reward patch retains two completed videos per daily item and the locked Android title.
The default Playgama/Playables build and the direct YouTube builder do not call this adaptation. Shared source files and historical release ZIPs retain their existing naming and reward rule.

## Fixed Sites High graphics and exact YouTube touchscreen mapping

- Android always uses 30,000 scalp strands, eight scalp/beard segments, full beard density, full skin shading and requested MSAA. There is no Auto/Low selector or hardware classification; saved detail preferences and `?detail=low` cannot lower quality.
- The drawing buffer uses the same fixed High policy as Sites/YouTube: at most 2x pixel density and four million pixels, recomputed for actual canvas bounds on viewport/display changes. This replaces v1.0.1's unrestricted native density, which could unnecessarily multiply GPU work. Hair geometry, shading and antialiasing remain full High; slow frames never lower resolution or detail.
- Both former automatic quality controllers are disabled. Frame-time samples are diagnostic only and do not change rendering quality.
- Static scenes redraw on changes rather than continuously. Cutting, rotation, reveal and falling clippings still update each animation frame. This saves idle GPU work without removing detail.
- Touch uses the exact YouTube formula: the blade and cutter target are `min(72 CSS pixels, 12% of canvas height)` above the finger. Portrait and tablet screens normally use 72px; short landscape screens use a smaller gap. This restores cutting-edge visibility after v1.0.3's 18–28px gap proved too small in physical-device use. Mouse and pen remain direct, with no offset. Both hit testing and hair removal use the unmodified YouTube engine code.
- Game saves, reward credits, hair lengths, brush dimensions and camera controls retain their existing rules.

`node android/tests/graphics.cjs` checks complete engine parity and the fixed High graphics profile, viewport/density changes, scalp/beard aim and twenty simulated minutes at each tested frame cadence. `node android/tests/bridge.cjs` exercises the actual web bundle with an asynchronous native-host fixture, including delayed/failed save acknowledgements, rewards, four phone/tablet layouts and context restoration.

`node android/tests/apk.cjs` installs the compiled APK and connects to its real Android WebView. It sends native ADB swipes in phone/tablet portrait/landscape windows, checks reachable controls and fixed High drawing buffers, backgrounds/resumes the activity, verifies no-fill recovery, and force-stops/relaunches to prove private disk persistence. JSON, logcat and real device screenshots are retained with the APK artifact. Emulator checks verify behavior, not frame rate on a physical phone or tablet.
## AdMob boundary

The native Android shell is in `android/native/` (debug APK compiled and checked; see its README and build record). The Android client's `showRewarded` promise must resolve `true` only from a verified earned-reward callback. Ad dismissal, loading, cancellation or an error must not resolve as an earned reward. The test APK does not claim live native AdMob delivery or a signed AAB.

## Verification

Run `node android/tests/rewards.cjs`. It exercises the actual catalog and wardrobe with the Android adaptation: first-credit persistence, second-credit unlock/equip, cancellation/error, reload, independent cape progress, duplicate-tap protection, UI badge count and isolation of the legacy one-video rule.
