// every button / badge: is its icon centred in it? (icon box centre vs the button's inner box centre)
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
const CHECK = () => {
  const out = [];
  const els = [...document.querySelectorAll('button, .hsc-ad, .hsc-art, .hsc-tile, .hsc-pill, .tile .on, .hsc-tile .on, .hsc-vbtn .done')];
  for (const e of els) {
    const r = e.getBoundingClientRect(); if (r.width < 8) continue;
    let n = e, hidden = false; while (n && n.nodeType === 1) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') { hidden = true; break; } n = n.parentElement; } if (hidden) continue;
    const kids = [...e.children].filter((c) => getComputedStyle(c).position !== 'absolute' && (c.tagName === 'svg' || c.tagName === 'IMG' || c.tagName === 'B'));
    if (kids.length !== 1 || e.children.length > 3) continue;
    const k = kids[0].getBoundingClientRect(), cs = getComputedStyle(e);
    const bl = parseFloat(cs.borderLeftWidth), bt = parseFloat(cs.borderTopWidth), br = parseFloat(cs.borderRightWidth), bb = parseFloat(cs.borderBottomWidth);
    const cx = r.left + bl + (r.width - bl - br) / 2, cy = r.top + bt + (r.height - bt - bb) / 2;
    const dx = k.left + k.width / 2 - cx, dy = k.top + k.height / 2 - cy;
    const name = (typeof e.className === 'string' ? e.className : '').split(' ').slice(0, 2).join('.') || e.tagName;
    if (Math.abs(dx) > 0.75 || Math.abs(dy) > 0.75) out.push(`${name} off ${dx.toFixed(1)},${dy.toFixed(1)}`);
  }
  return [...new Set(out)];
};
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  await p.route('**/playgama-bridge.js', (r) => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.goto('http://localhost:8124/index.html');
  await p.waitForFunction(() => globalThis.skinFadeStudio && HSC.wardrobe.data, null, { timeout: 60000 });
  await p.evaluate(() => { HSC.meta.data.streak = 3; HSC.meta.data.lastDay = HSC.meta.today(); HSC.hubInit(); });
  const SC = [['se1', 320, 568], ['pixel-7', 412, 915], ['se1-l', 568, 320], ['fhd', 1920, 1080], ['embed-sq', 300, 300]];
  const sweep = async (st) => { for (const [n, w, h] of SC) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(500); await p.screenshot(); const r = await p.evaluate(CHECK); console.log(st.padEnd(11), n.padEnd(9), r.length ? r.join(' | ') : 'all centred'); } };
  await sweep('cut');
  await p.click('#hsc-hud .hsc-rw', { force: true }); await p.waitForTimeout(400); await sweep('wardrobe');
  await p.evaluate(() => { const W = HSC.wardrobe; for (let i = 0; i < 300; i++) W.bits.clipper[i >> 3] |= 1 << (i & 7); HSC.wardrobe && document.querySelector('.hsc-tab[data-tool=clipper]').click(); });
  await p.waitForTimeout(300); await sweep('wardrobe300');
  await p.evaluate(() => { document.querySelector('#hsc-panel .hsc-x').click(); document.querySelectorAll('.tutorial').forEach((e) => (e.style.display = 'none')); skinFadeStudio.toggleClipper(); skinFadeStudio.selectGuard(0); });
  await p.setViewportSize({ width: 412, height: 915 }); await p.waitForTimeout(600);
  await p.mouse.move(170, 370); await p.mouse.down(); for (let i = 1; i <= 4; i++) await p.mouse.move(170 + i * 12, 370); await p.mouse.up();
  await p.evaluate(() => skinFadeStudio.finish());
  await p.waitForFunction(() => document.querySelector('#hsc-hub.show'), null, { timeout: 60000 }); await p.waitForTimeout(800);
  await sweep('done');
  await b.close();
})();
