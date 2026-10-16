# Signed Android AAB — v1.0.7 (8)

Built and verified 16 October 2026. This record completes upload signing and production AAB generation. Store upload/submission is the next stage.

## Exact release

- App: Barber Simulator: ASMR Haircut.
- Package: `com.worksbien.barbersimulatorasmr`.
- Version: **1.0.7**, code **8**; minimum API 26, target API 36.
- Application source: `1b28d3eec9f15371398284b0e3237a5540130a78`. Later documentation-only commits do not change the bundled application.
- File: `barber-simulator-asmr-v1.0.7-build-8.aab`, **5,188,387 bytes** (5.19 MB).
- AAB SHA-256: `cecc1c906ec50e1d3ef03fc888f4bf53dea5af4844213080b3063bda65bcbfbd`.
- `bundletool` 1.18.3 estimated compressed download: **2,657,970–2,677,236 bytes** (about 2.7 MB), across its generated device configurations. This is an estimate; use Play Console's measured download sizes before making an exact store-size claim.

## Upload signing

- Dedicated upload key: **RSA 4096-bit**, alias `barber-upload`; PKCS12 keystore, random password.
- Public upload certificate: [upload-certificate.pem](signing/upload-certificate.pem).
- SHA-256 fingerprint: `72:75:31:49:5D:2F:6D:A9:9C:81:05:5F:6B:C9:FE:FE:A1:B7:DC:A5:84:67:41:A0:DE:89:86:BB:4D:69:E0:59`.
- Certificate valid 2026-10-14T20:30:56+00:00 through 2054-03-01T20:30:56+00:00.
- The private key is outside git. `android/native/keystore.properties` is ignored and kept with restrictive local permissions. No signing secret is in this repository or inside the AAB.
- The separately saved **PRIVATE-barber-upload-signing-backup.zip** contains the private key, portable signing properties, public certificate and restoration instructions. Keep this backup private. Restore `upload.p12` and `keystore.properties` from it into `android/native/` when building in another environment; reuse this key rather than generating a new one for an update.
- GitHub Actions signing secrets have not been configured; the verified direct local build lane was used. This does not register the upload certificate in Play Console. First-upload Play App Signing setup remains with store upload; the upload key remains distinct from Google's app signing key.

## Verification completed

- `bundleRelease lintRelease`: PASS; **zero release lint errors**; R8 optimization/resource shrinking enabled.
- Strict `jarsigner` verification against the upload keystore/alias: PASS.
- `bundletool validate`: PASS.
- Device APK-set generation from this exact AAB: PASS. Generated base APK signature verified and matched the upload certificate.
- Actual bundled manifest: canonical package/version, non-debuggable, not test-only, cleartext disabled, correct production AdMob app ID.
- Compiled release DEX: both production ad-unit IDs present; all three debug app/unit IDs absent.
- All **18** bundled game assets match the verified build byte for byte. Approved renderer SHA-256 remains `d553e1a9109cbf79aae7d8f4b051e71c58244e4a729fcbdf953a4f26b62f590b`. The existing cutting/clipper/graphics/reward behavior was not changed for signing.
- No native `.so` libraries in the AAB. No private keystore/properties/password file in the bundle.
- No camera, microphone, precise-location, contacts or personal-media/storage permission introduced.
- No live ad was requested, displayed or clicked during artifact verification. This offline artifact verification does not assert physical-device UMP form rendering or AdMob serving approval.

## Continuation

Upload this exact AAB to existing Play app `com.worksbien.barbersimulatorasmr`, app ID `4975100930006889688`, and verify its accepted version/hash/certificate. Complete first-upload signing setup, final Console advertising/region/age declarations and automated checks before sending the release for review. Do not create another Play app. Post-publication store linking and AdMob readiness review remain separate.

Primary tooling references: https://developer.android.com/studio/publish/app-signing and https://developer.android.com/tools/bundletool.
