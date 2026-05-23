# 문제해결을 위한 수학적 사고

> 수학은 사고의 뼈대다. 차별점은 여기서 나온다.

**[https://em3s.github.io/tilmore/](https://em3s.github.io/tilmore/)**

## 개발

```
npm install
npm run dev      # http://localhost:4321/tilmore/
npm run build
```

## 콘텐츠 작성 — `/hotdog`

스태프 핫도그 새 회차는 AI 슬래시 커맨드 `/hotdog [주제]`로 작성한다(구조 제안 → 그림 →
본문 → 검증 → 리뷰). 절차·규칙 SSOT는 `.claude/commands/hotdog.md` + `docs/staffhotdog-*.md`.

- **Claude Code · Gemini CLI** — repo 안에서 실행하면 커맨드 자동 인식(`.claude/`, `.gemini/`).
- **Codex CLI** — 전역 프롬프트만 읽으므로 repo 파일을 한 번 심링크:

  ```sh
  ln -sf "$(pwd)/.codex/prompts/hotdog.md" ~/.codex/prompts/hotdog.md
  ```

세 툴 모두 **이 repo 루트에서 실행**해야 한다(상대경로 참조).
