#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
TARGET=playables bash buildall.sh
python3 youtube/build.py
node --check build-youtube/runtime/game.js
node --check build-youtube/runtime/customers.js
node --check build-youtube/runtime/youtube-client.js
node --check build-youtube/runtime/youtube-loader.js
