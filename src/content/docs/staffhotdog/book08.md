---
title: '스태프 핫도그 #8 — SIMD Vectorization'
description: '같은 일을 여러 개 한다면, 한 번만 시켜라'
sidebar:
  label: '#8 — SIMD Vectorization'
  order: 8
banner:
  content: '<strong>초안</strong> · 본문은 다듬는 중입니다.'
---

<a class="ebook-launch" href="?view=book">📖 이북으로 보기</a>



## 1. CPU는 생각보다 놀고 있다



<p>배열 두 개를 더한다고 해보자.</p>

<pre><code>for (int i = 0; i < n; i++) {
    c[i] = a[i] + b[i];
}</code></pre>

<p>대부분은 이 코드를 이렇게 읽습니다. <em>1개 읽고, 1개 더하고, 1개 저장한다.</em> 그리고 n번 반복.</p>

<p>틀린 말은 아니에요. 하지만 CPU 입장에서 보면 — <strong>너무 쉬운 일</strong>입니다. ALU는 놀고 있어요. 실행 유닛도 놀고 있습니다. 레지스터도 남아돌아요. 그런데 우리는 한 번에 하나만 시킵니다.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/08/fig1_carrying_boxes.png" alt="한 사람이 상자 하나씩 옮기는 것 vs 같은 사람이 상자 여덟 개를 한 번에 옮기는 것"/>
</div>

<p>일을 더 시킨 게 아닙니다. <strong>원래 들 수 있었는데 안 들고 있었던 것</strong>이에요.</p>

<div class="callout callout-purple">
<p class="callout-title">많은 개발자가 착각하는 것</p>
<p>CPU가 100% 바쁘게 일하고 있다고 생각합니다. 하지만 현대 CPU는 대부분의 시간 동안 <em>기다리거나, 파이프라인을 비우거나, 실행 유닛을 놀리고 있어요.</em> 문제는 CPU가 아닙니다. 우리가 CPU를 사용한 방식이 문제예요.</p>
</div>



### 한 번에 하나가 왜 낭비인가



<p>현대 CPU의 레지스터는 넓습니다. 128비트, 256비트, 512비트. 32비트 정수 하나를 넣으면 나머지 공간은 비어 있어요. <em>빈 좌석이 세 개인 택시를 혼자 타는 것</em>과 같습니다.</p>

<p>같은 연산을 여러 번 반복할 거라면 — 빈 좌석에 태울 수 있습니다. 한 번의 명령으로 여러 데이터를 동시에 처리하는 것. 그게 이 회차의 주제예요.</p>



## 2. 나란히 세우면 한 번에 먹는다



<p>이름이 있습니다. <strong>SIMD</strong>. Single Instruction, Multiple Data. 한 번의 명령. 여러 개의 데이터.</p>



### 스칼라 vs 벡터



<p>일반 코드는 이렇게 계산합니다.</p>

<pre><code>1 + 2 → 3     (1번째 명령)
3 + 4 → 7     (2번째 명령)
5 + 6 → 11    (3번째 명령)
7 + 8 → 15    (4번째 명령)</code></pre>

<p>4번의 명령. SIMD는 이렇게 합니다.</p>

<pre><code>[1, 3, 5, 7]  +  [2, 4, 6, 8]  =  [3, 7, 11, 15]</code></pre>

<p><strong>1번의 명령.</strong> 같은 결과. CPU가 갑자기 똑똑해진 게 아닙니다. 원래 있던 벡터 연산기를 사용하기 시작한 것뿐이에요.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/08/fig2_scalar_vs_simd.png" alt="스칼라 연산 4회 vs SIMD 벡터 연산 1회"/>
</div>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/08/fig3_highway.png" alt="1차선 도로에서 8차선 도로로"/>
</div>

<p>차를 더 빨리 달리게 한 것이 아닙니다. <em>차선을 넓힌 것</em>이에요.</p>



### SIMD가 좋아하는 곳



<p>SIMD가 특히 강한 영역이 있습니다.</p>

<ul>
<li>이미지 처리</li>
<li>비디오 인코딩</li>
<li>머신러닝</li>
<li>벡터 검색</li>
<li>데이터베이스 스캔</li>
<li>압축</li>
<li>암호화</li>
<li>과학 계산</li>
</ul>

<p>공통점이 있어요. <strong>같은 연산을 반복합니다.</strong> 곱하고 더하고. 곱하고 더하고. 곱하고 더하고. 데이터만 다르고 계산은 같다.</p>



### SIMD가 싫어하는 곳



<p>반대도 있습니다. <strong>분기</strong>가 많으면 어렵습니다.</p>

<pre><code>if (...) {
    ...
} else {
    ...
}</code></pre>

<p>데이터마다 다른 길을 가면 한 번에 묶을 수 없어요. <strong>데이터가 흩어져 있어도</strong> 어렵습니다.</p>

<pre><code>linkedList.next.next.next</code></pre>

<p>포인터를 따라가야 하면 나란히 세울 수 없습니다.</p>

