// Generates the frozen design list for catalog.js (run once; the output is pasted into the game).
// Every design is coherent (colour-harmony rules) and unique to the player (colours that look the same
// side by side are merged first; two-colour patterns need enough contrast to show).
const H = require('./harmony-lib.js');
const { C, de } = H;
const COLS = C.COLOURS.map((c) => c[0]);
const FINS = C.FINISHES.map((f) => f[0]);
const CP = ['solid', 'two-tone', 'racing', 'pinstripe', 'carbon', 'camo', 'marble', 'chevron', 'dots', 'fade', 'checker', 'flames', 'honeycomb', 'wood', 'leopard', 'zebra', 'diamond-plate', 'galaxy'];
const GP = ['solid', 'stripes', 'pinstripe', 'gingham', 'tartan', 'dots', 'chevron', 'houndstooth', 'yoke', 'fade', 'argyle', 'waves', 'barber-pole', 'floral', 'palms', 'scissors', 'camo', 'checker'];

// ---- palette: one colour per group that looks the same side by side (dE < 12)
const PREFER = ['jet', 'white', 'red', 'steel', 'navy', 'sand', 'orange', 'yellow', 'blue', 'sky', 'amber', 'magenta'];
const groups = H.groups(12);
const pal = groups.map((g) => g.find((c) => PREFER.includes(c.id)) || g.find((c) => !c.id.startsWith('neon')) || g[0]);
const P = pal.map((c) => ({ ...c, chroma: Math.hypot(c.lab[1], c.lab[2]) }));
const neutral = (c) => c.chroma < 14;
const hd = (a, b) => { const d = Math.abs(a.hue - b.hue) % 360; return d > 180 ? 360 - d : d; };
const vivid = (c) => c.chroma > 62;
function coherent(a, b) {
  if (a.id === b.id) return false;
  if ((a.neon || b.neon) && !(neutral(a) || neutral(b))) return false;
  if (neutral(a) || neutral(b)) return true;
  const d = hd(a, b);
  if (d < 35) return Math.abs(a.L - b.L) > 15;
  if (d > 150) return true;
  if (d >= 100 && d <= 150) return a.chroma < 45 || b.chroma < 45;
  return false;
}
const visible = (a, b) => de(a.lab, b.lab) > 25;
// metals a player tells apart, and which colours they suit
const FIN = { chrome: 'any', gunmetal: 'any', 'matte-black': 'any', gold: 'warm', 'rose-gold': 'warm', copper: 'warm', 'titanium-blue': 'cool', 'titanium-violet': 'cool' };
const warmish = (c) => neutral(c) || c.hue < 100 || c.hue > 330;
const coolish = (c) => neutral(c) || (c.hue > 180 && c.hue < 330);
const finOk = (f, a, b) => FIN[f] === 'any' || (FIN[f] === 'warm' ? warmish(a) && warmish(b) : coolish(a) && coolish(b));

// ---- shelves (the same rules run in the game, catalog.js)
const shelfClip = (d) => {
  const wild = ['flames', 'leopard', 'zebra', 'galaxy', 'camo', 'marble', 'carbon', 'honeycomb', 'wood', 'diamond-plate'];
  if (wild.includes(d.pattern)) return 'wild';
  if (d.body === 'jet' && vivid(byId[d.accent])) return 'neon';
  if (!['chrome', 'gunmetal', 'matte-black'].includes(d.finish) && (d.pattern === 'solid' || d.pattern === 'two-tone')) return 'metal';
  if (d.pattern === 'racing' || d.pattern === 'pinstripe') return 'stripes';
  if (d.pattern === 'checker' || d.pattern === 'dots') return 'checks';
  if (d.pattern === 'chevron' || d.pattern === 'fade') return 'waves';
  return byId[d.body].chroma < 30 ? 'classic' : 'bright';
};
const shelfGown = (d) => {
  if (d.pattern === 'solid') return 'plain';
  if (['stripes', 'pinstripe', 'yoke'].includes(d.pattern)) return 'stripes';
  if (['gingham', 'tartan', 'checker', 'houndstooth', 'argyle'].includes(d.pattern)) return 'checks';
  if (['dots', 'waves', 'chevron', 'fade'].includes(d.pattern)) return 'waves';
  return 'wild';
};
const byId = Object.fromEntries(P.map((c) => [c.id, c]));
for (const c of H.cols) if (!byId[c.id]) byId[c.id] = { ...c, chroma: Math.hypot(c.lab[1], c.lab[2]) };

// ---- pools
const clipPool = [], gownPool = [];
for (const a of P) for (const b of P) {
  if (!coherent(a, b)) continue;
  for (const f of Object.keys(FIN)) {
    if (!finOk(f, a, b)) continue;
    for (const p of CP) if (p === 'solid' || visible(a, b)) clipPool.push({ body: a.id, accent: b.id, finish: f, pattern: p });
  }
  // thin motifs (flowers, palms, scissors) need a stronger contrast than stripes to show
  const motif = (p) => p === 'floral' || p === 'palms' || p === 'scissors';
  for (const p of GP) if (p !== 'solid' && visible(a, b) && (!motif(p) || de(a.lab, b.lab) > 40)) gownPool.push({ main: a.id, second: b.id, pattern: p, collar: b.id });
}
for (const a of P) gownPool.push({ main: a.id, second: a.L > 55 ? 'jet' : 'white', pattern: 'solid', collar: a.L > 55 ? 'jet' : 'white' });
clipPool.forEach((d) => (d.shelf = shelfClip(d)));
gownPool.forEach((d) => (d.shelf = shelfGown(d)));

