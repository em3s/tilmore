# 문제해결을 위한 수학적 사고

> 수학은 사고의 뼈대다. 차별점은 여기서 나온다.

---

## 회차 구성

각 회차는 두 층:

- **A층 — 통찰** — 핵심 통찰과 수학적 형식화. 본편.
- **B층 — 도구** — 같은 문제 계열의 관련 알고리즘. 보너스.

각 회차의 섹션:

- **문제 상황** — 엔지니어가 실무에서 마주치는 상황. 회차의 출발점
- **핵심 통찰** — 그 상황에서 어떻게 사고하는가. 한 문장
- **수학적 형식화** — 그 사고가 수학으로 어떻게 표현되는가
- **다루는 것 (A층)** — 반드시 짚는 것
- **건드리기만 하는 것** — 이름과 존재만 언급
- **안 다루는 것** — 명시적으로 제외. 범위 밖
- **실무 연결** — 실무의 어느 지점에 적용되는가
- **보너스 도구 (B층)** — 추가로 다룰 수 있는 관련 기법
- **핵심 키워드** — 검색 질의어. 영문 우선

용어 표기: **한국어(영어) 병기**. 첫 등장 시.

---

## W1. 변수가 많다

### 문제 상황
여러 변수가 서로 영향을 주며 얽혀 있다. 한 번에 모든 변수에 대해 최적해를 찾을 수 없다. 어디부터 시작해야 할지 막막하다. 예: 사용자 × 아이템 추천 행렬에서 각 요소의 선호도를 동시에 추정.

### 핵심 통찰
"풀리지 않는 문제는, 한쪽을 고정하면 풀린다. 그리고 번갈아 반복하면 둘 다 풀린다."
- 동시에 최적화할 수 없는 여러 변수를, 부분 문제의 반복으로 변환한다
- 각 부분 문제는 해결 가능한 형태(선형, 볼록)가 된다
- 수학 바깥에서도 통함: 꼬인 협상, 다중 파라미터 시스템 튜닝, 조직 문제

### 수학적 형식화
- 비선형 최적화 문제를 교대 최적화(Alternating Optimization)로 변환
- `min f(U, V)` → U 고정하고 V 최적화, V 고정하고 U 최적화, 반복
- 각 단계는 Least Squares로 닫힌 해(closed-form) 존재

### 다루는 것 (A층)
- ALS (Alternating Least Squares)의 수학과 철학
    - 왜 "번갈아가며"인가: 비선형 문제를 선형 문제 두 개로 분해
    - 수렴의 직관: 손실이 단조 감소함을 보이기
- 행렬 분해(Matrix Factorization)의 아이디어: R ≈ U × V^T
- 암묵적 피드백 ALS (Implicit Feedback ALS): 클릭/조회 같은 신호 처리
- 특이값 분해(SVD)와의 관계: SVD는 최적 저차원 근사
- 잠재 요인(Latent Factor)의 의미: 관측 뒤에 숨은 차원

### 건드리기만 하는 것
- PCA (주성분 분석, Principal Component Analysis): SVD의 통계적 해석
- Word2Vec이 암묵적 행렬 분해라는 것
- TF-IDF의 아이디어

### 안 다루는 것
- SVD의 엄밀한 증명
- 추천 시스템 평가 지표 (NDCG, Recall@K)
- 콜드 스타트(Cold Start) 해법
- Matrix Factorization 변형 (BPR, SLIM)
- Neural Collaborative Filtering

### 실무 연결
- 추천 시스템의 유저-아이템 행렬 분해
- 임베딩 기반 검색의 원리
- 로그 데이터의 차원 축소
- Spark MLlib의 ALS 구현

### 보너스 도구 (B층)
- **B3. 차원이 크고 본질이 안 보인다** — PCA, SVD, 차원 축소
    - 잠재 요인의 또 다른 얼굴. 관측 데이터의 주된 분산 축 찾기
- **B2. 레이블이 없다** — K-Means, K-Means++, GMM
    - 잠재 구조 찾기의 다른 방향. 분해 대신 군집

### 핵심 키워드
`alternating least squares`, `ALS`, `matrix factorization`, `implicit feedback`, `singular value decomposition`, `SVD`, `latent factor model`, `collaborative filtering`, `low-rank approximation`, `principal component analysis`

---

## W2. 뭘 해야 할지 모른다 (경사하강법 + 볼록성 관점)

