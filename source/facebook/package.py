"""Create a deterministic Meta Instant Games upload ZIP."""
from pathlib import Path
import sys
import zipfile

root = Path(__file__).resolve().parents[1]
source = root / 'build-facebook'
target = Path(sys.argv[1] if len(sys.argv) > 1 else root / 'facebook-instant-games.zip')
target.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(p for p in source.rglob('*') if p.is_file()):
        info = zipfile.ZipInfo(path.relative_to(source).as_posix(), date_time=(2026, 10, 19, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, path.read_bytes())
print(target)
