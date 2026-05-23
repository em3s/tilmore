스태프 핫도그 새 회차를 작성한다. 주제/자료: $ARGUMENTS

먼저 다음 세 파일을 읽고 그 규칙·절차를 그대로 따른다 (SSOT):
- `.claude/commands/hotdog.md` — 작성 절차(번호 선정 → 3장 구조 제안 → 그림 → 본문 → 검증 → 리뷰)
- `docs/staffhotdog-content.md` — 톤·구조
- `docs/staffhotdog-design.md` — 파일·렌더·그림(SVG → PNG는 `rsvg-convert -w 1000`)

핵심: 다음 `bookNN` 번호 자동 선정 · 3장 구조 1회 제안 후 사용자 OK · 그림은 SVG로 그려
`public/staffhotdog/assets/NN/`에 PNG로 변환 · `npm run build` 검증 + `content.md` 회차 표 추가 ·
자기 리뷰(정확성·톤·밀도) 후 push는 사용자 확인 뒤에만(main 푸시 = GitHub Pages 자동 배포).
