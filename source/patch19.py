"""Android build only (buildall.sh, HEAD_SHAPES=1): barber tools (customers/tools.js).
The clipper stays the default. With another tool chosen, HSC.toolLevel(level, guard) decides the hair level a
cell is cut to, and HSC.bladeWidth() the blade's width; nothing changes while the clipper is in the hand."""
import sys
p = sys.argv[1]
s = open(p).read()

def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)

rep('h=Math.min(u,e.selectedGuard)', 'h=Math.min(u,globalThis.HSC&&HSC.toolLevel?HSC.toolLevel(u,e.selectedGuard,c):e.selectedGuard)')
i = s.index('function Wd(e,t,r){'); j = s.index('function ', i + 10)
f = s[i:j]
assert f.count('ur.bladeWidthUnits') == 2
f = f.replace('ur.bladeWidthUnits', 'hs_bw').replace('function Wd(e,t,r){', 'function Wd(e,t,r){let hs_bw=globalThis.HSC&&HSC.bladeWidth?HSC.bladeWidth():ur.bladeWidthUnits;', 1)
s = s[:i] + f + s[j:]
# eyebrows (state.js cutBrow): a hit on a brow trims it; undo and replay carry the brows
rep('Ie=ue.kind==="beard"?HSC.cutBeard(s,ye,n.beardSurface):Ts(s,ye,{surface:n.surface})',
    'Ie=ue.kind==="brow"&&HSC.cutBrow?HSC.cutBrow(s,ye):ue.kind==="beard"?HSC.cutBeard(s,ye,n.beardSurface):Ts(s,ye,{surface:n.surface})')
# undo carries the brows as a third argument: no brows given keeps the current ones; brows that are not exactly
# HSC.BROW_N cells of 0 (shaved), 1 (short) or 2 (full) refuse the whole restore, as a wrong-sized hair grid does
# (applied, HSC.ensure would regrow them full). gt takes two arguments, so the brows join the same object.
rep('async function hs_restore(h,b){if(c||T||s.status!=="cutting"||!Array.isArray(h)||h.length!==8192)return!1;',
    'async function hs_restore(h,b,w){if(c||T||s.status!=="cutting"||!Array.isArray(h)||h.length!==8192)return!1;'
    'if(w!=null&&!(Array.isArray(w)&&globalThis.HSC&&w.length===HSC.BROW_N&&w.every(v=>v===0||v===1||v===2)))return!1;')
rep('s=gt(rt({},s),{hair:[...h],beard:Array.isArray(b)?b.slice():s.beard})', 's=gt(rt({},s),Object.assign({hair:[...h],beard:Array.isArray(b)?b.slice():s.beard},w!=null?{brow:w.slice()}:{}))')
rep('cutStrokeCount:0,result:null,guideRemainingMs:0}),x=!1,y=!1,D=0,HSC.clearClippings', 'cutStrokeCount:0,result:null,guideRemainingMs:0,brow:null}),x=!1,y=!1,D=0,HSC.clearClippings')
# rituals (turkish.js) work anywhere on the head: hs_headHit(x, y) is the raycast's own first stage, the nearest
# triangle of the (morphed) coarse head, returned as a point and normal in head space
k = s.index('function j(ue,ye){P(),L();')
e = s.index('if(!isFinite(xe))return w=null,null;', k)
body = s[k:e].replace('function j(ue,ye){', 'function hs_headHit(ue,ye){', 1).replace('return w=null,null', 'return null')
body += ('if(!isFinite(xe))return null;let a0=Ee[be]*3,a1=Ee[be+1]*3,a2=Ee[be+2]*3,'
         'ux=ie[a1]-ie[a0],uy=ie[a1+1]-ie[a0+1],uz=ie[a1+2]-ie[a0+2],wx=ie[a2]-ie[a0],wy=ie[a2+1]-ie[a0+1],wz=ie[a2+2]-ie[a0+2],'
         'nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx,nl=Math.hypot(nx,ny,nz)||1;if(nx*q+ny*Me+nz*pe>0)nl=-nl;'
         'return{p:[Q+q*xe,K+Me*xe,re+pe*xe],n:[nx/nl,ny/nl,nz/nl],tri:[Ee[be],Ee[be+1],Ee[be+2]]}}')
s = s[:k] + body + s[k:]
rep('getYaw(){return G},', 'getYaw(){return G},headHit:hs_headHit,')
# the clipper motor: each tool has its own pitch and loudness (scissors and the razor are silent; tools.js
# plays their own snip and scrape)
i = s.index('function vc(){'); j = s.index('function ', s.index('function g(m)', i) + 12)
f = s[i:j]
for old, new in [
    ('function vc(){', 'function vc(){let hs_tg=()=>globalThis.HSC&&HSC.toolGain?HSC.toolGain():1;'),
    ('l=m=>118-Math.max(0,m)*9', 'l=m=>globalThis.HSC&&HSC.toolHz?HSC.toolHz(m):118-Math.max(0,m)*9'),
    ('i.gain.value=.035,r.connect', 'i.gain.value=.035*hs_tg()+1e-4,r.connect'),
    ('i.gain.setValueAtTime(Math.max(.03,i.gain.value),f),i.gain.linearRampToValueAtTime(.055+m.gain*.055,f+.025),i.gain.exponentialRampToValueAtTime(.035,f+.12)',
     'i.gain.setValueAtTime(Math.max(.03*hs_tg()+1e-4,i.gain.value),f),i.gain.linearRampToValueAtTime((.055+m.gain*.055)*hs_tg()+1e-4,f+.025),i.gain.exponentialRampToValueAtTime(.035*hs_tg()+1e-4,f+.12)'),
]:
    assert f.count(old) == 1, old[:60]
    f = f.replace(old, new)
s = s[:i] + f + s[j:]
open(p, 'w').write(s)
print('patched barber tools (Android)')
