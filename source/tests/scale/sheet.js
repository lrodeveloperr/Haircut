// contact sheet: each screen's four states side by side, scaled to one height, with the screen name
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
const fs = require('fs');
const [out, H, ...names] = process.argv.slice(2);
const im = (f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;
const STATES = ['cut', 'wardrobe', 'wardrobe300', 'done'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const rows = names.filter((n) => fs.existsSync(`tests/scale/${n}-done.png`)).map((n) => `<div style="margin:0 0 14px"><div style="font:700 17px system-ui;margin:0 0 4px">${n}</div><div style="display:flex;gap:10px;align-items:flex-start">${STATES.map((s) => `<img style="height:${H}px;border:1px solid #2a1d15" src="${im(`tests/scale/${n}-${s}.png`)}">`).join('')}</div></div>`);
  await p.setContent(`<body style="margin:0;padding:12px;background:#f4ead8;color:#2a1d15;width:max-content">${rows.join('')}</body>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
})();
