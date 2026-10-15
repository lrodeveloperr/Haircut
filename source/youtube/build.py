"""Create the direct-YouTube target from the corrected, light-detail game build."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
src, out = root / 'build', root / 'build-youtube'
if out.exists():
    shutil.rmtree(out)
out.mkdir()
for name in ['index.html', 'styles.css', 'THIRD-PARTY-NOTICES.md', 'assets', 'runtime', 'licenses']:
    source, target = src / name, out / name
    shutil.copytree(source, target) if source.is_dir() else shutil.copy2(source, target)

def replace(text, old, new):
    assert text.count(old) == 1, f'YouTube patch expected exactly one occurrence: {old[:100]}'
    return text.replace(old, new)

game_path = out / 'runtime/game.js'
s = game_path.read_text()
start, end = s.index('function Iw(){'), s.index('var Rw=Object.defineProperty')
assert start < end
s = s[:start] + 'async function Gu(){return HSC.createYouTubeClient()}'+s[end:]
s = replace(s, 'let ce=()=>{Ae(),C||n.render(!1)}', 'let ce=()=>{if(c)return;Ae(),C||n.render(!1)}')
s = replace(s, 'w=requestAnimationFrame(ve)}t.setUserAudioEnabled(m),J(),te(),w=requestAnimationFrame(ve);function ge(){c=u||h,S=performance.now(),n.resetTiming(),c&&(Ae(),$(!0).catch(()=>{})),te(),Z()}',
    'w=c?0:requestAnimationFrame(ve)}t.setUserAudioEnabled(m),J(),te(),w=requestAnimationFrame(ve);function ge(){c=u||h;cancelAnimationFrame(w);w=0;S=performance.now();n.resetTiming();if(c){Ae();$(!0).catch(()=>{})}else{ce();w=requestAnimationFrame(ve)}te();Z()}')
s = replace(s, 'return{renderFirstPlayableFrame(){n.render()}', 'return{flushProgress:()=>$(!0),renderFirstPlayableFrame(){n.render()}')
s = replace(s, 'ae&&(l=j.adSession)', 't.lastInterstitialRequestAccepted&&(l=j.adSession)')
s = replace(s, 'game = Pu({root, client, savedSession: session, savedAudio: audio});', 'await client.whenResumed();\n    game = Pu({root, client, savedSession: session, savedAudio: true});')
s = replace(s, 'client.bindGame({root, setPaused: game.setPaused, setAudioEnabled: game.setPlatformAudio});', 'client.bindGame({root, setPaused: game.setPaused, setAudioEnabled: game.setPlatformAudio, flush: game.flushProgress});')
s = replace(s, '    await client.gameReady();', '    HSC.dismissLoading();\n    await client.gameReady();')
s = replace(s, "    globalThis.addEventListener('pagehide', () => { unmount(); game.destroy(); client.destroy(); }, {once: true});", '')
s = replace(s, 'function showBootError(error) {', 'function showBootError(error) {\n  HSC.dismissLoading();')
game_path.write_text(s)

customer_path = out / 'runtime/customers.js'
s = customer_path.read_text()
start = s.index('  function oneTab(client) {')
end = s.index('\n  M.level =', start)
s = s[:start] + '  function oneTab(client) { /* YouTube owns foreground, pause and resume. */ }\n' + s[end:]
s = s.replace('setInterval(', 'HSC.lifecycle.interval(').replace('clearTimeout(', 'HSC.lifecycle.clear(').replace('setTimeout(', 'HSC.lifecycle.timeout(')
# Prevent resize handlers and delayed wardrobe/reveal UI work from running during host pause.
s = replace(s, "const place = () => { HSC.applyScale(); this.place();", "const place = () => { if (HSC.executionPaused) return; HSC.applyScale(); this.place();")
s = replace(s, "  const sfx = { ctx: null, out: null, noise: null };", """  const sfx = { ctx: null, out: null, noise: null };
  HSC.setRevealAudio = enabled => {
    if (!sfx.ctx || !sfx.out) return;
    sfx.out.gain.cancelScheduledValues(sfx.ctx.currentTime);
    sfx.out.gain.value = enabled ? 0.55 * (view()?.volume ?? 1) : 0;
    (enabled ? sfx.ctx.resume() : sfx.ctx.suspend()).catch(() => {});
  };""")
customer_path.write_text(s)
for name in ['client.js', 'loader.js']:
    shutil.copy2(root / 'youtube' / name, out / 'runtime' / ('youtube-' + name))

s = (out / 'index.html').read_text()
s = replace(s, '  <script src="https://bridge.playgama.com/v2/stable/playgama-bridge.js"></script>', '''  <div id="yt-loading" role="status" aria-label="Loading game"><span aria-hidden="true">✂</span></div>
  <script src="https://www.youtube.com/game_api/v1"></script>
  <script src="./runtime/youtube-loader.js"></script>
  <script src="./runtime/youtube-client.js"></script>''')
(out / 'index.html').write_text(s)
with (out / 'styles.css').open('a') as f:
    f.write('\n#yt-loading{position:fixed;inset:0;display:grid;place-items:center;background:#f5e7d7;color:#493326;font-size:64px;z-index:9999}html.yt-paused *{animation-play-state:paused!important}\n')
print('youtube-build-ok')
