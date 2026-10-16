# Android naming, listing and daily reward validation

Validated locally on 15 October 2026 (America/New_York).

## Listings

- Selected English name: **Barber Simulator: ASMR Haircut** (30 characters).
- Ten complete language listings: en-US, es-419, pt-BR, fr-FR, de-DE, ar, ja-JP, ko-KR, id and hi-IN.
- All 30 title/short/full fields pass the current Google Play 30/80/4000 character limits.
- JSON copy matches the per-locale UTF-8 text files; NFC and ASMR inclusion pass.
- Each full description includes the optional two-video daily unlock using natural local wording.
- Language wording was editorially reviewed here; no independent native-speaker certification is claimed.

Command: `python3 android/validate-listings.py` — PASS.

## Reward behavior

Command: `node android/tests/rewards.cjs` — PASS, eight cases covering two-credit requirements and badges, first-credit save, cancellation/error, restore and second-credit unlock/equip, independent cape credits, duplicate input, legacy isolation, and Android title/accessibility metadata.

Command: `TARGET=full bash source/buildall.sh` — PASS, including syntax checks of the generated Android web runtime. Its page title is the selected Android title and its daily design requirement is two completed rewarded videos.

## Default build isolation

`bash source/buildall.sh` passed before and after the change. SHA-256 values of the default outputs matched byte for byte:

- runtime/customers.js: `ba42e7743bb06ec0e1df099e2bfd53e1cbe3c063c1cc2bca29fd1eee61034a19`
- index.html: `a95980c216dfb7b2682aaa1a4de9aea7d4a93ed4a839586781ec3e79c0cf343d`

The shared catalog/wardrobe source, direct YouTube builder and existing release archives were not edited. `git diff --check` passed.

## Scope of proof

These checks prove the prepared listing fields and the Android-targeted web runtime's reward logic. They do not demonstrate native AdMob delivery, final APK/AAB size, Play Console metadata upload or a published Android app. Android packaging and its earned-reward callback bridge remain to be implemented.
