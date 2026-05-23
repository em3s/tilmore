---
title: '스태프 핫도그 #1 — MapReduce'
description: '스펙과 구현, 그리고 한 줄 bash'
sidebar:
  label: '#1 — MapReduce'
  order: 1
banner:
  content: '<strong>초안</strong> · 본문은 다듬는 중입니다.'
---

<a class="ebook-launch" href="?view=book">📖 이북으로 보기</a>



## 1. MapReduce는 스펙이다



  <p>흔히 빠지는 함정 하나로 시작합니다. "MapReduce를 안다"라고 말할 때, 사실은 "Hadoop을 안다"라고 말하고 있는 경우가 많아요. 경력이 짧든 길든 누구나 한 번씩 거치는 착각입니다.</p>

  <p>비유로 가는 게 빠릅니다. <strong>SQL은 MySQL이 아닙니다.</strong> SQL은 관계형 데이터를 다루는 <em>언어 스펙</em>이고, MySQL·PostgreSQL·SQLite는 그 스펙을 구현한 <em>제품</em>입니다.</p>

  <p><strong>MapReduce도 똑같습니다.</strong> 2004년 Google이 발표한 논문에서 정의한 <em>프로그래밍 모델 스펙</em>이고, Hadoop·Spark·Flink는 그 스펙을 자기 방식으로 구현한 <em>실행 엔진</em>입니다.</p>

  

### 스펙이 정의한 것



  <p>Google 논문은 사용자에게 단 두 개의 함수만 요구합니다.</p>

  <div class="figure"><img src="/tilmore/staffhotdog/assets/01/fig_spec.png" alt="MapReduce 스펙 — 단 두 함수"/></div>

  <p>나머지는 전부 프레임워크의 책임입니다. 데이터 파티셔닝, 셔플(네트워크 전송), 워커 스케줄링, 장애 복구, 결과 집계 — 사용자는 신경 안 써도 됩니다.</p>

  <div class="callout callout-purple">
    <p class="callout-title">이게 왜 혁명적이었나</p>
    <p>2004년 이전엔 <em>분산 처리하려면 분산 프로그래밍을 배워야</em> 했어요. MapReduce 논문의 진짜 기여는 알고리즘이 아니라 <strong>"이 두 함수만 짜면 분산은 내가 책임진다"는 인터페이스</strong>를 정의한 것. 데이터 엔지니어가 분산 시스템 전문가 아니어도 되게 만든 사건이었습니다.</p>
  </div>

  

### 구현체마다 다른 트레이드오프



  <p>같은 스펙을 세 가지 엔진이 자기 방식으로 풀었습니다.</p>

  <div class="figure"><img src="/tilmore/staffhotdog/assets/01/fig_hadoop.png" alt="Hadoop MapReduce"/></div>

  <p>원조 OSS. 디스크 기반 HDFS 위에서 중간 결과를 전부 디스크에 쓰면서 처리. 느리지만 1000대에서 한두 대 죽어도 작업이 끝납니다. <em>안정성을 위해 성능을 내준 설계.</em></p>

  <div class="figure"><img src="/tilmore/staffhotdog/assets/01/fig_spark.png" alt="Apache Spark"/></div>

  <p>같은 모델을 인메모리로 다시 짠 것. 중간 결과를 메모리에 두고 DAG로 최적화하니 Hadoop보다 10~100배 빠릅니다. 지금 사실상 표준 자리에 있는 엔진.</p>

  <div class="figure"><img src="/tilmore/staffhotdog/assets/01/fig_flink.png" alt="Apache Flink"/></div>

  <p>한 발 더. 배치를 스트리밍의 특수 케이스로 보고, 처음부터 실시간을 위해 설계됐어요. 매 이벤트가 들어올 때마다 즉시 처리하면서도 exactly-once 보장.</p>

  

### 그래서



  <p>"MapReduce 써본 적 있어요?"에 "Hadoop 안 써봤는데요"는 안타까운 답입니다. <code>SELECT user_id, COUNT(*) FROM orders GROUP BY user_id</code>도 MapReduce. <code>cat log | sort | uniq -c</code>도 MapReduce. Spark의 <code>.reduceByKey()</code>도 MapReduce.</p>

  <p>스펙은 한 가지, 구현체는 수십 가지. 다음 장에서 그 스펙이 정확히 어떤 모양의 사고법인지 보여드립니다.</p>



## 2. 쪼갠다, 모은다, 합친다



  <p>스펙이 정의한 두 함수, <code>map</code>과 <code>reduce</code>. 그런데 이 둘 사이에는 사실 <em>이름은 명시 안 됐지만 모두가 의지하는 세 번째 단계</em>가 있습니다. <strong>Shuffle</strong>.</p>

  <p>그래서 MapReduce는 머릿속에 두 단계가 아니라 <strong>세 단계</strong>로 그려야 합니다. <em>쪼갠다 → 모은다 → 합친다</em>. 이 세 동사가 전부.</p>

  <p>문장 세 개에서 단어 등장 횟수를 세는 워드 카운트 예제로 한 단계씩 가보겠습니다.</p>

  <pre><code>the cat
