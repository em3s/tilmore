#!/bin/bash
set -e

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

# Build slides from each md file
SLIDE_ENTRIES=""
for section_entry in "${SECTIONS[@]}"; do
  section="${section_entry%%:*}"
  desc="${section_entry#*:}"

  files=$(find "$section" -name '*.md' ! -name '.gitkeep' 2>/dev/null | sort)
  [ -z "$files" ] && continue

  mkdir -p "dist/$section"
  SECTION_ITEMS=""
  for f in $files; do
    name=$(basename "$f" .md)
    title=$(head -1 "$f" | sed 's/^#* *//')
    marp "$f" -o "dist/$section/$name.html" --html
    SECTION_ITEMS="$SECTION_ITEMS<li><a href=\"$section/$name.html\">$title</a></li>"
  done

  if [ -n "$SECTION_ITEMS" ]; then
    SLIDE_ENTRIES="$SLIDE_ENTRIES<section><h2>$section<span class=\"desc\">$desc</span></h2><ul>$SECTION_ITEMS</ul></section>"
  fi
done

# Generate index.html
cat > dist/index.html <<HTML
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>tilmore</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 640px; margin: 0 auto; padding: 48px 24px; color: #1a1a1a; }
  h1 { font-size: 2rem; margin-bottom: 8px; }
  h1 + p { color: #666; margin-bottom: 48px; }
  section { margin-bottom: 32px; }
  h2 { font-size: 1.1rem; margin-bottom: 8px; }
  .desc { font-weight: normal; color: #888; margin-left: 8px; font-size: 0.9rem; }
  ul { list-style: none; }
  li { padding: 4px 0; }
  a { color: #0969da; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<h1>tilmore</h1>
<p>아무리 알아도 여전히 더 배울 게 있다.</p>
$SLIDE_ENTRIES
</body>
</html>
HTML

echo "Built $(find dist -name '*.html' | wc -l) files."
