# Exact ZIP audit: v3.91 and v3.100

Audit date: 15 October 2026. Target: direct YouTube Playables via McPlay.

## Decision

Do not replace v3.100 wholesale with v3.91. v3.101 removes optional startup work while retaining the newer shader, save, SDK, context-restoration and cache-URL corrections. Its targeted automated checks now pass; live-host checks remain pending. No external upload is included in this audit.

## Exact inputs

| Version | ZIP bytes | SHA-256 |
| --- | ---: | --- |
| v3.91 | 405040 | 926f4b8259eef735db9b89df0edd9ab284f7a2da8ba31f9c345b55610b5a763d |
| v3.100 | 726448 | bda36b1466d373566224f98cb6e41ad4c74d65187147824c9afbcdb1cbcf42b3 |

Both use the same official SDK URL, `https://www.youtube.com/game_api/v1`, first in script order. The version difference does not introduce a different SDK.

## Findings and direct reproduction

1. v3.100 adds 321408 ZIP bytes (+79.35%), principally a 318208-byte reflection asset. It awaits this optional lighting path before creating the renderer. A deterministic VM test confirms that an unavailable or stalled asset can wait 4000 ms before falling back to the original lighting generator. That timer starts when the geo module executes; some of it can overlap other startup work, so it is not an automatic four-second additive delay in every run.
2. An IndexedDB open/read that never finishes blocks the model/customer module for the 400 ms optional-read budget. On an empty fast database this resolves earlier. Cache adoption, validation/checksums and pristine copies also add work; caching trades first-visit overhead for possible repeat-visit savings.
3. A VM reproduction using the exact v3.100 geo and client scripts starts a lighting fetch, sends the SDK onPause callback, then resolves the fetch. All 3145728 half-float texels are decoded while executionPaused is still true. This violates Integration section 6's pause-all-execution requirement. The 44 client tests did not cover the separate geo module.
4. v3.100 reads a saved loading image from localStorage before engine initialization, then does extra GPU readbacks and image encoding at quiet moments. This is presentation caching, not the cloud progress store; it is unnecessary for reaching the first playable frame. Its asynchronous callbacks also need lifecycle ownership. v3.101 removes the snapshot feature and retains the static loading backdrop.
5. v3.91 passes 41 of the current 44 client tests. One failure is a real off-platform preview issue: storage can recover after a denied initial read and then overwrite unread local progress. Two failures assert compact-save functionality added later; they do not establish that v3.91 violates Google's hosted save contract. v3.91 safely rejects the new v2 save envelope, so reverting can lock out a player who has already saved with v3.100.
6. v3.91 lacks later shader portability, context-restoration and content-versioned URL fixes. Static differences show uniform-array indexing and unused shader-library functions restored by a wholesale rollback. This audit did not reproduce every affected physical GPU; retained Windows/phone evidence remains relevant.
7. The reported SDK error is thrown by the game's adapter when ytgame/game/system is absent. It identifies the missing interface, but does not identify an outage, blocked request, policy restriction or another delivery cause. A later geometryReady diagnostic does not mean the SDK failed after geometry: the eager client rejection is handled after geometry is constructed.

## YouTube requirements checked

| Area | Exact-ZIP result |
| --- | --- |
| SDK first; no replacement SDK/mock | Both pass static inspection |
| firstFrameReady / gameReady | Loading screen call and first-playable ordering present; client readiness idempotence passes; host proof pending |
| load before save; serial acknowledged writes; preserve unread/future saves | v3.100 44/44 client checks pass; v3.101 retains those exact client bytes |
| SDK mute/pause/resume | Client contracts pass; v3.100 optional geo decode has the pause defect above; v3.101 removes that path |
| Material progress; reward receipts; failed-ad recovery | Client contracts pass; real ads and host save/reload pending |
| Page Visibility API | No forbidden runtime visibility owner in either archive |
| Storage and package limits | Both well below hard bundle/save limits; game.js exceeds the 512 KiB individual-file recommendation, not the 30 MiB hard limit |
| Fonts/assets/external requests | Relative local bundle assets; only official YouTube SDK external; no analytics/login |
| Full graphics policy | 5/5 for each input; v3.101 game/customer/style bytes match v3.100 |
| Under-five-second interaction | Not established on live YouTube/McPlay; Google's five seconds is a SHOULD recommendation, not a guaranteed host latency |

