// 스태프 핫도그 원문 Starlight 페이지 생성.
// 단일 출처는 public/staffhotdog/content/bookNN.json (리더와 공유).
// 각 권 → src/content/docs/staffhotdog/bookNN.md 한 페이지.
//  - 헤딩은 마크다운(##)으로 변환해 TOC·앵커가 동작하게
//  - 콜아웃/그림 등 특수 마크업은 원본 HTML 유지(스타일은 src/styles/hotdog.css)
//  - 표지 섹션은 제외(페이지 제목이 대신함)
//  - 이미지 경로를 절대경로(/tilmore/...)로 치환
//  - 상단에 '이북으로 보기' 버튼 → 페이지넘김 리더
//
// 재실행: node scripts/gen-hotdog-pages.mjs   (prebuild에서 자동 실행)
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const BASE = '/tilmore';
const CONTENT = join(ROOT, 'public/staffhotdog/content');
const OUT = join(ROOT, 'src/content/docs/staffhotdog');

const read = (p) => readFileSync(p, 'utf8');

// 헤딩 태그 → 마크다운 ATX (한 단계 내려 페이지 제목 h1 아래로). 인라인 태그는 그대로 둠.
function headingsToMd(html) {
  return html
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n## ${t.trim()}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n### ${t.trim()}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n#### ${t.trim()}\n\n`);
}

const rewriteImg = (html) => html.replace(/(src=")assets\//g, `$1${BASE}/staffhotdog/assets/`);
const stripPrefix = (t) => t.replace(/^스태프 핫도그\s*/, '').trim();
const yamlEscape = (s) => `'${String(s).replace(/'/g, "''")}'`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const index = JSON.parse(read(join(CONTENT, 'index.json')));
for (const b of index) {
  const data = JSON.parse(read(join(CONTENT, `book${b.id}.json`)));
  const cover = data.sections.find((s) => s.cover);
  const desc = cover ? (cover.html.match(/class="cover-sub">([^<]*)</)?.[1]?.trim() || '') : '';
  const body = data.sections
    .filter((s) => !s.cover)
    .map((s) => rewriteImg(headingsToMd(s.html)))
    .join('\n\n');

  const order = parseInt(b.id, 10);
  const md = `---
title: ${yamlEscape(data.title)}
description: ${yamlEscape(desc)}
sidebar:
  label: ${yamlEscape(stripPrefix(data.title))}
  order: ${order}
banner:
  content: '<strong>초안</strong> · 본문은 다듬는 중입니다.'
---

<!-- 자동 생성 파일 — 직접 수정 금지. 원본은 public/staffhotdog/content/book${b.id}.json -->


<a class="ebook-launch" href="${BASE}/staffhotdog/?book=${b.id}">📖 이북으로 보기</a>

${body}
`;
  writeFileSync(join(OUT, `book${b.id}.md`), md);
  console.log(`staffhotdog/book${b.id}.md  ← "${data.title}"`);
}
console.log('done →', OUT);
