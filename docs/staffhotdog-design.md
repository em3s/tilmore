# 스태프 핫도그 — 디자인 · 렌더링 지침

> 회차 콘텐츠가 이 repo에서 **어떻게 파일이 되고, 어떻게 렌더·배포되는가**.
> 글을 어떤 톤·구조로 쓰는가는 [staffhotdog-content.md](./staffhotdog-content.md).
>
> **소스는 EPUB가 아니라 마크다운이다(SSOT).** 회차는 Astro + Starlight repo 안의
> **마크다운 한 파일**. epub은 그 마크다운에서 **빌드 때 자동 생성**하는 다운로드
> 산출물일 뿐이다(아래 "epub 생성" 참고). 옛 수작업 epub 파이프라인(JSON·build 스크립트·
> 수동 epubcheck)은 없다.

---

## 회차 = 마크다운 한 파일

`src/content/docs/staffhotdog/bookNN.md` 한 파일이 **유일한 소스**다. (`NN` = 2자리)

이 파일이 두 가지로 렌더된다 (자동):
- **원문** `/staffhotdog/bookNN/` — Starlight 스크롤 문서
- **이북** `/staffhotdog/bookNN/?view=book` — 같은 페이지 위 페이지넘김 뷰.
  `public/staffhotdog-reader.js`가 렌더된 본문(`.sl-markdown-content`)을 읽어
  CSS 컬럼으로 페이지네이션. 권 목록은 사이드바 nav에서 자동 추출.

### 파일 골격

```markdown
---
title: '스태프 핫도그 #N — [주제]'      # 이북 표지 제목 = '—' 뒤의 [주제]
description: '[한 줄 부제]'              # 이북 표지 부제 = 이 값
sidebar:
  label: '#N — [주제]'
  order: N                              # 사이드바·권 선택기 순서
banner:
  content: '<strong>초안</strong> · 본문은 다듬는 중입니다.'   # 완성 시 제거
---

<a class="ebook-launch" href="?view=book">📖 이북으로 보기</a>

## 1. [도입·핵심 통찰]
...

## 2. [본격 전개]
...

## 3. [실전·응용]
...

## 닫는 글
...
```

### 헤딩 규칙

- 챕터(1·2·3장, 닫는 글) = `##` (h2)
- 챕터 안 소제목 = `###` (h3)
- `#` (h1) **금지** — 페이지 제목은 frontmatter `title`이 담당
- 이북의 챕터 분할·목차가 `##` 기준이다.

### 표지 — 자동 합성

`<section class="cover">`를 직접 쓰지 않는다. 이북이 합성한다:
- `№ NN` ← 파일명 `bookNN.md`
- 제목 ← frontmatter `title`의 `—` 뒤
- 부제 ← frontmatter `description`
- 저자 ← `em3s` (고정)

### 닫는 글 사인오프

```html
<div class="closing">
  <div class="closing-mark">*&#160;*&#160;*</div>
  <p>스태프 핫도그 #N — [제목]<br/>다음 핫도그에서 만나요.</p>
</div>
```

---

## 본문 마크업

마크다운 본문 안에서 HTML 그대로 사용 가능(헤딩만 `##`/`###`).

**Callout 박스**:
```html
<div class="callout callout-{purple|blue|amber|teal|gray}">
  <p class="callout-title">제목 (선택)</p>
  <p>내용</p>
</div>
```

**그림**:
```html
<div class="figure">
  <img src="/tilmore/staffhotdog/assets/NN/fig_name.png" alt="설명"/>
</div>
```
- PNG는 `public/staffhotdog/assets/NN/`에 저장, **절대경로**로 참조.
- `.figure`는 라이트·다크 공통 흰 배경 락(다이어그램 색 보존). CSS 손댈 것 없음.

> 코드블록·표·콜아웃이 한 페이지를 넘으면 이북에서 다음 장으로 자동 분할. 이미지는
> 한 페이지에 들어가도록 높이 제한. 작성자가 신경 쓸 것 없음.

---

## 색 팔레트 (5색)

