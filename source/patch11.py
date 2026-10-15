"""v3.73: ad client fixes. Playgama Bridge v2's showRewarded()/showInterstitial() return nothing and the ad's
states arrive later, so the client must not stop waiting 1.5 s after the call while an ad is still running
(rewards were lost, interstitials counted as not shown). The game also stays paused through the
'rewarded' state until the ad is closed."""
import sys
p = sys.argv[1]
s = open(p).read()


def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)


rep('Promise.resolve(n.showRewarded(L)).then(()=>setTimeout(j,1500),j)',
    'Promise.resolve(n.showRewarded(L)).then(()=>setTimeout(()=>{["loading","opened","rewarded"].includes(rs(n.rewardedState))||j()},1500),j)')
rep('Promise.resolve(n.showInterstitial(L)).then(()=>setTimeout(ge,1500),ge)',
    'Promise.resolve(n.showInterstitial(L)).then(()=>setTimeout(()=>{["loading","opened"].includes(rs(n.interstitialState))||ge()},1500),ge)')
rep('A.push(ea(n,y,L=>{let X=rs(L);w("advertisement",X==="loading"||X==="opened")}))',
    'A.push(ea(n,y,L=>{let X=rs(L);w("advertisement",X==="loading"||X==="opened"||X==="rewarded")}))')
# saves: Bridge v2's storage.get() parses JSON itself by default, so the game's own JSON.parse got an object
# and every save came back as the default (nothing but the audio setting survived a reload). Ask for the raw
# string, accept an already parsed value, and never let a failed read stop the boot.
rep('async function U(L,X){let[z]=await a.get([L]);if(z==null)return X;try{return JSON.parse(z)}catch(he){return X}',
    'async function U(L,X){let z;try{[z]=await a.get([L],!1)}catch(he){return X}if(z==null)return X;if(typeof z!="string")return z;try{return JSON.parse(z)}catch(he){return X}')
# a newer tab of the game took over: this one stops writing (it would overwrite newer progress)
rep('async function D(L,X){let z=JSON.stringify(X)', 'async function D(L,X){if(HSC.otherTab)return;let z=JSON.stringify(X)')
# leaving the page: write the latest strokes now instead of dropping the pending (debounced) save
rep('destroy(){C=!0,P.disconnect()', 'destroy(){$(!0).catch(()=>{}),C=!0,P.disconnect()')
open(p, 'w').write(s)
print('patched ad client')
