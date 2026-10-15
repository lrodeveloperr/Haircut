// Scale check on every screen: each state (cutting + tutorial, wardrobe, wardrobe with a big collection,
// completion screen) on phones, foldables, tablets, desktops, ultra-wide and tiny embeds.
// Automatic checks: every control fully on screen, no two controls overlapping, tap targets >= 40 px,
// no visible text other than numbers, the wardrobe sheet fits; plus a screenshot of each for a visual pass.
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
const PORT = process.env.PORT || 8124;
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const SCREENS = [
  ['fold-cover', 280, 653], ['se1', 320, 568], ['android-s', 360, 640], ['iphone-se', 375, 667], ['iphone-14', 390, 844],
  ['pixel-7', 412, 915], ['pro-max', 430, 932],
  ['se1-l', 568, 320], ['android-s-l', 640, 360], ['iphone-14-l', 844, 390], ['pro-max-l', 932, 430],
  ['fold-open', 717, 512], ['ipad', 768, 1024], ['ipad-air', 820, 1180], ['ipad-pro', 1024, 1366],
  ['ipad-l', 1024, 768], ['ipad-air-l', 1180, 820], ['ipad-pro-l', 1366, 1024],
  ['laptop', 1280, 720], ['laptop-m', 1366, 768], ['mac', 1440, 900], ['fhd', 1920, 1080], ['qhd', 2560, 1440], ['ultrawide', 2560, 1080],
  ['embed-sq', 300, 300], ['embed-169', 400, 225], ['embed-916', 225, 400],
];
const CHECK = () => {
  const vis = (e) => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return null; let n = e; while (n && n.nodeType === 1) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return null; n = n.parentElement; } return r; };
  const els = [...document.querySelectorAll('button, .hsc-next, .tutorial, .hsc-level.up, .hsc-streak, .hsc-pick')].filter((e) => !e.closest('[aria-hidden=true]'));
  const items = [];
  for (const e of els) { const r = vis(e); if (r) items.push({ e, r, name: (e.className && e.className.baseVal === undefined ? e.className : '') .toString().split(' ').slice(0, 2).join('.') || e.tagName, tap: e.tagName === 'BUTTON' }); }
  const W = innerWidth, H = innerHeight, issues = [];
  for (const it of items) {
    const { r } = it;
    if (r.left < -0.5 || r.top < -0.5 || r.right > W + 0.5 || r.bottom > H + 0.5) issues.push(`off-screen ${it.name} [${[r.left, r.top, r.right, r.bottom].map(Math.round)}]`);
    if (it.tap && !it.e.closest('.hsc-tile') && Math.min(r.width, r.height) < 40) issues.push(`small ${it.name} ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j];
    if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
    const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (ox > 2 && oy > 2) issues.push(`overlap ${a.name} / ${b.name} (${Math.round(ox)}x${Math.round(oy)})`);
  }
  // visible text that is not a number / time
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n; while ((n = walker.nextNode())) { const t = n.textContent.trim(); if (!t || /^[\d:/.,%+\-×x ]+$/.test(t)) continue; const p = n.parentElement; if (!p || p.closest('script,style,[aria-hidden=true]')) continue; if (vis(p)) issues.push(`text "${t.slice(0, 30)}"`); }
  const sheet = document.querySelector('#hsc-panel.open .hsc-sheet');
  if (sheet) { const r = sheet.getBoundingClientRect(); if (r.top < -0.5 || r.bottom > H + 0.5 || r.left < -0.5 || r.right > W + 0.5) issues.push(`sheet off-screen [${[r.left, r.top, r.right, r.bottom].map(Math.round)}]`); if (sheet.scrollHeight > sheet.clientHeight + 2) issues.push(`sheet scrolls ${sheet.scrollHeight}>${sheet.clientHeight}`); }
  return issues;
};
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const report = {};
  for (const [name, w, h] of SCREENS) {
    if (ONLY && !ONLY.includes(name)) continue;
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.route('**/playgama-bridge.js', (r) => r.fulfill({ body: '', contentType: 'text/javascript' }));
    await p.goto(`http://localhost:${PORT}/index.html`);
    await p.waitForFunction(() => globalThis.skinFadeStudio && HSC.wardrobe.data, null, { timeout: 90000 });
    await p.waitForTimeout(1500);
    const out = {};
    const shot = async (st) => { out[st] = await p.evaluate(CHECK); await p.screenshot({ path: `tests/scale/${name}-${st}.png` }); };
    await shot('cut');
    await p.click('#hsc-hud .hsc-rw'); await p.waitForTimeout(500); await shot('wardrobe');
    await p.evaluate(() => { const W = HSC.wardrobe; for (let i = 0; i < 300; i++) W.bits.clipper[i >> 3] |= 1 << (i & 7); document.querySelector('#hsc-panel .hsc-x').click(); });
    await p.waitForTimeout(200);
    await p.click('#hsc-hud .hsc-rw'); await p.click('.hsc-tab[data-tool=clipper]'); await p.waitForTimeout(400); await shot('wardrobe300');
    // one real stroke (a finish without cuts is not a haircut), then finish on a level-up so the badge shows
    await p.evaluate(() => { document.querySelector('#hsc-panel .hsc-x').click(); document.querySelectorAll('.tutorial').forEach((e) => (e.style.display = 'none')); HSC.meta.data.cuts = 1; skinFadeStudio.toggleClipper(); skinFadeStudio.selectGuard(0); });
    await p.mouse.move(w * 0.42, h * 0.4); await p.mouse.down(); for (let i = 1; i <= 4; i++) await p.mouse.move(w * (0.42 + i * 0.03), h * 0.4); await p.mouse.up();
    await p.evaluate(() => skinFadeStudio.finish());
    await p.waitForFunction(() => document.querySelector('#hsc-hub.show'), null, { timeout: 90000 }); await p.waitForTimeout(900);
    await shot('done');
    if (errs.length) out.errors = errs;
    report[name] = out;
    const bad = Object.entries(out).filter(([, v]) => v.length);
    console.log(name.padEnd(12), `${w}x${h}`.padEnd(10), bad.length ? JSON.stringify(Object.fromEntries(bad)) : 'ok');
    await p.close();
  }
  require('fs').writeFileSync('tests/scale/report.json', JSON.stringify(report, null, 1));
  await b.close();
})();
