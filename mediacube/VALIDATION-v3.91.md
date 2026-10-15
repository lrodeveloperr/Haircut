# v3.91 fixed full-detail graphics validation

v3.91 removes the in-play adaptive scaling that v3.85 introduced. Previously, sustained slow frames
lowered resolution to 1.5x and then scalp strands to 24,000. Now detail is fixed at full for the
whole session: 30,000 strands, eight segments, full beards and skin shading, MSAA and native
resolution up to 2x. Startup recovery and error codes are unchanged from v3.90.

## Checks

- Graphics contracts 5/5: sustained overload at 40, 100 and 250 ms frames never lowers anything;
  the resolution floor equals the full ratio at every viewport and DPR; frame times are still measured.
- Chromium full-detail renders 3/3 at 390x844 DPR2, 360x640 DPR3 and 768x1024 DPR2. The canvas is
  now required to be at the full ratio (previously at least 1.49x).
- Chromium startup suite 10/10. Direct SDK contracts 40/40; domain/legacy contracts 35/35.
- Local Chromium standard suite: 9/17 and 12/17 on two runs. The unchanged v3.87 ZIP fails 3 here.
  The extra failures are one page-reload timeout and the tests that run on the page while it is
  still reloading. This container renders on a CPU (SwiftShader), and without the old downgrade every
  frame stays at full cost there. CI also renders in software, so the same timeouts may show there.
  That reflects the test machine, not a phone GPU.

Not uploaded to McPlay and not run on a physical phone.
