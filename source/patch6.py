"""Detail levels (high / low for weaker phones) driven by customers.js (HSC.detail)."""
import sys
p = sys.argv[1]
s = open(p).read()


def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)


# renderer: MSAA and pixel ratio by detail level; strand budget limits come from the level
rep('new Z0({canvas:e,antialias:!0,alpha:!0,powerPreference:"high-performance"})',
    'new Z0({canvas:e,antialias:HSC.detail.antialias,alpha:!0,powerPreference:"high-performance"})')
rep('$=Math.max(1,Math.min(2,globalThis.devicePixelRatio||1)),J=$,te=3e4',
    '$=HSC.detail.pixelRatio(),J=$,te=HSC.detail.maxStrands')
rep('function He(ue){te=Math.max(16e3,Math.min(Oi.count,ue)),Oi.setCount(te),HSC.setDetail&&HSC.setDetail(te/Oi.count)}He(te);',
    'function He(ue){te=Math.max(HSC.detail.minStrands,Math.min(HSC.detail.maxStrands,ue)),Oi.setCount(te),HSC.setDetail&&HSC.setDetail(te/HSC.detail.maxStrands)}He(te);'
    'HSC.detailBudget=()=>{$=HSC.detail.pixelRatio(),J=$,He(HSC.detail.maxStrands)};')
rep('Ue>24&&te>16e3?He(te-4e3):Ue>30&&$>1.2?$=Math.max(1.1,$-.25):Ue<18&&te<Oi.count?He(te+2e3):Ue<17.5&&$<J&&($=Math.min(J,$+.25))',
    'Ue>24&&te>HSC.detail.minStrands?He(te-4e3):Ue>30&&$>HSC.detail.pixelMin+.1?$=Math.max(HSC.detail.pixelMin,$-.25):Ue<18&&te<HSC.detail.maxStrands?He(te+2e3):Ue<17.5&&$<J&&($=Math.min(J,$+.25)),HSC.detailWatch&&HSC.detailWatch(Ue,te,$)')
rep('setCount(S){m.instanceCount=Math.max(16e3,Math.min(3e4,S)),p.value=Math.sqrt(3e4/m.instanceCount)}',
    'setCount(S){m.instanceCount=Math.max(HSC.detail.minStrands,Math.min(3e4,S)),p.value=Math.sqrt(3e4/m.instanceCount)}')
# the customer system can rebuild the scalp strand geometry for the detail level
rep('HSC.attach({Pt,Gi,vt,Ql,Na,', 'HSC.attach({Pt,Gi,Oi,vt,Ql,Na,')
# the saved detail setting loads before the renderer is created
rep('let[r,i]=await Promise.all([t.loadProgress(Fl,Ei()),t.loadProgress(Ll,!0)]),a=Pu(',
    'let[r,i]=await Promise.all([t.loadProgress(Fl,Ei()),t.loadProgress(Ll,!0),HSC.initDetail&&HSC.initDetail(t)]),a=Pu(')

open(p, 'w').write(s)
print('patched detail')
