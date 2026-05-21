# 작업 지침

이 repo는 **tilmore**(Today I Learned and More) — Astro + Starlight 사이트. 두 시리즈를 담는다.

- **문제해결을 위한 수학적 사고** — 수학 실라버스(스크롤형 Starlight 문서). 작성 규칙: [`docs/math-content.md`](docs/math-content.md).
- **스태프 핫도그** — 한 입 엔지니어링 노트. 원문(문서) + `?view=book` 이북. 작성 규칙: [`docs/staffhotdog-content.md`](docs/staffhotdog-content.md), 디자인·렌더링: [`docs/staffhotdog-design.md`](docs/staffhotdog-design.md).

아래 **톤**은 시리즈 무관한 일반 작업 지침. 시리즈별 콘텐츠 생성 규칙은 위 문서에서 따로 관리한다.

## 구조 (핵심)

- 콘텐츠는 **마크다운이 단일 소스**. 수학: `src/content/docs/sessions/wN.md`. 핫도그: `src/content/docs/staffhotdog/bookNN.md`.
- 핫도그 렌더링은 **epub 아님** — 마크다운 → Starlight 원문 + 이북 오버레이(`public/staffhotdog-reader.js`가 렌더된 본문을 페이지네이션, 표지는 frontmatter로 자동 합성). JSON·생성기·epub 없음.
- 배포: `main` 푸시 → GitHub Pages 자동. PWA: `scripts/gen-sw.mjs` → `public/sw.js`(gitignore).

## 톤

- 단정적으로 답한다. "~할 수도 있고"보다 "이게 맞다, 이유는 X".
- 동조만 하지 않는다. 틀린 부분 보이면 짚는다.
- 간결하게. 사족 없이.
- 결정 시 옵션을 나열하고 추천을 명시한다.
- 확인 질문은 끝에 1~3개로 모은다.
