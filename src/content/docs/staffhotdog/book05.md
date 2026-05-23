---
title: '스태프 핫도그 #5 — Benchmark'
description: '천장이 아니라 무너지는 지점을 찾아라'
sidebar:
  label: '#5 — Benchmark'
  order: 5
banner:
  content: '<strong>초안</strong> · 본문은 다듬는 중입니다.'
---

<a class="ebook-launch" href="?view=book">📖 이북으로 보기</a>



## 1. "이 서버 몇 RPS 받아요?"가 오답인 이유



<p>BMT 결과를 들고 누가 묻습니다. <em>"이 서버 몇 RPS 받아요?"</em> 가장 흔한 질문이고, 가장 자주 빗나가는 질문이에요. 답하기 전에 한 발 물러서야 합니다.</p>

<p>왜냐하면, <strong>RPS 숫자 하나로 BMT를 요약하는 순간 결과의 8할이 버려지기 때문</strong>이에요. 같은 서버가 RPS 1,000도 받고, 2,000도 받고, 5,000도 받습니다. 단, latency가 100ms → 1초 → 30초로 늘어나면서.</p>

<div class="callout callout-blue">
<p class="callout-title">한 숫자가 위험한 이유</p>
<p>"이 서버 최대 RPS 3,000입니다"는 사실 <em>"RPS 3,000에서 latency가 30초였습니다"</em>의 줄임말. 그런데 30초 latency는 production에서 죽은 서버예요. "받는다"의 의미를 <strong>latency까지 묶어서</strong> 정의해야 합니다.</p>
</div>



### Throughput과 Latency는 한 곡선의 양면



<p>핵심 통찰을 한 줄로 박으면 이거예요.</p>

<blockquote><p>처리량을 올리면 응답시간이 올라간다. 단, 선형이 아니라 <strong>하이퍼볼릭</strong>하게.</p></blockquote>

<p>그림으로 보면 한방에 잡힙니다.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/05/fig1_knee_curve.png" alt="throughput vs latency knee curve"/>
</div>

<p>처음엔 RPS를 올려도 latency가 거의 그대로예요. 서버가 여유 있으니까. 그러다 어느 지점부터 latency가 <em>살짝</em> 올라가기 시작합니다. 그리고 그 지점을 조금만 더 넘으면 — <strong>수직으로 폭발</strong>해요.</p>

<p>그 꺾이는 점. 그게 <strong>knee point</strong>입니다.</p>



### 진짜 물어야 할 질문



<p>그러니까 BMT가 답해야 할 진짜 질문은 "최대 RPS가 얼마인가"가 아닙니다.</p>

<ul>
<li><strong>knee가 어디인가</strong> — RPS 얼마부터 latency가 폭발하는가</li>
<li><strong>SLA 안에서 받을 수 있는 RPS는 얼마인가</strong> — "p99 200ms" 같은 제약을 만족하면서</li>
<li><strong>곡선의 모양이 어떤가</strong> — 천천히 무너지는가, 절벽인가</li>
</ul>

<p>한 숫자가 아니라 <em>곡선 한 장</em>. BMT의 결과물은 그래야 합니다.</p>

<p>그런데 이 곡선이 왜 하필 이 모양인가 — 우연이 아니에요. 수학이 시키는 일입니다. 다음 장에서.</p>



## 2. 왜 그 모양인가 (수학 한 스푼)



<p>이 곡선이 왜 하필 하이퍼볼릭인가. 60년 된 한 정리에서 시작합니다.</p>



### Little's Law — `L = λW`



<p>1961년 MIT의 John Little이 증명한 한 줄짜리 정리.</p>

<blockquote><p>시스템 안에 있는 평균 개수 <code>L</code> = 도착률 <code>λ</code> × 평균 체류 시간 <code>W</code></p></blockquote>

<p>식만 보면 당연한 말 같지만, 이게 무서운 이유는 <strong>가정이 거의 없다</strong>는 점이에요. 도착 분포가 어떻든, 서비스 시간이 어떻든, 시스템이 안정 상태(stable)이기만 하면 무조건 성립.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/05/fig2_littles_law.png" alt="Little's Law 도식"/>
</div>

<div class="callout callout-purple">
<p class="callout-title">분포에 묶이지 않는다는 사실</p>
<p>대부분의 큐잉 정리는 "도착이 포아송이고 서비스 시간이 지수분포라면..." 같은 전제가 붙어요. Little's Law는 그런 게 없습니다. <em>임의의 안정된 시스템 — 카페, 콜센터, HTTP 서버, Kafka consumer — 다 적용.</em> 그래서 성능 엔지니어링의 공용 언어가 된 거예요.</p>
</div>