### 문제 상황
최적의 답이 어디 있는지 모른다. 전체 공간을 탐색할 수 없다. 한 번의 완벽한 시도가 아니라, 여러 번의 조정을 통해 다가가야 한다. 예: 신경망 파라미터 학습, 시스템 튜닝, 하이퍼파라미터 탐색.

### 핵심 통찰
"숙고해서 완벽한 한 수보다, 조금씩 빠르게 왔다갔다. 처음엔 과감하게, 나중엔 조심히. 그리고 이 방법이 통하려면 문제의 구조가 맞아야 한다."
- 완벽한 계획보다 빠른 반복(iteration)이 강하다
- 학습률(Learning Rate)은 삶의 전략이기도 함: 처음엔 큰 걸음, 수렴하며 세밀하게
- 단, 이 전략이 보장되는 건 문제가 **볼록(Convex)**할 때. 볼록이 아니면 시작점이 결과를 좌우한다
- 시니어는 알고리즘을 쓰기 전에 **문제의 구조**를 먼저 본다

### 수학적 형식화
- Gradient ∇f(x): 함수가 가장 빠르게 증가하는 방향
- 경사하강법: x ← x - η∇f(x)
- 볼록 함수: 모든 국소 최적이 전역 최적
- 비볼록 함수: 지역 최적(local optimum)의 존재, 시작점 의존성

### 다루는 것 (A층)
- 경사하강법(Gradient Descent)의 직관: 가장 가파른 내리막
- 학습률(Learning Rate)의 의미와 조절
- 확률적 경사하강법(SGD, Stochastic Gradient Descent): 노이즈가 탈출구를 만든다
- 미니배치(Mini-batch): 계산 효율과 수렴 안정성의 타협
- 모멘텀(Momentum): 관성을 도입해 진동 줄이고 가속
- Adam, AdamW: 적응적 학습률
- 연쇄법칙(Chain Rule)과 역전파(Backpropagation)의 원리
- 수치 안정성: Gradient 폭발(Exploding)/소실(Vanishing)
- **볼록 최적화(Convex Optimization) 관점**: 왜 어떤 문제는 GD로 전역 최적이 보장되고 어떤 문제는 안 되는가
- Perceptron과 Multi-Layer Perceptron (MLP)의 기초

### 건드리기만 하는 것
- Nesterov Momentum
- RMSprop, Adagrad
- 학습률 스케줄 (Cosine, Warmup)
- L-BFGS (Spark MLlib의 선택지)
- Saddle Point 문제

### 안 다루는 것
- 2차 미분 방법의 완전한 수학 (보너스에서 맛만)
- 라그랑주 승수법의 엄밀한 증명
- 볼록 최적화 이론의 수학적 엄밀성
- 신경망 구조 자체 (CNN, RNN, Transformer)

### 실무 연결
- Spark MLlib의 SGD 튜닝
- 모델 학습 불안정성 디버깅
- 배치 사이즈 결정의 근거
- 시스템 파라미터 튜닝에서의 learning rate 사고
- "과감하게 시작해서 조심히 수렴"이라는 의사결정 전략

### 보너스 도구 (B층)
- **B49. 제약 하의 최적화** — Lagrange Multiplier, KKT 조건
    - 제약이 있을 때 경사하강의 확장
- **B50. Hessian으로 더 빠르게** — Newton's Method
    - 2차 정보를 쓰면 더 빨리 수렴
- **B52. 수학 없이 확률로** — Simulated Annealing, Genetic Algorithm
    - 비볼록에서 Gradient를 포기하고 확률로

### 핵심 키워드
`gradient descent`, `stochastic gradient descent`, `SGD`, `mini-batch`, `learning rate`, `momentum`, `adam optimizer`, `backpropagation`, `chain rule`, `vanishing gradient`, `exploding gradient`, `convex optimization`, `perceptron`, `multi-layer perceptron`

---

## W3. 데이터로 답을 찾는다, 단 사전 지식은 버리지 말라

### 문제 상황
데이터는 있지만 모델의 파라미터를 모른다. 데이터가 많으면 쉽게 답이 나올 것 같은데, 데이터가 적으면 과적합된다. 완전한 무지에서 출발하는 게 맞는가?

### 핵심 통찰
"데이터가 말하게 하라. 단, 사전 지식을 버리지 말라. 그리고 말할 때 '확실하다'가 아니라 '확률이 이 정도다'라고 말하라."
- MLE(최대우도)는 데이터에만 의존. MAP(최대사후)은 사전 지식을 더한다
- 정규화(Regularization)는 수학적으로 사전 지식(Prior)과 같다: L2 = Gaussian prior, L1 = Laplace prior
- 시니어는 확률로 말한다: "70% 확률로"가 "맞다/틀렸다"를 대체한다
- 커뮤니케이션의 격을 바꾸는 사고

