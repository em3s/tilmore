#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Base URL: /tilmore/ for GitHub Pages, / for local
BASE_URL="${BASE_URL:-/tilmore/}"

rm -rf dist
mkdir -p dist

SECTIONS=(
  "tools:생산성 도구"
)

# Build slides
for section_entry in "${SECTIONS[@]}"; do
  section="${section_entry%%:*}"

  files=$(find "$section" -name '*.md' ! -name '.gitkeep' 2>/dev/null | sort)
  [ -z "$files" ] && continue

  mkdir -p "dist/$section"
  for f in $files; do
    name=$(basename "$f" .md)
    created=$(git log --diff-filter=A --format='%as' -- "$f" | tail -1)
    updated=$(git log -1 --format='%as' -- "$f")
    # Inject dates as top-right label on title slide
    tmp=$(mktemp)
    awk -v c="$created" -v u="$updated" '
      /^# / && !done { print "<div style=\"position:absolute;top:24px;right:40px;font-size:11px;opacity:0.4\">created " c " · updated " u "</div>"; print; done=1; next }
      { print }
    ' "$f" > "$tmp"
    marp "$tmp" -o "dist/$section/$name.html" --html --theme-set themes/
    rm -f "$tmp"
  done
done

# Generate index.html from index.md
marp index.md -o dist/index.html --html --theme-set themes/

echo "Built $(find dist -name '*.html' | wc -l) files."
