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

`TARGET=full bash source/buildall.sh` applies `android/patch-runtime.py` to the generated Android web runtime. The patch sets the existing catalog's requirement to two, updates the accessible reward label and applies the locked Android page title. It reuses the actual wardrobe's saving, ownership, progress and equip logic.

The default Playgama/Playables build and the direct YouTube builder do not call this adaptation. Shared source files and historical release ZIPs retain their existing naming and reward rule.

## AdMob boundary

The native Android shell is in `android/native/` (debug APK compiled and checked; see its README and build record). The Android client's `showRewarded` promise must resolve `true` only from a verified earned-reward callback. Ad dismissal, loading, cancellation or an error must not resolve as an earned reward. The test APK does not claim live native AdMob delivery or a signed AAB.

## Verification

Run `node android/tests/rewards.cjs`. It exercises the actual catalog and wardrobe with the Android adaptation: first-credit persistence, second-credit unlock/equip, cancellation/error, reload, independent cape progress, duplicate-tap protection, UI badge count and isolation of the legacy one-video rule.
