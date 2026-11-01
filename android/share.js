// Android-only completion share: four real renders of the finished haircut, then the native Sharesheet.
(function (HSC) {
  'use strict';
  const host = globalThis.AndroidHost;
  const initialize = HSC.hubInit;
  if (!host || typeof host.shareGame !== 'function' || typeof initialize !== 'function') return;

  const SIZE = 46;
  const TOP_GAP_RATIO = .16;
  const HEAD_SIDE_PADDING = 20;
  const ANGLES = [180, 90, 0, -90]; // front, right profile, back, left profile
  const image = (src) => new Promise((resolve, reject) => {
    const node = new Image();
    node.onload = () => resolve(node);
    node.onerror = reject;
    node.src = src;
  });

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function cover(ctx, img, x, y, width, height) {
    const iw = img.naturalWidth || img.width || 1, ih = img.naturalHeight || img.height || 1;
    const scale = Math.max(width / iw, height / ih);
    const sw = width / scale, sh = height / scale;
    ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, width, height);
  }

  function alphaBounds(canvas, fromY = 0, toY = canvas.height) {
    const width = canvas.width, height = canvas.height;
    const top = Math.max(0, Math.floor(fromY)), bottom = Math.min(height, Math.ceil(toY));
    const data = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height).data;
    let left = width, right = -1, first = height, last = -1;
    for (let y = top; y < bottom; y++) for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 20) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < first) first = y;
      if (y > last) last = y;
    }
    return right < left ? null : { x: left, y: first, width: right - left + 1, height: last - first + 1 };
  }

  function analyseCutout(canvas) {
    const bounds = alphaBounds(canvas) || { x: 0, y: 0, width: canvas.width, height: canvas.height };
    // The upper 76% isolates the head from the wide cape. It lets the three narrow supporting
    // portraits keep the whole haircut visible while the real cape can bleed naturally off the sides.
    const head = alphaBounds(canvas, bounds.y, bounds.y + bounds.height * .76) || bounds;
    return { image: canvas, bounds, head };
  }

  function drawPortrait(ctx, cutout, x, y, width, height) {
    const { image, bounds, head } = cutout;
    const scale = (height * (1 - TOP_GAP_RATIO) + 3) / bounds.height;
    const drawWidth = bounds.width * scale, drawHeight = bounds.height * scale;
    const headCenter = (head.x - bounds.x + head.width / 2) * scale;
    const drawX = x + width / 2 - headCenter;
    const drawY = y + height * TOP_GAP_RATIO;
    ctx.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height,
      drawX, drawY, drawWidth, drawHeight);
  }

  function cleanCutout(img) {
    const width = img.naturalWidth || img.width, height = img.naturalHeight || img.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height);
    const data = pixels.data, count = width * height;
    const corners = [0, width - 1, (height - 1) * width, count - 1];
    const bg = [0, 1, 2, 3].map(channel =>
      corners.reduce((sum, pixel) => sum + data[pixel * 4 + channel], 0) / corners.length);
    const seen = new Uint8Array(count), queue = new Int32Array(count);
    let start = 0, end = 0;
    const background = pixel => {
      const offset = pixel * 4, alpha = data[offset + 3];
      if (alpha < 24) return true;
      return Math.abs(data[offset] - bg[0]) + Math.abs(data[offset + 1] - bg[1])
        + Math.abs(data[offset + 2] - bg[2]) + Math.abs(alpha - bg[3]) < 72;
    };
    const add = pixel => {
      if (!seen[pixel] && background(pixel)) { seen[pixel] = 1; queue[end++] = pixel; }
    };
    for (let x = 0; x < width; x++) { add(x); add((height - 1) * width + x); }
    for (let y = 1; y < height - 1; y++) { add(y * width); add(y * width + width - 1); }
    while (start < end) {
      const pixel = queue[start++], x = pixel % width;
      data[pixel * 4 + 3] = 0;
      if (pixel >= width) add(pixel - width);
      if (pixel < count - width) add(pixel + width);
      if (x) add(pixel - 1);
      if (x < width - 1) add(pixel + 1);
    }
    ctx.putImageData(pixels, 0, 0);
    return canvas;
  }

  function dividers(ctx, heroHeight, columns) {
    ctx.save();
    ctx.lineCap = 'butt';
    ctx.strokeStyle = '#fff2d6';
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.moveTo(0, heroHeight);
    ctx.lineTo(1080, heroHeight);
    for (const x of columns) {
      ctx.moveTo(x, heroHeight);
      ctx.lineTo(x, 1920);
    }
    ctx.stroke();
    ctx.strokeStyle = '#e9bd45';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.restore();
  }

  async function compose() {
    const game = globalThis.skinFadeStudio, renderer = HSC.view;
    if (!game || !renderer || typeof renderer.thumbnail !== 'function') throw new Error('Share renderer unavailable');
    const state = game.getState(), view = game.getView();
    if (!state || state.status !== 'reveal' || !view || !view.revealComplete) throw new Error('Haircut is not ready to share');

    const urls = ANGLES.map((yaw) => renderer.thumbnail(state.hair, yaw, 8, { headOnly: false, size: 640 }));
    if (urls.some((url) => typeof url !== 'string' || !url.startsWith('data:image/'))) throw new Error('Haircut capture failed');
    const [background, ...loadedHeads] = await Promise.all([
      image('./assets/backdrop-portrait.webp'),
      ...urls.map(image),
    ]);
    const heads = loadedHeads.map(head => analyseCutout(cleanCutout(head)));

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Share canvas unavailable');
    ctx.fillStyle = '#f7e8c8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const supports = [heads[0], heads[1], heads[3]];
    const ratioSum = supports.reduce((sum, head) => sum + head.head.width / head.bounds.height, 0);
    const availableWidth = 1080 - supports.length * HEAD_SIDE_PADDING * 2 - 3 * ratioSum;
    const supportHeight = Math.max(500, Math.min(760,
      Math.floor(availableWidth / ((1 - TOP_GAP_RATIO) * ratioSum))));
    const heroHeight = 1920 - supportHeight;
    const idealWidths = supports.map(head =>
      head.head.width * ((supportHeight * (1 - TOP_GAP_RATIO) + 3) / head.bounds.height)
        + HEAD_SIDE_PADDING * 2);
    const idealTotal = idealWidths.reduce((sum, width) => sum + width, 0);
    const supportWidths = idealWidths.map((width, index) =>
      index === idealWidths.length - 1 ? 1080 : Math.round(width / idealTotal * 1080));
    supportWidths[2] = 1080 - supportWidths[0] - supportWidths[1];
    const columns = [supportWidths[0], supportWidths[0] + supportWidths[1]];
    const panels = [
      { head: heads[2], x: 0, y: 0, width: 1080, height: heroHeight, hero: true },
      { head: heads[0], x: 0, y: heroHeight, width: supportWidths[0], height: supportHeight, hero: false },
      { head: heads[1], x: columns[0], y: heroHeight, width: supportWidths[1], height: supportHeight, hero: false },
      { head: heads[3], x: columns[1], y: heroHeight, width: supportWidths[2], height: supportHeight, hero: false },
    ];
    ctx.save();
    roundedRect(ctx, 9, 9, 1062, 1902, 44);
    ctx.clip();
    panels.forEach(panel => {
      const { head, x, y, width, height, hero } = panel;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
      cover(ctx, background, x, y, width, height);
      const shade = ctx.createLinearGradient(0, y, 0, y + height);
      shade.addColorStop(0, 'rgba(18,10,5,.10)');
      shade.addColorStop(.52, 'rgba(18,10,5,0)');
      shade.addColorStop(1, 'rgba(18,10,5,.12)');
      ctx.fillStyle = shade;
      ctx.fillRect(x, y, width, height);
      drawPortrait(ctx, head, x, y, width, height);
      ctx.restore();
    });
    ctx.restore();

    dividers(ctx, heroHeight, columns);
    ctx.save();
    ctx.strokeStyle = '#fff2d6';
    ctx.lineWidth = 24;
    roundedRect(ctx, 10, 10, 1060, 1900, 44);
    ctx.stroke();
    ctx.strokeStyle = '#e9bd45';
    ctx.lineWidth = 7;
    roundedRect(ctx, 10, 10, 1060, 1900, 44);
    ctx.stroke();
    ctx.restore();

    return canvas.toDataURL('image/jpeg', .9);
  }

  HSC.hubInit = function () {
    const result = initialize.apply(this, arguments);
    const hub = document.querySelector('#hsc-hub');
    if (!hub || hub.querySelector('.hsc-native-share')) return result;

    const style = document.createElement('style');
    style.textContent = `
.hsc-native-share{position:absolute;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));width:${SIZE}px;height:${SIZE}px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;background:#fff6e6;color:#2a1d15;border:3px solid #2a1d15;box-shadow:0 3px 0 #2a1d15;cursor:pointer;visibility:hidden;z-index:3}
.hsc-native-share>svg{display:block;width:24px;height:24px}
.hsc-native-share:active{transform:translateY(3px);box-shadow:0 1px 0 #2a1d15}
.hsc-native-share:disabled{cursor:wait;opacity:.78}
.hsc-native-share.busy>svg{animation:hsc-share-spin .8s linear infinite}
@keyframes hsc-share-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.hsc-native-share.busy>svg{animation:none}}
`;
    document.head.appendChild(style);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hsc-native-share hsc-hit';
    button.setAttribute('aria-label', 'Share haircut');
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.5M8.2 13.2l7.6 4.5"/></svg>';
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      button.disabled = true;
      button.classList.add('busy');
      try { host.shareGame(await compose()); }
      catch (error) { console.error('share: image capture failed', error); host.shareGame(''); }
      finally { button.disabled = false; button.classList.remove('busy'); }
    });
    hub.appendChild(button);

    let frame = 0;
    const place = () => {
      frame = 0;
      const game = globalThis.skinFadeStudio;
      const state = game && game.getState ? game.getState() : null;
      const view = game && game.getView ? game.getView() : null;
      const show = hub.classList.contains('show') && state && state.status === 'reveal' && view && view.revealComplete;
      if (!show) { button.style.visibility = 'hidden'; return; }
      // Fixed to the screen's right edge on every phone/tablet orientation. The completion actions can move;
      // this does not, so it never gets mistaken for replay or next-customer.
      button.style.left = 'auto';
      button.style.right = 'max(12px, env(safe-area-inset-right))';
      button.style.top = 'max(12px, env(safe-area-inset-top))';
      button.style.visibility = 'visible';
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(place); };
    const observer = new MutationObserver(queue);
    observer.observe(hub, { attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', queue);
    addEventListener('pagehide', () => observer.disconnect(), { once: true });
    queue();
    return result;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