the dog ran
cat ran</code></pre>

  

### ① 쪼갠다 — Map



  <div class="figure"><img src="/tilmore/staffhotdog/assets/01/fig_map.png" alt="Map 단계 — 각 문장을 (단어, 1) 쌍들로 변환"/></div>

  <div class="callout callout-blue">
    <p>각 문장을 <code>(단어, 1)</code> 쌍들로 변환합니다. <code>"the cat"</code>이 들어가면 <code>(the, 1) (cat, 1)</code>이 나갑니다. 핵심은 <strong>변환이 문장끼리 독립적</strong>이라는 점. 1000대에 문장을 나눠 줘도 결과는 같습니다. <em>병렬화의 출발점.</em></p>
  </div>

  

### ② 모은다 — Shuffle



  <div class="figure"><img src="/tilmore/staffhotdog/assets/01/fig_shuffle.png" alt="Shuffle 단계 — 같은 key끼리 그룹핑"/></div>

  <div class="callout callout-amber">
    <p>같은 key를 가진 값들을 한 곳으로 모읍니다. <code>the</code>의 1들끼리, <code>cat</code>의 1들끼리. <strong>내가 짜는 코드가 아닙니다.</strong> 프레임워크가 알아서 해줘요. Unix의 <code>sort</code> 명령과 정확히 같은 역할.</p>
    <p>분산 환경에서는 이 단계가 가장 비쌉니다. 1000대에 흩어진 같은 key의 값을 한 머신으로 모으려면 <em>네트워크 전송</em>이 필요하니까요. Spark·Flink 성능 튜닝의 90%가 "shuffle 줄이기"인 이유.</p>
  </div>

  

### ③ 합친다 — Reduce



  <div class="figure"><img src="/tilmore/staffhotdog/assets/01/fig_reduce.png" alt="Reduce 단계 — 각 key의 value 리스트를 집계"/></div>

  <div class="callout callout-teal">
    <p>각 key에 모인 값 리스트를 집계합니다. <code>the: [1, 1]</code>은 <code>the → 2</code>. 이 단계도 key 단위로 다시 병렬화 가능. 결과는 단어별 등장 횟수, 즉 워드 카운트.</p>
  </div>

  

### 색깔이 곧 메시지



  <p>파란색(Map)과 청록색(Reduce)은 <strong>내가 짜는 코드</strong>, 노란색(Shuffle)은 <strong>프레임워크가 해주는 부분</strong>입니다. 가장 자주 헷갈리는 "shuffle도 내가 구현해야 하나?"는 색이 다르다는 것 자체로 답이 돼요. 아니요, 안 짭니다.</p>

  

### 같은 모양의 다른 얼굴



  <p>똑같은 3단계 사고법이 도구마다 다른 이름을 입을 뿐입니다.</p>

  <table>
    <thead>
      <tr><th>단계</th><th>Unix</th><th>SQL</th><th>Spark</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Map</strong></td><td><code>tr</code></td><td><code>SELECT</code> 식</td><td><code>.map()</code></td></tr>
      <tr><td><strong>Shuffle</strong></td><td><code>sort</code></td><td><code>GROUP BY</code></td><td><code>groupByKey()</code></td></tr>
      <tr><td><strong>Reduce</strong></td><td><code>uniq -c</code></td><td>집계 함수</td><td><code>reduceByKey()</code></td></tr>
    </tbody>
  </table>

  <p>SQL의 <code>SELECT user_id, COUNT(*) FROM orders GROUP BY user_id</code> 한 줄도 사실 MapReduce. 여러분은 이미 매일 쓰고 있었습니다. 그렇게 안 불렀을 뿐.</p>



## 3. 한 줄 bash로 실습



  <p>개념은 손에 안 잡힐 때까지만 추상적. 한 번 손으로 돌려보면 안 잊혀요. 이 장이 짧은 이유. <strong>맥북이나 리눅스 터미널 켜고 그대로 따라치세요.</strong></p>

  

### 준비 — 입력 파일



  <pre><code>$ cat &gt; words.txt &lt;&lt;EOF
the cat
the dog ran
cat ran
EOF</code></pre>

  

### 실행 — 파이프 하나



  <pre><code>$ cat words.txt | tr ' ' '\n' | sort | uniq -c
      2 cat
      1 dog
      2 ran
      2 the</code></pre>

  <p>끝. 이게 MapReduce입니다.</p>

  

