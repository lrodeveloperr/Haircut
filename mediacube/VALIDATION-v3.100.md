# v3.100 — preserved game, compact saves and reliable startup cache

Exact release: `releases/asmr-barber-fade-master-v3.100-mediacube-youtube.zip`. ZIP 726,448 bytes; expanded 1,418,688 bytes.
SHA-256: `bda36b1466d373566224f98cb6e41ad4c74d65187147824c9afbcdb1cbcf42b3`.

The game bundle, customer bundle, stylesheet and reflection asset are byte-identical to v3.99.
All pixels match for five seeded customer variants, including coily hair, ageing, baldness,
alopecia patches and beards. Lighting reconstructs the exact v3.94 half-float bytes.
No quality, resolution, hair density, gameplay, controls or monetization change is included.

## Integration and persistence

The poster uses the existing SDK pause state; `document.hidden` is removed. The loading
status element is removed before readiness instead of leaving an unstyled node for 300 ms.
The direct-YouTube notices no longer claim a Playgama runtime, and the diagnostic tag identifies v3.100.

Cloud transport losslessly packs repeated numeric arrays. Fresh actual saves shrink from
67,596 to 2,292 bytes; a native 11-stroke haircut is 2,614 bytes. An acknowledged save/reload
restores hair, beard and stroke count exactly. Arbitrary fractional values also round-trip exactly.
The game still receives the original arrays and numbers. v1 and legacy Bridge saves migrate.
A new compact save is marked v2; old builds treat it as future data and preserve it.
Malformed counts/paths, expansion bombs, future domain schemas and oversized data are protected.
Packing respects the same path-count/depth bounds as decoding. There is no downloaded codec.
Irregular numeric arrays are left uncompressed; 64 KiB is not promised for arbitrary imported data.
Normal 220 ms debounced checkpoints and SDK acknowledgement remain in place.

## Startup measurement and estimate

A fast HTTP cache can beat a busy phone's IndexedDB response. Raising the optional model-read
budget from 100 to 400 ms recovers warm cache hits: model work fell from 2,047 to 817 ms and
1,898 to 680 ms under four-times CPU throttling. Missing records resolve immediately; stalled
or denied storage still falls back. The 4-second lighting fallback is unchanged.
Precomputed deterministic geometry was evaluated but would add about 3.1 MB compressed,
so it was excluded because it increases slow-network startup.

Selected baseline controlled Chromium measurements: 2.45 s local cold; 5.70 s with CPU4x,
10 Mbps/50 ms latency; 9.27 s with CPU4x, 2 Mbps/150 ms latency. The software GPU accounts
for substantial time and is not a physical-phone GPU measurement. Synthetic SDK/cloud delays
are included. Cache-budget trials establish a CPU-work improvement, not a guaranteed total gain.
Contended candidate runs were discarded from total-startup comparisons.

Best planning estimate for a modern phone on healthy WiFi/4G: about 3 s cold (roughly 2–5 s),
roughly 1–3 s on a cached return. Slower devices/connections can exceed 5–10 s. These estimates
exclude YouTube navigation, pre-roll ads and host pauses. Live YouTube host latency is unmeasured.

## Validation scope

44/44 SDK contracts, 5/5 fixed-quality checks, 3/3 cache integrity checks, content-addressed URLs,
lossless lighting, native checkpointed cut/save/reload, and exact five-variant rendered parity pass.
Early broad software-GPU QA had missed input coordinates, a reload navigation timeout and reveal
timeouts; the isolated final native regression passes. The independent HTTP harness also passes.
QA input now selects real raycast targets and awaits the actual save promise. Navigation/reveal
checks allow software-renderer headroom; the production game's animation is unchanged.

GitHub CI passed contracts/packaging, Windows ANGLE shaders, startup interruption and mobile recovery
on source commit `807faf4764cd29477d58e91b3dca49ab6ff1d4c4`: https://github.com/lrodeveloperr/Haircut/actions/runs/38819299368.
These jobs used the exact release ZIP. Hosted YouTube/MCPlay validation, real rewarded/interstitial ads,
and physical Android/iOS startup/audio checks remain necessary. This candidate is not certified
and has not been uploaded to MCPlay. See `STARTUP-v3.100.json` and `BUILD-v3.100.json`.

Primary requirements checked: Google Playables Integration requirements (updated 2026-09-25),
Stability requirements and SDK reference at developers.google.com/youtube/gaming/playables/.
