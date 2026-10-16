"""Package the working Sites engine for Android; adapt only host services and Android reward/title policy."""
from pathlib import Path
import importlib.util
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
source = root / 'source'
out = source / 'build-android'
subprocess.run([sys.executable, str(source / 'youtube/sites-preview.py'), str(source / 'build-youtube'), str(out)], check=True)

def replace(text, old, new):
    if text.count(old) != 1:
        raise ValueError(f'Android host adaptation expected one occurrence: {old[:100]}')
    return text.replace(old, new)

# Keep the working renderer and adapt only Android touch targeting. A finger holds
# a bounded projected-grip target instead of using the former 24/72px extremes.
game = (out / 'runtime/game.js').read_text()
game = replace(game, 'let ae=ue=>{ue.preventDefault();k=true;',
               (root / 'android/clipper-input.js').read_text() + '\nlet ae=ue=>{ue.preventDefault();k=true;')
game = replace(game, 'raycast:j,getYaw()', 'raycast:j,touchTarget:androidTouchTarget,resetTouchTarget:androidResetTouchTarget,clipperScreen:androidClipperScreen,getYaw()')
game = replace(game, 'f=null,o.stop(),n.setClipper(!1)', 'f=null,o.stop(),n.resetTouchTarget(),n.setClipper(!1)')
game = replace(game, 'let ae=j.clientX,fe=j.clientY-(j.pointerType==="touch"?Math.min(ur.touchOffsetPx,a.clientHeight*.12):0),ue=n.raycast(ae,fe);',
               'let target=n.touchTarget(j),ae=target.x,fe=target.y,ue=n.raycast(ae,fe);')
game = replace(game, 'let ae=j.clientY-(j.pointerType==="touch"?Math.min(ur.touchOffsetPx,a.clientHeight*.12):0),fe=j.pointerType==="touch"?22:12;',
               'let target=n.touchTarget(j),ae=target.y,fe=j.pointerType==="touch"?22:12;')
(out / 'runtime/game.js').write_text(game)

client = (out / 'runtime/local-preview-client.js').read_text()
client = replace(client, 'HSC.createLocalPreviewClient', 'HSC.createAndroidClient')
client = replace(client, 'HSC.isLocalPreview = true;', 'HSC.isLocalPreview = false;')
client = replace(client, 'const raw = previewStore.get();', "const raw = await HSC.android.request('load', null);")
client = replace(client, 'previewStore.set(data);', "await HSC.android.request('save', data);")
client = replace(client, '    async function load() {', '''    cleanup.push(HSC.android.onPause(value => {
      pause('host', value);
      if (value && loaded && game) flush().catch(report);
    }));
    async function load() {''')
client = replace(client, '    async function advertisement() { return false; }', '''    async function advertisement(kind, placement) {
      if (kind === 'interstitial') interstitialAccepted = false;
      if (disposed || adPending || state().executionPaused) return false;
      if (kind === 'interstitial' && performance.now() - lastAttempt < 60000) return false;
      adPending = true;
      let result = false;
      try {
        await flush();
        if (disposed || state().executionPaused) return false;
        pause('advertisement-request', true);
        if (kind === 'interstitial') lastAttempt = performance.now();
        const receipt = await HSC.android.advertisement(kind, placement);
        interstitialAccepted = kind === 'interstitial' && receipt.displayed;
        result = kind === 'rewarded' ? receipt.earned : receipt.displayed;
      } catch (_) { report(); }
      finally { pause('advertisement-request', false); adPending = false; }
      await whenResumed();
      return result;
    }''')
client = replace(client, "platformId: 'youtube', language: language || 'en', isLocalPreview: !hosted,", "platformId: 'android', language: language || 'en', isLocalPreview: false,")
client = replace(client, 'rewardedSupported: false,', 'rewardedSupported: true,')
client = replace(client, 'if (!ready) { ready = true; if (HSC.startupTiming)', 'if (!ready) { ready = true; AndroidHost.gameReady(); if (HSC.startupTiming)')
(out / 'runtime/android-client.js').write_text(client)
(out / 'runtime/local-preview-client.js').unlink()
startup = (out / 'runtime/local-preview-startup.js').read_text().replace('HSC.createLocalPreviewClient', 'HSC.createAndroidClient')
(out / 'runtime/android-startup.js').write_text(startup)
(out / 'runtime/local-preview-startup.js').unlink()
shutil.copy2(root / 'android/native-transport.js', out / 'runtime/android-transport.js')
html = (out / 'index.html').read_text().replace('local-preview-client.js', 'android-client.js').replace('local-preview-startup.js', 'android-startup.js')
html = replace(html, '  <script src="./runtime/android-client.js', '  <script src="./runtime/android-transport.js"></script>\n  <script src="./runtime/android-client.js')
(out / 'index.html').write_text(html)
spec = importlib.util.spec_from_file_location('android_policy', root / 'android/patch-runtime.py')
policy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(policy)
policy.adapt(out)
sys.path.insert(0, str(source / 'youtube'))
from asset_urls import version_asset_urls
version_asset_urls(out)
# Keep the shared foundation for its existing domain/legacy host contract tests.
foundation = source / 'build-foundation'
if foundation.exists(): shutil.rmtree(foundation)
shutil.move(str(source / 'build'), foundation)
shutil.copytree(out, source / 'build')
for file in (out / 'runtime').glob('*.js'):
    subprocess.run(['node', '--check', str(file)], check=True)
print('Android: working Sites engine, asynchronous native host, projected clipper-grip touch targeting')
