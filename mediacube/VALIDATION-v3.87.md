# v3.87 startup, shader and score validation

This release preserves v3.85 graphics, generated customers, controls, haircut mechanics, progression
and ad pacing. Language/cloud loading overlap geometry creation; current shaders compile before one
initial draw. A nonblocking GPU fence and two host-aware paint frames gate readiness. The portable
shader math retains the same intended appearance. Scores use the existing acknowledged haircut count.

## Candidate evidence

35 domain/legacy integration checks, 38 direct SDK contracts and 8 graphics contracts pass locally.
Seven startup checks cover concurrent reads, full graphics, host pause during compilation and GPU wait,
context loss at both stages, renderer-disposal cancellation and hair/baldness/age/beard shader variants.
The preceding v3.86 candidate passed the complete cross-browser, 27-viewport, Windows D3D11 and ten-minute
soak workflow. This final archive adds GPU completion/cancellation and stricter score schema validation;
its own CI and cold benchmark are pending. The JSON build identity pins its exact bytes.

No McPlay hosted or physical-phone performance pass is claimed. The earlier audit measured 4.69 seconds
fetching the official SDK on the workspace proxy network; packaged runtime changes cannot remove external
SDK/CDN latency. Recheck hosted cold start, integer score after a completed haircut, pause/mute, save/reload,
reward outcomes and natural interstitial pacing after uploading this exact archive.
