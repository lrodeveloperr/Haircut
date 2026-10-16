# Android production bundle — v1.0.8 (9)

**WITHDRAWN — DO NOT SUBMIT.** The owner rejected the unapproved age gate/ad block. Build 9 was removed from review and remains only an unsubmitted Console release. Restore the original signed v1.0.7 (8) after explicit approval. [Rollback record](ROLLBACK-AGE-GATE-2026-10-16.md).

Historical record: built and validated on 16 October 2026 for the existing Play app `com.worksbien.barbersimulatorasmr`.

| Field | Verified value |
| --- | --- |
| Filename | `barber-simulator-asmr-v1.0.8-build-9.aab` |
| Version | 1.0.8, code 9 |
| Bytes | 5,192,721 |
| SHA-256 | `5b0ada5bca61d63dd5ade02418e3af8283041fb501a5c0114d54b3459ca31e42` |
| Exact build source | `bb81bc267d2b1ef4f91db10e41ef69f9510928da` |
| Min / target API | 26 / 36 |
| Upload certificate SHA-256 | `727531495d2f6da99c81055f6bc9fefea1b7dca5846741a0de8986bb4d69e059` |
| Play measured new-install download | 2.77 MB |

This supersedes v1.0.7 (8), which was uploaded only to a draft and removed from the production release before submission. The same dedicated upload key is used. Its private backup and restoration instructions remain in [the signing record](RELEASE-AAB-1.0.7.md); no private key or password is committed.

## Changes and verification

- A neutral, localized native age choice precedes advertising. Unknown and under-18 players do not reach UMP, explicit Mobile Ads initialization or ad requests. Adults retain UMP consent/privacy choices and existing advertising.
- The selected age band stays in private preferences and is excluded from OS cloud backup and device transfer. No birth date or age-band network flow was added.
- Core game assets, renderer, cutting controls and earned-reward rules are unchanged. All 18 bundled game files match verified source; renderer SHA-256 remains `d553e1a9109cbf79aae7d8f4b051e71c58244e4a729fcbdf953a4f26b62f590b`.
- Clean debug/release compilation and Android lint pass with zero errors. Strict JAR signature verification, bundle validation, signed APK generation and certificate verification pass.
- Production AdMob IDs verified in the final artifact; Google test IDs absent. Debug remains test-only. No live ads requested or clicked during verification.
- Non-debuggable, not test-only, cleartext disabled, no native `.so`, no camera, microphone, contacts, media or location permission added.
- Age-preference and backup-exclusion resources verified in the compiled artifact. Subsequent test/CI-only commits through `6bd8679521024ae9d47133ce19e0a0d7cca96f2e` change no application or game source. Installed debug verification passed all 11 age/privacy checks across four layouts; four native raw captures were inspected. See [combined evidence](qa/age-gate-2026-10-16.json).

## Play state

Uploaded and parsed successfully. The production draft contains only 9 (1.0.8), 177 countries/regions including rest of world and excluding mainland China, and release notes in ten languages. Release preview: **Ready to release**, no validation error. All 21 changes were submitted for Google review. At 2026-10-16T21:22:13Z, final quick checks were complete and Console explicitly showed **Changes in review** / **Your changes are now in review**. Managed publishing off; full rollout follows approval. Approval/publication remains pending.

Verified Console URL: https://play.google.com/console/u/0/developers/7097804603172918698/app/4975100930006889688/publishing

Implementation merged in PR #10 at `9d371552d05ff97a96d423bc3bf65b2f910b5cab`; CI test source `6bd8679521024ae9d47133ce19e0a0d7cca96f2e` passed the remaining five tablet checks, preserving six phone checks from the preceding run. The exact AAB was not rebuilt for test/documentation-only changes.
