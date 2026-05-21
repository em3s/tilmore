// epub → 웹 리더용 콘텐츠 추출.
// 각 권의 spine 순서대로 XHTML body를 뽑고, 이미지를 복사하고, TOC 라벨을 붙여
// public/staffhotdog/content/bookNN.json 으로 저장한다. 외부 의존성 없음(unzip만 사용).
//
// 재실행: node scripts/extract-hotdog.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const EPUB_DIR = join(ROOT, 'public/staff_hotdog');
const OUT_DIR = join(ROOT, 'public/staffhotdog/content');
const ASSET_DIR = join(ROOT, 'public/staffhotdog/assets');

const BOOKS = ['01', '02', '03'];

function unzipText(epub, entry) {
  try {
    return execFileSync('unzip', ['-p', epub, entry], { encoding: 'utf8', maxBuffer: 1 << 24, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return ''; // 엔트리 없음 (예: epub3는 toc.ncx 대신 nav.xhtml)
  }
}

function bodyInner(xhtml) {
  const m = xhtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1].trim() : '';
}

function parseSpine(opf) {
  // idref 순서 → href (manifest에서 id→href 매핑)
  const items = {};
  for (const m of opf.matchAll(/<item\s+[^>]*id="([^"]+)"[^>]*href="([^"]+)"/g)) items[m[1]] = m[2];
  for (const m of opf.matchAll(/<item\s+[^>]*href="([^"]+)"[^>]*id="([^"]+)"/g)) items[m[2]] = m[1];
  const order = [];
  for (const m of opf.matchAll(/<itemref\s+idref="([^"]+)"/g)) order.push(items[m[1]]);
  return order.filter(Boolean);
}

function parseToc(ncx, nav) {
  // href(파일명) → 라벨. epub2(toc.ncx) 우선, 없으면 epub3(nav.xhtml) 폴백.
  const map = {};
  for (const m of ncx.matchAll(/<navPoint[^>]*>\s*<navLabel>\s*<text>([\s\S]*?)<\/text>\s*<\/navLabel>\s*<content src="([^"]+)"/g)) {
    map[m[2].split('#')[0]] = m[1].trim();
  }
  if (!Object.keys(map).length && nav) {
    for (const m of nav.matchAll(/<a\s+href="([^"]+)"\s*>([\s\S]*?)<\/a>/g)) {
      map[m[1].split('#')[0]] = m[2].trim();
    }
  }
  return map;
}

function title(opf) {
  const m = opf.match(/<dc:title>([\s\S]*?)<\/dc:title>/);
  return m ? m[1].trim() : '';
}

rmSync(OUT_DIR, { recursive: true, force: true });
rmSync(ASSET_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(ASSET_DIR, { recursive: true });

const index = [];

for (const id of BOOKS) {
  const epub = join(EPUB_DIR, `staff_hotdog_${id}.epub`);
  if (!existsSync(epub)) { console.warn('skip (missing):', epub); continue; }

  const opf = unzipText(epub, 'OEBPS/content.opf');
  const ncx = unzipText(epub, 'OEBPS/toc.ncx');
  const nav = unzipText(epub, 'OEBPS/nav.xhtml');
  const spine = parseSpine(opf);
  const toc = parseToc(ncx, nav);
  const bookTitle = title(opf);

  // 이미지 추출 — 디렉터리명(img/ 또는 images/ 등) 무관, 모든 이미지 엔트리를 평탄화 복사
  const assetSub = join(ASSET_DIR, id);
  mkdirSync(assetSub, { recursive: true });
  const entries = execFileSync('unzip', ['-Z1', epub], { encoding: 'utf8' }).split('\n');
  const imgEntries = entries.filter((e) => /\.(png|jpe?g|gif|svg|webp)$/i.test(e.trim()));
  for (const e of imgEntries) {
    execFileSync('unzip', ['-o', '-j', '-q', epub, e.trim(), '-d', assetSub]);
  }

  const sections = spine.map((href) => {
    const xhtml = unzipText(epub, 'OEBPS/' + href);
    // src의 디렉터리 부분을 버리고 파일명만 살려 assets/NN/ 로 치환
    let html = bodyInner(xhtml).replace(
      /(src=")[^"]*?([^"/]+\.(?:png|jpe?g|gif|svg|webp))"/gi,
      `$1assets/${id}/$2"`
    );
    return { href, label: toc[href] || '', html, cover: /class="cover"/.test(html) };
  });

  writeFileSync(join(OUT_DIR, `book${id}.json`), JSON.stringify({ id, title: bookTitle, sections }, null, 0));
  index.push({ id, title: bookTitle, epub: `../staff_hotdog/staff_hotdog_${id}.epub` });
  console.log(`book${id}: ${sections.length} sections, title="${bookTitle}"`);
}

writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 0));
console.log('done →', OUT_DIR);
