// A separate UMP control, shown only when Google's current regional status requires it.
(function (HSC) {
  'use strict';
  const initialize = HSC.wardrobeInit;
  if (typeof initialize !== 'function') throw Error('Ad choices require the wardrobe initializer');
  HSC.wardrobeInit = async function (options) {
    const result = await initialize.call(this, options);
    const policy = document.querySelector('#hsc-panel .hsc-head .hsc-privacy');
    if (!policy || document.querySelector('.hsc-ad-options')) return result;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hsc-btn hsc-ad-options';
    button.setAttribute('aria-label', 'Ad privacy choices');
    button.title = 'Ad privacy choices';
    button.style.flex = '0 0 auto';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3l15 9L5 21z"/><path d="M10 10v5"/><circle cx="10" cy="7.5" r=".6" fill="currentColor" stroke="none"/></svg>';
    button.addEventListener('click', () => AndroidHost.showPrivacyOptions());
    const update = () => {
      button.hidden = !globalThis.__androidPrivacyOptionsRequired;
      button.style.display = button.hidden ? 'none' : '';
    };
    update();
    policy.before(button);
    window.addEventListener('android-privacy-options', update);
    return result;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
