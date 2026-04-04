---
marp: true
theme: default
paginate: true
title: Git Worktree
---

# Git Worktree

하나의 repo에서 여러 브랜치를 동시에 체크아웃해서 작업할 수 있다.

---

## 왜 쓰는가

- 브랜치 전환 없이 여러 작업을 동시에 진행
- stash 안 해도 됨
- 빌드 캐시가 브랜치마다 독립

---

## Best Practice: bare repo

```bash
# bare로 클론 (작업 파일 없이 .git만)
git clone --bare git@github.com:user/my-project.git ~/workspace/my-project

cd ~/workspace/my-project

# worktree 추가
git worktree add ../my-project-main main
git worktree add ../my-project-feature-a feature-a
```

---

## bare repo 디렉토리 구조

```
~/workspace/
  my-project/                ← bare repo (.git만 있음)
  my-project-main/           ← main 브랜치
  my-project-feature-a/      ← feature 브랜치
```

일반 clone에서 `git worktree add ./feature` 하면 **repo 하위에 생긴다**.
bare repo 방식에서 `../` 경로를 쓰면 형제 디렉토리에 깔끔하게 정리된다.

---

## lazygit에서 사용

| 키 | 동작 |
|----|------|
| `w` | worktree 목록 |
| `n` | 새 worktree 생성 |
| `Enter` | 해당 worktree로 전환 |
| `d` | worktree 삭제 |

---

## create worktree vs detached

- **create worktree**: 브랜치 기반. 해당 브랜치를 체크아웃한 worktree 생성.
- **create worktree (detached)**: detached HEAD. 브랜치 없이 특정 커밋만 잠깐 볼 때.

보통은 브랜치 기반만 쓰면 된다.
