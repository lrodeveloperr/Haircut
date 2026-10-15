// Regenerates youtube/env/room-env.dat: the reflection lighting the game would otherwise generate at
// startup (three.js PMREMGenerator.fromScene(new RoomEnvironment(), 0.04), 768x1024 half-float RGBA).
// Runs the built game without the shipped file, so it takes the generating path, reads that exact
// texture back and stores it gzip-compressed. Usage: bash build-youtube.sh && node youtube/make-env.cjs
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), zlib = require('node:zlib');
const {chromium} = require('playwright');
const built = path.resolve(__dirname, '..', 'build-youtube');
const target = path.resolve(__dirname, 'env', 'room-env.dat');
(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'room-env-'));
  fs.cpSync(built, root, {recursive: true});
  fs.rmSync(path.join(root, 'runtime', 'room-env.dat'));
  const game = path.join(root, 'runtime', 'game.js');
  const generate = 'try { environmentTarget = generator.fromScene(new nw, .04); }';
  const source = fs.readFileSync(game, 'utf8');
  if (source.split(generate).length !== 2) throw Error('The generating statement changed; update this script');
  fs.writeFileSync(game, source.replace(generate, 'try { environmentTarget = generator.fromScene(new nw, .04);globalThis.__envTarget=environmentTarget;globalThis.__renderer=t; }'));
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 390, height: 844}});
  await page.route('http://env.test/**', route => {
    const name = new URL(route.request().url()).pathname, file = path.join(root, name === '/' ? 'index.html' : name);
    return fs.existsSync(file) ? route.fulfill({path: file}) : route.fulfill({status: 404});
  });
  // Off-platform SDK stand-in: the environment does not depend on the host.
  await page.route('https://www.youtube.com/game_api/v1', route => route.fulfill({contentType: 'application/javascript', body:
    "window.ytgame={IN_PLAYABLES_ENV:false,system:{getLanguage:async()=>'en',isAudioEnabled:()=>true,onPause:()=>()=>{},onResume:()=>()=>{},onAudioEnabledChange:()=>()=>{}},game:{loadData:async()=>'',saveData:async()=>{},firstFrameReady(){},gameReady(){}},engagement:{sendScore:async()=>{}},health:{logWarning(){}}};"}));
  await page.goto('http://env.test/');
  await page.waitForFunction(() => globalThis.skinFadeStudio, null, {timeout: 120000});
  const data = await page.evaluate(() => {
    const target = globalThis.__envTarget, pixels = new Uint16Array(target.width * target.height * 4);
    if (target.width !== 768 || target.height !== 1024) throw Error('Unexpected environment size');
    globalThis.__renderer.readRenderTargetPixels(target, 0, 0, target.width, target.height, pixels);
    return Array.from(new Uint8Array(pixels.buffer));
  });
  await browser.close();
  fs.rmSync(root, {recursive: true});
  // Group the low and high bytes of the half floats. Undoing this shuffle is exact and gzip
  // compresses the smoother high-byte plane much better than interleaved half floats.
  const raw = Buffer.from(data), half = raw.length / 2, packed = Buffer.alloc(raw.length + 8);
  packed.write('HSENV001');
  for (let i = 0; i < half; i++) { packed[8 + i] = raw[i * 2]; packed[8 + half + i] = raw[i * 2 + 1]; }
  fs.writeFileSync(target, zlib.gzipSync(packed, {level: 9}));
  console.log('wrote', path.relative(process.cwd(), target), fs.statSync(target).size, 'bytes');
})().catch(error => { console.error(error); process.exitCode = 1; });
