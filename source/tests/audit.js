const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/playgama-bridge.js', (r) => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.goto('http://localhost:8124/index.html');
  await p.waitForFunction(() => globalThis.skinFadeStudio && HSC.wardrobe.data, null, { timeout: 60000 });
  const r = await p.evaluate(() => {
    const M = HSC.meta, d = M.data; d.firstDay = '2000-01-01'; d.dailyDay = '2999-01-01'; d.cuts = 20;
    let recent = [], seed = 99;
    const people = [];
    for (let n = 0; n < 3000; n++) {
      M.onFinish({ jobId: n + 1, seed, recentLooks: recent, cutStrokeCount: 1 });
      const q = d.queue, w = HSC.walkIns.list.find((x) => x.id === q.profile);
      recent = [...recent, q.profile].slice(-4);
      seed = (Math.imul(seed ^ 0x9e3779b1, 2654435761) >>> 0) || 1;
      people.push({ p: q.person, fam: HSC.walkInFamily(w), id: q.profile });
    }
    const HAIRNAME = Object.fromEntries(Object.entries(HSC.HAIR).map(([k, v]) => [v, k]));
    const bad = [];
    const nw = (p) => p.bald.norwood;
    for (const { p, fam } of people) {
      const h = p.heritage, t = p.hair.texture, c = HAIRNAME[p.hair.colour];
      if (h === 'black' && !['coily', 'curly'].includes(t)) bad.push('black ' + t);
      if (h === 'black' && t === 'curly' && p.hair.type === '3a') bad.push('black 3a');
      if (h === 'east-asian' && !['straight', 'wavy'].includes(t)) bad.push('east-asian ' + t);
      if (h === 'east-asian' && t === 'wavy' && p.hair.type === '2c') bad.push('east-asian 2c');
      if (h === 'white' && t === 'coily') bad.push('white coily');
      if (h !== 'white' && !['jet', 'softBlack', 'vdb', 'db'].includes(c)) bad.push(h + ' ' + c);
      if (h === 'black' && p.skin.tone < 5.6) bad.push('black light skin');
      if (h === 'white' && p.skin.tone > 3.2) bad.push('white dark skin');
      if (['4', '5', '6', '7'].includes(nw(p)) && ['long', 'full', 'tight'].includes(fam) && !p.vip) bad.push('heavy loss with ' + fam);
      if (p.age === 'old' && fam === 'tight') bad.push('old tight');
      if (p.age === 'young' && ['6', '7'].includes(nw(p))) bad.push('young NW' + nw(p));
      if (p.vip && (nw(p) !== '1' || p.age === 'old')) bad.push('vip with loss/old');
      if (!['blue', 'grey', 'green', 'hazel', 'lbrown', 'brown', 'dbrown'].includes(p.eyes)) bad.push('eyes ' + p.eyes);
      if (h !== 'white' && ['blue', 'grey'].includes(p.eyes)) bad.push(h + ' ' + p.eyes + ' eyes');
    }
    const pct = (arr, f) => Math.round((100 * arr.filter(f).length) / Math.max(1, arr.length));
    const by = (k) => { const o = {}; for (const x of people) (o[k(x)] = o[k(x)] || []).push(x); return o; };
    const rows = [];
    for (const [age, g] of Object.entries(by((x) => x.p.age))) rows.push(`${age.padEnd(7)} n=${g.length}  any loss ${pct(g, (x) => nw(x.p) !== '1')}%  NW4+ ${pct(g, (x) => ['4','5','6','7'].includes(nw(x.p)))}%  clean-shaven ${pct(g, (x) => x.p.beard.style === 'clean')}%  stubble ${pct(g, (x) => x.p.beard.style === 'stubble')}%  grey>30% ${pct(g, (x) => x.p.hair.grey > 0.3)}%`);
    for (const [h, g] of Object.entries(by((x) => x.p.heritage))) {
      const tex = {}, col = {}; for (const x of g) { tex[x.p.hair.texture] = (tex[x.p.hair.texture] || 0) + 1; const c = HAIRNAME[x.p.hair.colour]; col[c] = (col[c] || 0) + 1; }
      const pc = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round((100 * v) / g.length)}%`).join(', ');
      rows.push(`${h.padEnd(11)} n=${g.length}  any loss ${pct(g, (x) => nw(x.p) !== '1')}%  clean ${pct(g, (x) => x.p.beard.style === 'clean')}%\n    texture: ${pc(tex)}\n    colour:  ${pc(col)}`);
    }
    const ys = people.filter((x) => x.p.age === 'young' && !['clean', 'stubble'].includes(x.p.beard.style));
    const bs = {}; for (const x of ys) bs[x.p.beard.style] = (bs[x.p.beard.style] || 0) + 1;
    rows.push('young beard styles: ' + Object.entries(bs).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
    const ea = people.filter((x) => x.p.heritage === 'east-asian' && ['full', 'long', 'shenandoah'].includes(x.p.beard.style)).length;
    rows.push(`east-asian full/long beards: ${ea} of ${people.filter((x) => x.p.heritage === 'east-asian').length}`);
    const run = (a) => { let m = 1, c = 1; for (let i = 1; i < a.length; i++) { c = a[i] === a[i - 1] ? c + 1 : 1; m = Math.max(m, c); } return m; };
    const runOf = (a) => { let m = 0, c = 0; for (const v of a) { c = v ? c + 1 : 0; m = Math.max(m, c); } return m; };
    rows.push('longest runs: ' + ['heritage', 'age', 'fam', 'id'].map((k) => `${k} ${run(people.map((x) => (k === 'fam' || k === 'id' ? x[k] : x.p[k])))}`).join(', ') + `, beard ${run(people.map((x) => x.p.beard.style))} (clean-shaven ${runOf(people.map((x) => x.p.beard.style === 'clean'))}, bearded ${runOf(people.map((x) => x.p.beard.style !== 'clean'))}), hair loss ${runOf(people.map((x) => x.p.bald.norwood !== '1' || x.p.bald.type !== 'none'))}, full hair ${runOf(people.map((x) => x.p.bald.norwood === '1' && x.p.bald.type === 'none'))}, VIPs ${people.filter((x) => x.p.vip).length}, colour ${run(people.map((x) => x.p.heritage + x.p.hair.colour))}`);
    const cnt = {}; for (const b2 of bad) cnt[b2] = (cnt[b2] || 0) + 1;
    return { rows, bad: cnt };
  });
  console.log(r.rows.join('\n'));
  console.log('RULE BREAKS:', Object.keys(r.bad).length ? JSON.stringify(r.bad) : 'none');
  console.log(errs.length ? errs : 'no errors');
  await b.close();
})();
