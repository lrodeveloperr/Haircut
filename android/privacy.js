// Android-only policy access. Privacy is a text action under Settings; gameplay stays unchanged.
(function (HSC) {
  'use strict';
  if (!HSC.settings || typeof HSC.settings.addAction !== 'function') throw Error('Privacy control requires Settings');
  HSC.settings.addAction({
    id: 'privacy', label: 'privacy', fallback: 'Privacy', className: 'hsc-privacy',
    run: () => AndroidHost.openPrivacy(),
  });
})(globalThis.HSC || (globalThis.HSC = {}));
