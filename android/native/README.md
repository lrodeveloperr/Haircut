# Android app (native shell)

Gradle project for `com.worksbien.barbersimulatorasmr`. It bundles the Android web build of the game
(`TARGET=full bash source/buildall.sh`, run automatically before every build) and shows it full screen in a
WebView, offline, from the app's own origin.

**Status: source only. It has not been compiled yet**: the environment it was written in could not reach
`dl.google.com` (Android SDK, Android Gradle plugin, AdMob). The JavaScript bridge is tested; the Java side is
untested until the first build and a run on a real device.

## Build

Needs JDK 17+ and the Android SDK (platform 36, build tools) with `sdk.dir` in `local.properties` or
`ANDROID_HOME` set.

```sh
cd android/native
./gradlew assembleDebug    # test APK: app/build/outputs/apk/debug/app-debug.apk (Google test ads only)
./gradlew bundleRelease    # Play upload: app/build/outputs/bundle/release/app-release.aab
```

The debug app installs beside the Play version (`.debug` package suffix) and always uses Google's public test
ad ids. A release build refuses to run without the real ids and the upload key in `keystore.properties`
(never committed):

```properties
storeFile=upload.jks
storePassword=...
keyAlias=upload
keyPassword=...
admobAppId=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
admobRewardedId=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ
admobInterstitialId=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ
```

## How it works

- `MainActivity` loads `assets/game/index.html` through `WebViewAssetLoader`. The page's Playgama Bridge URL is
  answered with `assets/android-bridge.js`; every other outside request is refused, so no Playgama code or web
  host service ships. Links to other `https` pages open in the browser.
- `android-bridge.js` gives the game the interface it already uses: saves in the app's private storage
  (`HostBridge`, each write committed before success is reported), ads through AdMob, no analytics.
- `AdsController` waits for Google's consent (UMP) before requesting any ad. The game counts a rewarded video
  only on AdMob's earned-reward callback; a closed, unavailable or failed ad gives no credit. An interstitial
  that is not ready is skipped, never waited for.
- Full screen with the system bars hidden; the game is padded clear of camera cutouts and any visible bars.
  Rotation and folding keep the same page. Font size settings do not scale the game. Back closes the
  wardrobe, otherwise sends the app to the background. Leaving the app pauses the game and its sound.

## App icon

The launcher and starting-screen icon use the existing approved Play Console artwork, retained unchanged
at `android/store-listing/en-US/images/icon.png`. Density-specific launcher PNGs are exported from that
512 × 512 master. Android applies the launcher mask; no corner radius is baked into the artwork.

## Still open

- Real AdMob ids and the upload key (`keystore.properties`).
- An in-app link to the privacy policy and, where UMP requires it, a privacy options entry
  (see `android/PRIVACY-RELEASE-CONFIG.md`). The game has no settings screen yet, so this needs a placement.
- First build, then a device test of consent, ads, saves, rotation/folding, back and pause.

Test the bridge: `TARGET=full bash source/buildall.sh && node android/tests/bridge.cjs`.