### 수학적 형식화
- 우도 L(θ|데이터) = P(데이터|θ): 파라미터가 주어졌을 때 이 데이터가 나올 확률
- MLE: argmax L(θ|데이터)
- Bayes 정리: P(θ|데이터) ∝ P(데이터|θ) × P(θ)
- MAP: argmax P(θ|데이터)
- 크로스 엔트로피(Cross-Entropy) 손실 = MLE의 음수 로그 우도

### 다루는 것 (A층)
- 로지스틱 회귀(Logistic Regression)
    - 시그모이드(Sigmoid): 실수를 확률로
    - 의사결정 경계(Decision Boundary)
- 최대우도추정(MLE, Maximum Likelihood Estimation)
    - "관측된 데이터를 가장 잘 설명하는 파라미터"
    - 왜 로그우도(Log-likelihood)를 쓰는가
- 크로스 엔트로피(Cross-Entropy) = MLE의 결과
- 최대사후확률(MAP, Maximum A Posteriori)
- 베이즈 정리(Bayes Theorem): 사전/우도/사후
- 정규화(Regularization)의 베이지안 해석:
    - L2 Regularization = Gaussian Prior
    - L1 Regularization = Laplace Prior (희소성 유도)

### 건드리기만 하는 것
- 엔트로피(Entropy), KL 발산(KL Divergence) — W4에서 맛봄 가능
- 공액 사전 분포(Conjugate Prior)
- MCMC, 변분 추론 존재 언급

### 안 다루는 것
- MCMC, 변분 추론(Variational Inference)의 구체 알고리즘
- 은닉 마르코프 모델(HMM)
- 가우시안 프로세스(Gaussian Process)
- EM 알고리즘의 수렴 증명

### 실무 연결
- 분류 모델의 손실 함수 선택 근거
- L1/L2 정규화를 언제 쓸지 결정
- A/B 테스트 결과의 베이지안 해석 (W4 예고)
- 불확실성 커뮤니케이션 (시니어의 언어)

### 보너스 도구 (B층)
- **B51. 비싼 함수의 최적화** — Bayesian Optimization
    - Prior를 활용한 스마트 탐색. 하이퍼파라미터 튜닝 실무
- **B5. 관측이 불완전하다** — Kalman Filter
    - 노이즈 속 상태 추정. Bayesian 업데이트의 시계열 버전

### 핵심 키워드
`logistic regression`, `maximum likelihood estimation`, `MLE`, `cross-entropy loss`, `sigmoid`, `MAP estimation`, `bayesian inference`, `prior`, `posterior`, `bayes theorem`, `L1 regularization`, `L2 regularization`, `ridge`, `lasso`, `gaussian prior`, `laplace prior`

---

## W4. 전부 볼 수 없다

### 문제 상황
모집단 전체를 관찰할 수 없다. 일부 표본으로 전체를 판단해야 한다. 새로운 선택지를 계속 시도해야 하는가, 아니면 현재 최선을 계속 쓸 것인가? 완벽한 확신이 언제 가능한가?

### 핵심 통찰
"샘플은 모수를 말한다. 전수조사는 강박이다. 그리고 확신이 필요한 만큼만 샘플을 모아라. 초반엔 많이 틀려도 된다."
- 중심극한정리(CLT)는 "평균의 분포는 정규분포에 수렴"이라는 마법
- 모수를 몰라도 샘플 평균으로 신뢰구간을 칠 수 있다
- 가설 검정은 "우연일 확률이 얼마나 작은가"를 계산
- Bandit은 "확신이 없어도 계속 움직이면서 배우는" 전략
- 주니어는 "확실해질 때까지 기다리지만", 시니어는 **불확실성 속에서도 계속 움직이면서 배운다**
- 커리어 전략, 학습 전략도 같은 구조

### 수학적 형식화
- 중심극한정리(CLT): n개 iid 샘플의 평균 → N(μ, σ²/n)
- 가설 검정: H0 하에서 관측된 값이 나올 확률(p-value)
- Multi-Armed Bandit의 후회(Regret) 최소화
- Thompson Sampling: 사후 분포에서 샘플링해 선택
- UCB: 신뢰구간 상한으로 낙관적 선택

