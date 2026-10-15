"""Prove that the smaller shipped reflection asset reconstructs every v3.94 half-float byte."""
from pathlib import Path
import gzip, hashlib, os, zipfile
root = Path(os.environ.get('RELEASE_DIR', 'source/build-youtube'))
with zipfile.ZipFile('releases/asmr-barber-fade-master-v3.94-mediacube-youtube.zip') as z:
    original = gzip.decompress(z.read('runtime/room-env.dat'))
packed = gzip.decompress((root / 'runtime/room-env.dat').read_bytes())
assert packed[:8] == b'HSENV001'
n = len(original) // 2
raw = bytearray(len(original))
raw[0::2], raw[1::2] = packed[8:8+n], packed[8+n:]
assert raw == original
print('Exact reflection-byte parity:', hashlib.sha256(raw).hexdigest())
print('Reflection payload bytes:', (root / 'runtime/room-env.dat').stat().st_size)
