"""Turn the Three.js r180 ES-module build (vendor/three-r180) into one plain script for the Android runtime.

The game ships Three.js r180 inside its own minified engine but does not expose it, so the 3D shop (shop3d.js)
gets the same version as HSC.THREE. Only two small addons are included (RoundedBoxGeometry, RoomEnvironment).
"""
import re, sys, os
D = os.path.join(os.path.dirname(__file__), '..', 'vendor', 'three-r180')
read = lambda n: open(os.path.join(D, n), encoding='utf-8').read()

def export_object(body):
    # 'a as B,c as D,E' -> '{B:a,D:c,E:E}'
    out = []
    for p in body.split(','):
        p = p.strip()
        if not p: continue
        a, _, b = p.partition(' as ')
        out.append(f'{b or a}:{a}')
    return '{' + ','.join(out) + '}'

core = read('three.core.min.js')
i = core.rindex('export{')
core_body, core_exp = core[:i], core[i + 7:core.rindex('}')]
assert 'export{' not in core_body and 'import{' not in core_body

mod = read('three.module.min.js')
m = re.search(r'import\{(.*?)\}from"\./three\.core\.min\.js";', mod, re.S)
assert m, 'module import not found'
# destructuring: {Exported:local} -> const {Exported:local}=__core
pairs = []
for p in m.group(1).split(','):
    a, _, b = p.strip().partition(' as ')
    pairs.append(f'{a}:{b}' if b else a)
imp = 'const {' + ','.join(pairs) + '}=__core;'
rest = mod[m.end():]
# the module re-exports core names: export{A,B,...}from"./three.core.min.js";
re_exp = re.match(r'\s*export\{(.*?)\}from"\./three\.core\.min\.js";', rest, re.S)
reexported = []
if re_exp:
    for p in re_exp.group(1).split(','):
        a, _, b = p.strip().partition(' as ')
        reexported.append(f'{b or a}:__core.{a}')
    rest = rest[re_exp.end():]
j = rest.rindex('export{')
mod_body, mod_exp = rest[:j], rest[j + 7:rest.rindex('}')]
assert 'export{' not in mod_body and 'import{' not in mod_body and 'from"./' not in mod_body

def addon(name):
    s = read(name)
    s = re.sub(r"import\s*\{([^}]*)\}\s*from\s*'three';", lambda m: 'const {' + m.group(1) + '} = THREE;', s)
    assert 'import ' not in re.sub(r'//.*|/\*[\s\S]*?\*/', '', s), name
    names = re.findall(r'export\s*\{\s*([A-Za-z0-9_]+)\s*\};', s)
    s = re.sub(r'export\s*\{[^}]*\};', '', s)
    return '(function(){' + s + '\nreturn {' + ','.join(names) + '};})()'

out = ['/* Three.js r180 (MIT, licenses/three-MIT.txt), the same version the game engine ships, for the 3D shop. */',
       '(function(HSC){"use strict";',
       'var __core=(function(){' + core_body + '\nreturn ' + export_object(core_exp) + ';})();',
       'var THREE=(function(){' + imp + mod_body + '\nreturn Object.assign({' + ','.join(reexported) + '},' + export_object(mod_exp) + ');})();',
       'THREE=Object.assign({},THREE,' + addon('RoundedBoxGeometry.js') + ',' + addon('RoomEnvironment.js') + ');',
       'HSC.THREE=Object.freeze(THREE);',
       '})(globalThis.HSC||(globalThis.HSC={}));']
sys.stdout.write('\n'.join(out) + '\n')
