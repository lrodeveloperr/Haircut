# Android production bundle — v1.0.12 (13)

Built and verified on 1 November 2026 for the existing Play app `com.worksbien.barbersimulatorasmr`.

| Field | Verified value |
| --- | --- |
| Local filename | `android/native/app/build/outputs/bundle/release/app-release.aab` |
| Version | 1.0.12, code 13 |
| Bytes | 5,280,772 |
| SHA-256 | `207fc5c8060c82540df54ba2cc94340b6f6b65388ef64d11a8c01869da8f65eb` |
| Package | `com.worksbien.barbersimulatorasmr` |
| Min / target API | 26 / 36 |
| Upload certificate SHA-256 | `80:21:E4:A8:4C:13:7A:36:34:B6:43:76:E1:F9:3A:1A:5D:45:E6:5D:E6:26:90:A3:8B:11:EF:30:D6:14:B2:FB` |

## Change

- Improves startup reliability on affected mobile GPUs by compiling the existing full-detail scene in small, frame-separated submissions before the first draw.
- Each stage confirms that the WebGL context remains valid, and startup records completion of the first GPU-rendered frame.
- The scene itself is unchanged: 30,000 scalp strands, 8-segment hair/beard geometry, the full shader path, antialiasing, resolution policy, graphics, controls, gameplay, content and advertising behavior are preserved.

## Verification

- Full release rebuild, native unit tests, release lint, R8 optimization, signing and AAB generation passed.
- `jarsigner` reports `jar verified`; the upload certificate fingerprint matches the approved WorksBien upload key.
- Bundletool 1.18.3 validation passed and confirmed the staged Android startup runtime is packaged.
- The packaged manifest reports version 13 (1.0.12), min API 26 and target API 36.
- A real Samsung Galaxy A36 5G (SM-A366B, Android 16) completed three controlled cold starts. Every launch reached the foreground with the full-detail haircut visibly rendered.
- Physical-device scans found no `CONTEXT_LOST_WEBGL`, `GL_OUT_OF_MEMORY`, `IOCTL_KGSL`, Java/native fatal exception, SIGSEGV, out-of-memory exception or app ANR.
- The temporary Remote Test Lab Stay Awake setting was restored to `0` after testing.

## Google Play

Google Play accepted this exact AAB as production version **13 (1.0.12)**. The preview retains all 11,543 supported phones and 6,484 supported tablets with zero devices removed, target API 36, a 2.81 MB estimated new-install size and a 361 KB estimated update size. Release notes were supplied for all 19 configured Play locales, all targeted countries are retained and the rollout is prepared at 100%.

The owner confirmed the final action on 1 November 2026. Google Play accepted **Submit 1 change for review**, displayed **1 change sent for review**, and moved production version 13 (1.0.12) to **Changes in review**. Automated quick checks showed less than a minute remaining. Managed publishing is off, so the 100% rollout will proceed automatically if Google approves the release.