### 다루는 것 (A층)
- A/B 테스트의 통계학
    - 가설 검정(Hypothesis Testing)
    - p-value, 유의수준(Significance Level), 검정력(Statistical Power)
    - 표본 크기 계산
- 주요 검정
    - 카이제곱 검정(Chi-Square Test): 범주형 데이터
    - 콜모고로프-스미르노프 검정(KS Test): 분포 비교
    - t-test: 평균 비교
- 다중 검정 문제(Multiple Comparison)와 본페로니 교정(Bonferroni Correction)
- Multi-Armed Bandit: 탐색 vs 활용(Exploration vs Exploitation)
- Thompson Sampling: 베이지안 기반 선택
- UCB (Upper Confidence Bound): 낙관적 선택
- Epsilon-Greedy: 가장 단순한 전략
- **A/B 테스트 vs Bandit의 철학적 대비**: 정적 vs 동적 의사결정

### 건드리기만 하는 것
- 베이지안 A/B 테스트
- Contextual Bandit
- 강화학습(Reinforcement Learning)의 출발점
- 중심극한정리의 엄밀한 증명

### 안 다루는 것
- 실험 설계(Experimental Design) 세부 (요인 설계, 블록 설계)
- 인과 추론(Causal Inference) — 교란 변수, 성향 점수
- 시계열 A/B 테스트
- 강화학습의 전체 이론 (Q-learning, Policy Gradient 구체 알고리즘)

### 실무 연결
- A/B 테스트를 PM/데이터 사이언티스트와 대등하게 설계
- 추천/랭킹에서 Bandit 적용
- 실험 결과를 숫자가 아니라 의사결정으로 번역
- "충분한 샘플"을 정량으로 말하는 법
- 탐색형 업무에서의 확률적 pruning

### 보너스 도구 (B층)
- **B39. 상태와 행동의 수학** — MDP (Markov Decision Process)
- **B40. 시행착오로 배운다** — Reinforcement Learning, Q-Learning
    - Bandit의 자연스러운 확장
- **B41. 꼬리 리스크** — VaR, Expected Shortfall
    - 평균이 아닌 극단의 통계
- **B42. 극단값** — Extreme Value Theory
    - 드물지만 치명적인 사건의 수학

### 핵심 키워드
`central limit theorem`, `A/B testing`, `hypothesis testing`, `p-value`, `statistical power`, `chi-square test`, `kolmogorov-smirnov test`, `t-test`, `multi-armed bandit`, `thompson sampling`, `upper confidence bound`, `UCB`, `exploration exploitation tradeoff`, `epsilon greedy`, `bonferroni correction`

---

## W5. 정확함이 비싸다

### 문제 상황
모든 것을 정확히 기록하고 계산하면 공간과 시간이 폭발한다. 1천만 개 URL의 중복 체크, 수십억 이벤트의 distinct count, 스트림의 p99 추정. 정확함의 가격이 너무 비싸다.

### 핵심 통찰
"정확함은 자원이다. 1%의 오차를 허용하면 1000배 싸진다. '얼마나 정확해야 하는가'를 먼저 물어라."
- 주니어는 100% 정확함을 기본으로 가정. 시니어는 **정확도를 설계 변수**로 본다
- 오차를 허용하면 공간과 시간이 극적으로 절약된다
- 이게 시스템 설계의 출발점. 허용 가능한 오차를 모르면 과잉 엔지니어링이 된다
- "불확실성을 설계에 내장"하는 태도

### 수학적 형식화
- Bloom Filter: k개 해시 함수 × m비트 배열, false positive 확률 ≈ (1 - e^(-kn/m))^k
- HyperLogLog: 해시 비트의 leading zero 개수로 카디널리티 추정
- Count-Min Sketch: 여러 해시의 최솟값으로 빈도 추정
- t-digest: 가중 중심(centroid)으로 분위수 근사

### 다루는 것 (A층)
- Bloom Filter
    - 해시 함수와 비트 배열의 조합
    - False Positive의 수학: 공간 vs 오류율 trade-off
    - 30줄 코드로 1천만 개를 1.2MB에
    - 실제 구현 라이브하게 보여주기 가능
- Count-Min Sketch: 스트리밍 빈도 추정
- HyperLogLog: 중복 제거 카운트(Cardinality Estimation)
    - 확률적 세기의 천재성
- t-digest: 분위수 추정 (p50, p99)
- **설계 사고**: "허용 오차 × 데이터 크기 = 필요 공간"의 관계

