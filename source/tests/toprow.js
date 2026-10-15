const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
const SCREENS = require('fs').readFileSync('tests/scale/scale.js', 'utf8').match(/\['[a-z0-9-]+', \d+, \d+\]/g).map((s) => eval(s));
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  await p.route('**/playgama-bridge.js', (r) => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.goto('http://localhost:8124/index.html');
  await p.waitForFunction(() => globalThis.skinFadeStudio && HSC.wardrobe.data, null, { timeout: 60000 });
  await p.evaluate(() => { HSC.meta.data.streak = 3; HSC.meta.data.lastDay = HSC.meta.today(); HSC.hubInit(); });
  // every top-row item: same size as the sound button, same top line, mirrored margins (right item vs left item)
  const m = async (sels) => { await p.screenshot(); return p.evaluate((sels) => { const R = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? r : null; }; const a = R('.audio-toggle'); const out = []; for (const s of sels) { const r = R(s); if (!r) continue; const dh = Math.round(r.height - a.height), dt = Math.round(r.top - a.top); const tag = s.split(' ').pop(); out.push(`${tag}${dh || dt ? ` [size ${Math.round(r.width)}x${Math.round(r.height)} vs ${Math.round(a.height)}, top ${dt > 0 ? '+' : ''}${dt}]` : ' ok'}`); if (tag === '.seal' || s.includes('seal')) { const ml = a.left, mr = innerWidth - r.right; if (Math.abs(ml - mr) > 1.5) out.push(`margins L${Math.round(ml)} R${Math.round(mr)}`); } } return out.join(' | '); }, sels); };
  for (const [n, w, h] of SCREENS) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(500); console.log(n.padEnd(12), 'CUT ', await m(['#hsc-hud .hsc-rw', '#hsc-hud .hsc-streak', '.ctl.finish.seal'])); }
  await p.setViewportSize({ width: 412, height: 915 });
  await p.evaluate(() => { HSC.meta.data.cuts = 1; skinFadeStudio.toggleClipper(); skinFadeStudio.selectGuard(0); });
  await p.mouse.move(170, 370); await p.mouse.down(); for (let i = 1; i <= 4; i++) await p.mouse.move(170 + i * 12, 370); await p.mouse.up();
  await p.evaluate(() => skinFadeStudio.finish());
  await p.waitForFunction(() => document.querySelector('#hsc-hub.show'), null, { timeout: 60000 });
  for (const [n, w, h] of SCREENS) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(700); await p.screenshot(); const top = await p.evaluate(() => document.querySelector('.hsc-replay').classList.contains('top')); console.log(n.padEnd(12), 'DONE', top ? await m(['.hsc-replay']) : 'replay beside next', '| level badge', await p.evaluate(() => !!document.querySelector('.hsc-level'))); }
  await b.close();
})();
