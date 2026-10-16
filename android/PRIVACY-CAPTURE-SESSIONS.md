# Android privacy build and capture sessions — 16 October 2026

Repository-local continuation ledger for `.github/workflows/android-apk.yml`. This workflow is the app build/verification gate, so compile/lint/domain checks remain. Focused follow-ups reuse its APK build and one emulator boot, avoiding repeated cutting/rotation checks when application source is unchanged.

| Source / run | Outcome | Evidence / cause |
| --- | --- | --- |
| `d1a3123` / [38948587734](https://github.com/lrodeveloperr/Haircut/actions/runs/38948587734) | Cancelled, partial | Build/domain/browser/compile/lint/signature passed. Installed phone portrait/landscape passed. Superseded by source review preserving Close focus; intermediate menu/ad additions were later removed on owner instruction. |
| `e485782` / [38949610005](https://github.com/lrodeveloperr/Haircut/actions/runs/38949610005) | Failed | Build/domain/browser/compile/lint/signature passed. UiAutomation returned null root with exit 0 and no XML. Bounded observation retry now includes reading the missing file; placement assertions remain strict. |
| `591b3db` / [38950870866](https://github.com/lrodeveloperr/Haircut/actions/runs/38950870866) | Failed, 27 checks passed | All four privacy intent/layout/return paths, cutting/guards, live resizes and background/resume passed. Offline-ad fixture failed to close a real cached Google Test Ad. Four wardrobe PNGs were stale compositor frames, so those images were not accepted as visual evidence. |
| `018cb5b` / [38952909900](https://github.com/lrodeveloperr/Haircut/actions/runs/38952909900) | Cancelled during post-job cleanup | Compile/lint/signature and the complete installed lifecycle step PASSED; artifact uploaded. Superseded by combined pixel-checked privacy recapture. Application source unchanged. |
| `bef3f31` / [38953250070](https://github.com/lrodeveloperr/Haircut/actions/runs/38953250070) | SUCCESS | All 13 focused native checks passed. Four correctly rendered wardrobe views visually checked; existing bounds unchanged; external policy intent/return, real cached-ad opened/earned/closed, resume and force-stop save restoration passed. |

Final artifact `12070520546` was downloaded once and contained 11/11 expected native PNGs: four wardrobe, four external-handler, one held-blade, one cached Google Test Ad and relaunch. The APK runtime is byte-identical to the direct-link build's application source; only QA/workflow/documentation changed. Artifact `12068464011` was also downloaded once for diagnosis of the earlier failed run; its 19 PNGs included a failure diagnostic and lacked relaunch, and its four stale wardrobe captures were superseded.

The four-layout browser check separately produced eight reviewed before/after PNGs from the actual generated Android web bundle. No existing control/card/panel bounds moved. Native capture now flushes the compositor and checks actual cream button pixels rather than relying only on a DOM-open state.

Final run elapsed 5m53s (19:14:06Z–19:19:59Z from run metadata). Billed runner minutes, phase/capture timings, time to usable raws, assistant-call counts and avoided-runner estimates were not measured; they are unknown, not zero. All runs were commit-triggered without manual workflow dispatches. Production ad IDs were never configured and app advertising logic was not changed by QA repairs.
