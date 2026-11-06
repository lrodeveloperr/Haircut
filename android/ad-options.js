// A separate Settings action, shown only when Google's current regional UMP status requires it.
(function (HSC) {
  'use strict';
  if (!HSC.settings || typeof HSC.settings.addAction !== 'function') throw Error('Ad choices require Settings');
  HSC.settings.addAction({
    id: 'ad-options', label: 'ad_choices', fallback: 'Ad choices', className: 'hsc-ad-options',
    visible: () => !!globalThis.__androidPrivacyOptionsRequired,
    run: () => AndroidHost.showPrivacyOptions(),
  });
  window.addEventListener('android-privacy-options', () => HSC.settings.refresh());
})(globalThis.HSC || (globalThis.HSC = {}));
