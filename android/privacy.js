// Android-only policy access. The shared game, wardrobe layout and cutting renderer stay unchanged.
(function (HSC) {
  'use strict';
  const initialize = HSC.wardrobeInit;
  if (typeof initialize !== 'function') throw Error('Privacy control requires the wardrobe initializer');
  HSC.wardrobeInit = async function (options) {
    const result = await initialize.call(this, options);
    const header = document.querySelector('#hsc-panel .hsc-head');
    const close = header && header.querySelector('.hsc-x');
    if (!close || header.querySelector('.hsc-privacy')) return result;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hsc-x hsc-privacy';
    button.setAttribute('aria-label', 'Privacy');
    button.title = 'Privacy';
    button.style.flex = '0 0 auto';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 5-4 8-7 10-3-2-7-5-7-10V6l7-3z"/><rect x="8.5" y="10.5" width="7" height="6" rx="1.2"/><path d="M10 10.5V9a2 2 0 014 0v1.5"/></svg>';
    button.addEventListener('click', () => AndroidHost.openPrivacy());
    // Consume existing flexible header space; both tabs, Close and all cards keep their bounds.
    header.insertBefore(button, close);
    return result;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
