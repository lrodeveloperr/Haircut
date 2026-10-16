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

## Fixed High graphics and direct cutting

- Android always uses 30,000 scalp strands, eight scalp/beard segments, full beard density, full skin shading and requested MSAA. There is no Auto/Low selector or hardware classification; saved detail preferences and `?detail=low` cannot lower quality.
- The drawing buffer follows the display's current native device pixel ratio, including density changes on resize. There is no application DPR cap, maximum-pixel downscaling or frame-driven resolution reduction. Hardware/WebView allocation limits remain outside application control.
- Both former automatic quality controllers are disabled. Frame-time samples are diagnostic only and do not change rendering quality.
- Static scenes redraw on changes rather than continuously. Cutting, rotation, reveal and falling clippings still update each animation frame. This saves idle GPU work without removing detail.
- Touch, pen and mouse cut at their reported client coordinates. The former upward touch adjustment (up to 72 CSS pixels) is removed from both the actual cutter and its proximity helper. Clipper placement and hair removal continue to use the same surface hit.
- Game saves, reward credits, hair lengths, brush dimensions and camera controls retain their existing rules.

`node android/tests/graphics.cjs` exercises exact generated-runtime functions across native DPRs, portrait/landscape/large buffers, display-density changes, direct scalp/beard contact and twenty simulated minutes at each tested frame cadence. These are logic checks, not physical-device performance measurements. `node android/tests/bridge.cjs` additionally tests native-density rendering, saved/URL Low rejection, trusted touch and rotation against the real web game and Android bridge in Chromium.

## AdMob boundary

The native Android shell is in `android/native/` (debug APK compiled and checked; see its README and build record). The Android client's `showRewarded` promise must resolve `true` only from a verified earned-reward callback. Ad dismissal, loading, cancellation or an error must not resolve as an earned reward. The test APK does not claim live native AdMob delivery or a signed AAB.

## Verification

Run `node android/tests/rewards.cjs`. It exercises the actual catalog and wardrobe with the Android adaptation: first-credit persistence, second-credit unlock/equip, cancellation/error, reload, independent cape progress, duplicate-tap protection, UI badge count and isolation of the legacy one-video rule.
