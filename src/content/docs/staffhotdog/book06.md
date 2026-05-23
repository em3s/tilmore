---
title: '스태프 핫도그 #6 — Multi-Armed Bandit'
description: '전부 볼 수 없다'
sidebar:
  label: '#6 — Multi-Armed Bandit'
  order: 6
banner:
  content: '<strong>초안</strong> · 본문은 다듬는 중입니다.'
---

<a class="ebook-launch" href="?view=book">📖 이북으로 보기</a>



## 1. 전부 볼 수 없다



<p>모든 통계의 출발점은 같은 자리예요. <strong>전부 볼 수 없다.</strong> 사용자가 1억 명이면 1억 명을 다 못 부른다. 측정장치라도 모든 순간을 다 못 잰다. 그래서 일부를 보고 전체를 말한다.</p>

<p>이게 "찍어보는 거"라는 느낌을 주지만 — 사실 그 반대예요. <em>샘플은 모수를 정확히 말합니다.</em> 단, 자신이 얼마나 정확하게 말하는지를 같이 알 때만.</p>

<div class="callout callout-blue">
<p class="callout-title">"전수조사"라는 강박</p>
<p>1억 명 응답을 다 모으면 진실이고, 1000명은 추측이다 — 이 직관이 너무 강해서 종종 시간과 비용을 다 태워가며 전수조사를 추구합니다. 그런데 1000명만 잘 뽑아도 1억 명 응답 비율의 95% 신뢰구간이 <strong>±3%</strong> 수준이에요. 표본의 힘이 직관보다 훨씬 셉니다.</p>
</div>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/06/fig1_sampling.png" alt="모집단과 샘플"/>
</div>



### CLT — 평균의 마법



<p>중심극한정리(Central Limit Theorem). 한 줄로:</p>

<blockquote>
어떤 분포에서든, n개를 뽑아 평균을 내는 작업을 여러 번 반복하면, <em>평균들의 분포</em>는 정규분포로 수렴한다.
</blockquote>

<p>원본 분포는 한쪽으로 치우쳐도 좋고(skewed), 다중 봉우리여도 좋고, 균일해도 좋다. <strong>평균을 내는 순간 정규분포가 나옵니다.</strong> 마법이에요.</p>

<p>단, 조건 하나 — <em>분산이 유한할 때</em>. latency처럼 꼬리가 두꺼운(heavy-tail) 분포는 평균 수렴이 느리고 평균이 대표값 노릇을 못 해요. #5에서 latency를 평균이 아니라 p99로 본 이유가 이겁니다.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/06/fig2_clt.png" alt="CLT — 어떤 분포에서든 평균은 정규분포로"/>
</div>

<p>왜 이게 중요한가 — 정규분포는 우리가 가장 잘 아는 분포입니다. 표준편차, 신뢰구간, 가설 검정의 모든 도구가 정규분포에 맞춰져 있어요. 모집단이 어떤 모양인지 몰라도 <em>샘플 평균</em>을 다루는 한 정규분포의 무기를 그대로 쓸 수 있다는 뜻.</p>



### 신뢰구간 — 모수를 향한 화살



<p>샘플 평균 하나로 모평균을 못 박지만, <em>얼마나 가까이</em> 있는지는 말할 수 있어요. 그게 신뢰구간.</p>

<pre><code>모평균 ≈ 샘플평균 ± z × (σ / √n)</code></pre>

<p>95% 신뢰구간이면 z ≈ 1.96. <em>"같은 방식으로 100번 샘플링하면 95번은 모평균이 이 구간 안"</em>이라는 뜻. 핵심은 분모의 <code>√n</code> — 다음 장의 모든 비용이 여기서 나옵니다.</p>



## 2. 확신은 비싸다



<p>1장이 토대였다면 2장은 비용 이야기입니다. <strong>확신은 공짜가 아니에요.</strong> 그 비용이 어디서 오는지가 A/B 테스트와 가설 검정의 본질.</p>



### √n의 저주



<p>신뢰구간 폭은 <code>1/√n</code>에 비례. 즉:</p>

<ul>
<li>1차 정밀도: n = 100, 폭 = 10%</li>
<li>2배 정밀도: n = 400, 폭 = 5%</li>
<li>4배 정밀도: n = 1,600, 폭 = 2.5%</li>
<li>10배 정밀도: n = 10,000, 폭 = 1%</li>
</ul>

<p>정확도가 산술급수로 늘면 비용은 기하급수로 늘어요. "한 자릿수만 더 정확하게 보고 싶다"가 <em>100배의 샘플</em>을 부르는 이유.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/06/fig3_sqrt_n.png" alt="신뢰구간이 √n에 반비례로 좁아진다"/>
</div>

<div class="callout callout-amber">
<p class="callout-title">"표본을 더 모으자"는 항상 정답이 아니다</p>
<p>실험 결과가 애매할 때 흔한 반응이 "데이터 더 모으자." 맞을 수도 있지만, <em>비용을 계산하고 결정</em>해야 합니다. 95%에서 99%로 가려면 약 1.7배 샘플이 필요해요. 그 사이 잃는 시간·트래픽·기회비용을 감수할 만한가? 종종 답은 No.</p>
</div>



