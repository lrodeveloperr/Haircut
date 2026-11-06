'use strict';
// Tools and services in the real game (plan Wave 4): the Android web bundle in Chrome, real pointer input on the real
// head, proof read back from the visit state. TOOLS_SHOTS=dir writes before/after pictures for review.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../..'), build = path.join(root, 'source/build');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.json': 'application/json' };
const shots = process.env.TOOLS_SHOTS;

function installHelpers() {
      // the screen point over a place on the un-morphed head
      window.T = {
        // the head as seen from the chair: one coarse pass per customer, then a nearest-point lookup
        map: null,
        scan() {
          const out = [];
          for (let py = 60; py < innerHeight - 60; py += 8) for (let px = 16; px < innerWidth - 16; px += 8) {
            const h = HSC.view.headHit(px, py);
            if (!h) continue;
            const b = HSC.toBase(h);
            if (b) out.push([px, py, b[0], b[1], b[2]]);
          }
          T.map = out;
          return out.length;
        },
        at(x, y, z) {
          let best = null, bd = 1e9;
          for (const m of T.map) { const d = Math.hypot(m[2] - x, m[3] - y, m[4] - z); if (d < bd) { bd = d; best = m; } }
          // refine to the pixel around the coarse answer
          const [cx, cy] = best;
          let out = [cx, cy];
          for (let py = cy - 8; py <= cy + 8; py += 2) for (let px = cx - 8; px <= cx + 8; px += 2) {
            const h = HSC.view.headHit(px, py), b = h && HSC.toBase(h);
            if (!b) continue;
            const d = Math.hypot(b[0] - x, b[1] - y, b[2] - z);
            if (d < bd) { bd = d; out = [px, py]; }
          }
          return out;
        },
        seat(test) {
          for (let seed = 1; seed < 40000; seed++) {
            const p = HSC.makePerson(seed * 7 + 1);
            if (test(p)) { HSC.debugOverride = p; return p; }
          }
          throw new Error('no such customer');
        },
        sum(f) { const a = HSC.visit.state().f[f]; let n = 0; for (let c = 0; c < a.length; c++) if (a[c]) n++; return n; },
        v: () => HSC.visit.state(),
      };
}

