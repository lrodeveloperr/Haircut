# v3.97 — reported phone shader and Sites SDK failures

The phone screenshot reports `GFX_SHADER` on ANGLE / Qualcomm Adreno 660 / OpenGL ES 3.2. Its program-cache fingerprint `eeaaca12` matches the scalp strand material exactly. The driver supplies no vertex, fragment or link log, so the screenshot does **not** establish the lower-level compiler cause. The PC screenshot reports `SDK`, a separate external bootstrap dependency.

## Corrections

The strand vertex stages retain only their reachable shared helper functions, preserving each function body. The fragment stages no longer include the unused noise, skin, beard and grid libraries. An unused varying is removed. The three areata uniform accesses use constant indices and the same multiplication order. The scalp stages shrink from 12,116 / 14,083 characters to 9,715 / 7,428 characters. All 30,000 strands, eight segments, full beard/skin effects, antialiasing and drawing-buffer policy remain.

Graphics failures now show stage compilation and program linking status, the runtime build ID and an explicit notice when the driver returns no log. They no longer tell the player to check the network.

`source/youtube/sites-preview.py` produces a separate explicit standalone preview from the release. It retains the exact game engine, customer module, assets, styles, licenses and save formats. It replaces only host initialization with a browser-local client derived from the current production client. It makes no YouTube SDK request, fabricates no SDK object and grants no simulated ads. The production release still requires the real official SDK and never silently falls back. Asset URLs include content hashes so browser/wrapper caches cannot mix old and new bootstrap files.

After a denied preview storage read, that page uses memory only, including if storage later becomes available. It cannot overwrite the unread original disk save.

## Evidence and limits

Local headless Chromium / SwiftShader: domain and legacy 35/35, direct SDK contracts 41/41, full graphics policy 5/5, standalone preview 2/2. All five seeded customer PNGs match v3.95 byte-for-byte, including a coily-haired older customer, advanced hair loss, diffuse thinning and three active scalp/beard areata patches. The final v3.97 archive passes all eight mobile startup regressions and eleven startup cases in GitHub CI. The added blank-driver-log failure test passes with saved haircut counts and unrelated save slots preserved and no false game-ready signal. Reflection texture decompression still reproduces the exact original bytes.

The shader change is a hardware compatibility candidate. Desktop emulation does not reproduce the Adreno driver, so the owner subsequently reported that the revised Sites build loaded very fast on their phone. That report confirms successful boot on that phone; it does not time startup or verify every physical-device flow. The standalone target removes the PC's external SDK requirement; the exact cause of its blocked SDK request has not been observed directly. The v3.96 Windows job exposed an X4000 warning in the new helper early return. v3.97 initializes that result and returns once; the final Windows D3D11 suite passes 11/11 without warnings. Nothing has been uploaded to McPlay.

## Final automated validation

Tested runtime/source: `13cf9dc46d2591c1dd8d0988508893be388e4e60`.
Run: https://github.com/lrodeveloperr/Haircut/actions/runs/38806039918

All six affected jobs pass: Chromium 18/18, Firefox 16/16, WebKit 16/16; standalone target 2/2 in each engine; Linux startup 11/11 and mobile regressions 8/8; Windows D3D11 startup/shaders 11/11; graphics quality 3/3 and all five seeded image variants byte-identical to v3.94. No console errors or shader warnings were observed in the successful play cases.

The browser-only final run does not rerun contracts, layouts or the sustained job. Contract inputs are unchanged from the v3.96 passes (35 domain/legacy, 41 direct-SDK, 5 graphics-policy). The 27-viewport/four-state layouts also passed in v3.96. The sole v3.97 runtime change is an initialized, single-return shader helper, with image parity reverified.

Release SHA256: `33f95fd7e4063d6d5f52ebbbcd61a8d7b38b159abb32fc61443fdcf5f637c7fa`; ZIP 983,866 bytes; expanded 1,677,468 bytes. It is published to the existing private Sites test destination through the explicit standalone adapter. The owner subsequently reported successful fast phone boot; exact timing and broader device flows remain unmeasured. No McPlay upload was performed.

Replay alignment was separately verified across 30 screen sizes with 31 checks and a native replay interaction; see [the review](REPLAY-ALIGNMENT-v3.97.md). No runtime changes were needed.
