"""Android build only (buildall.sh, HEAD_SHAPES=1): customers have their own skull and neck (customers/headshapes.js), so
the head a ray hits is no longer the head the scalp's cutting grid was built on. HSC.warpBase carries the hit back to the
un-morphed head for the scalp's mask and grid; the clipper still lands on the drawn head, and beards stay as they were."""
import sys
p = sys.argv[1]
s = open(p).read()

def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)

rep('let hs_bh=Na(se,me,Fe)<.05?HSC.beardHit(se,me,Fe,be,hs_B===hs_I):null;if(Na(se,me,Fe)<.05&&!hs_bh)return w=null,null;',
    'let hs_b=HSC.warpBase(se,me,Fe,hs_A,hs_B,be),hs_bh=Na(...hs_b)<.05?HSC.beardHit(se,me,Fe,be,hs_B===hs_I):null;if(Na(...hs_b)<.05&&!hs_bh)return w=null,null;')
rep('dl(Nn({},hs_bh||Tl(se,me,Fe)),{position:[se,me,Fe],', 'dl(Nn({},hs_bh||Tl(...hs_b)),{position:hs_bh?[se,me,Fe]:hs_b,')
open(p, 'w').write(s)
print('patched head form hit (Android)')
