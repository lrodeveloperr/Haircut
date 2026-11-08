# Google Play screenshots and feature graphic

The images live in [`../en-US/images/`](../en-US/images/) (fastlane `supply` layout; other languages inherit the
default-language graphics because the images carry no text). This folder holds the script that captures them.

Every image is the real game: its own renderer, customers made by the game's own generator (`HSC.makePerson`),
cut with the game's clipper input, wearing catalogue clippers and gowns, in the game's region salons. No captions,
no device frames. Four show a cut in progress with the clipper on the hair; four show a finished cut.

| File | Customer | Hair / beard | Angle | Clipper, gown | Salon | Shows |
|---|---|---|---|---|---|---|
| `1-beard-from-below.png` | West African, 45 | coily black, full garibaldi beard | under the jaw | gold two-tone, yellow | Lagos | beard trimmed from underneath, in progress |
| `2-skin-fade-finished.png` | East Asian, 32 | straight black, clean-shaven | side | neon racing, red | Tokyo | finished side skin fade |
| `3-buzz-strip.png` | Northern European, 20 | wavy blond, stubble | high front | galaxy, navy | London | first buzz strip through long hair, in progress |
| `4-silver-beard-finished.png` | South Asian, 64 | silver hair, long silver beard | front three-quarter | rose gold, blue | Mumbai | finished beard sculpt |
| `5-back-fade.png` | Middle Eastern, 40s | salt-and-pepper, van dyke | back three-quarter | wood, teal | Istanbul | back fade, clipper on the line |
| `6-ginger-taper-finished.png` | mixed heritage, 20s | curly ginger, clean-shaven | behind | carbon, sky | classic | finished low taper |
| `7-coily-temple-fade.png` | East African, 25 | coily black, handlebar moustache | side | marble, magenta | London | temple skin fade, in progress |
| `8-high-fade-finished.png` | Latino, 30s | brown, anchor beard | front three-quarter | leopard, green | Mexico City | finished high fade |
| `../en-US/images/featureGraphic.png` (1024×500) | Northern European, 30s | dark brown, balbo beard | side | red chevron, purple | Istanbul | skin fade in progress, buttons hidden |

Phone shots are 1080×1920 (9:16), 24-bit PNG without transparency.

## Recreate

```sh
TARGET=full bash source/buildall.sh
cd android/store-listing/screenshots/capture
CHROMIUM_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node shoot.cjs all 3            # the 8 phone shots
HIDEUI=1 CHROMIUM_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node shoot.cjs F 2 1024 500   # feature graphic at 2048×1000
sips -z 500 1024 out/F-feature-preview.png --out out/featureGraphic.png
```

`scenes.json` fixes each customer (seed and traits), the camera, clipper, gown and salon; `plan.cjs` holds each
scene's clipper passes in screen pixels. `node shoot.cjs <id> 1` renders a quick preview of one scene;
`CALIB=1` adds a coordinate grid for placing passes. A scene that cuts an eyebrow is reported in the log.
Every customer, the feature graphic's included, is pinned by seed.
