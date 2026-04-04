---
marp: true
theme: default
paginate: true
title: Git Worktree
---

# Git Worktree

feature 브랜치에서 작업 중인데, 급하게 hotfix를 해야 한다.

`git stash` → 브랜치 전환 → 수정 → 다시 돌아와서 `git stash pop`?

clone을 하나 더?

---

## clone을 여러 개 하면?

된다. 하지만 각 clone은 독립된 `.git`이다.

로컬 브랜치, remote, `user.email`까지 전부 따로 관리해야 한다.
개인 repo를 clone했는데 회사 이메일로 커밋이 찍히는 건 이래서 생긴다.

---

## worktree

하나의 `.git`을 공유하면서 여러 브랜치를 동시에 체크아웃한다.

- 브랜치, 히스토리, remote가 전부 하나
- stash 없이 디렉토리만 이동
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

## more

[실습](git-worktree-lab.html) · [lazygit](lazygit.html)