(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  let cases = 0;
  try {
    const context = await browser.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 1 });
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      const file = path.join(build, url.pathname === '/' ? 'index.html' : url.pathname);
      if (!file.startsWith(build + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
      await route.fulfill({ path: file, contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    await context.addInitScript(() => {
      window.__acs = 0;
      const C = window.AudioContext;
      window.AudioContext = class extends C { constructor(...a) { super(...a); window.__acs++; } };
      window.AndroidHost = {
        request(id, op, payload) { setTimeout(() => { if (op === 'save') localStorage.setItem('tools-save', JSON.parse(payload)); __androidHost.complete(id, true, op === 'load' ? localStorage.getItem('tools-save') || '{}' : ''); }, 0); },
        gameReady() {}, showRewarded() {}, showInterstitial() { setTimeout(() => __androidHost.ad('interstitial', 'failed'), 10); }, openPrivacy() {}, showPrivacyOptions() {},
      };
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.setDefaultTimeout(120000);
    await page.goto('http://tools.test/');
    await page.waitForFunction(() => window.HSC && HSC.visit && HSC.modes && HSC.menu && globalThis.skinFadeStudio && HSC.debugState && HSC.debugState.coarse);
    const shot = async (n) => { if (shots) await page.screenshot({ path: path.join(shots, n + '.png') }); };
    const settle = (ms = 250) => page.waitForTimeout(ms);
    await page.evaluate(async () => {
      HSC.meta.level = () => 40;
      await HSC.menu.play('free');
    });
    await page.evaluate(installHelpers);
    const seat = async (fn) => {
      await page.evaluate(async (src) => {
        const p = T.seat(new Function('p', 'return ' + src));
        await HSC.modes.newCustomer();
      }, fn);
      await page.waitForFunction(() => { const s = skinFadeStudio.getState(); return s.status === 'cutting' && s.look.person === HSC.debugOverride && HSC.visit.state() && HSC.visit.state().customer === (s.look.person.seed >>> 0); });
      await page.evaluate(() => { const g = skinFadeStudio, s = g.getState(); g.turn(180 - s.cameraYawDeg); if (s.interactionMode !== 'cut') g.toggleClipper(); });
      await settle(900);
      const t0 = Date.now(), n = await page.evaluate(() => T.scan());
      assert.ok(n > 200, 'the head is on screen');
      if (process.env.TOOLS_VERBOSE) console.log('  scan', n, Date.now() - t0, 'ms');
    };
    const tool = async (k) => { assert.equal(await page.evaluate((key) => HSC.setTool(key), k), true, 'setTool ' + k); await settle(120); };
    const at = (p) => page.evaluate((q) => T.at(q[0], q[1], q[2]), p);
    // a stroke across points on the head: pointer events on the element under the finger, through the game's own
    // handlers (software rendering is too slow for one browser frame per pointer sample)
    const stroke = async (pts, steps = 6) => {
      await page.evaluate(async ([list, n]) => {
        const xy = list.map((q) => T.at(q[0], q[1], q[2]));
        const fire = (type, x, y, buttons) => {
          const el = type === 'pointerdown' ? document.elementFromPoint(x, y) : (T.down || document.elementFromPoint(x, y));
          if (type === 'pointerdown') T.down = el;
          el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, pointerType: 'mouse', button: type === 'pointermove' ? -1 : 0, buttons, clientX: x, clientY: y, isPrimary: true }));
        };
        const rest = () => new Promise((r) => setTimeout(r, 24));
        fire('pointerdown', xy[0][0], xy[0][1], 1);
        await rest();
        for (let i = 1; i < xy.length; i++) for (let k = 1; k <= n; k++) {
          fire('pointermove', xy[i - 1][0] + ((xy[i][0] - xy[i - 1][0]) * k) / n, xy[i - 1][1] + ((xy[i][1] - xy[i - 1][1]) * k) / n, 1);
          await rest();
        }
        const end = xy[xy.length - 1];
        fire('pointerup', end[0], end[1], 0);
        T.down = null;
        await rest();
      }, [pts, steps]);
    };
    const tap = (p) => stroke([p]);
    const count = (f) => page.evaluate((k) => T.sum(k), f);
    const st = (fn) => page.evaluate(fn);
    const cheek = [[0.95, 0.15, 1.75], [0.85, -0.35, 1.9], [0.75, -0.7, 1.95], [0.3, -0.85, 2.15], [-0.3, -0.85, 2.15], [-0.75, -0.7, 1.95], [-0.85, -0.35, 1.9], [-0.95, 0.15, 1.75]];

    const from = +process.env.TOOLS_FROM || 1; // a quick rerun of the later groups
    if (from <= 6) {
    // 1. the stubble chain on a dry face: foil, then water stops it
    await seat("p.beard.style === 'stubble' && Math.max(...Object.values(p.beard.mm)) <= 1.4 && p.years > 30"); // short enough for the foil (1.5 mm limit)
    await shot('01-stubble-before');
    const b0 = await st(() => ({ tray: HSC.trayNow(), cells: T.sum('len') }));
    assert.ok(b0.cells > 100, 'a stubble customer has hair on the grid');
    assert.ok(b0.tray.cut.length >= 5 && b0.tray.care.length >= 10, 'Quick Play shows every owned tool: ' + JSON.stringify(b0.tray));
    await tool('foil');
    assert.equal(await st(() => HSC.toolMm(0)), 0.05);
    await stroke(cheek);
    const f1 = await st(() => { const v = T.v(), L = v.f.len, s = skinFadeStudio.getState(); let five = 0, bad = 0; for (let c = 0; c < L.length; c++) { if (L[c] === 5) five++; if (HSC.visit.levelOfQ(L[c]) !== s.beard[c]) bad++; } return { five, bad, shaved: v.shaved, seq: v.seq, strokes: s.cutStrokeCount }; });
    assert.ok(f1.five > 20, 'the foil leaves exactly 0.05 mm: ' + JSON.stringify(f1));
    assert.equal(f1.bad, 0, 'the engine grid and the exact lengths agree');
    assert.ok(f1.strokes > 0);
    await shot('02-foil-after');
    cases++;

    // 2. the lather chain on the same customer: spray, soap film, brush, razor
    await seat("p.beard.style === 'stubble' && Math.max(...Object.values(p.beard.mm)) <= 1.4 && p.years > 30 && (p.seed & 1)");
    await tool('lather');
    await stroke(cheek.slice(0, 4));
    assert.equal(await count('foam'), 0, 'an empty brush paints nothing');
    await tool('shavingSoap');
    await stroke(cheek.slice(0, 4));
    assert.equal(await count('soap'), 0, 'dry soap leaves no film');
    await tool('spray');
    for (const p of cheek) await tap(p);
    assert.ok(await count('moist') > 100, 'the spray wets what it reaches');
    await shot('03-spray-after');
    await tool('foil');
    const wet = await st(() => T.v().seq);
    await stroke(cheek.slice(0, 3));
    assert.equal(await st(() => T.v().seq), wet, 'the dry foil refuses wet skin');
    await tool('shavingSoap');
    await stroke(cheek); await stroke(cheek.slice().reverse());
    assert.ok(await count('soap') > 100, 'soap goes on damp skin');
    await tool('lather');
    for (let i = 0; i < 3; i++) { await stroke(cheek); await stroke(cheek.slice().reverse()); }
    const fm = await st(() => ({ foam: T.sum('foam'), cells: T.v().foamCells, peak: T.v().foamPeak, film: T.sum('soap') }));
    assert.ok(fm.foam > 100 && fm.cells > 50, 'the brush turns film into foam: ' + JSON.stringify(fm));
    await shot('04-lather');
    await tool('razor');
    await stroke(cheek); await stroke(cheek.map(([x, y, z]) => [x, y - 0.12, z]));
    const rz = await st(() => ({ foam: T.v().foamCells, stress: T.sum('stress'), shaved: T.v().shaved }));
    assert.ok(rz.foam < fm.cells, 'the razor takes the lather with its edge: ' + JSON.stringify(rz));
    assert.ok(rz.shaved > 10);
    await shot('05-razor');
    cases++;

    // 3. after the shave: aftershave and the finish tools report real effects, and they stay unpaid
    await tool('alum'); await stroke(cheek.slice(0, 4));
    await tool('coldTowel'); await stroke(cheek.slice(0, 4));
    const paid = await st(() => HSC.servicesDone(skinFadeStudio.getState().jobId));
    for (const k of paid) assert.ok(['aftershave', 'towel', 'massage', 'talc', 'pomade', 'threading', 'singe', 'nose', 'lather'].includes(k), 'only the nine paid services: ' + k);
    cases++;

    // 4. nose hair: only fibres in the guarded opening, cut at the rim; proximity alone does nothing
    await seat("p.years > 65 && (() => { const n = HSC.effects.noseOf(p.seed >>> 0, p.years); return n.len.filter((l, i) => l > n.rim[i]).length >= 6; })()");
    await shot('06-nose-before');
    const n0 = await st(() => ({ protruding: HSC.effects.protruding(T.v()), fits: HSC.serviceFits(skinFadeStudio.getState().look.person, 'nose') }));
    assert.ok(n0.protruding >= 6 && n0.fits);
    await tool('nose');
    await tap([0.9, 0.6, 1.9]);
    assert.equal(await st(() => HSC.effects.protruding(T.v())), n0.protruding, 'near the nose but not at the opening: nothing');
    // the trimmer's head goes to each nostril in turn, round the rim
    const nostril = await st(() => HSC.servicesDebug().nose.centres.filter(Boolean));
    assert.ok(nostril.length >= 6);
    const sides = [nostril.filter((c) => c[0] < 0), nostril.filter((c) => c[0] > 0)];
    for (const sd of sides) if (sd.length) await stroke([...sd, sd[0]], 3);
    const n1 = await st(() => { const v = T.v(), N = v.nose; let inside = true; for (let i = 0; i < N.len.length; i++) if (N.len[i] < N.rim[i]) inside = false; return { left: HSC.effects.protruding(v), inside, done: v.done, pct: HSC.effects.progress(v, 'nose') }; });
    assert.ok(n1.left < n0.protruding, 'protruding fibres shorten: ' + JSON.stringify(n1));
    assert.ok(n1.inside, 'the internal hair stays');
    await shot('07-nose-after');
    cases++;

    // 5. undo is exact, and a reload resumes the same visit
    const u0 = await st(() => { const snap = HSC.servicesSnapshot(), h = HSC.effects.hash(T.v()); window.__snap = snap; return h; });
    await tool('spray'); await tap(cheek[2]);
    assert.notEqual(await st(() => HSC.effects.hash(T.v())), u0);
    assert.equal(await st(() => { HSC.servicesRestore(window.__snap); return HSC.effects.hash(T.v()); }), u0, 'undo restores the exact state');
    cases++;

    // 6. a reload resumes the same visit: exact hash, before any new stroke. An ordinary customer this time: a test
    // override is not part of the saved game.
    await page.evaluate(async () => { HSC.debugOverride = null; await HSC.modes.newCustomer(); });
    await page.waitForFunction(() => { const s = skinFadeStudio.getState(), v = HSC.visit.state(); return s.status === 'cutting' && v && v.job === s.jobId && v.seq === 0; });
    await page.evaluate(() => { const g = skinFadeStudio, s = g.getState(); g.turn(180 - s.cameraYawDeg); });
    await settle(900);
    await page.evaluate(() => T.scan());
    await tool('spray'); await tap(cheek[2]); await tap(cheek[5]);
    const saved = await st(() => { HSC.visit.flush(); return { h: HSC.effects.hash(T.v()), job: skinFadeStudio.getState().jobId, seq: T.v().seq }; });
    assert.ok(saved.seq > 0, 'the spray committed');
    await settle(1500);
    await page.reload();
    await page.waitForFunction(() => window.HSC && HSC.visit && HSC.visit.state() && HSC.visit.state().seq > 0, undefined, { timeout: 90000 }).catch(() => {});
    const r1 = await st(() => (HSC.visit.state() ? { h: HSC.effects.hash(HSC.visit.state()), job: skinFadeStudio.getState().jobId, seq: HSC.visit.state().seq } : null));
    assert.deepEqual(r1, saved, 'the saved visit comes back exactly');
    await st(async () => { await HSC.menu.play('free'); });
    await page.evaluate(() => { HSC.meta.level = () => 40; window.T = window.T || null; });
    cases++;

    }
    // 7. the other services, each from its effect alone
    await page.evaluate(installHelpers);
    await seat("p.years > 55 && HSC.earHairOf(p)[0] > 0.08 && p.beard.style !== 'clean' && !/^stubble/.test(p.beard.style)");
    // threading: the cheek line only; the beard's body stays
    const t0 = await st(() => ({ fits: HSC.serviceFits(skinFadeStudio.getState().look.person, 'threading'), len: T.sum('len') }));
    assert.ok(t0.fits);
    await tool('threading');
    const line = await st(() => { const P = HSC.debugState.beardCells.positions, out = []; const cells = HSC.servicesDebug().cheekLine(); for (let i = 0; i < cells.length; i += Math.max(1, Math.floor(cells.length / 24))) { const c = cells[i]; if (P[c * 3] > 0) out.push([P[c * 3], P[c * 3 + 1], P[c * 3 + 2]]); } return out.sort((a, b) => a[0] - b[0]); });
    assert.ok(line.length >= 4, 'a beard has a cheek line: ' + line.length);
    await stroke(line, 4); await stroke(line.map(([x, y, z]) => [-x, y, z]), 4);
    const t1 = await st(() => ({ len: T.sum('len'), done: T.v().done, pct: HSC.effects.progress(T.v(), 'threading') }));
    assert.ok(t1.pct > 0 && t1.len < t0.len, 'the thread plucks the cheek line: ' + JSON.stringify([t0, t1]));
    assert.ok(t1.len > t0.len * 0.7, 'bulk beard is not erased: ' + JSON.stringify([t0, t1]));
    assert.ok(await st(() => { const s = skinFadeStudio.getState(), L = T.v().f.len; for (let c = 0; c < L.length; c++) if (HSC.visit.levelOfQ(L[c]) !== s.beard[c]) return false; return true; }), 'the engine shows what the thread did');
    await shot('08-threading');
    // towel: the wrap takes its time, then heat and moisture are saved state
    await tool('towel'); await tap([0, 0.8, 2.3]);
    await page.waitForFunction(() => T.v().done.includes('towel'), undefined, { timeout: 240000 }); // the wrap's clock steps with the frame loop, slow under software rendering
    assert.ok((await count('heat')) > 500, 'the towel warmed the skin');
    // massage: moving fingers over the crown and both temples
    await tool('massage');
    const moved = [[-1.3, 2.4, 1.2], [-1.2, 2.3, 1.3], [-1.3, 2.5, 1.2], [-1.25, 2.4, 1.25]];
    const crown = [[-0.2, 3.3, 0.9], [0.2, 3.25, 1.0], [0, 3.35, 0.8], [0.15, 3.3, 0.9]];
    for (let i = 0; i < 2; i++) { await stroke(moved, 18); await stroke(moved.map(([x, y, z]) => [-x, y, z]), 18); await stroke(crown, 18); }
    const m1 = await st(() => ({ relax: T.v().relax, z: T.v().zones }));
    assert.ok(m1.relax > 0 && m1.z.all > 0, 'moving fingers add relaxation: ' + JSON.stringify(m1));
    // pomade: product where the fingers pass
    await tool('pomade');
    await stroke([[-0.8, 3.0, 1.0], [0, 3.3, 1.0], [0.8, 3.0, 1.0]], 8);
    assert.ok(await st(() => HSC.effects.progress(T.v(), 'pomade')) > 0, 'pomade covers real scalp vertices');
    // talc: nothing to dust yet, then a real cut and real clippings
    await tool('talc');
    await stroke([[-0.8, -1.0, 1.6], [0.8, -1.0, 1.6]], 8);
    assert.equal(await st(() => HSC.effects.progress(T.v(), 'talc')), 0, 'a dry brush stroke over nothing proves nothing');
    await shot('09-services');
    cases++;

    // 8. ear hair: the side view, only the bundles the flame reaches
    await page.evaluate(() => { const g = skinFadeStudio; g.turn(90 - g.getState().cameraYawDeg); });
    await settle(900);
    await page.evaluate(() => T.scan());
    const bowl = await st(() => { const b = HSC.earBowls(), B = HSC.debugState.base, s = [-1, 1].map((k) => (b[k] >= 0 ? [B[b[k] * 3], B[b[k] * 3 + 1], B[b[k] * 3 + 2]] : null)); return s; });
    const side = await st(() => { const m = T.map; let l = 0, r = 0; for (const q of m) if (q[2] > 0) r++; else l++; return r > l ? 1 : 0; });
    const ear = bowl[side];
    assert.ok(ear, 'the turned ear has a bowl');
    await shot('10-ear-before');
    const e0 = await st(() => Array.from(T.v().ear.len).reduce((a, b) => a + b, 0));
    assert.ok(e0 > 0);
    await tool('singe');
    await stroke([ear, [ear[0], ear[1] + 0.1, ear[2]], [ear[0], ear[1] - 0.1, ear[2]], ear], 16);
    const e1 = await st(() => Array.from(T.v().ear.len).reduce((a, b) => a + b, 0));
    assert.ok(e1 < e0, 'the flame shortens what it reaches: ' + [e0, e1]);
    assert.ok(await st(() => { const L = T.v().ear.len; return Array.from(L).some((v, i) => v > 0 && i < 8) || Array.from(L).some((v, i) => v > 0 && i >= 8); }), 'the other ear is not touched by this ear');
    await shot('11-ear-after');
    cases++;

    // 9. one audio engine, nothing leaking, no page errors
    const au = await st(() => HSC.audio.stats());
    assert.ok(au.contexts <= 1, 'one context in the customers layer');
    assert.ok(au.buffers <= 2, 'noise buffers are cached');
    assert.ok((await st(() => window.__acs)) <= 2, 'the engine motor plus the one engine');
    assert.deepEqual(errors, []);
    cases++;
    console.log(`PASS: ${cases} real-game tool groups (foil, lather chain, finish tools, nose hair, undo, reload, threading, towel, massage, pomade, duster, ear hair, audio).`);
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
