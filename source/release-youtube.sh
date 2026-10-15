#!/bin/bash
# A release contains the root entry point and runtime only; never source, tests or preview mocks.
set -euo pipefail
cd "$(dirname "$0")"
VERSION=${1:?usage: release-youtube.sh vX.YY}
[[ "$VERSION" =~ ^v[0-9]+\.[0-9]+(\.[0-9]+)?$ ]] || { echo 'Invalid release version' >&2; exit 1; }
ARCHIVE="$(cd .. && pwd)/releases/asmr-barber-fade-master-$VERSION-mediacube-youtube.zip"
[[ ! -e "$ARCHIVE" ]] || { echo "Release already exists: $ARCHIVE" >&2; exit 1; }
bash build-youtube.sh
mkdir -p ../releases
python3 youtube/package.py "$ARCHIVE"
