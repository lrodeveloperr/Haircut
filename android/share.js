// Android-only completion share: an advert for the game, then the native Sharesheet (owner choice: Flyer 2). The same
// customer before and after, in the same pose, and the game's name exactly as Google Play shows it in the player's language
// (android/store-listing/*/title.txt; a language with no listing of its own shows the default one, as Play does). Every
// mode shares the same card, and there are no other words.
(function (HSC) {
  'use strict';
  const host = globalThis.AndroidHost;
  const initialize = HSC.hubInit;
  if (!host || typeof host.shareGame !== 'function' || typeof initialize !== 'function') return;

  const SIZE = 64;
  const YAW = 50; // a three-quarter view from behind: the angle barbers use to show a cut
  const INK = '#10223f';
  const TITLES = {
    en: 'Barber Simulator: ASMR Haircut', ar: 'حلاق ASMR: لعبة قص الشعر', de: 'Barbier ASMR: Haare schneiden',
    es: 'Barbero ASMR: Corte de Cabello', fr: 'Barbier ASMR : Coupe & Dégradé', hi: 'ASMR नाई: बाल काटने का गेम',
    id: 'ASMR Barber: Potong Rambut', ja: 'ASMR理容室：ヘアカットシミュレーター', ko: 'ASMR 이발소: 헤어컷 시뮬레이터',
    pt: 'Barbeiro ASMR: Corte de Cabelo',
  };
  // the name and its line: the two halves of the store title
  const title = () => { const lang = HSC.lang ? HSC.lang() : 'en', [name, sub] = (TITLES[lang] || TITLES.en).split(/\s*[:：]\s*/); return { name, sub, rtl: lang === 'ar' }; };
  const FONT = '"Arial Rounded MT Bold","Nunito","Baloo 2",system-ui,sans-serif';
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

  // both heads at one scale and in one place, so only the hair changes; the top of the taller one sits GAP below the frame
  const GAP = 46, CROP = 20; // CROP: the picture's lower edge stays below the frame
  function fitHeads(heads, width) {
    const widest = heads.reduce((a, b) => (b.head.width > a.head.width ? b : a));
    const scale = width * .92 / widest.head.width;
    const top = Math.min(...heads.map((h) => h.bounds.y)), bottom = Math.max(...heads.map((h) => h.bounds.y + h.bounds.height));
    return { scale, top, centre: widest.head.x + widest.head.width / 2, height: (bottom - top) * scale + GAP - CROP };
  }
  function drawPortrait(ctx, image, x, y, width, fit) {
    ctx.drawImage(image, x + width / 2 - fit.centre * fit.scale, y + GAP - fit.top * fit.scale, image.width * fit.scale, image.height * fit.scale);
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

  function panel(ctx, x, y, width, height, inner, outer, image, fit) {
    ctx.save();
    roundedRect(ctx, x, y + 16, width, height, 50);
    ctx.fillStyle = INK; ctx.fill();
    roundedRect(ctx, x, y, width, height, 50);
    ctx.fill();
    roundedRect(ctx, x + 10, y + 10, width - 20, height - 20, 42);
    ctx.clip();
    const glow = ctx.createRadialGradient(x + width / 2, y + height * .42, 40, x + width / 2, y + height * .42, height * .7);
    glow.addColorStop(0, inner); glow.addColorStop(1, outer);
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, width, height);
    drawPortrait(ctx, image, x + 10, y + 10, width - 20, fit);
    ctx.restore();
  }

  async function compose() {
    const game = globalThis.skinFadeStudio, renderer = HSC.view;
    if (!game || !renderer || typeof renderer.thumbnail !== 'function') throw new Error('Share renderer unavailable');
    const state = game.getState(), view = game.getView();
    if (!state || state.status !== 'reveal' || !view || !view.revealComplete) throw new Error('Haircut is not ready to share');

    // the before needs the beard he came in with; the view goes back to the finished beard straight after
    const beardBefore = Array.isArray(state.startBeard) && typeof renderer.setBeard === 'function';
    if (beardBefore) renderer.setBeard(state.startBeard);
    const before = renderer.thumbnail(state.startHair, YAW, 8, { headOnly: false, size: 1024 });
    if (beardBefore) renderer.setBeard(state.beard);
    const after = renderer.thumbnail(state.hair, YAW, 8, { headOnly: false, size: 1024 });
    if (![before, after].every((url) => typeof url === 'string' && url.startsWith('data:image/'))) throw new Error('Haircut capture failed');
    const heads = (await Promise.all([before, after].map(image))).map((head) => analyseCutout(cleanCutout(head)));

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    // the card is only as tall as its content: the frames fit the heads, with a small even space above the hair
    const width = 494, fit = fitHeads(heads, width - 20);
    const top = 300, height = Math.round(fit.height) + 20, H = top + height + 16 + 34; // the bottom margin matches the sides
    canvas.height = H;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Share canvas unavailable');
    const sky = ctx.createRadialGradient(540, H / 2, 80, 540, H / 2, 1000);
    sky.addColorStop(0, '#2a78c4'); sky.addColorStop(.6, '#0d3f86'); sky.addColorStop(1, INK);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1080, H);
    // the barber pole, faintly, as on the home screen
    ctx.save();
    ctx.translate(540, H / 2); ctx.rotate(-35 * Math.PI / 180);
    ctx.fillStyle = 'rgba(255,255,255,.055)';
    for (let x = -1500; x < 1500; x += 170) ctx.fillRect(x, -1500, 60, 3000);
    ctx.restore();
    // the name
    const { name, sub, rtl } = title();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    if (rtl) ctx.direction = 'rtl';
    ctx.font = `900 118px ${FONT}`;
    ctx.lineWidth = 26; ctx.strokeStyle = INK; ctx.strokeText(name, 540, 142, 1000);
    ctx.fillStyle = '#ffd257'; ctx.fillText(name, 540, 142, 1000);
    ctx.font = `900 58px ${FONT}`;
    const w = Math.min(ctx.measureText(sub).width, 940) + 72;
    roundedRect(ctx, 540 - w / 2, 172, w, 84, 42);
    ctx.fillStyle = INK; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(sub, 540, 234, 940);
    // before and after
    panel(ctx, 34, top, width, height, '#ffffff', '#b9c6d6', heads[0].image, fit);
    panel(ctx, 552, top, width, height, '#fff6d0', '#ffc53a', heads[1].image, fit);
    ctx.beginPath(); ctx.arc(540, top + height * .5, 84, 0, Math.PI * 2);
    const gold = ctx.createLinearGradient(0, top + height * .5 - 84, 0, top + height * .5 + 84);
    gold.addColorStop(0, '#ffe682'); gold.addColorStop(1, '#ffb21a');
    ctx.fillStyle = gold; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.lineCap = 'round'; ctx.lineWidth = 16;
    const my = top + height * .5;
    ctx.moveTo(500, my); ctx.lineTo(580, my); ctx.moveTo(548, my - 34); ctx.lineTo(582, my); ctx.lineTo(548, my + 34);
    ctx.stroke();

    return canvas.toDataURL('image/jpeg', .9);
  }

  HSC.hubInit = function () {
    const result = initialize.apply(this, arguments);
    const hub = document.querySelector('#hsc-hub');
    if (!hub || hub.querySelector('.hsc-native-share')) return result;

    const style = document.createElement('style');
    style.textContent = `
.hsc-native-share{position:absolute;left:max(16px,env(safe-area-inset-left));width:${SIZE}px;height:${SIZE}px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(#fff,#dfe8f2);color:#10223f;border:3px solid #10223f;box-shadow:inset 0 -5px 0 #0002,inset 0 2px 0 #fff9,0 4px 0 #10223f,0 6px 8px #0004;cursor:pointer;visibility:hidden;z-index:3}
.hsc-native-share>svg{display:block;width:46%;height:46%}
.hsc-native-share:active{transform:translateY(3px);box-shadow:inset 0 -3px 0 #0002,inset 0 2px 0 #fff9,0 1px 0 #10223f}
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
      // Bottom left, level with the next button, on every phone and tablet orientation.
      // The same size as the next button and level with it, 16 px from the edge like the next row.
      const next = document.querySelector('.training-continue'), r = next && next.getBoundingClientRect(), S = HSC.S || 1;
      const size = r && r.height ? r.height / S : SIZE;
      button.style.width = button.style.height = size + 'px';
      button.style.top = (r && r.height ? r.top / S : innerHeight / S - SIZE - 48) + 'px';
      // on wide screens the next row can reach the left edge: Share then sits right beside it, on the same line
      const dock = document.querySelector('#hsc-dock'), d = dock && dock.getBoundingClientRect();
      button.style.left = d && d.width && d.left / S < 16 + size + 12 ? d.right / S + 16 + 'px' : '';
      button.style.visibility = 'visible';
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(place); };
    // the next row settles a moment after a turn of the device: Share follows it
    setInterval(() => { if (hub.classList.contains('show')) place(); }, 200);
    const observer = new MutationObserver(queue);
    observer.observe(hub, { attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', queue);
    addEventListener('pagehide', () => observer.disconnect(), { once: true });
    queue();
    return result;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
