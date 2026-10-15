#!/bin/bash
# Builds a release from the source: the Playables ZIP (repository root), the Android full-detail ZIP (android/)
# and the single-file playable (source/dist/). Usage: bash source/release.sh v3.82
set -e
cd "$(dirname "$0")"
V=${1:?usage: release.sh vX.YY}
N=asmr-barber-fade-master-$V
ROOT=$(cd .. && pwd)
pack() { (cd build && rm -f "$1" && zip -X -9 -r "$1" THIRD-PARTY-NOTICES.md licenses assets index.html playgama-bridge-config.json runtime styles.css >/dev/null); }
TARGET=full bash buildall.sh | tail -1
pack "$ROOT/android/$N-full-detail.zip"
bash buildall.sh | tail -1
pack "$ROOT/$N-playgama.zip"
mkdir -p dist
python3 mkplay.py "dist/$N-play.html"
echo "wrote $N-playgama.zip, android/$N-full-detail.zip, source/dist/$N-play.html"
