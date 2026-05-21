// 서비스워커 생성. 이북의 오프라인 핵심(리더 HTML·콘텐츠 JSON·이미지·아이콘·manifest)을
// 프리캐시 목록에 넣는다. 나머지(Starlight 페이지, 해시된 _astro 에셋)는 빌드 전엔
// 파일명을 알 수 없으므로 런타임 캐시(stale-while-revalidate)로 처리한다.
//
// 재생성: node scripts/gen-sw.mjs   (predev/prebuild에서 자동)
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = new URL('..', import.meta.url).pathname;
const PUBLIC = join(ROOT, 'public');
const BASE = '/tilmore';

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// 프리캐시 대상: 리더 + 콘텐츠 + 이미지 + 아이콘 + manifest
const files = [
  join(PUBLIC, 'manifest.webmanifest'),
  ...walk(join(PUBLIC, 'icons')),
  ...walk(join(PUBLIC, 'staffhotdog/content')),
  ...walk(join(PUBLIC, 'staffhotdog/assets')),
];
const urls = files.map((f) => BASE + '/' + relative(PUBLIC, f).split('\\').join('/'));
urls.push(BASE + '/staffhotdog/');          // 리더 HTML(디렉터리 URL)
urls.sort();

// 버전 = 프리캐시 대상 내용 해시 → 콘텐츠 바뀌면 캐시 갱신
const hash = createHash('sha1');
for (const f of files) hash.update(readFileSync(f));
hash.update(urls.join(','));
const VERSION = 'tilmore-' + hash.digest('hex').slice(0, 10);

const sw = `// 자동 생성: scripts/gen-sw.mjs — 직접 수정 금지
const VERSION = ${JSON.stringify(VERSION)};
const PRECACHE = ${JSON.stringify(urls, null, 2)};
const SCOPE = '${BASE}/';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function put(req, res) { if (res && res.ok && res.type === 'basic') caches.open(VERSION).then((c) => c.put(req, res)); }

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(SCOPE)) return;

  // HTML 내비게이션: 네트워크 우선(최신), 실패 시 캐시 → 오프라인 폴백은 리더
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).then((res) => { put(req, res.clone()); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match(SCOPE + 'staffhotdog/')))
    );
    return;
  }

  // 그 외(json·이미지·css·js): stale-while-revalidate
  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => { put(req, res.clone()); return res; }).catch(() => cached);
      return cached || net;
    })
  );
});
`;

writeFileSync(join(PUBLIC, 'sw.js'), sw);
console.log(`sw.js: ${urls.length} precache entries, ${VERSION}`);
