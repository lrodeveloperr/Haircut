"""v3.74: the tutorial hints are placed in screen pixels; with the UI drawn at a scale (tablets, desktops,
tiny embeds) their positions are converted to the UI's own pixels."""
import sys
p = sys.argv[1]
s = open(p).read()
old = 'return Qe("div",{class:`tutorial tut-${o}`,style:h,'
assert s.count(old) == 1
s = s.replace(old, 'return Qe("div",{class:`tutorial tut-${o}`,style:HSC.tutStyle?HSC.tutStyle(h):h,')
open(p, 'w').write(s)
print('patched tutorial scale')
