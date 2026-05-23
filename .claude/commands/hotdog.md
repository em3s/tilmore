---
description: 새 스태프 핫도그 회차를 처음부터 작성 (구조 제안 → 그림 → 본문 → 검증 → 리뷰)
argument-hint: "[주제] 또는 자료 URL  (예: /hotdog LSM Tree)"
---

스태프 핫도그 새 회차를 작성한다. 주제/자료: **$ARGUMENTS**

작성 규칙 두 문서를 **반드시 먼저 읽고** 그 규칙대로 따른다:
- 톤·구조: `docs/staffhotdog-content.md`
- 파일·렌더·마크업: `docs/staffhotdog-design.md`

## 순서

1. **번호 정하기** — `src/content/docs/staffhotdog/`의 마지막 `bookNN.md` 다음 번호를
   `NN`(2자리)으로 쓴다. 자료가 외부 URL이면 먼저 fetch해 내용을 확보한다.

2. **3장 구조 제안 (1회, 짧게)** — 핵심 메시지 한 줄 + 1·2·3장 각 한 줄 + 시그니처
   한 줄 자산. 사용자 OK를 받고 진행. 길게 묻지 말 것.

3. **그림 설계·생성** (6~8장: 시그니처 1 + 전개 3~5 + 실전 1)
   - design.md "그림 렌더 사양"대로 **SVG 작성**: viewBox 너비 480, 첫 요소
     `<rect width="480" height="..." fill="#ffffff"/>`(흰 배경 락), 한글 줄은 한글 폰트
     (monospace 안에 한글 = □ 깨짐), 한 그림 = 한 메시지.
   - **SVG → PNG 변환**: `rsvg-convert -w 1000 fig.svg -o public/staffhotdog/assets/NN/figX_name.png`
     (이 repo엔 cairosvg 없음, rsvg-convert/inkscape 사용). 임시 SVG는 변환 후 지운다.

4. **본문 작성** — `src/content/docs/staffhotdog/bookNN.md`. design.md "파일 골격"·헤딩
   규칙(`##` 챕터/`###` 소제목, `#` 금지)·사인오프(`<em>` 두 줄)·콜아웃 5색·이미지
   절대경로(`/tilmore/staffhotdog/assets/NN/...`). **인라인 `style=` 금지.**
   닫는 글은 "한 입 분량 끝. 정리는 세 줄." + 더 깊이(원전·실전·맥락).

5. **검증** — `npm run build`로 `/staffhotdog/bookNN/` 렌더 확인.
   `docs/staffhotdog-content.md` 맨 아래 "기존 회차" 표에 새 행 추가.

6. **자기 리뷰 → 사용자 리뷰 요청** — 정확성(산수·사실)·톤(한 입에 한 통찰, 외우지
   말고 느껴라)·밀도를 스스로 점검해 개선점을 짚고, push 전에 사용자 확인을 받는다.
   **push는 사용자가 OK한 뒤에만** (main 푸시 = GitHub Pages 자동 배포).

주제만 주어졌고 자료가 없으면, 사실은 정확히 — 추정 숫자는 검산하고, 원전(논문/책)을
"더 깊이"에 단다.
