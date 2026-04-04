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

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# Nav link
NAV_LINK="<a href=\"${BASE_URL}\" style=\"position:fixed;top:16px;left:16px;font-size:14px;color:#888;text-decoration:none;z-index:9999\">&larr; index</a>"

# Build slides
for section_entry in "${SECTIONS[@]}"; do
  section="${section_entry%%:*}"

  files=$(find "$section" -name '*.md' ! -name '.gitkeep' 2>/dev/null | sort)
  [ -z "$files" ] && continue

  mkdir -p "dist/$section"
  for f in $files; do
    name=$(basename "$f" .md)

    marp "$f" -o "dist/$section/$name.html" --html --theme-set themes/

    # Inject nav link
    perl -i -pe "s|</body>|${NAV_LINK}</body>|" "dist/$section/$name.html"
  done
done

# Generate index.html
cat > dist/index.html <<'HTMLSTART'
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>tilmore</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Hedvig+Letters+Serif:opsz@12..24&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #fff;
    color: #41424C;
    min-height: 100vh;
  }
  .container { max-width: 960px; margin: 0 auto; padding: 80px 24px; }
  h1 {
    font-size: 2.4rem; font-weight: 600; letter-spacing: -0.03em;
    margin-bottom: 64px;
    font-family: 'Hedvig Letters Serif', serif;
    color: #41424C;
  }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .card {
    background: #fafafa;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    padding: 24px;
    transition: all 0.2s ease;
    cursor: default;
  }
  .card:hover { border-color: #bbb; background: #f5f5f5; transform: translateY(-2px); }
  .card h2 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; letter-spacing: -0.01em; color: #41424C; }
  .card .desc { font-size: 0.85rem; color: #888; margin-bottom: 16px; }
  .card ul { list-style: none; }
  .card li { padding: 3px 0; }
  .card a { color: #41424C; text-decoration: none; font-size: 0.9rem; transition: color 0.15s; }
  .card a:hover { color: #000; }
  .card.empty { opacity: 0.35; }
  .card.empty .desc { margin-bottom: 0; }
  .footer { margin-top: 80px; text-align: center; color: #bbb; font-size: 0.8rem; }
  .footer a { color: #999; text-decoration: none; }
  .footer a:hover { color: #666; }
</style>
</head>
<body>
<div class="container">
<h1>tilmore</h1>
<div class="grid">
HTMLSTART

# Write section cards
for section_entry in "${SECTIONS[@]}"; do
  section="${section_entry%%:*}"
  desc="${section_entry#*:}"

  files=$(find "$section" -name '*.md' ! -name '.gitkeep' 2>/dev/null | sort)
  items=""
  for f in $files; do
    name=$(basename "$f" .md)
    title=$(sed -n '/^---$/,/^---$/{ /^title:/{ s/^title: *//; p; q; } }' "$f")
    items="$items<li><a href=\"$section/$name.html\">$title</a></li>"
  done

  if [ -n "$items" ]; then
    cat >> dist/index.html <<CARD
<div class="card">
<h2>$section</h2>
<div class="desc">$desc</div>
<ul>$items</ul>
</div>
CARD
  else
    cat >> dist/index.html <<CARD
<div class="card empty">
<h2>$section</h2>
<div class="desc">$desc</div>
</div>
CARD
  fi
done

cat >> dist/index.html <<'HTMLEND'
</div>
<div class="footer">
<a href="https://github.com/em3s/tilmore">github</a>
</div>
</div>
</body>
</html>
HTMLEND

echo "Built $(find dist -name '*.html' | wc -l) files."
