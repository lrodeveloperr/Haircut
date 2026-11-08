'use strict';
// Installed-APK locale gate: Android's complete device locale controls a fresh player, regional/script
// routing is preserved, unsupported locales recover to English, and a saved manual choice wins thereafter.
const assert = require('node:assert/strict');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const app = 'com.worksbien.barbersimulatorasmr.debug';
const activity = app + '/com.worksbien.barbersimulatorasmr.MainActivity';
const adbPath = path.join(process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT, 'platform-tools/adb');
const apk = 'android/native/app/build/outputs/apk/debug/app-debug.apk';
const adb = (...args) => execFileSync(adbPath, args, {encoding: 'utf8', timeout: 120000}).trim();
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;

async function attach() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const pid = adb('shell', 'pidof', app).split(' ')[0];
      adb('forward', 'tcp:9223', 'localabstract:webview_devtools_remote_' + pid);
      const targets = await (await fetch('http://127.0.0.1:9223/json/list', {signal: AbortSignal.timeout(5000)})).json();
      const target = targets.find(item => item.url.includes('appassets.androidplatform.net'));
      if (!target) throw Error('game WebView not ready');
      socket = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        socket.addEventListener('open', resolve, {once: true});
        socket.addEventListener('error', reject, {once: true});
      });
      let sequence = 0;
      const pending = new Map();
      socket.addEventListener('message', event => {
        const message = JSON.parse(event.data), request = pending.get(message.id);
        if (!request) return;
        pending.delete(message.id);
        message.error ? request.reject(Error(message.error.message)) : request.resolve(message.result);
      });
      return async expression => {
        const id = ++sequence;
        const result = await new Promise((resolve, reject) => {
          pending.set(id, {resolve, reject});
          socket.send(JSON.stringify({id, method: 'Runtime.evaluate', params: {expression, awaitPromise: true, returnByValue: true}}));
        });
        if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
        return result.result.value;
      };
    } catch (_) {
      if (socket) socket.close();
      socket = null;
      await pause(500);
    }
  }
  throw Error('installed WebView debugging unavailable');
}

async function launch(tag, expected, clear = true) {
  if (socket) socket.close();
  socket = null;
  adb('shell', 'cmd', 'locale', 'set-device-locale', tag);
  assert.equal(adb('shell', 'cmd', 'locale', 'get-device-locale'), tag);
  if (clear) adb('shell', 'pm', 'clear', app);
  adb('shell', 'am', 'force-stop', app);
  adb('shell', 'am', 'start', '-W', '-n', activity);
  const evaluate = await attach();
  let state;
  for (let attempt = 0; attempt < 240; attempt++) {
    state = await evaluate(`({ready:!!(window.skinFadeStudio&&window.HSC&&HSC.lang&&HSC.meta&&HSC.meta.client),language:window.HSC&&HSC.lang?HSC.lang():null,html:document.documentElement.lang,dir:document.documentElement.dir})`);
    if (state.ready) break;
    await pause(250);
  }
  assert(state?.ready, 'game did not become ready for ' + tag);
  assert.equal(state.language, expected, tag + ' automatic language');
  return {evaluate, state};
}

(async () => {
  adb('install', '-r', apk);
  const results = [];
  try {
    for (const [tag, expected] of [['zh-Hant-TW', 'zh-Hant'], ['zh-Hans-CN', 'zh-Hans'], ['es-MX', 'es-419'], ['fr-CA', 'fr'], ['zu-ZA', 'en']]) {
      const {state} = await launch(tag, expected);
      results.push({tag, expected, actual: state.language, html: state.html, dir: state.dir});
    }
    const french = await launch('fr-CA', 'fr');
    await french.evaluate(`(async()=>{HSC.setLang('ja');await HSC.meta.client.flushProgress();return HSC.lang()})()`);
    const saved = await launch('de-DE', 'ja', false);
    results.push({tag: 'de-DE', expected: 'ja', actual: saved.state.language, reason: 'saved manual choice'});
    console.log(JSON.stringify({status: 'PASS', results}, null, 2));
  } finally {
    if (socket) socket.close();
    try { adb('shell', 'cmd', 'locale', 'set-device-locale', 'en-US'); } catch (_) {}
    try { adb('shell', 'pm', 'clear', app); } catch (_) {}
  }
})().catch(error => { console.error(error.stack || error); process.exit(1); });
