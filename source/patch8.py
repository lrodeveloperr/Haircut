"""v3.62: progress (level, streak, next-customer queue) loads before the first customer; no
interstitial right after a rewarded video."""
import sys
p = sys.argv[1]
s = open(p).read()


def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)


rep('HSC.initDetail&&HSC.initDetail(t)]', 'HSC.initDetail&&HSC.initDetail(t),HSC.metaInit&&HSC.metaInit(t)]')
rep('if(j.showInterstitial&&!y)', 'if(j.showInterstitial&&!y&&!(HSC.recentReward&&HSC.recentReward()))')

open(p, 'w').write(s)
print('patched meta / interstitial')
