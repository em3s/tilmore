---
marp: true
theme: neobeam-oldenbeam
paginate: true
title: lazygit
footer: '**tilmore** **lazygit** **tools**'
---

<!-- _class: title -->
# lazygit

git을 터미널에서 쓰면 명령어를 외워야 한다.

GUI를 쓰면 터미널을 떠나야 한다.

lazygit은 터미널 안에서 git을 시각적으로 다룬다.

---

## 설치

```bash
brew install lazygit
```

neovim에서는 `,gg`로 바로 열 수 있다.

---

## 화면 구성

```
┌──────────┬──────────────────────┐
│ Status   │                      │
│ Files    │    diff / content    │
│ Branches │                      │
│ Commits  │                      │
│ Stash    │                      │
└──────────┴──────────────────────┘
```

`Tab` 또는 `h/l`로 패널 이동, `j/k`로 항목 이동.

---

## 자주 쓰는 키

| 키 | 동작 |
|----|------|
| `space` | 파일 stage/unstage |
| `c` | commit |
| `p` | push |
| `P` | pull |
| `b` | 브랜치 목록 |
| `/` | 검색 |
| `?` | 전체 키 도움말 |

---

## worktree

| 키 | 동작 |
|----|------|
| `w` | worktree 목록 |
| `n` | 새 worktree 생성 |
| `Enter` | 해당 worktree로 전환 |
| `d` | worktree 삭제 |

create worktree (detached)는 브랜치 없이 특정 커밋만 잠깐 볼 때.
보통은 브랜치 기반만 쓰면 된다.

---

## interactive rebase

커밋 목록에서:

| 키 | 동작 |
|----|------|
| `e` | edit |
| `s` | squash |
| `f` | fixup |
| `d` | drop |
| `ctrl+j/k` | 커밋 순서 변경 |

CLI에서 `git rebase -i`를 열 필요가 없다.
