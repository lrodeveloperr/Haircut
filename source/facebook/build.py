"""Create the Meta Instant Games target from the full-fidelity direct-web build."""
from pathlib import Path
import json
import os
import shutil

root = Path(__file__).resolve().parents[1]
src, out = root / 'build-youtube', root / 'build-facebook'
if out.exists():
    shutil.rmtree(out)
shutil.copytree(src, out)

def one(text, old, new):
    assert text.count(old) == 1, f'Facebook patch expected exactly one occurrence: {old[:120]}'
    return text.replace(old, new)

for rel in ['runtime/game.js', 'runtime/customers.js']:
    path = out / rel
    text = path.read_text()
    text = text.replace('youtubeClientPromise', 'facebookClientPromise')
    text = text.replace('whenYouTubeResumed', 'whenFacebookResumed')
    text = text.replace('youtubeModulesReady', 'facebookModulesReady')
    path.write_text(text)

geo = out / 'runtime/youtube-geo.js'
poster = out / 'runtime/youtube-poster.js'
shutil.move(geo, out / 'runtime/facebook-geo.js')
shutil.move(poster, out / 'runtime/facebook-poster.js')
for path in (out / 'runtime').glob('youtube-*'):
    path.unlink()
shutil.copy2(root / 'facebook/client.js', out / 'runtime/facebook-client.js')
shutil.copy2(root / 'facebook/loader.js', out / 'runtime/facebook-loader.js')
shutil.copy2(root / 'facebook/startup.js', out / 'runtime/facebook-startup.js')

ad_config = {
    'ads': {
        'rewarded': {
            'unlock-item': os.environ.get('FACEBOOK_REWARDED_UNLOCK_ID', ''),
            'replay-customer': os.environ.get('FACEBOOK_REWARDED_REPLAY_ID', ''),
        },
        'interstitial': os.environ.get('FACEBOOK_INTERSTITIAL_ID', ''),
    }
}
(out / 'runtime/facebook-config.js').write_text(
    'globalThis.HSC=globalThis.HSC||{};HSC.facebookConfig=' +
    json.dumps(ad_config, separators=(',', ':')) + ';\n')

index = (out / 'index.html').read_text()
new = '''  <div id="fb-loading" role="status" aria-label="Loading game"><span aria-hidden="true">✂</span><span>Loading…</span></div>
  <script src="https://connect.facebook.net/en_US/fbinstant.8.0.js"></script>
  <script src="./runtime/facebook-poster.js"></script>
  <script src="./runtime/facebook-loader.js"></script>
  <script src="./runtime/facebook-geo.js"></script>
  <script src="./runtime/facebook-config.js"></script>
  <script src="./runtime/facebook-client.js"></script>
  <script src="./runtime/facebook-startup.js"></script>'''
start = index.index('  <div id="yt-loading"')
end = index.index('  <script src="./runtime/game.js', start)
index = index[:start] + new + '\n' + index[end:]
index = index.replace('ASMR Barber: Fade Master', 'Barber Simulator: ASMR Haircut')
(out / 'index.html').write_text(index)

styles = (out / 'styles.css').read_text().replace('yt-', 'fb-')
(out / 'styles.css').write_text(styles)
notices = (out / 'THIRD-PARTY-NOTICES.md').read_text().replace(
    '- YouTube Playables SDK: official YouTube runtime, subject to platform distribution terms.',
    '- Meta Instant Games SDK v8: official Meta runtime, subject to Meta platform terms.')
(out / 'THIRD-PARTY-NOTICES.md').write_text(notices)

(out / 'fbapp-config.json').write_text(json.dumps({'instant_games': {
    'navigation_menu_version': 'NAV_BAR',
    'orientation': 'PORTRAIT',
}}, separators=(',', ':')))

for path in out.rglob('*'):
    if path.is_file():
        data = path.read_bytes()
        if b'playgama.com' in data or b'Playgama' in data:
            raise AssertionError(f'Playgama residue in {path.relative_to(out)}')
        if b'youtube.com/game_api' in data or b'ytgame' in data:
            raise AssertionError(f'YouTube SDK residue in {path.relative_to(out)}')
print('facebook-build-ok')
