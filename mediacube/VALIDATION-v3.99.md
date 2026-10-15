# v3.99 — phone-confirmed official SDK startup

The owner reported that the official-SDK Site now works on their physical Android phone
at 18:16 Toronto time on 15 October 2026, with a screenshot of the rendered game.
This release is byte-identical in all 15 files to that successful Sites source commit
`4ecd4a07abe954ff74c3b8700bdfe8de02144f42` and deployment
`appgdep_6ad14fe6e5408191b7195a6080412047`.

The previously failing SDK build used bare local asset URLs. The successful build gives
every startup script, stylesheet and reflection asset a URL containing its content hash.
The reflection preload and runtime fetch use exactly the same URL. Existing script order,
blocking first official SDK and `game.js?entry=src/main.js` parameter are preserved.
The shared source helper applies the same rule when generating the standalone preview.

The existing failure panel also now shows bounded exception name/message, SDK version,
script line and startup phase. HTTP, blob and data resource URLs are removed from messages.
The diagnostic identifier `sdk-v3.98-d1` is intentionally retained because these exact
loader bytes are part of the phone-confirmed build; the release filename is v3.99.

All game/customer, production SDK client, startup, styles and lighting bytes match v3.98.
Controls, full graphics, saves, ads and normal gameplay have not changed. The SDK is real;
missing SDK code still reaches recovery rather than installing a mock or silently bypassing it.

Validation: 41/41 direct SDK contracts and 5/5 fixed-quality policy checks pass locally.
Exact lossless lighting parity passes. The new cache URL gate verifies nine local references,
rejects changed payloads at old URLs, checks SDK order and the engine entry parameter,
and requires one matching reflection preload/fetch URL. It passes this release and rejects
v3.98's unversioned startup references. Independent diagnostic checks pass in jsdom.
Final GitHub packaging/startup/Windows checks are pending when this record is created.
The existing broader v3.98 browser, graphics and layout evidence applies to unchanged
engine/customer/style bytes; those long checks are not repeated for URL generation alone.

The original phone exception was hidden by BOOT and was never recovered. Cached-file
mismatch is supported by the successful controlled change, but is not proven by that
exception's stack. Actual McPlay/YouTube host functionality, monetized ads and cloud-save
validation remain separate. Nothing has been uploaded to McPlay.

Release: `releases/asmr-barber-fade-master-v3.99-mediacube-youtube.zip`.
Size: 725,449 bytes; expanded: 1,415,322 bytes.
SHA256: `c9c10d3902490cce520299678aa760482cdd66eddc0d31dc2e20d8ec5f264f8e`.
