---
marp: true
theme: default
paginate: true
title: Git Worktree 실습
---

# Git Worktree 실습

이 repo(tilmore)로 직접 해본다.

---

## 1. bare clone

```bash
cd /tmp
git clone --bare git@github.com:em3s/tilmore.git tilmore-bare
cd tilmore-bare
```

지금 이 디렉토리에는 `.git` 내용만 있다. 작업 파일은 없다.

---

## 2. worktree 만들기

```bash
git worktree add ../tilmore-main main
git worktree add ../tilmore-draft draft
```

```
/tmp/
  tilmore-bare/        ← bare repo
  tilmore-main/        ← main 브랜치
  tilmore-draft/       ← draft 브랜치 (자동 생성)
```

---

## 3. 확인

```bash
git worktree list
```

```
/tmp/tilmore-bare    (bare)
/tmp/tilmore-main    abc1234 [main]
/tmp/tilmore-draft   abc1234 [draft]
```

세 경로가 하나의 `.git`을 공유하고 있다.

---

## 4. 각 worktree에서 작업

```bash
# main에서 작업
cd /tmp/tilmore-main
echo "test" >> README.md
git add README.md && git commit -m "test from main"

# draft에서 작업 — main의 변경이 보이지 않는다
cd /tmp/tilmore-draft
cat README.md
```

브랜치 전환 없이 디렉토리만 이동했다.

---

## 5. 정리

```bash
cd /tmp/tilmore-bare
git worktree remove ../tilmore-main
git worktree remove ../tilmore-draft
```

worktree를 지워도 브랜치는 남아있다.

---

## 6. 정리 (전부 삭제)

```bash
rm -rf /tmp/tilmore-bare /tmp/tilmore-main /tmp/tilmore-draft
```

실습 끝.
