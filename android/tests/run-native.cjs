'use strict';
// android-emulator-runner executes each script line separately; keep dispatch in one process.
require(process.env.ANDROID_APK_AGE_ONLY === '1' ? './age-gate.cjs' : './apk.cjs');
