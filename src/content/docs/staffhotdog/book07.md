---
title: '스태프 핫도그 #7 — Type 1 / Type 2 Error'
description: '현실의 문제는 틀리는 게 아니라 놓치는 것이다'
sidebar:
  label: '#7 — Type 1 / Type 2 Error'
  order: 7
banner:
  content: '<strong>초안</strong> · 본문은 다듬는 중입니다.'
---

<a class="ebook-launch" href="?view=book">📖 이북으로 보기</a>



## 1. 보이는 실수와 안 보이는 실수



<p>새벽 3시에 알람이 울려서 깨요. 노트북을 연다. 로그를 본다. <em>정상이었네.</em> 안도하면서 다시 잡니다.</p>

<p>이게 엔지니어가 매일 보는 실수예요. <strong>틀린 것.</strong> 알람이 울렸는데 사실이 아니었던 것. 빨간 테스트인데 멀쩡한 코드였던 것. 코드리뷰에서 잡았는데 굳이 바꿀 필요 없었던 것.</p>

<p>그런데 — <em>울리지 않은 알람도 있어요.</em> 그건 새벽에 안 깨워준다. 다음 날 매출 회의에서 누가 말합니다. <em>"어제 결제 30분 끊겼던데요."</em> 로그 어디에도 그 30분의 기록이 없다. 이게 <strong>놓친 것</strong>이에요.</p>

<p>실수는 한 종류가 아니에요. 표를 그려보면 두 칸으로 갈라집니다.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/07/fig1_quadrant.png" alt="두 종류의 실수 — 4분면"/>
</div>



### 같은 오답이 아니다



<p>이름은 옛날부터 박혀 있어요.</p>

<ul>
<li><strong>Type 1 (틀린 것)</strong> — 없는데 있다고 한 것. 정상인데 알람 울린 것. 안 아픈데 진단 받은 것.</li>
<li><strong>Type 2 (놓친 것)</strong> — 있는데 없다고 한 것. 진짜 터졌는데 울리지 않은 것. 아픈데 못 잡은 것.</li>
</ul>

<div class="callout callout-amber">
<p class="callout-title">이름이 어려워 보이지만</p>
<p>통계 책을 펴면 가설검정·유의수준·p-value가 줄줄이 나옵니다. 그건 차차 보면 돼요. 이 회차에서 쓸 건 위 4분면 표 한 장이에요. <em>이름은 부르려고 박는 거고, 머리에 남길 건 표예요.</em></p>
</div>

<p>이 두 칸을 줄이는 싸움에 또 이름이 있어요. Precision과 Recall.</p>

<blockquote>
<p><strong>Precision은 Type 1을 줄이는 일. Recall은 Type 2를 줄이는 일.</strong></p>
</blockquote>

<p>이름은 부를 일이 있을 때만 부르고, 머리에는 <em>"틀린 걸 줄이느냐, 놓친 걸 줄이느냐"</em>만 박습니다. 이걸로 1장 끝.</p>



## 2. 엔지니어는 왜 Type 1만 보는가



<p>답은 단순해요. <strong>Type 1은 로그에 찍히고 Type 2는 안 찍힙니다.</strong></p>

<p>울린 알람은 슬랙에 박힌다. 잡힌 버그는 JIRA에 남는다. 빨간 테스트는 CI에 빨갛게 뜬다. <em>눈에 보이고, 손에 잡히고, 닫을 수 있다.</em> 엔지니어가 하루 종일 처리하는 게 이거예요.</p>

<p>울리지 않은 알람은요? 그건 어디에도 없습니다. 안 잡힌 버그는 JIRA에 안 들어와요. 빠뜨린 케이스는 테스트에 없으니까 빨갛지도 않다. <em>없는 것의 흔적이 어디 남겠어요.</em></p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/07/fig2_visible.png" alt="Type 1은 슬랙·JIRA·CI에 박힌다, Type 2는 흔적 없음"/>
</div>

<div class="callout callout-teal">
<p class="callout-title">"이거 왜 알람 안 울렸지?"</p>
<p>사고 회고에서 가장 자주 나오는 한 줄이에요. Type 2를 <em>사후에야</em> 만지게 되는 거예요. 그때까지 그건 우리한테 존재하지 않는 실수였습니다.</p>
</div>



### 관점이 다르면 보이는 게 다르다



<p>리더 관점에선 다른 게 보입니다. 같은 회사인데, 그 관점에선 P&amp;L이 먼저 들어와요.</p>

<p>놓친 고객. 놓친 결제. 놓친 사기 탐지. 놓친 추천 클릭. 이건 로그엔 없지만 <strong>매출 보고서엔 있어요.</strong> 거기 그게 <em>비어있는 칸</em>으로 찍혀 있습니다.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/07/fig3_seats.png" alt="엔지니어 관점 vs 리더 관점"/>
</div>

<p>그래서 리더는 자꾸 Type 2를 묻는다. <em>놓친 게 얼마인가요.</em> 엔지니어 관점에선 안 보이는 걸 묻고 있는 거예요. 가르치려는 게 아니라 — 관점이 다른 거예요.</p>

<p>그런데 결국 같은 회사예요. 그리고 — <em>내 월급은 매출에서 나옵니다.</em></p>

<div class="callout callout-purple">
<p class="callout-title">둘 다 봐야 한다</p>
<p>Precision만 보면 알람을 안 울리는 게 가장 안전해진다. Recall만 보면 다 울리는 게 가장 안전해진다. 둘 다 100%는 못 가요. <em>둘이 어디서 만나야 하는가</em>를 정하는 게 엔지니어링이고, 그 지점은 매출이 정합니다.</p>
</div>

