"""QA reliability fixes: preserve unread/newer saves, normalize rotation, and recover failed boot.

Keep this patch last: each target is asserted against the existing patch chain. Readable boot and
storage code live alongside it so later changes do not have to edit the inherited minified bundle.
"""
from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text()


def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:100])
    s = s.replace(old, new)


rep('cameraYawDeg:(e.cameraYawDeg+t+540)%360-180',
    'cameraYawDeg:(((e.cameraYawDeg%360+t%360+180)%360)+360)%360-180')
rep('function Rs(e){return ', 'function Rs(e){if(e&&Number.isFinite(e.version)&&e.version>19)'
    'throw Object.assign(new Error("Progress needs a newer game version"),{code:"SAVE_TOO_NEW"});return ')

start = s.index('async function U(L,X){', s.index('async function Gu('))
end = s.index('async function I(L,', start)
s = s[:start] + Path(__file__).with_name('storage.js').read_text() + s[end:]

start = s.index('async function hC(){')
end = s.index('})();', start)
assert 'hC().catch' in s[start:end]
s = s[:start] + Path(__file__).with_name('boot.js').read_text() + s[end:]
p.write_text(s)
print('patched storage protection, rotation and boot recovery')
