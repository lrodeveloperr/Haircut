# v3.97 — reported phone shader and Sites SDK failures

The phone screenshot reports `GFX_SHADER` on ANGLE / Qualcomm Adreno 660 / OpenGL ES 3.2. Its program-cache fingerprint `eeaaca12` matches the scalp strand material exactly. The driver supplies no vertex, fragment or link log, so the screenshot does **not** establish the lower-level compiler cause. The PC screenshot reports `SDK`, a separate external bootstrap dependency.

## Corrections

The strand vertex stages retain only their reachable shared helper functions, preserving each function body. The fragment stages no longer include the unused noise, skin, beard and grid libraries. An unused varying is removed. The three areata uniform accesses use constant indices and the same multiplication order. The scalp stages shrink from 12,116 / 14,083 characters to 9,694 / 7,428 characters. All 30,000 strands, eight segments, full beard/skin effects, antialiasing and drawing-buffer policy remain.

Graphics failures now show stage compilation and program linking status, the runtime build ID and an explicit notice when the driver returns no log. They no longer tell the player to check the network.

`source/youtube/sites-preview.py` produces a separate explicit standalone preview from the release. It retains the exact game engine, customer module, assets, styles, licenses and save formats. It replaces only host initialization with a browser-local client derived from the current production client. It makes no YouTube SDK request, fabricates no SDK object and grants no simulated ads. The production release still requires the real official SDK and never silently falls back. Asset URLs include content hashes so browser/wrapper caches cannot mix old and new bootstrap files.

After a denied preview storage read, that page uses memory only, including if storage later becomes available. It cannot overwrite the unread original disk save.

## Evidence and limits

Local headless Chromium / SwiftShader: domain and legacy 35/35, direct SDK contracts 41/41, full graphics policy 5/5, standalone preview 2/2. All five seeded customer PNGs match v3.95 byte-for-byte, including a coily-haired older customer, advanced hair loss, diffuse thinning and three active scalp/beard areata patches. All eight mobile startup regressions and all ten existing startup cases pass. The added blank-driver-log failure test passes with saved haircut counts and unrelated save slots preserved and no false game-ready signal. Reflection texture decompression still reproduces the exact original bytes.

The shader change is a hardware compatibility candidate. Desktop emulation does not reproduce the Adreno driver, so a new test on the reported physical phone remains required. Do not claim that mobile is fixed until that result is obtained. The standalone target removes the PC's external SDK requirement; the exact cause of its blocked SDK request has not been observed directly. The v3.96 Windows job exposed an X4000 warning in the new helper early return. v3.97 initializes that result and returns once; final cross-browser and Windows checks are pending. Nothing has been uploaded to McPlay.
