/* Normalize legacy WebView CSS zoom geometry to modern viewport CSS pixels.
 * Visual zoom and the canvas remain unchanged. Only Android UI roots are scoped. */
(function () {
  'use strict';
  const HSC = window.HSC = window.HSC || {};
  const nativeRect = Element.prototype.getBoundingClientRect;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:0;top:0;width:10px;height:10px;zoom:2;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const legacyRectZoom = Math.abs(nativeRect.call(probe).width - 10) < .5;
  probe.remove();
  HSC.viewportCompat = { legacyRectZoom, rawRect: element => nativeRect.call(element) };
  if (!legacyRectZoom) return;
  Element.prototype.getBoundingClientRect = function () {
    const rect = nativeRect.call(this);
    if (!this.closest('.ui,#hsc-hud,#hsc-panel,#hsc-hub')) return rect;
    let scale = 1;
    // The renderer asks for this rect on every input event. Its only zoom is
    // the responsive UI scale; avoid computed-style walks on this hot path.
    if (this.classList.contains('play-area') || this.classList.contains('ui')) {
      scale = HSC.S || 1;
    } else {
      for (let element = this; element; element = element.parentElement) {
        const zoom = parseFloat(getComputedStyle(element).zoom);
        if (Number.isFinite(zoom) && zoom > 0) scale *= zoom;
      }
    }
    return new DOMRect(rect.x * scale, rect.y * scale, rect.width * scale, rect.height * scale);
  };
})();
