---
title: '스태프 핫도그 #4 — LSM Tree'
description: '쓰기는 가볍게, 빚은 compaction이 갚는다'
sidebar:
  label: '#4 — LSM Tree'
  order: 4
banner:
  content: '<strong>초안</strong> · 본문은 다듬는 중입니다.'
---

<a class="ebook-launch" href="?view=book">📖 이북으로 보기</a>



## 1. 우리가 매일 쓰는 HBase, 정체가 뭔가



<p>HBase를 쓰면서 "lexical order를 지원한다"는 것 정도만 안다고 합시다. 사실 그게 <em>부가 기능</em>이 아니에요. <strong>HBase의 정체성이고, 모든 게 그 위에 서 있어요.</strong></p>

<p>이유부터. HBase의 무기는 <strong>range scan이 공짜</strong>라는 것. <code>scan 'orders', {STARTROW=>'2024-01', STOPROW=>'2024-02'}</code> — 이게 빠른 이유는 데이터가 row key 순으로 디스크에 <em>정렬돼 누워있기</em> 때문입니다. 그러니까 lexical order가 그냥 기능이 아니라, <strong>HBase가 HBase인 이유</strong>.</p>

<p>그런데 이상해요. 데이터는 끊임없이 들어오는데 어떻게 항상 정렬되어 있을까요? 들어올 때마다 정렬된 자리에 끼워넣는다? 그러면 디스크에서 <em>제자리 수정</em>이 일어나야 합니다. 매 쓰기마다 disk seek가 10ms씩 — #2 회차에서 봤죠. 1초에 100번이 끝.</p>



### B-tree는 그렇게 한다



<p>전통적인 RDB (MySQL, PostgreSQL)가 쓰는 자료구조가 <strong>B-tree</strong>입니다. 정렬된 트리 노드를 디스크에 두고, 새 데이터가 들어오면 <em>맞는 자리를 찾아 그 노드에 끼워넣는다</em>. 노드가 꽉 차면 쪼개기까지. 이게 <em>제자리 수정</em>(in-place update).</p>

<p>장점은 read가 빠르다는 것 — 트리 한 번 타고 내려가면 끝. 단점은 <em>write마다 random disk seek</em>. OLTP RDB가 RAM과 SSD 없이 못 사는 이유.</p>



### HBase는 안 그런다



<p>HBase는 다른 길을 택했어요. <strong>쓸 땐 정렬을 안 한다.</strong> 그냥 메모리에 쌓아두고, 메모리가 차면 <em>그 시점의 정렬된 결과만</em> 디스크에 한 덩어리로 던진다. 디스크에 이미 있는 파일은 <em>건드리지 않는다.</em></p>

<div class="callout callout-purple">
<p class="callout-title">한 줄로 표현하면</p>
<p>정렬은 <em>각 덩어리 안에서만</em> 유지. 덩어리들 사이는? 나중에 한꺼번에 합친다.</p>
</div>

<p>이 한 줄이 <strong>LSM(Log-Structured Merge tree)</strong>의 전부예요. 쓰기는 무조건 sequential — disk seek 없음. 대가는? 디스크에 정렬된 <em>덩어리가 여러 개</em> 쌓인다는 것. 그래서 읽을 때 여러 개를 다 봐야 함. 그리고 가끔 합쳐주지 않으면 그 수가 계속 늘어요. 그 "합치기"가 바로 <strong>compaction</strong>.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/04/fig1_btree_vs_lsm.png" alt="B-tree vs LSM 쓰기 경로"/>
</div>

<div class="callout callout-teal">
<p><em>쓰기를 빚으로 만든 자료구조. 빚 갚는 일이 compaction.</em></p>
</div>

<p>다음 장에서 HBase가 이 빚을 <em>구체적으로 어떻게</em> 관리하는지 봅니다. MemStore, WAL, HFile — 세 층이 한 가지 규칙으로 움직여요.</p>



## 2. HFile · MemStore · WAL: 세 층의 한 가지 규칙



<p>HBase의 쓰기 경로에 등장하는 컴포넌트는 셋이에요. 다 들어봤을 이름들:</p>

<ul>
<li><strong>MemStore</strong> — 메모리 안의 정렬된 자료구조 (실제로 ConcurrentSkipListMap). <em>mutable.</em></li>
<li><strong>WAL (Write-Ahead Log)</strong> — durability용 순차 로그. RegionServer 디스크에 append-only.</li>
<li><strong>HFile</strong> — 디스크의 정렬된 <em>불변</em> 파일. 한 번 쓰면 절대 수정 안 함.</li>
</ul>

