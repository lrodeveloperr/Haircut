"""Deterministic ZIP; strict size, filenames, root entry point and no alternate platform SDK."""
from pathlib import Path
import hashlib, re, sys, zipfile
root = Path(__file__).resolve().parents[1] / 'build-youtube'
files = sorted(p for p in root.rglob('*') if p.is_file())
assert (root / 'index.html').is_file()
assert sum(p.stat().st_size for p in files) < 5_000_000
assert len(files) <= 8000
for p in files:
    assert all(re.fullmatch(r'[A-Za-z0-9_.-]+', part) for part in p.relative_to(root).parts)
    assert p.stat().st_size < 30 * 1024 * 1024
    assert p.stat().st_size < 15_000_000, 'Advisory file-size budget exceeded'
    if p.suffix in {'.html', '.js', '.json'}:
        assert 'bridge.playgama.com' not in p.read_text()
assert not (root / 'playgama-bridge-config.json').exists()
target = Path(sys.argv[1])
with zipfile.ZipFile(target, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for p in files:
        entry = zipfile.ZipInfo(p.relative_to(root).as_posix(), date_time=(2026, 10, 15, 0, 0, 0))
        entry.compress_type = zipfile.ZIP_DEFLATED
        entry.external_attr = 0o100644 << 16
        archive.writestr(entry, p.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
assert target.stat().st_size < 5_000_000
print(target)
print('ZIP bytes:', target.stat().st_size)
print('Expanded bytes:', sum(p.stat().st_size for p in files))
largest = max(files, key=lambda p: p.stat().st_size)
print('Largest file:', largest.relative_to(root).as_posix(), largest.stat().st_size, 'bytes')
print('SHA-256:', hashlib.sha256(target.read_bytes()).hexdigest())