### 건드리기만 하는 것
- Cuckoo Filter (Bloom의 삭제 지원 버전)
- Reservoir Sampling (스트림의 균일 샘플)
- Consistent Hashing (분산 시스템의 고전)

### 안 다루는 것
- 암호학적 해시 함수의 수학 (SHA, MD5 등)
- Merkle Tree와 블록체인 연결
- Streaming Algorithm의 이론적 하한
- 구체적 구현 최적화 (SIMD, cache 등)

### 실무 연결
- 대용량 중복 체크: URL 블랙리스트, 크롤러
- 실시간 대시보드의 근사 집계 (HLL, t-digest)
- 캐시의 부하 분산 (Consistent Hashing)
- 모니터링 시스템의 p99 계산

### 보너스 도구 (B층)
- **B1. 완벽한 매칭이 불가능하다** — ANN, HNSW, LSH, Product Quantization
    - 확률적 근사의 벡터 검색 버전
- **B46. 확률로 결정성을 대체한다** — Randomized Algorithms
    - 확률이 결정성보다 강력한 경우
- **B47. 완벽 대신 증명된 근사** — Approximation Algorithms
    - NP-hard에서 다항시간으로 근사의 품질 증명

### 핵심 키워드
`bloom filter`, `count-min sketch`, `hyperloglog`, `t-digest`, `cardinality estimation`, `probabilistic data structures`, `sketch algorithms`, `consistent hashing`, `reservoir sampling`, `space-time tradeoff`, `false positive rate`

---

## W6. 하나로는 부족하다

### 문제 상황
단일 모델의 정확도가 한계에 부딪힌다. 어떤 샘플에선 맞고 어떤 샘플에선 틀린다. 더 복잡한 모델을 쓰면 과적합된다. 돌파구는 어디에 있는가?

### 핵심 통찰
"완벽한 하나보다 불완전한 여럿의 협력이 낫다. 그리고 잔차를 학습한다는 건 실패를 데이터로 삼는 태도다."
- 시스템 설계의 본질: 단일 완벽함이 아니라 **상호 보완하는 구조**
- 주니어는 평균 정확도에 만족, 시니어는 **"어디서 틀리는가"**를 묻는다
- Boosting은 이전 모델의 잔차(오차)를 다음 모델이 학습 — 실패를 재료로 삼는 것
- 팀 구조, 시스템 redundancy, 인생의 멘토링도 같은 원리

### 수학적 형식화
- Bagging: 독립 학습된 여러 모델의 평균. 분산 감소
- Boosting: 순차 학습. 각 모델은 앞 모델의 잔차에 집중
- Gradient Boosting: 잔차 = 손실 함수의 negative gradient
- F_m(x) = F_{m-1}(x) + η × h_m(x), where h_m fits gradient

### 다루는 것 (A층)
- 결정 트리(Decision Tree)
    - 분할 기준: 지니 불순도(Gini Impurity), 정보 이득(Information Gain)
    - 과적합(Overfitting)과 가지치기(Pruning)
- 앙상블의 두 접근: 배깅(Bagging) vs 부스팅(Boosting)
- 랜덤 포레스트(Random Forest): 배깅의 대표
- 부스팅의 원리: 잔차(Residual)를 순차 학습
- Gradient Boosting의 수학: "잔차 = 손실의 negative gradient"
- XGBoost, LightGBM
    - 2차 미분(Hessian) 활용
    - 정규화 항 추가
    - 히스토그램 기반 분할

### 건드리기만 하는 것
- CatBoost의 범주형 처리
- 스태킹(Stacking), 블렌딩(Blending)
- 피처 중요도(Feature Importance)의 의미와 한계

### 안 다루는 것
- AdaBoost의 완전한 수학적 유도
- GBM 수렴 증명
- 하이퍼파라미터 튜닝 기법 세부 (Grid Search, Bayesian Optimization 세부)
- 최신 Tree-based 연구 동향

### 실무 연결
- XGBoost/LightGBM을 "감"이 아니라 근거로 튜닝
- 딥러닝 쓰기 전 강력한 베이스라인
- 피처 엔지니어링의 방향
- 시스템 redundancy 설계의 수학적 근거

### 보너스 도구 (B층)
- **B43. 중복 계산 안 한다** — Dynamic Programming
    - 부분 문제의 조합 — 앙상블의 알고리즘적 사촌
- **B2. 레이블이 없다** — K-Means, GMM
    - 레이블 없이 구조 찾기. 비지도 앙상블의 출발점

