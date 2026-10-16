"""Create an explicit standalone Sites target. Never alters production SDK failure behavior."""
from pathlib import Path
import re
import shutil
import sys
from asset_urls import version_asset_urls

src, out = map(lambda value: Path(value).resolve(), sys.argv[1:3])
assert src != out and (src / 'runtime/youtube-client.js').is_file()
if out.exists():
    shutil.rmtree(out)
shutil.copytree(src, out)

def replace(text, old, new):
    assert text.count(old) == 1, old[:100]
    return text.replace(old, new)

s = (src / 'runtime/youtube-client.js').read_text()
s = replace(s, '/* Direct YouTube Playables integration. No Playgama SDK or production mock. */', '/* Explicit standalone Sites target: local saves, no external SDK and no simulated ads. */')
s = replace(s, 'HSC.createYouTubeClient', 'HSC.createLocalPreviewClient')
start = s.index('    const sdk = globalThis.ytgame;')
end = s.index('    let disposed', start)
s = s[:start] + '    HSC.isLocalPreview = true;\n    const hosted = false;\n' + s[end:]
s = replace(s, 'hostAudio = sdk.system.isAudioEnabled() === true', 'hostAudio = true')
s = replace(s, 'const report = () => { try { sdk.health?.logWarning(); } catch (_) {} };', 'const report = () => {};')
start = s.index('    // Register before awaiting')
end = s.index('    async function load()', start)
s = s[:start] + s[end:]
s = replace(s, 'hosted ? await sdk.game.loadData() : previewStore.get()', 'previewStore.get()')
start = s.index('    function reportScore()')
end = s.index('    function requireLoaded()', start)
s = s[:start] + '    function reportScore() {}\n' + s[end:]
s = replace(s, 'if (hosted) await sdk.game.saveData(data);\n        else previewStore.set(data);', 'previewStore.set(data);')
start = s.index('    async function advertisement(')
end = s.index('    function destroy()', start)
s = s[:start] + '    async function advertisement() { return false; }\n' + s[end:]
start = s.index("    let language = 'en';")
end = s.index('    return {\n      platformId:', start)
s = s[:start] + "    const language = globalThis.navigator?.language || 'en';\n" + s[end:]
s = replace(s, "hosted && typeof sdk.ads?.requestRewardedAd === 'function'", 'false')
s = replace(s, 'sdk.game.gameReady(); ', '')
assert not re.search(r'\bsdk\s*[.?]|globalThis\.ytgame', s)
(out / 'runtime/local-preview-client.js').write_text(s)
(out / 'runtime/youtube-client.js').unlink()
s = (src / 'runtime/youtube-startup.js').read_text().replace('HSC.createYouTubeClient', 'HSC.createLocalPreviewClient')
(out / 'runtime/local-preview-startup.js').write_text(s)
(out / 'runtime/youtube-startup.js').unlink()
s = (src / 'index.html').read_text()
s = replace(s, '  <script src="https://www.youtube.com/game_api/v1"></script>\n', '')
s = s.replace('youtube-client.js', 'local-preview-client.js').replace('youtube-startup.js', 'local-preview-startup.js')
(out / 'index.html').write_text(s)
version_asset_urls(out)
assert (out / 'runtime/game.js').read_bytes() == (src / 'runtime/game.js').read_bytes()
assert (out / 'runtime/customers.js').read_bytes() == (src / 'runtime/customers.js').read_bytes()
print('Standalone preview: unchanged engine, customers, assets and local save key; no external SDK.')
