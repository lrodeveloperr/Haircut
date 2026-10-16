"""Keep cold startup independent of optional lighting/model-cache transfers."""
from pathlib import Path
import os, re
root = Path(os.environ.get('RELEASE_DIR', 'source/build-youtube'))
assert not (root / 'runtime/room-env.dat').exists()
html = (root / 'index.html').read_text()
assert 'room-env.dat' not in html
geo = (root / 'runtime/youtube-geo.js').read_text()
poster = (root / 'runtime/youtube-poster.js').read_text()
assert not re.search(r'\b(fetch|indexedDB|DecompressionStream|structuredClone|setTimeout)\b', geo)
assert not re.search(r'\b(localStorage|toBlob|FileReader|setTimeout)\b', poster)
game = (root / 'runtime/game.js').read_text()
assert 'environmentTarget = generator.fromScene(new nw, .04)' in game
assert 'environmentDirty=true' in game
print('PASS: original full-detail lighting generator, context restoration, no optional startup download/cache/snapshot')
