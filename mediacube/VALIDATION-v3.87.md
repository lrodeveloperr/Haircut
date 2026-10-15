# v3.87 startup, shader and score validation

The release preserves v3.85 graphics, generated customers, controls, haircut mechanics, progression
and ad pacing. Language/cloud loading overlap geometry creation; visible materials and the current
clipper compile before one initial customer draw. A nonblocking GPU fence and two host-aware paint
frames gate readiness. Failure/cancellation reaches Retry without resetting progress. Scores use the
existing haircut count after the exact cloud snapshot is acknowledged, with metadata-schema validation.

## Correctness and presentation

- 35 domain/legacy integration checks, 38 direct SDK contracts and 8 graphics contracts passed.
- 50 cross-browser gameplay cases passed: Chromium 18/18, Firefox 16/16, WebKit 16/16. This includes real
  cutting, cloud save/reload, rewards, replay, host pause/mute, context restoration and official SDK loading.
- Seven startup cases passed locally and in CI on both Vulkan SwiftShader and actual Windows ANGLE
  Direct3D11. They cover concurrent SDK reads, full graphics, pause during compilation/fence wait, context
  loss at both stages, cancellation on renderer disposal and hair/baldness/age/beard shader variants.
  No shader warning was logged by the D3D11 checks.
- Three phone/tablet graphics cases passed at 390x844 DPR2, 360x640 DPR3 and 768x1024 DPR2, preserving 30,000
  scalp strands, eight segments, full beard density, full skin shaders, MSAA and the existing pixel cap.
- Visual review of the same saved customer found matching appearance at all three sizes. The customer
  crop's mean absolute per-channel difference was below 0.000002 out of 255 (the 360x640 crop was identical).
- All 27 viewport sizes passed in four states: play, clipper wardrobe, gown wardrobe and completion.
- The final Firefox soak passed 91 customer transitions over 602,102 ms, with no errors and unchanged
  canvas, HUD and host-callback counts.
- Independent review found no remaining material issue and verified ZIP integrity/identity.

The initial full run reported two intermittent button-bounds assertions. The unchanged ZIP passed all 27
cases on a diagnostic rerun. Review found that Playwright could retain a button handle while the existing
one-second wardrobe refresh replaced it; the original failures did not capture whether their bounds were
null. QA now queries and measures the current visible button atomically, retaining positive dimensions
and the same strict viewport bounds. All 27 cases pass with that observation; no UI/runtime adjustment
was made to obtain the result.

[Full runtime/soak evidence](https://github.com/lrodeveloperr/Haircut/actions/runs/38751810758) and
[final layout/startup/Windows evidence](https://github.com/lrodeveloperr/Haircut/actions/runs/38752919978)
cover the same v3.87 archive. The runtime commit is a7d1dc4; the final QA commit is 92135a3.

## Measured startup

See [raw repeated measurements](STARTUP-v3.87.json). Five runs per build used a fresh Chrome 151 browser
process, 390x844 DPR2, a local SDK fixture and the same ANGLE Vulkan SwiftShader software GPU. The OS/GPU
cache was not explicitly purged. No physical phone or hosted CDN latency is represented.

| Measurement | v3.85 median | v3.87 median | v3.87 range |
| --- | ---: | ---: | ---: |
| SDK gameReady | 2.10s | 4.11s | 3.87–5.12s |
| Two-frame checkpoint after exposed game API | 7.52s | 4.29s | 4.03–5.26s |

The older readiness call ran ahead of the software GPU completing the first scene. The new SDK signal
waits for GPU completion; comparing its SDK number directly against the older early signal is misleading.
The consistent post-readiness frame checkpoint improved 43% at the median. This is functional evidence
of the startup change, not a guarantee of sub-five-second loading. Shared CI software-renderer timing
was slower (up to 15s in tablet captures); the Windows software D3D11 startup case took 5.85s. The target
phone/network budget remains unverified.

## Upload verification

The exact ZIP and every expanded entry are pinned in [BUILD-v3.87.json](BUILD-v3.87.json). It is 404,365
bytes compressed, 1,071,037 bytes expanded; the largest entry is 763,936 bytes, well below McPlay's 15 MB
advisory. The ZIP contains 12 files, index.html at its root, no packaged SDK mock, and no Playgama Bridge.

On a fresh account, complete a haircut and allow cloud saving to acknowledge it to exercise the integer
score check. Opening the game alone sends no dummy score. Upload this archive, rerun McPlay pre-flight
and verify cold startup, pause/mute, save/reload, completed/cancelled rewards and natural interstitial
pacing. No McPlay or physical-phone pass is claimed. The earlier audit measured 4.69s fetching the
external official SDK on the workspace proxy network; bundle changes cannot remove that external delay.
