"""Android build only (buildall.sh, HEAD_SHAPES=1; owner-approved game modes, 5 November 2026): skip() seats a fresh
customer straight from the chair, without finishing, scoring or an advertisement (the game's own next-job state, Is).
modes.js uses it when the player picks another mode, and for the freestyle "new customer" button.
The game's own flow is unchanged: next() after a reveal works as before."""
import sys
p = sys.argv[1]
s = open(p).read()

def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)

rep('async function hs_replay(){',
    'async function hs_skip(){if(c||T||s.status!=="cutting")return!1;V(),Ae();s=Is(s),y=!1,x=!1,D=0,J(),await $(!0).catch(()=>{});return!0}'
    'async function hs_replay(){')
rep('replay:hs_replay,restore:hs_restore,', 'replay:hs_replay,restore:hs_restore,skip:hs_skip,')
open(p, 'w').write(s)
print('patched skip (Android)')