### 해부



  <p>아까 그 3단계가 이 한 줄 안에 그대로 들어있습니다.</p>

  <div class="figure"><img src="/tilmore/staffhotdog/assets/01/fig_command.png" alt="한 줄 명령의 각 부분이 어떤 단계인가"/></div>

  <div class="callout callout-blue">
    <p class="callout-title">tr ' ' '\n' → Map</p>
    <p>공백을 줄바꿈으로 바꿔서 <em>단어 하나당 한 줄</em>로. 각 줄에서 key(=단어)를 추출하는 작업.</p>
  </div>

  <div class="callout callout-amber">
    <p class="callout-title">sort → Shuffle</p>
    <p>같은 key가 연속하도록 정렬. <code>cat, cat, dog, ran, ran, the, the</code>로 모입니다. 분산이면 네트워크 전송, 단일 머신이면 정렬. 역할은 같음.</p>
  </div>

  <div class="callout callout-teal">
    <p class="callout-title">uniq -c → Reduce</p>
    <p>연속된 중복의 개수를 셈. 정렬된 입력을 전제로 작동(그래서 앞에 <code>sort</code>가 필수).</p>
  </div>

  

### 이게 진짜 같은 MapReduce인가



  <p>의심스러우면 Spark로 같은 일을 해보세요.</p>

  <pre><code>val counts = sc.textFile("words.txt")
  .flatMap(_.split(" "))      // map
  .map(w =&gt; (w, 1))           // map
  .reduceByKey(_ + _)         // shuffle + reduce
counts.collect()</code></pre>

  <p>코드 모양은 달라도 사고의 형태는 같음. 단어 추출 → key별 그룹핑 → 그룹별 집계. 맥북에서는 <code>tr | sort | uniq -c</code>, 1000대 클러스터에서는 Spark — 도구만 다를 뿐 모델은 한 가지.</p>

  

### 분산 환경으로 가면 뭐가 달라지나



  <p>1억 줄짜리 로그라면 노트북 한 대로는 안 됩니다. 사고법은 똑같고, 다음이 추가될 뿐:</p>

  <ul>
    <li><strong>입력 분할</strong> — 1억 줄을 1000개 청크로 나눠 각 머신에.</li>
    <li><strong>Map 병렬</strong> — 1000대가 동시에 <code>tr</code> 같은 변환.</li>
    <li><strong>Shuffle 네트워크</strong> — 같은 단어를 다룬 부분 결과를 한 머신으로. 가장 비싼 단계.</li>
    <li><strong>Reduce 병렬</strong> — 각 단어 그룹을 받은 머신이 동시에 합산.</li>
    <li><strong>장애 복구</strong> — 중간에 한 대 죽으면 그 부분만 다시 실행.</li>
  </ul>

  <p>이 다섯을 자동으로 해주는 게 Hadoop·Spark·Flink. 여러분의 한 줄 bash에 분산 처리·네트워크 최적화·장애 복구를 입혀준 것 — 그게 분산 데이터 처리 엔진의 일.</p>



## 닫는 글



  <p>한 입 분량 끝. 정리는 세 줄.</p>

  <ol>
    <li><strong>MapReduce는 스펙이다.</strong> Hadoop·Spark·Flink는 그 스펙의 구현체.</li>
    <li><strong>모델은 3단계 사고법.</strong> 쪼갠다(Map) → 모은다(Shuffle) → 합친다(Reduce).</li>
    <li><strong>이미 매일 쓰고 있다.</strong> SQL의 <code>GROUP BY</code>도, Unix의 <code>sort | uniq -c</code>도 같은 모델.</li>
  </ol>

  <p>이 세 줄이 머리에 남았다면 한 핫도그 잘 드신 거예요. Spark 코드를 읽을 때, Hadoop 인프라를 만질 때, SQL을 짤 때 — 같은 모양이 보일 겁니다.</p>

  

### 더 깊이 가고 싶다면



  <ul>
    <li><strong>원전</strong> — Dean &amp; Ghemawat, <em>"MapReduce: Simplified Data Processing on Large Clusters"</em>, OSDI 2004. 17쪽짜리 짧고 깔끔한 논문.</li>
    <li><strong>실전</strong> — Spark의 <code>reduceByKey</code> vs <code>groupByKey</code> 차이. shuffle을 줄이는 게 왜 중요한지 손에 잡힘.</li>
    <li><strong>맥락</strong> — Martin Kleppmann, <em>"Designing Data-Intensive Applications"</em> 10장(Batch Processing).</li>
  </ul>

  <div class="closing">
    <div class="closing-mark">*&#160;*&#160;*</div>
    <em>스태프 핫도그 #1 — MapReduce</em>
    <em>다음 핫도그에서 만나요.</em>
  </div>
