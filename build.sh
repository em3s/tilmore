#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Base URL: /tilmore/ for GitHub Pages, / for local
BASE_URL="${BASE_URL:-/tilmore/}"

rm -rf dist
mkdir -p dist

SECTIONS=(
  "math:엔지니어에게 필요한 수학"
  "systems:하드웨어와 가까운 지식"
  "ai:직접 구현하며 이해하기"
  "production:연구와 현실의 격차"
  "architecture:대규모 시스템 설계"
  "scaling:단계별 아키텍처 진화"
  "db:DB 트레이드오프와 내부 원리"
  "distributed:분산 시스템의 본질"
  "concurrency:동시성의 모델과 함정"
  "migration:대규모 마이그레이션 전략"
  "tools:생산성 도구"
  "craft:일하는 방식"
  "leadership:코드 너머의 역할"
)

# Build slides
for section_entry in "${SECTIONS[@]}"; do
  section="${section_entry%%:*}"

  files=$(find "$section" -name '*.md' ! -name '.gitkeep' 2>/dev/null | sort)
  [ -z "$files" ] && continue

  mkdir -p "dist/$section"
  for f in $files; do
    name=$(basename "$f" .md)
    marp "$f" -o "dist/$section/$name.html" --html --theme-set themes/
  done
done

# Generate index.html from index.md
marp index.md -o dist/index.html --html --theme-set themes/

echo "Built $(find dist -name '*.html' | wc -l) files."
