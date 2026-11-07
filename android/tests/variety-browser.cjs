'use strict';
// How varied the customers are, per mode, over a long run: the game's own dealing, read back customer by customer.
// Reports how many different kinds appear and how often the next customer repeats the last one.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const build = path.resolve(__dirname, '../../source/build');
const N = 300;
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const context = await browser.newContext({ viewport: { width: 412, height: 892 } });
    await context.route('http://variety.test/**', (route) => { const u = new URL(route.request().url()), f = path.join(build, u.pathname === '/' ? 'index.html' : u.pathname); return fs.existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' }); });
    await context.addInitScript(() => { window.AndroidHost = { request(id, op) { setTimeout(() => __androidHost.complete(id, true, op === 'load' ? '{}' : ''), 0); }, gameReady() {}, showRewarded() {}, showInterstitial() {}, openPrivacy() {}, showPrivacyOptions() {} }; });
    const page = await context.newPage();
    page.setDefaultTimeout(240000);
    await page.goto('http://variety.test/');
    await page.waitForFunction(() => window.skinFadeStudio && HSC.startupTiming?.firstPlayable && HSC.modes && HSC.meta && HSC.meta.data && document.getElementById('hsc-rush'));
    const out = await page.evaluate(async (N) => {
      const M = HSC.meta, d = M.data, g = skinFadeStudio, res = {};
      d.cuts = 60; // a settled player: everything unlocked
      const base = g.getState();
      for (const mode of ['requests', 'free', 'fix', 'beard', 'rush']) {
        d.modes.mode = mode;
        if (HSC.modes.current() !== mode) throw new Error('mode not set: ' + mode + ' -> ' + HSC.modes.current());
        const rows = [];
        for (let i = 0; i < N; i++) {
          const job = 1000 + i;
          d.queue = null;
          M.onFinish(Object.assign({}, base, { jobId: job, seed: (job * 2654435761) >>> 0, cutStrokeCount: 0, recentLooks: rows.slice(-6).map((r) => r.look) }));
          const q = d.queue;
          if (!q || !q.person) continue;
          const p = q.person, w = HSC.headFormOf ? HSC.headFormOf(p) : null;
          rows.push({ her: p.heritage, age: p.age, beard: String(p.beard.style).replace(/\d+$/, ''), tex: p.hair.type, bald: p.bald.type === 'none' ? '1' : p.bald.norwood || p.bald.type, look: q.profile, reg: !!p.regular, vip: !!p.vip });
        }
        const stat = {};
        for (const k of ['her', 'age', 'beard', 'tex', 'bald', 'look']) {
          const c = {}; rows.forEach((r) => { c[r[k]] = (c[r[k]] || 0) + 1; });
          let same = 0; for (let i = 1; i < rows.length; i++) if (rows[i][k] === rows[i - 1][k]) same++;
          const top = Math.max(...Object.values(c));
          stat[k] = { list: Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 4).map((e) => e.join(':')).join(' '), kinds: Object.keys(c).length, repeatPct: Math.round(100 * same / Math.max(1, rows.length - 1)), topPct: Math.round(100 * top / Math.max(1, rows.length)) };
        }
        let twin = 0; for (let i = 1; i < rows.length; i++) { const a = rows[i], b = rows[i - 1]; if (a.her === b.her && a.age === b.age && a.beard === b.beard && a.tex === b.tex) twin++; }
        res[mode] = { n: rows.length, regulars: rows.filter((r) => r.reg).length, vips: rows.filter((r) => r.vip).length, twinPct: Math.round(100 * twin / Math.max(1, rows.length - 1)), stat };
      }
      return res;
    }, N);
    for (const [m, r] of Object.entries(out)) console.log(m.padEnd(9), 'n', r.n, 'twins', r.twinPct + '%', 'vip', r.vips, Object.entries(r.stat).map(([k, v]) => `${k} ${v.kinds}k/${v.repeatPct}%r/${v.topPct}%t`).join('  '), '| beard top:', r.stat.beard.list, '| bald top:', r.stat.bald.list);
    for (const [m, r] of Object.entries(out)) {
      assert.equal(r.stat.her.kinds, 12, m + ': every group appears');
      assert.ok(r.stat.her.repeatPct <= 2 && r.stat.look.repeatPct <= 2, m + ': the next customer is someone different');
      assert.equal(r.twinPct, 0, m + ': no look-alike in a row');
    }
    console.log('PASS: customer variety in every mode.');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