### 이용률 ρ과 폭발



<p>여기서 한 발 더. 서버가 초당 <code>μ</code>개 요청을 처리할 수 있고(서비스율), 초당 <code>λ</code>개가 도착한다면 <strong>이용률</strong>은:</p>

<pre><code>ρ = λ / μ</code></pre>

<p>ρ가 0.5면 서버가 절반 바쁘다는 뜻, 0.9면 90% 바쁘다는 뜻. ρ가 1을 넘으면? 도착이 처리보다 빠르니까 큐가 끝없이 쌓입니다 — 시스템 붕괴.</p>

<p>M/M/1 큐(가장 단순한 모델)에서 평균 체류 시간은:</p>

<pre><code>W = (1/μ) / (1 − ρ)</code></pre>

<p>ρ가 1에 가까워질수록 분모가 0에 가까워져요. 그래서 W가 <strong>하이퍼볼릭하게</strong> 폭발합니다.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/05/fig3_utilization_curve.png" alt="이용률 vs 응답시간 곡선"/>
</div>

<p>1장의 knee curve가 사실 이 그림이었어요. x축이 RPS가 아니라 이용률 ρ였을 뿐. RPS는 λ, latency는 W. <em>같은 곡선의 두 얼굴.</em></p>



### 95% vs 99% — 다른 세계



<p>이 곡선이 충격적인 이유는 한 예제에서 드러납니다. 서버가 평균 100ms에 한 요청 처리한다고 합시다 (μ = 10/s, 1/μ = 100ms).</p>

<table>
<thead>
<tr><th>이용률 ρ</th><th>1 − ρ</th><th>평균 체류시간 W</th></tr>
</thead>
<tbody>
<tr><td>50%</td><td>0.5</td><td>200 ms</td></tr>
<tr><td>80%</td><td>0.2</td><td>500 ms</td></tr>
<tr><td>95%</td><td>0.05</td><td><strong>2,000 ms</strong></td></tr>
<tr><td>99%</td><td>0.01</td><td><strong>10,000 ms</strong></td></tr>
</tbody>
</table>

<p>95%와 99% — <em>이용률은 4%p 차이</em>인데 latency는 <strong>5배</strong>예요.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/05/fig4_95_vs_99.png" alt="95% vs 99% 비교"/>
</div>

<div class="callout callout-amber">
<p class="callout-title">바쁜 서버는 왜 느린가</p>
<p>"CPU 99% 쓰고 있으니 효율적이다"는 운영자 입장에선 칭찬이지만, latency 입장에선 재앙. <em>큐에 줄 서는 시간이 처리 시간의 100배가 됩니다.</em> 그래서 prod에서는 보통 50~70%를 목표로 두고, 그 위로 가면 알람을 울려요. 이용률을 짜내는 게 항상 미덕은 아닙니다.</p>
</div>

<p>이게 "knee가 왜 거기인가"의 답이에요. 수학적으로, ρ가 80%를 넘는 순간부터 곡선이 가팔라지기 시작합니다. 그 위는 손가락 하나 차이로 latency가 두 배.</p>



## 3. 곡선을 그리는 법



<p>이제 BMT를 실제로 어떻게 돌려야 곡선이 나오는지. 어떤 부하 테스트 도구를 쓰든 원리는 같아요.</p>



### Ramp-up — 한 번에 쏘지 마라



<p>가장 흔한 실수: 처음부터 VU(virtual user) 1,000을 쏜다. 결과는?</p>

<ul>
<li>서버가 0초부터 과부하 → 모든 요청이 큐에 쌓임</li>
<li>응답시간이 처음부터 30초 — 곡선이 아니라 <em>벽</em></li>
<li>knee가 어디인지 알 수 없음</li>
</ul>

<p>대신 VU를 <strong>단계적으로</strong> 올립니다. 50 → 100 → 200 → 400 → 800 → 1,600 ... 각 단계에서 3~5분 유지하면서 RPS와 latency를 측정.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/05/fig5_ramp_up.png" alt="ramp-up scenario"/>
</div>

<div class="callout callout-teal">
<p class="callout-title">왜 단계적이어야 하는가</p>
<p>곡선을 그리려면 <em>여러 점</em>이 필요해요. VU 1,000 한 점으로는 직선도 그릴 수 없습니다. 단계마다 시스템이 안정 상태(stable)에 도달하길 기다린 뒤 측정 — 그래야 그 점이 <em>진짜 그 부하의 응답시간</em>을 반영합니다.</p>
</div>



