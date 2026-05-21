// 마크다운(SSOT)에서 EPUB3 생성. SSOT는 그대로 두고 epub은 빌드 산출물.
// src/content/docs/staffhotdog/bookNN.md → public/staffhotdog/staff_hotdog_NN.epub
//
// 본문은 블록 헤딩(##/###/####)만 마크다운, 나머지는 XHTML 친화적 raw HTML.
// 재실행: node scripts/gen-epub.mjs   (prebuild/predev에서 자동)
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const PAGES = join(ROOT, 'src/content/docs/staffhotdog');
const ASSETS = join(ROOT, 'public/staffhotdog/assets');
const OUT = join(ROOT, 'public/staffhotdog');

const front = (md, key) => (md.match(new RegExp('^' + key + ":\\s*['\"]?(.*?)['\"]?\\s*$", 'm')) || [])[1] || '';
const xhtml = (title, body) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko" lang="ko">
<head><meta charset="UTF-8"/><title>${title}</title><link rel="stylesheet" type="text/css" href="styles.css"/></head>
<body>
${body}
</body>
</html>
`;

const STYLES = `@charset "UTF-8";
html,body{margin:0;padding:0;font-family:"Apple SD Gothic Neo","Noto Sans CJK KR","Malgun Gothic",sans-serif;font-size:1em;line-height:1.7;color:#1a1a18;background:#faf9f5;word-break:keep-all;overflow-wrap:break-word;}
body{padding:1em 1.2em;}
h1,h2,h3{font-weight:700;letter-spacing:-.01em;line-height:1.35;}
h1{font-size:1.7em;margin:1.2em 0 .6em;}
h2{font-size:1.3em;margin:1.8em 0 .5em;border-bottom:1px solid rgba(127,127,127,.25);padding-bottom:.3em;}
h3{font-size:1.05em;margin:1.4em 0 .4em;}
p{margin:.8em 0;text-align:justify;}
code,pre{font-family:"D2Coding","SF Mono",Menlo,Consolas,monospace;font-size:.9em;}
pre{background:rgba(127,127,127,.08);padding:.9em 1em;border-radius:6px;border:1px solid rgba(127,127,127,.15);white-space:pre-wrap;overflow-wrap:break-word;}
code{background:rgba(127,127,127,.1);padding:.1em .35em;border-radius:3px;}
pre code{background:transparent;padding:0;}
.figure{margin:1.2em 0;text-align:center;background:#fff;padding:.4em;border-radius:8px;border:1px solid rgba(127,127,127,.25);}
.figure img{max-width:100%;height:auto;}
.callout{margin:1.3em 0;padding:.9em 1.1em;border-radius:8px;border:1px solid;}
.callout-purple{background:rgba(127,119,221,.08);border-color:rgba(127,119,221,.35);}
.callout-blue{background:rgba(56,138,221,.08);border-color:rgba(56,138,221,.35);}
.callout-amber{background:rgba(186,117,23,.08);border-color:rgba(186,117,23,.35);}
.callout-teal{background:rgba(29,158,117,.08);border-color:rgba(29,158,117,.35);}
.callout-gray{background:rgba(127,127,127,.08);border-color:rgba(127,127,127,.35);}
.callout-title{font-weight:700;margin:0 0 .3em;}
table{border-collapse:collapse;width:100%;margin:1em 0;font-size:.92em;}
th,td{padding:.5em .7em;border-bottom:1px solid rgba(127,127,127,.2);text-align:left;}
th{font-weight:600;background:rgba(127,127,127,.06);}
.cover{height:100vh;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:2em;}
.cover-series{font-size:.95em;letter-spacing:.35em;color:#73726c;text-transform:uppercase;margin-bottom:.8em;font-weight:600;}
.cover-num{font-family:"Times New Roman",serif;font-style:italic;font-size:3.2em;margin:.2em 0;line-height:1;}
.cover-title{font-size:2.6em;font-weight:700;margin:.5em 0 .3em;letter-spacing:-.02em;}
.cover-sub{font-size:1.05em;color:#4a4a47;margin-top:.5em;}
.cover-rule{width:80px;height:1px;background:rgba(127,127,127,.5);margin:2em auto;}
.cover-author{font-size:.9em;color:#73726c;margin-top:1em;letter-spacing:.05em;}
.closing{text-align:center;margin-top:4em;color:#73726c;}
.closing-mark{font-family:"Times New Roman",serif;font-style:italic;font-size:1.4em;}
`;

function buildBook(id) {
  const md = readFileSync(join(PAGES, `book${id}.md`), 'utf8');
  const fullTitle = front(md, 'title');                 // "스태프 핫도그 #N — Topic"
  const topic = (fullTitle.split('—')[1] || fullTitle).trim();
  const sub = front(md, 'description');
  let body = md.replace(/^---\n[\s\S]*?\n---\n/, '');    // drop frontmatter
  body = body.replace(/^<a class="ebook-launch"[\s\S]*?<\/a>\s*$/m, '').trim();

  // 챕터(##) 단위로 분할, 내부 헤딩 ###/#### → h2/h3
  const chapters = body.split(/^## /m).filter((s) => s.trim()).map((part) => {
    const nl = part.indexOf('\n');
    const title = part.slice(0, nl).trim();
    let content = part.slice(nl).trim()
      .replace(/^#### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^### (.*)$/gm, '<h2>$1</h2>');
    return { title, content };
  });

  // 이미지: 절대경로 → images/  , 사용된 파일 수집
  const imgs = new Set();
  const rewrite = (html) => html.replace(/(src=")\/tilmore\/staffhotdog\/assets\/\d+\/([^"]+)"/g, (_, p, f) => { imgs.add(f); return `${p}images/${f}"`; });

  // 빌드 디렉터리
  const tmp = join(ROOT, `.epub_${id}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(join(tmp, 'META-INF'), { recursive: true });
  mkdirSync(join(tmp, 'OEBPS/images'), { recursive: true });

  writeFileSync(join(tmp, 'mimetype'), 'application/epub+zip');
  writeFileSync(join(tmp, 'META-INF/container.xml'),
    `${'<?xml version="1.0" encoding="UTF-8"?>'}\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>\n`);
  writeFileSync(join(tmp, 'OEBPS/styles.css'), STYLES);

  // 표지
  writeFileSync(join(tmp, 'OEBPS/cover.xhtml'), xhtml(fullTitle,
    `  <section class="cover">
    <div class="cover-series">STAFF HOTDOG · 스태프 핫도그</div>
    <div class="cover-num">№ ${id}</div>
    <h1 class="cover-title">${topic}</h1>
    ${sub ? `<div class="cover-sub">${sub}</div>` : ''}
    <div class="cover-rule"></div>
    <div class="cover-author">em3s</div>
  </section>`));

  // 챕터 파일
  const files = chapters.map((c, i) => {
    const name = `ch${i + 1}.xhtml`;
    writeFileSync(join(tmp, 'OEBPS', name), xhtml(c.title, `  <h1>${c.title}</h1>\n${rewrite(c.content)}`));
    return { name, title: c.title };
  });

  // 이미지 복사 (assets/NN/ 에서 basename으로)
  for (const f of imgs) {
    let srcPath = '';
    for (const dir of readdirSync(ASSETS)) { const p = join(ASSETS, dir, f); if (existsSync(p)) { srcPath = p; break; } }
    if (srcPath) copyFileSync(srcPath, join(tmp, 'OEBPS/images', f));
  }
  const imgItems = [...imgs].map((f, i) => `<item id="img${i}" href="images/${f}" media-type="image/${f.endsWith('.jpg') || f.endsWith('.jpeg') ? 'jpeg' : f.split('.').pop()}"/>`).join('\n    ');

  // nav.xhtml
  const navLis = files.map((f) => `<li><a href="${f.name}">${f.title}</a></li>`).join('\n      ');
  writeFileSync(join(tmp, 'OEBPS/nav.xhtml'), xhtml('목차',
    `  <nav epub:type="toc" id="toc" xmlns:epub="http://www.idpf.org/2007/ops"><h1>목차</h1><ol>
      <li><a href="cover.xhtml">표지</a></li>
      ${navLis}
    </ol></nav>`));

  // content.opf
  const manifestCh = files.map((f, i) => `<item id="ch${i + 1}" href="${f.name}" media-type="application/xhtml+xml"/>`).join('\n    ');
  const spineCh = files.map((_, i) => `<itemref idref="ch${i + 1}"/>`).join('\n    ');
  writeFileSync(join(tmp, 'OEBPS/content.opf'),
    `${'<?xml version="1.0" encoding="UTF-8"?>'}
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="ko">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:staffhotdog:${id}</dc:identifier>
    <dc:title>${fullTitle}</dc:title>
    <dc:creator>em3s</dc:creator>
    <dc:publisher>스태프 핫도그</dc:publisher>
    <dc:language>ko</dc:language>
    <meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="styles.css" media-type="text/css"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    ${manifestCh}
    ${imgItems}
  </manifest>
  <spine>
    <itemref idref="cover"/>
    ${spineCh}
  </spine>
</package>
`);

  // zip: mimetype 먼저(무압축), 나머지 압축
  const epub = join(OUT, `staff_hotdog_${id}.epub`);
  rmSync(epub, { force: true });
  execFileSync('zip', ['-X', '-q', '-0', epub, 'mimetype'], { cwd: tmp });
  execFileSync('zip', ['-X', '-q', '-rg', epub, 'META-INF', 'OEBPS'], { cwd: tmp });
  rmSync(tmp, { recursive: true, force: true });
  console.log(`staff_hotdog_${id}.epub  (${files.length} chapters, ${imgs.size} images)`);
}

for (const f of readdirSync(PAGES)) {
  const m = f.match(/^book(\d+)\.md$/);
  if (m) buildBook(m[1]);
}
console.log('done →', OUT);
