// Android-only policy access. Privacy is a text action under Settings; gameplay stays unchanged.
(function (HSC) {
  'use strict';
  if (!HSC.settings || typeof HSC.settings.addAction !== 'function') throw Error('Privacy control requires Settings');
  // the same policy page Android opens natively (MainActivity.openPrivacy)
  const POLICY = 'https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/';
  HSC.settings.addAction({
    id: 'privacy', label: 'privacy', fallback: 'Privacy', className: 'hsc-privacy',
    // Android hands the policy to its external browser. A web host has no AndroidHost: the tap must not
    // throw, so the policy opens in a new browser tab and the game stays where it was.
    run: () => {
      const host = globalThis.AndroidHost;
      if (host && typeof host.openPrivacy === 'function') return host.openPrivacy();
      try { globalThis.open(POLICY, '_blank', 'noopener'); } catch (_) {}
    },
  });
})(globalThis.HSC || (globalThis.HSC = {}));
