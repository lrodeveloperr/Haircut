# v3.88 startup-recovery validation

v3.88 is v3.87 with two save-loading fixes. Graphics, gameplay, UI and ad pacing are unchanged.

## Cause of "The game could not load"

An audit ran the exact v3.87 ZIP under each startup condition (800x1280 DPR2 touch viewport):

| Condition | v3.87 | v3.88 |
| --- | --- | --- |
| Fresh account / McPlay preview | starts | starts |
| Cloud save written by the v3.82 Playgama build | **error screen, every Retry** | starts, progress kept |
| Preview where the browser denies localStorage | **error screen** | starts (progress kept for the page load) |
| YouTube SDK script blocked by the browser | error screen | error screen (correct: the SDK is required) |
| Device without WebGL2 | error screen | error screen (unchanged) |

v3.82 saved through Playgama Bridge, which on YouTube stores a flat `{key: JSON string}` object.
v3.83 to v3.87 only accept the `{version: 1, slots}` envelope, so they refused that save as
"unsupported format". The account kept failing until the save was replaced. v3.88 migrates an object
whose keys are all the game's own (`skin-fade-studio-*`). It parses each value and checks the schema
versions as before. Anything else, including undecodable values, stays protected. The cloud copy is
only rewritten, in the new format, on the next save.

## Checks

- Direct SDK contracts: 40/40, including new v3.82-migration and denied-localStorage cases.
- Domain/legacy contracts 35/35; graphics contracts 8/8.
- Local Chromium browser suite: the same 3 completion-animation timeouts occur on the unchanged
  v3.87 ZIP on this container's software GPU; no test fails only on v3.88. CI on xvfb is the reference run.

Not uploaded to McPlay and not run on a physical phone.
