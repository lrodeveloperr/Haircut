"""Wardrobe (clipper + gown customisation, coins, unlocks) and falling hair clippings."""
import sys
p = sys.argv[1]
s = open(p).read()


def rep(old, new, count=1):
    global s
    assert s.count(old) == count, (s.count(old), old[:90])
    s = s.replace(old, new)


# the gown, the scene and texture classes for the customer system
rep('light:xr,eyeCanvas:es,eyeTexture:ts,T:{It,mt,Ra,af,Ze,fr,uu,Jn,cr,or,$t}}',
    'light:xr,eyeCanvas:es,eyeTexture:ts,robe:ll,scene:Zt,T:{It,mt,Ra,af,Ze,fr,uu,Jn,cr,or,$t,Fg,Pn,Lt}}')
# the clipper model is built inside the renderer
rep('let i=Sw();Zt.add(i);', 'let i=Sw();Zt.add(i);HSC.attachClipper&&HSC.attachClipper(i);')
# cut hair falls as real clippings instead of dots
rep('function m(ue){if(w)for(let ye=0;ye<Math.ceil(2+ue*5);ye++)',
    'function m(ue){if(HSC.emitClippings&&HSC.emitClippings(w,ue))return;if(w)for(let ye=0;ye<Math.ceil(2+ue*5);ye++)')
rep('ue?he(performance.now()):Pe=0,P(),L(),X(),z(),A()',
    'ue?he(performance.now()):Pe=0,P(),L(),X(),z(),A(),HSC.stepClippings&&HSC.stepClippings()')
# keep rendering every frame while clippings are still falling
rep('(f||s.status==="reveal"&&!x||j%66<20)&&n.render(!!(f||s.status==="reveal"&&!x))',
    '(f||s.status==="reveal"&&!x||j%66<20||HSC.clippingsActive&&HSC.clippingsActive())&&n.render(!!(f||s.status==="reveal"&&!x||HSC.clippingsActive&&HSC.clippingsActive()))')
rep('n.setBeard(s.beard),n.emitHair(Ie.intensity)',
    'n.setBeard(s.beard),HSC.lastCut={cells:Ie.changedCells,removed:Ie.removedLength,kind:ue.kind||"scalp"},n.emitHair(Ie.intensity)')
# hook for each finished customer (unused since v3.61)
rep('t.sendAnalytics("haircut_completed",{job:s.jobId}))',
    't.sendAnalytics("haircut_completed",{job:s.jobId}),HSC.onHaircutDone&&HSC.onHaircutDone(s))')
# the wardrobe needs the platform client (storage, rewarded videos) and the game
rep('let n=Ad({root:e,game:a});', 'let n=Ad({root:e,game:a});HSC.wardrobeInit&&HSC.wardrobeInit({client:t,game:a});')

open(p, 'w').write(s)
print('patched wardrobe')
