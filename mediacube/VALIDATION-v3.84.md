# MediaCube v3.84 validation

Prepared 2026-10-15 UTC. Replacement for v3.83; fresh McPlay upload/pre-flight pending.

## Correction

McPlay reported `Saved progress has an unsupported format` on v3.83. That decoder accepted an
empty string but rejected empty JSON such as `{}`, `[]` and `null`. The same startup error was
reproduced with those values. McPlay's report does not reveal its actual raw save value, so the
host-specific input remains unconfirmed.

The corrected adapter treats empty transport values as a new game, then writes the normal version-1
save envelope. Contract coverage includes 15 empty representations and an already-decoded canonical
envelope. Unknown nonempty, malformed and newer saves remain protected against writes/deletion.
Retry reloads the SDK and application without clearing player data.

Independent review also prompted visible **Loading…** text, present before `firstFrameReady`.
The browser harness checks both uncaught page errors and `console.error`, including fresh-save
startup and subsequent save/reload with `{}`, `null`, `[]` and an empty JSON string.

## Exact upload artifact

- File: `releases/asmr-barber-fade-master-v3.84-mediacube-youtube.zip`
- ZIP: **400,846 bytes**; expanded: **1,060,972 bytes**; **11 files**.
- Largest file: `runtime/game.js`, **760,329 bytes** expanded / **271,619 bytes** compressed.
- SHA-256: `94305e43433372d371b5a277733f67d18a6dffa972225424ff20c56c2dc021ce`.
- Runtime commit: `9e6ff31ba9748187f18e772f6dbd7e8b761580fa`.
- CI portability correction: `4ce7138a0c88ef773d87299898fb85cecdfe9b5f` (no ZIP/runtime change).
- `BUILD-v3.84.json` records every runtime file hash.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Existing game/Bridge contracts | 35/35 PASS | [Contracts follow-up](https://github.com/lrodeveloperr/Haircut/actions/runs/38680883297) |
| Direct YouTube adapter contracts | 28/28 PASS from extracted ZIP | Contracts follow-up |
| Committed ZIP reproducibility | PASS, byte-for-byte match | [Contracts follow-up](https://github.com/lrodeveloperr/Haircut/actions/runs/38680883297) |
| Chromium integration | 16/16 PASS | [Browser run](https://github.com/lrodeveloperr/Haircut/actions/runs/38680739898) |
| Firefox integration | 15/15 PASS | Browser run |
| WebKit integration | 15/15 PASS | Browser run |
| Real official YouTube SDK under CSP | PASS, Chromium off-platform preview | Browser run |
| Independent YouTube Playables/McPlay expert review | No blocking code or packaging findings | Separate reviewing agent; final candidate hash verified |
| Archive structure and sizes | PASS | Valid CRC, root index.html, relative assets, licenses, no Bridge/test SDK/source files |

The first CI contract job passed the 35 existing contracts and rebuilt the exact ZIP, then failed because
`rg` was not installed on the runner. Release selection now uses Python's standard library. The
contracts-only follow-up supersedes that failed job; its workflow change leaves all upload bytes intact.

The new browser regression loops through four empty JSON inputs, then uses the native guard control,
saves and reloads each session. Other cases cover native cutting, exact haircut restoration, host
pause/mute and resize, rewarded success/cancellation/failure, persisted unlocks, replay, failed pre-ad
saves, protected unread/future saves, early host pause, and official-SDK off-platform preview.

The 27-viewport/four-state matrix and ten-minute/76-transition soak were not rerun for this narrow
save-parser/loading-label change. Their earlier v3.83 evidence is retained in
[VALIDATION-v3.83.md](VALIDATION-v3.83.md) and is not presented as a v3.84 run.

## Size guidance

Every entry is below McPlay's reported **15 MB per-file SHOULD** advisory, and both ZIP and expanded
contents are below the studio's 5,000,000-byte budgets. No entry approaches the 30 MiB MUST limit.

YouTube's [official stability requirements](https://developers.google.com/youtube/gaming/playables/certification/requirements_stability)
separately recommend individual files below **512 KiB**. The 760,329-byte engine file exceeds that
smaller recommendation; this remains an optional optimization, not a blocking size limit. This record
does not claim that all advisory recommendations are cleared. The portal's earlier 15 MB warning
cannot be attributed to an oversized entry in this exact archive.

The loading-label change follows the explicit-loading communication rule in
[official integration requirements, section 2](https://developers.google.com/youtube/gaming/playables/certification/requirements_integration).

## Remaining hosted observations

Replace the previous bundle with this exact ZIP in McPlay and rerun pre-flight. Verify fresh and
returning-player startup, save/reload, host pause/mute, completed/cancelled reward placements and an
ordinary-gameplay interstitial. Record portal results against the SHA-256 above.

A passing CI suite and static review do not establish McPlay certification, real YouTube cloud/ad
delivery or physical Android/iPhone performance. Unknown nonempty saved data intentionally still
shows recovery instead of being reset; if the same error persists, capture the host's save value shape
without deleting it so a compatible migration can be designed.
