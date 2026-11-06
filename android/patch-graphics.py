"""Validate the shared adaptive graphics runtime for legacy callers.

Graphics policy now lives in source/customers/detail-adaptive.js and the shared YouTube build.
Android must not carry a second policy that can drift from the game or change haircut logic.
"""
from pathlib import Path
import sys


def adapt(runtime):
    path = Path(runtime)
    source = path.read_text()
    required = (
        'HSC.detail.sample',
        'HSC.detail.shouldRender',
        'HSC.detail.noteContextLoss("runtime")',
        'HSC.detail.commitPending(true)',
    )
    missing = [marker for marker in required if marker not in source]
    if missing:
        raise ValueError(f'Android runtime is missing shared adaptive graphics markers: {missing}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('usage: python3 android/patch-graphics.py RUNTIME_GAME_JS')
    adapt(sys.argv[1])
    print('Android shared adaptive graphics policy validated')
