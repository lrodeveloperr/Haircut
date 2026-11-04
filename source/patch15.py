"""Android build only (buildall.sh, HEAD_SHAPES=1): the hair tint table reads HSC.HAIR_TINTS / HSC.HAIR_SHEEN
when the customer code provides them (customers/phenotypes.js adds six natural colours). Without them the
engine's own twelve presets are used, exactly as before."""
import sys
p = sys.argv[1]
s = open(p).read()
old = 'setAppearance(ue){let ye=[[.3,.32,.38],'
assert s.count(old) == 1, 'hair tint table not found'
s = s.replace(old, 'setAppearance(ue){let ye=globalThis.HSC&&HSC.HAIR_TINTS||[[.3,.32,.38],')
old2 = '[2.1,3.15,5.2]],Ie=[.94,.96,.98,1,.98,.97,.96,.95,.94,.96,.94,.92],B=Math.max(0,Math.min(ye.length-1,ue|0));'
assert s.count(old2) == 1, 'hair sheen table not found'
s = s.replace(old2, '[2.1,3.15,5.2]],Ie=globalThis.HSC&&HSC.HAIR_SHEEN||[.94,.96,.98,1,.98,.97,.96,.95,.94,.96,.94,.92],B=Math.max(0,Math.min(ye.length-1,ue|0));')
open(p, 'w').write(s)
print('patched hair tint table (Android colours)')