## Minimal revision

v3.101 is 410921 ZIP bytes / 1089471 expanded bytes. SHA-256: `3a482e55e6317ad34260938daa65642c8b68367447f02fbfbaaf907e582558e0`.

It removes optional browser model/lighting caching and the reflection download. The existing renderer takes its original full-detail lighting-generation branch; context restoration is retained. It removes saved loading snapshots and their GPU readback/encoding, retaining the static loading backdrop. All runtime game.js, customers.js, youtube-client.js and styles.css bytes match v3.100 exactly. No ad pacing, controls, customer generation, haircut behavior, resolution or geometry density changes are included.

Local checks pass: 35/35 domain/legacy contracts, 44/44 direct SDK contracts, 5/5 graphics-policy checks, 3/3 direct-builder/no-I/O regression, archive/assets and content-versioned URLs. New CI is required for browser integration, Windows shaders, native save/reload, context recovery and exact rendered parity. The small wrapper tests do not certify the complete game.

No new end-to-end loading estimate is offered. A browser engine is unavailable in the current local audit environment, so full render verification is delegated to the repository's existing CI, using the exact upload archive. Physical phones, actual McPlay/YouTube ingestion, real ads and real cloud saves remain the final host checks. Sites is a useful preview and cannot certify those.

## Primary sources

- https://developers.google.com/youtube/gaming/playables/certification/requirements_integration (updated 2026-09-25)
- https://developers.google.com/youtube/gaming/playables/certification/requirements_stability (updated 2026-06-16)
- https://developers.google.com/youtube/gaming/playables/reference/sdk
- https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide

## Final CI and deployment evidence

The upload archive remains byte-identical to its local SHA-256 above across all source revisions below. The first run exposed two QA assumptions: the standalone check still expected the removed lighting request, and the graphics check fed a compact v2 save into the older reference build. The preview assertion now requires zero such requests. The graphics comparator now supplies the same decoded v1 session to both releases; production save handling is unchanged. Corrected targeted rechecks pass.

- Packaging/reproducibility/contracts, startup 11/11, mobile recovery 7/7 and Windows Direct3D11 shaders 11/11 passed: https://github.com/lrodeveloperr/Haircut/actions/runs/38823038886 . That run's initial browser/graphics jobs failed for the QA reasons above, not a claim that the entire first run was green.
- Browser and standalone recheck passed: Chromium 18/18 + 2/2, Firefox 16/16 + 2/2, WebKit 16/16 + 2/2: https://github.com/lrodeveloperr/Haircut/actions/runs/38823371897 .
- Full-detail phone/tablet checks 3/3 and five exact rendered customer-image hashes passed: https://github.com/lrodeveloperr/Haircut/actions/runs/38823528554 .
- The three graphics-fixture startups observed 6.277, 7.488 and 10.847 seconds including fixture/browser setup on the CI software GPU. These are neither live-host nor physical-phone timings and do not establish a controlled v3.91/v3.101 speedup. No under-five-second guarantee is made.
- The unchanged game/customer/style bundles retain prior layout and soak evidence; those long suites were not repeated.
- The existing owner-private Site now serves all 14 exact ZIP runtime files: https://haircut-studio-v387.lat23445.chatgpt.site . Deployment `appgdep_6ad161f6b04c8191a5fd0830ee4b292f`, Site source `7b410d68303d892776edd26a5305c91e704076ec`.

Actual McPlay/YouTube loading, real ads, real cloud save/reload and physical-device audio remain unverified for v3.101. The original missing-SDK delivery failure can still occur if the required external SDK request is blocked; no fake SDK or silent progress-reset fallback has been introduced. The next host test must use the exact v3.101 archive hash.
