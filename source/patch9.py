"""v3.63/64: fixed exposure, the renderer API for next-customer snapshots, a two-step tutorial."""
import sys
p = sys.argv[1]
s = open(p).read()


def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)


# a brighter, fixed exposure set by customers.js (bright enough for the darkest skin)
rep('t.toneMappingExposure=.95,', 't.toneMappingExposure=.95,HSC.setExposure=hs_e=>{t.toneMappingExposure=.95*hs_e},')
# the reveal hub renders the next customer with the game's own thumbnail()
rep('let a=e.querySelector("#scene"),n=Nu(a),', 'let a=e.querySelector("#scene"),n=HSC.view=Nu(a),')

# tutorial: turn the customer, the clipper on/off button, the guard ladder (no cut line); the turn hint
# is centred just above the head on every screen, below the top buttons
rep('o=["spin","clip","cut","guard"].find(m=>!n[m])', 'o=["spin","clip","guard"].find(m=>!n[m])')
rep('let m=l.top-70>=110,A=m?l.x-66:l.left>u-l.right?l.left-170:l.right+30;h={left:`${Math.max(16,Math.min(u-160,A))}px`,top:`${m?l.top-46:l.top+(l.y-l.top)*.3}px`}',
    'var hs_L=HSC.tutSpinLayout?HSC.tutSpinLayout(l,u):{left:l.x-62,top:l.top-60,k:1};'
    'h={left:`${hs_L.left}px`,top:`${hs_L.top}px`,"--k":hs_L.k}')

open(p, 'w').write(s)
print('patched exposure / view')
