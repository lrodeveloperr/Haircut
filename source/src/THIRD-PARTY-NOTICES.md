# Third-party notices

- Three.js 0.180.0: MIT; licenses/three-MIT.txt.
- Preact 10.27.2: MIT; licenses/preact-MIT.txt.
- License sources: https://github.com/mrdoob/three.js/blob/r180/LICENSE and https://github.com/preactjs/preact/blob/10.27.2/LICENSE. The referenced texts are copied into every build.
- Embedded quantised head: inherited from supplied game; its existing README identifies MakeHuman CC0 provenance. No new external character assets added.
- Customer head shapes (Android build only, `customers/headshapes-data.js`): derived from the MakeHuman hm08 base mesh and targets, released CC0 by Data Collection AB in September 2020, read from the MPFB 2.0.18 bundled data by `tools/head-shapes/bake.mjs`.
- Playgama Bridge: official CDN runtime, subject to platform distribution terms.
- esbuild 0.25.10: MIT build tool, no runtime network dependency.

## Phosphor Icons

Interface icons in `source/customers/icons.js` are from Phosphor Icons (@phosphor-icons/core 2.1.1).
MIT License. Copyright (c) 2023 Phosphor Icons. https://github.com/phosphor-icons/core

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