<blockquote>
<p><strong>SIMD는 계산을 빠르게 만드는 기술이 아니라 데이터를 나란히 세우는 기술이다.</strong></p>
</blockquote>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/08/fig4_simd_friendly.png" alt="SIMD가 좋아하는 데이터 배치 vs 싫어하는 데이터 배치"/>
</div>



## 3. "Vectorized"의 진짜 뜻



<p>Python에서 이런 코드를 써봤을 거예요.</p>

<pre><code>import numpy as np

a = np.array([1.0, 2.0, 3.0, 4.0])
b = np.array([5.0, 6.0, 7.0, 8.0])
result = np.dot(a, b)</code></pre>

<p>같은 계산을 순수 Python으로 쓰면 이렇습니다.</p>

<pre><code>result = 0
for i in range(len(a)):
    result += a[i] * b[i]</code></pre>

<p>NumPy 쪽이 <em>수십 배</em> 빠릅니다. 왜?</p>



### NumPy 아래에는 C가 있다



<p><code>np.dot</code>을 호출하면 Python 인터프리터가 아니라 <strong>C로 컴파일된 라이브러리</strong>가 실행됩니다. 그리고 그 C 코드는 컴파일러가 SIMD 명령어로 바꿔놓았어요.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/08/fig5_numpy_layers.png" alt="Python loop → NumPy API → C 라이브러리 → SIMD 명령어"/>
</div>

<p>"vectorized operation"이라는 말 — <em>비유가 아닙니다.</em> 진짜로 <strong>벡터 레지스터</strong>를 써서 여러 데이터를 한 번에 처리한다는 뜻이에요. 이름이 그대로 정체를 말하고 있었습니다.</p>

<div class="callout callout-blue">
<p class="callout-title">Python loop가 느린 진짜 이유</p>
<p>Python의 <code>for</code> 루프는 매 반복마다 타입 확인, 객체 래핑, 인터프리터 오버헤드가 붙어요. NumPy는 이걸 다 건너뛰고 <em>C 레벨에서 연속된 메모리를 SIMD로 한 번에 먹습니다.</em> 느린 건 Python이 아니라, <em>한 번에 하나씩 처리하는 방식</em>이에요.</p>
</div>



### 데이터 엔지니어가 만지는 모든 곳에 있다



<p>NumPy만 그런 게 아닙니다. 데이터 엔지니어링의 핵심 도구들이 전부 같은 구조를 쓰고 있어요.</p>



### Spark Tungsten — 객체를 부수고 나란히 세운 이유



<p>Spark의 초기 버전은 JVM 객체 그래프 위에서 돌았습니다. <code>User</code> 객체 안에 <code>Profile</code>이 있고, 그 안에 <code>Address</code>가 있고. 포인터를 따라가야 데이터가 나와요.</p>

<pre><code>User → Profile → Address → City</code></pre>

<p>CPU가 싫어하는 모양이에요. 메모리가 흩어져 있고, 예측하기 어렵고, 캐시 미스가 잦습니다. SIMD는 꿈도 못 꿉니다.</p>

<p>Tungsten은 이걸 <strong>부쉈어요.</strong> 객체 그래프를 해체하고, 같은 종류의 데이터를 연속 메모리에 나란히 깔았습니다. off-heap memory에 바이트 단위로 직접 배치하고, whole-stage code generation으로 JVM 오버헤드를 건너뛰었어요.</p>

<p>한 줄로 줄이면 이것입니다.</p>

<blockquote>
<p>CPU가 좋아하는 모양으로 데이터를 다시 담았다.</p>
</blockquote>

<p>Spark가 2.0에서 갑자기 빨라진 이유 — 알고리즘을 바꾼 게 아닙니다. <em>데이터 배치를 바꿨어요.</em></p>



### Parquet와 ORC — 파일도 나란히 세운다



<p>디스크에 저장하는 방식도 같은 원리입니다.</p>

<p><strong>행 기반</strong>(CSV, JSON)은 한 레코드의 모든 필드를 붙여서 저장해요.</p>

<pre><code>Alice, 23, 0.8, Seoul
Bob, 18, 0.3, Busan
Carol, 31, 0.7, Daegu</code></pre>

<p><code>age</code>만 스캔하고 싶어도 <code>name</code>과 <code>address</code>를 다 읽어야 합니다.</p>

<p><strong>Parquet</strong>과 <strong>ORC</strong>는 열 기반입니다. 같은 칼럼의 값들이 디스크에서도 나란히 붙어 있어요.</p>

<pre><code>age:   [23, 18, 31, 27, 45, 19, 52, 40, ...]
score: [0.8, 0.3, 0.7, 0.1, 0.9, ...]</code></pre>

<p><code>age</code>만 필요하면 <code>age</code> 블록만 읽으면 됩니다. 읽어온 데이터는 메모리에서도 나란히 있어요. CPU가 SIMD로 크게 떠먹기 좋은 모양.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/08/fig6_columnar.png" alt="행 기반 vs 열 기반 데이터 배치"/>
</div>

