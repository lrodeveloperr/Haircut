"""v3.80: more walk-in styles. The game's list only had 16 mm tops; add short crops (9 / 12 mm tops), buzz cuts
(3-12 mm all over), high-and-tight (3 mm sides) and a shaved head (3 mm regrowth). The new ids join the game's own
list, so saved sessions with them stay valid."""
import sys
p = sys.argv[1]
s = open(p).read()
old = 'triple:`${e}-${t}-5`}))}var Tr=Object.freeze(uc)'
assert s.count(old) == 1
new = ('triple:`${e}-${t}-5`}))}'
       # crops: a 9 or 12 mm top with shorter sides and a blend in between
       'for(let hs_t of[3,4])for(let e of[1,2,3])for(let t of[2,3,4]){if(t<e||t>hs_t||e>=hs_t)continue;'
       'for(let a of Pd)uc.push(Object.freeze({id:`s${e}-b${t}-t${hs_t}-${a}-v0`,side:e,blend:t,top:hs_t,contour:a,variant:0,triple:`${e}-${t}-${hs_t}`}))}'
       # high and tight: 3 mm sides under a longer top
       'for(let t of[2,3])for(let a of["high","mid"])uc.push(Object.freeze({id:`s1-b${t}-t5-${a}-v0`,side:1,blend:t,top:5,contour:a,variant:0,triple:`1-${t}-5`}));'
       # all one length: shaved regrowth (3 mm) and buzz cuts (6, 9, 12 mm)
       'for(let e of[1,2,3,4])uc.push(Object.freeze({id:`s${e}-b${e}-t${e}-even-v0`,side:e,blend:e,top:e,contour:"even",variant:0,triple:`${e}-${e}-${e}`}));'
       'var Tr=Object.freeze(uc)')
s = s.replace(old, new)
open(p, 'w').write(s)
print('patched walk-in styles')
