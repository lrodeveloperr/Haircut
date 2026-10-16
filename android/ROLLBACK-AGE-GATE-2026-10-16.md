# Owner-requested rollback — 16 October 2026

The owner rejected the unapproved native age question and blanket under-18 ad block, instructed their reversal, and now requires approval before future changes. No replacement monetization design, audience change or new consent UI is authorized.

## Completed

- Build **1.0.8 (9)** removed from Google review. Live Console now shows Changes not yet submitted for review; release details say Not yet sent for review. No publication occurred.
- Native Android implementation, resources, manifest, version and test/workflow source restored byte-for-byte to pre-age-gate source `9032cdf838cb01673c31ae29f6d82c692570c94d`. The age dialog, preference, backup exclusions and all ad-block guards are removed.
- Original consent behavior, AdMob unit IDs, general-audience creative ceiling, rewarded callbacks, two separate optional completed videos per daily item, partial credits and interstitial scheduling restored without new product behavior.
- Original signed **v1.0.7 (8)** rechecked: **5,188,387 bytes**, SHA-256 `cecc1c906ec50e1d3ef03fc888f4bf53dea5af4844213080b3063bda65bcbfbd`, exact original build source `1b28d3eec9f15371398284b0e3237a5540130a78`. Age-gate identifiers absent from DEX; production reward/interstitial IDs present. All 18 bundled game assets match current source. Renderer SHA-256 `d553e1a9109cbf79aae7d8f4b051e71c58244e4a729fcbdf953a4f26b62f590b` unchanged.
- No new build, emulator session, screenshot campaign or live ad request. Reuse original signing/bundle/native verification evidence in `RELEASE-AAB-1.0.7.md`, `ADMOB-RELEASE-SETUP.md` and privacy QA records.
- Original ten full descriptions restored in source; validator passes all 30 fields. Advertising ID and AI artwork declarations retained.
- Unapproved age-band paragraph removed from public privacy source, website commit `b84473749ee137893747d88b9907cc98d8b83ded`.
- Owner approval boundary recorded in root `AGENTS.md` and canonical handoff.

## Pending approval / blocker

The Console replacement is not complete. Automatic approval review rejected clicking **Discard release**, citing a destructive/costly-to-recreate draft action and asking for explicit authorization. No bypass was attempted. The safer **Manage artifact** menu returned unexpected Console error `(451B47CD)` and offered no replacement action. The existing build 9 release remains withdrawn, not deleted or resubmitted.

Proposed next action for owner approval: discard only the withdrawn **1.0.8 (9) release**, create its replacement from the already uploaded original **1.0.7 (8)** bundle, retain/reapply the ten original release notes and existing rollout/countries, remove the added age-specific availability wording from live descriptions, verify Console checks, then resubmit. The original AAB and release-note source are preserved. If Console requires a higher version code, stop and explain before rebuilding.

## Rating impact

Keeping optional rewarded ads does not automatically raise the IARC content rating. Existing results are **ESRB Everyone / PEGI 3**. Ads and their offers must remain suitable for that content rating; general-audience ad filtering stays in place. Declared target audience **13+** is separate and has not been changed. Contains ads remains Yes. No guarantee of legal compliance or Google approval is made by this rollback.

Official reference reviewed: https://support.google.com/googleplay/android-developer/answer/9859655
