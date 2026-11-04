"""Android build only (buildall.sh, HEAD_SHAPES=1): more walk-in cuts within the 16 mm walk-in limit.
New fade-line shapes in the length builder (Od) and new profiles in the walk-in list:
  burst    fade round the ear only, longer at the nape          temple  taper at the temples and nape only
  hawk     faux hawk: short sides, a longer strip down the middle undercut sides cut short with no blend
  part     classic side-part taper (scissor-cut look)             crew    crew / ivy league: front longer than the crown
plus low / drop / taper skin fades (3 mm sides) under 16 mm tops. Cutting is unchanged; existing ids stay valid."""
import sys
p = sys.argv[1]
s = open(p).read()

def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)

# fade-line shapes; u = t (0/1 front, .5 back, .25/.75 sides), v = r (0 nape .. 1 crown)
rep('else if(e.contour==="drop")o=.59-.14*a-.04*i+n,s=o+.17;else{',
    'else if(e.contour==="drop")o=.59-.14*a-.04*i+n,s=o+.17;'
    'else if(e.contour==="burst"){let hs_e=Math.abs(Math.sin((t-.5)*Math.PI*2));o=.08+.5*hs_e*hs_e+n,s=o+.13*hs_e+.02}'
    'else if(e.contour==="temple"){let hs_m=Math.max(Math.exp(-Math.pow((t-.1)/.06,2)),Math.exp(-Math.pow((t-.9)/.06,2)));o=.16+.44*hs_m+.06*a+n,s=o+.08+.06*hs_m}'
    'else if(e.contour==="hawk"){let hs_c=Math.abs(Math.cos((t-.5)*Math.PI*2));o=.8-.55*lc(.8,.97,hs_c)+n,s=o+.06}'
    'else if(e.contour==="undercut")o=.66-.04*i+n,s=o;'
    'else if(e.contour==="part"||e.contour==="crew")o=.52-.045*i+n,s=.68-.035*i+n;'
    'else{')
# crew: the crown a level shorter than the front (a shaved hard-part line was tried and dropped: the 16 mm
# hair around it lies over a 3 mm line, so it never shows)
rep('return e.variant===1&&(o-=.035,s+=.025),r<o?e.side:r<s?e.blend:e.top}',
    'return e.variant===1&&(o-=.035,s+=.025),r<o?e.side:r<s?e.blend:e.contour==="crew"&&i<.55?Math.max(e.blend,e.top-1):e.top}')
# the new profiles
add = []
def prof(side, blend, top, contour):
    add.append('uc.push(Object.freeze({id:`s%d-b%d-t%d-%s-v0`,side:%d,blend:%d,top:%d,contour:"%s",variant:0,triple:`%d-%d-%d`}));' % (side, blend, top, contour, side, blend, top, contour, side, blend, top))
for sd, b, t in [(1, 3, 5), (2, 3, 5), (1, 2, 4)]: prof(sd, b, t, 'burst')
for sd, b, t in [(2, 3, 5), (1, 2, 4), (2, 3, 4)]: prof(sd, b, t, 'temple')
for sd, b, t in [(1, 3, 5), (2, 3, 5)]: prof(sd, b, t, 'hawk')
for sd, t in [(1, 5), (2, 5), (1, 4)]: prof(sd, sd, t, 'undercut')
for sd, b, t in [(2, 3, 5), (1, 2, 4), (2, 3, 4)]: prof(sd, b, t, 'part')
for sd, b, t in [(2, 3, 5), (1, 3, 5), (2, 3, 4)]: prof(sd, b, t, 'crew')
for c in ['low', 'drop', 'taper']:
    for b in [2, 3]: prof(1, b, 5, c)
rep('var Tr=Object.freeze(uc)', ''.join(add) + 'var Tr=Object.freeze(uc)')
open(p, 'w').write(s)
print('patched walk-in cuts (Android: %d new)' % len(add))