### 핵심 키워드
`ensemble learning`, `gradient boosting`, `XGBoost`, `LightGBM`, `random forest`, `bagging`, `boosting`, `decision tree`, `gini impurity`, `information gain`, `residual learning`, `stacking`

---

## W7. 개체가 아니라 연결이 중요하다

### 문제 상황
중요도를 매기고 싶다. 하지만 개체 각각의 속성만으로는 부족하다. 사용자 중 누가 영향력 있는가? 문서 중 어느 것이 권위 있는가? 개체 자체가 아니라 관계가 답일 수 있다.

### 핵심 통찰
"중요도는 개체가 아니라 관계에서 나온다. 그리고 그 관계가 반복 곱으로 수렴한다. 세상은 명사가 아니라 동사로 되어 있다."
- PageRank는 "중요한 사람이 링크한 사람이 중요하다"의 재귀적 정의
- Power Iteration으로 이 재귀를 수렴시킨다 (고유벡터 계산)
- 네트워크 효과, 평판, 조직 역학, 사회적 영향력이 모두 같은 수학
- Actionbase의 철학적 뿌리: 관계가 데이터의 본체
- 시니어는 "누가" 대신 "누구와 누구"를 본다

### 수학적 형식화
- PageRank: PR(p) = (1-d)/N + d × Σ PR(q)/L(q) for q → p
- 행렬 형태: x = (1-d)/N × e + d × M x
- Power Iteration: x_{k+1} = M x_k, 주 고유벡터로 수렴
- 수렴 조건: 확률 행렬의 스펙트럴 갭

### 다루는 것 (A층)
- 그래프의 수학: 인접 행렬(Adjacency Matrix), 차수(Degree)
- 랜덤 워크(Random Walk): 정지 분포(Stationary Distribution)
- PageRank
    - 재귀적 정의와 직관
    - Damping Factor의 의미
    - Power Iteration을 통한 계산
- Power Iteration과 고유벡터의 관계
- 수렴 증명의 직관: Perron-Frobenius 정리의 맛보기
- 네트워크 효과의 수학적 설명

### 건드리기만 하는 것
- HITS (Hub and Authority)
- Katz Centrality, Betweenness, Closeness
- 그래프 라플라시안(Graph Laplacian)

### 안 다루는 것
- Personalized PageRank의 세부 (보너스)
- 그래프 이론의 엄밀한 전개
- Spectral Graph Theory 심화
- GNN 아키텍처의 세부 (보너스)

### 실무 연결
- 추천 시스템에서의 영향력 분석
- 웹 검색의 역사적 뿌리 (Google의 기원)
- 소셜 네트워크 분석
- 의존성 그래프의 우선순위 계산
- Actionbase의 설계 원리 (관계 중심 데이터)

### 보너스 도구 (B층)
- **B15. 내가 좋아하는 것과 닮은 걸 찾는다** — Personalized PageRank
    - 개인화된 중요도. 추천 시스템의 핵심
- **B16. 그래프 자체를 벡터로** — Node2Vec, DeepWalk, GNN
    - 그래프를 임베딩으로. 관계를 학습 가능한 표현으로
- **B17. 그룹을 자동으로 찾는다** — Community Detection, Louvain
    - 조밀하게 연결된 부분 그래프
- **B18. 최단 경로를 찾는다** — Dijkstra, A*, Bellman-Ford
    - 그래프 알고리즘의 고전
- **B19. 네트워크의 한계 용량** — Min-Cut / Max-Flow
    - 쌍대성의 아름다움
- **B20. 그래프의 스펙트럼** — Spectral Graph Theory, Graph Laplacian
    - 그래프를 고유값으로 읽기
- **B21. 매칭 문제** — Stable Matching, Bipartite Matching
    - 관계의 최적 짝짓기

### 핵심 키워드
`pagerank`, `power iteration`, `random walk`, `stationary distribution`, `graph theory`, `adjacency matrix`, `eigenvector centrality`, `damping factor`, `personalized pagerank`, `network analysis`, `perron-frobenius`

---

## W8. 언제 멈출 것인가

### 문제 상황
더 좋은 선택지가 있을지 모른다. 하지만 무한히 탐색할 수 없다. 언제 멈추고 결정해야 하는가? 37%라는 숫자가 왜 나오는가?

