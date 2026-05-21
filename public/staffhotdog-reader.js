// 스태프 핫도그 이북 엔진 — Starlight 원문 페이지 위에 ?view=book 일 때 오버레이로 마운트.
// 페이지 본문(.sl-markdown-content)을 복제해 h2(챕터)별로 묶어 CSS 컬럼 페이지네이션.
// 단일 소스: 페이지 자체. (별도 JSON·standalone 리더 불필요)
(function () {
  if (window.__hotdogEbook) return; window.__hotdogEbook = true;
  const BASE = '/tilmore';

  const CSS = `
  #hotdog-ebook {
    --bg:#faf9f5; --ink:#1a1a18; --muted:#73726c; --line:rgba(127,127,127,.22);
    --panel:#fbfaf6; --accent:#c2410c; --chrome-h:48px;
    position:fixed; inset:0; z-index:9999; background:var(--bg); color:var(--ink);
    font-family:"Apple SD Gothic Neo","Pretendard","Noto Sans CJK KR","Malgun Gothic",system-ui,sans-serif;
    word-break:keep-all; overflow-wrap:break-word; overflow:hidden; touch-action:pan-y;
  }
  #hotdog-ebook[data-ebook-theme="dark"] {
    --bg:#1d1d1b; --ink:#ebebe9; --muted:#9a9a92; --line:rgba(127,127,127,.28); --panel:#232320; --accent:#fb923c;
  }
  #hotdog-ebook *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  #hotdog-ebook .bar{position:absolute;left:0;right:0;height:var(--chrome-h);display:flex;align-items:center;gap:8px;padding:0 12px;background:color-mix(in srgb,var(--panel) 92%,transparent);backdrop-filter:blur(8px);z-index:20;transition:transform .25s ease;}
  #hotdog-ebook .bar.top{top:0;border-bottom:1px solid var(--line);}
  #hotdog-ebook .bar.bottom{bottom:0;border-top:1px solid var(--line);font-size:13px;color:var(--muted);}
  #hotdog-ebook.immersive .bar.top{transform:translateY(-100%);}
  #hotdog-ebook.immersive .bar.bottom{transform:translateY(100%);}
  #hotdog-ebook .title{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  #hotdog-ebook .spacer{flex:1;}
  #hotdog-ebook .iconbtn{appearance:none;border:1px solid var(--line);background:var(--bg);color:var(--ink);width:34px;height:34px;border-radius:9px;font-size:16px;cursor:pointer;display:grid;place-items:center;flex:0 0 auto;}
  #hotdog-ebook .iconbtn:active{transform:scale(.94);}
  #hotdog-ebook .iconbtn.wide{width:auto;padding:0 10px;font-size:13px;gap:4px;text-decoration:none;white-space:nowrap;}
  #hotdog-ebook #hd-chapter{flex:0 0 96px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  #hotdog-ebook #hd-pageInfo{flex:0 0 auto;appearance:none;border:1px solid var(--line);background:var(--bg);color:var(--muted);border-radius:7px;min-width:30px;height:26px;padding:0 7px;font:inherit;font-size:12px;font-variant-numeric:tabular-nums;line-height:1;cursor:pointer;}
  #hotdog-ebook #hd-pageInfo:active{transform:scale(.94);}
  #hotdog-ebook #hd-scrub{flex:1;appearance:none;height:4px;border-radius:4px;background:var(--line);}
  #hotdog-ebook #hd-scrub::-webkit-slider-thumb{appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);cursor:pointer;}
  #hotdog-ebook #hd-scrub::-moz-range-thumb{width:16px;height:16px;border:0;border-radius:50%;background:var(--accent);}
  #hotdog-ebook #hd-stage{position:absolute;inset:0;}
  #hotdog-ebook #hd-viewport{position:absolute;inset:0;overflow:hidden;padding:calc(var(--chrome-h) + 10px) 22px calc(var(--chrome-h) + 6px);}
  #hotdog-ebook #hd-pages{height:100%;column-gap:44px;column-fill:auto;will-change:transform;line-height:1.7;font-size:var(--hd-fs,17px);}
  #hotdog-ebook .zone{position:absolute;top:var(--chrome-h);bottom:var(--chrome-h);width:32%;z-index:10;}
  #hotdog-ebook .zone.l{left:0;} #hotdog-ebook .zone.r{right:0;} #hotdog-ebook .zone.c{left:32%;right:32%;z-index:9;}
  #hotdog-ebook .navarrow{display:none;}
  @media (hover:hover) and (pointer:fine){
    #hotdog-ebook .navarrow{position:absolute;top:50%;transform:translateY(-50%);z-index:15;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:color-mix(in srgb,var(--panel) 88%,transparent);backdrop-filter:blur(6px);color:var(--ink);font-size:26px;line-height:1;cursor:pointer;transition:opacity .25s ease;}
    #hotdog-ebook .navarrow.l{left:14px;} #hotdog-ebook .navarrow.r{right:14px;}
    #hotdog-ebook .navarrow:hover{border-color:var(--accent);color:var(--accent);}
    #hotdog-ebook.immersive .navarrow{opacity:0;pointer-events:none;}
  }
  #hotdog-ebook #hd-pages h2,#hotdog-ebook #hd-pages h3{font-weight:700;letter-spacing:-.01em;line-height:1.35;break-after:avoid;}
  #hotdog-ebook #hd-pages h2{font-size:1.55em;margin:.1em 0 .7em;}
  #hotdog-ebook #hd-pages h3{font-size:1.15em;margin:1.4em 0 .4em;}
  #hotdog-ebook #hd-pages h4{font-size:1em;font-weight:700;margin:1.2em 0 .3em;}
  #hotdog-ebook #hd-pages p{margin:.8em 0;text-align:justify;}
  #hotdog-ebook #hd-pages ul,#hotdog-ebook #hd-pages ol{margin:.8em 0;padding-left:1.3em;}
  #hotdog-ebook #hd-pages li{margin:.4em 0;}
  #hotdog-ebook #hd-pages code,#hotdog-ebook #hd-pages pre{font-family:"JetBrains Mono","D2Coding","SF Mono",Menlo,Consolas,monospace;font-size:.88em;}
  #hotdog-ebook #hd-pages code{background:rgba(127,127,127,.12);padding:.1em .35em;border-radius:3px;}
  #hotdog-ebook #hd-pages pre{background:rgba(127,127,127,.08);padding:.9em 1em;border-radius:6px;border:1px solid var(--line);line-height:1.55;white-space:pre-wrap;overflow-wrap:break-word;word-break:break-word;}
  #hotdog-ebook #hd-pages pre code{background:transparent;padding:0;}
  #hotdog-ebook #hd-pages .figure{margin:1.1em 0;text-align:center;background:#fff;padding:.4em;border-radius:8px;border:1px solid var(--line);break-inside:avoid;}
  #hotdog-ebook #hd-pages img,#hotdog-ebook #hd-pages svg{max-width:100%;height:auto;display:block;margin:0 auto;max-height:60vh;max-height:calc(100dvh - 150px);}
  #hotdog-ebook #hd-pages .callout{margin:1.2em 0;padding:.9em 1.1em;border-radius:8px;border:1px solid;}
  #hotdog-ebook #hd-pages .callout-purple{background:rgba(127,119,221,.08);border-color:rgba(127,119,221,.35);}
  #hotdog-ebook #hd-pages .callout-blue{background:rgba(56,138,221,.08);border-color:rgba(56,138,221,.35);}
  #hotdog-ebook #hd-pages .callout-amber{background:rgba(186,117,23,.08);border-color:rgba(186,117,23,.35);}
  #hotdog-ebook #hd-pages .callout-teal{background:rgba(29,158,117,.08);border-color:rgba(29,158,117,.35);}
  #hotdog-ebook #hd-pages .callout-title{font-weight:700;margin:0 0 .3em;}
  #hotdog-ebook #hd-pages table{border-collapse:collapse;width:100%;margin:1em 0;font-size:.9em;}
  #hotdog-ebook #hd-pages th,#hotdog-ebook #hd-pages td{padding:.5em .7em;border-bottom:1px solid var(--line);text-align:left;}
  #hotdog-ebook #hd-pages th{font-weight:600;background:rgba(127,127,127,.06);}
  #hotdog-ebook #hd-pages .closing{text-align:center;margin-top:2em;color:var(--muted);}
  #hotdog-ebook #hd-pages .closing-mark{font-family:"Times New Roman",serif;font-style:italic;font-size:1.4em;}
  #hotdog-ebook #hd-pages [data-sec]{break-before:column;}
  #hotdog-ebook #hd-pages [data-sec]:first-child{break-before:auto;}
  #hotdog-ebook .sheet{position:absolute;inset:0;z-index:40;display:none;}
  #hotdog-ebook .sheet.open{display:block;}
  #hotdog-ebook .sheet .backdrop{position:absolute;inset:0;background:rgba(0,0,0,.4);}
  #hotdog-ebook .sheet .panel{position:absolute;top:0;bottom:0;left:0;width:min(86vw,360px);background:var(--panel);border-right:1px solid var(--line);padding:16px 12px;overflow-y:auto;transform:translateX(-100%);transition:transform .25s ease;}
  #hotdog-ebook .sheet.open .panel{transform:none;}
  #hotdog-ebook .sheet h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:8px 8px 6px;}
  #hotdog-ebook .booksel{display:flex;flex-direction:column;gap:4px;margin-bottom:14px;}
  #hotdog-ebook .booksel a{text-align:left;padding:10px 12px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);text-decoration:none;}
  #hotdog-ebook .booksel a.active{border-color:var(--accent);color:var(--accent);font-weight:700;}
  #hotdog-ebook .toc a{display:block;padding:9px 12px;border-radius:8px;color:var(--ink);text-decoration:none;cursor:pointer;}
  #hotdog-ebook .toc a:active,#hotdog-ebook .toc a.active{background:var(--accent);color:#fff;}
  html.hd-ebook-active,html.hd-ebook-active body{overflow:hidden;}
  `;

  function boot() {
  const idMatch = location.pathname.match(/\/staffhotdog\/book(\d+)\/?/);
  if (!idMatch) return;
  const bookId = idMatch[1];
  const src = document.querySelector('.sl-markdown-content');
  if (!src) return;

  function build() {
    document.documentElement.classList.add('hd-ebook-active');
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = 'hotdog-ebook';
    // 테마: 저장값 우선, 없으면 시스템
    let theme = localStorage.getItem('hd.theme');
    if (theme !== 'light' && theme !== 'dark') theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.dataset.ebookTheme = theme;
    root.innerHTML = `
      <div class="bar top">
        <button class="iconbtn" id="hd-menuBtn" aria-label="목차/책">☰</button>
        <span class="title" id="hd-title">스태프 핫도그</span>
        <span class="spacer"></span>
        <a class="iconbtn wide" id="hd-srcLink" href="#" title="원문으로">📄 원문</a>
        <button class="iconbtn" id="hd-themeBtn" aria-label="라이트/다크 전환">☾</button>
        <button class="iconbtn" id="hd-fontDown" aria-label="글자 작게">A−</button>
        <button class="iconbtn" id="hd-fontUp" aria-label="글자 크게">A+</button>
      </div>
      <div id="hd-stage">
        <div id="hd-viewport"><div id="hd-pages"></div></div>
        <div class="zone l" id="hd-zoneL"></div>
        <div class="zone c" id="hd-zoneC"></div>
        <div class="zone r" id="hd-zoneR"></div>
        <button class="navarrow l" id="hd-arrowL" aria-label="이전">‹</button>
        <button class="navarrow r" id="hd-arrowR" aria-label="다음">›</button>
      </div>
      <div class="bar bottom">
        <span id="hd-chapter">—</span>
        <input type="range" id="hd-scrub" min="0" max="0" value="0" />
        <button id="hd-pageInfo" aria-label="목차 열기" title="목차">0</button>
      </div>
      <div class="sheet" id="hd-sheet">
        <div class="backdrop" id="hd-backdrop"></div>
        <div class="panel">
          <h2>권 선택</h2><div class="booksel" id="hd-booksel"></div>
          <h2>목차</h2><div class="toc" id="hd-toc"></div>
        </div>
      </div>`;
    document.body.appendChild(root);
    return root;
  }

  const root = build();
  const $ = (id) => root.querySelector('#' + id);
  const pagesEl = $('hd-pages'), viewport = $('hd-viewport'), stage = $('hd-stage');
  let page = 0, totalPages = 0, pageStep = 0, sectionPages = [], sections = [];
  let fs = Number(localStorage.getItem('hd.fs')) || 17;
  root.style.setProperty('--hd-fs', fs + 'px');

  // 원문 콘텐츠를 복제 → 불필요 요소 제거 → h2(챕터)별 섹션으로 그룹
  // 챕터(h2) 단위로 분할. 콘텐츠 표준이 일관(평탄 구조, h2는 Starlight가
  // div.sl-heading-wrapper로 감쌈)이므로 한 가지 경로만 다룬다.
  function buildSections() {
    const clone = src.cloneNode(true);
    clone.querySelectorAll('.ebook-launch, .sl-anchor-link, a[aria-hidden="true"]').forEach((e) => e.remove());
    const sections = [];
    let cur = null;
    Array.from(clone.children).forEach((child) => {
      const h2 = child.tagName === 'H2' ? child : child.querySelector(':scope > h2');
      if (h2) { cur = { label: h2.textContent.trim(), d: document.createElement('div') }; sections.push(cur); }
      else if (!cur) { cur = { label: '', d: document.createElement('div') }; sections.push(cur); }
      cur.d.appendChild(child.cloneNode(true));
    });
    sections.forEach((s) => { s.html = s.d.innerHTML; delete s.d; });
    return sections.filter((s) => s.html.trim());
  }

  function buildToc() {
    const toc = $('hd-toc'); toc.innerHTML = '';
    sections.forEach((s, i) => {
      if (!s.label) return;
      const a = document.createElement('a'); a.textContent = s.label; a.dataset.sec = i;
      a.onclick = (e) => { e.preventDefault(); closeSheet(); goTo(sectionPages[i] || 0); };
      toc.appendChild(a);
    });
  }

  function measure() {
    pagesEl.style.transition = 'none';
    pagesEl.style.transform = 'translateX(0)';
    const vw = pagesEl.clientWidth;
    const gap = parseFloat(getComputedStyle(pagesEl).columnGap) || 0;
    pagesEl.style.columnWidth = vw + 'px';
    pageStep = vw + gap;
    totalPages = Math.max(1, Math.round((pagesEl.scrollWidth + gap) / pageStep));
    const pl = pagesEl.getBoundingClientRect().left;
    sectionPages = sections.map((_, i) => {
      const el = pagesEl.querySelector(`[data-sec="${i}"]`);
      return el ? Math.round((el.getBoundingClientRect().left - pl) / pageStep) : 0;
    });
    $('hd-scrub').max = totalPages - 1;
    requestAnimationFrame(() => { pagesEl.style.transition = 'transform .3s ease'; });
  }

  function curSectionLabel() {
    let label = '';
    for (let i = 0; i < sectionPages.length; i++) if (sectionPages[i] <= page) label = sections[i].label || label;
    return label;
  }

  function goTo(p, animate = true) {
    page = Math.max(0, Math.min(p, totalPages - 1));
    if (!animate) pagesEl.style.transition = 'none';
    pagesEl.style.transform = `translateX(${-page * pageStep}px)`;
    if (!animate) requestAnimationFrame(() => pagesEl.style.transition = 'transform .3s ease');
    $('hd-pageInfo').textContent = page + 1;
    $('hd-scrub').value = page;
    $('hd-chapter').textContent = curSectionLabel();
    root.querySelectorAll('#hd-toc a').forEach((a) => {
      a.classList.toggle('active', sectionPages[+a.dataset.sec] <= page &&
        (+a.dataset.sec === sectionPages.length - 1 || sectionPages[+a.dataset.sec + 1] > page));
    });
    localStorage.setItem('hd.page.' + bookId, page);
  }
  const next = () => goTo(page + 1);
  const prev = () => goTo(page - 1);

  async function mount() {
    sections = buildSections();
    pagesEl.innerHTML = sections.map((s, i) => `<div data-sec="${i}">${s.html}</div>`).join('');
    buildToc();
    const imgs = Array.from(pagesEl.querySelectorAll('img'));
    await Promise.all(imgs.map((im) => im.complete ? null : new Promise((r) => { im.onload = im.onerror = r; })));
    measure();
    const saved = Number(localStorage.getItem('hd.page.' + bookId));
    goTo(Number.isFinite(saved) ? Math.min(saved, totalPages - 1) : 0, false);

    // 권 목록 + 제목 (index.json)
    try {
      const books = await (await fetch(`${BASE}/staffhotdog/content/index.json`)).json();
      const me = books.find((b) => b.id === bookId);
      $('hd-title').textContent = me ? me.title.split('—')[0].trim() : (document.title.split('|')[0].trim());
      const sel = $('hd-booksel');
      books.forEach((b) => {
        const a = document.createElement('a');
        a.textContent = b.title.replace(/^스태프 핫도그\s*/, '').trim();
        a.href = `${BASE}/staffhotdog/book${b.id}/?view=book`;
        if (b.id === bookId) a.className = 'active';
        sel.appendChild(a);
      });
    } catch (e) {
      $('hd-title').textContent = document.title.split('|')[0].trim();
    }
  }

  // 원문으로: 같은 경로에서 ?view=book 제거 → 전체 새로고침
  $('hd-srcLink').href = location.pathname;

  // 입력
  let justSwiped = false;
  $('hd-zoneR').onclick = () => { if (!justSwiped) next(); };
  $('hd-zoneL').onclick = () => { if (!justSwiped) prev(); };
  $('hd-zoneC').onclick = () => { if (!justSwiped) root.classList.toggle('immersive'); };
  $('hd-arrowL').onclick = prev; $('hd-arrowR').onclick = next;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') prev();
  });
  $('hd-scrub').addEventListener('input', (e) => goTo(+e.target.value));

  let dragX = 0, dragging = false, moved = false;
  stage.addEventListener('touchstart', (e) => { if (e.touches.length !== 1) return; dragging = true; moved = false; dragX = e.touches[0].clientX; pagesEl.style.transition = 'none'; }, { passive: true });
  stage.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - dragX; if (Math.abs(dx) > 6) moved = true;
    const base = -page * pageStep; let t = base + dx; const min = -(totalPages - 1) * pageStep;
    if (t > 0) t *= .35; if (t < min) t = min + (t - min) * .35;
    pagesEl.style.transform = `translateX(${t}px)`;
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (!dragging) return; dragging = false; pagesEl.style.transition = 'transform .3s ease';
    const dx = e.changedTouches[0].clientX - dragX; const thresh = Math.min(80, pageStep * .2);
    if (dx <= -thresh) next(); else if (dx >= thresh) prev(); else goTo(page);
    if (moved) { justSwiped = true; setTimeout(() => { justSwiped = false; }, 400); }
  }, { passive: true });

  function setFont(v) {
    fs = Math.max(13, Math.min(24, v)); localStorage.setItem('hd.fs', fs);
    root.style.setProperty('--hd-fs', fs + 'px');
    const label = curSectionLabel(); measure();
    const i = sections.findIndex((s) => s.label === label);
    goTo(i >= 0 ? sectionPages[i] : 0, false);
  }
  $('hd-fontUp').onclick = () => setFont(fs + 1);
  $('hd-fontDown').onclick = () => setFont(fs - 1);

  const syncThemeIcon = () => { $('hd-themeBtn').textContent = root.dataset.ebookTheme === 'dark' ? '☀' : '☾'; };
  syncThemeIcon();
  $('hd-themeBtn').onclick = () => {
    const nx = root.dataset.ebookTheme === 'dark' ? 'light' : 'dark';
    root.dataset.ebookTheme = nx; localStorage.setItem('hd.theme', nx); syncThemeIcon();
  };

  const openSheet = () => $('hd-sheet').classList.add('open');
  const closeSheet = () => $('hd-sheet').classList.remove('open');
  $('hd-menuBtn').onclick = openSheet;
  $('hd-pageInfo').onclick = openSheet;
  $('hd-backdrop').onclick = closeSheet;

  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => {
    const label = curSectionLabel(); measure();
    const i = sections.findIndex((s) => s.label === label);
    goTo(i >= 0 ? sectionPages[i] : Math.min(page, totalPages - 1), false);
  }, 150); });

  mount();
  }

  // 동적 주입 스크립트는 defer가 무시되므로 DOM 준비를 직접 기다린다(WebKit에서 본문 전 실행 방지)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
