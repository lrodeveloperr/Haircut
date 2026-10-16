const { chromium } = require('/opt/node22/lib/node_modules/playwright');
let browser;
const W = 360, H = 640;
exports.W = W; exports.H = H;
exports.browser = async () => (browser ||= await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }));
exports.page = async (dsf, storageState, detail = 'high') => {
  const b = await exports.browser();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf, storageState });
  const p = await ctx.newPage();
  p.setDefaultTimeout(900000);
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.route('**/playgama-bridge.js', (r) => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.goto('http://localhost:8124/index.html?detail=' + detail, { timeout: 300000 });
  await p.waitForFunction(() => globalThis.skinFadeStudio && HSC.wardrobe.data, null, { timeout: 600000 });
  await p.waitForTimeout(1500);
  await p.addStyleTag({ content: '.tutorial{display:none!important}' });
  return { ctx, p };
};
exports.info = (p) => p.evaluate(() => { const s = skinFadeStudio.getState(); const d = s.hair.reduce((n, v, i) => n + (v !== s.startHair[i] ? 1 : 0), 0); const pr = s.look.person; return { seed: pr.seed, her: pr.heritage, age: pr.years, tex: pr.hair.type, beard: pr.beard.style, bald: pr.bald.type, profile: s.look.profile, yaw: Math.round(s.cameraYawDeg), el: s.cameraElevation, cut: d }; });
exports.rotate = async (p, dx, dy = 0) => {
  await p.evaluate(() => { if (skinFadeStudio.getState().interactionMode !== 'rotate') skinFadeStudio.toggleClipper(); });
  await p.mouse.move(190, 300); await p.mouse.down();
  for (let i = 1; i <= 10; i++) await p.mouse.move(190 + dx * i / 10, 300 + dy * i / 10);
  await p.mouse.up(); await p.waitForTimeout(300);
};
exports.yawTo = async (p, yaw, el = 10) => {
  const s = await p.evaluate(() => skinFadeStudio.getState());
  const d = ((yaw - s.cameraYawDeg + 540) % 360) - 180;
  await exports.rotate(p, d / 0.36, -(el - s.cameraElevation) / 0.25);
};
exports.clip = async (p, guard) => p.evaluate((g) => { if (skinFadeStudio.getState().interactionMode === 'rotate') skinFadeStudio.toggleClipper(); skinFadeStudio.selectGuard(g); }, guard);
// hold the clipper on the head mid-stroke for the screenshot
exports.hold = async (p, guard, pts) => {
  await exports.clip(p, guard);
  await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down();
  for (let i = 1; i < pts.length; i++) { const [a, b] = pts[i - 1], [c, d] = pts[i]; for (let j = 1; j <= 6; j++) { await p.mouse.move(a + (c - a) * j / 6, b + (d - b) * j / 6); await p.waitForTimeout(20); } }
};
// fast strokes: synthetic pointer events dispatched in-page
exports.strokes = async (p, guard, lines, opts = {}) => {
  await exports.clip(p, guard);
  return p.evaluate(async ({ lines, step }) => {
    const c = document.querySelector('#scene');
    const ev = (t, x, y) => c.dispatchEvent(new PointerEvent(t, { clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true, bubbles: true, cancelable: true, button: t === 'pointermove' ? -1 : 0, buttons: t === 'pointerup' ? 0 : 1 }));
    let n = 0;
    for (const pts of lines) {
      ev('pointerdown', pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        const [a, b] = pts[i - 1], [cx, d] = pts[i]; const k = Math.max(1, Math.ceil(Math.hypot(cx - a, d - b) / step));
        for (let j = 1; j <= k; j++) { ev('pointermove', a + (cx - a) * j / k, b + (d - b) * j / k); if (++n % 40 === 0) await new Promise((r) => setTimeout(r, 0)); }
      }
      ev('pointerup', pts[pts.length - 1][0], pts[pts.length - 1][1]);
    }
    return n;
  }, { lines, step: opts.step || 5 });
};
// queue a game-generated customer (HSC.makePerson with the given traits) as the next walk-in, then serve them
exports.serve = async (p, opts, predSrc) => {
  await p.evaluate(() => skinFadeStudio.finish());
  await p.waitForFunction(() => document.querySelector('#hsc-hub.show'), null, { timeout: 300000 }); await p.waitForTimeout(400);
  const r = await p.evaluate(([opts, predSrc]) => {
    const pred = eval(predSrc), M = HSC.meta, d = M.data, job = skinFadeStudio.getState().jobId + 1;
    for (let i = 0; i < 5000; i++) {
      const seed = (Math.random() * 2 ** 32) >>> 0 || 1;
      const person = HSC.makePerson(seed, opts);
      const profile = M.profileFor(person, []);
      if (pred(person, profile)) { d.queue = { job, person, profile }; return { i, seed, profile }; }
    }
    return null;
  }, [opts, predSrc]);
  if (!r) throw new Error('no customer matched');
  await p.click('.training-continue', { force: true }); await p.waitForTimeout(1500);
  return r;
};