<div class="callout callout-blue">
<p class="callout-title">Spark + Parquet이 빠른 진짜 이유</p>
<p>Spark가 Parquet을 읽으면 — Tungsten이 열 기반 데이터를 off-heap에 나란히 깔고, 코드 생성기가 벡터화된 루프를 만들고, CPU가 SIMD로 먹습니다. <em>파일 포맷 → 메모리 배치 → CPU 명령어</em>까지 일관되게 "나란히"를 유지하는 것. 이 파이프라인이 빠른 거예요.</p>
</div>



### Arrow — 메모리도 나란히



<p>Apache Arrow는 한 발 더 갑니다. <em>메모리 안에서의 열 기반 포맷</em>을 표준화했어요. Spark, Pandas, DuckDB, Polars, DataFusion — 서로 다른 엔진이 같은 메모리 레이아웃을 쓰면 데이터를 복사 없이 주고받을 수 있습니다.</p>

<p>Arrow가 열 기반인 이유? 같은 타입의 데이터가 나란히 있으면 SIMD가 먹기 좋으니까. Spark의 Tungsten, Pandas 2.0의 백엔드, DuckDB의 실행 엔진 — 전부 Arrow 위에 서 있어요.</p>



### ClickHouse와 Vector DB



<p><strong>ClickHouse</strong>는 처음부터 열 기반 + 벡터화 실행을 함께 설계했습니다. 한 번에 칼럼 블록을 통째로 읽어서 SIMD로 처리. 분석 쿼리가 MySQL보다 100배 빠른 이유가 이거예요.</p>

<p><strong>Vector DB</strong>(Milvus, Pinecone, Weaviate)가 빠른 것도 같은 이유입니다. 유사도 검색의 핵심은 내적(dot product). 수백만 벡터에 대해 <em>같은 연산을 반복</em>합니다. SIMD가 가장 좋아하는 모양이에요.</p>



### 공통점 한 줄



<blockquote>
<p>데이터 엔지니어링의 핵심 도구들은 전부 같은 질문에서 출발했다 — <strong>CPU가 한 번에 먹을 수 있게 데이터를 나란히 세울 수 있는가?</strong></p>
</blockquote>

<div class="callout callout-teal">
<p class="callout-title">알고리즘보다 데이터 배치</p>
<p>SIMD는 단지 명령어 이름이 아닙니다. Parquet이 열 기반인 이유, Tungsten이 객체를 부순 이유, Arrow가 메모리 포맷을 표준화한 이유 — 전부 <em>데이터를 나란히 세우기 위해서</em>예요. 알고리즘을 바꾸기 전에 <em>데이터 배치</em>를 먼저 봐야 하는 이유.</p>
</div>



## 닫는 글



<p>한 입 분량 끝. 정리는 세 줄.</p>

<ol>
<li><strong>SIMD는 여러 데이터를 한 번의 명령으로 처리한다.</strong> Single Instruction, Multiple Data. CPU가 갑자기 똑똑해진 게 아니라, 원래 있던 벡터 연산기를 쓰기 시작한 것.</li>
<li><strong>SIMD의 본질은 계산이 아니라 데이터 배치다.</strong> 같은 종류의 데이터를 나란히 놓으면 CPU가 한 번에 먹는다. 분기와 포인터는 그 나란함을 깨뜨린다.</li>
<li><strong>CPU는 생각보다 놀고 있다.</strong> 문제는 CPU가 아니라 우리가 CPU를 사용한 방식이다. 좋은 코드는 그 CPU를 깨운다.</li>
</ol>

<p>이 세 줄이 머리에 남았다면 한 핫도그 잘 드신 거예요. 다음에 <code>for</code> 루프를 쓸 때, <em>이 계산이 나란히 놓일 수 있는가</em>가 한 번쯤 떠오를 겁니다.</p>



### 더 깊이 가고 싶다면



<ul>
<li><strong>원전</strong> — John L. Hennessy &amp; David A. Patterson, <em>"Computer Architecture: A Quantitative Approach"</em> 4장(Data-Level Parallelism and GPU Architectures). SIMD와 벡터 아키텍처를 정량적으로 다루는 교과서.</li>
<li><strong>실전</strong> — Daniel Lemire의 블로그 <code>lemire.me/blog</code>. SIMD를 실무에서 어떻게 쓰는지, 벤치마크와 함께 꾸준히 기록하는 현장 노트.</li>
<li><strong>맥락</strong> — Agner Fog, <em>"Optimizing software in C++"</em>. 컴파일러가 벡터화를 어떻게 하는지, 우리가 뭘 도와줄 수 있는지에 대한 실전 가이드. <code>agner.org/optimize</code>에서 무료 공개.</li>
</ul>

<div class="closing">
<div class="closing-mark">*&#160;*&#160;*</div>
<em>스태프 핫도그 #8 — SIMD Vectorization</em>
<em>다음 핫도그에서 만나요.</em>
</div>
