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

# Marp dark theme + index link snippet
cat > /tmp/marp-inject.html <<'SNIPPET'
<script>(function(){var t=localStorage.getItem("tilmore-theme")||"light";if(t==="dark"){var s=document.createElement("style");s.textContent="section{background:#1a1a1a !important;color:#e0e0e0 !important}section h1,section h2,section h3,section h4,section h5,section h6{color:#fff !important}section code{background:#2a2a2a !important;color:#e0e0e0 !important}section pre{background:#141414 !important}section pre code{background:#141414 !important}section table th,section table td{border-color:#333 !important}section a{color:#6cb6ff !important}";document.head.appendChild(s)}})();</script>
SNIPPET

# Build slides from each md file
for section_entry in "${SECTIONS[@]}"; do
  section="${section_entry%%:*}"

  files=$(find "$section" -name '*.md' ! -name '.gitkeep' 2>/dev/null | sort)
  [ -z "$files" ] && continue

  mkdir -p "dist/$section"
  for f in $files; do
    name=$(basename "$f" .md)
    marp "$f" -o "dist/$section/$name.html" --html
    # index 링크 + 테마 스크립트 주입
    perl -i -pe '
      if (/<\/head>/) {
        open(F, "</tmp/marp-inject.html"); my $s=join("",<F>); close(F);
        chomp $s;
        s|</head>|$s</head>|;
      }
      s|</body>|<a href="/tilmore/" style="position:fixed;top:16px;left:16px;font-size:14px;color:\#888;text-decoration:none;z-index:9999">\&larr; index</a></body>|;
    ' "dist/$section/$name.html"
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
    --bg: #fafafa;
    --card-bg: #fff;
    --card-border: #e5e5e5;
    --card-hover-border: #ccc;
    --card-hover-bg: #f5f5f5;
    --text: #1a1a1a;
    --text-secondary: #666;
    --text-muted: #999;
    --link: #0969da;
    --link-hover: #000;
    --h1-from: #000;
    --h1-to: #666;
    --footer-text: #aaa;
    --footer-link: #999;
    --toggle-bg: #e5e5e5;
    --toggle-fg: #666;
  }
  [data-theme="dark"] {
    --bg: #0a0a0a;
    --card-bg: #141414;
    --card-border: #222;
    --card-hover-border: #444;
    --card-hover-bg: #1a1a1a;
    --text: #e0e0e0;
    --text-secondary: #888;
    --text-muted: #666;
    --link: #a0a0a0;
    --link-hover: #fff;
    --h1-from: #fff;
    --h1-to: #888;
    --footer-text: #333;
    --footer-link: #444;
    --toggle-bg: #222;
    --toggle-fg: #888;
  }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    transition: background 0.3s, color 0.3s;
  }
  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 80px 24px;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 64px;
  }
  h1 {
    font-size: 2.4rem;
    font-weight: 600;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, var(--h1-from) 0%, var(--h1-to) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .toggle {
    background: var(--toggle-bg);
    border: none;
    border-radius: 20px;
    padding: 6px 14px;
    cursor: pointer;
    font-size: 0.8rem;
    color: var(--toggle-fg);
    font-family: inherit;
    transition: all 0.2s;
  }
  .toggle:hover { opacity: 0.8; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.2s ease;
    cursor: default;
  }
  .card:hover {
    border-color: var(--card-hover-border);
    background: var(--card-hover-bg);
    transform: translateY(-2px);
  }
  .card h2 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .card .desc {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 16px;
  }
  .card ul { list-style: none; }
  .card li { padding: 3px 0; }
  .card a {
    color: var(--link);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.15s;
  }
  .card a:hover { color: var(--link-hover); }
  .card.empty { opacity: 0.35; }
  .card.empty .desc { margin-bottom: 0; }
  .footer {
    margin-top: 80px;
    text-align: center;
    color: var(--footer-text);
    font-size: 0.8rem;
  }
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
