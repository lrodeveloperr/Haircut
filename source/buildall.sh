set -e
cd "$(dirname "$0")"
if [ "${TARGET:-playables}" = full ]; then
  python3 -c 'import shutil; shutil.rmtree("build", ignore_errors=True)'
  TARGET=youtube bash buildall.sh
  python3 youtube/build.py
  python3 ../android/build-runtime.py
  exit
fi
# Keep publisher-specific graphics policy separate from the Android and legacy Playgama targets.
case "${TARGET:-playables}" in
  youtube) DETAIL=detail-youtube ;;
  *) DETAIL=detail-playables ;;
esac
mkdir -p build/runtime
cp -r src/assets src/THIRD-PARTY-NOTICES.md src/styles.css build/
cp -r src/licenses build/
cat src/boot-error.css >> build/styles.css
cp src/runtime/game.js build/runtime/game.js
python3 patch.py build/runtime/game.js
python3 patch2.py build/runtime/game.js
python3 patch3.py build/runtime/game.js
python3 patch4.py build/runtime/game.js
python3 patch5.py build/runtime/game.js
python3 patch6.py build/runtime/game.js
python3 patch7.py build/runtime/game.js
python3 patch8.py build/runtime/game.js
python3 patch9.py build/runtime/game.js
python3 patch10.py build/runtime/game.js
python3 patch11.py build/runtime/game.js
python3 patch12.py build/runtime/game.js
python3 patch13.py build/runtime/game.js
python3 patch14.py build/runtime/game.js
{ echo "/* Haircut Studio customers: generated people, skin, hair textures, baldness, trimmable beards, face shapes. */"
  for f in "$DETAIL" people glsl faces render state meta catalog patterns wardrobe hub clippings; do cat customers/$f.js; echo; done; } > build/runtime/customers.js
python3 - <<'PY'
p='build/index.html'; s=open('src/index.html').read()
a='  <script src="./runtime/game.js?entry=src/main.js"></script>'
assert s.count(a)==1
s=s.replace(a,'  <script src="./runtime/customers.js"></script>\n'+a)
open(p,'w').write(s)
PY
python3 - <<'PY'
import json
c=json.load(open('src/playgama-bridge-config.json'))
c['advertisement']['rewarded']={'disable':False,'placementFallback':'unlock-item','placements':[{'id':'unlock-item'},{'id':'replay-customer'}]}
json.dump(c,open('build/playgama-bridge-config.json','w'),separators=(',',':'))
PY
node --check build/runtime/game.js
node --check build/runtime/customers.js
echo build-ok
