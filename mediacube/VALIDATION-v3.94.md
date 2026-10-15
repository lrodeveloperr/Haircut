# v3.94 shader-time validation

On the owner's phone, v3.93's first open took 12.7 s, of which 9.9 s was preparing shaders
(download and scripts 1.1 s, models 1.1 s, setup 0.5 s, first frame 0.14 s).

## Changes

- **Shipped reflection lighting.** The game generated its reflection lighting on every load by rendering
  a lit room (three.js `RoomEnvironment`) and blurring it (`PMREMGenerator.fromScene(…, 0.04)`). That
  compiled five shader programs, three of them large, and ran every blur pass. The result never changes,
  so it now ships as `runtime/room-env.dat` (gzip, 0.9 MB; `youtube/make-env.cjs` regenerates it from the
  built game). It is copied into a render target made exactly as PMREMGenerator makes its own. If the file
  cannot load, the game generates the lighting as before.
- **Clipper compiled after the first frame.** It is hidden until cutting starts; its two programs now
  compile right after the game appears instead of before it.
- **Replay button.** Cream with an ink outline like the next row, a new replay arrow centred in its box
  (within 0.1 px), and the video badge in the next button's yellow.

Shader programs before the first frame: 7 (v3.93: 14), about half the shader code.

## Checks

- Rendered frame identical to v3.93 (SHA-256 of the canvas PNG, same save), with models computed and stored.
- Direct SDK contracts 40/40; domain/legacy 35/35; graphics 5/5; Chromium startup suite 10/10.
- Chromium standard suite 14/17: the same three completion-animation timeouts as v3.92 on this software GPU.
  An intermediate build kept the shipped lighting as a standalone data texture; after a context restore it
  left a long GPU backlog that stalled a reload. Copying it into a render target removed that (17 to 14 tests
  passing again, matching v3.92).

ZIP 1.27 MB (expanded 1.98 MB). Not uploaded to McPlay and not run on a physical phone.
