/* =========================================================
   모의고사 — 실전 타이머 + 음성 안내
   ========================================================= */
(() => {
  'use strict';

  const EXAMS = Array.isArray(window.MOCK_EXAMS) ? window.MOCK_EXAMS.filter(Boolean) : [];
  let currentExam = EXAMS[0] || null;
  const STORE_KEY = 'speaking-routine-mock-v1';
  const MOCK_LOCK_KEY = 'speaking-routine-mock-lock';
  const LOCK_TTL = 30000;
  const LOCK_BEAT = 10000;
  const ABORT = { abort: true };

  const KIND_LABEL = {
    1: '지문 읽기',
    2: '그림 묘사',
    3: '인터뷰',
    4: '정보 활용',
    5: '의견 말하기',
  };

  const MODE_HINT = {
    exam: '실제 시험처럼 타이머가 자동으로 진행됩니다.',
    practice: '타이머 없이 문항을 넘겨보고, 필요할 때만 그 문항을 타이머로 풀 수 있습니다.',
    guide: '문항별 모범 답안과 발음 가이드를 봅니다.',
  };

  const MODE_START = {
    exam: '응시 시작',
    practice: '연습 시작',
    guide: '해설 보기',
  };

  const root = document.getElementById('ex-root');
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  // 시험 시간을 그대로 두는 것이 기본. 로컬(사설망)에서만 ?speed= 로 배속 검증한다.
  const LOCAL_ENV = /^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/;
  const SPEED = LOCAL_ENV.test(location.hostname)
    ? Math.max(1, Math.min(60, Number(new URLSearchParams(location.search).get('speed')) || 1))
    : 1;

  let runToken = 0;
  let examVoices = { narrator: null, interviewer: null };
  let skipResolve = null;
  let attempt = null;
  let els = null;
  let audioCtx = null;
  let mode = 'exam';
  let selectedMode = 'exam';
  let practiceList = [];
  let practiceIndex = 0;
  let starting = false;
  let lockTimer = 0;

  function totalQuestions(exam = currentExam) {
    return exam ? exam.parts.reduce((sum, part) => sum + part.questions.length, 0) : 0;
  }

  function guideFor(exam = currentExam) {
    return (window.MOCK_GUIDES && exam && window.MOCK_GUIDES[exam.id]) || null;
  }

  // ---------- 유틸 ----------
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));

  function uid() {
    return `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }

  function fmtClock(seconds) {
    const total = Math.max(0, Math.round(seconds));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  function normalizeAttempt(entry) {
    return {
      id: typeof entry.id === 'string' && entry.id ? entry.id.slice(0, 40) : uid(),
      examId: typeof entry.examId === 'string' && entry.examId ? entry.examId.slice(0, 40) : 'mock-01',
      at: typeof entry.at === 'string' && !Number.isNaN(Date.parse(entry.at)) ? entry.at : new Date().toISOString(),
      seconds: Math.max(0, Math.min(86400, Math.round(Number(entry.seconds) || 0))),
      total: Math.max(0, Math.min(99, Math.round(Number(entry.total) || 0))),
      ratings: entry.ratings && typeof entry.ratings === 'object' && !Array.isArray(entry.ratings)
        ? entry.ratings
        : {},
    };
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (!data || !Array.isArray(data.attempts)) return { attempts: [] };
      return {
        attempts: data.attempts
          .filter((entry) => entry && typeof entry === 'object')
          .map(normalizeAttempt)
          .slice(0, 50),
      };
    } catch (error) {
      return { attempts: [] };
    }
  }

  function saveStore(store) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      return true;
    } catch (error) {
      return false;
    }
  }

  function upsertAttempt(entry) {
    const store = loadStore();
    const index = store.attempts.findIndex((item) => item.id === entry.id);
    if (index >= 0) store.attempts[index] = entry;
    else store.attempts.unshift(entry);
    store.attempts = store.attempts.slice(0, 50);
    return saveStore(store);
  }

  // ---------- 응시 잠금 ----------
  // 응시 중 다른 탭에서 기록 초기화/가져오기를 하지 못하게 한다.
  function holdExamLock() {
    const write = () => {
      try { localStorage.setItem(MOCK_LOCK_KEY, JSON.stringify({ at: Date.now() })); } catch (error) { /* noop */ }
    };
    write();
    window.clearInterval(lockTimer);
    lockTimer = window.setInterval(write, LOCK_BEAT);
  }

  function releaseExamLock() {
    if (lockTimer) {
      window.clearInterval(lockTimer);
      lockTimer = 0;
    }
    try { localStorage.removeItem(MOCK_LOCK_KEY); } catch (error) { /* noop */ }
  }

  // ---------- 소리 ----------
  function beep(kind) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.value = kind === 'end' ? 620 : 840;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'end' ? 0.5 : 0.22));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + (kind === 'end' ? 0.55 : 0.26));
    } catch (error) { /* noop */ }
  }

  function speak(text, role) {
    return new Promise((resolve) => {
      if (!synth || !text || SPEED > 1) { resolve(false); return; }
      let busy = false;
      try { busy = Boolean(synth.speaking || synth.pending); } catch (error) { /* noop */ }
      if (busy) {
        // iOS는 cancel 직후 speak를 버리는 경우가 있어 한 박자 쉰다.
        try { synth.cancel(); } catch (error) { /* noop */ }
      }

      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = role === 'interviewer' ? 0.88 : 0.92;
      utter.pitch = 1;
      const voice = role === 'interviewer' ? examVoices.interviewer : examVoices.narrator;
      if (voice) utter.voice = voice;

      const words = String(text).trim().split(/\s+/).length;
      const limit = (words / (150 * utter.rate)) * 60000 + 3500;
      let done = false;
      let started = false;
      let timer = 0;

      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        resolve(started);
      };

      utter.onstart = () => { started = true; };
      utter.onend = finish;
      utter.onerror = finish;
      timer = window.setTimeout(finish, limit);

      try {
        if (busy) window.setTimeout(() => { try { synth.speak(utter); } catch (error) { finish(); } }, 90);
        else synth.speak(utter);
      } catch (error) {
        finish();
      }
    });
  }

  function stopSpeech() {
    if (!synth) return;
    try { synth.cancel(); } catch (error) { /* noop */ }
  }

  function fireSkip() {
    const fn = skipResolve;
    skipResolve = null;
    if (fn) fn();
  }

  // ---------- 홈 ----------
  function paintHome() {
    document.body.classList.remove('ex-locked');
    releaseExamLock();
    stopSpeech();
    runToken += 1;
    attempt = null;
    document.title = '모의고사 · 스피킹 루틴';

    const store = loadStore();

    const slots = [
      { id: 'mock-01', label: '모의고사 1' },
      { id: 'mock-02', label: '모의고사 2' },
      { id: 'mock-03', label: '모의고사 3' },
    ].map((slot, index) => {
      const exam = EXAMS.find((item) => item.id === slot.id);
      const on = Boolean(exam);
      const meta = on
        ? `Part 1~5 · ${exam.parts.reduce((n, p) => n + p.questions.length, 0)}문항 · 약 ${Math.round(estimateSeconds(exam) / 60)}분`
        : '다음 영상으로 준비 중';
      return `
        <button class="ex-card ${on ? 'on' : 'off'}" ${on ? `data-act="intro" data-exam="${esc(slot.id)}"` : 'disabled'} type="button">
          <span class="ex-card-num">${index + 1}</span>
          <span class="ex-card-body">
            <span class="ex-card-title">${esc(slot.label)}</span>
            <span class="ex-card-meta">${esc(meta)}</span>
          </span>
          <span class="ex-card-cta">${on ? '응시하기' : '준비 중'}</span>
        </button>`;
    }).join('');

    const recent = store.attempts.slice(0, 3);
    const historyMarkup = recent.length
      ? `<div class="ex-history">
           <p class="ex-history-title">최근 응시</p>
           <ul>${recent.map((item) => (
             `<li><span>${esc(formatWhen(item.at))}</span><b>${fmtClock(item.seconds)}</b><i>${item.total}문항</i></li>`
           )).join('')}</ul>
         </div>`
      : '<p class="ex-last">아직 응시 기록이 없습니다.</p>';

    root.innerHTML = `
      <div class="ex-home">
        <div class="ex-wrap">
          <a class="ex-back" href="index.html">← 스피킹 루틴</a>
          <div class="ex-home-head">
            <h1 class="ex-h1">모의고사</h1>
            <p class="ex-sub">실제 시험과 같은 순서·시간으로 Part 1~5를 한 번에 연습합니다.</p>
          </div>
          <div class="ex-cards">${slots}</div>
          ${historyMarkup}
          <p class="ex-note">
            Part 3은 질문이 화면에 표시되고, Part 4 질문은 음성으로만 재생됩니다.<br>
            타이머는 자동으로 넘어가며, 점수나 발음 평가는 없습니다.
          </p>
        </div>
      </div>`;
  }

  function formatWhen(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('ko-KR', {
      month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function estimateSeconds(exam) {
    let seconds = 0;
    exam.parts.forEach((part) => {
      if (part.readingSeconds) seconds += part.readingSeconds;
      part.questions.forEach((q) => {
        seconds += q.prepSeconds + q.responseSeconds;
      });
    });
    return seconds + 90;
  }

  // ---------- 시험 소개 ----------
  function paintIntro(examId) {
    document.body.classList.remove('ex-locked');
    const exam = EXAMS.find((item) => item.id === examId) || currentExam || EXAMS[0];
    if (!exam) return;
    currentExam = exam;
    stopSpeech();
    runToken += 1;

    root.innerHTML = `
      <div class="ex-home">
        <div class="ex-wrap">
          <a class="ex-back" href="#" data-act="home">← 모의고사 목록</a>
          <div class="ex-home-head">
            <h1 class="ex-h1">${esc(exam.title)}</h1>
            <p class="ex-sub">${esc(exam.subtitle)}</p>
          </div>

          <div class="ex-stats">
            <div class="ex-stat"><b>5</b><span>파트</span></div>
            <div class="ex-stat"><b>${totalQuestions()}</b><span>문항</span></div>
            <div class="ex-stat"><b>${Math.round(estimateSeconds(exam) / 60)}분</b><span>예상 소요</span></div>
          </div>

          <div class="ex-directions">
            <p><strong>Part 1</strong> 지문 읽기 · 2문항</p>
            <p><strong>Part 2</strong> 그림 묘사 · 2문항</p>
            <p><strong>Part 3</strong> 인터뷰 · 3문항</p>
            <p><strong>Part 4</strong> 정보 활용 · 3문항</p>
            <p><strong>Part 5</strong> 의견 말하기 · 1문항</p>
          </div>

          <p class="ex-hint">
            Part 3은 질문이 화면에 표시되고, Part 4 질문은 음성으로만 재생됩니다. 이어폰을 권장합니다.<br>
            중간에 멈출 수 없고, 종료 후 문항별 자기평가만 기록합니다.
          </p>

          <div class="ex-seg" role="group" aria-label="진행 방식">
            <button type="button" data-act="mode" data-mode="exam" aria-pressed="${selectedMode === 'exam' ? 'true' : 'false'}">실전 시험</button>
            <button type="button" data-act="mode" data-mode="practice" aria-pressed="${selectedMode === 'practice' ? 'true' : 'false'}">연습</button>
            <button type="button" data-act="mode" data-mode="guide" aria-pressed="${selectedMode === 'guide' ? 'true' : 'false'}">해설</button>
          </div>
          <p class="ex-hint" id="ex-mode-hint">${MODE_HINT[selectedMode]}</p>

          <div class="ex-actions">
            <button class="ex-btn" data-act="start" type="button">${MODE_START[selectedMode]}</button>
          </div>
        </div>
      </div>`;

    document.title = `${exam.title} · 스피킹 루틴`;
  }

  // ---------- 시험 화면 ----------
  function mountShell(kind) {
    mode = kind === 'guide' ? 'guide' : (kind === 'practice' ? 'practice' : 'exam');
    document.body.classList.add('ex-locked');
    const paged = mode !== 'exam';

    let dockMarkup;
    if (!paged) {
      dockMarkup = `<footer class="ex-dock idle" id="ex-dock">
          <div class="ex-dock-in">
            <span class="ex-phase" id="ex-phase">대기</span>
            <span class="ex-time" id="ex-time">--</span>
            <span class="ex-track"><span id="ex-fill" style="width:0%"></span></span>
          </div>
        </footer>`;
    } else {
      const middle = mode === 'practice'
        ? `<button class="ex-timer-btn" data-act="ptimer" type="button">
             <span class="ex-phase" id="ex-phase">타이머</span>
             <span class="ex-time" id="ex-time">--</span>
           </button>`
        : `<span class="ex-timer-btn static">
             <span class="ex-phase" id="ex-phase">해설</span>
             <span class="ex-time" id="ex-time" hidden>--</span>
           </span>`;
      dockMarkup = `<footer class="ex-dock idle practice" id="ex-dock">
          <span class="ex-track ex-track-top"><span id="ex-fill" style="width:0%"></span></span>
          <div class="ex-dock-in ex-practice-in">
            <button class="ex-nav" data-act="prev" type="button">← 이전</button>
            ${middle}
            <button class="ex-nav" data-act="next" type="button">다음 →</button>
          </div>
        </footer>`;
    }

    root.innerHTML = `
      <header class="ex-top">
        <div class="ex-top-l">
          <span class="ex-tag">${esc((currentExam && currentExam.title) || '모의고사')}</span>
          <span class="ex-tag part" id="ex-part">Part 1</span>
        </div>
        <span class="ex-count" id="ex-count" aria-live="polite">0 / ${totalQuestions()}</span>
        <div class="ex-top-r">
          <button class="ex-quit" data-act="${paged ? 'leave' : 'quit'}" type="button">${paged ? '나가기' : '그만두기'}</button>
        </div>
      </header>
      <div class="ex-bar"><span id="ex-bar-fill" style="width:0%"></span></div>
      <section class="ex-stage"><div class="ex-stage-in" id="ex-stage"></div></section>
      ${dockMarkup}`;

    els = {
      part: document.getElementById('ex-part'),
      count: document.getElementById('ex-count'),
      bar: document.getElementById('ex-bar-fill'),
      stage: document.getElementById('ex-stage'),
      dock: document.getElementById('ex-dock'),
      phase: document.getElementById('ex-phase'),
      time: document.getElementById('ex-time'),
      fill: document.getElementById('ex-fill'),
    };
  }

  function mountExam() {
    mountShell('exam');
  }

  function setChrome(partNo, questionNo) {
    if (!els) return;
    els.part.textContent = `Part ${partNo}`;
    if (questionNo) {
      els.count.textContent = `Q${questionNo} / ${totalQuestions()}`;
      els.bar.style.width = `${Math.round((questionNo / totalQuestions()) * 100)}%`;
    } else {
      els.count.textContent = `Part ${partNo}`;
    }
    els.stage.scrollTop = 0;
  }

  function dockClasses(extra) {
    const parts = ['ex-dock'];
    if (mode !== 'exam') parts.push('practice');
    if (extra) parts.push(extra);
    return parts.join(' ');
  }

  function dockIdle(label) {
    if (!els) return;
    els.dock.className = dockClasses('idle');
    els.phase.textContent = label || '대기';
    els.time.textContent = '--';
    els.fill.style.width = '0%';
  }

  function countdown(seconds, label, token, dockKind) {
    return new Promise((resolve, reject) => {
      const total = (Math.max(1, seconds) * 1000) / SPEED;
      const start = Date.now();
      els.dock.className = dockClasses(dockKind === 'respond' ? 'respond' : 'prep');
      els.phase.textContent = label;

      const paint = (left) => {
        els.time.textContent = String(Math.ceil(Math.max(0, left) / 1000));
        els.fill.style.width = `${((Math.max(0, left) / total) * 100).toFixed(1)}%`;
        els.dock.classList.toggle('hurry', left <= 3000 && total >= 6000);
      };

      paint(total);
      const id = window.setInterval(() => {
        if (token !== runToken || !els) {
          window.clearInterval(id);
          reject(ABORT);
          return;
        }
        const left = total - (Date.now() - start);
        paint(left);
        if (left <= 0) {
          window.clearInterval(id);
          resolve();
        }
      }, 100);
    });
  }

  function wait(ms, token) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (token !== runToken) reject(ABORT);
        else resolve();
      }, ms);
    });
  }

  // ---------- 문제 화면 ----------
  function listenBlock(q, phase) {
    const times = q.heardTwice ? '두 번 재생됩니다.' : '한 번만 재생됩니다.';
    if (phase === 'respond') {
      return `<div class="ex-listen"><span>답변 중입니다. 질문은 다시 나오지 않습니다.</span></div>`;
    }
    const label = phase === 'replay' ? '질문을 다시 들려줍니다.' : '질문이 재생됩니다.';
    return `<div class="ex-listen">
      <span class="ex-wave"><i></i><i></i><i></i><i></i><i></i></span>
      <span>${label} ${times}</span>
    </div>`;
  }

  // 같은 지문·표가 계속 보이는 파트에서 현재 문항을 눈으로 구분할 수 있게 한다.
  function stepper(part, currentNo, clickable) {
    if (!part.questions || part.questions.length < 2) return '';
    return `<div class="ex-stepper">${part.questions.map((item) => {
      const on = item.no === currentNo;
      const cls = `ex-step${on ? ' on' : ''}`;
      const current = on ? 'step' : 'false';
      if (!clickable) return `<span class="${cls}" aria-current="${current}">${item.no}</span>`;
      return `<button class="${cls}" type="button" data-act="jump" data-no="${item.no}" aria-current="${current}" aria-label="Question ${item.no}로 이동">${item.no}</button>`;
    }).join('')}</div>`;
  }

  function questionMarkup(part, q, phase, forceText) {
    const head = `<div class="ex-q-head">
      <span class="ex-q-no">Question ${q.no} of ${totalQuestions()}</span>
      <span class="ex-q-kind">${esc(KIND_LABEL[part.part] || '')}</span>
    </div>${stepper(part, q.no)}`;

    let body = '';
    if (part.part === 1) {
      body = `<p class="ex-text">${esc(q.text)}</p>`;
    } else if (part.part === 2) {
      body = `<figure class="ex-figure">
        <img src="assets/mock/${esc(q.image)}" alt="묘사할 그림">
      </figure>`;
    } else if (part.part === 3) {
      // 실제 시험처럼 상황 지문과 질문을 함께 보여준다.
      body = `${part.context ? `<div class="ex-context">${esc(part.context)}</div>` : ''}
        <p class="ex-prompt">${esc(q.prompt)}</p>`;
    } else if (part.part === 4) {
      // 음성이 없거나 실제로 재생되지 않으면 질문을 화면에 노출한다.
      body = `<figure class="ex-figure wide">
          <img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기">
        </figure>
        ${(synth && !forceText) ? '' : `<p class="ex-prompt">${esc(q.prompt)}</p>`}
        ${listenBlock(q, phase)}`;
    } else {
      body = `<p class="ex-prompt">${esc(q.prompt)}</p>`;
    }

    return `<div class="ex-q">${head}${body}</div>`;
  }

  // ---------- 연습 모드 ----------
  function buildPracticeList(exam) {
    return exam.parts.flatMap((part) => part.questions.map((q) => ({ part, q })));
  }

  function practiceMarkup(part, q) {
    const head = `<div class="ex-q-head">
      <span class="ex-q-no">Question ${q.no} of ${totalQuestions()}</span>
      <span class="ex-q-kind">${esc(KIND_LABEL[part.part] || '')}</span>
    </div>${stepper(part, q.no, true)}`;

    let body = '';
    if (part.part === 1) {
      body = `<p class="ex-text">${esc(q.text)}</p>`;
    } else if (part.part === 2) {
      body = `<figure class="ex-figure">
          <img src="assets/mock/${esc(q.image)}" alt="묘사할 그림">
        </figure>`;
    } else if (part.part === 3) {
      body = `${part.context ? `<div class="ex-context">${esc(part.context)}</div>` : ''}
        <p class="ex-prompt">${esc(q.prompt)}</p>
        <div class="ex-actions ex-actions-left">
          <button class="ex-btn ghost sm" data-act="play-q" type="button">질문 듣기</button>
        </div>`;
    } else if (part.part === 4) {
      body = `<figure class="ex-figure wide">
          <img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기">
        </figure>
        <p class="ex-prompt">${esc(q.prompt)}</p>
        <div class="ex-actions ex-actions-left">
          <button class="ex-btn ghost sm" data-act="play-q" type="button">질문 듣기</button>
        </div>`;
    } else {
      body = `<p class="ex-prompt">${esc(q.prompt)}</p>
        <div class="ex-actions ex-actions-left">
          <button class="ex-btn ghost sm" data-act="play-q" type="button">질문 듣기</button>
        </div>`;
    }

    return `<div class="ex-q">${partBar(part.part)}${head}${body}</div>`;
  }

  // ---------- 해설 모드 ----------
  function guideEntry(q) {
    const guide = guideFor();
    return guide && guide.questions ? guide.questions[q.no] || null : null;
  }

  function keyElementsMarkup(q) {
    if (!Array.isArray(q.keyElements) || !q.keyElements.length) return '';
    return `<section class="gd-block">
      <h3 class="gd-title">핵심 요소</h3>
      <div class="ex-chips">${q.keyElements.map((item) => `<span class="ex-chip">${esc(item)}</span>`).join('')}</div>
    </section>`;
  }

  function modelBlock(entry) {
    if (!entry || !entry.model) {
      return `<section class="gd-block"><h3 class="gd-title">모범 답안</h3><p class="ex-note-sm">준비 중입니다.</p></section>`;
    }
    const patterns = Array.isArray(entry.patterns) && entry.patterns.length
      ? `<section class="gd-block">
           <h3 class="gd-title">사용한 만능문장</h3>
           <ul class="gd-patterns">${entry.patterns.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
         </section>`
      : '';
    return `<section class="gd-block">
        <h3 class="gd-title">모범 답안</h3>
        <p class="gd-model">${esc(entry.model)}</p>
        ${entry.ko ? `<p class="gd-ko">${esc(entry.ko)}</p>` : ''}
      </section>${patterns}`;
  }

  function renderEnglishMarks(text, points) {
    const byIndex = new Map();
    points.forEach((point) => {
      if (Number.isInteger(point.index) && !byIndex.has(point.index)) byIndex.set(point.index, point);
    });
    let tokenIndex = 0;
    return String(text).split(/([A-Za-z]+(?:[-'][A-Za-z]+)*)/).map((chunk) => {
      if (!/^[A-Za-z]/.test(chunk)) return esc(chunk);
      const index = tokenIndex;
      tokenIndex += 1;
      const point = byIndex.get(index);
      if (!point) return esc(chunk);
      return `<mark class="pg-mark pg-${esc(point.tag)}"><span class="pg-word">${esc(chunk)}</span><sup class="pg-num" aria-hidden="true">${point.num}</sup></mark>`;
    }).join('');
  }

  function renderPronMarks(pron, points) {
    const ranges = [];
    points.forEach((point) => {
      if (!point.ko) return;
      let from = 0;
      while (from <= pron.length - point.ko.length) {
        const start = pron.indexOf(point.ko, from);
        if (start < 0) return;
        const end = start + point.ko.length;
        if (!ranges.some((range) => start < range.end && end > range.start)) {
          ranges.push({ start, end, tag: point.tag, num: point.num });
          return;
        }
        from = start + 1;
      }
    });
    ranges.sort((a, b) => a.start - b.start);
    let html = '';
    let cursor = 0;
    ranges.forEach((range) => {
      html += esc(pron.slice(cursor, range.start));
      html += `<mark class="pg-ko pg-${esc(range.tag)}"><span class="pg-word">${esc(pron.slice(range.start, range.end))}</span><sup class="pg-num" aria-hidden="true">${range.num}</sup></mark>`;
      cursor = range.end;
    });
    return html + esc(pron.slice(cursor));
  }

  function pronGuideMarkup(text, pron) {
    if (!window.PRON_GUIDE || !text) return '';
    const built = window.PRON_GUIDE.build({ en: text });
    const points = (built && built.points) || [];
    if (!points.length) return '';
    const used = new Set(points.map((point) => point.tag));
    const legend = Object.entries(window.PRON_GUIDE.TAGS)
      .filter(([key]) => used.has(key))
      .map(([key, tag]) => `<span class="pg-chip pg-${esc(key)}">${esc(tag.label)}</span>`)
      .join('');
    const flow = built.flow && built.flow.chunked
      ? `<div class="pg-flow">
           <div class="pg-flow-head"><span class="pg-flow-badge">${esc(built.flow.partBadge || 'TS 억양·호흡')}</span><span class="pg-flow-label">억양 · 끊어 읽기</span></div>
           <p class="pg-flow-chunk">${esc(built.flow.chunked)}</p>
           <p class="pg-flow-tip">${esc(built.flow.tip || '')}</p>
         </div>`
      : '';
    const items = points.map((point) => `<li class="pg-item"><span class="pg-idx">${point.num}</span><span class="pg-text"><b>${esc(point.word)}</b> <span class="pg-ipa">${esc(point.ipa)}</span><span class="pg-tip">${esc(point.tip)}</span></span></li>`).join('');
    const englishLine = `<div class="pg-line"><p class="pg-line-label">영어 발음 표시</p><p class="pg-annotated-line">${renderEnglishMarks(text, points)}</p></div>`;
    const koreanLine = pron
      ? `<div class="pg-line"><p class="pg-line-label">한글 발음</p><p class="pg-plain-pron">${renderPronMarks(pron, points)}</p></div>`
      : '';
    return `<div class="pg-legend">${legend}</div>${englishLine}${koreanLine}${flow}<ol class="pg-list">${items}</ol>`;
  }

  function guideMarkup(part, q) {
    const head = `<div class="ex-q-head">
      <span class="ex-q-no">Question ${q.no} of ${totalQuestions()}</span>
      <span class="ex-q-kind">${esc(KIND_LABEL[part.part] || '')}</span>
    </div>${stepper(part, q.no, true)}`;

    const entry = guideEntry(q);
    let body = '';

    if (part.part === 1) {
      body = `<section class="gd-block"><h3 class="gd-title">발음 가이드</h3>${pronGuideMarkup(q.text, entry && entry.pron)}</section>`;
    } else if (part.part === 2) {
      body = `<figure class="ex-figure"><img src="assets/mock/${esc(q.image)}" alt="묘사할 그림"></figure>
        ${keyElementsMarkup(q)}${modelBlock(entry)}`;
    } else if (part.part === 3) {
      body = `${part.context ? `<div class="ex-context">${esc(part.context)}</div>` : ''}
        <p class="ex-prompt">${esc(q.prompt)}</p>${modelBlock(entry)}`;
    } else if (part.part === 4) {
      body = `<figure class="ex-figure wide"><img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기"></figure>
        <p class="ex-prompt">${esc(q.prompt)}</p>${modelBlock(entry)}`;
    } else {
      body = `<p class="ex-prompt">${esc(q.prompt)}</p>${modelBlock(entry)}`;
    }

    return `<div class="ex-q">${partBar(part.part)}${head}${body}</div>`;
  }

  function partBar(current) {
    const exam = currentExam;
    if (!exam) return '';
    return `<div class="ex-partbar">${exam.parts.map((part) => (
      `<button type="button" data-act="part" data-part="${part.part}" aria-pressed="${part.part === current ? 'true' : 'false'}" class="${part.part === current ? 'on' : ''}">Part ${part.part}</button>`
    )).join('')}</div>`;
  }

  function paintPractice() {
    const item = practiceList[practiceIndex];
    if (!item || !els) return;
    setChrome(item.part.part, item.q.no);
    els.stage.innerHTML = mode === 'guide'
      ? guideMarkup(item.part, item.q)
      : practiceMarkup(item.part, item.q);
    dockIdle(mode === 'guide' ? '해설' : '타이머');

    const prev = els.dock.querySelector('[data-act="prev"]');
    const next = els.dock.querySelector('[data-act="next"]');
    if (prev) prev.disabled = practiceIndex === 0;
    if (next) next.disabled = practiceIndex === practiceList.length - 1;
  }

  function goPractice(delta) {
    const target = practiceIndex + delta;
    if (target < 0 || target >= practiceList.length) return;
    runToken += 1;
    stopSpeech();
    practiceIndex = target;
    paintPractice();
  }

  function startPractice(kind) {
    const exam = currentExam;
    if (!exam) return;
    const target = kind === 'guide' ? 'guide' : 'practice';
    runToken += 1;
    stopSpeech();
    attempt = null;
    practiceList = buildPracticeList(exam);
    practiceIndex = 0;
    mountShell(target);
    document.title = target === 'guide'
      ? `${exam.title} 해설 · 스피킹 루틴`
      : `${exam.title} 연습 · 스피킹 루틴`;
    if (target === 'practice') beep('go');
    if (window.SpeechVoice) {
      window.SpeechVoice.load().then(() => { examVoices = window.SpeechVoice.examPair(); });
    }
    paintPractice();
  }

  function playPracticeQuestion() {
    const item = practiceList[practiceIndex];
    if (!item) return;
    const { part, q } = item;
    if (part.part === 5) {
      speak(q.prompt, 'interviewer');
      return;
    }
    if (part.part !== 3 && part.part !== 4) return;
    const token = runToken;
    speak(q.prompt, 'interviewer').then(() => {
      if (!q.heardTwice || token !== runToken) return;
      window.setTimeout(() => {
        if (token !== runToken) return;
        speak(q.prompt, 'interviewer');
      }, 700);
    });
  }

  async function runPracticeTimer() {
    const item = practiceList[practiceIndex];
    if (!item) return;
    const { part, q } = item;
    const audioOnly = part.part === 3 || part.part === 4;
    const token = ++runToken;

    try {
      if (audioOnly) {
        await speak(q.prompt, 'interviewer');
        if (q.heardTwice) {
          await wait(800, token);
          await speak(q.prompt, 'interviewer');
        }
        if (token !== runToken) return;
        els.stage.innerHTML = practiceMarkup(part, q);
        await countdown(q.prepSeconds, '준비', token);
        if (token !== runToken) return;
        beep('go');
        await countdown(q.responseSeconds, '응답', token, 'respond');
      } else {
        if (part.cues && part.cues.prep) await speak(part.cues.prep, 'narrator');
        if (token !== runToken) return;
        await countdown(q.prepSeconds, '준비', token);
        if (token !== runToken) return;
        if (part.cues && part.cues.start) await speak(part.cues.start, 'narrator');
        if (token !== runToken) return;
        await countdown(q.responseSeconds, '응답', token, 'respond');
      }
      if (token !== runToken) return;
      beep('end');
      dockIdle('타이머');
    } catch (error) {
      if (error !== ABORT) console.error(error);
    }
  }

  function introMarkup(part) {
    const first = part.questions[0] ? part.questions[0].no : part.part;
    const last = part.questions.length ? part.questions[part.questions.length - 1].no : part.part;
    return `<div class="ex-intro">
      <span class="ex-tag part">Part ${part.part}</span>
      <h1 class="ex-h1 ex-intro-title">Question ${first}–${last}: ${esc(part.label)}</h1>
      <p class="ex-sub">${part.questions.length}문항</p>
      <div class="ex-directions">
        <b class="ex-directions-label">Directions</b>
        <span class="en">${esc(part.directions)}</span>
      </div>
      <div class="ex-actions">
        <button class="ex-btn ghost sm" data-act="skip" type="button">건너뛰기</button>
      </div>
    </div>`;
  }

  function readingMarkup(part) {
    return `<div class="ex-q">
      <div class="ex-q-head">
        <span class="ex-q-no">Reading</span>
        <span class="ex-q-kind">정보 읽기</span>
      </div>
      <figure class="ex-figure wide">
        <img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기">
      </figure>
      <p class="ex-note-sm">${part.readingSeconds}초 동안 표를 읽습니다. 이어서 3개 질문이 재생됩니다.</p>
    </div>`;
  }

  // ---------- 진행 ----------
  function buildPlan(exam) {
    const plan = [];
    exam.parts.forEach((part) => {
      plan.push({ kind: 'intro', part });
      // 파트 3은 안내문 다음에 상황 지문을 따로 한 번 보여준다.
      if (part.part === 3 && part.context) plan.push({ kind: 'context', part });
      if (part.readingSeconds) plan.push({ kind: 'reading', part });
      part.questions.forEach((q) => plan.push({ kind: 'question', part, q }));
    });
    return plan;
  }

  function runIntro(step, token) {
    const part = step.part;
    setChrome(part.part, 0);
    els.stage.innerHTML = introMarkup(part);
    dockIdle('안내');

    // iOS가 cancel 직후 발화를 버리면 onerror로 즉시 끝난다.
    // 낭독이 끝나더라도 최소 4초는 안내문을 보여준다.
    const MIN_VISIBLE = Math.max(600, 4000 / SPEED);
    return new Promise((resolve) => {
      const startedAt = Date.now();
      let settled = false;
      let timer = 0;
      const done = () => {
        if (settled) return;
        settled = true;
        skipResolve = null;
        const left = MIN_VISIBLE - (Date.now() - startedAt);
        if (left > 0) timer = window.setTimeout(resolve, left);
        else resolve();
      };
      skipResolve = () => { stopSpeech(); if (timer) window.clearTimeout(timer); done(); };
      speak(part.directions, 'narrator').then(done);
      if (token !== runToken) done();
    });
  }

  async function runContext(step, token) {
    const part = step.part;
    setChrome(part.part, 0);
    els.stage.innerHTML = `<div class="ex-q">
      <div class="ex-q-head">
        <span class="ex-q-no">Situation</span>
        <span class="ex-q-kind">Part ${part.part}</span>
      </div>
      <div class="ex-context">${esc(part.context)}</div>
    </div>`;
    dockIdle('상황');
    // 낭독 없이 읽을 시간만 준다. 실제 시험에서도 상황 지문은 조용히 표시된다.
    await wait(Math.max(300, 3500 / SPEED), token);
  }

  async function runReading(step, token) {
    const part = step.part;
    setChrome(part.part, 0);
    els.stage.innerHTML = readingMarkup(part);
    await countdown(part.readingSeconds, '읽기', token);
  }

  async function runQuestion(step, token) {
    const part = step.part;
    const q = step.q;
    const audioOnly = part.part === 3 || part.part === 4;

    setChrome(part.part, q.no);

    if (audioOnly) {
      // Part 3은 질문이 화면에 있고, Part 4는 표만 보이므로 상태 문구를 갱신한다.
      const live = part.part === 4;
      els.stage.innerHTML = questionMarkup(part, q, 'listen');
      dockIdle('질문 듣기');
      const played = await speak(q.prompt, 'interviewer');
      let voiced = played;

      if (q.heardTwice) {
        await wait(900, token);
        voiced = await speak(q.prompt, 'interviewer') || voiced;
        if (live && voiced) els.stage.innerHTML = questionMarkup(part, q, 'replay');
      }

      if (token !== runToken) throw ABORT;

      // 질문 오디오가 끝난 뒤 삑 소리와 함께 준비 화면으로 넘어간다.
      beep('go');
      await wait(200, token);
      if (live) {
        els.stage.innerHTML = questionMarkup(part, q, 'prep', !voiced);
        if (!voiced) dockIdle('질문 표시');
      }
      await countdown(q.prepSeconds, '준비', token);

      if (token !== runToken) throw ABORT;
      beep('go');
      await wait(200, token);
      if (live) els.stage.innerHTML = questionMarkup(part, q, 'respond', !voiced);
      await countdown(q.responseSeconds, '응답', token, 'respond');
      return;
    }

    els.stage.innerHTML = questionMarkup(part, q, 'prep');
    if (part.cues && part.cues.prep) await speak(part.cues.prep, 'narrator');
    if (token !== runToken) throw ABORT;

    await countdown(q.prepSeconds, '준비', token);
    if (token !== runToken) throw ABORT;

    if (part.cues && part.cues.start) await speak(part.cues.start, 'narrator');
    if (token !== runToken) throw ABORT;

    // 안내 음성이 끝난 뒤 삑 소리와 함께 응답 화면으로 전환한다.
    beep('go');
    await wait(200, token);
    els.stage.innerHTML = questionMarkup(part, q, 'respond');
    await countdown(q.responseSeconds, '응답', token, 'respond');
  }

  async function startExam() {
    const exam = currentExam;
    if (!exam || starting) return;
    starting = true;

    try {
      if (window.SpeechVoice) {
        await window.SpeechVoice.load();
        examVoices = window.SpeechVoice.examPair();
      }
    } finally {
      starting = false;
    }
    beep('go');

    const token = ++runToken;
    attempt = {
      id: uid(),
      examId: exam.id,
      at: new Date().toISOString(),
      startedAt: Date.now(),
      seconds: 0,
      total: totalQuestions(),
      ratings: {},
    };

    mountExam();
    holdExamLock();
    document.title = `${exam.title} · 진행 중`;

    try {
      const plan = buildPlan(exam);
      for (const step of plan) {
        if (token !== runToken) return;
        if (step.kind === 'intro') { await runIntro(step, token); await wait(350, token); }
        else if (step.kind === 'context') await runContext(step, token);
        else if (step.kind === 'reading') await runReading(step, token);
        else await runQuestion(step, token);
      }
      if (token !== runToken) return;
      finishExam();
    } catch (error) {
      if (error !== ABORT) console.error(error);
    }
  }

  function finishExam() {
    if (!attempt) return;
    runToken += 1;
    releaseExamLock();
    stopSpeech();
    attempt.seconds = Math.round((Date.now() - attempt.startedAt) / 1000);
    attempt.finishedAt = new Date().toISOString();
    attempt.saved = upsertAttempt(attempt);
    beep('end');
    paintDone();
  }

  function quitExam() {
    if (!attempt) return;
    const ok = window.confirm('응시를 중단할까요? 지금까지의 기록은 저장되지 않습니다.');
    if (!ok) return;
    runToken += 1;
    releaseExamLock();
    stopSpeech();
    attempt = null;
    paintHome();
  }

  // ---------- 결과 ----------
  function paintDone() {
    document.body.classList.remove('ex-locked');
    const exam = currentExam;
    document.title = `${exam.title} 완료 · 스피킹 루틴`;

    const rows = exam.parts.flatMap((part) => part.questions.map((q) => `
      <div class="ex-row">
        <span class="ex-row-no">Q${q.no}</span>
        <span class="ex-row-label">${esc(KIND_LABEL[part.part] || '')}</span>
        <span class="ex-ratings" data-no="${q.no}">
          <button type="button" data-act="rate" data-no="${q.no}" data-value="good" aria-pressed="false">좋음</button>
          <button type="button" data-act="rate" data-no="${q.no}" data-value="ok" aria-pressed="false">보통</button>
          <button type="button" data-act="rate" data-no="${q.no}" data-value="weak" aria-pressed="false">아쉬움</button>
        </span>
      </div>`)).join('');

    const previous = loadStore().attempts.find((item) => item.id !== attempt.id);
    const delta = previous ? (attempt.seconds || 0) - (previous.seconds || 0) : null;
    const prevLine = previous
      ? `<p class="ex-compare">지난 응시 ${esc(formatWhen(previous.at))} · ${fmtClock(previous.seconds)}${
        delta === null || !attempt.seconds || !previous.seconds
          ? ''
          : ` · <b>${delta <= 0 ? '지난 응시보다 ' + fmtClock(Math.abs(delta)) + ' 빠름' : '지난 응시보다 ' + fmtClock(delta) + ' 느림'}</b>`
      }</p>`
      : '';

    root.innerHTML = `
      <div class="ex-done">
        <div class="ex-wrap">
          <div class="ex-done-head">
            <h1 class="ex-h1">${esc(exam.title)} 완료</h1>
            <p class="ex-sub">소요 시간은 지난 응시와 비교되고, 문항별 자기평가는 이 기기에 남습니다.</p>
          </div>

          <div class="ex-stats">
            <div class="ex-stat"><b>${attempt.total}</b><span>문항</span></div>
            <div class="ex-stat"><b>${fmtClock(attempt.seconds)}</b><span>소요 시간</span></div>
            <div class="ex-stat"><b>5</b><span>파트</span></div>
          </div>
          ${prevLine}

          <div class="ex-review">${rows}</div>

          <p class="ex-note" id="ex-save-state">${attempt.saved === false
            ? '기록을 저장하지 못했습니다. 저장 공간을 확인해 주세요.'
            : '자기평가는 이 기기에만 저장됩니다. 점수·발음 평가는 없습니다.'}</p>

          <div class="ex-actions">
            <button class="ex-btn" data-act="retry" type="button">다시 보기</button>
            <a class="ex-btn ghost" href="index.html">학습으로 돌아가기</a>
          </div>
        </div>
      </div>`;

    paintRatings();
  }

  function paintRatings() {
    if (!attempt) return;
    root.querySelectorAll('[data-act="rate"]').forEach((button) => {
      const on = attempt.ratings[button.dataset.no] === button.dataset.value;
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
      button.classList.toggle('o', on && button.dataset.value === 'good');
      button.classList.toggle('w', on && button.dataset.value === 'weak');
    });
  }

  function rateQuestion(no, value) {
    if (!attempt) return;
    if (attempt.ratings[no] === value) delete attempt.ratings[no];
    else attempt.ratings[no] = value;
    const saved = upsertAttempt(attempt);
    paintRatings();
    const label = document.getElementById('ex-save-state');
    if (label) {
      label.textContent = saved
        ? '자기평가를 저장했습니다.'
        : '저장하지 못했습니다. 저장 공간을 확인해 주세요.';
    }
  }

  let lightboxClose = null;

  function openLightbox(src, alt) {
    if (document.querySelector('.ex-lightbox')) return;
    const returnFocus = document.activeElement;
    const shell = document.querySelector('.ex-shell');

    const box = document.createElement('div');
    box.className = 'ex-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', alt || '확대 보기');
    box.innerHTML = `<img src="${esc(src)}" alt="${esc(alt || '')}">
      <button class="ex-lightbox-close" type="button">닫기</button>
      <span class="ex-lightbox-note">바깥을 누르거나 Esc로 닫습니다</span>`;

    const close = () => {
      box.remove();
      lightboxClose = null;
      if (shell) {
        shell.inert = false;
        shell.removeAttribute('aria-hidden');
      }
      if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
    };
    lightboxClose = close;

    box.addEventListener('click', (event) => {
      if (event.target.closest('.ex-lightbox-close') || !event.target.closest('img')) close();
    });

    if (shell) {
      shell.inert = true;
      shell.setAttribute('aria-hidden', 'true');
    }
    document.body.appendChild(box);
    box.querySelector('.ex-lightbox-close').focus();
  }

  function closeLightbox() {
    if (lightboxClose) lightboxClose();
  }

  // ---------- 이벤트 ----------
  root.addEventListener('click', (event) => {
    const zoomTarget = event.target.closest('.ex-figure.wide img');
    if (zoomTarget) {
      event.preventDefault();
      openLightbox(zoomTarget.currentSrc || zoomTarget.src, zoomTarget.alt);
      return;
    }

    const target = event.target.closest('[data-act]');
    if (!target) return;
    const act = target.dataset.act;

    if (act === 'intro') {
      event.preventDefault();
      paintIntro(target.dataset.exam);
      return;
    }
    if (act === 'home') {
      event.preventDefault();
      paintHome();
      return;
    }
    if (act === 'mode') {
      event.preventDefault();
      const next = target.dataset.mode;
      selectedMode = MODE_HINT[next] ? next : 'exam';
      root.querySelectorAll('[data-act="mode"]').forEach((button) => {
        button.setAttribute('aria-pressed', button.dataset.mode === selectedMode ? 'true' : 'false');
      });
      const startButton = root.querySelector('[data-act="start"]');
      const hint = document.getElementById('ex-mode-hint');
      if (startButton) startButton.textContent = MODE_START[selectedMode];
      if (hint) hint.textContent = MODE_HINT[selectedMode];
      return;
    }
    if (act === 'start') {
      event.preventDefault();
      if (selectedMode === 'exam') startExam();
      else startPractice(selectedMode);
      return;
    }
    if (act === 'jump') {
      event.preventDefault();
      const no = Number(target.dataset.no);
      const index = practiceList.findIndex((item) => item.q.no === no);
      if (index < 0) return;
      runToken += 1;
      stopSpeech();
      practiceIndex = index;
      paintPractice();
      return;
    }
    if (act === 'prev') {
      event.preventDefault();
      goPractice(-1);
      return;
    }
    if (act === 'next') {
      event.preventDefault();
      goPractice(1);
      return;
    }
    if (act === 'part') {
      event.preventDefault();
      const partNo = Number(target.dataset.part);
      const index = practiceList.findIndex((item) => item.part.part === partNo);
      if (index < 0) return;
      runToken += 1;
      stopSpeech();
      practiceIndex = index;
      paintPractice();
      return;
    }
    if (act === 'ptimer') {
      event.preventDefault();
      runPracticeTimer();
      return;
    }
    if (act === 'play-q') {
      event.preventDefault();
      playPracticeQuestion();
      return;
    }
    if (act === 'leave') {
      event.preventDefault();
      runToken += 1;
      stopSpeech();
      attempt = null;
      paintHome();
      return;
    }
    if (act === 'skip') {
      event.preventDefault();
      fireSkip();
      return;
    }
    if (act === 'quit') {
      event.preventDefault();
      quitExam();
      return;
    }
    if (act === 'retry') {
      event.preventDefault();
      paintIntro();
      return;
    }
    if (act === 'rate') {
      event.preventDefault();
      rateQuestion(target.dataset.no, target.dataset.value);
      return;
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
      return;
    }
    const zoomTarget = event.target.closest && event.target.closest('.ex-figure.wide img');
    if (zoomTarget && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openLightbox(zoomTarget.currentSrc || zoomTarget.src, zoomTarget.alt);
    }
  });

  window.addEventListener('pagehide', () => {
    releaseExamLock();
  });

  window.addEventListener('beforeunload', (event) => {
    if (!attempt || attempt.finishedAt) return;
    event.preventDefault();
    event.returnValue = '';
  });

  if (window.SpeechVoice) window.SpeechVoice.load().then(() => paintHome());
  else paintHome();

  // mock.html로 바로 들어와도 오프라인 셸이 등록되게 한다.
  if (/^https?:$/.test(location.protocol) && window.isSecureContext && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
