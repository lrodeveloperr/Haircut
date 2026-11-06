# Android runtime policy

Android name: **Barber Simulator: ASMR Haircut**.

## Daily wardrobe unlocks

- Each daily clipper design or cape requires **one completed rewarded video**.
- Each video is a separate optional, player-initiated request. Completing the first does not automatically start another ad.
- The first earned reward saves 1/2 progress and keeps the item locked. The second unlocks and equips that item.
- Cancelling an ad, no fill or an error gives no credit and retains an already earned first credit.
- The existing two-icon badge shows progress; the accessibility label states the remaining number of videos.
- Clipper and cape progress are separate. Unlocking both daily items therefore requires four completed videos in total.
- Existing owned items remain owned. Daily offers and unfinished progress retain the existing midnight rotation rules.
- Replay rewards retain their existing separate policy.

## Build integration

`TARGET=full bash source/buildall.sh` builds the complete working YouTube/Sites engine, then `android/build-runtime.py` adapts native services, Android reward/title policy and the reviewed clipper-grip touch targeting. Shader preparation, first-frame readiness, model construction, camera, resize and context recovery are the same engine code used by the working web build. The generated engine is checked byte-for-byte against that web engine after reversing the explicit Android touch and guard-anchor adaptations. Camera, shaders, quality, geometry and drawing-loop behavior are unchanged.

`android/native-transport.js` sends asynchronous requests to the native private-storage worker. Successful save acknowledgements are delivered only after disk commit. Existing flat game-key saves are migrated into the same versioned envelope used by the working web client. Native AdMob earned callbacks remain the only reward source. The reward patch requires one completed video per daily item and retains the locked Android title.
The default Playgama/Playables build and the direct YouTube builder do not call this adaptation. Shared source files and historical release ZIPs retain their existing naming and reward rule.

## Shared adaptive graphics and clipper-grip touch mapping

- Android, Sites and YouTube now share one automatic Potato/Balanced/High/Ultra policy. Weak devices retain at least 12,000 rendered scalp strands and five strand segments; proven strongest-class devices receive 30,000 strands, eight segments, full beard density, full shading and up to 2× pixels.
- Each profile has an absolute drawing-buffer ceiling. Runtime adaptation reduces clippings, then pixels, then rendered strands before queuing one safer tier. It changes rendering cost only; haircut cells, tool mathematics, saves, camera and input remain identical.
- Tier changes commit only between customers or during graphics-context recovery. Context loss pauses play, records a safer tier, rebuilds after restoration and resumes the unchanged haircut. An unclean boot starts one tier safer.
- Static scenes redraw on changes rather than continuously. Potato may draw active animation at 30 fps while input and haircut processing continue at the display refresh rate.
- The complete contract, profile table and publish gate are in `docs/ADAPTIVE-GRAPHICS-AND-STABILITY-CONTRACT.md`.
- Android touch targeting derives a candidate from the projected center of the existing clipper grip (model local y=1.1), bounded to 36–45 CSS pixels. The lower bound gives a 48px diagnostic finger envelope 12px of requested clearance; the 45px upper bound reserves the independently verified <5px tooth-to-ray projection error, keeping actual blade clearance below 50px; it avoids the rejected 72px portrait gap. These are measured prototype acceptance bounds, not a guarantee about every physical finger. The existing teeth/cutter ray anchor is retained. The first touch probes the surface and refines the grip projection once; its clearance is then frozen for that stroke to prevent normal changes from creating offset feedback. Pointer moves retain one final cutting ray and the working rendering path. Mouse and pen remain direct.
- `android/clipper-input.js` lives inside the renderer closure so camera, viewport and actual model transforms agree. `touchTarget` is shared by cutting and proximity; `resetTouchTarget` runs on the existing release/cancel/lifecycle interruption path. `clipperScreen` reports independently projected teeth, grip and ray target from the actual model transform for verification. It adds no drawing or per-frame work.
- Game saves, reward credits, hair lengths, brush dimensions and camera controls retain their existing rules.

