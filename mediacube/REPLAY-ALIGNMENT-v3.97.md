# Replay alignment review — v3.97

Result: PASS. No runtime, icon, CSS, button position or game changes were necessary.

Played the production game locally: used the clipper, completed a haircut, inspected the real completion UI, resized through 30 unique portrait/landscape/tablet/desktop/ultrawide viewports, returned to the original phone viewport, and clicked the rewarded Replay control. The same customer returned with the starting hair restored, without console errors.

All 31 checks pass. Both layouts are covered: the larger replay alongside Next and the compact corner replay. The SVG box differs from the button-face center by at most 0.0078125 CSS pixels on either axis. The button stays circular, the video badge stays inside the viewport, Replay does not overlap Next, the row version shares Next's center line, and the corner version aligns with the existing top row. There is no page overflow. Visual inspection of all cropped buttons and full portrait/landscape/desktop frames found no visible offset.

The matrix spans 225×400 through 3840×1080, including 320×568, 375×667, 390×844, landscape phones, square, tablet, tall 9:32, 21:9 and 32:9 screens. These are local Chromium viewport checks at DPR2, not thirty physical devices. Safe-area values are the desktop test environment's values. Reward availability comes from the controlled hosted-SDK fixture; no mock is shipped and the standalone Site keeps its existing reward policy.

- [Machine-readable results](../qa/evidence/replay-v3.97.json)
- [Captured replay controls](../qa/evidence/replay-v3.97.png)
- [Repeatable local check](../qa/replay-alignment.cjs)

Run with an installed Playwright browser:

```sh
RELEASE_DIR=source/build-youtube node qa/replay-alignment.cjs
```

Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to select an existing Chromium executable when needed. The runner reuses the existing game QA fixture; it does not start a preview server or change the runtime. The v3.97 archive SHA256 remains `33f95fd7e4063d6d5f52ebbbcd61a8d7b38b159abb32fc61443fdcf5f637c7fa`.
