# v3.89 startup-resilience validation

v3.89 keeps v3.85's full-detail graphics as the default on every device. Gameplay, UI, saves and ad
pacing are unchanged from v3.88.

## Problem

The game ran on a phone at v3.84, which used a downscaled preset. From v3.85 the phone starts at full
detail, and v3.86/v3.87 made the full-detail startup checks fatal. A GPU fence that had not signalled,
or a context the browser dropped while loading, produced "The game could not load", and Retry
repeated the same path.

## Changes

- **Slow GPU:** the readiness fence waits about ten seconds, then continues instead of failing.
- **Graphics dropped while loading:** startup waits up to eight seconds for the browser to restore
  the context, then compiles and draws again (up to two restorations).
- **Full detail cannot start at all** (context creation fails, shader failure, or no restoration):
  that tab reloads once with MSAA off and resolution at the adaptive floor (1.5x). Strands, shaders
  and beards stay at full detail. A new session tries full detail first again.
- **Recovery screen:** shows a code (`SDK`, `SAVE`, `GFX_LOST`, `GFX_CONTEXT`, `GFX_SHADER`, `BOOT`).

## Checks

| Scenario (exact build) | Result |
| --- | --- |
| Context lost during compile or fence, browser restores it | starts at full detail |
| Context lost and never restored | one lighter-graphics reload, then Retry with `Code: GFX_LOST` |
| GPU fence never signals | starts at full detail |
| Full-detail context cannot be created | starts with `graphics=safe` |
| Fresh account, preview, v3.82 save, v3.87 save, denied localStorage | start |
| YouTube SDK blocked | Retry with `Code: SDK` |
| No WebGL2 at all | Retry with `Code: GFX_CONTEXT` |

- Chromium startup suite 10/10, including the four new recovery cases.
- Direct SDK contracts 40/40; domain/legacy contracts 35/35; graphics contracts 8/8.
- Local Chromium standard suite 14/17. The unchanged v3.87 ZIP fails the same 3 completion-animation
  timeouts on this container's software GPU. CI on xvfb is the reference run.

Not uploaded to McPlay and not run on a physical phone.
