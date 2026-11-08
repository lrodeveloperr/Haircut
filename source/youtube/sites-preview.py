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
# The SDK's pause hooks give way to the page's own lifecycle: a web page has no platform that pauses it.
# Both blocks are marked web-only; the Android build (android/build-runtime.py) removes them again.
web_lifecycle = '''    // web-only:start
    // A hidden, frozen or closing page pauses exactly like a host pause and writes its progress now;
    // showing it again resumes. A page brought back from the back-forward cache reloads: another tab
    // may have saved since it was put away.
    // One game at a time: the saves live in this browser's storage, so two tabs would overwrite each
    // other's progress. A tab claims the game the first moment it is in view (a tab opened in the background
    // waits unclaimed and unstarted, and the tab in use keeps playing). A newer claim takes over: the older tab
    // pauses completely (no input, no timers, no saves) and reloads with the latest saves when it is shown,
    // focused, tapped, clicked or typed in again, or when the newer tab closes while this one is in view.
    // Two tabs that claim together settle on the later claim (then the id), so one of them always plays.
    let tabs = null, otherTab = null, reloading = false, claimed = 0;
    const tabId = Math.random().toString(36).slice(2);
    try { tabs = new BroadcastChannel('skin-fade-studio-tabs'); } catch (_) {}
    const reload = () => { if (!reloading) { reloading = true; location.reload(); } };
    const claim = () => {
      if (claimed || !tabs) return;
      claimed = Date.now();
      try { tabs.postMessage({hi: 1, me: tabId, at: claimed}); } catch (_) {}
    };
    const leave = () => { pause('host', true); if (loaded && game) flush().catch(report); };
    // the claim comes before the pause lifts, so this tab reads the saves only once it owns them
    const shown = () => {
      if (document.visibilityState === 'hidden') return;
      if (HSC.otherTab) reload(); else { claim(); pause('host', false); }
    };
    const visibility = () => { if (document.visibilityState === 'hidden') leave(); else shown(); };
    const restored = event => { if (event.persisted) reload(); else shown(); };
    const closing = () => { leave(); try { tabs?.postMessage({bye: 1, me: tabId}); } catch (_) {} };
    // a paused older tab takes no input at all: a tap, click or key means the player picked this tab, which
    // reloads and takes over (a click on a window that already has focus sends no focus event)
    const woken = event => {
      if (!HSC.otherTab) return;
      event.preventDefault(); event.stopImmediatePropagation();
      reload();
    };
    const inputs = ['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown'];
    if (tabs) {
      tabs.onmessage = event => {
        const message = event.data || {};
        if (!message.hi || message.me === tabId) {
          if (message.bye && message.me === otherTab && document.visibilityState === 'visible') reload();
          return;
        }
        // not claimed yet (never in view): nothing to give up or defend; this tab claims when it is shown.
        // A hello with no claim time is the game's own guard (customers/meta.js), sent by a tab that has already
        // claimed here: never answered, or a lone tab would answer itself and its own meta guard would yield.
        if (!claimed || !Number.isFinite(message.at)) return;
        const newer = message.at > claimed || (message.at === claimed && String(message.me) > tabId);
        // the newer claim plays: this tab stops like a host pause (the page goes inert) and never resumes in place
        if (newer) { otherTab = message.me; HSC.otherTab = true; pause('host', true); }
        // an older claim that may not have heard ours (its channel opened after we spoke): answer, so it yields
        else if (!HSC.otherTab) { try { tabs.postMessage({hi: 1, me: tabId, at: claimed}); } catch (_) {} }
      };
    }
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('freeze', leave);
    document.addEventListener('resume', shown);
    globalThis.addEventListener('pagehide', closing);
    globalThis.addEventListener('pageshow', restored);
    globalThis.addEventListener('focus', shown);
    for (const type of inputs) globalThis.addEventListener(type, woken, {capture: true, passive: false});
    cleanup.push(() => {
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('freeze', leave);
      document.removeEventListener('resume', shown);
      globalThis.removeEventListener('pagehide', closing);
      globalThis.removeEventListener('pageshow', restored);
      globalThis.removeEventListener('focus', shown);
      for (const type of inputs) globalThis.removeEventListener(type, woken, {capture: true});
      try { tabs?.close(); } catch (_) {}
    });
    if (document.visibilityState === 'hidden') pause('host', true);
    else claim();
    // web-only:end
'''
start = s.index('    // Register before awaiting')
end = s.index('    async function load()', start)
s = s[:start] + web_lifecycle + s[end:]
s = replace(s, '        requireLoaded();\n        const data = encodeSave(envelope);\n', '''        requireLoaded();
        // web-only:start
        // a newer tab owns the saves now (the one-tab guard above): this one stops writing, checked when the
        // write runs, so a save queued just before the other tab took over is not written either
        if (HSC.otherTab) return;
        // web-only:end
        const data = encodeSave(envelope);
''')
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