<p>LSM 일반론으로 옮기면 MemTable / Log / SSTable. <strong>HBase는 LSM의 한 구현체</strong>일 뿐, 같은 패턴이 Cassandra, RocksDB, LevelDB에 다 들어있어요.</p>



### Write path — 두 번 쓰고 잊는다



<div class="figure">
<img src="/tilmore/staffhotdog/assets/04/fig2_write_path.png" alt="HBase write path"/>
</div>

<p>쓰기 한 번에 두 군데를 동시에 적습니다.</p>

<ol>
<li><strong>WAL에 append</strong> — RegionServer가 죽어도 복구할 수 있게</li>
<li><strong>MemStore에 insert</strong> — 정렬된 자리에 메모리 안에서</li>
</ol>

<p>여기서 끝. 클라이언트한테 ACK 보냄. 디스크 seek 없음, RAM 갱신 + 순차 append 한 번. 매우 빠릅니다.</p>

<p>MemStore가 일정 크기(<code>hbase.hregion.memstore.flush.size</code>, 기본 128MB)에 차면, <strong>그 시점의 정렬된 내용</strong>을 디스크에 새 <strong>HFile</strong>로 떨어뜨립니다. 이게 <strong>flush</strong>. Flush 끝나면 해당 WAL 구간은 더 이상 필요 없으니 버려도 됨.</p>

<p>핵심: <em>HFile은 한 번 쓰이면 끝.</em> 안의 내용은 절대 수정 안 됩니다. 새 데이터가 와도 새 HFile이 또 생길 뿐. 이게 나중에 bulk load의 마법을 가능하게 합니다.</p>



### Read path — 모두 본다, Bloom으로 거른다



<div class="figure">
<img src="/tilmore/staffhotdog/assets/04/fig3_read_path.png" alt="HBase read path with Bloom filter"/>
</div>

<p><code>get 'orders', 'row_xyz'</code> 한 번에 어디까지 봐야 할까요?</p>

<ol>
<li>MemStore (메모리, 가장 최신)</li>
<li>HFile 1, 2, 3, ... (디스크의 모든 HFile, 최신부터)</li>
</ol>

<p>같은 row key가 여러 곳에 다른 버전으로 있을 수 있으니, <strong>모두 봐서 최신을 골라야</strong> 합니다. HFile이 10개면 디스크 IO가 10번? 너무 비싸요.</p>

