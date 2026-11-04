"""Android build only (buildall.sh, HEAD_SHAPES=1): the scalp strand count comes from HSC.HAIR_MAX (default
30,000, the original). The first 30,000 roots are the same as before (same random sequence); strands are drawn
thinner as the count rises (uWidth = sqrt(30000 / count)), so the head carries the same hair at any count."""
import sys
p = sys.argv[1]
s = open(p).read()
i = s.index('function aw(e,t,r){')
j = s.index('var nw=class extends', i)
f = s[i:j]
assert f.count('3e4') == 8, f.count('3e4')
f = f.replace('Math.sqrt(3e4/m.instanceCount)', 'Math.sqrt(HS_W/m.instanceCount)')
f = f.replace('3e4', 'hs_N').replace('HS_W', '3e4')
f = f.replace('function aw(e,t,r){', 'function aw(e,t,r){let hs_N=globalThis.HSC&&HSC.HAIR_MAX>3e4?HSC.HAIR_MAX:3e4;', 1)
# (the model cache is added later by youtube/build.py and is disabled on Android, so its key needs no change)
s = s[:i] + f + s[j:]
open(p, 'w').write(s)
print('patched strand count (Android: HSC.HAIR_MAX)')