`node android/tests/graphics.cjs` checks all four profiles, protected floor/Ultra ceiling, viewport/density changes, recovery wiring and scalp/beard target forwarding. `node qa/youtube-quality.cjs` exercises hardware classification, overload order, safe-boundary tier changes, pixel ceilings and unclean-boot fallback. `node android/tests/bridge.cjs` exercises the actual web bundle with an asynchronous native-host fixture, including delayed/failed save acknowledgements, rewards, four phone/tablet layouts and context restoration.

`node android/tests/apk.cjs` installs the compiled APK and connects to its real Android WebView. It sends native ADB swipes in phone/tablet portrait/landscape windows, checks reachable controls and a valid selected profile, backgrounds/resumes the activity, verifies no-fill recovery, and force-stops/relaunches to prove private disk persistence. JSON, logcat and real device screenshots are retained with the APK artifact. Emulator checks verify behavior, not sustained frame rate on weak and strong physical phones.
## AdMob boundary

The native Android shell is in `android/native/` (debug APK compiled and checked; see its README and build record). The Android client's `showRewarded` promise must resolve `true` only from a verified earned-reward callback. Ad dismissal, loading, cancellation or an error must not resolve as an earned reward. The test APK does not claim live native AdMob delivery or a signed AAB.

## Verification

Run `node android/tests/rewards.cjs`. It exercises the actual catalog and wardrobe with the Android adaptation: first-credit persistence, second-credit unlock/equip, cancellation/error, reload, independent cape progress, duplicate-tap protection, UI badge count and isolation of the legacy one-video rule.

Held-touch evidence is captured by the native and browser suites with visible contact, projected tooth-center and grip markers, after the rendered transform and marker paint settle. The native suite launches a fresh process for each display density and records visual viewport and native WebView bounds; ADB trusted swipes remain a separate cutting check. These measurements establish model/input alignment, not physical comfort on the user's phone. Physical-device feedback remains required before claiming identical ergonomics to the user's preferred YouTube host.

## Legacy WebView viewport coordinates

`android/viewport-compat.js` probes the installed engine's CSS zoom geometry. Modern engines retain their native API unchanged. Older engines normalize client rects only beneath the four zoomed game UI roots, including cumulative nested sheet zoom. The canvas and visual UI scaling are untouched. The renderer's play-area rect then uses the same viewport CSS pixels as pointer events, matching modern Sites geometry on tablets. The guard arc also scales its local anchor by actual rect/layout dimensions before comparing it with viewport input.

`node android/tests/viewport.cjs` checks legacy/modern behavior, nested zoom, resize and canvas isolation. Browser and installed-APK suites independently probe zoomed geometry and send trusted touches to intermediate guards in all four phone/tablet layouts. `ANDROID_GUARD_ONLY=1` runs those affected browser cases; the `[placement-compat]` CI marker selects them after the complete 14-case browser/16-capture placement matrix has passed against the unchanged clipper helper. The installed APK still runs the full native matrix, cuts, held-tooth projections, resize interruption and persistence checks.

The final margin uses a 45px requested maximum plus the independently checked <5px tooth-to-target projection error to enforce <50px actual blade clearance. `[placement-verify]` runs four focused modern held/moved crown captures after this cap change, alongside all graphics/domain cases and the complete installed-APK suite. Native evidence briefly pins only the last genuine rendered frame while marker overlays compose; the original render method is restored in `finally`. Actual OS PNG pixels must contain contact/tooth markers, then a real touch move must produce a new rendered target with the same per-stroke gap. This is a test-only capture technique and is absent from the APK runtime.

Hosted Chromium software-GPU screenshot starvation is isolated from runtime validation. The exact final-cap runtime passed the independent local four-layout smoke, while the first CI attempt timed out composing a tablet screenshot after both phone captures passed. Browser diagnostic capture now also pins the last genuine render only around marker composition and screenshot, restores it in `finally`, then retains the real held-move proof. A QA-only `[native-check]` run reuses completed logic/modern-runtime evidence and executes the full installed-APK matrix; no production code or quality setting is changed by capture stabilization.