### 핵심 통찰
"언제 멈출 것인가는 수학이 답한다. 탐색과 확정의 경계는 37%에 있다."
- Secretary Problem의 37% 해답은 증명된 최적 전략
- 집 사기, 배우자 선택, 채용, 프로젝트 마감 — 전부 같은 구조
- 주니어는 "완벽할 때까지 기다리는" 습관에 빠진다
- 시니어는 **탐색/확정 비율**을 안다. 수학적으로 정당화된 멈춤
- 이게 거의 인생철학. 의사결정의 품격을 바꿈

### 수학적 형식화
- Secretary Problem: n개 후보를 순차 관찰. n/e ≈ 37%까지 관찰만, 이후 관찰된 것보다 나은 첫 후보를 선택
- 성공 확률: 1/e ≈ 37% (n이 클 때)
- 일반화: 보상이 있는 Optimal Stopping, Odds Algorithm
- 최적성 증명: 동적 계획법 또는 후진 귀납

### 다루는 것 (A층)
- Secretary Problem
    - 문제 정의와 제약
    - 37% 규칙의 유도 (직관적으로)
    - 성공 확률 1/e의 의미
- Optimal Stopping의 일반 프레임
    - 언제든 멈출 수 있는 상황
    - 과거로 돌아갈 수 없는 제약
- 변형 문제들
    - 전체 순위가 아닌 점수 기반
    - 비용이 있는 탐색
- **실무와 삶에의 번역**
    - 채용에서의 적용
    - 구매 결정에서의 적용
    - 프로젝트 마감 결정에서의 적용
    - 커리어 결정에서의 적용

### 건드리기만 하는 것
- Online Algorithm의 프레임
- Prophet Inequality
- Odds Algorithm

### 안 다루는 것
- 전체 Optimal Stopping 이론의 수학적 엄밀성
- 연속 시간의 Optimal Stopping (Black-Scholes 등)
- Martingale 이론
- Stochastic Control

### 실무 연결
- 채용 면접 프로세스 설계
- A/B 테스트 조기 종료 결정 (W4와 연결)
- 하이퍼파라미터 탐색 멈춤 시점
- 기술 선택에서 탐색과 확정의 비율
- 구매, 결정, 커리어의 수학

### 보너스 도구 (B층)
- **B48. 미래를 모르고 결정한다** — Online Algorithm
    - Optimal Stopping의 일반화. Competitive Ratio
- **B53. 내가 바꿀 유인이 없는 상태** — Nash Equilibrium
    - 게임 이론 맛보기. 멈춤의 전략적 버전

### 핵심 키워드
`optimal stopping`, `secretary problem`, `37 percent rule`, `online algorithm`, `prophet inequality`, `odds algorithm`, `stopping time`, `exploration exploitation`

---

## W9. 시스템이 왜 느린지 모른다

### 문제 상황
시스템이 느리다. CPU 사용률은 높지 않은데 latency가 튄다. 스레드 풀 사이즈, 커넥션 풀 사이즈, 큐 사이즈를 어떻게 정해야 하는가? 감이 아니라 계산으로 답하고 싶다.

### 핵심 통찰
"L = λW. 이 곱셈 하나로 스레드풀, 커넥션 풀, 큐 사이즈, 용량 계획이 답을 낸다. 그리고 이용률 95%와 99%의 차이는 선형이 아니라 하이퍼볼릭이다."
- 성능 엔지니어링의 격언 "감이 아니라 수식"이 왜 성립하는지의 증명
- 주니어는 "서버 스케일 업"을 말하고, 시니어는 "이용률이 몇 %인지" 묻는다
- Little's Law는 거의 보편적: 분포 가정 없이 성립
- 시스템 설계는 직관이 아니라 수학

### 수학적 형식화
- Little's Law: L = λW
    - L: 시스템 내 평균 개수
    - λ: 도착률
    - W: 시스템 내 평균 체류 시간
- M/M/1 큐: 이용률 ρ = λ/μ
- 평균 대기 시간: W = 1/(μ-λ) = (1/μ) / (1-ρ)
- 이용률 폭발: ρ → 1일 때 W → ∞ (하이퍼볼릭)

### 다루는 것 (A층)
- Little's Law
    - 유도와 직관
    - 분포 가정이 거의 없는 보편성
    - "어떻게 이렇게 강력한가"
- 이용률(Utilization): ρ = λ/μ
- M/M/1 대기열 모델
    - 포아송 과정(Poisson Process)과 지수 분포
    - 평균 대기시간의 하이퍼볼릭 증가
    - "바쁜 서버는 왜 느린가" — 95% vs 99% 이용률 비교
- 서버 엔지니어링 적용
    - 스레드 풀 사이즈 계산
    - DB 커넥션 풀 사이즈
    - Kafka Consumer 튜닝