<p>그래서 각 HFile마다 <strong>Bloom filter</strong>를 같이 저장해둡니다 (#3 회차에서 본 그것). "이 HFile에 이 row key 있을 가능성 있나?"를 마이크로초 안에 확인. 없으면 통째로 skip. <strong>Yes는 maybe, No는 진짜 No</strong> — 이 비대칭이 LSM read의 핵심 무기.</p>

<div class="callout callout-teal">
<p>HBase가 #3의 Bloom filter를 운영체제처럼 박아 쓰는 이유 — <em>LSM read를 살리는 거의 유일한 방법이라서.</em></p>
</div>

<p>추가로 각 HFile에는 sparse index도 같이 있어서 (block 단위로 첫 키만 기록), Bloom 통과한 다음에도 binary search로 빠르게 찾습니다.</p>



### 그래서 compaction이 필수



<p>쓰기가 빈번하면 flush도 빈번 → HFile 개수가 빠르게 늘어요. HFile이 50개, 100개가 되면?</p>

<ul>
<li>Read 한 번에 Bloom 50번 + 몇 개는 진짜 디스크 IO. <em>Read가 점점 느려짐.</em></li>
<li>같은 row key의 옛 버전이 옛 HFile에 남아있음. <em>공간 낭비.</em></li>
<li><code>Delete</code>도 사실은 tombstone(삭제 마커)을 쓰는 것이라, 진짜 데이터는 옛 HFile에 그대로. <em>진짜 삭제가 안 됨.</em></li>
</ul>

<p><strong>Compaction</strong>은 여러 HFile을 읽어서 정렬 머지로 한 덩어리 HFile을 만들고, 그 과정에서 중복은 최신만 남기고 tombstone은 진짜로 지웁니다.</p>

<div class="figure">
<img src="/tilmore/staffhotdog/assets/04/fig4_compaction.png" alt="Compaction before/after"/>
</div>

<ul>
<li><strong>Minor compaction</strong> — 작은 HFile 몇 개만 합침. 주기적 정리.</li>
<li><strong>Major compaction</strong> — 한 region의 <em>모든</em> HFile을 하나로. tombstone 진짜 삭제. 비싸서 보통 새벽에.</li>
</ul>



### 세 가지 amplification



<p>LSM 트레이드오프는 결국 "셋 중에 뭘 비싸게 둘 거냐"의 문제입니다.</p>

<table>
<thead>
<tr><th>종류</th><th>의미</th><th>누가 손해</th></tr>
</thead>
<tbody>
<tr><td><strong>Write amplification</strong></td><td>같은 데이터가 compaction 때문에 여러 번 쓰임</td><td>디스크 IO</td></tr>
<tr><td><strong>Read amplification</strong></td><td>한 번 읽기에 여러 HFile 봐야 함</td><td>latency</td></tr>
<tr><td><strong>Space amplification</strong></td><td>옛 버전·tombstone이 잠시 디스크 차지</td><td>용량</td></tr>
</tbody>
</table>

<p>셋 다 줄일 순 없어요. Compaction을 자주 하면 read·space는 좋아지는데 write가 더 비싸지고, 미루면 read·space가 나빠지고 write는 가벼워짐. <strong>HBase 운영 = 이 셋의 균형 잡기.</strong></p>



## 3. 운영자가 보는 풍경: Region, Bulk load, Compaction



<p>이론은 됐고, 실제 HBase 클러스터에서 이게 어떻게 보이는지.</p>



### Region — 키 공간의 수평 분할



<p>HBase 테이블은 row key 범위로 잘려서 <strong>Region</strong>들로 나뉩니다. 예: <code>[a-h)</code>, <code>[h-p)</code>, <code>[p-z)</code>. 각 Region은 한 RegionServer가 담당하고, <strong>각 Region 안에 그 키 범위의 MemStore + HFile들</strong>이 있어요.</p>

<p>Region이 너무 커지면 자동으로 <strong>split</strong> — 키 범위 가운데서 둘로 나뉘고, 그 시점의 HFile은 그대로(immutable이니까!) 두 region이 <em>공유</em>하다가 다음 compaction에서 자연스럽게 분리.</p>



### Hot region — lexical order의 그림자



<div class="figure">
<img src="/tilmore/staffhotdog/assets/04/fig5_hotregion.png" alt="Hot region 문제와 salting"/>
</div>

<p>타임스탬프나 자동 증가 ID를 row key로 쓰면? 새 데이터가 <em>항상 가장 큰 키</em>예요. 그러면 모든 write가 <strong>마지막 region에만</strong> 몰립니다. 다른 region들이 놀고 한 region이 죽어요. 이게 <strong>hot region</strong>.</p>

<p>해결책 세 가지가 표준:</p>

<ul>
<li><strong>Salting</strong> — row key 앞에 <code>hash(key) % N</code>을 prefix로. <code>00_2024-01-15</code>, <code>01_2024-01-15</code>... 키들이 N개 region에 골고루.</li>
<li><strong>Hashing</strong> — 자연 키를 통째로 해시. range scan 포기가 대가.</li>
<li><strong>Reverse timestamp</strong> — <code>Long.MAX_VALUE - ts</code>. 최근 게 앞으로 — 한 row 안에서 시간 역순 scan할 때.</li>
</ul>

<div class="callout callout-amber">
<p>스킴 선택의 본질은 <em>range scan을 어디까지 살릴 거냐 vs 부하 분산을 어디까지 갈 거냐</em>. lexical order가 정체성이니까 함부로 hash로 다 죽이면 HBase 쓰는 이유가 사라져요.</p>
</div>



### Bulk load — write path를 통째로 우회



<div class="figure">
<img src="/tilmore/staffhotdog/assets/04/fig6_bulkload.png" alt="Bulk load 우회 경로"/>
</div>

<p>수억 row를 한 번에 적재해야 한다고 합시다. 정상 write path로 가면?</p>

<ul>
<li>WAL append × 수억</li>
<li>MemStore에 insert × 수억</li>
<li>Flush × 여러 번</li>
<li>압박을 받은 compaction × 여러 번</li>
</ul>

<p>느리고, RegionServer가 압박받음. <strong>Bulk load는 이걸 통째로 우회</strong>합니다.</p>

<ol>
<li><strong>MapReduce 잡으로 HFile을 직접 만든다</strong> — <code>HFileOutputFormat2</code>. 입력 데이터를 정렬해서 HFile 포맷에 맞게 출력.</li>
<li><strong><code>LoadIncrementalHFiles</code></strong> (HBase 2 이상은 <code>BulkLoadHFiles</code>)로 region 디렉토리에 이동 — 단순 파일 이동/복사.</li>
<li>HBase가 새 HFile을 인식하고 서빙 시작.</li>
</ol>

<p>왜 이게 됩니까? <strong>HFile이 immutable이기 때문에.</strong> 기존 HFile과 같은 형식의 새 HFile 하나 더 추가하는 것뿐. 정합성 깰 게 없어요. <em>LSM이 immutable 단위로 동작한다는 사실 하나가 bulk load 전체를 가능하게 합니다.</em></p>

<div class="callout callout-teal">
<p>정상 write가 자동차라면 bulk load는 컨베이어 벨트. <em>같은 도로를 안 쓰는 거예요.</em></p>
</div>

<p>실전 팁: bulk load 전에 테이블을 적절한 split point로 <strong>pre-split</strong>해두면 결과 HFile들이 region에 골고루 떨어집니다. 안 그러면 결국 한 region에 다 몰려서 의미 없음.</p>



### Compaction 운영 감각



<p>운영자가 만지는 노브는 결국 세 순간을 조절합니다. 키 이름이 아니라 <em>감각</em>으로 가져가세요.</p>

<ul>
<li><strong>언제 합치나</strong> — HFile이 임계치만큼 쌓이면 minor compaction이 자동으로. 빚이 일정 쌓이면 자동 상환.</li>
<li><strong>언제 싹 정리하나</strong> — tombstone이 쌓이거나 read latency가 오르면 major compaction. 비싸서 보통 새벽에 수동으로.</li>
<li><strong>합치다 IO를 다 잡아먹을 때</strong> — throughput을 throttle해서 속도 제한. 서빙 중인 RegionServer를 죽이지 않게.</li>
</ul>

<p>핵심은 키 이름이 아니라, 이 노브들이 전부 <strong>2장의 세 amplification을 저울질하는 손잡이</strong>라는 것. 자주 합치면 read·space가 좋아지고 write가 비싸지고, 미루면 그 반대. 이 저울이 눈에 보이면 HBase 운영자로 한 단계 올라간 거예요.</p>



## 닫는 글



<p>한 입 분량 끝. 정리는 세 줄.</p>

<ol>
<li><strong>HBase는 LSM의 한 구현체.</strong> Lexical order는 부가 기능이 아니라 정체성, range scan부터 bulk load까지 모든 게 그 위에 선다.</li>
<li><strong>세 층 한 규칙.</strong> MemStore + WAL → flush → 불변 HFile들. 읽을 땐 다 보되 Bloom filter로 거른다. 쌓이면 compaction.</li>
<li><strong>쓰기를 빚으로 만들었으니, 빚 갚기가 운영의 절반.</strong> Write/Read/Space amplification 셋 중 둘만 가질 수 있다.</li>
</ol>

<p>이 세 줄이 머리에 남았다면 한 핫도그 잘 드신 거예요. 다음 HBase 알람 — "compaction queue 쌓임", "region 핫스팟" — 을 볼 때 그게 <em>왜</em> 발생했는지가 보일 겁니다.</p>



### 더 깊이 가고 싶다면



<ul>
<li><strong>원전</strong> — Patrick O'Neil et al., <em>"The Log-Structured Merge-Tree (LSM-Tree)"</em>, Acta Informatica 1996. LSM이라는 이름이 처음 등장한 논문.</li>
<li><strong>실전</strong> — <em>"HBase: The Definitive Guide"</em>의 Storage Architecture 장. HFile 포맷부터 compaction 정책(<code>hbase.hstore.compaction.min</code>, throughput throttle 등 튜닝 노브)까지 코드 레벨로.</li>
<li><strong>맥락</strong> — Mark Callaghan, <em>"The third law of performance"</em> 블로그. Read/Write/Space amplification 트레이드오프를 RocksDB 만든 사람이 정리.</li>
</ul>

<div class="closing">
<div class="closing-mark">*&#160;*&#160;*</div>
<em>스태프 핫도그 #4 — LSM Tree</em>
<em>다음 핫도그에서 만나요.</em>
</div>
