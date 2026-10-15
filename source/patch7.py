"""v3.60: guard 0 back on the clipper, walk-in styles exposed to customers.js, rewarded videos on YouTube."""
import sys
p = sys.argv[1]
s = open(p).read()


def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)


# guard 0 (0.5 mm, no comb) is selectable again
rep('var Kr=Object.freeze([1,2,3,4])', 'var Kr=Object.freeze([0,1,2,3,4])')
rep('var Wr=Object.freeze([1,2,3,4])', 'var Wr=Object.freeze([0,1,2,3,4])')
rep('Jd=Object.freeze({1:"clipper-guard-1"', 'Jd=Object.freeze({0:"clipper-guard-0",1:"clipper-guard-1"')
# the customer system picks walk-in styles by age
rep('MC=Object.freeze({visit:"walk-in",profile:"classic",grownFrom:null,growthMm:0,colour:1,mirror:!1});',
    'MC=Object.freeze({visit:"walk-in",profile:"classic",grownFrom:null,growthMm:0,colour:1,mirror:!1});'
    'globalThis.HSC&&(HSC.walkIns={list:Tr,build:e=>kd(e)});')
# rewarded videos are supported on YouTube Playables through Playgama Bridge
rep('if(S==="youtube"||g||(n==null?void 0:n.isRewardedSupported)!==!0', 'if(g||(n==null?void 0:n.isRewardedSupported)!==!0')
rep('rewardedSupported:S!=="youtube"&&(n==null?void 0:n.isRewardedSupported)===!0', 'rewardedSupported:(n==null?void 0:n.isRewardedSupported)===!0')

open(p, 'w').write(s)
print('patched guard 0 / walk-ins / rewarded')
