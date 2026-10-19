#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
TARGET=youtube bash buildall.sh
python3 youtube/build.py
python3 facebook/build.py
node --check build-facebook/runtime/game.js
node --check build-facebook/runtime/customers.js
node --check build-facebook/runtime/facebook-client.js
node --check build-facebook/runtime/facebook-loader.js
node --check build-facebook/runtime/facebook-startup.js
