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

# Theme redirect script (single line)
echo '<script>(function(){var t=localStorage.getItem("tilmore-theme")||"light";var p=location.pathname;if(t==="dark"&&!p.includes("/dark/")){location.replace(p.replace(/\/([^\/]+)\/([^\/]+)$/,"/dark/$1/$2"))}else if(t==="light"&&p.includes("/dark/")){location.replace(p.replace("/dark/",""))}})();</script>' > "$TMPDIR/redirect.html"

# Build slides
for section_entry in "${SECTIONS[@]}"; do
  section="${section_entry%%:*}"

  files=$(find "$section" -name '*.md' ! -name '.gitkeep' 2>/dev/null | sort)
  [ -z "$files" ] && continue

  mkdir -p "dist/$section" "dist/dark/$section"
  for f in $files; do
    name=$(basename "$f" .md)

    # Light build: inject font-size into frontmatter
    awk '/^paginate:/{print; print "style: \"section { font-size: 24px; }\""; next}1' "$f" > "$TMPDIR/light.md"
    marp "$TMPDIR/light.md" -o "dist/$section/$name.html" --html

    # Dark build: inject font-size + invert
    awk '/^paginate:/{print; print "class: invert"; print "style: \"section { font-size: 24px; }\""; next}1' "$f" > "$TMPDIR/dark.md"
    marp "$TMPDIR/dark.md" -o "dist/dark/$section/$name.html" --html

    # Inject redirect + nav into both
    for html in "dist/$section/$name.html" "dist/dark/$section/$name.html"; do
      perl -i -0777 -pe '
        BEGIN {
          open(F, "'"$TMPDIR/redirect.html"'"); local $/; $r=<F>; close(F); chomp $r;
        }
        s|</head>|$r</head>|;
        s|</body>|<a href="'"$BASE_URL"'" style="position:fixed;top:16px;left:16px;font-size:14px;color:#888;text-decoration:none;z-index:9999">\&larr; index</a></body>|;
      ' "$html"
    done
  done
done

# Generate index.html
cat > dist/index.html <<'HTMLSTART'
<!DOCTYPE html>
<html lang="ko" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>tilmore</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #fdfcff;
    --card-bg: #fff;
    --card-border: #e8e7eb;
    --card-hover-border: #ccc;
    --card-hover-bg: #f5f4f8;
    --text: #202228;
    --text-muted: #888;
    --link: #009dd5;
    --link-hover: #007aa8;
    --h1-from: #202228;
    --h1-to: #666;
    --footer-text: #aaa;
    --footer-link: #999;
    --toggle-bg: #e8e7eb;
    --toggle-fg: #666;
  }
  [data-theme="dark"] {
    --bg: #202228;
    --card-bg: #282a32;
    --card-border: #363840;
    --card-hover-border: #50525a;
    --card-hover-bg: #2e3038;
    --text: #fff;
    --text-muted: #888;
    --link: #4dbde8;
    --link-hover: #8dd4f0;
    --h1-from: #fff;
    --h1-to: #888;
    --footer-text: #50525a;
    --footer-link: #666;
    --toggle-bg: #363840;
    --toggle-fg: #999;
  }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    transition: background 0.3s, color 0.3s;
  }
  .container { max-width: 960px; margin: 0 auto; padding: 80px 24px; }
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 64px; }
  h1 {
    font-size: 2.4rem; font-weight: 600; letter-spacing: -0.03em;
    background: linear-gradient(135deg, var(--h1-from) 0%, var(--h1-to) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .toggle {
    background: var(--toggle-bg); border: none; border-radius: 20px;
    padding: 6px 14px; cursor: pointer; font-size: 0.8rem;
    color: var(--toggle-fg); font-family: inherit; transition: all 0.2s;
  }
  .toggle:hover { opacity: 0.8; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 12px; padding: 24px; transition: all 0.2s ease; cursor: default;
  }
  .card:hover { border-color: var(--card-hover-border); background: var(--card-hover-bg); transform: translateY(-2px); }
  .card h2 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; letter-spacing: -0.01em; }
  .card .desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px; }
  .card ul { list-style: none; }
  .card li { padding: 3px 0; }
  .card a { color: var(--link); text-decoration: none; font-size: 0.9rem; transition: color 0.15s; }
  .card a:hover { color: var(--link-hover); }
  .card.empty { opacity: 0.35; }
  .card.empty .desc { margin-bottom: 0; }
  .footer { margin-top: 80px; text-align: center; color: var(--footer-text); font-size: 0.8rem; }
  .footer a { color: var(--footer-link); text-decoration: none; }
  .footer a:hover { opacity: 0.8; }
</style>
<script>
  (function(){
    var t = localStorage.getItem('tilmore-theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
</head>
<body>
<div class="container">
<header>
<h1>tilmore</h1>
<button class="toggle" onclick="toggleTheme()"></button>
</header>
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
<script>
function updateToggle() {
  var t = document.documentElement.getAttribute('data-theme');
  document.querySelector('.toggle').textContent = t === 'dark' ? 'light' : 'dark';
}
function toggleTheme() {
  var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('tilmore-theme', t);
  updateToggle();
}
updateToggle();
</script>
</body>
</html>
HTMLEND

echo "Built $(find dist -name '*.html' | wc -l) files."
