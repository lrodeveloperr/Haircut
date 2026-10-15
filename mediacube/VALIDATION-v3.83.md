# MediaCube v3.83 validation

Validated 2026-10-15 UTC. Ready for McPlay upload/pre-flight; not yet uploaded or certified.

## Exact upload artifact

- File: `releases/asmr-barber-fade-master-v3.83-mediacube-youtube.zip`
- ZIP: **400,658 bytes**; expanded: **1,060,349 bytes**; **11 runtime files**.
- SHA-256: `0f184396c2f7f3241c3048812405a5e403aaf30ea804d31e35cbfbd115f023f6`.
- Runtime integration commit: `b6d88e78645c96f061127419d8c35c277a2fbeef`.
- Final browser-harness commit: `747784fd4121d33f16cf3152c25ce29fb5a178ce`.
- No runtime or ZIP bytes changed during the browser-harness follow-ups.
- `BUILD-v3.83.json` records each runtime file's hash and the sustained-run measurements.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Corrected game/domain and original Bridge contracts | PASS 35/35 | [Full run](https://github.com/lrodeveloperr/Haircut/actions/runs/38676008356) |
| Direct YouTube adapter contracts | PASS 26/26 | Full run; local extracted ZIP also passes |
| Reproducible committed ZIP | PASS, byte-for-byte match | Full run |
| Chromium integration | PASS 15/15 | [Authoritative browser run](https://github.com/lrodeveloperr/Haircut/actions/runs/38676415111) |
| Firefox integration | PASS 14/14 | Authoritative browser run |
| WebKit integration | PASS 14/14 | Authoritative browser run |
| Real official YouTube SDK under content-source policy | PASS, Chromium off-platform preview | Authoritative browser run |
| Viewport matrix | PASS, 27 viewports x four states | Full run, four layout groups |
| Representative screenshot review | PASS: 225x400, 390x844, 768x1024, 1440x900; gameplay, both wardrobe tabs and completion | Full run layout artifacts |
| Sustained run | PASS, 76 customer transitions in 602,536 ms (10 min 2.5 s) | Full run soak job |
| Archive inspection | PASS: root index.html, relative assets, no source/tests/Android/Bridge configuration, complete license texts, no test SDK | Packager and contracts |

The sustained run kept one canvas, one HUD and three SDK callback subscriptions. Observed JavaScript heap
was 39,448,778 bytes at the start and 42,283,301 bytes at the end; this is not proof of leak freedom or a
physical-device GPU measurement. No page errors were recorded in that run.

The browser suites exercise native cutting, exact hair restoration after reload, readiness order, host
pause/mute, interruption/resize, interactive wardrobe pause ownership, cancelled/unavailable/completed
rewards, persisted unlocks, paid replay, pre-ad save failure, startup recovery, unsupported saves and
off-platform preview. Every browser job printed the exact same ZIP hash shown above.

## Resolved test-harness failures

The first full run and the first browser-only follow-up reported a preview assertion failure. The test
counted the replay element before reaching its completion-screen entry point, where availability is set;
it also treated an opacity-hidden parent as sufficient for Playwright visibility. The final test uses
normal Finish gameplay to reach completion and then verifies the unavailable replay is hidden. Its
assertion remains in place and passes in all three browser engines. No game code was changed to make
those follow-ups pass. The full run remains authoritative for contracts, layouts and soak; the linked
final browser run supersedes its browser jobs.

## Remaining hosted observations

McPlay pre-flight and manual certification, YouTube-hosted cloud continuity and real monetized ad delivery,
and physical Android/iPhone performance are pending. CI uses strict SDK fixtures for hosted events and
the real official SDK for the off-platform Chromium check. It does not represent a completed hosted
YouTube SDK Test Suite or McPlay certification session.

Upload the exact artifact above in McPlay's **Replace game bundle** field. Keep the archive/hash fixed
while reviewing pre-flight, then verify hosted save/reload, host pause/mute, cancellation and completion
of each reward placement, and an interstitial reached through ordinary gameplay. Record the portal
result against this same archive hash.
