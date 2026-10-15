# v3.90 startup-resilience validation

v3.90 is v3.89 without its lighter-graphics fallback. Full detail is the only startup mode;
`detail-youtube.js` is identical to v3.87. Gameplay, UI, saves and ad pacing are unchanged.

## Startup behaviour

- **Slow GPU:** the readiness fence waits about ten seconds, then continues instead of failing.
- **Graphics dropped while loading:** startup waits up to eight seconds for the browser to restore
  the context, then compiles and draws again at full detail (up to two restorations).
- **Full detail cannot start:** Retry is shown with a code; graphics are never lowered.
  Codes: `SDK`, `SAVE`, `GFX_LOST`, `GFX_CONTEXT`, `GFX_SHADER`, `BOOT`.

## Checks

| Scenario (exact build) | Result |
| --- | --- |
| Context lost during compile or fence, browser restores it | starts at full detail |
| Context lost and never restored | Retry with `Code: GFX_LOST`, full-detail settings unchanged |
| GPU fence never signals | starts at full detail |
| Full-detail context cannot be created / no WebGL2 | Retry with `Code: GFX_CONTEXT` |
| Fresh account, preview, v3.82 save, v3.87 save, denied localStorage | start, antialiasing on |
| YouTube SDK blocked | Retry with `Code: SDK` |

- Chromium startup suite 10/10. Direct SDK contracts 40/40; domain/legacy 35/35; graphics 8/8.
- The local Chromium standard suite was 14/17 on v3.89, whose gameplay runtime is the same. The unchanged
  v3.87 ZIP fails the same 3 completion-animation timeouts on this container's software GPU.

Not uploaded to McPlay and not run on a physical phone.
