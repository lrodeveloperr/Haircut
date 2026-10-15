# v3.92 shader diagnostics

v3.91 failed on the owner's phone on McPlay with `Code: GFX_SHADER`: a shader program did not link
on that GPU. The same build started on the same phone outside McPlay. v3.92 adds diagnostics only.
The game and graphics are unchanged from v3.91.

When a shader fails, the recovery screen now lists:

- the shader's material type and a fingerprint of its variant (`#xxxxxxxx`),
- the GPU's vertex, fragment and link logs (first lines),
- the GPU model and its varying and uniform limits,
- the mode (YouTube or preview) and the saved haircut count.

Checked with a simulated link failure on a YouTube-mode start with a saved game; the screen shows every
line above. Direct SDK contracts 40/40. Not run on a physical phone.
