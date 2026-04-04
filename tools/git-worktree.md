---
marp: true
theme: uncover
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
git clone --bare git@github.com:user/my-project.git ~/workspace/my-project
cd ~/workspace/my-project
git worktree add ../my-project-main main
git worktree add ../my-project-feature-a feature-a
```

```
~/workspace/
  my-project/                ← bare repo (.git만 있음)
  my-project-main/           ← main 브랜치
  my-project-feature-a/      ← feature 브랜치
```

`../` 경로를 쓰면 형제 디렉토리에 깔끔하게 정리된다.

---

## 실습

```bash
cd /tmp
git clone --bare git@github.com:em3s/tilmore.git tilmore-bare
cd tilmore-bare
git worktree add ../tilmore-main main
git worktree add ../tilmore-draft draft
```

```bash
cd /tmp/tilmore-main
echo "test" >> README.md && git commit -am "test from main"

cd /tmp/tilmore-draft   # main의 변경이 보이지 않는다
cat README.md
```

```bash
# 정리
cd /tmp/tilmore-bare
git worktree remove ../tilmore-main
git worktree remove ../tilmore-draft
rm -rf /tmp/tilmore-bare
```

---

## FAQ

**checkout이랑 뭐가 다른가?**
checkout은 같은 디렉토리에서 전환. worktree는 다른 디렉토리에 병렬.

**IDE에서 프로젝트를 또 열어야 하나?**
그렇다. 대신 두 브랜치를 동시에 열어두고 비교할 수 있다.

**같은 브랜치를 두 worktree에서 열 수 있나?**
안 된다. `.git`이 꼬이기 때문에 git이 막아놓았다.

**worktree를 지우면 브랜치도 사라지나?**
아니다. 디렉토리만 사라지고 브랜치는 남아있다.

---

## more

[lazygit](lazygit.html)
