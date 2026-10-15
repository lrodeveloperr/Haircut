"""v3.71: replay the same customer from the completion screen (after a rewarded video)."""
import sys
p = sys.argv[1]
s = open(p).read()


def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)


# back to the start of this customer's haircut: the hair and beard they walked in with, same person,
# same job (so the next customer stays the one already shown)
rep('function ve(j){if(C)return;',
    'async function hs_replay(){if(c||T||s.status!=="reveal")return!1;V(),Ae();'
    's=gt(rt({},s),{status:"cutting",interactionMode:"rotate",selectedGuard:1,cameraYawDeg:oa.initialYawDeg,cameraElevation:10,'
    'hair:[...s.startHair],beard:Array.isArray(s.startBeard)?s.startBeard.slice():s.beard,cutStrokeCount:0,result:null,guideRemainingMs:0}),'
    'x=!1,y=!1,D=0,HSC.clearClippings&&HSC.clearClippings(),n.setClipperGuard(1),J(),t.sendAnalytics("haircut_replay",{job:s.jobId}),await $(!0).catch(()=>{});return!0}'
    'function ve(j){if(C)return;')
rep('getState:()=>s,getView', 'getState:()=>s,replay:hs_replay,getView')
rep('getState:a.getState})', 'getState:a.getState,replay:a.replay})')
open(p, 'w').write(s)
print('patched replay')
