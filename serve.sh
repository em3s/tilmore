#!/bin/bash
# 로컬 빌드 + 서빙
# Usage: ./serve.sh

set -e

command -v marp >/dev/null || { echo "marp-cli 필요: npm install -g @marp-team/marp-cli"; exit 1; }

BASE_URL="/" bash build.sh

echo ""
echo "http://localhost:8000"
echo ""

cd dist
python3 -m http.server 8000
