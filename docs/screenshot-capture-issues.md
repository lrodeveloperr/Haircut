# Screenshot capture issue ledger

Record every failed, cancelled, degraded, or unexpectedly expensive screenshot run. A `fixed` entry must cite a successful verifying run.

## SC-0C9B2AB447 — uiautomator helper exits 137 after successful fresh XML dump
<!-- screenshot-issue-json: {"first_observed":"2026-10-16T21:13:10+00:00","fix":"Remove stale XML before dump, accept status 137 only with successful-write stdout and a fresh valid hierarchy; retry observation errors at most three times.","id":"SC-0C9B2AB447","last_updated":"2026-10-16T21:23:30+00:00","minutes_wasted":3.8,"notes":"Successful tablet follow-up recovered one missing XML via bounded observation retry; status-137 branch did not recur. Six phone checks and three raws preserved; five tablet checks and one new raw passed.","platform":"android","prevention":"Never reuse old XML or retry failed app assertions. Preserve completed checks/raws and focus remaining layouts.","repo":"lrodeveloperr/Haircut","root_cause":"UIAutomation observation helper was killed after reporting XML written during display changes; no app assertion failed at that point.","runner":"ubuntu","runs":["https://github.com/lrodeveloperr/Haircut/actions/runs/38967133699"],"signature":"uiautomator helper exits 137 after successful fresh XML dump","stage":"native-inspection","status":"mitigated","symptom":"Phone age/denial/relaunch checks passed; tablet observation command returned 137 after reporting hierarchy written","verified_run":"https://github.com/lrodeveloperr/Haircut/actions/runs/38967888876","workflow":"Android APK"} -->

- Status: `mitigated`
- Repository: `lrodeveloperr/Haircut`
- Workflow: `Android APK`
- Platform / runner: `android` / `ubuntu`
- Stage: `native-inspection`
- First observed: 2026-10-16T21:13:10+00:00
- Last updated: 2026-10-16T21:23:30+00:00
- Occurrences: 1
- Runner minutes wasted: 3.8
- Runs:
  - https://github.com/lrodeveloperr/Haircut/actions/runs/38967133699

**Symptom:** Phone age/denial/relaunch checks passed; tablet observation command returned 137 after reporting hierarchy written

**Root cause:** UIAutomation observation helper was killed after reporting XML written during display changes; no app assertion failed at that point.

**Fix:** Remove stale XML before dump, accept status 137 only with successful-write stdout and a fresh valid hierarchy; retry observation errors at most three times.

**Verified by:** https://github.com/lrodeveloperr/Haircut/actions/runs/38967888876

**Prevention:** Never reuse old XML or retry failed app assertions. Preserve completed checks/raws and focus remaining layouts.

**Notes:** Successful tablet follow-up recovered one missing XML via bounded observation retry; status-137 branch did not recur. Six phone checks and three raws preserved; five tablet checks and one new raw passed.

## SC-1140E6EF57 — awaitPromise native callback timeout leaves CDP socket alive
<!-- screenshot-issue-json: {"first_observed":"2026-10-16T21:06:40+00:00","fix":"Wait actual game globals, fire native request then poll its real callback in bounded CDP calls; always close socket and exit after synchronous evidence writes.","id":"SC-1140E6EF57","last_updated":"2026-10-16T21:23:30+00:00","minutes_wasted":7.1,"notes":"","platform":"android","prevention":"Bound WebView readiness and every CDP operation; clean up socket on success/failure.","repo":"lrodeveloperr/Haircut","root_cause":"Fixture did not wait for actual bundled-game startup and kept its CDP socket alive after timeout. Same-evaluation native await also made timing unreliable; a cross-thread deadlock was not established.","runner":"ubuntu","runs":["https://github.com/lrodeveloperr/Haircut/actions/runs/38966116551"],"signature":"awaitPromise native callback timeout leaves CDP socket alive","stage":"native-ad-callback","status":"fixed","symptom":"First neutral native age choice passed; native callback test timed out and leaked socket kept runner active","verified_run":"https://github.com/lrodeveloperr/Haircut/actions/runs/38967888876","workflow":"Android APK"} -->

- Status: `fixed`
- Repository: `lrodeveloperr/Haircut`
- Workflow: `Android APK`
- Platform / runner: `android` / `ubuntu`
- Stage: `native-ad-callback`
- First observed: 2026-10-16T21:06:40+00:00
- Last updated: 2026-10-16T21:23:30+00:00
- Occurrences: 1
- Runner minutes wasted: 7.1
- Runs:
  - https://github.com/lrodeveloperr/Haircut/actions/runs/38966116551

**Symptom:** First neutral native age choice passed; native callback test timed out and leaked socket kept runner active

**Root cause:** Fixture did not wait for actual bundled-game startup and kept its CDP socket alive after timeout. Same-evaluation native await also made timing unreliable; a cross-thread deadlock was not established.

**Fix:** Wait actual game globals, fire native request then poll its real callback in bounded CDP calls; always close socket and exit after synchronous evidence writes.

**Verified by:** https://github.com/lrodeveloperr/Haircut/actions/runs/38967888876

**Prevention:** Bound WebView readiness and every CDP operation; clean up socket on success/failure.

**Notes:** None

## SC-76CF3F259C — emulator action splits multiline shell if
<!-- screenshot-issue-json: {"first_observed":"2026-10-16T20:58:40+00:00","fix":"Use one Node dispatcher command with environment-based test selection.","id":"SC-76CF3F259C","last_updated":"2026-10-16T21:23:30+00:00","minutes_wasted":3.43,"notes":"","platform":"android","prevention":"Keep emulator-runner script one command or invoke a checked-in shell/script file.","repo":"lrodeveloperr/Haircut","root_cause":"Emulator runner executes script lines as separate shell commands, breaking multiline if/fi.","runner":"ubuntu","runs":["https://github.com/lrodeveloperr/Haircut/actions/runs/38965626289"],"signature":"emulator action splits multiline shell if","stage":"launch","status":"fixed","symptom":"sh end of file unexpected expecting fi; native test script never launched","verified_run":"https://github.com/lrodeveloperr/Haircut/actions/runs/38967888876","workflow":"Android APK"} -->

- Status: `fixed`
- Repository: `lrodeveloperr/Haircut`
- Workflow: `Android APK`
- Platform / runner: `android` / `ubuntu`
- Stage: `launch`
- First observed: 2026-10-16T20:58:40+00:00
- Last updated: 2026-10-16T21:23:30+00:00
- Occurrences: 1
- Runner minutes wasted: 3.43
- Runs:
  - https://github.com/lrodeveloperr/Haircut/actions/runs/38965626289

**Symptom:** sh end of file unexpected expecting fi; native test script never launched

**Root cause:** Emulator runner executes script lines as separate shell commands, breaking multiline if/fi.

**Fix:** Use one Node dispatcher command with environment-based test selection.

**Verified by:** https://github.com/lrodeveloperr/Haircut/actions/runs/38967888876

**Prevention:** Keep emulator-runner script one command or invoke a checked-in shell/script file.

**Notes:** None