### 4숫자만 잘 봐라



<p>부하 테스트 도구 대시보드엔 별별 숫자가 다 나와요. 본질은 네 개입니다.</p>

<ul>
<li><strong>RPS (TPS)</strong> — 초당 처리한 요청 수. <em>달성 throughput.</em></li>
<li><strong>p50 latency</strong> — 평균이 아니라 중앙값. 평균은 outlier에 휘둘리니까.</li>
<li><strong>p99 latency</strong> — 99%의 요청이 이 시간 이하에 끝난다. <em>이게 SLA의 기준.</em></li>
<li><strong>error rate</strong> — 실패율. 0%가 아니면 이미 무너진 거.</li>
</ul>

<p>이 네 개를 단계별로 표로 정리하면 곡선이 나옵니다. 나머지 지표(throughput per VU, mean test time 등)는 이 네 개를 보조할 때만 의미.</p>



### Knee 판정법



<p>곡선이 그려졌다 — 그럼 knee가 어디인지 어떻게 알까. RPS와 latency 두 곡선을 겹쳐서 봐요.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/05/fig6_knee_detection.png" alt="knee 판정"/>
</div>

<p>VU를 올렸는데:</p>

<ul>
<li><strong>RPS가 같이 올라가고 latency는 거의 그대로</strong> → 아직 여유 있음. 계속 올려도 됨.</li>
<li><strong>RPS가 평평해지기 시작하고 latency가 슬슬 올라간다</strong> → <strong>knee 근처</strong>. 여기가 진짜 capacity.</li>
<li><strong>RPS는 그대로인데 latency만 폭발 + error 발생</strong> → 이미 knee 넘었음. 시스템 무너지는 중.</li>
</ul>

<p>SLA를 더하면 답이 자동으로 나옵니다. <em>"p99가 200ms를 넘지 않는 RPS의 최댓값"</em> — 그게 이 서버의 <strong>유효 capacity</strong>예요. 그 위의 RPS는 "받긴 받지만 못 쓰는" 영역.</p>



### 한 줄로



<blockquote><p>BMT는 곡선을 그리는 일이다. 점 하나를 찾는 일이 아니라.</p></blockquote>

<p>점 하나 — "최대 RPS" — 는 결과의 <em>극히 일부</em>만 담아요. 곡선 한 장이 있어야 의사결정이 가능합니다. capacity planning, scale 시점, SLA 협상, autoscaling 임계값 — 다 곡선 위의 어느 한 점을 선택하는 일.</p>



## 닫는 글



<p>한 입 분량 끝. 정리는 세 줄.</p>

<ol>
<li><strong>BMT는 천장이 아니라 무너지는 지점을 찾는 일.</strong> "최대 RPS"는 거의 무의미한 숫자. knee가 어디인지가 진짜 답.</li>
<li><strong>Little's Law <code>L = λW</code>와 이용률 폭발이 이유.</strong> ρ가 1에 가까워지면 W는 하이퍼볼릭하게 폭발. 95%와 99%는 다른 세계.</li>
<li><strong>곡선을 그려라.</strong> VU를 단계적으로 올리고 4숫자(RPS·p50·p99·error)를 본다. SLA를 만족하는 최대 RPS — 그게 capacity.</li>
</ol>

<p>이 세 줄이 머리에 남았다면 한 핫도그 잘 드신 거예요. 다음 BMT 결과를 들고 회의에 들어갈 때, "최대 RPS" 한 숫자가 아니라 <em>곡선 한 장</em>을 들고 들어가게 될 겁니다.</p>



### 더 깊이 가고 싶다면



<ul>
<li><strong>원전</strong> — John D.C. Little, <em>"A Proof for the Queuing Formula: L = λW"</em>, Operations Research 1961. 6쪽짜리 짧은 증명. 이 모든 것의 시작.</li>
<li><strong>실전</strong> — Brendan Gregg, <em>"Systems Performance: Enterprise and the Cloud"</em>. 특히 USE method 절. 이용률·포화도·에러로 시스템을 진단하는 프로토콜.</li>
<li><strong>맥락</strong> — Neil Gunther, <em>"Guerrilla Capacity Planning"</em>. capacity 계획을 수식과 직관으로 푸는 짧은 책.</li>
</ul>

<div class="closing">
<div class="closing-mark">*&#160;*&#160;*</div>
<em>스태프 핫도그 #5 — Benchmark</em>
<em>다음 핫도그에서 만나요.</em>
</div>
