import sys
p = sys.argv[1]
s = open(p).read()

def rep(old, new):
    global s
    assert s.count(old) == 1, old[:60]
    s = s.replace(old, new)

# Scalp colour: replace the flat peach fill with skin that reads as a real shaved scalp.
rep('''      tone = mix(tone, vec3(.62, .36, .27), hm * smoothstep(1.2, 1.9, P.y) * .9);
      tone = mix(tone, tone * vec3(.26, .19, .16), st * .88 * smoothstep(0.0,.12,gridValue(P)));''',
'''      // scalp skin sees less sun than the face: a touch paler and less red, with soft blotchy mottling
      float sc = hm * smoothstep(1.2, 1.9, P.y);
      vec3 scalpC = vec3(.645, .395, .315);
      scalpC *= 1.0 + .07 * (n3(P * 2.2 + 7.0) - .5);
      scalpC += vec3(.03, -.008, -.01) * (n3(P * 2.6 + 2.0) - .5);
      scalpC += vec3(.02, -.004, -.008) * smoothstep(3.3, 3.85, P.y);
      tone = mix(tone, scalpC, sc * .9);
      // hair still below the skin leaves a cool blue-grey cast over the whole growth area, even on a clean shave
      float under = st * (.85 + .15 * n3(P * 5.0 + 3.0));
      tone = mix(tone, tone * vec3(.70, .73, .80), under * .6);
      // follicle dots, faded to their average tone where they get smaller than a pixel so they never shimmer
      float folF = 42.0;
      vec3 fc = floor(P * folF), ff = fract(P * folF);
      vec3 fj = .3 + .4 * vec3(hsh(fc), hsh(fc + 17.0), hsh(fc + 31.0));
      float fd = length(ff - fj);
      float faa = max(fwidth(fd), .02);
      float fol = (1.0 - smoothstep(.2 - faa, .2 + faa, fd)) * step(.25, hsh(fc + 5.0));
      float folAA = 1.0 - smoothstep(.25, .7, length(fwidth(P)) * folF);
      tone = mix(tone, tone * vec3(.42, .42, .48), st * mix(.06, .7 * fol, folAA));
      tone = mix(tone, tone * vec3(.26, .19, .16), st * .88 * smoothstep(0.0,.12,gridValue(P)));''')

# Scalp finish: a soft sebum sheen on top, broken up so it does not look like plastic.
rep('''      roughnessFactor = mix(roughnessFactor, .44, smoothstep(2.2, 3.0, P.y) * fr * .6);`''',
'''      roughnessFactor = mix(roughnessFactor, .44, smoothstep(2.2, 3.0, P.y) * fr * .6);
      float scR = hm * smoothstep(1.6, 3.2, P.y);
      roughnessFactor = mix(roughnessFactor, .40 + .14 * n3(P * 7.0 + 5.0), scR * .75);`''')

# Scalp relief: faint pits at the follicles on top of the existing skin bump.
rep('''        float hb = skinBump(vObj);''',
'''        float hb = skinBump(vObj);
        hb -= .25 * st * fol * folAA;''')

open(p, 'w').write(s)
print('patched scalp')