// ---- deterministic pick: shelf quotas, spread over colours and patterns, then round-robin order
let seed = 20261014;
const rnd = () => ((seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function pick(pool, quotas, keyA, keyB, capA, capB, base) {
  const out = { }, cntA = new Map(), cntB = new Map(), seen = new Set();
  for (const s of Object.keys(quotas)) out[s] = [];
  const sig = (d) => JSON.stringify(d);
  if (base) { out[base.shelf].push(base); seen.add(sig(base)); }
  for (const pass of [1, 2]) {
    for (const d of shuffle(pool.slice())) {
      const s = d.shelf, q = quotas[s];
      if (!q || out[s].length >= q || seen.has(sig(d))) continue;
      const a = keyA(d), b = keyB(d);
      if (pass === 1 && ((cntA.get(a) || 0) >= capA || (cntB.get(b) || 0) >= capB)) continue;
      out[s].push(d); seen.add(sig(d));
      cntA.set(a, (cntA.get(a) || 0) + 1); cntB.set(b, (cntB.get(b) || 0) + 1);
    }
  }
  // round-robin across shelves so every level adds a bit of everything (base first)
  const order = [];
  const lists = Object.values(out).map((l) => l.slice());
  if (base) { const l = lists.find((x) => x[0] === base); l.shift(); order.push(base); }
  while (lists.some((l) => l.length)) for (const l of lists) if (l.length) order.push(l.shift());
  return { order, out };
}
const baseClip = { body: 'charcoal', accent: 'jet', finish: 'chrome', pattern: 'solid', shelf: 'classic' };
const baseGown = { main: 'steel', second: 'white', pattern: 'solid', collar: 'white', shelf: 'plain' };
const CQ = { classic: 110, bright: 110, stripes: 150, checks: 130, waves: 130, metal: 130, wild: 170, neon: 70 };
const GQ = { plain: P.length, stripes: 150, checks: 165, waves: 160, wild: 600 - P.length - 150 - 165 - 160 };
const clips = pick(clipPool, CQ, (d) => d.pattern + '|' + d.body, (d) => d.body + '|' + d.accent, 3, 4, baseClip);
const gowns = pick(gownPool, GQ, (d) => d.pattern + '|' + d.main, (d) => d.main + '|' + d.second, 4, 5, baseGown);

// ---- premium designs take two videos: the wild patterns, the precious metals, neon on black
const CLIP_SHELVES = ['classic', 'bright', 'stripes', 'checks', 'waves', 'metal', 'neon', 'wild'];
const GOWN_SHELVES = ['plain', 'stripes', 'checks', 'waves', 'wild'];
const premClip = (d) => ['flames', 'leopard', 'zebra', 'galaxy', 'marble', 'honeycomb', 'diamond-plate'].includes(d.pattern) || ['gold', 'rose-gold', 'titanium-blue', 'titanium-violet'].includes(d.finish) || d.shelf === 'neon';
const premGown = (d) => ['barber-pole', 'floral', 'palms', 'scissors', 'argyle', 'houndstooth'].includes(d.pattern);
// ---- encode: 5 characters per design: 4 indices into the catalogue's colour / finish / pattern lists,
// then the shelf and the premium flag
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const ix = (list, v) => { const i = list.indexOf(v); if (i < 0) throw new Error('unknown ' + v); return A[i]; };
const flag = (shelves, d, prem) => A[shelves.indexOf(d.shelf) * 2 + (prem && d !== baseClip && d !== baseGown ? 1 : 0)];
const encClip = clips.order.map((d) => ix(COLS, d.body) + ix(COLS, d.accent) + ix(FINS, d.finish) + ix(CP, d.pattern) + flag(CLIP_SHELVES, d, premClip(d))).join('');
const encGown = gowns.order.map((d) => ix(COLS, d.main) + ix(COLS, d.second) + ix(GP, d.pattern) + ix(COLS, d.collar) + flag(GOWN_SHELVES, d, premGown(d))).join('');
console.error('premium: clippers', clips.order.filter(premClip).length, 'gowns', gowns.order.filter(premGown).length);
const stat = (o) => Object.fromEntries(Object.entries(o.out).map(([k, v]) => [k, v.length]));
console.error('palette', P.length, P.map((c) => c.id).join(' '));
console.error('pools: clippers', clipPool.length, 'gowns', gownPool.length);
console.error('picked: clippers', clips.order.length, JSON.stringify(stat(clips)), ' gowns', gowns.order.length, JSON.stringify(stat(gowns)));
require('fs').writeFileSync('designs-data.txt', `  const CLIPPER_CODE = '${encClip}';\n  const GOWN_CODE = '${encGown}';\n`);
console.error('data bytes', encClip.length + encGown.length);
