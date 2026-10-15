> Superseded candidate: upload v3.87 from the current README. This archive remains immutable.

# v3.86 startup and shader correction validation

The runtime preserves v3.85 graphics settings, generated customers, controls, haircut mechanics,
progression and ad pacing. The changes concern initialization order, portable shader mathematics,
truthful readiness and reporting an already-persisted haircut count.

## Local checks

- 35 domain / legacy integration contracts passed.
- 38 direct YouTube SDK contracts passed, including eager-read failure protection, startup paint-frame
  pause/cancellation, score acknowledgement ordering, failed saves, retries and pending score requests.
- 8 full-detail graphics policy contracts passed.
- 17 Chromium gameplay checks passed against the built runtime, including actual cutting, cloud
  save/reload, idle context restoration, host pause/mute, wardrobe, rewards and replay. The local lane
  excludes the external SDK network test; the official-SDK CI case remains required.
- 4 startup checks passed: concurrent host reads with full-detail graphics, pause during compilation,
  clean Retry on context loss during compilation, and hair/baldness/age/beard shader variants.

## Remaining verification for this candidate

The complete [v3.86 CI run](https://github.com/lrodeveloperr/Haircut/actions/runs/38749967234) passed:
50 browser checks across Chromium/Firefox/WebKit, 27 viewports in four states, Windows/ANGLE D3D11,
three full-detail captures, startup interruption checks and 96 transitions over 602,613 ms.
The final v3.87 archive adds GPU-completion readiness/cancellation and score-schema validation. The JSON build identity
contains the exact ZIP SHA and sizes. No hosted McPlay or physical-device pass is claimed.

The earlier audit measured 4.69 seconds fetching the official SDK on this workspace's proxy network.
That external latency is independent of the packaged game and cannot be promised away by code changes.
The release target is less than 3 seconds where practical, with less than 5 seconds required on the
chosen target phones/network. Actual hosted load, pause, save/reload, rewards and scoring must be
rechecked after uploading this exact archive.
