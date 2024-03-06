#!/usr/bin/env bash

set -Eeo pipefail

cd "$(dirname "$0")/.."
pwd

rm -rf release
mkdir release

npm ci
NODE_ENV=production npm run build
cp -r .next release/
cp -r public release/
cp .env release/.env
cp package.json release/package.json
cp package-lock.json release/package-lock.json
cp scripts/serve.sh release/serve.sh
chmod +x release/serve.sh
cd release
NODE_ENV=production npm ci --omit=dev --omit=optional --omit=peer --include=prod --install-strategy nested
tar -czf ../minichat.tar.gz .
