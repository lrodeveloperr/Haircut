'use strict';
// Contract director with the REAL catalog (docs/CAREER-CONTRACT-DIRECTOR.md section 16; IMPLEMENTATION-PLAN 2.6):
// the game's own customers, walk-in hair grids, styles, beard jobs, disasters and tidy-ups, in the Android web
// bundle. Simulates careers at a low level (few tools, few modes) and a high level (everything unlocked) and checks
// every generated contract: validated twice, physically achievable (target never above the start), beard requests
// reachable with the owned tools, Rush jobs within their clock, and no avoidable fourth customer in a row with
// the same broad hair presence or facial-hair state.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../..'), build = path.join(root, 'source/build');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.json': 'application/json' };
const PER_LEVEL = +process.env.DIRECTOR_BROWSER_CONTRACTS || 160;

(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const context = await browser.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 1, hasTouch: true });
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      const file = path.join(build, url.pathname === '/' ? 'index.html' : url.pathname);
      if (!file.startsWith(build + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
      await route.fulfill({ path: file, contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    await context.addInitScript(() => {
      window.__androidRewardedReady = true; window.AndroidHost = {
        request(id, op, payload) { setTimeout(() => { if (op === 'save') localStorage.setItem('dir-save', JSON.parse(payload)); __androidHost.complete(id, true, op === 'load' ? localStorage.getItem('dir-save') || '{}' : ''); }, 5); },
        gameReady() {}, showRewarded() {}, showInterstitial() { setTimeout(() => __androidHost.ad('interstitial', 'failed'), 10); }, openPrivacy() {}, showPrivacyOptions() {},
      };
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.setDefaultTimeout(240000);
    await page.goto('http://director.test/');
    await page.waitForFunction(() => window.HSC && HSC.careerRun && HSC.careerRun.ready() && HSC.careerCatalog && HSC.beardReach, undefined, { timeout: 240000 });
    const res = await page.evaluate(async (N) => {
      const C = HSC.career, D = HSC.director, out = {};
      // a hit on a warped head maps back to the exact point on the un-morphed head (the scalp's cutting grid)
      { const st = HSC.debugState, A = st.coarse.pos, I = st.coarse.idx, B = st.coarseBase; let worst = 0;
        for (let k = 0; k < I.length; k += 300) { const [a, b, c] = [I[k] * 3, I[k + 1] * 3, I[k + 2] * 3], m = [0, 1, 2].map((j) => (A[a + j] + A[b + j] + A[c + j]) / 3), w = HSC.warpBase(m[0], m[1], m[2], A, I, k); worst = Math.max(worst, ...[0, 1, 2].map((j) => Math.abs(w[j] - (B[a + j] + B[b + j] + B[c + j]) / 3))); }
        out.hitError = worst; }
      // the clipper is the only tool, in every mode: no tray, no services, no Relax
      out.clipperOnly = { tools: ['setTool', 'trayNow', 'effects', 'visit', 'servicesWanted', 'toolArtBuild'].filter((k) => HSC[k] !== undefined), modes: HSC.modes.list.slice(), tray: !!document.querySelector('#hsc-tools') };
      const realLevel = HSC.meta.level;
      for (const lv of [2, 40]) {
        HSC.meta.level = () => lv;
        const st = { made: 0, unvalidated: 0, invalid: 0, growth: 0, beardUnreachable: 0, rushOver: 0, presence4: 0, presenceForced: 0, stages: {}, modes: {}, sources: {}, ms: 0 };
        const reach = HSC.beardReach();
        for (let career = 0; career < 2 && st.made < N; career++) {
          let s = C.found(C.create(C.UNSET, 1000 + lv * 31 + career), C.enabledIds()[(lv + career * 7) % 36]).state;
          let dir = D.fresh();
          const env = { pop: {}, regs: {}, recent: [] }, pres = [];
          while (st.made < N) {
            if (C.phase(s) === 'map') { const rem = C.remaining(s); s = C.selectCity(s, rem[st.made % rem.length]).state; }
            const pos = C.position(s), catalog = HSC.careerCatalog.make(env);
            const t0 = performance.now();
            const g = D.generate(s, dir, catalog, { city: pos.city, level: lv, regulars: [] });
            st.ms += performance.now() - t0;
            const c = g.contract; dir = g.dir; st.made++;
            st.stages[c.stage] = (st.stages[c.stage] || 0) + 1;
            st.sources[c.source] = (st.sources[c.source] || 0) + 1;
            if (c.source === 'visitor' && !(c.customer.person.visitor && c.customer.person.visitor.origin)) st.noOrigin = (st.noOrigin || 0) + 1;
            if (c.stage !== 'normal') { const k = c.role + ':' + c.mode + ':' + c.stage + ':' + Object.entries(c.reasons).sort((a, b) => b[1] - a[1]).slice(0, 3).map((e) => e.join('=')).join(','); st.why = st.why || {}; st.why[k] = (st.why[k] || 0) + 1; } st.modes[c.mode] = (st.modes[c.mode] || 0) + 1;
            if (!c.validated) st.unvalidated++;
            if (c.stage !== 'standard-orders' && catalog.validate(c).length) st.invalid++;
            const t = c.request.target, h = c.start.hair;
            if (t) for (let i = 0; i < 8192; i++) if (t[i] > h[i]) { st.growth++; break; }
            if (c.request.beardTarget) {
              let need = 0, ok = 0;
              for (let i = 0; i < 8192; i++) { const b = c.start.beardGrid[i], bt = c.request.beardTarget[i]; if (bt < b) { need++; if (reach.some((l) => l <= b && Math.abs(l - bt) <= 1)) ok++; } }
              if (need && ok / need < 0.85) st.beardUnreachable++;
            }
            if (c.mode === 'rush' && catalog.timeNeeded(c) > D.RUSH_LIMIT) st.rushOver++;
            pres.push(c.presence);
            if (pres.length >= 4 && !c.regular && c.presence) {
              const l4 = pres.slice(-4), same = (k) => l4.every((x) => x && x.split('|')[k] === c.presence.split('|')[k]);
              if (same(0) || same(1)) { if (c.reasons['presence-forced']) st.presenceForced++; else st.presence4++; }
            }
            const draw = c.customer && c.customer.draw;
            if (draw) HSC.careerCatalog.commitGroup(env.pop, draw.city, draw.group);
            D.noteResult(dir, 2, true, c.band);
            s = C.complete(s, { id: c.id, stars: 2, valid: true, mode: c.mode, style: c.request.id }).state;
          }
        }
        st.msPer = +(st.ms / st.made).toFixed(1);
        delete st.ms;
        out['level' + lv] = Object.assign(st, { reach });
      }
      HSC.meta.level = realLevel;
      return out;
    }, PER_LEVEL);
    console.log(JSON.stringify(res));
    assert.deepEqual(res.clipperOnly, { tools: [], modes: ['requests', 'free', 'fix', 'beard', 'rush'], tray: false }, 'clipper only');
    delete res.clipperOnly;
    assert.ok(res.hitError < 1e-4, 'a hit maps back to the un-morphed head: ' + res.hitError);
    delete res.hitError;
    for (const [k, st] of Object.entries(res)) {
      assert.equal(st.unvalidated, 0, k + ': every contract passes the second validation');
      assert.equal(st.invalid, 0, k + ': every contract passes the catalog validator');
      assert.equal(st.growth, 0, k + ': no request needs hair to grow');
      assert.equal(st.beardUnreachable, 0, k + ': every beard request is reachable with the owned tools');
      assert.equal(st.rushOver, 0, k + ': every Rush job fits its clock');
      assert.equal(st.presence4, 0, k + ': no avoidable fourth customer in a row with the same state');
      assert.ok(st.presenceForced <= Math.ceil(st.made * 0.05), k + ': forced state repeats stay rare');
      const vis = (st.sources.visitor || 0) / st.made;
      assert.ok(vis > 0.04 && vis <= 0.4, k + ': visitors stay visible and bounded (' + vis.toFixed(3) + ')');
      assert.ok((st.sources.resident || 0) / st.made > 0.5, k + ': residents stay the majority');
      assert.equal(st.noOrigin || 0, 0, k + ': every visitor records his origin');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: director with the real catalog: ' + Object.values(res).reduce((a, s) => a + s.made, 0) + ' contracts at levels 2 and 40 (validated, achievable, owned tools, timers, state rotation).');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