| 이름 | 어두운 텍스트 | 옅은 배경 | 진한 라인 | 일반적 의미 |
|-----|-----------|---------|---------|----------|
| Purple | `#3C3489` | `#EEEDFE` | `#534AB7` | 메타·스펙·추상 |
| Blue   | `#0C447C` | `#E6F1FB` | `#185FA5` | 시작·입력·Map |
| Amber  | `#633806` | `#FAEEDA` | `#854F0B` | 중간 처리·Shuffle |
| Teal   | `#085041` | `#E1F5EE` | `#0F6E56` | 결과·Reduce·요약 |
| Gray   | `#1a1a18` | `#F1EFE8` | `#888780` | 기본·중립 |

`callout-purple/blue/amber/teal/gray` 모두 라이트·다크 양쪽 스타일됨
(`src/styles/hotdog.css` = 원문, 엔진 인라인 = 이북).

---

## 그림 렌더 사양 (SVG → PNG)

- viewBox 너비 `480` (좁게 — 모바일에서 글자 크게)
- 출력 해상도 `1000px` (예: cairosvg `output_width=1000`)
- 첫 요소 `<rect width="480" height="..." fill="#ffffff"/>` — 흰 배경 락
- 폰트: 한글 `"Noto Sans CJK KR, Noto Sans KR, sans-serif"` / 코드 `"monospace"`
  - **monospace 안에 한글 = □ 깨짐.** 한글 포함 줄은 무조건 한글 폰트.
- 크기: 제목 22px / 본문 15~17px / 코드·숫자 강조 17~20px / 캡션 13~14px
- 색: 본문 `#1a1a18`, 부제·캡션 `#444441`, 박스 강조는 해당 색 진한 변종
- 박스 stroke `1.5~2.5px` (얇으면 다크모드에서 안 보임)
- **한 그림 = 한 메시지.**

---

## 확인 · 배포

- **로컬 확인**: `npm run dev` → `http://localhost:4321/tilmore/staffhotdog/bookNN/`
  와 `?view=book` 둘 다. (정적 빌드: `npm run build && npm run preview`)
- **배포**: `main` 푸시 → GitHub Actions 자동 배포(GitHub Pages).
- **PWA/오프라인**: `scripts/gen-sw.mjs`가 prebuild/predev에서 `public/sw.js` 생성
  (원문 페이지·이미지·엔진 프리캐시). 새 회차는 md 파일명에서 자동 인식.
- 사이드바·이북 권 선택기는 md만 추가하면 자동(`sidebar.order`로 순서).

## epub 생성 (다운로드)

- `scripts/gen-epub.mjs`가 prebuild/predev에서 각 `bookNN.md` → `public/staffhotdog/
  staff_hotdog_NN.epub`(EPUB3)로 생성. 마크다운이 SSOT, epub은 산출물(gitignore).
- 챕터(`##`)는 epub 챕터(XHTML)로, `###`→h2. 표지·이미지·스타일 포함.
- 다운로드: 이북 메뉴(☰) 하단 "⬇ 이 권 epub 내려받기" → `staff_hotdog_NN.epub`.
- 본문이 XHTML 친화적이어야 함(자동닫힘 태그, `&` 이스케이프). 마크다운 작성 규칙을
  지키면 자동 충족. 새 회차 추가 시 epub도 자동 생성된다.

---

## 주의사항

- **표지 직접 쓰지 마라** — frontmatter `title`/`description`만.
- **챕터는 `##`로** — `#`(h1) 금지, 소제목 `###`.
- **`<section>` 래퍼 쓰지 마라** (옛 epub 잔재). 챕터는 평탄하게.
- **이미지는 절대경로** `/tilmore/staffhotdog/assets/NN/...`.
- 본문 맨 위 `<a class="ebook-launch" href="?view=book">📖 이북으로 보기</a>` 유지.
- 콜아웃 색은 `purple/blue/amber/teal/gray`만.
- 그림: monospace+한글 깨짐 주의, viewBox 480 고수, 한 그림 한 메시지.

**폐기 (안 씀)**: 옛 수작업 epub 파이프라인(build_epub_*.py, 수동 epubcheck, JSON 소스).
epub 자체는 이제 마크다운에서 자동 생성된다(위 "epub 생성").