### 가설 검정 — 우연일 확률



<p>두 그룹의 평균이 다르게 나왔다. <em>진짜 다른 건가, 우연일 뿐인가?</em> 이걸 통계 언어로 옮긴 게 가설 검정이에요. "둘은 같다(H0)"를 깔고, 관측된 차이가 <strong>H0가 참인데도 우연히 나올 확률</strong>을 잰다 — 그게 <strong>p-value</strong>.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/06/fig4_pvalue.png" alt="H0 분포 위 관측값과 p-value 꼬리"/>
</div>

<p>p-value가 0.03이면 "H0가 맞는데도 이런 차이가 나올 확률이 3%"라는 얘기. 작을수록 H0를 의심하게 됩니다. 0.05 미만이면 보통 H0 기각 — "유의하다." 그러나 이건 <em>약속</em>이지 <em>진리</em>가 아니에요. 5%는 여전히 우연이 만들어내는 차이.</p>



### A/B 테스트의 그림자



<p>A/B 테스트는 이 절차의 한 모양입니다. 사용자를 반반 나누고, 한 쪽엔 A 다른 쪽엔 B를 보여주고, 충분한 샘플이 모일 때까지 기다린 뒤 t-test나 카이제곱으로 p-value를 본다.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/06/fig5_ab_static.png" alt="A/B 테스트의 정적 의사결정 사이클"/>
</div>

<p>이 흐름의 가장 큰 비용은 <strong>"결정"과 "행동"이 분리</strong>되어 있다는 점이에요. 실험 2주 → p-value 계산 → 결정 회의 → 배포. 한 사이클이 끝나야 다음이 시작. 그리고 다음 variant가 또 기다리고 있다.</p>

<p>variant가 한두 개일 땐 괜찮아요. 그런데 시스템이 매일 수십 개 variant를 만들어내면? <em>결정이 병목</em>이 됩니다. 그러면 통계의 답을 다른 모양으로 써야 해요.</p>



## 3. 움직이면서 배운다 — Multi-Armed Bandit



<p>슬롯머신 비유에서 이름이 왔어요. <em>여러 슬롯머신(arm) 앞에 앉아 있고, 각 머신의 보상 확률을 모른다. 제한된 시간 안에 최대 보상을 얻는 전략은?</em></p>

<p>두 선택지가 있죠. <strong>탐색(Exploration)</strong> — 새 머신 당겨보기, 정보를 늘림. <strong>활용(Exploitation)</strong> — 지금까지 좋아 보였던 머신 계속 당기기, 보상을 늘림. 둘 사이의 균형을 잡는 것 = MAB.</p>

<p>A/B 테스트와 결정적으로 다른 지점은 — <em>실험과 결정이 분리되어 있지 않다.</em> 매 trial마다 학습하고 즉시 다음 선택에 반영. <strong>움직이면서 배운다.</strong></p>



### 세 알고리즘



<div class="figure">
<img src="/tilmore/staffhotdog/assets/06/fig6_three_algos.png" alt="ε-greedy, UCB, Thompson Sampling 비교"/>
</div>

<table>
<thead>
<tr><th>알고리즘</th><th>아이디어</th><th>특징</th></tr>
</thead>
<tbody>
<tr><td><strong>ε-greedy</strong></td><td>ε 확률로 무작위, 1-ε 확률로 현재 최선</td><td>가장 단순. ε 튜닝이 어렵다.</td></tr>
<tr><td><strong>UCB</strong></td><td>각 arm의 평균 + 불확실성 보너스 → 최댓값 arm 선택</td><td>"낙관적 선택." 시도 적은 arm을 자연스럽게 격려.</td></tr>
<tr><td><strong>Thompson</strong></td><td>각 arm의 사후 분포에서 샘플 → 가장 큰 샘플의 arm 선택</td><td>베이지안. 실전 성능이 가장 좋다고 알려져 있음.</td></tr>
</tbody>
</table>

<p>셋 다 같은 일을 해요. <em>불확실한 arm에는 더 자주 가보고, 확실해진 arm은 그에 비례해서 본다.</em> 정적 A/B는 모두에게 정확히 50% 트래픽; MAB는 trial이 쌓일수록 좋은 arm으로 비중을 옮긴다.</p>



### Linear combination 계수 자동 튜닝



<p>variant가 단순한 A/B 선택이 아니라 <em>여러 신호의 가중합</em>이라면 어떡할까. 추천 점수가 <code>w1·signal_A + w2·signal_B + w3·signal_C</code>인데, 가중치 <code>w</code>를 어떻게 정할 것인가.</p>

<p>가중치 조합 몇 개를 arm으로 두면 MAB가 자동으로 좋은 조합을 찾아갑니다. Thompson Sampling 한 바퀴를 손으로 돌려보죠.</p>

