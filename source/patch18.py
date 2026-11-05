"""Android build only (buildall.sh, HEAD_SHAPES=1): customer requests and undo (customers/requests.js).
- HSC.requests: the engine's own catalog of target cuts (Xa), a target capped to the hair the customer walked in
  with (ac), and the engine's own star scoring (sc: 1-3 stars at 0-60%, 60-85% and 85%+ match).
- restore(hair, beard): put the hair and beard back to an earlier moment of this haircut (undo); cutting only.
The game's own flow is unchanged: haircuts still finish as free-style, and requests.js scores them."""
import sys
p = sys.argv[1]
s = open(p).read()

def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)

rep('MC=Object.freeze({visit:"walk-in",profile:"classic",grownFrom:null,growthMm:0,colour:1,mirror:!1});',
    'MC=Object.freeze({visit:"walk-in",profile:"classic",grownFrom:null,growthMm:0,colour:1,mirror:!1});'
    'globalThis.HSC&&(HSC.requests={list:Xa,target:(e,t,r)=>ac(da(e),t,!!r),score:(e,t)=>sc(e,t),match:(e,t,r)=>nc(e,t,r)});')
rep('async function hs_replay(){',
    'async function hs_restore(h,b){if(c||T||s.status!=="cutting"||!Array.isArray(h)||h.length!==8192)return!1;'
    's=gt(rt({},s),{hair:[...h],beard:Array.isArray(b)?b.slice():s.beard}),J(),await $(!0).catch(()=>{});return!0}'
    'async function hs_replay(){')
rep('getState:()=>s,replay:hs_replay,getView', 'getState:()=>s,replay:hs_replay,restore:hs_restore,getView')
# (the game is exposed through boot.js, which forwards restore; the original bootstrap wrapper is replaced there)
open(p, 'w').write(s)
print('patched requests and undo (Android)')
