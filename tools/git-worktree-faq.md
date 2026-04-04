---
marp: true
theme: default
paginate: true
title: Git Worktree FAQ
---

# Git Worktree FAQ

처음 접하면 헷갈리는 것들.

---

## checkout이랑 뭐가 다른가?

`git checkout`은 **같은 디렉토리**에서 브랜치를 바꾼다.
worktree는 **다른 디렉토리**에 브랜치를 꺼낸다.

checkout은 전환, worktree는 병렬.

---

## IDE에서 프로젝트를 또 열어야 하나?

그렇다. worktree 하나가 독립된 디렉토리이기 때문에 IDE에서 별도로 열어야 한다.

IntelliJ라면 `Open` → worktree 경로 선택.

처음엔 번거로워 보이지만, 두 브랜치를 **동시에 열어두고 비교**할 수 있다는 뜻이기도 하다.

---

## 같은 브랜치를 두 worktree에서 열 수 있나?

안 된다. 하나의 브랜치는 하나의 worktree에만 체크아웃된다.

같은 브랜치를 동시에 수정하면 `.git`이 꼬이기 때문에 git이 막아놓았다.

---

## worktree에서 만든 커밋은 어디에 있나?

원래 repo에 있다. `.git`을 공유하니까.

다른 worktree에서 `git log`를 치면 보인다.

---

## worktree를 지우면 브랜치도 사라지나?

아니다. worktree는 디렉토리를 지우는 것이고 브랜치는 남아있다.

```bash
git worktree remove ../tilmore-draft  # 디렉토리 삭제
git branch -d draft                    # 브랜치는 따로 삭제
```

---

## 언제 쓰고, 언제 안 써도 되나?

쓸 때:
- 브랜치 간 빈번하게 왔다 갔다 할 때
- 긴 빌드 중에 다른 브랜치를 봐야 할 때
- 코드 리뷰하면서 내 작업도 계속할 때

안 써도 될 때:
- 브랜치 하나로 충분할 때
- 잠깐 확인하고 돌아올 거면 `git stash`로 충분
