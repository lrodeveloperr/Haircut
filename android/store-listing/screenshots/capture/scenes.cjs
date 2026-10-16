// Stages one Play screenshot in the real game (see ../README.md).
// usage: node scenes.cjs <s1|s2|s3|s4> <outdir> <deviceScaleFactor> <low|high> [calib]
const L = require('./lib.cjs');
const [scene, out, dsf, detail, calib] = process.argv.slice(2);
const wave = (x0, x1, y, ph, amp = 3, slope = 0) => { const pts = []; for (let x = x0; x <= x1; x += 10) pts.push([x, y + (x - x0) * slope + amp * Math.sin(x / 23 + ph) + 1.5 * Math.sin(x / 9 + ph * 2)]); return pts; };
const fade = async (p, x0, x1, bottom, starts, dy = 4, slope = 0) => {
  // starts: [[guard, yTop], ...] from long to short guard
  for (let b = 0; b < starts.length; b++) { const [g, top] = starts[b]; const end = b + 1 < starts.length ? starts[b + 1][1] + 2 : bottom; const lines = []; let k = 0; for (let y = top; y <= end; y += dy, k++) { const w = wave(x0, x1, y, g * 1.7 + k * 0.3, 3, slope); lines.push(k % 2 ? w.reverse() : w); } await L.strokes(p, g, lines); }
};
const vstrokes = (x0, x1, yBot, yTop, dx = 4) => { const L2 = []; for (let x = x0; x <= x1; x += dx) L2.push([[x, yBot], [x + 2, yTop]]); return L2; };
const levelTo = (p, cuts) => p.evaluate((c) => { HSC.meta.data.cuts = c; }, cuts);
const wardrobe = (p, clipper, gown) => p.evaluate(([ci, gi]) => {
  const W = HSC.wardrobe, C = HSC.catalog; const list = (t) => [...C.byKey.keys()].filter((k) => k.startsWith(t + ':')).map((k) => k.slice(t.length + 1));
  const cl = list('clipper'), gw = list('gown');
  if (ci != null) W.data.look.clipper = cl[ci % cl.length];
  if (gi != null) W.data.look.gown = gw[gi % gw.length];
  HSC.wardrobeApply(); return [cl.length, gw.length, W.data.look];
}, [clipper, gown]);
const clean = (p) => p.evaluate(() => HSC.clearClippings());
const clearDot = async (p) => {
  try {
    await p.waitForSelector('#hsc-hud .hsc-rw', { timeout: 300000 });
    await p.click('#hsc-hud .hsc-rw', { force: true, timeout: 120000 }); await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelector('#hsc-panel .hsc-x').click()); await p.waitForTimeout(600);
  } catch (e) { console.log('clearDot skipped', e.message.split('\n')[0]); }
};
(async () => {
  const { p } = await L.page(+dsf, undefined, detail);
  const t0 = Date.now();
  const log = (...a) => console.log(scene, ((Date.now() - t0) / 1000).toFixed(0) + 's', ...a);
  let s;
  await clearDot(p);
  if (scene === 's1') {
    await levelTo(p, 12); await L.serve(p, { heritage: 1, age: 'young', noLoss: true, beard: 'clean' }, "(q, pr) => /^(4|3c)/.test(q.hair.type) && /^s5-b5-t5/.test(pr)"); s = await L.info(p);
    await L.yawTo(p, -38, 8);
    log(s, await wardrobe(p, 7, null));
    if (!calib) {
      const bands = [[4, 262], [3, 280], [2, 298], [1, 345], [0, 382]];
      await fade(p, 182, 330, 440, bands);
      await fade(p, 20, 128, 440, bands);
      await fade(p, 128, 182, 440, bands.slice(0, 3));
      await L.strokes(p, 1, vstrokes(160, 182, 440, 345));
      await L.strokes(p, 0, vstrokes(170, 182, 440, 382));
      await clean(p);
      await L.hold(p, 1, [[146, 440], [146, 392], [147, 346]]);
    }
  } else if (scene === 's2') {
    await levelTo(p, 12);
    await L.serve(p, { heritage: 0, age: 'young', noLoss: true, beard: 'stubble' }, "(q, pr) => /^(1|2a)/.test(q.hair.type) && q.hair.colour >= 4 && q.hair.colour <= 6 && /^s5-b5-t5/.test(pr)"); s = await L.info(p);
    await L.yawTo(p, -93, 12);
    log(s, await wardrobe(p, 41, 23));
    if (!calib) {
      await fade(p, 16, 226, 460, [[4, 262], [3, 282], [2, 302], [1, 324], [0, 350]], 4, 0.16);
      await clean(p);
    }
  } else if (scene === 's3') {
    await levelTo(p, 12);
    await L.serve(p, { heritage: 3, age: 'middle', noLoss: true, beard: 'full' }, "(q, pr) => /^s[45]/.test(pr)"); s = await L.info(p);
    await L.yawTo(p, 150, 3);
    log(s, await wardrobe(p, 113, 61));
  } else if (scene === 's4') {
    await levelTo(p, 12);
    await L.serve(p, { heritage: 2, age: 'young', noLoss: true, beard: 'clean' }, "(q, pr) => /^s5-b5-t5/.test(pr)"); s = await L.info(p);
    await L.yawTo(p, -15, 38);
    log(s, await wardrobe(p, 222, 140));
    if (!calib) {
      // a guard-1 buzz over the whole head, one last strip of long hair still to go
      const lines = [];
      for (let x = 8; x <= 352; x += 4) if (x < 192 || x > 264) lines.push([[x, 150], [x, 500]]);
      await L.strokes(p, 1, lines);
      await clean(p);
      await L.hold(p, 1, [[202, 150], [202, 200], [203, 262]]);
    }
  }
  await p.waitForTimeout(calib ? 600 : 1200);
  await p.screenshot({ path: `${out}/${scene}${calib ? '-calib' : ''}.png` });
  log('done', await L.info(p));
  process.exit(0);
})().catch((e) => { console.log(scene, 'FAIL', e.message); process.exit(1); });