<pre><code>import numpy as np

# arm = 가중치 조합 후보 3개
arms = [
    (0.6, 0.3, 0.1),
    (0.4, 0.4, 0.2),
    (0.2, 0.5, 0.3),
]

# 각 arm의 사후 분포 파라미터 (Beta: 성공/실패)
alpha = np.ones(len(arms))
beta_ = np.ones(len(arms))

def reward(arm_idx):
    # 진짜 보상 확률 (실제론 알 수 없음)
    true_p = [0.30, 0.45, 0.35][arm_idx]
    return 1 if np.random.rand() &lt; true_p else 0

for t in range(10_000):
    # 1. 각 arm의 사후 분포에서 샘플
    samples = np.random.beta(alpha, beta_)
    # 2. 가장 큰 샘플의 arm 선택
    chosen = np.argmax(samples)
    # 3. 보상 관찰
    r = reward(chosen)
    # 4. 분포 업데이트
    alpha[chosen] += r
    beta_[chosen] += (1 - r)

print(alpha / (alpha + beta_))
# [0.30, 0.45, 0.35] 근처 — 실제 분포에 수렴
</code></pre>

<p>10,000번의 trial 동안 정적 A/B처럼 균등 분배하지 않습니다. 좋은 arm이 빨리 식별되면 그쪽에 트래픽이 몰리고, 애매하면 계속 탐색. <em>결정과 행동이 한 루프 안에서</em>.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/06/fig7_auto_tune.png" alt="가중치 조합 자동 튜닝"/>
</div>

<div class="callout callout-teal">
<p class="callout-title">A/B는 도구다, 목적이 아니다</p>
<p>전통 A/B 시스템이 어려운 이유는 <em>A/B 자체가 목적</em>이 되기 때문이에요. variant마다 가설 → 실험 → 결정 한 사이클을 돌아야 함. 시스템이 매일 새 variant를 만들어내면 절차가 못 따라옵니다. <strong>A/B의 역할은 "결정"이 아니라 "신호"</strong>. MAB는 그 신호를 즉시 받아 다음 선택에 쓰는, A/B를 도구로 격하시킨 구조예요. 그래서 살아남는다.</p>
</div>



### 그래서 언제 무엇을



<p>A/B와 MAB는 적이 아니라 도구 두 개입니다. 상황에 따라 골라 써야 해요.</p>

<ul>
<li><strong>A/B가 맞는 자리</strong> — 한 번 결정하면 오래 가는 변경. 가격 정책, 핵심 UX 패턴. 통계적으로 확실한 결론이 필요한 자리.</li>
<li><strong>MAB가 맞는 자리</strong> — variant가 끝없이 나오는 자리. 추천, 랭킹, 광고. <em>"이 variant가 좋다"보다 "지금 좋은 variant를 빨리 띄우자"가 중요할 때.</em></li>
</ul>

<p>액션이 가변적이고 보상이 즉시 관측 가능한 모든 시스템은 결국 MAB나 그 확장(Contextual Bandit, RL)으로 갑니다. 정적 A/B는 그 흐름의 한 출발점일 뿐이에요.</p>



## 닫는 글



<p>한 입 분량 끝. 정리는 세 줄.</p>

<ol>
<li><strong>샘플은 모수를 말한다.</strong> CLT가 그걸 가능하게 만든다. 전수조사 강박을 버려라.</li>
<li><strong>확신은 비싸다.</strong> 신뢰구간 폭은 1/√n. 정확도 2배에 샘플 4배. "더 모으자"는 항상 정답이 아니다.</li>
<li><strong>확신을 기다리지 마라. 움직이면서 배워라.</strong> A/B가 목적이 되면 죽는다. MAB는 A/B를 도구로 격하시킨 구조.</li>
</ol>

<p>이 세 줄이 머리에 남았다면 한 핫도그 잘 드신 거예요. 다음 variant를 띄울 때 "2주 실험"이 아니라 "Thompson 한 바퀴"가 먼저 떠오를 겁니다.</p>



### 더 깊이 가고 싶다면



<ul>
<li><strong>원전</strong> — Herbert Robbins, <em>"Some Aspects of the Sequential Design of Experiments"</em>, 1952. Multi-Armed Bandit이라는 문제 설정이 처음 정식화된 짧은 고전.</li>
<li><strong>실전</strong> — Russo et al., <em>"A Tutorial on Thompson Sampling"</em>, 2018. Thompson Sampling의 직관과 구현을 한 권으로 정리. <code>arxiv.org/abs/1707.02038</code>.</li>
<li><strong>맥락</strong> — Sutton &amp; Barto, <em>"Reinforcement Learning: An Introduction"</em> 2장. MAB가 강화학습으로 어떻게 확장되는지 — Bandit은 시작점일 뿐.</li>
</ul>

<div class="closing">
<div class="closing-mark">*&#160;*&#160;*</div>
<em>스태프 핫도그 #6 — Multi-Armed Bandit</em>
<em>다음 핫도그에서 만나요.</em>
</div>
