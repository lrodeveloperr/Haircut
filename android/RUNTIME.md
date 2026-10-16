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

`TARGET=full bash source/buildall.sh` selects `source/customers/detail-android.js` and applies `android/patch-graphics.py` and `android/patch-runtime.py` to the generated Android web runtime. The reward patch sets the existing catalog's requirement to two, updates the accessible reward label and applies the locked Android page title. It reuses the actual wardrobe's saving, ownership, progress and equip logic.

The default Playgama/Playables build and the direct YouTube builder do not call this adaptation. Shared source files and historical release ZIPs retain their existing naming and reward rule.

## Fixed Sites High graphics and touchscreen mapping

- Android always uses 30,000 scalp strands, eight scalp/beard segments, full beard density, full skin shading and requested MSAA. There is no Auto/Low selector or hardware classification; saved detail preferences and `?detail=low` cannot lower quality.
- The drawing buffer uses the same fixed High policy as Sites/YouTube: at most 2x pixel density and four million pixels, recomputed for actual canvas bounds on viewport/display changes. This replaces v1.0.1's unrestricted native density, which could unnecessarily multiply GPU work. Hair geometry, shading and antialiasing remain full High; slow frames never lower resolution or detail.
- Both former automatic quality controllers are disabled. Frame-time samples are diagnostic only and do not change rendering quality.
- Static scenes redraw on changes rather than continuously. Cutting, rotation, reveal and falling clippings still update each animation frame. This saves idle GPU work without removing detail.
- Touch uses the shared Sites/YouTube placement: the blade stays above the finger by `min(72 CSS pixels, 12% of canvas height)`, so its cutting edge remains visible. Mouse/pen retain their shared direct mapping. This restores the website's mapping instead of v1.0.1's blade-under-finger adjustment. Clipper placement and hair removal continue to use the same surface hit.
- Game saves, reward credits, hair lengths, brush dimensions and camera controls retain their existing rules.

`node android/tests/graphics.cjs` compares the actual Android graphics policy with the Sites/YouTube profile and the touch mapping with shared website code. It exercises portrait/landscape/large buffers, display-density changes, scalp/beard placement and twenty simulated minutes at each tested frame cadence. These are logic checks, not physical-device performance measurements. `node android/tests/bridge.cjs` additionally tests the fixed Sites pixel budget, saved/URL Low rejection, visible blade placement with trusted touch, rotation and context restoration against the real web game and Android bridge in Chromium.

## AdMob boundary

The native Android shell is in `android/native/` (debug APK compiled and checked; see its README and build record). The Android client's `showRewarded` promise must resolve `true` only from a verified earned-reward callback. Ad dismissal, loading, cancellation or an error must not resolve as an earned reward. The test APK does not claim live native AdMob delivery or a signed AAB.

## Verification

Run `node android/tests/rewards.cjs`. It exercises the actual catalog and wardrobe with the Android adaptation: first-credit persistence, second-credit unlock/equip, cancellation/error, reload, independent cape progress, duplicate-tap protection, UI badge count and isolation of the legacy one-video rule.