- 용량 계획(Capacity Planning)의 원리
- 암달의 법칙(Amdahl's Law) 맛보기: 병렬화의 이론적 한계

### 건드리기만 하는 것
- M/M/c (다중 서버)
- M/G/1 (일반 서비스 시간 분포)
- 대기열 네트워크(Queueing Network)
- Jackson's Theorem
- Kingman's Formula (G/G/1 근사)

### 안 다루는 것
- 큐잉 이론의 엄밀한 유도 (미분 방정식, 생성 함수)
- 대규모 대기열 시뮬레이션
- Operations Research의 다른 분야 (LP, IP)
- 성능의 다른 수학 (SIMD, 캐시)

### 실무 연결
- 스레드 풀/커넥션 풀 사이징을 계산으로 시작
- 용량 산정을 "감"이 아니라 수식으로
- 성능 병목 분석의 공용 언어
- 오토스케일링 임계값의 근거
- W1~W8의 수학을 시스템 설계에 다시 투영

### 보너스 도구 (B층)
- **B11. CPU가 벡터를 동시에 계산한다** — SIMD, Vectorization
    - 하드웨어 수준의 성능
- **B10. 캐시가 지배한다** — 캐시 지역성, Memory Hierarchy
    - Big-O 너머의 현실
- **B12. 병렬화에 한계가 있다** — Amdahl, Gustafson
    - 병렬화의 천장
- **B13. 성능의 상한을 계산한다** — Roofline Model
    - 하드웨어 스펙으로 설계 한계
- **B14. 큐 네트워크가 얽혀 있다** — Jackson's Theorem, Kingman
    - Little's Law의 확장
- **B6~B9. 분산 시스템의 수학** — CAP, CRDT, Vector Clock, Gossip
    - 분산 환경으로의 확장

### 핵심 키워드
`little's law`, `queueing theory`, `M/M/1 queue`, `utilization`, `poisson process`, `capacity planning`, `throughput`, `latency`, `amdahl's law`, `performance engineering`, `thread pool sizing`, `connection pool sizing`

---

## 의도적으로 뺀 주제들

이번 범위에서는 다루지 않는다. B층 보너스로 맛볼 수는 있음.

### 추후 후보군 (미확정, 오버뷰 목적)

**시스템의 수학** (서버/분산 심화)
- B6 CAP 정리, PACELC, CRDT
- B7 Paxos, Raft, Byzantine
- B8 Vector Clock, Lamport Timestamp
- B9 Gossip Protocol, Epidemic
- B10 캐시 지역성, Memory Hierarchy
- B11 SIMD, Vectorization
- B12 Amdahl, Gustafson
- B13 Roofline Model
- B14 Jackson's Theorem, Kingman

**관계의 수학** (그래프 심화)
- B15 Personalized PageRank
- B16 Node2Vec, DeepWalk, GNN
- B17 Community Detection, Louvain
- B18 Dijkstra, A*, Bellman-Ford
- B19 Min-Cut / Max-Flow
- B20 Spectral Graph Theory
- B21 Stable Matching

**신호와 표현**
- B22 FFT
- B23 Convolution
- B24 Wavelet Transform
- B25 Autocorrelation
- B26-30 정보이론 (Entropy, KL, MI, Huffman, Rate-Distortion)

**딥러닝 블록**
- B31 Attention
- B32 Gating, MoE
- B33 Batch/Layer/RMS Norm
- B34 Residual Connection
- B35 Dropout
- B36 Autoencoder, VAE
- B37 Contrastive Learning
- B38 Diffusion, GAN, Flow

**시계열과 상태**
- B4 Markov Chain, 상태 공간 모델
- B5 Kalman Filter, HMM
- B56-59 ARIMA, Seasonal Decomposition, DTW, Prophet

**의사결정과 게임**
- B39 MDP
- B40 Reinforcement Learning, Q-Learning
- B41 VaR, Expected Shortfall
- B42 Extreme Value Theory
- B53 Nash Equilibrium
- B54 VCG, 경매 이론
- B55 Self-play

**알고리즘 설계 심화**
- B43 Dynamic Programming 심화
- B44 Greedy 증명
- B45 Divide and Conquer, Master Theorem
- B46 Randomized Algorithms
- B47 Approximation Algorithms

**최적화 심화**
- B49 Lagrange, KKT
- B50 Newton's Method
- B51 Bayesian Optimization
- B52 Simulated Annealing, Genetic Algorithm