<p>그리고 — <em>Type 2는 사고에만 있는 게 아니에요.</em> 평소에도 있습니다. 매일 우리가 못 닿은 트래픽, 못 띄운 추천, 못 보낸 푸시. 사고처럼 터지지 않으니까 더 안 보여요. 다음 장에서 그 평소의 Type 2가 어떻게 매출과 만나는지.</p>



## 3. 모델 2배, 매출 0.1



<p>회의실. 엔지니어가 자료를 띄웁니다.</p>

<blockquote><p><em>"추천 모델 정확도 2배 개선했어요. CTR 5% → 10%."</em></p></blockquote>

<p>박수 쳐도 될 자리. 그런데 리더가 묻습니다.</p>

<blockquote><p><em>"매출은 얼마 늘었어요?"</em></p></blockquote>

<p>2주 뒤 답이 나옵니다. <strong>+0.3%.</strong></p>

<p>엔지니어는 갸웃합니다. <em>왜? 2배 좋아졌는데.</em></p>



### 면적이 곱해진다



<p>모델이 일하는 지면이 정해져 있어요. 추천이 노출되는 자리, 그 자리에 닿는 트래픽. 그 위에서 정확도를 2배 올린 것. <em>닿지 않는 트래픽은 2배의 영향을 안 받습니다.</em> 좁은 면적의 2배는 그래도 좁다.</p>

<p>같은 한 달을 다르게 써본다고 합시다. <em>"추천을 받지 못하던 자리에 어떻게든 추천을 띄우자."</em> CTR이 1.0%였던 자리가 <strong>1.1%</strong>만 돼도 — 새로 닿은 트래픽 <em>전체</em>에서 0.1%p가 매출로 들어옵니다.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/07/fig4_area.png" alt="2배 × 좁음 vs 0.1배 × 넓음"/>
</div>

<blockquote>
<p><strong>Precision은 지면 안에서 잘하는 일. Recall은 지면 자체를 넓히는 일.</strong><br/>
2배 × 좁음 &lt; 0.1배 × 넓음.</p>
</blockquote>

<div class="callout callout-purple">
<p class="callout-title">"잘할 수 있는 데 집중하자"의 함정</p>
<p>엔지니어는 본능적으로 <em>가능한 최선</em>을 만듭니다. 보이는 지면을 더 정확하게, 더 똑똑하게. 통제 가능한 자리니까요. 그런데 그 자리가 매출의 5%만 닿는다면, 거기서의 2배는 매출의 5%만 움직입니다. <em>덜 익숙한 지면을 어떻게든 넓히는 일 — recall을 올리는 일 — 이 매출에 훨씬 가까워요.</em></p>
</div>



### 추천만 그런가



<p>채용. 광고. 사기 탐지. 장애 감지. 검색. 전부 같은 구조예요. <em>좁은 지면의 정밀도</em>와 <em>넓은 지면의 도달률</em> 사이의 선택. 어느 쪽이 매출에 가까운가는 그때그때 다르지만, 한 가지는 같다.</p>

<p>Type 1(틀린 것)은 <em>지면 안</em>의 실수. Type 2(놓친 것)는 <em>지면 밖</em>에 있는 실수. 엔지니어가 매일 만지는 건 지면 안. 그런데 매출의 대부분은 지면 밖에 있다.</p>

<p>2배보다 0.1이 더 좋을 수 있다 — <em>그 0.1이 닿는 면적이 충분히 넓다면.</em></p>



## 닫는 글



<p>한 입 분량 끝. 정리는 세 줄.</p>

<ol>
<li><strong>모든 실수는 같지 않다.</strong> Type 1은 없는데 있다고 한 것, Type 2는 있는데 없다고 한 것. 같은 오답이 아니다.</li>
<li><strong>Precision은 틀린 걸 줄이고, Recall은 놓친 걸 줄인다.</strong> Type 1은 로그에 찍히고 Type 2는 안 찍힌다. 그래서 엔지니어는 Type 1만 본다.</li>
<li><strong>2배 개선이 0.1보다 작을 수 있다.</strong> 좁은 지면의 완벽보다 넓은 지면의 한 칸이 매출에 가깝다. <em>내 월급은 매출에서 나온다. 매출은 놓친 데서 샌다.</em></li>
</ol>

<p>이 세 줄이 머리에 남았다면 한 핫도그 잘 드신 거예요. 다음에 새벽 알람에 깼다가 안도할 때, <em>울리지 않은 알람</em>이 한 번쯤 떠오를 겁니다.</p>



### 더 깊이 가고 싶다면



<ul>
<li><strong>원전</strong> — Jerzy Neyman &amp; Egon Pearson, <em>"On the Problem of the Most Efficient Tests of Statistical Hypotheses"</em>, 1933. Type 1·Type 2 에러라는 개념 자체가 이 논문에서 정식화됐다. 통계 강의로 가지 말고 정의의 출처만 확인하는 용도로.</li>
<li><strong>실전</strong> — Google, <em>"Rules of Machine Learning"</em> (rules-of-ml). 특히 Rule #14, #29, #36. ML 시스템에서 정밀도와 도달률(=지면)을 어떻게 절충하는지에 대한 현장 노트. <code>developers.google.com/machine-learning/guides/rules-of-ml</code>.</li>
<li><strong>맥락</strong> — Andrew Grove, <em>"High Output Management"</em> 1·5장. "산출물은 면적의 곱"이라는 매니지먼트 관점. 엔지니어 자리에서 리더 자리로 시야를 넓히는 한 권.</li>
</ul>

<div class="closing">
<div class="closing-mark">*&#160;*&#160;*</div>
<em>스태프 핫도그 #7 — Type 1 / Type 2 Error</em>
<em>다음 핫도그에서 만나요.</em>
</div>
